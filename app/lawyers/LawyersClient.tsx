"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { lawyerService } from "@/lib/services";
import type { LawyerProfileResponse } from "@/lib/types";
import Pagination from "@/components/ui/Pagination";
import { PageSpinner } from "@/components/ui/Spinner";
import SectionHeader from "@/components/ui/SectionHeader";

const SPECIALIZATIONS = [
  "All", "Criminal Law", "Civil Law", "Family Law", "Corporate Law",
  "Tax Law", "Real Estate", "Labour Law", "Intellectual Property", "Cyber Law",
];

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
    <section className="bg-[#FAFAF7] min-h-screen">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-10">
          <SectionHeader 
            eyebrow="Directory" 
            title="Find a Lawyer" 
            subtitle="Browse our network of verified legal professionals." 
          />
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-8 space-y-4">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803" />
            </svg>
            <input 
              type="text" 
              placeholder="Search by name, tags, or location..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {SPECIALIZATIONS.map((spec) => (
              <button 
                key={spec} 
                onClick={() => handleSpecChange(spec)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                  selectedSpec === spec
                    ? 'bg-[#0D1B2A] text-white' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
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
          <div className="bg-white rounded-xl border border-slate-100 p-16 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-500">No lawyers found matching your criteria.</p>
            <button
              onClick={() => { setSearch(""); setSelectedSpec("All"); }}
              className="mt-4 text-sm font-bold text-[#C9A84C] hover:text-[#0D1B2A] transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold text-slate-500 mb-4">{filtered.length} results found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(lawyer => (
                <Link href={`/lawyers/${lawyer.id}`} key={lawyer.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:border-[#C9A84C] hover:shadow-md transition-all group block">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-14 h-14 bg-[#0D1B2A] rounded-xl flex items-center justify-center text-[#C9A84C] font-black text-xl shadow-inner">
                        {lawyer.fullName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                      </div>
                      <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-1 rounded-md text-[10px] font-bold">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                        {lawyer.isVerified ? "VERIFIED" : "PENDING"}
                      </div>
                    </div>

                    <h3 className="font-bold text-[#0D1B2A] text-lg mb-1 group-hover:text-[#C9A84C] transition-colors">{lawyer.fullName}</h3>
                    <p className="text-sm font-medium text-slate-500 mb-4">{lawyer.specialization || "General Practice"}</p>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-4">
                      <span className="flex items-center gap-1 text-[#0D1B2A]">
                        <svg className="w-3.5 h-3.5 text-[#C9A84C]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {lawyer.averageRating ? lawyer.averageRating.toFixed(1) : "New"}
                      </span>
                      <span>•</span>
                      <span>{lawyer.experienceYears ? `${lawyer.experienceYears} Years Exp` : "N/A"}</span>
                      {lawyer.hourlyRate && (
                        <>
                          <span>•</span>
                          <span>₹{lawyer.hourlyRate}/hr</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">View Profile</span>
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-[#C9A84C] transition-colors group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }} />
      </div>
    </section>
  );
}
