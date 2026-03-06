import { Link2, MessageCircle, BookOpen, Settings, User } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-border px-6 flex items-center justify-end gap-2 sticky top-0 z-10">
      <button className="flex items-center gap-2 px-4 py-2 bg-[#3b6cf5] text-white rounded-xl hover:bg-[#2d5ae0] transition-colors shadow-sm" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
        <Link2 className="w-4 h-4" />
        Shopee 연동
      </button>
      <button className="flex items-center gap-2 px-3 py-2 text-[#4a4f6a] hover:bg-[#f0f4ff] rounded-xl transition-colors" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
        <MessageCircle className="w-4 h-4" />
        커뮤니티
      </button>
      <button className="flex items-center gap-2 px-3 py-2 text-[#4a4f6a] hover:bg-[#f0f4ff] rounded-xl transition-colors" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
        <BookOpen className="w-4 h-4" />
        사용 가이드
      </button>
      <button className="p-2 text-[#6b7294] hover:bg-[#f0f4ff] rounded-xl transition-colors">
        <Settings className="w-[18px] h-[18px]" />
      </button>
      <button className="p-2 text-[#6b7294] hover:bg-[#f0f4ff] rounded-xl transition-colors">
        <User className="w-[18px] h-[18px]" />
      </button>
    </header>
  );
}
