
import { Project, UserRole, User, NavItem, ApprovalFlow, PurchaseOrder, ComparisonSheet, PaymentRecord, Plant, ProductionLine, JobCategory, Vendor, MachineCategory, JobAssignment, CalendarEvent, Submission } from './types';
import {
  LayoutDashboard,
  Database,
  Users,
  BarChart3,
  BellRing,
  Settings,
  ShieldCheck,
  BookOpen,
  FileText,
  Sparkles,
  Wallet
} from 'lucide-react';

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Plant A Expansion',
    location: 'Sector 4',
    status: 'In Progress',
    progress: 65,
    budget: 500000,
    spent: 320000,
    committed: 80000,
    assignee: 'Dany Taufiq Ansori',
    dueDate: '2025-06-15',
    priority: 'High',
    riskLevel: 'Medium',
    capexCategory: 'Engineering',
    targetROI: 12.5,
    lifecycle: [
      { id: 'l1', name: 'Design', status: 'Completed', progress: 100, startDate: '2025-01-01', endDate: '2025-01-30' },
      { id: 'l2', name: 'Procurement', status: 'In Progress', progress: 80, startDate: '2025-02-01', endDate: '2025-03-15' },
      { id: 'l3', name: 'Construction', status: 'In Progress', progress: 40, startDate: '2025-03-16', endDate: '2025-05-30' },
      { id: 'l4', name: 'Commissioning', status: 'Not Started', progress: 0, startDate: '2025-06-01', endDate: '2025-06-15' }
    ],
    documents: [
      { id: 'doc-001', name: 'Piping & Instrumentation Diagram', version: 'v2.4', type: 'Drawing', lastUpdated: '2025-02-15', updatedBy: 'Dany Taufiq', history: [{ version: 'v1.0', date: '2025-01-05', user: 'Dany Taufiq', comment: 'Initial Draft' }] },
      { id: 'doc-002', name: 'Material Specification Sheet', version: 'v1.2', type: 'Specification', lastUpdated: '2025-02-20', updatedBy: 'Ayodya Maulana', history: [] }
    ],
    plannedProgress: [
      { date: 'Jan', value: 10 }, { date: 'Feb', value: 25 }, { date: 'Mar', value: 45 }, { date: 'Apr', value: 70 }, { date: 'May', value: 90 }, { date: 'Jun', value: 100 }
    ],
    actualProgress: [
      { date: 'Jan', value: 12 }, { date: 'Feb', value: 22 }, { date: 'Mar', value: 40 }
    ],
    capexItems: [
      { id: 'CX-101', name: 'Main Intake Pump', category: 'Equipment', proposedCost: 150000, actualCost: 145000, status: 'Paid' },
      { id: 'CX-102', name: 'PLC S7-1500 Controller', category: 'Equipment', proposedCost: 50000, actualCost: 52000, status: 'Paid' },
    ]
  },
  {
    id: '3',
    name: 'Conveyor Automation Line 4',
    location: 'Plant B',
    status: 'Delayed',
    progress: 40,
    budget: 85000,
    spent: 92000,
    committed: 10000,
    assignee: 'Moh Yusuf Alfian',
    dueDate: '2025-04-01',
    priority: 'Medium',
    riskLevel: 'High',
    capexCategory: 'Automation',
    targetROI: 8.4,
    lifecycle: [
      { id: 'l3-1', name: 'Design', status: 'Completed', progress: 100, startDate: '2025-01-01', endDate: '2025-01-20' },
      { id: 'l3-2', name: 'Procurement', status: 'Blocked', progress: 10, startDate: '2025-01-21', endDate: '2025-02-28' }
    ],
    plannedProgress: [
      { date: 'Jan', value: 15 }, { date: 'Feb', value: 50 }, { date: 'Mar', value: 85 }, { date: 'Apr', value: 100 }
    ],
    actualProgress: [
      { date: 'Jan', value: 15 }, { date: 'Feb', value: 30 }, { date: 'Mar', value: 40 }
    ]
  },
  {
    id: '4',
    name: 'New Energy Substation',
    location: 'West Wing',
    status: 'Planning',
    progress: 0,
    budget: 250000,
    spent: 0,
    committed: 0,
    assignee: 'Ayodya Maulana Gunoro',
    dueDate: '2025-08-30',
    priority: 'Low',
    riskLevel: 'Low',
    capexCategory: 'Equipment',
    targetROI: 15.0,
    lifecycle: [
      { id: 'l4-1', name: 'Design', status: 'In Progress', progress: 10, startDate: '2025-03-01', endDate: '2025-04-15' }
    ]
  }
];

