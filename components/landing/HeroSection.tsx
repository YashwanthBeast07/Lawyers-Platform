"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className="pt-28 pb-20 px-6 md:px-16 relative overflow-hidden"
      style={{ background: "var(--navy)" }}
    >
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, #C9A84C 0px, #C9A84C 1px, transparent 1px, transparent 28px)",
        }}
      />

      {/* Radial glow effects */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, var(--gold) 0%, transparent 70%)", filter: "blur(60px)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-5 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #3B82F6 0%, transparent 70%)", filter: "blur(80px)" }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-3xl">
          {/* Eyebrow badge */}
          <div
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8"
            style={{
              background: "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.2)",
              color: "var(--gold)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--gold)", animation: "pulse 2s ease-in-out infinite" }}
            />
            India&apos;s Trusted Legal Marketplace
          </div>

          <h1
            className="font-black text-white leading-[1.08] mb-6 tracking-tight"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.75rem)" }}
          >
            Expert Legal Help,{" "}
            <span
              className="font-display italic"
              style={{ color: "var(--gold)" }}
            >
              Matched
            </span>{" "}
            to Your Case
          </h1>

          <p
            className="text-base md:text-lg leading-relaxed mb-10 max-w-xl"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Connect with verified advocates across 20+ practice areas. Submit your case, review profiles, and book consultations — all in one trusted platform.
          </p>

          <div className="flex flex-wrap gap-4 mb-16">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 font-bold text-sm px-7 py-3.5 rounded-xl transition-all duration-200"
              style={{
                background: "var(--gold)",
                color: "var(--navy)",
                boxShadow: "0 4px 20px rgba(201,168,76,0.3)",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--gold-light)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(201,168,76,0.4)";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--gold)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(201,168,76,0.3)";
              }}
            >
              Submit a Case
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/lawyers"
              className="inline-flex items-center gap-2 text-sm font-semibold px-7 py-3.5 rounded-xl transition-all duration-200"
              style={{
                border: "1.5px solid rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.8)",
              }}
              onMouseOver={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(255,255,255,0.35)";
                el.style.color = "white";
                el.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseOut={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(255,255,255,0.18)";
                el.style.color = "rgba(255,255,255,0.8)";
                el.style.background = "transparent";
              }}
            >
              Browse Lawyers
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="pt-8 flex flex-wrap gap-10"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          {[
            { num: "1,240+", label: "Verified Advocates" },
            { num: "8,500+", label: "Cases Resolved" },
            { num: "4.8★", label: "Average Rating" },
            { num: "48hr", label: "Avg. Response Time" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-black text-white">
                {s.num.includes("★") ? (
                  <>
                    {s.num.replace("★", "")}
                    <span style={{ color: "var(--gold)" }}>★</span>
                  </>
                ) : s.num.includes("+") ? (
                  <>
                    {s.num.replace("+", "")}
                    <span style={{ color: "var(--gold)" }}>+</span>
                  </>
                ) : (
                  <>
                    {s.num.replace("hr", "")}
                    <span style={{ color: "var(--gold)" }}>hr</span>
                  </>
                )}
              </p>
              <p className="text-xs mt-1 font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}