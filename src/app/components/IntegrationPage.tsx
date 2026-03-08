import { AlertTriangle, Globe, HelpCircle, Link2, RefreshCw, Shield } from "lucide-react";
import { PageHeader } from "./PageHeader";
import {
  channelStatusColor,
  channelStatusLabel,
  useDemoData,
} from "../state/demo-store";
import { formatDate, formatDateTime } from "../lib/format";

const faqItems = [
  {
    q: "Q. 채널 연동이 실패했어요",
    a: "팝업 차단을 해제한 뒤 다시 연결을 시도하고, 권한 범위에서 상품/주문 조회 권한이 모두 체크되어 있는지 확인하세요.",
  },
  {
    q: "Q. 일부 채널만 상품이 수집돼요",
    a: "최근 동기화 시간이 오래된 채널은 토큰 재발급이 필요할 수 있습니다. 경고 상태 채널부터 새로고침을 실행하세요.",
  },
  {
    q: "Q. 주문 상태가 늦게 반영돼요",
    a: "채널별 수집 주기가 달라서 수분 단위 지연이 있을 수 있습니다. 주문 동기화를 실행하면 즉시 최신 상태를 반영합니다.",
  },
];

const steps = [
  "채널 연동 관리에서 연결할 마켓을 선택합니다.",
  "새 창에서 각 채널의 판매자 인증을 완료합니다.",
  "상품/주문 조회 권한과 재고 동기화 범위를 체크합니다.",
  "연동이 완료되면 마지막 동기화 시각과 토큰 만료일을 확인합니다.",
  "경고 상태 채널은 주기적으로 새로고침해 데이터 누락을 방지합니다.",
];

