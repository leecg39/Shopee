import { Link2, AlertTriangle, Globe, Shield, ChevronRight, HelpCircle } from "lucide-react";
import { PageHeader } from "./PageHeader";

const faqItems = [
  { q: "Q. 연동이 실패했어요", a: '브라우저 팝업 차단을 해제하고 다시 시도해보세요. 혹은 재연동하기를 클릭해주세요.' },
  { q: "Q. Merchant ID가 연동되지 않았어요", a: '다시 재연동하기 버튼을 클릭하여 Authorize Merchant를 꼭 체크 표시해주세요.' },
  { q: "Q. 일부 지역만 연동됐다고 하던데요.", a: '다시 재연동하기 버튼을 클릭하여 8개 지역을 모두 check 표시 해주세요.' },
  { q: "Q. 방금 인증했는데 인증 만료 알림이라고 합니다.", a: 'Authorization Period는 인증 만료 기간을 의미합니다. 해당 기간을 최대한 길게 설정해주세요(ex. 365일).' },
];

const steps = [
  '"Shopee 연동하기" or "재연동하기" 버튼을 클릭합니다',
  '새 창에서 Shopee 로그인 페이지가 열립니다',
  '이때 "Switch to Main(sub) Account" 버튼을 눌리고 Shopee 계정(ex. xxxxx:main)으로 로그인합니다',
  'Authorize Merchant를 꼭 체크 표시해주세요.',
  '운영중인 모든 지역을 모두 check 표시 해주세요.',
  'Authorization Period(연동 기간)을 설정해주세요(ex. 365일).',
  '"Confirm Authorization" 버튼을 눌러주세요.',
  '연동이 성공적으로 완료되면 Shopee 연동 관리 페이지에서 연동 상태가 연동됨으로 변경됩니다.',
];

export function IntegrationPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Shopee 연동 관리"
        description="Shopee 계정 연동 상태를 확인하고 관리합니다"
      />

      {/* Warning */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 text-red-600 mb-1" style={{ fontWeight: 600 }}>
          <AlertTriangle className="w-5 h-5" />
          Merchant ID 미연동
        </div>
        <p className="text-red-500" style={{ fontSize: '0.85rem' }}>Merchant ID가 연동되지 않았습니다. 서비스 사용이 제한될 수 있습니다.</p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            연동 상태
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#6b7294]" style={{ fontSize: '0.85rem' }}>현재 상태</span>
              <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg" style={{ fontSize: '0.8rem', fontWeight: 600 }}>연동 안됨</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6b7294]" style={{ fontSize: '0.85rem' }}>Merchant ID</span>
              <div className="flex items-center gap-1 text-[#a0a4b8]" style={{ fontSize: '0.85rem' }}>
                미연동
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-[#3b6cf5]" />
            인증 정보
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#6b7294]" style={{ fontSize: '0.85rem' }}>인증 만료일</span>
              <span className="text-[#a0a4b8]" style={{ fontSize: '0.85rem' }}>정보 없음</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-[#3b6cf5]" />
            연동 지역
          </h3>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#6b7294]" style={{ fontSize: '0.85rem' }}>연동된 지역</span>
            <span className="text-[#1a1d2e]" style={{ fontSize: '0.85rem', fontWeight: 600 }}>0/8개국</span>
          </div>
          <p className="text-[#a0a4b8]" style={{ fontSize: '0.8rem' }}>
            ⊕ 추가 지역 연동을 통해 더 많은 상품 관리가 가능합니다
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="flex items-center gap-2 mb-4">
            <Link2 className="w-5 h-5 text-[#3b6cf5]" />
            연동 관리
          </h3>
          <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#3b6cf5] text-white rounded-xl hover:bg-[#2d5ae0] transition-colors shadow-sm" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
            <Link2 className="w-4 h-4" />
            Shopee 연동하기
          </button>
          <p className="text-[#6b7294] text-center mt-3" style={{ fontSize: '0.8rem' }}>Shopee 계정과 연동하여 상품 관리를 시작하세요</p>
        </div>
      </div>

      {/* Guide & FAQ */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="flex items-center gap-2 mb-5">
          <HelpCircle className="w-5 h-5 text-[#3b6cf5]" />
          연동 가이드 & FAQ
        </h3>

        <div className="mb-6">
          <h4 className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-[#3b6cf5]" />
            Shopee 연동 절차
          </h4>
          <ol className="space-y-2 pl-1">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-[#4a4f6a]" style={{ fontSize: '0.85rem' }}>
                <span className="w-5 h-5 rounded-full bg-[#f0f4ff] text-[#3b6cf5] flex items-center justify-center shrink-0" style={{ fontSize: '0.7rem', fontWeight: 600 }}>{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h4 className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-[#f59e0b]" />
            자주 묻는 질문
          </h4>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div key={i} className="p-4 bg-[#f8f9fc] rounded-xl">
                <p className="text-[#1a1d2e] mb-1" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.q}</p>
                <p className="text-[#6b7294]" style={{ fontSize: '0.8rem' }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
