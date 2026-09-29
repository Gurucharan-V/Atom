import React, { useId } from 'react';

interface OverlapMarkProps {
  size?: 24 | 40 | 72;
  gapAmount?: number;
  currency?: string;
  isResolved?: boolean;
  className?: string;
}

export const OverlapMark: React.FC<OverlapMarkProps> = ({
  size = 40,
  gapAmount = 0,
  currency = '₹',
  isResolved = false,
  className = '',
}) => {
  const maskId = useId();

  // Dimensions based on size
  const r = size === 24 ? 8 : size === 40 ? 13 : 24;
  const cy = size / 2;
  const baseCx = size === 24 ? 9 : size === 40 ? 15 : 26;
  const maxOffset = size === 24 ? 6 : size === 40 ? 10 : 20;

  // When resolved, circles fully overlap (offset = 0)
  const offset = isResolved ? 0 : maxOffset;
  const cx1 = baseCx;
  const cx2 = baseCx + offset;

  const formattedGap = `${currency}${gapAmount.toLocaleString('en-IN')}`;
  const label = isResolved ? `Reconciled, zero gap` : `Gap of ${formattedGap}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      className={`inline-block flex-shrink-0 select-none ${className}`}
    >
      <defs>
        {/* Mask out the right disc area from the left disc to leave only the crescent */}
        <mask id={maskId}>
          <rect width={size} height={size} fill="black" />
          {/* Include left disc in white */}
          <circle cx={cx1} cy={cy} r={r} fill="white" />
          {/* Cut out right disc with black */}
          <circle
            cx={cx2}
            cy={cy}
            r={r}
            fill="black"
            style={{
              transition: 'cx 600ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </mask>
      </defs>

      {/* Base left disc (invoice) */}
      <circle
        cx={cx1}
        cy={cy}
        r={r}
        fill="#16202C"
        fillOpacity="0.85"
      />

      {/* Crescent slice filled with --corona (#E39B12), masked by the overlap */}
      {!isResolved && (
        <circle
          cx={cx1}
          cy={cy}
          r={r}
          fill="#E39B12"
          mask={`url(#${maskId})`}
          style={{
            opacity: isResolved ? 0 : 1,
            transition: 'opacity 600ms ease-out',
          }}
        />
      )}

      {/* Right disc (payment) */}
      <circle
        cx={cx2}
        cy={cy}
        r={r}
        fill="#16202C"
        fillOpacity={isResolved ? '0.85' : '0.35'}
        style={{
          transition: 'all 600ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </svg>
  );
};
