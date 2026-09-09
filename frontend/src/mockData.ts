import { Application, ReviewQueueItem, PolicyRule, HealthService, SystemAlert, Customer } from './types';

export const USER_AVATARS = {
  executive: "https://lh3.googleusercontent.com/aida-public/AB6AXuAovqzwmCLsUYvsJTxKmB6JejETf2i8-_vAsDS79LyE2viEZKtmcrJNAnuFcKCIEhg1ThVV0bSYoi5PTROeGmswX8qZ7VVnTjcDGISeeY8-2CC1okDUJKJsKbY4MmS1skAcOk0nBomtMemwYExo723QHX2OvOCtYfk3p6mmFTCRCiupQFDRuV2xePONlkM-W3PYV5XR1cbdsdES6d3tV0qZBKGitgo07DjyuuCFnoZyCYK1aqUEj9T41Q",
  sarahJenkins: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkxKvAOYjO0l0GWLfa_RpY_VoUPY_WGly-ilbz6SKRcDeKVZGoZD84oohmejGo-BHO8d8vm3D7yQjaguhOrspPhKqMW8ajCyPAodsI6LcK3qths0EDyQstZZa5JlXl0FYNpTLjbUCLI8HCzRsie8ZvMpjcvndJzmk_mg111S5Aaozp5ChLah1Ysgwd3wz5OHB_6Ao7rfHpL0oZEHBL-cmRk8WcnFHNFxzHfqzDD7cT6Kifex-ccW7H4g",
  admin: "https://lh3.googleusercontent.com/aida-public/AB6AXuBsheYIkj9wqK_5SGG0_GsWxa5ZQ0BIKa75RYmra2_P9LyLLEyKCzyrJTE_Bpc8y7k0_ui0eBA5D9UsHP206rKSRtwyIUKGBUU_NDOFf0ZSwiMx-TxNo-ehHWLUff3zOsCkMxE7tTS2W7hVFPcKK1X1iR905R9qua4h4NWWxZOVRWhfxh-HdNCvmsSvmZ1-AduUbXu9KVRX5-E_MU837XuhFWJgGgM_W0hphyHZEBEOfIq7hbzFbsrdlw",
  sysAdmin: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaFq_GidK-kKMkUmNE6kHzji1q0RGh6XASg0mCXxKuzRM2Jny_8C6o0hp2Qci0_m-8ZRmt-qxXPKyRsoJr5N8sbAvBYH3KrJKC2whHjiG7CAR9plxeMOIE9cTlbGSKCWII33ZZg4xj1uMvpH4iCvCSgEE-lLBDvBsjoEsYH-8hcAwd5zxAGs-Dd8qliZCODqK5ZDi-BOPcYE6TmftVy9gzfwScVcvdfZDkxiDKWvHruVGBTJJthPdujw",
  logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdKxnO8Cuw3EmdV5ApOA8FRIMqltc9Z39U0zUfeC50lmLvnRpXTwRyjERmxMEU3bQSDywzc0jTSFo5dTrbH-mUFMr9H6SiF29_juk-4t87tNDnkBhE5tXxReVWpIWr3VOe5Nk869OTVYcIsv92pb6uaBi5nGcjEzkN7AStV8io2OqnmJfEl33hrH-JBKq4dPENwVDDgFz5YZDdJTwio4O2nx1kGtoGezCgzz0E86XOUroG3AjNlSNrxw",
};

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: "APP-1024",
    customer: "Sarah Jenkins",
    applicantName: "Sarah Jenkins",
    applicantRole: "Principal Systems Architect",
    sector: "Technology & Software",
    amount: 450000,
    riskScore: 742,
    estPD: 4.3,
    workflowStatus: "COMPLETED",
    decision: "APPROVED",
    riskTier: "LOW",
    submittedAt: "2023-10-27 10:35",
    submittedFormatted: "Today, 10:35 AM",
    dti: 22,
    creditUtilization: 14,
    employmentStatus: "5+ years at current employer (Tech Sector)",
    annualIncome: 185000,
    existingDebt: 40700,
    requestedFacility: "Commercial Credit Line",
    riskFactors: [
      {
        id: "rf-1",
        type: "positive",
        title: "Strong Repayment History",
        description: "No late payments in the last 48 months.",
      },
      {
        id: "rf-2",
        type: "positive",
        title: "Stable Employment",
        description: "5+ years at current employer (Tech Sector).",
      },
      {
        id: "rf-3",
        type: "warning",
        title: "Recent Credit Inquiries",
        description: "3 hard inquiries in the last 6 months (Warning).",
      }
    ],
    rationales: [
      { metric: "Debt-to-Income (DTI)", value: "22% (Pass)", status: "Pass" },
      { metric: "Employment Verification", value: "Verified", status: "Verified" },
      { metric: "Credit Utilization", value: "14% (Pass)", status: "Pass" }
    ],
    timeline: [
      { id: "tl-1", timestamp: "Today, 10:42 AM", title: "Approval Logged", description: "System auto-approved based on ruleset V2.4", isActive: true },
      { id: "tl-2", timestamp: "Today, 10:41 AM", title: "Decision Engine Complete" },
      { id: "tl-3", timestamp: "Today, 10:40 AM", title: "Risk Assessment Running" },
      { id: "tl-4", timestamp: "Today, 10:35 AM", title: "Application Submitted", description: "Via Partner Portal" },
    ]
  },
  {
    id: "APP-9021",
    customer: "Acme Corp Ltd",
    sector: "Commercial Real Estate",
    amount: 1250000,
    riskScore: 745,
    estPD: 2.1,
    workflowStatus: "COMPLETED",
    decision: "APPROVED",
    riskTier: "LOW",
    submittedAt: "2023-10-24 14:32",
    submittedFormatted: "10 mins ago",
    applicantName: "Thomas Sterling",
    applicantRole: "Chief Financial Officer",
    dti: 24,
    creditUtilization: 18,
    annualIncome: 1400000,
    existingDebt: 336000,
    requestedFacility: "Commercial Real Estate Expansion",
    riskFactors: [
      { id: "rf-1", type: "positive", title: "Robust Net Asset Ratio", description: "Collateral backing covers 160% of total facility." },
      { id: "rf-2", type: "positive", title: "Consistent Cash Flow", description: "Positive EBITDA trend over 12 consecutive quarters." }
    ],
    rationales: [
      { metric: "Debt Service Coverage (DSCR)", value: "1.82x (Pass)", status: "Pass" },
      { metric: "Collateral Coverage", value: "160% (Pass)", status: "Pass" },
      { metric: "Liquidity Ratio", value: "2.4x (Pass)", status: "Pass" }
    ],
    timeline: [
      { id: "tl-1", timestamp: "2023-10-24 14:32", title: "Approval Executed", description: "Auto-approved via Standard Corporate Underwriting V2.4", isActive: true },
      { id: "tl-2", timestamp: "2023-10-24 14:28", title: "Model Inference Finalized" },
      { id: "tl-3", timestamp: "2023-10-24 14:15", title: "Documents Ingested & Verified" }
    ]
  },
  {
    id: "APP-9022",
    customer: "Global Industries Inc",
    sector: "Supply Chain Finance",
    amount: 3400000,
    riskScore: 580,
    estPD: 8.4,
    workflowStatus: "IN PROGRESS",
    decision: "REVIEW",
    riskTier: "MEDIUM",
    submittedAt: "2023-10-24 13:15",
    submittedFormatted: "1 hr ago",
    applicantName: "Marcus Vance",
    applicantRole: "VP Treasury",
    dti: 44,
    creditUtilization: 68,
    annualIncome: 2800000,
    existingDebt: 1232000,
    requestedFacility: "Working Capital Revolver",
    riskFactors: [
      { id: "rf-1", type: "warning", title: "Elevated DTI Ratio", description: "Debt-to-Income at 44%, approaching the 45% policy threshold." },
      { id: "rf-2", type: "warning", title: "High Short-term Utilization", description: "Credit line drawn at 68% across revolving facilities." }
    ],
    rationales: [
      { metric: "Debt-to-Income (DTI)", value: "44% (Borderline)", status: "Warning" },
      { metric: "Credit Utilization", value: "68% (Flagged)", status: "Warning" },
      { metric: "Audit Verification", value: "Pending Underwriter Sign-off", status: "Warning" }
    ],
    timeline: [
      { id: "tl-1", timestamp: "2023-10-24 13:20", title: "Routed to Manual Review Queue", description: "Triggered by high exposure and elevated DTI", isActive: true },
      { id: "tl-2", timestamp: "2023-10-24 13:16", title: "Automated Rules Assessment Complete" },
      { id: "tl-3", timestamp: "2023-10-24 13:15", title: "Application Submitted" }
    ]
  },
  {
    id: "APP-9023",
    customer: "Stark Logistics",
    sector: "Logistics & Freight",
    amount: 850000,
    riskScore: 410,
    estPD: 15.2,
    workflowStatus: "COMPLETED",
    decision: "REJECTED",
    riskTier: "HIGH",
    submittedAt: "2023-10-24 09:45",
    submittedFormatted: "3 hrs ago",
    applicantName: "Elena Rostova",
    applicantRole: "Managing Director",
    dti: 58,
    creditUtilization: 88,
    annualIncome: 650000,
    existingDebt: 377000,
    requestedFacility: "Fleet Equipment Lease",
    riskFactors: [
      { id: "rf-1", type: "negative", title: "Severe Credit Delinquency", description: "Multiple 60+ day late payments registered in trailing 12 months." },
      { id: "rf-2", type: "negative", title: "Exceeds Maximum DTI Cap", description: "DTI of 58% significantly breaches global limit (43%)." }
    ],
    rationales: [
      { metric: "Debt-to-Income (DTI)", value: "58% (Fail)", status: "Fail" },
      { metric: "Delinquency History", value: "3 Events (Fail)", status: "Fail" },
      { metric: "FICO / Score Threshold", value: "410 < 620 Min (Fail)", status: "Fail" }
    ],
    timeline: [
      { id: "tl-1", timestamp: "2023-10-24 09:48", title: "Auto-Rejection Executed", description: "Breached minimum FICO and DTI thresholds", isActive: true },
      { id: "tl-2", timestamp: "2023-10-24 09:46", title: "Rule Engine Evaluation" },
      { id: "tl-3", timestamp: "2023-10-24 09:45", title: "Application Received" }
    ]
  },
  {
    id: "APP-9024",
    customer: "Wayne Enterprises",
    sector: "Corporate Restructuring",
    amount: 12000000,
    riskScore: 810,
    estPD: 0.8,
    workflowStatus: "COMPLETED",
    decision: "APPROVED",
    riskTier: "LOW",
    submittedAt: "2023-10-23 16:20",
    submittedFormatted: "5 hrs ago",
    applicantName: "Lucius Fox",
    applicantRole: "Head of Operations",
    dti: 12,
    creditUtilization: 9,
    annualIncome: 85000000,
    existingDebt: 10200000,
    requestedFacility: "Syndicated Credit Facility",
    riskFactors: [
      { id: "rf-1", type: "positive", title: "Tier-1 Sovereign Credit Rating", description: "Investment-grade balance sheet with AAA institutional reserves." },
      { id: "rf-2", type: "positive", title: "Minimal Leverage", description: "Debt-to-income below 15% across global operating entities." }
    ],
    rationales: [
      { metric: "Debt-to-Income (DTI)", value: "12% (Pass)", status: "Pass" },
      { metric: "Liquid Asset Backing", value: "540% (Pass)", status: "Pass" },
      { metric: "Credit Rating", value: "AAA / Prime (Pass)", status: "Pass" }
    ],
    timeline: [
      { id: "tl-1", timestamp: "2023-10-23 16:25", title: "Executive Approval Dispatched", description: "Prime automated underwriting pathway approved", isActive: true },
      { id: "tl-2", timestamp: "2023-10-23 16:22", title: "Syndication Model Generated" },
      { id: "tl-3", timestamp: "2023-10-23 16:20", title: "Direct API Submission Logged" }
    ]
  },
  {
    id: "APP-9020",
    customer: "Globex Logistics",
    sector: "Supply Chain Finance",
    amount: 450000,
    riskScore: 612,
    estPD: 6.2,
    workflowStatus: "IN PROGRESS",
    decision: "REVIEW",
    riskTier: "MEDIUM",
    submittedAt: "2023-10-24 12:00",
    submittedFormatted: "1 hr ago",
    applicantName: "Hank Scorpio",
    applicantRole: "Chief Executive",
    dti: 38,
    creditUtilization: 52,
    annualIncome: 950000,
    existingDebt: 361000,
    requestedFacility: "Inventory Financing",
    riskFactors: [
      { id: "rf-1", type: "warning", title: "Rapid Expansion Exposure", description: "Short-term liabilities grew 35% year-over-year." }
    ],
    rationales: [
      { metric: "Debt-to-Income (DTI)", value: "38% (Pass)", status: "Pass" },
      { metric: "Inventory Liquidity", value: "Audited (Pass)", status: "Pass" }
    ],
    timeline: [
      { id: "tl-1", timestamp: "2023-10-24 12:05", title: "Pending Manual Underwriter Review", isActive: true }
    ]
  },
  {
    id: "APP-9019",
    customer: "Stark Industries",
    sector: "R&D Credit Line",
    amount: 2000000,
    riskScore: 450,
    estPD: 14.1,
    workflowStatus: "COMPLETED",
    decision: "REJECTED",
    riskTier: "HIGH",
    submittedAt: "2023-10-24 08:30",
    submittedFormatted: "3 hrs ago",
    applicantName: "Anthony Stark",
    applicantRole: "Chief Technology Officer",
    dti: 51,
    creditUtilization: 82,
    annualIncome: 2100000,
    existingDebt: 1071000,
    requestedFacility: "R&D Revolving Facility",
    riskFactors: [
      { id: "rf-1", type: "negative", title: "High Volatility Sector", description: "Experimental tech sector volatility combined with high DTI." }
    ],
    rationales: [
      { metric: "FICO Score", value: "450 (Fail)", status: "Fail" },
      { metric: "DTI", value: "51% (Fail)", status: "Fail" }
    ],
    timeline: [
      { id: "tl-1", timestamp: "2023-10-24 08:35", title: "Auto-Rejected by Policy Ruleset", isActive: true }
    ]
  },
  {
    id: "APP-9018",
    customer: "Wayne Enterprises",
    sector: "Corporate Restructuring",
    amount: 5500000,
    riskScore: 810,
    estPD: 0.8,
    workflowStatus: "COMPLETED",
    decision: "APPROVED",
    riskTier: "LOW",
    submittedAt: "2023-10-24 06:15",
    submittedFormatted: "5 hrs ago",
    applicantName: "Bruce Wayne",
    applicantRole: "Managing Trustee",
    dti: 14,
    creditUtilization: 11,
    annualIncome: 42000000,
    existingDebt: 5880000,
    requestedFacility: "Secured Equipment Note",
    riskFactors: [
      { id: "rf-1", type: "positive", title: "Flawless Repayment Track Record", description: "Zero default history across 15+ years of active lines." }
    ],
    rationales: [
      { metric: "Credit Score", value: "810 (Pass)", status: "Pass" },
      { metric: "DTI", value: "14% (Pass)", status: "Pass" }
    ],
    timeline: [
      { id: "tl-1", timestamp: "2023-10-24 06:18", title: "Auto-Approved", isActive: true }
    ]
  }
];

