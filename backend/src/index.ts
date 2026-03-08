// Express 앱 진입점
// CORS, JSON 파서, 라우터 마운트

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import shopeeRoutes from './routes/shopee.routes';
import productsRoutes from './routes/products.routes';
import { testConnection } from './db/pool';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// CORS 설정 (프론트엔드 URL 허용)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// JSON body 파서
app.use(express.json({ limit: '10mb' }));

// 헬스체크 엔드포인트
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 라우터 마운트
app.use('/shopee', shopeeRoutes);
app.use('/products', productsRoutes);

// 서버 시작
async function startServer(): Promise<void> {
  try {
    // DB 연결 테스트
    await testConnection();

    app.listen(PORT, () => {
      console.log(`[서버] http://localhost:${PORT} 에서 실행 중`);
      console.log(`[서버] 프론트엔드 허용 URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  } catch (err) {
    console.error('[서버] 시작 실패:', err);
    process.exit(1);
  }
}

startServer();

export default app;
