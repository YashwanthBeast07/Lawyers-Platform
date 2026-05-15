"use client";

import { ChangeEvent, FormEvent, ReactElement, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { registerThunk, clearError } from "@/lib/store/authSlice";
import type { RegisterRequest } from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type RoleType = {
  id: "CLIENT" | "LAWYER";
  label: string;
  desc: string;
  icon: ReactElement;
};

const ROLES: RoleType[] = [
  {
    id: "CLIENT",
    label: "Client",
    desc: "I need legal help for my case",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    id: "LAWYER",
    label: "Lawyer",
    desc: "I'm an advocate offering services",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97zm-13.5 0L2.63 15.696c-.122.499.106 1.028.589 1.202a5.989 5.989 0 002.031.352 5.989 5.989 0 002.031-.352c.483-.174.711-.703.59-1.202L5.25 4.97z" />
      </svg>
    ),
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [role, setRole] = useState<"CLIENT" | "LAWYER">("CLIENT");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    barNumber: "",
    specialization: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) return;
    dispatch(clearError());

    const payload: RegisterRequest = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      phone: form.phone || undefined,
      role,
      ...(role === "LAWYER" && {
        barNumber: form.barNumber || undefined,
        specialization: form.specialization || undefined,
      }),
    };

    const result = await dispatch(registerThunk(payload));
    if (registerThunk.fulfilled.match(result)) {
      router.push("/login?registered=true");
    }
  };

  const googleUrl =
    process.env.NEXT_PUBLIC_OAUTH2_GOOGLE_URL ??
    "https://api.golawyers.online/api/oauth2/authorization/google";

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex">
      {/* ── Left Panel ──────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-start w-[46%] bg-[#0D1B2A] px-14 py-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #C9A84C 0px, #C9A84C 1px, transparent 1px, transparent 28px)",
          }}
        />

        <div className="relative">
          <div className="w-10 h-0.5 bg-[#C9A84C] mb-6" />
          <p className="font-serif text-3xl text-white leading-snug mb-6">
            Your legal journey <br />
            <span className="text-[#C9A84C] italic">starts here.</span>
          </p>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            Whether you&apos;re seeking legal help or offering your expertise —
            GoLawyers is built for you.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              "Verified advocates only",
              "Razorpay-secured payments",
              "Instant case & appointment tracking",
              "Transparent reviews & ratings",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-white/50">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex gap-8 mt-auto">
          <div>
            <p className="font-serif text-2xl text-white">
              1,240<span className="text-[#C9A84C]">+</span>
            </p>
            <p className="text-white/40 text-xs mt-0.5">Verified Advocates</p>
          </div>
          <div>
            <p className="font-serif text-2xl text-white">
              8,500<span className="text-[#C9A84C]">+</span>
            </p>
            <p className="text-white/40 text-xs mt-0.5">Cases Resolved</p>
          </div>
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center pt-20 px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link
            href="/"
            className="lg:hidden block font-serif text-2xl text-[#0D1B2A] mb-8"
          >
            Lex<span className="text-[#C9A84C]">.</span>In
          </Link>

          <h1 className="font-serif text-3xl text-[#0D1B2A] mb-1">
            Create an account
          </h1>
          <p className="text-sm text-[#64748B] mb-6">
            Join thousands using GoLawyers for their legal needs
          </p>

          {/* Global Error Banner */}
          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-2.5">
              <svg
                className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all ${
                  role === r.id
                    ? "border-[#0D1B2A] bg-[#0D1B2A] text-white"
                    : "border-[#E2E8F0] bg-white text-[#0D1B2A] hover:border-[#0D1B2A]/30"
                }`}
              >
                <span className={role === r.id ? "text-[#C9A84C]" : "text-[#64748B]"}>
                  {r.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold">{r.label}</p>
                  <p
                    className={`text-xs mt-0.5 ${
                      role === r.id ? "text-white/50" : "text-[#94A3B8]"
                    }`}
                  >
                    {r.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Google OAuth */}
          <a
            href={googleUrl}
            id="btn-google-register"
            className="w-full flex items-center justify-center gap-3 border border-[#E2E8F0] hover:border-[#0D1B2A]/30 hover:bg-[#F8FAFC] text-sm text-[#0D1B2A] font-medium py-2.5 rounded-lg transition-all mb-5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </a>

          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-[#E2E8F0]" />
            <span className="text-xs text-[#94A3B8]">or fill in your details</span>
            <div className="flex-1 h-px bg-[#E2E8F0]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="reg-firstName"
                  className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5"
                >
                  First Name
                </label>
                <input
                  id="reg-firstName"
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Rahul"
                  required
                  autoComplete="given-name"
                  className="w-full h-11 border border-[#E2E8F0] focus:border-[#0D1B2A] outline-none rounded-lg px-3.5 text-sm text-[#0D1B2A] placeholder:text-[#CBD5E1] transition-colors bg-white"
                />
              </div>
              <div>
                <label
                  htmlFor="reg-lastName"
                  className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5"
                >
                  Last Name
                </label>
                <input
                  id="reg-lastName"
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Kumar"
                  required
                  autoComplete="family-name"
                  className="w-full h-11 border border-[#E2E8F0] focus:border-[#0D1B2A] outline-none rounded-lg px-3.5 text-sm text-[#0D1B2A] placeholder:text-[#CBD5E1] transition-colors bg-white"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5"
              >
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full h-11 border border-[#E2E8F0] focus:border-[#0D1B2A] outline-none rounded-lg px-3.5 text-sm text-[#0D1B2A] placeholder:text-[#CBD5E1] transition-colors bg-white"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="reg-phone"
                className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5"
              >
                Phone Number
              </label>
              <div className="flex">
                <span className="flex items-center px-3.5 border border-r-0 border-[#E2E8F0] rounded-l-lg bg-[#F8FAFC] text-sm text-[#64748B]">
                  +91
                </span>
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="98765 43210"
                  autoComplete="tel"
                  className="flex-1 h-11 border border-[#E2E8F0] focus:border-[#0D1B2A] outline-none rounded-r-lg px-3.5 text-sm text-[#0D1B2A] placeholder:text-[#CBD5E1] transition-colors bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  required
                  autoComplete="new-password"
                  minLength={8}
                  className="w-full h-11 border border-[#E2E8F0] focus:border-[#0D1B2A] outline-none rounded-lg px-3.5 pr-10 text-sm text-[#0D1B2A] placeholder:text-[#CBD5E1] transition-colors bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0D1B2A] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Lawyer-only fields */}
            {role === "LAWYER" && (
              <div className="space-y-4 border border-[#E2E8F0] rounded-xl p-4 bg-white">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#C9A84C]">
                  Lawyer Details
                </p>

                <div>
                  <label
                    htmlFor="reg-barNumber"
                    className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5"
                  >
                    Bar Council Enrollment No.
                  </label>
                  <input
                    id="reg-barNumber"
                    type="text"
                    name="barNumber"
                    value={form.barNumber}
                    onChange={handleChange}
                    placeholder="e.g. D/2012/1847"
                    className="w-full h-11 border border-[#E2E8F0] focus:border-[#0D1B2A] outline-none rounded-lg px-3.5 text-sm text-[#0D1B2A] placeholder:text-[#CBD5E1] transition-colors bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reg-specialization"
                    className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5"
                  >
                    Primary Specialization
                  </label>
                  <select
                    id="reg-specialization"
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    className="w-full h-11 border border-[#E2E8F0] focus:border-[#0D1B2A] outline-none rounded-lg px-3.5 text-sm text-[#0D1B2A] transition-colors bg-white"
                  >
                    <option value="">Select specialization</option>
                    <option>Criminal Law</option>
                    <option>Civil Law</option>
                    <option>Family Law</option>
                    <option>Corporate Law</option>
                    <option>Tax Law</option>
                    <option>Real Estate</option>
                    <option>Labour Law</option>
                    <option>Intellectual Property</option>
                  </select>
                </div>

                <div className="flex items-start gap-3 bg-[#FAFAF7] rounded-lg p-3">
                  <svg
                    className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    You&apos;ll be asked to upload your Bar Council certificate
                    and ID proof after registration. Your profile goes live after
                    admin verification.
                  </p>
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#E2E8F0] accent-[#0D1B2A] cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="text-xs text-[#64748B] leading-relaxed cursor-pointer"
              >
                I agree to the{" "}
                <Link href="/terms" className="text-[#C9A84C] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#C9A84C] hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit */}
            <button
              id="btn-register-submit"
              type="submit"
              disabled={loading || !termsAccepted}
              className="w-full h-11 bg-[#0D1B2A] hover:bg-[#1A3050] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#64748B] mt-6 pb-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#C9A84C] font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}