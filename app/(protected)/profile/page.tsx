"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { userService } from "@/lib/services";
import { fetchProfileThunk } from "@/lib/store/authSlice";
import { useToast } from "@/lib/toastContext";
import SectionHeader from "@/components/ui/SectionHeader";

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

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <SectionHeader 
        eyebrow="Account" 
        title="My Profile" 
        subtitle="Manage your personal information and contact details." 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Avatar & Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-center">
            <div className="w-24 h-24 bg-[#C9A84C] rounded-full flex items-center justify-center text-[#0D1B2A] text-3xl font-black mx-auto mb-4 border-4 border-slate-50">
              {user.fullName.substring(0, 2).toUpperCase()}
            </div>
            <h3 className="font-bold text-[#0D1B2A]">{user.fullName}</h3>
            <p className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest mt-1">{user.role}</p>
            <p className="text-xs text-slate-500 mt-4">{user.email}</p>
          </div>
        </div>

        {/* Right: Edit Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full h-12 border border-[#E2E8F0] focus:border-[#C9A84C] outline-none rounded-xl px-4 text-sm font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full h-12 border border-[#E2E8F0] focus:border-[#C9A84C] outline-none rounded-xl px-4 text-sm font-medium transition-all"
                />
              </div>

              {user.role === "LAWYER" && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Specialization</label>
                  <input
                    type="text"
                    value={form.specialization}
                    onChange={(e) => setForm(f => ({ ...f, specialization: e.target.value }))}
                    className="w-full h-12 border border-[#E2E8F0] focus:border-[#C9A84C] outline-none rounded-xl px-4 text-sm font-medium transition-all"
                  />
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#0D1B2A] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#1A3050] transition-all shadow-lg shadow-[#0D1B2A]/10 disabled:opacity-50"
              >
                {loading ? "Saving Changes..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
