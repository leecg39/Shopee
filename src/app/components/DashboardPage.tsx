import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  ChartPie,
  DollarSign,
  Link2,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { InfoBanner } from "./InfoBanner";
import { StatCard } from "./StatCard";
import { PageHeader } from "./PageHeader";
import {
  channelStatusColor,
  channelStatusLabel,
  getExpectedNetProfit,
  getExpectedSettlement,
  getLowStockProducts,
  orderStatusColor,
  orderStatusLabel,
  useDemoData,
} from "../state/demo-store";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import { formatCurrency, formatDate, formatDateTime } from "../lib/format";

export function DashboardPage() {
  const navigate = useNavigate();
  const { channels, products, orders, syncOrders, lastOrderSyncAt, isLoading, isRefreshing, error } = useDemoData();

  const connectedChannels = channels.filter((channel) => channel.status === "connected").length;
  const lowStockProducts = useMemo(() => getLowStockProducts(products), [products]);
  const totalSales = orders.reduce((sum, order) => sum + order.amount, 0);
  const expectedSettlement = Math.round(
    orders.reduce((sum, order) => sum + getExpectedSettlement(order), 0),
  );
  const expectedNetProfit = products.reduce(
    (sum, product) => sum + (getExpectedNetProfit(product) ?? 0),
    0,
  );
  const processingOrders = orders.filter(
    (order) => order.status === "paid" || order.status === "preparing",
  ).length;

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt)).slice(0, 4),
    [orders],
  );

  const salesByChannel = useMemo(() => {
    const channelSales = channels.map((channel) => {
      const total = orders
        .filter((order) => order.channelId === channel.id)
        .reduce((sum, order) => sum + order.amount, 0);

      return {
        ...channel,
        total,
      };
    });

    return channelSales.map((channel) => ({
      ...channel,
      share: totalSales > 0 ? Number(((channel.total / totalSales) * 100).toFixed(1)) : 0,
    }));
  }, [channels, orders, totalSales]);

  const salesTrend = useMemo(() => {
    const grouped = new Map<string, number>();

    orders.forEach((order) => {
      const key = order.placedAt.slice(0, 10);
      grouped.set(key, (grouped.get(key) ?? 0) + order.amount);
    });

    return [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, amount]) => ({
        date: formatDate(date, date).slice(5),
        amount,
      }));
  }, [orders]);

  const channelShareConfig = {
    share: {
      label: "판매 비중",
      color: "#3b6cf5",
    },
    Naver: { label: "네이버", color: "#10b981" },
    Coupang: { label: "쿠팡", color: "#3b6cf5" },
    "11st": { label: "11번가", color: "#f59e0b" },
    Gmarket: { label: "G마켓", color: "#8b5cf6" },
  } as const;

  const trendConfig = {
    amount: {
      label: "매출",
      color: "#3b6cf5",
    },
  } as const;

  const guideSteps = [
    {
      icon: Link2,
      title: "판매 채널 연동",
      desc: `${connectedChannels}/${channels.length}개 채널 연결`,
      complete: connectedChannels >= 2,
      action: "연동 확인",
      path: "/integration",
    },
    {
      icon: Boxes,
      title: "상품 동기화",
      desc: `${products.length}개 상품이 수집됨`,
      complete: products.length >= 5,
      action: "상품 보기",
      path: "/cost",
    },
    {
      icon: ShoppingCart,
      title: "주문 자동화 준비",
      desc: `${processingOrders}건 처리 필요 주문 확인`,
      complete: processingOrders > 0,
      action: "주문 확인",
      path: "/orders",
    },
  ];

  const completedSteps = guideSteps.filter((step) => step.complete).length;
  const progress = Math.round((completedSteps / guideSteps.length) * 100);

  const alerts = [
    ...channels
      .filter((channel) => channel.status !== "connected")
      .map((channel) => ({
        id: channel.id,
        title: `${channel.name} 연동 상태 확인 필요`,
        description:
          channel.status === "warning"
            ? "토큰 만료가 임박했습니다. 재인증하면 주문 수집이 중단되지 않습니다."
            : "아직 연결되지 않은 채널입니다. 상품/주문 데이터를 가져오려면 연동하세요.",
        tone: channel.status === "warning" ? "warning" : "neutral",
      })),
    ...lowStockProducts.slice(0, 3).map((product) => ({
      id: product.id,
      title: `${product.name} 재고 부족`,
      description: `현재 재고 ${product.stock}개 / 안전재고 ${product.safetyStock}개`,
      tone: "warning" as const,
    })),
  ].slice(0, 4);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 md:p-6">
      <PageHeader
        title="대시보드"
        description="PRD 기준 멀티채널 판매 현황과 운영 우선순위를 한 화면에서 관리합니다"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-border bg-white px-3 py-2 text-[#6b7294]" style={{ fontSize: "0.8rem" }}>
              마지막 주문 동기화 {formatDateTime(lastOrderSyncAt)}
            </div>
            <button
              onClick={() => void syncOrders()}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-xl bg-[#3b6cf5] px-4 py-2 text-white shadow-sm transition-colors hover:bg-[#2d5ae0] disabled:cursor-not-allowed disabled:bg-[#9cb4fb]"
              style={{ fontSize: "0.85rem", fontWeight: 500 }}
            >
              <RefreshCw className="w-4 h-4" />
              {isRefreshing ? "동기화 중" : "주문 동기화"}
            </button>
          </div>
        }
      />

      {error ? (
        <InfoBanner message={`대시보드 API 연결 실패: ${error}`} type="warning" />
      ) : (
        <InfoBanner
          message={isLoading ? "대시보드 데이터를 불러오는 중입니다." : `현재 ${connectedChannels}개 채널이 연결되어 있으며 처리 필요 주문 ${processingOrders}건이 감지되었습니다.`}
          linkText={isLoading ? undefined : "연동 현황 보기"}
          linkTo="/integration"
          type="info"
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="총 매출"
          value={formatCurrency(totalSales)}
          subtext="최근 수집 주문 기준"
          iconColor="#3b6cf5"
          iconBg="#f0f4ff"
        />
        <StatCard
          icon={TrendingUp}
          label="예상 정산액"
          value={formatCurrency(expectedSettlement)}
          subtext="수수료 제외 기준"
          iconColor="#10b981"
          iconBg="#ecfdf5"
        />
        <StatCard
          icon={ChartPie}
          label="예상 순이익"
          value={formatCurrency(expectedNetProfit)}
          subtext="원가와 수수료 반영"
          iconColor="#8b5cf6"
          iconBg="#f5f3ff"
        />
        <StatCard
          icon={ShoppingCart}
          label="처리 필요 주문"
          value={`${processingOrders}건`}
          subtext="송장 입력 및 상태 변경 필요"
          subtextColor="#f59e0b"
          iconColor="#8b5cf6"
          iconBg="#f5f3ff"
        />
        <StatCard
          icon={Boxes}
          label="품절 위험 상품"
          value={`${lowStockProducts.length}개`}
          subtext="안전재고 이하 상품"
          subtextColor={lowStockProducts.length > 0 ? "#ef4444" : "#6b7294"}
          iconColor="#f59e0b"
          iconBg="#fffbeb"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="rounded-2xl border border-border bg-white p-6 xl:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[#1a1d2e]" style={{ fontWeight: 600 }}>
                최근 주문 현황
              </h3>
              <p className="text-[#6b7294]" style={{ fontSize: "0.8rem" }}>
                채널별 주문 상태를 빠르게 확인하고 송장 입력으로 이어집니다.
              </p>
            </div>
            <span className="text-[#6b7294]" style={{ fontSize: "0.78rem" }}>
              총 {orders.length}건
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px]" style={{ fontSize: "0.84rem" }}>
              <thead>
                <tr className="border-b border-border text-left text-[#6b7294]">
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>주문번호</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>채널</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>고객</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>상태</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>주문금액</th>
                  <th className="py-3" style={{ fontWeight: 500 }}>수집시각</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/70 last:border-b-0">
                    <td className="py-3 pr-4 text-[#1a1d2e]" style={{ fontWeight: 600 }}>
                      {order.id}
                    </td>
                    <td className="py-3 pr-4 text-[#4a4f6a]">{order.channelName}</td>
                    <td className="py-3 pr-4 text-[#4a4f6a]">{order.customerName}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 ${orderStatusColor[order.status]}`} style={{ fontSize: "0.74rem", fontWeight: 600 }}>
                        {orderStatusLabel[order.status]}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-[#1a1d2e]">{formatCurrency(order.amount)}</td>
                    <td className="py-3 text-[#6b7294]">{formatDateTime(order.placedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 xl:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[#3b6cf5]" style={{ fontWeight: 600 }}>
              <Link2 className="w-5 h-5" />
              운영 시작 가이드
            </h3>
            <span className="text-[#6b7294]" style={{ fontSize: "0.8rem" }}>
              {completedSteps}/{guideSteps.length} 완료
            </span>
          </div>
          <div className="mb-5 flex items-center gap-2">
            <span className="text-[#6b7294]" style={{ fontSize: "0.8rem" }}>진행률</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f0f4ff]">
              <div className="h-full rounded-full bg-[#3b6cf5]" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[#3b6cf5]" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{progress}%</span>
          </div>
          <div className="space-y-3">
            {guideSteps.map((step) => (
              <div
                key={step.title}
                className={`group flex items-center gap-4 rounded-xl border p-3 transition-all ${
                  step.complete
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-border hover:border-[#3b6cf5] hover:bg-[#f8faff]"
                }`}
              >
                <div className={`h-5 w-5 shrink-0 rounded-full border-2 ${step.complete ? "border-emerald-500 bg-emerald-500" : "border-gray-200"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <step.icon className="w-4 h-4 text-[#3b6cf5]" />
                    <span className="text-[#1a1d2e]" style={{ fontSize: "0.85rem", fontWeight: 600 }}>{step.title}</span>
                  </div>
                  <p className="mt-0.5 text-[#6b7294]" style={{ fontSize: "0.75rem" }}>{step.desc}</p>
                </div>
                <button onClick={() => navigate(step.path)} className="flex items-center gap-1 text-[#3b6cf5] opacity-0 transition-opacity group-hover:opacity-100" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                  {step.action}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-[#1a1d2e]" style={{ fontWeight: 600 }}>
            <TrendingUp className="w-5 h-5 text-[#3b6cf5]" />
            매출 그래프
          </h3>
          <ChartContainer config={trendConfig} className="h-[280px] w-full">
            <LineChart data={salesTrend} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 10000)}만`} />
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
              <Line type="monotone" dataKey="amount" stroke="var(--color-amount)" strokeWidth={3} dot={{ r: 4, fill: "var(--color-amount)" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-[#1a1d2e]" style={{ fontWeight: 600 }}>
            <ChartPie className="w-5 h-5 text-[#3b6cf5]" />
            채널별 판매 비중
          </h3>
          <ChartContainer config={channelShareConfig} className="h-[280px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? "채널"} formatter={(value) => `${value}%`} />} />
              <Pie data={salesByChannel} dataKey="share" nameKey="name" innerRadius={64} outerRadius={94} paddingAngle={3}>
                {salesByChannel.map((channel) => (
                  <Cell key={channel.id} fill={(channelShareConfig[channel.name as keyof typeof channelShareConfig]?.color) ?? "#94a3b8"} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-4 space-y-2">
            {salesByChannel.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between rounded-xl bg-[#fafbff] px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: (channelShareConfig[channel.name as keyof typeof channelShareConfig]?.color) ?? "#94a3b8" }} />
                  <span className="text-[#1a1d2e]" style={{ fontSize: "0.82rem", fontWeight: 600 }}>{channel.name}</span>
                  <span className={`rounded-full px-2 py-0.5 ${channelStatusColor[channel.status]}`} style={{ fontSize: "0.68rem", fontWeight: 600 }}>
                    {channelStatusLabel[channel.status]}
                  </span>
                </div>
                <span className="text-[#4a4f6a]" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  {channel.share}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6">
        <h3 className="mb-4 flex items-center gap-2 text-[#1a1d2e]" style={{ fontWeight: 600 }}>
          <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
          운영 알림 센터
        </h3>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="rounded-xl border border-border bg-[#fafbff] p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${alert.tone === "warning" ? "bg-amber-500" : "bg-slate-400"}`} />
                <p className="text-[#1a1d2e]" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  {alert.title}
                </p>
              </div>
              <p className="text-[#6b7294]" style={{ fontSize: "0.8rem", lineHeight: 1.6 }}>
                {alert.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
