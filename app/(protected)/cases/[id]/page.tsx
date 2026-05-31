"use client";

import { useEffect, useState, FormEvent, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import { caseService, paymentService } from "@/lib/services";
import { useToast } from "@/lib/toastContext";
import type {
  CaseResponse,
  CaseStatus,
  PaymentResponse,
  CaseMessageResponse,
  CaseHearing,
  CaseTask,
  CaseMilestone,
  CaseAuditEntry,
} from "@/lib/types";
import StatusPill from "@/components/ui/StatusPill";
import { PageSpinner } from "@/components/ui/Spinner";
import {
  FileText, User as UserIcon, Activity, CheckCircle, Lock,
  Gavel, Scale, Clock, AlertTriangle, MessageSquare,
  Calendar, ListChecks, CreditCard, BookOpen, History,
  ChevronRight, Plus, Check, UploadCloud, Download, X,
  Info, ArrowUpRight,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(iso: string | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
function fmtCurrency(n: number | undefined) {
  if (n == null) return "—";
  return "₹" + n.toLocaleString("en-IN");
}

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  DRAFT: "Draft",
  AWAITING_CLIENT_REVIEW: "Awaiting Your Review",
  AWAITING_DOCUMENTS: "Awaiting Documents",
  UNDER_REVIEW: "Under Review",
  AWAITING_PAYMENT: "Awaiting Payment",
  ASSIGNED: "Assigned",
  ACTIVE: "Active",
  AWAITING_CLIENT_ACTION: "Action Required",
  FILING_IN_PROGRESS: "Filing In Progress",
  FILED: "Filed",
  HEARING_SCHEDULED: "Hearing Scheduled",
  AWAITING_COURT_UPDATE: "Awaiting Court Update",
  NEGOTIATION: "Negotiation",
  SETTLEMENT_PROPOSED: "Settlement Proposed",
  RESOLVED: "Resolved",
  AWAITING_FINAL_PAYMENT: "Awaiting Final Payment",
  IN_PROGRESS: "In Progress",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
  DISPUTED: "Disputed",
  CANCELLED: "Cancelled",
};

/** Milestones in the case stepper (shown as progress bar) */
const STEPPER_MILESTONES: { label: string; status: CaseStatus }[] = [
  { label: "Filed", status: "OPEN" },
  { label: "Assigned", status: "ASSIGNED" },
  { label: "Active", status: "ACTIVE" },
  { label: "Filed in Court", status: "FILED" },
  { label: "Hearing", status: "HEARING_SCHEDULED" },
  { label: "Resolved", status: "RESOLVED" },
  { label: "Closed", status: "CLOSED" },
];

const STEPPER_ORDER: CaseStatus[] = [
  "OPEN", "DRAFT", "AWAITING_CLIENT_REVIEW", "AWAITING_DOCUMENTS", "UNDER_REVIEW",
  "AWAITING_PAYMENT", "ASSIGNED", "ACTIVE", "AWAITING_CLIENT_ACTION",
  "FILING_IN_PROGRESS", "FILED", "HEARING_SCHEDULED", "AWAITING_COURT_UPDATE",
  "NEGOTIATION", "SETTLEMENT_PROPOSED", "RESOLVED", "AWAITING_FINAL_PAYMENT",
  "IN_PROGRESS", "CLOSED", "ARCHIVED",
];

function getStepperIdx(status: CaseStatus) {
  const idx = STEPPER_ORDER.indexOf(status);
  return idx < 0 ? 0 : idx;
}

// Allowed lawyer/admin transitions
const NEXT_STATUSES_LAWYER: Record<string, CaseStatus[]> = {
  OPEN: ["DRAFT"],
  DRAFT: ["AWAITING_CLIENT_REVIEW"],
  AWAITING_DOCUMENTS: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["AWAITING_PAYMENT", "AWAITING_DOCUMENTS"],
  ACTIVE: ["FILING_IN_PROGRESS", "NEGOTIATION", "AWAITING_CLIENT_ACTION", "CANCELLED"],
  FILING_IN_PROGRESS: ["FILED"],
  FILED: [],
  HEARING_SCHEDULED: ["AWAITING_COURT_UPDATE"],
  AWAITING_COURT_UPDATE: ["RESOLVED", "HEARING_SCHEDULED"],
  NEGOTIATION: ["SETTLEMENT_PROPOSED", "ACTIVE"],
  SETTLEMENT_PROPOSED: ["RESOLVED"],
  RESOLVED: [],
  ASSIGNED: ["ACTIVE"],
  IN_PROGRESS: ["RESOLVED", "CANCELLED"],
};
const NEXT_STATUSES_CLIENT: Record<string, CaseStatus[]> = {
  AWAITING_CLIENT_REVIEW: [],   // handled by accept fee button
  DISPUTED: [],
  CLOSED: ["DISPUTED"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Razorpay types
// ─────────────────────────────────────────────────────────────────────────────
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab definitions
// ─────────────────────────────────────────────────────────────────────────────
type Tab = "overview" | "hearings" | "tasks" | "milestones" | "documents" | "messages" | "audit";
const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview",   label: "Overview",   icon: FileText },
  { id: "hearings",   label: "Hearings",   icon: Gavel },
  { id: "tasks",      label: "Tasks",      icon: ListChecks },
  { id: "milestones", label: "Payments",   icon: CreditCard },
  { id: "documents",  label: "Documents",  icon: BookOpen },
  { id: "messages",   label: "Messages",   icon: MessageSquare },
  { id: "audit",      label: "Activity",   icon: History },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub‑panel: Hearings
// ─────────────────────────────────────────────────────────────────────────────
function HearingsPanel({ caseId, canEdit, onRefresh }: { caseId: number; canEdit: boolean; onRefresh: () => void }) {
  const { toast } = useToast();
  const [hearings, setHearings] = useState<CaseHearing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ hearingDate: "", hearingTime: "", court: "", purpose: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    caseService.getHearings(caseId).then(setHearings).catch(() => {}).finally(() => setLoading(false));
  }, [caseId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const h = await caseService.addHearing(caseId, {
        hearingDate: form.hearingDate, hearingTime: form.hearingTime || undefined,
        court: form.court, purpose: form.purpose,
      });
      setHearings(p => [...p, h]);
      setShowAdd(false);
      setForm({ hearingDate: "", hearingTime: "", court: "", purpose: "" });
      toast.success("Hearing added");
      onRefresh();
    } catch { toast.error("Failed to add hearing"); } finally { setSaving(false); }
  };

  if (loading) return <div className="h-20 rounded-xl skeleton" />;
  return (
    <div className="space-y-4">
      {canEdit && (
        <button onClick={() => setShowAdd(p => !p)} className="btn-secondary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Hearing
        </button>
      )}
      {showAdd && (
        <form onSubmit={submit} className="rounded-2xl p-5 space-y-4 animate-slide-up"
          style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>New Hearing</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Hearing Date *</label>
              <input type="date" required className="input-field w-full" value={form.hearingDate}
                onChange={e => setForm(p => ({ ...p, hearingDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Time</label>
              <input type="time" className="input-field w-full" value={form.hearingTime}
                onChange={e => setForm(p => ({ ...p, hearingTime: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Court / Authority</label>
              <input type="text" className="input-field w-full" placeholder="e.g. Bombay High Court"
                value={form.court} onChange={e => setForm(p => ({ ...p, court: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Purpose</label>
              <input type="text" className="input-field w-full" placeholder="e.g. Arguments"
                value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? "Saving…" : "Save Hearing"}</button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}
      {hearings.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
          <Gavel className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--text-light)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No hearings scheduled yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hearings.map(h => (
            <div key={h.id} className="rounded-2xl p-5 flex items-start gap-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(201,168,76,0.12)", color: "var(--gold-dark)" }}>
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: "var(--text)" }}>{fmtDate(h.hearingDate)} {h.hearingTime && `· ${h.hearingTime}`}</p>
                {h.court && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{h.court}</p>}
                {h.purpose && <p className="text-xs mt-0.5 italic" style={{ color: "var(--text-light)" }}>{h.purpose}</p>}
                {h.outcome && (
                  <div className="mt-2 rounded-lg px-3 py-2 text-xs font-semibold"
                    style={{ background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0" }}>
                    Outcome: {h.outcome}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub‑panel: Tasks
// ─────────────────────────────────────────────────────────────────────────────
function TasksPanel({ caseId, canEdit }: { caseId: number; canEdit: boolean }) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<CaseTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    caseService.getTasks(caseId).then(setTasks).catch(() => {}).finally(() => setLoading(false));
  }, [caseId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const t = await caseService.createTask(caseId, { title: form.title, description: form.description, dueDate: form.dueDate || undefined });
      setTasks(p => [...p, t]);
      setShowAdd(false);
      setForm({ title: "", description: "", dueDate: "" });
      toast.success("Task created");
    } catch { toast.error("Failed to create task"); } finally { setSaving(false); }
  };

  const complete = async (taskId: number) => {
    try {
      const updated = await caseService.completeTask(taskId);
      setTasks(p => p.map(t => t.id === taskId ? updated : t));
      toast.success("Task marked complete");
    } catch { toast.error("Failed to complete task"); }
  };

  if (loading) return <div className="h-20 rounded-xl skeleton" />;
  return (
    <div className="space-y-4">
      {canEdit && (
        <button onClick={() => setShowAdd(p => !p)} className="btn-secondary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      )}
      {showAdd && (
        <form onSubmit={submit} className="rounded-2xl p-5 space-y-4 animate-slide-up"
          style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>New Task</p>
          <div className="grid gap-3">
            <input type="text" required placeholder="Task title *" className="input-field w-full"
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <textarea placeholder="Description (optional)" className="input-field w-full resize-none" rows={2}
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Due Date</label>
              <input type="date" className="input-field w-full" value={form.dueDate}
                onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? "Saving…" : "Create Task"}</button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}
      {tasks.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
          <ListChecks className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--text-light)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No tasks yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.id} className="rounded-xl p-4 flex items-start gap-3 transition-all"
              style={{ background: t.completed ? "#F0FDF4" : "var(--surface)", border: `1px solid ${t.completed ? "#A7F3D0" : "var(--border-light)"}` }}>
              <button onClick={() => !t.completed && complete(t.id)}
                className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                style={{ background: t.completed ? "#10B981" : "var(--bg)", border: `2px solid ${t.completed ? "#10B981" : "var(--border)"}` }}>
                {t.completed && <Check className="w-3 h-3" style={{ color: "white" }} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: t.completed ? "#065F46" : "var(--text)", textDecoration: t.completed ? "line-through" : "none" }}>{t.title}</p>
                {t.description && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t.description}</p>}
                {t.dueDate && <p className="text-xs mt-1 font-medium" style={{ color: "var(--text-light)" }}>Due: {fmtDate(t.dueDate)}</p>}
              </div>
              {t.completedAt && <span className="text-xs flex-shrink-0" style={{ color: "#10B981" }}>Done {fmtDate(t.completedAt)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub‑panel: Milestones / Payments
// ─────────────────────────────────────────────────────────────────────────────
function MilestonesPanel({ caseId, canEdit, isClient }: { caseId: number; canEdit: boolean; isClient: boolean }) {
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<CaseMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", dueDate: "" });
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState<number | null>(null);

  const load = useCallback(() => {
    caseService.getMilestones(caseId).then(setMilestones).catch(() => {}).finally(() => setLoading(false));
  }, [caseId]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true);
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) { toast.error("Enter a valid amount"); setSaving(false); return; }
    try {
      const m = await caseService.createMilestone(caseId, {
        title: form.title, amount: amt, dueDate: form.dueDate || undefined,
      });
      setMilestones(p => [...p, m]);
      setShowAdd(false);
      setForm({ title: "", amount: "", dueDate: "" });
      toast.success("Milestone added");
    } catch { toast.error("Failed to create milestone"); } finally { setSaving(false); }
  };

  const handlePay = async (milestoneId: number, amount: number) => {
    setPaying(milestoneId);
    try {
      if (!window.Razorpay) {
        await new Promise<void>(resolve => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = () => resolve();
          document.head.appendChild(s);
        });
      }
      const order = await paymentService.createOrder({ caseRequestId: caseId, amount });
      const rzp = new window.Razorpay({
        key: order.razorpayKeyId, order_id: order.razorpayOrderId,
        amount: amount * 100, currency: order.currency,
        name: "GoLawyers", description: "Case Milestone Payment",
        theme: { color: "#C9A84C" },
        handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          await paymentService.verifyPayment({
            razorpayOrderId: resp.razorpay_order_id,
            razorpayPaymentId: resp.razorpay_payment_id,
            razorpaySignature: resp.razorpay_signature,
          });
          toast.success("Payment successful!");
          load();
          setPaying(null);
        },
        modal: { ondismiss: () => setPaying(null) },
      });
      rzp.open();
    } catch { toast.error("Failed to initiate payment"); setPaying(null); }
  };

  const total = milestones.reduce((s, m) => s + m.amount, 0);
  const paid = milestones.filter(m => m.paid).reduce((s, m) => s + m.amount, 0);

  if (loading) return <div className="h-20 rounded-xl skeleton" />;
  return (
    <div className="space-y-4">
      {milestones.length > 0 && (
        <div className="rounded-2xl p-5 flex gap-6"
          style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.02))", border: "1.5px solid rgba(201,168,76,0.2)" }}>
          <div><p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Total</p>
            <p className="text-xl font-black" style={{ color: "var(--text)" }}>{fmtCurrency(total)}</p></div>
          <div><p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Paid</p>
            <p className="text-xl font-black" style={{ color: "#10B981" }}>{fmtCurrency(paid)}</p></div>
          <div><p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Pending</p>
            <p className="text-xl font-black" style={{ color: "#F59E0B" }}>{fmtCurrency(total - paid)}</p></div>
        </div>
      )}
      {canEdit && (
        <button onClick={() => setShowAdd(p => !p)} className="btn-secondary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Milestone
        </button>
      )}
      {showAdd && (
        <form onSubmit={submit} className="rounded-2xl p-5 space-y-4 animate-slide-up"
          style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>New Milestone</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="text" required placeholder="Title *" className="input-field sm:col-span-1"
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <input type="number" required min="1" step="0.01" placeholder="Amount (₹) *" className="input-field"
              value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            <input type="date" className="input-field" value={form.dueDate}
              onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? "Saving…" : "Add Milestone"}</button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}
      {milestones.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
          <CreditCard className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--text-light)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No payment milestones defined yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {milestones.map((m, i) => (
            <div key={m.id} className="rounded-xl p-4 flex items-center gap-4"
              style={{ background: "var(--surface)", border: `1px solid ${m.paid ? "#A7F3D0" : "var(--border-light)"}` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ background: m.paid ? "#10B981" : "var(--bg)", color: m.paid ? "white" : "var(--text-muted)", border: m.paid ? "none" : "2px solid var(--border)" }}>
                {m.paid ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: "var(--text)" }}>{m.title}</p>
                {m.dueDate && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Due: {fmtDate(m.dueDate)}</p>}
                {m.paidAt && <p className="text-xs mt-0.5" style={{ color: "#10B981" }}>Paid on {fmtDate(m.paidAt)}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-sm" style={{ color: "var(--text)" }}>{fmtCurrency(m.amount)}</p>
                {!m.paid && isClient && (
                  <button onClick={() => handlePay(m.id, m.amount)}
                    disabled={paying === m.id}
                    className="btn-primary mt-2 text-xs" style={{ height: "32px", padding: "0 14px" }}>
                    {paying === m.id ? "Opening…" : "Pay Now"}
                  </button>
                )}
                {m.paid && <span className="text-xs font-bold" style={{ color: "#10B981" }}>Paid</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub‑panel: Audit / Activity
// ─────────────────────────────────────────────────────────────────────────────
function AuditPanel({ caseId }: { caseId: number }) {
  const [entries, setEntries] = useState<CaseAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    caseService.getAuditLog(caseId).then(setEntries).catch(() => {}).finally(() => setLoading(false));
  }, [caseId]);

  if (loading) return <div className="h-20 rounded-xl skeleton" />;
  if (entries.length === 0) return (
    <div className="rounded-2xl p-10 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
      <History className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--text-light)" }} />
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>No activity recorded yet.</p>
    </div>
  );
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
      <div className="relative pl-8 pr-5 py-4 space-y-0">
        <div className="absolute left-[22px] top-0 bottom-0 w-px" style={{ background: "var(--border)" }} />
        {entries.map((e, i) => (
          <div key={e.id} className="relative flex gap-4 pb-5">
            <div className="absolute -left-[18px] w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5"
              style={{ background: "var(--surface)", borderColor: "var(--gold)", zIndex: 1 }} />
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                {e.action.replace(/_/g, " ")}
                {e.actorName && <span className="font-normal" style={{ color: "var(--text-muted)" }}> — {e.actorName}</span>}
              </p>
              {(e.oldValue || e.newValue) && (
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {e.oldValue && <span className="line-through mr-2">{e.oldValue}</span>}
                  {e.newValue && <span className="font-semibold" style={{ color: "var(--text)" }}>{e.newValue}</span>}
                </p>
              )}
              {e.note && <p className="text-xs mt-0.5 italic" style={{ color: "var(--text-light)" }}>{e.note}</p>}
              <p className="text-[11px] mt-1" style={{ color: "var(--text-light)" }}>{fmtDate(e.createdAt)} · {fmtTime(e.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAppSelector(s => s.auth);
  const { toast } = useToast();

  const [caseData, setCaseData] = useState<CaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [messages, setMessages] = useState<CaseMessageResponse[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingFinalSummary, setUploadingFinalSummary] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [feeInput, setFeeInput] = useState("");
  const [updatingFee, setUpdatingFee] = useState(false);
  const [acceptingFee, setAcceptingFee] = useState(false);
  const [isCaseFeePaid, setIsCaseFeePaid] = useState(false);

  const fetchCase = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const cData = await caseService.getById(Number(id));
      setCaseData(cData);
      if (!silent) setFeeInput(cData.quotedAmount ? cData.quotedAmount.toString() : "");
      const paid = await paymentService.getByCase(Number(id))
        .then(p => p.status === "SUCCESS").catch(() => false);
      setIsCaseFeePaid(paid);
    } catch {
      if (!silent) router.push("/cases");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id, router]);

  const fetchMessages = useCallback(async () => {
    try { setMessages(await caseService.getMessages(Number(id))); } catch { /* silent */ }
  }, [id]);

  useEffect(() => {
    fetchCase(); fetchMessages();
    const iv = setInterval(() => { fetchCase(true); fetchMessages(); }, 5000);
    return () => clearInterval(iv);
  }, [fetchCase, fetchMessages]);

  const handleStatusUpdate = async (status: CaseStatus) => {
    if (!caseData) return;
    setUpdatingStatus(true);
    try {
      const updated = await caseService.updateStatus(caseData.id, { status });
      setCaseData(updated);
      toast.success(`Status updated to ${STATUS_LABEL[status] ?? status}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to update status.";
      toast.error(msg);
    } finally { setUpdatingStatus(false); }
  };

  const handleUpdateFee = async (e: FormEvent) => {
    e.preventDefault();
    const amount = Number(feeInput);
    if (!caseData || isNaN(amount) || amount <= 0) { toast.error("Enter a valid fee > 0"); return; }
    setUpdatingFee(true);
    try {
      const updated = await caseService.updateFee(caseData.id, amount);
      setCaseData(updated);
      toast.success(`Case solving fee set to ${fmtCurrency(amount)}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to set fee.";
      toast.error(msg);
    } finally { setUpdatingFee(false); }
  };

  const handleAcceptFee = async () => {
    if (!caseData) return;
    setAcceptingFee(true);
    try {
      const updated = await caseService.acceptFee(caseData.id);
      setCaseData(updated);
      toast.success("Fee accepted! The case is now officially assigned.");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to accept fee.";
      toast.error(msg);
    } finally { setAcceptingFee(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "order" | "summary") => {
    const file = e.target.files?.[0];
    if (!file || !caseData) return;
    if (type === "order") setUploadingFile(true); else setUploadingFinalSummary(true);
    try {
      const updated = await caseService.uploadOrderCopy(caseData.id, file);
      setCaseData(updated);
      toast.success(type === "order" ? "Order copy uploaded!" : "Final summary uploaded!");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Upload failed.";
      toast.error(msg);
    } finally {
      if (type === "order") setUploadingFile(false); else setUploadingFinalSummary(false);
    }
  };

  const handleDownload = async () => {
    if (!caseData) return;
    try {
      const blob = await caseService.downloadOrderCopy(caseData.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = isCaseFeePaid || user?.role !== "CLIENT"
        ? `OrderCopy_${caseData.caseNumber ?? caseData.id}.pdf`
        : `Preview_${caseData.id}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
    } catch { toast.error("Download failed."); }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!caseData || !newMessage.trim()) return;
    setSendingMsg(true);
    try {
      const sent = await caseService.sendMessage(caseData.id, newMessage);
      setMessages(p => [...p, sent]); setNewMessage("");
    } catch { toast.error("Failed to send message."); } finally { setSendingMsg(false); }
  };

  if (loading) return <PageSpinner />;
  if (!caseData) return null;

  const isClient = user?.role === "CLIENT";
  const isLawyer = user?.role === "LAWYER";
  const isAdmin = user?.role === "ADMIN";
  const canEdit = isLawyer || isAdmin;

  const stepperIdx = getStepperIdx(caseData.status);
  const progressPct = ["CANCELLED", "DISPUTED"].includes(caseData.status) ? 0
    : Math.round((stepperIdx / (STEPPER_ORDER.length - 1)) * 100);

  const nextStatusesForRole = isClient
    ? (NEXT_STATUSES_CLIENT[caseData.status] ?? [])
    : (NEXT_STATUSES_LAWYER[caseData.status] ?? []);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6 animate-slide-up">

      {/* Back nav */}
      <Link href="/cases" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
        style={{ color: "var(--text-muted)" }}
        onMouseOver={e => (e.currentTarget.style.color = "var(--gold)")}
        onMouseOut={e => (e.currentTarget.style.color = "var(--text-muted)")}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Cases
      </Link>

      {/* Header card */}
      <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {caseData.caseNumber && (
                <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(201,168,76,0.12)", color: "var(--gold-dark)" }}>
                  {caseData.caseNumber}
                </span>
              )}
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                style={{ background: "var(--bg)", color: "var(--text-muted)" }}>
                {caseData.caseType?.replace(/_/g, " ")}
              </span>
              {caseData.urgency && caseData.urgency !== "MEDIUM" && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
                  style={{ background: caseData.urgency === "CRITICAL" ? "#FEF2F2" : "#FFFBEB",
                           color: caseData.urgency === "CRITICAL" ? "#B91C1C" : "#B45309" }}>
                  <AlertTriangle className="w-3 h-3" /> {caseData.urgency}
                </span>
              )}
              <StatusPill status={caseData.status} />
            </div>
            <h1 className="text-xl font-black" style={{ color: "var(--text)" }}>{caseData.title}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Filed {fmtDate(caseData.createdAt)}
              {caseData.lawyerName && ` · Adv. ${caseData.lawyerName}`}
              {caseData.city && ` · ${caseData.city}${caseData.state ? ", " + caseData.state : ""}`}
            </p>
          </div>
          {/* Case info pills */}
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            {caseData.courtName && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                style={{ background: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                <Scale className="w-3.5 h-3.5" /> {caseData.courtName}
              </span>
            )}
            {caseData.estimatedTimelineDays && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                style={{ background: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                <Clock className="w-3.5 h-3.5" /> ~{caseData.estimatedTimelineDays}d est.
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-light)" }}>Case Progress</p>
            <p className="text-[11px] font-bold" style={{ color: "var(--gold-dark)" }}>{progressPct}%</p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, var(--gold-dark), var(--gold))" }} />
          </div>
          <div className="flex justify-between mt-2">
            {STEPPER_MILESTONES.map(m => {
              const done = getStepperIdx(m.status) <= stepperIdx && !["CANCELLED", "DISPUTED"].includes(caseData.status);
              return (
                <div key={m.status} className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: done ? "var(--gold)" : "var(--border)" }} />
                  <p className="text-[10px] font-semibold hidden sm:block"
                    style={{ color: done ? "var(--text)" : "var(--text-light)" }}>{m.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Fee Acceptance Banner (client, when fee proposed) ── */}
      {isClient && caseData.quotedAmount && !caseData.feeAccepted && (
        <div className="rounded-2xl p-5 animate-scale-in"
          style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.03))",
                   border: "1.5px solid rgba(201,168,76,0.3)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-base" style={{ color: "var(--text)" }}>Case Solving Fee Proposed</p>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Adv. {caseData.lawyerName} has proposed a fee of{" "}
                <span className="font-bold" style={{ color: "var(--text)" }}>{fmtCurrency(caseData.quotedAmount)}</span>{" "}
                to handle your case. Accepting will officially assign them.
              </p>
            </div>
            <button onClick={handleAcceptFee} disabled={acceptingFee} className="btn-primary flex-shrink-0" style={{ minWidth: "160px" }}>
              {acceptingFee ? "Accepting…" : "Accept Fee"}
            </button>
          </div>
        </div>
      )}

      {/* ── Status transition buttons (lawyer/admin, or client for cancel) ── */}
      {nextStatusesForRole.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Case Actions</p>
          <div className="flex flex-wrap gap-2">
            {nextStatusesForRole.map(s => (
              <button key={s} onClick={() => handleStatusUpdate(s)}
                disabled={updatingStatus}
                className={s === "CANCELLED" || s === "DISPUTED" ? "text-sm font-bold px-4 py-2 rounded-xl border transition-all" : "btn-primary text-sm"}
                style={s === "CANCELLED" || s === "DISPUTED"
                  ? { background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" } : {}}>
                {updatingStatus ? "Updating…" : `→ ${STATUS_LABEL[s] ?? s.replace(/_/g, " ")}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div>
        {/* Tab bar */}
        <div className="flex gap-1 overflow-x-auto pb-1" style={{ borderBottom: "2px solid var(--border)" }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all flex-shrink-0 whitespace-nowrap"
              style={{
                color: activeTab === tab.id ? "var(--gold-dark)" : "var(--text-muted)",
                background: activeTab === tab.id ? "rgba(201,168,76,0.08)" : "transparent",
                borderBottom: activeTab === tab.id ? "2px solid var(--gold)" : "2px solid transparent",
                marginBottom: "-2px",
              }}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-6">

          {/* ──── OVERVIEW ──── */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left */}
              <div className="lg:col-span-2 space-y-5">
                {/* Description */}
                <div className="rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
                  <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--surface-2)" }}>
                    <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-light)" }}>Case Description</p>
                  </div>
                  <div className="p-5">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-muted)" }}>{caseData.description}</p>
                  </div>
                </div>

                {/* Order Copy */}
                {caseData.orderCopyPath && (
                  <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
                    <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--surface-2)" }}>
                      <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-light)" }}>Order Copy</p>
                    </div>
                    <div className="p-5">
                      {isCaseFeePaid || !isClient ? (
                        <div className="rounded-xl p-4 flex items-center justify-between gap-4"
                          style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#D1FAE5", color: "#10B981" }}>
                              <Download className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold" style={{ color: "#065F46" }}>Final Order Copy Ready</p>
                              <p className="text-xs" style={{ color: "#059669" }}>Click to download the unredacted document.</p>
                            </div>
                          </div>
                          <button onClick={handleDownload} className="btn-secondary flex-shrink-0 text-xs" style={{ height: "34px", padding: "0 14px" }}>Download PDF</button>
                        </div>
                      ) : (
                        <div className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#FEF3C7", color: "#B45309" }}>
                              <Lock className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold" style={{ color: "#92400E" }}>Document Locked</p>
                              <p className="text-xs leading-relaxed" style={{ color: "#B45309" }}>Complete the final payment to unlock this document.</p>
                            </div>
                          </div>
                          <button onClick={handleDownload} className="btn-secondary self-end sm:self-auto text-xs" style={{ height: "32px", padding: "0 12px" }}>Preview Masked</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tagged Laws */}
                {caseData.taggedLaws && caseData.taggedLaws.length > 0 && (
                  <div className="rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
                    <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--surface-2)" }}>
                      <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-light)" }}>Relevant Laws</p>
                    </div>
                    <div className="p-5 flex flex-wrap gap-2">
                      {caseData.taggedLaws.map(law => (
                        <span key={law} className="text-xs font-semibold px-3 py-1.5 rounded-full"
                          style={{ background: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>{law}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lawyer management: fee + upload + status */}
                {canEdit && (
                  <div className="rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
                    <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--surface-2)" }}>
                      <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-light)" }}>Case Management</p>
                    </div>
                    <div className="p-5 space-y-5">
                      {/* Fee */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                          Case Solving Fee (₹)
                        </label>
                        {caseData.feeAccepted ? (
                          <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "var(--bg)", border: "1px solid var(--border-light)" }}>
                            <Lock className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-light)" }} />
                            <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                              Fee locked at {fmtCurrency(caseData.quotedAmount)} — accepted by client.
                            </p>
                          </div>
                        ) : (
                          <form onSubmit={handleUpdateFee} className="flex gap-3">
                            <input type="number" required value={feeInput} onChange={e => setFeeInput(e.target.value)}
                              placeholder="e.g. 25000" className="input-field flex-1" min="1" />
                            <button type="submit" disabled={updatingFee} className="btn-secondary flex-shrink-0"
                              style={{ height: "44px", padding: "0 20px" }}>
                              {updatingFee ? "Saving…" : "Set Fee"}
                            </button>
                          </form>
                        )}
                      </div>

                      {/* Upload order copy */}
                      {(caseData.status === "RESOLVED" || caseData.status === "AWAITING_FINAL_PAYMENT") && !caseData.orderCopyPath && (
                        <div className="pt-5" style={{ borderTop: "1px solid var(--border-light)" }}>
                          <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Upload Order Copy (PDF)</label>
                          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "var(--bg)", border: "1.5px dashed var(--border)" }}>
                            <UploadCloud className="w-5 h-5 flex-shrink-0" style={{ color: "var(--text-light)" }} />
                            <input type="file" accept=".pdf" disabled={uploadingFile} onChange={e => handleFileUpload(e, "order")}
                              className="text-xs flex-1" style={{ color: "var(--text-muted)" }} />
                            {uploadingFile && <span className="text-xs font-bold animate-pulse" style={{ color: "var(--gold)" }}>Uploading…</span>}
                          </div>
                        </div>
                      )}

                      {/* Upload final summary */}
                      {caseData.status === "RESOLVED" && !caseData.finalSummaryPath && (
                        <div className="pt-5" style={{ borderTop: "1px solid var(--border-light)" }}>
                          <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Upload Final Summary (PDF)</label>
                          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "var(--bg)", border: "1.5px dashed var(--border)" }}>
                            <UploadCloud className="w-5 h-5 flex-shrink-0" style={{ color: "var(--text-light)" }} />
                            <input type="file" accept=".pdf" disabled={uploadingFinalSummary} onChange={e => handleFileUpload(e, "summary")}
                              className="text-xs flex-1" style={{ color: "var(--text-muted)" }} />
                            {uploadingFinalSummary && <span className="text-xs font-bold animate-pulse" style={{ color: "var(--gold)" }}>Uploading…</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <div className="space-y-5">
                {/* Details card */}
                <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
                  <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--surface-2)" }}>
                    <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-light)" }}>Case Details</p>
                  </div>
                  <div className="p-5 space-y-4">
                    {[
                      { label: "Client", value: caseData.clientName },
                      { label: "Lawyer", value: caseData.lawyerName ?? null, fallback: "Not Assigned" },
                      { label: "Category", value: caseData.caseType?.replace(/_/g, " ") },
                      caseData.subCategory ? { label: "Sub-category", value: caseData.subCategory } : null,
                      caseData.jurisdiction ? { label: "Jurisdiction", value: caseData.jurisdiction } : null,
                      { label: "Case Fee", value: caseData.quotedAmount ? fmtCurrency(caseData.quotedAmount) : null, fallback: "Pending" },
                      { label: "Filed On", value: fmtDate(caseData.createdAt) },
                      { label: "Last Updated", value: fmtDate(caseData.updatedAt) },
                    ].filter(Boolean).map(item => {
                      const i = item as { label: string; value: string | null; fallback?: string };
                      return (
                        <div key={i.label}>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-light)" }}>{i.label}</p>
                          {i.value
                            ? <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{i.value}</p>
                            : <p className="text-sm italic" style={{ color: "var(--text-light)" }}>{i.fallback ?? "—"}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status info */}
                <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-light)" }}>Current Status</p>
                  <StatusPill status={caseData.status} />
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {caseData.status === "AWAITING_CLIENT_REVIEW" && "Please review the case details and accept the proposed fee."}
                    {caseData.status === "AWAITING_DOCUMENTS" && "Please upload all required documents to proceed."}
                    {caseData.status === "AWAITING_PAYMENT" && "Payment required to begin work."}
                    {caseData.status === "HEARING_SCHEDULED" && "A court hearing has been scheduled. See the Hearings tab."}
                    {caseData.status === "RESOLVED" && "Case is resolved. Final payment required to unlock the order copy."}
                    {caseData.status === "CLOSED" && "Case is closed. All documents are available."}
                    {caseData.status === "DISPUTED" && "A dispute is in progress. Admin is reviewing."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ──── HEARINGS ──── */}
          {activeTab === "hearings" && (
            <HearingsPanel caseId={caseData.id} canEdit={canEdit} onRefresh={() => fetchCase(true)} />
          )}

          {/* ──── TASKS ──── */}
          {activeTab === "tasks" && (
            <TasksPanel caseId={caseData.id} canEdit={canEdit} />
          )}

          {/* ──── MILESTONES ──── */}
          {activeTab === "milestones" && (
            <MilestonesPanel caseId={caseData.id} canEdit={canEdit} isClient={isClient} />
          )}

          {/* ──── DOCUMENTS ──── */}
          {activeTab === "documents" && (
            <div className="rounded-2xl p-10 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
              <BookOpen className="w-10 h-10 mx-auto mb-4" style={{ color: "var(--text-light)" }} />
              <p className="font-bold text-base" style={{ color: "var(--text)" }}>Document Manager</p>
              <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
                Full document management (upload, preview, version history) is coming in the next release.
                Order copy upload is available in the Overview tab.
              </p>
            </div>
          )}

          {/* ──── MESSAGES ──── */}
          {activeTab === "messages" && (
            caseData.lawyerId ? (
              <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
                <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--surface-2)" }}>
                  <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-light)" }}>Secure Case Discussion</p>
                </div>
                <div className="p-4 max-h-[450px] overflow-y-auto flex flex-col gap-4" style={{ background: "var(--bg)" }}>
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-light)" }} />
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>No messages yet. Start the discussion.</p>
                    </div>
                  ) : (
                    messages.map(m => {
                      const isMe = m.senderName === user?.fullName;
                      return (
                        <div key={m.id} className={`flex flex-col gap-1 max-w-[78%] ${isMe ? "self-end items-end" : "self-start items-start"}`}>
                          <div className="flex items-center gap-1.5 px-1">
                            <span className="text-[11px] font-bold" style={{ color: "var(--text)" }}>{m.senderName}</span>
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                              style={m.senderRole === "CLIENT" ? { background: "#EFF6FF", color: "#1D4ED8" } : { background: "rgba(201,168,76,0.12)", color: "var(--gold-dark)" }}>
                              {m.senderRole}
                            </span>
                          </div>
                          <div className="px-4 py-3 text-sm leading-relaxed font-medium"
                            style={isMe
                              ? { background: "var(--navy)", color: "white", borderRadius: "18px 18px 4px 18px" }
                              : { background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border-light)", borderRadius: "18px 18px 18px 4px" }}>
                            {m.message}
                          </div>
                          <span className="text-[10px] px-1" style={{ color: "var(--text-light)" }}>{fmtDate(m.createdAt)} · {fmtTime(m.createdAt)}</span>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="p-4" style={{ borderTop: "1px solid var(--border-light)" }}>
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input type="text" required disabled={sendingMsg} value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type a message…" className="input-field flex-1" />
                    <button type="submit" disabled={sendingMsg || !newMessage.trim()} className="btn-primary flex-shrink-0" style={{ minWidth: "80px" }}>
                      {sendingMsg ? "…" : "Send"}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl p-12 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
                <Lock className="w-10 h-10 mx-auto mb-4" style={{ color: "var(--text-light)" }} />
                <p className="font-bold text-base" style={{ color: "var(--text)" }}>Message Board Locked</p>
                <p className="text-sm mt-2 max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
                  The secure message board activates once a lawyer is assigned to this case.
                </p>
              </div>
            )
          )}

          {/* ──── AUDIT LOG ──── */}
          {activeTab === "audit" && <AuditPanel caseId={caseData.id} />}
        </div>
      </div>
    </div>
  );
}
