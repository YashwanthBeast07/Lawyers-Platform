"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { userService } from "@/lib/services";
import { fetchProfileThunk } from "@/lib/store/authSlice";
import { useToast } from "@/lib/toastContext";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block text-[11px] font-bold uppercase tracking-[0.08em] mb-2"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    specialization: user?.specialization || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.updateProfile(form);
      await dispatch(fetchProfileThunk());
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const initials = user.fullName.substring(0, 2).toUpperCase();

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] mb-1" style={{ color: "var(--gold)" }}>
          Account
        </p>
        <h1 className="text-2xl font-black" style={{ color: "var(--text)" }}>
          My Profile
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Avatar Card */}
        <div className="md:col-span-1 space-y-4">
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto"
                style={{
                  background: "linear-gradient(135deg, var(--gold-dark), var(--gold))",
                  color: "var(--navy)",
                  boxShadow: "0 8px 24px rgba(201,168,76,0.3)",
                }}
              >
                {initials}
              </div>
              {user.role === "LAWYER" && user.isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "#10B981", border: "2px solid var(--surface)" }}
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              )}
            </div>

            <h3 className="font-bold text-base" style={{ color: "var(--text)" }}>
              {user.fullName}
            </h3>
            <p
              className="text-[11px] font-bold uppercase tracking-wide mt-1"
              style={{ color: "var(--gold)" }}
            >
              {user.role}
              {user.role === "LAWYER" && user.isVerified && " · Verified"}
            </p>
            <p className="text-xs mt-3 truncate" style={{ color: "var(--text-muted)" }}>
              {user.email}
            </p>

            {/* Info rows */}
            <div
              className="mt-5 pt-4 space-y-3 text-left"
              style={{ borderTop: "1px solid var(--border-light)" }}
            >
              {user.phone && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{ color: "var(--text-light)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    {user.phone}
                  </p>
                </div>
              )}
              {user.specialization && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{ color: "var(--text-light)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    {user.specialization}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Verification status card (for lawyers) */}
          {user.role === "LAWYER" && (
            <div
              className="rounded-2xl p-4 flex items-start gap-3"
              style={
                user.isVerified
                  ? { background: "#ECFDF5", border: "1px solid #A7F3D0" }
                  : { background: "#FFFBEB", border: "1px solid #FDE68A" }
              }
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={
                  user.isVerified
                    ? { background: "#D1FAE5", color: "#065F46" }
                    : { background: "#FEF3C7", color: "#B45309" }
                }
              >
                {user.isVerified ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div>
                <p
                  className="text-xs font-bold"
                  style={{ color: user.isVerified ? "#065F46" : "#92400E" }}
                >
                  {user.isVerified ? "Account Verified" : "Verification Pending"}
                </p>
                <p
                  className="text-xs mt-0.5 leading-relaxed"
                  style={{ color: user.isVerified ? "#059669" : "#B45309" }}
                >
                  {user.isVerified
                    ? "Your Bar Council credentials have been verified."
                    : "Awaiting admin review. Usually 1–2 business days."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Edit Form */}
        <div className="md:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl p-6 space-y-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div>
              <h2 className="font-bold text-base" style={{ color: "var(--text)" }}>
                Personal Information
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                Update your display name, phone, and preferences.
              </p>
            </div>

            <div
              className="space-y-5 pt-4"
              style={{ borderTop: "1px solid var(--border-light)" }}
            >
              <FormField label="Full Name">
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="Your full name"
                  className="input-field"
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Phone Number">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 9876543210"
                    className="input-field"
                  />
                </FormField>

                <FormField label="Email Address">
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="input-field"
                    style={{ background: "var(--bg)", cursor: "not-allowed", color: "var(--text-muted)" }}
                  />
                </FormField>
              </div>

              {user.role === "LAWYER" && (
                <FormField label="Specialization">
                  <input
                    type="text"
                    value={form.specialization}
                    onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
                    placeholder="e.g. Criminal Law, Property Law"
                    className="input-field"
                  />
                </FormField>
              )}
            </div>

            <div
              className="flex justify-end pt-4"
              style={{ borderTop: "1px solid var(--border-light)" }}
            >
              <button
                type="submit"
                disabled={loading}
                className="btn-secondary"
                style={{ minWidth: "160px" }}
              >
                {loading ? (
                  <>
                    <div
                      className="w-4 h-4 border-2 border-t-transparent rounded-full"
                      style={{ borderColor: "white", borderTopColor: "transparent", animation: "spin 0.75s linear infinite" }}
                    />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
