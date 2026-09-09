/**
 * Live API layer for CreditRisk AI.
 *
 * Maps the Spring Boot backend DTOs (via the API gateway) to the UI's rich
 * Application/ReviewQueueItem types. Every call falls back to mock data when
 * the backend is unreachable, so the UI stays fully functional as a demo.
 */
import axios, { AxiosInstance } from 'axios';
import {
  Application,
  AuditRow,
  KeyRiskFactor,
  Customer,
  DecisionStatus,
  HealthService,
  LoginResponse,
  PolicyRule,
  ReviewQueueItem,
  RiskTier,
  WorkflowStatus,
  CreateApplicationInput,
} from './types';
export type { LoginResponse } from './types';
import {
  DEMO_APPLICATIONS,
  DEMO_CUSTOMERS,
  DEMO_AUDIT,
  DEMO_HEALTH_SERVICES,
  DEFAULT_POLICIES,
  formatDateTime,
  relTime,
} from './mockData';

const API_BASE = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'creditrisk_token';
const USER_KEY = 'creditrisk_user';

// ── Auth session ───────────────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): LoginResponse | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as LoginResponse) : null;
  } catch {
    return null;
  }
}

function decodeJwtName(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.name || payload.fullName || payload.sub || payload.email || null;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password }, { timeout: 6000 });
  const auth: LoginResponse = {
    token: res.data.token,
    email: res.data.email,
    role: res.data.role || 'ANALYST',
    userId: res.data.userId,
    customerId: res.data.customerId,
  };
  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(USER_KEY, JSON.stringify(auth));
  return auth;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ── HTTP client ────────────────────────────────────────────
function createClient(): AxiosInstance {
  const client = axios.create({ baseURL: API_BASE, timeout: 6000 });
  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return client;
}

const client = createClient();

// Backend probes
let LIVE_MODE = false;
export function isLiveMode(): boolean {
  return LIVE_MODE;
}

async function probeBackend(): Promise<boolean> {
  try {
    await axios.get(`${API_BASE}/actuator/health`, { timeout: 2500 });
    return true;
  } catch {
    return false;
  }
}

// ── Helpers ────────────────────────────────────────────────
function safeJsonParse<T = any>(s?: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

function contentOf<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

const num = (v: any, fallback = 0): number => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return typeof n === 'number' && isFinite(n) ? n : fallback;
};

function tierFromScore(score: number): RiskTier {
  return score >= 700 ? 'LOW' : score >= 580 ? 'MEDIUM' : 'HIGH';
}

function sectorFromLoanType(loanType?: string): string {
  switch ((loanType || '').toUpperCase()) {
    case 'MORTGAGE': return 'Commercial Real Estate';
    case 'BUSINESS': return 'Manufacturing & Industrial';
    case 'AUTO': return 'Supply Chain & Logistics';
    default: return 'Technology & Software';
  }
}

function decisionFromStatus(status?: string): DecisionStatus {
  switch ((status || '').toUpperCase()) {
    case 'APPROVED': return 'APPROVED';
    case 'REJECTED': return 'REJECTED';
    case 'MANUAL_REVIEW': return 'REVIEW';
    default: return 'REVIEW';
  }
}

function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