export const INITIAL_REVIEW_QUEUE: ReviewQueueItem[] = [
  {
    id: "rq-1",
    applicationId: "APP-8842-X",
    customer: "Acme Corp Logistics",
    priority: "HIGH",
    riskScore: 842,
    reason: "DTI Threshold",
    age: "4.2h",
    amount: 1450000,
  },
  {
    id: "rq-2",
    applicationId: "APP-7911-Y",
    customer: "Global Tech Solutions",
    priority: "MEDIUM",
    riskScore: 610,
    reason: "Large Amount",
    age: "2.1h",
    amount: 3200000,
  },
  {
    id: "rq-3",
    applicationId: "APP-6520-Z",
    customer: "Stark Industries",
    priority: "LOW",
    riskScore: 450,
    reason: "Verification Required",
    age: "1.5h",
    amount: 780000,
  },
  {
    id: "rq-4",
    applicationId: "APP-8999-A",
    customer: "Wayne Enterprises",
    priority: "HIGH",
    riskScore: 890,
    reason: "DTI Threshold",
    age: "5.0h",
    amount: 4900000,
  }
];

export const INITIAL_POLICIES: PolicyRule[] = [
  {
    id: "pol-1",
    category: "score",
    name: "Minimum FICO Score",
    currentValue: 620,
    previousValue: 600,
    metaDate: "12 Oct 2023",
    metaAuthor: "J. Smith",
    step: 1
  },
  {
    id: "pol-2",
    category: "score",
    name: "Prime Approval Threshold",
    currentValue: 740,
    previousValue: 720,
    metaDate: "05 Sep 2023",
    metaAuthor: "A. Chen",
    step: 1
  },
  {
    id: "pol-3",
    category: "financial",
    name: "Maximum DTI (Debt-to-Income)",
    currentValue: 0.43,
    previousValue: 0.45,
    unit: "%",
    step: 0.01,
    metaDate: "22 Nov 2023",
    metaAuthor: "System"
  },
  {
    id: "pol-4",
    category: "financial",
    name: "Minimum Annual Income",
    currentValue: 35000,
    previousValue: 30000,
    prefix: "$",
    step: 1000,
    metaDate: "10 Jan 2024",
    metaAuthor: "R. Davis"
  },
  {
    id: "pol-5",
    category: "automated",
    name: "Auto-Approve ML Probability",
    currentValue: 0.85,
    previousValue: 0.88,
    step: 0.01,
    metaDate: "01 Feb 2024",
    metaAuthor: "Model Ops"
  },
  {
    id: "pol-6",
    category: "automated",
    name: "Auto-Reject ML Probability",
    currentValue: 0.20,
    previousValue: 0.15,
    step: 0.01,
    metaDate: "01 Feb 2024",
    metaAuthor: "Model Ops"
  }
];

