import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Clock, MessageSquare, RefreshCw, Award, FileText, Check, AlertCircle } from 'lucide-react';
import { TraineeProfile } from '../types';
import axios from 'axios';

interface VerificationViewProps {
  activeProfile: TraineeProfile;
  setCurrentView: (view: string) => void;
}

interface VerificationRecord {
  id: number;
  assessment_id: number | null;
  assessmentId?: number | null;
  verifierId: string | null;
  verifier: string;
  status: string;
  comments: string;
  verifiedAt?: string;
  title?: string;
  assessmentResult?: string;
}

export default function VerificationView({
  activeProfile,
  setCurrentView
}: VerificationViewProps) {
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [assessmentIdInput, setAssessmentIdInput] = useState<string>('1');
  const [statusInput, setStatusInput] = useState<string>('Approved');
  const [commentsInput, setCommentsInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/verification', {
        headers: {
          Authorization: 'Bearer ' + (localStorage.getItem('tvet_token') || '')
        }
      });
      if (Array.isArray(res.data)) {
        setVerifications(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch verifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentIdInput) return;

    setIsSubmitting(true);
    setNotification(null);

    try {
      const targetId = parseInt(assessmentIdInput, 10) || 1;
      await axios.post('/api/verification', {
        assessment_id: targetId,
        status: statusInput,
        comments: commentsInput || `Verification completed as ${statusInput}.`
      }, {
        headers: {
          Authorization: 'Bearer ' + (localStorage.getItem('tvet_token') || '')
        }
      });

      setNotification(`Assessment #${targetId} verification recorded as ${statusInput.toUpperCase()}!`);
      setCommentsInput('');
      fetchVerifications();
    } catch (err: any) {
      console.error("Failed to post verification:", err);
      setNotification(`Failed to submit verification: ${err.message || 'Server error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 bottom-0 translate-y-8 translate-x-8 opacity-10 pointer-events-none">
          <ShieldCheck className="h-64 w-64 text-white" />
        </div>
        <div className="max-w-3xl relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
            <CheckCircle className="h-3 w-3 text-emerald-400" /> Internal Verification (IV) Stage
          </span>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-white">
            Internal <span className="text-emerald-400">Verification</span> Module
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Internal Verifiers review completed assessor markings, approve or reject assessment scores, issue feedback, and finalize competency awards before external national auditing.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-700 hover:underline text-[10px] uppercase font-black">Dismiss</button>
        </div>
      )}

      {/* Internal Verifier Action Form */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-black text-slate-900">Record Verification Decision</h2>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">IV Role Required</span>
        </div>

        <form onSubmit={handleVerifySubmit} className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
              Assessment ID
            </label>
            <input
              type="number"
              min="1"
              value={assessmentIdInput}
              onChange={(e) => setAssessmentIdInput(e.target.value)}
              placeholder="e.g. 1"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-mono font-bold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-hidden transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
              Verification Decision
            </label>
            <select
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-hidden transition"
            >
              <option value="Approved">Approved (Assessment Accepted & Finalized)</option>
              <option value="Rejected">Rejected (Requires Reassessment)</option>
              <option value="Pending">Pending Audit</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
              Verification Comments & Feedback
            </label>
            <textarea
              rows={2}
              value={commentsInput}
              onChange={(e) => setCommentsInput(e.target.value)}
              placeholder="Enter verifier audit remarks, compliance notes, or rejection justifications..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-hidden transition"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              {isSubmitting ? 'Recording Verification...' : 'Submit Verification Record'}
            </button>
          </div>
        </form>
      </div>

      {/* Verification Results Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-700" />
            <h2 className="text-base font-black text-slate-900">Verification Ledger</h2>
          </div>
          <button
            onClick={fetchVerifications}
            className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
            Loading verification ledger...
          </div>
        ) : verifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-medium">
            No verification records logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                  <th className="py-3 px-4">Assessment ID</th>
                  <th className="py-3 px-4">Evidence Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Internal Verifier</th>
                  <th className="py-3 px-4">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {verifications.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      #{item.assessment_id || item.assessmentId || item.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {item.title || 'Evidence Submission'}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status === 'Approved' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3" /> Approved
                        </span>
                      ) : item.status === 'Rejected' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                          <XCircle className="h-3 w-3" /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.verifier || 'Internal Verifier'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {item.comments || 'No comments.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