export function IntegrationPage() {
  const { channels, connectChannel, refreshChannel, isLoading, isRefreshing, error } = useDemoData();

  const connectedCount = channels.filter((channel) => channel.status === "connected").length;
  const warningCount = channels.filter((channel) => channel.status === "warning").length;
  const disconnectedCount = channels.filter((channel) => channel.status === "disconnected").length;
  const nearestExpiry = channels
    .filter((channel) => channel.tokenExpiresAt !== null)
    .sort((a, b) => (a.tokenExpiresAt ?? "").localeCompare(b.tokenExpiresAt ?? ""))[0];

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 md:p-6">
      <PageHeader
        title="채널 연동 관리"
        description="네이버, 쿠팡, 11번가 등 판매 채널의 연결 상태와 토큰 만료 일정을 한 번에 관리합니다"
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="mb-1 flex items-center gap-2 text-red-600" style={{ fontWeight: 600 }}>
            <AlertTriangle className="w-5 h-5" />
            채널 API 연결 실패
          </div>
          <p className="text-red-500" style={{ fontSize: "0.85rem" }}>{error}</p>
        </div>
      ) : (warningCount > 0 || disconnectedCount > 0) && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="mb-1 flex items-center gap-2 text-red-600" style={{ fontWeight: 600 }}>
            <AlertTriangle className="w-5 h-5" />
            확인이 필요한 채널이 있습니다
          </div>
          <p className="text-red-500" style={{ fontSize: "0.85rem" }}>
            토큰 만료 임박 {warningCount}개, 미연동 {disconnectedCount}개 채널이 있어 상품/주문 수집이 끊길 수 있습니다.
          </p>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2" style={{ fontWeight: 600 }}>
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            연동 상태
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#6b7294]" style={{ fontSize: "0.85rem" }}>정상 연결</span>
              <span className="rounded-lg bg-emerald-50 px-3 py-1 text-emerald-700" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{connectedCount}개</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6b7294]" style={{ fontSize: "0.85rem" }}>주의 필요</span>
              <span className="rounded-lg bg-amber-50 px-3 py-1 text-amber-700" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{warningCount}개</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6b7294]" style={{ fontSize: "0.85rem" }}>미연동</span>
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-slate-600" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{disconnectedCount}개</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2" style={{ fontWeight: 600 }}>
            <Shield className="w-5 h-5 text-[#3b6cf5]" />
            인증 정보
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#6b7294]" style={{ fontSize: "0.85rem" }}>가장 빠른 만료일</span>
              <span className="text-right text-[#1a1d2e]" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                {nearestExpiry?.tokenExpiresAt ? formatDate(nearestExpiry.tokenExpiresAt) : "정보 없음"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#6b7294]" style={{ fontSize: "0.85rem" }}>관리 우선 채널</span>
              <span className="text-right text-[#1a1d2e]" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                {nearestExpiry?.name ?? "없음"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2" style={{ fontWeight: 600 }}>
            <Globe className="w-5 h-5 text-[#3b6cf5]" />
            수집 현황
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#6b7294]" style={{ fontSize: "0.85rem" }}>상품 동기화</span>
              <span className="text-[#1a1d2e]" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                {channels.reduce((sum, channel) => sum + channel.productsSynced, 0)}개
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6b7294]" style={{ fontSize: "0.85rem" }}>주문 동기화</span>
              <span className="text-[#1a1d2e]" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                {channels.reduce((sum, channel) => sum + channel.ordersSynced, 0)}건
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2" style={{ fontWeight: 600 }}>
            <Link2 className="w-5 h-5 text-[#3b6cf5]" />
            빠른 액션
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => {
                channels.forEach((channel) => {
                  void connectChannel(channel.id);
                });
              }}
              disabled={isRefreshing || isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3b6cf5] px-5 py-3 text-white shadow-sm transition-colors hover:bg-[#2d5ae0] disabled:cursor-not-allowed disabled:bg-[#9cb4fb]"
              style={{ fontSize: "0.9rem", fontWeight: 500 }}
            >
              <Link2 className="w-4 h-4" />
              모든 채널 연결 상태 갱신
            </button>
            <p className="text-center text-[#6b7294]" style={{ fontSize: "0.8rem" }}>
              연동이 끊긴 채널도 한 번에 다시 연결 대상으로 전환합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6">
        <h3 className="mb-5 text-[#1a1d2e]" style={{ fontWeight: 600 }}>
          채널별 연동 상태
        </h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {channels.map((channel) => (
            <div key={channel.id} className="rounded-xl border border-border p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[#1a1d2e]" style={{ fontWeight: 600 }}>{channel.name}</p>
                  <p className="mt-1 text-[#6b7294]" style={{ fontSize: "0.8rem" }}>
                    상품 {channel.productsSynced}개 · 주문 {channel.ordersSynced}건 수집됨
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 ${channelStatusColor[channel.status]}`} style={{ fontSize: "0.74rem", fontWeight: 600 }}>
                  {channelStatusLabel[channel.status]}
                </span>
              </div>
              <div className="space-y-2 text-[#4a4f6a]" style={{ fontSize: "0.82rem" }}>
                <div className="flex items-center justify-between gap-4">
                  <span>마지막 동기화</span>
                  <span>{channel.syncedAt ? formatDateTime(channel.syncedAt) : "아직 없음"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>토큰 만료일</span>
                  <span>{channel.tokenExpiresAt ? formatDate(channel.tokenExpiresAt) : "연결 후 발급"}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {channel.status === "disconnected" ? (
                  <button
                    onClick={() => void connectChannel(channel.id)}
                    disabled={isRefreshing}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3b6cf5] px-4 py-2.5 text-white transition-colors hover:bg-[#2d5ae0] disabled:cursor-not-allowed disabled:bg-[#9cb4fb]"
                    style={{ fontSize: "0.82rem", fontWeight: 600 }}
                  >
                    <Link2 className="w-4 h-4" />
                    채널 연결
                  </button>
                ) : (
                  <button
                    onClick={() => void refreshChannel(channel.id)}
                    disabled={isRefreshing}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#3b6cf5] px-4 py-2.5 text-[#3b6cf5] transition-colors hover:bg-[#f0f4ff] disabled:cursor-not-allowed disabled:border-border disabled:text-[#a0a4b8]"
                    style={{ fontSize: "0.82rem", fontWeight: 600 }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    상태 새로고침
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6">
        <h3 className="mb-5 flex items-center gap-2" style={{ fontWeight: 600 }}>
          <HelpCircle className="w-5 h-5 text-[#3b6cf5]" />
          연동 가이드 & FAQ
        </h3>

        <div className="mb-6">
          <h4 className="mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}>
            <Link2 className="w-4 h-4 text-[#3b6cf5]" />
            멀티채널 연동 절차
          </h4>
          <ol className="space-y-2 pl-1">
            {steps.map((step, index) => (
              <li key={step} className="flex items-start gap-3 text-[#4a4f6a]" style={{ fontSize: "0.85rem" }}>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f0f4ff] text-[#3b6cf5]" style={{ fontSize: "0.7rem", fontWeight: 600 }}>
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
          <div className="space-y-4">
            {faqItems.map((item) => (
              <div key={item.q} className="rounded-xl bg-[#f8f9fc] p-4">
                <p className="mb-1 text-[#1a1d2e]" style={{ fontSize: "0.85rem", fontWeight: 600 }}>{item.q}</p>
                <p className="text-[#6b7294]" style={{ fontSize: "0.8rem" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