export const INITIAL_HEALTH_SERVICES: HealthService[] = [
  {
    id: "svc-1",
    name: "API Gateway",
    icon: "api",
    status: "healthy",
    uptime: "99.99%",
    latency: "12ms",
    metricLabel3: "Error Rate",
    metricValue3: "0.01%"
  },
  {
    id: "svc-2",
    name: "Risk Service",
    icon: "shield",
    status: "healthy",
    uptime: "99.98%",
    latency: "45ms",
    metricLabel3: "Error Rate",
    metricValue3: "0.02%"
  },
  {
    id: "svc-3",
    name: "Decision Service",
    icon: "gavel",
    status: "healthy",
    uptime: "100%",
    latency: "28ms",
    metricLabel3: "Error Rate",
    metricValue3: "0.00%"
  },
  {
    id: "svc-4",
    name: "ML Inference API",
    icon: "memory",
    status: "degraded",
    uptime: "99.85%",
    latency: "245ms",
    metricLabel3: "Error Rate",
    metricValue3: "1.2%",
    isDegraded: true
  },
  {
    id: "svc-5",
    name: "Primary Database",
    icon: "database",
    status: "healthy",
    uptime: "99.99%",
    latency: "4ms",
    metricLabel3: "Connections",
    metricValue3: "1,432"
  },
  {
    id: "svc-6",
    name: "Kafka Event Bus",
    icon: "queue",
    status: "healthy",
    uptime: "100%",
    latency: "0ms",
    metricLabel3: "Throughput",
    metricValue3: "4.2k/s"
  }
];

