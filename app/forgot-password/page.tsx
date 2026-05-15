"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { authService } from "@/lib/services";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      await authService.forgotPassword(email);
      setStatus("sent");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Something went wrong. Please try again.";
      setError(msg);
      setStatus("error");
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-4 pt-14">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-8">
            {status === "sent" ? (
              /* Success state */
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                  <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-[#0D1B2A]">Check your inbox</h1>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  If an account exists for <span className="font-medium text-[#0D1B2A]">{email}</span>,
                  we&apos;ve sent password reset instructions. Check your spam folder if you don&apos;t see it.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 mt-2 text-sm font-semibold text-[#C9A84C] hover:underline"
                >
                  ← Back to login
                </Link>
              </div>
            ) : (
              /* Form state */
              <>
                <div className="mb-7">
                  <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0D1B2A] transition-colors mb-5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Back to login
                  </Link>
                  <h1 className="text-2xl font-bold text-[#0D1B2A]">Forgot password?</h1>
                  <p className="text-sm text-[#64748B] mt-1.5 leading-relaxed">
                    Enter your registered email and we&apos;ll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5">
                      Email address
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-11 border border-[#E2E8F0] focus:border-[#0D1B2A] outline-none rounded-lg px-3.5 text-sm text-[#0D1B2A] placeholder:text-[#CBD5E1] transition-colors"
                    />
                  </div>

                  {status === "error" && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3.5 py-2.5">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full h-11 bg-[#0D1B2A] hover:bg-[#1A3050] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {status === "loading" ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Sending…
                      </>
                    ) : "Send reset link"}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="text-center text-xs text-[#94A3B8] mt-6">
            Remember your password?{" "}
            <Link href="/login" className="text-[#C9A84C] hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </main>
    </>
  );
}
