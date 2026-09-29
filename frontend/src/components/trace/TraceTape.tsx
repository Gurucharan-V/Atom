import React, { useEffect, useRef } from 'react';
import { Terminal, Activity } from 'lucide-react';
import type { TraceEvent } from '../../types';
import { TraceStepNode } from './TraceStepNode';

interface TraceTapeProps {
  trace: TraceEvent[];
  caseId: string;
  isLive?: boolean;
  onSelectEvidence?: (evidenceId: string) => void;
  className?: string;
}

export const TraceTape: React.FC<TraceTapeProps> = ({
  trace,
  caseId,
  isLive = false,
  onSelectEvidence,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new steps arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [trace.length]);

  return (
    <div
      className={`bg-ink text-[#E8EDF3] rounded-panel border border-ink/80 flex flex-col overflow-hidden h-[620px] ${className}`}
    >
      {/* Tape header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#121b25] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-step-tool" aria-hidden="true" />
          <h3 className="text-[13px] font-semibold tracking-tight text-[#E8EDF3]">
            Execution trace tape
          </h3>
          <span className="font-mono text-[11px] text-[#9AA7B8]">
            {caseId}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-control bg-verified/20 text-verified text-[11px] font-medium animate-pulse">
              <Activity className="w-3 h-3" />
              <span>Live trace</span>
            </span>
          )}
          <span className="font-mono text-[11px] text-[#9AA7B8]">
            {trace.length} {trace.length === 1 ? 'step' : 'steps'}
          </span>
        </div>
      </div>

      {/* Vertical trace graph */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 dark-tape-scroll relative"
        aria-live="polite"
      >
        {/* Continuous vertical line through nodes */}
        <div className="absolute left-[22px] top-6 bottom-6 w-[1.5px] bg-white/15 pointer-events-none" />

        <ol className="relative list-none m-0 p-0">
          {trace.map((event, idx) => {
            const isLatest = idx === trace.length - 1;
            const isBranched = event.step === 'recover' || event.step === 'escalate';

            return (
              <li key={event.id || idx}>
                <TraceStepNode
                  event={event}
                  isLatest={isLatest}
                  isBranched={isBranched}
                  onSelectEvidence={onSelectEvidence}
                />
              </li>
            );
          })}
        </ol>
      </div>

      {/* Tape footer indicator */}
      <div className="px-4 py-2 bg-[#0E151E] border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#9AA7B8]">
        <span>INPUT → PLAN → TOOL → DECISION → ACTION → VERIFY</span>
        <span className="text-white/40">Append-only</span>
      </div>
    </div>
  );
};
