import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Check,
  X,
  CornerDownRight,
  ExternalLink,
} from 'lucide-react';
import type { TraceEvent, StepType } from '../../types';

interface TraceStepNodeProps {
  event: TraceEvent;
  isLatest: boolean;
  isBranched?: boolean;
  onSelectEvidence?: (evidenceId: string) => void;
}

const STEP_COLORS: Record<StepType, string> = {
  input: '#8FB4E8',
  plan: '#B9A6F0',
  tool_use: '#7AD1C1',
  decision: '#F1C168',
  action: '#F0967F',
  verification: '#7FD69A',
  recover: '#7AD1C1',
  escalate: '#F27A8A',
};

const STEP_NAMES: Record<StepType, string> = {
  input: 'Input',
  plan: 'Plan',
  tool_use: 'Tool use',
  decision: 'Decision',
  action: 'Action',
  verification: 'Verification',
  recover: 'Recover branch',
  escalate: 'Escalate branch',
};

export const TraceStepNode: React.FC<TraceStepNodeProps> = ({
  event,
  isLatest,
  isBranched = false,
  onSelectEvidence,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const color = STEP_COLORS[event.step] || '#8FB4E8';
  const name = STEP_NAMES[event.step] || event.step;

  return (
    <div
      className={`relative pl-7 pb-5 group transition-colors ${
        isBranched ? 'ml-4 pl-6 border-l border-ink-soft/40' : ''
      }`}
    >
      {/* Branch line icon if recovering or escalating */}
      {isBranched && (
        <CornerDownRight
          className="absolute -left-3 top-0 w-3.5 h-3.5 text-ink-soft/70"
          aria-hidden="true"
        />
      )}

      {/* Node shape */}
      <div
        className={`absolute left-0 top-0.5 w-4 h-4 rounded-full flex items-center justify-center -translate-x-[7px] bg-ink z-10 ${
          isLatest ? 'animate-node-pulse' : ''
        }`}
        style={{ color }}
      >
        {event.state === 'done' ? (
          <div
            className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-ink"
            style={{ backgroundColor: color }}
          >
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
        ) : event.state === 'failed' ? (
          <div className="w-3.5 h-3.5 rounded-full bg-escalated flex items-center justify-center text-white">
            <X className="w-2.5 h-2.5 stroke-[3]" />
          </div>
        ) : (
          /* ring for running / pending */
          <div
            className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
              event.state === 'running' ? 'animate-spin' : ''
            }`}
            style={{ borderColor: color }}
          >
            {event.state === 'running' && (
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            )}
          </div>
        )}
      </div>

      {/* Main step row */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer select-none text-[13px] leading-5 hover:bg-white/5 rounded p-1 -m-1 transition-colors"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        aria-expanded={expanded}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium" style={{ color }}>
            {expanded ? (
              <ChevronDown className="w-3 h-3 text-[#9AA7B8]" />
            ) : (
              <ChevronRight className="w-3 h-3 text-[#9AA7B8]" />
            )}
            <span>{name}</span>
            {event.tool_name && (
              <span className="font-mono text-[11px] px-1.5 py-0.2 bg-white/10 rounded text-[#E8EDF3]">
                {event.tool_name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#9AA7B8]">
            {event.duration_ms && (
              <span className="flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {event.duration_ms}ms
              </span>
            )}
            <span>{event.ts}</span>
          </div>
        </div>

        <p className="text-[13px] text-[#E8EDF3] mt-0.5 font-normal leading-relaxed">
          {event.summary}
        </p>
      </div>

      {/* Expanded payload & evidence references */}
      {expanded && (
        <div className="mt-2 text-[12px] bg-[#0E151E] border border-white/10 rounded-control p-2.5 text-[#E8EDF3] space-y-2">
          {event.payload && (
            <div>
              <span className="text-[11px] font-mono text-[#9AA7B8] block mb-1">
                Payload
              </span>
              <pre className="font-mono text-[11px] text-[#7AD1C1] overflow-x-auto p-1.5 bg-black/40 rounded whitespace-pre-wrap break-all">
                {typeof event.payload === 'string'
                  ? event.payload
                  : JSON.stringify(event.payload, null, 2)}
              </pre>
            </div>
          )}

          {event.evidence_refs && event.evidence_refs.length > 0 && (
            <div className="flex items-center gap-2 pt-1 border-t border-white/10">
              <span className="text-[11px] text-[#9AA7B8]">Cited evidence:</span>
              <div className="flex flex-wrap gap-1">
                {event.evidence_refs.map((refId) => (
                  <button
                    key={refId}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvidence?.(refId);
                    }}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/10 hover:bg-white/20 rounded font-mono text-[11px] text-corona transition-colors"
                  >
                    <span>{refId}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
