"use client";

import { useAppSelector } from "@/lib/store/hooks";
import SectionHeader from "@/components/ui/SectionHeader";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#0D1B2A] rounded-xl p-5 border border-white/10 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <svg className="w-12 h-12 text-[#C9A84C]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3">{label}</p>
      <p className="text-4xl font-black text-white tracking-tight">{value}</p>
      {sub && <p className="text-xs font-medium text-white/50 mt-2">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAppSelector((s) => s.auth);
  
  // Note: Since backend analytics endpoints don't exist yet, using placeholder data
  const stats = {
    totalRevenue: "₹24,500",
    activeCases: 142,
    totalLawyers: 85,
    pendingVerifications: "Check Verifications Tab",
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <SectionHeader 
          eyebrow="Admin Center"
          title={`${getGreeting()}, ${user?.firstName || "Admin"} 👋`}
          subtitle="Platform overview and analytics."
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={stats.totalRevenue} sub="Last 30 days" />
        <StatCard label="Active Cases" value={stats.activeCases} sub="Platform-wide" />
        <StatCard label="Registered Lawyers" value={stats.totalLawyers} sub="Verified accounts" />
        <StatCard label="Verifications" value={stats.pendingVerifications} sub="Action needed" />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-[#0D1B2A] mb-1">Detailed Analytics Coming Soon</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          More detailed reporting and charting functionalities are being actively developed.
        </p>
      </div>
    </div>
  );
}
