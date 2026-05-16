"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import { caseService } from "@/lib/services";
import { useToast } from "@/lib/toastContext";
import type { CaseResponse, CaseRequestDto, CaseType } from "@/lib/types";
import StatusPill from "@/components/ui/StatusPill";
import SectionHeader from "@/components/ui/SectionHeader";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import { PageSpinner } from "@/components/ui/Spinner";

// ── Helpers ────────────────────────────────────────────────────────────────────

const CASE_TYPES: CaseType[] = ["CIVIL", "CRIMINAL", "CORPORATE", "FAMILY", "PROPERTY", "CYBER", "OTHER"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ── Submit Case Modal ─────────────────────────────────────────────────────────

function SubmitCaseModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: (c: CaseResponse) => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CaseRequestDto>({
    title: "",
    description: "",
    caseType: "CIVIL",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const created = await caseService.create(form);
      toast.success("Case submitted successfully!");
      onSuccess(created);
      onClose();
      setForm({ title: "", description: "", caseType: "CIVIL" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to submit case.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Submit New Case" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5">Case Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Property dispute in Bengaluru"
            className="w-full h-11 border border-[#E2E8F0] focus:border-[#C9A84C] outline-none rounded-lg px-3.5 text-sm text-[#0D1B2A] placeholder:text-[#CBD5E1] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5">Case Type</label>
          <select
            value={form.caseType}
            onChange={(e) => setForm((f) => ({ ...f, caseType: e.target.value as CaseType }))}
            className="w-full h-11 border border-[#E2E8F0] focus:border-[#C9A84C] outline-none rounded-lg px-3.5 text-sm text-[#0D1B2A] transition-colors bg-white"
          >
            {CASE_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5">Description</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describe your legal issue in detail. The more context you provide, the better matched you'll be."
            className="w-full border border-[#E2E8F0] focus:border-[#C9A84C] outline-none rounded-lg px-3.5 py-2.5 text-sm text-[#0D1B2A] placeholder:text-[#CBD5E1] transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 border border-[#E2E8F0] text-[#64748B] text-sm font-semibold rounded-lg hover:border-[#0D1B2A] hover:text-[#0D1B2A] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-10 bg-[#C9A84C] hover:bg-[#E8C97A] disabled:opacity-60 text-[#0D1B2A] text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Submitting…</>
            ) : "Submit Case"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CasesPage() {
  const { user } = useAppSelector((s) => s.auth);
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchCases = async (p: number) => {
    setLoading(true);
    try {
      const data = await caseService.getMyCases(p, 10);
      setCases(data.content);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCases(page); }, [page]);

  const handleNewCase = (c: CaseResponse) => {
    setCases((prev) => [c, ...prev]);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <SectionHeader 
          eyebrow="My Cases" 
          title="Legal Matters" 
          subtitle={user?.role === "CLIENT" ? "Manage and track your active cases." : "Cases assigned to you."} 
        />
        {user?.role === "CLIENT" && (
          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#C9A84C] text-[#0D1B2A] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#E8C97A] transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Case
          </button>
        )}
      </div>

      {/* Cases list */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16"><PageSpinner /></div>
        ) : cases.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#0D1B2A] mb-1">No cases yet</h3>
            <p className="text-sm text-slate-500 mb-6">
              {user?.role === "CLIENT" ? "Submit your first case to get matched with a verified lawyer." : "No cases have been assigned to you yet."}
            </p>
            {user?.role === "CLIENT" && (
              <button
                onClick={() => setModalOpen(true)}
                className="bg-[#0D1B2A] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-[#1A3050] transition-colors shadow-sm inline-flex items-center gap-2"
              >
                Submit your first case
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-[#FAFAF7] transition-all group"
              >
                <div className="space-y-1 mb-4 md:mb-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-[#0D1B2A] group-hover:text-[#C9A84C] transition-colors">
                      {c.title}
                    </h3>
                    <StatusPill status={c.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Filed on {formatDate(c.createdAt)}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>{c.caseType?.replace(/_/g, " ") ?? "—"}</span>
                    {c.lawyerName && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          Lawyer: {c.lawyerName}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#C9A84C]/10 transition-colors">
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <SubmitCaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleNewCase}
      />
    </div>
  );
}
