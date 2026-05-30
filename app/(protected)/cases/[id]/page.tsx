"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import { caseService, paymentService } from "@/lib/services";
import { useToast } from "@/lib/toastContext";
import type { CaseResponse, CaseStatus, PaymentResponse, CaseMessageResponse } from "@/lib/types";
import StatusPill from "@/components/ui/StatusPill";
import SectionHeader from "@/components/ui/SectionHeader";
import { PageSpinner } from "@/components/ui/Spinner";

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

function PaymentPanel({ caseId, amount, onPaymentSuccess }: { caseId: number; amount?: number; onPaymentSuccess?: () => void }) {
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

  useEffect(() => {
    fetchPayment();
  }, [caseId]);

  const openCheckout = async (orderId: string, keyId: string, amt: number, currency: string, paymentId: number) => {
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

  if (loading) return <div className="h-10 bg-slate-50 rounded-lg animate-pulse" />;
  if (!user || !amount) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
      <SectionHeader title="Payment Details" />
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-slate-50">
          <span className="text-sm text-slate-500 font-medium">Amount</span>
          <span className="font-bold text-[#0D1B2A]">
            ₹{payment ? payment.amount.toLocaleString("en-IN") : amount.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-slate-50">
          <span className="text-sm text-slate-500 font-medium">Status</span>
          {payment ? (
            <StatusPill status={payment.status} />
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              UNPAID
            </span>
          )}
        </div>
        {payment?.paidAt && (
          <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-sm text-slate-500 font-medium">Paid On</span>
            <span className="text-sm font-medium text-[#0D1B2A]">{formatDate(payment.paidAt)}</span>
          </div>
        )}

        {/* Client-Specific Controls */}
        {user.role === "CLIENT" && (
          <>
            {/* Case 1: Payment not yet initiated */}
            {!payment && (
              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full mt-4 bg-[#C9A84C] text-[#0D1B2A] px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-[#E8C97A] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {paying ? "Opening checkout…" : "Pay Consultation Fee"}
              </button>
            )}

            {/* Case 2: Payment failed and can be retried */}
            {payment && payment.status === "FAILED" && payment.canRetry && (
              <button
                onClick={handleRetry}
                disabled={paying}
                className="w-full mt-4 bg-[#C9A84C] text-[#0D1B2A] px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-[#E8C97A] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {paying ? "Opening checkout…" : `Retry Payment (${payment.retryCount}/${payment.maxRetries})`}
              </button>
            )}

            {/* Case 3: Order is created or pending but checkout was not completed */}
            {payment && (payment.status === "INITIATED" || payment.status === "CREATED" || payment.status === "PENDING") && (
              <button
                onClick={handleRetry}
                disabled={paying}
                className="w-full mt-4 bg-[#C9A84C] text-[#0D1B2A] px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-[#E8C97A] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {paying ? "Opening checkout…" : "Complete Payment"}
              </button>
            )}
          </>
        )}

        {/* Lawyer/Admin Notice */}
        {user.role !== "CLIENT" && !payment && (
          <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3 text-center leading-relaxed mt-4">
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

  const fetchCase = async () => {
    try {
      const cData = await caseService.getById(Number(id));
      setCaseData(cData);
      setFeeInput(cData.quotedAmount ? cData.quotedAmount.toString() : "");

      const paid = await paymentService.getByCase(Number(id))
        .then((p) => p.status === "SUCCESS")
        .catch(() => false);
      setIsCaseFeePaid(paid);
    } catch {
      router.push("/cases");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const msgs = await caseService.getMessages(Number(id));
      setMessages(msgs);
    } catch {
      // fail silently
    }
  };

  useEffect(() => {
    fetchCase();
    fetchMessages();
  }, [id]);

  const handleStatusUpdate = async (status: CaseStatus) => {
    if (!caseData) return;
    setUpdatingStatus(true);
    try {
      const updated = await caseService.updateStatus(caseData.id, { status });
      setCaseData(updated);
      toast.success(`Case status updated to ${status}`);
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
      toast.success(`Consultation fee set to ₹${amount.toLocaleString("en-IN")} — client has been notified.`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to update case fee.";
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
      toast.success("Case final order copy uploaded successfully!");
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
      toast.error("Failed to download the order copy. Confirm payment is completed.");
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

  const milestones: { label: string; status: CaseStatus }[] = [
    { label: "Submitted", status: "OPEN" },
    { label: "Assigned", status: "ASSIGNED" },
    { label: "In Progress", status: "IN_PROGRESS" },
    { label: "Resolved", status: "RESOLVED" },
    { label: "Closed", status: "CLOSED" },
  ];

  const currentMilestoneIdx = milestones.findIndex((m) => m.status === caseData.status);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
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
            subtitle={`Filed on ${formatDate(caseData.createdAt)} • ${caseData.caseType?.replace(/_/g, " ") ?? "—"}`} 
          />
          <StatusPill status={caseData.status} />
        </div>
      </div>

      {/* Case Status Interactive Timeline */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
          <div className="absolute left-6 right-6 top-[22px] h-[2px] bg-slate-100 hidden md:block z-0" />
          {milestones.map((m, idx) => {
            const isCompleted = idx <= currentMilestoneIdx && caseData.status !== "CANCELLED";
            const isCurrent = idx === currentMilestoneIdx;
            return (
              <div key={m.status} className="flex flex-row md:flex-col items-center gap-3 relative z-10 w-full md:w-auto">
                <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
                  isCompleted 
                    ? "bg-[#C9A84C] border-[#C9A84C] text-[#0D1B2A] shadow-md shadow-[#C9A84C]/25" 
                    : "bg-white border-slate-200 text-slate-400"
                } ${isCurrent ? "scale-110 ring-4 ring-[#C9A84C]/10" : ""}`}>
                  {isCompleted ? "✓" : idx + 1}
                </div>
                <div className="text-left md:text-center">
                  <p className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? "text-[#0D1B2A]" : "text-slate-400"}`}>{m.label}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{isCurrent ? "Active Step" : ""}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main description and inputs) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Description */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
            <SectionHeader title="Description" />
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {caseData.description}
            </p>
          </div>

          {/* Secure Order Copy Box */}
          {caseData.orderCopyPath && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
              <SectionHeader title="Case Order Copy" subtitle="Official copy of the resolved court proceedings document." />
              
              {isCaseFeePaid || user?.role !== "CLIENT" ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-800">Final Order Copy Uploaded</p>
                      <p className="text-xs text-green-600 font-medium">Click download to fetch the case resolution file.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadOrderCopy}
                    className="bg-[#0D1B2A] hover:bg-[#1A3050] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    Download PDF
                  </button>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#C9A84C]/10 rounded-full flex items-center justify-center text-[#C9A84C]">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0D1B2A]">Final Order Copy is Locked</p>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">The final order document has been uploaded by the lawyer. Complete payment of the case fee to unlock download access.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0">
                    🔒 Locked
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Laws */}
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
          
          {/* Status Update & Actions (LAWYER/ADMIN) */}
          {canUpdateStatus && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
              <SectionHeader title="Case Management & Actions" subtitle="Configure fees, upload resolutions, and manage the case status." />
              
              {/* Fee Configuration */}
              <form onSubmit={handleUpdateFee} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end border-b border-slate-50 pb-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Configure Case Consultation Fee (₹)</label>
                  <input
                    type="text"
                    required
                    value={feeInput}
                    onChange={(e) => setFeeInput(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full h-10 border border-slate-200 focus:border-[#C9A84C] outline-none rounded-lg px-3 text-sm text-[#0D1B2A] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updatingFee}
                  className="bg-[#0D1B2A] hover:bg-[#1A3050] text-white h-10 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center"
                >
                  {updatingFee ? "Saving..." : "Save Case Fee"}
                </button>
              </form>

              {/* PDF/Order Copy Upload */}
              {(caseData.status === "IN_PROGRESS" || caseData.status === "RESOLVED") && (
                <div className="border-b border-slate-50 pb-6 space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Upload Court Final Order Copy (PDF only)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".pdf"
                      disabled={uploadingFile}
                      onChange={handleFileUpload}
                      className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#C9A84C]/10 file:text-[#0D1B2A] hover:file:bg-[#C9A84C]/25 cursor-pointer"
                    />
                    {uploadingFile && <span className="text-xs text-[#C9A84C] font-bold animate-pulse">Uploading file...</span>}
                  </div>
                </div>
              )}

              {/* Transition actions */}
              {nextStatuses.length > 0 ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Transition Case Status</label>
                  <div className="flex flex-wrap gap-2.5">
                    {nextStatuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusUpdate(s)}
                        disabled={updatingStatus}
                        className="bg-[#C9A84C] hover:bg-[#E8C97A] text-[#0D1B2A] px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                      >
                        Mark as {s.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-400 italic">No further status transitions available for this case.</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column (Side details & Payments) */}
        <div className="space-y-8">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
            <SectionHeader title="Case Details" />
            
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
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Case Consultation Fee</p>
                  <p className="text-sm font-bold text-[#0D1B2A]">₹{Number(caseData.quotedAmount).toLocaleString("en-IN")}</p>
                </div>
              )}
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

      {/* Case Messages / Follow-Up Chat Panel */}
      {caseData.lawyerId ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <SectionHeader 
            title="Case Discussion & Follow-Ups" 
            subtitle="Send questions, requests, or update follow-up messages about this case." 
          />
          
          {/* Messages List Area */}
          <div className="border border-slate-50 rounded-xl p-4 bg-[#FAFAF8] max-h-[350px] overflow-y-auto space-y-4 flex flex-col">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-semibold italic">
                No follow-up messages exchanged yet. Use the chat window to coordinate.
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderName === user?.fullName;
                return (
                  <div key={m.id} className={`flex flex-col space-y-1 max-w-[80%] ${isMe ? "self-end items-end" : "self-start items-start"}`}>
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="text-[10px] font-bold text-[#0D1B2A]">{m.senderName}</span>
                      <span className={`text-[9px] font-semibold uppercase px-1 rounded-sm ${
                        m.senderRole === "CLIENT" ? "bg-blue-50 text-blue-600" : "bg-[#C9A84C]/10 text-[#C9A84C]"
                      }`}>{m.senderRole}</span>
                    </div>
                    <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm font-medium ${
                      isMe 
                        ? "bg-[#0D1B2A] text-white rounded-tr-none" 
                        : "bg-white text-[#0d1b2a] border border-slate-100 rounded-tl-none"
                    }`}>
                      {m.message}
                    </div>
                    <span className="text-[9px] text-slate-400 px-1.5">{formatDate(m.createdAt)} • {formatTime(m.createdAt)}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Input area */}
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              required
              disabled={sendingMsg}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a follow-up message..."
              className="flex-1 h-11 border border-slate-200 focus:border-[#C9A84C] outline-none rounded-xl px-4 text-sm text-[#0D1B2A] transition-colors"
            />
            <button
              type="submit"
              disabled={sendingMsg || !newMessage.trim()}
              className="bg-[#C9A84C] hover:bg-[#E8C97A] text-[#0D1B2A] px-6 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center shrink-0"
            >
              {sendingMsg ? "Sending..." : "Send Msg"}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 18c-.387 0-.773-.054-1.15-.163a.502.502 0 01-.302-.679l.018-.043a5.975 5.975 0 014.288-4.086 9.765 9.765 0 01-.118-1.53c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-[#0D1B2A]">Secure Discussion Board Inactive</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            The secure case message board will become active once an advocate accepts this case. You will then be able to coordinate and chat directly with your lawyer.
          </p>
        </div>
      )}
    </div>
  );
}
