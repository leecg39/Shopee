import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface PageHeaderProps {
  icon?: LucideIcon | string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ icon: Icon, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        {Icon && typeof Icon === "string" ? (
          <span style={{ fontSize: '1.75rem' }}>{Icon}</span>
        ) : Icon ? (
          <div className="w-10 h-10 rounded-xl bg-[#f0f4ff] flex items-center justify-center">
            {/* @ts-ignore */}
            <Icon className="w-5 h-5 text-[#3b6cf5]" />
          </div>
        ) : null}
        <div>
          <h1 className="text-[#1a1d2e]">{title}</h1>
          {description && <p className="text-[#6b7294] mt-0.5" style={{ fontSize: '0.875rem' }}>{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