// ── Mapping: backend DTOs → UI types ───────────────────────
function mapApplication(a: any, auditRows: AuditRow[]): Application {
  const ra = a.riskAssessment;
  const dec = a.decision;
  const notes = safeJsonParse<any>(a.notes);
  const explanation = safeJsonParse<any>(dec?.explanationJson);
  const decision: DecisionStatus = dec
    ? dec.outcome === 'APPROVE' ? 'APPROVED' : dec.outcome === 'REJECT' ? 'REJECTED' : 'REVIEW'
    : decisionFromStatus(a.status);
  const score = num(ra?.riskScore, num(a.creditScore, 650));
  const pod = num(ra?.probabilityOfDefault ?? dec?.probabilityOfDefault, 0.05);
  const monthlyIncome = num(a.monthlyIncome);
  const existingDebt = num(a.existingDebt);
  const annualIncome = monthlyIncome * 12;
  const dtiRatio = num(dec?.debtToIncomeRatio, annualIncome > 0 ? existingDebt / annualIncome : 0);

  // Build timeline from the live audit trail (falls back to a synthetic one)
  const auditTimeline = auditRows
    .filter((r) => r.entityId === a.id && r.entityType === 'CreditApplication')
    .sort((x, y) => y.id - x.id)
    .slice(0, 5)
    .map((r) => ({ id: `tl-a-${r.id}`, timestamp: relTime(r.timestamp), title: r.action, description: r.description || undefined }));

  const fallbackTimeline = [
    { id: 'tl-1', timestamp: relTime(a.createdAt), title: 'Application Submitted', description: a.purpose || undefined, isActive: true },
    ...(ra ? [{ id: 'tl-2', timestamp: relTime(a.createdAt), title: 'Risk Assessment Complete', description: `Score ${score} · PD ${(pod * 100).toFixed(1)}%` }] : []),
    ...(dec ? [{ id: 'tl-3', timestamp: relTime(a.createdAt), title: 'Decision Engine Complete', description: dec.outcome }] : []),
  ];

  // Risk factors / rationales from the decision explanation, with fallbacks
  const explanationFactors: any[] = Array.isArray(explanation?.riskFactors) ? explanation.riskFactors : [];
  const riskFactors: KeyRiskFactor[] = explanationFactors.length
    ? explanationFactors.map((f: any, i: number): KeyRiskFactor => ({
        id: `rf-${i}`,
        type: f.type === 'positive' ? 'positive' : f.type === 'warning' ? 'warning' : 'negative',
        title: f.factor || f.title || 'Factor',
        description: f.detail || f.description || '',
      }))
    : [
        decision === 'APPROVED'
          ? { id: 'rf-1', type: 'positive', title: 'Score Within Policy', description: `Credit score ${score} meets policy thresholds.` }
          : { id: 'rf-1', type: decision === 'REVIEW' ? 'warning' : 'negative', title: 'Policy Threshold Attention', description: `Credit score ${score}; DTI ${(dtiRatio * 100).toFixed(0)}%.` },
      ];

  const rationales = [
    { metric: 'Debt-to-Income (DTI)', value: `${(dtiRatio * 100).toFixed(1)}% (${dtiRatio <= 0.43 ? 'Pass' : 'Fail'})`, status: (dtiRatio <= 0.43 ? 'Pass' : 'Fail') as any },
    { metric: 'Default Probability', value: `${(pod * 100).toFixed(1)}% (${pod <= 0.05 ? 'Pass' : pod <= 0.15 ? 'Warning' : 'Fail'})`, status: (pod <= 0.05 ? 'Pass' : pod <= 0.15 ? 'Warning' : 'Fail') as any },
    { metric: 'Model', value: ra?.modelVersion || 'n/a', status: 'Verified' as any },
  ];

  return {
    id: `APP-${a.id}`,
    customer: notes?.customerName || `Customer #${a.customerId}`,
    applicantName: notes?.customerName || `Customer #${a.customerId}`,
    applicantRole: notes?.employerName || 'Applicant',
    sector: sectorFromLoanType(a.loanType),
    amount: num(a.loanAmount),
    riskScore: score,
    estPD: Math.round(pod * 1000) / 10,
    workflowStatus: (ra && dec ? 'COMPLETED' : (a.status === 'SUBMITTED' || a.status === 'PENDING' ? 'IN PROGRESS' : 'PENDING')) as WorkflowStatus,
    decision,
    riskTier: (ra?.riskCategory as RiskTier) || tierFromScore(score),
    submittedAt: a.createdAt || new Date().toISOString(),
    submittedFormatted: relTime(a.createdAt),
    dti: Math.round(dtiRatio * 100),
    creditUtilization: Math.round(num(explanation?.creditUtilization, score / 850 * 30)),
    employmentStatus: notes?.employerName ? `Employed at ${notes.employerName}` : 'Not verified',
    annualIncome,
    existingDebt,
    requestedFacility: a.purpose || `${a.loanType || 'Credit'} Facility`,
    riskFactors,
    rationales,
    timeline: auditTimeline.length ? auditTimeline : fallbackTimeline,
  };
}

