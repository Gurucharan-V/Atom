import React, { useState } from 'react';
import { ShieldCheck, XCircle, ExternalLink, Inbox } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OverlapMark } from '../components/common/OverlapMark';
import { RejectModal } from '../components/common/RejectModal';

export const ApprovalInbox: React.FC = () => {
  const { cases, selectCase, approveAction, rejectAction } = useApp();

  const pendingCases = cases.filter(
    (c) => c.status === 'awaiting_approval' && c.proposed_action?.status === 'pending'
  );

  const [activeCaseId, setActiveCaseId] = useState<string>(
    pendingCases[0]?.id || cases[0]?.id || ''
  );
  const [rejectingCaseId, setRejectingCaseId] = useState<string | null>(null);

  const currentCase = pendingCases.find((c) => c.id === activeCaseId) || pendingCases[0];

  const handleApprove = (id: string) => {
    approveAction(id);
  };

  const handleRejectConfirm = (reason: string) => {
    if (rejectingCaseId) {
      rejectAction(rejectingCaseId, reason);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-ink tracking-tight">
            Pending approvals
          </h1>
          <p className="text-[13px] text-ink-soft">
            Autonomous policy guardrails require human sign-off for consequential ledger writes and disbursements.
          </p>
        </div>
        <span className="font-mono text-[13px] text-ink font-semibold bg-pending/10 text-pending px-3 py-1 rounded-control border border-pending/30">
          {pendingCases.length} items awaiting review
        </span>
      </div>

      {/* Two-pane layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left pane: Approval items list */}
        <div className="lg:col-span-5 bg-sheet rounded-panel border border-rule overflow-hidden divide-y divide-rule/70">
          <div className="p-3 bg-paper/60 text-[12px] font-medium text-ink-soft">
            Pending action queue
          </div>

          <div className="divide-y divide-rule/60 max-h-[600px] overflow-y-auto">
            {pendingCases.map((c) => {
              const isSelected = currentCase?.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveCaseId(c.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#F2F5F9] border-l-4 border-l-ink' : 'hover:bg-[#F7F9FB]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <OverlapMark size={24} gapAmount={c.gap} isResolved={false} />
                      <span className="font-mono text-[13px] font-bold text-ink">
                        {c.id}
                      </span>
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
                  onClick={() => selectCase(currentCase.id)}
                  className="h-[34px] px-3 rounded-control border border-rule bg-white hover:bg-paper text-ink font-medium text-[12px] flex items-center gap-1.5 transition-colors"
                >
                  <span>Open full case</span>
                  <ExternalLink className="w-3.5 h-3.5" />
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

                {/* Evidence summary */}
                <div className="pt-2">
                  <span className="text-[12px] font-semibold text-ink block mb-2">
                    Evidence summary ({currentCase.evidence.length} sources)
                  </span>
                  <div className="space-y-2">
                    {currentCase.evidence.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-2.5 bg-paper/40 rounded-control border border-rule text-[12px]"
                      >
                        <div className="flex items-center justify-between text-ink-soft mb-1 font-mono text-[11px]">
                          <span>{ev.ref_id}</span>
                          <span>{ev.title}</span>
                        </div>
                        <p className="text-ink font-normal">{ev.snippet}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decision controls */}
                <div className="pt-4 border-t border-rule flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleApprove(currentCase.id)}
                    className="h-[38px] px-5 rounded-control bg-verified hover:bg-verified/90 text-white font-medium text-[14px] flex items-center gap-2 transition-colors focus:ring-2 focus:ring-pending focus:ring-offset-2 outline-none"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Approve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRejectingCaseId(currentCase.id)}
                    className="h-[38px] px-4 rounded-control bg-white hover:bg-escalated/5 border border-escalated text-escalated font-medium text-[14px] flex items-center gap-2 transition-colors focus:ring-2 focus:ring-pending focus:ring-offset-2 outline-none"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
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
