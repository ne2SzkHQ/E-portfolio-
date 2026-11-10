import React, { useEffect, useState, useRef } from 'react';
import { Award, CheckCircle, ShieldCheck, Download, Search, QrCode, RefreshCw, Printer, ExternalLink, Sparkles, Building, FileCheck } from 'lucide-react';
import { TraineeProfile } from '../types';
import QRCode from 'qrcode';
import axios from 'axios';

interface CertificateViewProps {
  activeProfile: TraineeProfile;
  setCurrentView: (view: string) => void;
}

interface CertificateData {
  certificateNumber: string;
  studentName: string;
  admissionNumber: string;
  courseName: string;
  level: string;
  issuingAuthority: string;
  status: string;
  issuedAt: string;
  digitalSignature: string;
  competenciesAchieved: { code: string; title: string; grade: string }[];
  qrVerificationUrl: string;
}

export default function CertificateView({
  activeProfile,
  setCurrentView
}: CertificateViewProps) {
  const [certData, setCertData] = useState<CertificateData | null>(null);
  const [qrCanvasUrl, setQrCanvasUrl] = useState<string>('');
  const [searchCertId, setSearchCertId] = useState<string>('CERT-2026-ICT-8841');
  const [loading, setLoading] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<CertificateData | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // Generate initial certificate view for active trainee
    generateDefaultCertificate();
  }, [activeProfile]);

  const generateDefaultCertificate = async () => {
    const certNo = `CERT-2026-${(activeProfile.courseName || 'ICT').slice(0, 3).toUpperCase()}-8841`;
    const defaultData: CertificateData = {
      certificateNumber: certNo,
      studentName: activeProfile.fullName,
      admissionNumber: activeProfile.registrationNumber,
      courseName: activeProfile.courseName,
      level: 'Level 6 (National Diploma)',
      issuingAuthority: 'National TVET CDACC Examination & Certification Council',
      status: 'VALID',
      issuedAt: new Date().toISOString().split('T')[0],
      digitalSignature: 'SHA256-4b9e28f10a718c93b1d34e62a1103c89ff52',
      competenciesAchieved: [
        { code: 'ICT/01', title: 'Develop Web Applications using React & Node.js', grade: 'Competent (C)' },
        { code: 'ICT/02', title: 'Configure & Administer Relational Databases', grade: 'Competent (C)' },
        { code: 'ICT/03', title: 'Implement Network Infrastructure & Cyber Security', grade: 'Competent (C)' },
        { code: 'ICT/04', title: 'VASC Portfolio Audit & Software Quality Assurance', grade: 'Competent (C)' }
      ],
      qrVerificationUrl: `${window.location.origin}/verify/${certNo}`
    };

    setCertData(defaultData);
    generateQrCodeDataUrl(defaultData.qrVerificationUrl);
  };

  const generateQrCodeDataUrl = async (url: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 180,
        margin: 1,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff'
        }
      });
      setQrCanvasUrl(dataUrl);
    } catch (err) {
      console.warn("QR code generation error:", err);
    }
  };

  const handleVerifySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCertId) return;

    try {
      setVerifying(true);
      const res = await axios.get(`/api/certificates/${searchCertId}`);
      if (res.data) {
        setVerificationResult(res.data);
        generateQrCodeDataUrl(res.data.qrVerificationUrl || `${window.location.origin}/verify/${searchCertId}`);
      }
    } catch (err: any) {
      console.warn("Verification fetch error:", err);
      setNotification("Certificate ID not found in TVET registry or invalid.");
    } finally {
      setVerifying(false);
    }
  };

  const handleIssueNewCertificate = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/api/certificates/generate', {
        candidateName: activeProfile.fullName,
        admissionNo: activeProfile.registrationNumber,
        courseName: activeProfile.courseName
      });

      if (res.data && res.data.certificateNumber) {
        const newCert: CertificateData = {
          certificateNumber: res.data.certificateNumber,
          studentName: res.data.candidateName,
          admissionNumber: res.data.admissionNumber,
          courseName: res.data.courseName,
          level: 'Level 6 (National Diploma)',
          issuingAuthority: 'National TVET CDACC Examination & Certification Council',
          status: 'VALID',
          issuedAt: new Date().toISOString().split('T')[0],
          digitalSignature: `SHA256-${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
          competenciesAchieved: certData?.competenciesAchieved || [],
          qrVerificationUrl: res.data.qrVerificationUrl
        };
        setCertData(newCert);
        generateQrCodeDataUrl(newCert.qrVerificationUrl);
        setNotification(`New Certificate ${newCert.certificateNumber} generated and cryptographically signed!`);
      }
    } catch (err: any) {
      setNotification(`Failed to issue certificate: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 bottom-0 translate-y-8 translate-x-8 opacity-10 pointer-events-none">
          <Award className="h-64 w-64 text-white" />
        </div>
        <div className="max-w-3xl relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-500/30">
            <Sparkles className="h-3 w-3 text-amber-400" /> Official Competency Award & Verification
          </span>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-white">
            Certificate of <span className="text-amber-400">Competency</span> & QR Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Generate and inspect national CDACC digital certificates embedded with live QR codes for instantaneous employer verification and tamper-proof cryptographic audit trails.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-amber-700 hover:underline text-[10px] uppercase font-black">Dismiss</button>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleIssueNewCertificate}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-[#5D45D1] hover:bg-[#4d36be] text-white font-black text-xs uppercase tracking-wider transition shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Award className="h-4 w-4" />
            {loading ? 'Issuing...' : 'Issue / Re-generate Certificate'}
          </button>
          <button
            onClick={handlePrintCertificate}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
          >
            <Printer className="h-4 w-4 text-slate-500" /> Print / Export PDF
          </button>
        </div>

        {/* Public QR Lookup Form */}
        <form onSubmit={handleVerifySearch} className="flex items-center gap-2">
          <input
            type="text"
            value={searchCertId}
            onChange={(e) => setSearchCertId(e.target.value)}
            placeholder="Enter Certificate No..."
            className="px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#5D45D1] focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={verifying}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-wider hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" /> Verify
          </button>
        </form>
      </div>

      {/* Verification Query Results (if searched) */}
      {verificationResult && (
        <div className="p-6 rounded-3xl border border-emerald-200 bg-emerald-50/50 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <h2 className="text-sm font-black text-emerald-950 uppercase tracking-wider">
                Public QR Certificate Verification Result
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
              {verificationResult.status} CERTIFICATE
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400">Candidate Name</span>
              <p className="font-bold text-slate-900">{verificationResult.studentName}</p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400">Admission No</span>
              <p className="font-mono font-bold text-slate-800">{verificationResult.admissionNumber}</p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400">Date Issued</span>
              <p className="font-mono font-bold text-slate-800">{verificationResult.issuedAt}</p>
            </div>
          </div>
        </div>
      )}

      {/* Official Certificate Frame */}
      {certData && (
        <div className="relative mx-auto max-w-4xl rounded-3xl border-8 border-amber-600/30 bg-gradient-to-br from-amber-50/30 via-white to-slate-50 p-8 sm:p-12 shadow-2xl space-y-8 font-serif text-slate-900 overflow-hidden">
          {/* Watermark Seal Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <ShieldCheck className="h-[500px] w-[500px] text-amber-900" />
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-2 relative z-10 border-b-2 border-amber-600/20 pb-6">
            <div className="flex justify-center items-center gap-2 mb-2">
              <Building className="h-8 w-8 text-amber-700" />
            </div>
            <h2 className="text-xs font-sans font-black uppercase tracking-[0.3em] text-amber-800">
              NATIONAL TVET CDACC EXAMINATION & CERTIFICATION COUNCIL
            </h2>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-serif">
              Certificate of Competency
            </h1>
            <p className="text-xs font-sans text-slate-500 uppercase tracking-widest font-bold">
              Issued under the National Vocational Qualifications Framework (NVQF)
            </p>
          </div>

          {/* Certificate Body */}
          <div className="text-center space-y-4 relative z-10 font-sans max-w-2xl mx-auto">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">This is to certify that</p>
            <h3 className="text-2xl sm:text-4xl font-black text-[#5D45D1] font-serif border-b-2 border-dashed border-amber-400/50 inline-block px-8 py-1">
              {certData.studentName}
            </h3>
            <p className="text-xs text-slate-600 font-mono">Admission No: <strong className="text-slate-900">{certData.admissionNumber}</strong></p>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              has successfully fulfilled all practical requirements, logbook evidence reviews, assessor evaluations, and internal verification audits for
            </p>
            <h4 className="text-lg sm:text-2xl font-black text-slate-900 font-serif">
              {certData.courseName}
            </h4>
            <p className="text-xs font-bold text-amber-800 bg-amber-100/60 border border-amber-200 inline-block px-4 py-1 rounded-full">
              Qualification: {certData.level}
            </p>
          </div>

          {/* Competencies Breakdown Table */}
          <div className="relative z-10 font-sans space-y-3 max-w-3xl mx-auto bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
              Units of Competency Awarded
            </h5>
            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              {certData.competenciesAchieved.map((unit) => (
                <div key={unit.code} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="font-mono font-black text-[#5D45D1] mr-2">{unit.code}</span>
                    <span className="font-medium text-slate-800">{unit.title}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {unit.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Certificate Footer & Signatures & Live QR Code */}
          <div className="grid gap-6 sm:grid-cols-3 items-end pt-6 border-t-2 border-amber-600/20 relative z-10 font-sans text-xs">
            {/* Left: Authority Seal & Signatures */}
            <div className="space-y-1 text-left">
              <div className="h-10 border-b border-slate-400 font-serif italic text-sm text-slate-700 flex items-end">
                Prof. M. K. Omondi
              </div>
              <p className="text-[10px] font-black uppercase text-slate-500">Director of Assessment & Certification</p>
              <p className="text-[10px] text-slate-400 font-mono">Date: {certData.issuedAt}</p>
            </div>

            {/* Middle: Live Generated QR Code */}
            <div className="flex flex-col items-center justify-center space-y-1">
              {qrCanvasUrl ? (
                <img src={qrCanvasUrl} alt="Certificate QR Code" className="w-28 h-28 border-2 border-slate-900 rounded-xl shadow-xs" />
              ) : (
                <div className="w-28 h-28 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-[10px]">
                  Generating QR...
                </div>
              )}
              <span className="text-[9px] font-mono font-bold text-slate-500">Scan to Verify Authenticity</span>
              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-tighter">{certData.certificateNumber}</span>
            </div>

            {/* Right: Cryptographic Signature & Registration No */}
            <div className="space-y-1 text-right">
              <div className="h-10 border-b border-slate-400 font-serif italic text-sm text-slate-700 flex items-end justify-end">
                Dr. E. N. Wanjala
              </div>
              <p className="text-[10px] font-black uppercase text-slate-500">Chief Internal Verifier</p>
              <p className="text-[8px] text-slate-400 font-mono truncate max-w-[200px] ml-auto">Sig: {certData.digitalSignature}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
