"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { appointmentService, caseService } from "@/lib/services";
import { useToast } from "@/lib/toastContext";
import type { AppointmentResponse, AppointmentStatus, CaseResponse, AppointmentMode } from "@/lib/types";
import StatusPill from "@/components/ui/StatusPill";
import SectionHeader from "@/components/ui/SectionHeader";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import { PageSpinner } from "@/components/ui/Spinner";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Book Appointment Modal ────────────────────────────────────────────────────

function BookModal({ open, onClose, onSuccess }: {
  open: boolean;
  onClose: () => void;
  onSuccess: (a: AppointmentResponse) => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [form, setForm] = useState({
    caseRequestId: "",
    scheduledAt: "",
    durationMinutes: 60,
    mode: "ONLINE" as AppointmentMode,
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    caseService.getMyCases(0, 50).then((d) =>
      setCases(d.content.filter((c) => ["ASSIGNED", "IN_PROGRESS"].includes(c.status)))
    );
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.caseRequestId || !form.scheduledAt) return;
    setLoading(true);
    try {
      const created = await appointmentService.book({
        caseRequestId: Number(form.caseRequestId),
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        durationMinutes: form.durationMinutes,
        mode: form.mode,
        notes: form.notes || undefined,
      });
      toast.success("Appointment booked!");
      onSuccess(created);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to book appointment.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const minDateTime = new Date(Date.now() + 3600_000).toISOString().slice(0, 16);

  return (
    <Modal open={open} onClose={onClose} title="Book Appointment" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5">Case</label>
          <select
            required
            value={form.caseRequestId}
            onChange={(e) => setForm((f) => ({ ...f, caseRequestId: e.target.value }))}
            className="w-full h-11 border border-[#E2E8F0] focus:border-[#C9A84C] outline-none rounded-lg px-3.5 text-sm text-[#0D1B2A] bg-white transition-colors"
          >
            <option value="">Select a case</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          {cases.length === 0 && (
            <p className="text-xs text-[#94A3B8] mt-1">No assigned cases available. A lawyer must be assigned first.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5">Date & Time</label>
            <input
              type="datetime-local"
              required
              min={minDateTime}
              value={form.scheduledAt}
              onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              className="w-full h-11 border border-[#E2E8F0] focus:border-[#C9A84C] outline-none rounded-lg px-3.5 text-sm text-[#0D1B2A] bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5">Duration</label>
            <select
              value={form.durationMinutes}
              onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
              className="w-full h-11 border border-[#E2E8F0] focus:border-[#C9A84C] outline-none rounded-lg px-3.5 text-sm text-[#0D1B2A] bg-white transition-colors"
            >
              <option value={30}>30 mins</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5">Mode</label>
          <div className="grid grid-cols-2 gap-3">
            {(["ONLINE", "IN_PERSON"] as AppointmentMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setForm((f) => ({ ...f, mode: m }))}
                className={`py-2.5 rounded-lg border text-sm font-bold transition-all ${
                  form.mode === m
                    ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#0D1B2A]"
                    : "border-slate-200 text-slate-500 hover:border-[#C9A84C]/50"
                }`}
              >
                {m === "ONLINE" ? "🎥 Online" : "🏢 In Person"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5">Notes (optional)</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Any specific topics or documents to discuss…"
            className="w-full border border-[#E2E8F0] focus:border-[#C9A84C] outline-none rounded-lg px-3.5 py-2.5 text-sm text-[#0D1B2A] placeholder:text-[#CBD5E1] resize-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 h-10 border border-[#E2E8F0] text-slate-500 font-semibold text-sm rounded-lg hover:border-[#0D1B2A] transition-all">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 h-10 bg-[#C9A84C] hover:bg-[#E8C97A] disabled:opacity-60 text-[#0D1B2A] text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
            {loading ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Booking…</> : "Book Appointment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const { user } = useAppSelector((s) => s.auth);
  const { toast } = useToast();
  const [appts, setAppts] = useState<AppointmentResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchAppts = async (p: number) => {
    setLoading(true);
    try {
      const data = await appointmentService.getMyAppointments(p, 10);
      setAppts(data.content);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppts(page); }, [page]);

  const handleStatusUpdate = async (id: number, status: AppointmentStatus) => {
    setUpdatingId(id);
    try {
      const updated = await appointmentService.updateStatus(id, status);
      setAppts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast.success("Appointment updated.");
    } catch {
      toast.error("Failed to update appointment.");
    } finally {
      setUpdatingId(null);
    }
  };

  const canUpdateStatus = user?.role === "LAWYER" || user?.role === "ADMIN";

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <SectionHeader 
          eyebrow="Schedule" 
          title="Appointments" 
          subtitle="Manage your upcoming consultations." 
        />
        {user?.role === "CLIENT" && (
          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#C9A84C] text-[#0D1B2A] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#E8C97A] transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Book Consultation
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16"><PageSpinner /></div>
        ) : appts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#0D1B2A] mb-1">No appointments yet</h3>
            <p className="text-sm text-slate-500 mb-6">
              {user?.role === "CLIENT" ? "Book a consultation with your assigned lawyer." : "No appointments scheduled for you yet."}
            </p>
            {user?.role === "CLIENT" && (
              <button onClick={() => setModalOpen(true)}
                className="bg-[#0D1B2A] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-[#1A3050] transition-colors shadow-sm">
                Book your first appointment
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appts.map((a) => (
              <div key={a.id} className="p-6 hover:bg-[#FAFAF7] transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-[#0D1B2A]">{a.caseTitle}</h3>
                    <StatusPill status={a.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDateTime(a.scheduledAt)}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>{a.durationMinutes} mins</span>
                    <span className="text-slate-300">•</span>
                    <span>{user?.role === "CLIENT" ? `Lawyer: ${a.lawyerName}` : `Client: ${a.clientName}`}</span>
                    <span className="text-slate-300">•</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{a.mode?.replace(/_/g, " ") ?? "—"}</span>
                  </div>
                  {a.notes && (
                    <p className="text-xs text-slate-400 italic mt-2 border-l-2 border-slate-200 pl-2">
                      &quot;{a.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {canUpdateStatus && a.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(a.id, "CONFIRMED")}
                        disabled={updatingId === a.id}
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-emerald-100"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(a.id, "CANCELLED")}
                        disabled={updatingId === a.id}
                        className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-red-100"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {canUpdateStatus && a.status === "CONFIRMED" && (
                    <button
                      onClick={() => handleStatusUpdate(a.id, "COMPLETED")}
                      disabled={updatingId === a.id}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-blue-100"
                    >
                      Mark Complete
                    </button>
                  )}
                  {user?.role === "CLIENT" && a.status === "PENDING" && (
                    <button
                      onClick={() => handleStatusUpdate(a.id, "CANCELLED")}
                      disabled={updatingId === a.id}
                      className="text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-slate-200 hover:border-red-200 hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <BookModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(a) => setAppts((prev) => [a, ...prev])}
      />
    </div>
  );
}
