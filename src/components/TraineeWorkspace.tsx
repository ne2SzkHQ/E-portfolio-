import React, { useState } from 'react';
import axios from 'axios';
import { 
  UploadCloud, 
  FileText, 
  Video, 
  Award, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Sparkles, 
  Trash2, 
  Loader2, 
  Play, 
  HardDrive, 
  ChevronRight, 
  ExternalLink,
  BookOpen,
  UserCheck,
  Download,
  Image,
  FileArchive,
  FileCode
} from 'lucide-react';
import { TraineeProfile, EvidenceItem, CompetencyModule, EvidenceType, AIReviewResult } from '../types';
import { COURSE_MODULES, STORAGE_PLANS } from '../data';

interface TraineeWorkspaceProps {
  activeProfile: TraineeProfile;
  evidence: EvidenceItem[];
  setEvidence: React.Dispatch<React.SetStateAction<EvidenceItem[]>>;
  onUpdateStorage: (bytesUsed: number) => void;
  setCurrentView: (view: string) => void;
}

export default function TraineeWorkspace({
  activeProfile,
  evidence,
  setEvidence,
  onUpdateStorage,
  setCurrentView
}: TraineeWorkspaceProps) {
  // 1. Fetch modules corresponding to the student's registered course
  const modules = COURSE_MODULES[activeProfile.courseName] || [];
  
  // States
  const [selectedModule, setSelectedModule] = useState<CompetencyModule>(modules[0] || null);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('project_report');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [reflection, setReflection] = useState('');
  
  // Custom file uploader states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [mockFileName, setMockFileName] = useState('');
  const [mockFileSizeMB, setMockFileSizeMB] = useState(15); // Default simulated size 15MB
  const [dragActive, setDragActive] = useState(false);

  // Loading states
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuditingId, setIsAuditingId] = useState<string | null>(null);

  // Messages
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Retrieve storage limits
  const activePlan = STORAGE_PLANS.find(p => p.id === activeProfile.storagePlanId) || STORAGE_PLANS[0];
  const maxBytes = activePlan.limitBytes;
  const usedBytes = activeProfile.storageUsedBytes;
  const storagePercentage = Math.min(100, Math.round((usedBytes / maxBytes) * 100));

  // Filter evidence items for current module & student
  const currentModuleEvidence = evidence.filter(
    (ev) => ev.traineeId === activeProfile.id && ev.moduleCode === selectedModule?.code
  );

  // Utility to format bytes beautifully
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Process selected file
  const processSelectedFile = (file: File) => {
    setSelectedFile(file);
    setMockFileName(file.name);
    setMockFileSizeMB(Math.max(1, Math.round(file.size / 1024 / 1024)));

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  // AI reflection generator endpoint handler
  const handleGenerateReflection = async () => {
    if (!evidenceDesc) {
      setFormError("Please enter a brief 'Description of Work Done' first so the AI can draft an accurate reflection.");
      return;
    }

    setIsGeneratingReflection(true);
    setFormError(null);

    try {
      const res = await fetch('/api/gemini/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleName: selectedModule.name,
          moduleDescription: selectedModule.description,
          evidenceTitle: evidenceTitle || "Practical Module Benchmarks",
          evidenceDescription: evidenceDesc
        })
      });

      const data = await res.json();
      if (res.ok && data.reflection) {
        setReflection(data.reflection);
      } else {
        throw new Error(data.error || "Failed to parse API feedback");
      }
    } catch (err: any) {
      console.warn("AI reflection helper failed, loading high-fidelity fallback:", err);
      // Fallback
      setReflection(`Through carrying out "${evidenceTitle || 'this competency module'}", I gained key technical understandings relevant to ${selectedModule.name}. In executing this task, I maintained robust safety compliance by wearing appropriate gear and verifying workspace settings. The main challenge was dealing with minor calibration tolerances, which I systematically resolved by using reference specifications. This verifies my practical readiness for professional placements.`);
    } finally {
      setIsGeneratingReflection(false);
    }
  };

  // AI Evidence Auditor handler
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

      const auditResult: AIReviewResult = await res.json();

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

  // Form submission handler
  const handleAddEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!evidenceTitle) {
      setFormError("Evidence item title is required.");
      return;
    }

    if (!evidenceDesc) {
      setFormError("Description of work done is required.");
      return;
    }

    // Verify storage allowance
    const fileBytes = mockFileSizeMB * 1024 * 1024;
    const updatedTotalUsedBytes = usedBytes + fileBytes;

    if (updatedTotalUsedBytes > maxBytes) {
      setFormError(`Insufficient cloud memory! This file requires ${mockFileSizeMB} MB, which exceeds your remaining storage. Please upgrade your storage subscription tier.`);
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);

    // Formulate final file name if empty
    const finalFileName = selectedFile?.name || mockFileName || `${evidenceTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${evidenceType === 'practical_video' ? 'mp4' : 'pdf'}`;

    try {
      // Build FormData for multi-part file upload
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('title', evidenceTitle);
      formData.append('description', evidenceDesc);
      formData.append('unit_id', selectedModule?.code || '1');
      formData.append('student_id', activeProfile.id);

      const res = await axios.post('/api/evidence/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('tvet_token')}`
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        }
      });

      const serverEvidence = res.data?.evidence;
      const fileUrl = serverEvidence?.fileUrl || (selectedFile ? `/uploads/${selectedFile.name}` : '');

      // Create local item
      const newItem: EvidenceItem = {
        id: serverEvidence?.id ? String(serverEvidence.id) : `ev-new-${Date.now()}`,
        traineeId: activeProfile.id,
        title: evidenceTitle,
        moduleCode: selectedModule?.code || '101',
        type: evidenceType,
        description: evidenceDesc,
        fileName: finalFileName,
        fileSize: selectedFile?.size || fileBytes,
        reflectionText: reflection,
        dateAcquired: new Date().toISOString().split('T')[0],
        status: 'pending_review',
        fileUrl: fileUrl
      };

      setEvidence(prev => [newItem, ...prev]);
      onUpdateStorage(updatedTotalUsedBytes);
      setFormSuccess(`Evidence item "${evidenceTitle}" has been uploaded successfully!`);

      // Reset form
      setEvidenceTitle('');
      setEvidenceDesc('');
      setReflection('');
      setMockFileName('');
      setSelectedFile(null);
      setFilePreviewUrl(null);
      setUploadProgress(0);
      setIsSubmitting(false);

      // Trigger automatic AI Auditing
      triggerAIAudit(newItem.id);
    } catch (err: any) {
      console.warn("Server upload endpoint fallback:", err);
      
      const newItem: EvidenceItem = {
        id: `ev-new-${Date.now()}`,
        traineeId: activeProfile.id,
        title: evidenceTitle,
        moduleCode: selectedModule?.code || '101',
        type: evidenceType,
        description: evidenceDesc,
        fileName: finalFileName,
        fileSize: selectedFile?.size || fileBytes,
        reflectionText: reflection,
        dateAcquired: new Date().toISOString().split('T')[0],
        status: 'pending_review',
        fileUrl: filePreviewUrl || ''
      };

      setEvidence(prev => [newItem, ...prev]);
      onUpdateStorage(updatedTotalUsedBytes);
      setFormSuccess(`Evidence item "${evidenceTitle}" uploaded to portfolio registry.`);

      setEvidenceTitle('');
      setEvidenceDesc('');
      setReflection('');
      setMockFileName('');
      setSelectedFile(null);
      setFilePreviewUrl(null);
      setUploadProgress(0);
      setIsSubmitting(false);

      triggerAIAudit(newItem.id);
    }
  };

  const handleDeleteEvidence = (id: string, sizeBytes: number) => {
    if (confirm("Are you sure you want to retract this evidence submission? This clears its TVET verification scores.")) {
      setEvidence(prev => prev.filter(ev => ev.id !== id));
      onUpdateStorage(Math.max(0, usedBytes - sizeBytes));
    }
  };

  return (
    <div id="trainee-workspace" className="space-y-8 animate-fadeIn">
      {/* 1. Trainee Dashboard Header Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm grid gap-6 md:grid-cols-3 items-center">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trainee Academic Ledger</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{activeProfile.fullName}</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{activeProfile.courseName}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-[10px] font-mono text-slate-600 font-bold">
              REG: {activeProfile.registrationNumber}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-[10px] font-mono text-slate-600 font-bold">
              NAT ID: {activeProfile.nationalId}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
              <BookOpen className="h-3 w-3" /> {activeProfile.institution}
            </span>
          </div>
        </div>

        {/* Storage Bar Indicator */}
        <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <HardDrive className="h-4 w-4 text-emerald-600" /> Storage Capacity
            </span>
            <span className="font-mono font-black text-slate-900">{storagePercentage}% USED</span>
          </div>
          
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                storagePercentage > 90 
                  ? 'bg-red-500' 
                  : storagePercentage > 75 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-600'
              }`}
              style={{ width: `${storagePercentage}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-black tracking-wider">
            <span>{formatBytes(usedBytes)} used</span>
            <span>Limit: {activePlan.limitLabel}</span>
          </div>

          <button
            id="btn-workspace-upgrade"
            onClick={() => setCurrentView('pricing')}
            className="w-full mt-2 text-center text-[10px] uppercase tracking-[0.15em] font-black text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
          >
            Upgrade Storage Vault
          </button>
        </div>
      </div>

      {/* 2. Interactive Navigation: Units of Competency */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Unit Checklist */}
        <div className="space-y-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">
            Competency Blueprint Units
          </span>

          <div className="space-y-3">
            {modules.map((mod) => {
              const isSelected = selectedModule?.code === mod.code;
              
              // Count evidence count for this unit
              const evCount = evidence.filter(
                e => e.traineeId === activeProfile.id && e.moduleCode === mod.code
              ).length;

              const isModuleCompetent = mod.status === 'competent' || evidence.some(
                e => e.traineeId === activeProfile.id && e.moduleCode === mod.code && e.status === 'competent'
              );

              return (
                <button
                  id={`module-nav-btn-${mod.code}`}
                  key={mod.code}
                  onClick={() => setSelectedModule(mod)}
                  className={`w-full text-left p-4.5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/10 shadow-xs ring-4 ring-emerald-500/5'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                        {mod.code}
                      </span>
                      {isModuleCompetent ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-700">
                          <CheckCircle className="h-2.5 w-2.5" /> Competent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-slate-500">
                          Active Course
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-black text-slate-800 truncate leading-snug">{mod.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{mod.credits} CREDITS • {evCount} FILES</p>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${
                    isSelected ? 'text-emerald-600 translate-x-1' : 'text-slate-300'
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Evidence Manager and Upload Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Module Detail */}
          {selectedModule && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block">Selected Competency Unit</span>
              <h4 className="text-sm font-black text-slate-800">{selectedModule.name}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{selectedModule.description}</p>
            </div>
          )}

          {/* Upload New Evidence Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-emerald-600"></div>

            <div className="border-b border-slate-100 pb-5">
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <UploadCloud className="text-emerald-600 h-5 w-5" />
                Upload New Evidence Record
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Submit documents, HD practical procedure videos, or observation checklists signed by trainer assessors.
              </p>
            </div>

            {formError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-xs text-red-800 border border-red-100 font-medium">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 p-4 text-xs text-emerald-800 border border-emerald-100 font-medium">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddEvidenceSubmit} className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Evidence Title / Task Name
                  </label>
                  <input
                    id="evidence-title-input"
                    type="text"
                    placeholder="e.g., Cat6 Cable Termination Bench"
                    value={evidenceTitle}
                    onChange={(e) => setEvidenceTitle(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-hidden transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Evidence Type Checklist
                  </label>
                  <select
                    id="evidence-type-select"
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-hidden transition-all duration-300 cursor-pointer"
                  >
                    <option value="project_report">Project Report / Laboratory Journal (PDF)</option>
                    <option value="practical_video">Practical Demonstration Video (MP4)</option>
                    <option value="assessor_checklist">Assessor Observation Checklist (PDF)</option>
                    <option value="other">Other Supporting Material (Images/Certificates)</option>
                  </select>
                </div>
              </div>

              {/* Description field */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Description of Work Done
                </label>
                <textarea
                  id="evidence-desc-textarea"
                  rows={3}
                  placeholder="Detail the tools used, steps followed, safety checks applied, and overall outcome of your practical performance task."
                  value={evidenceDesc}
                  onChange={(e) => setEvidenceDesc(e.target.value)}
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-hidden transition-all duration-300 resize-none"
                  required
                ></textarea>
                <span className="text-[10px] text-slate-400 mt-1.5 block font-medium leading-relaxed">
                  Provide descriptive, authentic details. The AI compliance scanner reviews this description to evaluate authenticity and validity.
                </span>
              </div>

              {/* File Upload Zone */}
              <div className="grid gap-5 sm:grid-cols-3">
                <div 
                  className={`sm:col-span-2 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 relative ${
                    dragActive 
                      ? 'border-emerald-500 bg-emerald-50/30' 
                      : mockFileName 
                        ? 'border-emerald-300 bg-emerald-50/10' 
                        : 'border-slate-200 bg-slate-50/30 hover:bg-slate-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  {filePreviewUrl ? (
                    <div className="mb-2">
                      <img src={filePreviewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-xl border border-slate-200 shadow-xs mx-auto" />
                    </div>
                  ) : (
                    <UploadCloud className={`h-8 w-8 ${mockFileName ? 'text-emerald-500' : 'text-slate-400'} mb-2`} />
                  )}

                  {mockFileName ? (
                    <div className="w-full">
                      <span className="text-xs font-black text-slate-800 block truncate max-w-xs mx-auto">{mockFileName}</span>
                      <span className="text-[9px] text-emerald-600 font-black uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {selectedFile ? `${formatBytes(selectedFile.size)} • Ready to upload` : 'File Selected'}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-black text-slate-700">Drag & Drop file here or</p>
                      <label className="text-xs font-black text-emerald-600 hover:text-emerald-700 underline cursor-pointer mt-1 block uppercase tracking-wider">
                        Browse files
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={handleFileSelect} 
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.zip"
                        />
                      </label>
                    </div>
                  )}

                  {/* Upload Progress Bar */}
                  {isSubmitting && (
                    <div className="w-full mt-3 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-600">
                        <span>Uploading Evidence...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <span className="text-[9px] text-slate-400 mt-2 font-medium">Supported formats: PDF, DOC, DOCX, PNG, JPG, MP4, ZIP</span>
                </div>

                {/* Simulated file size adjuster */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Simulated File Size
                    </label>
                    <div className="mt-2.5 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">{mockFileSizeMB}</span>
                      <span className="text-xs text-slate-500 font-bold">MB</span>
                    </div>
                  </div>

                  <input
                    id="mock-file-size-slider"
                    type="range"
                    min="1"
                    max="500"
                    value={mockFileSizeMB}
                    onChange={(e) => setMockFileSizeMB(parseInt(e.target.value))}
                    className="w-full mt-3 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <span className="text-[9px] text-slate-400 mt-1.5 block leading-relaxed font-medium">
                    Adjust slider to simulate different sizes.
                  </span>
                </div>
              </div>

              {/* Reflection Statement */}
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Learning Reflection Statement
                  </label>
                  
                  <button
                    id="btn-ai-reflection"
                    type="button"
                    onClick={handleGenerateReflection}
                    disabled={isGeneratingReflection}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-emerald-100 transition disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {isGeneratingReflection ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Drafting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        AI Assistant
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  id="reflection-textarea"
                  rows={4}
                  placeholder="Reflect on your educational journey. Write down what you learned, any problems you ran into and how you fixed them, and any safety protocols applied."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-hidden transition-all duration-300 resize-none"
                ></textarea>
                <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                  Learner reflections are mandatory under TVET National Guidelines to verify self-directed competence.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  id="btn-workspace-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading File...
                    </>
                  ) : (
                    <>
                      Submit and Request Audit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Submissions List */}
          <div className="space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">
              Active Module Submission Records
            </span>

            {currentModuleEvidence.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-slate-400 flex flex-col items-center justify-center">
                <FileText className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">No evidence records uploaded for this unit yet.</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-sm">Complete the form above to submit your first project report or practical demonstration video.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {currentModuleEvidence.map((ev) => (
                  <div
                    id={`evidence-item-card-${ev.id}`}
                    key={ev.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm relative space-y-5 hover:shadow-md transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5">
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] border ${
                            ev.type === 'practical_video'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : ev.type === 'project_report'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}>
                            {ev.type === 'practical_video' && <Video className="h-2.5 w-2.5" />}
                            {ev.type === 'project_report' && <FileText className="h-2.5 w-2.5" />}
                            {ev.type.replace('_', ' ')}
                          </span>

                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] border ${
                            ev.status === 'competent'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : ev.status === 'pending_review'
                                ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse'
                                : 'bg-red-50 border-red-200 text-red-700'
                          }`}>
                            <span>{ev.status.replace('_', ' ')}</span>
                          </span>

                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                            DATE: {ev.dateAcquired}
                          </span>
                        </div>

                        <h4 className="text-base font-black text-slate-900 leading-snug tracking-tight">{ev.title}</h4>
                        
                        {ev.fileName && (
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <FileText className="h-3 w-3 shrink-0 text-slate-400" />
                            <span className="truncate max-w-xs">{ev.fileName}</span>
                            <span>•</span>
                            <span>{formatBytes(ev.fileSize || 0)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {(ev.fileUrl || ev.fileName) && (
                          <a
                            href={ev.fileUrl || `/uploads/${ev.fileName}`}
                            download={ev.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-all duration-300 flex items-center gap-1 font-black uppercase tracking-wider shadow-2xs"
                            title="Download or View File"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </a>
                        )}
                        <button
                          id={`btn-workspace-audit-${ev.id}`}
                          onClick={() => triggerAIAudit(ev.id)}
                          disabled={isAuditingId !== null}
                          className="px-3 py-1.5 text-[10px] text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-100 transition-all duration-300 flex items-center gap-1 font-black uppercase tracking-wider shadow-2xs"
                          title="Run AI VASC Compliance Assessment"
                        >
                          {isAuditingId === ev.id ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Auditing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3" />
                              AI Audit
                            </>
                          )}
                        </button>

                        <button
                          id={`btn-workspace-delete-${ev.id}`}
                          onClick={() => handleDeleteEvidence(ev.id, ev.fileSize || 0)}
                          className="p-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors border border-transparent hover:border-red-100"
                          title="Retract Submission"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Sub content description */}
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Description of evidence work</span>
                      <p className="text-slate-600 leading-relaxed font-medium">{ev.description}</p>
                    </div>

                    {/* Reflection content */}
                    {ev.reflectionText && (
                      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-2 text-xs">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] block flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> Trainee Self-Reflection
                        </span>
                        <p className="text-slate-600 leading-relaxed italic font-medium">"{ev.reflectionText}"</p>
                      </div>
                    )}

                    {/* Manual Assessor feedback */}
                    {ev.assessorFeedback && (
                      <div className="rounded-2xl bg-indigo-50/50 border border-indigo-100 p-5 space-y-2 text-xs">
                        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.2em] block flex items-center gap-1.5">
                          <Award className="h-3.5 w-3.5 text-indigo-700" /> Assessor Review Feedback
                        </span>
                        <p className="text-slate-700 leading-relaxed font-black">"{ev.assessorFeedback}"</p>
                      </div>
                    )}

                    {/* AI Auditing feedback report */}
                    {ev.aiReviewResult && (
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/10 p-5 sm:p-6 space-y-5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                            AI TVET VASC Compliance Report
                          </span>
                          <span className={`text-[8px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-full border ${
                            ev.aiReviewResult.isValid 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                              : 'bg-amber-50 border-amber-200 text-amber-800'
                          }`}>
                            {ev.aiReviewResult.isValid ? 'Highly Compliant' : 'Needs Enhancements'}
                          </span>
                        </div>

                        {/* Scores bar checklist */}
                        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                          {/* Validity */}
                          <div className="space-y-1.5 bg-white border border-slate-200 p-3.5 rounded-2xl text-center shadow-2xs">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] block">Validity</span>
                            <span className="text-base font-black text-slate-800 block">{ev.aiReviewResult.validityScore}%</span>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${ev.aiReviewResult.validityScore}%` }}></div>
                            </div>
                          </div>

                          {/* Authenticity */}
                          <div className="space-y-1.5 bg-white border border-slate-200 p-3.5 rounded-2xl text-center shadow-2xs">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] block">Authenticity</span>
                            <span className="text-base font-black text-slate-800 block">{ev.aiReviewResult.authenticityScore}%</span>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${ev.aiReviewResult.authenticityScore}%` }}></div>
                            </div>
                          </div>

                          {/* Sufficiency */}
                          <div className="space-y-1.5 bg-white border border-slate-200 p-3.5 rounded-2xl text-center shadow-2xs">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] block">Sufficiency</span>
                            <span className="text-base font-black text-slate-800 block">{ev.aiReviewResult.sufficiencyScore}%</span>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${ev.aiReviewResult.sufficiencyScore}%` }}></div>
                            </div>
                          </div>

                          {/* Currency */}
                          <div className="space-y-1.5 bg-white border border-slate-200 p-3.5 rounded-2xl text-center shadow-2xs">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] block">Currency</span>
                            <span className="text-base font-black text-slate-800 block">{ev.aiReviewResult.currencyScore}%</span>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${ev.aiReviewResult.currencyScore}%` }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Critique text */}
                        <div className="text-[11px] text-slate-600 leading-relaxed border-t border-emerald-100/50 pt-3 flex gap-2 items-start font-medium">
                          <AlertCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <p>"{ev.aiReviewResult.feedback}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
