import { AlertTriangle, Bell, Boxes, Link2, ShoppingCart, Send } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "./PageHeader";
import { InfoBanner } from "./InfoBanner";
import { EmptyState } from "./EmptyState";
import { getLowStockProducts, useDemoData } from "../state/demo-store";
import { formatDateTime } from "../lib/format";

type AlertItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "critical" | "warning" | "info";
  timestamp: string;
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { channels, orders, products, error, isLoading } = useDemoData();

  const alerts = useMemo<AlertItem[]>(() => {
    const channelAlerts = channels
      .filter((channel) => channel.status !== "connected")
      .map((channel) => ({
        id: `channel-${channel.id}`,
        title: `${channel.name} 연동 상태 확인 필요`,
        description:
          channel.status === "warning"
            ? "토큰 만료가 임박했습니다. 재연동하지 않으면 주문 수집이 멈출 수 있습니다."
            : "아직 연결되지 않은 채널입니다. 상품/주문 수집이 비활성화되어 있습니다.",
        category: "채널 연동",
        level: channel.status === "warning" ? "warning" : "critical",
        timestamp: channel.syncedAt ?? new Date().toISOString(),
      }));

    const inventoryAlerts = getLowStockProducts(products).map((product) => ({
      id: `inventory-${product.id}`,
      title: `${product.name} 재고 부족`,
      description: `현재 재고 ${product.stock}개 / 안전재고 ${product.safetyStock}개`,
      category: "재고",
      level: product.stock === 0 ? "critical" : "warning",
      timestamp: product.updatedAt,
    }));

    const orderAlerts = orders
      .filter((order) => order.status === "paid" || order.status === "preparing")
      .map((order) => ({
        id: `order-${order.id}`,
        title: `${order.id} 처리 필요`,
        description: `${order.channelName} 주문이 ${order.status === "paid" ? "결제 완료" : "배송 준비"} 상태로 대기 중입니다.`,
        category: "주문",
        level: "info" as const,
        timestamp: order.placedAt,
      }));

    return [...channelAlerts, ...inventoryAlerts, ...orderAlerts].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
  }, [channels, orders, products]);

  const pushAlerts = useMemo(
    () => alerts.filter((alert) => alert.category === "채널 연동" || (alert.category === "재고" && alert.level !== "info")),
    [alerts],
  );

  const goToAlertTarget = (category: string) => {
    if (category === "채널 연동") {
      navigate("/integration");
      return;
    }

    if (category === "재고") {
      navigate("/inventory");
      return;
    }

    navigate("/orders");
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 md:p-6">
      <PageHeader
        icon={Bell}
        title="알림 센터"
        description="주문 누락, 연동 오류, 재고 위험을 한 곳에서 확인하는 PRD 전용 알림 허브입니다"
      />

      {error ? (
        <InfoBanner message={`알림 데이터를 완전히 불러오지 못했습니다: ${error}`} type="warning" />
      ) : (
        <InfoBanner message={`중요 알림 ${alerts.filter((alert) => alert.level !== "info").length}건 · 푸시/알림톡 발송 대상 ${pushAlerts.length}건`} type="info" />
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-[#ef4444]"><AlertTriangle className="h-5 w-5" /><span style={{ fontWeight: 600 }}>치명</span></div>
          <div className="text-[#1a1d2e]" style={{ fontSize: "1.8rem", fontWeight: 700 }}>{alerts.filter((alert) => alert.level === "critical").length}건</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-[#f59e0b]"><Boxes className="h-5 w-5" /><span style={{ fontWeight: 600 }}>주의</span></div>
          <div className="text-[#1a1d2e]" style={{ fontSize: "1.8rem", fontWeight: 700 }}>{alerts.filter((alert) => alert.level === "warning").length}건</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-[#3b6cf5]"><ShoppingCart className="h-5 w-5" /><span style={{ fontWeight: 600 }}>정보</span></div>
          <div className="text-[#1a1d2e]" style={{ fontSize: "1.8rem", fontWeight: 700 }}>{alerts.filter((alert) => alert.level === "info").length}건</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-[#1a1d2e]" style={{ fontWeight: 600 }}>
              <Send className="h-5 w-5 text-[#3b6cf5]" />
              푸시/알림톡 발송 대상
            </h3>
            <p className="text-[#6b7294]" style={{ fontSize: "0.8rem" }}>
              품절 위험과 연동 오류를 우선 발송 대상으로 묶었습니다.
            </p>
          </div>
          <span className="rounded-full bg-[#f0f4ff] px-3 py-1 text-[#3b6cf5]" style={{ fontSize: "0.74rem", fontWeight: 600 }}>
            {pushAlerts.length}건
          </span>
        </div>
        {pushAlerts.length > 0 ? (
          <div className="space-y-3">
            {pushAlerts.map((alert) => (
              <div key={`push-${alert.id}`} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-[#fafbff] p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${alert.level === "critical" ? "bg-rose-500" : "bg-amber-500"}`} />
                    <p className="truncate text-[#1a1d2e]" style={{ fontSize: "0.86rem", fontWeight: 600 }}>
                      {alert.title}
                    </p>
                  </div>
                  <p className="mt-1 text-[#6b7294]" style={{ fontSize: "0.78rem" }}>
                    {alert.category === "채널 연동" ? "푸시 + 알림톡" : "푸시 알림"} · {formatDateTime(alert.timestamp)}
                  </p>
                </div>
                <button
                  onClick={() => goToAlertTarget(alert.category)}
                  className="shrink-0 rounded-xl border border-[#3b6cf5] px-3 py-2 text-[#3b6cf5] transition-colors hover:bg-[#f0f4ff]"
                  style={{ fontSize: "0.78rem", fontWeight: 600 }}
                >
                  조치하기
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="발송 대상 알림이 없습니다" description="현재 품절/연동 오류로 즉시 발송할 항목이 없습니다." />
        )}
      </div>

      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[#1a1d2e]" style={{ fontWeight: 600 }}>실시간 알림 목록</h3>
          <span className="text-[#6b7294]" style={{ fontSize: "0.8rem" }}>{isLoading ? "불러오는 중" : `${alerts.length}건`}</span>
        </div>
        {isLoading ? (
          <EmptyState title="알림을 불러오는 중입니다" description="채널, 재고, 주문 데이터를 집계하고 있습니다." />
        ) : alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-xl border border-border bg-[#fafbff] p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        alert.level === "critical"
                          ? "bg-rose-500"
                          : alert.level === "warning"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                      }`}
                    />
                    <p className="text-[#1a1d2e]" style={{ fontSize: "0.9rem", fontWeight: 600 }}>{alert.title}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[#6b7294]" style={{ fontSize: "0.72rem", fontWeight: 600 }}>{alert.category}</span>
                </div>
                <p className="text-[#6b7294]" style={{ fontSize: "0.82rem", lineHeight: 1.6 }}>{alert.description}</p>
                <div className="mt-2 flex items-center gap-2 text-[#a0a4b8]" style={{ fontSize: "0.74rem" }}>
                  {alert.category === "채널 연동" ? <Link2 className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                  {formatDateTime(alert.timestamp)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="현재 확인할 알림이 없습니다" description="주문, 재고, 채널 연동 상태가 모두 안정적입니다." />
        )}
      </div>
    </div>
  );
}
