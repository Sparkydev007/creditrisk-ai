import React from 'react';

function TopNav({ title }) {
  return (
    <nav className="fixed top-0 right-0 h-topbar_height bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-margin_md w-[calc(100%-260px)] ml-sidebar_width z-40">
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 border border-outline-variant rounded bg-surface w-96">
        <span className="material-symbols-outlined text-outline text-lg">search</span>
        <input
          className="bg-transparent border-none focus:ring-0 text-body-sm p-0 w-full text-on-surface placeholder:text-outline"
          placeholder="Search applications, customers, or IDs..."
          type="text"
        />
      </div>
      {/* Trailing Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded hover:bg-surface-container-high transition-colors duration-150 text-on-surface-variant hover:text-primary relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <button className="p-2 rounded hover:bg-surface-container-high transition-colors duration-150 text-on-surface-variant hover:text-primary">
          <span className="material-symbols-outlined">help</span>
        </button>
        <button className="p-2 rounded hover:bg-surface-container-high transition-colors duration-150 text-on-surface-variant hover:text-primary">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="h-8 w-px bg-outline-variant mx-2"></div>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-on-surface-variant font-semibold text-sm">
            A
          </div>
        </button>
      </div>
    </nav>
  );
}

export default TopNav;
