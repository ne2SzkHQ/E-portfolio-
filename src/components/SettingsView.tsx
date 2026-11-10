import React, { useState } from 'react';
import { Settings, Moon, Sun, Bell, HardDrive, Key, Database, Shield, CheckCircle } from 'lucide-react';
import { TraineeProfile } from '../types';
import { STORAGE_PLANS } from '../data';

interface SettingsViewProps {
  activeProfile: TraineeProfile | null;
  setCurrentView: (view: string) => void;
}

export default function SettingsView({
  activeProfile,
  setCurrentView
}: SettingsViewProps) {
  const [notifications, setNotifications] = useState(true);
  const [aiAudits, setAiAudits] = useState(true);
  const [savedMsg, setSavedMsg] = useState(false);

  const plan = STORAGE_PLANS.find(p => p.id === activeProfile?.storagePlanId) || STORAGE_PLANS[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-black text-[#5D45D1] bg-purple-50 px-3 py-1 rounded-lg uppercase tracking-[0.2em] inline-block">
          System Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Portal & Account Settings
        </h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto font-medium">
          Manage system preferences, notification subscriptions, and storage vault settings.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#5D45D1]"></div>

        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#5D45D1]" /> General Preferences
          </h2>
        </div>

        {savedMsg && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3.5 rounded-xl font-bold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" /> Preferences successfully updated!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <h3 className="text-xs font-black text-slate-900">Email & Audit Notifications</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Receive alerts when assessors review evidence or when AI VASC reports generate.</p>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="h-5 w-5 accent-[#5D45D1] cursor-pointer"
            />
          </div>

          {/* AI Audits Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <h3 className="text-xs font-black text-slate-900">Automatic AI Compliance Auditing</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Automatically trigger Gemini AI verification checks upon new file upload.</p>
            </div>
            <input
              type="checkbox"
              checked={aiAudits}
              onChange={(e) => setAiAudits(e.target.checked)}
              className="h-5 w-5 accent-[#5D45D1] cursor-pointer"
            />
          </div>

          {/* Storage Information Block */}
          {activeProfile && (
            <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#5D45D1]">Active Storage Plan</span>
                <h4 className="text-sm font-black text-slate-900">{plan.name} ({plan.limitLabel})</h4>
              </div>
              <button
                type="button"
                onClick={() => setCurrentView('pricing')}
                className="px-4 py-2 bg-[#5D45D1] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-purple-700 transition cursor-pointer"
              >
                Change Plan
              </button>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#5D45D1] text-white text-xs font-black uppercase tracking-wider hover:bg-purple-700 transition cursor-pointer shadow-sm"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
