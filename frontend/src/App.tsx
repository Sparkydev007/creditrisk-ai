import React, { useCallback, useEffect, useState } from 'react';
import { NavTab, Application, PolicyRule, ReviewQueueItem, HealthService, SystemAlert, Customer, AuditRow } from './types';
import {
  INITIAL_APPLICATIONS,
  INITIAL_REVIEW_QUEUE,
  INITIAL_POLICIES,
  INITIAL_HEALTH_SERVICES,
  INITIAL_ALERTS,
  INITIAL_CUSTOMERS,
} from './mockData';
import {
  fetchAll,
  createApplication,
  getUser,
  logout,
  sessionUserName,
  isLiveMode,
  LoginResponse,
} from './api';
import { LoginView } from './components/LoginView';
import { SideNavBar } from './components/SideNavBar';
import { TopNavBar } from './components/TopNavBar';
import { DashboardView } from './components/DashboardView';
import { ApplicationsView } from './components/ApplicationsView';
import { ApplicationDetailView } from './components/ApplicationDetailView';
import { PolicyConfigView } from './components/PolicyConfigView';
import { ReviewQueueView } from './components/ReviewQueueView';
import { SystemHealthView } from './components/SystemHealthView';
import { CustomersView } from './components/CustomersView';
import { RiskAnalyticsView } from './components/RiskAnalyticsView';
import { AuditView } from './components/AuditView';
import { NewApplicationModal } from './components/NewApplicationModal';
import { NotificationModal } from './components/NotificationModal';

