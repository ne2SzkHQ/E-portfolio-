import React, { useEffect, useState } from 'react';
import { Award, CheckCircle, ShieldCheck, Sparkles, BookOpen, AlertCircle, FileText, UserCheck } from 'lucide-react';
import { TraineeProfile, EvidenceItem } from '../types';
import { COURSE_MODULES } from '../data';
import axios from 'axios';

interface AssessmentViewProps {
  activeProfile: TraineeProfile;
  evidence: EvidenceItem[];
  setCurrentView: (view: string) => void;
}

interface AssessmentRecord {
  id: number;
  evidenceId: number | null;
  assessorId: string | null;
  result: string;
  score: string | null;
  remarks: string | null;
  assessedAt: string;
  title?: string;
  assessor?: string;
}

export default function AssessmentView({
  activeProfile,
  evidence,
  setCurrentView
}: AssessmentViewProps) {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const modules = COURSE_MODULES[activeProfile.courseName] || [];
  const candidateEvidence = evidence.filter(e => e.traineeId === activeProfile.id);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/assessment', {
        headers: {
          Authorization: 'Bearer ' + (localStorage.getItem('tvet_token') || '')
        }
      });
      if (Array.isArray(res.data)) {
        setAssessments(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch assessment records:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-black text-[#5D45D1] bg-purple-50 px-3 py-1 rounded-lg uppercase tracking-[0.2em] inline-block">
          CDACC VASC Rubric Evaluation
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Competency Assessment Portal
        </h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto font-medium">
          Detailed VASC (Validity, Authenticity, Sufficiency, Currency) evaluations and official CDACC assessor feedback records.
        </p>
      </div>

      {/* Assessment Results Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-[#5D45D1]" />
            <h2 className="text-base font-black text-slate-900">Official Assessment Results</h2>
          </div>
          <button
            onClick={fetchAssessments}
            className="text-[10px] font-black uppercase tracking-wider text-[#5D45D1] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition"
          >
            Refresh Records
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
            Loading assessment records...
          </div>
        ) : assessments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-medium">
            No official assessment results recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                  <th className="py-3 px-4">Evidence</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Assessor</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {assessments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.title || `Evidence #${item.evidenceId}`}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.result === 'Competent' || item.result === 'C' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3" /> Competent (C)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                          Not Yet Competent (NYC)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#5D45D1]">
                      {item.score !== null ? `${item.score}%` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.assessor || 'Official Assessor'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {item.remarks || 'No remarks provided.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Progress Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#5D45D1]"></div>

          <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-[#5D45D1]" /> Module Assessment Rubrics
          </h2>

          <div className="space-y-4">
            {modules.map((mod) => {
              const modLogs = candidateEvidence.filter(e => e.moduleCode === mod.code);
              const isCompetent = mod.status === 'competent' || modLogs.some(e => e.status === 'competent' || e.status === 'Assessed');

              return (
                <div key={mod.code} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-black text-[#5D45D1] bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                        {mod.code}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 mt-1">{mod.name}</h3>
                    </div>

                    {isCompetent ? (
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Competent
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                        Pending Assessment
                      </span>
                    )}
                  </div>

                  {modLogs.length > 0 ? (
                    <div className="space-y-2 pt-2 border-t border-slate-200/60">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Evaluated Evidence Submissions ({modLogs.length})</span>
                      {modLogs.map((log) => (
                        <div key={log.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{log.title}</span>
                            <span className="font-mono text-[10px] text-[#5D45D1]">{log.status}</span>
                          </div>
                          {log.aiReviewResult && (
                            <p className="text-[10px] text-slate-500 italic">"AI VASC Compliance Score: {log.aiReviewResult.validityScore}% - {log.aiReviewResult.feedback}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No logs submitted for this unit yet.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Assessor Feedback Sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5D45D1] bg-purple-50 px-2 py-0.5 rounded">
              VASC Rules
            </span>
            <h3 className="text-sm font-black text-slate-900">Evaluation Standards</h3>
            
            <div className="space-y-2 text-xs text-slate-600 font-medium">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-black text-slate-900 block">Validity</span>
                <span>Direct alignment with CDACC unit benchmarks.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-black text-slate-900 block">Authenticity</span>
                <span>Verified genuine work by the enrolled candidate.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-black text-slate-900 block">Sufficiency</span>
                <span>Enough detail to confirm consistent competence.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-black text-slate-900 block">Currency</span>
                <span>Recent performance evidence within term logs.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
