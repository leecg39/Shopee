// Shopee OAuth 인증 모듈
// 인증 URL 생성, 코드 교환, 토큰 갱신

import {
  generateSign,
  getTimestamp,
  callShopeeApiPublic,
  PARTNER_ID,
  SHOPEE_BASE_URL,
} from './client';
import dotenv from 'dotenv';

dotenv.config();

// 토큰 교환 응답 타입
interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expire_in: number;
  shop_id_list?: number[];
  merchant_id_list?: number[];
}

/**
 * OAuth 인증 URL 생성
 * 서명: HMAC-SHA256(partnerKey, partnerId + "/api/v2/shop/auth_partner" + timestamp)
 */
export function getAuthUrl(): string {
  const path = '/api/v2/shop/auth_partner';
  const timestamp = getTimestamp();
  const redirectUrl = process.env.SHOPEE_REDIRECT_URL || '';

  // 인증 URL용 서명 (accessToken, shopId 없이)
  const sign = generateSign(path, timestamp);

  const authUrl =
    `${SHOPEE_BASE_URL}${path}` +
    `?partner_id=${PARTNER_ID}` +
    `&timestamp=${timestamp}` +
    `&sign=${sign}` +
    `&redirect=${encodeURIComponent(redirectUrl)}`;

  return authUrl;
}

/**
 * 인증 코드를 access_token으로 교환
 * POST /api/v2/auth/token/get
 */
export async function exchangeCode(
  code: string,
  shopId: number
): Promise<TokenResponse> {
  const path = '/api/v2/auth/token/get';

  const body = {
    code,
    shop_id: shopId,
    partner_id: PARTNER_ID,
  };

  const result = await callShopeeApiPublic<TokenResponse>(path, body);
  return result.response;
}

/**
 * 토큰 갱신
 * POST /api/v2/auth/access_token/get
 */
export async function refreshToken(
  refreshTokenValue: string,
  shopId: number
): Promise<TokenResponse> {
  const path = '/api/v2/auth/access_token/get';

  const body = {
    refresh_token: refreshTokenValue,
    shop_id: shopId,
    partner_id: PARTNER_ID,
  };

  const result = await callShopeeApiPublic<TokenResponse>(path, body);
  return result.response;
}
