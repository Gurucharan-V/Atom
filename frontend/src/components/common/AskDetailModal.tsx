import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';

interface AskDetailModalProps {
  isOpen: boolean;
  caseId: string;
  vendorName: string;
  onClose: () => void;
  onSubmit: (message: string) => void;
}

export const AskDetailModal: React.FC<AskDetailModalProps> = ({
  isOpen,
  caseId,
  vendorName,
  onClose,
  onSubmit,
}) => {
  const [message, setMessage] = useState(
    `Hello Accounts Team at ${vendorName},\n\nOur automated reconciliation agent noticed a discrepancy on invoice ${caseId}. Could you please provide clarification or supporting remittance documents?`
  );
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      onSubmit(message);
      setSent(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-sheet rounded-panel border border-rule shadow-modal p-6 text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-rule">
          <h3 className="text-[16px] font-bold tracking-tight flex items-center gap-2">
            <span>Request detail from vendor</span>
            <span className="font-mono text-[12px] px-2 py-0.5 bg-paper rounded text-ink-soft">
              {caseId}
            </span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-paper text-ink-soft transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-verified mx-auto animate-bounce" />
            <p className="text-[15px] font-bold text-ink">Clarification email dispatched!</p>
            <p className="text-[13px] text-ink-soft">
              Sent to vendor AP contact. Logged in audit trail.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <p className="text-[13px] text-ink-soft">
              Send an automated inquiry message to <strong className="text-ink">{vendorName}</strong>. The response will be ingested into the agent's RAG evidence pool.
            </p>

            <div>
              <label className="block text-[12px] font-medium text-ink mb-1">
                Inquiry draft message
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2.5 text-[13px] rounded-control border border-rule focus:outline-none focus:ring-2 focus:ring-pending text-ink"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-rule">
              <button
                type="button"
                onClick={onClose}
                className="h-[36px] px-3.5 rounded-control bg-white border border-rule text-ink-soft hover:bg-paper text-[13px] font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-[36px] px-4 rounded-control bg-ink hover:bg-ink/90 text-white text-[13px] font-medium flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send inquiry</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
