export type UserRole = 'requester' | 'sa' | 'engineer' | 'pm' | 'qa';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleName: string;
  department: string;
  avatarInitials: string;
}

export type RequirementStatus = 'draft' | 'evaluating' | 'developing' | 'uat' | 'deployed';

export type Priority = 'high' | 'medium' | 'low';

export type BenefitCategory = 'save_hours' | 'lower_defect' | 'boost_capacity';

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'excel' | 'pdf' | 'doc';
  url?: string;
}

export interface UATItem {
  id: string;
  scenario: string;
  expectedResult: string;
  result: 'Pass' | 'Fail' | 'Pending';
  note: string;
}

export interface ElectronicSignature {
  isSigned: boolean;
  signedBy: string;
  signedRole: string;
  signedDate: string;
  hashDigest: string;
}

export interface ReleaseNote {
  version: string;
  releaseDate: string;
  headline: string;
  overview: string;
  highlights: string[];
  sopGuide: string[];
  precautions: string;
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  reqId: string;
  reqTitle: string;
  fromStatus: RequirementStatus;
  toStatus: RequirementStatus;
  channel: 'Teams' | 'Email' | 'LINE';
  recipients: string[];
  message: string;
}

export interface WireframeAnnotation {
  id: string;
  x: number; // percentage
  y: number; // percentage
  label: string;
  description: string;
}

export interface MESRequirement {
  id: string; // e.g. REQ-2026-001
  title: string;
  department: string;
  requesterName: string;
  asIs: string;
  toBe: string;
  benefitCategory: BenefitCategory;
  benefitDescription: string;
  priority: Priority;
  attachments: Attachment[];
  
  // REQ-02 Prototype
  wireframeUrl?: string;
  wireframeAnnotations?: WireframeAnnotation[];
  
  // Status & Tracking
  status: RequirementStatus;
  createdAt: string;
  updatedAt: string;
  currentBlocker?: string;
  blockerOwner?: string;
  
  // DEV-01 & DEV-02
  technicalFeasibility?: string;
  affectedModules: string[];
  estimatedHours?: number;
  estimatedDays?: number;
  aiEstimatedDays?: number;
  aiConfidence?: string;
  targetReleaseDate?: string;
  assignedEngineer?: string;
  assignedQA?: string;
  sprint?: string;
  scrumMode?: 'Scrum' | 'Kanban';
  
  // UAT-01
  acceptanceCriteria: UATItem[];
  uatSignature?: ElectronicSignature;
  
  // UAT-02
  releaseNote?: ReleaseNote;
}
