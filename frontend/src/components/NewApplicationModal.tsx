import React, { useState } from 'react';
import { Application, PolicyRule } from '../types';

interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newApp: Application) => void;
  policies: PolicyRule[];
}

export const NewApplicationModal: React.FC<NewApplicationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  policies,
}) => {
  const [customer, setCustomer] = useState('');
  const [sector, setSector] = useState('Technology & Software');
  const [amount, setAmount] = useState<number>(500000);
  const [creditScore, setCreditScore] = useState<number>(720);
  const [annualIncome, setAnnualIncome] = useState<number>(250000);
  const [existingDebt, setExistingDebt] = useState<number>(45000);
  const [utilization, setUtilization] = useState<number>(18);

  if (!isOpen) return null;

  // Active policy thresholds
  const minFico = policies.find((p) => p.name.includes('Minimum FICO'))?.currentValue || 620;
  const primeThreshold = policies.find((p) => p.name.includes('Prime Approval'))?.currentValue || 740;
  const maxDti = policies.find((p) => p.name.includes('Maximum DTI'))?.currentValue || 0.43;

  const dti = annualIncome > 0 ? Math.round((existingDebt / annualIncome) * 100) : 0;
  const dtiRatio = dti / 100;

  // Real-time Decision Simulation
  let simulatedDecision: 'APPROVED' | 'REVIEW' | 'REJECTED' = 'APPROVED';
  let riskTier: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let estPD = 3.2;

  if (creditScore < minFico || dtiRatio > maxDti) {
    simulatedDecision = 'REJECTED';
    riskTier = 'HIGH';
    estPD = 16.5;
  } else if (creditScore < primeThreshold || dtiRatio > maxDti * 0.85 || amount > 2000000) {
    simulatedDecision = 'REVIEW';
    riskTier = 'MEDIUM';
    estPD = 7.1;
  } else {
    simulatedDecision = 'APPROVED';
    riskTier = 'LOW';
    estPD = 2.4;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim()) return;

    const newId = `APP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApp: Application = {
      id: newId,
      customer: customer.trim(),
      applicantName: customer.trim(),
      applicantRole: 'Authorized Signer',
      sector,
      amount,
      riskScore: creditScore,
      estPD,
      workflowStatus: simulatedDecision === 'REVIEW' ? 'IN PROGRESS' : 'COMPLETED',
      decision: simulatedDecision,
      riskTier,
      submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      submittedFormatted: 'Just now',
      dti,
      creditUtilization: utilization,
      annualIncome,
      existingDebt,
      requestedFacility: 'Commercial Credit Facility',
      riskFactors: [
        {
          id: 'rf-new-1',
          type: simulatedDecision === 'APPROVED' ? 'positive' : simulatedDecision === 'REVIEW' ? 'warning' : 'negative',
          title: simulatedDecision === 'APPROVED' ? 'Prime Risk Tier' : simulatedDecision === 'REVIEW' ? 'Manual Underwriter Review Required' : 'Policy Threshold Exception',
          description: `Credit score: ${creditScore}, DTI: ${dti}%, Requested: $${amount.toLocaleString()}`,
        },
      ],
      rationales: [
        { metric: 'Debt-to-Income (DTI)', value: `${dti}% (${dtiRatio <= maxDti ? 'Pass' : 'Fail'})`, status: dtiRatio <= maxDti ? 'Pass' : 'Fail' },
        { metric: 'Minimum FICO', value: `${creditScore} (${creditScore >= minFico ? 'Pass' : 'Fail'})`, status: creditScore >= minFico ? 'Pass' : 'Fail' },
        { metric: 'Credit Utilization', value: `${utilization}% (${utilization <= 30 ? 'Pass' : 'Warning'})`, status: utilization <= 30 ? 'Pass' : 'Warning' },
      ],
      timeline: [
        {
          id: 'tl-new-1',
          timestamp: 'Just now',
          title: simulatedDecision === 'APPROVED' ? 'Automated Approval Executed' : simulatedDecision === 'REVIEW' ? 'Queued for Underwriter Review' : 'Auto-Rejected by Policy Engine',
          description: `Scored against active policy ruleset (FICO min: ${minFico}, DTI max: ${(maxDti * 100).toFixed(0)}%)`,
          isActive: true,
        },
      ],
    };

    onSubmit(newApp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#e2e8f0] rounded-lg max-w-xl w-full p-6 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-black text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">add_task</span>
            </span>
            <div>
              <h3 className="text-[18px] font-bold text-[#0b1c30]">New Credit Application</h3>
              <p className="text-[12px] text-[#76777d]">Simulate live credit scoring against current policy thresholds</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#76777d] hover:text-black p-1">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-[#76777d] uppercase tracking-wider mb-1">
                Customer Entity Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Robotics Corp"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded px-3 py-2 text-[13px] text-[#0b1c30] focus:bg-white focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#76777d] uppercase tracking-wider mb-1">
                Industry Sector
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded px-3 py-2 text-[13px] text-[#0b1c30] focus:bg-white focus:border-black"
              >
                <option value="Technology & Software">Technology & Software</option>
                <option value="Commercial Real Estate">Commercial Real Estate</option>
                <option value="Supply Chain & Logistics">Supply Chain & Logistics</option>
                <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-[#76777d] uppercase tracking-wider mb-1">
                Exposure Amount Requested ($)
              </label>
              <input
                type="number"
                step="50000"
                min="10000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded px-3 py-2 text-[13px] font-mono text-[#0b1c30] focus:bg-white focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#76777d] uppercase tracking-wider mb-1">
                Bureau Credit Score (FICO)
              </label>
              <input
                type="number"
                min="300"
                max="850"
                value={creditScore}
                onChange={(e) => setCreditScore(Number(e.target.value))}
                className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded px-3 py-2 text-[13px] font-mono text-[#0b1c30] focus:bg-white focus:border-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#76777d] uppercase tracking-wider mb-1">
                Annual Revenue ($)
              </label>
              <input
                type="number"
                step="10000"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded px-2.5 py-1.5 text-[13px] font-mono text-[#0b1c30]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#76777d] uppercase tracking-wider mb-1">
                Existing Debt ($)
              </label>
              <input
                type="number"
                step="5000"
                value={existingDebt}
                onChange={(e) => setExistingDebt(Number(e.target.value))}
                className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded px-2.5 py-1.5 text-[13px] font-mono text-[#0b1c30]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#76777d] uppercase tracking-wider mb-1">
                Revolving Util (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={utilization}
                onChange={(e) => setUtilization(Number(e.target.value))}
                className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded px-2.5 py-1.5 text-[13px] font-mono text-[#0b1c30]"
              />
            </div>
          </div>

          {/* Real-time Decision Engine Preview */}
          <div className="p-3.5 bg-[#f8f9ff] border border-[#e2e8f0] rounded">
            <div className="flex justify-between items-center text-[12px] mb-1.5">
              <span className="font-bold text-[#76777d] uppercase tracking-wider">Live Engine Prediction</span>
              <span className="font-mono text-[#76777d]">DTI: {dti}% | Est. PD: {estPD}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#0b1c30]">Simulated Decision:</span>
              {simulatedDecision === 'APPROVED' && (
                <span className="px-2.5 py-1 rounded text-[12px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  AUTO-APPROVED (PASS)
                </span>
              )}
              {simulatedDecision === 'REVIEW' && (
                <span className="px-2.5 py-1 rounded text-[12px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  MANUAL REVIEW REQUIRED
                </span>
              )}
              {simulatedDecision === 'REJECTED' && (
                <span className="px-2.5 py-1 rounded text-[12px] font-bold bg-red-50 text-red-800 border border-red-200">
                  DECLINED (POLICY BREACH)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[#45464d] hover:text-black cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-black text-white text-[13px] font-semibold rounded hover:bg-black/85 cursor-pointer shadow-xs"
            >
              Submit & Underwrite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
