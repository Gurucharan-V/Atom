import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

interface ConfidenceBarProps {
  confidence: number;
  priorConfidence?: number;
  reason?: string;
  className?: string;
  compact?: boolean;
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({
  confidence,
  priorConfidence,
  reason,
  className = '',
  compact = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isLow = confidence < 0.75;
  const percentage = Math.round(confidence * 100);
  const formattedScore = confidence.toFixed(2);

  const hasTrend = typeof priorConfidence === 'number' && priorConfidence !== confidence;
  const isUp = hasTrend && confidence > (priorConfidence as number);
  const delta = hasTrend ? Math.abs(confidence - (priorConfidence as number)).toFixed(2) : '0';

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      <span className="text-[13px] font-medium text-ink-soft flex items-center gap-1.5">
        <span>Confidence</span>
        <span className="num font-semibold text-ink">{formattedScore}</span>

        {/* Live Confidence Trend Indicator (F3) */}
        {hasTrend && (
          <span
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded cursor-help transition-all ${
              isUp
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                : 'bg-amber-50 text-amber-700 border border-amber-200/80'
            }`}
            title={reason || (isUp ? `Increased by +${delta}` : `Decayed by -${delta}`)}
          >
            {isUp ? (
              <>
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span>↑ from {priorConfidence?.toFixed(2)}</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3 h-3 text-amber-600" />
                <span>↓ from {priorConfidence?.toFixed(2)}</span>
              </>
            )}
          </span>
        )}
      </span>

      {!compact && (
        <div
          className="w-[64px] h-[4px] bg-rule rounded-full overflow-hidden flex-shrink-0"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isLow ? 'bg-escalated' : 'bg-verified'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {isLow && !compact && (
        <span className="text-[12px] font-medium text-escalated">Low confidence</span>
      )}

      {/* Floating Hover Tooltip explaining confidence evolution */}
      {showTooltip && reason && (
        <div className="absolute top-full left-0 mt-1 z-50 w-72 p-2.5 bg-ink text-white text-[12px] rounded-panel shadow-xl pointer-events-none animate-in fade-in duration-200">
          <div className="flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-corona flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white/90">Agent Belief Update:</p>
              <p className="text-white/80 leading-snug mt-0.5">{reason}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
