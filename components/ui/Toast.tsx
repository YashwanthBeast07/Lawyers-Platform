"use client";

import { useToast } from "@/lib/toastContext";

const CONFIG: Record<string, { bg: string; border: string; text: string; icon: string; iconColor: string }> = {
  success: {
    bg: "#ECFDF5",
    border: "#A7F3D0",
    text: "#065F46",
    iconColor: "#10B981",
    icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  error: {
    bg: "#FEF2F2",
    border: "#FECACA",
    text: "#B91C1C",
    iconColor: "#EF4444",
    icon: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
  },
  warning: {
    bg: "#FFFBEB",
    border: "#FDE68A",
    text: "#92400E",
    iconColor: "#F59E0B",
    icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z",
  },
  info: {
    bg: "#EFF6FF",
    border: "#BFDBFE",
    text: "#1D4ED8",
    iconColor: "#3B82F6",
    icon: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
  },
};

export default function Toast() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5"
      style={{ maxWidth: "380px", width: "calc(100vw - 40px)" }}
    >
      {toasts.map((t) => {
        const cfg = CONFIG[t.type] ?? CONFIG.info;
        return (
          <div
            key={t.id}
            className="flex items-start gap-3 px-4 py-3.5 rounded-xl animate-slide-up"
            style={{
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 10px -5px rgba(0,0,0,0.04)",
            }}
          >
            <span className="flex-shrink-0 mt-0.5" style={{ color: cfg.iconColor }}>
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={cfg.icon} />
              </svg>
            </span>
            <p className="text-sm font-medium flex-1 leading-snug" style={{ color: cfg.text }}>
              {t.message}
            </p>
            <button
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 mt-0.5 transition-opacity"
              style={{ color: cfg.text, opacity: 0.5 }}
              onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
              onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.5")}
              aria-label="Dismiss"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
