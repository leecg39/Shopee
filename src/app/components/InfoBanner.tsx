import { AlertTriangle, X } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";

interface InfoBannerProps {
  message: string;
  linkText?: string;
  linkTo?: string;
  onLinkClick?: () => void;
  type?: "warning" | "info";
}

export function InfoBanner({ message, linkText, linkTo, onLinkClick, type = "warning" }: InfoBannerProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className={`flex items-center justify-between px-5 py-3 rounded-xl ${
      type === "warning"
        ? "bg-amber-50 border border-amber-200"
        : "bg-blue-50 border border-blue-200"
    }`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className={`w-4 h-4 shrink-0 ${type === "warning" ? "text-amber-500" : "text-blue-500"}`} />
        <span className={type === "warning" ? "text-amber-700" : "text-blue-700"} style={{ fontSize: '0.85rem' }}>
          {message}
          {linkText && linkTo ? (
            <Link to={linkTo} className="ml-1 underline hover:no-underline" style={{ fontWeight: 600 }}>
              {linkText}
            </Link>
          ) : linkText ? (
            <button onClick={onLinkClick} className="ml-1 underline hover:no-underline" style={{ fontWeight: 600 }}>
              {linkText}
            </button>
          ) : null}
        </span>
      </div>
      <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
