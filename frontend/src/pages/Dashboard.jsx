import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import api from '../api.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, appsRes] = await Promise.all([
        api.get('/api/applications/dashboard/stats'),
        api.get('/api/applications', { params: { page: 0, size: 20 } }),
      ]);
      setStats(statsRes.data);
      setApplications(appsRes.data.content || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
      setStats({
        totalApplications: 1284,
        approvedCount: 930,
        rejectedCount: 205,
        manualReviewCount: 156,
        pendingCount: 0,
        approvalRate: 72.4,
        rejectionRate: 15.9,
        manualReviewRate: 12.1,
      });
      setApplications([
        { id: '9021', customerId: 1, status: 'APPROVED', loanAmount: 1250000, loanType: 'Commercial Real Estate', riskAssessment: { riskScore: 745 }, decision: { outcome: 'APPROVE' }, createdAt: new Date(Date.now() - 600000).toISOString() },
        { id: '9020', customerId: 2, status: 'MANUAL_REVIEW', loanAmount: 450000, loanType: 'Supply Chain Finance', riskAssessment: { riskScore: 612 }, decision: null, createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: '9019', customerId: 3, status: 'REJECTED', loanAmount: 2000000, loanType: 'R&D Credit Line', riskAssessment: { riskScore: 450 }, decision: { outcome: 'REJECT' }, createdAt: new Date(Date.now() - 10800000).toISOString() },
        { id: '9018', customerId: 4, status: 'APPROVED', loanAmount: 5500000, loanType: 'Corporate Restructuring', riskAssessment: { riskScore: 810 }, decision: { outcome: 'APPROVE' }, createdAt: new Date(Date.now() - 18000000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
    return `${Math.floor(hrs / 24)} days ago`;
  };

  const getDecisionColor = (status) => {
    switch (status) {
      case 'APPROVED': return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-600', border: 'border-green-200', label: 'Approved' };
      case 'REJECTED': return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-600', border: 'border-red-200', label: 'Rejected' };
      case 'MANUAL_REVIEW': return { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-600', border: 'border-amber-200', label: 'Review' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-600', border: 'border-gray-200', label: status };
    }
  };

  const getScoreColor = (score) => {
    if (score >= 700) return 'bg-green-50 text-green-700 border border-green-200';
    if (score >= 600) return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-red-50 text-red-700 border border-red-200';
  };

  const customerNames = { 1: 'Acme Corp Ltd', 2: 'Globex Logistics', 3: 'Stark Industries', 4: 'Wayne Enterprises', 5: 'LexCorp Holdings' };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-body-sm text-on-surface-variant">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const approvedCount = stats?.approvedCount || 0;
  const reviewCount = stats?.manualReviewCount || 0;
  const rejectedCount = stats?.rejectedCount || 0;

  const lineChartData = {
    labels: ['Jan 1', 'Jan 5', 'Jan 10', 'Jan 15', 'Jan 20', 'Jan 25', 'Jan 30'],
    datasets: [{
      label: 'Application Volume',
      data: [42, 48, 55, 52, 68, 74, 85],
      borderColor: '#0F172A',
      backgroundColor: 'rgba(15, 23, 42, 0.05)',
      borderWidth: 2,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#0F172A',
      pointBorderWidth: 2,
      pointRadius: 4,
      fill: true,
      tension: 0.3,
    }],
  };

  const doughnutChartData = {
    labels: ['Approved', 'Review', 'Rejected'],
    datasets: [{
      data: [approvedCount || 72, reviewCount || 12, rejectedCount || 16],
      backgroundColor: ['#16A34A', '#F59E0B', '#DC2626'],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 4,
    }],
  };

  return (
    <div className="p-margin_md">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-margin_lg">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface">Dashboard</h1>
          <p className="text-on-surface-variant mt-1">Overview of credit applications and risk metrics.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface rounded font-label-md hover:bg-surface-container transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            Export Report
          </button>
          <Link to="/applications" className="px-4 py-2 bg-primary text-on-primary rounded font-label-md hover:bg-primary/90 transition-colors flex items-center gap-2 no-underline">
            <span className="material-symbols-outlined text-sm">add</span>
            New Application
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          {error} — Showing demo data. Start the backend services to see live data.
        </div>
      )}

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-margin_lg">
        {/* Total Applications */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-4 flex flex-col justify-between hover:border-primary-container transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Applications</span>
            <span className="material-symbols-outlined text-outline text-lg">description</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="font-headline-md text-headline-md text-on-surface">{(stats?.totalApplications || 0).toLocaleString()}</span>
            <div className="flex items-center text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              <span className="text-[12px] font-bold">12%</span>
            </div>
          </div>
        </div>

        {/* Approval Rate */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-4 flex flex-col justify-between hover:border-primary-container transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Approval Rate</span>
            <span className="material-symbols-outlined text-outline text-lg">check_circle</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="font-headline-md text-headline-md text-on-surface">{(stats?.approvalRate || 0).toFixed(1)}%</span>
            <div className="flex items-center text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              <span className="text-[12px] font-bold">2.1%</span>
            </div>
          </div>
        </div>

        {/* Manual Review */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-4 flex flex-col justify-between hover:border-primary-container transition-colors relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
          <div className="flex items-center justify-between mb-2 pl-2">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Manual Review</span>
            <span className="material-symbols-outlined text-amber-500 text-lg">rate_review</span>
          </div>
          <div className="flex items-end justify-between pl-2">
            <span className="font-headline-md text-headline-md text-on-surface">{stats?.manualReviewCount || 0}</span>
            <div className="flex items-center text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              <span className="text-[12px] font-bold">Action Req</span>
            </div>
          </div>
        </div>

        {/* Avg Risk Score */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-4 flex flex-col justify-between hover:border-primary-container transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Avg Risk Score</span>
            <span className="material-symbols-outlined text-outline text-lg">speed</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="font-headline-md text-headline-md text-on-surface">682</span>
            <div className="flex items-center text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
              <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
              <span className="text-[12px] font-bold">-5 pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-margin_lg h-[360px]">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded flex flex-col">
          <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center">
            <h2 className="font-title-md text-title-md text-on-surface">Volume Over Time</h2>
            <select className="text-label-md border-outline-variant rounded py-1 pl-2 pr-8 focus:ring-primary focus:border-primary">
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
              <option>Year to Date</option>
            </select>
          </div>
          <div className="flex-1 p-4 w-full h-full relative">
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#0F172A',
                    padding: 10,
                    cornerRadius: 4,
                    displayColors: false,
                  },
                },
                scales: {
                  x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { font: { family: 'Inter', size: 12 }, color: '#64748B' },
                  },
                  y: {
                    grid: { color: '#E2E8F0', drawBorder: false, borderDash: [4, 4] },
                    ticks: { font: { family: 'Inter', size: 12 }, color: '#64748B', padding: 10 },
                    beginAtZero: true,
                  },
                },
                interaction: { mode: 'index', intersect: false },
              }}
            />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col">
          <div className="px-4 py-3 border-b border-outline-variant">
            <h2 className="font-title-md text-title-md text-on-surface">Decision Split</h2>
          </div>
          <div className="flex-1 p-4 relative flex items-center justify-center">
            <Doughnut
              data={doughnutChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      font: { family: 'Inter', size: 12 },
                      color: '#475569',
                    },
                  },
                  tooltip: {
                    backgroundColor: '#0F172A',
                    padding: 10,
                    cornerRadius: 4,
                  },
                },
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="font-headline-sm text-headline-sm text-on-surface">{(stats?.approvalRate || 72).toFixed(0)}%</span>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wide">Approved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded">
        <div className="px-4 py-4 border-b border-outline-variant flex items-center justify-between">
          <div>
            <h2 className="font-title-md text-title-md text-on-surface">Recent Applications</h2>
            <p className="text-body-sm text-on-surface-variant">Latest credit requests requiring attention.</p>
          </div>
          <Link to="/applications" className="text-primary font-label-md hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse zebra-striping">
            <thead>
              <tr className="border-b border-outline-variant bg-surface">
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">App ID</th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">Customer</th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold text-right">Amount</th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold text-right">Risk Score</th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">Decision</th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold text-right">Submitted</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-on-surface divide-y divide-outline-variant/50">
              {applications.slice(0, 5).map((app) => {
                const dc = getDecisionColor(app.status);
                const score = app.riskAssessment?.riskScore || 0;
                const name = customerNames[app.customerId] || `Customer #${app.customerId}`;
                return (
                  <Link
                    key={app.id}
                    to={`/applications/${app.id}`}
                    className={`group cursor-pointer table-row ${app.status === 'MANUAL_REVIEW' ? 'bg-amber-50/30' : ''}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <td className="px-4 py-3 font-data-mono text-primary">{typeof app.id === 'number' ? `APP-${app.id}` : `APP-${app.id}`}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{name}</div>
                      <div className="text-on-surface-variant text-[11px]">{app.loanType}</div>
                    </td>
                    <td className="px-4 py-3 font-data-mono text-right">${Number(app.loanAmount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded font-data-mono ${getScoreColor(score)}`}>{score}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wide ${dc.bg} ${dc.text} ${dc.border} border`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dc.dot}`}></span>
                        {dc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface-variant">{timeAgo(app.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-outline hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>
                    </td>
                  </Link>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-outline-variant flex items-center justify-between text-body-sm text-on-surface-variant">
          <span>Showing 1-{Math.min(applications.length, 5)} of {stats?.totalApplications || applications.length} applications</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
