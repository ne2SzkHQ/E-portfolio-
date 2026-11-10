import React, { useState } from 'react';
import { School, UserCheck, ArrowRight, Sparkles, Plus, AlertCircle, Building, CheckCircle } from 'lucide-react';
import { TraineeProfile } from '../types';
import { MOCK_PROFILES } from '../data';

interface VerificationSectionProps {
  activeProfile: TraineeProfile | null;
  setActiveProfile: (profile: TraineeProfile | null) => void;
  setCurrentView: (view: string) => void;
  onRegisterCustom: (profile: TraineeProfile) => void;
}

export default function VerificationSection({
  activeProfile,
  setActiveProfile,
  setCurrentView,
  onRegisterCustom
}: VerificationSectionProps) {
  // Verification states
  const [institution, setInstitution] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Registration states for a custom profile
  const [isRegistering, setIsRegistering] = useState(false);
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCourse, setRegCourse] = useState('Diploma in Information Communication Technology (ICT)');
  const [regNumInput, setRegNumInput] = useState('');
  const [regIdInput, setRegIdInput] = useState('');
  const [regInst, setRegInst] = useState('Nairobi Technical Training Institute');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!institution) {
      setError("Please select your Assessment Center (Institution).");
      return;
    }

    const trimmedReg = regNumber.trim().toLowerCase();
    const trimmedId = idNumber.trim();

    // Match profile
    const matched = MOCK_PROFILES.find(
      (p) => 
        p.institution === institution && 
        p.registrationNumber.toLowerCase() === trimmedReg &&
        p.nationalId === trimmedId
    );

    if (matched) {
      setSuccess(`Welcome back, ${matched.fullName}! Verification successful. Redirecting...`);
      setTimeout(() => {
        setActiveProfile(matched);
        setCurrentView('dashboard');
        setSuccess(null);
      }, 1500);
    } else {
      setError("No matching profile found in the institutional registry. Double-check details or register below.");
    }
  };

  const handleQuickLogin = (profile: TraineeProfile) => {
    setError(null);
    setSuccess(`Quick verification successful for ${profile.fullName}! Opening workspace...`);
    setInstitution(profile.institution);
    setRegNumber(profile.registrationNumber);
    setIdNumber(profile.nationalId);

    setTimeout(() => {
      setActiveProfile(profile);
      setCurrentView('dashboard');
      setSuccess(null);
    }, 1200);
  };

  const handleCreateCustomProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regFullName || !regNumInput || !regIdInput || !regEmail) {
      setError("Please fill in all registration fields.");
      return;
    }

    const newProfile: TraineeProfile = {
      id: `student-custom-${Date.now()}`,
      registrationNumber: regNumInput.toUpperCase(),
      fullName: regFullName,
      nationalId: regIdInput,
      institution: regInst,
      courseName: regCourse,
      email: regEmail,
      storagePlanId: 'standard', // Default standard plan
      storageUsedBytes: 0,
      active: true
    };

    onRegisterCustom(newProfile);
    setActiveProfile(newProfile);
    setSuccess(`Custom Profile Created & Activated! Welcome, ${newProfile.fullName}!`);
    setIsRegistering(false);
    
    // reset form fields
    setRegFullName('');
    setRegNumInput('');
    setRegIdInput('');
    setRegEmail('');

    setTimeout(() => {
      setCurrentView('dashboard');
      setSuccess(null);
    }, 1500);
  };

  return (
    <div id="activation-section" className="space-y-6 animate-fadeIn">
      {/* Visual Welcome Banner */}
      <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-sm relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 bottom-0 translate-y-8 translate-x-8 opacity-10 pointer-events-none">
          <School className="h-64 w-64 text-white" />
        </div>
        <div className="max-w-3xl relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5D45D1]/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-purple-300 border border-purple-500/30">
            <Sparkles className="h-3 w-3 text-yellow-300" /> EduBridge CDACC Compliance
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl text-white">
            EduBridge <span className="text-purple-400">ePortfolio</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
            Welcome to the official TVET CDACC ePortfolio candidate and examiner portal. Instantly register your candidate details, upload practical task records, compile evidence logs, and access seamless evaluation pathways.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Verification Card */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#5D45D1]"></div>

          <div>
            <div className="border-b border-slate-100 pb-5">
              <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg uppercase tracking-[0.2em] mb-2 inline-block">STEP 01/03</span>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-1">
                <UserCheck className="text-[#5D45D1] h-5 w-5" />
                Trainee Profile Verification
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Synchronize academic records with your institution's digital file registry database.
              </p>
            </div>

            {/* Feedback banners */}
            {error && (
              <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-red-50 p-3.5 text-xs text-red-800 border border-red-100">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Activation Interrupted</p>
                  <p className="mt-0.5 text-red-700">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-purple-50 p-3.5 text-xs text-purple-800 border border-purple-100">
                <CheckCircle className="h-4 w-4 text-[#5D45D1] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Record Synchronized</p>
                  <p className="mt-0.5 text-purple-700">{success}</p>
                </div>
              </div>
            )}

            {!isRegistering ? (
              <form onSubmit={handleVerify} className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Assessment Center (Institution)
                  </label>
                  <select
                    id="institution-select"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-purple-100/50 transition-all cursor-pointer"
                    required
                  >
                    <option value="">Select Institution / National Polytechnic...</option>
                    <option value="Nairobi Technical Training Institute">Nairobi Technical Training Institute</option>
                    <option value="The Kenya Coast National Polytechnic">The Kenya Coast National Polytechnic</option>
                    <option value="Kisumu National Polytechnic">Kisumu National Polytechnic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Admission / Registration Number
                  </label>
                  <input
                    id="reg-number-input"
                    type="text"
                    placeholder="e.g., IN/001/2026"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    National ID / Birth Certificate
                  </label>
                  <input
                    id="id-number-input"
                    type="text"
                    placeholder="e.g., 34567890"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100/50 transition-all"
                    required
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-2">
                  <button
                    id="btn-register-mode"
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    className="text-xs font-semibold text-[#5D45D1] hover:text-purple-700 hover:underline flex items-center justify-center gap-1.5 self-center cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Not registered? Create custom candidate ePortfolio
                  </button>

                  <button
                    id="btn-verify-submit"
                    type="submit"
                    className="rounded-xl bg-[#5D45D1] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Verify & Enter Workspace <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            ) : (
              /* Custom Registration form */
              <form onSubmit={handleCreateCustomProfile} className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Full Name
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    placeholder="e.g., Jane Wanjiku Kamau"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Email Address
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="e.g., jane.kamau@student.ac.ke"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Institution
                  </label>
                  <select
                    id="reg-institution"
                    value={regInst}
                    onChange={(e) => setRegInst(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100/50 transition-all"
                  >
                    <option value="Nairobi Technical Training Institute">Nairobi Technical Training Institute</option>
                    <option value="The Kenya Coast National Polytechnic">The Kenya Coast National Polytechnic</option>
                    <option value="Kisumu National Polytechnic">Kisumu National Polytechnic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Course / Training Track
                  </label>
                  <select
                    id="reg-course"
                    value={regCourse}
                    onChange={(e) => setRegCourse(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100/50 transition-all"
                  >
                    <option value="Diploma in Information Communication Technology (ICT)">Diploma in Information Communication Technology (ICT)</option>
                    <option value="Diploma in Electrical Engineering">Diploma in Electrical Engineering</option>
                    <option value="Diploma in Automotive Engineering">Diploma in Automotive Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Custom Admission Number
                  </label>
                  <input
                    id="reg-admission"
                    type="text"
                    placeholder="e.g., NTTI/ICT/2026/8844"
                    value={regNumInput}
                    onChange={(e) => setRegNumInput(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    National ID / birth Certificate Number
                  </label>
                  <input
                    id="reg-id"
                    type="text"
                    placeholder="e.g., 38994412"
                    value={regIdInput}
                    onChange={(e) => setRegIdInput(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100/50 transition-all"
                    required
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between gap-4 mt-2">
                  <button
                    id="btn-reg-cancel"
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel and Back to Verification
                  </button>

                  <button
                    id="btn-reg-submit"
                    type="submit"
                    className="rounded-xl bg-[#5D45D1] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-purple-700 transition cursor-pointer"
                  >
                    Create & Log In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Administrative School Node Card - Bento styled exact contrast layout */}
        <div className="rounded-3xl bg-slate-950 p-8 text-white flex flex-col justify-between relative overflow-hidden border border-slate-850">
          <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 opacity-10 pointer-events-none">
            <Building className="h-44 w-44 text-purple-500" />
          </div>

          <div className="space-y-4 relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <School className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">Institutional Node</h2>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Restricted access for internal managers, trainers, and external TVET examiners to audit student portfolios.
            </p>
          </div>

          <div className="mt-6 flex flex-col justify-between flex-1 gap-6 relative z-10">
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Verify trainee submission integrity, evaluate visual evidence, audit reflections, and authorize national TVET competency standards using valid ministerial center credentialing keys.
            </p>
            
            <button
              id="btn-access-assessor"
              onClick={() => {
                setCurrentView('assessor');
              }}
              className="w-full py-4 border border-white/20 rounded-2xl font-bold text-sm text-white hover:bg-white/5 transition-all cursor-pointer hover:border-purple-500/50"
            >
              Admin Login
            </button>
          </div>
        </div>
      </div>

      {/* Quick Demo Login Hub for high interactive review */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg uppercase tracking-[0.2em] mb-2 inline-block">
          STEP 02/03
        </span>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5 mt-1">
          <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" /> Quick Testing Credentials Panel
        </h3>
        <p className="text-xs text-slate-500 mt-1.5 mb-6 leading-relaxed font-medium">
          No need to manually type admission profiles! Select any preloaded, TVET-compliant demo account below to instantly synchronize with realistic student records.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {MOCK_PROFILES.map((profile) => (
            <button
              id={`demo-profile-btn-${profile.id}`}
              key={profile.id}
              onClick={() => handleQuickLogin(profile)}
              className="group flex flex-col text-left p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#5D45D1] hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 cursor-pointer focus:outline-hidden relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-1.5 w-0 bg-[#5D45D1] group-hover:w-full transition-all duration-300"></div>
              <span className="text-xs font-bold text-slate-900 block truncate">{profile.fullName}</span>
              <span className="text-[10px] text-slate-400 mt-1 block truncate font-medium">{profile.institution}</span>
              <div className="mt-4 flex items-center justify-between w-full pt-3 border-t border-slate-100">
                <span className="text-[9px] font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  {profile.registrationNumber}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">ID: {profile.nationalId}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
