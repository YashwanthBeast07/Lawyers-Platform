"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import api from "@/lib/axios";
import type { ApiResponse, PagedResponse } from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LawDto {
  id: number;
  name: string;
  description?: string;
  category?: string;
  jurisdiction?: string;
  effectiveDate?: string;
}

// ── Category pills ────────────────────────────────────────────────────────────

const CATEGORIES = [
  "All", "Criminal", "Civil", "Family", "Corporate", "Property",
  "Labour", "Cyber", "Tax", "Constitutional", "Environmental",
];

// ── Law Card ──────────────────────────────────────────────────────────────────

function LawCard({ law }: { law: LawDto }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-[#0D1B2A] text-sm leading-snug flex-1">{law.name}</h3>
        {law.category && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/20 px-2 py-0.5 rounded-full shrink-0">
            {law.category}
          </span>
        )}
      </div>
      {law.description && (
        <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">{law.description}</p>
      )}
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        {law.jurisdiction && (
          <span className="text-[10px] text-[#94A3B8]">
            📍 {law.jurisdiction}
          </span>
        )}
        {law.effectiveDate && (
          <span className="text-[10px] text-[#94A3B8]">
            📅 Effective: {new Date(law.effectiveDate).getFullYear()}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LawsPage() {
  const [laws, setLaws] = useState<LawDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchLaws = async (q: string, cat: string, p: number) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page: p, size: 12 };
      if (q) params.keyword = q;
      if (cat !== "All") params.category = cat;
      const { data } = await api.get<ApiResponse<PagedResponse<LawDto>>>("/laws/search", { params });
      setLaws(data.data.content);
      setTotalPages(data.data.totalPages);
    } catch {
      setLaws([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchLaws(search, category, page), 300);
    return () => clearTimeout(delay);
  }, [search, category, page]);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(0);
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(0);
  };

  return (
    <>
      <Navbar />
      <main className="pt-14">
        {/* Hero */}
        <section className="bg-[#0D1B2A] px-6 md:px-16 py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(45deg, #C9A84C 0px, #C9A84C 1px, transparent 1px, transparent 28px)" }} />
          <div className="relative max-w-6xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">Legal Knowledge Base</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Indian Laws & Acts</h1>
            <p className="text-white/50 text-sm max-w-md leading-relaxed">
              Browse our database of Indian laws, acts, and regulations. For legal advice on how they apply to your situation, consult a verified advocate.
            </p>
            <p className="text-[10px] text-white/30 mt-3 border-t border-white/10 pt-3 max-w-md leading-relaxed">
              ⚠️ Disclaimer: Information here is for general awareness only and does not constitute legal advice.
            </p>
          </div>
        </section>

        {/* Filters + Grid */}
        <section className="bg-[#FAFAF7] px-6 md:px-16 py-10">
          <div className="max-w-6xl mx-auto">
            {/* Search */}
            <div className="mb-6 space-y-4">
              <div className="relative max-w-lg">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search laws, acts, sections…"
                  className="w-full h-11 bg-white border border-[#E2E8F0] rounded-lg pl-10 pr-4 text-sm text-[#0D1B2A] placeholder:text-[#CBD5E1] focus:border-[#0D1B2A] outline-none transition-colors"
                />
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                      category === cat
                        ? "bg-[#0D1B2A] text-white border-[#0D1B2A]"
                        : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#0D1B2A]/30 hover:text-[#0D1B2A]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 animate-pulse">
                    <div className="h-4 bg-[#F1F5F9] rounded w-3/4 mb-3" />
                    <div className="h-3 bg-[#F1F5F9] rounded w-full mb-1.5" />
                    <div className="h-3 bg-[#F1F5F9] rounded w-5/6" />
                  </div>
                ))}
              </div>
            ) : laws.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-[#CBD5E1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <p className="font-semibold text-[#0D1B2A] mb-1">No laws found</p>
                <p className="text-sm text-[#94A3B8]">Try a different keyword or category.</p>
                <button
                  onClick={() => { setSearch(""); setCategory("All"); setPage(0); }}
                  className="mt-4 text-sm text-[#C9A84C] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-[#94A3B8] mb-5">{laws.length} result{laws.length !== 1 ? "s" : ""}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {laws.map((law) => <LawCard key={law.id} law={law} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="w-9 h-9 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:border-[#0D1B2A] hover:text-[#0D1B2A] disabled:opacity-40 transition-all flex items-center justify-center"
                    >
                      ‹
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + Math.max(0, page - 2)).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === page ? "bg-[#0D1B2A] text-white" : "text-[#64748B] hover:bg-[#F1F5F9]"}`}
                      >
                        {p + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="w-9 h-9 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:border-[#0D1B2A] hover:text-[#0D1B2A] disabled:opacity-40 transition-all flex items-center justify-center"
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
