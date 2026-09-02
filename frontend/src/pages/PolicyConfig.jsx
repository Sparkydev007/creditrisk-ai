import React, { useState } from 'react';

const initialPolicies = {
  creditScore: [
    { id: 1, name: 'Minimum FICO Score', value: 620, previous: 600, date: '12 Oct 2023', author: 'J. Smith' },
    { id: 2, name: 'Prime Approval Threshold', value: 740, previous: 720, date: '05 Sep 2023', author: 'A. Chen' },
  ],
  financial: [
    { id: 3, name: 'Maximum DTI (Debt-to-Income)', value: 0.43, previous: 0.45, date: '22 Nov 2023', author: 'System', type: 'percent' },
    { id: 4, name: 'Minimum Annual Income', value: 35000, previous: 30000, date: '10 Jan 2024', author: 'R. Davis', type: 'currency' },
  ],
  automated: [
    { id: 5, name: 'Auto-Approve ML Probability', value: 0.85, previous: 0.88, date: '01 Feb 2024', author: 'Model Ops' },
    { id: 6, name: 'Auto-Reject ML Probability', value: 0.20, previous: 0.15, date: '01 Feb 2024', author: 'Model Ops' },
  ],
};

function PolicyConfig() {
  const [policies, setPolicies] = useState(initialPolicies);
  const [hasChanges, setHasChanges] = useState(false);

  const handleValueChange = (category, id, newValue) => {
    setPolicies(prev => ({
      ...prev,
      [category]: prev[category].map(p =>
        p.id === id ? { ...p, value: parseFloat(newValue) || 0 } : p
      ),
    }));
    setHasChanges(true);
  };

  const countChanges = () => {
    let changes = 0;
    Object.keys(policies).forEach(cat => {
      policies[cat].forEach(p => {
        const orig = initialPolicies[cat]?.find(o => o.id === p.id);
        if (orig && orig.value !== p.value) changes++;
      });
    });
    return changes;
  };

  const pendingChanges = countChanges();

  const formatValue = (policy) => {
    if (policy.type === 'currency') return `$${Number(policy.value).toLocaleString()}`;
    if (policy.type === 'percent') return policy.value.toFixed(2);
    if (policy.value < 1 && policy.value > 0) return policy.value.toFixed(2);
    return policy.value;
  };

  const formatPrevious = (policy) => {
    if (policy.type === 'currency') return `$${Number(policy.previous).toLocaleString()}`;
    return policy.previous;
  };

  const renderPolicyTable = (title, icon, category, items) => (
    <div className="bg-surface-container-lowest border border-outline-variant rounded">
      <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-3 bg-surface-bright rounded-t">
        <span className="material-symbols-outlined text-secondary">{icon}</span>
        <h3 className="font-title-md text-title-md text-on-surface">{title}</h3>
      </div>
      <div className="p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface border-b border-outline-variant">
              <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant w-1/3">Policy Name</th>
              <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant w-1/4">Current Value</th>
              <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant w-1/4">Previous</th>
              <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant w-auto">Meta</th>
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm">
            {items.map((policy) => (
              <tr key={policy.id} className="border-b border-outline-variant hover:bg-surface-container transition-colors group last:border-b-0">
                <td className="px-6 py-4 font-medium text-on-surface">{policy.name}</td>
                <td className="px-6 py-3">
                  <div className="relative w-28">
                    <input
                      className="w-full border border-outline-variant rounded px-3 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary font-data-mono text-data-mono bg-surface-container-lowest"
                      type="number"
                      step={policy.type === 'percent' ? '0.01' : policy.value < 1 ? '0.01' : '1'}
                      value={policy.value}
                      onChange={(e) => handleValueChange(category, policy.id, e.target.value)}
                    />
                    {policy.type === 'currency' && <span className="absolute left-1 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">$</span>}
                  </div>
                </td>
                <td className="px-6 py-4 font-data-mono text-data-mono text-on-surface-variant">{formatPrevious(policy)}</td>
                <td className="px-6 py-3 text-xs text-on-surface-variant">
                  <div className="flex flex-col">
                    <span>{policy.date}</span>
                    <span className="text-secondary">{policy.author}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-margin_md lg:p-margin_lg max-w-container_max_width mx-auto">
      <div className="mb-gutter">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Global Decisioning Policies</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
          Manage core risk thresholds and automated decisioning parameters. Changes made here apply globally to all new credit applications and require dual-authorization for deployment to production.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter">
        {/* Policy Sections */}
        <div className="xl:col-span-2 space-y-gutter">
          {renderPolicyTable('Credit Score Thresholds', 'speed', 'creditScore', policies.creditScore)}
          {renderPolicyTable('Financial Ratios', 'account_balance', 'financial', policies.financial)}
          {renderPolicyTable('Automated Decisioning Rules', 'smart_toy', 'automated', policies.automated)}
        </div>

        {/* Action Panel */}
        <div className="xl:col-span-1">
          <div className="bg-surface-container-lowest border border-outline-variant rounded sticky top-[88px]">
            <div className="p-6 border-b border-outline-variant">
              <h3 className="font-title-md text-title-md text-on-surface mb-2">Publish Changes</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Review modifications before deployment.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-error-container/20 border border-error/30 p-4 rounded">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-error mt-0.5">warning</span>
                  <div>
                    <h4 className="font-label-md text-label-md font-bold text-on-surface mb-1">Financial Impact Warning</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Altering these thresholds will immediately impact automated decisioning rates. Historical simulation suggests a <strong>4.2% increase</strong> in manual review volume based on pending changes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Pending Changes:</span>
                  <span className={`font-medium font-data-mono ${pendingChanges > 0 ? 'text-amber-600' : 'text-on-surface'}`}>
                    {pendingChanges} Policies
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Target Environment:</span>
                  <span className="font-medium text-on-surface">Production</span>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant flex flex-col gap-3">
                <button
                  className="w-full bg-primary text-on-primary font-label-md text-label-md py-2.5 px-4 rounded hover:bg-primary/90 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                  disabled={pendingChanges === 0}
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save & Request Approval
                </button>
                <button
                  className="w-full bg-transparent border border-secondary text-secondary font-label-md text-label-md py-2.5 px-4 rounded hover:bg-surface-container transition-colors disabled:opacity-50"
                  disabled={pendingChanges === 0}
                  onClick={() => {
                    setPolicies(initialPolicies);
                    setHasChanges(false);
                  }}
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PolicyConfig;
