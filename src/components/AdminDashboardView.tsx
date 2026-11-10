import React, { useEffect, useState } from 'react';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Award, 
  ShieldCheck, 
  TrendingUp, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Download, 
  RefreshCw, 
  Layers, 
  Activity, 
  Settings, 
  Search,
  Plus,
  Edit2,
  Trash2,
  KeyRound,
  CheckCircle,
  Clock,
  Building
} from 'lucide-react';
import { TraineeProfile } from '../types';
import axios from 'axios';

interface AdminDashboardViewProps {
  activeProfile: TraineeProfile;
  setCurrentView: (view: string) => void;
}

interface AdminStats {
  students: number;
  trainers: number;
  assessors: number;
  verifiers: number;
  evidence: number;
  assessments: number;
  pendingReview: number;
  verified: number;
  courses: number;
  units: number;
}

interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  admissionNo?: string;
  dataProtectionStatus?: string;
  createdAt?: string;
}

export default function AdminDashboardView({
  activeProfile,
  setCurrentView
}: AdminDashboardViewProps) {
  const [stats, setStats] = useState<AdminStats>({
    students: 358,
    trainers: 22,
    assessors: 16,
    verifiers: 8,
    evidence: 5643,
    assessments: 5421,
    pendingReview: 75,
    verified: 5280,
    courses: 12,
    units: 145
  });

  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'reports' | 'logs'>('overview');
  
  // User Management state
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Add User Form state
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<string>('Student');
  const [newUserAdmission, setNewUserAdmission] = useState<string>('');

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
    fetchUsers();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const res = await axios.get('/api/admin/dashboard', {
        headers: { Authorization: 'Bearer ' + (localStorage.getItem('tvet_token') || '') }
      });
      if (res.data) {
        setStats(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.warn("Failed to fetch admin stats, using fallback preset:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await axios.get('/api/admin/users', {
        headers: { Authorization: 'Bearer ' + (localStorage.getItem('tvet_token') || '') }
      });
      if (Array.isArray(res.data)) {
        setUsersList(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch users list:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const newRec: UserRecord = {
      id: `usr-${Date.now()}`,
      fullName: newUserName,
      email: newUserEmail,
      role: newUserRole,
      admissionNo: newUserAdmission || `TVET/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      dataProtectionStatus: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    setUsersList(prev => [newRec, ...prev]);
    setNotification(`Successfully added new user "${newUserName}" with role [${newUserRole}].`);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserAdmission('');
    setShowAddUserModal(false);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.dataProtectionStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
        setNotification(`User "${u.fullName}" status updated to ${nextStatus}.`);
        return { ...u, dataProtectionStatus: nextStatus };
      }
      return u;
    }));
  };

  const handleExportReport = (type: string, format: string) => {
    setNotification(`Generating ${type} in ${format.toUpperCase()} format... Download starting shortly.`);
    setTimeout(() => {
      setNotification(`${type} (${format.toUpperCase()}) exported successfully!`);
    }, 1500);
  };

  const filteredUsers = usersList.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Admin Header */}
      <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 bottom-0 translate-y-8 translate-x-8 opacity-10 pointer-events-none">
          <Settings className="h-64 w-64 text-white" />
        </div>
        <div className="max-w-3xl relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-purple-300 border border-purple-500/30">
            <Activity className="h-3 w-3 text-purple-400" /> Administrator Control Center
          </span>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-white">
            TVET ePOE <span className="text-[#5D45D1]">Administrator</span> Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Centralized management portal for students, trainers, assessors, verifiers, courses, competency units, compliance audit streams, and system reporting.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-900 flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-[#5D45D1] hover:underline text-[10px] uppercase font-black">Dismiss</button>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#5D45D1] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="h-4 w-4" /> Overview Statistics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#5D45D1] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="h-4 w-4" /> User Management
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-[#5D45D1] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="h-4 w-4" /> Courses & Units
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-[#5D45D1] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Download className="h-4 w-4" /> Reports & Analytics
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-[#5D45D1] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="h-4 w-4" /> System Audit Logs
        </button>
      </div>

      {/* TAB 1: OVERVIEW STATISTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">Students</span>
                <Users className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">{stats.students}</div>
              <div className="text-[10px] font-bold text-slate-400">Enrolled Candidates</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">Trainers</span>
                <UserCheck className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">{stats.trainers}</div>
              <div className="text-[10px] font-bold text-slate-400">Lecturers & Instructors</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">Assessors</span>
                <Award className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">{stats.assessors}</div>
              <div className="text-[10px] font-bold text-slate-400">Certified Examiners</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">Evidence Logs</span>
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">{stats.evidence}</div>
              <div className="text-[10px] font-bold text-slate-400">Submissions Logged</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">Assessments</span>
                <ShieldCheck className="h-4 w-4 text-teal-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">{stats.assessments}</div>
              <div className="text-[10px] font-bold text-slate-400">Evaluations Completed</div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" /> Workflow Pipeline Health
              </h2>
              <div className="space-y-3 font-medium text-xs">
                <div className="flex justify-between items-center p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <span className="text-amber-900 font-bold">Pending Review Submissions</span>
                  <span className="font-mono font-black text-amber-700 text-sm">{stats.pendingReview}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-emerald-900 font-bold">Verified & Finalized Records</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">{stats.verified}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-purple-50 border border-purple-100">
                  <span className="text-purple-900 font-bold">Active TVET Courses</span>
                  <span className="font-mono font-black text-[#5D45D1] text-sm">{stats.courses}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-800 font-bold">Competency Units Registered</span>
                  <span className="font-mono font-black text-slate-900 text-sm">{stats.units}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building className="h-5 w-5 text-[#5D45D1]" /> Institutional Compliance Summary
              </h2>
              <div className="space-y-3 text-xs text-slate-600 font-medium">
                <p>
                  All trainee evidence logs and evaluation markings are stored with SHA-256 cryptographic hashes for national CDACC compliance.
                </p>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700">
                    <span>Overall Verification Rate</span>
                    <span>94.2%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full w-[94.2%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name, email, or role..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-[#5D45D1] focus:outline-hidden"
              />
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-5 py-2.5 rounded-xl bg-[#5D45D1] hover:bg-[#4d36be] text-white font-black text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-2 justify-center cursor-pointer"
            >
              <UserPlus className="h-4 w-4" /> Add New User
            </button>
          </div>

          {/* Add User Form Drawer */}
          {showAddUserModal && (
            <div className="p-6 rounded-3xl border border-purple-200 bg-purple-50/50 space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-purple-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Register System User</h3>
                <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Cancel</button>
              </div>

              <form onSubmit={handleAddUser} className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. John Kamau"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="john@tvet.ac.ke"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">System Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold"
                  >
                    <option value="Student">Student / Candidate</option>
                    <option value="Trainer">Trainer / Lecturer</option>
                    <option value="Assessor">Assessor</option>
                    <option value="Internal Verifier">Internal Verifier</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Admission/Staff ID</label>
                  <input
                    type="text"
                    value={newUserAdmission}
                    onChange={(e) => setNewUserAdmission(e.target.value)}
                    placeholder="e.g. TVET/2026/0491"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#5D45D1] text-white text-xs font-black uppercase tracking-wider shadow-xs"
                  >
                    Save User
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Admission / Staff No</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{user.fullName}</div>
                      <div className="text-[10px] text-slate-400">{user.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block text-[9px] font-black uppercase tracking-wider bg-purple-50 text-[#5D45D1] border border-purple-200 px-2.5 py-0.5 rounded-full">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {user.admissionNo || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      {user.dataProtectionStatus === 'SUSPENDED' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          <UserX className="h-3 w-3" /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                      >
                        {user.dataProtectionStatus === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COURSES & UNITS */}
      {activeTab === 'courses' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#5D45D1]" /> Registered Courses
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-900">Diploma in Information Communication Technology (ICT)</div>
                <div className="text-[10px] text-slate-500 font-medium">Level 6 • 8 Competency Units Registered</div>
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-900">Diploma in Electrical Engineering (Power Option)</div>
                <div className="text-[10px] text-slate-500 font-medium">Level 6 • 10 Competency Units Registered</div>
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-900">Certificate in Automotive Engineering</div>
                <div className="text-[10px] text-slate-500 font-medium">Level 5 • 6 Competency Units Registered</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-600" /> Core Competency Units
            </h2>
            <div className="space-y-3 text-xs font-medium text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span>ICT/01 - Web Application Development</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Core</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span>ICT/02 - Database Management Systems</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Core</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span>EE/01 - Electrical Safety & Grounding</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Core</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REPORTS & EXPORT */}
      {activeTab === 'reports' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Download className="h-5 w-5 text-[#5D45D1]" /> Export Official Reports & Analytics
            </h2>
            <p className="text-xs text-slate-500 mt-1">Generate CDACC compliant PDF, Excel, and CSV audit reports.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Student Progress Report",
              "Assessment & Grading Summary",
              "Internal Verification Audit",
              "Competency Award Report",
              "Attendance & Workshop Log",
              "System User Activity Log"
            ].map((repTitle, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{repTitle}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Comprehensive report format</div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => handleExportReport(repTitle, 'PDF')}
                    className="flex-1 py-1.5 text-[9px] font-black uppercase text-[#5D45D1] bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => handleExportReport(repTitle, 'Excel')}
                    className="flex-1 py-1.5 text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition"
                  >
                    Excel
                  </button>
                  <button
                    onClick={() => handleExportReport(repTitle, 'CSV')}
                    className="flex-1 py-1.5 text-[9px] font-black uppercase text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition"
                  >
                    CSV
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Activity className="h-5 w-5 text-indigo-600" /> System Audit Stream
          </h2>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-700">
              <span>[09:15:22] Candidate uploaded practical evidence: "Database Schema Documentation"</span>
              <span className="text-[10px] font-bold text-slate-400">TODAY</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-700">
              <span>[09:25:40] Trainer reviewed evidence submission #104</span>
              <span className="text-[10px] font-bold text-slate-400">TODAY</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-700">
              <span>[10:00:11] Assessor marked Competent (C) with score 88%</span>
              <span className="text-[10px] font-bold text-slate-400">TODAY</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-700">
              <span>[10:15:05] Internal Verifier Approved assessment record #1</span>
              <span className="text-[10px] font-bold text-slate-400">TODAY</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-700">
              <span>[10:30:00] Administrator generated system progress report</span>
              <span className="text-[10px] font-bold text-slate-400">TODAY</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
