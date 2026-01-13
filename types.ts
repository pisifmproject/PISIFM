
export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  MANAGER = 'Manager',
  SUPERVISOR = 'Supervisor',
  ENGINEER = 'Engineer',
  TECHNICIAN = 'Technician',
  ADMINISTRATION = 'Administration'
}

export interface User {
  id: string; // NIK
  name: string;
  role: UserRole;
  jobTitle: string;
  department?: string;
  level?: string;
  jobGrade?: string;
  avatar: string;
  profilePhotoUrl?: string;
  birthPlace?: string;
  birthDate?: string;
  gender?: 'Male' | 'Female';
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  address?: string;
  phoneNumber?: string;
  personalEmail?: string;
  companyEmail?: string;
  joinDate?: string;
  employmentStatus?: 'Permanent' | 'Contract' | 'Intern' | 'Probation';
  jobHistory?: { title: string; period: string; description?: string }[];
  educationHistory?: { school: string; degree: string; year: string }[];
  emergencyContact?: { name: string; relationship: string; phone: string };
  languages?: string[];
  allowedModules: string[];
  leaveBalance?: number;
  supervisorId?: string;
  reviewer1Id?: string;
  reviewer2Id?: string;
  skills?: { name: string; level: number }[]; // 1-5
  certifications?: string[];
  workloadScore?: number; // 0-100
  assignments?: { projectId: string; startDate: string; endDate: string }[];
  jobRole?: string;
  motto?: string;
}

export interface WorkflowLog {
  step: number;
  user: string;
  date: string;
  comment: string;
  attachmentName?: string;
  attachmentContent?: string;
}

export interface LifecycleStage {
  id: string;
  name: 'Design' | 'Procurement' | 'Construction' | 'Commissioning';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';
  progress: number;
  startDate: string;
  endDate: string;
  actualEndDate?: string;
}

export interface EngineeringDocument {
  id: string;
  name: string;
  version: string;
  type: 'Drawing' | 'Specification' | 'Manual' | 'Report';
  lastUpdated: string;
  updatedBy: string;
  history: { version: string; date: string; user: string; comment: string }[];
}

export interface Project {
  id: string;
  name: string;
  location: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'Delayed';
  progress: number;
  budget: number;
  spent: number;
  committed: number;
  assignee: string;
  dueDate: string;
  priority?: 'Low' | 'Medium' | 'High';
  riskLevel?: 'Low' | 'Medium' | 'High';
  capexCategory?: string;
  targetROI?: number;
  capexItems?: CapexItem[];
  lifecycle?: LifecycleStage[];
  documents?: EngineeringDocument[];
  plannedProgress?: { date: string; value: number }[]; // For S-Curve
  actualProgress?: { date: string; value: number }[]; // For S-Curve
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  targetId: string;
  timestamp: string;
  details: string;
}

export interface PurchaseOrder {
  id: string;
  prId: string;
  vendorName: string;
  vendorOrigin: 'Local' | 'Overseas';
  totalValue: number;
  status: 'Draft' | 'Sent' | 'Delivered' | 'Paid';
  issueDate: string;
  currentStepIndex?: number;
  flowId?: string;
  logs?: WorkflowLog[];
}

export interface ComparisonSheet {
  id: string;
  prId: string;
  requestTitle: string;
  vendors: {
    name: string;
    price: number;
    selected: boolean;
    leadTime: string;
  }[];
  savings: number;
  status: 'Pending' | 'Evaluated' | 'Finalized';
  currentStepIndex?: number;
  flowId?: string;
  logs?: WorkflowLog[];
}

export interface CapexItem {
  id: string;
  name: string;
  category: 'Equipment' | 'Installation' | 'Engineering' | 'Spare Part' | 'Consumable';
  proposedCost: number;
  actualCost: number;
  status: 'Proposed' | 'Ordered' | 'Paid';
}

export interface PaymentRecord {
  id: string;
  poId: string;
  invoiceId: string;
  amount: number;
  date: string;
  status: 'Scheduled' | 'Paid';
  method: string;
}

export type JobStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'In Progress' | 'Completed' | 'Rejected';
export type JobPriority = 'Low' | 'Medium' | 'High';

export interface ApprovalFlow {
  id: string;
  name: string;
  description: string;
  steps: UserRole[];
}

export interface JobAssignment {
  id: string;
  projectName: string;
  projectId?: string;
  location: string;
  description: string;
  category: string;
  duration: string;
  priority: JobPriority;
  requiredDocuments: string[];
  materialList: string[];
  assignee: string;
  status: JobStatus;
  date: string;
  dueDate?: string;
  flowId: string;
  currentStepIndex: number;
  approvalHistory: { step: number; approver: string; date: string }[];
}

export interface Submission {
  id: string;
  type: string;
  title: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  details: any;
  flowId: string;
  currentStepIndex: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'Training' | 'Meeting' | 'Maintenance' | 'Deadline';
}

export interface Notification {
  id: string;
  type: 'critical' | 'overdue' | 'system' | 'update';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  moduleId: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  channelId?: string;
  recipientId?: string;
  type: 'text' | 'image' | 'file';
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'public' | 'private';
  unreadCount: number;
  lastMessage?: {
    content: string;
    timestamp: string;
  };
}

// Added missing types to fix compilation errors

export interface Plant {
  id: string;
  name: string;
  code: string;
  location: string;
}

export interface ProductionLine {
  id: string;
  plantId: string;
  name: string;
  code: string;
}

export interface JobCategory {
  id: string;
  name: string;
}

export interface MachineCategory {
  id: string;
  name: string;
}

export interface Vendor {
  id: string;
  name: string;
  origin: 'Local' | 'Overseas';
  category: string[];
  nib: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  bankName: string;
  bankAccount: string;
  status: 'Active' | 'Inactive';
  rating?: number;
}

export interface VendorRating {
  vendorId: string;
  rating: number;
  comment: string;
  reviewer: string;
  date: string;
}

export type FormType = 'daily_report' | 'leave' | 'purchase' | 'overtime' | 'late_arrival';
