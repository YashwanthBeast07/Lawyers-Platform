"use client";

import { useEffect, useState, FormEvent, Suspense } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { appointmentService, caseService, lawyerService, paymentService } from "@/lib/services";
import { useToast } from "@/lib/toastContext";
import type { AppointmentResponse, AppointmentStatus, CaseResponse, AppointmentMode, LawyerProfileResponse } from "@/lib/types";
import StatusPill from "@/components/ui/StatusPill";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import { PageSpinner } from "@/components/ui/Spinner";
import { useSearchParams } from "next/navigation";
import { Video, Building } from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatTimeOnly(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ── Form Field ──────────────────────────────────────────────────────────────────

function FormField({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div>
      <label
        className="block text-[11px] font-bold uppercase tracking-[0.08em] mb-2"
        style={{ color: "var(--text-muted)" }}
      >
        {label} {required && <span style={{ color: "var(--gold)" }}>*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-xs mt-1.5" style={{ color: "var(--text-light)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ── Book Appointment Modal ────────────────────────────────────────────────────

function BookModal({ open, onClose, onSuccess, requestedLawyerId }: {
  open: boolean;
  onClose: () => void;
  onSuccess: (a: AppointmentResponse) => void;
  requestedLawyerId?: number | null;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [lawyers, setLawyers] = useState<LawyerProfileResponse[]>([]);
  const [selectedLawyerId, setSelectedLawyerId] = useState<number | "">("");
  const [form, setForm] = useState({
    caseRequestId: "",
    scheduledAt: "",
    durationMinutes: 60,
    mode: "ONLINE" as AppointmentMode,
    notes: "",
  });

  // Fetch lawyers if requestedLawyerId not passed
  useEffect(() => {
    if (!open) return;
    if (!requestedLawyerId) {
      lawyerService.getVerifiedLawyers(undefined, 0, 50).then((d) => {
        setLawyers(d.content);
      }).catch(() => {});
    }
  }, [open, requestedLawyerId]);

  useEffect(() => {
    if (!open) return;
    caseService.getMyCases(0, 50).then((d) => {
      const activeLawyerId = requestedLawyerId || (selectedLawyerId ? Number(selectedLawyerId) : null);
      const activeStatuses = ["OPEN", "ASSIGNED", "IN_PROGRESS"];
      if (activeLawyerId) {
        setCases(d.content.filter((c) =>
          activeStatuses.includes(c.status) &&
          (c.lawyerId === activeLawyerId || !c.lawyerId)
        ));
      } else {
        setCases(d.content.filter((c) => activeStatuses.includes(c.status)));
      }
    });
  }, [open, requestedLawyerId, selectedLawyerId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.caseRequestId || !form.scheduledAt) return;
    const activeLawyerId = requestedLawyerId || (selectedLawyerId ? Number(selectedLawyerId) : null);
    if (!activeLawyerId) {
      toast.error("Please select a lawyer first.");
      return;
    }
    const selectedTime = new Date(form.scheduledAt).getTime();
    const minAllowedTime = Date.now() + 30 * 60000;
    if (selectedTime < minAllowedTime) {
      toast.error("Appointments must be scheduled at least 30 minutes in the future.");
      return;
    }
    setLoading(true);
    try {
      const selectedCase = cases.find((c) => c.id === Number(form.caseRequestId));
      if (selectedCase && !selectedCase.lawyerId) {
        await caseService.assignLawyer(selectedCase.id, { lawyerId: activeLawyerId });
      }
      const created = await appointmentService.book({
        caseRequestId: Number(form.caseRequestId),
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        durationMinutes: form.durationMinutes,
        mode: form.mode,
        notes: form.notes || undefined,
      });
      toast.success("Appointment booked successfully!");
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
    <Modal open={open} onClose={onClose} title="Book Consultation" subtitle="Schedule a meeting with your lawyer." size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {!requestedLawyerId && (
          <FormField label="Select Lawyer" required>
            <select
              required
              value={selectedLawyerId}
              onChange={(e) => {
                setSelectedLawyerId(e.target.value ? Number(e.target.value) : "");
                setForm((f) => ({ ...f, caseRequestId: "" }));
              }}
              className="input-field"
            >
              <option value="">Choose a verified advocate</option>
              {lawyers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.fullName} — {l.specialization || "General Practice"} (Consultation: ₹{l.hourlyRate ? Number(l.hourlyRate).toLocaleString("en-IN") : "0"})
                </option>
              ))}
            </select>
          </FormField>
        )}

        {(() => {
          const activeId = requestedLawyerId || (selectedLawyerId ? Number(selectedLawyerId) : null);
          const lawyer = lawyers.find(l => l.id === activeId);
          const fee = lawyer ? lawyer.hourlyRate : null;
          if (!fee) return null;
          return (
            <div className="rounded-xl p-3 flex items-center justify-between text-xs font-semibold" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.18)", color: "var(--gold-dark)" }}>
              <span>Consultation Fee:</span>
              <span className="font-bold text-sm">₹{Number(fee).toLocaleString("en-IN")}</span>
            </div>
          );
        })()}

        <FormField
          label="Select Case"
          required
          hint={cases.length === 0 ? "No active cases found for the selected lawyer." : undefined}
        >
          <select
            required
            value={form.caseRequestId}
            onChange={(e) => setForm((f) => ({ ...f, caseRequestId: e.target.value }))}
            className="input-field"
          >
            <option value="">Select a case</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date & Time" required>
            <input
              type="datetime-local"
              required
              min={minDateTime}
              value={form.scheduledAt}
              onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              className="input-field"
            />
          </FormField>
          <FormField label="Duration">
            <select
              value={form.durationMinutes}
              onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
              className="input-field"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </FormField>
        </div>

        <FormField label="Meeting Mode">
          <div className="grid grid-cols-2 gap-3">
            {(["ONLINE", "IN_PERSON"] as AppointmentMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setForm((f) => ({ ...f, mode: m }))}
                className="py-3 rounded-xl text-sm font-semibold transition-all"
                style={
                  form.mode === m
                    ? {
                        background: "rgba(201,168,76,0.1)",
                        border: "2px solid var(--gold)",
                        color: "var(--navy)",
                      }
                    : {
                        background: "var(--surface)",
                        border: "1.5px solid var(--border)",
                        color: "var(--text-muted)",
                      }
                }
              >
                <span className="flex items-center justify-center gap-2">
                  {m === "ONLINE" ? (
                    <>
                      <Video className="w-4 h-4" />
                      Online
                    </>
                  ) : (
                    <>
                      <Building className="w-4 h-4" />
                      In Person
                    </>
                  )}
                </span>
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Notes (optional)">
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Any specific topics or documents to prepare for this consultation…"
            className="input-field"
            style={{ height: "auto", padding: "10px 14px", resize: "none" }}
          />
        </FormField>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? (
              <>
                <div
                  className="w-4 h-4 border-2 border-t-transparent rounded-full"
                  style={{ borderColor: "var(--navy)", borderTopColor: "transparent", animation: "spin 0.75s linear infinite" }}
                />
                Booking…
              </>
            ) : (
              "Book Appointment"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Appointment Card ──────────────────────────────────────────────────────────

function ApptCard({
  a,
  user,
  onUpdate,
  updating,
  onPaymentSuccess,
}: {
  a: AppointmentResponse;
  user: { role: string } | null;
  onUpdate: (id: number, status: AppointmentStatus) => void;
  updating: boolean;
  onPaymentSuccess?: () => void;
}) {
  const { toast } = useToast();
  const [paying, setPaying] = useState(false);
  const canUpdateStatus = user?.role === "LAWYER" || user?.role === "ADMIN";

  const scheduledTime = new Date(a.scheduledAt).getTime();
  const endTime = scheduledTime + a.durationMinutes * 60 * 1000;
  const isTimeOver = Date.now() >= endTime;

  const openCheckout = async (
    orderId: string,
    keyId: string,
    amt: number,
    currency: string
  ) => {
    const rzp = new (window as any).Razorpay({
      key: keyId,
      order_id: orderId,
      amount: amt * 100,
      currency,
      name: "GoLawyers",
      description: "Consultation Appointment Fee",
      theme: { color: "#C9A84C" },
      handler: async (response: any) => {
        try {
          await paymentService.verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          toast.success("Consultation fee payment successful!");
          if (onPaymentSuccess) onPaymentSuccess();
        } catch {
          toast.error("Payment verification failed.");
        }
        setPaying(false);
      },
      modal: { ondismiss: () => setPaying(false) },
    });
    rzp.open();
  };

  const handlePay = async () => {
    if (!a.consultationFee) return;
    setPaying(true);
    try {
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = () => resolve();
          document.head.appendChild(s);
        });
      }
      const order = await paymentService.createOrder({
        caseRequestId: a.caseRequestId,
        amount: a.consultationFee,
        appointmentId: a.id,
      });
      await openCheckout(order.razorpayOrderId, order.razorpayKeyId, order.amount, order.currency);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to initiate payment.";
      toast.error(msg);
      setPaying(false);
    }
  };

  return (
    <div
      className="p-5 transition-colors"
      style={{ borderBottom: "1px solid var(--border-light)" }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="flex items-start gap-4">
          {/* Calendar visual */}
          <div
            className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-center"
            style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wide leading-none" style={{ color: "var(--gold)" }}>
              {formatDateShort(a.scheduledAt).split(" ")[1]}
            </p>
            <p className="text-xl font-black leading-tight" style={{ color: "var(--text)" }}>
              {formatDateShort(a.scheduledAt).split(" ")[0]}
            </p>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-sm" style={{ color: "var(--text)" }}>
                {a.caseTitle}
              </h3>
              <StatusPill status={a.status} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTimeOnly(a.scheduledAt)} · {a.durationMinutes} mins
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                {user?.role === "CLIENT" ? `Adv. ${a.lawyerName}` : `Client: ${a.clientName}`}
              </span>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-lg"
                style={{ background: "var(--bg)", color: "var(--text-muted)" }}
              >
                {a.mode?.replace(/_/g, " ")}
              </span>
              {a.consultationFee !== undefined && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.879A1.5 1.5 0 0013 15v-1a1.5 1.5 0 011-1.5M12 6v12" />
                  </svg>
                  Consultation Fee: ₹{Number(a.consultationFee).toLocaleString("en-IN")} · 
                  <span className={`font-bold ${a.feePaid ? "text-green-600" : "text-amber-600"}`}>
                    {a.feePaid ? "Paid" : "Unpaid"}
                  </span>
                </span>
              )}
            </div>
            {a.notes && (
              <p
                className="text-xs mt-2 italic border-l-2 pl-2"
                style={{ color: "var(--text-light)", borderColor: "var(--border)" }}
              >
                &ldquo;{a.notes}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {canUpdateStatus && a.status === "CONFIRMED" && (
            isTimeOver ? (
              <button
                onClick={() => onUpdate(a.id, "COMPLETED")}
                disabled={updating}
                className="text-xs font-bold px-3 py-2 rounded-lg transition-all"
                style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
                onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.background = "#DBEAFE")}
                onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.background = "#EFF6FF")}
              >
                Mark Complete
              </button>
            ) : (
              <button
                onClick={() => onUpdate(a.id, "CANCELLED")}
                disabled={updating}
                className="text-xs font-bold px-3 py-2 rounded-lg transition-all"
                style={{ background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" }}
                onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.background = "#FEE2E2")}
                onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.background = "#FEF2F2")}
              >
                ✕ Cancel Consultation
              </button>
            )
          )}
          {user?.role === "CLIENT" && !a.feePaid && a.consultationFee && ["PENDING", "CONFIRMED"].includes(a.status) && (
            <button
              onClick={handlePay}
              disabled={paying}
              className="text-xs font-bold px-3 py-2 rounded-lg transition-all"
              style={{ background: "rgba(201,168,76,0.12)", color: "var(--gold-dark)", border: "1px solid rgba(201,168,76,0.22)" }}
              onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.2)")}
              onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.12)")}
            >
              {paying ? "Paying…" : "Pay Fee"}
            </button>
          )}
          {user?.role === "CLIENT" && ["PENDING", "CONFIRMED"].includes(a.status) && !isTimeOver && (
            <button
              onClick={() => onUpdate(a.id, "CANCELLED")}
              disabled={updating}
              className="text-xs font-bold px-3 py-2 rounded-lg transition-all"
              style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
              onMouseOver={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "#FEF2F2";
                el.style.color = "#B91C1C";
                el.style.borderColor = "#FECACA";
              }}
              onMouseOut={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "var(--surface)";
                el.style.color = "var(--text-muted)";
                el.style.borderColor = "var(--border)";
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function AppointmentsPageContent() {
  const { user } = useAppSelector((s) => s.auth);
  const { toast } = useToast();
  const [appts, setAppts] = useState<AppointmentResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const requestedLawyerId = searchParams.get("lawyerId") ? Number(searchParams.get("lawyerId")) : null;

  useEffect(() => {
    if (requestedLawyerId) setModalOpen(true);
  }, [requestedLawyerId]);

  const fetchAppts = async (p: number, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await appointmentService.getMyAppointments(p, 10);
      setAppts(data.content);
      setTotalPages(data.totalPages);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppts(page);
    const interval = setInterval(() => {
      fetchAppts(page, true);
    }, 8000);
    return () => clearInterval(interval);
  }, [page]);

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

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] mb-1" style={{ color: "var(--gold)" }}>
            Schedule
          </p>
          <h1 className="text-2xl font-black" style={{ color: "var(--text)" }}>
            Appointments
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Manage your upcoming consultations and meetings.
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
            Book Consultation
          </button>
        )}
      </div>

      {/* Appointments List */}
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
        ) : appts.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--bg)", color: "var(--text-light)" }}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base" style={{ color: "var(--text)" }}>
                No appointments yet
              </h3>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                {user?.role === "CLIENT"
                  ? "Book a consultation with your assigned lawyer."
                  : "No appointments have been scheduled for you yet."}
              </p>
            </div>
            {user?.role === "CLIENT" && (
              <button onClick={() => setModalOpen(true)} className="btn-secondary mt-1">
                Book your first appointment
              </button>
            )}
          </div>
        ) : (
          <div>
            {appts.map((a) => (
              <ApptCard
                key={a.id}
                a={a}
                user={user}
                onUpdate={handleStatusUpdate}
                updating={updatingId === a.id}
                onPaymentSuccess={() => fetchAppts(page, true)}
              />
            ))}
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <BookModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(a) => setAppts((prev) => [a, ...prev])}
        requestedLawyerId={requestedLawyerId}
      />
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="py-20"><PageSpinner /></div>}>
      <AppointmentsPageContent />
    </Suspense>
  );
}
