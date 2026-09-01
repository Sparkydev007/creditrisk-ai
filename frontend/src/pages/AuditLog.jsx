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
    if (action.includes('APPROVED') || action.includes('COMPLETED')) return 'bg-success';
    if (action.includes('REJECTED') || action.includes('FAILED')) return 'bg-danger';
    if (action.includes('SUBMITTED') || action.includes('CREATED')) return 'bg-primary';
    if (action.includes('REVIEW')) return 'bg-warning';
    return 'bg-secondary';
  };

  return (
    <div>
      <div className="page-header">
        <h4>Audit Log</h4>
        <p>Complete audit trail of all system events and actions</p>
      </div>

      <div className="d-flex justify-content-between mb-3">
        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm"
            style={{width: '200px'}}
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
        <button className="btn btn-sm btn-outline-secondary" onClick={fetchLogs}>
          Refresh
        </button>
      </div>

      <div className="table-container">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Event</th>
              <th>Entity</th>
              <th>ID</th>
              <th>Service</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  <div className="spinner-border spinner-border-sm" role="status" />
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  No audit logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td style={{whiteSpace: 'nowrap', fontSize: '0.85rem'}}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.entityType}</td>
                  <td>#{log.entityId}</td>
                  <td className="text-muted">{log.service || '—'}</td>
                  <td style={{fontSize: '0.8rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {log.details || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <button
            className="btn btn-sm btn-outline-secondary me-2"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </button>
          <span className="align-self-center text-muted">
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary ms-2"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AuditLog;
