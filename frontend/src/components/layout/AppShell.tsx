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
        {/* Top Header */}
        <header className="h-[60px] bg-sheet border-b border-rule px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[17px] text-ink tracking-tight font-ui">
              Eclipse Reconciler
            </span>
            <span className="text-ink-soft text-[13px] hidden sm:inline">
              / Autonomous Transaction Mismatch Resolution
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Search Input */}
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-ink-soft absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search cases or vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-[34px] pl-8 pr-3 w-[220px] lg:w-[280px] bg-paper text-ink text-[12px] rounded-control border border-rule focus:outline-none focus:ring-1 focus:ring-pending placeholder:text-ink-soft/70"
              />
            </div>

            <div className="hidden lg:flex items-center gap-2 text-[12px] text-ink-soft font-mono mr-1">
              <span className="w-2 h-2 rounded-full bg-verified" />
              <span>Safety policy active</span>
            </div>

            <button
              type="button"
              onClick={runDemo}
              disabled={isDemoRunning}
              className="h-[34px] px-3.5 rounded-control bg-ink hover:bg-ink/90 text-white font-medium text-[13px] flex items-center gap-2 transition-colors focus:ring-2 focus:ring-pending focus:ring-offset-2 outline-none disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isDemoRunning ? 'animate-spin' : ''}`} />
              <span>{isDemoRunning ? 'Running...' : 'Run demo'}</span>
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
