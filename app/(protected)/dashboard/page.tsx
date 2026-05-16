"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import { caseService, appointmentService, notificationService } from "@/lib/services";
import type { CaseResponse, AppointmentResponse } from "@/lib/types";
import { PageSpinner } from "@/components/ui/Spinner";
import SectionHeader from "@/components/ui/SectionHeader";
import StatusPill from "@/components/ui/StatusPill";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function StatCard({ label, value, sub, href }: { label: string; value: string | number; sub?: string; href?: string }) {
  const content = (
    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <svg className="w-12 h-12 text-[#C9A84C]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-[#94A3B8] mb-3">{label}</p>
      <p className="text-4xl font-black text-[#0D1B2A] tracking-tight">{value}</p>
      {sub && <p className="text-xs font-medium text-[#10B981] mt-2 flex items-center gap-1">{sub}</p>}
    </div>
  );
  return href ? <Link href={href} className="block">{content}</Link> : content;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAppSelector((s) => s.auth);
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [appts, setAppts] = useState<AppointmentResponse[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [casesData, apptsData, unreadData] = await Promise.all([
          caseService.getMyCases(0, 5),
          appointmentService.getMyAppointments(0, 5),
          notificationService.getUnreadCount(),
        ]);
        setCases(casesData.content);
        setAppts(apptsData.content);
        setUnread(unreadData);
      } catch {
        // silently fail — boot handled by layout
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <PageSpinner />;

  const openCases = cases.filter((c) => ["OPEN", "ASSIGNED", "IN_PROGRESS"].includes(c.status)).length;
  const upcomingAppts = appts.filter((a) => ["PENDING", "CONFIRMED"].includes(a.status)).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const fullName = user?.fullName || "User";

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <SectionHeader 
          eyebrow="Overview"
          title={`${getGreeting()}, ${fullName} 👋`}
          subtitle="Here's what's happening with your activity today."
        />
        {user?.role === "CLIENT" && (
          <Link href="/lawyers" className="bg-[#C9A84C] text-[#0D1B2A] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#E8C97A] transition-colors shadow-sm text-center">
            New Consultation
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Cases" value={openCases} sub="Ongoing matters" href="/cases" />
        <StatCard label="Upcoming Meetings" value={upcomingAppts} sub="Scheduled" href="/appointments" />
        <StatCard label="Notifications" value={unread} sub={unread > 0 ? "Requires attention" : "All caught up"} href="/notifications" />
        <StatCard 
          label="Account Status" 
          value={user?.role === "LAWYER" ? (user.isVerified ? "Verified ✓" : "Pending") : user?.role ?? "—"} 
        />
      </div>

      {/* Lawyer verification banner */}
      {user?.role === "LAWYER" && !user.isVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-4 flex items-start gap-3 shadow-sm">
          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-sm font-bold text-amber-800">Verification Pending</p>
            <p className="text-xs font-medium text-amber-700 mt-0.5 leading-relaxed">
              Your profile is under review. You&apos;ll receive a notification once an admin verifies your Bar Council credentials. This usually takes 1–2 business days.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Cases */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader title="Recent Cases" />
          {cases.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-100 text-center shadow-sm">
              <p className="text-sm text-slate-500 font-medium">No cases found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cases.map(c => (
                <Link key={c.id} href={`/cases/${c.id}`} className="block bg-white border border-slate-100 p-4 rounded-xl hover:border-[#C9A84C] hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-[#0D1B2A] group-hover:text-[#C9A84C] transition-colors">{c.title}</h3>
                      <p className="text-xs font-medium text-slate-500 mt-1">{c.caseType.replace("_", " ")}</p>
                    </div>
                    <StatusPill status={c.status} />
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      Filed on {formatDate(c.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Meetings */}
        <div className="space-y-4">
          <SectionHeader title="Upcoming Meetings" />
          {appts.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-100 text-center shadow-sm">
              <p className="text-sm text-slate-500 font-medium">No appointments scheduled.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
              {appts.map(a => (
                <div key={a.id} className="p-4 hover:bg-[#FAFAF7] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-sm text-[#0D1B2A] truncate pr-2">{a.caseTitle}</p>
                    <StatusPill status={a.status} />
                  </div>
                  <div className="space-y-1.5 mt-3">
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDateTime(a.scheduledAt)}
                    </p>
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {user?.role === "CLIENT" ? `With ${a.lawyerName}` : `Client: ${a.clientName}`} ({a.mode.replace("_", " ")})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
