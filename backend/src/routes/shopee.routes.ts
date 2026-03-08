// Shopee 인증 및 연동 관련 라우터
// OAuth URL 생성, 콜백 처리, 연동 상태 조회, 토큰 갱신

import { Router, Request, Response } from 'express';
import pool from '../db/pool';
import { getAuthUrl, exchangeCode, refreshToken } from '../shopee/auth';

const router = Router();

/**
 * GET /shopee/auth-url
 * Shopee OAuth 인증 URL 반환
 */
router.get('/auth-url', (_req: Request, res: Response) => {
  try {
    const authUrl = getAuthUrl();
    res.json({ success: true, authUrl });
  } catch (err: any) {
    console.error('[인증 URL 생성 실패]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /shopee/callback
 * OAuth 콜백 처리: 인증 코드를 토큰으로 교환하고 DB에 저장
 * Body: { code: string, shop_id: number, user_id: string }
 */
router.post('/callback', async (req: Request, res: Response) => {
  const { code, shop_id, user_id } = req.body;

  // 입력 검증
  if (!code || !shop_id || !user_id) {
    res.status(400).json({
      success: false,
      error: 'code, shop_id, user_id 모두 필요합니다',
    });
    return;
  }

  try {
    // 인증 코드를 토큰으로 교환
    const tokenData = await exchangeCode(code, Number(shop_id));

    // 토큰 만료 시간 계산
    const expiresAt = new Date(Date.now() + tokenData.expire_in * 1000);

    // shopee_tokens 테이블에 upsert
    await pool.query(
      `INSERT INTO shopee_tokens (user_id, shop_id, access_token, refresh_token, auth_expires_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id)
       DO UPDATE SET
         shop_id = EXCLUDED.shop_id,
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         auth_expires_at = EXCLUDED.auth_expires_at,
         updated_at = CURRENT_TIMESTAMP`,
      [user_id, shop_id, tokenData.access_token, tokenData.refresh_token, expiresAt]
    );

    res.json({
      success: true,
      message: 'Shopee 연동 완료',
      shop_id: Number(shop_id),
    });
  } catch (err: any) {
    console.error('[콜백 처리 실패]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /shopee/connection
 * 현재 Shopee 연동 상태 조회
 * Query: ?user_id=xxx
 */
router.get('/connection', async (req: Request, res: Response) => {
  const { user_id } = req.query;

  if (!user_id) {
    res.status(400).json({ success: false, error: 'user_id가 필요합니다' });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT user_id, shop_id, merchant_id, auth_expires_at, connected_regions, updated_at
       FROM shopee_tokens WHERE user_id = $1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      res.json({ success: true, connected: false, data: null });
      return;
    }

    const token = result.rows[0];
    // 토큰 만료 여부 확인
    const isExpired = new Date(token.auth_expires_at) < new Date();

    res.json({
      success: true,
      connected: !isExpired,
      data: {
        shop_id: token.shop_id,
        merchant_id: token.merchant_id,
        connected_regions: token.connected_regions,
        expires_at: token.auth_expires_at,
        is_expired: isExpired,
        updated_at: token.updated_at,
      },
    });
  } catch (err: any) {
    console.error('[연동 상태 조회 실패]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /shopee/sync
 * 토큰 갱신 후 연동 상태 최신화
 * Body: { user_id: string }
 */
router.post('/sync', async (req: Request, res: Response) => {
  const { user_id } = req.body;

  if (!user_id) {
    res.status(400).json({ success: false, error: 'user_id가 필요합니다' });
    return;
  }

  try {
    // 현재 토큰 조회
    const tokenResult = await pool.query(
      'SELECT refresh_token, shop_id FROM shopee_tokens WHERE user_id = $1',
      [user_id]
    );

    if (tokenResult.rows.length === 0) {
      res.status(404).json({ success: false, error: '연동 정보가 없습니다' });
      return;
    }

    const { refresh_token: currentRefreshToken, shop_id: shopId } = tokenResult.rows[0];

    // 토큰 갱신
    const newTokenData = await refreshToken(currentRefreshToken, shopId);
    const expiresAt = new Date(Date.now() + newTokenData.expire_in * 1000);

    // DB 업데이트
    await pool.query(
      `UPDATE shopee_tokens
       SET access_token = $1, refresh_token = $2, auth_expires_at = $3, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $4`,
      [newTokenData.access_token, newTokenData.refresh_token, expiresAt, user_id]
    );

    res.json({
      success: true,
      message: '토큰 갱신 완료',
      expires_at: expiresAt,
    });
  } catch (err: any) {
    console.error('[토큰 갱신 실패]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