export const MOCK_USERS_DB: User[] = [
  {
    id: '50006020',
    name: 'Moh Yusuf Alfian',
    role: UserRole.MANAGER,
    jobTitle: 'Project & Engineering Manager',
    avatar: 'MY',
    allowedModules: ['dashboard', 'projects', 'performance', 'resources', 'admin', 'requests', 'ai_copilot', 'finance'],
    skills: [{ name: 'AutoCAD', level: 5 }, { name: 'Project Mgmt', level: 5 }, { name: 'Financial Audit', level: 4 }],
    workloadScore: 45,
    jobGrade: 'M1',
    jobRole: 'Operations Lead',
    motto: 'Leading with excellence and integrity.',
    assignments: [
      { projectId: '1', startDate: '2025-01-01', endDate: '2025-02-15' },
      { projectId: '3', startDate: '2025-02-01', endDate: '2025-03-31' }
    ]
  },
  {
    id: '50155250',
    name: 'Ayodya Maulana Gunoro',
    role: UserRole.SUPERVISOR,
    jobTitle: 'Supervisor (Process & Mechanical)',
    avatar: 'AM',
    allowedModules: ['dashboard', 'projects', 'performance', 'resources', 'admin', 'requests', 'ai_copilot', 'finance'],
    skills: [{ name: 'Mechanical Design', level: 5 }, { name: 'HVAC', level: 4 }],
    workloadScore: 85,
    jobGrade: 'S2',
    jobRole: 'Maintenance Specialist',
    motto: 'Reliability through precision.',
    assignments: [
      { projectId: '1', startDate: '2025-01-15', endDate: '2025-03-15' },
      { projectId: '4', startDate: '2025-03-01', endDate: '2025-05-30' }
    ]
  },
  {
    id: '50223344',
    name: 'Dany Taufiq Ansori',
    role: UserRole.ENGINEER,
    jobTitle: 'Maintenance Engineer',
    avatar: 'DT',
    allowedModules: ['dashboard', 'projects', 'performance', 'resources', 'requests', 'ai_copilot'],
    skills: [{ name: 'Civil Engineering', level: 4 }, { name: 'AutoCAD', level: 4 }],
    workloadScore: 92,
    jobGrade: 'E3',
    jobRole: 'Civil Systems Engineer',
    motto: 'Building the foundations of success.',
    assignments: [
      { projectId: '3', startDate: '2025-01-01', endDate: '2025-02-28' },
      { projectId: '4', startDate: '2025-03-15', endDate: '2025-04-30' }
    ]
  }
];

export const DEFAULT_APPROVAL_FLOWS: ApprovalFlow[] = [
  { id: 'flow-1', name: 'Administrative Flow', description: 'For general memos and procurement.', steps: [UserRole.ADMINISTRATION, UserRole.SUPERVISOR, UserRole.MANAGER] },
  { id: 'flow-2', name: 'Field Job Flow', description: 'Standard technical field work.', steps: [UserRole.ENGINEER, UserRole.SUPERVISOR, UserRole.MANAGER] }
];

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, path: '/', moduleId: 'dashboard' },
  { id: 'projects', label: 'Project Vault', icon: Database, path: '/projects', moduleId: 'projects' },
  { id: 'resources', label: 'Talent Hub', icon: Users, path: '/resources', moduleId: 'resources' },
  { id: 'performance', label: 'KPI Board', icon: BarChart3, path: '/performance', moduleId: 'performance' },
  { id: 'requests', label: 'Forms & Requests', icon: FileText, path: '/requests', moduleId: 'requests' },
  { id: 'finance', label: 'Finance & Budget', icon: Wallet, path: '/finance', moduleId: 'finance' },
  { id: 'ai_copilot', label: 'AI Copilot', icon: Sparkles, path: '/ai-copilot', moduleId: 'ai_copilot' },
  { id: 'admin', label: 'System Admin', icon: Settings, path: '/admin', moduleId: 'admin' },
];

