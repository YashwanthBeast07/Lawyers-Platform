"use client";

import { useEffect, useState } from "react";
import { userService } from "@/lib/services";
import { useToast } from "@/lib/toastContext";
import type { UserProfileResponse } from "@/lib/types";
import SectionHeader from "@/components/ui/SectionHeader";
import Pagination from "@/components/ui/Pagination";
import { PageSpinner } from "@/components/ui/Spinner";

export default function AdminVerificationsPage() {
  const { toast } = useToast();
  const [lawyers, setLawyers] = useState<UserProfileResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const fetchPending = async (p: number) => {
    setLoading(true);
    try {
      const data = await userService.getPendingVerifications(p, 10);
      setLawyers(data.content);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to load pending verifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending(page);
  }, [page]);

  const handleVerify = async (id: number) => {
    setVerifyingId(id);
    try {
      await userService.verifyLawyer(id);
      toast.success("Lawyer verified successfully.");
      setLawyers((prev) => prev.filter((l) => l.id !== id));
    } catch {
      toast.error("Failed to verify lawyer.");
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <SectionHeader 
          eyebrow="Admin Actions"
          title="Lawyer Verifications"
          subtitle="Review and approve pending lawyer accounts."
        />
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16"><PageSpinner /></div>
        ) : lawyers.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#0D1B2A] mb-1">Queue Empty</h3>
            <p className="text-sm text-slate-500">
              There are no pending lawyer verifications at this time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {lawyers.map((lawyer) => (
              <div key={lawyer.id} className="p-6 hover:bg-[#FAFAF7] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#0D1B2A] rounded-xl flex items-center justify-center text-[#C9A84C] font-black text-xl shadow-inner shrink-0">
                    {lawyer.firstName?.[0]}{lawyer.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#0D1B2A]">
                      {lawyer.firstName} {lawyer.lastName}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mb-2">
                      {lawyer.specialization || "General Practice"}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        {lawyer.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Bar No: <span className="text-[#0D1B2A]">{lawyer.barNumber}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => handleVerify(lawyer.id)}
                    disabled={verifyingId === lawyer.id}
                    className="bg-[#C9A84C] text-[#0D1B2A] px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-[#E8C97A] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {verifyingId === lawyer.id ? (
                      <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Verifying…</>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Approve Lawyer
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
