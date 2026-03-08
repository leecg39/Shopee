import { Percent, RefreshCw, Sparkles, ChevronDown, Tag, Clock, Calculator } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { InfoBanner } from "./InfoBanner";
import { PageHeader } from "./PageHeader";
import { RegionSelector, regions } from "./RegionSelector";
import { EmptyState } from "./EmptyState";
import { useDemoData } from "../state/demo-store";
import { formatCurrency, formatDateTime, formatPercent } from "../lib/format";

type DiscountHistoryItem = {
  id: string;
  calculatedAt: string;
  regionCode: string;
  targetMargin: number;
  totalProducts: number;
  optimizedCount: number;
  skippedCount: number;
  applied: boolean;
  recommendedPrice: number | null;
};

function buildDiscountId() {
  return `DISC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function DiscountsPage() {
  const navigate = useNavigate();
  const { products } = useDemoData();
  const [margin, setMargin] = useState("15");
  const [selectedRegion, setSelectedRegion] = useState("SG");
  const [guideOpen, setGuideOpen] = useState(true);
  const [history, setHistory] = useState<DiscountHistoryItem[]>([]);

  const selectedRegionMeta = regions.find((region) => region.code === selectedRegion) ?? regions[0];
  const latestCalculation = history[0] ?? null;
  const activePromotions = history.filter((item) => item.applied);

  const calculateDiscount = () => {
    const targetMargin = Number(margin);

    if (!Number.isFinite(targetMargin) || targetMargin <= 0) {
      return;
    }

    const eligibleProducts = products.filter((product) => product.cost !== null);
    const optimizedCount = eligibleProducts.filter((product) => {
      const targetRate = 1 - product.feeRate - targetMargin / 100;

      if (targetRate <= 0) {
        return false;
      }

      const recommendedPrice = Math.ceil((product.cost ?? 0) / targetRate);
      return recommendedPrice < product.price;
    }).length;

    const sampleProduct = eligibleProducts.find((product) => {
      const targetRate = 1 - product.feeRate - targetMargin / 100;
      return targetRate > 0;
    });

    const recommendedPrice = sampleProduct
      ? Math.ceil((sampleProduct.cost ?? 0) / (1 - sampleProduct.feeRate - targetMargin / 100))
      : null;

    const nextItem: DiscountHistoryItem = {
      id: buildDiscountId(),
      calculatedAt: new Date().toISOString(),
      regionCode: selectedRegion,
      targetMargin,
      totalProducts: eligibleProducts.length,
      optimizedCount,
      skippedCount: Math.max(eligibleProducts.length - optimizedCount, 0),
      applied: false,
      recommendedPrice,
    };

    setHistory((current) => [nextItem, ...current]);
  };

  const applyHistory = (historyId: string) => {
    setHistory((current) =>
      current.map((item) => ({
        ...item,
        applied: item.id === historyId,
      })),
    );
  };

  const resetPage = () => {
    setMargin("15");
    setSelectedRegion("SG");
    setGuideOpen(true);
    setHistory([]);
  };

  const latestSummary = useMemo(() => {
    if (!latestCalculation) {
      return null;
    }

    return `${latestCalculation.regionCode} 기준 ${latestCalculation.totalProducts}개 상품 계산 완료 · 추천 할인 ${latestCalculation.optimizedCount}개`;
  }, [latestCalculation]);

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        icon={Percent}
        title="대량 할인 관리"
        description="지역별 상품 할인을 계산하고 적용하세요"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={resetPage} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-[#4a4f6a] hover:bg-gray-50 transition-colors bg-white" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
            <button onClick={() => latestCalculation && applyHistory(latestCalculation.id)} disabled={!latestCalculation} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#3b6cf5] to-[#6366f1] text-white rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all disabled:cursor-not-allowed disabled:opacity-60" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              <Sparkles className="w-4 h-4" />
              전체 상점 일괄 적용
            </button>
          </div>
        }
      />

      <InfoBanner message="대량 할인 기능은 Shopee 연동 후 사용 가능합니다. 지금 바로" linkText="연동하기" linkTo="/integration" />

      <div className="bg-white rounded-2xl border border-border p-5">
        <button onClick={() => setGuideOpen((current) => !current)} className="flex w-full items-center gap-2 text-[#3b6cf5]" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
          <span className="w-5 h-5 rounded-full bg-[#f0f4ff] flex items-center justify-center text-[0.7rem]">ℹ</span>
          목표 마진율 계산 방식 안내
          <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${guideOpen ? "" : "-rotate-90"}`} />
        </button>
        {guideOpen ? (
          <p className="mt-3 text-[#6b7294]" style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
            목표 마진율과 수수료를 반영해 추천 할인가를 계산하고, 현재 판매가보다 낮아지는 상품만 할인 후보로 분류합니다.
          </p>
        ) : null}
      </div>

      <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
        <RegionSelector value={selectedRegion} onChange={setSelectedRegion} />
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <span className="text-[0.7rem]">{selectedRegionMeta.flag}</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }} className="text-[#1a1d2e]">{selectedRegionMeta.code} {selectedRegionMeta.name}</span>
        </div>
        <p className="text-[#6b7294]" style={{ fontSize: '0.8rem' }}>이 지역의 할인 프로모션을 관리합니다</p>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-[#3b6cf5]" />
          현재 활성 프로모션
        </h3>
        {activePromotions.length > 0 ? (
          <div className="space-y-3">
            {activePromotions.map((promotion) => (
              <div key={promotion.id} className="rounded-xl border border-border bg-[#fafbff] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[#1a1d2e]" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{promotion.id}</p>
                    <p className="mt-1 text-[#6b7294]" style={{ fontSize: '0.8rem' }}>
                      {promotion.regionCode} · 목표 마진율 {formatPercent(promotion.targetMargin, 0)} · 추천 할인 {promotion.optimizedCount}개
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700" style={{ fontSize: '0.75rem', fontWeight: 600 }}>적용 완료</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Tag}
            title="현재 활성화된 할인 프로모션이 없습니다"
            description="할인가를 계산한 뒤 전체 상점 일괄 적용 버튼으로 프로모션을 활성화하세요."
          />
        )}
      </div>

      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="flex items-center gap-2 mb-5">
          <Calculator className="w-5 h-5 text-[#3b6cf5]" />
          할인가 계산
        </h3>
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="text-[#6b7294] block mb-1.5" style={{ fontSize: '0.8rem' }}>목표 마진율</label>
            <div className="flex items-center gap-2">
              <input
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-[#f8f9fc]"
                style={{ fontSize: '0.9rem' }}
              />
              <span className="text-[#6b7294]" style={{ fontSize: '0.9rem' }}>%</span>
            </div>
          </div>
          <div className="self-end">
            <button onClick={calculateDiscount} className="flex items-center gap-2 px-5 py-2.5 bg-[#3b6cf5] text-white rounded-xl hover:bg-[#2d5ae0] transition-colors shadow-sm" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              <Calculator className="w-4 h-4" />
              할인가 계산
            </button>
          </div>
        </div>
        {latestSummary ? (
          <p className="mt-4 text-[#6b7294]" style={{ fontSize: '0.8rem' }}>{latestSummary}</p>
        ) : null}
      </div>

      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="flex items-center gap-2 mb-5">
          <Clock className="w-5 h-5 text-[#3b6cf5]" />
          계산 히스토리
        </h3>
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr className="border-b border-border">
                  {['ID', '계산 일시', '지역', '목표 마진율', '전체 상품수', '추천 할인', '미적용', '적용 유무', '액션'].map((header) => (
                    <th key={header} className="py-3 px-4 text-left text-[#6b7294]" style={{ fontWeight: 500 }}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-border/70 last:border-b-0">
                    <td className="py-3 px-4 text-[#1a1d2e]" style={{ fontWeight: 600 }}>{item.id}</td>
                    <td className="py-3 px-4 text-[#6b7294]">{formatDateTime(item.calculatedAt)}</td>
                    <td className="py-3 px-4 text-[#4a4f6a]">{item.regionCode}</td>
                    <td className="py-3 px-4 text-[#4a4f6a]">{formatPercent(item.targetMargin, 0)}</td>
                    <td className="py-3 px-4 text-[#4a4f6a]">{item.totalProducts}</td>
                    <td className="py-3 px-4 text-[#4a4f6a]">{item.optimizedCount}</td>
                    <td className="py-3 px-4 text-[#4a4f6a]">{item.skippedCount}</td>
                    <td className="py-3 px-4">
                      <span className={`rounded-full px-2.5 py-1 ${item.applied ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`} style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                        {item.applied ? '적용 완료' : '대기'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => applyHistory(item.id)} className="rounded-lg border border-[#3b6cf5] px-3 py-1.5 text-[#3b6cf5] hover:bg-[#f0f4ff] transition-colors" style={{ fontSize: '0.76rem', fontWeight: 600 }}>
                        {item.applied ? '다시 적용' : '적용'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Clock}
            title="계산 히스토리가 없습니다"
            description="위에서 할인가를 계산해보세요"
            actionLabel="Shopee 연동하러 가기"
            onAction={() => navigate('/integration')}
          />
        )}
      </div>
    </div>
  );
}
