import React, { useState, useEffect } from 'react';
import api from '../api.js';

function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityType, setEntityType] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page, entityType]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/audit', {
        params: { page, size: 50, entityType: entityType || undefined }
      });
      setLogs(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    if (action.includes('APPROVED') || action.includes('COMPLETED')) return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' };
    if (action.includes('REJECTED') || action.includes('FAILED')) return { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' };
    if (action.includes('SUBMITTED') || action.includes('CREATED')) return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' };
    if (action.includes('REVIEW')) return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
    return { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', border: 'border-outline-variant' };
  };

  return (
    <div className="p-margin_md max-w-container_max_width mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Audit Log</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Complete audit trail of all system events and actions.</p>
        </div>
        <button className="px-4 py-2 border border-outline-variant rounded font-label-md text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2" onClick={fetchLogs}>
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-4 items-center">
        <div className="flex flex-col">
          <label className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider text-[10px]">Event Type</label>
          <select
            className="bg-surface-container-lowest border border-outline-variant font-body-sm text-body-sm text-on-surface rounded px-3 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary min-w-[180px]"
            value={entityType}
            onChange={(e) => { setEntityType(e.target.value); setPage(0); }}
          >
            <option value="">All Events</option>
            <option value="CreditApplication">Applications</option>
            <option value="RiskAssessment">Risk Assessments</option>
            <option value="Decision">Decisions</option>
            <option value="Customer">Customers</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse data-table whitespace-nowrap">
            <thead>
              <tr className="border-b border-outline-variant bg-surface">
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Event</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Entity</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">ID</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Service</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-on-surface-variant">Loading audit logs...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-on-surface-variant">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-2.5 px-4 text-on-surface-variant font-data-mono whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${badge.bg} ${badge.text} border ${badge.border}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">{log.entityType}</td>
                      <td className="py-2.5 px-4 font-data-mono text-primary">#{log.entityId}</td>
                      <td className="py-2.5 px-4 text-on-surface-variant">{log.service || '—'}</td>
                      <td className="py-2.5 px-4 text-on-surface-variant max-w-[300px] truncate" title={log.details}>
                        {log.details || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-outline-variant bg-surface-bright px-4 py-3 flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                className="p-1 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-50"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center font-label-md text-label-md bg-primary text-on-primary rounded border border-primary">
                {page + 1}
              </button>
              <button
                className="p-1 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditLog;
