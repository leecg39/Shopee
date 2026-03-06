import { Percent, RefreshCw, Sparkles, ChevronDown, Tag, Clock, Calculator } from "lucide-react";
import { InfoBanner } from "./InfoBanner";
import { PageHeader } from "./PageHeader";
import { RegionSelector } from "./RegionSelector";
import { EmptyState } from "./EmptyState";
import { useState } from "react";

export function DiscountsPage() {
  const [margin, setMargin] = useState("15");

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        icon={Percent}
        title="대량 할인 관리"
        description="지역별 상품 할인을 계산하고 적용하세요"
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-[#4a4f6a] hover:bg-gray-50 transition-colors bg-white" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#3b6cf5] to-[#6366f1] text-white rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              <Sparkles className="w-4 h-4" />
              전체 상점 일괄 적용
            </button>
          </div>
        }
      />

      <InfoBanner message="대량 할인 기능은 Shopee 연동 후 사용 가능합니다. 지금 바로" linkText="연동하기" />

      {/* Info accordion */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center gap-2 text-[#3b6cf5]" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
          <span className="w-5 h-5 rounded-full bg-[#f0f4ff] flex items-center justify-center text-[0.7rem]">ℹ</span>
          목표 마진율 계산 방식 안내
          <ChevronDown className="w-4 h-4 ml-auto" />
        </div>
      </div>

      {/* Region */}
      <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
        <RegionSelector />
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <span className="text-[0.7rem]">🇸🇬</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }} className="text-[#1a1d2e]">SG 싱가포르</span>
        </div>
        <p className="text-[#6b7294]" style={{ fontSize: '0.8rem' }}>이 지역의 할인 프로모션을 관리합니다</p>
      </div>

      {/* Active promotions */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-[#3b6cf5]" />
          현재 활성 프로모션
        </h3>
        <EmptyState
          icon={Tag}
          title="현재 활성화된 할인 프로모션이 없습니다"
        />
      </div>

      {/* Discount calculator */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="flex items-center gap-2 mb-5">
          <Calculator className="w-5 h-5 text-[#3b6cf5]" />
          할인가 계산
        </h3>
        <div className="flex items-center gap-4">
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
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#3b6cf5] text-white rounded-xl hover:bg-[#2d5ae0] transition-colors shadow-sm" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              <Calculator className="w-4 h-4" />
              할인가 계산
            </button>
          </div>
        </div>
      </div>

      {/* Calculation history */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="flex items-center gap-2 mb-5">
          <Clock className="w-5 h-5 text-[#3b6cf5]" />
          계산 히스토리
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr className="border-b border-border">
                {["ID", "계산 일시", "목표 마진율", "전체 상품수", "최적 할인가 적용", "최적 할인가 미적용", "적용 유무", "액션"].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-[#6b7294]" style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
        <EmptyState
          icon={Clock}
          title="계산 히스토리가 없습니다"
          description="위에서 할인가를 계산해보세요"
        />
      </div>
    </div>
  );
}