export const INITIAL_ALERTS: SystemAlert[] = [
  {
    id: "alt-1",
    timestamp: "2023-10-27 14:32:11",
    severity: "WARN",
    service: "ML Inference API",
    message: "High latency detected (p99 > 200ms) on /v1/predict endpoint."
  },
  {
    id: "alt-2",
    timestamp: "2023-10-27 12:15:00",
    severity: "INFO",
    service: "Database",
    message: "Automated snapshot backup completed successfully."
  },
  {
    id: "alt-3",
    timestamp: "2023-10-27 09:45:22",
    severity: "INFO",
    service: "Decision Service",
    message: "Rules engine reloaded with latest configuration (v2.4.1)."
  },
  {
    id: "alt-4",
    timestamp: "2023-10-26 23:10:05",
    severity: "ERROR",
    service: "API Gateway",
    message: "Rate limit exceeded for client ID: ext_auth_992. Requests dropped."
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Wayne Enterprises",
    industry: "Conglomerate & Technology",
    totalExposure: 17500000,
    riskGrade: "AAA",
    activeFacilities: 3,
    primaryContact: "Lucius Fox",
    status: "Active"
  },
  {
    id: "cust-2",
    name: "Acme Corp Ltd",
    industry: "Commercial Real Estate",
    totalExposure: 4250000,
    riskGrade: "A+",
    activeFacilities: 2,
    primaryContact: "Thomas Sterling",
    status: "Active"
  },
  {
    id: "cust-3",
    name: "Global Industries Inc",
    industry: "Supply Chain & Manufacturing",
    totalExposure: 6800000,
    riskGrade: "BBB-",
    activeFacilities: 2,
    primaryContact: "Marcus Vance",
    status: "Review"
  },
  {
    id: "cust-4",
    name: "Sarah Jenkins",
    industry: "Software & IT Services",
    totalExposure: 450000,
    riskGrade: "A",
    activeFacilities: 1,
    primaryContact: "Sarah Jenkins",
    status: "Active"
  },
  {
    id: "cust-5",
    name: "Stark Logistics",
    industry: "Freight Logistics",
    totalExposure: 850000,
    riskGrade: "BB-",
    activeFacilities: 1,
    primaryContact: "Elena Rostova",
    status: "Restricted"
  }
];

