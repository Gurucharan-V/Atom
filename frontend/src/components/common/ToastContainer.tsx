import React from 'react';
import { ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-ink text-white px-4 py-2.5 rounded-control shadow-modal border border-white/10 flex items-center gap-2.5 text-[13px] animate-fade-in"
        >
          {toast.type === 'verified' ? (
            <ShieldCheck className="w-4 h-4 text-verified" />
          ) : toast.type === 'escalated' ? (
            <AlertCircle className="w-4 h-4 text-escalated" />
          ) : (
            <Info className="w-4 h-4 text-step-input" />
          )}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
