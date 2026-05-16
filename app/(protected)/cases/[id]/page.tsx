"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import { caseService, paymentService } from "@/lib/services";
import { useToast } from "@/lib/toastContext";
import type { CaseResponse, CaseStatus, PaymentResponse } from "@/lib/types";
import StatusPill from "@/components/ui/StatusPill";
import SectionHeader from "@/components/ui/SectionHeader";
import { PageSpinner } from "@/components/ui/Spinner";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
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

  if (loading) return <div className="h-10 bg-slate-50 rounded-lg animate-pulse" />;
  if (!payment || !user) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
      <SectionHeader title="Payment Details" />
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-slate-50">
          <span className="text-sm text-slate-500 font-medium">Amount</span>
          <span className="font-bold text-[#0D1B2A]">₹{payment.amount.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-slate-50">
          <span className="text-sm text-slate-500 font-medium">Status</span>
          <StatusPill status={payment.status} />
        </div>
        {payment.paidAt && (
          <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-sm text-slate-500 font-medium">Paid On</span>
            <span className="text-sm font-medium text-[#0D1B2A]">{formatDate(payment.paidAt)}</span>
          </div>
        )}

        {user.role === "CLIENT" && payment.status === "FAILED" && payment.canRetry && (
          <button
            onClick={handleRetry}
            disabled={paying}
            className="w-full mt-4 bg-[#C9A84C] text-[#0D1B2A] px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-[#E8C97A] transition-colors shadow-sm disabled:opacity-50"
          >
            {paying ? "Opening checkout…" : `Retry Payment (${payment.retryCount}/${payment.maxRetries})`}
          </button>
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
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href="/cases" className="text-sm font-medium text-slate-500 hover:text-[#C9A84C] transition-colors flex items-center gap-2 mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Cases
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <SectionHeader 
            eyebrow={`Case #${caseData.id}`} 
            title={caseData.title} 
            subtitle={`Filed on ${formatDate(caseData.createdAt)} • ${caseData.caseType.replace("_", " ")}`} 
          />
          <StatusPill status={caseData.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-8">
          
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
            <SectionHeader title="Description" />
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {caseData.description}
            </p>
          </div>

          {caseData.taggedLaws && caseData.taggedLaws.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
              <SectionHeader title="Relevant Laws" />
              <div className="flex flex-wrap gap-2">
                {caseData.taggedLaws.map(law => (
                  <span key={law} className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full text-xs font-bold border border-slate-100">
                    {law}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Status Update (LAWYER/ADMIN) */}
          {canUpdateStatus && nextStatuses.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
              <SectionHeader title="Update Status" subtitle="Change the current status of this case." />
              <div className="flex flex-wrap gap-3 mt-4">
                {nextStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusUpdate(s)}
                    disabled={updatingStatus}
                    className="bg-[#0D1B2A] text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-[#1A3050] transition-colors shadow-sm disabled:opacity-50"
                  >
                    Mark as {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
            <SectionHeader title="Details" />
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Client</p>
                <p className="text-sm font-bold text-[#0D1B2A]">{caseData.clientName}</p>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Lawyer</p>
                {caseData.lawyerName ? (
                  <p className="text-sm font-bold text-[#0D1B2A]">{caseData.lawyerName}</p>
                ) : (
                  <p className="text-sm font-medium text-slate-500 italic">Not Assigned</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Last Updated</p>
                <p className="text-sm font-bold text-[#0D1B2A]">{formatDate(caseData.updatedAt)}</p>
              </div>

              {caseData.quotedAmount && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Quoted Amount</p>
                  <p className="text-sm font-bold text-[#0D1B2A]">₹{Number(caseData.quotedAmount).toLocaleString("en-IN")}</p>
                </div>
              )}
            </div>

            {/* Assign Lawyer Call to Action */}
            {user?.role === "CLIENT" && !caseData.lawyerId && caseData.status === "OPEN" && (
              <div className="pt-4 border-t border-slate-100">
                <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-lg p-4">
                  <p className="text-xs font-bold text-[#0D1B2A] mb-1">Find Representation</p>
                  <p className="text-xs text-slate-600 mb-3">Browse our directory of verified advocates.</p>
                  <Link href="/lawyers" className="block text-center bg-[#C9A84C] text-[#0D1B2A] px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#E8C97A] transition-colors">
                    Search Lawyers
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Payment Panel */}
          {caseData.quotedAmount && (
             <PaymentPanel caseId={caseData.id} amount={Number(caseData.quotedAmount)} />
          )}
        </div>
      </div>
    </div>
  );
}
