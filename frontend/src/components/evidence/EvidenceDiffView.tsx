import React from 'react';
import { ArrowLeftRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Case } from '../../types';

interface EvidenceDiffViewProps {
  currentCase: Case;
}

export const EvidenceDiffView: React.FC<EvidenceDiffViewProps> = ({ currentCase }) => {
  const source = currentCase.source_record || {
    invoice_number: currentCase.invoice_id,
    billed_amount: `₹${currentCase.invoice_amount.toLocaleString('en-IN')}`,
    vendor_name: currentCase.vendor,
    mismatch_type: currentCase.mismatch_type,
  };

  const matched = currentCase.matched_record || {
    transaction_ref: 'Clearing Ledger Row',
    remitted_amount: `₹${currentCase.paid_amount.toLocaleString('en-IN')}`,
    reconciliation_gap: `₹${currentCase.gap.toLocaleString('en-IN')}`,
  };

  // Determine key comparison fields
  const diffRows = [
    {
      label: 'Document / Transaction ID',
      sourceVal: source.invoice_number || currentCase.invoice_id,
      matchedVal: matched.transaction_ref || matched.transaction_1 || 'Unmatched Entry',
      isMismatch: false,
    },
    {
      label: 'Vendor / Remitter Entity',
      sourceVal: source.vendor_name || currentCase.vendor,
      matchedVal: matched.remitter || currentCase.vendor,
      isMismatch: false,
    },
    {
      label: 'Monetary Value',
      sourceVal: source.billed_amount || `₹${currentCase.invoice_amount.toLocaleString('en-IN')}`,
      matchedVal: matched.remitted_amount || matched.total_disbursed || `₹${currentCase.paid_amount.toLocaleString('en-IN')}`,
      isMismatch: currentCase.gap > 0,
      gapText: currentCase.gap > 0 ? `Variance: ₹${currentCase.gap.toLocaleString('en-IN')}` : undefined,
    },
    {
      label: 'Terms & Schedule',
      sourceVal: source.payment_terms || 'Net 30 Single Disbursement',
      matchedVal: matched.narration || matched.vendor_call_agreement || 'Partial instalment recorded',
      isMismatch: currentCase.mismatch_type === 'partial' || currentCase.mismatch_type === 'price_variance',
    },
    {
      label: 'Statutory GST / Tax',
      sourceVal: source.gst_rate_clause || source.gstin || 'Standard Domestic (GST-exclusive)',
      matchedVal: matched.total_gst || matched.bank_clearing_status || 'Subject to statutory clearance',
      isMismatch: currentCase.mismatch_type === 'tax_fx',
    },
  ];

  return (
    <div className="bg-sheet rounded-panel border border-rule p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-rule">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-paper flex items-center justify-center text-ink">
            <ArrowLeftRight className="w-3.5 h-3.5 text-corona" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-ink tracking-tight">
              Two-Pane Record Diff (3-Second Visual Audit)
            </h3>
            <p className="text-[12px] text-ink-soft">
              Direct field comparison between ERP Source Record and Matched Bank/Disbursement Row
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
          {currentCase.gap > 0 ? `₹${currentCase.gap.toLocaleString('en-IN')} Gap Detected` : 'Reconciled'}
        </span>
      </div>

      {/* Side-by-Side Dual Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-paper rounded-control border border-rule/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft block">
            Raw Source Record (ERP Invoice)
          </span>
          <span className="text-[13px] font-mono font-semibold text-ink">
            {currentCase.invoice_id} · {currentCase.vendor}
          </span>
        </div>

        <div className="p-3 bg-paper rounded-control border border-rule/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft block">
            Matched Target Record (Bank / Ledger)
          </span>
          <span className="text-[13px] font-mono font-semibold text-ink">
            {matched.transaction_ref || matched.transaction_1 || 'Bank Clearing System'}
          </span>
        </div>
      </div>

      {/* Diff Table */}
      <div className="border border-rule rounded-control overflow-hidden divide-y divide-rule text-[13px]">
        {diffRows.map((row, idx) => (
          <div
            key={idx}
            className={`grid grid-cols-1 md:grid-cols-12 p-3 items-center transition-colors ${
              row.isMismatch
                ? 'bg-amber-500/[0.07] border-l-4 border-l-corona'
                : 'hover:bg-paper/40'
            }`}
          >
            {/* Field Label */}
            <div className="md:col-span-3 text-ink-soft font-medium text-[12px]">
              <div className="flex items-center gap-1.5">
                {row.isMismatch ? (
                  <AlertCircle className="w-3.5 h-3.5 text-corona flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-verified flex-shrink-0" />
                )}
                <span>{row.label}</span>
              </div>
            </div>

            {/* Left Source Value */}
            <div className="md:col-span-4 font-mono text-ink text-[12px] pr-2 break-words">
              {row.sourceVal}
            </div>

            {/* Middle Divider on desktop */}
            <div className="hidden md:flex md:col-span-1 justify-center text-ink-soft/40">
              <span className="text-[11px]">→</span>
            </div>

            {/* Right Matched Value */}
            <div className="md:col-span-4 font-mono text-[12px] break-words">
              <span
                className={
                  row.isMismatch
                    ? 'font-bold text-corona bg-amber-500/10 px-1.5 py-0.5 rounded inline-block'
                    : 'text-ink'
                }
              >
                {row.matchedVal}
              </span>
              {row.gapText && (
                <span className="block text-[11px] font-sans font-semibold text-corona mt-0.5">
                  {row.gapText}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
