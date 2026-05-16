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
import SectionHeader from "@/components/ui/SectionHeader";

// ── Helpers ──────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < Math.round(rating) ? "text-[#C9A84C]" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
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
      <div className="pt-14 min-h-screen flex items-center justify-center bg-[#FAFAF7]"><PageSpinner /></div>
    </>
  );

  if (!lawyer) return (
    <>
      <Navbar />
      <div className="pt-14 min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center space-y-4">
        <p className="text-[#0D1B2A] font-bold text-xl">Lawyer not found</p>
        <Link href="/lawyers" className="bg-[#0D1B2A] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#1A3050] transition-colors">
          Back to Directory
        </Link>
      </div>
    </>
  );

  const initials = lawyer.fullName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <>
      <Navbar />
      <main className="pt-14 bg-[#FAFAF7] min-h-screen">
        <div className="max-w-6xl mx-auto p-8 pt-12 space-y-8">
          <Link href="/lawyers" className="text-sm font-medium text-slate-500 hover:text-[#C9A84C] transition-colors flex items-center gap-2 mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Directory
          </Link>
          
          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <svg className="w-48 h-48 text-[#0D1B2A]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            
            <div className="w-32 h-32 bg-[#0D1B2A] rounded-2xl flex flex-shrink-0 items-center justify-center text-[#C9A84C] font-black text-5xl shadow-inner relative z-10">
              {initials}
            </div>

            <div className="flex-1 space-y-4 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black text-[#0D1B2A] tracking-tight">{lawyer.fullName}</h1>
                  {lawyer.isVerified && (
                    <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold border border-green-100">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                      VERIFIED
                    </div>
                  )}
                </div>
                <p className="text-lg font-medium text-slate-500">{lawyer.specialization || "General Practice"}</p>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-600">
                {lawyer.averageRating != null && (
                  <div className="flex items-center gap-2">
                    <Stars rating={lawyer.averageRating} />
                    <span className="text-[#0D1B2A]">{lawyer.averageRating.toFixed(1)}</span>
                    <span className="text-slate-400 font-medium">({lawyer.totalReviews} reviews)</span>
                  </div>
                )}
                {lawyer.experienceYears && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {lawyer.experienceYears} Years Exp
                  </span>
                )}
                {lawyer.barNumber && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Bar: {lawyer.barNumber}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px] relative z-10">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Consultation Fee</p>
                <p className="text-2xl font-black text-[#0D1B2A]">
                  {lawyer.hourlyRate ? `₹${Number(lawyer.hourlyRate).toLocaleString("en-IN")}` : "Custom"}
                </p>
              </div>
              
              {isAuthenticated ? (
                <Link href="/appointments" className="block text-center bg-[#C9A84C] text-[#0D1B2A] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#E8C97A] transition-colors shadow-sm">
                  Request Consultation
                </Link>
              ) : (
                <Link href="/login" className="block text-center bg-[#0D1B2A] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#1A3050] transition-colors shadow-sm">
                  Sign in to Book
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (About & Reviews) */}
            <div className="lg:col-span-2 space-y-8">
              {lawyer.bio && (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 space-y-4">
                  <SectionHeader title="About the Advocate" />
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {lawyer.bio}
                  </p>
                </div>
              )}

              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-end">
                  <SectionHeader title="Client Reviews" subtitle="Read what others have to say." />
                  <div className="text-right">
                    <p className="text-3xl font-black text-[#0D1B2A]">{lawyer.averageRating?.toFixed(1) ?? "0.0"}</p>
                    <div className="flex items-center gap-1 justify-end mt-1"><Stars rating={lawyer.averageRating ?? 0} /></div>
                  </div>
                </div>

                {reviews.length === 0 ? (
                  <div className="p-8 text-center text-sm font-medium text-slate-500 bg-slate-50">
                    No reviews yet for this advocate.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {reviews.map(r => (
                      <div key={r.id} className="p-8 space-y-3 hover:bg-[#FAFAF7] transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#0D1B2A] rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {r.clientName?.[0]}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-[#0D1B2A]">{r.clientName}</p>
                              <p className="text-xs font-medium text-slate-400">{formatDate(r.createdAt)}</p>
                            </div>
                          </div>
                          <Stars rating={r.rating} />
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                   <Pagination page={reviewPage} totalPages={reviewTotalPages} onPageChange={fetchReviews} />
                </div>
              </div>
            </div>

            {/* Right Column (Side details) */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
                <SectionHeader title="Details" />
                <div className="space-y-4">
                  <div>
                     <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Primary Specialization</p>
                     <p className="text-sm font-bold text-[#0D1B2A]">{lawyer.specialization}</p>
                  </div>
                  <div>
                     <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Bar Council Number</p>
                     <p className="text-sm font-bold text-[#0D1B2A]">{lawyer.barNumber}</p>
                  </div>
                  {lawyer.experienceYears && (
                    <div>
                       <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Years in Practice</p>
                       <p className="text-sm font-bold text-[#0D1B2A]">{lawyer.experienceYears} Years</p>
                    </div>
                  )}

                </div>
              </div>

              <div className="bg-[#0D1B2A] rounded-xl p-6 text-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, #C9A84C 0px, #C9A84C 1px, transparent 1px, transparent 28px)" }} />
                <div className="relative z-10 space-y-4">
                  <p className="text-white font-bold text-lg">Not ready to book?</p>
                  <p className="text-slate-400 text-sm">Submit your case details and we will match you with the right verified advocates.</p>
                  <Link href={isAuthenticated ? "/cases" : "/register"} className="block bg-[#C9A84C] text-[#0D1B2A] px-4 py-3 rounded-lg font-bold text-sm hover:bg-[#E8C97A] transition-colors shadow-sm">
                    Submit a Case
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
