export type UserRole = 
  | 'Student' 
  | 'Trainer' 
  | 'Assessor' 
  | 'Internal Verifier' 
  | 'External Verifier' 
  | 'Administrator';

export interface User {
  id: number;
  fullName: string;
  admissionNo?: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  courseId?: number;
  createdAt: string;
}

export interface Course {
  id: number;
  courseName: string;
  level: string;
  duration: string;
}

export interface Unit {
  id: number;
  unitCode: string;
  unitName: string;
  courseId: number;
}

export interface Enrollment {
  id: number;
  studentId: number;
  unitId: number;
  enrolledOn: string;
}

export type EvidenceStatus = 
  | 'Pending' 
  | 'Trainer Reviewed' 
  | 'Assessed' 
  | 'Approved' 
  | 'Competent' 
  | 'Not Yet Competent' 
  | 'Needs Revision';

export interface AssessmentRecord {
  id: number;
  evidenceId: number;
  assessorId: number;
  result: 'Competent' | 'Not Yet Competent';
  score: number;
  remarks: string;
  assessedAt: string;
}

export interface VerificationRecord {
  id: number;
  assessmentId: number;
  verifierId: number;
  status: 'Approved' | 'Rejected' | 'Needs Revision';
  comments: string;
  verifiedAt: string;
}

export interface SystemNotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface SystemAuditLog {
  id: number;
  userId?: number;
  userName?: string;
  action: string;
  logTime: string;
}

export interface TraineeProfile {
  id: string;
  registrationNumber: string;
  fullName: string;
  nationalId: string;
  institution: string;
  courseName: string;
  email: string;
  storagePlanId: string;
  storageUsedBytes: number;
  active: boolean;
  role?: UserRole;
}

export interface StoragePlan {
  id: string;
  name: string;
  priceKes: number;
  limitBytes: number;
  limitLabel: string;
  features: string[];
  badge?: string;
}

export type EvidenceType = 'practical_video' | 'project_report' | 'assessor_checklist' | 'other';

export type SubmissionStatus = 'draft' | 'pending_review' | 'competent' | 'needs_revision' | 'Pending' | 'Trainer Reviewed' | 'Assessed' | 'Approved' | 'Not Yet Competent';

export interface AIReviewResult {
  isValid: boolean;
  authenticityScore: number; // 0-100
  validityScore: number; // 0-100
  sufficiencyScore: number; // 0-100
  currencyScore: number; // 0-100
  feedback: string;
  reviewedAt: string;
}

export interface EvidenceItem {
  id: string;
  traineeId: string;
  title: string;
  moduleCode: string;
  type: EvidenceType;
  description: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  reflectionText?: string;
  dateAcquired: string;
  status: SubmissionStatus;
  assessorFeedback?: string;
  trainerFeedback?: string;
  verifierFeedback?: string;
  aiReviewResult?: AIReviewResult;
}

export interface CompetencyModule {
  code: string;
  name: string;
  description: string;
  credits: number;
  status: 'not_started' | 'ongoing' | 'competent';
}

