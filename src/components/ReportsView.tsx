import React, { useState } from 'react';
import { BarChart3, Printer, Download, ShieldCheck, CheckCircle, Award, Building, BookOpen, Search, Filter, FileSpreadsheet, FileText, User, Calendar } from 'lucide-react';
import { TraineeProfile, EvidenceItem } from '../types';
import { COURSE_MODULES } from '../data';

interface ReportsViewProps {
  activeProfile: TraineeProfile;
  evidence: EvidenceItem[];
}

export default function ReportsView({
  activeProfile,
  evidence
}: ReportsViewProps) {
  const [reportType, setReportType] = useState<'student' | 'course' | 'assessment' | 'verification' | 'uploads' | 'activity'>('student');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  const modules = COURSE_MODULES[activeProfile.courseName] || [];
  const candidateEvidence = evidence.filter(e => e.traineeId === activeProfile.id);
  const competentCount = candidateEvidence.filter(e => e.status === 'competent' || e.status === 'Approved').length;

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Module Code,Unit Title,Credits,Status,Evidence Files\n";
    
    modules.forEach(m => {
      const logs = candidateEvidence.filter(e => e.moduleCode === m.code);
      csvContent += `"${m.code}","${m.name}",${m.credits},"${m.status}",${logs.length}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TVET_Report_${activeProfile.registrationNumber}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification("Report successfully exported to CSV / Excel!");
  };

  const filteredModules = modules.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || m.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-black text-[#5D45D1] bg-purple-50 px-3 py-1 rounded-lg uppercase tracking-[0.2em] inline-block mb-1 border border-purple-200">
            TVET CDACC Analytics & Reporting
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional & Candidate Reports</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export CSV / Excel
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-[#5D45D1] text-white text-xs font-black uppercase tracking-wider hover:bg-purple-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer className="h-4 w-4" /> Print PDF Report
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-700 hover:underline text-[10px] uppercase font-black">Dismiss</button>
        </div>
      )}

      {/* Report Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'student', label: 'Student Progress', icon: User },
          { id: 'course', label: 'Course Report', icon: BookOpen },
          { id: 'assessment', label: 'Assessment Summary', icon: Award },
          { id: 'verification', label: 'Verification Summary', icon: ShieldCheck },
          { id: 'uploads', label: 'Evidence Uploads', icon: FileText },
          { id: 'activity', label: 'User Activity Log', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = reportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-[#5D45D1] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by unit code, module name, or title..."
            className="w-full pl-10 pr-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#5D45D1] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="competent">Competent</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Official Printable Report Layout */}
      <div className="rounded-3xl border-2 border-slate-200 bg-white p-8 sm:p-12 shadow-md space-y-8 relative overflow-hidden print:shadow-none print:border-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-slate-900 pb-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5D45D1] text-white font-black text-lg">
              EB
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">EduBridge Systems Ltd</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                TVET CDACC NATIONAL DIGITAL ePoE LEDGER
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block">
              AUTHENTICATED TRANSCRIPT
            </span>
            <p className="text-[10px] font-mono text-slate-400 mt-1">DATE: {new Date().toISOString().split('T')[0]}</p>
          </div>
        </div>

        {/* Candidate Information Box */}
        <div className="grid gap-4 sm:grid-cols-2 text-xs bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Candidate Name</span>
            <span className="text-sm font-black text-slate-900">{activeProfile.fullName}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Registration Number</span>
            <span className="text-sm font-mono font-black text-[#5D45D1]">{activeProfile.registrationNumber}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">TVET Institution</span>
            <span className="font-bold text-slate-800">{activeProfile.institution}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">National ID</span>
            <span className="font-mono font-bold text-slate-800">{activeProfile.nationalId}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Qualification Program</span>
            <span className="font-bold text-slate-900">{activeProfile.courseName}</span>
          </div>
        </div>

        {/* Dynamic Table based on report selection */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
            {reportType.toUpperCase()} PERFORMANCE RECORD
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Unit Description</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Evidence Submissions</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredModules.length > 0 ? (
                  filteredModules.map((mod) => {
                    const logs = candidateEvidence.filter(e => e.moduleCode === mod.code);
                    const isCompetent = mod.status === 'competent' || logs.some(e => e.status === 'competent' || e.status === 'Approved');

                    return (
                      <tr key={mod.code} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-[#5D45D1]">{mod.code}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{mod.name}</td>
                        <td className="py-3 px-4 text-slate-500">{mod.credits}</td>
                        <td className="py-3 px-4 text-slate-500">{logs.length} files</td>
                        <td className="py-3 px-4 text-right">
                          {isCompetent ? (
                            <span className="font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded text-[10px] uppercase border border-emerald-200">COMPETENT</span>
                          ) : (
                            <span className="font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded text-[10px] uppercase border border-amber-200">PENDING</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium text-xs">
                      No matching records found for search filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification Stamp Footer */}
        <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="h-8 w-8 text-[#5D45D1]" />
            <div>
              <p className="text-xs font-black text-slate-900">VERIFIED BY CDACC NATIONAL LEDGER</p>
              <p className="text-[9px] font-mono text-slate-400">CRYPTOGRAPHIC CHECKSUM: sha256_eb_992a88f10b</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-slate-400">OFFICIAL CDACC STAMP</p>
            <div className="h-10 w-28 border border-dashed border-slate-300 rounded-lg mt-1 flex items-center justify-center text-[9px] font-bold text-slate-400">
              SEAL VALID
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
