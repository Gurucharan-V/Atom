import {
  LayoutDashboard,
  FileSpreadsheet,
  CheckSquare,
  ScrollText,
  Play,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OverlapMark } from '../common/OverlapMark';
import { ToastContainer } from '../common/ToastContainer';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const {
    activeTab,
    setActiveTab,
    pendingApprovalsCount,
    runDemo,
    isDemoRunning,
    searchQuery,
    setSearchQuery,
    isBackendConnected,
    isLoading,
    refreshBackendData,
  } = useApp();

  interface NavItem {
    id: 'dashboard' | 'cases' | 'approvals' | 'audit';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'cases', label: 'Cases', icon: FileSpreadsheet },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: CheckSquare,
      badge: pendingApprovalsCount,
    },
    { id: 'audit', label: 'Audit', icon: ScrollText },
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row text-ink">
      {/* 72px Left Rail for Desktop */}
      <aside className="hidden md:flex flex-col items-center w-[72px] bg-ink text-white py-4 flex-shrink-0 z-20 border-r border-white/10">
        {/* Top brand icon with Overlap Mark */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="cursor-pointer mb-6 flex flex-col items-center gap-1 group"
          title="Eclipse Reconciler"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 group-hover:bg-white/15 transition-colors">
            <OverlapMark size={24} gapAmount={40000} isResolved={false} />
          </div>
          <span className="font-mono text-[10px] text-white/70 tracking-wider">
            ECLIPSE
          </span>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 flex flex-col gap-3 w-full px-2" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.id === 'cases' && activeTab === 'case_detail');

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                className={`relative flex flex-col items-center justify-center py-2.5 px-1 rounded-control transition-all w-full ${
                  isActive
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-[#9AA7B8] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="absolute -top-1 -right-2 bg-pending text-white text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-1 select-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Run Demo indicator */}
        <div className="px-2 w-full pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={runDemo}
            disabled={isDemoRunning}
            title="Run interactive reconciliation demo"
            className="w-full flex flex-col items-center justify-center py-2 rounded-control bg-white/10 hover:bg-white/20 text-[#E8EDF3] transition-colors disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${isDemoRunning ? 'animate-spin text-corona' : ''}`} />
            <span className="text-[10px] font-mono mt-1">DEMO</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Header with Glassmorphism */}
        <header className="h-[60px] glass-header border-b border-rule/80 px-6 flex items-center justify-between sticky top-0 z-10 transition-all">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[18px] text-ink tracking-tight font-ui flex items-center gap-2">
              Eclipse Reconciler
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-ink/5 border border-ink/10 text-ink-soft">v1.0</span>
            </span>
            <span className="text-ink-soft text-[13px] hidden sm:inline border-l border-rule pl-3">
              Autonomous Transaction Mismatch Agent
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Search Input */}
            <div className="relative hidden md:block group">
              <Search className="w-4 h-4 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-pending transition-colors" />
              <input
                type="text"
                placeholder="Search cases, vendors or invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-[36px] pl-9 pr-3 w-[220px] lg:w-[280px] bg-paper text-ink text-[12px] rounded-control border border-rule focus:outline-none focus:ring-2 focus:ring-pending/30 focus:border-pending transition-all placeholder:text-ink-soft/70 shadow-sm"
              />
            </div>

            {/* Backend connection pill */}
            <div
              className={`hidden lg:flex items-center gap-2 text-[12px] font-mono px-3 py-1 rounded-full border transition-all ${
                isBackendConnected
                  ? 'bg-verified/10 border-verified/30 text-verified'
                  : 'bg-corona/10 border-corona/30 text-corona'
              }`}
              title={isBackendConnected ? 'Backend API connected (http://127.0.0.1:8000)' : 'Standalone fallback mode active'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isBackendConnected ? 'bg-verified animate-pulse' : 'bg-corona'
                }`}
              />
              <span className="font-medium">
                {isBackendConnected ? 'API Live' : 'Offline / Standalone'}
              </span>
            </div>

            {/* Refresh / Sync Button */}
            <button
              type="button"
              onClick={() => refreshBackendData()}
              disabled={isLoading}
              title="Sync with backend API"
              className="h-[36px] w-[36px] rounded-control border border-rule bg-sheet hover:bg-paper active:scale-95 text-ink-soft hover:text-ink flex items-center justify-center transition-all shadow-sm focus:outline-none disabled:opacity-50"
            >
              <svg
                className={`w-4 h-4 ${isLoading ? 'animate-spin text-pending' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={runDemo}
              disabled={isDemoRunning}
              className="h-[36px] px-4 rounded-control bg-ink hover:bg-ink/90 active:scale-95 text-white font-medium text-[13px] flex items-center gap-2 transition-all shadow-sm focus:ring-2 focus:ring-pending focus:ring-offset-2 outline-none disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isDemoRunning ? 'animate-spin text-corona' : ''}`} />
              <span>{isDemoRunning ? 'Running Trace...' : 'Run Demo'}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Screen View */}
        <main className="flex-1 p-6 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Bottom Nav Bar for Mobile (< 768px) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-[56px] bg-ink text-white flex items-center justify-around z-30 border-t border-white/10"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'cases' && activeTab === 'case_detail');

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center justify-center p-1 relative ${
                isActive ? 'text-white font-medium' : 'text-[#9AA7B8]'
              }`}
            >
              <Icon className="w-5 h-5" />
              {Boolean(item.badge && item.badge > 0) && (
                <span className="absolute top-0 right-1 bg-pending text-white text-[9px] font-mono font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Persistent Toasts */}
      <ToastContainer />
    </div>
  );
};
