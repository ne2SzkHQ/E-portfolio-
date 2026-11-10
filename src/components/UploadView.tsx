import React from 'react';
import TraineeWorkspace from './TraineeWorkspace';
import { TraineeProfile, EvidenceItem } from '../types';

interface UploadViewProps {
  activeProfile: TraineeProfile;
  evidence: EvidenceItem[];
  setEvidence: React.Dispatch<React.SetStateAction<EvidenceItem[]>>;
  onUpdateStorage: (bytesUsed: number) => void;
  setCurrentView: (view: string) => void;
}

export default function UploadView(props: UploadViewProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <span className="text-[10px] font-black text-[#5D45D1] bg-purple-50 px-3 py-1 rounded-lg uppercase tracking-[0.2em] inline-block">
          Evidence Submission Vault
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Upload Practical Evidence Record</h1>
      </div>

      <TraineeWorkspace {...props} />
    </div>
  );
}
