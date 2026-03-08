// BullMQ 워커 - Shopee 상품 업로드 처리
// 큐에서 작업을 가져와 Shopee API로 상품을 등록하는 워커 프로세스

import { Worker, Job } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

import pool from '../db/pool';
import { addItem, AddItemData } from '../shopee/product';
import { UploadJobData } from '../queue/upload.queue';

// Redis 커넥션 설정 (워커 전용, URL 파싱)
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const parsedUrl = new URL(redisUrl);
const redisConnection = {
  host: parsedUrl.hostname,
  port: Number(parsedUrl.port) || 6379,
  password: parsedUrl.password || undefined,
  maxRetriesPerRequest: null as null,
};

// 상품 + 모델 DB 조회 결과 타입
interface ProductRow {
  id: number;
  user_id: string;
  shop_id: number;
  name: string;
  description: string;
  category_id: number;
  brand_id: number;
}

interface ModelRow {
  id: number;
  model_name: string;
  price: number;
  stock: number;
  sku: string;
}

/**
 * 상품 업로드 처리 함수
 * 1. DB에서 상품 + 모델 조회
 * 2. 상태를 'uploading'으로 변경
 * 3. Shopee API로 상품 등록
 * 4. 성공/실패에 따라 DB 업데이트
 */
async function processUpload(job: Job<UploadJobData>): Promise<void> {
  const { productId, userId } = job.data;
  console.log(`[워커] 상품 ${productId} 업로드 시작 (시도 ${job.attemptsMade + 1}/3)`);

  const client = await pool.connect();

  try {
    // 1. DB에서 상품 조회
    const productResult = await client.query<ProductRow>(
      'SELECT id, user_id, shop_id, name, description, category_id, brand_id FROM products WHERE id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      throw new Error(`상품 ID ${productId}를 찾을 수 없습니다`);
    }

    const product = productResult.rows[0];

    // 모델(옵션) 조회
    const modelsResult = await client.query<ModelRow>(
      'SELECT id, model_name, price, stock, sku FROM product_models WHERE product_id = $1',
      [productId]
    );

    const models = modelsResult.rows;

    // 2. 상태를 'uploading'으로 변경
    await client.query(
      'UPDATE products SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['uploading', productId]
    );

    // 사용자 토큰 조회
    const tokenResult = await client.query(
      'SELECT access_token, shop_id FROM shopee_tokens WHERE user_id = $1',
      [userId]
    );

    if (tokenResult.rows.length === 0) {
      throw new Error(`사용자 ${userId}의 Shopee 토큰을 찾을 수 없습니다`);
    }

    const { access_token: accessToken, shop_id: shopId } = tokenResult.rows[0];

    // 3. Shopee API로 상품 등록
    // 기본 가격은 모델이 있으면 첫 번째 모델 가격, 없으면 0
    const basePrice = models.length > 0 ? Number(models[0].price) : 0;
    const baseStock = models.length > 0 ? Number(models[0].stock) : 0;

    const itemData: AddItemData = {
      original_price: basePrice,
      description: product.description || '',
      item_name: product.name,
      normal_stock: baseStock,
      category_id: product.category_id,
      image: {
        image_id_list: [], // 이미지는 별도 업로드 후 설정
      },
      weight: 0.5, // 기본 무게 (kg)
      item_status: 'NORMAL',
      condition: 'NEW',
    };

    // 브랜드 설정
    if (product.brand_id && product.brand_id > 0) {
      itemData.brand = {
        brand_id: product.brand_id,
        original_brand_name: '',
      };
    }

    const result = await addItem(accessToken, shopId, itemData);

    // 4. 성공: item_id 저장, 상태를 'success'로 변경
    await client.query(
      `UPDATE products
       SET item_id = $1, status = $2, error_message = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [result.item_id, 'success', productId]
    );

    console.log(`[워커] 상품 ${productId} 업로드 성공 (item_id: ${result.item_id})`);
  } catch (err: any) {
    // 5. 실패: 에러 메시지 저장, 상태를 'fail'로 변경
    const errorMessage = err.message || '알 수 없는 에러';

    await client.query(
      `UPDATE products
       SET status = $1, error_message = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      ['fail', errorMessage, productId]
    );

    console.error(`[워커] 상품 ${productId} 업로드 실패:`, errorMessage);

    // 에러를 다시 던져서 BullMQ 재시도 트리거
    throw err;
  } finally {
    client.release();
  }
}

// 워커 생성
const worker = new Worker<UploadJobData>(
  'shopee-upload',
  processUpload,
  {
    connection: redisConnection,
    concurrency: 2, // 동시 처리 수 (Shopee API rate limit 고려)
  }
);

// 워커 이벤트 핸들링
worker.on('completed', (job: Job) => {
  console.log(`[워커] 작업 ${job.id} 완료`);
});

worker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`[워커] 작업 ${job?.id} 실패:`, err.message);
});

worker.on('error', (err: Error) => {
  console.error('[워커] 에러 발생:', err.message);
});

console.log('[워커] Shopee 업로드 워커 시작됨 (concurrency: 2)');
