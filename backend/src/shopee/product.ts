// Shopee 상품 관련 API 모듈
// 이미지 업로드, 상품 등록, 옵션(모델) 등록

import axios from 'axios';
import FormData from 'form-data';
import {
  generateSign,
  getTimestamp,
  callShopeeApiPost,
  SHOPEE_BASE_URL,
  PARTNER_ID,
  ShopeeApiResponse,
} from './client';

// 이미지 업로드 응답 타입
interface UploadImageResponse {
  image_info: {
    image_id: string;
    image_url_list: { image_url: string; image_url_region: string }[];
  };
}

// 상품 등록 요청 데이터 타입
export interface AddItemData {
  original_price: number;
  description: string;
  item_name: string;
  normal_stock: number;
  category_id: number;
  image: {
    image_id_list: string[];
  };
  weight: number;
  dimension?: {
    package_length: number;
    package_width: number;
    package_height: number;
  };
  logistic_info?: Array<{
    logistic_id: number;
    enabled: boolean;
  }>;
  brand?: {
    brand_id: number;
    original_brand_name: string;
  };
  item_status: string; // 'NORMAL' | 'UNLIST'
  condition: string;   // 'NEW' | 'USED'
}

// 상품 등록 응답 타입
interface AddItemResponse {
  item_id: number;
}

// 옵션(모델) 데이터 타입
export interface TierVariationData {
  tier_variation: Array<{
    name: string;
    option_list: Array<{
      option: string;
      image?: { image_id: string };
    }>;
  }>;
  model: Array<{
    tier_index: number[];
    normal_stock: number;
    original_price: number;
    model_sku?: string;
  }>;
}

/**
 * 이미지 업로드
 * POST /api/v2/media_space/upload_image
 * multipart/form-data로 전송
 */
export async function uploadImage(
  accessToken: string,
  shopId: number,
  imageBuffer: Buffer
): Promise<UploadImageResponse> {
  const path = '/api/v2/media_space/upload_image';
  const timestamp = getTimestamp();
  const sign = generateSign(path, timestamp, accessToken, shopId);

  // multipart/form-data 구성
  const form = new FormData();
  form.append('image', imageBuffer, {
    filename: 'image.jpg',
    contentType: 'image/jpeg',
  });

  const url =
    `${SHOPEE_BASE_URL}${path}` +
    `?partner_id=${PARTNER_ID}` +
    `&timestamp=${timestamp}` +
    `&sign=${sign}` +
    `&access_token=${accessToken}` +
    `&shop_id=${shopId}`;

  try {
    const response = await axios.post<ShopeeApiResponse<UploadImageResponse>>(url, form, {
      headers: {
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (response.data.error) {
      throw new Error(`[이미지 업로드 에러] ${response.data.error}: ${response.data.message}`);
    }

    return response.data.response;
  } catch (err: any) {
    if (err.response?.data?.error) {
      throw new Error(`[이미지 업로드 에러] ${err.response.data.error}: ${err.response.data.message}`);
    }
    throw err;
  }
}

/**
 * 상품 1개 등록
 * POST /api/v2/product/add_item
 */
export async function addItem(
  accessToken: string,
  shopId: number,
  itemData: AddItemData
): Promise<AddItemResponse> {
  const path = '/api/v2/product/add_item';

  const result = await callShopeeApiPost<AddItemResponse>(
    path,
    accessToken,
    shopId,
    itemData
  );

  return result.response;
}

/**
 * 옵션(Tier Variation) 등록
 * POST /api/v2/product/init_tier_variation
 * 상품 등록 후 모델(옵션)을 별도로 등록할 때 사용
 */
export async function initTierVariation(
  accessToken: string,
  shopId: number,
  itemId: number,
  models: TierVariationData
): Promise<void> {
  const path = '/api/v2/product/init_tier_variation';

  const body = {
    item_id: itemId,
    ...models,
  };

  await callShopeeApiPost(path, accessToken, shopId, body);
}
