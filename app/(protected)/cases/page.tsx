"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import { caseService } from "@/lib/services";
import { useToast } from "@/lib/toastContext";
import type { CaseResponse, CaseRequestDto, CaseType } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
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
            className="w-full h-11 border border-[#E2E8F0] focus:border-[#0D1B2A] outline-none rounded-lg px-3.5 text-sm text-[#0D1B2A] placeholder:text-[#CBD5E1] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5">Case Type</label>
          <select
            value={form.caseType}
            onChange={(e) => setForm((f) => ({ ...f, caseType: e.target.value as CaseType }))}
            className="w-full h-11 border border-[#E2E8F0] focus:border-[#0D1B2A] outline-none rounded-lg px-3.5 text-sm text-[#0D1B2A] transition-colors bg-white"
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
            className="w-full border border-[#E2E8F0] focus:border-[#0D1B2A] outline-none rounded-lg px-3.5 py-2.5 text-sm text-[#0D1B2A] placeholder:text-[#CBD5E1] transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 border border-[#E2E8F0] text-[#64748B] text-sm rounded-lg hover:border-[#0D1B2A] hover:text-[#0D1B2A] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-10 bg-[#0D1B2A] hover:bg-[#1A3050] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-0.5">Legal Matters</p>
          <h1 className="text-2xl font-bold text-[#0D1B2A]">My Cases</h1>
        </div>
        {user?.role === "CLIENT" && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#0D1B2A] hover:bg-[#1A3050] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Submit Case
          </button>
        )}
      </div>

      {/* Cases list */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16"><PageSpinner /></div>
        ) : cases.length === 0 ? (
          <EmptyState
            title="No cases yet"
            description={user?.role === "CLIENT" ? "Submit your first case to get matched with a verified lawyer." : "No cases have been assigned to you yet."}
            action={
              user?.role === "CLIENT" ? (
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#0D1B2A] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#1A3050] transition-all"
                >
                  Submit your first case
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[1fr_120px_120px_80px] gap-4 px-6 py-3 border-b border-[#F1F5F9] bg-[#FAFAF7]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Case</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Type</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Filed</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Status</p>
            </div>
            <ul className="divide-y divide-[#F1F5F9]">
              {cases.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/cases/${c.id}`}
                    className="flex flex-col md:grid md:grid-cols-[1fr_120px_120px_80px] gap-2 md:gap-4 px-6 py-4 hover:bg-[#FAFAF7] transition-all group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0D1B2A] truncate group-hover:text-[#C9A84C] transition-colors">
                        {c.title}
                      </p>
                      {c.lawyerName && (
                        <p className="text-xs text-[#94A3B8] mt-0.5 truncate">Lawyer: {c.lawyerName}</p>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] self-center">{c.caseType.replace("_", " ")}</p>
                    <p className="text-xs text-[#64748B] self-center">{formatDate(c.createdAt)}</p>
                    <div className="self-center">
                      <StatusBadge status={c.status} variant="case" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
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
