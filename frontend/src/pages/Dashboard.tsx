import React, { useState } from 'react';
import { Play, ArrowRight, ShieldCheck, AlertTriangle, UploadCloud } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OverlapMark } from '../components/common/OverlapMark';
import { ConfidenceBar } from '../components/common/ConfidenceBar';
import { DocumentIngestModal } from '../components/common/DocumentIngestModal';
import type { MismatchType } from '../types';

const MISMATCH_LABELS: Record<MismatchType, string> = {
  partial: 'Partial payment',
  duplicate: 'Duplicate payment',
  missing: 'Missing payment',
  unmatched: 'Unmatched payment',
  price_variance: 'Price variance',
  tax_fx: 'Tax (GST) or Forex variance',
  entity: 'Vendor name mismatch',
};

export const Dashboard: React.FC = () => {
  const {
    cases,
    selectCase,
    unreconciledTotal,
    pendingApprovalsCount,
    resolvedCount,
    escalatedCount,
    runDemo,
    isDemoRunning,
  } = useApp();

  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);

  const openCasesCount = cases.filter((c) => c.status !== 'resolved').length;
  const pendingCases = cases.filter(
    (c) => c.status === 'awaiting_approval' && c.proposed_action?.status === 'pending'
  );

  // Group cases by mismatch type
  const mismatchCounts = (['partial', 'duplicate', 'missing', 'price_variance', 'tax_fx', 'unmatched'] as MismatchType[]).map(
    (type) => {
      const count = cases.filter((c) => c.mismatch_type === type).length;
      const typeGap = cases
        .filter((c) => c.mismatch_type === type && c.status !== 'resolved')
        .reduce((sum, c) => sum + c.gap, 0);
      return {
        type,
        label: MISMATCH_LABELS[type],
        count,
        gap: typeGap,
      };
    }
  );

  const maxCount = Math.max(...mismatchCounts.map((m) => m.count), 1);

  return (
    <div className="space-y-8">
      {/* Top headline section */}
      <div className="bg-sheet rounded-panel border border-rule p-6 flex flex-col md:flex-row md:items-end justify-between gap-6 glass-card">
        <div>
          <div className="inline-block relative">
            <h1 className="text-[44px] leading-[48px] font-bold text-ink tracking-tight font-ui">
              ₹{unreconciledTotal.toLocaleString('en-IN')}{' '}
              <span className="text-[28px] font-medium text-ink-soft">
                still unreconciled
              </span>
            </h1>
            {/* 4px --corona underline bar */}
            <div className="h-[4px] bg-corona rounded-full w-full mt-1.5 shadow-sm" />
          </div>

          <div className="mt-4 text-[15px] text-ink-soft space-y-0.5 leading-snug">
            <p>{openCasesCount} open cases across ledger, invoices, call transcripts & WhatsApp</p>
            <p className="font-semibold text-ink">
              {pendingApprovalsCount} awaiting your decision
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* F2: Ingest Document button */}
          <button
            type="button"
            onClick={() => setIsIngestModalOpen(true)}
            className="h-[42px] px-4 rounded-control bg-paper border border-rule hover:border-corona text-ink font-semibold text-[13px] flex items-center gap-2 transition-all shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-corona" />
            <span>Ingest Document / Audio</span>
          </button>

          <button
            type="button"
            onClick={runDemo}
            disabled={isDemoRunning}
            className="h-[42px] px-6 rounded-control bg-ink hover:bg-ink/90 active:scale-95 text-white font-medium text-[14px] flex items-center gap-2 transition-all shadow-md focus:ring-2 focus:ring-pending focus:ring-offset-2 outline-none disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${isDemoRunning ? 'animate-spin text-corona' : ''}`} />
            <span>{isDemoRunning ? 'Running Live Trace...' : 'Run Demo Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Two-column layout: Needs your approval vs Handled by agent */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Needs your approval */}
        <div className="lg:col-span-8 bg-sheet rounded-panel border border-rule p-6 glass-card">
          <div className="flex items-center justify-between pb-3 border-b border-rule mb-4">
            <h2 className="text-[17px] font-bold text-ink tracking-tight">
              Needs your approval
            </h2>
            <span className="text-[12px] font-mono text-ink-soft bg-paper px-2.5 py-1 rounded-full border border-rule">
              {pendingCases.length} pending
            </span>
          </div>

          {pendingCases.length === 0 ? (
            <div className="py-8 text-center text-ink-soft text-[14px]">
              No actions currently awaiting your decision. All clear.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-rule text-[12px] font-semibold text-ink-soft">
                    <th className="pb-2.5 font-normal">Case</th>
                    <th className="pb-2.5 font-normal">Proposed action</th>
                    <th className="pb-2.5 font-normal">Agent Confidence</th>
                    <th className="pb-2.5 font-normal text-right">Amount gap</th>
                    <th className="pb-2.5 font-normal text-right">Age</th>
                    <th className="pb-2.5 font-normal text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule/60 text-[13px]">
                  {pendingCases.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => selectCase(c.id)}
                      className="hover:bg-[#F7F9FB] cursor-pointer transition-colors group h-[52px]"
                    >
                      <td className="py-2">
                        <div className="flex items-center gap-2.5">
                          <OverlapMark size={24} gapAmount={c.gap} isResolved={c.gap === 0} />
                          <div>
                            <span className="font-mono font-bold text-ink block group-hover:text-pending transition-colors">
                              {c.id}
                            </span>
                            <span className="text-[11px] text-ink-soft">
                              {c.vendor}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 text-ink font-medium max-w-[240px] truncate">
                        {c.proposed_action?.title || 'Review case'}
                      </td>
                      <td className="py-2">
                        <ConfidenceBar
                          confidence={c.confidence}
                          priorConfidence={c.prior_confidence}
                          reason={c.confidence_reason}
                          compact={true}
                        />
                      </td>
                      <td className="py-2 text-right num font-bold text-ink">
                        ₹{c.gap.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 text-right num text-ink-soft text-[12px]">
                        {c.age}
                      </td>
                      <td className="py-2 text-right">
                        <span className="inline-flex items-center gap-1 text-[12px] text-pending font-semibold group-hover:translate-x-1 transition-transform">
                          <span>Review</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column: Handled by the agent */}
        <div className="lg:col-span-4 bg-sheet rounded-panel border border-rule p-6 flex flex-col justify-between glass-card">
          <div>
            <div className="pb-3 border-b border-rule mb-4">
              <h2 className="text-[17px] font-bold text-ink tracking-tight">
                Handled by the agent
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-paper rounded-panel border border-rule interactive-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4.5 h-4.5 text-verified" />
                    <span className="text-[13px] font-semibold text-ink">
                      Resolved & verified
                    </span>
                  </div>
                  <span className="num text-[22px] font-bold text-verified">
                    {resolvedCount}
                  </span>
                </div>
                <p className="text-[12px] text-ink-soft mt-1 leading-normal">
                  Reminders issued, minor variances auto-booked, GST slab matches resolved.
                </p>
              </div>

              <div className="p-4 bg-paper rounded-panel border border-rule interactive-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4.5 h-4.5 text-escalated" />
                    <span className="text-[13px] font-semibold text-ink">
                      Escalated (Low confidence)
                    </span>
                  </div>
                  <span className="num text-[22px] font-bold text-escalated">
                    {escalatedCount}
                  </span>
                </div>
                <p className="text-[12px] text-ink-soft mt-1 leading-normal">
                  Ambiguous narration or unmatched party identity requiring human intervention.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-rule mt-6 text-[12px] text-ink-soft font-mono">
            Autonomous rate: {cases.length > 0 ? Math.round(((resolvedCount) / cases.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Breakdown by mismatch type */}
      <div className="bg-sheet rounded-panel border border-rule p-6 glass-card">
        <h2 className="text-[17px] font-bold text-ink tracking-tight mb-4">
          Breakdown by mismatch type
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {mismatchCounts.map((m) => (
            <div key={m.type} className="p-4 bg-paper rounded-control border border-rule">
              <span className="text-[12px] font-medium text-ink-soft block mb-1 truncate" title={m.label}>
                {m.label}
              </span>
              <div className="flex items-baseline justify-between">
                <span className="num text-[20px] font-bold text-ink">
                  {m.count}
                </span>
                <span className="num text-[12px] text-ink-soft">
                  ₹{m.gap.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="w-full bg-rule h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-ink h-full rounded-full"
                  style={{ width: `${(m.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ingest Modal */}
      <DocumentIngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
      />
    </div>
  );
};
