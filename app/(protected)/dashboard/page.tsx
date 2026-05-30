"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import { caseService, appointmentService, notificationService } from "@/lib/services";
import type { CaseResponse, AppointmentResponse } from "@/lib/types";
import { PageSpinner } from "@/components/ui/Spinner";
import StatusPill from "@/components/ui/StatusPill";
import { useToast } from "@/lib/toastContext";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  href?: string;
  accent?: string;
}

function StatCard({ label, value, icon, sub, href, accent = "var(--gold)" }: StatCardProps) {
  const content = (
    <div
      className="relative overflow-hidden rounded-2xl p-5 group transition-all duration-250 hover:-translate-y-0.5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
      }}
    >
      {/* Accent stripe */}
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}18`, color: accent }}
        >
          {icon}
        </div>
      </div>
      <p
        className="text-[11px] font-bold uppercase tracking-[0.08em] mb-1.5"
        style={{ color: "var(--text-light)" }}
      >
        {label}
      </p>
      <p
        className="text-3xl font-black tracking-tight"
        style={{ color: "var(--text)" }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-xs font-semibold mt-2 flex items-center gap-1"
          style={{ color: "var(--text-muted)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}

// ── Case Row Card ──────────────────────────────────────────────────────────────

function CaseCard({ c }: { c: CaseResponse }) {
  return (
    <Link
      href={`/cases/${c.id}`}
      className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 group"
      style={{
        border: "1px solid var(--border-light)",
        background: "var(--surface)",
      }}
      onMouseOver={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(201,168,76,0.4)";
        el.style.boxShadow = "var(--shadow)";
        el.style.transform = "translateY(-1px)";
      }}
      onMouseOut={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--border-light)";
        el.style.boxShadow = "none";
        el.style.transform = "translateY(0)";
      }}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
          style={{
            background: "var(--bg)",
            color: "var(--text-muted)",
          }}
        >
          #{c.id}
        </div>
        <div className="min-w-0">
          <p
            className="font-semibold text-sm truncate transition-colors"
            style={{ color: "var(--text)" }}
          >
            {c.title}
          </p>
          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
            {c.caseType?.replace(/_/g, " ")} · Filed {formatDate(c.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-2">
        <StatusPill status={c.status} />
        <svg
          className="w-4 h-4 opacity-30 group-hover:opacity-70 transition-opacity"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          style={{ color: "var(--text)" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAppSelector((s) => s.auth);
  const { toast } = useToast();

  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [matchedCases, setMatchedCases] = useState<CaseResponse[]>([]);
  const [appts, setAppts] = useState<AppointmentResponse[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);

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

      if (user?.role === "LAWYER") {
        const matchedData = await caseService.getMatchedCases(0, 5);
        setMatchedCases(matchedData.content);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const handleClaimCase = async (caseId: number) => {
    if (!user) return;
    setClaimingId(caseId);
    try {
      const claimed = await caseService.claimCase(caseId);
      toast.success(`Case "${claimed.title}" claimed successfully!`);
      setMatchedCases((prev) => prev.filter((c) => c.id !== caseId));
      setCases((prev) => [claimed, ...prev]);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to claim case.";
      toast.error(msg);
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) return <PageSpinner />;

  const openCases = cases.filter((c) => ["OPEN", "ASSIGNED", "IN_PROGRESS"].includes(c.status)).length;
  const upcomingAppts = appts.filter((a) => ["PENDING", "CONFIRMED"].includes(a.status)).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.fullName?.split(" ")[0] || "there";

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] mb-1.5" style={{ color: "var(--gold)" }}>
            Overview
          </p>
          <h1 className="text-2xl lg:text-3xl font-black" style={{ color: "var(--text)" }}>
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Here&apos;s what&apos;s happening with your legal matters today.
          </p>
        </div>
        {user?.role === "CLIENT" && (
          <Link
            href="/lawyers"
            className="btn-primary self-start md:self-auto"
            style={{ textDecoration: "none" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Consultation
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Cases"
          value={openCases}
          href="/cases"
          sub="Ongoing matters"
          accent="var(--gold)"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          }
        />
        <StatCard
          label="Meetings"
          value={upcomingAppts}
          href="/appointments"
          sub="Scheduled"
          accent="#3B82F6"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
        />
        <StatCard
          label="Notifications"
          value={unread}
          href="/notifications"
          sub={unread > 0 ? "Requires attention" : "All caught up"}
          accent={unread > 0 ? "#EF4444" : "#10B981"}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          }
        />
        <StatCard
          label="Account Status"
          value={
            user?.role === "LAWYER"
              ? user.isVerified
                ? "Verified"
                : "Pending"
              : user?.role ?? "—"
          }
          accent="#8B5CF6"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          }
        />
      </div>

      {/* Lawyer verification banner */}
      {user?.role === "LAWYER" && !user.isVerified && (
        <div
          className="rounded-2xl px-6 py-4 flex items-start gap-4"
          style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#FEF3C7", color: "#B45309" }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "#92400E" }}>
              Account Verification Pending
            </p>
            <p className="text-sm mt-0.5 leading-relaxed" style={{ color: "#B45309" }}>
              Your profile is under review. You&apos;ll receive a notification once an admin verifies your Bar Council credentials. This usually takes 1–2 business days.
            </p>
          </div>
        </div>
      )}

      {/* Lawyer Matched Cases */}
      {user?.role === "LAWYER" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] mb-1" style={{ color: "var(--gold)" }}>
                Matching Your Specialization
              </p>
              <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>
                Recommended Open Cases
              </h2>
            </div>
          </div>

          {matchedCases.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                No open cases matching your specialization at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchedCases.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all duration-200"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border-light)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                  onMouseOver={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "rgba(201,168,76,0.4)";
                    el.style.boxShadow = "var(--shadow-md)";
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "var(--border-light)";
                    el.style.boxShadow = "var(--shadow-sm)";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-base leading-tight" style={{ color: "var(--text)" }}>
                        {c.title}
                      </h3>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg flex-shrink-0"
                        style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold-dark)" }}
                      >
                        {c.caseType}
                      </span>
                    </div>
                    <p className="text-xs font-semibold" style={{ color: "var(--text-light)" }}>
                      Client: {c.clientName}
                    </p>
                    <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--text-muted)" }}>
                      {c.description}
                    </p>
                  </div>
                  <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: "1px solid var(--border-light)" }}
                  >
                    <span className="text-xs font-medium" style={{ color: "var(--text-light)" }}>
                      Filed {formatDate(c.createdAt)}
                    </span>
                    <button
                      disabled={claimingId === c.id}
                      onClick={() => handleClaimCase(c.id)}
                      className="btn-primary"
                      style={{ height: "34px", fontSize: "12px", padding: "0 14px" }}
                    >
                      {claimingId === c.id ? (
                        <>
                          <div
                            className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full"
                            style={{ borderColor: "var(--navy)", borderTopColor: "transparent", animation: "spin 0.75s linear infinite" }}
                          />
                          Claiming…
                        </>
                      ) : (
                        "Accept Case"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>
              {user?.role === "LAWYER" ? "My Active Cases" : "Recent Cases"}
            </h2>
            <Link
              href="/cases"
              className="text-xs font-semibold transition-colors hover:underline"
              style={{ color: "var(--gold)" }}
            >
              View all →
            </Link>
          </div>

          {cases.length === 0 ? (
            <div
              className="rounded-2xl p-10 text-center space-y-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: "var(--bg)", color: "var(--text-light)" }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                No cases yet.{" "}
                {user?.role === "CLIENT" && (
                  <Link href="/cases" className="hover:underline" style={{ color: "var(--gold)" }}>
                    Submit your first case →
                  </Link>
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {cases.map((c) => <CaseCard key={c.id} c={c} />)}
            </div>
          )}
        </div>

        {/* Upcoming Meetings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>
              Upcoming Meetings
            </h2>
            <Link
              href="/appointments"
              className="text-xs font-semibold transition-colors hover:underline"
              style={{ color: "var(--gold)" }}
            >
              View all →
            </Link>
          </div>

          {appts.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                No appointments scheduled.
              </p>
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {appts.map((a, idx) => (
                <div
                  key={a.id}
                  className="p-4 transition-colors"
                  style={{
                    borderBottom: idx < appts.length - 1 ? "1px solid var(--border-light)" : "none",
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--bg)";
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p
                      className="font-semibold text-sm leading-tight pr-2 truncate"
                      style={{ color: "var(--text)" }}
                    >
                      {a.caseTitle}
                    </p>
                    <StatusPill status={a.status} />
                  </div>
                  <div className="space-y-1 mt-2">
                    <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDateTime(a.scheduledAt)}
                    </p>
                    <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      {user?.role === "CLIENT" ? `With ${a.lawyerName}` : `Client: ${a.clientName}`}
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
