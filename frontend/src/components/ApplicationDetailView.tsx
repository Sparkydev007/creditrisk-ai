import React, { useState } from 'react';
import { Application } from '../types';

interface ApplicationDetailViewProps {
  application: Application;
  onProcessNext: () => void;
  onExportReport: () => void;
  onUpdateDecision?: (appId: string, newDecision: 'APPROVED' | 'REVIEW' | 'REJECTED') => void;
}

export const ApplicationDetailView: React.FC<ApplicationDetailViewProps> = ({
  application,
  onProcessNext,
  onExportReport,
  onUpdateDecision,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'risk-factors' | 'audit-log'>('overview');
  const [isProcessing, setIsProcessing] = useState(false);

  const scorePercentage = Math.min(100, Math.round((application.riskScore / 850) * 100));

  const handleDecisionChange = (decision: 'APPROVED' | 'REVIEW' | 'REJECTED') => {
    setIsProcessing(true);
    setTimeout(() => {
      if (onUpdateDecision) {
        onUpdateDecision(application.id, decision);
      }
      setIsProcessing(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-[#0b1c30] tracking-tight mb-2">
            Application #{application.id.replace('APP-', '')} - {application.customer}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 bg-[#dce9ff]/60 text-black font-mono text-[12px] font-semibold border border-[#c6c6cd] rounded">
              {application.riskTier} RISK
            </span>
            {application.decision === 'APPROVED' && (
              <span className="inline-flex items-center px-2.5 py-1 bg-[#E6F4EA] text-[#137333] font-mono text-[12px] font-bold border border-[#CEEAD6] rounded">
                APPROVED
              </span>
            )}
            {application.decision === 'REVIEW' && (
              <span className="inline-flex items-center px-2.5 py-1 bg-amber-50 text-amber-800 font-mono text-[12px] font-bold border border-amber-200 rounded">
                UNDER REVIEW
              </span>
            )}
            {application.decision === 'REJECTED' && (
              <span className="inline-flex items-center px-2.5 py-1 bg-red-50 text-red-800 font-mono text-[12px] font-bold border border-red-200 rounded">
                REJECTED
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-detail-export"
            onClick={onExportReport}
            className="px-4 py-2 border border-[#76777d] text-[#0b1c30] text-[13px] font-medium rounded hover:bg-[#eff4ff] transition-colors cursor-pointer bg-white"
          >
            Export Report
          </button>
          <button
            id="btn-process-next"
            onClick={onProcessNext}
            className="px-4 py-2 bg-black text-white text-[13px] font-medium rounded hover:bg-black/85 transition-colors cursor-pointer shadow-xs"
          >
            Process Next
          </button>
        </div>
      </div>

      {/* Sub-Nav Tabs */}
      <div className="border-b border-[#e2e8f0]">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 text-[13px] font-medium cursor-pointer border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-[#76777d] hover:text-[#0b1c30]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`py-2 text-[13px] font-medium cursor-pointer border-b-2 transition-colors ${
              activeTab === 'financials'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-[#76777d] hover:text-[#0b1c30]'
            }`}
          >
            Financials
          </button>
          <button
            onClick={() => setActiveTab('risk-factors')}
            className={`py-2 text-[13px] font-medium cursor-pointer border-b-2 transition-colors ${
              activeTab === 'risk-factors'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-[#76777d] hover:text-[#0b1c30]'
            }`}
          >
            Risk Factors
          </button>
          <button
            onClick={() => setActiveTab('audit-log')}
            className={`py-2 text-[13px] font-medium cursor-pointer border-b-2 transition-colors ${
              activeTab === 'audit-log'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-[#76777d] hover:text-[#0b1c30]'
            }`}
          >
            Audit Log
          </button>
        </nav>
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Risk Assessment Panel */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score Card */}
            <div className="bg-white border border-[#e2e8f0] rounded p-5 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-[16px] font-bold text-[#0b1c30]">Risk Score</h3>
                  <span className="material-symbols-outlined text-[#76777d] text-[18px]">info</span>
                </div>
                <p className="text-[30px] font-bold text-black mt-4">
                  {application.riskScore}{' '}
                  <span className="text-[14px] text-[#76777d] font-normal">/ 850</span>
                </p>
              </div>
              <div className="mt-6">
                <div className="h-2 w-full bg-[#e5eeff] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black transition-all duration-500"
                    style={{ width: `${scorePercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-[12px] font-medium text-[#76777d]">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>

            {/* Probability Card */}
            <div className="bg-white border border-[#e2e8f0] rounded p-5 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-[16px] font-bold text-[#0b1c30]">Probability of Default</h3>
                  <span className="material-symbols-outlined text-[#76777d] text-[18px]">analytics</span>
                </div>
                <p className="text-[30px] font-bold text-black mt-4">{application.estPD}%</p>
                <p className="text-[13px] text-[#76777d] mt-1">
                  {application.estPD < 5 ? 'Low probability' : application.estPD < 10 ? 'Moderate probability' : 'High probability'}
                </p>
              </div>
              <div className="mt-6">
                <div className="inline-flex items-center gap-1 text-[#137333] bg-[#E6F4EA] px-2 py-1 rounded font-mono text-[12px] font-bold">
                  <span className="material-symbols-outlined text-sm">trending_down</span>
                  -0.2% vs last assessment
                </div>
              </div>
            </div>

            {/* Key Risk Factors List (Full width across the 2 cols) */}
            <div className="md:col-span-2 bg-white border border-[#e2e8f0] rounded p-5 shadow-2xs">
              <h3 className="text-[16px] font-bold text-[#0b1c30] mb-4 border-b border-[#e2e8f0] pb-2">
                Key Risk Factors
              </h3>
              <div className="space-y-3">
                {application.riskFactors && application.riskFactors.length > 0 ? (
                  application.riskFactors.map((factor) => (
                    <div
                      key={factor.id}
                      className={`flex items-start gap-3 p-3.5 rounded border ${
                        factor.type === 'positive'
                          ? 'bg-[#f8f9ff] border-[#e2e8f0]'
                          : factor.type === 'warning'
                          ? 'bg-[#FFF8E1] border-[#FFE082]'
                          : 'bg-[#FFEBEE] border-[#FFCDD2]'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
                          factor.type === 'positive'
                            ? 'text-[#137333]'
                            : factor.type === 'warning'
                            ? 'text-[#F57F17]'
                            : 'text-[#C62828]'
                        }`}
                      >
                        {factor.type === 'positive' ? 'check_circle' : 'warning'}
                      </span>
                      <div>
                        <p
                          className={`text-[14px] font-semibold ${
                            factor.type === 'positive'
                              ? 'text-[#0b1c30]'
                              : factor.type === 'warning'
                              ? 'text-[#F57F17]'
                              : 'text-[#C62828]'
                          }`}
                        >
                          {factor.title}
                        </p>
                        <p
                          className={`text-[13px] ${
                            factor.type === 'positive'
                              ? 'text-[#45464d]'
                              : factor.type === 'warning'
                              ? 'text-[#F57F17] opacity-90'
                              : 'text-[#C62828] opacity-90'
                          }`}
                        >
                          {factor.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-[#76777d] text-sm">
                    No individual risk factor warnings recorded for this entity.
                  </div>
                )}
              </div>
            </div>

            {/* Underwriter Quick Action (If review or override needed) */}
            <div className="md:col-span-2 bg-[#f8f9ff] border border-[#e2e8f0] rounded p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-[#0b1c30]">Underwriter Decision Override</p>
                <p className="text-[12px] text-[#76777d]">
                  Manual override triggers dual-custody audit verification log.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={isProcessing || application.decision === 'APPROVED'}
                  onClick={() => handleDecisionChange('APPROVED')}
                  className="px-3 py-1.5 bg-[#137333] text-white text-[12px] font-bold rounded hover:bg-[#0f5c29] disabled:opacity-40 cursor-pointer"
                >
                  Approve
                </button>
                <button
                  disabled={isProcessing || application.decision === 'REVIEW'}
                  onClick={() => handleDecisionChange('REVIEW')}
                  className="px-3 py-1.5 bg-amber-600 text-white text-[12px] font-bold rounded hover:bg-amber-700 disabled:opacity-40 cursor-pointer"
                >
                  Flag Review
                </button>
                <button
                  disabled={isProcessing || application.decision === 'REJECTED'}
                  onClick={() => handleDecisionChange('REJECTED')}
                  className="px-3 py-1.5 bg-red-700 text-white text-[12px] font-bold rounded hover:bg-red-800 disabled:opacity-40 cursor-pointer"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Decision Engine Output & Audit Timeline */}
          <div className="flex flex-col gap-6">
            {/* Decision Engine Output Card */}
            <div className="bg-white border border-[#e2e8f0] rounded p-5 shadow-2xs border-t-4 border-t-black">
              <h3 className="text-[16px] font-bold text-[#0b1c30] mb-4 border-b border-[#e2e8f0] pb-2">
                Decision Engine Output
              </h3>

              {/* Model Output */}
              <div className="mb-4">
                <p className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider mb-1.5">
                  Model Output
                </p>
                <div className="flex justify-between items-center bg-[#f8f9ff] p-2.5 rounded border border-[#e2e8f0]">
                  <span className="font-mono text-[13px] font-medium text-[#0b1c30]">
                    PD: {application.estPD}%
                  </span>
                  <span className="bg-[#dce9ff] text-black px-2 py-0.5 rounded font-mono text-[11px] font-bold border border-[#c6c6cd]">
                    {application.riskTier}
                  </span>
                </div>
              </div>

              {/* Business Decision */}
              <div className="mb-6">
                <p className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider mb-1.5">
                  Business Decision
                </p>
                {application.decision === 'APPROVED' && (
                  <div className="w-full text-center py-3 bg-[#E6F4EA] border border-[#137333] rounded">
                    <span className="text-[20px] font-bold text-[#137333] tracking-wide">
                      APPROVED
                    </span>
                  </div>
                )}
                {application.decision === 'REVIEW' && (
                  <div className="w-full text-center py-3 bg-amber-50 border border-amber-500 rounded">
                    <span className="text-[20px] font-bold text-amber-800 tracking-wide">
                      MANUAL REVIEW
                    </span>
                  </div>
                )}
                {application.decision === 'REJECTED' && (
                  <div className="w-full text-center py-3 bg-red-50 border border-red-500 rounded">
                    <span className="text-[20px] font-bold text-red-700 tracking-wide">
                      DECLINED
                    </span>
                  </div>
                )}
              </div>

              {/* Explanation Panel */}
              <div className="bg-[#f8f9ff] border border-[#e2e8f0] rounded p-3.5">
                <h4 className="text-[14px] font-semibold text-[#0b1c30] flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[18px]">psychology</span>
                  Why this decision?
                </h4>
                <ul className="space-y-2.5 text-[13px] text-[#45464d]">
                  <li className="flex justify-between border-b border-[#e2e8f0] pb-1.5 border-dashed">
                    <span>Debt-to-Income (DTI)</span>
                    <span className="font-mono font-medium text-[#0b1c30]">
                      {application.dti || 22}% (Pass)
                    </span>
                  </li>
                  <li className="flex justify-between border-b border-[#e2e8f0] pb-1.5 border-dashed">
                    <span>Employment Verification</span>
                    <span className="font-mono font-medium text-[#0b1c30]">
                      Verified
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Credit Utilization</span>
                    <span className="font-mono font-medium text-[#0b1c30]">
                      {application.creditUtilization || 14}% (Pass)
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Audit Timeline */}
            <div className="bg-white border border-[#e2e8f0] rounded p-5 flex-1 shadow-2xs">
              <h3 className="text-[16px] font-bold text-[#0b1c30] mb-4 border-b border-[#e2e8f0] pb-2">
                Audit Timeline
              </h3>
              <div className="relative pl-6 space-y-6 before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-[#c6c6cd] mt-2">
                {application.timeline ? (
                  application.timeline.map((event) => (
                    <div key={event.id} className="relative">
                      <div
                        className={`absolute -left-6 w-2.5 h-2.5 rounded-full ring-4 ring-white top-1.5 ${
                          event.isActive ? 'bg-black' : 'bg-[#76777d]'
                        }`}
                      ></div>
                      <p className="text-[11px] font-medium text-[#76777d]">{event.timestamp}</p>
                      <p className="text-[13px] font-semibold text-[#0b1c30]">{event.title}</p>
                      {event.description && (
                        <p className="text-[12px] text-[#76777d]">{event.description}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="relative">
                      <div className="absolute -left-6 w-2.5 h-2.5 bg-black rounded-full ring-4 ring-white top-1.5"></div>
                      <p className="text-[11px] font-medium text-[#76777d]">Today, 10:42 AM</p>
                      <p className="text-[13px] font-semibold text-[#0b1c30]">Approval Logged</p>
                      <p className="text-[12px] text-[#76777d]">System auto-approved based on ruleset V2.4</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-6 w-2.5 h-2.5 bg-[#76777d] rounded-full ring-4 ring-white top-1.5"></div>
                      <p className="text-[11px] font-medium text-[#76777d]">Today, 10:41 AM</p>
                      <p className="text-[13px] font-semibold text-[#0b1c30]">Decision Engine Complete</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-6 w-2.5 h-2.5 bg-[#76777d] rounded-full ring-4 ring-white top-1.5"></div>
                      <p className="text-[11px] font-medium text-[#76777d]">Today, 10:40 AM</p>
                      <p className="text-[13px] font-semibold text-[#0b1c30]">Risk Assessment Running</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-6 w-2.5 h-2.5 bg-[#76777d] rounded-full ring-4 ring-white top-1.5"></div>
                      <p className="text-[11px] font-medium text-[#76777d]">Today, 10:35 AM</p>
                      <p className="text-[13px] font-semibold text-[#0b1c30]">Application Submitted</p>
                      <p className="text-[12px] text-[#76777d]">Via Partner Portal</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Financials */}
      {activeTab === 'financials' && (
        <div className="bg-white border border-[#e2e8f0] rounded p-6 shadow-2xs space-y-6">
          <div className="border-b border-[#e2e8f0] pb-4">
            <h3 className="text-[18px] font-bold text-[#0b1c30]">Financial Statement Analysis</h3>
            <p className="text-[13px] text-[#76777d]">Verified statements ingested via Open Banking API & tax transcripts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-[#f8f9ff] border border-[#e2e8f0] rounded">
              <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider">Annual Income / Revenue</span>
              <p className="text-[24px] font-bold text-[#0b1c30] mt-1">
                ${(application.annualIncome || 185000).toLocaleString()}
              </p>
              <p className="text-[12px] text-emerald-700 mt-1 font-medium">Verified by W2 & Tax transcripts</p>
            </div>
            <div className="p-4 bg-[#f8f9ff] border border-[#e2e8f0] rounded">
              <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider">Total Existing Debt</span>
              <p className="text-[24px] font-bold text-[#0b1c30] mt-1">
                ${(application.existingDebt || 40700).toLocaleString()}
              </p>
              <p className="text-[12px] text-[#76777d] mt-1 font-medium">DTI Ratio: {application.dti || 22}%</p>
            </div>
            <div className="p-4 bg-[#f8f9ff] border border-[#e2e8f0] rounded">
              <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider">Requested Facility</span>
              <p className="text-[24px] font-bold text-[#0b1c30] mt-1">
                ${application.amount.toLocaleString()}
              </p>
              <p className="text-[12px] text-[#76777d] mt-1 font-medium">{application.requestedFacility || "Revolving Credit Line"}</p>
            </div>
          </div>

          <div className="border border-[#e2e8f0] rounded overflow-hidden">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[11px] uppercase tracking-wider font-bold text-[#76777d]">
                <tr>
                  <th className="py-3 px-4">Financial Indicator</th>
                  <th className="py-3 px-4">Observed Metric</th>
                  <th className="py-3 px-4">Policy Requirement</th>
                  <th className="py-3 px-4">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-[#0b1c30]">
                <tr>
                  <td className="py-3 px-4 font-medium">Debt-to-Income (DTI)</td>
                  <td className="py-3 px-4 font-mono">{application.dti || 22}%</td>
                  <td className="py-3 px-4 font-mono">&lt; 43.0%</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">PASS</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Revolving Utilization</td>
                  <td className="py-3 px-4 font-mono">{application.creditUtilization || 14}%</td>
                  <td className="py-3 px-4 font-mono">&lt; 30.0%</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">PASS</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Annual Income Benchmark</td>
                  <td className="py-3 px-4 font-mono">${(application.annualIncome || 185000).toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono">&gt; $35,000</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">PASS</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Liquidity Buffer</td>
                  <td className="py-3 px-4 font-mono">8.4 Months Operating Expenses</td>
                  <td className="py-3 px-4 font-mono">&gt; 3.0 Months</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">PASS</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Risk Factors */}
      {activeTab === 'risk-factors' && (
        <div className="bg-white border border-[#e2e8f0] rounded p-6 shadow-2xs space-y-6">
          <div className="border-b border-[#e2e8f0] pb-4">
            <h3 className="text-[18px] font-bold text-[#0b1c30]">Comprehensive Risk Vector Model</h3>
            <p className="text-[13px] text-[#76777d]">Weighted scoring breakdown across standardized Basel III risk vectors.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-[#e2e8f0] rounded bg-[#f8f9ff]">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-[14px]">Historical Repayment (35% Weight)</span>
                <span className="text-emerald-700 font-mono font-bold">98 / 100</span>
              </div>
              <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-[98%]"></div>
              </div>
              <p className="text-[12px] text-[#76777d] mt-2">Zero 30+ day delinquencies recorded across 48 months.</p>
            </div>

            <div className="p-4 border border-[#e2e8f0] rounded bg-[#f8f9ff]">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-[14px]">Capacity & Leverage (30% Weight)</span>
                <span className="text-emerald-700 font-mono font-bold">91 / 100</span>
              </div>
              <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-[91%]"></div>
              </div>
              <p className="text-[12px] text-[#76777d] mt-2">Low debt burden with ample debt-service coverage buffer.</p>
            </div>

            <div className="p-4 border border-[#e2e8f0] rounded bg-[#f8f9ff]">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-[14px]">Credit Age & Depth (15% Weight)</span>
                <span className="text-emerald-700 font-mono font-bold">88 / 100</span>
              </div>
              <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-[88%]"></div>
              </div>
              <p className="text-[12px] text-[#76777d] mt-2">Oldest established trade line active for 11.2 years.</p>
            </div>

            <div className="p-4 border border-[#e2e8f0] rounded bg-[#f8f9ff]">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-[14px]">Recent Inquiries (10% Weight)</span>
                <span className="text-amber-700 font-mono font-bold">72 / 100</span>
              </div>
              <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[72%]"></div>
              </div>
              <p className="text-[12px] text-amber-800 mt-2">3 hard inquiries flagged in trailing 6 months (Warning tier).</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Audit Log */}
      {activeTab === 'audit-log' && (
        <div className="bg-white border border-[#e2e8f0] rounded p-6 shadow-2xs space-y-4">
          <div className="border-b border-[#e2e8f0] pb-4 flex justify-between items-center">
            <div>
              <h3 className="text-[18px] font-bold text-[#0b1c30]">System Audit & Compliance Log</h3>
              <p className="text-[13px] text-[#76777d]">Cryptographically verifiable event sequence for regulatory oversight.</p>
            </div>
            <span className="text-[12px] font-mono text-[#76777d] bg-[#f8f9ff] px-2 py-1 rounded border border-[#e2e8f0]">
              Audit Hash: 0x8F4E2...A79B
            </span>
          </div>

          <div className="border border-[#e2e8f0] rounded overflow-hidden">
            <table className="w-full text-left text-[13px] font-mono">
              <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[11px] uppercase tracking-wider text-[#76777d]">
                <tr>
                  <th className="py-2.5 px-4">Event Timestamp (UTC)</th>
                  <th className="py-2.5 px-4">Actor</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-[#0b1c30]">
                <tr>
                  <td className="py-2.5 px-4 text-[#76777d]">2023-10-27 10:42:01</td>
                  <td className="py-2.5 px-4">DecisionEngine:v2.4.1</td>
                  <td className="py-2.5 px-4 font-sans font-medium">Automated Underwrite Signed</td>
                  <td className="py-2.5 px-4 text-emerald-700 font-bold">APPROVED</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#76777d]">2023-10-27 10:41:14</td>
                  <td className="py-2.5 px-4">ML_Inference_Service</td>
                  <td className="py-2.5 px-4 font-sans font-medium">PD Estimate Computed (4.3%)</td>
                  <td className="py-2.5 px-4 text-blue-700 font-bold">SUCCESS</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#76777d]">2023-10-27 10:40:02</td>
                  <td className="py-2.5 px-4">Risk_Pipeline_Worker_04</td>
                  <td className="py-2.5 px-4 font-sans font-medium">Bureau Ingest & Fraud Scan</td>
                  <td className="py-2.5 px-4 text-emerald-700 font-bold">CLEARED</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#76777d]">2023-10-27 10:35:10</td>
                  <td className="py-2.5 px-4">Partner_API:client_881</td>
                  <td className="py-2.5 px-4 font-sans font-medium">Application Ingestion Post</td>
                  <td className="py-2.5 px-4 text-emerald-700 font-bold">RECEIVED</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
