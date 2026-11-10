import React, { useState } from 'react';
import { UserPlus, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { TraineeProfile } from '../types';

interface RegisterViewProps {
  onRegisterCustom: (newProfile: TraineeProfile) => void;
  setCurrentView: (view: string) => void;
}

export default function RegisterView({
  onRegisterCustom,
  setCurrentView
}: RegisterViewProps) {
  const [fullName, setFullName] = useState('');
  const [regNum, setRegNum] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [institution, setInstitution] = useState('');
  const [courseName, setCourseName] = useState('Level 6 Diploma in Information Communication Technology (ICT)');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your security input.");
      return;
    }

    const newProfile: TraineeProfile = {
      id: `trainee-${Date.now()}`,
      registrationNumber: regNum || `REG/${Math.floor(10000 + Math.random() * 90000)}`,
      fullName,
      nationalId: nationalId || `${Math.floor(10000000 + Math.random() * 90000000)}`,
      institution: institution || 'The Kenya Coast National Polytechnic',
      courseName,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@tvet.ac.ke`,
      storagePlanId: 'free',
      storageUsedBytes: 0,
      active: true
    };

    onRegisterCustom(newProfile);
    setCurrentView('dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-black text-[#5D45D1] bg-purple-50 px-3 py-1 rounded-lg uppercase tracking-[0.2em] inline-block">
          Candidate Enrollment
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Create TVET Candidate ePortfolio Account
        </h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto font-medium">
          Register your CDACC candidate details to start uploading practical evidence logs, project reports, and observation records.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden space-y-6">
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#5D45D1]"></div>

        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#5D45D1]" /> Candidate Credentials Form
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Ensure information matches official CDACC examination records.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3.5 rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Full Candidate Name
              </label>
              <input
                type="text"
                placeholder="e.g., Jane Wanjiku Kamau"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-800 focus:border-[#5D45D1] focus:bg-white focus:outline-hidden transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                CDACC Candidate Reg Number
              </label>
              <input
                type="text"
                placeholder="e.g., KNP/ICT/2025/0892"
                value={regNum}
                onChange={(e) => setRegNum(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-mono text-slate-800 focus:border-[#5D45D1] focus:bg-white focus:outline-hidden transition-all"
                required
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                National ID / Assessment Index Number
              </label>
              <input
                type="text"
                placeholder="e.g., 38291024"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-mono text-slate-800 focus:border-[#5D45D1] focus:bg-white focus:outline-hidden transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Official Candidate Email
              </label>
              <input
                type="email"
                placeholder="e.g., jane.kamau@tvet.ac.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-800 focus:border-[#5D45D1] focus:bg-white focus:outline-hidden transition-all"
                required
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                TVET Institution / Polytechnic
              </label>
              <input
                type="text"
                placeholder="e.g., The Kenya Coast National Polytechnic"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-800 focus:border-[#5D45D1] focus:bg-white focus:outline-hidden transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Registered Course / Program
              </label>
              <select
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-800 focus:border-[#5D45D1] focus:bg-white focus:outline-hidden transition-all cursor-pointer"
              >
                <option value="Level 6 Diploma in Information Communication Technology (ICT)">Level 6 Diploma in Information Communication Technology (ICT)</option>
                <option value="Level 6 Diploma in Electrical Engineering (Power Option)">Level 6 Diploma in Electrical Engineering (Power Option)</option>
                <option value="Level 5 Certificate in Automotive Engineering">Level 5 Certificate in Automotive Engineering</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-800 focus:border-[#5D45D1] focus:bg-white focus:outline-hidden transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-800 focus:border-[#5D45D1] focus:bg-white focus:outline-hidden transition-all"
                required
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full rounded-xl bg-[#5D45D1] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              Complete Registration & Access Workspace <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium">Already registered as a candidate? </span>
          <button
            onClick={() => setCurrentView('login')}
            className="text-xs font-bold text-[#5D45D1] hover:underline cursor-pointer"
          >
            Log In Here
          </button>
        </div>
      </div>
    </div>
  );
}
