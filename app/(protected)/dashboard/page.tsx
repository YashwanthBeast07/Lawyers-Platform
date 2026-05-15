"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import { caseService, appointmentService, notificationService, userService } from "@/lib/services";
import type { CaseResponse, AppointmentResponse } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import { PageSpinner } from "@/components/ui/Spinner";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function StatCard({ label, value, sub, href }: { label: string; value: string | number; sub?: string; href?: string }) {
  const content = (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 hover:shadow-sm transition-all">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#94A3B8] mb-3">{label}</p>
      <p className="text-3xl font-bold text-[#0D1B2A]">{value}</p>
      {sub && <p className="text-xs text-[#64748B] mt-1">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
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

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-1">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="text-2xl font-bold text-[#0D1B2A]">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
          {user?.firstName} 👋
        </h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          Here&apos;s an overview of your activity on GoLawyers.
        </p>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Cases" value={openCases} sub="Active matters" href="/cases" />
        <StatCard label="Upcoming Appts" value={upcomingAppts} sub="Scheduled consultations" href="/appointments" />
        <StatCard label="Unread" value={unread} sub="Notifications" href="/notifications" />
        <StatCard
          label="Account"
          value={user?.role === "LAWYER" && user.isVerified ? "Verified ✓" : user?.role ?? "—"}
          sub={user?.email}
        />
      </div>

      {/* ── Recent Cases ──────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
          <h2 className="font-semibold text-[#0D1B2A] text-sm">Recent Cases</h2>
          <Link href="/cases" className="text-xs text-[#C9A84C] hover:underline font-medium">
            View all →
          </Link>
        </div>
        {cases.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-[#94A3B8]">No cases yet.</p>
            {user?.role === "CLIENT" && (
              <Link
                href="/cases"
                className="inline-flex mt-3 items-center gap-2 text-sm font-semibold bg-[#0D1B2A] text-white px-4 py-2 rounded-lg hover:bg-[#1A3050] transition-all"
              >
                Submit a Case
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-[#F1F5F9]">
            {cases.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/cases/${c.id}`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-[#FAFAF7] transition-all group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#0D1B2A] truncate group-hover:text-[#C9A84C] transition-colors">
                      {c.title}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      {c.caseType.replace("_", " ")} · {formatDate(c.createdAt)}
                    </p>
                  </div>
                  <div className="shrink-0 ml-4">
                    <StatusBadge status={c.status} variant="case" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Upcoming Appointments ─────────────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
          <h2 className="font-semibold text-[#0D1B2A] text-sm">Upcoming Appointments</h2>
          <Link href="/appointments" className="text-xs text-[#C9A84C] hover:underline font-medium">
            View all →
          </Link>
        </div>
        {appts.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-[#94A3B8]">No appointments scheduled.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#F1F5F9]">
            {appts.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-6 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#0D1B2A] truncate">{a.caseTitle}</p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {user?.role === "CLIENT" ? `With ${a.lawyerName}` : `Client: ${a.clientName}`} ·{" "}
                    {formatDateTime(a.scheduledAt)} · {a.mode.replace("_", " ")}
                  </p>
                </div>
                <div className="shrink-0 ml-4">
                  <StatusBadge status={a.status} variant="appointment" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Lawyer verification banner ────────────────────────────────────── */}
      {user?.role === "LAWYER" && !user.isVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">Verification Pending</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Your profile is under review. You&apos;ll receive a notification once an admin verifies your Bar Council credentials. This usually takes 1–2 business days.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
