"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import Sidebar from "@/components/dashboard/Sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, initialized } = useAppSelector((state) => state.auth);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.push("/login");
    }
  }, [user, loading, initialized, router]);

  if (!initialized || loading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black"
            style={{
              background: "linear-gradient(135deg, var(--gold-dark), var(--gold))",
              color: "var(--navy)",
            }}
          >
            G
          </div>
          <div
            className="w-6 h-6 border-2 border-t-transparent rounded-full"
            style={{ borderColor: "var(--gold)", animation: "spin 0.8s linear infinite" }}
          />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile Header */}
      <div
        className="md:hidden flex h-14 items-center justify-between px-5 w-full sticky top-0 z-40"
        style={{
          background: "var(--navy)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link href="/dashboard" className="flex items-center gap-1 text-lg font-black text-white">
          Go<span style={{ color: "var(--gold)" }}>Lawyers</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-white/70 hover:text-white rounded-lg transition-colors"
          style={{ background: "rgba(255,255,255,0.05)" }}
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer */}
          <div
            className="relative flex flex-col w-[240px] max-w-[82vw] h-full shadow-2xl animate-slide-down"
            style={{ background: "var(--navy)" }}
          >
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 text-white/60 hover:text-white rounded-lg transition-colors"
                style={{ background: "rgba(255,255,255,0.06)" }}
                aria-label="Close menu"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar className="w-full" onClose={() => setIsMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full min-w-0">
        <div className="animate-slide-up">
          {children}
        </div>
      </main>
    </div>
  );
}
