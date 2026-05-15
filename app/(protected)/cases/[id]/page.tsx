"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import { caseService, paymentService } from "@/lib/services";
import { useToast } from "@/lib/toastContext";
import type { CaseResponse, CaseStatus, PaymentResponse } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import { PageSpinner } from "@/components/ui/Spinner";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#F1F5F9]">
        <h2 className="font-semibold text-[#0D1B2A] text-sm">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 border-b border-[#F8FAFC] last:border-0">
      <span className="text-xs text-[#94A3B8] uppercase tracking-wide shrink-0">{label}</span>
      <span className="text-sm font-medium text-[#0D1B2A] text-right">{value}</span>
    </div>
  );
}

// ── Payment Panel ─────────────────────────────────────────────────────────────

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

function PaymentPanel({ caseId, amount }: { caseId: number; amount?: number }) {
  const { toast } = useToast();
  const { user } = useAppSelector((s) => s.auth);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    paymentService.getByCase(caseId)
      .then(setPayment)
      .catch(() => setPayment(null))
      .finally(() => setLoading(false));
  }, [caseId]);

  const openCheckout = async (orderId: string, keyId: string, amt: number, currency: string, paymentId: number) => {
    const rzp = new window.Razorpay({
      key: keyId,
      order_id: orderId,
      amount: amt * 100,
      currency,
      name: "GoLawyers",
      description: "Legal Consultation Fee",
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
      // Load Razorpay SDK
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

  if (loading) return <div className="h-10 bg-[#F1F5F9] rounded-lg animate-pulse" />;

  if (!payment || !user) return null;

  return (
    <Section title="Payment">
      <div className="space-y-3">
        <InfoRow label="Amount" value={`₹${payment.amount.toLocaleString("en-IN")}`} />
        <InfoRow label="Status" value={<StatusBadge status={payment.status} variant="payment" size="md" />} />
        {payment.razorpayPaymentId && (
          <InfoRow label="Transaction ID" value={<span className="font-mono text-xs">{payment.razorpayPaymentId}</span>} />
        )}
        {payment.paidAt && <InfoRow label="Paid On" value={formatDate(payment.paidAt)} />}

        {user.role === "CLIENT" && payment.status === "FAILED" && payment.canRetry && (
          <button
            onClick={handleRetry}
            disabled={paying}
            className="w-full h-10 bg-[#C9A84C] hover:bg-[#b8943d] disabled:opacity-60 text-[#0D1B2A] text-sm font-semibold rounded-lg transition-all"
          >
            {paying ? "Opening checkout…" : `Retry Payment (${payment.retryCount}/${payment.maxRetries})`}
          </button>
        )}
      </div>
    </Section>
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

  useEffect(() => {
    caseService.getById(Number(id))
      .then(setCaseData)
      .catch(() => router.push("/cases"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleStatusUpdate = async (status: CaseStatus) => {
    if (!caseData) return;
    setUpdatingStatus(true);
    try {
      const updated = await caseService.updateStatus(caseData.id, { status });
      setCaseData(updated);
      toast.success(`Case status updated to ${status}`);
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdatingStatus(false);
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back + title */}
      <div>
        <Link href="/cases" className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0D1B2A] transition-colors mb-3">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          All Cases
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-xl font-bold text-[#0D1B2A] flex-1">{caseData.title}</h1>
          <StatusBadge status={caseData.status} variant="case" size="md" />
        </div>
      </div>

      {/* Details */}
      <Section title="Case Details">
        <InfoRow label="Case ID" value={`#${caseData.id}`} />
        <InfoRow label="Type" value={caseData.caseType.replace("_", " ")} />
        <InfoRow label="Client" value={caseData.clientName} />
        <InfoRow label="Assigned Lawyer" value={caseData.lawyerName ?? <span className="text-[#94A3B8]">Not assigned</span>} />
        <InfoRow label="Filed On" value={formatDate(caseData.createdAt)} />
        <InfoRow label="Last Updated" value={formatDate(caseData.updatedAt)} />
        {caseData.quotedAmount && (
          <InfoRow label="Quoted Amount" value={`₹${Number(caseData.quotedAmount).toLocaleString("en-IN")}`} />
        )}
      </Section>

      {/* Description */}
      <Section title="Description">
        <p className="text-sm text-[#64748B] leading-relaxed whitespace-pre-wrap">{caseData.description}</p>
      </Section>

      {/* Tagged Laws */}
      {caseData.taggedLaws && caseData.taggedLaws.length > 0 && (
        <Section title="Tagged Laws">
          <div className="flex flex-wrap gap-2">
            {caseData.taggedLaws.map((law) => (
              <span key={law} className="text-xs font-medium px-3 py-1 bg-[#F1F5F9] text-[#64748B] rounded-full border border-[#E2E8F0]">
                {law}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Assign Lawyer (for unassigned CLIENT cases) */}
      {user?.role === "CLIENT" && !caseData.lawyerId && caseData.status === "OPEN" && (
        <div className="bg-[#0D1B2A]/5 border border-[#0D1B2A]/10 rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#0D1B2A]">No lawyer assigned yet</p>
            <p className="text-xs text-[#64748B] mt-0.5">Browse verified advocates and assign one to this case.</p>
          </div>
          <Link
            href="/lawyers"
            className="shrink-0 text-sm font-semibold bg-[#C9A84C] hover:bg-[#b8943d] text-[#0D1B2A] px-4 py-2 rounded-lg transition-all"
          >
            Find a Lawyer
          </Link>
        </div>
      )}

      {/* Status Update (LAWYER/ADMIN) */}
      {canUpdateStatus && nextStatuses.length > 0 && (
        <Section title="Update Status">
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusUpdate(s)}
                disabled={updatingStatus}
                className="text-sm font-medium px-4 py-2 border border-[#E2E8F0] text-[#64748B] rounded-lg hover:border-[#0D1B2A] hover:text-[#0D1B2A] disabled:opacity-50 transition-all"
              >
                Mark as {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Payment */}
      {caseData.quotedAmount && (
        <PaymentPanel caseId={caseData.id} amount={Number(caseData.quotedAmount)} />
      )}
    </div>
  );
}
