"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setToken } from "@/lib/store/authSlice";
import { authService, userService } from "@/lib/services";
import { setAccessToken } from "@/lib/axios";
import { notificationService } from "@/lib/services";
import { ToastProvider } from "@/lib/toastContext";
import Sidebar from "@/components/dashboard/Sidebar";
import Toast from "@/components/ui/Toast";
import { PageSpinner } from "@/components/ui/Spinner";
import { fetchProfileThunk } from "@/lib/store/authSlice";

// ── Protected Layout ──────────────────────────────────────────────────────────

function ProtectedLayoutInner({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);

  const [booted, setBooted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Boot: restore session on page load ──────────────────────────────────
  useEffect(() => {
    // Already authenticated client-side (e.g., just logged in without reload)
    if (user) {
      setBooted(true);
      return;
    }

    const boot = async () => {
      try {
        // Step 1: Call /auth/refresh directly to get a new access token.
        // We do this explicitly rather than relying on the 401 interceptor
        // chain (GET /users/me → 401 → interceptor → POST /auth/refresh)
        // because the interceptor path is fragile on first load and can hang.
        const authData = await authService.refresh();

        // Step 2: Token is now in memory (authService.refresh calls setAccessToken).
        // Fetch the full profile with the fresh token.
        const profileResult = await dispatch(fetchProfileThunk());

        if (fetchProfileThunk.rejected.match(profileResult)) {
          // Refresh worked but profile failed — unusual, still redirect
          router.replace("/login");
          return;
        }

        setBooted(true);
      } catch (err) {
        // Refresh failed — session is invalid or expired, send to login
        console.warn("[ProtectedLayout] Session restore failed:", err);
        setAccessToken(null);
        router.replace("/login");
      }
    };

    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Poll unread notification count every 60 s ────────────────────────────
  const fetchUnread = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Non-critical — ignore silently
    }
  }, []);

  useEffect(() => {
    if (!booted) return;
    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000);
    return () => clearInterval(interval);
  }, [booted, fetchUnread]);

  if (!booted) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <PageSpinner label="Restoring session…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex">
      <Sidebar
        unreadCount={unreadCount}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

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
          <span className="text-white font-bold">
            Go<span className="text-[#C9A84C]">Lawyers</span>
          </span>
        </header>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>

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
