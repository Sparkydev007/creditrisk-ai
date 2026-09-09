import React, { useState } from 'react';
import { ReviewQueueItem } from '../types';

interface ReviewQueueViewProps {
  queueItems: ReviewQueueItem[];
  onReviewApplication: (appId: string) => void;
  onRefresh?: () => void;
  totalCount?: number;
  avgAgeHours?: number;
  urgentCount?: number;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  queueItems,
  onReviewApplication,
  onRefresh,
  totalCount,
  avgAgeHours,
  urgentCount,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredQueue = queueItems.filter((item) => {
    if (priorityFilter === 'ALL') return true;
    return item.priority === priorityFilter;
  });

  const effectiveUrgent = urgentCount ?? queueItems.filter((i) => i.priority === 'HIGH').length;
  const effectiveTotal = totalCount ?? queueItems.length;
  const hours = queueItems.map((i) => parseFloat(i.age) || 0);
  const effectiveAvgAge = avgAgeHours ?? (hours.length ? (hours.reduce((a, b) => a + b, 0) / hours.length).toFixed(1) + 'h' : '0h');

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-[28px] font-bold text-[#0b1c30] tracking-tight">Review Queue</h2>
        <p className="text-[14px] text-[#76777d] mt-1">Applications requiring manual intervention</p>
      </div>

      {/* KPI Section (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Reviews */}
        <div className="bg-white border border-[#e2e8f0] rounded p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
              Pending Reviews
            </p>
            <h3 className="text-[32px] font-bold text-[#0b1c30] mt-1">{effectiveTotal}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#eff4ff] flex items-center justify-center text-black">
            <span className="material-symbols-outlined text-[24px]">pending_actions</span>
          </div>
        </div>

        {/* Urgent */}
        <div className="bg-white border-l-4 border-l-[#ba1a1a] border border-[#e2e8f0] rounded p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-bold text-[#ba1a1a] uppercase tracking-wider">Urgent</p>
            <h3 className="text-[32px] font-bold text-[#ba1a1a] mt-1">{effectiveUrgent}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
        </div>

        {/* Avg. Age */}
        <div className="bg-white border border-[#e2e8f0] rounded p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider">Avg. Age</p>
            <h3 className="text-[32px] font-bold text-[#0b1c30] mt-1">{effectiveAvgAge}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#eff4ff] flex items-center justify-center text-black">
            <span className="material-symbols-outlined text-[24px]">schedule</span>
          </div>
        </div>
      </div>

      {/* Active Queue Table */}
      <div className="bg-white border border-[#e2e8f0] rounded overflow-hidden shadow-2xs">
        {/* Table Header Controls */}
        <div className="p-4 border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-[16px] font-bold text-[#0b1c30]">Active Queue</h3>
            <div className="flex gap-1 bg-[#f8f9ff] p-1 rounded border border-[#e2e8f0]">
              {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-2 py-0.5 text-xs font-semibold rounded cursor-pointer ${
                    priorityFilter === p
                      ? 'bg-black text-white'
                      : 'text-[#515f74] hover:text-black'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setPriorityFilter(priorityFilter === 'HIGH' ? 'ALL' : 'HIGH')
              }
              className="px-3 py-1.5 border border-[#c6c6cd] rounded text-[13px] font-medium text-[#0b1c30] hover:bg-[#eff4ff] flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              Priority Filter
            </button>
            <button
              onClick={handleRefresh}
              className={`px-3 py-1.5 border border-[#c6c6cd] rounded text-[13px] font-medium text-[#0b1c30] hover:bg-[#eff4ff] flex items-center gap-1.5 cursor-pointer ${
                isRefreshing ? 'opacity-50' : ''
              }`}
            >
              <span
                className={`material-symbols-outlined text-[16px] ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              >
                refresh
              </span>
              Refresh
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-right">Risk Score</th>
                <th className="py-3 px-4">Reason for Review</th>
                <th className="py-3 px-4">Age</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[#0b1c30]">
              {filteredQueue.map((item) => (
                <tr key={item.id} className="hover:bg-[#eff4ff]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    {item.priority === 'HIGH' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#ffdad6] text-[#ba1a1a]">
                        HIGH
                      </span>
                    )}
                    {item.priority === 'MEDIUM' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                        MEDIUM
                      </span>
                    )}
                    {item.priority === 'LOW' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#dce9ff] text-black">
                        LOW
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-black">
                    {item.applicationId}
                  </td>
                  <td className="py-3.5 px-4 font-medium">{item.customer}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold">
                    <span
                      className={`inline-block px-2 py-0.5 rounded ${
                        item.riskScore >= 700
                          ? 'text-emerald-800 bg-emerald-50'
                          : item.riskScore >= 550
                          ? 'text-amber-800 bg-amber-50'
                          : 'text-red-800 bg-red-50'
                      }`}
                    >
                      {item.riskScore}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#45464d]">{item.reason}</td>
                  <td className="py-3.5 px-4 font-mono text-[#76777d]">{item.age}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onReviewApplication(item.applicationId)}
                      className="px-3 py-1 bg-black text-white text-[12px] font-medium rounded hover:bg-black/80 transition-colors cursor-pointer shadow-xs"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-[#e2e8f0] flex items-center justify-between text-[13px] text-[#76777d] bg-[#f8f9ff]">
          <p>Showing 1 to {filteredQueue.length} of {effectiveTotal} entries</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1 border border-[#c6c6cd] rounded hover:bg-[#e5eeff] disabled:opacity-50 text-black cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold ${
                currentPage === 1 ? 'bg-black text-white' : 'bg-white border border-[#c6c6cd]'
              }`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold ${
                currentPage === 2 ? 'bg-black text-white' : 'bg-white border border-[#c6c6cd]'
              }`}
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(3)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold ${
                currentPage === 3 ? 'bg-black text-white' : 'bg-white border border-[#c6c6cd]'
              }`}
            >
              3
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
              className="p-1 border border-[#c6c6cd] rounded hover:bg-[#e5eeff] text-black cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
