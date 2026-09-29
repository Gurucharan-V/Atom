import React from 'react';

interface ConfidenceBarProps {
  confidence: number;
  className?: string;
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ confidence, className = '' }) => {
  const isLow = confidence < 0.75;
  const percentage = Math.round(confidence * 100);
  const formattedScore = confidence.toFixed(2);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-[13px] font-medium text-ink-soft">
        Confidence <span className="num font-semibold text-ink">{formattedScore}</span>
      </span>
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
      {isLow && (
        <span className="text-[12px] font-medium text-escalated">Low confidence</span>
      )}
    </div>
  );
};
