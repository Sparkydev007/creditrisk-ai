import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api.js';

function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await api.get(`/api/customers/${id}`);
      setCustomer(response.data);
    } catch (err) {
      console.error('Failed to fetch customer:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="empty-state">
        <h5>Customer Not Found</h5>
        <p>The requested customer could not be found.</p>
        <Link to="/customers" className="btn btn-outline-primary">Back to Customers</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h4>Customer #{customer.id}</h4>
        <p>{customer.firstName} {customer.lastName} — {customer.email}</p>
      </div>

      <div className="row">
        {/* Personal Info */}
        <div className="col-md-6 mb-4">
          <div className="card-dashboard card">
            <div className="card-header">Personal Information</div>
            <div className="card-body">
              <table className="table table-borderless mb-0">
                <tbody>
                  <tr><td className="text-muted" style={{width:'40%'}}>Full Name</td><td>{customer.firstName} {customer.lastName}</td></tr>
                  <tr><td className="text-muted">Email</td><td>{customer.email}</td></tr>
                  <tr><td className="text-muted">Phone</td><td>{customer.phone}</td></tr>
                  <tr><td className="text-muted">Date of Birth</td><td>{customer.dateOfBirth}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Employment */}
        <div className="col-md-6 mb-4">
          <div className="card-dashboard card">
            <div className="card-header">Employment Profile</div>
            <div className="card-body">
              <table className="table table-borderless mb-0">
                <tbody>
                  <tr><td className="text-muted" style={{width:'40%'}}>Employer</td><td>{customer.employerName || 'N/A'}</td></tr>
                  <tr><td className="text-muted">Job Title</td><td>{customer.jobTitle || 'N/A'}</td></tr>
                  <tr><td className="text-muted">Years Employed</td><td>{customer.employmentYears || 'N/A'}</td></tr>
                  <tr><td className="text-muted">Status</td><td>{customer.employmentStatus || 'N/A'}</td></tr>
                  <tr><td className="text-muted">Annual Income</td><td>{customer.annualIncome ? `$${Number(customer.annualIncome).toLocaleString()}` : 'N/A'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Financial */}
        <div className="col-md-6 mb-4">
          <div className="card-dashboard card">
            <div className="card-header">Financial Profile</div>
            <div className="card-body">
              <table className="table table-borderless mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted" style={{width:'40%'}}>Credit Score</td>
                    <td>
                      <span className={`badge ${customer.creditScore >= 700 ? 'bg-success' : customer.creditScore >= 650 ? 'bg-warning' : 'bg-danger'}`}>
                        {customer.creditScore || 'N/A'}
                      </span>
                    </td>
                  </tr>
                  <tr><td className="text-muted">Existing Debt</td><td>{customer.existingDebt ? `$${Number(customer.existingDebt).toLocaleString()}` : 'N/A'}</td></tr>
                  <tr><td className="text-muted">Credit Utilization</td><td>{customer.creditUtilization ? `${(Number(customer.creditUtilization) * 100).toFixed(1)}%` : 'N/A'}</td></tr>
                  <tr><td className="text-muted">Payment History</td><td>{customer.paymentHistoryScore ? `${(Number(customer.paymentHistoryScore) * 100).toFixed(1)}%` : 'N/A'}</td></tr>
                  <tr><td className="text-muted">Recent Inquiries</td><td>{customer.recentInquiries || 0}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="col-md-6 mb-4">
          <div className="card-dashboard card">
            <div className="card-header">Actions</div>
            <div className="card-body">
              <Link to="/applications" className="btn btn-outline-primary me-2">
                View Applications
              </Link>
              <button className="btn btn-outline-secondary">
                Edit Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetail;
