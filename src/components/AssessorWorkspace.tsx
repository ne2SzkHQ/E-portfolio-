import React, { useState } from 'react';
import axios from 'axios';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  User, 
  HardDrive, 
  ShieldAlert, 
  Building,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  Briefcase,
  Users,
  Search,
  Check,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { TraineeProfile, EvidenceItem, SubmissionStatus, UserRole } from '../types';
import { MOCK_PROFILES, COURSE_MODULES } from '../data';
import DbAuditTrail from './DbAuditTrail';

interface AssessorWorkspaceProps {
  profiles: TraineeProfile[];
  evidence: EvidenceItem[];
  setEvidence: React.Dispatch<React.SetStateAction<EvidenceItem[]>>;
  onUpdateCompetency: (profileId: string, moduleCode: string, isCompetent: boolean) => void;
  role?: UserRole;
}

export default function AssessorWorkspace({
  profiles,
  evidence,
  setEvidence,
  onUpdateCompetency,
  role = 'Assessor'
}: AssessorWorkspaceProps) {
  // States
  const [selectedProfile, setSelectedProfile] = useState<TraineeProfile>(profiles[0] || MOCK_PROFILES[0]);
  const [feedbackInput, setFeedbackInput] = useState<Record<string, string>>({});
  const [scoreInput, setScoreInput] = useState<Record<string, string>>({});
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // 1. Telemetry Aggregation
  const totalStudents = profiles.length;
  const pendingCount = evidence.filter(e => e.status === 'pending_review' || e.status === 'Pending').length;
  const trainerReviewedCount = evidence.filter(e => e.status === 'Trainer Reviewed').length;
  const competentCount = evidence.filter(e => e.status === 'competent' || e.status === 'Approved' || e.status === 'Assessed').length;

  // Calculate storage metrics across all profiles
  const totalUsedBytes = profiles.reduce((acc, curr) => acc + curr.storageUsedBytes, 0);

  // Filter evidence items for the focused student
  const studentEvidenceList = evidence.filter(ev => ev.traineeId === selectedProfile.id);

  // Filter competencies based on active course
  const studentModules = COURSE_MODULES[selectedProfile.courseName] || [];

  // Handle workflow decisions based on user role
  const handleWorkflowAction = async (evidenceId: string, newStatus: SubmissionStatus, feedbackField: 'trainer' | 'assessor' | 'verifier') => {
    const text = feedbackInput[evidenceId] || '';
    const scoreVal = scoreInput[evidenceId] || (newStatus === 'competent' ? '85' : '45');

    // Update local state
    setEvidence(prev => prev.map(ev => {
      if (ev.id === evidenceId) {
        const updated = { ...ev, status: newStatus };
        if (feedbackField === 'trainer') updated.trainerFeedback = text || 'Reviewed by Trainer.';
        if (feedbackField === 'assessor') updated.assessorFeedback = text || 'Assessed by Assessor.';
        if (feedbackField === 'verifier') updated.verifierFeedback = text || 'Verified by Internal Verifier.';
        return updated;
      }
      return ev;
    }));

    // If assessor role, record in backend POST /api/assessment
    if (feedbackField === 'assessor') {
      try {
        const numericId = parseInt(evidenceId.replace(/\D/g, ''), 10) || 1;
        const resultVal = (newStatus === 'competent' || newStatus === 'Approved') ? 'Competent' : 'Not Yet Competent';

        await axios.post('/api/assessment', {
          evidence_id: numericId,
          result: resultVal,
          score: parseInt(scoreVal, 10) || 80,
          remarks: text || `Candidate evaluated as ${resultVal} with score ${scoreVal}%.`
        }, {
          headers: {
            Authorization: 'Bearer ' + (localStorage.getItem('tvet_token') || '')
          }
        });
      } catch (err) {
        console.warn("Backend assessment API fallback:", err);
      }
    }

    // If verifier role, record in backend POST /api/verification
    if (feedbackField === 'verifier') {
      try {
        const numericId = parseInt(evidenceId.replace(/\D/g, ''), 10) || 1;
        const statusVal = (newStatus === 'Approved' || newStatus === 'competent') ? 'Approved' : 'Rejected';

        await axios.post('/api/verification', {
          assessment_id: numericId,
          status: statusVal,
          comments: text || `Internal Verification decision: ${statusVal}.`
        }, {
          headers: {
            Authorization: 'Bearer ' + (localStorage.getItem('tvet_token') || '')
          }
        });
      } catch (err) {
        console.warn("Backend verification API fallback:", err);
      }
    }

    setSuccessNotification(`Workflow updated to: ${newStatus.toUpperCase()}`);
    setTimeout(() => setSuccessNotification(null), 4000);
    setFeedbackInput(prev => ({ ...prev, [evidenceId]: '' }));
    setScoreInput(prev => ({ ...prev, [evidenceId]: '' }));
  };

  // Utility to format bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div id="assessor-workspace" className="space-y-8 animate-fadeIn">
      {/* Role Banner */}
      <div className="rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5D45D1] text-white shadow-md shadow-purple-500/20">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#5D45D1] bg-white border border-purple-200 px-2 py-0.5 rounded-full">
                Active Role: {role}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight mt-1">
              {role === 'Trainer' && 'Trainer Evidence Review & Progress Console'}
              {role === 'Assessor' && 'Assessor Competency Evaluation Console'}
              {role === 'Internal Verifier' && 'Internal Verification & Quality Assurance Console'}
              {role === 'External Verifier' && 'External National Compliance & Audit Console'}
              {role === 'Administrator' && 'System Administration & Database Audit Panel'}
              {role === 'Student' && 'Student Portfolio & Submission Portal'}
            </h2>
          </div>
        </div>
      </div>

      {successNotification && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4.5 text-xs text-emerald-800 flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successNotification}</span>
          </div>
          <button 
            onClick={() => setSuccessNotification(null)}
            className="text-emerald-600 hover:text-emerald-800 font-bold uppercase text-[9px] tracking-widest cursor-pointer ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Institutional Telemetry Dashboard */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <User className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Total Trainees</span>
            <span className="block text-2xl font-black text-slate-900 mt-0.5">{totalStudents}</span>
          </div>
        </div>

        {/* Backlog review */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border shrink-0 ${
            pendingCount > 0 
              ? 'bg-amber-50 border-amber-100 text-amber-600 animate-pulse' 
              : 'bg-slate-50 border-slate-100 text-slate-400'
          }`}>
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Pending Review</span>
            <span className="block text-xl font-black text-slate-900 mt-0.5">{pendingCount} items</span>
          </div>
        </div>

        {/* Competent achievements */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Verified Competent</span>
            <span className="block text-2xl font-black text-slate-900 mt-0.5">{competentCount} items</span>
          </div>
        </div>

        {/* Storage Capacity */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 border border-purple-100 text-[#5D45D1] shrink-0">
            <HardDrive className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Vault Capacity</span>
            <span className="block text-xs font-black text-slate-800 truncate mt-0.5">{formatBytes(totalUsedBytes)} USED</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 2. Trainee Selection Roster */}
        <div className="space-y-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">
            Enrolled Candidates List
          </span>

          <div className="space-y-3">
            {profiles.map((profile) => {
              const isSelected = selectedProfile?.id === profile.id;
              
              const studentPending = evidence.filter(
                e => e.traineeId === profile.id && (e.status === 'pending_review' || e.status === 'Pending')
              ).length;

              return (
                <button
                  id={`assessor-student-btn-${profile.id}`}
                  key={profile.id}
                  onClick={() => setSelectedProfile(profile)}
                  className={`w-full text-left p-4.5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-[#5D45D1] bg-purple-50/20 shadow-xs ring-4 ring-purple-500/5'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 block truncate leading-tight">{profile.fullName}</span>
                      {studentPending > 0 && (
                        <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-150 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-amber-700 animate-pulse">
                          {studentPending} New
                        </span>
                      )}
                    </div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider truncate">
                      {profile.institution}
                    </span>
                    <span className="block text-[9px] font-mono font-black text-[#5D45D1]">
                      REG: {profile.registrationNumber}
                    </span>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${
                    isSelected ? 'text-[#5D45D1] translate-x-1' : 'text-slate-300'
                  }`} />
                </button>
              );
            })}
          </div>

          <div className="rounded-3xl border border-dashed border-purple-200 bg-purple-50/20 p-6 space-y-3">
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Building className="h-4 w-4 text-[#5D45D1]" /> TVET CDACC Verification Workflow
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Evidence progresses through: <strong>Student Upload</strong> → <strong>Trainer Review</strong> → <strong>Assessor Mark</strong> → <strong>Internal Verifier Approval</strong> → <strong>Competent Result</strong>.
            </p>
          </div>
        </div>

        {/* 3. Portfolio Review Console */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#5D45D1]"></div>

            <div className="border-b border-slate-100 pb-5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Target Candidate</span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">{selectedProfile.fullName}</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{selectedProfile.courseName}</p>
            </div>

            {/* Units Progress */}
            <div className="mt-6 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Course Units Overview</span>
              
              <div className="grid gap-3 sm:grid-cols-3">
                {studentModules.map(mod => {
                  const evs = studentEvidenceList.filter(e => e.moduleCode === mod.code);
                  const isCompetent = evs.length > 0 && evs.every(e => e.status === 'competent' || e.status === 'Approved');

                  return (
                    <div 
                      key={mod.code}
                      className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 text-center space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[9px] font-mono font-black text-[#5D45D1] bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded inline-block">{mod.code}</span>
                        <span className="text-[10px] font-bold text-slate-800 block truncate mt-1">{mod.name}</span>
                      </div>
                      
                      {isCompetent ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-800 justify-center">
                          <CheckCircle className="h-2.5 w-2.5 text-emerald-600" /> Competent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-600 justify-center">
                          In Progress
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submissions Queue */}
          <div className="space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">
              Evidence Items Workflow Evaluation
            </span>

            {studentEvidenceList.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                <p className="text-xs font-bold text-slate-600">No evidence records uploaded by this student yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {studentEvidenceList.map((ev) => (
                  <div
                    id={`assessor-evidence-card-${ev.id}`}
                    key={ev.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm relative space-y-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-[8px] font-black text-[#5D45D1] uppercase tracking-wider">
                            {ev.moduleCode} SUBMISSION
                          </span>
                          
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[8px] font-black border uppercase tracking-wider ${
                            ev.status === 'competent' || ev.status === 'Approved'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : ev.status === 'Trainer Reviewed'
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : ev.status === 'pending_review' || ev.status === 'Pending'
                                  ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse'
                                  : 'bg-red-50 border-red-200 text-red-700'
                          }`}>
                            <span>{ev.status}</span>
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 tracking-tight leading-snug">{ev.title}</h4>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Work Description</span>
                        <p className="text-slate-600 leading-relaxed font-medium">{ev.description}</p>
                      </div>

                      {ev.reflectionText && (
                        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-2 text-xs">
                          <span className="text-[10px] font-black text-[#5D45D1] uppercase tracking-[0.2em] block flex items-center gap-1.5">
                            <User className="h-4 w-4 text-[#5D45D1]" /> Trainee Self-Reflection Statement
                          </span>
                          <p className="text-slate-600 leading-relaxed italic font-medium">"{ev.reflectionText}"</p>
                        </div>
                      )}
                    </div>

                    {/* Role Specific Feedback History */}
                    <div className="space-y-3">
                      {ev.trainerFeedback && (
                        <div className="rounded-2xl bg-blue-50/50 border border-blue-100 p-4 text-xs space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 block">Trainer Note</span>
                          <p className="text-slate-700 font-medium">"{ev.trainerFeedback}"</p>
                        </div>
                      )}

                      {ev.assessorFeedback && (
                        <div className="rounded-2xl bg-emerald-50/50 border border-emerald-100 p-4 text-xs space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 block">Assessor Note</span>
                          <p className="text-slate-700 font-medium">"{ev.assessorFeedback}"</p>
                        </div>
                      )}

                      {ev.verifierFeedback && (
                        <div className="rounded-2xl bg-purple-50/50 border border-purple-100 p-4 text-xs space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#5D45D1] block">Internal Verifier Note</span>
                          <p className="text-slate-700 font-medium">"{ev.verifierFeedback}"</p>
                        </div>
                      )}
                    </div>

                    {/* Action Controls by Role */}
                    <div className="border-t border-slate-100 pt-5 space-y-4">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className={role === 'Assessor' ? 'sm:col-span-2' : 'sm:col-span-3'}>
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {role} Decision Comments
                          </label>
                          <input
                            id={`feedback-input-${ev.id}`}
                            type="text"
                            placeholder={`Enter ${role} feedback remarks...`}
                            value={feedbackInput[ev.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFeedbackInput(prev => ({ ...prev, [ev.id]: val }));
                            }}
                            className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-800 focus:border-[#5D45D1] focus:bg-white focus:outline-hidden transition-all"
                          />
                        </div>

                        {role === 'Assessor' && (
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                              Assessor Score (0-100)
                            </label>
                            <input
                              id={`score-input-${ev.id}`}
                              type="number"
                              min="0"
                              max="100"
                              placeholder="e.g. 85"
                              value={scoreInput[ev.id] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setScoreInput(prev => ({ ...prev, [ev.id]: val }));
                              }}
                              className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-mono font-bold text-slate-800 focus:border-[#5D45D1] focus:bg-white focus:outline-hidden transition-all"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-3 flex-wrap pt-1">
                        {role === 'Trainer' && (
                          <button
                            onClick={() => handleWorkflowAction(ev.id, 'Trainer Reviewed', 'trainer')}
                            className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle className="h-4 w-4" /> Pass to Assessor
                          </button>
                        )}

                        {role === 'Assessor' && (
                          <>
                            <button
                              onClick={() => handleWorkflowAction(ev.id, 'needs_revision', 'assessor')}
                              className="px-4 py-2 text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <XCircle className="h-4 w-4 text-amber-600" /> Not Yet Competent (NYC)
                            </button>
                            <button
                              onClick={() => handleWorkflowAction(ev.id, 'competent', 'assessor')}
                              className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle className="h-4 w-4" /> Mark Competent (C)
                            </button>
                          </>
                        )}

                        {role === 'Internal Verifier' && (
                          <button
                            onClick={() => handleWorkflowAction(ev.id, 'Approved', 'verifier')}
                            className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-[#5D45D1] text-white rounded-xl hover:bg-purple-800 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <ShieldCheck className="h-4 w-4" /> Verify & Approve
                          </button>
                        )}

                        {role === 'External Verifier' && (
                          <button
                            onClick={() => {
                              setSuccessNotification(`National EV Audit Stamp attached for submission: ${ev.title}`);
                              setTimeout(() => setSuccessNotification(null), 4000);
                            }}
                            className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-slate-900 text-white rounded-xl hover:bg-black transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileCheck className="h-4 w-4 text-emerald-400" /> Apply EV National Stamp
                          </button>
                        )}

                        {role === 'Administrator' && (
                          <button
                            onClick={() => handleWorkflowAction(ev.id, 'Approved', 'verifier')}
                            className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition cursor-pointer"
                          >
                            Admin Override & Approve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Real-time database audit logs */}
      <DbAuditTrail />
    </div>
  );
}

