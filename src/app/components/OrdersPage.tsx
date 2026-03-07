import {
  CheckCircle,
  ClipboardList,
  Clock,
  Download,
  Factory,
  Globe,
  Package,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { InfoBanner } from "./InfoBanner";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";
import {
  orderStatusColor,
  orderStatusLabel,
  type PackingStatus,
  type ProcurementStatus,
  type OrderStatus,
  useDemoData,
} from "../state/demo-store";
import { formatCurrency, formatDateTime } from "../lib/format";

const statusOptions: Array<{ value: "all" | OrderStatus; label: string }> = [
  { value: "all", label: "모든 상태" },
  { value: "paid", label: "결제 완료" },
  { value: "preparing", label: "배송 준비" },
  { value: "shipping", label: "배송 중" },
  { value: "delivered", label: "배송 완료" },
  { value: "cancelled", label: "취소" },
];

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

function downloadOrdersCsv(rows: ReturnType<typeof buildCsvRows>) {
  const header = ["주문번호", "채널", "고객명", "상태", "상품수", "주문금액", "송장번호", "택배사", "주문시각"];
  const body = rows.map((row) =>
    [
      row.id,
      row.channelName,
      row.customerName,
      orderStatusLabel[row.status],
      String(row.items),
      String(row.amount),
      row.invoiceNumber ?? "",
      row.carrier ?? "",
      row.placedAt,
    ].join(","),
  );
  const csv = [header.join(","), ...body].join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "orders-demo.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function buildCsvRows(orders: ReturnType<typeof useDemoData>["orders"]) {
  return orders;
}

export function OrdersPage() {
  const {
    channels,
    listings,
    orders,
    orderWorkflowStates,
    syncOrders,
    assignInvoice,
    updateOrderStatus,
    updateOrderWorkflowState,
    lastOrderSyncAt,
    isLoading,
    isRefreshing,
    error,
  } = useDemoData();
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("30");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [pageSize, setPageSize] = useState("5");

  const filteredOrders = useMemo(() => {
    const days = Number(period);
    const cutoff = new Date("2026-03-06T23:59:59+09:00").getTime() - days * 24 * 60 * 60 * 1000;

    return [...orders]
      .filter((order) => order.placedAt && new Date(order.placedAt).getTime() >= cutoff)
      .filter((order) =>
        search.trim().length === 0
          ? true
          : `${order.id} ${order.customerName}`.toLowerCase().includes(search.toLowerCase()),
      )
      .filter((order) => (statusFilter === "all" ? true : order.status === statusFilter))
      .filter((order) => (channelFilter === "all" ? true : order.channelId === channelFilter))
      .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  }, [channelFilter, orders, period, search, statusFilter]);

  const visibleOrders = filteredOrders.slice(0, Number(pageSize));
  const publishedListings = listings.filter((listing) => listing.status === "published");

  const workflowOrders = visibleOrders.map((order, index) => ({
    order,
    listing: publishedListings.length > 0 ? publishedListings[index % publishedListings.length] : null,
    workflow: orderWorkflowStates[order.id] ?? {
      procurementStatus: "pending" as ProcurementStatus,
      packingStatus: "pending" as PackingStatus,
    },
  }));

  const statusCards = [
    {
      icon: Globe,
      label: "총 주문",
      value: `${orders.length}건`,
      sub: `마지막 동기화 ${formatDateTime(lastOrderSyncAt)}`,
      color: "#3b6cf5",
      bg: "#f0f4ff",
    },
    {
      icon: Factory,
      label: "게시 상품",
      value: `${publishedListings.length}건`,
      sub: "Save & Publish 완료 기준",
      color: "#ee4d2d",
      bg: "#fff1ec",
    },
    {
      icon: Clock,
      label: "처리 필요",
      value: `${orders.filter((order) => order.status === "paid" || order.status === "preparing").length}건`,
      sub: "송장 입력/상태 변경 필요",
      color: "#f59e0b",
      bg: "#fffbeb",
    },
    {
      icon: CheckCircle,
      label: "배송 완료",
      value: `${orders.filter((order) => order.status === "delivered").length}건`,
      sub: "고객 수령 완료",
      color: "#10b981",
      bg: "#ecfdf5",
    },
    {
      icon: XCircle,
      label: "취소",
      value: `${orders.filter((order) => order.status === "cancelled").length}건`,
      sub: "취소/환불 접수",
      color: "#ef4444",
      bg: "#fef2f2",
    },
  ];

  const resetFilters = () => {
    setSearch("");
    setPeriod("30");
    setStatusFilter("all");
    setChannelFilter("all");
    setPageSize("5");
  };

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

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 md:p-6">
      <PageHeader
        icon={ClipboardList}
        title="주문 관리"
        description="여러 판매채널의 주문을 한 화면에서 수집하고 송장/상태를 관리합니다"
        actions={
          <button
            onClick={() => void syncOrders()}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-xl bg-[#3b6cf5] px-4 py-2.5 text-white shadow-sm transition-colors hover:bg-[#2d5ae0] disabled:cursor-not-allowed disabled:bg-[#9cb4fb]"
            style={{ fontSize: "0.85rem", fontWeight: 500 }}
          >
            <RefreshCw className="w-4 h-4" />
            {isRefreshing ? "동기화 중" : "주문 동기화"}
          </button>
        }
      />

      {error ? (
        <InfoBanner message={`주문 API 연결 실패: ${error}`} type="warning" />
      ) : (
        <InfoBanner
          message={isLoading ? "주문 데이터를 불러오는 중입니다." : `게시 완료 상품 ${publishedListings.length}건을 기준으로 주문 처리와 포장 단계를 이어서 관리할 수 있습니다.`}
          linkText={isLoading ? undefined : "채널 상태 확인"}
          linkTo="/integration"
          type="info"
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statusCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-white p-4 transition-all hover:shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: card.bg }}>
                <card.icon className="h-3.5 w-3.5" style={{ color: card.color }} />
              </div>
              <span className="text-[#6b7294]" style={{ fontSize: "0.8rem", fontWeight: 500 }}>{card.label}</span>
            </div>
            <div className="text-[#1a1d2e]" style={{ fontSize: "1.5rem", fontWeight: 700 }}>{card.value}</div>
            <p className="mt-0.5 text-[#a0a4b8]" style={{ fontSize: "0.75rem" }}>{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[#1a1d2e]" style={{ fontWeight: 600 }}>상품 등록 후 주문 처리 큐</h3>
            <p className="text-[#6b7294]" style={{ fontSize: "0.78rem" }}>
              Save & Publish 완료 상품을 기준으로 발주, 포장 준비, 송장 입력 전 단계를 빠르게 처리합니다.
            </p>
          </div>
          <span className="rounded-full bg-[#f0f4ff] px-3 py-1 text-[#3b6cf5]" style={{ fontSize: "0.74rem", fontWeight: 600 }}>
            {publishedListings.length > 0 ? "게시 상품 연결됨" : "게시 상품 필요"}
          </span>
        </div>

        {workflowOrders.length > 0 ? (
          <div className="space-y-3">
            {workflowOrders.map(({ order, listing, workflow }) => (
              <div key={`workflow-${order.id}`} className="rounded-xl border border-border bg-[#fafbff] p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[#1a1d2e]" style={{ fontSize: "0.88rem", fontWeight: 600 }}>{order.id}</p>
                      <span className={`rounded-full px-2.5 py-1 ${orderStatusColor[order.status]}`} style={{ fontSize: "0.72rem", fontWeight: 600 }}>
                        {orderStatusLabel[order.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-[#6b7294]" style={{ fontSize: "0.78rem" }}>
                      연결 상품: {listing?.title ?? "게시 상품 없음"} · 고객 {order.customerName} · {formatCurrency(order.amount)}
                    </p>
                  </div>
                  <div className="grid gap-2 md:grid-cols-3 xl:min-w-[520px]">
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
                        <Truck className="h-3.5 w-3.5" />
                        배송 준비
                      </div>
                      <p className="text-[#1a1d2e]" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                        {order.invoiceNumber ? "송장 입력 완료" : workflow.packingStatus === "packed" ? "송장 입력 가능" : "포장 후 가능"}
                      </p>
                      <p className="mt-2 text-[#a0a4b8]" style={{ fontSize: "0.72rem" }}>
                        아래 주문 테이블에서 상태 변경과 송장 입력을 이어서 처리합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="처리할 주문이 없습니다"
            description="상품을 Save & Publish 한 뒤 주문이 들어오면 여기서 발주와 포장 단계를 이어서 관리할 수 있습니다."
          />
        )}
      </div>

      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[220px] flex-1 items-center gap-2">
            <Search className="w-4 h-4 text-[#6b7294]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="주문번호 또는 고객명 검색"
              className="w-full rounded-xl border border-border bg-[#f8f9fc] px-3 py-2"
              style={{ fontSize: "0.85rem" }}
            />
          </div>
          <select value={period} onChange={(event) => setPeriod(event.target.value)} className="rounded-xl border border-border bg-white px-3 py-2" style={{ fontSize: "0.85rem" }}>
            <option value="7">최근 1주일</option>
            <option value="30">최근 1개월</option>
            <option value="90">최근 3개월</option>
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | OrderStatus)} className="rounded-xl border border-border bg-white px-3 py-2" style={{ fontSize: "0.85rem" }}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)} className="rounded-xl border border-border bg-white px-3 py-2" style={{ fontSize: "0.85rem" }}>
            <option value="all">전체 채널</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select value={pageSize} onChange={(event) => setPageSize(event.target.value)} className="rounded-xl border border-border bg-white px-3 py-2" style={{ fontSize: "0.85rem" }}>
            <option value="5">5개</option>
            <option value="10">10개</option>
            <option value="20">20개</option>
          </select>
          <button onClick={resetFilters} className="rounded-xl border border-border px-4 py-2 text-[#4a4f6a] transition-colors hover:bg-gray-50" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
            <RotateCcw className="mr-1.5 inline h-3.5 w-3.5" />
            전체 초기화
          </button>
          <button onClick={() => downloadOrdersCsv(buildCsvRows(filteredOrders))} className="flex items-center gap-2 rounded-xl bg-[#10b981] px-4 py-2 text-white transition-colors hover:bg-[#059669]" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
            <Download className="w-4 h-4" />
            CSV 내보내기
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white">
        {isLoading ? (
          <EmptyState icon={Package} title="주문 데이터를 불러오는 중입니다" description="API 응답을 기다리고 있습니다." />
        ) : visibleOrders.length > 0 ? (
          <div className="overflow-x-auto p-5">
            <table className="w-full min-w-[920px]" style={{ fontSize: "0.84rem" }}>
              <thead>
                <tr className="border-b border-border text-left text-[#6b7294]">
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>주문번호</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>채널</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>고객명</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>상태</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>상품수</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>주문금액</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>송장번호</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>주문시각</th>
                  <th className="py-3" style={{ fontWeight: 500 }}>액션</th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/70 align-top last:border-b-0">
                    <td className="py-4 pr-4 text-[#1a1d2e]" style={{ fontWeight: 600 }}>{order.id}</td>
                    <td className="py-4 pr-4 text-[#4a4f6a]">{order.channelName}</td>
                    <td className="py-4 pr-4 text-[#4a4f6a]">{order.customerName}</td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex w-fit rounded-full px-2.5 py-1 ${orderStatusColor[order.status]}`} style={{ fontSize: "0.74rem", fontWeight: 600 }}>
                          {orderStatusLabel[order.status]}
                        </span>
                        <select value={order.status} onChange={(event) => void updateOrderStatus(order.id, event.target.value as OrderStatus)} className="rounded-lg border border-border px-2 py-1 text-[#4a4f6a]" style={{ fontSize: "0.76rem" }}>
                          {statusOptions.filter((option) => option.value !== "all").map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-[#4a4f6a]">{order.items}개</td>
                    <td className="py-4 pr-4 text-[#1a1d2e]">{formatCurrency(order.amount)}</td>
                    <td className="py-4 pr-4 text-[#4a4f6a]">
                      {order.invoiceNumber ? (
                        <div>
                          <p>{order.invoiceNumber}</p>
                          <p className="text-[#a0a4b8]" style={{ fontSize: "0.74rem" }}>{order.carrier}</p>
                        </div>
                      ) : (
                        <span className="text-[#a0a4b8]">미입력</span>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-[#6b7294]">{formatDateTime(order.placedAt)}</td>
                    <td className="py-4">
                      <button
                        onClick={() => void assignInvoice(order.id)}
                        disabled={order.invoiceNumber !== null || isRefreshing}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#3b6cf5] px-3 py-1.5 text-[#3b6cf5] transition-colors hover:bg-[#f0f4ff] disabled:cursor-not-allowed disabled:border-border disabled:text-[#a0a4b8]"
                        style={{ fontSize: "0.76rem", fontWeight: 600 }}
                      >
                        <Truck className="w-3.5 h-3.5" />
                        {order.invoiceNumber ? "입력 완료" : "송장 입력"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="조건에 맞는 주문이 없습니다"
            description="검색어나 필터를 조정하면 다른 채널 주문을 다시 조회할 수 있습니다."
            actionLabel="필터 초기화"
            onAction={resetFilters}
          />
        )}
      </div>
    </div>
  );
}
