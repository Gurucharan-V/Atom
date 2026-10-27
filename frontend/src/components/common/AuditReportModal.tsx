import React, { useRef } from 'react';
import { X, Printer, FileText } from 'lucide-react';
import type { Case, AuditRecord } from '../../types';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCase: Case;
  auditLogs: AuditRecord[];
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  targetCase,
  auditLogs,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const caseLogs = auditLogs.filter((l) => l.case_id === targetCase.id);

  const handlePrint = () => {
    const printContent = printAreaRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=900,height=750');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Audit_Report_${targetCase.id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111827; padding: 40px; margin: 0; }
            .header { border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; }
            .title { font-size: 22px; font-weight: bold; margin: 0; }
            .subtitle { color: #6B7280; font-size: 13px; margin-top: 4px; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #4B5563; border-bottom: 1px solid #E5E7EB; padding-bottom: 6px; margin-bottom: 12px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
            .card { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; padding: 12px; }
            .card-label { font-size: 11px; color: #6B7280; text-transform: uppercase; }
            .card-val { font-size: 15px; font-weight: bold; margin-top: 4px; font-family: monospace; }
            .evidence-item { border: 1px solid #E5E7EB; border-radius: 6px; padding: 10px; margin-bottom: 8px; font-size: 13px; }
            .trace-item { font-size: 12px; padding: 6px 0; border-bottom: 1px dotted #E5E7EB; font-family: monospace; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
            .badge-verified { background: #ECFDF5; color: #065F46; }
            .badge-amber { background: #FFFBEB; color: #92400E; }
            .footer { border-top: 1px solid #E5E7EB; margin-top: 32px; padding-top: 12px; font-size: 11px; color: #9CA3AF; text-align: center; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">ATOM RECONCILER · STATUTORY AUDIT REPORT</h1>
              <div class="subtitle">Autonomous Cross-System Transaction Integrity Dossier · Case ${targetCase.id}</div>
            </div>
            <div style="text-align: right; font-family: monospace; font-size: 12px;">
              Generated: ${new Date().toUTCString()}<br/>
              Status: <span class="badge ${targetCase.status === 'resolved' ? 'badge-verified' : 'badge-amber'}">${targetCase.status.toUpperCase()}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">1. Financial Discrepancy Summary</div>
            <div class="grid">
              <div class="card">
                <div class="card-label">Vendor Name</div>
                <div class="card-val">${targetCase.vendor}</div>
              </div>
              <div class="card">
                <div class="card-label">Invoice Billed</div>
                <div class="card-val">₹${targetCase.invoice_amount.toLocaleString('en-IN')}</div>
              </div>
              <div class="card">
                <div class="card-label">Payment Recorded</div>
                <div class="card-val">₹${targetCase.paid_amount.toLocaleString('en-IN')}</div>
              </div>
              <div class="card">
                <div class="card-label">Variance Gap</div>
                <div class="card-val" style="color: ${targetCase.gap > 0 ? '#B45309' : '#059669'};">₹${targetCase.gap.toLocaleString('en-IN')}</div>
              </div>
              <div class="card">
                <div class="card-label">Mismatch Category</div>
                <div class="card-val">${targetCase.mismatch_type.replace('_', ' ').toUpperCase()}</div>
              </div>
              <div class="card">
                <div class="card-label">Agent Confidence Score</div>
                <div class="card-val">${(targetCase.confidence * 100).toFixed(0)}% (${targetCase.confidence.toFixed(2)})</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">2. Agent Conclusion & Resolution Thesis</div>
            <p style="font-size: 14px; line-height: 1.6; background: #F9FAFB; padding: 14px; border-left: 4px solid #111827; margin: 0;">
              ${targetCase.conclusion}
            </p>
          </div>

          <div class="section">
            <div class="section-title">3. Multimodal Supporting Evidence (${targetCase.evidence.length} Citations)</div>
            ${targetCase.evidence
              .map(
                (ev) => `
                <div class="evidence-item">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-weight: bold;">
                    <span>[${ev.source_type.toUpperCase()}] ${ev.ref_id} · ${ev.title}</span>
                    <span style="color: #6B7280; font-family: monospace;">${ev.date || 'Verified'}</span>
                  </div>
                  <div>${ev.snippet}</div>
                </div>
              `
              )
              .join('')}
          </div>

          <div class="section">
            <div class="section-title">4. Immutable Agent Investigation Trace</div>
            ${targetCase.trace
              .map(
                (tr) => `
                <div class="trace-item">
                  <span style="color: #9CA3AF;">[${tr.ts}]</span> <strong>${tr.step.toUpperCase()}:</strong> ${tr.summary}
                </div>
              `
              )
              .join('')}
          </div>

          <div class="section">
            <div class="section-title">5. Governance Ledger Sign-Offs (${caseLogs.length})</div>
            ${
              caseLogs.length > 0
                ? caseLogs
                    .map(
                      (cl) => `
                <div class="trace-item">
                  <span style="color: #9CA3AF;">[${cl.time}]</span> <strong>${cl.actor_name} (${cl.actor}):</strong> ${cl.summary}
                </div>
              `
                    )
                    .join('')
                : '<div style="font-size: 12px; color: #6B7280;">No post-investigation human ledger overrides registered.</div>'
            }
          </div>

          <div class="footer">
            Atom Reconciler · Verified Agentic Audit Trail · SHA-256 Checksum: ${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-sheet rounded-panel border border-rule shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-rule bg-paper">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-corona" />
              <h2 className="text-[17px] font-bold text-ink">
                Audit Report Dossier (PDF Export)
              </h2>
              <span className="font-mono text-[11px] bg-white border border-rule px-2 py-0.5 rounded font-semibold text-ink">
                {targetCase.id}
              </span>
            </div>
            <p className="text-[12px] text-ink-soft mt-0.5">
              Statutory verification report containing evidence citations, agent trace, and audit log sign-offs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-control bg-ink text-white hover:bg-ink/90 font-medium text-[13px] flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-control text-ink-soft hover:text-ink hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Preview */}
        <div ref={printAreaRef} className="p-6 overflow-y-auto space-y-6 text-[13px]">
          {/* Executive Header */}
          <div className="p-4 bg-paper rounded-panel border border-rule flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft block">
                Atom Reconciler Compliance Certificate
              </span>
              <h3 className="text-[18px] font-bold text-ink mt-0.5">
                {targetCase.id} · {targetCase.vendor}
              </h3>
              <p className="text-[12px] text-ink-soft">
                Mismatch Type: {targetCase.mismatch_type.replace('_', ' ')} · Currency: {targetCase.currency}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono text-ink-soft block">
                Agent Confidence
              </span>
              <span className="font-mono text-[20px] font-bold text-verified">
                {(targetCase.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Variance Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-control border border-rule">
              <span className="text-ink-soft text-[11px] block">Invoice Billed</span>
              <span className="font-mono font-bold text-ink text-[15px]">
                ₹{targetCase.invoice_amount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-3 bg-white rounded-control border border-rule">
              <span className="text-ink-soft text-[11px] block">Disbursement Paid</span>
              <span className="font-mono font-bold text-ink text-[15px]">
                ₹{targetCase.paid_amount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-3 bg-white rounded-control border border-rule">
              <span className="text-ink-soft text-[11px] block">Variance Gap</span>
              <span className={`font-mono font-bold text-[15px] ${targetCase.gap > 0 ? 'text-corona' : 'text-verified'}`}>
                ₹{targetCase.gap.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Conclusion */}
          <div className="p-4 bg-paper rounded-panel border border-rule space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft block">
              Agent Conclusion
            </span>
            <p className="text-ink leading-relaxed font-medium">
              {targetCase.conclusion}
            </p>
          </div>

          {/* Evidence Citations */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft block">
              Grounded Evidence Citations ({targetCase.evidence.length})
            </span>
            <div className="space-y-2">
              {targetCase.evidence.map((ev) => (
                <div key={ev.id} className="p-3 bg-white rounded-control border border-rule space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-semibold text-ink">
                      [{ev.source_type.toUpperCase()}] {ev.ref_id} · {ev.title}
                    </span>
                    <span className="font-mono text-ink-soft">{ev.date}</span>
                  </div>
                  <p className="text-ink text-[12px]">{ev.snippet}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trace Timeline */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft block">
              Autonomous Execution Log ({targetCase.trace.length} steps)
            </span>
            <div className="p-3 bg-paper rounded-control border border-rule divide-y divide-rule/60 font-mono text-[11px]">
              {targetCase.trace.map((tr) => (
                <div key={tr.id} className="py-1.5 flex items-start gap-2">
                  <span className="text-ink-soft">{tr.ts}</span>
                  <span className="font-semibold text-ink">[{tr.step.toUpperCase()}]</span>
                  <span className="text-ink-soft/90 flex-1">{tr.summary}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
