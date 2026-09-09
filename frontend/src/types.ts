export type NavTab = 
  | 'dashboard' 
  | 'customers' 
  | 'applications' 
  | 'reviews' 
  | 'risk' 
  | 'audit' 
  | 'admin' 
  | 'system-health';

export type DecisionStatus = 'APPROVED' | 'REVIEW' | 'REJECTED';
export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH';
export type WorkflowStatus = 'COMPLETED' | 'IN PROGRESS' | 'PENDING';

export interface KeyRiskFactor {
  id: string;
  type: 'positive' | 'warning' | 'negative';
  title: string;
  description: string;
}

export interface DecisionRationale {
  metric: string;
  value: string;
  status: 'Pass' | 'Fail' | 'Warning' | 'Verified';
}

export interface AuditTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  isActive?: boolean;
}

export interface Application {
  id: string;
  customer: string;
  sector: string;
  amount: number;
  riskScore: number;
  estPD: number; // e.g. 2.1
  workflowStatus: WorkflowStatus;
  decision: DecisionStatus;
  riskTier: RiskTier;
  submittedAt: string;
  submittedFormatted: string;
  applicantName?: string;
  applicantRole?: string;
  dti?: number; // e.g. 22%
  creditUtilization?: number; // e.g. 14%
  employmentStatus?: string;
  annualIncome?: number;
  existingDebt?: number;
  requestedFacility?: string;
  riskFactors?: KeyRiskFactor[];
  rationales?: DecisionRationale[];
  timeline?: AuditTimelineEvent[];
}

export interface ReviewQueueItem {
  id: string;
  applicationId: string;
  customer: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  riskScore: number;
  reason: string;
  age: string;
  amount: number;
}

export interface PolicyRule {
  id: string;
  category: 'score' | 'financial' | 'automated';
  name: string;
  currentValue: number;
  previousValue: number;
  unit?: string;
  prefix?: string;
  step?: number;
  metaDate: string;
  metaAuthor: string;
}

export interface HealthService {
  id: string;
  name: string;
  icon: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  latency: string;
  metricLabel3: string;
  metricValue3: string;
  isDegraded?: boolean;
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  severity: 'WARN' | 'INFO' | 'ERROR';
  service: string;
  message: string;
}

export interface Customer {
  id: string;
  name: string;
  industry: string;
  totalExposure: number;
  riskGrade: string;
  activeFacilities: number;
  primaryContact: string;
  status: 'Active' | 'Review' | 'Restricted';
}

// ── Integration layer types ────────────────────────────────
export interface LoginResponse {
  token: string;
  email: string;
  role: string;
  userId?: number;
  customerId?: number | null;
}

export interface AuditRow {
  id: number;
  entityId: number;
  entityType: string;
  action: string;
  actor: string;
  category: string;
  description: string;
  hash: string;
  timestamp: string;
  service?: string;
}

export interface CreateApplicationInput {
  customer: string;
  employerName?: string;
  sector: string;
  amount: number;
  creditScore: number;
  annualIncome: number;
  existingDebt: number;
  utilization: number;
  requestedFacility?: string;
}