export const VOLUME_CHART_DATA = {
  "Last 30 Days": [
    { label: "Jan 1", count: 42 },
    { label: "Jan 5", count: 48 },
    { label: "Jan 10", count: 55 },
    { label: "Jan 15", count: 52 },
    { label: "Jan 20", count: 68 },
    { label: "Jan 25", count: 74 },
    { label: "Jan 30", count: 85 }
  ],
  "Last Quarter": [
    { label: "Week 1", count: 180 },
    { label: "Week 3", count: 210 },
    { label: "Week 6", count: 245 },
    { label: "Week 9", count: 290 },
    { label: "Week 12", count: 340 }
  ],
  "Year to Date": [
    { label: "Q1", count: 720 },
    { label: "Q2", count: 910 },
    { label: "Q3", count: 1140 },
    { label: "Q4", count: 1284 }
  ]
};

// ── Integration-layer exports (used by api.ts) ────────────────────────────
export const DEMO_APPLICATIONS = INITIAL_APPLICATIONS;
export const DEMO_CUSTOMERS = INITIAL_CUSTOMERS;
export const DEMO_HEALTH_SERVICES = INITIAL_HEALTH_SERVICES;
export const DEFAULT_POLICIES = INITIAL_POLICIES;

export function relTime(iso?: string | null): string {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (!isFinite(t)) return iso;
  const diff = Date.now() - t;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (!isFinite(d.getTime())) return iso;
  return d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
}

