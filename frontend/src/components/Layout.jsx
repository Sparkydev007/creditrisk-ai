import React from 'react';
import AppSidebar from './AppSidebar';
import TopNav from './TopNav';

function Layout({ user, onLogout, children }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar user={user} onLogout={onLogout} />
      <TopNav />
      <main className="ml-sidebar_width mt-topbar_height min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
}

export default Layout;
