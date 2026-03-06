import { useState } from "react";

const regions = [
  { code: "SG", flag: "🇸🇬", name: "싱가포르", connected: true },
  { code: "VN", flag: "🇻🇳", name: "베트남", connected: false },
  { code: "TH", flag: "🇹🇭", name: "태국", connected: false },
  { code: "MY", flag: "🇲🇾", name: "말레이시아", connected: false },
  { code: "PH", flag: "🇵🇭", name: "필리핀", connected: false },
  { code: "TW", flag: "🇹🇼", name: "대만", connected: false },
  { code: "BR", flag: "🇧🇷", name: "브라질", connected: false },
  { code: "MX", flag: "🇲🇽", name: "멕시코", connected: false },
];

export function RegionSelector() {
  const [selected, setSelected] = useState("SG");

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[#6b7294] flex items-center gap-1.5" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
        🌍 지역 선택:
      </span>
      {regions.map((r) => (
        <button
          key={r.code}
          onClick={() => setSelected(r.code)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            selected === r.code
              ? "bg-[#3b6cf5] text-white shadow-sm"
              : r.connected
              ? "bg-white border border-border text-[#4a4f6a] hover:border-[#3b6cf5]"
              : "bg-gray-50 text-[#a0a4b8] border border-transparent"
          }`}
          style={{ fontSize: '0.8rem', fontWeight: 500 }}
        >
          <span>{r.flag}</span>
          <span>{r.code}</span>
          {!r.connected && <span className="text-[0.65rem] text-[#a0a4b8]">미연동</span>}
        </button>
      ))}
    </div>
  );
}
