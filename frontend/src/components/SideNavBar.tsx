import React from 'react';
import { NavTab } from '../types';

interface SideNavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  applicationsCount?: number;
  reviewCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  currentTab,
  onSelectTab,
  applicationsCount = 12,
  reviewCount = 42,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems: { id: NavTab; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'customers', label: 'Customers', icon: 'group' },
    { id: 'applications', label: 'Applications', icon: 'description', badge: applicationsCount },
    { id: 'reviews', label: 'Reviews', icon: 'rate_review', badge: reviewCount },
    { id: 'risk', label: 'Risk', icon: 'warning' },
    { id: 'audit', label: 'Audit', icon: 'history' },
    { id: 'admin', label: 'Admin', icon: 'settings' },
    { id: 'system-health', label: 'System Health', icon: 'monitor_heart' },
  ];

  const handleItemClick = (id: NavTab) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed left-0 top-0 h-full w-[260px] bg-white border-r border-[#e2e8f0] flex flex-col z-50 transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-black flex items-center justify-center text-white shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-white text-lg">monitoring</span>
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-[#0b1c30] leading-tight tracking-tight">
                CreditRisk AI
              </h1>
              <p className="text-[11px] font-medium text-[#76777d] uppercase tracking-wider mt-0.5">
                Enterprise Decisioning
              </p>
            </div>
          </div>
          {onCloseMobile && (
            <button
              className="md:hidden text-[#76777d] hover:text-black p-1"
              onClick={onCloseMobile}
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    id={`nav-${item.id}`}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-colors duration-150 rounded-r text-left cursor-pointer ${
                      isActive
                        ? 'text-black font-bold border-l-2 border-black bg-[#dce9ff]/60'
                        : 'text-[#45464d] hover:bg-[#eff4ff] hover:text-black border-l-2 border-transparent'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        isActive ? 'fill text-black' : 'text-[#76777d]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isActive
                            ? 'bg-black text-white'
                            : 'bg-[#e5eeff] text-[#0b1c30]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* User Context & Status Bottom */}
        <div className="p-4 border-t border-[#e2e8f0] bg-white flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-[#76777d]">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              System Operational
            </span>
            <span className="font-mono text-[10px] text-[#76777d] bg-[#f8f9ff] px-1.5 py-0.5 rounded border border-[#e2e8f0]">
              v2.4.1
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
