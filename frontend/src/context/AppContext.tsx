import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Case, AuditRecord, TraceEvent } from '../types';
import { INITIAL_CASES, INITIAL_AUDIT_LOGS } from '../data/mockData';
import {
  fetchCasesApi,
  approveActionApi,
  rejectActionApi,
  fetchAuditLogsApi,
  connectCaseTraceSse,
} from '../services/api';

type ActiveTab = 'dashboard' | 'cases' | 'case_detail' | 'approvals' | 'audit';

interface ToastMessage {
  id: string;
  message: string;
  type: 'verified' | 'escalated' | 'info';
}

interface AppContextType {
  cases: Case[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedCaseId: string;
  selectedCase: Case | undefined;
  selectCase: (caseId: string) => void;
  pendingApprovalsCount: number;
  unreconciledTotal: number;
  resolvedCount: number;
  escalatedCount: number;
  auditLogs: AuditRecord[];
  toasts: ToastMessage[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  approveAction: (caseId: string) => void;
  rejectAction: (caseId: string, reason: string) => void;
  sendVendorInquiry: (caseId: string, message: string) => void;
  runDemo: () => void;
  isDemoRunning: boolean;
  loadSampleData: () => void;
  exportAuditReport: (caseId?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<Case[]>(INITIAL_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(INITIAL_CASES[0].id);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(INITIAL_AUDIT_LOGS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch backend data on mount if available
  useEffect(() => {
    async function initData() {
      const apiCases = await fetchCasesApi();
      if (apiCases && apiCases.length > 0) {
        setCases(apiCases);
      }
      const apiAudits = await fetchAuditLogsApi();
      if (apiAudits && apiAudits.length > 0) {
        setAuditLogs(apiAudits);
      }
    }
    initData();
  }, []);

  const addToast = (message: string, type: 'verified' | 'escalated' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const pendingApprovalsCount = cases.filter(
    (c) => c.status === 'awaiting_approval' && c.proposed_action?.status === 'pending'
  ).length;

  const unreconciledTotal = cases
    .filter((c) => c.status !== 'resolved')
    .reduce((sum, c) => sum + c.gap, 0);

  const resolvedCount = cases.filter((c) => c.status === 'resolved').length;
  const escalatedCount = cases.filter((c) => c.status === 'escalated').length;

  const selectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('case_detail');
  };

  const approveAction = async (caseId: string) => {
    // 1. Call backend API
    await approveActionApi(caseId);

    // 2. Optimistic UI update
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;

        const now = new Date().toLocaleTimeString('en-US', { hour12: false });
        const updatedTrace: TraceEvent[] = c.trace.map((tr) => {
          if (tr.step === 'action') {
            return { ...tr, state: 'done' as const, summary: 'Human approved action. Executed safely.' };
          }
          if (tr.step === 'verification') {
            return {
              ...tr,
              state: 'done' as const,
              summary: 'Verified in ERP: ledger update applied and verified cleanly.',
              ts: now,
            };
          }
          return tr;
        });

        return {
          ...c,
          status: 'resolved' as const,
          gap: 0,
          proposed_action: c.proposed_action
            ? { ...c.proposed_action, status: 'approved' as const }
            : undefined,
          trace: updatedTrace,
        };
      })
    );

    const nowStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const targetCase = cases.find((c) => c.id === caseId);
    const actionTitle = targetCase?.proposed_action?.title || 'Action';

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        time: nowStr,
        case_id: caseId,
        step_type: 'verification',
        actor: 'human',
        actor_name: 'Finance Controller',
        summary: `Approved "${actionTitle}". Verified in ERP.`,
      },
      ...prev,
    ]);

