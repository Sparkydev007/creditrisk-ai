import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api.js';

function ApplicationDetail() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);

  useEffect(() => {
    fetchApplication();
    fetchAuditLogs();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await api.get(`/api/applications/${id}`);
      setApplication(response.data);
    } catch (err) {
      console.error('Failed to fetch application:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await api.get(`/api/audit/CreditApplication/${id}`, {
        params: { page: 0, size: 50 }
      });
      setAuditLogs(response.data.content || []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  };

  const triggerRiskAssessment = async () => {
    setAssessing(true);
    try {
      await api.post(`/api/risk/assess/${id}`);
      await fetchApplication();
      await fetchAuditLogs();
    } catch (err) {
      console.error('Failed to trigger risk assessment:', err);
    } finally {
      setAssessing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="empty-state">
        <h5>Application Not Found</h5>
        <Link to="/applications" className="btn btn-outline-primary">Back to Applications</Link>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED': return 'badge-approved';
      case 'REJECTED': return 'badge-rejected';
      case 'MANUAL_REVIEW': return 'badge-review';
      default: return 'badge-pending';
    }
  };

  const riskAssessment = application.riskAssessment;
  const decision = application.decision;

  return (
    <div>
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h4>Application #{application.id}</h4>
            <p>Customer #{application.customerId} — {application.loanType} loan</p>
          </div>
          <span className={`badge-status ${getStatusBadgeClass(application.status)}`} style={{fontSize: '0.9rem', padding: '8px 16px'}}>
            {application.status?.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="row">
        {/* Loan Details */}
        <div className="col-md-6 mb-4">
          <div className="card-dashboard card">
            <div className="card-header">Loan Details</div>
            <div className="card-body">
              <table className="table table-borderless mb-0">
                <tbody>
                  <tr><td className="text-muted" style={{width:'40%'}}>Loan Amount</td><td><strong>${Number(application.loanAmount).toLocaleString()}</strong></td></tr>
                  <tr><td className="text-muted">Loan Type</td><td>{application.loanType}</td></tr>
                  <tr><td className="text-muted">Term</td><td>{application.loanTermMonths} months</td></tr>
                  <tr><td className="text-muted">Purpose</td><td>{application.purpose}</td></tr>
                  <tr><td className="text-muted">Monthly Income</td><td>${Number(application.monthlyIncome).toLocaleString()}</td></tr>
                  <tr><td className="text-muted">Existing Debt</td><td>${Number(application.existingDebt).toLocaleString()}</td></tr>
                  <tr><td className="text-muted">Credit Score</td><td>{application.creditScore}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="col-md-6 mb-4">
          <div className="card-dashboard card">
            <div className="card-header">
              Risk Assessment
              {!riskAssessment && (
                <button
                  className="btn btn-sm btn-primary float-end"
                  onClick={triggerRiskAssessment}
                  disabled={assessing}
                >
                  {assessing ? 'Assessing...' : 'Run Assessment'}
                </button>
              )}
            </div>
            <div className="card-body">
              {riskAssessment ? (
                <>
                  <div className="row text-center mb-3">
                    <div className="col-4">
                      <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#1a2332'}}>
                        {riskAssessment.riskScore}
                      </div>
                      <small className="text-muted">Risk Score</small>
                    </div>
                    <div className="col-4">
                      <div style={{fontSize: '1.5rem', fontWeight: 700, color: riskAssessment.riskCategory === 'LOW' ? '#27ae60' : riskAssessment.riskCategory === 'MEDIUM' ? '#f39c12' : '#e74c3c'}}>
                        {(Number(riskAssessment.probabilityOfDefault) * 100).toFixed(1)}%
                      </div>
                      <small className="text-muted">Default Prob.</small>
                    </div>
                    <div className="col-4">
                      <span className={`badge ${riskAssessment.riskCategory === 'LOW' ? 'bg-success' : riskAssessment.riskCategory === 'MEDIUM' ? 'bg-warning' : 'bg-danger'}`} style={{fontSize: '0.9rem'}}>
                        {riskAssessment.riskCategory}
                      </span>
                      <div><small className="text-muted">Category</small></div>
                    </div>
                  </div>
                  <div className="mt-3" style={{fontSize: '0.85rem', whiteSpace: 'pre-line', color: '#555'}}>
                    {riskAssessment.explanationJson}
                  </div>
                </>
              ) : (
                <div className="empty-state" style={{padding: '30px'}}>
                  <p className="text-muted">No risk assessment yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Decision */}
        <div className="col-md-6 mb-4">
          <div className="card-dashboard card">
            <div className="card-header">Decision</div>
            <div className="card-body">
              {decision ? (
                <>
                  <div className="text-center mb-3">
                    <span className={`badge ${decision.outcome === 'APPROVE' ? 'bg-success' : decision.outcome === 'REJECT' ? 'bg-danger' : 'bg-warning'}`} style={{fontSize: '1.2rem', padding: '10px 25px'}}>
                      {decision.outcome}
                    </span>
                  </div>
                  <div className="row text-center mb-3">
                    <div className="col-4">
                      <div style={{fontSize: '1.1rem', fontWeight: 600}}>
                        {(Number(decision.probabilityOfDefault) * 100).toFixed(1)}%
                      </div>
                      <small className="text-muted">Default Prob.</small>
                    </div>
                    <div className="col-4">
                      <div style={{fontSize: '1.1rem', fontWeight: 600}}>
                        {decision.debtToIncomeRatio ? `${(Number(decision.debtToIncomeRatio) * 100).toFixed(1)}%` : 'N/A'}
                      </div>
                      <small className="text-muted">DTI Ratio</small>
                    </div>
                    <div className="col-4">
                      <div style={{fontSize: '1.1rem', fontWeight: 600}}>
                        {decision.loanToIncomeRatio ? `${Number(decision.loanToIncomeRatio).toFixed(1)}x` : 'N/A'}
                      </div>
                      <small className="text-muted">LTI Ratio</small>
                    </div>
                  </div>
                  <div style={{fontSize: '0.85rem', whiteSpace: 'pre-line', color: '#555'}}>
                    {decision.explanationJson}
                  </div>
                </>
              ) : (
                <div className="empty-state" style={{padding: '30px'}}>
                  <p className="text-muted">No decision generated yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audit Timeline */}
        <div className="col-md-6 mb-4">
          <div className="card-dashboard card">
            <div className="card-header">Audit Trail</div>
            <div className="card-body">
              {auditLogs.length > 0 ? (
                <div className="audit-timeline">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="audit-entry">
                      <div className="timestamp">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                      <div className="action">{log.action}</div>
                      {log.details && (
                        <div style={{fontSize: '0.8rem', color: '#666', marginTop: '5px'}}>
                          {log.details}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{padding: '30px'}}>
                  <p className="text-muted">No audit entries yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetail;
