import { DollarSign, Upload, RefreshCw, Search, ChevronDown, Package } from "lucide-react";
import { InfoBanner } from "./InfoBanner";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";

export function CostPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        icon={DollarSign}
        title="상품 매입가"
        description="글로벌 상품의 매입가를 관리하세요"
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-[#4a4f6a] hover:bg-gray-50 transition-colors bg-white" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              <Upload className="w-4 h-4" />
              매입가 대량 업로드
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#3b6cf5] text-white rounded-xl hover:bg-[#2d5ae0] transition-colors shadow-sm" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              <RefreshCw className="w-4 h-4" />
              글로벌 상품 동기화
            </button>
          </div>
        }
      />

      <InfoBanner message="일부 목록은 표시되지만, 전체 동기화/마진 계산 등 주요 기능을 사용하려면 Shopee 연동이 필요합니다." linkText="연동하러 가기" />

      {/* Info accordion */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center gap-2 text-[#3b6cf5]" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
          <span className="w-5 h-5 rounded-full bg-[#f0f4ff] flex items-center justify-center text-[0.7rem]">ℹ</span>
          옵션 상품 매입가 입력 방법
          <ChevronDown className="w-4 h-4 ml-auto" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[#6b7294]" style={{ fontSize: '0.8rem' }}>🔍 검색:</span>
            <input
              placeholder="상품명으로 검색..."
              className="px-3 py-2 border border-border rounded-xl bg-[#f8f9fc] w-56"
              style={{ fontSize: '0.85rem' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#6b7294]" style={{ fontSize: '0.8rem' }}>🔥 매입가 상태:</span>
            <select className="px-3 py-2 border border-border rounded-xl bg-white" style={{ fontSize: '0.85rem' }}>
              <option>전체 상품</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#6b7294]" style={{ fontSize: '0.8rem' }}>📊 정렬:</span>
            <select className="px-3 py-2 border border-border rounded-xl bg-white" style={{ fontSize: '0.85rem' }}>
              <option>상품 ID</option>
            </select>
          </div>
          <select className="px-3 py-2 border border-border rounded-xl bg-white" style={{ fontSize: '0.85rem' }}>
            <option>내림차순 ↓</option>
          </select>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[#6b7294]" style={{ fontSize: '0.8rem' }}>📄 표시:</span>
          <select className="px-3 py-2 border border-border rounded-xl bg-white" style={{ fontSize: '0.85rem' }}>
            <option>100</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border">
        <EmptyState
          icon={Package}
          title="글로벌 상품이 없습니다"
          description="아직 글로벌 상품 데이터가 없습니다. 글로벌 상품 동기화를 실행해보세요."
          actionLabel="글로벌 상품 동기화"
        />
      </div>
    </div>
  );
}
