import { Tag, RefreshCw, ChevronDown, Upload, AlertTriangle, Clock, FileSpreadsheet, Download } from "lucide-react";
import { useMemo, useRef, useState, type DragEvent } from "react";
import { useNavigate } from "react-router";
import { InfoBanner } from "./InfoBanner";
import { PageHeader } from "./PageHeader";
import { RegionSelector, regions } from "./RegionSelector";
import { EmptyState } from "./EmptyState";
import { useDemoData } from "../state/demo-store";
import { formatDateTime, formatPercent } from "../lib/format";

type CampaignHistoryItem = {
  id: string;
  analyzedAt: string;
  regionCode: string;
  goal: string;
  marginRate: number;
  totalProducts: number;
  appliedCount: number;
  excludedCount: number;
  fileName: string;
};

function buildCampaignId() {
  return `CMP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function downloadCampaignSummary(item: CampaignHistoryItem) {
  const csv = [
    "분석ID,파일명,지역,목표설정,마진율,총 상품수,적용,제외,분석 일시",
    [
      item.id,
      item.fileName,
      item.regionCode,
      item.goal,
      formatPercent(item.marginRate, 0),
      item.totalProducts,
      item.appliedCount,
      item.excludedCount,
      item.analyzedAt,
    ].join(","),
  ].join("\n");

  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${item.id}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function CampaignPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { products } = useDemoData();
  const [minMargin, setMinMargin] = useState("10");
  const [selectedRegion, setSelectedRegion] = useState("SG");
  const [guideOpen, setGuideOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [history, setHistory] = useState<CampaignHistoryItem[]>([]);

  const selectedRegionMeta = regions.find((region) => region.code === selectedRegion) ?? regions[0];
  const latestHistory = history[0] ?? null;

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFile = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const nextFile = event.dataTransfer.files[0] ?? null;
    handleFile(nextFile);
  };

  const analyzeFile = () => {
    if (!selectedFile) {
      triggerFileSelect();
      return;
    }

    const marginRate = Number(minMargin);

    if (!Number.isFinite(marginRate) || marginRate <= 0) {
      return;
    }

    const totalProducts = products.length;
    const applicableProducts = products.filter((product) => product.cost !== null).length;
    const appliedCount = Math.min(applicableProducts, Math.max(Math.round(applicableProducts * 0.7), 0));
    const excludedCount = Math.max(totalProducts - appliedCount, 0);

    const nextItem: CampaignHistoryItem = {
      id: buildCampaignId(),
      analyzedAt: new Date().toISOString(),
      regionCode: selectedRegion,
      goal: "최소 마진율",
      marginRate,
      totalProducts,
      appliedCount,
      excludedCount,
      fileName: selectedFile.name,
    };

    setHistory((current) => [nextItem, ...current]);
    setSelectedFile(null);
  };

  const resetPage = () => {
    setMinMargin("10");
    setSelectedRegion("SG");
    setGuideOpen(true);
    setSelectedFile(null);
    setHistory([]);
  };

  const latestSummary = useMemo(() => {
    if (!latestHistory) {
      return null;
    }

    return `${latestHistory.fileName} 분석 완료 · 적용 ${latestHistory.appliedCount}개 · 제외 ${latestHistory.excludedCount}개`;
  }, [latestHistory]);

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        icon={Tag}
        title="캠페인 가격 최적화"
        description="프로모션 캠페인 파일을 분석하고 최적화된 가격을 제안받으세요"
        actions={
          <button onClick={resetPage} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-[#4a4f6a] hover:bg-gray-50 transition-colors bg-white" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
        }
      />

      <InfoBanner message="캠페인 가격 최적화는 판매채널 연동 후 사용 가능합니다. 지금 바로" linkText="연동하기" linkTo="/integration" />

      <div className="bg-white rounded-2xl border border-border p-5">
        <button onClick={() => setGuideOpen((current) => !current)} className="flex w-full items-center gap-2 text-[#3b6cf5]" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
          <span className="w-5 h-5 rounded-full bg-[#f0f4ff] flex items-center justify-center text-[0.7rem]">ℹ</span>
          목표 마진율 계산 방식 안내
          <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${guideOpen ? "" : "-rotate-90"}`} />
        </button>
        {guideOpen ? (
          <p className="mt-3 text-[#6b7294]" style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
            업로드한 캠페인 파일을 기준으로 최소 마진율을 만족하는 추천가 후보를 계산하고, 제외 대상도 함께 분류합니다.
          </p>
        ) : null}
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <RegionSelector value={selectedRegion} onChange={setSelectedRegion} />
        <p className="mt-3 text-[#6b7294]" style={{ fontSize: '0.8rem' }}>현재 선택된 지역: {selectedRegionMeta.flag} {selectedRegionMeta.code} {selectedRegionMeta.name}</p>
      </div>

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
          <span className="text-amber-700" style={{ fontSize: '0.8rem' }}>주의: 선택된 지역({selectedRegionMeta.code})과 다른 캠페인 파일을 업로드하면 계산이 정확하지 않을 수 있습니다.</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xls,.xlsx"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        />

        <div
          onClick={triggerFileSelect}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[#d1d9f0] rounded-2xl p-12 flex flex-col items-center justify-center bg-[#fafbff] hover:border-[#3b6cf5] hover:bg-[#f5f8ff] transition-all cursor-pointer"
        >
          <div className="w-16 h-16 bg-[#f0f4ff] rounded-2xl flex items-center justify-center mb-4">
            <FileSpreadsheet className="w-8 h-8 text-[#a0b4f5]" />
          </div>
          <p className="text-[#1a1d2e]" style={{ fontSize: '0.9rem', fontWeight: 600 }}>캠페인 XLSX 파일을 여기에 드래그하세요</p>
          <p className="text-[#6b7294] mt-1" style={{ fontSize: '0.8rem' }}>또는 클릭하여 파일 선택</p>
          <div className="text-[#a0a4b8] mt-3 space-y-0.5 text-center" style={{ fontSize: '0.75rem' }}>
            <p>· 지원 형식: XLSX, XLS 파일만</p>
            <p>· 최대 크기: 10MB 이하</p>
            {selectedFile ? <p>· 선택 파일: {selectedFile.name}</p> : null}
          </div>
        </div>

        <div className="flex justify-center mt-5">
          <button onClick={analyzeFile} className="flex items-center gap-2 px-6 py-2.5 bg-[#3b6cf5] text-white rounded-xl hover:bg-[#2d5ae0] transition-colors shadow-sm" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            <Upload className="w-4 h-4" />
            {selectedFile ? '업로드 및 분석 실행' : '파일 선택하여 업로드'}
          </button>
        </div>
        {latestSummary ? <p className="mt-4 text-center text-[#6b7294]" style={{ fontSize: '0.8rem' }}>{latestSummary}</p> : null}
      </div>

      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="flex items-center gap-2 mb-5">
          <Clock className="w-5 h-5 text-[#3b6cf5]" />
          캠페인 계산 히스토리
        </h3>
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr className="border-b border-border">
                  {['ID', '분석 일시', '파일명', '목표 설정', '마진율', '총 상품수', '적용', '제외', '다운로드'].map((header) => (
                    <th key={header} className="py-3 px-3 text-left text-[#6b7294]" style={{ fontWeight: 500 }}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-border/70 last:border-b-0">
                    <td className="py-3 px-3 text-[#1a1d2e]" style={{ fontWeight: 600 }}>{item.id}</td>
                    <td className="py-3 px-3 text-[#6b7294]">{formatDateTime(item.analyzedAt)}</td>
                    <td className="py-3 px-3 text-[#4a4f6a]">{item.fileName}</td>
                    <td className="py-3 px-3 text-[#4a4f6a]">{item.goal}</td>
                    <td className="py-3 px-3 text-[#4a4f6a]">{formatPercent(item.marginRate, 0)}</td>
                    <td className="py-3 px-3 text-[#4a4f6a]">{item.totalProducts}</td>
                    <td className="py-3 px-3 text-[#4a4f6a]">{item.appliedCount}</td>
                    <td className="py-3 px-3 text-[#4a4f6a]">{item.excludedCount}</td>
                    <td className="py-3 px-3">
                      <button onClick={() => downloadCampaignSummary(item)} className="inline-flex items-center gap-1 rounded-lg border border-[#3b6cf5] px-3 py-1.5 text-[#3b6cf5] hover:bg-[#f0f4ff] transition-colors" style={{ fontSize: '0.76rem', fontWeight: 600 }}>
                        <Download className="w-3.5 h-3.5" />
                        다운로드
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
            title="캠페인 분석 히스토리가 없습니다"
            description="위에서 캠페인 파일을 업로드해보세요"
            actionLabel="채널 연동하러 가기"
            onAction={() => navigate('/integration')}
          />
        )}
      </div>
    </div>
  );
}
