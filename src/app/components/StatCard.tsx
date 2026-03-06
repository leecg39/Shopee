import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  label: string;
  value: string | number;
  subtext?: string;
  subtextColor?: string;
}

export function StatCard({ icon: Icon, iconColor = "#3b6cf5", iconBg = "#f0f4ff", label, value, subtext, subtextColor = "#6b7294" }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 hover:shadow-md hover:shadow-blue-50 transition-all">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg }}>
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <span className="text-[#6b7294]" style={{ fontSize: '0.85rem', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700 }} className="text-[#1a1d2e]">{value}</div>
      {subtext && (
        <p style={{ fontSize: '0.8rem', color: subtextColor }} className="mt-1">{subtext}</p>
      )}
    </div>
  );
}
