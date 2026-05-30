"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import { caseService, paymentService } from "@/lib/services";
import { useToast } from "@/lib/toastContext";
import type { CaseResponse, CaseStatus, PaymentResponse, CaseMessageResponse } from "@/lib/types";
import StatusPill from "@/components/ui/StatusPill";
import { PageSpinner } from "@/components/ui/Spinner";
import { FileText, User as UserIcon, Activity, CheckCircle, Lock } from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ── Payment Panel ─────────────────────────────────────────────────────────────

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

function PaymentPanel({ caseId, amount, onPaymentSuccess }: {
  caseId: number;
  amount?: number;
  onPaymentSuccess?: () => void;
}) {
  const { toast } = useToast();
  const { user } = useAppSelector((s) => s.auth);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const fetchPayment = () => {
    paymentService.getByCase(caseId)
      .then(setPayment)
      .catch(() => setPayment(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayment(); }, [caseId]);

  const openCheckout = async (
    orderId: string,
    keyId: string,
    amt: number,
    currency: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    paymentId: number
  ) => {
    const rzp = new window.Razorpay({
      key: keyId,
      order_id: orderId,
      amount: amt * 100,
      currency,
      name: "GoLawyers",
      description: "Case Consultation Fee",
      theme: { color: "#C9A84C" },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        try {
          const verified = await paymentService.verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          setPayment(verified);
          toast.success("Payment successful!");
          if (onPaymentSuccess) onPaymentSuccess();
        } catch {
          toast.error("Payment verification failed. Please contact support.");
        }
        setPaying(false);
      },
      modal: { ondismiss: () => setPaying(false) },
    });
    rzp.open();
  };

  const handlePay = async () => {
    if (!amount) return;
    setPaying(true);
    try {
      if (!window.Razorpay) {
        await new Promise<void>((resolve) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = () => resolve();
          document.head.appendChild(s);
        });
      }
      const order = await paymentService.createOrder({ caseRequestId: caseId, amount });
      await openCheckout(order.razorpayOrderId, order.razorpayKeyId, order.amount, order.currency, order.paymentId);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to initiate payment.";
      toast.error(msg);
      setPaying(false);
    }
  };

  const handleRetry = async () => {
    if (!payment) return;
    setPaying(true);
    try {
      if (!window.Razorpay) {
        await new Promise<void>((resolve) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = () => resolve();
          document.head.appendChild(s);
        });
      }
      const order = await paymentService.retryPayment(payment.id);
      await openCheckout(order.razorpayOrderId, order.razorpayKeyId, order.amount, order.currency, order.paymentId);
    } catch {
      toast.error("Failed to retry payment.");
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="h-12 rounded-xl skeleton" />
  );
  if (!user || !amount) return null;

  const isPaid = payment?.status === "SUCCESS";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{ borderBottom: "1px solid var(--border-light)", background: "var(--surface-2)" }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "var(--text-light)" }}>
          Payment Details
        </p>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              Consultation Fee
            </span>
            <span className="font-bold text-lg" style={{ color: "var(--text)" }}>
              ₹{(payment ? payment.amount : amount).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              Status
            </span>
            {payment ? (
              <StatusPill status={payment.status} />
            ) : (
              <span
                className="badge"
                style={{ background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" }}
              >
                Unpaid
              </span>
            )}
          </div>
          {payment?.paidAt && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                Paid On
              </span>
              <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                {formatDate(payment.paidAt)}
              </span>
            </div>
          )}
        </div>

        {isPaid && (
          <div
            className="rounded-xl p-3 flex items-center gap-2"
            style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#10B981" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs font-semibold" style={{ color: "#065F46" }}>
              Payment confirmed. Order copy unlocked.
            </p>
          </div>
        )}

        {/* Client Payment Controls */}
        {user.role === "CLIENT" && (
          <>
            {!payment && (
              <button
                onClick={handlePay}
                disabled={paying}
                className="btn-primary w-full"
              >
                {paying ? "Opening Checkout…" : "Pay Consultation Fee"}
              </button>
            )}
            {payment && payment.status === "FAILED" && payment.canRetry && (
              <button onClick={handleRetry} disabled={paying} className="btn-primary w-full">
                {paying ? "Opening Checkout…" : `Retry Payment (${payment.retryCount}/${payment.maxRetries})`}
              </button>
            )}
            {payment && ["INITIATED", "CREATED", "PENDING"].includes(payment.status) && (
              <button onClick={handleRetry} disabled={paying} className="btn-primary w-full">
                {paying ? "Opening Checkout…" : "Complete Payment"}
              </button>
            )}
          </>
        )}

        {user.role !== "CLIENT" && !payment && (
          <p
            className="text-xs font-semibold text-center p-3 rounded-xl"
            style={{ background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" }}
          >
            Awaiting consultation fee payment from the client.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const { toast } = useToast();

  const [caseData, setCaseData] = useState<CaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [messages, setMessages] = useState<CaseMessageResponse[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [feeInput, setFeeInput] = useState("");
  const [updatingFee, setUpdatingFee] = useState(false);
  const [isCaseFeePaid, setIsCaseFeePaid] = useState(false);

  const fetchCase = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const cData = await caseService.getById(Number(id));
      setCaseData(cData);
      if (!silent) {
        setFeeInput(cData.quotedAmount ? cData.quotedAmount.toString() : "");
      }
      const paid = await paymentService.getByCase(Number(id))
        .then((p) => p.status === "SUCCESS")
        .catch(() => false);
      setIsCaseFeePaid(paid);
    } catch {
      if (!silent) router.push("/cases");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const msgs = await caseService.getMessages(Number(id));
      setMessages(msgs);
    } catch { /* fail silently */ }
  };

  useEffect(() => {
    fetchCase();
    fetchMessages();
    const interval = setInterval(() => {
      fetchCase(true);
      fetchMessages();
    }, 4000);
    return () => clearInterval(interval);
  }, [id]);

  const handleStatusUpdate = async (status: CaseStatus) => {
    if (!caseData) return;
    setUpdatingStatus(true);
    try {
      const updated = await caseService.updateStatus(caseData.id, { status });
      setCaseData(updated);
      toast.success(`Case status updated to ${status.replace(/_/g, " ")}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to update status.";
      toast.error(msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateFee = async (e: FormEvent) => {
    e.preventDefault();
    const amount = Number(feeInput);
    if (!caseData || !feeInput || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid fee amount greater than 0.");
      return;
    }
    setUpdatingFee(true);
    try {
      const updated = await caseService.updateFee(caseData.id, amount);
      setCaseData(updated);
      toast.success(`Fee set to ₹${amount.toLocaleString("en-IN")} — client has been notified.`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to update fee.";
      toast.error(msg);
    } finally {
      setUpdatingFee(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !caseData) return;
    setUploadingFile(true);
    try {
      const updated = await caseService.uploadOrderCopy(caseData.id, file);
      setCaseData(updated);
      toast.success("Order copy uploaded successfully!");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to upload file.";
      toast.error(msg);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDownloadOrderCopy = async () => {
    if (!caseData) return;
    try {
      const blob = await caseService.downloadOrderCopy(caseData.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `OrderCopy_Case_${caseData.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch {
      toast.error("Failed to download. Ensure payment is completed.");
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!caseData || !newMessage.trim()) return;
    setSendingMsg(true);
    try {
      const sent = await caseService.sendMessage(caseData.id, newMessage);
      setMessages((prev) => [...prev, sent]);
      setNewMessage("");
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) return <PageSpinner />;
  if (!caseData) return null;

  const canUpdateStatus = user?.role === "LAWYER" || user?.role === "ADMIN";
  const NEXT_STATUSES: Record<string, CaseStatus[]> = {
    OPEN: [],
    ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["RESOLVED", "CANCELLED"],
    RESOLVED: ["CLOSED"],
    CLOSED: [],
    CANCELLED: [],
  };
  const nextStatuses = NEXT_STATUSES[caseData.status] ?? [];

  const milestones: { label: string; status: CaseStatus; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: "Submitted", status: "OPEN", icon: FileText },
    { label: "Assigned", status: "ASSIGNED", icon: UserIcon },
    { label: "In Progress", status: "IN_PROGRESS", icon: Activity },
    { label: "Resolved", status: "RESOLVED", icon: CheckCircle },
    { label: "Closed", status: "CLOSED", icon: Lock },
  ];

  const currentMilestoneIdx = milestones.findIndex((m) => m.status === caseData.status);
  const progressPct = caseData.status === "CANCELLED"
    ? 0
    : Math.max(0, (currentMilestoneIdx / (milestones.length - 1)) * 100);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-slide-up">
      {/* Back nav */}
      <Link
        href="/cases"
        className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
        style={{ color: "var(--text-muted)" }}
        onMouseOver={(e) => (e.currentTarget.style.color = "var(--gold)")}
        onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Cases
      </Link>

      {/* Header */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span
                className="text-[11px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-lg"
                style={{ background: "rgba(201,168,76,0.12)", color: "var(--gold-dark)" }}
              >
                Case #{caseData.id}
              </span>
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                style={{ background: "var(--bg)", color: "var(--text-muted)" }}
              >
                {caseData.caseType?.replace(/_/g, " ")}
              </span>
              <StatusPill status={caseData.status} />
            </div>
            <h1 className="text-xl font-black" style={{ color: "var(--text)" }}>
              {caseData.title}
            </h1>
            <p className="text-sm mt-1.5" style={{ color: "var(--text-muted)" }}>
              Filed on {formatDate(caseData.createdAt)}
              {caseData.lawyerName && ` · Assigned to Adv. ${caseData.lawyerName}`}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] mb-5" style={{ color: "var(--text-light)" }}>
          Case Progress
        </p>

        <div className="relative">
          {/* Background connector */}
          <div className="absolute left-0 right-0 top-5 h-0.5 hidden md:block" style={{ background: "var(--border)" }} />
          {/* Progress connector */}
          {caseData.status !== "CANCELLED" && (
            <div
              className="absolute left-0 top-5 h-0.5 hidden md:block transition-all duration-700"
              style={{
                background: "linear-gradient(90deg, var(--gold-dark), var(--gold))",
                width: `${progressPct}%`,
                zIndex: 1,
              }}
            />
          )}

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-2 relative z-10">
            {milestones.map((m, idx) => {
              const isCompleted = idx <= currentMilestoneIdx && caseData.status !== "CANCELLED";
              const isCurrent = idx === currentMilestoneIdx && caseData.status !== "CANCELLED";

              return (
                <div key={m.status} className="flex flex-row md:flex-col items-center gap-3 md:gap-2 flex-1">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 transition-all duration-300"
                    style={
                      isCompleted
                        ? {
                            background: "linear-gradient(135deg, var(--gold-dark), var(--gold))",
                            color: "var(--navy)",
                            boxShadow: isCurrent ? "0 0 0 4px rgba(201,168,76,0.2)" : "0 2px 8px rgba(201,168,76,0.3)",
                          }
                        : {
                            background: "var(--bg)",
                            border: "2px solid var(--border)",
                            color: "var(--text-light)",
                          }
                    }
                  >
                    {isCompleted ? "✓" : <m.icon className="w-4 h-4" />}
                  </div>
                  <div className="md:text-center">
                    <p
                      className="text-xs font-bold"
                      style={{ color: isCompleted ? "var(--text)" : "var(--text-light)" }}
                    >
                      {m.label}
                    </p>
                    {isCurrent && (
                      <p className="text-[10px] font-semibold" style={{ color: "var(--gold)" }}>
                        Current
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {caseData.status === "CANCELLED" && (
          <div
            className="mt-4 rounded-xl p-3 flex items-center gap-2"
            style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#EF4444" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-xs font-semibold" style={{ color: "#B91C1C" }}>
              This case has been cancelled.
            </p>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div
            className="rounded-2xl"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              className="px-5 py-4"
              style={{ borderBottom: "1px solid var(--border-light)", background: "var(--surface-2)" }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "var(--text-light)" }}>
                Case Description
              </p>
            </div>
            <div className="p-5">
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-muted)" }}>
                {caseData.description}
              </p>
            </div>
          </div>

          {/* Order Copy */}
          {caseData.orderCopyPath && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                className="px-5 py-4"
                style={{ borderBottom: "1px solid var(--border-light)", background: "var(--surface-2)" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "var(--text-light)" }}>
                  Case Order Copy
                </p>
              </div>
              <div className="p-5">
                {isCaseFeePaid || user?.role !== "CLIENT" ? (
                  <div
                    className="rounded-xl p-4 flex items-center justify-between gap-4"
                    style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "#D1FAE5", color: "#10B981" }}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#065F46" }}>
                          Final Order Copy Ready
                        </p>
                        <p className="text-xs" style={{ color: "#059669" }}>
                          Click to download the case resolution document.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDownloadOrderCopy}
                      className="btn-secondary flex-shrink-0"
                      style={{ height: "36px", fontSize: "12px", padding: "0 16px" }}
                    >
                      Download PDF
                    </button>
                  </div>
                ) : (
                  <div
                    className="rounded-xl p-4 flex items-center justify-between gap-4"
                    style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "#FEF3C7", color: "#B45309" }}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#92400E" }}>
                          Document Locked
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: "#B45309" }}>
                          Complete the consultation fee payment to unlock this document.
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0"
                      style={{ background: "rgba(201,168,76,0.12)", color: "var(--gold-dark)" }}
                    >
                      🔒 Locked
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tagged Laws */}
          {caseData.taggedLaws && caseData.taggedLaws.length > 0 && (
            <div
              className="rounded-2xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                className="px-5 py-4"
                style={{ borderBottom: "1px solid var(--border-light)", background: "var(--surface-2)" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "var(--text-light)" }}>
                  Relevant Laws
                </p>
              </div>
              <div className="p-5 flex flex-wrap gap-2">
                {caseData.taggedLaws.map((law) => (
                  <span
                    key={law}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{ background: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                  >
                    {law}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Lawyer Case Management Panel */}
          {canUpdateStatus && (
            <div
              className="rounded-2xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                className="px-5 py-4"
                style={{ borderBottom: "1px solid var(--border-light)", background: "var(--surface-2)" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "var(--text-light)" }}>
                  Case Management
                </p>
              </div>
              <div className="p-5 space-y-5">
                {/* Fee Configuration */}
                <div>
                  <label
                    className="block text-[11px] font-bold uppercase tracking-[0.08em] mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Consultation Fee (₹)
                  </label>
                  <form onSubmit={handleUpdateFee} className="flex gap-3">
                    <input
                      type="number"
                      required
                      value={feeInput}
                      onChange={(e) => setFeeInput(e.target.value)}
                      placeholder="e.g. 15000"
                      className="input-field flex-1"
                      min="1"
                    />
                    <button
                      type="submit"
                      disabled={updatingFee}
                      className="btn-secondary flex-shrink-0"
                      style={{ height: "44px", padding: "0 20px", fontSize: "13px" }}
                    >
                      {updatingFee ? "Saving…" : "Set Fee"}
                    </button>
                  </form>
                </div>

                {/* PDF Upload */}
                {(caseData.status === "IN_PROGRESS" || caseData.status === "RESOLVED") && (
                  <div
                    className="pt-5"
                    style={{ borderTop: "1px solid var(--border-light)" }}
                  >
                    <label
                      className="block text-[11px] font-bold uppercase tracking-[0.08em] mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Upload Court Order Copy (PDF)
                    </label>
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: "var(--bg)", border: "1.5px dashed var(--border)" }}
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        disabled={uploadingFile}
                        onChange={handleFileUpload}
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      />
                      {uploadingFile && (
                        <span
                          className="text-xs font-bold animate-pulse"
                          style={{ color: "var(--gold)" }}
                        >
                          Uploading…
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Transitions */}
                {nextStatuses.length > 0 && (
                  <div
                    className="pt-5"
                    style={{ borderTop: "1px solid var(--border-light)" }}
                  >
                    <label
                      className="block text-[11px] font-bold uppercase tracking-[0.08em] mb-3"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Advance Case Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {nextStatuses.map((s) => {
                        const isCloseAction = s === "CLOSED";
                        const isCloseDisabled = isCloseAction && !isCaseFeePaid;

                        return (
                          <div key={s} className="flex flex-col gap-1.5 items-start">
                            <button
                              onClick={() => handleStatusUpdate(s)}
                              disabled={updatingStatus || isCloseDisabled}
                              className={`text-sm font-bold px-4 py-2 rounded-xl transition-all ${
                                s === "CANCELLED"
                                  ? ""
                                  : "btn-primary"
                              }`}
                              style={
                                s === "CANCELLED"
                                  ? {
                                      background: "#FEF2F2",
                                      color: "#B91C1C",
                                      border: "1px solid #FECACA",
                                      height: "auto",
                                    }
                                  : isCloseDisabled
                                  ? {
                                      background: "var(--bg)",
                                      color: "var(--text-light)",
                                      border: "1.5px solid var(--border)",
                                      cursor: "not-allowed",
                                      opacity: 0.6,
                                      height: "auto",
                                    }
                                  : {}
                              }
                            >
                              {updatingStatus ? "Updating…" : `Mark as ${s.replace(/_/g, " ")}`}
                            </button>
                            {isCloseDisabled && (
                              <p className="text-[10px] font-bold text-red-500 max-w-[200px] leading-relaxed">
                                Client must pay the consultation fee before closing this case.
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {nextStatuses.length === 0 && (
                  <p
                    className="text-xs font-medium italic"
                    style={{ color: "var(--text-light)" }}
                  >
                    No further status transitions available.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Case Info Card */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              className="px-5 py-4"
              style={{ borderBottom: "1px solid var(--border-light)", background: "var(--surface-2)" }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "var(--text-light)" }}>
                Case Details
              </p>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "Client", value: caseData.clientName },
                {
                  label: "Assigned Lawyer",
                  value: caseData.lawyerName || null,
                  fallback: "Not Assigned",
                },
                { label: "Case Type", value: caseData.caseType?.replace(/_/g, " ") },
                { label: "Last Updated", value: formatDate(caseData.updatedAt) },
                caseData.quotedAmount
                  ? {
                      label: "Consultation Fee",
                      value: `₹${Number(caseData.quotedAmount).toLocaleString("en-IN")}`,
                    }
                  : null,
              ]
                .filter(Boolean)
                .map((item) => {
                  if (!item) return null;
                  const info = item as { label: string; value: string | null; fallback?: string };
                  return (
                    <div key={info.label}>
                      <p
                        className="text-[10px] font-bold uppercase tracking-[0.08em] mb-1"
                        style={{ color: "var(--text-light)" }}
                      >
                        {info.label}
                      </p>
                      {info.value ? (
                        <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                          {info.value}
                        </p>
                      ) : (
                        <p className="text-sm italic" style={{ color: "var(--text-light)" }}>
                          {info.fallback}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Payment Panel */}
          {caseData.quotedAmount && (
            <PaymentPanel
              caseId={caseData.id}
              amount={Number(caseData.quotedAmount)}
              onPaymentSuccess={() => setIsCaseFeePaid(true)}
            />
          )}
        </div>
      </div>

      {/* Chat Panel */}
      {caseData.lawyerId ? (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-light)", background: "var(--surface-2)" }}
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "var(--text-light)" }}>
                Case Discussion
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-light)" }}>
                Secure communication channel between client and lawyer
              </p>
            </div>
          </div>

          {/* Messages */}
          <div
            className="p-4 max-h-[400px] overflow-y-auto flex flex-col gap-4"
            style={{ background: "#FAFAFA" }}
          >
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "var(--bg)", color: "var(--text-light)" }}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 18c-.387 0-.773-.054-1.15-.163a.502.502 0 01-.302-.679l.018-.043a5.975 5.975 0 014.288-4.086 9.765 9.765 0 01-.118-1.53c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                  No messages yet
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-light)" }}>
                  Send the first message to start the discussion.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderName === user?.fullName;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col gap-1 max-w-[78%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="text-[11px] font-bold" style={{ color: "var(--text)" }}>
                        {m.senderName}
                      </span>
                      <span
                        className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                        style={
                          m.senderRole === "CLIENT"
                            ? { background: "#EFF6FF", color: "#1D4ED8" }
                            : { background: "rgba(201,168,76,0.12)", color: "var(--gold-dark)" }
                        }
                      >
                        {m.senderRole}
                      </span>
                    </div>
                    <div
                      className="px-4 py-3 text-sm leading-relaxed font-medium"
                      style={
                        isMe
                          ? { background: "var(--navy)", color: "white", borderRadius: "18px 18px 4px 18px" }
                          : {
                              background: "var(--surface)",
                              color: "var(--text)",
                              border: "1px solid var(--border-light)",
                              borderRadius: "18px 18px 18px 4px",
                            }
                      }
                    >
                      {m.message}
                    </div>
                    <span className="text-[10px] px-1" style={{ color: "var(--text-light)" }}>
                      {formatDate(m.createdAt)} · {formatTime(m.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <div
            className="p-4"
            style={{ borderTop: "1px solid var(--border-light)" }}
          >
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                required
                disabled={sendingMsg}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a follow-up message…"
                className="input-field flex-1"
              />
              <button
                type="submit"
                disabled={sendingMsg || !newMessage.trim()}
                className="btn-primary flex-shrink-0"
                style={{ minWidth: "90px" }}
              >
                {sendingMsg ? "Sending…" : "Send"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl p-10 text-center"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--bg)", color: "var(--text-light)" }}
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h3 className="font-bold text-base" style={{ color: "var(--text)" }}>
            Secure Discussion Board Inactive
          </h3>
          <p className="text-sm mt-2 max-w-sm mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
            The secure case message board activates once an advocate accepts this case. You&apos;ll then be able to communicate directly with your lawyer.
          </p>
        </div>
      )}
    </div>
  );
}
