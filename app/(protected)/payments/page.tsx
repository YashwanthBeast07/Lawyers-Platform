"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { paymentService } from "@/lib/services";
import type { PaymentResponse } from "@/lib/types";
import { PageSpinner } from "@/components/ui/Spinner";
import SectionHeader from "@/components/ui/SectionHeader";
import StatusPill from "@/components/ui/StatusPill";
import Pagination from "@/components/ui/Pagination";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function PaymentsPage() {
  const { user } = useAppSelector((s) => s.auth);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async (p: number) => {
    setLoading(true);
    try {
      const data = await paymentService.getMyPayments(p, 10);
      setPayments(data.content);
      setTotalPages(data.totalPages);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(page); }, [page]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <SectionHeader 
        eyebrow="Billing" 
        title="Transaction History" 
        subtitle="Manage your payments and invoices." 
      />

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16"><PageSpinner /></div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#0D1B2A] mb-1">No transactions found</h3>
            <p className="text-sm text-slate-500">You haven&apos;t made any payments yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[#0D1B2A]">
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Date</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Transaction ID</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Amount</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAFAF7] transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-600">{formatDate(p.createdAt)}</td>
                    <td className="px-6 py-4 font-mono text-xs text-[#0D1B2A]">{p.razorpayPaymentId || p.transactionRef || "—"}</td>
                    <td className="px-6 py-4 font-bold text-[#0D1B2A]">₹{p.amount.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4"><StatusPill status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
