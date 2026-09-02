import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/customers', icon: 'group', label: 'Customers' },
  { to: '/applications', icon: 'description', label: 'Applications', badge: null },
  { to: '/reviews', icon: 'rate_review', label: 'Reviews' },
  { to: '/risk', icon: 'warning', label: 'Risk' },
  { to: '/audit', icon: 'history', label: 'Audit' },
];

const adminItems = [
  { to: '/admin/policies', icon: 'settings', label: 'Admin' },
  { to: '/system-health', icon: 'monitor_heart', label: 'System Health' },
];

function AppSidebar({ user, onLogout }) {
  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest border-r border-outline-variant flex flex-col z-50">
      {/* Header */}
      <div className="h-topbar_height flex items-center px-4 border-b border-outline-variant gap-3">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-on-primary text-sm font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
        </div>
        <div className="flex flex-col">
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface">CreditRisk AI</span>
          <span className="font-label-md text-label-md text-outline">Enterprise Decisioning</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 transition-colors duration-200 ease-in-out font-body-md rounded border-l-2 ${
                isActive
                  ? 'text-primary border-primary bg-surface-container-high font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary border-transparent'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-surface-container-highest text-on-surface px-2 py-0.5 rounded text-[10px] font-bold">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}

        <div className="my-2 border-t border-outline-variant mx-4"></div>

        {adminItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 transition-colors duration-200 ease-in-out font-body-md rounded border-l-2 ${
                isActive
                  ? 'text-primary border-primary bg-surface-container-high font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary border-transparent'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Context Bottom */}
      <div className="p-4 border-t border-outline-variant bg-surface-container-lowest">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-label-md text-outline">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            System Operational
          </div>
          <button
            onClick={onLogout}
            className="text-on-surface-variant hover:text-error transition-colors cursor-pointer"
            title="Sign Out"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AppSidebar;
