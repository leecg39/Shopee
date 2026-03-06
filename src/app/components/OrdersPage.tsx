import { ClipboardList, RefreshCw, Globe, Clock, CheckCircle, XCircle, Search, Download, RotateCcw, Package } from "lucide-react";
import { InfoBanner } from "./InfoBanner";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";
import { RegionSelector } from "./RegionSelector";
import { ChevronDown } from "lucide-react";

const statusCards = [
  { icon: Globe, label: "총 주문", value: "0건", sub: "선택 기간내", color: "#3b6cf5", bg: "#f0f4ff" },
  { icon: Clock, label: "진행중", value: "0건", sub: "처리 필요", color: "#f59e0b", bg: "#fffbeb" },
  { icon: CheckCircle, label: "완료", value: "0건", sub: "배송 완료", color: "#10b981", bg: "#ecfdf5" },
  { icon: XCircle, label: "취소", value: "0건", sub: "취소/반품", color: "#ef4444", bg: "#fef2f2" },
];

export function OrdersPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        icon={ClipboardList}
        title="주문 관리"
        description="Shopee 주문을 조회하고 관리하세요"
        actions={
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#3b6cf5] text-white rounded-xl hover:bg-[#2d5ae0] transition-colors shadow-sm" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            <RefreshCw className="w-4 h-4" />
            주문 동기화
          </button>
        }
      />

      <InfoBanner message="주문 데이터는 Shopee 연동 후 조회됩니다. 지금 바로" linkText="연동하기" />

      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center gap-2 text-[#3b6cf5] mb-4" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
          <span className="w-5 h-5 rounded-full bg-[#f0f4ff] flex items-center justify-center text-[0.7rem]">ℹ</span>
          실제 마진 데이터 안내
          <ChevronDown className="w-4 h-4 ml-auto" />
        </div>

        <div className="grid grid-cols-4 gap-4">
          {statusCards.map((card, i) => (
            <div key={i} className="rounded-xl border border-border p-4 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.bg }}>
                  <card.icon className="w-3.5 h-3.5" style={{ color: card.color }} />
                </div>
                <span className="text-[#6b7294]" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{card.label}</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }} className="text-[#1a1d2e]">{card.value}</div>
              <p className="text-[#a0a4b8] mt-0.5" style={{ fontSize: '0.75rem' }}>{card.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#6b7294]" />
            <input
              placeholder="주문번호 입력 (최소 6자)"
              className="px-3 py-2 border border-border rounded-xl bg-[#f8f9fc] w-52"
              style={{ fontSize: '0.85rem' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#6b7294]" style={{ fontSize: '0.8rem' }}>📅 기간:</span>
            <select className="px-3 py-2 border border-border rounded-xl bg-white" style={{ fontSize: '0.85rem' }}>
              <option>최근 1주일</option>
              <option>최근 1개월</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#6b7294]" style={{ fontSize: '0.8rem' }}>상태:</span>
            <select className="px-3 py-2 border border-border rounded-xl bg-white" style={{ fontSize: '0.85rem' }}>
              <option>모든 상태</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#6b7294]" style={{ fontSize: '0.8rem' }}>🌍 지역:</span>
            <select className="px-3 py-2 border border-border rounded-xl bg-white" style={{ fontSize: '0.85rem' }}>
              <option>SG - 싱가포르</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-[#6b7294]" style={{ fontSize: '0.8rem' }}>📄 페이지당:</span>
            <select className="px-3 py-2 border border-border rounded-xl bg-white" style={{ fontSize: '0.85rem' }}>
              <option>100</option>
            </select>
          </div>
          <button className="px-4 py-2 border border-border rounded-xl text-[#4a4f6a] hover:bg-gray-50 transition-colors" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            <RotateCcw className="w-3.5 h-3.5 inline mr-1.5" />
            전체 초기화
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#10b981] text-white rounded-xl hover:bg-[#059669] transition-colors" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            <Download className="w-4 h-4" />
            전체 내보내기
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border">
        <EmptyState
          icon={Package}
          title="주문이 없습니다"
          description='선택한 조건에 맞는 주문이 없습니다. 다른 조건으로 검색하거나 상단의 "주문 동기화" 버튼을 눌러보세요.'
          actionLabel="필터 초기화"
        />
      </div>
    </div>
  );
}
