import React, { useState } from 'react';
import {
  FileText,
  Building,
  Mail,
  Receipt,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import type { Evidence, ProposedAction, EvidenceSourceType } from '../../types';
import { ConfidenceBar } from '../common/ConfidenceBar';
import { AskDetailModal } from '../common/AskDetailModal';
import { useApp } from '../../context/AppContext';

interface EvidencePanelProps {
  caseId: string;
  vendorName: string;
  evidence: Evidence[];
  conclusion: string;
  confidence: number;
  proposedAction?: ProposedAction;
  highlightedEvidenceId?: string;
  onApprove: () => void;
  onReject: () => void;
  isResolved?: boolean;
}

const SOURCE_ICONS: Record<EvidenceSourceType, React.ElementType> = {
  invoice: Receipt,
  bank: Building,
  email: Mail,
  po: FileText,
  ledger: BookOpen,
};

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  caseId,
  vendorName,
  evidence,
  conclusion,
  confidence,
  proposedAction,
  highlightedEvidenceId,
  onApprove,
  onReject,
  isResolved = false,
}) => {
  const { sendVendorInquiry } = useApp();
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    'ev-1': true,
    'ev-2': true,
    'ev-3': true,
    'ev-21': true,
    'ev-41': true,
    'ev-51': true,
    'ev-61': true,
  });

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderSnippetWithHighlight = (snippet: string, highlight: string) => {
    if (!highlight || !snippet.includes(highlight)) {
      return snippet;
    }
    const parts = snippet.split(highlight);
    return (
      <>
        {parts[0]}
        <mark
          className="px-1 py-0.5 rounded text-ink font-medium"
          style={{ backgroundColor: 'rgba(227, 155, 18, 0.28)' }}
        >
          {highlight}
        </mark>
        {parts.slice(1).join(highlight)}
      </>
    );
  };

  const handleInquirySubmit = (message: string) => {
    sendVendorInquiry(caseId, message);
  };

  return (
    <div className="space-y-6">
      {/* Evidence section */}
      <div className="bg-sheet rounded-panel border border-rule p-5">
        <div className="flex items-center justify-between pb-3 border-b border-rule mb-4">
          <h3 className="text-[15px] font-bold text-ink tracking-tight">
            Supporting evidence ({evidence.length})
          </h3>
          <span className="text-[12px] text-ink-soft">
            Direct citations from systems
          </span>
        </div>

        {evidence.length === 0 ? (
          <p className="text-[13px] text-ink-soft py-4 text-center">
            No external evidence records attached to this case.
          </p>
        ) : (
          <div className="space-y-3">
            {evidence.map((item) => {
              const Icon = SOURCE_ICONS[item.source_type] || FileText;
              const isHighlighted = highlightedEvidenceId === item.id;
              const isExpanded = !!expandedItems[item.id];

              return (
                <div
                  key={item.id}
                  id={`evidence-${item.id}`}
                  className={`border rounded-panel transition-all duration-300 ${
                    isHighlighted
                      ? 'border-corona ring-2 ring-corona/40 bg-corona/10 scale-[1.01]'
                      : 'border-rule hover:border-ink-soft/40 bg-white'
                  }`}
                >
                  <div
                    onClick={() => toggleExpand(item.id)}
                    className="flex items-center justify-between p-3 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded flex items-center justify-center bg-paper text-ink-soft">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-mono text-[12px] font-semibold text-ink mr-2">
                          {item.ref_id}
                        </span>
                        <span className="text-[13px] text-ink-soft font-normal">
                          {item.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.date && (
                        <span className="text-[12px] text-ink-soft/80 font-mono">
                          {item.date}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-ink-soft" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-ink-soft" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-rule/50 text-[13px] leading-relaxed text-ink">
                      <p className="bg-paper/70 p-2.5 rounded-control font-normal">
                        {renderSnippetWithHighlight(item.snippet, item.highlight)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Agent conclusion */}
      <div className="bg-sheet rounded-panel border border-rule p-5">
        <div className="pb-3 border-b border-rule mb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-ink tracking-tight">
            Agent's conclusion
          </h3>
          <ConfidenceBar confidence={confidence} />
        </div>

        <p className="text-[15px] leading-[23px] text-ink font-normal max-w-[72ch]">
          {conclusion}
        </p>

        <div className="mt-3 pt-3 border-t border-rule/60 flex items-center gap-2 text-[12px] text-ink-soft">
          <ShieldCheck className="w-4 h-4 text-verified" />
          <span>Grounded in {evidence.length} cited records. Immutable trace logged.</span>
        </div>
      </div>

      {/* Proposed action & approval controls */}
      {proposedAction && (
        <div className="bg-sheet rounded-panel border border-rule p-5">
          <div className="pb-3 border-b border-rule mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-ink tracking-tight">
                Proposed action
              </h3>
              <p className="text-[12px] text-ink-soft mt-0.5">
                {proposedAction.title}
              </p>
            </div>
            {isResolved ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-control bg-verified/10 border border-verified text-verified">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Action completed & verified</span>
              </span>
            ) : proposedAction.status === 'rejected' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-control bg-escalated/10 border border-escalated text-escalated">
                <XCircle className="w-3.5 h-3.5" />
                <span>Declined by human</span>
              </span>
            ) : proposedAction.requires_approval ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-control border border-pending text-pending">
                <span>Requires human approval</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-control border border-verified text-verified">
                <span>Auto-authorized by policy</span>
              </span>
            )}
          </div>

          {/* Impact statement for consequential actions */}
          <div className="bg-paper p-3 rounded-control border border-rule mb-4 text-[13px] text-ink font-medium leading-relaxed">
            {proposedAction.impact_statement}
          </div>

          {/* Target change diff */}
          {proposedAction.target_field && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5 text-[12px]">
              <div className="p-3 rounded-control border border-rule diff-mismatch">
                <span className="block font-mono text-[11px] font-semibold mb-1 opacity-80">
                  Field: {proposedAction.target_field} (Current / Mismatch)
                </span>
                <span className="font-mono text-[13px] font-semibold">
                  {proposedAction.old_value}
                </span>
              </div>
              <div className="p-3 rounded-control border border-verified/50 diff-match">
                <span className="block font-mono text-[11px] font-semibold mb-1 opacity-80">
                  Proposed Target Update (Verified)
                </span>
                <span className="font-mono font-bold text-[13px]">
                  {proposedAction.new_value}
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!isResolved && proposedAction.status === 'pending' && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onApprove}
                className="h-[36px] px-4 rounded-control bg-verified hover:bg-verified/90 text-white font-medium text-[14px] flex items-center gap-2 transition-colors focus:ring-2 focus:ring-pending focus:ring-offset-2 outline-none"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Approve action</span>
              </button>

              <button
                type="button"
                onClick={onReject}
                className="h-[36px] px-4 rounded-control bg-white hover:bg-escalated/5 border border-escalated text-escalated font-medium text-[14px] flex items-center gap-2 transition-colors focus:ring-2 focus:ring-pending focus:ring-offset-2 outline-none"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAskModalOpen(true)}
                className="h-[36px] px-3.5 rounded-control bg-white hover:bg-paper border border-rule text-ink-soft font-medium text-[14px] flex items-center gap-1.5 transition-colors focus:ring-2 focus:ring-pending focus:ring-offset-2 outline-none"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Ask for detail</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ask for Detail Modal */}
      <AskDetailModal
        isOpen={isAskModalOpen}
        caseId={caseId}
        vendorName={vendorName}
        onClose={() => setIsAskModalOpen(false)}
        onSubmit={handleInquirySubmit}
      />
    </div>
  );
};
