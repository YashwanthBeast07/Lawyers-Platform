"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const SIZE_MAP = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
};

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0D1B2A]/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={`relative w-full ${SIZE_MAP[size]} rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-in`}
        style={{
          background: "var(--surface)",
          boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25), 0 0 0 1px rgb(0 0 0 / 0.05)",
        }}
      >
        {/* Decorative top stripe */}
        <div
          className="h-1 w-full"
          style={{ background: "linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light))" }}
        />

        {/* Header */}
        {title && (
          <div
            className="flex items-start justify-between px-6 pt-5 pb-4"
            style={{ borderBottom: "1px solid var(--border-light)" }}
          >
            <div>
              <h2
                id="modal-title"
                className="font-bold text-lg leading-tight"
                style={{ color: "var(--text)" }}
              >
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ml-4"
              style={{ color: "var(--text-light)", background: "var(--bg)" }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "var(--border)";
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "var(--bg)";
                e.currentTarget.style.color = "var(--text-light)";
              }}
              aria-label="Close modal"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
