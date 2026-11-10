import React from 'react';
import { User, ShieldCheck, Mail, Building, BookOpen, HardDrive, Award, CheckCircle, ExternalLink } from 'lucide-react';
import { TraineeProfile, EvidenceItem } from '../types';
import { STORAGE_PLANS, COURSE_MODULES } from '../data';

interface ProfileViewProps {
  activeProfile: TraineeProfile;
  evidence: EvidenceItem[];
  setCurrentView: (view: string) => void;
}

export default function ProfileView({
  activeProfile,
  evidence,
  setCurrentView
}: ProfileViewProps) {
  const plan = STORAGE_PLANS.find(p => p.id === activeProfile.storagePlanId) || STORAGE_PLANS[0];
  const modules = COURSE_MODULES[activeProfile.courseName] || [];
  const candidateEvidence = evidence.filter(e => e.traineeId === activeProfile.id);
  const competentCount = candidateEvidence.filter(e => e.status === 'competent').length;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#5D45D1]"></div>

        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center font-black text-[#5D45D1] text-2xl shadow-xs">
            {activeProfile.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black text-[#5D45D1] bg-purple-50 px-2 py-0.5 rounded uppercase">
                {activeProfile.registrationNumber}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[9px] font-black uppercase text-emerald-700">
                <ShieldCheck className="h-3 w-3" /> Certified Candidate
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {activeProfile.fullName}
            </h1>
            <p className="text-xs text-slate-500 font-medium">{activeProfile.courseName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentView('reports')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition shadow-xs cursor-pointer"
          >
            Export Transcript
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-[#5D45D1]" /> Institutional Identification & Registry Data
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 block">Registration Number</span>
              <span className="font-mono font-bold text-slate-800">{activeProfile.registrationNumber}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 block">National ID / Index</span>
              <span className="font-mono font-bold text-slate-800">{activeProfile.nationalId}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 block">TVET Polytechnic / College</span>
              <span className="font-bold text-slate-800">{activeProfile.institution}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 block">Candidate Email</span>
              <span className="font-bold text-slate-800">{activeProfile.email}</span>
            </div>
          </div>

          {/* Registered Modules */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Enrolled Units of Competency</h3>
            <div className="space-y-2">
              {modules.map((mod) => (
                <div key={mod.code} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-[#5D45D1] mr-2">{mod.code}</span>
                    <span className="font-bold text-slate-800">{mod.name}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {mod.credits} Credits
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quota & Storage Card */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5D45D1] bg-purple-50 px-2 py-0.5 rounded">
              Vault Allocation
            </span>
            <h3 className="text-sm font-black text-slate-900">Storage Plan & Quota</h3>

            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Active Plan:</span>
                <span className="text-[#5D45D1]">{plan.name}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Space Used:</span>
                <span>{formatBytes(activeProfile.storageUsedBytes)} / {plan.limitLabel}</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('pricing')}
              className="w-full py-2.5 rounded-xl bg-[#5D45D1] text-white text-xs font-black uppercase tracking-wider hover:bg-purple-700 transition cursor-pointer"
            >
              Upgrade Storage
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-slate-900">Competency Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xl font-black text-[#5D45D1]">{candidateEvidence.length}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Submitted Logs</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xl font-black text-emerald-600">{competentCount}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Competent Units</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
