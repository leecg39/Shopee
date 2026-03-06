import { TrendingUp, Globe, Calculator, TrendingDown, BarChart3, Zap, RefreshCw, Search, Download, ChevronDown, Package } from "lucide-react";
import { InfoBanner } from "./InfoBanner";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";

const marginStats = [
  { icon: Globe, label: "전체 상품수", value: "0", sub: "등록된 전체 상품", color: "#3b6cf5", bg: "#f0f4ff" },
  { icon: Calculator, label: "마진 계산된 상품 수", value: "0", sub: "전체 0개 중 0개 계산완료 (0%)", color: "#10b981", bg: "#ecfdf5" },
  { icon: TrendingDown, label: "마진 손실 상품수", value: "0", sub: "계산된 상품 중 0%가 손실", color: "#ef4444", bg: "#fef2f2" },
  { icon: BarChart3, label: "평균 마진율", value: "0.0%", sub: "마진 계산된 상품수의 평균 마진율", color: "#8b5cf6", bg: "#f5f3ff" },
  { icon: Zap, label: "부스트 설정", value: "0개", sub: "🇸🇬 SG  0/5", color: "#f59e0b", bg: "#fffbeb" },
];

export function MarginsPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <PageHeader icon={TrendingUp} title="상품 마진" />

      <InfoBanner message="마진 데이터는 Shopee 연동 후 조회됩니다. 지금 바로" linkText="연동하기" />

      {/* Info accordion */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center gap-2 text-[#3b6cf5]" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
          <span className="w-5 h-5 rounded-full bg-[#f0f4ff] flex items-center justify-center text-[0.7rem]">ℹ</span>
          마진 계산 방식 안내
          <ChevronDown className="w-4 h-4 ml-auto" />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {marginStats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md hover:shadow-blue-50 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              </div>
              <span className="text-[#6b7294]" style={{ fontSize: '0.78rem', fontWeight: 500 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }} className="text-[#1a1d2e]">{s.value}</div>
            <p className="text-[#a0a4b8] mt-1" style={{ fontSize: '0.72rem' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filtering */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="mb-4">필터링 및 관리</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="text-[#6b7294] block mb-1" style={{ fontSize: '0.78rem' }}>상품 검색</label>
            <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-xl bg-[#f8f9fc] w-56">
              <Search className="w-4 h-4 text-[#a0a4b8]" />
              <input placeholder="상품명, 상품ID 검색..." className="bg-transparent w-full outline-none" style={{ fontSize: '0.85rem' }} />
            </div>
          </div>
          <div>
            <label className="text-[#6b7294] block mb-1" style={{ fontSize: '0.78rem' }}>지역</label>
            <select className="px-3 py-2 border border-border rounded-xl bg-white" style={{ fontSize: '0.85rem' }}>
              <option>🇸🇬 SG (미연동)</option>
            </select>
          </div>
          <div>
            <label className="text-[#6b7294] block mb-1" style={{ fontSize: '0.78rem' }}>마진율 필터</label>
            <select className="px-3 py-2 border border-border rounded-xl bg-white" style={{ fontSize: '0.85rem' }}>
              <option>전체</option>
            </select>
          </div>
          <div>
            <label className="text-[#6b7294] block mb-1" style={{ fontSize: '0.78rem' }}>정렬 기준</label>
            <select className="px-3 py-2 border border-border rounded-xl bg-white" style={{ fontSize: '0.85rem' }}>
              <option>마진율</option>
            </select>
          </div>
          <div>
            <label className="text-[#6b7294] block mb-1" style={{ fontSize: '0.78rem' }}>정렬 순서</label>
            <select className="px-3 py-2 border border-border rounded-xl bg-white" style={{ fontSize: '0.85rem' }}>
              <option>높은순</option>
            </select>
          </div>
          <div className="self-end">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#3b6cf5] text-white rounded-xl hover:bg-[#2d5ae0] transition-colors shadow-sm" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              <RefreshCw className="w-4 h-4" />
              상품 동기화
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#3b6cf5] text-[#3b6cf5] rounded-xl hover:bg-[#f0f4ff] transition-colors" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            <Zap className="w-4 h-4" />
            부스트 설정
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-[#4a4f6a] hover:bg-gray-50 transition-colors" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            <Download className="w-4 h-4" />
            전체 다운로드
          </button>
        </div>
      </div>

      {/* Product list */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3>상품 마진 목록</h3>
          <label className="flex items-center gap-2 text-[#6b7294] cursor-pointer" style={{ fontSize: '0.85rem' }}>
            <input type="checkbox" className="w-4 h-4 rounded border-border" />
            품절 상품만 표시
          </label>
        </div>
        <EmptyState
          icon={Package}
          title="필터 조건에 맞는 상품이 없습니다"
          description="다른 필터 조건을 사용해보세요."
          actionLabel="필터 초기화"
        />
      </div>
    </div>
  );
}
