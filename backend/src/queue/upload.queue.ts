// BullMQ 업로드 큐 설정
// 상품 등록 작업을 큐에 추가하여 비동기 처리

import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

// Redis 커넥션 설정 (URL 파싱)
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const parsedUrl = new URL(redisUrl);
const redisConnection = {
  host: parsedUrl.hostname,
  port: Number(parsedUrl.port) || 6379,
  password: parsedUrl.password || undefined,
  maxRetriesPerRequest: null as null, // BullMQ 요구사항
};

// 큐에 들어갈 작업 데이터 타입
export interface UploadJobData {
  productId: number;
  userId: string;
}

// 큐 이름
const QUEUE_NAME = 'shopee-upload';

// BullMQ 큐 생성
export const uploadQueue = new Queue<UploadJobData>(QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,           // 실패 시 3회 재시도
    backoff: {
      type: 'fixed',
      delay: 10000,        // 재시도 간격 10초
    },
    removeOnComplete: {
      count: 100,          // 완료된 작업은 최근 100개만 유지
    },
    removeOnFail: {
      count: 50,           // 실패한 작업은 최근 50개만 유지
    },
  },
});

/**
 * 상품을 업로드 큐에 추가
 * @param productId - 등록할 상품 ID
 * @param userId - 사용자 ID (토큰 조회용)
 */
export async function enqueueProduct(
  productId: number,
  userId: string
): Promise<void> {
  await uploadQueue.add(
    'upload-product',
    { productId, userId },
    {
      // 작업 ID를 상품 ID 기반으로 설정하여 중복 방지
      jobId: `product-${productId}-${Date.now()}`,
    }
  );

  console.log(`[큐] 상품 ${productId} 업로드 작업 추가됨`);
}
