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
      <div className="flex h-screen items-center justify-center bg-[#FAFAF7]">
        <div className="w-8 h-8 border-4 border-[#0D1B2A] border-t-[#C9A84C] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FAFAF7]">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile Header */}
      <div className="md:hidden flex h-14 bg-[#0D1B2A] items-center justify-between px-5 border-b border-white/5 text-white w-full sticky top-0 z-40">
        <Link href="/dashboard" className="text-lg font-bold text-white">
          Go<span className="text-[#C9A84C]">Lawyers</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer Sidebar */}
          <div className="relative flex flex-col bg-[#0D1B2A] w-[240px] max-w-[80vw] h-full shadow-2xl transition-transform duration-300 transform translate-x-0">
            {/* Close Button inside Drawer */}
            <div className="absolute top-3.5 right-4 z-50">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Render Sidebar within mobile drawer context */}
            <Sidebar className="w-full" onClose={() => setIsMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto w-full">{children}</main>
    </div>
  );
}
