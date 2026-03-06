import { DollarSign, TrendingUp, ShoppingCart, Package, Rocket, ArrowRight, Link2, Settings, Zap, RefreshCw } from "lucide-react";
import { InfoBanner } from "./InfoBanner";
import { StatCard } from "./StatCard";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";

const guideSteps = [
  { icon: Link2, title: "Shopee 연동하기", desc: "상품 데이터를 가져와서 관리를 시작하세요", action: "연동하기" },
  { icon: DollarSign, title: "매입가 설정하기", desc: "수익 분석을 위한 상품 매입가를 설정하세요", action: "설정하기" },
  { icon: Zap, title: "자동 부스트 설정", desc: "상품 노출을 늘려 매출을 향상시키세요", action: "설정하기" },
];

export function DashboardPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="대시보드"
        description="크로스보더 Shopee 매장 통합 현황"
        actions={
          <div className="flex items-center gap-3">
            <select className="px-3 py-2 border border-border rounded-xl bg-white text-[#4a4f6a]" style={{ fontSize: '0.85rem' }}>
              <option>최근 1개월</option>
              <option>최근 3개월</option>
              <option>최근 6개월</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#3b6cf5] text-white rounded-xl hover:bg-[#2d5ae0] transition-colors shadow-sm" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              <RefreshCw className="w-4 h-4" />
              실시간 동기화
            </button>
          </div>
        }
      />

      <InfoBanner message="대시보드 데이터는 Shopee 연동 후 표시됩니다. 지금 바로" linkText="연동하기" />

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="총 매출" value="매출 없음" subtext="평균 주문금액 계산불가" subtextColor="#f59e0b" iconColor="#3b6cf5" iconBg="#f0f4ff" />
        <StatCard icon={TrendingUp} label="총 순이익" value="데이터 없음" subtext="마진 데이터 없음" subtextColor="#f59e0b" iconColor="#10b981" iconBg="#ecfdf5" />
        <StatCard icon={ShoppingCart} label="주문 현황" value="주문 없음" subtext="선택 기간 내" iconColor="#8b5cf6" iconBg="#f5f3ff" />
        <StatCard icon={Package} label="상품 현황" value="상품 없음" subtext="상품 데이터 없음" iconColor="#f59e0b" iconBg="#fffbeb" />
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Recent Orders */}
        <div className="col-span-3 bg-white rounded-2xl border border-border p-6">
          <EmptyState
            icon={Rocket}
            title="최근 주문이 없습니다"
            description="선택한 기간 동안 주문 내역이 없습니다."
            actionLabel="주문 관리로 이동"
          />
          <div className="text-center mt-2">
            <p className="text-[#a0a4b8]" style={{ fontSize: '0.75rem' }}>셀잇파파 - 크로스보더 Shopee 관리 솔루션</p>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="col-span-2 bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#3b6cf5] flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              시작하기 가이드
            </h3>
            <span className="text-[#6b7294]" style={{ fontSize: '0.8rem' }}>0/3 완료</span>
          </div>
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[#6b7294]" style={{ fontSize: '0.8rem' }}>진행률</span>
            <div className="flex-1 h-2 bg-[#f0f4ff] rounded-full overflow-hidden">
              <div className="h-full w-0 bg-[#3b6cf5] rounded-full" />
            </div>
            <span className="text-[#3b6cf5]" style={{ fontSize: '0.8rem', fontWeight: 600 }}>0%</span>
          </div>
          <div className="space-y-3">
            {guideSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-[#3b6cf5] hover:bg-[#f8faff] transition-all cursor-pointer group">
                <div className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <step.icon className="w-4 h-4 text-[#3b6cf5]" />
                    <span className="text-[#1a1d2e]" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{step.title}</span>
                  </div>
                  <p className="text-[#6b7294] mt-0.5" style={{ fontSize: '0.75rem' }}>{step.desc}</p>
                </div>
                <button className="flex items-center gap-1 text-[#3b6cf5] opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                  {step.action}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Boost Activity */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="flex items-center gap-2 mb-4">
          <Rocket className="w-5 h-5 text-[#3b6cf5]" />
          최근 부스트 활동
        </h3>
        <EmptyState
          icon={Rocket}
          title="부스트 활동이 없습니다"
          description="최근 24시간 내 상품 부스트 활동이 없습니다."
          actionLabel="부스트 설정하기"
        />
      </div>
    </div>
  );
}
