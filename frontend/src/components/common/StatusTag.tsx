import React from 'react';
import {
  Clock,
  Play,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import type { CaseStatus } from '../../types';

interface StatusTagProps {
  status: CaseStatus;
  className?: string;
}

export const StatusTag: React.FC<StatusTagProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'open':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[12px] font-medium rounded-control border border-ink-soft/40 text-ink-soft ${className}`}
        >
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Open</span>
        </span>
      );
    case 'running':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[12px] font-medium rounded-control border border-pending text-pending ${className}`}
        >
          <Play className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
          <span>Investigating</span>
        </span>
      );
    case 'awaiting_approval':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[12px] font-medium rounded-control border border-pending text-pending ${className}`}
        >
          <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Awaiting approval</span>
        </span>
      );
    case 'resolved':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[12px] font-medium rounded-control border border-verified text-verified ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Resolved</span>
        </span>
      );
    case 'escalated':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[12px] font-medium rounded-control border border-escalated text-escalated ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Escalated</span>
        </span>
      );
    case 'declined':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[12px] font-medium rounded-control border border-ink-soft text-ink-soft ${className}`}
        >
          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Declined</span>
        </span>
      );
    default:
      return null;
  }
};
