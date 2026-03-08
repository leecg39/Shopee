// DB 커넥션 풀 설정
// pg Pool을 사용하여 PostgreSQL 연결 관리

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // 커넥션 풀 설정
  max: 20,               // 최대 커넥션 수
  idleTimeoutMillis: 30000,  // 유휴 커넥션 타임아웃 (30초)
  connectionTimeoutMillis: 5000, // 커넥션 생성 타임아웃 (5초)
});

// 커넥션 에러 핸들링
pool.on('error', (err: Error) => {
  console.error('[DB] 예상치 못한 커넥션 에러:', err.message);
});

// 커넥션 테스트 함수
export async function testConnection(): Promise<void> {
  try {
    const client = await pool.connect();
    console.log('[DB] PostgreSQL 연결 성공');
    client.release();
  } catch (err) {
    console.error('[DB] PostgreSQL 연결 실패:', err);
    throw err;
  }
}

export default pool;
