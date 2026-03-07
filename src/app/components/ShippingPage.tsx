import { Boxes, CheckCircle2, ClipboardCheck, Factory, PackageCheck, Truck, Waypoints } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { EmptyState } from "./EmptyState";
import { InfoBanner } from "./InfoBanner";
import { PageHeader } from "./PageHeader";
import {
  orderStatusColor,
  orderStatusLabel,
  type PackingStatus,
  type ProcurementStatus,
  useDemoData,
} from "../state/demo-store";
import { formatCurrency, formatDateTime } from "../lib/format";

const procurementStatusLabel: Record<ProcurementStatus, string> = {
  pending: "발주 대기",
  ordered: "발주 완료",
  received: "상품 확보",
};

const packingStatusLabel: Record<PackingStatus, string> = {
  pending: "포장 대기",
  packing: "포장 중",
  packed: "포장 완료",
};

export function ShippingPage() {
  const navigate = useNavigate();
  const {
    listings,
    orders,
    orderWorkflowStates,
    updateOrderWorkflowState,
    assignInvoice,
    updateOrderStatus,
    isRefreshing,
  } = useDemoData();

  const publishedListings = listings.filter((listing) => listing.status === "published");

  const shippingRows = useMemo(
    () =>
      orders.map((order, index) => ({
        order,
        listing: publishedListings.length > 0 ? publishedListings[index % publishedListings.length] : null,
        workflow: orderWorkflowStates[order.id] ?? {
          procurementStatus: "pending" as ProcurementStatus,
          packingStatus: "pending" as PackingStatus,
        },
      })),
    [orders, orderWorkflowStates, publishedListings],
  );

  const procurementPending = shippingRows.filter((row) => row.workflow.procurementStatus !== "received").length;
  const packingPending = shippingRows.filter((row) => row.workflow.packingStatus !== "packed").length;
  const invoicePending = shippingRows.filter((row) => row.order.invoiceNumber === null).length;
  const shippingReady = shippingRows.filter((row) => row.workflow.packingStatus === "packed" && row.order.invoiceNumber !== null).length;

  const advanceProcurement = (orderId: string, current: ProcurementStatus) => {
    const nextStatus: Record<ProcurementStatus, ProcurementStatus> = {
      pending: "ordered",
      ordered: "received",
      received: "received",
    };

    updateOrderWorkflowState(orderId, { procurementStatus: nextStatus[current] });
  };

  const advancePacking = (orderId: string, current: PackingStatus) => {
    const nextStatus: Record<PackingStatus, PackingStatus> = {
      pending: "packing",
      packing: "packed",
      packed: "packed",
    };

    updateOrderWorkflowState(orderId, { packingStatus: nextStatus[current] });
  };

  const markShippingStarted = async (orderId: string) => {
    await updateOrderStatus(orderId, "shipping");
  };

  const markDelivered = async (orderId: string) => {
    await updateOrderStatus(orderId, "delivered");
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 md:p-6">
      <PageHeader
        icon={Truck}
        title="포장 & 배송"
        description="게시된 상품 주문을 기준으로 발주, 포장, 송장 입력, 배송 시작까지 한 화면에서 처리합니다"
      />

      <InfoBanner
        message={`게시 상품 ${publishedListings.length}건과 주문 ${orders.length}건을 연결해 포장/배송 단계를 관리합니다.`}
        linkText="상품 등록 보기"
        onLinkClick={() => navigate("/products/register")}
        type="info"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-[#f59e0b]"><Factory className="h-5 w-5" /><span style={{ fontWeight: 600 }}>발주 대기</span></div>
          <div className="text-[#1a1d2e]" style={{ fontSize: "1.8rem", fontWeight: 700 }}>{procurementPending}건</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-[#3b6cf5]"><Boxes className="h-5 w-5" /><span style={{ fontWeight: 600 }}>포장 대기</span></div>
          <div className="text-[#1a1d2e]" style={{ fontSize: "1.8rem", fontWeight: 700 }}>{packingPending}건</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-[#ef4444]"><ClipboardCheck className="h-5 w-5" /><span style={{ fontWeight: 600 }}>송장 미입력</span></div>
          <div className="text-[#1a1d2e]" style={{ fontSize: "1.8rem", fontWeight: 700 }}>{invoicePending}건</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-[#10b981]"><CheckCircle2 className="h-5 w-5" /><span style={{ fontWeight: 600 }}>출고 준비 완료</span></div>
          <div className="text-[#1a1d2e]" style={{ fontSize: "1.8rem", fontWeight: 700 }}>{shippingReady}건</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[#1a1d2e]" style={{ fontWeight: 600 }}>포장/배송 작업 보드</h3>
            <p className="text-[#6b7294]" style={{ fontSize: "0.78rem" }}>오프라인/온라인 발주 후 포장을 완료하고 송장 입력 및 배송 시작으로 이어집니다.</p>
          </div>
          <button
            onClick={() => navigate("/orders")}
            className="rounded-xl border border-[#3b6cf5] px-4 py-2 text-[#3b6cf5] transition-colors hover:bg-[#f0f4ff]"
            style={{ fontSize: "0.8rem", fontWeight: 600 }}
          >
            주문 화면 보기
          </button>
        </div>

        {shippingRows.length > 0 ? (
          <div className="space-y-3">
            {shippingRows.map(({ order, listing, workflow }) => (
              <div key={order.id} className="rounded-xl border border-border bg-[#fafbff] p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 xl:w-[280px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[#1a1d2e]" style={{ fontSize: "0.88rem", fontWeight: 600 }}>{order.id}</p>
                      <span className={`rounded-full px-2.5 py-1 ${orderStatusColor[order.status]}`} style={{ fontSize: "0.72rem", fontWeight: 600 }}>
                        {orderStatusLabel[order.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-[#6b7294]" style={{ fontSize: "0.78rem" }}>
                      {listing?.title ?? "게시 상품 없음"} · {order.customerName} · {formatCurrency(order.amount)}
                    </p>
                    <p className="mt-1 text-[#a0a4b8]" style={{ fontSize: "0.72rem" }}>
                      주문 시각 {formatDateTime(order.placedAt)}
                    </p>
                  </div>

                  <div className="grid flex-1 gap-3 md:grid-cols-4">
                    <div className="rounded-xl border border-border bg-white p-3">
                      <div className="mb-2 flex items-center gap-2 text-[#4a4f6a]" style={{ fontSize: "0.76rem", fontWeight: 600 }}>
                        <Factory className="h-3.5 w-3.5" />
                        발주
                      </div>
                      <p className="text-[#1a1d2e]" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{procurementStatusLabel[workflow.procurementStatus]}</p>
                      <button
                        onClick={() => advanceProcurement(order.id, workflow.procurementStatus)}
                        disabled={workflow.procurementStatus === "received" || !listing}
                        className="mt-2 rounded-lg border border-[#3b6cf5] px-3 py-1.5 text-[#3b6cf5] transition-colors hover:bg-[#f0f4ff] disabled:cursor-not-allowed disabled:border-border disabled:text-[#a0a4b8]"
                        style={{ fontSize: "0.74rem", fontWeight: 600 }}
                      >
                        {workflow.procurementStatus === "pending" ? "발주 요청" : workflow.procurementStatus === "ordered" ? "상품 확보" : "완료"}
                      </button>
                    </div>

                    <div className="rounded-xl border border-border bg-white p-3">
                      <div className="mb-2 flex items-center gap-2 text-[#4a4f6a]" style={{ fontSize: "0.76rem", fontWeight: 600 }}>
                        <PackageCheck className="h-3.5 w-3.5" />
                        포장
                      </div>
                      <p className="text-[#1a1d2e]" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{packingStatusLabel[workflow.packingStatus]}</p>
                      <button
                        onClick={() => advancePacking(order.id, workflow.packingStatus)}
                        disabled={workflow.procurementStatus !== "received" || workflow.packingStatus === "packed"}
                        className="mt-2 rounded-lg border border-[#10b981] px-3 py-1.5 text-[#10b981] transition-colors hover:bg-[#ecfdf5] disabled:cursor-not-allowed disabled:border-border disabled:text-[#a0a4b8]"
                        style={{ fontSize: "0.74rem", fontWeight: 600 }}
                      >
                        {workflow.packingStatus === "pending" ? "포장 시작" : workflow.packingStatus === "packing" ? "포장 완료" : "완료"}
                      </button>
                    </div>

                    <div className="rounded-xl border border-border bg-white p-3">
                      <div className="mb-2 flex items-center gap-2 text-[#4a4f6a]" style={{ fontSize: "0.76rem", fontWeight: 600 }}>
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        송장
                      </div>
                      <p className="text-[#1a1d2e]" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{order.invoiceNumber ?? "미입력"}</p>
                      <button
                        onClick={() => void assignInvoice(order.id)}
                        disabled={order.invoiceNumber !== null || workflow.packingStatus !== "packed" || isRefreshing}
                        className="mt-2 rounded-lg border border-[#ee4d2d] px-3 py-1.5 text-[#ee4d2d] transition-colors hover:bg-[#fff1ec] disabled:cursor-not-allowed disabled:border-border disabled:text-[#a0a4b8]"
                        style={{ fontSize: "0.74rem", fontWeight: 600 }}
                      >
                        {order.invoiceNumber ? "입력 완료" : "송장 입력"}
                      </button>
                    </div>

                    <div className="rounded-xl border border-border bg-white p-3">
                      <div className="mb-2 flex items-center gap-2 text-[#4a4f6a]" style={{ fontSize: "0.76rem", fontWeight: 600 }}>
                        <Waypoints className="h-3.5 w-3.5" />
                        배송 상태
                      </div>
                      <p className="text-[#1a1d2e]" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{orderStatusLabel[order.status]}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => void markShippingStarted(order.id)}
                          disabled={order.invoiceNumber === null || order.status === "shipping" || order.status === "delivered" || isRefreshing}
                          className="rounded-lg border border-[#3b6cf5] px-3 py-1.5 text-[#3b6cf5] transition-colors hover:bg-[#f0f4ff] disabled:cursor-not-allowed disabled:border-border disabled:text-[#a0a4b8]"
                          style={{ fontSize: "0.72rem", fontWeight: 600 }}
                        >
                          배송 시작
                        </button>
                        <button
                          onClick={() => void markDelivered(order.id)}
                          disabled={order.status !== "shipping" || isRefreshing}
                          className="rounded-lg border border-[#10b981] px-3 py-1.5 text-[#10b981] transition-colors hover:bg-[#ecfdf5] disabled:cursor-not-allowed disabled:border-border disabled:text-[#a0a4b8]"
                          style={{ fontSize: "0.72rem", fontWeight: 600 }}
                        >
                          배송 완료
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Truck}
            title="포장/배송 대상 주문이 없습니다"
            description="상품을 게시하고 주문이 들어오면 발주부터 송장 입력, 배송 시작까지 이 화면에서 이어집니다."
          />
        )}
      </div>
    </div>
  );
}
