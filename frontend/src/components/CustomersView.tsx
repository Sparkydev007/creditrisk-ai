import React, { useState } from 'react';
import { Customer } from '../types';

interface CustomersViewProps {
  customers: Customer[];
  onSelectCustomerApps: (customerName: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onSelectCustomerApps,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.primaryContact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-[#0b1c30] tracking-tight">Customer Directory</h2>
          <p className="text-[14px] text-[#76777d] mt-1">
            Enterprise client entities and total credit exposure portfolio.
          </p>
        </div>
        <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter entities..."
            className="w-full bg-white border border-[#c6c6cd] rounded pl-9 pr-3 py-1.5 text-[13px] text-[#0b1c30] focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white border border-[#e2e8f0] rounded overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Entity</th>
                <th className="py-3 px-4">Industry Sector</th>
                <th className="py-3 px-4 text-right">Total Exposure</th>
                <th className="py-3 px-4 text-center">Risk Grade</th>
                <th className="py-3 px-4 text-center">Active Facilities</th>
                <th className="py-3 px-4">Primary Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[#0b1c30]">
              {filtered.map((cust) => (
                <tr key={cust.id} className="hover:bg-[#eff4ff]/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-black">{cust.name}</td>
                  <td className="py-3.5 px-4 text-[#45464d]">{cust.industry}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium">
                    ${cust.totalExposure.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold">
                    <span className="px-2 py-0.5 rounded bg-[#dce9ff] text-black border border-[#c6c6cd]">
                      {cust.riskGrade}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">{cust.activeFacilities}</td>
                  <td className="py-3.5 px-4 text-[#45464d]">{cust.primaryContact}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        cust.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-800'
                          : cust.status === 'Review'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {cust.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectCustomerApps(cust.name)}
                      className="text-[12px] font-semibold text-black hover:underline cursor-pointer"
                    >
                      View Applications
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
