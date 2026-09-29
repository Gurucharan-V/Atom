import React, { useState } from 'react';
import { ArrowLeft, Play, ShieldCheck, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OverlapMark } from '../components/common/OverlapMark';
import { StatusTag } from '../components/common/StatusTag';
import { TraceTape } from '../components/trace/TraceTape';
import { EvidencePanel } from '../components/evidence/EvidencePanel';
import { RejectModal } from '../components/common/RejectModal';

export const CaseDetail: React.FC = () => {
  const {
    selectedCase,
    setActiveTab,
    approveAction,
    rejectAction,
    exportAuditReport,
    runDemo,
    isDemoRunning,
  } = useApp();

  const [highlightedEvidenceId, setHighlightedEvidenceId] = useState<string | undefined>();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  if (!selectedCase) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-soft">No case selected.</p>
        <button
          type="button"
          onClick={() => setActiveTab('cases')}
          className="mt-3 px-4 py-2 bg-ink text-white rounded-control text-[13px]"
        >
          Back to cases list
        </button>
      </div>
    );
  }

  const isResolved = selectedCase.status === 'resolved' || selectedCase.gap === 0;

  const handleSelectEvidenceFromTrace = (evidenceId: string) => {
    setHighlightedEvidenceId(evidenceId);
    const element = document.getElementById(`evidence-${evidenceId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleApprove = () => {
    approveAction(selectedCase.id);
  };

  const handleRejectSubmit = (reason: string) => {
    rejectAction(selectedCase.id, reason);
    setIsRejectModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Back button & quick actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveTab('cases')}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All cases</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportAuditReport(selectedCase.id)}
            className="h-[34px] px-3 rounded-control bg-white border border-rule hover:bg-paper text-ink-soft text-[12px] font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export case report</span>
          </button>
          <button
            type="button"
            onClick={runDemo}
            disabled={isDemoRunning}
            className="h-[34px] px-3 rounded-control bg-ink text-white hover:bg-ink/90 text-[12px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isDemoRunning ? 'animate-spin' : ''}`} />
            <span>Re-run trace</span>
          </button>
        </div>
      </div>

      {/* Case Header Hero Box */}
      <div className="bg-sheet rounded-panel border border-rule p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-5 border-b border-rule">
          <div className="flex items-center gap-5">
            {/* 72px Hero Overlap Mark with Animated Crescent */}
            <OverlapMark
              size={72}
              gapAmount={selectedCase.gap}
              isResolved={isResolved}
            />

            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[20px] font-bold text-ink">
                  {selectedCase.id}
                </span>
                <span className="text-[18px] text-ink-soft">·</span>
                <span className="text-[18px] font-semibold text-ink">
                  {selectedCase.vendor}
                </span>
              </div>
              <p className="text-[13px] text-ink-soft mt-0.5">
                Mismatch: {selectedCase.mismatch_type.replace('_', ' ')}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[12px] font-medium text-ink-soft block uppercase tracking-wider">
              {isResolved ? 'Reconciled gap' : 'Amount gap'}
            </span>
            <div className="inline-flex items-baseline gap-1.5">
              <span
                className={`text-[28px] font-bold num ${
                  isResolved ? 'text-verified' : 'text-corona'
                }`}
              >
                ₹{selectedCase.gap.toLocaleString('en-IN')}
              </span>
            </div>
            {isResolved && (
              <span className="flex items-center sm:justify-end gap-1 text-[12px] text-verified font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero variance confirmed
              </span>
            )}
          </div>
        </div>

        {/* 3 Labeled Values in plain text */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-[13px]">
          <div>
            <span className="text-ink-soft block text-[12px]">Invoice billed</span>
            <span className="font-mono font-medium text-ink text-[14px]">
              ₹{selectedCase.invoice_amount.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className="text-ink-soft block text-[12px]">Payment recorded</span>
            <span className="font-mono font-medium text-ink text-[14px]">
              ₹{selectedCase.paid_amount.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className="text-ink-soft block text-[12px]">Reconciliation state</span>
            <div className="mt-0.5">
              <StatusTag status={selectedCase.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-region content: Left Trace Tape (44%) + Right Evidence Panel (56%) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Dark Trace Tape (~44% width) */}
        <div className="xl:col-span-5">
          <TraceTape
            trace={selectedCase.trace}
            caseId={selectedCase.id}
            isLive={selectedCase.status === 'running' || isDemoRunning}
            onSelectEvidence={handleSelectEvidenceFromTrace}
          />
        </div>

        {/* Right: Evidence, Conclusion, and Proposed Action */}
        <div className="xl:col-span-7">
          <EvidencePanel
            caseId={selectedCase.id}
            vendorName={selectedCase.vendor}
            evidence={selectedCase.evidence}
            conclusion={selectedCase.conclusion}
            confidence={selectedCase.confidence}
            proposedAction={selectedCase.proposed_action}
            highlightedEvidenceId={highlightedEvidenceId}
            onApprove={handleApprove}
            onReject={() => setIsRejectModalOpen(true)}
            isResolved={isResolved}
          />
        </div>
      </div>

      {/* Reject with comment modal */}
      <RejectModal
        isOpen={isRejectModalOpen}
        caseId={selectedCase.id}
        onClose={() => setIsRejectModalOpen(false)}
        onSubmit={handleRejectSubmit}
      />
    </div>
  );
};
