"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { lawyerService } from "@/lib/services";
import type { LawyerProfileResponse } from "@/lib/types";
import Pagination from "@/components/ui/Pagination";
import { PageSpinner } from "@/components/ui/Spinner";

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
    <section style={{ background: "var(--bg)", minHeight: "calc(100vh - 56px)" }}>
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-10">
        {/* Section Header */}
        <div className="mb-8">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.08em] mb-1.5"
            style={{ color: "var(--gold)" }}
          >
            Directory
          </p>
          <h2 className="text-2xl font-black" style={{ color: "var(--text)" }}>
            Find a Lawyer
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Browse our network of verified legal professionals across all practice areas.
          </p>
        </div>

        {/* Search & Filters */}
        <div
          className="rounded-2xl p-4 mb-8 space-y-4"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {/* Search input */}
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{ color: "var(--text-light)" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or specialization…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "44px" }}
            />
          </div>

          {/* Specialization filters */}
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map((spec) => (
              <button
                key={spec}
                onClick={() => handleSpecChange(spec)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
                style={
                  selectedSpec === spec
                    ? {
                        background: "var(--navy)",
                        color: "white",
                        boxShadow: "0 2px 8px rgba(13,27,42,0.2)",
                      }
                    : {
                        background: "var(--bg)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }
                }
                onMouseOver={(e) => {
                  if (selectedSpec !== spec) {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--navy)";
                    (e.currentTarget as HTMLElement).style.color = "var(--navy)";
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedSpec !== spec) {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                  }
                }}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="py-24">
            <PageSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="rounded-2xl p-16 text-center"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
            }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              No lawyers found matching your criteria.
            </p>
            <button
              onClick={() => { setSearch(""); setSelectedSpec("All"); }}
              className="mt-4 text-sm font-bold hover:underline"
              style={{ color: "var(--gold)" }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold mb-5" style={{ color: "var(--text-muted)" }}>
              Showing {filtered.length} advocate{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((lawyer) => (
                <Link
                  href={`/lawyers/${lawyer.id}`}
                  key={lawyer.id}
                  className="block rounded-2xl overflow-hidden transition-all duration-200 group"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border-light)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                  onMouseOver={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "rgba(201,168,76,0.4)";
                    el.style.boxShadow = "var(--shadow-md)";
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "var(--border-light)";
                    el.style.boxShadow = "var(--shadow-sm)";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      {/* Avatar */}
                      <div
                        className="w-13 h-13 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0"
                        style={{
                          width: "52px",
                          height: "52px",
                          background: "linear-gradient(135deg, var(--gold-dark), var(--gold))",
                          color: "var(--navy)",
                          boxShadow: "0 4px 12px rgba(201,168,76,0.25)",
                        }}
                      >
                        {lawyer.fullName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                      </div>

                      {/* Verified badge */}
                      <span
                        className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg"
                        style={
                          lawyer.isVerified
                            ? { background: "#ECFDF5", color: "#065F46" }
                            : { background: "#FFFBEB", color: "#B45309" }
                        }
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: lawyer.isVerified ? "#10B981" : "#F59E0B" }}
                        />
                        {lawyer.isVerified ? "VERIFIED" : "PENDING"}
                      </span>
                    </div>

                    <h3
                      className="font-bold text-base mb-1 transition-colors"
                      style={{ color: "var(--text)" }}
                    >
                      {lawyer.fullName}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                      {lawyer.specialization || "General Practice"}
                    </p>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                      <span className="flex items-center gap-1" style={{ color: "var(--text)" }}>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--gold)" }}>
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {lawyer.averageRating ? lawyer.averageRating.toFixed(1) : "New"}
                      </span>
                      <span style={{ color: "var(--border)" }}>·</span>
                      <span>{lawyer.experienceYears ? `${lawyer.experienceYears}y exp` : "N/A"}</span>
                      {lawyer.hourlyRate && (
                        <>
                          <span style={{ color: "var(--border)" }}>·</span>
                          <span>₹{lawyer.hourlyRate}/hr</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div
                    className="px-5 py-3 flex items-center justify-between"
                    style={{ borderTop: "1px solid var(--border-light)", background: "var(--surface-2)" }}
                  >
                    <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                      View Profile
                    </span>
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      style={{ color: "var(--gold)" }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }}
        />
      </div>
    </section>
  );
}
