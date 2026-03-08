import { Link2, Bell, BookOpen, Settings, User } from "lucide-react";
import { Link, useNavigate } from "react-router";

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-2 border-b border-border bg-white px-4 md:px-6">
      <Link to="/integration" className="flex items-center gap-2 rounded-xl bg-[#3b6cf5] px-4 py-2 text-white shadow-sm transition-colors hover:bg-[#2d5ae0]" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
        <Link2 className="w-4 h-4" />
        Shopee 연동
      </Link>
      <Link to="/notifications" className="flex items-center gap-2 rounded-xl px-3 py-2 text-[#4a4f6a] transition-colors hover:bg-[#f0f4ff]" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
        <Bell className="w-4 h-4" />
        알림 센터
      </Link>
      <button onClick={() => navigate("/landing#features")} className="flex items-center gap-2 px-3 py-2 text-[#4a4f6a] hover:bg-[#f0f4ff] rounded-xl transition-colors" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
        <BookOpen className="w-4 h-4" />
        사용 가이드
      </button>
      <button onClick={() => navigate("/integration")} className="p-2 text-[#6b7294] hover:bg-[#f0f4ff] rounded-xl transition-colors">
        <Settings className="w-[18px] h-[18px]" />
      </button>
      <button onClick={() => navigate("/dashboard")} className="p-2 text-[#6b7294] hover:bg-[#f0f4ff] rounded-xl transition-colors">
        <User className="w-[18px] h-[18px]" />
      </button>
    </header>
  );
}
