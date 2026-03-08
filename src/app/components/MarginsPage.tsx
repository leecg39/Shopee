import {
  BarChart3,
  Calculator,
  Download,
  Package,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import { InfoBanner } from "./InfoBanner";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";
import {
  getExpectedNetProfit,
  getExpectedProductSettlement,
  getLowStockProducts,
  getMarginRate,
  useDemoData,
} from "../state/demo-store";
import { formatCurrency, formatPercent } from "../lib/format";

type MarginFilter = "all" | "healthy" | "warning" | "loss" | "missing";

function exportMarginsCsv(rows: Array<{ name: string; id: string; margin: string; settlement: string; netProfit: string }>) {
  const content = ["상품명,상품ID,마진율,예상정산액,예상순이익", ...rows.map((row) => [row.name, row.id, row.margin, row.settlement, row.netProfit].join(","))].join("\n");
  const blob = new Blob([`\ufeff${content}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "margins-demo.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function MarginsPage() {
  const { channels, products, syncProducts, isLoading, isRefreshing, error } = useDemoData();
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [marginFilter, setMarginFilter] = useState<MarginFilter>("all");
  const [sortDirection, setSortDirection] = useState("desc");
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const validMargins = products
    .map((product) => getMarginRate(product))
    .filter((value): value is number => value !== null);

  const averageMargin = validMargins.length > 0
    ? validMargins.reduce((sum, value) => sum + value, 0) / validMargins.length
    : 0;

  const lowMarginProducts = products.filter((product) => {
    const margin = getMarginRate(product);
    return margin !== null && margin < 15;
  });
  const reportProducts = products.filter((product) => product.cost !== null);
  const expectedSettlementTotal = reportProducts.reduce(
    (sum, product) => sum + getExpectedProductSettlement(product),
    0,
  );
  const expectedNetProfitTotal = reportProducts.reduce(
    (sum, product) => sum + (getExpectedNetProfit(product) ?? 0),
    0,
  );
  const expectedFeeTotal = reportProducts.reduce(
    (sum, product) => sum + product.price * product.feeRate,
    0,
  );
  const missingCostCount = products.length - reportProducts.length;

  const filteredProducts = useMemo(() => {
    return [...products]
      .filter((product) =>
        search.trim().length === 0
          ? true
          : `${product.name} ${product.id}`.toLowerCase().includes(search.toLowerCase()),
      )
      .filter((product) => (channelFilter === "all" ? true : product.channelId === channelFilter))
      .filter((product) => {
        const margin = getMarginRate(product);

        if (marginFilter === "healthy") {
          return margin !== null && margin >= 20;
        }

        if (marginFilter === "warning") {
          return margin !== null && margin >= 10 && margin < 20;
        }

        if (marginFilter === "loss") {
          return margin !== null && margin < 10;
        }

        if (marginFilter === "missing") {
          return margin === null;
        }

        return true;
      })
      .filter((product) => (onlyLowStock ? product.stock <= product.safetyStock : true))
      .sort((a, b) => {
        const direction = sortDirection === "desc" ? -1 : 1;
        const marginA = getMarginRate(a) ?? -100;
        const marginB = getMarginRate(b) ?? -100;

        return (marginA - marginB) * direction;
      });
  }, [channelFilter, marginFilter, onlyLowStock, products, search, sortDirection]);

  const summaryCards = [
    {
      icon: Package,
      label: "전체 상품수",
      value: `${products.length}`,
      sub: "통합 카탈로그 기준",
      color: "#3b6cf5",
      bg: "#f0f4ff",
    },
    {
      icon: Calculator,
      label: "마진 계산 완료",
      value: `${validMargins.length}`,
      sub: `전체 ${products.length}개 중 ${validMargins.length}개`,
      color: "#10b981",
      bg: "#ecfdf5",
    },
    {
      icon: TrendingDown,
      label: "주의 상품수",
      value: `${lowMarginProducts.length}`,
      sub: "목표 마진 15% 미만",
      color: "#ef4444",
      bg: "#fef2f2",
    },
    {
      icon: BarChart3,
      label: "평균 마진율",
      value: formatPercent(averageMargin),
      sub: "수수료와 원가 반영",
      color: "#8b5cf6",
      bg: "#f5f3ff",
    },
    {
      icon: TriangleAlert,
      label: "재고 위험",
      value: `${getLowStockProducts(products).length}개`,
      sub: "안전재고 이하",
      color: "#f59e0b",
      bg: "#fffbeb",
    },
  ];

  const exportRows = filteredProducts.map((product) => ({
    id: product.id,
    name: product.name,
    margin: getMarginRate(product) === null ? "미설정" : formatPercent(getMarginRate(product) ?? 0),
    settlement:
      product.cost === null
        ? "원가 미입력"
        : formatCurrency(getExpectedProductSettlement(product)),
    netProfit:
      product.cost === null
        ? "원가 미입력"
        : formatCurrency(getExpectedNetProfit(product) ?? 0),
  }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 md:p-6">
      <PageHeader
        icon={TrendingUp}
        title="상품 마진 분석"
        description="지역별 원가, 수수료, 예상 정산액을 기준으로 수익성을 빠르게 판단합니다"
        actions={
          <button
            onClick={() => void syncProducts()}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-xl bg-[#3b6cf5] px-4 py-2.5 text-white shadow-sm transition-colors hover:bg-[#2d5ae0] disabled:cursor-not-allowed disabled:bg-[#9cb4fb]"
            style={{ fontSize: "0.85rem", fontWeight: 500 }}
          >
            <RefreshCw className="w-4 h-4" />
            {isRefreshing ? "동기화 중" : "상품 동기화"}
          </button>
        }
      />

      {error ? (
        <InfoBanner message={`마진 API 연결 실패: ${error}`} type="warning" />
      ) : (
        <InfoBanner
          message={isLoading ? "마진 데이터를 불러오는 중입니다." : "원가가 입력된 상품부터 자동으로 예상 정산액과 마진율을 계산합니다."}
          linkText={isLoading ? undefined : "원가 관리로 이동"}
          linkTo="/cost"
          type="info"
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-white p-5 transition-all hover:shadow-md hover:shadow-blue-50">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: card.bg }}>
                <card.icon className="h-3.5 w-3.5" style={{ color: card.color }} />
              </div>
              <span className="text-[#6b7294]" style={{ fontSize: "0.78rem", fontWeight: 500 }}>{card.label}</span>
            </div>
            <div className="text-[#1a1d2e]" style={{ fontSize: "1.4rem", fontWeight: 700 }}>{card.value}</div>
            <p className="mt-1 text-[#a0a4b8]" style={{ fontSize: "0.72rem" }}>{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-[#6b7294]" style={{ fontSize: "0.78rem", fontWeight: 500 }}>예상 정산 총액</p>
          <div className="mt-2 text-[#1a1d2e]" style={{ fontSize: "1.4rem", fontWeight: 700 }}>{formatCurrency(expectedSettlementTotal)}</div>
          <p className="mt-1 text-[#a0a4b8]" style={{ fontSize: "0.72rem" }}>수수료 차감 후 합계</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-[#6b7294]" style={{ fontSize: "0.78rem", fontWeight: 500 }}>예상 순이익</p>
          <div className="mt-2 text-[#1a1d2e]" style={{ fontSize: "1.4rem", fontWeight: 700 }}>{formatCurrency(expectedNetProfitTotal)}</div>
          <p className="mt-1 text-[#a0a4b8]" style={{ fontSize: "0.72rem" }}>원가와 수수료 반영</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-[#6b7294]" style={{ fontSize: "0.78rem", fontWeight: 500 }}>예상 수수료</p>
          <div className="mt-2 text-[#1a1d2e]" style={{ fontSize: "1.4rem", fontWeight: 700 }}>{formatCurrency(expectedFeeTotal)}</div>
          <p className="mt-1 text-[#a0a4b8]" style={{ fontSize: "0.72rem" }}>판매가 기준 차감액</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-[#6b7294]" style={{ fontSize: "0.78rem", fontWeight: 500 }}>리포트 제외 상품</p>
          <div className="mt-2 text-[#1a1d2e]" style={{ fontSize: "1.4rem", fontWeight: 700 }}>{missingCostCount}개</div>
          <p className="mt-1 text-[#a0a4b8]" style={{ fontSize: "0.72rem" }}>원가 미입력 상품</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-5">
        <h3 className="mb-4 text-[#1a1d2e]" style={{ fontWeight: 600 }}>필터링 및 관리</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-[#6b7294]" style={{ fontSize: "0.78rem" }}>상품 검색</label>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-[#f8f9fc] px-3 py-2">
              <Search className="w-4 h-4 text-[#a0a4b8]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="상품명, 상품ID 검색" className="w-full bg-transparent outline-none" style={{ fontSize: "0.85rem" }} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[#6b7294]" style={{ fontSize: "0.78rem" }}>채널</label>
            <select value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)} className="rounded-xl border border-border bg-white px-3 py-2" style={{ fontSize: "0.85rem" }}>
              <option value="all">전체 채널</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[#6b7294]" style={{ fontSize: "0.78rem" }}>마진율 필터</label>
            <select value={marginFilter} onChange={(event) => setMarginFilter(event.target.value as MarginFilter)} className="rounded-xl border border-border bg-white px-3 py-2" style={{ fontSize: "0.85rem" }}>
              <option value="all">전체</option>
              <option value="healthy">20% 이상</option>
              <option value="warning">10~20%</option>
              <option value="loss">10% 미만</option>
              <option value="missing">원가 미입력</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[#6b7294]" style={{ fontSize: "0.78rem" }}>정렬 순서</label>
            <select value={sortDirection} onChange={(event) => setSortDirection(event.target.value)} className="rounded-xl border border-border bg-white px-3 py-2" style={{ fontSize: "0.85rem" }}>
              <option value="desc">높은순</option>
              <option value="asc">낮은순</option>
            </select>
          </div>
          <div className="flex items-center gap-3 self-end">
            <label className="flex items-center gap-2 text-[#6b7294]" style={{ fontSize: "0.82rem" }}>
              <input type="checkbox" checked={onlyLowStock} onChange={(event) => setOnlyLowStock(event.target.checked)} className="h-4 w-4 rounded border-border" />
              품절 위험 상품만
            </label>
            <button onClick={() => exportMarginsCsv(exportRows)} className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-[#4a4f6a] transition-colors hover:bg-gray-50" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
              <Download className="w-4 h-4" />
              CSV 다운로드
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[#1a1d2e]" style={{ fontWeight: 600 }}>상품 마진 목록</h3>
          <span className="text-[#6b7294]" style={{ fontSize: "0.82rem" }}>조회 결과 {filteredProducts.length}개</span>
        </div>
        {isLoading ? (
          <EmptyState icon={Package} title="마진 데이터를 불러오는 중입니다" description="상품/원가 데이터를 집계하고 있습니다." />
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]" style={{ fontSize: "0.84rem" }}>
              <thead>
                <tr className="border-b border-border text-left text-[#6b7294]">
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>상품</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>채널</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>판매가</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>원가</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>예상 정산액</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>예상 순이익</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>마진율</th>
                  <th className="py-3" style={{ fontWeight: 500 }}>재고 상태</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const margin = getMarginRate(product);
                  const settlement = getExpectedProductSettlement(product);
                  const netProfit = getExpectedNetProfit(product);
                  const lowStock = product.stock <= product.safetyStock;

                  return (
                    <tr key={product.id} className="border-b border-border/70 last:border-b-0">
                      <td className="py-4 pr-4">
                        <p className="text-[#1a1d2e]" style={{ fontWeight: 600 }}>{product.name}</p>
                        <p className="mt-1 text-[#a0a4b8]" style={{ fontSize: "0.76rem" }}>{product.id}</p>
                      </td>
                      <td className="py-4 pr-4 text-[#4a4f6a]">{product.channelName}</td>
                      <td className="py-4 pr-4 text-[#1a1d2e]">{formatCurrency(product.price)}</td>
                      <td className="py-4 pr-4 text-[#4a4f6a]">
                        {product.cost === null ? "미입력" : formatCurrency(product.cost)}
                      </td>
                      <td className="py-4 pr-4 text-[#1a1d2e]">
                        {product.cost === null ? "계산 불가" : formatCurrency(settlement)}
                      </td>
                      <td className="py-4 pr-4 text-[#1a1d2e]">
                        {netProfit === null ? "계산 불가" : formatCurrency(netProfit)}
                      </td>
                      <td className="py-4 pr-4">
                        {margin === null ? (
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-slate-600" style={{ fontSize: "0.74rem", fontWeight: 600 }}>
                            원가 미입력
                          </span>
                        ) : (
                          <span className={`inline-flex rounded-full px-2.5 py-1 ${margin >= 20 ? "bg-emerald-50 text-emerald-700" : margin >= 10 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`} style={{ fontSize: "0.74rem", fontWeight: 600 }}>
                            {formatPercent(margin)}
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-[#4a4f6a]">
                        <div className="flex flex-col gap-2">
                          <span>{product.stock}개</span>
                          {lowStock && (
                            <span className="inline-flex w-fit rounded-full bg-rose-50 px-2.5 py-1 text-rose-700" style={{ fontSize: "0.74rem", fontWeight: 600 }}>
                              안전재고 이하
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="필터 조건에 맞는 상품이 없습니다"
            description="다른 채널 또는 마진 조건으로 다시 검색해보세요."
          />
        )}
      </div>
    </div>
  );
}
