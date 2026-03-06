import { Link } from "react-router";
import { 
  Gift, ArrowRight, CheckCircle, Zap, Globe, TrendingUp, 
  BarChart3, Sparkles, ShoppingCart, Star, ChevronRight,
  Percent, Tag, Package
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const features = [
  { icon: Globe, title: "8개국 동시 관리", desc: "싱가포르, 베트남, 태국, 말레이시아 등 8개 Shopee 지역을 하나의 대시보드에서 관리하세요.", color: "#3b6cf5", bg: "#f0f4ff" },
  { icon: TrendingUp, title: "실시간 마진 분석", desc: "모든 상품의 마진율을 자동 계산하고 손실 상품을 즉시 파악할 수 있습니다.", color: "#10b981", bg: "#ecfdf5" },
  { icon: Percent, title: "대량 할인 최적화", desc: "목표 마진율을 설정하면 AI가 최적의 할인 가격을 자동으로 계산합니다.", color: "#8b5cf6", bg: "#f5f3ff" },
  { icon: Tag, title: "캠페인 가격 최적화", desc: "Shopee 캠페인 파일을 업로드하면 최적화된 가격을 즉시 제안받으세요.", color: "#f59e0b", bg: "#fffbeb" },
  { icon: Sparkles, title: "원클릭 AI 소싱", desc: "10,000개+ 상품 중 원하는 상품을 선택하여 원클릭으로 대량 등록하세요.", color: "#ef4444", bg: "#fef2f2" },
  { icon: Package, title: "주문 통합 관리", desc: "모든 지역의 주문을 한 곳에서 조회하고 관리할 수 있습니다.", color: "#06b6d4", bg: "#ecfeff" },
];

const stats = [
  { value: "23%", label: "평균 매출 증가율", desc: "셀잇파파 사용 후" },
  { value: "3.5시간", label: "일일 업무 시간 절감", desc: "수작업 대비" },
  { value: "8.9%", label: "평균 마진율 개선", desc: "최적화 후" },
];

const plans = [
  { name: "스타터", price: "무료", period: "", features: ["상품 100개 관리", "기본 마진 분석", "1개 지역 연동", "이메일 지원"], popular: false },
  { name: "프로", price: "₩49,000", period: "/월", features: ["상품 무제한", "고급 마진 분석", "8개 지역 연동", "대량 할인 최적화", "캠페인 가격 최적화", "우선 지원"], popular: true },
  { name: "엔터프라이즈", price: "문의", period: "", features: ["모든 프로 기능", "전담 매니저", "맞춤 API 연동", "SLA 보장", "온보딩 지원"], popular: false },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl z-50 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#3b6cf5] to-[#6366f1] rounded-xl flex items-center justify-center">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              <span className="text-[#1a1d2e]">셀잇</span>
              <span className="text-[#3b6cf5]">파파</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-[#6b7294] hover:text-[#1a1d2e] transition-colors" style={{ fontSize: '0.9rem' }}>기능</a>
            <a href="#pricing" className="text-[#6b7294] hover:text-[#1a1d2e] transition-colors" style={{ fontSize: '0.9rem' }}>가격</a>
            <Link to="/dashboard" className="px-5 py-2 bg-[#3b6cf5] text-white rounded-xl hover:bg-[#2d5ae0] transition-colors shadow-sm" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
              대시보드 바로가기
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f0f4ff] rounded-full text-[#3b6cf5] mb-6" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            <Sparkles className="w-4 h-4" />
            셀잇파파와 함께하는 스마트한 크로스보더 비즈니스
          </div>
          <h1 className="text-[#1a1d2e] mb-5" style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.2 }}>
            셀링데이터는 AI 시대에는<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b6cf5] to-[#6366f1]">Shopee 운영을 자동</span><br />
            최적화합니다
          </h1>
          <p className="text-[#6b7294] max-w-2xl mx-auto mb-10" style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
            마진 분석부터 할인 최적화, AI 소싱까지<br />
            크로스보더 Shopee 판매의 모든 것을 한 곳에서 관리하세요
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/dashboard" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#3b6cf5] text-white rounded-2xl hover:bg-[#2d5ae0] transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300" style={{ fontSize: '1rem', fontWeight: 600 }}>
              무료로 시작하기
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="inline-flex items-center gap-2 px-8 py-3.5 border border-border text-[#4a4f6a] rounded-2xl hover:bg-gray-50 transition-colors" style={{ fontSize: '1rem', fontWeight: 500 }}>
              기능 살펴보기
            </a>
          </div>

          {/* Dashboard preview */}
          <div className="mt-16 relative">
            <div className="absolute -inset-4 bg-gradient-to-b from-[#3b6cf5]/5 to-transparent rounded-3xl" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-100 border border-border">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1629963918958-1b62cfe3fe92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBkYXNoYm9hcmQlMjBhbmFseXRpY3MlMjBtb2Rlcm58ZW58MXx8fHwxNzcyNzkzNDQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Dashboard preview"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-20 px-6 bg-[#f8f9fc]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-[#1a1d2e] mb-4" style={{ fontSize: '2rem', fontWeight: 700 }}>혹시 이런 고민, 매일 하고 계신가요?</h2>
          <p className="text-[#6b7294] mb-12" style={{ fontSize: '1rem' }}>크로스보더 셀러라면 누구나 겪는 문제, 셀잇파파가 해결합니다</p>
          <div className="grid grid-cols-3 gap-6">
            {[
              { emoji: "😰", title: "마진 계산이 복잡해요", desc: "수수료, 환율, 물류비... 정확한 마진을 알기 어려워요" },
              { emoji: "⏰", title: "시간이 부족해요", desc: "8개국 매장을 일일이 관리하려면 하루가 모자라요" },
              { emoji: "📉", title: "손실이 발생해요", desc: "캠페인 가격 설정 실수로 손해를 보고 있어요" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-8 hover:shadow-lg hover:shadow-blue-50 transition-all">
                <span style={{ fontSize: '2.5rem' }}>{item.emoji}</span>
                <h3 className="text-[#1a1d2e] mt-4 mb-2" style={{ fontWeight: 600 }}>{item.title}</h3>
                <p className="text-[#6b7294]" style={{ fontSize: '0.9rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f0f4ff] rounded-lg text-[#3b6cf5] mb-4" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
              FEATURES
            </div>
            <h2 className="text-[#1a1d2e] mb-3" style={{ fontSize: '2rem', fontWeight: 700 }}>
              Shopee 크로스보더 셀러를 위한 올인원 솔루션
            </h2>
            <p className="text-[#6b7294]" style={{ fontSize: '1rem' }}>복잡한 크로스보더 운영을 단순하게 만들어드립니다</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-7 hover:shadow-lg hover:shadow-blue-50 hover:-translate-y-1 transition-all group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: f.bg }}>
                  <f.icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <h3 className="text-[#1a1d2e] mb-2" style={{ fontWeight: 600 }}>{f.title}</h3>
                <p className="text-[#6b7294]" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
                <div className="flex items-center gap-1 mt-4 text-[#3b6cf5] opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                  자세히 보기 <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#1a1d2e] to-[#2d3354]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-300 mb-3" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              "내방적 매커 텍스터의 운영 노하우잉 담긴은 접요용 결과"
            </p>
            <h2 className="text-white mb-2" style={{ fontSize: '2rem', fontWeight: 700 }}>셀잇파파 사용자들의 실제 성과</h2>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-white mb-2" style={{ fontSize: '3rem', fontWeight: 800 }}>{s.value}</div>
                <div className="text-blue-200 mb-1" style={{ fontSize: '1rem', fontWeight: 500 }}>{s.label}</div>
                <div className="text-blue-400" style={{ fontSize: '0.85rem' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 px-6 bg-[#f8f9fc]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#3b6cf5] mb-5" style={{ fontSize: '0.85rem', fontWeight: 500 }}>TESTIMONIAL</p>
          <blockquote className="text-[#1a1d2e] mb-8" style={{ fontSize: '1.4rem', fontWeight: 500, lineHeight: 1.7 }}>
            "매일같이 크로스보더 운영 루틴, 왠컨데<span className="text-[#3b6cf5]">셀잇파파 하나로 완전 관리</span>합니다."
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3b6cf5] to-[#6366f1] flex items-center justify-center text-white" style={{ fontWeight: 600 }}>K</div>
            <div className="text-left">
              <p className="text-[#1a1d2e]" style={{ fontSize: '0.9rem', fontWeight: 600 }}>김크로스 셀러</p>
              <p className="text-[#6b7294]" style={{ fontSize: '0.8rem' }}>Shopee 5개국 운영</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-[#1a1d2e] mb-3" style={{ fontSize: '2rem', fontWeight: 700 }}>
              지금 시작하시는 분들께 드리는 특별한 혜택
            </h2>
            <p className="text-[#6b7294]" style={{ fontSize: '1rem' }}>14일 무료 체험으로 모든 기능을 먼저 경험해보세요</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div key={i} className={`rounded-2xl p-8 ${plan.popular ? "bg-[#3b6cf5] text-white shadow-xl shadow-blue-200 scale-105" : "bg-white border border-border"}`}>
                {plan.popular && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-white mb-4" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    <Star className="w-3 h-3" /> 가장 인기
                  </div>
                )}
                <h3 style={{ fontWeight: 600 }} className={plan.popular ? "text-white" : "text-[#1a1d2e]"}>{plan.name}</h3>
                <div className="mt-3 mb-6">
                  <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{plan.price}</span>
                  {plan.period && <span className={plan.popular ? "text-blue-100" : "text-[#6b7294]"} style={{ fontSize: '0.9rem' }}>{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2" style={{ fontSize: '0.9rem' }}>
                      <CheckCircle className={`w-4 h-4 shrink-0 ${plan.popular ? "text-blue-200" : "text-[#3b6cf5]"}`} />
                      <span className={plan.popular ? "text-blue-50" : "text-[#4a4f6a]"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl transition-colors ${
                  plan.popular
                    ? "bg-white text-[#3b6cf5] hover:bg-blue-50"
                    : "bg-[#f0f4ff] text-[#3b6cf5] hover:bg-[#e0eaff]"
                }`} style={{ fontWeight: 600 }}>
                  {plan.price === "문의" ? "문의하기" : "시작하기"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#3b6cf5] to-[#6366f1]">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="mb-4" style={{ fontSize: '2rem', fontWeight: 700 }}>지금 바로 시작하세요</h2>
          <p className="text-blue-100 mb-8" style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
            14일 무료 체험으로 셀잇파파의 모든 기능을 경험해보세요.<br />
            신용카드 없이 바로 시작할 수 있습니다.
          </p>
          <Link to="/dashboard" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#3b6cf5] rounded-2xl hover:bg-blue-50 transition-colors shadow-lg" style={{ fontSize: '1rem', fontWeight: 600 }}>
            무료로 시작하기
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-[#1a1d2e]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-[#3b6cf5] to-[#6366f1] rounded-lg flex items-center justify-center">
              <Gift className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white" style={{ fontWeight: 600 }}>셀잇파파</span>
            <span className="text-gray-500 ml-2" style={{ fontSize: '0.8rem' }}>크로스보더 Shopee 관리 솔루션</span>
          </div>
          <p className="text-gray-500" style={{ fontSize: '0.8rem' }}>&copy; 2026 셀잇파파. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
