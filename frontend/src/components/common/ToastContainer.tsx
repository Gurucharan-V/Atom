import React from 'react';
import { ShieldCheck, Info, XCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 pointer-events-none max-w-[420px]"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto px-4 py-3 rounded-control shadow-modal border flex items-center justify-between gap-3 text-[13px] animate-fade-in ${
            toast.type === 'error'
              ? 'bg-[#1e1315] text-[#fca5a5] border-escalated/40'
              : toast.type === 'verified'
              ? 'bg-[#101b17] text-[#86efac] border-verified/40'
              : toast.type === 'escalated'
              ? 'bg-[#1e1315] text-[#fca5a5] border-escalated/40'
              : 'bg-ink text-white border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'verified' ? (
              <ShieldCheck className="w-4 h-4 text-verified flex-shrink-0" />
            ) : toast.type === 'error' || toast.type === 'escalated' ? (
              <XCircle className="w-4 h-4 text-escalated flex-shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-pending flex-shrink-0" />
            )}
            <span className="leading-snug">{toast.message}</span>
          </div>

          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="text-white/60 hover:text-white p-0.5 rounded transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
