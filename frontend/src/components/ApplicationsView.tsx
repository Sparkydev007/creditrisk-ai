import React, { useState, useMemo } from 'react';
import { Application, RiskTier, DecisionStatus } from '../types';

interface ApplicationsViewProps {
  applications: Application[];
  onSelectApplication: (id: string) => void;
  onOpenNewApplication: () => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  onSelectApplication,
  onOpenNewApplication,
}) => {
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [decisionFilter, setDecisionFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('Last 30 Days');
  const [sortField, setSortField] = useState<keyof Application>('submittedAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Filter & sort
  const filteredApps = useMemo(() => {
    return applications
      .filter((app) => {
        if (riskFilter !== 'all') {
          if (riskFilter === 'low' && app.riskTier !== 'LOW') return false;
          if (riskFilter === 'medium' && app.riskTier !== 'MEDIUM') return false;
          if (riskFilter === 'high' && app.riskTier !== 'HIGH') return false;
        }
        if (decisionFilter !== 'all') {
          if (decisionFilter === 'approved' && app.decision !== 'APPROVED') return false;
          if (decisionFilter === 'review' && app.decision !== 'REVIEW') return false;
          if (decisionFilter === 'rejected' && app.decision !== 'REJECTED') return false;
        }
        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [applications, riskFilter, decisionFilter, sortField, sortAsc]);

  const totalResults = 248; // Preserving exact enterprise count from mockup
  const displayedApps = filteredApps.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSort = (field: keyof Application) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["App ID,Customer,Exposure Amt,Risk Score,Est PD,Workflow Status,Decision,Submitted"]
        .concat(
          filteredApps.map(
            (a) =>
              `${a.id},"${a.customer}",${a.amount},${a.riskScore},${a.estPD}%,${a.workflowStatus},${a.decision},${a.submittedAt}`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `applications_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[30px] font-bold text-[#0b1c30] tracking-tight">Applications</h2>
          <p className="text-[14px] text-[#76777d] mt-1">
            Manage and review incoming credit applications.
          </p>
        </div>
        <button
          id="btn-new-application"
          onClick={onOpenNewApplication}
          className="bg-black text-white text-[13px] font-semibold px-4 py-2 rounded border border-black hover:bg-black/85 transition-colors flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Application
        </button>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white border border-[#e2e8f0] p-4 rounded-t flex flex-wrap gap-4 items-center justify-between shadow-2xs">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Risk Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-[#76777d] uppercase tracking-wider mb-1">
              Risk Tier
            </label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-white border border-[#c6c6cd] text-[13px] text-[#0b1c30] rounded px-3 py-1.5 focus:border-black focus:ring-1 focus:ring-black min-w-[130px]"
            >
              <option value="all">All Tiers</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>

          {/* Decision Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-[#76777d] uppercase tracking-wider mb-1">
              Decision Status
            </label>
            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="bg-white border border-[#c6c6cd] text-[13px] text-[#0b1c30] rounded px-3 py-1.5 focus:border-black focus:ring-1 focus:ring-black min-w-[140px]"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="review">Manual Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-[#76777d] uppercase tracking-wider mb-1">
              Date Range
            </label>
            <div className="flex items-center bg-white border border-[#c6c6cd] rounded px-3 py-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#76777d] mr-2">
                calendar_today
              </span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent border-none p-0 text-[13px] text-[#0b1c30] focus:ring-0 focus:outline-none cursor-pointer"
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
                <option value="Year to Date">Year to Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Actions */}
        <div className="flex gap-2 self-end">
          <button
            onClick={handleExportCSV}
            title="Download CSV"
            className="p-2 border border-[#c6c6cd] rounded text-[#515f74] hover:bg-[#eff4ff] hover:text-black transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
          </button>
          <button
            onClick={() => {
              setRiskFilter('all');
              setDecisionFilter('all');
            }}
            title="Reset Filters"
            className="p-2 border border-[#c6c6cd] rounded text-[#515f74] hover:bg-[#eff4ff] hover:text-black transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-t-0 border-[#e2e8f0] rounded-b overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8f9ff]">
                <th
                  onClick={() => toggleSort('id')}
                  className="py-3 px-4 text-[11px] font-semibold text-[#76777d] uppercase tracking-wider cursor-pointer hover:bg-[#e5eeff] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    App ID
                    <span className="material-symbols-outlined text-[14px]">
                      {sortField === 'id' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('customer')}
                  className="py-3 px-4 text-[11px] font-semibold text-[#76777d] uppercase tracking-wider cursor-pointer hover:bg-[#e5eeff] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Customer Entity
                    <span className="material-symbols-outlined text-[14px]">
                      {sortField === 'customer' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('amount')}
                  className="py-3 px-4 text-[11px] font-semibold text-[#76777d] uppercase tracking-wider text-right cursor-pointer hover:bg-[#e5eeff] transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Exposure Amt
                    <span className="material-symbols-outlined text-[14px]">
                      {sortField === 'amount' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('riskScore')}
                  className="py-3 px-4 text-[11px] font-semibold text-[#76777d] uppercase tracking-wider text-right cursor-pointer hover:bg-[#e5eeff] transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Risk Score
                    <span className="material-symbols-outlined text-[14px]">
                      {sortField === 'riskScore' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                    </span>
                  </div>
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-[#76777d] uppercase tracking-wider text-right">
                  Est. PD
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-[#76777d] uppercase tracking-wider">
                  Workflow Status
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-[#76777d] uppercase tracking-wider">
                  System Decision
                </th>
                <th
                  onClick={() => toggleSort('submittedAt')}
                  className="py-3 px-4 text-[11px] font-semibold text-[#76777d] uppercase tracking-wider cursor-pointer hover:bg-[#e5eeff] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Submitted
                    <span className="material-symbols-outlined text-[14px]">
                      {sortField === 'submittedAt' ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[13px] text-[#0b1c30]">
              {displayedApps.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => onSelectApplication(app.id)}
                  className="hover:bg-[#eff4ff]/70 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono font-medium text-black">
                    {app.id}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#0b1c30]">
                    {app.customer}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium">
                    ${app.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold">
                    <span
                      className={`inline-block px-2 py-0.5 rounded ${
                        app.riskScore >= 700
                          ? 'text-emerald-700 bg-emerald-50'
                          : app.riskScore >= 550
                          ? 'text-amber-700 bg-amber-50'
                          : 'text-red-700 bg-red-50'
                      }`}
                    >
                      {app.riskScore}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#45464d]">
                    {app.estPD}%
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#dce9ff]/60 text-[#0b1c30] border border-[#c6c6cd]">
                      {app.workflowStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {app.decision === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        APPROVED
                      </span>
                    )}
                    {app.decision === 'REVIEW' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        REVIEW
                      </span>
                    )}
                    {app.decision === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200">
                        <span className="material-symbols-outlined text-[13px]">cancel</span>
                        REJECTED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[#76777d] font-mono text-[12px]">
                    {app.submittedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-[#e2e8f0] bg-[#f8f9ff] px-4 py-3 flex items-center justify-between">
          <div className="text-[13px] text-[#76777d]">
            Showing <span className="font-semibold text-[#0b1c30]">1</span> to{' '}
            <span className="font-semibold text-[#0b1c30]">{displayedApps.length}</span> of{' '}
            <span className="font-semibold text-[#0b1c30]">{totalResults}</span> results
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1 border border-[#c6c6cd] rounded text-[#76777d] hover:bg-[#e5eeff] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 flex items-center justify-center text-[12px] font-bold rounded ${
                currentPage === 1
                  ? 'bg-black text-white border border-black'
                  : 'bg-white text-[#0b1c30] border border-[#c6c6cd] hover:bg-[#e5eeff]'
              }`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-8 h-8 flex items-center justify-center text-[12px] font-bold rounded ${
                currentPage === 2
                  ? 'bg-black text-white border border-black'
                  : 'bg-white text-[#0b1c30] border border-[#c6c6cd] hover:bg-[#e5eeff]'
              }`}
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(3)}
              className={`w-8 h-8 flex items-center justify-center text-[12px] font-bold rounded ${
                currentPage === 3
                  ? 'bg-black text-white border border-black'
                  : 'bg-white text-[#0b1c30] border border-[#c6c6cd] hover:bg-[#e5eeff]'
              }`}
            >
              3
            </button>
            <span className="px-2 text-[#76777d]">...</span>
            <button
              onClick={() => setCurrentPage(12)}
              className={`w-8 h-8 flex items-center justify-center text-[12px] font-bold rounded ${
                currentPage === 12
                  ? 'bg-black text-white border border-black'
                  : 'bg-white text-[#0b1c30] border border-[#c6c6cd] hover:bg-[#e5eeff]'
              }`}
            >
              12
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(12, currentPage + 1))}
              className="p-1 border border-[#c6c6cd] rounded text-[#76777d] hover:bg-[#e5eeff] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
