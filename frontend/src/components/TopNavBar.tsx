import React, { useState } from 'react';
import { USER_AVATARS } from '../mockData';
import { NavTab } from '../types';

interface TopNavBarProps {
  currentTab: NavTab;
  activeAppId?: string | null;
  onBackToApplications?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onToggleMobileMenu: () => void;
  onSignOut?: () => void;
  userName?: string;
  userRole?: string;
  liveMode?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentTab,
  activeAppId,
  onBackToApplications,
  searchQuery,
  onSearchChange,
  onOpenNotifications,
  onOpenSettings,
  onOpenHelp,
  onToggleMobileMenu,
  onSignOut,
  userName = 'Prathmesh Bunde',
  userRole = 'Chief Risk Underwriter',
  liveMode = false,
  onRefresh,
  isRefreshing = false,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);

  // Determine top title / breadcrumb
  const renderBreadcrumb = () => {
    if (activeAppId && currentTab === 'applications') {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToApplications}
            className="text-[13px] text-[#515f74] hover:text-black font-medium transition-colors cursor-pointer"
          >
            Applications
          </button>
          <span className="material-symbols-outlined text-[#76777d] text-sm">chevron_right</span>
          <span className="text-[15px] text-black font-bold font-mono">
            {activeAppId}
          </span>
        </div>
      );
    }

    const titles: Record<NavTab, string> = {
      dashboard: 'Dashboard',
      customers: 'Customers',
      applications: 'Applications',
      reviews: 'Review Queue',
      risk: 'Portfolio Risk Analytics',
      audit: 'Audit Log',
      admin: 'Policy Configuration',
      'system-health': 'System Health',
    };

    return (
      <span className="text-[16px] font-bold text-[#0b1c30]">
        {titles[currentTab]}
      </span>
    );
  };

  return (
    <header
      id="top-navbar"
      className="fixed top-0 right-0 h-[64px] bg-white border-b border-[#e2e8f0] flex items-center justify-between px-4 sm:px-6 w-full md:w-[calc(100%-260px)] md:ml-[260px] z-40"
    >
      {/* Left: Mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden text-[#45464d] hover:text-black p-1.5 rounded hover:bg-[#eff4ff] transition-colors"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        {renderBreadcrumb()}
      </div>

      {/* Right: Search & Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Bar */}
        <div className="relative hidden sm:block w-48 lg:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-[18px]">
            search
          </span>
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search applications, IDs..."
            className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded pl-9 pr-3 py-1.5 text-[13px] text-[#0b1c30] placeholder:text-[#76777d] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#76777d] hover:text-black text-xs"
            >
              <span className="material-symbols-outlined text-[14px]">cancel</span>
            </button>
          )}
        </div>

        {/* Action icons */}
        {/* Live/Demo badge + refresh */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold border ${
            liveMode
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
          title={liveMode ? 'Connected to live backend services' : 'Backend unreachable — showing demo data'}
        >
          <span className={`w-2 h-2 rounded-full ${liveMode ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          {liveMode ? 'LIVE' : 'DEMO'}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1.5 rounded hover:bg-[#eff4ff] text-[#515f74] hover:text-black transition-colors"
            title="Refresh data"
          >
            <span className={`material-symbols-outlined text-[20px] ${isRefreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
        )}

        <button
          id="btn-notifications"
          onClick={onOpenNotifications}
          className="p-1.5 rounded hover:bg-[#eff4ff] text-[#515f74] hover:text-black transition-colors relative"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#ba1a1a] rounded-full ring-2 ring-white"></span>
        </button>

        <button
          id="btn-help"
          onClick={onOpenHelp}
          className="p-1.5 rounded hover:bg-[#eff4ff] text-[#515f74] hover:text-black transition-colors"
          title="Documentation & Help"
        >
          <span className="material-symbols-outlined text-[20px]">help</span>
        </button>

        <button
          id="btn-settings"
          onClick={onOpenSettings}
          className="p-1.5 rounded hover:bg-[#eff4ff] text-[#515f74] hover:text-black transition-colors"
          title="Settings"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>

        <div className="h-6 w-px bg-[#e2e8f0] mx-0.5 sm:mx-1 hidden sm:block"></div>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            id="user-profile-button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer focus:outline-none"
          >
            <img
              src={USER_AVATARS.executive}
              alt="User Profile"
              className="w-8 h-8 rounded-full border border-[#c6c6cd] object-cover"
            />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white border border-[#e2e8f0] rounded-md shadow-md py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setProfileOpen(false)}
            >
            <div className="px-4 py-2 border-b border-[#e2e8f0]">
              <p className="text-[13px] font-bold text-[#0b1c30]">{userName}</p>
              <p className="text-[11px] text-[#76777d]">{userRole}</p>
            </div>
              <button
                onClick={onOpenSettings}
                className="w-full text-left px-4 py-2 text-[13px] text-[#45464d] hover:bg-[#eff4ff] hover:text-black flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">person</span>
                Profile Settings
              </button>
              <button
                onClick={() => alert("Enterprise Session Active: Dual-Auth enabled.")}
                className="w-full text-left px-4 py-2 text-[13px] text-[#45464d] hover:bg-[#eff4ff] hover:text-black flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                Security & Keys
              </button>
              <div className="border-t border-[#e2e8f0] my-1"></div>
              <button
                onClick={() => {
                  if (onSignOut) onSignOut();
                  else alert('Session signed out.');
                }}
                className="w-full text-left px-4 py-2 text-[13px] text-[#ba1a1a] hover:bg-[#ffdad6]/40 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
