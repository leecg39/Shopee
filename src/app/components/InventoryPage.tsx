import { AlertTriangle, Boxes, PackageCheck, RefreshCw, Search, Warehouse } from "lucide-react";
import { useMemo, useState } from "react";
import { InfoBanner } from "./InfoBanner";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";
import { getLowStockProducts, useDemoData } from "../state/demo-store";
import { formatDateTime } from "../lib/format";

export function InventoryPage() {
  const { channels, products, syncProducts, lastProductSyncAt, isLoading, isRefreshing, error } = useDemoData();
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        search.trim().length === 0
          ? true
          : `${product.name} ${product.id} ${product.sku}`.toLowerCase().includes(search.toLowerCase());
      const matchesChannel = channelFilter === "all" ? true : product.channelId === channelFilter;
      const matchesStock =
        stockFilter === "all"
          ? true
          : stockFilter === "low"
            ? product.stock <= product.safetyStock
            : product.stock === 0;

      return matchesSearch && matchesChannel && matchesStock;
    });
  }, [channelFilter, products, search, stockFilter]);

  const lowStockProducts = getLowStockProducts(products);
  const outOfStockProducts = products.filter((product) => product.stock === 0);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 md:p-6">
      <PageHeader
        icon={Warehouse}
        title="재고 관리"
        description="PRD 기준 통합 재고 현황과 품절 위험 상품을 한 화면에서 관리합니다"
        actions={
          <button
            onClick={() => void syncProducts()}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-xl bg-[#3b6cf5] px-4 py-2.5 text-white shadow-sm transition-colors hover:bg-[#2d5ae0] disabled:cursor-not-allowed disabled:bg-[#9cb4fb]"
            style={{ fontSize: "0.85rem", fontWeight: 500 }}
          >
            <RefreshCw className="w-4 h-4" />
            재고 동기화
          </button>
        }
      />

      {error ? (
        <InfoBanner message={`재고 API 연결 실패: ${error}`} type="warning" />
      ) : (
        <InfoBanner
          message={`마지막 재고 동기화 ${lastProductSyncAt ? formatDateTime(lastProductSyncAt) : "대기 중"} · 정상 채널 ${channels.filter((channel) => channel.status === "connected").length}개`}
          type="info"
        />
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-[#3b6cf5]">
            <Boxes className="h-5 w-5" />
            <span style={{ fontWeight: 600 }}>전체 재고 상품</span>
          </div>
          <div className="text-[#1a1d2e]" style={{ fontSize: "1.8rem", fontWeight: 700 }}>{products.length}개</div>
          <p className="mt-1 text-[#6b7294]" style={{ fontSize: "0.8rem" }}>연동 채널 전체 기준</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-[#f59e0b]">
            <AlertTriangle className="h-5 w-5" />
            <span style={{ fontWeight: 600 }}>안전재고 이하</span>
          </div>
          <div className="text-[#1a1d2e]" style={{ fontSize: "1.8rem", fontWeight: 700 }}>{lowStockProducts.length}개</div>
          <p className="mt-1 text-[#6b7294]" style={{ fontSize: "0.8rem" }}>자동 품절 처리 후보</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-[#ef4444]">
            <PackageCheck className="h-5 w-5" />
            <span style={{ fontWeight: 600 }}>실제 품절</span>
          </div>
          <div className="text-[#1a1d2e]" style={{ fontSize: "1.8rem", fontWeight: 700 }}>{outOfStockProducts.length}개</div>
          <p className="mt-1 text-[#6b7294]" style={{ fontSize: "0.8rem" }}>즉시 보충 또는 판매중지 필요</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-border bg-[#f8f9fc] px-3 py-2">
            <Search className="h-4 w-4 text-[#a0a4b8]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="상품명, 상품 ID, SKU 검색"
              className="w-full bg-transparent outline-none"
              style={{ fontSize: "0.85rem" }}
            />
          </div>
          <select value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)} className="rounded-xl border border-border bg-white px-3 py-2" style={{ fontSize: "0.85rem" }}>
            <option value="all">전체 채널</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
          <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)} className="rounded-xl border border-border bg-white px-3 py-2" style={{ fontSize: "0.85rem" }}>
            <option value="all">전체 재고 상태</option>
            <option value="low">안전재고 이하</option>
            <option value="out">품절</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[#1a1d2e]" style={{ fontWeight: 600 }}>통합 재고 목록</h3>
          <span className="text-[#6b7294]" style={{ fontSize: "0.8rem" }}>
            {isLoading ? "불러오는 중" : `${filteredProducts.length}개 상품`}
          </span>
        </div>
        {isLoading ? (
          <EmptyState title="재고 데이터를 불러오는 중입니다" description="API 응답을 기다리고 있습니다." />
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px]" style={{ fontSize: "0.84rem" }}>
              <thead>
                <tr className="border-b border-border text-left text-[#6b7294]">
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>상품</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>채널</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>현재 재고</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>안전재고</th>
                  <th className="py-3 pr-4" style={{ fontWeight: 500 }}>최근 수정</th>
                  <th className="py-3" style={{ fontWeight: 500 }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isLow = product.stock <= product.safetyStock;
                  const isOut = product.stock === 0;

                  return (
                    <tr key={product.id} className="border-b border-border/70 last:border-b-0">
                      <td className="py-4 pr-4">
                        <p className="text-[#1a1d2e]" style={{ fontWeight: 600 }}>{product.name}</p>
                        <p className="mt-1 text-[#a0a4b8]" style={{ fontSize: "0.76rem" }}>{product.id} · {product.sku}</p>
                      </td>
                      <td className="py-4 pr-4 text-[#4a4f6a]">{product.channelName}</td>
                      <td className="py-4 pr-4 text-[#1a1d2e]">{product.stock}개</td>
                      <td className="py-4 pr-4 text-[#4a4f6a]">{product.safetyStock}개</td>
                      <td className="py-4 pr-4 text-[#6b7294]">{formatDateTime(product.updatedAt)}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 ${
                            isOut
                              ? "bg-rose-50 text-rose-700"
                              : isLow
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                          }`}
                          style={{ fontSize: "0.74rem", fontWeight: 600 }}
                        >
                          {isOut ? "품절" : isLow ? "보충 필요" : "정상"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="조건에 맞는 재고가 없습니다" description="검색어나 필터를 조정해 다른 재고 항목을 확인하세요." />
        )}
      </div>
    </div>
  );
}
