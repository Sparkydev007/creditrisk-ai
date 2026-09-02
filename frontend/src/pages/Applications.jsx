import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';

const customerNames = { 1: 'Acme Corp Ltd', 2: 'Globex Logistics', 3: 'Stark Industries', 4: 'Wayne Enterprises', 5: 'LexCorp Holdings' };

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, [page, search]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/applications', {
        params: { page, size: 20, search: search || undefined }
      });
      setApplications(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getDecisionDisplay = (app) => {
    if (app.decision?.outcome === 'APPROVE') return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: 'check_circle', label: 'APPROVED' };
    if (app.decision?.outcome === 'REJECT') return { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', icon: 'cancel', label: 'REJECTED' };
    if (app.decision?.outcome === 'MANUAL_REVIEW' || app.status === 'MANUAL_REVIEW') return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: 'schedule', label: 'REVIEW' };
    return { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', border: 'border-outline-variant', icon: 'hourglass_empty', label: app.status || 'PENDING' };
  };

  const getWorkflowStatus = (app) => {
    if (app.decision) return { bg: 'bg-surface-container-high', label: 'COMPLETED' };
    if (app.riskAssessment) return { bg: 'bg-surface-container-highest', label: 'IN PROGRESS' };
    return { bg: 'bg-surface-container-high', label: 'PENDING' };
  };

  const getRiskScoreColor = (score) => {
    if (!score) return 'text-on-surface-variant';
    if (score >= 700) return 'text-emerald-700';
    if (score >= 600) return 'text-amber-700';
    return 'text-red-700';
  };

  const filteredApps = applications.filter(app => {
    if (riskFilter !== 'all') {
      const score = app.riskAssessment?.riskScore;
      if (riskFilter === 'low' && (!score || score < 700)) return false;
      if (riskFilter === 'medium' && (!score || score < 600 || score >= 700)) return false;
      if (riskFilter === 'high' && (!score || score >= 600)) return false;
    }
    if (statusFilter !== 'all') {
      const dc = getDecisionDisplay(app);
      if (statusFilter === 'approved' && dc.label !== 'APPROVED') return false;
      if (statusFilter === 'review' && dc.label !== 'REVIEW') return false;
      if (statusFilter === 'rejected' && dc.label !== 'REJECTED') return false;
    }
    return true;
  });

  return (
    <div className="p-margin_md max-w-container_max_width mx-auto">
      {/* Page Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Applications</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage and review incoming credit applications.</p>
        </div>
        <button className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded border border-primary hover:bg-opacity-90 transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Application
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-t mb-0 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="flex flex-col">
            <label className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider text-[10px]">Risk Tier</label>
            <select
              className="bg-surface-container-lowest border border-outline-variant font-body-sm text-body-sm text-on-surface rounded px-3 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary min-w-[120px]"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="all">All Tiers</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider text-[10px]">Decision Status</label>
            <select
              className="bg-surface-container-lowest border border-outline-variant font-body-sm text-body-sm text-on-surface rounded px-3 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary min-w-[140px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="review">Manual Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider text-[10px]">Date Range</label>
            <div className="flex items-center bg-surface-container-lowest border border-outline-variant rounded px-2 py-1.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant mr-2">calendar_today</span>
              <span className="font-body-sm text-body-sm text-on-surface">Last 30 Days</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-1.5 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[20px]">download</span>
          </button>
          <button className="p-1.5 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest border border-t-0 border-outline-variant rounded-b overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse data-table whitespace-nowrap">
            <thead>
              <tr className="border-b border-outline-variant bg-surface">
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">App ID</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Customer Entity</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold text-right">Exposure Amt</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold text-right">Risk Score</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold text-right">Est. PD</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Workflow Status</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">System Decision</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-on-surface-variant">Loading applications...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-on-surface-variant">
                    No applications found
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const dc = getDecisionDisplay(app);
                  const wf = getWorkflowStatus(app);
                  const score = app.riskAssessment?.riskScore || 0;
                  const pd = app.riskAssessment?.probabilityOfDefault ? (Number(app.riskAssessment.probabilityOfDefault) * 100).toFixed(1) + '%' : '—';
                  const name = customerNames[app.customerId] || `Customer #${app.customerId}`;
                  const date = app.createdAt ? new Date(app.createdAt).toISOString().slice(0, 16).replace('T', ' ') : '—';

                  return (
                    <Link
                      key={app.id}
                      to={`/applications/${app.id}`}
                      className="hover:bg-surface-container-low transition-colors cursor-pointer group table-row"
                      style={{ textDecoration: 'none', color: 'inherit', display: 'table-row' }}
                    >
                      <td className="py-2.5 px-4 font-data-mono text-primary font-medium">{typeof app.id === 'number' && app.id < 1000 ? `APP-${app.id}` : `APP-${app.id}`}</td>
                      <td className="py-2.5 px-4 font-medium">{name}</td>
                      <td className="py-2.5 px-4 text-right font-data-mono">${Number(app.loanAmount).toLocaleString()}</td>
                      <td className={`py-2.5 px-4 text-right font-data-mono font-medium ${getRiskScoreColor(score)}`}>{score || '—'}</td>
                      <td className="py-2.5 px-4 text-right font-data-mono">{pd}</td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${wf.bg} text-on-surface-variant border border-outline-variant`}>
                          {wf.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${dc.bg} ${dc.text} border ${dc.border}`}>
                          <span className="material-symbols-outlined text-[12px]">{dc.icon}</span>
                          {dc.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-on-surface-variant font-data-mono">{date}</td>
                    </Link>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="border-t border-outline-variant bg-surface-bright px-4 py-3 flex items-center justify-between">
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            Showing <span className="font-medium text-on-surface">1</span> to <span className="font-medium text-on-surface">{filteredApps.length}</span> of <span className="font-medium text-on-surface">{filteredApps.length}</span> results
          </div>
          <div className="flex items-center gap-1">
            <button
              className="p-1 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center font-label-md text-label-md bg-primary text-on-primary rounded border border-primary">
              {page + 1}
            </button>
            {totalPages > 2 && (
              <>
                <button className="w-8 h-8 flex items-center justify-center font-label-md text-label-md bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container rounded transition-colors">
                  2
                </button>
                <button className="w-8 h-8 flex items-center justify-center font-label-md text-label-md bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container rounded transition-colors">
                  3
                </button>
              </>
            )}
            <button
              className="p-1 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container transition-colors"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Applications;
