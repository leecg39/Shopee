import { Camera, FileText, ImagePlus, Save, Send, Store, Tags } from "lucide-react";
import { useMemo, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { EmptyState } from "./EmptyState";
import { InfoBanner } from "./InfoBanner";
import { PageHeader } from "./PageHeader";
import { formatCurrency, formatDateTime } from "../lib/format";
import { type ListingInput, type SourceType, useDemoData } from "../state/demo-store";

const sourceTypeLabel: Record<SourceType, string> = {
  offline: "오프라인 사입",
  online: "온라인 발주",
};

function createEmptyForm(): ListingInput {
  return {
    title: "",
    sku: "",
    brand: "",
    sourceType: "offline",
    sourceLabel: "",
    detail: "",
    imageNames: [],
    price: 0,
    cost: 0,
  };
}

export function ProductRegistrationPage() {
  const navigate = useNavigate();
  const { listings, saveListingDraft, saveAndPublishListing, publishListing } = useDemoData();
  const [form, setForm] = useState<ListingInput>(createEmptyForm());

  const draftCount = listings.filter((listing) => listing.status === "draft").length;
  const publishedCount = listings.filter((listing) => listing.status === "published").length;
  const totalPhotoCount = listings.reduce((sum, listing) => sum + listing.imageNames.length, 0) + form.imageNames.length;

  const canPublish = useMemo(
    () =>
      form.title.trim().length > 0 &&
      form.sku.trim().length > 0 &&
      form.sourceLabel.trim().length > 0 &&
      form.detail.trim().length > 0 &&
      form.imageNames.length > 0 &&
      form.price > 0 &&
      form.cost > 0,
    [form],
  );

  const resetForm = () => {
    setForm(createEmptyForm());
  };

  const updateField = <Key extends keyof ListingInput>(key: Key, value: ListingInput[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);
    updateField("imageNames", nextFiles.map((file) => file.name));
  };

  const handleSaveDraft = async () => {
    await saveListingDraft(form);
    resetForm();
  };

  const handleSaveAndPublish = async () => {
    if (!canPublish) {
      return;
    }

    await saveAndPublishListing(form);
    resetForm();
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 md:p-6">
      <PageHeader
        icon={Camera}
        title="상품 등록"
        description="올리브영 촬영본과 상세페이지 초안을 저장하고 Save & Publish 흐름으로 쇼피 판매를 시작합니다"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => void handleSaveDraft()}
              className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-[#4a4f6a] transition-colors hover:bg-gray-50"
              style={{ fontSize: "0.85rem", fontWeight: 500 }}
            >
              <Save className="h-4 w-4" />
              임시 저장
            </button>
            <button
              onClick={() => void handleSaveAndPublish()}
              disabled={!canPublish}
              className="flex items-center gap-2 rounded-xl bg-[#ee4d2d] px-4 py-2.5 text-white transition-colors hover:bg-[#d94324] disabled:cursor-not-allowed disabled:bg-[#f6b0a2]"
              style={{ fontSize: "0.85rem", fontWeight: 600 }}
            >
              <Send className="h-4 w-4" />
              Save & Publish
            </button>
          </div>
        }
      />

      <InfoBanner
        message="이미지 기준 우선 흐름은 매장 촬영 -> 상품 등록 -> Save & Publish -> 주문 처리입니다. 등록이 끝나면 바로 주문 화면에서 후속 작업을 이어갈 수 있습니다."
        linkText="주문 처리로 이동"
        onLinkClick={() => navigate("/orders")}
        type="info"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-[#3b6cf5]">
            <FileText className="h-5 w-5" />
            <span style={{ fontWeight: 600 }}>임시 저장</span>
          </div>
          <div className="text-[#1a1d2e]" style={{ fontSize: "1.8rem", fontWeight: 700 }}>{draftCount}건</div>
          <p className="mt-1 text-[#a0a4b8]" style={{ fontSize: "0.76rem" }}>상세페이지 보강 필요 상품</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-[#ee4d2d]">
            <Store className="h-5 w-5" />
            <span style={{ fontWeight: 600 }}>게시 완료</span>
          </div>
          <div className="text-[#1a1d2e]" style={{ fontSize: "1.8rem", fontWeight: 700 }}>{publishedCount}건</div>
          <p className="mt-1 text-[#a0a4b8]" style={{ fontSize: "0.76rem" }}>8개 국가 판매 시작 가능</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-[#10b981]">
            <ImagePlus className="h-5 w-5" />
            <span style={{ fontWeight: 600 }}>등록 이미지</span>
          </div>
          <div className="text-[#1a1d2e]" style={{ fontSize: "1.8rem", fontWeight: 700 }}>{totalPhotoCount}장</div>
          <p className="mt-1 text-[#a0a4b8]" style={{ fontSize: "0.76rem" }}>촬영본 및 업로드 이미지 수</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6">
        <h3 className="mb-5 flex items-center gap-2 text-[#1a1d2e]" style={{ fontWeight: 600 }}>
          <Tags className="h-5 w-5 text-[#3b6cf5]" />
          상품 등록 폼
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[#6b7294]" style={{ fontSize: "0.8rem" }}>소싱 방식</label>
            <select
              value={form.sourceType}
              onChange={(event) => updateField("sourceType", event.target.value as SourceType)}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5"
              style={{ fontSize: "0.85rem" }}
            >
              <option value="offline">오프라인 사입</option>
              <option value="online">온라인 발주</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[#6b7294]" style={{ fontSize: "0.8rem" }}>소싱처</label>
            <input
              value={form.sourceLabel}
              onChange={(event) => updateField("sourceLabel", event.target.value)}
              placeholder="예: 올리브영 강남점 / 쿠팡 공급처"
              className="w-full rounded-xl border border-border bg-[#f8f9fc] px-3 py-2.5"
              style={{ fontSize: "0.85rem" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-[#6b7294]" style={{ fontSize: "0.8rem" }}>상품명</label>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="쇼피 등록 상품명"
              className="w-full rounded-xl border border-border bg-[#f8f9fc] px-3 py-2.5"
              style={{ fontSize: "0.85rem" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-[#6b7294]" style={{ fontSize: "0.8rem" }}>SKU</label>
            <input
              value={form.sku}
              onChange={(event) => updateField("sku", event.target.value)}
              placeholder="예: OY-SH-0001"
              className="w-full rounded-xl border border-border bg-[#f8f9fc] px-3 py-2.5"
              style={{ fontSize: "0.85rem" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-[#6b7294]" style={{ fontSize: "0.8rem" }}>브랜드</label>
            <input
              value={form.brand}
              onChange={(event) => updateField("brand", event.target.value)}
              placeholder="브랜드명"
              className="w-full rounded-xl border border-border bg-[#f8f9fc] px-3 py-2.5"
              style={{ fontSize: "0.85rem" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-[#6b7294]" style={{ fontSize: "0.8rem" }}>촬영 이미지</label>
            <input
              type="file"
              multiple
              onChange={handlePhotoChange}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5"
              style={{ fontSize: "0.85rem" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-[#6b7294]" style={{ fontSize: "0.8rem" }}>판매가</label>
            <input
              type="number"
              value={form.price || ""}
              onChange={(event) => updateField("price", Number(event.target.value) || 0)}
              placeholder="0"
              className="w-full rounded-xl border border-border bg-[#f8f9fc] px-3 py-2.5"
              style={{ fontSize: "0.85rem" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-[#6b7294]" style={{ fontSize: "0.8rem" }}>매입가</label>
            <input
              type="number"
              value={form.cost || ""}
              onChange={(event) => updateField("cost", Number(event.target.value) || 0)}
              placeholder="0"
              className="w-full rounded-xl border border-border bg-[#f8f9fc] px-3 py-2.5"
              style={{ fontSize: "0.85rem" }}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-[#6b7294]" style={{ fontSize: "0.8rem" }}>상세페이지 설명</label>
          <textarea
            value={form.detail}
            onChange={(event) => updateField("detail", event.target.value)}
            placeholder="주요 성분, 사용법, 배송 안내 등 쇼피 상세페이지에 들어갈 내용을 작성하세요"
            rows={5}
            className="w-full rounded-2xl border border-border bg-[#f8f9fc] px-3 py-3"
            style={{ fontSize: "0.85rem", lineHeight: 1.6 }}
          />
        </div>

        <div className="mt-4 rounded-2xl border border-[#f0e2de] bg-[#fff7f5] p-4">
          <p className="text-[#1a1d2e]" style={{ fontSize: "0.84rem", fontWeight: 600 }}>Save & Publish 체크</p>
          <p className="mt-1 text-[#6b7294]" style={{ fontSize: "0.78rem", lineHeight: 1.6 }}>
            상품명, SKU, 소싱처, 이미지 1장 이상, 상세페이지 설명, 판매가/매입가가 입력되면 8개 국가 게시 흐름으로 바로 전환됩니다.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[#1a1d2e]" style={{ fontWeight: 600 }}>등록 히스토리</h3>
            <p className="text-[#6b7294]" style={{ fontSize: "0.78rem" }}>임시 저장 후 게시하거나, 바로 Save & Publish 할 수 있습니다.</p>
          </div>
          <button
            onClick={() => navigate("/orders")}
            className="rounded-xl border border-[#3b6cf5] px-4 py-2 text-[#3b6cf5] transition-colors hover:bg-[#f0f4ff]"
            style={{ fontSize: "0.82rem", fontWeight: 600 }}
          >
            주문 처리 보기
          </button>
        </div>

        {listings.length > 0 ? (
          <div className="space-y-3">
            {listings.map((listing) => (
              <div key={listing.id} className="rounded-2xl border border-border bg-[#fafbff] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[#1a1d2e]" style={{ fontSize: "0.9rem", fontWeight: 600 }}>{listing.title}</p>
                      <span className={`rounded-full px-2.5 py-1 ${listing.status === "published" ? "bg-[#ffe8e2] text-[#ee4d2d]" : "bg-slate-100 text-slate-600"}`} style={{ fontSize: "0.72rem", fontWeight: 600 }}>
                        {listing.status === "published" ? `게시 완료 · ${listing.countryCount}개 국가` : "임시 저장"}
                      </span>
                    </div>
                    <p className="mt-1 text-[#6b7294]" style={{ fontSize: "0.78rem" }}>
                      {listing.sku} · {listing.brand || "브랜드 미입력"} · {sourceTypeLabel[listing.sourceType]} · {listing.sourceLabel}
                    </p>
                    <p className="mt-1 text-[#a0a4b8]" style={{ fontSize: "0.74rem" }}>
                      이미지 {listing.imageNames.length}장 · 판매가 {formatCurrency(listing.price)} · 매입가 {formatCurrency(listing.cost)} · 저장 {formatDateTime(listing.savedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {listing.status === "draft" ? (
                      <button
                        onClick={() => void publishListing(listing.id)}
                        className="rounded-xl bg-[#ee4d2d] px-4 py-2 text-white transition-colors hover:bg-[#d94324]"
                        style={{ fontSize: "0.78rem", fontWeight: 600 }}
                      >
                        Save & Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate("/orders")}
                        className="rounded-xl border border-[#3b6cf5] px-4 py-2 text-[#3b6cf5] transition-colors hover:bg-[#f0f4ff]"
                        style={{ fontSize: "0.78rem", fontWeight: 600 }}
                      >
                        주문 처리 이동
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Store}
            title="등록된 상품이 없습니다"
            description="상품명, 이미지, 상세페이지 초안을 입력해 Save & Publish 흐름을 시작하세요."
          />
        )}
      </div>
    </div>
  );
}
