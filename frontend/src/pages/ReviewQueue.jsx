import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';

const demoReviewItems = [
  { id: 'APP-8842-X', customerId: 1, name: 'Acme Corp Logistics', riskScore: 842, reason: 'DTI Threshold', age: '4.2h', priority: 'HIGH' },
  { id: 'APP-7911-Y', customerId: 2, name: 'Global Tech Solutions', riskScore: 610, reason: 'Large Amount', age: '2.1h', priority: 'MEDIUM' },
  { id: 'APP-6520-Z', customerId: 3, name: 'Stark Industries', riskScore: 450, reason: 'Verification Required', age: '1.5h', priority: 'LOW' },
  { id: 'APP-8999-A', customerId: 4, name: 'Wayne Enterprises', riskScore: 890, reason: 'DTI Threshold', age: '5.0h', priority: 'HIGH' },
];

function ReviewQueue() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/api/applications', { params: { page: 0, size: 20 } });
      const allApps = response.data.content || [];
      // Filter for manual review apps
      const reviewApps = allApps.filter(app => app.status === 'MANUAL_REVIEW' || !app.decision);
      if (reviewApps.length > 0) {
        setReviews(reviewApps.map(app => ({
          id: `APP-${app.id}`,
          customerId: app.customerId,
          name: `Customer #${app.customerId}`,
          riskScore: app.riskAssessment?.riskScore || 0,
          reason: app.riskAssessment?.riskCategory === 'MEDIUM' ? 'Medium Risk' : 'Requires Review',
          age: '2.0h',
          priority: app.riskAssessment?.riskScore > 800 ? 'HIGH' : app.riskAssessment?.riskScore > 600 ? 'MEDIUM' : 'LOW',
          appId: app.id,
        })));
      } else {
        setReviews(demoReviewItems);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setReviews(demoReviewItems);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH': return { bg: 'bg-error/10', text: 'text-error' };
      case 'MEDIUM': return { bg: 'bg-tertiary-fixed-dim/20', text: 'text-on-tertiary-container' };
      default: return { bg: 'bg-surface-dim/30', text: 'text-secondary' };
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 700) return 'bg-error-container text-on-error-container';
    if (score >= 600) return 'bg-tertiary-fixed-dim/30 text-on-tertiary-container';
    return 'bg-surface-container-highest text-on-surface';
  };

  const urgentCount = reviews.filter(r => r.priority === 'HIGH').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-body-sm text-on-surface-variant">Loading review queue...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-margin_md max-w-container_max_width mx-auto">
      {/* Header */}
      <header className="mb-gutter">
        <h2 className="font-headline-md text-headline-md text-on-surface">Review Queue</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Applications requiring manual intervention</p>
      </header>

      {/* KPI Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-margin_lg">
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded flex items-center justify-between">
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant">Pending Reviews</p>
            <p className="font-display-lg text-display-lg text-on-surface mt-2">{reviews.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded flex items-center justify-between border-l-4 border-l-error">
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant">Urgent</p>
            <p className="font-display-lg text-display-lg text-error mt-2">{urgentCount}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
            <span className="material-symbols-outlined">warning</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded flex items-center justify-between">
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant">Avg. Age</p>
            <p className="font-display-lg text-display-lg text-on-surface mt-2">4.5h</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">schedule</span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface flex justify-between items-center">
          <h3 className="font-title-md text-title-md text-on-surface">Active Queue</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-outline-variant rounded font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors">
              Filter
            </button>
            <button className="px-4 py-2 bg-primary text-on-primary rounded font-label-md text-label-md hover:bg-on-surface transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Refresh
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-bright">
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">Priority</th>
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">Application</th>
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">Customer</th>
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">Risk Score</th>
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">Reason for Review</th>
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">Age</th>
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm">
              {reviews.map((item) => {
                const pb = getPriorityBadge(item.priority);
                return (
                  <tr key={item.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-stack_default">
                      <span className={`inline-flex items-center px-2 py-1 rounded ${pb.bg} ${pb.text} font-label-md text-[11px] font-bold tracking-wide`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-6 py-stack_default font-data-mono text-data-mono text-primary">
                      <Link to={`/applications/${item.appId || item.id.replace('APP-', '')}`} className="text-primary no-underline hover:underline">
                        {item.id}
                      </Link>
                    </td>
                    <td className="px-6 py-stack_default text-on-surface font-medium">{item.name}</td>
                    <td className="px-6 py-stack_default">
                      <span className={`inline-flex items-center px-2 py-1 ${getScoreBadge(item.riskScore)} font-data-mono rounded-sm`}>
                        {item.riskScore}
                      </span>
                    </td>
                    <td className="px-6 py-stack_default text-on-surface-variant">{item.reason}</td>
                    <td className="px-6 py-stack_default font-data-mono text-on-surface-variant">{item.age}</td>
                    <td className="px-6 py-stack_default text-right">
                      <Link
                        to={`/applications/${item.appId || item.id.replace('APP-', '')}`}
                        className={`px-4 py-1.5 rounded font-label-md text-label-md hover:opacity-90 transition-opacity no-underline ${
                          item.priority === 'HIGH' ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-outline-variant bg-surface-bright flex justify-between items-center text-on-surface-variant font-label-md text-label-md">
          <span>Showing 1 to {reviews.length} of {reviews.length} entries</span>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded hover:bg-surface-container disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-primary bg-primary text-on-primary rounded">1</button>
            <button className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded hover:bg-surface-container">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ReviewQueue;
