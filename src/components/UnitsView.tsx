import React, { useState } from 'react';
import { BookOpen, CheckCircle, Clock, ChevronRight, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { TraineeProfile, EvidenceItem } from '../types';
import { COURSE_MODULES } from '../data';

interface UnitsViewProps {
  activeProfile: TraineeProfile;
  evidence: EvidenceItem[];
  setCurrentView: (view: string) => void;
}

export default function UnitsView({
  activeProfile,
  evidence,
  setCurrentView
}: UnitsViewProps) {
  const modules = COURSE_MODULES[activeProfile.courseName] || [];
  const [selectedCode, setSelectedCode] = useState<string>(modules[0]?.code || '');

  const activeModule = modules.find(m => m.code === selectedCode) || modules[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-black text-[#5D45D1] bg-purple-50 px-3 py-1 rounded-lg uppercase tracking-[0.2em] inline-block">
          Curriculum Blueprint
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Units of Competency
        </h1>
        <p className="text-xs text-slate-500 max-w-xl mx-auto font-medium">
          CDACC national curriculum standard modules for <span className="font-bold text-slate-800">{activeProfile.courseName}</span>.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Modules Navigation Sidebar */}
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">
            National Competency Blueprint
          </span>

          <div className="space-y-2.5">
            {modules.map((mod) => {
              const isSelected = activeModule?.code === mod.code;
              const moduleEvidence = evidence.filter(
                e => e.traineeId === activeProfile.id && e.moduleCode === mod.code
              );
              const isCompetent = mod.status === 'competent' || moduleEvidence.some(e => e.status === 'competent');

              return (
                <button
                  key={mod.code}
                  onClick={() => setSelectedCode(mod.code)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-[#5D45D1] bg-purple-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-mono font-black text-[#5D45D1] bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                        {mod.code}
                      </span>
                      {isCompetent ? (
                        <span className="text-[8px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="h-2.5 w-2.5" /> Competent
                        </span>
                      ) : (
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {moduleEvidence.length} Logs
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-black text-slate-800 line-clamp-1">{mod.name}</p>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{mod.credits} Credit Hours</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 ${isSelected ? 'text-[#5D45D1]' : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Module Detail Panel */}
        {activeModule && (
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#5D45D1]"></div>

            <div className="border-b border-slate-100 pb-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-[#5D45D1] bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                  {activeModule.code}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {activeModule.credits} Credit Hours
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{activeModule.name}</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{activeModule.description}</p>
            </div>

            {/* Performance Criteria & Outcomes */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Core Learning Outcomes & Performance Benchmarks</h3>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-[#5D45D1] uppercase tracking-wider block">Outcome 1</span>
                  <p className="text-xs font-bold text-slate-800">Apply safety protocols & industry compliance procedures</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-[#5D45D1] uppercase tracking-wider block">Outcome 2</span>
                  <p className="text-xs font-bold text-slate-800">Execute practical bench tasks to specification</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-[#5D45D1] uppercase tracking-wider block">Outcome 3</span>
                  <p className="text-xs font-bold text-slate-800">Troubleshoot & perform diagnostic evaluations</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-[#5D45D1] uppercase tracking-wider block">Outcome 4</span>
                  <p className="text-xs font-bold text-slate-800">Document reflective journal & observational records</p>
                </div>
              </div>
            </div>

            {/* Quick action button to upload for this unit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Ready to log evidence for this unit?</span>
              <button
                onClick={() => setCurrentView('upload')}
                className="px-5 py-2.5 rounded-xl bg-[#5D45D1] text-white text-xs font-black uppercase tracking-wider hover:bg-purple-700 transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                Upload Evidence <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
