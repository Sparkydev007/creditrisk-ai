import React, { useState } from 'react';
import { HealthService, SystemAlert } from '../types';

interface SystemHealthViewProps {
  services: HealthService[];
  alerts: SystemAlert[];
  live?: boolean;
  onRefresh?: () => void;
}

export const SystemHealthView: React.FC<SystemHealthViewProps> = ({
  services: initialServices,
  alerts: initialAlerts,
  live = false,
  onRefresh,
}) => {
  const [services, setServices] = useState<HealthService[]>(initialServices);
  const [alerts, setAlerts] = useState<SystemAlert[]>(initialAlerts);
  const [isPinging, setIsPinging] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Just now');

  const handleRunHealthCheck = () => {
    setIsPinging(true);
    const done = () => {
      setIsPinging(false);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    if (onRefresh) {
      Promise.resolve(onRefresh()).finally(() => setTimeout(done, 400));
    } else {
      setTimeout(done, 600);
    }
  };

  const handleResolveAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-[#0b1c30] tracking-tight">
            System Health Overview
          </h2>
          <p className="text-[14px] text-[#76777d] mt-1">
            Real-time observability and operational metrics across all core services.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-[13px] font-semibold border ${
              live
                ? services.some((s) => s.status === 'down')
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                live && !services.some((s) => s.status === 'down') ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            ></span>
            {live
              ? services.some((s) => s.status === 'down')
                ? 'Degraded — some services unreachable'
                : 'All Systems Operational'
              : 'Demo Mode — backend offline'}
          </div>
          <button
            onClick={handleRunHealthCheck}
            disabled={isPinging}
            className="px-3 py-1.5 bg-white border border-[#c6c6cd] hover:bg-[#eff4ff] text-[#0b1c30] text-[13px] font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isPinging ? 'animate-spin' : ''
              }`}
            >
              refresh
            </span>
            Check
          </button>
        </div>
      </div>

      {/* Global Metrics Summary (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e2e8f0] rounded p-5 shadow-2xs">
          <p className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
            Global Uptime (30d)
          </p>
          <h3 className="text-[28px] font-bold text-[#0b1c30] mt-1">99.994%</h3>
          <p className="text-[12px] text-emerald-700 mt-1 font-medium">Within SLA target (99.95%)</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded p-5 shadow-2xs">
          <p className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
            Avg Global Latency
          </p>
          <h3 className="text-[28px] font-bold text-[#0b1c30] mt-1">42ms</h3>
          <p className="text-[12px] text-[#76777d] mt-1 font-medium">p95: 88ms across 6 clusters</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded p-5 shadow-2xs">
          <p className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
            Total Requests (24h)
          </p>
          <h3 className="text-[28px] font-bold text-[#0b1c30] mt-1">1.2M</h3>
          <p className="text-[12px] text-[#76777d] mt-1 font-medium">Peak: 1,840 req/sec</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded p-5 shadow-2xs">
          <p className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
            Active Incidents
          </p>
          <h3 className="text-[28px] font-bold text-emerald-700 mt-1">0</h3>
          <p className="text-[12px] text-[#76777d] mt-1 font-medium">0 critical / 1 warning</p>
        </div>
      </div>

      {/* Service Status Grid (6 Cards) */}
      <div>
        <h3 className="text-[16px] font-bold text-[#0b1c30] mb-4">Core Platform Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div
              key={svc.id}
              className={`bg-white border rounded p-5 shadow-2xs transition-colors ${
                svc.isDegraded
                  ? 'border-amber-400 bg-gradient-to-b from-white to-amber-50/20'
                  : 'border-[#e2e8f0] hover:border-black/30'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[22px] text-black">
                    {svc.icon}
                  </span>
                  <span className="font-bold text-[15px] text-[#0b1c30]">{svc.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      svc.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                    }`}
                  ></span>
                  <span
                    className={`text-[12px] font-bold capitalize ${
                      svc.status === 'healthy' ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {svc.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-[#f8f9ff] rounded border border-[#e2e8f0]">
                  <p className="text-[10px] text-[#76777d] uppercase font-bold">Uptime</p>
                  <p className="text-[13px] font-mono font-bold text-[#0b1c30] mt-0.5">
                    {svc.uptime}
                  </p>
                </div>
                <div className="p-2 bg-[#f8f9ff] rounded border border-[#e2e8f0]">
                  <p className="text-[10px] text-[#76777d] uppercase font-bold">Latency</p>
                  <p
                    className={`text-[13px] font-mono font-bold mt-0.5 ${
                      svc.isDegraded ? 'text-amber-700' : 'text-[#0b1c30]'
                    }`}
                  >
                    {svc.latency}
                  </p>
                </div>
                <div className="p-2 bg-[#f8f9ff] rounded border border-[#e2e8f0]">
                  <p className="text-[10px] text-[#76777d] uppercase font-bold">
                    {svc.metricLabel3}
                  </p>
                  <p
                    className={`text-[13px] font-mono font-bold mt-0.5 ${
                      svc.isDegraded ? 'text-amber-700' : 'text-[#0b1c30]'
                    }`}
                  >
                    {svc.metricValue3}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts Log */}
      <div className="bg-white border border-[#e2e8f0] rounded overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <div>
            <h3 className="text-[16px] font-bold text-[#0b1c30]">Recent Alerts Log</h3>
            <p className="text-[13px] text-[#76777d]">Telemetry and threshold exception events.</p>
          </div>
          <span className="text-[11px] font-mono text-[#76777d]">Synced: {lastUpdated}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Message</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[#0b1c30]">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[#76777d]">
                    No active system alerts. All services operating normally.
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-[#eff4ff]/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[#76777d] text-[12px]">
                      {alert.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      {alert.severity === 'WARN' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                          WARN
                        </span>
                      )}
                      {alert.severity === 'INFO' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#dce9ff] text-[#0b1c30]">
                          INFO
                        </span>
                      )}
                      {alert.severity === 'ERROR' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-900">
                          ERROR
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">{alert.service}</td>
                    <td className="py-3 px-4 text-[#45464d]">{alert.message}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="text-[12px] font-medium text-[#76777d] hover:text-black cursor-pointer hover:underline"
                      >
                        Dismiss
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
