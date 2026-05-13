// components/landing/CTABanner.jsx
import Link from "next/link";

export default function CTABanner() {
  return (
    <section className="bg-[#C9A84C] px-6 md:px-16 py-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A] leading-tight mb-3">
            Ready to resolve your <br className="hidden md:block" />
            legal matter?
          </h2>
          <p className="text-[#0D1B2A]/60 text-sm leading-relaxed max-w-md">
            Join thousands of clients and advocates already using GoLawyers. Get started for free — no hidden fees.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-[#0D1B2A] hover:bg-[#1A3050] text-white font-semibold text-sm px-6 py-3 rounded-lg transition-all"
          >
            Create Free Account
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            href="/lawyers"
            className="inline-flex items-center justify-center border border-[#0D1B2A]/30 hover:border-[#0D1B2A] text-[#0D1B2A] font-semibold text-sm px-6 py-3 rounded-lg transition-all"
          >
            Browse Lawyers
          </Link>
        </div>
      </div>
    </section>
  );
}