import { useState } from 'react';
import { 
  Home, 
  LogIn, 
  UserPlus, 
  LayoutDashboard, 
  User as UserIcon, 
  BookOpen, 
  UploadCloud, 
  FileText, 
  Award, 
  ShieldCheck, 
  BarChart3, 
  Settings, 
  ShieldAlert,
  Menu,
  X,
  ChevronDown,
  Check,
  Briefcase,
  QrCode,
  Bell,
  Mail
} from 'lucide-react';
import { TraineeProfile, UserRole } from '../types';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  activeProfile: TraineeProfile | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  onLogout: () => void;
}

export default function Header({
  currentView,
  setCurrentView,
  activeProfile,
  role,
  setRole,
  onLogout
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'Student', label: 'Student / Candidate', desc: 'Upload evidence, view results & profile' },
    { role: 'Trainer', label: 'Trainer / Lecturer', desc: 'Review evidence & monitor progress' },
    { role: 'Assessor', label: 'Assessor Examiner', desc: 'Assess evidence & assign grades' },
    { role: 'Internal Verifier', label: 'Internal Verifier (IV)', desc: 'Verify & approve assessments' },
    { role: 'External Verifier', label: 'External Verifier (EV)', desc: 'Audit assessments & national compliance' },
    { role: 'Administrator', label: 'System Administrator', desc: 'Manage users, courses, units & logs' }
  ];

  const mainNavItems = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'login', label: 'Login', icon: LogIn },
    { id: 'register', label: 'Register', icon: UserPlus },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'units', label: 'Units', icon: BookOpen },
    { id: 'upload', label: 'Upload Evidence', icon: UploadCloud },
    { id: 'evidence_list', label: 'Evidence List', icon: FileText },
    { id: 'assessment', label: 'Assessment', icon: Award },
    { id: 'verification_view', label: 'Internal Verification', icon: ShieldCheck },
    { id: 'certificates', label: 'Certificates & QR', icon: QrCode },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'admin_panel', label: 'Admin Panel', icon: Settings },
    { id: 'assessor', label: 'Assessor Workspace', icon: ShieldAlert },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div id="header-container" className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* EduBridge Brand Block */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('landing')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5D45D1] font-black text-white text-sm tracking-tight shadow-md shadow-purple-500/20 transition-transform hover:scale-105">
              EB
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900 leading-none flex items-center">
                Edu<span className="text-[#5D45D1]">Bridge</span>
                <span className="ml-1 px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200 text-[8px] font-black text-[#5D45D1] tracking-wider">TVET ePoE</span>
              </h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mt-1">
                NATIONAL CDACC PORTFOLIO LEDGER
              </p>
            </div>
          </div>

          <button 
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Primary Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => {
                  setCurrentView(item.id);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#5D45D1] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#5D45D1]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Role Selector & Profile Badge */}
        <div className="hidden sm:flex items-center space-x-2 shrink-0 relative">
          {activeProfile && (
            <div className="flex flex-col items-end text-right mr-1">
              <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{activeProfile.fullName}</span>
              <span className="text-[9px] font-mono text-slate-400">{activeProfile.registrationNumber}</span>
            </div>
          )}

          {/* Real-time Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">
                3
              </span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Live Alerts & Email Notifications</span>
                  <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Real-Time</span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 space-y-1">
                    <div className="font-bold text-[#5D45D1] text-[11px] flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Assessed as Competent (C)
                    </div>
                    <p className="text-[10px] text-slate-600 font-medium leading-snug">
                      Assessor Wanjiku marked "Database Schema Design" with score 88%.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                    <div className="font-bold text-emerald-800 text-[11px] flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" /> Internal Verification Approved
                    </div>
                    <p className="text-[10px] text-slate-600 font-medium leading-snug">
                      IV verified assessment #1. Competency unit ICT/01 awarded.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 space-y-1">
                    <div className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                      <QrCode className="h-3 w-3 text-amber-600" /> Certificate CERT-2026-ICT-8841 Released
                    </div>
                    <p className="text-[10px] text-slate-600 font-medium leading-snug">
                      Your CDACC certificate is now available with QR verification.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 6-Role Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-[#5D45D1] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-purple-100 transition cursor-pointer"
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Role: {role}</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 space-y-1">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Select Active User Role</span>
                </div>
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setRole(r.role);
                      setRoleDropdownOpen(false);
                      if (r.role !== 'Student') {
                        setCurrentView('assessor');
                      } else {
                        setCurrentView('dashboard');
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-start justify-between transition cursor-pointer ${
                      role === r.role ? 'bg-purple-50 text-[#5D45D1] font-black' : 'hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1">
                        {r.label}
                      </div>
                      <p className="text-[9px] text-slate-400 font-normal">{r.desc}</p>
                    </div>
                    {role === r.role && <Check className="h-4 w-4 text-[#5D45D1] shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeProfile && (
            <button
              id="btn-logout"
              onClick={onLogout}
              className="px-2 py-1 text-[10px] text-red-600 font-bold hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="p-2 bg-purple-50 rounded-xl border border-purple-100">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#5D45D1] block mb-1">Active Role</span>
            <select
              value={role}
              onChange={(e) => {
                const newRole = e.target.value as UserRole;
                setRole(newRole);
                if (newRole !== 'Student') {
                  setCurrentView('assessor');
                } else {
                  setCurrentView('dashboard');
                }
              }}
              className="w-full p-2 bg-white rounded-lg border border-purple-200 text-xs font-bold text-slate-800"
            >
              {rolesList.map(r => (
                <option key={r.role} value={r.role}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`mob-nav-btn-${item.id}`}
                  onClick={() => {
                    setCurrentView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive ? 'bg-[#5D45D1] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}


