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
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-body-sm text-on-surface-variant">Loading customer...</span>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="empty-state">
        <span className="material-symbols-outlined text-5xl text-outline mb-4">person_off</span>
        <h5>Customer Not Found</h5>
        <p>The requested customer could not be found.</p>
        <Link to="/customers" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded font-label-md hover:bg-primary/90 transition-colors no-underline">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Customers
        </Link>
      </div>
    );
  }

  const getCreditScoreBadge = (score) => {
    if (!score) return { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', label: 'N/A' };
    if (score >= 700) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: score };
    if (score >= 650) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: score };
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: score };
  };

  const cs = getCreditScoreBadge(customer.creditScore);

  return (
    <div className="p-margin_md max-w-container_max_width mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-margin_md">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
            Customer #{customer.id} — {customer.firstName} {customer.lastName}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">{customer.email}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/customers" className="px-4 py-2 border border-outline text-on-surface font-label-md text-label-md rounded hover:bg-surface-container transition-colors no-underline">
            Back to Customers
          </Link>
          <button className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded hover:bg-primary-container transition-colors">
            Edit Customer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Personal Info */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div className="bg-surface-container-lowest border border-outline-variant rounded p-margin_sm">
            <h3 className="font-title-md text-title-md text-on-surface mb-4 border-b border-outline-variant pb-2">Personal Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-body-sm text-on-surface-variant">Full Name</span>
                <span className="font-body-sm text-on-surface font-medium">{customer.firstName} {customer.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body-sm text-on-surface-variant">Email</span>
                <span className="font-body-sm text-on-surface font-medium">{customer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body-sm text-on-surface-variant">Phone</span>
                <span className="font-body-sm text-on-surface font-medium">{customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body-sm text-on-surface-variant">Date of Birth</span>
                <span className="font-body-sm text-on-surface font-medium">{customer.dateOfBirth || '—'}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded p-margin_sm">
            <h3 className="font-title-md text-title-md text-on-surface mb-4 border-b border-outline-variant pb-2">Employment Profile</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-body-sm text-on-surface-variant">Employer</span>
                <span className="font-body-sm text-on-surface font-medium">{customer.employerName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body-sm text-on-surface-variant">Job Title</span>
                <span className="font-body-sm text-on-surface font-medium">{customer.jobTitle || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body-sm text-on-surface-variant">Years Employed</span>
                <span className="font-body-sm text-on-surface font-medium">{customer.employmentYears || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body-sm text-on-surface-variant">Annual Income</span>
                <span className="font-data-mono text-on-surface font-medium">
                  {customer.annualIncome ? `$${Number(customer.annualIncome).toLocaleString()}` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant rounded p-margin_sm">
            <h3 className="font-title-md text-title-md text-on-surface mb-4 border-b border-outline-variant pb-2">Financial Profile</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Credit Score</p>
                <span className={`inline-flex items-center px-2 py-1 ${cs.bg} ${cs.text} border ${cs.border || 'border-outline-variant'} rounded font-data-mono`}>
                  {cs.label}
                </span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Existing Debt</p>
                <p className="font-data-mono text-data-mono text-on-surface">
                  {customer.existingDebt ? `$${Number(customer.existingDebt).toLocaleString()}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Credit Utilization</p>
                <p className="font-data-mono text-data-mono text-on-surface">
                  {customer.creditUtilization ? `${(Number(customer.creditUtilization) * 100).toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Payment History</p>
                <p className="font-data-mono text-data-mono text-on-surface">
                  {customer.paymentHistoryScore ? `${(Number(customer.paymentHistoryScore) * 100).toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Recent Inquiries</p>
                <p className="font-data-mono text-data-mono text-on-surface">{customer.recentInquiries || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="flex flex-col gap-gutter">
          <div className="bg-surface-container-lowest border border-outline-variant rounded p-margin_sm">
            <h3 className="font-title-md text-title-md text-on-surface mb-4 border-b border-outline-variant pb-2">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/applications" className="w-full flex items-center gap-2 px-4 py-2 bg-surface border border-outline-variant rounded font-label-md text-on-surface hover:bg-surface-container transition-colors no-underline">
                <span className="material-symbols-outlined text-[18px]">description</span>
                View Applications
              </Link>
              <button className="w-full flex items-center gap-2 px-4 py-2 bg-surface border border-outline-variant rounded font-label-md text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Profile
              </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded p-margin_sm">
            <h3 className="font-title-md text-title-md text-on-surface mb-4 border-b border-outline-variant pb-2">Risk Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-body-sm text-on-surface-variant">Credit Score</span>
                <span className={`inline-flex items-center px-2 py-0.5 ${cs.bg} ${cs.text} font-data-mono rounded text-sm`}>
                  {cs.label}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body-sm text-on-surface-variant">Risk Tier</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded font-label-md text-[11px] font-bold tracking-wide ${
                  (customer.creditScore || 0) >= 700 ? 'bg-emerald-50 text-emerald-800' : (customer.creditScore || 0) >= 650 ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-800'
                }`}>
                  {(customer.creditScore || 0) >= 700 ? 'LOW' : (customer.creditScore || 0) >= 650 ? 'MEDIUM' : 'HIGH'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetail;
