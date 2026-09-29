import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { CasesList } from './pages/CasesList';
import { CaseDetail } from './pages/CaseDetail';
import { ApprovalInbox } from './pages/ApprovalInbox';
import { AuditLog } from './pages/AuditLog';

const MainRouter: React.FC = () => {
  const { activeTab } = useApp();

  switch (activeTab) {
    case 'dashboard':
      return <Dashboard />;
    case 'cases':
      return <CasesList />;
    case 'case_detail':
      return <CaseDetail />;
    case 'approvals':
      return <ApprovalInbox />;
    case 'audit':
      return <AuditLog />;
    default:
      return <Dashboard />;
  }
};

export default function App() {
  return (
    <AppProvider>
      <AppShell>
        <MainRouter />
      </AppShell>
    </AppProvider>
  );
}