export const DEMO_AUDIT = [
  {
    id: 9001,
    entityId: 1024,
    entityType: 'CreditApplication',
    action: 'ApplicationSubmitted',
    actor: 'application-service',
    category: 'ApplicationSubmitted',
    description: 'Application #1024 submitted for underwriting review',
    hash: '0x3f7a...99b2',
    timestamp: new Date(Date.now() - 26 * 60000).toISOString(),
    service: 'application-service',
  },
  {
    id: 9002,
    entityId: 1024,
    entityType: 'CreditApplication',
    action: 'RiskAssessmentCompleted',
    actor: 'risk-service',
    category: 'RiskAssessmentCompleted',
    description: 'Risk score: 742, Category: LOW, PD: 4.3%',
    hash: '0x89e2...c441',
    timestamp: new Date(Date.now() - 24 * 60000).toISOString(),
    service: 'risk-service',
  },
  {
    id: 9003,
    entityId: 1024,
    entityType: 'CreditApplication',
    action: 'ApplicationApproved',
    actor: 'decision-service',
    category: 'ApplicationApproved',
    description: 'Decision: APPROVE rendered by ruleset v2.4',
    hash: '0x12d4...fa89',
    timestamp: new Date(Date.now() - 22 * 60000).toISOString(),
    service: 'decision-service',
  },
  {
    id: 9004,
    entityId: 9023,
    entityType: 'CreditApplication',
    action: 'ApplicationRejected',
    actor: 'decision-service',
    category: 'ApplicationRejected',
    description: 'Automated rejection executed for APP-9023 (breached FICO threshold)',
    hash: '0x67c1...33d0',
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    service: 'decision-service',
  },
  {
    id: 9005,
    entityId: 9022,
    entityType: 'CreditApplication',
    action: 'ApplicationUnderReview',
    actor: 'decision-service',
    category: 'ApplicationUnderReview',
    description: 'Manual risk tier review flagged for APP-9022 (borderline DTI)',
    hash: '0x98bb...ee01',
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    service: 'decision-service',
  },
];
