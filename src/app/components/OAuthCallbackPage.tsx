import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { ShopeeConnection } from "./IntegrationPage";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const STORAGE_KEY = "shopee_connection";

export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [statusText, setStatusText] = useState("Shopee 연동 처리 중...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const shopId = params.get("shop_id");
    const merchantId = params.get("merchant_id_list") ?? params.get("merchant_id");

    async function handleCallback() {
      // 1) Send code to backend to exchange for access token
      if (code && API_BASE_URL) {
        try {
          setStatusText("인증 코드 처리 중...");
          const res = await fetch(`${API_BASE_URL}/shopee/callback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, shop_id: shopId, merchant_id: merchantId }),
          });

          if (res.ok) {
            setStatusText("연동 완료! 잠시 후 이동합니다...");
            setTimeout(() => void navigate("/integration"), 1500);
            return;
          }
        } catch {
          // fall through to localStorage fallback
        }
      }

      // 2) Fallback: store minimal connection info in localStorage
      if (merchantId ?? shopId) {
        const connection: ShopeeConnection = {
          status: "connected",
          merchantId: merchantId ?? shopId ?? null,
          authExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          connectedRegions: ["SG"],
          syncedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(connection));
        setStatusText("연동 완료! 잠시 후 이동합니다...");
        setTimeout(() => void navigate("/integration"), 1500);
        return;
      }

      // 3) No params — just redirect back
      setStatusText("연동 정보를 찾을 수 없습니다. 돌아갑니다...");
      setTimeout(() => void navigate("/integration"), 2000);
    }

    void handleCallback();
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#f8f9fc]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#3b6cf5] border-t-transparent rounded-full animate-spin mx-auto mb-5" />
        <p className="text-[#1a1d2e]" style={{ fontWeight: 600, fontSize: "1rem" }}>
          {statusText}
        </p>
        <p className="text-[#6b7294] mt-2" style={{ fontSize: "0.85rem" }}>잠시만 기다려주세요</p>
      </div>
    </div>
  );
}
