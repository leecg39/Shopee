import { Tag, RefreshCw, ChevronDown, Upload, AlertTriangle, Clock, FileSpreadsheet } from "lucide-react";
import { InfoBanner } from "./InfoBanner";
import { PageHeader } from "./PageHeader";
import { RegionSelector } from "./RegionSelector";
import { EmptyState } from "./EmptyState";
import { useState } from "react";

export function CampaignPage() {
  const [minMargin, setMinMargin] = useState("10");

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        icon={Tag}
        title="캠페인 가격 최적화"
        description="Shopee 캠페인 파일을 분석하고 최적화된 가격을 제안받으세요"
        actions={
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-[#4a4f6a] hover:bg-gray-50 transition-colors bg-white" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
        }
      />

      <InfoBanner message="캠페인 가격 최적화는 Shopee 연동 후 사용 가능합니다. 지금 바로" linkText="연동하기" />

      {/* Info accordion */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center gap-2 text-[#3b6cf5]" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
          <span className="w-5 h-5 rounded-full bg-[#f0f4ff] flex items-center justify-center text-[0.7rem]">ℹ</span>
          목표 마진율 계산 방식 안내
          <ChevronDown className="w-4 h-4 ml-auto" />
        </div>
      </div>

      {/* Region */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <RegionSelector />
        <p className="mt-3 text-[#6b7294]" style={{ fontSize: '0.8rem' }}>현재 선택된 지역: 🇸🇬 SG 싱가포르</p>
      </div>

      {/* Upload section */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="flex items-center gap-2 mb-5">
          <Upload className="w-5 h-5 text-[#3b6cf5]" />
          캠페인 파일 업로드
        </h3>

        <div className="grid grid-cols-2 gap-6 mb-5">
          <div>
            <label className="text-[#6b7294] flex items-center gap-1.5 mb-1.5" style={{ fontSize: '0.8rem' }}>
              ⚙️ 목표 설정
            </label>
            <select className="w-full px-3 py-2.5 border border-border rounded-xl bg-white" style={{ fontSize: '0.85rem' }}>
              <option>최소 마진율</option>
            </select>
            <p className="text-[#a0a4b8] mt-1" style={{ fontSize: '0.75rem' }}>
              최소 마진을 이상 근접하는 캠페인 추천가만 필터링합니다.
            </p>
          </div>
          <div>
            <label className="text-[#6b7294] flex items-center gap-1.5 mb-1.5" style={{ fontSize: '0.8rem' }}>
              ⊕ 최소 마진율
            </label>
            <div className="flex items-center gap-2">
              <input
                value={minMargin}
                onChange={(e) => setMinMargin(e.target.value)}
                className="w-24 px-3 py-2.5 border border-border rounded-xl bg-[#f8f9fc]"
                style={{ fontSize: '0.9rem' }}
              />
              <span className="text-[#6b7294]" style={{ fontSize: '0.85rem' }}>% (기본값: 10%)</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 mb-5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-amber-700" style={{ fontSize: '0.8rem' }}>주의: 선택된 지역(SG)과 다른 캠페인 파일을 업로드하면 계산이 정확하지 않을 수 있습니다.</span>
        </div>

        {/* Drag & Drop Zone */}
        <div className="border-2 border-dashed border-[#d1d9f0] rounded-2xl p-12 flex flex-col items-center justify-center bg-[#fafbff] hover:border-[#3b6cf5] hover:bg-[#f5f8ff] transition-all cursor-pointer">
          <div className="w-16 h-16 bg-[#f0f4ff] rounded-2xl flex items-center justify-center mb-4">
            <FileSpreadsheet className="w-8 h-8 text-[#a0b4f5]" />
          </div>
          <p className="text-[#1a1d2e]" style={{ fontSize: '0.9rem', fontWeight: 600 }}>캠페인 XLSX 파일을 여기에 드래그하세요</p>
          <p className="text-[#6b7294] mt-1" style={{ fontSize: '0.8rem' }}>또는 클릭하여 파일 선택</p>
          <div className="text-[#a0a4b8] mt-3 space-y-0.5 text-center" style={{ fontSize: '0.75rem' }}>
            <p>· 지원 형식: XLSX, XLS 파일만</p>
            <p>· 최대 크기: 10MB 이하</p>
          </div>
        </div>

        <div className="flex justify-center mt-5">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#3b6cf5] text-white rounded-xl hover:bg-[#2d5ae0] transition-colors shadow-sm" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            <Upload className="w-4 h-4" />
            파일 선택하여 업로드
          </button>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="flex items-center gap-2 mb-5">
          <Clock className="w-5 h-5 text-[#3b6cf5]" />
          캠페인 계산 히스토리
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr className="border-b border-border">
                {["ID", "분석 일시", "목표 설정", "마진율", "총 상품수", "적용", "제외", "다운로드", "액션"].map(h => (
                  <th key={h} className="py-3 px-3 text-left text-[#6b7294]" style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
        <EmptyState
          icon={Clock}
          title="캠페인 분석 히스토리가 없습니다"
          description="위에서 캠페인 파일을 업로드해보세요"
        />
      </div>
    </div>
  );
}
