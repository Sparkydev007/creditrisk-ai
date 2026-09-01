import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED': return 'badge-approved';
      case 'REJECTED': return 'badge-rejected';
      case 'MANUAL_REVIEW': return 'badge-review';
      default: return 'badge-pending';
    }
  };

  const getRiskBadge = (assessment) => {
    if (!assessment) return <span className="badge bg-secondary">N/A</span>;
    const category = assessment.riskCategory;
    switch (category) {
      case 'LOW': return <span className="badge bg-success">Low Risk</span>;
      case 'MEDIUM': return <span className="badge bg-warning">Medium Risk</span>;
      case 'HIGH': return <span className="badge bg-danger">High Risk</span>;
      default: return <span className="badge bg-secondary">{category}</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h4>Credit Applications</h4>
        <p>Review and manage credit applications through the decision pipeline</p>
      </div>

      <div className="d-flex justify-content-between mb-3">
        <div className="input-group" style={{ maxWidth: '300px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-outline-secondary" onClick={fetchApplications}>Search</button>
        </div>
        <button className="btn" style={{ backgroundColor: '#1a2332', color: 'white' }}>
          + New Application
        </button>
      </div>

      <div className="table-container">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Loan Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Risk</th>
              <th>Decision</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  <div className="spinner-border spinner-border-sm" role="status" />
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted">
                  No applications found
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <Link to={`/applications/${app.id}`}>#{app.id}</Link>
                  </td>
                  <td>#{app.customerId}</td>
                  <td>{app.loanType}</td>
                  <td>${Number(app.loanAmount).toLocaleString()}</td>
                  <td>
                    <span className={`badge-status ${getStatusBadgeClass(app.status)}`}>
                      {app.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{getRiskBadge(app.riskAssessment)}</td>
                  <td>
                    {app.decision ? (
                      <span className={`badge ${app.decision.outcome === 'APPROVE' ? 'bg-success' : app.decision.outcome === 'REJECT' ? 'bg-danger' : 'bg-warning'}`}>
                        {app.decision.outcome}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td style={{fontSize: '0.8rem'}}>
                    {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}
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

export default Applications;
