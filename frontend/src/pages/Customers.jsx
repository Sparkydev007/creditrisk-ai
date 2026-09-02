import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/customers', {
        params: { page, size: 20, search: search || undefined }
      });
      setCustomers(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const getCreditScoreBadge = (score) => {
    if (!score) return 'bg-surface-container-high text-on-surface-variant';
    if (score >= 700) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (score >= 650) return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-red-50 text-red-700 border border-red-200';
  };

  return (
    <div className="p-margin_md max-w-container_max_width mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Customers</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage customer profiles and financial information.</p>
        </div>
        <button className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded border border-primary hover:bg-opacity-90 transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex gap-4">
        <div className="flex items-center gap-2 px-3 py-2 border border-outline-variant rounded bg-surface flex-1 max-w-md">
          <span className="material-symbols-outlined text-outline text-lg">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-body-sm p-0 w-full text-on-surface placeholder:text-outline"
            placeholder="Search customers by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 border border-outline-variant rounded font-label-md text-on-surface hover:bg-surface-container transition-colors" onClick={fetchCustomers}>
          Search
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse data-table whitespace-nowrap">
            <thead>
              <tr className="border-b border-outline-variant bg-surface">
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">ID</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Name</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Email</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Phone</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold text-right">Credit Score</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Status</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-on-surface-variant">Loading customers...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-on-surface-variant">
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-surface-container-low transition-colors cursor-pointer">
                    <td className="py-2.5 px-4 font-data-mono text-primary font-medium">#{customer.id}</td>
                    <td className="py-2.5 px-4 font-medium">{customer.firstName} {customer.lastName}</td>
                    <td className="py-2.5 px-4 text-on-surface-variant">{customer.email}</td>
                    <td className="py-2.5 px-4 text-on-surface-variant">{customer.phone}</td>
                    <td className="py-2.5 px-4 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded font-data-mono ${getCreditScoreBadge(customer.creditScore)}`}>
                        {customer.creditScore || 'N/A'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                        Active
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <Link to={`/customers/${customer.id}`} className="text-primary font-label-md hover:underline no-underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-outline-variant bg-surface-bright px-4 py-3 flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                className="p-1 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-50"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center font-label-md text-label-md bg-primary text-on-primary rounded border border-primary">
                {page + 1}
              </button>
              <button
                className="p-1 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Customers;