export const MOCK_PLANTS: Plant[] = [
  { id: '1402', name: '1402-IFM Tangerang', code: '1402', location: 'Tangerang' },
  { id: '1403', name: '1403-IFM Semarang', code: '1403', location: 'Semarang' },
  { id: '1405', name: '1405-IFM Cikupa', code: '1405', location: 'Cikupa' },
  { id: '1411', name: '1411-IFM Agro', code: '1411', location: 'Agro' },
  { id: '14xx', name: '14xx', code: '14xx', location: 'Various' },
];
export const MOCK_LINES: ProductionLine[] = [{ id: 'l1', plantId: 'p1', name: 'Line Noodle A', code: 'NDL-A' }];
export const MOCK_JOB_CATEGORIES: JobCategory[] = [{ id: 'jc1', name: 'Civil' }];
export const MOCK_MACHINE_CATEGORIES: MachineCategory[] = [{ id: 'mc1', name: 'Packaging Machine' }];
export const MOCK_VENDORS: Vendor[] = [{ id: 'V-001', name: 'PT. Tehnik Maju Bersama', origin: 'Local', category: ['Mechanical'], nib: '123', address: 'Bekasi', contactPerson: 'Heru', email: 'a@b.com', phone: '123', bankName: 'BCA', bankAccount: '123', status: 'Active' }];
export const MOCK_PO: PurchaseOrder[] = [{ id: 'PO-001', prId: 'REQ-002', vendorName: 'PT. Tehnik Maju Bersama', vendorOrigin: 'Local', totalValue: 12500, status: 'Sent', issueDate: '2025-01-15' }];
export const MOCK_COMPARISONS: ComparisonSheet[] = [{ id: 'CS-001', prId: 'REQ-002', requestTitle: 'Feed Pump', status: 'Finalized', savings: 1200, vendors: [{ name: 'A', price: 100, selected: true, leadTime: '1w' }] }];
export const MOCK_PAYMENTS: PaymentRecord[] = [{ id: 'PAY-001', poId: 'PO-001', invoiceId: 'INV-1', amount: 100, date: '2025-01-01', status: 'Paid', method: 'Bank' }];
export const MOCK_JOB_ASSIGNMENTS: JobAssignment[] = [{ id: 'j1', projectName: 'Pump Replacement', projectId: '1', location: 'Sector 4', description: 'Replace pump', category: 'Mechanical', duration: '2d', priority: 'High', requiredDocuments: [], materialList: [], assignee: 'Dany Taufiq Ansori', status: 'In Progress', date: '2025-01-01', flowId: 'flow-2', currentStepIndex: 0, approvalHistory: [] }];
export const MOCK_SUBMISSIONS: Submission[] = [{ id: 'REQ-001', type: 'leave', title: 'Leave', date: '2025-01-01', status: 'Approved', details: {}, currentStepIndex: 3, flowId: 'flow-1' }];
export const MOCK_EVENTS: CalendarEvent[] = [{ id: '1', title: 'HSE Meeting', date: '2025-02-28', time: '10:00 AM', type: 'Meeting' }];

