"use client";

import { useState, useEffect } from "react";
import { authService } from "@/lib/services";
import type { SessionResponse } from "@/lib/types";
import SectionHeader from "@/components/ui/SectionHeader";
import { PageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/lib/toastContext";

export default function SettingsPage() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const data = await authService.getSessions();
      setSessions(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleRevoke = async (id: string) => {
    try {
      await authService.revokeSession(id);
      setSessions(sessions.filter(s => s.sessionId !== id));
      toast.success("Session revoked.");
    } catch {
      toast.error("Failed to revoke session.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <SectionHeader 
        eyebrow="Preferences" 
        title="Settings" 
        subtitle="Manage your security settings and active sessions." 
      />

      <div className="space-y-8">
        {/* Sessions Section */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
             <h3 className="text-lg font-bold text-[#0D1B2A]">Active Sessions</h3>
             <p className="text-xs text-slate-500 mt-1">Devices currently logged into your account.</p>
          </div>
          
          {loading ? (
            <div className="p-8"><PageSpinner /></div>
          ) : (
            <div className="divide-y divide-slate-50">
              {sessions.map((s) => (
                <div key={s.sessionId} className="p-6 flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0D1B2A] flex items-center gap-2">
                        {s.deviceInfo}
                        {s.current && <span className="bg-[#10B981]/10 text-[#10B981] text-[9px] font-black uppercase px-1.5 py-0.5 rounded">This Device</span>}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">IP: {s.ipAddress} • Last used {new Date(s.lastUsedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {!s.current && (
                    <button
                      onClick={() => handleRevoke(s.sessionId)}
                      className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-all"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Placeholder: Security */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4 opacity-50 cursor-not-allowed">
           <h3 className="text-lg font-bold text-[#0D1B2A]">Security Preferences</h3>
           <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-bold text-[#0D1B2A]">Two-Factor Authentication</p>
                <p className="text-xs text-slate-500">Secure your account with 2FA.</p>
              </div>
              <div className="w-10 h-5 bg-slate-200 rounded-full relative">
                <div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
