import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface RejectModalProps {
  isOpen: boolean;
  caseId: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  caseId,
  onClose,
  onSubmit,
}) => {
  const [comment, setComment] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError(true);
      return;
    }
    onSubmit(comment.trim());
    setComment('');
    setError(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-modal-title"
    >
      <div
        className="w-full max-w-md bg-sheet rounded-panel border border-rule shadow-modal p-6 text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-rule">
          <h3 id="reject-modal-title" className="text-[16px] font-bold tracking-tight">
            Reject proposed action
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-paper text-ink-soft transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-[13px] text-ink-soft leading-normal">
            Please provide a mandatory reason for rejecting the agent's action for{' '}
            <span className="font-mono font-medium text-ink">{caseId}</span>. This will be
            appended to the immutable audit trail and mark the case as human-declined.
          </p>

          <div>
            <label
              htmlFor="rejection-reason"
              className="block text-[12px] font-medium text-ink mb-1"
            >
              Rejection reason
            </label>
            <textarea
              id="rejection-reason"
              rows={3}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) setError(false);
              }}
              placeholder="e.g., Vendor clarified discount voucher was cancelled in separate communication..."
              className={`w-full p-2.5 text-[13px] rounded-control border ${
                error ? 'border-escalated' : 'border-rule'
              } focus:outline-none focus:ring-2 focus:ring-pending text-ink placeholder:text-ink-soft/60`}
              autoFocus
            />
            {error && (
              <span className="flex items-center gap-1 text-[12px] text-escalated mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                A reason is required to reject consequential actions.
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-rule">
            <button
              type="button"
              onClick={onClose}
              className="h-[36px] px-3.5 rounded-control bg-white border border-rule text-ink-soft hover:bg-paper text-[13px] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-[36px] px-4 rounded-control bg-escalated hover:bg-escalated/90 text-white text-[13px] font-medium transition-colors"
            >
              Confirm rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
