"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { lawyerService } from "@/lib/services";
import type { LawyerProfileResponse } from "@/lib/types";
import Pagination from "@/components/ui/Pagination";
import { PageSpinner } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";

const SPECIALIZATIONS = [
  "All", "Criminal Law", "Civil Law", "Family Law", "Corporate Law",
  "Tax Law", "Real Estate", "Labour Law", "Intellectual Property", "Cyber Law",
];

function StarRating({ rating }: { rating?: number }) {
  if (!rating) return <span className="text-xs text-[#94A3B8]">No ratings</span>;
  return (
    <span className="flex items-center gap-1">
      <svg className="w-3 h-3 text-[#C9A84C]" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-xs font-semibold text-[#0D1B2A]">{rating.toFixed(1)}</span>
    </span>
  );
}

function LawyerCard({ lawyer }: { lawyer: LawyerProfileResponse }) {
  const initials = lawyer.fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden hover:shadow-lg transition-all group bg-white">
      {/* Card top — navy */}
      <div className="bg-[#0D1B2A] px-5 pt-6 pb-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-bold text-base text-white">
            {initials}
          </div>
          <div className="flex items-center gap-1 bg-white/10 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {lawyer.isVerified ? (
              <><svg className="w-3 h-3 text-[#C9A84C]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg> Verified</>
            ) : "Pending"}
          </div>
        </div>
        <h3 className="font-bold text-base text-white mb-0.5">{lawyer.fullName}</h3>
        <p className="text-xs text-white/50">
          {lawyer.specialization ?? "General Practice"}
          {lawyer.experienceYears ? ` · ${lawyer.experienceYears} yrs exp` : ""}
        </p>
      </div>

      {/* Card body */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <StarRating rating={lawyer.averageRating} />
          {lawyer.totalReviews != null && (
            <span className="text-xs text-[#94A3B8]">{lawyer.totalReviews} reviews</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            {lawyer.hourlyRate ? (
              <>
                <p className="font-bold text-[#0D1B2A] text-base">₹{Number(lawyer.hourlyRate).toLocaleString("en-IN")}</p>
                <p className="text-[11px] text-[#94A3B8]">per consultation</p>
              </>
            ) : (
              <p className="text-sm text-[#94A3B8]">Fee on request</p>
            )}
          </div>
          <Link
            href={`/lawyers/${lawyer.id}`}
            className="text-sm font-semibold bg-[#0D1B2A] hover:bg-[#1A3050] text-white px-4 py-2 rounded-lg transition-all"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LawyersClient() {
  const [lawyers, setLawyers] = useState<LawyerProfileResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("All");

  const fetchLawyers = async (p: number, spec: string) => {
    setLoading(true);
    try {
      const data = await lawyerService.search({
        specialization: spec === "All" ? undefined : spec,
        page: p,
        size: 9,
      });
      setLawyers(data.content);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyers(page, selectedSpec);
  }, [page, selectedSpec]);

  const handleSpecChange = (spec: string) => {
    setSelectedSpec(spec);
    setPage(0);
  };

  const filtered = search
    ? lawyers.filter(
        (l) =>
          l.fullName.toLowerCase().includes(search.toLowerCase()) ||
          (l.specialization ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : lawyers;

  return (
    <section className="bg-[#FAFAF7] px-6 md:px-16 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Search + filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or specialization…"
              className="w-full h-11 bg-white border border-[#E2E8F0] rounded-lg pl-10 pr-4 text-sm text-[#0D1B2A] placeholder:text-[#CBD5E1] focus:border-[#0D1B2A] outline-none transition-colors"
            />
          </div>

          {/* Specialization pills */}
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map((spec) => (
              <button
                key={spec}
                onClick={() => handleSpecChange(spec)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  selectedSpec === spec
                    ? "bg-[#0D1B2A] text-white border-[#0D1B2A]"
                    : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#0D1B2A]/30 hover:text-[#0D1B2A]"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="py-20"><PageSpinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No lawyers found"
            description="Try a different specialization or clear the search."
            action={
              <button
                onClick={() => { setSearch(""); setSelectedSpec("All"); }}
                className="text-sm font-medium text-[#C9A84C] hover:underline"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <>
            <p className="text-xs text-[#94A3B8] mb-5">{filtered.length} advocate{filtered.length !== 1 ? "s" : ""} found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((l) => <LawyerCard key={l.id} lawyer={l} />)}
            </div>
          </>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }} />
      </div>
    </section>
  );
}
