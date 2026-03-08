// Shopee API 공통 클라이언트
// HMAC-SHA256 서명 생성 및 API 호출 유틸리티

import crypto from 'crypto';
import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SHOPEE_BASE_URL = 'https://partner.shopeemobile.com';
const PARTNER_ID = Number(process.env.SHOPEE_PARTNER_ID);
const PARTNER_KEY = process.env.SHOPEE_PARTNER_KEY || '';

// Shopee API 응답 공통 타입
export interface ShopeeApiResponse<T = any> {
  error: string;
  message: string;
  warning: string;
  request_id: string;
  response: T;
}

/**
 * HMAC-SHA256 서명 생성
 * baseString = partnerId + path + timestamp + accessToken + shopId
 */
export function generateSign(
  path: string,
  timestamp: number,
  accessToken?: string,
  shopId?: number
): string {
  let baseString = `${PARTNER_ID}${path}${timestamp}`;

  if (accessToken) {
    baseString += accessToken;
  }
  if (shopId) {
    baseString += shopId;
  }

  return crypto
    .createHmac('sha256', PARTNER_KEY)
    .update(baseString)
    .digest('hex');
}

/**
 * 현재 타임스탬프 (초 단위)
 */
export function getTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Shopee API 공통 URL 생성 (서명 파라미터 포함)
 */
function buildUrl(
  path: string,
  timestamp: number,
  sign: string,
  accessToken?: string,
  shopId?: number
): string {
  let url = `${SHOPEE_BASE_URL}${path}?partner_id=${PARTNER_ID}&timestamp=${timestamp}&sign=${sign}`;

  if (accessToken) {
    url += `&access_token=${accessToken}`;
  }
  if (shopId) {
    url += `&shop_id=${shopId}`;
  }

  return url;
}

/**
 * Shopee API GET 호출
 */
export async function callShopeeApiGet<T = any>(
  path: string,
  accessToken: string,
  shopId: number,
  params?: Record<string, any>
): Promise<ShopeeApiResponse<T>> {
  const timestamp = getTimestamp();
  const sign = generateSign(path, timestamp, accessToken, shopId);
  const url = buildUrl(path, timestamp, sign, accessToken, shopId);

  try {
    const response: AxiosResponse<ShopeeApiResponse<T>> = await axios.get(url, {
      params,
      headers: { 'Content-Type': 'application/json' },
    });

    // Shopee API 에러 코드 체크
    if (response.data.error) {
      throw new Error(`[Shopee API 에러] ${response.data.error}: ${response.data.message}`);
    }

    return response.data;
  } catch (err: any) {
    // axios 에러와 Shopee 에러 구분
    if (err.response?.data?.error) {
      throw new Error(`[Shopee API 에러] ${err.response.data.error}: ${err.response.data.message}`);
    }
    throw err;
  }
}

/**
 * Shopee API POST 호출
 */
export async function callShopeeApiPost<T = any>(
  path: string,
  accessToken: string,
  shopId: number,
  body?: Record<string, any>
): Promise<ShopeeApiResponse<T>> {
  const timestamp = getTimestamp();
  const sign = generateSign(path, timestamp, accessToken, shopId);
  const url = buildUrl(path, timestamp, sign, accessToken, shopId);

  try {
    const response: AxiosResponse<ShopeeApiResponse<T>> = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' },
    });

    // Shopee API 에러 코드 체크
    if (response.data.error) {
      throw new Error(`[Shopee API 에러] ${response.data.error}: ${response.data.message}`);
    }

    return response.data;
  } catch (err: any) {
    if (err.response?.data?.error) {
      throw new Error(`[Shopee API 에러] ${err.response.data.error}: ${err.response.data.message}`);
    }
    throw err;
  }
}

/**
 * Shopee API POST 호출 (인증 불필요 - 토큰 교환 등)
 * accessToken/shopId 없이 서명 생성
 */
export async function callShopeeApiPublic<T = any>(
  path: string,
  body?: Record<string, any>
): Promise<ShopeeApiResponse<T>> {
  const timestamp = getTimestamp();
  const sign = generateSign(path, timestamp);
  const url = buildUrl(path, timestamp, sign);

  try {
    const response: AxiosResponse<ShopeeApiResponse<T>> = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.data.error) {
      throw new Error(`[Shopee API 에러] ${response.data.error}: ${response.data.message}`);
    }

    return response.data;
  } catch (err: any) {
    if (err.response?.data?.error) {
      throw new Error(`[Shopee API 에러] ${err.response.data.error}: ${err.response.data.message}`);
    }
    throw err;
  }
}

export { PARTNER_ID, PARTNER_KEY, SHOPEE_BASE_URL };
