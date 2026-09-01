import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api.js';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/applications/dashboard/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Failed to load dashboard data');
      // Set demo data for display
      setStats({
        totalApplications: 0,
        approvedCount: 0,
        rejectedCount: 0,
        manualReviewCount: 0,
        pendingCount: 0,
        approvalRate: 0,
        rejectionRate: 0,
        manualReviewRate: 0,
        statusCounts: {}
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const statusData = [
    { name: 'Approved', value: stats?.approvedCount || 0, color: '#27ae60' },
    { name: 'Rejected', value: stats?.rejectedCount || 0, color: '#e74c3c' },
    { name: 'Review', value: stats?.manualReviewCount || 0, color: '#f39c12' },
    { name: 'Pending', value: stats?.pendingCount || 0, color: '#95a5a6' },
  ];

  const barData = statusData.map(d => ({ name: d.name, count: d.value }));

  return (
    <div>
      <div className="page-header">
        <h4>Dashboard</h4>
        <p>Overview of credit application processing and risk assessment</p>
      </div>

      {error && (
        <div className="alert alert-info" role="alert">
          {error} — Showing empty state. Start the backend services to see live data.
        </div>
      )}

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="stat-card">
            <div className="stat-value">{stats?.totalApplications || 0}</div>
            <div className="stat-label">Total Applications</div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="stat-card success">
            <div className="stat-value">{(stats?.approvalRate || 0).toFixed(1)}%</div>
            <div className="stat-label">Approval Rate</div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="stat-card danger">
            <div className="stat-value">{(stats?.rejectionRate || 0).toFixed(1)}%</div>
            <div className="stat-label">Rejection Rate</div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="stat-card warning">
            <div className="stat-value">{(stats?.manualReviewRate || 0).toFixed(1)}%</div>
            <div className="stat-label">Manual Review Rate</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row">
        <div className="col-md-8 mb-4">
          <div className="card-dashboard card">
            <div className="card-header">Application Volume by Status</div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3498db" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card-dashboard card">
            <div className="card-header">Status Distribution</div>
            <div className="card-body d-flex justify-content-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-dashboard card">
        <div className="card-header">System Overview</div>
        <div className="card-body">
          <div className="row text-center">
            <div className="col-md-3">
              <h5 style={{ color: '#3498db' }}>6</h5>
              <small className="text-muted">Microservices</small>
            </div>
            <div className="col-md-3">
              <h5 style={{ color: '#27ae60' }}>Active</h5>
              <small className="text-muted">ML Service</small>
            </div>
            <div className="col-md-3">
              <h5 style={{ color: '#f39c12' }}>Kafka</h5>
              <small className="text-muted">Event Bus</small>
            </div>
            <div className="col-md-3">
              <h5 style={{ color: '#9b59b6' }}>PostgreSQL</h5>
              <small className="text-muted">Database</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
