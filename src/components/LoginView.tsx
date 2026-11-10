import React, { useState } from 'react';
import { LogIn, Key, ShieldCheck, ArrowRight, UserCheck, Lock } from 'lucide-react';
import { TraineeProfile } from '../types';

interface LoginViewProps {
  profiles: TraineeProfile[];
  activeProfile: TraineeProfile | null;
  setActiveProfile: (profile: TraineeProfile) => void;
  setCurrentView: (view: string) => void;
  setRole: (role: 'trainee' | 'assessor') => void;
}

export default function LoginView({
  profiles,
  activeProfile,
  setActiveProfile,
  setCurrentView,
  setRole
}: LoginViewProps) {
  const [regNum, setRegNum] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'trainee' | 'assessor'>('trainee');
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (loginRole === 'assessor') {
      setRole('assessor');
      setCurrentView('assessor');
      return;
    }

    const found = profiles.find(
      p => p.registrationNumber.toLowerCase().trim() === regNum.toLowerCase().trim() ||
           p.nationalId.trim() === regNum.trim() ||
           p.email.toLowerCase().trim() === regNum.toLowerCase().trim()
    );

    if (found) {
      setActiveProfile(found);
      setRole('trainee');
      setCurrentView('dashboard');
    } else {
      setError("No matching candidate profile found for this registration number or ID. Try quick login below.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-black text-[#5D45D1] bg-purple-50 px-3 py-1 rounded-lg uppercase tracking-[0.2em] inline-block">
          CDACC Portal Authentication
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Candidate & Assessor Portal Login
        </h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto font-medium">
          Access your TVET digital ePortfolio ledger, review unit evidence, or perform official VASC competency evaluations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* Main Login Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#5D45D1]"></div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <LogIn className="h-5 w-5 text-[#5D45D1]" /> Account Login
            </h2>
            <div className="flex bg-slate-100 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setLoginRole('trainee')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  loginRole === 'trainee' ? 'bg-white text-[#5D45D1] shadow-xs' : 'text-slate-500'
                }`}
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setLoginRole('assessor')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  loginRole === 'assessor' ? 'bg-white text-[#5D45D1] shadow-xs' : 'text-slate-500'
                }`}
              >
                Assessor
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginRole === 'trainee' ? (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Registration Number / National ID / Email
                </label>
                <input
                  type="text"
                  placeholder="e.g., KNP/ICT/2025/0892 or 38291024"
                  value={regNum}
                  onChange={(e) => setRegNum(e.target.value)}
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-mono text-slate-800 focus:border-[#5D45D1] focus:bg-white focus:outline-hidden transition-all"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Assessor Access Code / License ID
                </label>
                <input
                  type="text"
                  placeholder="e.g., CDACC-EVAL-2026"
                  defaultValue="CDACC-EVAL-2026"
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-mono text-slate-800 focus:border-[#5D45D1] focus:bg-white focus:outline-hidden transition-all"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Password / Security PIN
              </label>
              <div className="relative mt-2">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-800 focus:border-[#5D45D1] focus:bg-white focus:outline-hidden transition-all"
                  required
                />
                <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#5D45D1] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              Log In to Portal <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Don't have a registered candidate profile? </span>
            <button
              onClick={() => setCurrentView('register')}
              className="text-xs font-bold text-[#5D45D1] hover:underline cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Quick Demo Switcher */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5D45D1] bg-purple-50 px-2 py-0.5 rounded">
              Demonstration Mode
            </span>
            <h3 className="text-base font-black text-slate-900 mt-1">Quick Select Demo Candidate</h3>
            <p className="text-xs text-slate-500 font-medium">Click any seed profile below to instantly log in as a candidate.</p>
          </div>

          <div className="space-y-3">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => {
                  setActiveProfile(profile);
                  setRole('trainee');
                  setCurrentView('dashboard');
                }}
                className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-purple-50/40 hover:border-[#5D45D1] transition-all text-left flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#5D45D1]">{profile.fullName}</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{profile.registrationNumber} • {profile.courseName}</p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#5D45D1] bg-white border border-purple-200 px-2.5 py-1 rounded-lg shadow-2xs group-hover:bg-[#5D45D1] group-hover:text-white transition">
                  Select
                </span>
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setRole('assessor');
                setCurrentView('assessor');
              }}
              className="w-full py-3 rounded-xl border border-slate-300 bg-slate-900 text-white text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4 text-purple-400" /> Enter as Assessor Examiner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
