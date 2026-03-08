import { AlertTriangle, Globe, HelpCircle, Link2, Shield, RefreshCw, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "./PageHeader";
import { formatDate } from "../lib/format";

const REGIONS = [
  { code: "SG", name: "싱가포르", flag: "🇸🇬" },
  { code: "MY", name: "말레이시아", flag: "🇲🇾" },
  { code: "TH", name: "태국", flag: "🇹🇭" },
  { code: "ID", name: "인도네시아", flag: "🇮🇩" },
  { code: "PH", name: "필리핀", flag: "🇵🇭" },
  { code: "VN", name: "베트남", flag: "🇻🇳" },
  { code: "TW", name: "대만", flag: "🇹🇼" },
  { code: "BR", name: "브라질", flag: "🇧🇷" },
];

const faqItems = [
  { q: "Q. 연동이 실패했어요", a: "브라우저 팝업 차단을 해제하고 다시 시도해보세요. 혹은 재연동하기를 클릭해주세요." },
  { q: "Q. Merchant ID가 연동되지 않았어요", a: "다시 재연동하기 버튼을 클릭하여 Authorize Merchant를 꼭 체크 표시해주세요." },
  { q: "Q. 일부 지역만 연동됐다고 하던데요.", a: "다시 재연동하기 버튼을 클릭하여 8개 지역을 모두 check 표시 해주세요." },
  { q: "Q. 방금 인증했는데 인증 만료 알림이라고 합니다.", a: "Authorization Period는 인증 만료 기간을 의미합니다. 해당 기간을 최대한 길게 설정해주세요(ex. 365일)." },
  { q: "Q. Merchant ID로만 연동하면 16개(8+8개) 연동이 안됩니다.", a: "하나의 Merchant ID는 최대 8개 지역(자기 자신 1개 포함)만 연동할 수 있습니다. 16개 이상 연동하려면 이메일 계정 2개가 필요합니다." },
];

const steps = [
  '"연동하기" or "재연동하기" 버튼을 클릭합니다',
  "새 탭에서 Shopee 로그인 페이지가 열립니다",
  '이때 "Switch to Main(sub) Account" 버튼을 클릭하여 올바른 Shopee 계정(ex. xxxxx.main)으로 로그인합니다',
  "Authorize Merchant를 꼭 체크 표시해주세요.",
  "Authorization 모든 지역을 check 표시 해주세요.",
  "Authorization Period(연동 기간)를 설정해주세요(ex. 365일).",
  '"Confirm Authorization" 버튼을 눌러주세요.',
  "연동이 성공적으로 완료되면 Shopee 연동 관리 페이지에서 연동 상태가 연동됨으로 변경됩니다.",
];

export interface ShopeeConnection {
  status: "connected" | "disconnected";
  merchantId: string | null;
  authExpiresAt: string | null;
  connectedRegions: string[];
  syncedAt: string | null;
}

const STORAGE_KEY = "shopee_connection";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

function loadFromStorage(): ShopeeConnection | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShopeeConnection;
  } catch {
    return null;
  }
}

function getDaysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function IntegrationPage() {
  const [connection, setConnection] = useState<ShopeeConnection>({
    status: "disconnected",
    merchantId: null,
    authExpiresAt: null,
    connectedRegions: [],
    syncedAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConnection = useCallback(async () => {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/shopee/connection`);
        if (res.ok) {
          const data = (await res.json()) as ShopeeConnection;
          setConnection(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          return;
        }
      } catch {
        // fall through to localStorage
      }
    }
    const stored = loadFromStorage();
    if (stored) setConnection(stored);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    void fetchConnection().finally(() => setIsLoading(false));
  }, [fetchConnection]);

  // Poll for connection update after OAuth window opens
  const startPolling = useCallback(() => {
    const interval = setInterval(() => void fetchConnection(), 3000);
    setTimeout(() => clearInterval(interval), 120_000);
  }, [fetchConnection]);

  const handleReconnect = async () => {
    setError(null);
    let authUrl: string | undefined;

    // 1) Try backend-generated signed URL
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/shopee/auth-url`);
        if (res.ok) {
          const data = (await res.json()) as { url: string };
          authUrl = data.url;
        }
      } catch {
        // fall through
      }
    }

    // 2) Fallback to env var
    if (!authUrl) {
      authUrl = import.meta.env.VITE_SHOPEE_OAUTH_URL as string | undefined;
    }

    if (!authUrl) {
      setError(
        "Shopee OAuth URL이 설정되지 않았습니다. .env 파일에 VITE_SHOPEE_OAUTH_URL을 설정하거나 백엔드 /shopee/auth-url 엔드포인트를 구현해주세요.",
      );
      return;
    }

    window.open(authUrl, "_blank", "noopener,noreferrer");
    startPolling();
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      if (API_BASE_URL) {
        await fetch(`${API_BASE_URL}/shopee/sync`, { method: "POST" });
      }
      await fetchConnection();
    } catch {
      setError("데이터 동기화에 실패했습니다.");
    } finally {
      setIsSyncing(false);
    }
  };

  const isConnected = connection.status === "connected";
  const connectedCount = connection.connectedRegions.length;
  const daysLeft = getDaysUntilExpiry(connection.authExpiresAt);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 md:p-6">
      <PageHeader
        title="Shopee 연동 관리"
        description="Shopee 계정 연동 상태를 확인하고 관리합니다"
        actions={
          <button
            onClick={() => void handleSync()}
            disabled={isSyncing || !isConnected}
            className="flex items-center gap-2 px-4 py-2 bg-[#3b6cf5] text-white rounded-xl hover:bg-[#2d5ae0] transition-colors shadow-sm disabled:cursor-not-allowed disabled:bg-[#9cb4fb]"
            style={{ fontSize: "0.85rem", fontWeight: 500 }}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            데이터 동기화
          </button>
        }
      />

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-red-700" style={{ fontSize: "0.85rem" }}>{error}</p>
        </div>
      )}

      {/* Partial region alert */}
      {isConnected && connectedCount < 8 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-amber-800" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                일부 지역 연동됨
              </p>
              <p className="text-amber-700 mt-0.5" style={{ fontSize: "0.82rem" }}>
                현재 {connectedCount}개 지역만 연동됩니다. 최대 8개 지역을 연동하여 더 많은 매출 기회를 얻으세요.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4-panel grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* 연동 상태 */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-5 flex items-center gap-2 text-[#1a1d2e]" style={{ fontWeight: 600 }}>
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
              <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-slate-400"}`} />
            </div>
            연동 상태
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#6b7294]" style={{ fontSize: "0.85rem" }}>현재 상태</span>
              {isLoading ? (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500" style={{ fontSize: "0.78rem" }}>
                  확인 중
                </span>
              ) : isConnected ? (
                <span
                  className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700"
                  style={{ fontSize: "0.78rem", fontWeight: 600 }}
                >
                  연동됨
                </span>
              ) : (
                <span
                  className="px-3 py-1 rounded-full bg-slate-100 text-slate-600"
                  style={{ fontSize: "0.78rem", fontWeight: 600 }}
                >
                  미연동
                </span>
              )}
            </div>
            {connection.merchantId && (
              <div className="flex items-center justify-between">
                <span className="text-[#6b7294]" style={{ fontSize: "0.85rem" }}>Merchant ID</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#1a1d2e]" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {connection.merchantId}
                  </span>
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 인증 정보 */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-5 flex items-center gap-2 text-[#1a1d2e]" style={{ fontWeight: 600 }}>
            <Shield className="w-5 h-5 text-[#3b6cf5]" />
            인증 정보
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#6b7294]" style={{ fontSize: "0.85rem" }}>인증 만료일</span>
              <div className="flex items-center gap-2">
                {connection.authExpiresAt ? (
                  <>
                    <span className="text-[#1a1d2e]" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      {formatDate(connection.authExpiresAt)}
                    </span>
                    {daysLeft !== null && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                          daysLeft <= 30
                            ? "bg-red-100 text-red-600"
                            : daysLeft <= 90
                              ? "bg-amber-100 text-amber-600"
                              : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        D-{daysLeft}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[#6b7294]" style={{ fontSize: "0.85rem" }}>정보 없음</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 연동 지역 */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-5 flex items-center gap-2 text-[#1a1d2e]" style={{ fontWeight: 600 }}>
            <Globe className="w-5 h-5 text-[#3b6cf5]" />
            연동 지역
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#6b7294]" style={{ fontSize: "0.85rem" }}>연동된 지역</span>
              <span className="text-[#1a1d2e]" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                {connectedCount}/8개
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {connection.connectedRegions.map((code) => {
                const region = REGIONS.find((r) => r.code === code);
                if (!region) return null;
                return (
                  <span
                    key={code}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#f0f4ff] text-[#3b6cf5] rounded-full"
                    style={{ fontSize: "0.78rem", fontWeight: 600 }}
                  >
                    <span>{region.flag}</span>
                    {region.code} {region.name}
                  </span>
                );
              })}
              {connectedCount === 0 && (
                <span className="text-[#6b7294]" style={{ fontSize: "0.82rem" }}>
                  연동된 지역이 없습니다
                </span>
              )}
            </div>
            {isConnected && connectedCount > 0 && connectedCount < 8 && (
              <p className="text-[#6b7294] pt-1" style={{ fontSize: "0.78rem" }}>
                ⓘ 추가 지역 연동을 통해 더 많은 상품 관리가 가능합니다
              </p>
            )}
          </div>
        </div>

        {/* 연동 관리 */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-5 flex items-center gap-2 text-[#1a1d2e]" style={{ fontWeight: 600 }}>
            <Link2 className="w-5 h-5 text-[#3b6cf5]" />
            연동 관리
          </h3>
          <div className="flex flex-col items-center justify-center gap-3 pt-2">
            <button
              onClick={() => void handleReconnect()}
              className="flex items-center gap-2 px-6 py-2.5 border border-[#3b6cf5] text-[#3b6cf5] rounded-xl hover:bg-[#f0f4ff] transition-colors"
              style={{ fontSize: "0.88rem", fontWeight: 600 }}
            >
              <ExternalLink className="w-4 h-4" />
              재연동하기
            </button>
            <p className="text-[#6b7294] text-center" style={{ fontSize: "0.78rem" }}>
              연동에 문제가 있는 경우 재연동 시도해보세요
            </p>
          </div>
        </div>
      </div>

      {/* Guide & FAQ */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <h3 className="mb-5 flex items-center gap-2 text-[#1a1d2e]" style={{ fontWeight: 600 }}>
          <HelpCircle className="w-5 h-5 text-[#3b6cf5]" />
          연동 가이드 & FAQ
        </h3>

        <div className="mb-6">
          <h4 className="mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}>
            <Link2 className="w-4 h-4 text-[#3b6cf5]" />
            Shopee 연동 절차
          </h4>
          <ol className="space-y-2 pl-1">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3 text-[#4a4f6a]" style={{ fontSize: "0.85rem" }}>
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f0f4ff] text-[#3b6cf5]"
                  style={{ fontSize: "0.7rem", fontWeight: 600 }}
                >
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h4 className="mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}>
            <HelpCircle className="w-4 h-4 text-[#f59e0b]" />
            자주 묻는 질문
          </h4>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <div key={item.q} className="rounded-xl bg-[#f8f9fc] p-4">
                <p className="mb-1 text-[#1a1d2e]" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  {item.q}
                </p>
                <p className="text-[#6b7294]" style={{ fontSize: "0.8rem" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
