import React, { useState, useEffect } from 'react';
import { ShieldCheck, XCircle, ExternalLink, Inbox, Keyboard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OverlapMark } from '../components/common/OverlapMark';
import { RejectModal } from '../components/common/RejectModal';

export const ApprovalInbox: React.FC = () => {
  const { cases, selectCase, approveAction, rejectAction, setActiveTab, addToast } = useApp();

  const pendingCases = cases.filter(
    (c) => c.status === 'awaiting_approval' && c.proposed_action?.status === 'pending'
  );

  const [activeCaseId, setActiveCaseId] = useState<string>(
    pendingCases[0]?.id || cases[0]?.id || ''
  );
  const [rejectingCaseId, setRejectingCaseId] = useState<string | null>(null);

  const currentCase = pendingCases.find((c) => c.id === activeCaseId) || pendingCases[0];

  // Keyboard navigation handler (F7)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input, textarea, or if modal is open
      const target = e.target as HTMLElement;
      if (
        rejectingCaseId ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (pendingCases.length === 0) return;

      const currentIndex = pendingCases.findIndex((c) => c.id === (currentCase?.id || activeCaseId));

      switch (e.key.toLowerCase()) {
        case 'a': {
          e.preventDefault();
          if (currentCase) {
            handleApprove(currentCase.id);
          }
          break;
        }
        case 'r': {
          e.preventDefault();
          if (currentCase) {
            setRejectingCaseId(currentCase.id);
          }
          break;
        }
        case 'j':
        case 'arrowdown': {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % pendingCases.length;
          setActiveCaseId(pendingCases[nextIndex].id);
          break;
        }
        case 'k':
        case 'arrowup': {
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + pendingCases.length) % pendingCases.length;
          setActiveCaseId(pendingCases[prevIndex].id);
          break;
        }
        case 'enter': {
          e.preventDefault();
          if (currentCase) {
            selectCase(currentCase.id);
            setActiveTab('case_detail');
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingCases, activeCaseId, currentCase, rejectingCaseId, selectCase, setActiveTab, addToast]);

  const handleApprove = (id: string) => {
    approveAction(id);
    // Auto-advance to next pending item if available
    const remaining = pendingCases.filter((c) => c.id !== id);
    if (remaining.length > 0) {
      setActiveCaseId(remaining[0].id);
    }
  };

  const handleRejectConfirm = (reason: string) => {
    if (rejectingCaseId) {
      rejectAction(rejectingCaseId, reason);
      const remaining = pendingCases.filter((c) => c.id !== rejectingCaseId);
      if (remaining.length > 0) {
        setActiveCaseId(remaining[0].id);
      }
      setRejectingCaseId(null);
    }
  };

  if (pendingCases.length === 0) {
    return (
      <div className="bg-sheet rounded-panel border border-rule p-12 text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-verified/10 text-verified flex items-center justify-center mx-auto">
          <Inbox className="w-6 h-6" />
        </div>
        <h2 className="text-[20px] font-bold text-ink tracking-tight">
          Approval inbox clear
        </h2>
        <p className="text-[14px] text-ink-soft leading-relaxed">
          Nothing waiting on you. The agent will ask here when it needs a decision on consequential ledger actions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Keyboard Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-ink tracking-tight">
            Pending approvals
          </h1>
          <p className="text-[13px] text-ink-soft">
            Autonomous policy guardrails require human sign-off for consequential ledger writes and disbursements.
          </p>
        </div>

        {/* Keyboard Shortcuts Legend Banner (F7) */}
        <div className="flex items-center gap-2 bg-paper px-3 py-1.5 rounded-control border border-rule text-[12px] text-ink-soft shadow-sm">
          <Keyboard className="w-4 h-4 text-corona" />
          <span className="font-semibold text-ink">Shortcuts:</span>
          <span className="inline-flex items-center gap-1 font-mono bg-white px-1.5 py-0.5 rounded border border-rule text-ink font-bold text-[11px]">
            A
          </span>
          <span>Approve</span>
          <span className="inline-flex items-center gap-1 font-mono bg-white px-1.5 py-0.5 rounded border border-rule text-ink font-bold text-[11px]">
            R
          </span>
          <span>Reject</span>
          <span className="inline-flex items-center gap-1 font-mono bg-white px-1.5 py-0.5 rounded border border-rule text-ink font-bold text-[11px]">
            J / K
          </span>
          <span>Navigate</span>
          <span className="inline-flex items-center gap-1 font-mono bg-white px-1.5 py-0.5 rounded border border-rule text-ink font-bold text-[11px]">
            ↵
          </span>
          <span>Detail</span>
        </div>
      </div>

      {/* Two-pane layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left pane: Approval items list */}
        <div className="lg:col-span-5 bg-sheet rounded-panel border border-rule overflow-hidden divide-y divide-rule/70">
          <div className="p-3 bg-paper/60 text-[12px] font-medium text-ink-soft flex items-center justify-between">
            <span>Pending action queue ({pendingCases.length})</span>
            <span className="text-[11px] font-mono text-ink-soft">Use J / K to move</span>
          </div>

          <div className="divide-y divide-rule/60 max-h-[600px] overflow-y-auto">
            {pendingCases.map((c, idx) => {
              const isSelected = currentCase?.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveCaseId(c.id)}
                  className={`p-4 cursor-pointer transition-colors relative ${
                    isSelected
                      ? 'bg-amber-500/[0.08] border-l-4 border-l-corona ring-1 ring-corona/30'
                      : 'hover:bg-[#F7F9FB]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <OverlapMark size={24} gapAmount={c.gap} isResolved={false} />
                      <span className="font-mono text-[13px] font-bold text-ink">
                        {c.id}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-ink text-white font-mono">
                          ACTIVE [#{idx + 1}]
                        </span>
                      )}
                    </div>
                    <span className="num font-bold text-ink text-[14px]">
                      ₹{c.gap.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="text-[13px] text-ink font-medium leading-snug">
                    {c.proposed_action?.title || 'Consequential action'}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-ink-soft mt-2">
                    <span>{c.vendor}</span>
                    <span className="num">{c.age}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right pane: Action review & decision */}
        <div className="lg:col-span-7 bg-sheet rounded-panel border border-rule p-6 space-y-6">
          {currentCase && (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-rule">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[18px] font-bold text-ink">
                      {currentCase.id}
                    </span>
                    <span className="text-ink-soft">·</span>
                    <span className="text-[16px] font-semibold text-ink">
                      {currentCase.vendor}
                    </span>
                  </div>
                  <span className="text-[12px] text-ink-soft mt-0.5 block">
                    Discrepancy gap: ₹{currentCase.gap.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    selectCase(currentCase.id);
                    setActiveTab('case_detail');
                  }}
                  className="h-[34px] px-3 rounded-control border border-rule bg-white hover:bg-paper text-ink font-medium text-[12px] flex items-center gap-1.5 transition-colors"
                  title="Press [Enter] to open"
                >
                  <span>Open full case</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="font-mono text-[10px] bg-paper px-1 py-0.5 rounded border border-rule text-ink-soft">
                    ↵
                  </span>
                </button>
              </div>

              {/* Proposed action & impact statement */}
              <div className="space-y-4">
                <h3 className="text-[15px] font-bold text-ink">
                  {currentCase.proposed_action?.title}
                </h3>

                {/* Impact statement */}
                <div className="p-3.5 bg-paper rounded-control border border-rule text-[13px] font-medium text-ink leading-relaxed">
                  {currentCase.proposed_action?.impact_statement}
                </div>

                {/* Target change diff */}
                {currentCase.proposed_action?.target_field && (
                  <div className="grid grid-cols-2 gap-3 text-[12px]">
                    <div className="p-3 bg-paper/50 rounded-control border border-rule">
                      <span className="text-ink-soft block font-mono text-[11px] mb-1">
                        Current system state
                      </span>
                      <span className="font-mono text-ink">
                        {currentCase.proposed_action.old_value}
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-control border border-verified/50">
                      <span className="text-verified block font-mono text-[11px] mb-1">
                        Proposed target update
                      </span>
                      <span className="font-mono font-semibold text-ink">
                        {currentCase.proposed_action.new_value}
                      </span>
                    </div>
                  </div>
                )}

                {/* Evidence summary with Voice Call / WhatsApp callouts */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-semibold text-ink">
                      Evidence summary ({currentCase.evidence.length} sources)
                    </span>
                    <span className="text-[11px] text-ink-soft">
                      Confidence: {(currentCase.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    {currentCase.evidence.map((ev) => (
                      <div
                        key={ev.id}
                        className={`p-2.5 rounded-control border text-[12px] ${
                          ev.source_type === 'call'
                            ? 'bg-indigo-50/40 border-indigo-200'
                            : ev.source_type === 'whatsapp'
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-paper/40 border-rule'
                        }`}
                      >
                        <div className="flex items-center justify-between text-ink-soft mb-1 font-mono text-[11px]">
                          <span className="font-semibold text-ink">{ev.ref_id}</span>
                          <span>{ev.title}</span>
                        </div>
                        <p className="text-ink font-normal">{ev.snippet}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decision controls with keyboard badges */}
                <div className="pt-4 border-t border-rule flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleApprove(currentCase.id)}
                      className="h-[38px] px-5 rounded-control bg-verified hover:bg-verified/90 text-white font-medium text-[14px] flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Approve</span>
                      <span className="font-mono text-[11px] bg-white/20 px-1.5 py-0.5 rounded font-bold">
                        A
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRejectingCaseId(currentCase.id)}
                      className="h-[38px] px-4 rounded-control bg-white hover:bg-escalated/5 border border-escalated text-escalated font-medium text-[14px] flex items-center gap-2 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                      <span className="font-mono text-[11px] bg-escalated/10 px-1.5 py-0.5 rounded font-bold">
                        R
                      </span>
                    </button>
                  </div>

                  <span className="text-[12px] text-ink-soft hidden sm:inline">
                    Press <kbd className="px-1.5 py-0.5 bg-paper rounded border border-rule font-mono font-bold text-[11px]">A</kbd> to approve, <kbd className="px-1.5 py-0.5 bg-paper rounded border border-rule font-mono font-bold text-[11px]">R</kbd> to reject
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingCaseId && (
        <RejectModal
          isOpen={true}
          caseId={rejectingCaseId}
          onClose={() => setRejectingCaseId(null)}
          onSubmit={handleRejectConfirm}
        />
      )}
    </div>
  );
};
