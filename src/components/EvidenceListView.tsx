import React, { useState } from 'react';
import { FileText, Video, Trash2, RefreshCw, Sparkles, AlertCircle, CheckCircle, Search, Filter, Download, ExternalLink, Image, FileArchive } from 'lucide-react';
import { TraineeProfile, EvidenceItem } from '../types';

interface EvidenceListViewProps {
  activeProfile: TraineeProfile;
  evidence: EvidenceItem[];
  setEvidence: React.Dispatch<React.SetStateAction<EvidenceItem[]>>;
  onUpdateStorage: (bytesUsed: number) => void;
  setCurrentView: (view: string) => void;
}

export default function EvidenceListView({
  activeProfile,
  evidence,
  setEvidence,
  onUpdateStorage,
  setCurrentView
}: EvidenceListViewProps) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isAuditingId, setIsAuditingId] = useState<string | null>(null);

  const candidateEvidence = evidence.filter(e => e.traineeId === activeProfile.id);

  const filtered = candidateEvidence.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(search.toLowerCase()) ||
                          ev.moduleCode.toLowerCase().includes(search.toLowerCase()) ||
                          ev.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || ev.type === selectedType;
    return matchesSearch && matchesType;
  });

  const triggerAIAudit = async (evidenceId: string) => {
    setIsAuditingId(evidenceId);
    try {
      const itemToAudit = evidence.find(e => e.id === evidenceId);
      if (!itemToAudit) return;

      const res = await fetch('/api/gemini/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidenceItem: itemToAudit })
      });

      const auditResult = await res.json();

      setEvidence(prev => prev.map(ev => {
        if (ev.id === evidenceId) {
          return {
            ...ev,
            aiReviewResult: auditResult
          };
        }
        return ev;
      }));
    } catch (err) {
      console.error("AI Auditor failed:", err);
    } finally {
      setIsAuditingId(null);
    }
  };

  const handleDelete = (id: string, sizeBytes: number) => {
    if (confirm("Retract this evidence record from official registry?")) {
      setEvidence(prev => prev.filter(e => e.id !== id));
      onUpdateStorage(Math.max(0, activeProfile.storageUsedBytes - sizeBytes));
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-black text-[#5D45D1] bg-purple-50 px-3 py-1 rounded-lg uppercase tracking-[0.2em] inline-block">
          Digital Evidence Repository
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Evidence Log Registry
        </h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto font-medium">
          Complete ledger of submitted practical task logs, videos, and project reports for candidate <span className="font-bold text-slate-800">{activeProfile.fullName}</span>.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs or modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:border-[#5D45D1] focus:bg-white focus:outline-hidden transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:border-[#5D45D1] focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Evidence Types</option>
            <option value="project_report">Project Reports</option>
            <option value="practical_video">Practical Videos</option>
            <option value="assessor_checklist">Assessor Checklists</option>
            <option value="other">Other Materials</option>
          </select>

          <button
            onClick={() => setCurrentView('upload')}
            className="ml-auto sm:ml-2 px-4 py-2 rounded-xl bg-[#5D45D1] text-white text-xs font-bold uppercase tracking-wider hover:bg-purple-700 transition cursor-pointer"
          >
            + New Log
          </button>
        </div>
      </div>

      {/* Evidence Items List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400 space-y-2">
          <FileText className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No evidence submissions found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Upload practical project logs or observation checklists to populate this registry.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ev) => (
            <div
              key={ev.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[9px] font-mono font-black text-[#5D45D1] bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                      {ev.moduleCode}
                    </span>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      ev.status === 'competent'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}>
                      {ev.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{ev.dateAcquired}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">{ev.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">{ev.fileName} • {formatBytes(ev.fileSize || 0)}</p>
                </div>

                <div className="flex items-center gap-2">
                  {(ev.fileUrl || ev.fileName) && (
                    <a
                      href={ev.fileUrl || `/uploads/${ev.fileName}`}
                      download={ev.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition flex items-center gap-1"
                      title="Download or View File"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </a>
                  )}
                  <button
                    onClick={() => triggerAIAudit(ev.id)}
                    disabled={isAuditingId === ev.id}
                    className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#5D45D1] bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${isAuditingId === ev.id ? 'animate-spin' : ''}`} />
                    {isAuditingId === ev.id ? 'Auditing...' : 'AI Audit'}
                  </button>
                  <button
                    onClick={() => handleDelete(ev.id, ev.fileSize || 0)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    title="Retract"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium">{ev.description}</p>

              {ev.aiReviewResult && (
                <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#5D45D1] flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" /> AI VASC Audit Report
                    </span>
                    <span className="font-black text-slate-800">Validity: {ev.aiReviewResult.validityScore}%</span>
                  </div>
                  <p className="text-slate-600 italic">"{ev.aiReviewResult.feedback}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
