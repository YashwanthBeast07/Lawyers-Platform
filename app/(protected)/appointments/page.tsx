"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { appointmentService, caseService } from "@/lib/services";
import { useToast } from "@/lib/toastContext";
import type { AppointmentResponse, AppointmentStatus, CaseResponse, AppointmentMode } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
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

  // Min datetime = now + 1 hour
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
            className="w-full h-11 border border-[#E2E8F0] focus:border-[#0D1B2A] outline-none rounded-lg px-3.5 text-sm text-[#0D1B2A] bg-white transition-colors"
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
              className="w-full h-11 border border-[#E2E8F0] focus:border-[#0D1B2A] outline-none rounded-lg px-3.5 text-sm text-[#0D1B2A] bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#0D1B2A] mb-1.5">Duration</label>
            <select
              value={form.durationMinutes}
              onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
              className="w-full h-11 border border-[#E2E8F0] focus:border-[#0D1B2A] outline-none rounded-lg px-3.5 text-sm text-[#0D1B2A] bg-white transition-colors"
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
                className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  form.mode === m
                    ? "border-[#0D1B2A] bg-[#0D1B2A] text-white"
                    : "border-[#E2E8F0] text-[#64748B] hover:border-[#0D1B2A]/30"
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
            className="w-full border border-[#E2E8F0] focus:border-[#0D1B2A] outline-none rounded-lg px-3.5 py-2.5 text-sm text-[#0D1B2A] placeholder:text-[#CBD5E1] resize-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 h-10 border border-[#E2E8F0] text-[#64748B] text-sm rounded-lg hover:border-[#0D1B2A] transition-all">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 h-10 bg-[#0D1B2A] hover:bg-[#1A3050] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-0.5">Schedule</p>
          <h1 className="text-2xl font-bold text-[#0D1B2A]">Appointments</h1>
        </div>
        {user?.role === "CLIENT" && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#0D1B2A] hover:bg-[#1A3050] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Book Appointment
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16"><PageSpinner /></div>
        ) : appts.length === 0 ? (
          <EmptyState
            title="No appointments yet"
            description={user?.role === "CLIENT" ? "Book a consultation with your assigned lawyer." : "No appointments scheduled for you yet."}
            action={
              user?.role === "CLIENT" ? (
                <button onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#0D1B2A] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#1A3050] transition-all">
                  Book your first appointment
                </button>
              ) : undefined
            }
          />
        ) : (
          <ul className="divide-y divide-[#F1F5F9]">
            {appts.map((a) => (
              <li key={a.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-[#0D1B2A]">{a.caseTitle}</p>
                      <StatusBadge status={a.status} variant="appointment" />
                    </div>
                    <p className="text-xs text-[#64748B]">
                      {user?.role === "CLIENT" ? `With ${a.lawyerName}` : `Client: ${a.clientName}`}
                      {" · "}{formatDateTime(a.scheduledAt)}
                      {" · "}{a.durationMinutes} mins
                      {" · "}{a.mode.replace("_", " ")}
                    </p>
                    {a.notes && (
                      <p className="text-xs text-[#94A3B8] mt-1 italic">&quot;{a.notes}&quot;</p>
                    )}
                  </div>

                  {/* Action buttons */}
                  {canUpdateStatus && a.status === "PENDING" && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleStatusUpdate(a.id, "CONFIRMED")}
                        disabled={updatingId === a.id}
                        className="text-xs font-medium px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-all"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(a.id, "CANCELLED")}
                        disabled={updatingId === a.id}
                        className="text-xs font-medium px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {canUpdateStatus && a.status === "CONFIRMED" && (
                    <button
                      onClick={() => handleStatusUpdate(a.id, "COMPLETED")}
                      disabled={updatingId === a.id}
                      className="shrink-0 text-xs font-medium px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-all"
                    >
                      Mark Complete
                    </button>
                  )}
                  {user?.role === "CLIENT" && a.status === "PENDING" && (
                    <button
                      onClick={() => handleStatusUpdate(a.id, "CANCELLED")}
                      disabled={updatingId === a.id}
                      className="shrink-0 text-xs font-medium px-3 py-1.5 border border-[#E2E8F0] text-[#64748B] rounded-lg hover:border-red-200 hover:text-red-600 disabled:opacity-50 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
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
