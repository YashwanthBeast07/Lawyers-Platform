// components/landing/HeroSection.jsx
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-[#0D1B2A] pt-32 pb-20 px-6 md:px-16 relative overflow-hidden">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #C9A84C 0px, #C9A84C 1px, transparent 1px, transparent 28px)",
        }}
      />

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-[#C9A84C]/5 blur-[100px] rounded-full" />

      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[#C9A84C] text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
            India&apos;s Trusted Legal Marketplace
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-white leading-[1.12] mb-6 tracking-tight">
            Expert Legal Help,{" "}
            <span className="text-[#C9A84C] italic font-serif">Matched</span>{" "}
            to Your Case
          </h1>

          <p className="text-white/50 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
            Connect with verified advocates across 20+ practice areas. Submit your case, review profiles, and book consultations — all in one place.
          </p>

          <div className="flex flex-wrap gap-3 mb-14">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b8943d] text-[#0D1B2A] font-semibold text-sm px-6 py-3 rounded-lg transition-all"
            >
              Submit a Case
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/lawyers"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white/80 hover:text-white text-sm px-6 py-3 rounded-lg transition-all"
            >
              Browse Lawyers
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/10 pt-8 flex flex-wrap gap-10">
          {[
            { num: "1,240+", label: "Verified Advocates" },
            { num: "8,500+", label: "Cases Resolved" },
            { num: "4.8★", label: "Average Rating" },
            { num: "48hr", label: "Avg. Response Time" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-white">
                {s.num.includes("★") ? (
                  <>
                    {s.num.replace("★", "")}
                    <span className="text-[#C9A84C]">★</span>
                  </>
                ) : s.num.includes("+") ? (
                  <>
                    {s.num.replace("+", "")}
                    <span className="text-[#C9A84C]">+</span>
                  </>
                ) : (
                  <>
                    {s.num.replace("hr", "")}
                    <span className="text-[#C9A84C]">hr</span>
                  </>
                )}
              </p>
              <p className="text-white/40 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}