export default function App() {
  // ── Auth gate ──────────────────────────────────────────────
  const [session] = useState<LoginResponse | null>(() => getUser());
  const [authReady, setAuthReady] = useState<boolean>(() => !!getUser());

  // ── Data (live or demo) ────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [activeAppId, setActiveAppId] = useState<string | null>(null);

  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [queueItems, setQueueItems] = useState<ReviewQueueItem[]>(INITIAL_REVIEW_QUEUE);
  const [policies, setPolicies] = useState<PolicyRule[]>(INITIAL_POLICIES);
  const [services, setServices] = useState<HealthService[]>(INITIAL_HEALTH_SERVICES);
  const [alerts] = useState<SystemAlert[]>(INITIAL_ALERTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [auditRows, setAuditRows] = useState<AuditRow[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAll();
      setLive(data.live);
      setApplications(data.applications);
      setQueueItems(data.queueItems);
      setPolicies(data.policies);
      setServices(data.healthServices);
      setCustomers(data.customers);
      setAuditRows(data.auditRows);
      setLastRefreshed(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authReady) loadData();
  }, [authReady, loadData]);

  // Modals & UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Handlers ───────────────────────────────────────────────
  const handleSelectApplication = (id: string) => {
    setActiveAppId(id);
    setCurrentTab('applications');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToApplications = () => setActiveAppId(null);

  const handleProcessNext = () => {
    if (!applications.length) return;
    const currentIndex = applications.findIndex((a) => a.id === activeAppId);
    const nextIndex = (currentIndex + 1) % applications.length;
    const nextApp = applications[nextIndex];
    setActiveAppId(nextApp.id);
    showToast(`Loaded next application: ${nextApp.id} (${nextApp.customer})`);
  };

  const handleExportReport = () => {
    const app = activeAppId ? applications.find((a) => a.id === activeAppId) : null;
    const title = app ? `Credit Risk Assessment - ${app.id} - ${app.customer}` : 'Credit Risk Portfolio Summary';
    const reportText =
      `=== CREDITRISK AI DECISION REPORT ===\nGenerated: ${new Date().toISOString()}\nTitle: ${title}\nData Source: ${live ? 'Live Services' : 'Demo Data'}\n\n` +
      (app
        ? `Application ID: ${app.id}\nCustomer: ${app.customer}\nAmount: $${app.amount.toLocaleString()}\nRisk Score: ${app.riskScore}/850\nEst PD: ${app.estPD}%\nDecision: ${app.decision}\nWorkflow: ${app.workflowStatus}\n`
        : `Total Applications: ${applications.length}\nApproved: ${applications.filter((a) => a.decision === 'APPROVED').length}\nReview Queue: ${queueItems.length}`);

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(app ? app.id : 'Portfolio_Summary')}_Report.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported formal underwriting report.');
  };

  const handleUpdateDecision = (appId: string, newDecision: 'APPROVED' | 'REVIEW' | 'REJECTED') => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const newStatus = newDecision === 'REVIEW' ? 'IN PROGRESS' : 'COMPLETED';
          const newTier = newDecision === 'APPROVED' ? 'LOW' : newDecision === 'REVIEW' ? 'MEDIUM' : 'HIGH';
          return {
            ...app,
            decision: newDecision,
            workflowStatus: newStatus,
            riskTier: newTier,
            timeline: [
              {
                id: `tl-ov-${Date.now()}`,
                timestamp: 'Just now',
                title: `Underwriter Decision Override: ${newDecision}`,
                description: `Updated by ${sessionUserName()} with authorized sign-off.`,
                isActive: true,
              },
              ...(app.timeline || []),
            ],
          };
        }
        return app;
      })
    );
    showToast(`Decision updated to ${newDecision} for application ${appId}`);
  };

  // Create application → live backend when available, local otherwise
  const handleCreateApplication = async (newApp: Application) => {
    if (isLiveMode()) {
      try {
        const created = await createApplication({
          customer: newApp.customer,
          employerName: newApp.applicantRole === 'Authorized Signer' ? undefined : newApp.applicantRole,
          sector: newApp.sector,
          amount: newApp.amount,
          creditScore: newApp.riskScore,
          annualIncome: newApp.annualIncome ?? 0,
          existingDebt: newApp.existingDebt ?? 0,
          utilization: newApp.creditUtilization ?? 0,
          requestedFacility: newApp.requestedFacility,
        });
        showToast(`Application ${created.id} submitted — risk engine scoring in progress.`);
        setIsNewAppModalOpen(false);
        await loadData();
        handleSelectApplication(created.id);
        return;
      } catch (e: any) {
        showToast(`Backend submission failed: ${e?.response?.data?.message || e.message}. Keeping local copy.`);
      }
    }
    setApplications((prev) => [newApp, ...prev]);
    if (newApp.decision === 'REVIEW') {
      setQueueItems((prev) => [
        {
          id: `rq-${Date.now()}`,
          applicationId: newApp.id,
          customer: newApp.customer,
          priority: 'MEDIUM',
          riskScore: newApp.riskScore,
          reason: 'Manual Underwriter Review',
          age: 'Just now',
          amount: newApp.amount,
        },
        ...prev,
      ]);
    }
    setIsNewAppModalOpen(false);
    setActiveAppId(newApp.id);
    setCurrentTab('applications');
    showToast(`Application ${newApp.id} created & scored (${newApp.decision}).`);
  };

  const handleSavePolicies = (updated: PolicyRule[]) => {
    setPolicies(updated);
    showToast(live ? 'Policies saved locally (backend policy sync pending).' : 'Global decisioning policies saved.');
  };

  const handleSignOut = () => {
    logout();
    window.location.reload();
  };

  const handleLoginSuccess = () => {
    setAuthReady(true);
    showToast('Welcome back.');
  };

  // Global search match
  const searchMatchingApps = searchQuery.trim()
    ? applications.filter(
        (a) =>
          a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.sector.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const activeApplication = applications.find((a) => a.id === activeAppId);

  // ── Login gate ─────────────────────────────────────────────
  if (!session || !authReady) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex">
      <SideNavBar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'applications') setActiveAppId(null);
        }}
        applicationsCount={applications.length}
        reviewCount={queueItems.length}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      <div className="flex-1 md:ml-[260px] flex flex-col min-w-0 min-h-screen">
        <TopNavBar
          currentTab={currentTab}
          activeAppId={activeAppId}
          onBackToApplications={handleBackToApplications}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          onOpenSettings={() => setCurrentTab('admin')}
          onOpenHelp={() => showToast('CreditRisk AI v2.4.1 Documentation & Basel III Compliance Engine.')}
          onToggleMobileMenu={() => setIsMobileNavOpen(!isMobileNavOpen)}
          onSignOut={handleSignOut}
          userName={sessionUserName()}
          userRole={session?.role === 'ADMIN' ? 'Administrator' : 'Risk Analyst'}
          liveMode={live}
          onRefresh={loadData}
          isRefreshing={loading}
        />

        {/* Global Search Results Overlay */}
        {searchQuery.trim() && (
          <div className="pt-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
            <div className="bg-white border border-[#c6c6cd] rounded-lg p-4 shadow-md mb-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0] mb-3">
                <span className="text-[13px] font-bold text-[#0b1c30]">
                  Search Results for &ldquo;{searchQuery}&rdquo; ({searchMatchingApps.length} found)
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#76777d] hover:text-black font-semibold cursor-pointer"
                >
                  Clear search
                </button>
              </div>
              {searchMatchingApps.length > 0 ? (
                <div className="divide-y divide-[#e2e8f0]">
                  {searchMatchingApps.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        handleSelectApplication(item.id);
                        setSearchQuery('');
                      }}
                      className="py-2.5 px-3 flex items-center justify-between hover:bg-[#eff4ff] rounded cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-black text-[13px]">{item.id}</span>
                        <div>
                          <p className="font-medium text-[13px] text-[#0b1c30]">{item.customer}</p>
                          <p className="text-[11px] text-[#76777d]">{item.sector}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-medium text-[13px]">${item.amount.toLocaleString()}</span>
                        <span className="font-mono font-bold text-[12px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Score: {item.riskScore}
                        </span>
                        <span className="text-xs font-bold text-black uppercase">{item.decision}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#76777d] py-2">No matching applications found.</p>
              )}
            </div>
          </div>
        )}

        {/* Primary Page Canvas */}
        <main className="flex-1 pt-[80px] pb-12 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          {loading && (
            <div className="mb-4 flex items-center gap-2 text-[13px] text-[#76777d]">
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              Loading workspace data...
            </div>
          )}

          {currentTab === 'dashboard' && (
            <DashboardView
              applications={applications}
              onSelectApplication={handleSelectApplication}
              onOpenNewApplication={() => setIsNewAppModalOpen(true)}
              onViewAllApplications={() => {
                setActiveAppId(null);
                setCurrentTab('applications');
              }}
              onExportReport={handleExportReport}
            />
          )}

          {currentTab === 'applications' && (
            <>
              {activeAppId && activeApplication ? (
                <ApplicationDetailView
                  application={activeApplication}
                  onProcessNext={handleProcessNext}
                  onExportReport={handleExportReport}
                  onUpdateDecision={handleUpdateDecision}
                />
              ) : (
                <ApplicationsView
                  applications={applications}
                  onSelectApplication={handleSelectApplication}
                  onOpenNewApplication={() => setIsNewAppModalOpen(true)}
                />
              )}
            </>
          )}

          {currentTab === 'reviews' && (
            <ReviewQueueView
              queueItems={queueItems}
              onReviewApplication={handleSelectApplication}
              onRefresh={loadData}
            />
          )}

          {currentTab === 'admin' && (
            <PolicyConfigView
              policies={policies}
              onSavePolicies={handleSavePolicies}
              onDiscardPolicies={() => showToast('Policy modifications discarded.')}
            />
          )}

          {currentTab === 'system-health' && (
            <SystemHealthView services={services} alerts={alerts} live={live} onRefresh={loadData} />
          )}

          {currentTab === 'customers' && (
            <CustomersView
              customers={customers}
              onSelectCustomerApps={(customerName) => {
                const matched = applications.find(
                  (a) => a.customer.toLowerCase() === customerName.toLowerCase()
                );
                if (matched) handleSelectApplication(matched.id);
                else {
                  setActiveAppId(null);
                  setCurrentTab('applications');
                }
              }}
            />
          )}

          {currentTab === 'risk' && <RiskAnalyticsView />}

          {currentTab === 'audit' && <AuditView auditRows={auditRows} live={live} />}
        </main>
      </div>

      <NewApplicationModal
        isOpen={isNewAppModalOpen}
        onClose={() => setIsNewAppModalOpen(false)}
        onSubmit={handleCreateApplication}
        policies={policies}
      />

      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onSelectApplication={handleSelectApplication}
      />

      {toastMessage && (
        <div
          id="global-toast"
          className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white text-[13px] font-medium px-4 py-3 rounded-md shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 border border-slate-700"
        >
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