function mapQueueItem(a: Application): ReviewQueueItem {
  const hours = Math.max(1, Math.round((Date.now() - new Date(a.submittedAt).getTime()) / 3.6e6));
  return {
    id: `rq-${a.id}`,
    applicationId: a.id,
    customer: a.customer,
    priority: a.riskTier === 'HIGH' ? 'HIGH' : a.riskTier === 'MEDIUM' ? 'MEDIUM' : 'LOW',
    riskScore: a.riskScore,
    reason: a.decision === 'REVIEW' ? 'Manual underwriter review' : 'Borderline policy threshold',
    age: `${hours}h`,
    amount: a.amount,
  };
}

// ── API surface ────────────────────────────────────────────
export interface DashboardData {
  applications: Application[];
  queueItems: ReviewQueueItem[];
  policies: PolicyRule[];
  auditRows: AuditRow[];
  customers: Customer[];
  healthServices: HealthService[];
  live: boolean;
}

export async function fetchAll(): Promise<DashboardData> {
  LIVE_MODE = await probeBackend();
  if (!LIVE_MODE) {
    return {
      applications: DEMO_APPLICATIONS,
      queueItems: DEMO_APPLICATIONS.filter((a) => a.decision === 'REVIEW').map(mapQueueItem),
      policies: DEFAULT_POLICIES,
      auditRows: DEMO_AUDIT,
      customers: DEMO_CUSTOMERS,
      healthServices: DEMO_HEALTH_SERVICES,
      live: false,
    };
  }

  try {
    const [appsRes, auditRes, custRes, polRes] = await Promise.all([
      client.get('/api/applications', { params: { page: 0, size: 100 } }),
      client.get('/api/audit', { params: { page: 0, size: 100 } }),
      client.get('/api/customers', { params: { page: 0, size: 100 } }),
      client.get('/api/decisions/policies').catch(() => null),
    ]);

    const auditRows: AuditRow[] = contentOf<any>(auditRes.data).map((r: any) => ({
      id: r.id,
      entityId: r.entityId,
      entityType: r.entityType,
      action: r.action,
      actor: r.userId || r.service || 'system',
      category: r.action,
      description: r.details || `${r.action} on ${r.entityType} #${r.entityId}`,
      hash: r.correlationId || '—',
      timestamp: r.createdAt,
      service: r.service,
    }));

    const auditForTimeline = auditRows.filter((r) => r.entityType === 'CreditApplication');
    const applications = contentOf<any>(appsRes.data).map((a: any) => mapApplication(a, auditForTimeline));
    const queueItems = applications.filter((a) => a.decision === 'REVIEW').map(mapQueueItem);

    const customers: Customer[] = contentOf<any>(custRes.data).map((c: any) => ({
      id: `CUS-${c.id}`,
      name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || `Customer #${c.id}`,
      industry: c.employerName || 'Personal',
      totalExposure: num(c.existingDebt),
      riskGrade: tierFromScore(num(c.creditScore, 600)),
      activeFacilities: num(c.recentInquiries),
      primaryContact: c.email || '—',
      status: num(c.creditScore, 600) >= 650 ? 'Active' : 'Review',
    }));

    // Policies: tolerate several response shapes; fall back to defaults
    let policies: PolicyRule[] = DEFAULT_POLICIES;
    const rawPolicies = polRes?.data;
    if (rawPolicies) {
      const list = Array.isArray(rawPolicies) ? rawPolicies : contentOf<any>(rawPolicies);
      if (list.length) {
        const mapped = list
          .map((p: any, i: number): PolicyRule | null => {
            const name: string = p.name || p.policyName || p.key || '';
            const value = num(p.currentValue ?? p.value ?? p.threshold, NaN);
            if (!name || !isFinite(value)) return null;
            return {
              id: String(p.id ?? `pol-${i}`),
              category: p.category || (name.toLowerCase().includes('score') ? 'score' : name.toLowerCase().includes('dti') ? 'financial' : 'automated'),
              name,
              currentValue: value,
              previousValue: num(p.previousValue, value),
              unit: p.unit,
              prefix: p.prefix,
              step: p.step,
              metaDate: p.updatedAt ? formatDateTime(p.updatedAt) : '—',
              metaAuthor: p.updatedBy || 'Policy Engine',
            };
          })
          .filter(Boolean) as PolicyRule[];
        if (mapped.length) policies = mapped;
      }
    }

    const healthServices = await probeServices();
    return { applications, queueItems, policies, auditRows, customers, healthServices, live: true };
  } catch (e) {
    console.error('Live data fetch failed, using demo data', e);
    LIVE_MODE = false;
    return {
      applications: DEMO_APPLICATIONS,
      queueItems: DEMO_APPLICATIONS.filter((a) => a.decision === 'REVIEW').map(mapQueueItem),
      policies: DEFAULT_POLICIES,
      auditRows: DEMO_AUDIT,
      customers: DEMO_CUSTOMERS,
      healthServices: DEMO_HEALTH_SERVICES,
      live: false,
    };
  }
}

