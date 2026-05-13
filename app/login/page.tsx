// app/login/page.jsx
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] flex">

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] bg-[#0D1B2A] px-14 py-12 relative overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #C9A84C 0px, #C9A84C 1px, transparent 1px, transparent 28px)",
          }}
        />

        {/* Logo */}
        <Link href="/" className="relative font-serif text-2xl text-white">
          Lex<span className="text-[#C9A84C]">.</span>In
        </Link>

        {/* Quote */}
        <div className="relative">
          <div className="w-10 h-0.5 bg-[#C9A84C] mb-6" />
          <p className="font-serif text-3xl text-white leading-snug mb-6">
            Justice is not a privilege. <br />
            <span className="text-[#C9A84C] italic">It&apos;s your right.</span>
          </p>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            India&apos;s trusted platform connecting clients with verified legal advocates across 20+ practice areas.
          </p>
        </div>

        {/* Stats */}
        <div className="relative flex gap-8">
          <div>
            <p className="font-serif text-2xl text-white">1,240<span className="text-[#C9A84C]">+</span></p>
            <p className="text-white/40 text-xs mt-0.5">Verified Advocates</p>
          </div>
          <div>
            <p className="font-serif text-2xl text-white">8,500<span className="text-[#C9A84C]">+</span></p>
            <p className="text-white/40 text-xs mt-0.5">Cases Resolved</p>
          </div>
          <div>
            <p className="font-serif text-2xl text-white">4.8<span className="text-[#C9A84C]">★</span></p>
            <p className="text-white/40 text-xs mt-0.5">Average Rating</p>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden block font-serif text-2xl text-[#0D1B2A] mb-8">
            Lex<span className="text-[#C9A84C]">.</span>In
          </Link>

          <h1 className="font-serif text-3xl text-[#0D1B2A] mb-1">Welcome back</h1>
          <p className="text-sm text-[#64748B] mb-8">Sign in to manage your cases and appointments</p>

          {/* Google OAuth */}
          <a
            href="/api/oauth2/authorization/google"
            className="w-full flex items-center justify-center gap-3 border border-[#E2E8F0] hover:border-[#0D1B2A]/30 hover:bg-[#F8FAFC] text-sm text-[#0D1B2A] font-medium py-2.5 rounded-lg transition-all mb-6"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#E2E8F0]" />
            <span className="text-xs text-[#94A3B8]">or sign in with email</span>
            <div className="flex-1 h-px bg-[#E2E8F0]" />
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full h-11 border border-[#E2E8F0] focus:border-[#0D1B2A] focus:ring-0 outline-none rounded-lg px-3.5 text-sm text-[#0D1B2A] placeholder:text-[#CBD5E1] transition-colors bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#0D1B2A]">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-[#C9A84C] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                 
                  name="password"
                  
                  placeholder="••••••••"
                  className="w-full h-11 border border-[#E2E8F0] focus:border-[#0D1B2A] outline-none rounded-lg px-3.5 pr-10 text-sm text-[#0D1B2A] placeholder:text-[#CBD5E1] transition-colors bg-white"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              className="w-full h-11 bg-[#0D1B2A] hover:bg-[#1A3050] text-white text-sm font-medium rounded-lg transition-colors mt-2"
            >
              Sign In
            </button>
          </div>

          <p className="text-center text-sm text-[#64748B] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#C9A84C] font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}