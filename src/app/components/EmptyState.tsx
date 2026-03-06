import { Package } from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon = Package, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-[#f0f4ff] rounded-2xl flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-[#a0b4f5]" />
      </div>
      <h3 className="text-[#1a1d2e] mb-2">{title}</h3>
      {description && <p className="text-[#6b7294] text-center max-w-sm" style={{ fontSize: '0.875rem' }}>{description}</p>}
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-5 px-5 py-2.5 bg-[#3b6cf5] text-white rounded-xl hover:bg-[#2d5ae0] transition-colors shadow-sm"
          style={{ fontSize: '0.875rem', fontWeight: 500 }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