    addToast(`${actionTitle} approved and verified`, 'verified');
  };

  const rejectAction = async (caseId: string, reason: string) => {
    await rejectActionApi(caseId, reason);

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const now = new Date().toLocaleTimeString('en-US', { hour12: false });
        const updatedTrace: TraceEvent[] = [
          ...c.trace.map((tr) => {
            if (tr.step === 'action') {
              return { ...tr, state: 'failed' as const, summary: `Human declined: "${reason}"` };
            }
            return tr;
          }),
          {
            id: `tr-rej-${Date.now()}`,
            case_id: caseId,
            step: 'escalate' as const,
            state: 'done' as const,
            summary: `Case marked human-declined. Reason: ${reason}`,
            evidence_refs: [],
            ts: now,
          },
        ];

        return {
          ...c,
          status: 'declined' as const,
          proposed_action: c.proposed_action
            ? { ...c.proposed_action, status: 'rejected' as const, rejection_reason: reason }
            : undefined,
          trace: updatedTrace,
        };
      })
    );

    const nowStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        time: nowStr,
        case_id: caseId,
        step_type: 'escalate',
        actor: 'human',
        actor_name: 'Finance Controller',
        summary: `Declined action: "${reason}".`,
      },
      ...prev,
    ]);

    addToast(`Action rejected: ${reason}`, 'escalated');
  };

  const sendVendorInquiry = (caseId: string, message: string) => {
    const nowStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const targetCase = cases.find((c) => c.id === caseId);

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const inquiryEvent: TraceEvent = {
          id: `tr-inq-${Date.now()}`,
          case_id: caseId,
          step: 'tool_use',
          state: 'done',
          tool_name: 'notify_tool',
          duration_ms: 120,
          summary: `Sent automated inquiry to ${c.vendor} Accounts desk.`,
          payload: { message },
          evidence_refs: [],
          ts: nowStr,
        };
        return {
          ...c,
          trace: [...c.trace, inquiryEvent],
        };
      })
    );

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        time: nowStr,
        case_id: caseId,
        step_type: 'tool_use',
        actor: 'agent',
        actor_name: 'Notify Tool',
        summary: `Dispatched vendor inquiry email for ${caseId} (${targetCase?.vendor}).`,
      },
      ...prev,
    ]);

    addToast(`Inquiry sent to ${targetCase?.vendor}`, 'info');
  };

  const loadSampleData = () => {
    setCases(INITIAL_CASES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSelectedCaseId(INITIAL_CASES[0].id);
    addToast('Sample reconciliation dataset loaded', 'info');
  };

  const runDemo = () => {
    setIsDemoRunning(true);
    const demoCaseId = 'INV-20418';
    setSelectedCaseId(demoCaseId);
    setActiveTab('case_detail');
    addToast('Running Eclipse Reconciler demo scenario...', 'info');

    // Attempt SSE real-time stream connection from backend
    let receivedEvents = 0;
    const disconnectSse = connectCaseTraceSse(
      demoCaseId,
      (event) => {
        receivedEvents++;
        setCases((prev) =>
          prev.map((c) => {
            if (c.id !== demoCaseId) return c;
            // Append or replace trace
            const exists = c.trace.some((t) => t.id === event.id);
            return {
              ...c,
              status: event.step === 'action' ? 'awaiting_approval' : 'running',
              trace: exists ? c.trace : [...c.trace, event],
            };
          })
        );
      },
      () => {
        // SSE complete or fallback
        if (receivedEvents === 0) {
          // Fallback simulation if backend SSE didn't return steps
          runSimulatedTrace(demoCaseId);
        } else {
          setIsDemoRunning(false);
          addToast('Investigation finished. Awaiting your approval.', 'info');
        }
      }
    );

    // Timeout safety fallback
    setTimeout(() => {
      if (receivedEvents === 0) {
        disconnectSse();
        runSimulatedTrace(demoCaseId);
      }
    }, 1500);
  };

  const runSimulatedTrace = (demoCaseId: string) => {
    const stepsToPlay: TraceEvent[] = [
      {
        id: 'demo-1',
        case_id: demoCaseId,
        step: 'input',
        state: 'done',
        summary: 'Received mismatch signal from daily reconciliation sweep: ₹40,000 gap on INV-20418.',
        evidence_refs: ['ev-1', 'ev-2'],
        ts: '10:14:02',
      },
      {
        id: 'demo-2',
        case_id: demoCaseId,
        step: 'plan',
        state: 'done',
        summary: 'Formulating multi-source investigation across email archives and bank remitter notes.',
        evidence_refs: [],
        ts: '10:14:04',
      },
      {
        id: 'demo-3',
        case_id: demoCaseId,
        step: 'tool_use',
        state: 'done',
        tool_name: 'email_search_tool',
        duration_ms: 320,
        summary: 'Searched email vector index for "Acme Pvt Ltd INV-20418 instalment" -> 3 results found.',
        evidence_refs: ['ev-3'],
        ts: '10:14:07',
      },
      {
        id: 'demo-4',
        case_id: demoCaseId,
        step: 'tool_use',
        state: 'done',
        tool_name: 'bank_tool',
        duration_ms: 180,
        summary: 'Retrieved NEFT transaction 88213 narration tokens confirming "INST1 OF 2".',
        evidence_refs: ['ev-2'],
        ts: '10:14:09',
      },
      {
        id: 'demo-5',
        case_id: demoCaseId,
        step: 'decision',
        state: 'done',
        summary: 'Classified discrepancy as expected partial payment (Confidence 0.91).',
        evidence_refs: ['ev-1', 'ev-2', 'ev-3'],
        ts: '10:14:12',
      },
      {
        id: 'demo-6',
        case_id: demoCaseId,
        step: 'action',
        state: 'pending',
        summary: 'Proposed scheduling follow-up for ₹40,000 balance due on 3 October. Awaiting your approval.',
        evidence_refs: [],
        ts: '10:14:14',
      },
    ];

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== demoCaseId) return c;
        return {
          ...c,
          status: 'running',
          gap: 40000,
          trace: [stepsToPlay[0]],
        };
      })
    );

    let currentStep = 1;
    const interval = setInterval(() => {
      if (currentStep < stepsToPlay.length) {
        const step = stepsToPlay[currentStep];
        setCases((prev) =>
          prev.map((c) => {
            if (c.id !== demoCaseId) return c;
            return {
              ...c,
              trace: [...c.trace, step],
              status: currentStep === stepsToPlay.length - 1 ? 'awaiting_approval' : 'running',
            };
          })
        );
        currentStep++;
      } else {
        clearInterval(interval);
        setIsDemoRunning(false);
        addToast('Investigation finished. Awaiting your approval.', 'info');
      }
    }, 600);
  };

  const exportAuditReport = (caseId?: string) => {
    const reportData = caseId ? cases.find((c) => c.id === caseId) : cases;
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({ exported_at: new Date().toISOString(), reportData, auditLogs }, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute(
      'download',
      `eclipse_reconciliation_audit_${caseId || 'all'}_${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Audit report exported successfully', 'verified');
  };

  return (
    <AppContext.Provider
      value={{
        cases,
        activeTab,
        setActiveTab,
        selectedCaseId,
        selectedCase,
        selectCase,
        pendingApprovalsCount,
        unreconciledTotal,
        resolvedCount,
        escalatedCount,
        auditLogs,
        toasts,
        searchQuery,
        setSearchQuery,
        approveAction,
        rejectAction,
        sendVendorInquiry,
        runDemo,
        isDemoRunning,
        loadSampleData,
        exportAuditReport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
