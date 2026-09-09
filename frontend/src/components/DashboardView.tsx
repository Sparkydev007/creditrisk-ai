import React, { useState } from 'react';
import { Application } from '../types';
import { VolumeLineChart, DecisionDoughnutChart } from './DashboardCharts';

interface DashboardViewProps {
  applications: Application[];
  onSelectApplication: (id: string) => void;
  onOpenNewApplication: () => void;
  onViewAllApplications: () => void;
  onExportReport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  applications,
  onSelectApplication,
  onOpenNewApplication,
  onViewAllApplications,
  onExportReport,
}) => {
  const [timeRange, setTimeRange] = useState<'Last 30 Days' | 'Last Quarter' | 'Year to Date'>('Last 30 Days');
  const [activePage, setActivePage] = useState(1);

  // Top 4 recent applications for the dashboard table
  const recentApps = applications.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#0b1c30] tracking-tight">Dashboard</h1>
          <p className="text-[14px] text-[#76777d] mt-0.5">
            Overview of credit applications and risk metrics.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            id="btn-dashboard-export"
            onClick={onExportReport}
            className="px-4 py-2 bg-white border border-[#c6c6cd] text-[#0b1c30] text-[13px] font-semibold rounded hover:bg-[#eff4ff] transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
          <button
            id="btn-dashboard-new-app"
            onClick={onOpenNewApplication}
            className="px-4 py-2 bg-black text-white text-[13px] font-semibold rounded hover:bg-black/85 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Application
          </button>
        </div>
      </div>

      {/* KPI Section (4 Summary Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Applications */}
        <div className="bg-white border border-[#e2e8f0] rounded p-4 flex flex-col justify-between hover:border-[#0F172A]/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#76777d] uppercase tracking-wider">
              Total Applications
            </span>
            <span className="material-symbols-outlined text-[#76777d] text-lg">description</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[26px] font-bold text-[#0b1c30] tracking-tight">1,284</span>
            <div className="flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[12px] font-bold">
              <span className="material-symbols-outlined text-[14px] mr-0.5">arrow_upward</span>
              12%
            </div>
          </div>
        </div>

        {/* Card 2: Approval Rate */}
        <div className="bg-white border border-[#e2e8f0] rounded p-4 flex flex-col justify-between hover:border-[#0F172A]/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#76777d] uppercase tracking-wider">
              Approval Rate
            </span>
            <span className="material-symbols-outlined text-[#76777d] text-lg">check_circle</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[26px] font-bold text-[#0b1c30] tracking-tight">72.4%</span>
            <div className="flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[12px] font-bold">
              <span className="material-symbols-outlined text-[14px] mr-0.5">arrow_upward</span>
              2.1%
            </div>
          </div>
        </div>

        {/* Card 3: Manual Review */}
        <div className="bg-white border border-[#e2e8f0] rounded p-4 flex flex-col justify-between hover:border-amber-400 transition-colors relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
          <div className="flex items-center justify-between mb-2 pl-2">
            <span className="text-[11px] font-semibold text-[#76777d] uppercase tracking-wider">
              Manual Review
            </span>
            <span className="material-symbols-outlined text-amber-600 text-lg">rate_review</span>
          </div>
          <div className="flex items-end justify-between pl-2">
            <span className="text-[26px] font-bold text-[#0b1c30] tracking-tight">156</span>
            <div className="flex items-center text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold tracking-wide">
              Action Req
            </div>
          </div>
        </div>

        {/* Card 4: Average Risk Score */}
        <div className="bg-white border border-[#e2e8f0] rounded p-4 flex flex-col justify-between hover:border-[#0F172A]/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#76777d] uppercase tracking-wider">
              Avg Risk Score
            </span>
            <span className="material-symbols-outlined text-[#76777d] text-lg">speed</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[26px] font-bold text-[#0b1c30] tracking-tight">682</span>
            <div className="flex items-center text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-[12px] font-bold">
              <span className="material-symbols-outlined text-[14px] mr-0.5">arrow_downward</span>
              -5 pts
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white border border-[#e2e8f0] rounded p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
            <h2 className="text-[16px] font-semibold text-[#0b1c30]">Volume Over Time</h2>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="text-[12px] font-medium text-[#45464d] border border-[#c6c6cd] rounded px-3 py-1 bg-white focus:outline-none focus:border-black"
            >
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last Quarter">Last Quarter</option>
              <option value="Year to Date">Year to Date</option>
            </select>
          </div>
          <div className="w-full h-[230px] flex items-center justify-center">
            <VolumeLineChart timeRange={timeRange} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white border border-[#e2e8f0] rounded p-5 flex flex-col justify-between">
          <div className="pb-3 border-b border-[#e2e8f0] mb-2">
            <h2 className="text-[16px] font-semibold text-[#0b1c30]">Decision Split</h2>
          </div>
          <div className="py-2 flex items-center justify-center">
            <DecisionDoughnutChart />
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white border border-[#e2e8f0] rounded overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-white">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0b1c30]">Recent Applications</h2>
            <p className="text-[13px] text-[#76777d]">Latest credit requests requiring attention.</p>
          </div>
          <button
            onClick={onViewAllApplications}
            className="text-[13px] font-semibold text-black hover:underline cursor-pointer flex items-center gap-1"
          >
            View All
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8f9ff]">
                <th className="py-3 px-4 text-[11px] font-semibold text-[#76777d] uppercase tracking-wider">
                  App ID
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-[#76777d] uppercase tracking-wider">
                  Customer
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-[#76777d] uppercase tracking-wider text-right">
                  Amount
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-[#76777d] uppercase tracking-wider text-right">
                  Risk Score
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-[#76777d] uppercase tracking-wider">
                  Decision
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-[#76777d] uppercase tracking-wider text-right">
                  Submitted
                </th>
                <th className="py-3 px-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[13px] text-[#0b1c30]">
              {recentApps.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => onSelectApplication(app.id)}
                  className="hover:bg-[#eff4ff]/60 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono font-medium text-black">
                    {app.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#0b1c30]">{app.customer}</div>
                    <div className="text-[11px] text-[#76777d]">{app.sector}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium">
                    ${app.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-mono text-[12px] font-semibold border ${
                        app.riskScore >= 700
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : app.riskScore >= 550
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}
                    >
                      {app.riskScore}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {app.decision === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Approved
                      </span>
                    )}
                    {app.decision === 'REVIEW' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                        Review
                      </span>
                    )}
                    {app.decision === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-800 border border-red-200 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-[#76777d] text-[12px]">
                    {app.submittedFormatted}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="material-symbols-outlined text-[#76777d] group-hover:text-black text-[18px]">
                      chevron_right
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8f9ff] flex items-center justify-between text-[13px] text-[#76777d]">
          <span>Showing 1-4 of {applications.length} applications</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActivePage(Math.max(1, activePage - 1))}
              disabled={activePage === 1}
              className="px-2.5 py-1 border border-[#c6c6cd] rounded hover:bg-[#e5eeff] disabled:opacity-50 text-xs font-medium cursor-pointer"
            >
              Prev
            </button>
            <button
              onClick={() => setActivePage(1)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold ${
                activePage === 1 ? 'bg-black text-white' : 'bg-white border border-[#c6c6cd]'
              }`}
            >
              1
            </button>
            <button
              onClick={() => setActivePage(2)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold ${
                activePage === 2 ? 'bg-black text-white' : 'bg-white border border-[#c6c6cd]'
              }`}
            >
              2
            </button>
            <button
              onClick={() => setActivePage(3)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold ${
                activePage === 3 ? 'bg-black text-white' : 'bg-white border border-[#c6c6cd]'
              }`}
            >
              3
            </button>
            <button
              onClick={() => setActivePage(Math.min(3, activePage + 1))}
              className="px-2.5 py-1 border border-[#c6c6cd] rounded hover:bg-[#e5eeff] text-xs font-medium cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
