import React, { useState, useEffect } from 'react';

const demoServices = [
  { name: 'API Gateway', icon: 'api', status: 'Healthy', uptime: '99.99%', latency: '12ms', errorRate: '0.01%' },
  { name: 'Risk Service', icon: 'shield', status: 'Healthy', uptime: '99.98%', latency: '45ms', errorRate: '0.02%' },
  { name: 'Decision Service', icon: 'gavel', status: 'Healthy', uptime: '100%', latency: '28ms', errorRate: '0.00%' },
  { name: 'ML Inference API', icon: 'memory', status: 'Degraded', uptime: '99.85%', latency: '245ms', errorRate: '1.2%' },
  { name: 'Primary Database', icon: 'database', status: 'Healthy', uptime: '99.99%', latency: '4ms', extraLabel: 'Connections', extraValue: '1,432' },
  { name: 'Kafka Event Bus', icon: 'queue', status: 'Healthy', uptime: '100%', latencyLabel: 'Lag', latency: '0ms', extraLabel: 'Throughput', extraValue: '4.2k/s' },
];

const demoAlerts = [
  { timestamp: '2023-10-27 14:32:11', severity: 'WARN', service: 'ML Inference API', message: 'High latency detected (p99 > 200ms) on /v1/predict endpoint.' },
  { timestamp: '2023-10-27 12:15:00', severity: 'INFO', service: 'Database', message: 'Automated snapshot backup completed successfully.' },
  { timestamp: '2023-10-27 09:45:22', severity: 'INFO', service: 'Decision Service', message: 'Rules engine reloaded with latest configuration (v2.4.1).' },
  { timestamp: '2023-10-26 23:10:05', severity: 'ERROR', service: 'API Gateway', message: 'Rate limit exceeded for client ID: ext_auth_992. Requests dropped.' },
];

function SystemHealth() {
  const [services, setServices] = useState(demoServices);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 300);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Healthy': return { text: 'text-status-healthy', dot: 'bg-status-healthy' };
      case 'Degraded': return { text: 'text-status-degraded', dot: 'bg-status-degraded' };
      case 'Down': return { text: 'text-status-down', dot: 'bg-status-down' };
      default: return { text: 'text-on-surface-variant', dot: 'bg-on-surface-variant' };
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'ERROR': return { bg: 'bg-surface-variant', text: 'text-status-down', border: 'border-status-down' };
      case 'WARN': return { bg: 'bg-surface-variant', text: 'text-status-degraded', border: 'border-status-degraded' };
      default: return { bg: 'bg-surface-variant', text: 'text-status-healthy', border: 'border-status-healthy' };
    }
  };

  const allHealthy = services.every(s => s.status === 'Healthy');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-body-sm text-on-surface-variant">Loading system health...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-margin_md lg:p-margin_lg max-w-container_max_width mx-auto space-y-gutter">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">System Health Overview</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Real-time observability and operational metrics across all core services.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-2 font-label-md text-label-md ${allHealthy ? 'text-status-healthy' : 'text-status-degraded'} bg-surface px-3 py-1.5 border border-outline-variant rounded`}>
            <span className={`w-2 h-2 rounded-full ${allHealthy ? 'bg-status-healthy' : 'bg-status-degraded'} animate-pulse`}></span>
            {allHealthy ? 'All Systems Operational' : 'Degraded Performance'}
          </span>
          <p className="font-data-mono text-data-mono text-on-surface-variant text-xs">Last updated: Just now</p>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-stack_default">
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded">
          <p className="font-label-md text-label-md text-on-surface-variant mb-1">Global Uptime (30d)</p>
          <p className="font-headline-sm text-headline-sm text-on-surface">99.994%</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded">
          <p className="font-label-md text-label-md text-on-surface-variant mb-1">Avg Global Latency</p>
          <p className="font-headline-sm text-headline-sm text-on-surface">42ms</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded">
          <p className="font-label-md text-label-md text-on-surface-variant mb-1">Total Requests (24h)</p>
          <p className="font-headline-sm text-headline-sm text-on-surface">1.2M</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded">
          <p className="font-label-md text-label-md text-on-surface-variant mb-1">Active Incidents</p>
          <p className="font-headline-sm text-headline-sm text-on-surface">0</p>
        </div>
      </div>

      {/* Service Grid */}
      <div>
        <h2 className="font-title-md text-title-md text-on-surface mb-stack_default">Service Status</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-stack_default">
          {services.map((service) => {
            const sc = getStatusColor(service.status);
            return (
              <div key={service.name} className="bg-surface-container-lowest border border-outline-variant rounded hover:border-primary transition-colors">
                <div className="p-4 border-b border-outline-variant flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">{service.icon}</span>
                    <h3 className="font-title-md text-title-md">{service.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-label-md text-label-md ${sc.text}`}>{service.status}</span>
                    <span className={`w-2 h-2 rounded-full ${sc.dot}`}></span>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant">Uptime</p>
                    <p className="font-data-mono text-data-mono mt-1">{service.uptime}</p>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant">{service.latencyLabel || 'Latency'}</p>
                    <p className={`font-data-mono text-data-mono mt-1 ${service.status === 'Degraded' && service.latencyLabel !== 'Lag' ? 'text-status-degraded' : ''}`}>
                      {service.latency}
                    </p>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant">{service.extraLabel || 'Error Rate'}</p>
                    <p className="font-data-mono text-data-mono mt-1">{service.extraValue || service.errorRate}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="mt-margin_lg">
        <h2 className="font-title-md text-title-md text-on-surface mb-stack_default">Recent Alerts Log</h2>
        <div className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container border-b border-outline-variant font-label-md text-label-md text-on-surface-variant">
              <tr>
                <th className="p-3 font-medium">Timestamp (UTC)</th>
                <th className="p-3 font-medium">Severity</th>
                <th className="p-3 font-medium">Service</th>
                <th className="p-3 font-medium">Message</th>
              </tr>
            </thead>
            <tbody className="font-data-mono text-data-mono divide-y divide-outline-variant">
              {demoAlerts.map((alert, i) => {
                const sb = getSeverityBadge(alert.severity);
                return (
                  <tr key={i} className="hover:bg-surface transition-colors">
                    <td className="p-3 text-on-surface-variant">{alert.timestamp}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 ${sb.bg} ${sb.text} border ${sb.border} rounded text-xs`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="p-3 text-on-surface">{alert.service}</td>
                    <td className="p-3 text-on-surface">{alert.message}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SystemHealth;