async function probeServices(): Promise<HealthService[]> {
  const targets: { id: string; name: string; path: string }[] = [
    { id: 'gateway', name: 'API Gateway', path: '/actuator/health' },
    { id: 'customer', name: 'Customer Service', path: '/api/customers?page=0&size=1' },
    { id: 'application', name: 'Application Service', path: '/api/applications?page=0&size=1' },
    { id: 'decision', name: 'Decision Service', path: '/api/decisions/policies' },
    { id: 'audit', name: 'Audit Service', path: '/api/audit?page=0&size=1' },
  ];
  const started = Date.now();
  const results = await Promise.all(
    targets.map(async (t) => {
      const t0 = performance.now();
      try {
        await client.get(t.path, { timeout: 4000 });
        return { t, ok: true };
      } catch {
        return { t, ok: false };
      }
    })
  );
  void started;
  return results.map(({ t, ok }) => ({
    id: t.id,
    name: t.name,
    icon: 'dns',
    status: ok ? 'healthy' : 'down',
    uptime: ok ? 'online' : 'offline',
    latency: '—',
    metricLabel3: 'Endpoint',
    metricValue3: t.path.split('?')[0],
  }));
}

export async function createApplication(input: CreateApplicationInput): Promise<Application> {
  const body = {
    customerId: 1,
    loanAmount: input.amount,
    loanType: 'PERSONAL',
    loanTermMonths: 60,
    purpose: input.requestedFacility || 'Commercial Credit Facility',
    monthlyIncome: Math.round(input.annualIncome / 12),
    existingDebt: input.existingDebt,
    creditScore: input.creditScore,
    notes: JSON.stringify({
      customerName: input.customer,
      employerName: input.employerName,
      requestedFacility: input.requestedFacility,
      sector: input.sector,
    }),
  };
  const res = await client.post('/api/applications', body);
  const created = mapApplication(res.data, []);
  try {
    await client.post(`/api/applications/${res.data.id}/submit`);
  } catch {
    // submission is best-effort; application still exists
  }
  return created;
}

export function sessionUserName(): string {
  const u = getUser();
  if (!u) return 'Guest User';
  return decodeJwtName(u.token)?.replace(/[._]/g, ' ') || u.email;
}
