"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchProfileThunk } from "@/lib/store/authSlice";
import { notificationService } from "@/lib/services";
import { ToastProvider } from "@/lib/toastContext";
import Sidebar from "@/components/dashboard/Sidebar";
import Toast from "@/components/ui/Toast";
import { PageSpinner } from "@/components/ui/Spinner";

// ── Protected Layout ──────────────────────────────────────────────────────────

function ProtectedLayoutInner({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, loading } = useAppSelector((s) => s.auth);

  const [booted, setBooted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Boot: ensure user is loaded ──────────────────────────────────────────
  useEffect(() => {
    const boot = async () => {
      if (user) {
        setBooted(true);
        return;
      }
      const result = await dispatch(fetchProfileThunk());
      if (fetchProfileThunk.rejected.match(result)) {
        router.push("/login");
        return;
      }
      setBooted(true);
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Poll unread count every 60s ───────────────────────────────────────────
  const fetchUnread = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // ignore — non-critical
    }
  }, []);

  useEffect(() => {
    if (!booted) return;
    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000);
    return () => clearInterval(interval);
  }, [booted, fetchUnread]);

  if (!booted || loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex">
      {/* Sidebar */}
      <Sidebar
        unreadCount={unreadCount}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content — offset by sidebar width on lg+ */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-[240px]">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-[#0D1B2A] px-4 h-14 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="text-white font-bold">Go<span className="text-[#C9A84C]">Lawyers</span></span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Toast renderer */}
      <Toast />
    </div>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ProtectedLayoutInner>{children}</ProtectedLayoutInner>
    </ToastProvider>
  );
}
