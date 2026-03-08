// 상품 관리 라우터
// 상품 CRUD, 일괄 생성, 업로드 큐 등록

import { Router, Request, Response } from 'express';
import pool from '../db/pool';
import { enqueueProduct } from '../queue/upload.queue';

const router = Router();

// 상품 생성 요청 타입
interface CreateProductBody {
  user_id: string;
  shop_id?: number;
  name: string;
  description?: string;
  category_id: number;
  brand_id?: number;
  models?: Array<{
    model_name: string;
    price: number;
    stock: number;
    sku?: string;
  }>;
}

/**
 * GET /products
 * 전체 상품 목록 조회 (상태 필터 지원)
 * Query: ?status=ready&user_id=xxx
 */
router.get('/', async (req: Request, res: Response) => {
  const { status, user_id } = req.query;

  try {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // 상태 필터
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // 사용자 필터
    if (user_id) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    // 각 상품에 대해 모델 정보도 함께 조회
    const products = await Promise.all(
      result.rows.map(async (product) => {
        const modelsResult = await pool.query(
          'SELECT id, model_name, price, stock, sku FROM product_models WHERE product_id = $1',
          [product.id]
        );
        return { ...product, models: modelsResult.rows };
      })
    );

    res.json({ success: true, data: products, total: products.length });
  } catch (err: any) {
    console.error('[상품 목록 조회 실패]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /products
 * 상품 1개 생성 (status: 'ready')
 */
router.post('/', async (req: Request, res: Response) => {
  const { user_id, shop_id, name, description, category_id, brand_id, models }: CreateProductBody = req.body;

  // 입력 검증
  if (!user_id || !name || !category_id) {
    res.status(400).json({
      success: false,
      error: 'user_id, name, category_id는 필수입니다',
    });
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 상품 생성
    const productResult = await client.query(
      `INSERT INTO products (user_id, shop_id, name, description, category_id, brand_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'ready')
       RETURNING *`,
      [user_id, shop_id || null, name, description || '', category_id, brand_id || 0]
    );

    const product = productResult.rows[0];

    // 모델(옵션) 생성
    const insertedModels = [];
    if (models && models.length > 0) {
      for (const model of models) {
        const modelResult = await client.query(
          `INSERT INTO product_models (product_id, model_name, price, stock, sku)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [product.id, model.model_name, model.price, model.stock, model.sku || null]
        );
        insertedModels.push(modelResult.rows[0]);
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: { ...product, models: insertedModels },
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[상품 생성 실패]', err.message);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

/**
 * POST /products/bulk
 * 상품 배열 일괄 생성
 * Body: { products: CreateProductBody[] }
 */
router.post('/bulk', async (req: Request, res: Response) => {
  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    res.status(400).json({
      success: false,
      error: 'products 배열이 필요합니다',
    });
    return;
  }

  const client = await pool.connect();
  const createdProducts: any[] = [];
  const errors: Array<{ index: number; error: string }> = [];

  try {
    await client.query('BEGIN');

    for (let i = 0; i < products.length; i++) {
      const { user_id, shop_id, name, description, category_id, brand_id, models } = products[i];

      // 개별 상품 검증
      if (!user_id || !name || !category_id) {
        errors.push({ index: i, error: 'user_id, name, category_id는 필수입니다' });
        continue;
      }

      // 상품 생성
      const productResult = await client.query(
        `INSERT INTO products (user_id, shop_id, name, description, category_id, brand_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'ready')
         RETURNING *`,
        [user_id, shop_id || null, name, description || '', category_id, brand_id || 0]
      );

      const product = productResult.rows[0];
      const insertedModels = [];

      // 모델 생성
      if (models && models.length > 0) {
        for (const model of models) {
          const modelResult = await client.query(
            `INSERT INTO product_models (product_id, model_name, price, stock, sku)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [product.id, model.model_name, model.price, model.stock, model.sku || null]
          );
          insertedModels.push(modelResult.rows[0]);
        }
      }

      createdProducts.push({ ...product, models: insertedModels });
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: createdProducts,
      errors: errors.length > 0 ? errors : undefined,
      total: createdProducts.length,
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[일괄 생성 실패]', err.message);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

/**
 * POST /products/:id/upload
 * 특정 상품을 업로드 큐에 등록
 */
router.post('/:id/upload', async (req: Request, res: Response) => {
  const productId = Number(req.params.id);
  const { user_id } = req.body;

  if (!user_id) {
    res.status(400).json({ success: false, error: 'user_id가 필요합니다' });
    return;
  }

  try {
    // 상품 존재 여부 확인
    const result = await pool.query(
      'SELECT id, status FROM products WHERE id = $1',
      [productId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: '상품을 찾을 수 없습니다' });
      return;
    }

    // 큐에 등록
    await enqueueProduct(productId, user_id);

    res.json({
      success: true,
      message: `상품 ${productId}이(가) 업로드 큐에 등록되었습니다`,
    });
  } catch (err: any) {
    console.error('[큐 등록 실패]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /products/upload-all
 * 전체 ready 상태 상품을 일괄 큐 등록
 * Body: { user_id: string }
 */
router.post('/upload-all', async (req: Request, res: Response) => {
  const { user_id } = req.body;

  if (!user_id) {
    res.status(400).json({ success: false, error: 'user_id가 필요합니다' });
    return;
  }

  try {
    // ready 상태인 모든 상품 조회
    const result = await pool.query(
      "SELECT id FROM products WHERE status = 'ready' AND user_id = $1",
      [user_id]
    );

    if (result.rows.length === 0) {
      res.json({
        success: true,
        message: '업로드할 상품이 없습니다',
        enqueued: 0,
      });
      return;
    }

    // 모든 상품을 큐에 등록
    const enqueuePromises = result.rows.map((row) =>
      enqueueProduct(row.id, user_id)
    );
    await Promise.all(enqueuePromises);

    res.json({
      success: true,
      message: `${result.rows.length}개 상품이 업로드 큐에 등록되었습니다`,
      enqueued: result.rows.length,
      product_ids: result.rows.map((r) => r.id),
    });
  } catch (err: any) {
    console.error('[일괄 큐 등록 실패]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /products/:id/status
 * 특정 상품의 등록 상태 조회
 */
router.get('/:id/status', async (req: Request, res: Response) => {
  const productId = Number(req.params.id);

  try {
    const result = await pool.query(
      'SELECT id, name, status, item_id, error_message, updated_at FROM products WHERE id = $1',
      [productId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: '상품을 찾을 수 없습니다' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    console.error('[상태 조회 실패]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /products/:id
 * 상품 삭제 (CASCADE로 모델도 함께 삭제)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const productId = Number(req.params.id);

  try {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [productId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: '상품을 찾을 수 없습니다' });
      return;
    }

    res.json({
      success: true,
      message: `상품 ${productId}이(가) 삭제되었습니다`,
    });
  } catch (err: any) {
    console.error('[상품 삭제 실패]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