export const PERFORMANCE_REVIEW_DATA = [
  {
    id: 'cat-1',
    name: 'Safety and Quality Compliance',
    items: [
      {
        id: 'sqc-1',
        name: 'Quality Compliance',
        description: 'Based On Violation Frequency of Food Safety',
        weight: 7.5,
        parameter: '100% compliance with Food Safety standards',
        scoringGuidance: [
          { realization: 0, standardNilai: 100, scoring: 75, weightScore: 7.5 },
          { realization: 1, standardNilai: 90, scoring: 68, weightScore: 5.1 },
          { realization: 2, standardNilai: 80, scoring: 61, weightScore: 4.6 },
          { realization: 3, standardNilai: 70, scoring: 53, weightScore: 4.0 },
          { realization: '>=3', standardNilai: 60, scoring: 46, weightScore: 3.5 }
        ]
      },
      {
        id: 'sqc-2',
        name: 'Workplace Accidents',
        description: 'Based on number of accidents',
        weight: 5,
        parameter: 'Zero workplace accidents',
        scoringGuidance: [
          { realization: 0, standardNilai: 100, scoring: 75, weightScore: 5.0 },
          { realization: 1, standardNilai: 90, scoring: 68, weightScore: 3.4 },
          { realization: 2, standardNilai: 80, scoring: 61, weightScore: 3.1 },
          { realization: '>=3', standardNilai: 70, scoring: 53, weightScore: 2.7 }
        ]
      },
      {
        id: 'sqc-3',
        name: 'Warning Letter',
        description: 'Based on number of Warning Letter',
        weight: 3,
        parameter: 'Zero warning letters',
        scoringGuidance: [
          { realization: 0, standardNilai: 100, scoring: 75, weightScore: 3.0 },
          { realization: 1, standardNilai: 90, scoring: 68, weightScore: 2.0 },
          { realization: 2, standardNilai: 80, scoring: 61, weightScore: 1.8 },
          { realization: '>=3', standardNilai: 70, scoring: 53, weightScore: 1.6 }
        ]
      },
      {
        id: 'sqc-4',
        name: 'Compliance',
        description: 'Based on number of compliance',
        weight: 2,
        parameter: '100% compliance',
        scoringGuidance: [
          { realization: 0, standardNilai: 100, scoring: 75, weightScore: 2.0 },
          { realization: 1, standardNilai: 90, scoring: 68, weightScore: 1.4 },
          { realization: 2, standardNilai: 80, scoring: 61, weightScore: 1.2 },
          { realization: '>=3', standardNilai: 70, scoring: 53, weightScore: 1.1 }
        ]
      }
    ]
  },
  {
    id: 'cat-2',
    name: 'Absenteeism Rate',
    items: [
      {
        id: 'ar-1',
        name: 'Attendance',
        description: 'Based on number of Absentee',
        weight: 10,
        parameter: '100% attendance',
        scoringGuidance: [
          { realization: '100%', standardNilai: 100, scoring: 75, weightScore: 10.0 },
          { realization: '1 Day', standardNilai: 60, scoring: 68, weightScore: 6.8 },
          { realization: '2 Days', standardNilai: 60, scoring: 61, weightScore: 6.1 },
          { realization: 'More than 2 Days', standardNilai: 0, scoring: 0, weightScore: 0 }
        ]
      }
    ]
  },
  {
    id: 'cat-3',
    name: 'Tardiness',
    items: [
      {
        id: 'td-1',
        name: 'Tardiness',
        description: 'Based on number of Tardiness',
        weight: 5,
        parameter: 'Zero tardiness',
        scoringGuidance: [
          { realization: 0, standardNilai: 100, scoring: 75, weightScore: 5.0 },
          { realization: 1, standardNilai: 90, scoring: 68, weightScore: 3.4 },
          { realization: 2, standardNilai: 80, scoring: 61, weightScore: 3.1 },
          { realization: '>=3', standardNilai: 70, scoring: 53, weightScore: 2.7 }
        ]
      }
    ]
  },
  {
    id: 'cat-4',
    name: 'Leave',
    items: [
      {
        id: 'lv-1',
        name: 'Leave',
        description: 'Based on number of Leaving during working hour',
        weight: 2.5,
        parameter: 'Zero unauthorized leave',
        scoringGuidance: [
          { realization: 0, standardNilai: 100, scoring: 75, weightScore: 2.5 },
          { realization: 1, standardNilai: 90, scoring: 68, weightScore: 1.7 },
          { realization: 2, standardNilai: 80, scoring: 61, weightScore: 1.5 },
          { realization: 3, standardNilai: 70, scoring: 53, weightScore: 1.3 },
          { realization: '>=3', standardNilai: 60, scoring: 46, weightScore: 1.2 }
        ]
      }
    ]
  },
  {
    id: 'cat-5',
    name: 'Kebersihan Area Kerja',
    items: [
      {
        id: 'kak-1',
        name: 'Workplace Cleanliness',
        description: 'Cleanliness and tidiness of work area',
        weight: 5,
        parameter: 'Clean and tidy workspace',
        scoringGuidance: [
          { realization: 'Clean and tidy', standardNilai: 100, scoring: 75, weightScore: 5.0 },
          { realization: 'Unclean but untidy', standardNilai: 60, scoring: 68, weightScore: 3.4 },
          { realization: 'Unclean and untidy', standardNilai: 0, scoring: 0, weightScore: 0 }
        ]
      }
    ]
  },
  {
    id: 'cat-6',
    name: 'Personal Growth',
    items: [
      {
        id: 'pg-1',
        name: 'Training Participation',
        description: 'Training attendance and completion',
        weight: 5,
        parameter: 'Active participation in training programs',
        scoringGuidance: [
          { realization: '5 Trainings or 1 attend', standardNilai: 100, scoring: 75, weightScore: 5.0 },
          { realization: '2 Trainings', standardNilai: 90, scoring: 68, weightScore: 3.4 },
          { realization: 'Less than 2 Trainings', standardNilai: 80, scoring: 61, weightScore: 3.1 }
        ]
      }
    ]
  },
  {
    id: 'cat-7',
    name: 'Project Management Preparation & Resourcing',
    items: [
      {
        id: 'pm-1',
        name: 'Project Preparation',
        description: 'Based on missed preparation & Resourcing',
        weight: 15,
        parameter: 'Complete project preparation',
        scoringGuidance: [
          { realization: 0, standardNilai: 100, scoring: 75, weightScore: 10.0 },
          { realization: 1, standardNilai: 60, scoring: 68, weightScore: 6.8 },
          { realization: 'Less than 2 missed', standardNilai: 80, scoring: 61, weightScore: 9.1 }
        ]
      }
    ]
  },
  {
    id: 'cat-8',
    name: 'Relationship & Coordination',
    items: [
      {
        id: 'rc-1',
        name: 'Coordination',
        description: 'Based on Missed Coordination',
        weight: 10,
        parameter: 'Effective coordination',
        scoringGuidance: [
          { realization: 0, standardNilai: 100, scoring: 75, weightScore: 10.0 },
          { realization: 1, standardNilai: 90, scoring: 68, weightScore: 6.8 },
          { realization: 'Less than 2 missed', standardNilai: 80, scoring: 61, weightScore: 9.1 }
        ]
      }
    ]
  },
  {
    id: 'cat-9',
    name: 'Reporting & Documentation',
    items: [
      {
        id: 'rd-1',
        name: 'Report Submission',
        description: 'Based on Late report submitted',
        weight: 15,
        parameter: 'On-time report submission',
        scoringGuidance: [
          { realization: 0, standardNilai: 100, scoring: 75, weightScore: 15.0 },
          { realization: 1, standardNilai: 90, scoring: 68, weightScore: 10.2 },
          { realization: 'Less than 2 late', standardNilai: 80, scoring: 61, weightScore: 9.2 }
        ]
      }
    ]
  },
  {
    id: 'cat-10',
    name: 'Achievement at Work',
    items: [
      {
        id: 'aw-1',
        name: 'Engineering Development & Process Improvement',
        description: 'Based On Frequency Engineering development & Process improvement',
        weight: 10,
        parameter: 'Continuous improvement initiatives',
        scoringGuidance: [
          { realization: 3, standardNilai: 100, scoring: 75, weightScore: 10.0 },
          { realization: 2, standardNilai: 90, scoring: 68, weightScore: 6.8 },
          { realization: 'Less than 2', standardNilai: 80, scoring: 61, weightScore: 9.1 }
        ]
      },
      {
        id: 'aw-2',
        name: 'Number of Project Handover',
        description: 'Based On number of Project hand over',
        weight: 15,
        parameter: 'Successful project handovers',
        scoringGuidance: [
          { realization: 3, standardNilai: 100, scoring: 75, weightScore: 10.0 },
          { realization: 2, standardNilai: 90, scoring: 68, weightScore: 6.8 },
          { realization: 'Less than 2', standardNilai: 80, scoring: 61, weightScore: 9.1 }
        ]
      }
    ]
  }
];

export const MODULES = NAV_ITEMS.map(item => item.moduleId);
