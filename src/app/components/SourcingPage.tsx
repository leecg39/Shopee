import { Sparkles, Globe, Upload, Star, ShoppingCart, Search, ChevronDown, Link2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { InfoBanner } from "./InfoBanner";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";

const sourcingStats = [
  { icon: Globe, label: "전체 상품", value: "10,177", sub: "소싱 가능 상품", color: "#3b6cf5", bg: "#f0f4ff" },
  { icon: Upload, label: "소싱 사용량", value: "0", sub: "무료 체험: 0개 남음", color: "#10b981", bg: "#ecfdf5" },
  { icon: Star, label: "브랜드", value: "2,217", sub: "등록된 브랜드 수", color: "#f59e0b", bg: "#fffbeb" },
  { icon: ShoppingCart, label: "카테고리", value: "128", sub: "등록된 카테고리 수", color: "#8b5cf6", bg: "#f5f3ff" },
];

export function SourcingPage() {
  const navigate = useNavigate();
  const [guideOpen, setGuideOpen] = useState(true);

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Subscription banner */}
      <div className="bg-gradient-to-r from-[#3b6cf5] to-[#6366f1] rounded-2xl p-5 flex items-center justify-between text-white">
        <div>
          <p style={{ fontWeight: 600 }}>원클릭 AI 대량 소싱 서비스를 사용하기 위해서는 별도의 부가 서비스 구매가 필요합니다.</p>
          <p className="text-blue-100 mt-1" style={{ fontSize: '0.85rem' }}>월간 상품 등록권(100개~500개)을 선택하여 AI 이미지 생성 및 대량 상품 등록 기능을 이용하세요.</p>
        </div>
        <button onClick={() => navigate("/landing#pricing")} className="px-5 py-2.5 bg-white text-[#3b6cf5] rounded-xl hover:bg-blue-50 transition-colors shrink-0" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          소싱 구독 바로가기
        </button>
      </div>

      <InfoBanner message="원클릭 AI 대량 소싱 기능은 Shopee 연동 후 사용 가능합니다. 지금 바로" linkText="연동하기" linkTo="/integration" />

      <PageHeader
        icon={Sparkles}
        title="원클릭 AI 대량 소싱"
        description="소싱 가능 상품 목록에서 상품을 선택하여 연동된 판매채널에 업로드하세요"
      />

      {/* Info accordion */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <button onClick={() => setGuideOpen((current) => !current)} className="flex w-full items-center gap-2 text-[#3b6cf5]" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
          <span className="w-5 h-5 rounded-full bg-[#f0f4ff] flex items-center justify-center text-[0.7rem]">⚠</span>
          대량 소싱 주의사항
          <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${guideOpen ? "" : "-rotate-90"}`} />
        </button>
        {guideOpen ? (
          <p className="mt-3 text-[#6b7294]" style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
            연동된 채널과 상품 등록권이 준비되어 있어야 업로드 대상 상품을 실제 판매채널에 전송할 수 있습니다.
          </p>
        ) : null}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {sourcingStats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md hover:shadow-blue-50 transition-all">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <span className="text-[#6b7294]" style={{ fontSize: '0.85rem', fontWeight: 500 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }} className="text-[#1a1d2e]">{s.value}</div>
            <p className="text-[#a0a4b8] mt-1" style={{ fontSize: '0.8rem' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#a0a4b8]" />
            <input
              placeholder="상품명 검색 - 영문/한글 (최소 2글자)"
              className="w-full px-3 py-2 border border-border rounded-xl bg-[#f8f9fc]"
              style={{ fontSize: '0.85rem' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#6b7294]" style={{ fontSize: '0.8rem' }}>🏷 브랜드:</span>
            <select className="px-3 py-2 border border-border rounded-xl bg-white" style={{ fontSize: '0.85rem' }}>
              <option>전체 브랜드</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#6b7294]" style={{ fontSize: '0.8rem' }}>📂 카테고리:</span>
            <select className="px-3 py-2 border border-border rounded-xl bg-white" style={{ fontSize: '0.85rem' }}>
              <option>전체 카테고리</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#6b7294]" style={{ fontSize: '0.8rem' }}>📊 정렬:</span>
            <select className="px-3 py-2 border border-border rounded-xl bg-white" style={{ fontSize: '0.85rem' }}>
              <option>정렬 안함</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <label className="flex items-center gap-2 text-[#4a4f6a] cursor-pointer" style={{ fontSize: '0.85rem' }}>
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-[#3b6cf5]" />
            판매채널 제재 이력 상품 제외
          </label>
          <label className="flex items-center gap-2 text-[#4a4f6a] cursor-pointer" style={{ fontSize: '0.85rem' }}>
            <input type="checkbox" className="w-4 h-4 rounded accent-[#3b6cf5]" />
            이미 소싱한 제품 제외
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border">
        <EmptyState
          icon={Link2}
          title="Shopee 연동이 필요합니다"
          description="원클릭 AI 대량 소싱 기능을 사용하려면 먼저 Shopee 계정을 연동해주세요."
          actionLabel="Shopee 연동하러 가기"
          onAction={() => navigate("/integration")}
        />
      </div>
    </div>
  );
}
