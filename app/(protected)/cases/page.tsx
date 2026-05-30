"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import { caseService } from "@/lib/services";
import { useToast } from "@/lib/toastContext";
import type { CaseResponse, CaseRequestDto, CaseType } from "@/lib/types";
import StatusPill from "@/components/ui/StatusPill";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import { PageSpinner } from "@/components/ui/Spinner";

// ── Helpers ────────────────────────────────────────────────────────────────────

const CASE_TYPES: CaseType[] = ["CIVIL", "CRIMINAL", "CORPORATE", "FAMILY", "PROPERTY", "CYBER", "OTHER"];

const CASE_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  CIVIL:     { bg: "#EFF6FF", text: "#1D4ED8" },
  CRIMINAL:  { bg: "#FEF2F2", text: "#B91C1C" },
  CORPORATE: { bg: "#F0FDF4", text: "#15803D" },
  FAMILY:    { bg: "#FDF4FF", text: "#7E22CE" },
  PROPERTY:  { bg: "#FFFBEB", text: "#B45309" },
  CYBER:     { bg: "#F0F9FF", text: "#0369A1" },
  OTHER:     { bg: "#F9FAFB", text: "#374151" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ── Form Field Component ───────────────────────────────────────────────────────

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block text-[11px] font-bold uppercase tracking-[0.08em] mb-2"
        style={{ color: "var(--text-muted)" }}
      >
        {label} {required && <span style={{ color: "var(--gold)" }}>*</span>}
      </label>
      {children}
    </div>
  );
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
    <Modal open={open} onClose={onClose} title="Submit New Case" subtitle="Describe your legal matter to get matched with the right advocate." size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Case Title" required>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Property dispute in Bengaluru"
            className="input-field"
          />
        </FormField>

        <FormField label="Case Type" required>
          <select
            value={form.caseType}
            onChange={(e) => setForm((f) => ({ ...f, caseType: e.target.value as CaseType }))}
            className="input-field"
            style={{ cursor: "pointer" }}
          >
            {CASE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Description" required>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describe your legal issue in detail. The more context you provide, the better matched you'll be with an advocate."
            className="input-field"
            style={{ height: "auto", padding: "10px 14px", resize: "none" }}
          />
        </FormField>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? (
              <>
                <div
                  className="w-4 h-4 border-2 border-t-transparent rounded-full"
                  style={{ borderColor: "var(--navy)", borderTopColor: "transparent", animation: "spin 0.75s linear infinite" }}
                />
                Submitting…
              </>
            ) : (
              "Submit Case"
            )}
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
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] mb-1" style={{ color: "var(--gold)" }}>
            My Cases
          </p>
          <h1 className="text-2xl font-black" style={{ color: "var(--text)" }}>
            Legal Matters
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {user?.role === "CLIENT" ? "Manage and track your active cases." : "Cases assigned to you."}
          </p>
        </div>
        {user?.role === "CLIENT" && (
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary self-start md:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Case
          </button>
        )}
      </div>

      {/* Cases Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {loading ? (
          <div className="py-20">
            <PageSpinner />
          </div>
        ) : cases.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--bg)", color: "var(--text-light)" }}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base" style={{ color: "var(--text)" }}>
                No cases yet
              </h3>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                {user?.role === "CLIENT"
                  ? "Submit your first case to get matched with a verified advocate."
                  : "No cases have been assigned to you yet."}
              </p>
            </div>
            {user?.role === "CLIENT" && (
              <button
                onClick={() => setModalOpen(true)}
                className="btn-secondary mt-1"
              >
                Submit your first case
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div
              className="hidden md:grid grid-cols-12 px-6 py-3"
              style={{
                background: "var(--surface-2)",
                borderBottom: "1px solid var(--border-light)",
              }}
            >
              <p className="col-span-5 text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: "var(--text-light)" }}>
                Case
              </p>
              <p className="col-span-2 text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: "var(--text-light)" }}>
                Type
              </p>
              <p className="col-span-2 text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: "var(--text-light)" }}>
                Status
              </p>
              <p className="col-span-2 text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: "var(--text-light)" }}>
                Filed
              </p>
              <p className="col-span-1 text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: "var(--text-light)" }}>
                &nbsp;
              </p>
            </div>

            <div>
              {cases.map((c, idx) => {
                const typeColor = CASE_TYPE_COLORS[c.caseType] ?? CASE_TYPE_COLORS.OTHER;
                return (
                  <Link
                    key={c.id}
                    href={`/cases/${c.id}`}
                    className="flex flex-col md:grid md:grid-cols-12 items-start md:items-center px-6 py-4 group transition-colors"
                    style={{
                      borderBottom: idx < cases.length - 1 ? "1px solid var(--border-light)" : "none",
                    }}
                    onMouseOver={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
                    }}
                    onMouseOut={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    {/* Case name */}
                    <div className="col-span-5 flex items-center gap-3 mb-2 md:mb-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black flex-shrink-0"
                        style={{ background: "var(--bg)", color: "var(--text-muted)" }}
                      >
                        #{c.id}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="font-semibold text-sm truncate transition-colors"
                          style={{ color: "var(--text)" }}
                        >
                          {c.title}
                        </p>
                        {c.lawyerName && (
                          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-light)" }}>
                            Lawyer: {c.lawyerName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Type */}
                    <div className="col-span-2 mb-2 md:mb-0">
                      <span
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                        style={{ background: typeColor.bg, color: typeColor.text }}
                      >
                        {c.caseType?.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 mb-2 md:mb-0">
                      <StatusPill status={c.status} />
                    </div>

                    {/* Filed date */}
                    <div className="col-span-2">
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {formatDate(c.createdAt)}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="col-span-1 hidden md:flex justify-end">
                      <svg
                        className="w-4 h-4 opacity-25 group-hover:opacity-60 transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        style={{ color: "var(--text)" }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
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
