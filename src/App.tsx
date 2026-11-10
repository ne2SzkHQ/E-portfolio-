import { useState } from 'react';
import { MOCK_PROFILES, SEEDED_EVIDENCE } from './data';
import { TraineeProfile, EvidenceItem, UserRole } from './types';
import Header from './components/Header';
import VerificationSection from './components/VerificationSection';
import StoragePlans from './components/StoragePlans';
import TraineeWorkspace from './components/TraineeWorkspace';
import AssessorWorkspace from './components/AssessorWorkspace';
import EducationalResources from './components/EducationalResources';
import LandingPage from './components/LandingPage';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import ProfileView from './components/ProfileView';
import UnitsView from './components/UnitsView';
import UploadView from './components/UploadView';
import EvidenceListView from './components/EvidenceListView';
import AssessmentView from './components/AssessmentView';
import VerificationView from './components/VerificationView';
import AdminDashboardView from './components/AdminDashboardView';
import CertificateView from './components/CertificateView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';

export default function App() {
  // Global App State
  const [profiles, setProfiles] = useState<TraineeProfile[]>(MOCK_PROFILES);
  const [evidence, setEvidence] = useState<EvidenceItem[]>(SEEDED_EVIDENCE);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(profiles[0]?.id || null);
  
  // Navigation states
  const [currentView, setCurrentView] = useState<string>('landing');
  const [role, setRole] = useState<UserRole>('Student');

  // Derive active profile directly from profile state list
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  // Handlers
  const handleRegisterCustom = (newProfile: TraineeProfile) => {
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const handleUpgradePlan = (planId: string) => {
    if (!activeProfileId) return;
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          storagePlanId: planId
        };
      }
      return p;
    }));
  };

  const handleUpdateStorage = (bytesUsed: number) => {
    if (!activeProfileId) return;
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          storageUsedBytes: bytesUsed
        };
      }
      return p;
    }));
  };

  const handleUpdateCompetency = (profileId: string, moduleCode: string, isCompetent: boolean) => {
    // Competency dynamic update
  };

  const handleLogout = () => {
    setActiveProfileId(null);
    setCurrentView('landing');
    setRole('Student');
  };

  if (currentView === 'landing' || currentView === 'home') {
    return (
      <LandingPage
        setCurrentView={setCurrentView}
        activeProfile={activeProfile}
        setRole={(r) => setRole(r as UserRole)}
      />
    );
  }

  return (
    <div id="app-wrapper" className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* 1. Brand Navigation Portal */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeProfile={activeProfile}
        role={role}
        setRole={setRole}
        onLogout={handleLogout}
      />

      {/* 2. Visual Workspace Router */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {currentView === 'login' && (
          <LoginView
            profiles={profiles}
            activeProfile={activeProfile}
            setActiveProfile={(p) => setActiveProfileId(p.id)}
            setCurrentView={setCurrentView}
            setRole={(r) => setRole(r as UserRole)}
          />
        )}

        {currentView === 'register' && (
          <RegisterView
            onRegisterCustom={handleRegisterCustom}
            setCurrentView={setCurrentView}
          />
        )}

        {(currentView === 'activation' || currentView === 'verification') && (
          <VerificationSection
            activeProfile={activeProfile}
            setActiveProfile={(p) => setActiveProfileId(p ? p.id : null)}
            setCurrentView={setCurrentView}
            onRegisterCustom={handleRegisterCustom}
          />
        )}

        {currentView === 'pricing' && (
          <StoragePlans
            activeProfile={activeProfile}
            onUpgradePlan={handleUpgradePlan}
            setCurrentView={setCurrentView}
          />
        )}

        {currentView === 'resources' && (
          <EducationalResources />
        )}

        {currentView === 'dashboard' && (
          <TraineeWorkspace
            activeProfile={activeProfile}
            evidence={evidence}
            setEvidence={setEvidence}
            onUpdateStorage={handleUpdateStorage}
            setCurrentView={setCurrentView}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            activeProfile={activeProfile}
            evidence={evidence}
            setCurrentView={setCurrentView}
          />
        )}

        {currentView === 'units' && (
          <UnitsView
            activeProfile={activeProfile}
            evidence={evidence}
            setCurrentView={setCurrentView}
          />
        )}

        {currentView === 'upload' && (
          <UploadView
            activeProfile={activeProfile}
            evidence={evidence}
            setEvidence={setEvidence}
            onUpdateStorage={handleUpdateStorage}
            setCurrentView={setCurrentView}
          />
        )}

        {currentView === 'evidence_list' && (
          <EvidenceListView
            activeProfile={activeProfile}
            evidence={evidence}
            setEvidence={setEvidence}
            onUpdateStorage={handleUpdateStorage}
            setCurrentView={setCurrentView}
          />
        )}

        {currentView === 'assessment' && (
          <AssessmentView
            activeProfile={activeProfile}
            evidence={evidence}
            setCurrentView={setCurrentView}
          />
        )}

        {(currentView === 'verification_view' || currentView === 'verification') && (
          <VerificationView
            activeProfile={activeProfile}
            setCurrentView={setCurrentView}
          />
        )}

        {(currentView === 'admin_panel' || currentView === 'admin_dashboard') && (
          <AdminDashboardView
            activeProfile={activeProfile}
            setCurrentView={setCurrentView}
          />
        )}

        {(currentView === 'certificates' || currentView === 'certificate' || currentView === 'verify') && (
          <CertificateView
            activeProfile={activeProfile}
            setCurrentView={setCurrentView}
          />
        )}

        {currentView === 'reports' && (
          <ReportsView
            activeProfile={activeProfile}
            evidence={evidence}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            activeProfile={activeProfile}
            setCurrentView={setCurrentView}
          />
        )}

        {(currentView === 'assessor' || currentView === 'admin') && (
          <AssessorWorkspace
            profiles={profiles}
            evidence={evidence}
            setEvidence={setEvidence}
            onUpdateCompetency={handleUpdateCompetency}
            role={role}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="mx-auto max-w-7xl px-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 EDUBRIDGE SYSTEMS LTD • DIGITAL PoE LEDGER</span>
          <span className="text-[#5D45D1] font-black">NATIONAL CDACC PORTFOLIO REGISTRY</span>
        </div>
      </footer>
    </div>
  );
}


