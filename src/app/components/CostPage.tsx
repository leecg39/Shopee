import { DollarSign, Upload, RefreshCw, ChevronDown, Package, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { InfoBanner } from "./InfoBanner";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";
import { useDemoData } from "../state/demo-store";
import { formatCurrency, formatDateTime } from "../lib/format";

type CostFilter = "all" | "set" | "missing" | "low-stock";
type SortKey = "id" | "updatedAt" | "cost" | "stock";

export function CostPage() {
  const {
    products,
    bulkUploadCosts,
    syncProducts,
    updateProductCost,
    lastProductSyncAt,
    isLoading,
    isRefreshing,
    error,
  } = useDemoData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CostFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("updatedAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [pageSize, setPageSize] = useState("5");
  const [draftCosts, setDraftCosts] = useState<Record<string, string>>({});
  const [guideOpen, setGuideOpen] = useState(true);

  useEffect(() => {
    setDraftCosts(
      Object.fromEntries(products.map((product) => [product.id, product.cost?.toString() ?? ""])),
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    return [...products]
      .filter((product) =>
        search.trim().length === 0
          ? true
          : `${product.name} ${product.id} ${product.sku}`.toLowerCase().includes(search.toLowerCase()),
      )
      .filter((product) => {
        if (statusFilter === "set") {
          return product.cost !== null;
        }

        if (statusFilter === "missing") {
          return product.cost === null;
        }

        if (statusFilter === "low-stock") {
          return product.stock <= product.safetyStock;
        }

        return true;
      })
      .sort((a, b) => {
        const direction = sortDirection === "asc" ? 1 : -1;

        if (sortBy === "updatedAt") {
          return a.updatedAt.localeCompare(b.updatedAt) * direction;
        }

        if (sortBy === "cost") {
          return ((a.cost ?? -1) - (b.cost ?? -1)) * direction;
        }

        if (sortBy === "stock") {
          return (a.stock - b.stock) * direction;
        }

        return a.id.localeCompare(b.id) * direction;
      });
  }, [products, search, sortBy, sortDirection, statusFilter]);

  const visibleProducts = filteredProducts.slice(0, Number(pageSize));

  const saveCost = (productId: string) => {
    const nextValue = Number(draftCosts[productId]);

    if (Number.isFinite(nextValue) && nextValue > 0) {
      void updateProductCost(productId, nextValue);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 md:p-6">
      <PageHeader
        icon={DollarSign}
        title="상품 통합 관리"
        description="지역별 상품 원가를 관리하고 통합 카탈로그 기준으로 정렬합니다"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => void bulkUploadCosts()}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-[#4a4f6a] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-[#a0a4b8]"
              style={{ fontSize: "0.85rem", fontWeight: 500 }}
            >
              <Upload className="w-4 h-4" />
              매입가 대량 업로드
            </button>
            <button
              onClick={() => void syncProducts()}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-xl bg-[#3b6cf5] px-4 py-2.5 text-white shadow-sm transition-colors hover:bg-[#2d5ae0] disabled:cursor-not-allowed disabled:bg-[#9cb4fb]"
              style={{ fontSize: "0.85rem", fontWeight: 500 }}
            >
              <RefreshCw className="w-4 h-4" />
              {isRefreshing ? "동기화 중" : "상품 동기화"}
            </button>
          </div>
        }
      />

      {error ? (
        <InfoBanner message={`상품 API 연결 실패: ${error}`} type="warning" />
      ) : (
        <InfoBanner
          message={isLoading ? "상품 카탈로그를 불러오는 중입니다." : `연결된 채널 상품 ${products.length}개를 기준 카탈로그로 정리했습니다. 마지막 동기화 ${formatDateTime(lastProductSyncAt)}`}
          linkText={isLoading ? undefined : "연동 페이지 보기"}
          linkTo="/integration"
          type="info"
        />
      )}

      <div className="rounded-2xl border border-border bg-white p-5">
        <button
          onClick={() => setGuideOpen((current) => !current)}
          className="flex w-full items-center gap-2 text-[#3b6cf5]"
          style={{ fontSize: "0.85rem", fontWeight: 500 }}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f0f4ff] text-[0.7rem]">ℹ</span>
          기준 카탈로그 원가 입력 가이드
          <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${guideOpen ? "" : "-rotate-90"}`} />
        </button>
        {guideOpen ? (
          <p className="mt-3 text-[#6b7294]" style={{ fontSize: "0.8rem", lineHeight: 1.6 }}>
            지역별 상품명은 달라도 기준 카테고리와 원가를 하나로 맞춰두면 마진, 주문, 재고 화면에서 동일한 기준으로 집계됩니다.
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex flex-wrap items-center gap-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="상품명, 상품 ID, SKU 검색"
            className="min-w-[240px] flex-1 rounded-xl border border-border bg-[#f8f9fc] px-3 py-2"
            style={{ fontSize: "0.85rem" }}
          />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as CostFilter)} className="rounded-xl border border-border bg-white px-3 py-2" style={{ fontSize: "0.85rem" }}>
            <option value="all">전체 상품</option>
            <option value="set">원가 설정 완료</option>
            <option value="missing">원가 미입력</option>
            <option value="low-stock">안전재고 이하</option>
          </select>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortKey)} className="rounded-xl border border-border bg-white px-3 py-2" style={{ fontSize: "0.85rem" }}>
            <option value="updatedAt">최근 수정일</option>
            <option value="id">상품 ID</option>
            <option value="cost">원가</option>
            <option value="stock">재고</option>
          </select>
          <select value={sortDirection} onChange={(event) => setSortDirection(event.target.value)} className="rounded-xl border border-border bg-white px-3 py-2" style={{ fontSize: "0.85rem" }}>
            <option value="desc">내림차순 ↓</option>
            <option value="asc">오름차순 ↑</option>
          </select>
          <select value={pageSize} onChange={(event) => setPageSize(event.target.value)} className="rounded-xl border border-border bg-white px-3 py-2" style={{ fontSize: "0.85rem" }}>
            <option value="5">5개</option>
            <option value="10">10개</option>
            <option value="20">20개</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white">
        {isLoading ? (
          <EmptyState icon={Package} title="상품 데이터를 불러오는 중입니다" description="API 응답을 기다리고 있습니다." />
        ) : visibleProducts.length > 0 ? (
          <div className="overflow-x-auto p-5">
            <table className="w-full min-w-[980px]" style={{ fontSize: "0.84rem" }}>
              <thead>
                <tr className="border-b border-border text-left text-[#6b7294]">
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>상품</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>채널</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>카테고리 매핑</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>판매가</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>원가 입력</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>재고</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>최근 수정</th>
                  <th className="py-3" style={{ fontWeight: 500 }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map((product) => {
                  const lowStock = product.stock <= product.safetyStock;
                  const hasCost = product.cost !== null;

                  return (
                    <tr key={product.id} className="border-b border-border/70 align-top last:border-b-0">
                      <td className="py-4 pr-4">
                        <p className="text-[#1a1d2e]" style={{ fontWeight: 600 }}>{product.name}</p>
                        <p className="mt-1 text-[#a0a4b8]" style={{ fontSize: "0.76rem" }}>{product.id} · {product.sku}</p>
                      </td>
                      <td className="py-4 pr-4 text-[#4a4f6a]">{product.channelName}</td>
                      <td className="py-4 pr-4 text-[#4a4f6a]">
                        <p>{product.category}</p>
                        <p className="mt-1 text-[#a0a4b8]" style={{ fontSize: "0.76rem" }}>{product.mappedCategory}</p>
                      </td>
                      <td className="py-4 pr-4 text-[#1a1d2e]">{formatCurrency(product.price)}</td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <input
                            value={draftCosts[product.id] ?? ""}
                            onChange={(event) => setDraftCosts((current) => ({ ...current, [product.id]: event.target.value }))}
                            className="w-28 rounded-lg border border-border bg-[#f8f9fc] px-3 py-2"
                            style={{ fontSize: "0.82rem" }}
                          />
                          <button
                            onClick={() => saveCost(product.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#3b6cf5] px-3 py-2 text-[#3b6cf5] transition-colors hover:bg-[#f0f4ff]"
                            style={{ fontSize: "0.76rem", fontWeight: 600 }}
                          >
                            <Save className="w-3.5 h-3.5" />
                            저장
                          </button>
                        </div>
                        {!hasCost && (
                          <p className="mt-1 text-[#ef4444]" style={{ fontSize: "0.74rem" }}>
                            대량 업로드로 기본 원가를 채울 수 있습니다.
                          </p>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-[#4a4f6a]">
                        <p>{product.stock}개</p>
                        <p className="mt-1 text-[#a0a4b8]" style={{ fontSize: "0.76rem" }}>안전재고 {product.safetyStock}개</p>
                      </td>
                      <td className="py-4 pr-4 text-[#6b7294]">{formatDateTime(product.updatedAt)}</td>
                      <td className="py-4">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex w-fit rounded-full px-2.5 py-1 ${hasCost ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`} style={{ fontSize: "0.74rem", fontWeight: 600 }}>
                            {hasCost ? "원가 설정 완료" : "원가 미입력"}
                          </span>
                          {lowStock && (
                            <span className="inline-flex w-fit rounded-full bg-rose-50 px-2.5 py-1 text-rose-700" style={{ fontSize: "0.74rem", fontWeight: 600 }}>
                              재고 보충 필요
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
            title="조건에 맞는 상품이 없습니다"
            description="검색어 또는 필터를 조정하면 다른 카탈로그 상품을 확인할 수 있습니다."
          />
        )}
      </div>
    </div>
  );
}
