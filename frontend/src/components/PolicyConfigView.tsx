import React, { useState } from 'react';
import { PolicyRule } from '../types';

interface PolicyConfigViewProps {
  policies: PolicyRule[];
  onSavePolicies: (updated: PolicyRule[]) => void;
  onDiscardPolicies: () => void;
}

export const PolicyConfigView: React.FC<PolicyConfigViewProps> = ({
  policies,
  onSavePolicies,
  onDiscardPolicies,
}) => {
  // Local editable state
  const [currentValues, setCurrentValues] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    policies.forEach((p) => {
      map[p.id] = p.currentValue;
    });
    return map;
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Compute number of pending changes compared to initial policies prop
  const pendingChangesCount = policies.filter(
    (p) => currentValues[p.id] !== undefined && currentValues[p.id] !== p.currentValue
  ).length;

  const handleInputChange = (id: string, value: number) => {
    setCurrentValues((prev) => ({
      ...prev,
      [id]: isNaN(value) ? 0 : value,
    }));
  };

  const handleSave = () => {
    const updatedPolicies = policies.map((p) => ({
      ...p,
      previousValue: currentValues[p.id] !== p.currentValue ? p.currentValue : p.previousValue,
      currentValue: currentValues[p.id] !== undefined ? currentValues[p.id] : p.currentValue,
      metaDate: 'Just now',
      metaAuthor: 'Prathmesh Bunde',
    }));
    onSavePolicies(updatedPolicies);
    setNotification('Changes submitted for Dual-Authorization. Changes staged to Production.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDiscard = () => {
    const map: Record<string, number> = {};
    policies.forEach((p) => {
      map[p.id] = p.currentValue;
    });
    setCurrentValues(map);
    onDiscardPolicies();
    setNotification('Staged changes discarded.');
    setTimeout(() => setNotification(null), 3000);
  };

  // Group policies by category
  const scorePolicies = policies.filter((p) => p.category === 'score');
  const financialPolicies = policies.filter((p) => p.category === 'financial');
  const automatedPolicies = policies.filter((p) => p.category === 'automated');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-[28px] font-bold text-[#0b1c30] tracking-tight">
          Global Decisioning Policies
        </h2>
        <p className="text-[14px] text-[#76777d] mt-1 max-w-4xl">
          Manage core risk thresholds and automated decisioning parameters. Changes made here apply
          globally to all new credit applications and require dual-authorization for deployment to
          production.
        </p>
      </div>

      {/* Notification banner */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-700">check_circle</span>
            <span className="text-[13px] font-semibold">{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Grid Layout: 2 Columns Rules + 1 Column Publish Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Policy Sections */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Credit Score Thresholds */}
          <div className="bg-white border border-[#e2e8f0] rounded p-6 shadow-2xs">
            <div className="border-b border-[#e2e8f0] pb-4 mb-5">
              <h3 className="text-[16px] font-bold text-[#0b1c30]">Credit Score Thresholds</h3>
              <p className="text-[13px] text-[#76777d]">
                Define automated cutoffs for credit bureau baseline scores.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {scorePolicies.map((rule) => {
                const val = currentValues[rule.id] ?? rule.currentValue;
                const isModified = val !== rule.currentValue;
                return (
                  <div key={rule.id}>
                    <label className="block text-[13px] font-medium text-[#0b1c30] mb-2">
                      {rule.name}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={val}
                        step={rule.step || 1}
                        onChange={(e) => handleInputChange(rule.id, parseFloat(e.target.value))}
                        className={`w-full bg-[#f8f9ff] border text-[13px] font-mono rounded px-3 py-2 text-[#0b1c30] focus:bg-white focus:outline-none focus:border-black ${
                          isModified ? 'border-amber-500 bg-amber-50/40 font-bold' : 'border-[#c6c6cd]'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#76777d] mt-1.5 font-mono">
                      <span>Previous: {rule.previousValue}</span>
                      <span>
                        {rule.metaDate} {rule.metaAuthor}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Financial Ratios */}
          <div className="bg-white border border-[#e2e8f0] rounded p-6 shadow-2xs">
            <div className="border-b border-[#e2e8f0] pb-4 mb-5">
              <h3 className="text-[16px] font-bold text-[#0b1c30]">Financial Ratios</h3>
              <p className="text-[13px] text-[#76777d]">
                Debt and income limits for portfolio exposure.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {financialPolicies.map((rule) => {
                const val = currentValues[rule.id] ?? rule.currentValue;
                const isModified = val !== rule.currentValue;
                return (
                  <div key={rule.id}>
                    <label className="block text-[13px] font-medium text-[#0b1c30] mb-2">
                      {rule.name}
                    </label>
                    <div className="relative flex items-center">
                      {rule.prefix && (
                        <span className="absolute left-3 text-[#76777d] text-[13px] font-mono">
                          {rule.prefix}
                        </span>
                      )}
                      <input
                        type="number"
                        value={val}
                        step={rule.step || 1}
                        onChange={(e) => handleInputChange(rule.id, parseFloat(e.target.value))}
                        className={`w-full bg-[#f8f9ff] border text-[13px] font-mono rounded px-3 py-2 text-[#0b1c30] focus:bg-white focus:outline-none focus:border-black ${
                          rule.prefix ? 'pl-7' : ''
                        } ${rule.unit ? 'pr-8' : ''} ${
                          isModified ? 'border-amber-500 bg-amber-50/40 font-bold' : 'border-[#c6c6cd]'
                        }`}
                      />
                      {rule.unit && (
                        <span className="absolute right-3 text-[#76777d] text-[13px] font-mono">
                          {rule.unit}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between text-[11px] text-[#76777d] mt-1.5 font-mono">
                      <span>
                        Previous: {rule.prefix || ''}
                        {rule.previousValue.toLocaleString()}
                        {rule.unit || ''}
                      </span>
                      <span>
                        {rule.metaDate} {rule.metaAuthor}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Automated Decisioning Rules */}
          <div className="bg-white border border-[#e2e8f0] rounded p-6 shadow-2xs">
            <div className="border-b border-[#e2e8f0] pb-4 mb-5">
              <h3 className="text-[16px] font-bold text-[#0b1c30]">
                Automated Decisioning Rules
              </h3>
              <p className="text-[13px] text-[#76777d]">
                Machine learning confidence thresholds for straight-through processing.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {automatedPolicies.map((rule) => {
                const val = currentValues[rule.id] ?? rule.currentValue;
                const isModified = val !== rule.currentValue;
                return (
                  <div key={rule.id}>
                    <label className="block text-[13px] font-medium text-[#0b1c30] mb-2">
                      {rule.name}
                    </label>
                    <input
                      type="number"
                      value={val}
                      step={rule.step || 0.01}
                      onChange={(e) => handleInputChange(rule.id, parseFloat(e.target.value))}
                      className={`w-full bg-[#f8f9ff] border text-[13px] font-mono rounded px-3 py-2 text-[#0b1c30] focus:bg-white focus:outline-none focus:border-black ${
                        isModified ? 'border-amber-500 bg-amber-50/40 font-bold' : 'border-[#c6c6cd]'
                      }`}
                    />
                    <div className="flex justify-between text-[11px] text-[#76777d] mt-1.5 font-mono">
                      <span>Previous: {rule.previousValue}</span>
                      <span>
                        {rule.metaDate} {rule.metaAuthor}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Publish Changes Card */}
        <div className="space-y-6">
          <div className="bg-white border border-[#e2e8f0] rounded p-6 shadow-2xs sticky top-24">
            <h3 className="text-[16px] font-bold text-[#0b1c30] mb-1">Publish Changes</h3>
            <p className="text-[13px] text-[#76777d] mb-4">Review modifications before deployment.</p>

            {/* Warning Callout Box */}
            <div className="bg-[#fff8e1] border-l-4 border-l-[#ffb300] border border-[#ffecb3] p-4 rounded-r mb-6 text-[12px] text-[#0b1c30]">
              <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-900">
                <span className="material-symbols-outlined text-[18px] text-amber-700">warning</span>
                Financial Impact Warning
              </div>
              <p className="text-[#515f74] leading-relaxed">
                Altering these thresholds will immediately impact automated decisioning rates.
                Historical simulation suggests a 4.2% increase in manual review volume based on pending
                changes.
              </p>
            </div>

            {/* Pending Changes Summary */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-[13px] border-b border-[#e2e8f0] pb-2">
                <span className="text-[#76777d]">Pending Changes:</span>
                <span className={`font-mono font-bold ${pendingChangesCount > 0 ? 'text-amber-700' : 'text-[#0b1c30]'}`}>
                  {pendingChangesCount} parameter{pendingChangesCount === 1 ? '' : 's'}
                </span>
              </div>
              <div className="flex justify-between text-[13px] border-b border-[#e2e8f0] pb-2">
                <span className="text-[#76777d]">Target Environment:</span>
                <span className="font-mono text-[#0b1c30] font-semibold">Production</span>
              </div>
              <div className="flex justify-between text-[13px] border-b border-[#e2e8f0] pb-2">
                <span className="text-[#76777d]">Dual-Auth Required:</span>
                <span className="font-mono text-emerald-700 font-semibold">Yes (Active)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                id="btn-save-request-approval"
                onClick={handleSave}
                disabled={pendingChangesCount === 0}
                className="w-full bg-black text-white text-[13px] font-semibold py-2.5 rounded hover:bg-black/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
              >
                Save & Request Approval
              </button>
              <button
                id="btn-discard-changes"
                onClick={handleDiscard}
                disabled={pendingChangesCount === 0}
                className="w-full bg-transparent border border-[#76777d] text-[#0b1c30] text-[13px] font-semibold py-2.5 rounded hover:bg-[#eff4ff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
