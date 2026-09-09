import React, { useState } from 'react';
import { AuditRow } from '../types';
import { relTime } from '../mockData';

interface AuditViewProps {
  auditRows?: AuditRow[];
  live?: boolean;
}

export const AuditView: React.FC<AuditViewProps> = ({ auditRows, live = false }) => {
  const [filterActor, setFilterActor] = useState('ALL');

  const auditEvents: AuditRow[] = auditRows && auditRows.length ? auditRows : [
    {
      id: 9001,
      entityId: 1024,
      entityType: 'CreditApplication',
      action: 'ApplicationApproved',
      timestamp: new Date(Date.now() - 26 * 60000).toISOString(),
      actor: "RulesEngine:v2.4.1",
      category: "DECISION",
      description: "Automated underwriting decision rendered for APP-1024 (APPROVED)",
      hash: "0x3f7a...99b2"
    },
    {
      id: 9002,
      entityId: 9022,
      entityType: 'CreditApplication',
      action: 'ApplicationUnderReview',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      actor: "Underwriter:Prathmesh_B",
      category: "OVERRIDE",
      description: "Manual risk tier review flagged for APP-9022 (Borderline DTI)",
      hash: "0x89e2...c441"
    },
    {
      id: 9003,
      entityId: 9022,
      entityType: 'PolicyRule',
      action: 'PolicyUpdated',
      timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
      actor: "PolicyAdmin:J_Smith",
      category: "POLICY_UPDATE",
      description: "Updated Prime Approval Threshold from 720 to 740. Dual-auth verified.",
      hash: "0x12d4...fa89"
    },
    {
      id: 9004,
      entityId: 9023,
      entityType: 'CreditApplication',
      action: 'ApplicationRejected',
      timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
      actor: "DecisionEngine:v2.4.1",
      category: "DECISION",
      description: "Automated rejection executed for APP-9023 (Breached FICO threshold 410 < 620)",
      hash: "0x67c1...33d0"
    },
    {
      id: 9005,
      entityId: 9022,
      entityType: 'CreditApplication',
      action: 'ApplicationUnderReview',
      actor: 'SystemSecurity',
      category: 'AUTH',
      description: 'Dual-authorization cryptographic session initialized by Executive token.',
      hash: '0x98bb...ee01',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const filtered = auditEvents.filter(e => {
    if (filterActor === 'ALL') return true;
    if (filterActor === 'DECISION') return e.category.includes('Approved') || e.category.includes('Rejected') || e.category.includes('Decision');
    if (filterActor === 'OVERRIDE') return e.category.includes('Override') || e.category.includes('Review');
    if (filterActor === 'POLICY_UPDATE') return e.category.includes('Policy');
    if (filterActor === 'AUTH') return e.category === 'AUTH';
    return e.category === filterActor;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-[#0b1c30] tracking-tight">Enterprise Audit Trail</h2>
          <p className="text-[14px] text-[#76777d] mt-1">
            Immutable regulatory audit log for all algorithmic scoring and underwriter actions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
              live ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {live ? 'LIVE AUDIT TRAIL' : 'DEMO DATA'}
          </span>
          <select
            value={filterActor}
            onChange={(e) => setFilterActor(e.target.value)}
            className="bg-white border border-[#c6c6cd] text-[13px] rounded px-3 py-1.5 text-[#0b1c30] focus:border-black"
          >
            <option value="ALL">All Categories</option>
            <option value="DECISION">Decision Engine Events</option>
            <option value="OVERRIDE">Manual Overrides</option>
            <option value="POLICY_UPDATE">Policy Updates</option>
            <option value="AUTH">Authentication Events</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white border border-[#e2e8f0] rounded overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Event Description</th>
                <th className="py-3 px-4 font-mono text-right">Verification Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[#0b1c30]">
              {filtered.map((evt) => (
                <tr key={evt.id} className="hover:bg-[#eff4ff]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[#76777d] text-[12px]">{relTime(evt.timestamp)}</td>
                  <td className="py-3.5 px-4 font-semibold text-black">{evt.actor}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#dce9ff] text-black border border-[#c6c6cd]">
                      {evt.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#45464d]">{evt.description}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-[12px] text-[#76777d]">{evt.hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
