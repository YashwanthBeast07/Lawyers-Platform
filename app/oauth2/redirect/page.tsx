"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/lib/store/hooks";
import { fetchProfileThunk } from "@/lib/store/authSlice";
import { authService } from "@/lib/services";
import { setAccessToken } from "@/lib/axios";

// ── Spinner shared component ───────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-[#64748B]">
        <svg
          className="animate-spin h-8 w-8 text-[#C9A84C]"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <p className="text-sm font-medium text-[#0D1B2A]">
          Completing sign-in…
        </p>
        <p className="text-xs text-[#94A3B8]">You&apos;ll be redirected shortly</p>
      </div>
    </div>
  );
}

// ── Inner component that reads search params ──────────────────────────────────
// Must be wrapped in <Suspense> because useSearchParams() opts into CSR.

function OAuth2RedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      router.push(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    const init = async () => {
      if (token) {
        setAccessToken(token);
      } else {
        // No token in URL — try cookie-based refresh
        try {
          const refreshData = await authService.refresh();
          setAccessToken(refreshData.accessToken);
        } catch {
          router.push("/login?error=oauth_failed");
          return;
        }
      }

      const result = await dispatch(fetchProfileThunk());
      if (fetchProfileThunk.fulfilled.match(result)) {
        router.push("/dashboard");
      } else {
        router.push("/login?error=profile_failed");
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Spinner />;
}

// ── Page export (wraps inner in Suspense as required by Next.js App Router) ───

export default function OAuth2RedirectPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <OAuth2RedirectInner />
    </Suspense>
  );
}
