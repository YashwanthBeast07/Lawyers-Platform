"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { lawyerService, reviewService } from "@/lib/services";
import { useAppSelector } from "@/lib/store/hooks";
import type { LawyerProfileResponse, ReviewResponse } from "@/lib/types";
import { PageSpinner } from "@/components/ui/Spinner";
import Pagination from "@/components/ui/Pagination";

// ── Star display ──────────────────────────────────────────────────────────────

function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < Math.round(rating) ? "text-[#C9A84C]" : "text-[#E2E8F0]"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LawyerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  const [lawyer, setLawyer] = useState<LawyerProfileResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [reviewPage, setReviewPage] = useState(0);
  const [reviewTotalPages, setReviewTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lawyerData, reviewData] = await Promise.all([
          lawyerService.getById(Number(id)),
          reviewService.getForLawyer(Number(id), 0, 5),
        ]);
        setLawyer(lawyerData);
        setReviews(reviewData.content);
        setReviewTotalPages(reviewData.totalPages);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const fetchReviews = async (p: number) => {
    const data = await reviewService.getForLawyer(Number(id), p, 5);
    setReviews(data.content);
    setReviewPage(p);
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="pt-14 min-h-screen flex items-center justify-center bg-[#FAFAF7]">
        <PageSpinner />
      </div>
    </>
  );

  if (!lawyer) return (
    <>
      <Navbar />
      <div className="pt-14 min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#0D1B2A] font-semibold">Lawyer not found</p>
          <Link href="/lawyers" className="text-sm text-[#C9A84C] hover:underline mt-2 block">← Back to Lawyers</Link>
        </div>
      </div>
    </>
  );

  const initials = lawyer.fullName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <>
      <Navbar />
      <main className="pt-14 bg-[#FAFAF7] min-h-screen">
        {/* Profile hero */}
        <section className="bg-[#0D1B2A] px-6 md:px-16 py-14 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(45deg, #C9A84C 0px, #C9A84C 1px, transparent 1px, transparent 28px)" }} />
          <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{lawyer.fullName}</h1>
                {lawyer.isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30 px-2.5 py-1 rounded-full font-medium">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                    Verified Advocate
                  </span>
                )}
              </div>

              <p className="text-white/60 text-sm mb-4">
                {lawyer.specialization ?? "General Practice"}
                {lawyer.barNumber ? ` · Bar No: ${lawyer.barNumber}` : ""}
                {lawyer.experienceYears ? ` · ${lawyer.experienceYears} years experience` : ""}
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-8">
                {lawyer.averageRating != null && (
                  <div>
                    <div className="flex items-center gap-2">
                      <Stars rating={lawyer.averageRating} />
                      <span className="text-white font-bold">{lawyer.averageRating.toFixed(1)}</span>
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">{lawyer.totalReviews ?? 0} reviews</p>
                  </div>
                )}
                {lawyer.hourlyRate && (
                  <div>
                    <p className="text-white font-bold">₹{Number(lawyer.hourlyRate).toLocaleString("en-IN")}</p>
                    <p className="text-white/40 text-xs mt-0.5">Per consultation</p>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 shrink-0">
              {isAuthenticated ? (
                <Link
                  href="/appointments"
                  className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b8943d] text-[#0D1B2A] font-semibold text-sm px-5 py-3 rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  Book Consultation
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b8943d] text-[#0D1B2A] font-semibold text-sm px-5 py-3 rounded-lg transition-all"
                >
                  Sign in to Book
                </Link>
              )}
              <Link
                href="/lawyers"
                className="text-center text-sm text-white/50 hover:text-white transition-colors"
              >
                ← Back to Lawyers
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 md:px-16 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {lawyer.bio && (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl px-6 py-5">
                <h2 className="font-semibold text-[#0D1B2A] mb-3 text-sm">About</h2>
                <p className="text-sm text-[#64748B] leading-relaxed">{lawyer.bio}</p>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F1F5F9]">
                <h2 className="font-semibold text-[#0D1B2A] text-sm">
                  Client Reviews ({lawyer.totalReviews ?? 0})
                </h2>
              </div>

              {reviews.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm text-[#94A3B8]">No reviews yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-[#F1F5F9]">
                  {reviews.map((r) => (
                    <li key={r.id} className="px-6 py-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#F1F5F9] flex items-center justify-center text-xs font-bold text-[#64748B]">
                            {r.clientName?.[0]}
                          </div>
                          <span className="text-sm font-medium text-[#0D1B2A]">{r.clientName}</span>
                        </div>
                        <span className="text-xs text-[#94A3B8] shrink-0">{formatDate(r.createdAt)}</span>
                      </div>
                      <Stars rating={r.rating} />
                      <p className="text-sm text-[#64748B] leading-relaxed mt-2">{r.comment}</p>
                    </li>
                  ))}
                </ul>
              )}
              <div className="px-6 pb-4">
                <Pagination page={reviewPage} totalPages={reviewTotalPages} onPageChange={fetchReviews} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-5 space-y-3.5">
              <h3 className="font-semibold text-[#0D1B2A] text-sm">Advocate Details</h3>

              <div className="border-t border-[#F1F5F9] pt-3 space-y-3">
                {[
                  { label: "Specialization", value: lawyer.specialization },
                  { label: "Bar No.", value: lawyer.barNumber },
                  { label: "Experience", value: lawyer.experienceYears ? `${lawyer.experienceYears} years` : undefined },
                  { label: "Consultation Fee", value: lawyer.hourlyRate ? `₹${Number(lawyer.hourlyRate).toLocaleString("en-IN")}` : "Fee on request" },
                  { label: "Status", value: lawyer.isVerified ? "✓ Verified" : "Under Review" },
                ].filter((r) => r.value).map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-xs text-[#94A3B8]">{label}</span>
                    <span className="text-xs font-medium text-[#0D1B2A] text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {!isAuthenticated && (
              <div className="bg-[#0D1B2A] rounded-2xl px-5 py-5 text-center">
                <p className="text-white font-semibold text-sm mb-1">Ready to consult?</p>
                <p className="text-white/50 text-xs mb-4">Sign in to book a consultation or submit a case.</p>
                <Link
                  href="/register"
                  className="block w-full bg-[#C9A84C] hover:bg-[#b8943d] text-[#0D1B2A] font-semibold text-sm px-4 py-2.5 rounded-lg transition-all"
                >
                  Get Started — Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
