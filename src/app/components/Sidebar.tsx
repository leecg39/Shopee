import { NavLink } from "react-router";
import {
  LayoutDashboard,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Percent,
  Tag,
  Sparkles,
  Link2,
  Gift,
  ChevronDown,
  Zap,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { path: "/orders", label: "주문 관리", icon: ClipboardList },
  { path: "/cost", label: "상품 매입가", icon: DollarSign },
  { path: "/margins", label: "상품 마진", icon: TrendingUp },
  { path: "/discounts", label: "대량 할인", icon: Percent },
  { path: "/campaign", label: "캠페인 가격", icon: Tag },
  { path: "/sourcing", label: "대량 소싱", icon: Sparkles, badge: "부가 서비스" },
  { path: "/integration", label: "Shopee 연동", icon: Link2 },
];

export function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(true);

  return (
    <aside className="w-[240px] h-screen bg-white border-r border-border flex flex-col shrink-0 sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-[#3b6cf5] to-[#6366f1] rounded-xl flex items-center justify-center">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[#1a1d2e]" style={{ fontSize: '1.1rem', fontWeight: 700 }}>셀잇</span>
              <span className="text-[#3b6cf5]" style={{ fontSize: '1.1rem', fontWeight: 700 }}>파파</span>
            </div>
            <p className="text-[#6b7294]" style={{ fontSize: '0.7rem' }}>크로스보더 Shopee 관리 솔루션</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 px-3">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center justify-between w-full px-3 py-2 text-[#6b7294] hover:text-[#1a1d2e] transition-colors"
          style={{ fontSize: '0.75rem', fontWeight: 500 }}
        >
          <span>메인 메뉴</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${menuOpen ? "" : "-rotate-90"}`} />
        </button>

        {menuOpen && (
          <nav className="mt-1 space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-[#3b6cf5] text-white shadow-md shadow-blue-200"
                      : "text-[#4a4f6a] hover:bg-[#f0f4ff] hover:text-[#3b6cf5]"
                  }`
                }
                style={{ fontSize: '0.875rem', fontWeight: 500 }}
              >
                <item.icon className="w-[18px] h-[18px]" />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className="ml-auto px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-md"
                    style={{ fontSize: '0.625rem', fontWeight: 600 }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        )}
      </div>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-3">
        <button className="w-full flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#3b6cf5] to-[#6366f1] text-white rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all">
          <Zap className="w-4 h-4" />
          <div className="text-left">
            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>프리미엄 업그레이드</div>
            <div className="text-blue-100" style={{ fontSize: '0.7rem' }}>더 많은 기능 이용하기</div>
          </div>
        </button>
        <div className="flex items-center gap-2 px-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[#6b7294]" style={{ fontSize: '0.75rem' }}>연동 상태</span>
          </div>
          <span className="text-[#6b7294]" style={{ fontSize: '0.75rem' }}>· 연동 필요</span>
        </div>
      </div>
    </aside>
  );
}
