import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api.js';

const customerNames = { 1: 'Alice Johnson', 2: 'Bob Smith', 3: 'Carol Williams', 4: 'David Brown', 5: 'Eva Garcia' };

function ApplicationDetail() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);

  useEffect(() => {
    fetchApplication();
    fetchAuditLogs();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await api.get(`/api/applications/${id}`);
      setApplication(response.data);
    } catch (err) {
      console.error('Failed to fetch application:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await api.get(`/api/audit/CreditApplication/${id}`, {
        params: { page: 0, size: 50 }
      });
      setAuditLogs(response.data.content || []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  };

  const triggerRiskAssessment = async () => {
    setAssessing(true);
    try {
      await api.post(`/api/risk/assess/${id}`);
      await fetchApplication();
      await fetchAuditLogs();
    } catch (err) {
      console.error('Failed to trigger risk assessment:', err);
    } finally {
      setAssessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-body-sm text-on-surface-variant">Loading application...</span>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="empty-state">
        <span className="material-symbols-outlined text-5xl text-outline mb-4">search_off</span>
        <h5>Application Not Found</h5>
        <p>The requested application could not be found.</p>
        <Link to="/applications" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded font-label-md hover:bg-primary/90 transition-colors no-underline">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Applications
        </Link>
      </div>
    );
  }

  const riskAssessment = application.riskAssessment;
  const decision = application.decision;
  const customerName = customerNames[application.customerId] || `Customer #${application.customerId}`;
  const riskScore = riskAssessment?.riskScore || 0;
  const pd = riskAssessment?.probabilityOfDefault ? (Number(riskAssessment.probabilityOfDefault) * 100).toFixed(1) : '—';
  const riskCategory = riskAssessment?.riskCategory || 'N/A';
  const scorePercent = Math.min((riskScore / 850) * 100, 100);

  const getRiskBadge = () => {
    if (riskCategory === 'LOW') return { bg: 'bg-surface-container-high', text: 'text-primary', label: 'LOW RISK' };
    if (riskCategory === 'MEDIUM') return { bg: 'bg-amber-100', text: 'text-amber-800', label: 'MEDIUM RISK' };
    return { bg: 'bg-red-100', text: 'text-red-800', label: 'HIGH RISK' };
  };

  const getDecisionBadge = () => {
    if (decision?.outcome === 'APPROVE') return { bg: 'bg-[#E6F4EA]', text: 'text-[#137333]', border: 'border-[#CEEAD6]', label: 'APPROVED' };
    if (decision?.outcome === 'REJECT') return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', label: 'REJECTED' };
    return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', label: 'MANUAL REVIEW' };
  };

  const rb = getRiskBadge();
  const db = getDecisionBadge();

  return (
    <div className="p-margin_md max-w-container_max_width mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-margin_md">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
            Application #{application.id} - {customerName}
          </h2>
          <div className="flex gap-2">
            <span className={`inline-flex items-center px-2 py-1 ${rb.bg} ${rb.text} font-data-mono text-data-mono border border-outline-variant rounded`}>
              {rb.label}
            </span>
            <span className={`inline-flex items-center px-2 py-1 ${db.bg} ${db.text} font-data-mono text-data-mono border ${db.border} rounded`}>
              {db.label}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/applications" className="px-4 py-2 border border-outline text-on-surface font-label-md text-label-md rounded hover:bg-surface-container transition-colors no-underline">
            Export Report
          </Link>
          <button className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded hover:bg-primary-container transition-colors">
            Process Next
          </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="border-b border-outline-variant mb-margin_md">
        <nav className="flex gap-6">
          <a className="py-2 border-b-2 border-primary font-label-md text-label-md text-primary font-bold" href="#">Overview</a>
          <a className="py-2 border-b-2 border-transparent font-label-md text-label-md text-on-surface-variant hover:text-on-surface" href="#">Financials</a>
          <a className="py-2 border-b-2 border-transparent font-label-md text-label-md text-on-surface-variant hover:text-on-surface" href="#">Risk Factors</a>
          <a className="py-2 border-b-2 border-transparent font-label-md text-label-md text-on-surface-variant hover:text-on-surface" href="#">Audit Log</a>
        </nav>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Risk Assessment Panel */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {/* Score Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded p-margin_sm flex flex-col justify-between">
            <div>
              <h3 className="font-title-md text-title-md text-on-surface mb-1 flex justify-between items-center">
                Risk Score
                <span className="material-symbols-outlined text-on-surface-variant text-sm">info</span>
              </h3>
              <p className="font-display-lg text-display-lg text-primary mt-4">
                {riskScore} <span className="text-body-md text-on-surface-variant font-normal">/ 850</span>
              </p>
            </div>
            <div className="mt-6">
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${scorePercent}%` }}></div>
              </div>
              <div className="flex justify-between mt-2 font-label-md text-label-md text-on-surface-variant">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>

          {/* Probability Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded p-margin_sm flex flex-col justify-between">
            <div>
              <h3 className="font-title-md text-title-md text-on-surface mb-1 flex justify-between items-center">
                Probability of Default
                <span className="material-symbols-outlined text-on-surface-variant text-sm">analytics</span>
              </h3>
              <p className="font-display-lg text-display-lg text-primary mt-4">{pd}%</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {Number(riskAssessment?.probabilityOfDefault || 0) < 0.05 ? 'Low probability' : Number(riskAssessment?.probabilityOfDefault || 0) < 0.15 ? 'Moderate probability' : 'High probability'}
              </p>
            </div>
            <div className="mt-6">
              <div className="inline-flex items-center gap-1 text-[#137333] bg-[#E6F4EA] px-2 py-1 rounded text-data-mono font-data-mono">
                <span className="material-symbols-outlined text-sm">trending_down</span>
                -0.2% vs last assessment
              </div>
            </div>
          </div>

          {/* Key Risk Factors */}
          <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant rounded p-margin_sm">
            <h3 className="font-title-md text-title-md text-on-surface mb-4 border-b border-outline-variant pb-2">Key Risk Factors</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-surface border border-outline-variant rounded">
                <span className="material-symbols-outlined text-[#137333]">check_circle</span>
                <div>
                  <p className="font-body-md text-body-md font-semibold text-on-surface">Strong Repayment History</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">No late payments in the last 48 months.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-surface border border-outline-variant rounded">
                <span className="material-symbols-outlined text-[#137333]">check_circle</span>
                <div>
                  <p className="font-body-md text-body-md font-semibold text-on-surface">Stable Employment</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">5+ years at current employer.</p>
                </div>
              </div>
              {Number(riskAssessment?.probabilityOfDefault || 0) > 0.05 && (
                <div className="flex items-start gap-3 p-3 bg-[#FFF8E1] border border-[#FFE082] rounded">
                  <span className="material-symbols-outlined text-[#F57F17]">warning</span>
                  <div>
                    <p className="font-body-md text-body-md font-semibold text-[#F57F17]">Elevated Default Probability</p>
                    <p className="font-body-sm text-body-sm text-[#F57F17] opacity-80">Default probability above threshold ({pd}%).</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Loan Details */}
          <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant rounded p-margin_sm">
            <h3 className="font-title-md text-title-md text-on-surface mb-4 border-b border-outline-variant pb-2">Loan Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Amount</p>
                <p className="font-data-mono text-data-mono text-on-surface font-medium">${Number(application.loanAmount).toLocaleString()}</p>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Type</p>
                <p className="font-body-sm text-on-surface">{application.loanType}</p>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Term</p>
                <p className="font-body-sm text-on-surface">{application.loanTermMonths} months</p>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Credit Score</p>
                <p className="font-data-mono text-data-mono text-on-surface font-medium">{application.creditScore}</p>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Monthly Income</p>
                <p className="font-data-mono text-data-mono text-on-surface">${Number(application.monthlyIncome).toLocaleString()}</p>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Existing Debt</p>
                <p className="font-data-mono text-data-mono text-on-surface">${Number(application.existingDebt).toLocaleString()}</p>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Purpose</p>
                <p className="font-body-sm text-on-surface">{application.purpose}</p>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">DTI Ratio</p>
                <p className="font-data-mono text-data-mono text-on-surface">
                  {decision?.debtToIncomeRatio ? `${(Number(decision.debtToIncomeRatio) * 100).toFixed(1)}%` : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Decision & Audit */}
        <div className="flex flex-col gap-gutter">
          {/* Decision Engine Output */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded p-margin_sm shadow-sm border-t-4 border-t-primary">
            <h3 className="font-title-md text-title-md text-on-surface mb-4 border-b border-outline-variant pb-2">Decision Engine Output</h3>
            <div className="mb-4">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Model Output</p>
              <div className="flex justify-between items-center bg-surface p-2 rounded border border-outline-variant">
                <span className="font-data-mono text-data-mono text-on-surface">PD: {pd}%</span>
                <span className={`bg-surface-container-high text-primary px-2 py-0.5 rounded text-data-mono font-data-mono text-xs border border-outline-variant`}>
                  {riskCategory}
                </span>
              </div>
            </div>
            <div className="mb-6">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Business Decision</p>
              <div className={`w-full text-center py-3 ${db.bg} border ${db.border} rounded`}>
                <span className={`font-headline-sm text-headline-sm ${db.text} tracking-wide font-bold`}>{db.label}</span>
              </div>
            </div>

            {/* Explanation Panel */}
            <div className="bg-surface border border-outline-variant rounded p-3">
              <h4 className="font-body-md text-body-md font-semibold text-on-surface flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-sm">psychology</span>
                Why this decision?
              </h4>
              <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
                {decision?.debtToIncomeRatio && (
                  <li className="flex justify-between border-b border-outline-variant pb-1 border-dashed">
                    <span>Debt-to-Income (DTI)</span>
                    <span className="font-data-mono font-medium text-on-surface">
                      {(Number(decision.debtToIncomeRatio) * 100).toFixed(1)}% {Number(decision.debtToIncomeRatio) <= 0.43 ? '(Pass)' : '(Fail)'}
                    </span>
                  </li>
                )}
                <li className="flex justify-between border-b border-outline-variant pb-1 border-dashed">
                  <span>Credit Score</span>
                  <span className="font-data-mono font-medium text-on-surface">{application.creditScore}</span>
                </li>
                <li className="flex justify-between">
                  <span>Default Probability</span>
                  <span className="font-data-mono font-medium text-on-surface">{pd}%</span>
                </li>
              </ul>
            </div>

            {!riskAssessment && (
              <button
                className="mt-4 w-full px-4 py-2 bg-primary text-on-primary font-label-md rounded hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                onClick={triggerRiskAssessment}
                disabled={assessing}
              >
                <span className="material-symbols-outlined text-sm">{assessing ? 'hourglass_empty' : 'play_arrow'}</span>
                {assessing ? 'Assessing...' : 'Run Risk Assessment'}
              </button>
            )}
          </div>

          {/* Audit Timeline */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded p-margin_sm flex-1">
            <h3 className="font-title-md text-title-md text-on-surface mb-4 border-b border-outline-variant pb-2">Audit Timeline</h3>
            {auditLogs.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-outline-variant mt-2">
                {auditLogs.map((log, i) => (
                  <div key={log.id} className="relative">
                    <div className={`absolute -left-6 w-2 h-2 rounded-full ring-4 ring-surface-container-lowest top-1.5 ${i === 0 ? 'bg-primary' : 'bg-outline'}`}></div>
                    <p className="font-label-md text-label-md text-on-surface-variant">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                    <p className="font-body-md text-body-md font-medium text-on-surface">{log.action}</p>
                    {log.details && (
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{log.details}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-on-surface-variant text-body-sm">
                No audit entries yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetail;
