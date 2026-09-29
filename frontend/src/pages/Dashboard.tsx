import React from 'react';
import { Play, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OverlapMark } from '../components/common/OverlapMark';
import type { MismatchType } from '../types';

const MISMATCH_LABELS: Record<MismatchType, string> = {
  partial: 'Partial payment',
  duplicate: 'Duplicate payment',
  missing: 'Missing payment',
  unmatched: 'Unmatched payment',
  price_variance: 'Price variance',
  tax_fx: 'Tax or currency variance',
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

  const openCasesCount = cases.filter((c) => c.status !== 'resolved').length;
  const pendingCases = cases.filter(
    (c) => c.status === 'awaiting_approval' && c.proposed_action?.status === 'pending'
  );

  // Group cases by mismatch type
  const mismatchCounts = (['partial', 'duplicate', 'missing', 'price_variance', 'unmatched'] as MismatchType[]).map(
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
            <p>{openCasesCount} open cases across ledger & invoice streams</p>
            <p className="font-semibold text-ink">
              {pendingApprovalsCount} awaiting your decision
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
                      <td className="py-2 text-ink font-medium max-w-[260px] truncate">
                        {c.proposed_action?.title || 'Review case'}
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
                <p className="text-[12px] text-ink-soft mt-1.5 leading-normal">
                  Autonomous reminders and approved ledger corrections verified in mock ERP.
                </p>
              </div>

              <div className="p-4 bg-paper rounded-panel border border-rule interactive-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4.5 h-4.5 text-escalated" />
                    <span className="text-[13px] font-semibold text-ink">
                      Escalated to human
                    </span>
                  </div>
                  <span className="num text-[22px] font-bold text-escalated">
                    {escalatedCount}
                  </span>
                </div>
                <p className="text-[12px] text-ink-soft mt-1.5 leading-normal">
                  Ambiguous narration or confidence below policy threshold (0.75).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-rule text-[12px] text-ink-soft flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-verified" />
            Zero hallucinations — all classifications require explicit citations.
          </div>
        </div>
      </div>

      {/* Bottom section: Cases by mismatch type */}
      <div className="bg-sheet rounded-panel border border-rule p-6 glass-card">
        <div className="pb-3 border-b border-rule mb-5 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-ink tracking-tight">
            Cases by mismatch type
          </h2>
          <span className="text-[12px] font-mono text-ink-soft">
            Distribution across open & resolved
          </span>
        </div>

        <div className="space-y-4">
          {mismatchCounts.map((m) => {
            const widthPct = Math.max(Math.round((m.count / maxCount) * 100), 12);
            return (
              <div key={m.type} className="flex items-center gap-4 text-[13px]">
                <div className="w-[180px] flex items-center gap-2 flex-shrink-0">
                  <OverlapMark size={24} gapAmount={m.gap} isResolved={m.gap === 0} />
                  <span className="font-semibold text-ink">{m.label}</span>
                </div>

                <div className="flex-1 bg-paper h-[24px] rounded-control overflow-hidden flex items-center p-0.5 border border-rule/50">
                  <div
                    className="bg-ink h-full rounded-control transition-all duration-700 shadow-sm"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>

                <div className="w-[120px] text-right flex items-center justify-end gap-2 flex-shrink-0">
                  <span className="num font-bold text-ink text-[14px]">
                    {m.count}
                  </span>
                  <span className="text-[11px] text-ink-soft font-mono">
                    (₹{(m.gap / 1000).toFixed(0)}k gap)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
