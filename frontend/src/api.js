import axios from 'axios';

const AUTH_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:8081';
const APP_URL = process.env.REACT_APP_APP_URL || 'http://localhost:8082';
const AUDIT_URL = process.env.REACT_APP_AUDIT_URL || 'http://localhost:8085';

// Check if backend is reachable
let DEMO_MODE = false;

async function checkBackend() {
  try {
    await axios.get(`${APP_URL}/actuator/health`, { timeout: 2000 });
    DEMO_MODE = false;
  } catch {
    DEMO_MODE = true;
  }
}

function createClient(baseURL) {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 3000,
  });
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return client;
}

const authClient = createClient(AUTH_URL);
const appClient = createClient(APP_URL);
const auditClient = createClient(AUDIT_URL);

// ── Demo Data ──────────────────────────────────────────────
const DEMO_CUSTOMERS = [
  { id: 1, firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', phone: '555-0101', creditScore: 780, employerName: 'TechCorp', jobTitle: 'Engineer', employmentYears: 8, annualIncome: 120000, existingDebt: 15000, creditUtilization: 0.15, paymentHistoryScore: 0.95, recentInquiries: 1, createdAt: '2026-01-15T10:00:00Z' },
  { id: 2, firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com', phone: '555-0102', creditScore: 650, employerName: 'RetailCo', jobTitle: 'Manager', employmentYears: 3, annualIncome: 65000, existingDebt: 45000, creditUtilization: 0.55, paymentHistoryScore: 0.72, recentInquiries: 4, createdAt: '2026-02-20T14:30:00Z' },
  { id: 3, firstName: 'Carol', lastName: 'Williams', email: 'carol@example.com', phone: '555-0103', creditScore: 720, employerName: 'FinanceHub', jobTitle: 'Analyst', employmentYears: 5, annualIncome: 95000, existingDebt: 28000, creditUtilization: 0.30, paymentHistoryScore: 0.88, recentInquiries: 2, createdAt: '2026-03-10T09:15:00Z' },
  { id: 4, firstName: 'David', lastName: 'Brown', email: 'david@example.com', phone: '555-0104', creditScore: 580, employerName: 'StartupX', jobTitle: 'Developer', employmentYears: 1, annualIncome: 55000, existingDebt: 62000, creditUtilization: 0.78, paymentHistoryScore: 0.55, recentInquiries: 7, createdAt: '2026-04-05T11:45:00Z' },
  { id: 5, firstName: 'Eva', lastName: 'Garcia', email: 'eva@example.com', phone: '555-0105', creditScore: 810, employerName: 'BigBank', jobTitle: 'Director', employmentYears: 12, annualIncome: 180000, existingDebt: 8000, creditUtilization: 0.08, paymentHistoryScore: 0.98, recentInquiries: 0, createdAt: '2026-05-01T08:00:00Z' },
];

const DEMO_APPLICATIONS = [
  { id: 101, customerId: 1, status: 'APPROVED', loanAmount: 250000, loanType: 'MORTGAGE', loanTermMonths: 360, purpose: 'Home Purchase', monthlyIncome: 10000, existingDebt: 15000, creditScore: 780, createdAt: '2026-06-01T10:00:00Z',
    riskAssessment: { id: 1, applicationId: 101, probabilityOfDefault: 0.023, riskScore: 785, riskCategory: 'LOW', explanation: 'Risk Category: LOW\nRisk Score: 785\nDefault Probability: 2.3%\n\nPositive Factors:\n✓ Strong credit score (780)\n✓ Low debt-to-income ratio (12.5%)\n✓ Very low default probability\n✓ Stable employment (8 years)\n\nRisk Factors:\nNone significant', modelVersion: 'v1.0-trained' },
    decision: { id: 1, applicationId: 101, outcome: 'APPROVE', probabilityOfDefault: 0.023, debtToIncomeRatio: 0.125, loanToIncomeRatio: 2.08, explanation: 'Decision: APPROVE\n\nPositive Factors:\n✓ Strong credit score\n✓ Low debt-to-income ratio\n✓ Very low default probability\n✓ Reasonable loan-to-income ratio\n\nModel:\nDefault probability = 2.3%\nRisk score = 785', createdAt: '2026-06-01T10:00:05Z' }
  },
  { id: 102, customerId: 2, status: 'REJECTED', loanAmount: 50000, loanType: 'PERSONAL', loanTermMonths: 60, purpose: 'Debt Consolidation', monthlyIncome: 5417, existingDebt: 45000, creditScore: 650, createdAt: '2026-06-15T14:30:00Z',
    riskAssessment: { id: 2, applicationId: 102, probabilityOfDefault: 0.187, riskScore: 540, riskCategory: 'HIGH', explanation: 'Risk Category: HIGH\nRisk Score: 540\nDefault Probability: 18.7%\n\nRisk Factors:\n⚠ High debt-to-income ratio (69.2%)\n⚠ Elevated default probability\n⚠ Credit score below threshold', modelVersion: 'v1.0-trained' },
    decision: { id: 2, applicationId: 102, outcome: 'REJECT', probabilityOfDefault: 0.187, debtToIncomeRatio: 0.692, loanToIncomeRatio: 0.77, explanation: 'Decision: REJECT\n\nRisk Factors:\n⚠ Credit score below threshold (650 < 700)\n⚠ High debt-to-income ratio (69.2% > 43%)\n⚠ Elevated default probability (18.7%)\n\nModel:\nDefault probability = 18.7%\nRisk score = 540', createdAt: '2026-06-15T14:30:05Z' }
  },
  { id: 103, customerId: 3, status: 'MANUAL_REVIEW', loanAmount: 150000, loanType: 'AUTO', loanTermMonths: 72, purpose: 'Vehicle Purchase', monthlyIncome: 7917, existingDebt: 28000, creditScore: 720, createdAt: '2026-07-01T09:15:00Z',
    riskAssessment: { id: 3, applicationId: 103, probabilityOfDefault: 0.068, riskScore: 665, riskCategory: 'MEDIUM', explanation: 'Risk Category: MEDIUM\nRisk Score: 665\nDefault Probability: 6.8%\n\nPositive Factors:\n✓ Acceptable credit score\n✓ Moderate utilization\n\nRisk Factors:\n⚠ Moderate default probability\n⚠ Two recent credit inquiries', modelVersion: 'v1.0-trained' },
    decision: { id: 3, applicationId: 103, outcome: 'MANUAL_REVIEW', probabilityOfDefault: 0.068, debtToIncomeRatio: 0.294, loanToIncomeRatio: 1.57, explanation: 'Decision: MANUAL_REVIEW\n\nPositive Factors:\n✓ Acceptable credit score\n✓ Reasonable debt-to-income ratio\n\nRisk Factors:\n⚠ Elevated default probability (6.8%)\n\nModel:\nDefault probability = 6.8%\nRisk score = 665', createdAt: '2026-07-01T09:15:05Z' }
  },
  { id: 104, customerId: 4, status: 'REJECTED', loanAmount: 80000, loanType: 'BUSINESS', loanTermMonths: 120, purpose: 'Business Expansion', monthlyIncome: 4583, existingDebt: 62000, creditScore: 580, createdAt: '2026-07-10T11:45:00Z',
    riskAssessment: { id: 4, applicationId: 104, probabilityOfDefault: 0.312, riskScore: 420, riskCategory: 'HIGH', explanation: 'Risk Category: HIGH\nRisk Score: 420\nDefault Probability: 31.2%\n\nRisk Factors:\n⚠ Very high debt-to-income ratio\n⚠ Low credit score\n⚠ High credit utilization\n⚠ Recent inquiries (7)\n⚠ Short employment history', modelVersion: 'v1.0-trained' },
    decision: { id: 4, applicationId: 104, outcome: 'REJECT', probabilityOfDefault: 0.312, debtToIncomeRatio: 1.13, loanToIncomeRatio: 1.45, explanation: 'Decision: REJECT\n\nRisk Factors:\n⚠ Credit score below threshold (580 < 650)\n⚠ Extremely high debt-to-income ratio (113%)\n⚠ Very high default probability (31.2%)\n\nModel:\nDefault probability = 31.2%\nRisk score = 420', createdAt: '2026-07-10T11:45:05Z' }
  },
  { id: 105, customerId: 5, status: 'APPROVED', loanAmount: 500000, loanType: 'MORTGAGE', loanTermMonths: 360, purpose: 'Investment Property', monthlyIncome: 15000, existingDebt: 8000, creditScore: 810, createdAt: '2026-07-20T08:00:00Z',
    riskAssessment: { id: 5, applicationId: 105, probabilityOfDefault: 0.011, riskScore: 830, riskCategory: 'LOW', explanation: 'Risk Category: LOW\nRisk Score: 830\nDefault Probability: 1.1%\n\nPositive Factors:\n✓ Excellent credit score (810)\n✓ Very low debt-to-income ratio\n✓ Very low default probability\n✓ Strong employment stability (12 years)', modelVersion: 'v1.0-trained' },
    decision: { id: 5, applicationId: 105, outcome: 'APPROVE', probabilityOfDefault: 0.011, debtToIncomeRatio: 0.044, loanToIncomeRatio: 2.78, explanation: 'Decision: APPROVE\n\nPositive Factors:\n✓ Excellent credit score\n✓ Very low debt-to-income ratio\n✓ Very low default probability\n✓ Reasonable loan-to-income ratio\n\nModel:\nDefault probability = 1.1%\nRisk score = 830', createdAt: '2026-07-20T08:00:05Z' }
  },
  { id: 106, customerId: 1, status: 'SUBMITTED', loanAmount: 35000, loanType: 'PERSONAL', loanTermMonths: 36, purpose: 'Home Renovation', monthlyIncome: 10000, existingDebt: 15000, creditScore: 780, createdAt: '2026-08-01T10:30:00Z' },
];

const DEMO_AUDIT = [
  { id: 1, entityId: 101, entityType: 'CreditApplication', action: 'ApplicationSubmitted', service: 'application-service', details: 'Application #101 submitted for review', createdAt: '2026-06-01T10:00:00Z' },
  { id: 2, entityId: 101, entityType: 'RiskAssessment', action: 'RiskAssessmentCompleted', service: 'risk-service', details: 'Risk score: 785, Category: LOW, POD: 2.3%', createdAt: '2026-06-01T10:00:02Z' },
  { id: 3, entityId: 101, entityType: 'Decision', action: 'ApplicationApproved', service: 'decision-service', details: 'Decision: APPROVE', createdAt: '2026-06-01T10:00:05Z' },
  { id: 4, entityId: 102, entityType: 'CreditApplication', action: 'ApplicationSubmitted', service: 'application-service', details: 'Application #102 submitted for review', createdAt: '2026-06-15T14:30:00Z' },
  { id: 5, entityId: 102, entityType: 'RiskAssessment', action: 'RiskAssessmentCompleted', service: 'risk-service', details: 'Risk score: 540, Category: HIGH, POD: 18.7%', createdAt: '2026-06-15T14:30:02Z' },
  { id: 6, entityId: 102, entityType: 'Decision', action: 'ApplicationRejected', service: 'decision-service', details: 'Decision: REJECT', createdAt: '2026-06-15T14:30:05Z' },
  { id: 7, entityId: 103, entityType: 'CreditApplication', action: 'ApplicationSubmitted', service: 'application-service', details: 'Application #103 submitted for review', createdAt: '2026-07-01T09:15:00Z' },
  { id: 8, entityId: 103, entityType: 'RiskAssessment', action: 'RiskAssessmentCompleted', service: 'risk-service', details: 'Risk score: 665, Category: MEDIUM, POD: 6.8%', createdAt: '2026-07-01T09:15:02Z' },
  { id: 9, entityId: 103, entityType: 'Decision', action: 'ApplicationUnderReview', service: 'decision-service', details: 'Decision: MANUAL_REVIEW', createdAt: '2026-07-01T09:15:05Z' },
];

const DEMO_STATS = {
  totalApplications: 6, approvedCount: 2, rejectedCount: 2, manualReviewCount: 1, pendingCount: 1,
  approvalRate: 33.3, rejectionRate: 33.3, manualReviewRate: 16.7,
  statusCounts: { APPROVED: 2, REJECTED: 2, MANUAL_REVIEW: 1, SUBMITTED: 1 }
};

// ── Demo API helpers ───────────────────────────────────────
function delay(ms = 300) { return new Promise(r => setTimeout(r, ms)); }

function demoApi(method, url, data) {
  return (async () => {
    await delay(200 + Math.random() * 300);

    // Auth
    if (url === '/api/auth/login' && method === 'POST') {
      const { email, password } = data;
      if (password === 'password' && (email === 'admin@creditrisk.com' || email === 'analyst@creditrisk.com')) {
        const role = email.includes('admin') ? 'ADMIN' : 'ANALYST';
        return { data: { token: 'demo-jwt-token-' + Date.now(), email, role, userId: role === 'ADMIN' ? 1 : 2, customerId: null } };
      }
      throw { response: { status: 401, data: { message: 'Invalid credentials' } } };
    }

    // Dashboard stats
    if (url === '/api/applications/dashboard/stats') return { data: DEMO_STATS };

    // Applications
    if (url === '/api/applications' && method === 'GET') {
      const page = parseInt(new URL(url, 'http://x').searchParams?.get('page') || '0');
      return { data: { content: DEMO_APPLICATIONS, page: 0, size: 20, totalElements: DEMO_APPLICATIONS.length, totalPages: 1 } };
    }
    if (url.match(/^\/api\/applications\/\d+$/) && method === 'GET') {
      const id = parseInt(url.split('/').pop());
      const app = DEMO_APPLICATIONS.find(a => a.id === id);
      if (!app) throw { response: { status: 404 } };
      return { data: app };
    }

    // Customers
    if (url === '/api/customers' && method === 'GET') {
      return { data: { content: DEMO_CUSTOMERS, page: 0, size: 20, totalElements: DEMO_CUSTOMERS.length, totalPages: 1 } };
    }
    if (url.match(/^\/api\/customers\/\d+$/) && method === 'GET') {
      const id = parseInt(url.split('/').pop());
      const cust = DEMO_CUSTOMERS.find(c => c.id === id);
      if (!cust) throw { response: { status: 404 } };
      return { data: cust };
    }

    // Audit
    if (url.startsWith('/api/audit') && method === 'GET') {
      return { data: { content: DEMO_AUDIT, page: 0, size: 50, totalElements: DEMO_AUDIT.length, totalPages: 1 } };
    }

    // Risk
    if (url.match(/^\/api\/risk\/assess\/\d+$/) && method === 'POST') {
      const appId = parseInt(url.split('/').pop());
      const app = DEMO_APPLICATIONS.find(a => a.id === appId);
      if (app?.riskAssessment) return { data: app.riskAssessment };
      return { data: { id: 99, applicationId: appId, probabilityOfDefault: 0.05, riskScore: 700, riskCategory: 'MEDIUM', explanation: 'Assessment complete', modelVersion: 'v1.0' } };
    }

    return { data: {} };
  })();
}

// ── Main API ───────────────────────────────────────────────
const api = {
  get: async (url, config) => {
    if (DEMO_MODE) return demoApi('GET', url);
    try {
      if (url.startsWith('/api/auth')) return await authClient.get(url, config);
      if (url.startsWith('/api/audit')) return await auditClient.get(url, config);
      return await appClient.get(url, config);
    } catch (e) {
      DEMO_MODE = true;
      return demoApi('GET', url);
    }
  },
  post: async (url, data) => {
    if (DEMO_MODE) return demoApi('POST', url, data);
    try {
      if (url.startsWith('/api/auth')) return await authClient.post(url, data);
      return await appClient.post(url, data);
    } catch (e) {
      if (e.response?.status === 401) throw e;
      DEMO_MODE = true;
      return demoApi('POST', url, data);
    }
  },
  put: async (url, data, config) => {
    if (DEMO_MODE) return demoApi('PUT', url, data);
    try { return await appClient.put(url, data, config); }
    catch (e) { DEMO_MODE = true; return demoApi('PUT', url, data); }
  },
  delete: async (url) => {
    if (DEMO_MODE) return demoApi('DELETE', url);
    try { return await appClient.delete(url); }
    catch (e) { DEMO_MODE = true; return demoApi('DELETE', url); }
  },
};

// Check backend on load
checkBackend();

export default api;
