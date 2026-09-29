import React from 'react';

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-sheet rounded-panel border border-rule p-5 animate-pulse ${className}`}>
    <div className="flex items-center justify-between pb-3 border-b border-rule/60 mb-4">
      <div className="h-5 bg-paper rounded w-1/3" />
      <div className="h-4 bg-paper rounded w-16" />
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-paper rounded w-full" />
      <div className="h-4 bg-paper rounded w-5/6" />
      <div className="h-4 bg-paper rounded w-4/6" />
    </div>
  </div>
);

export const SkeletonTableRow: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
  <tr className="animate-pulse h-[48px] border-b border-rule/50">
    {Array.from({ length: columns }).map((_, idx) => (
      <td key={idx} className="py-3 px-3">
        <div
          className={`h-4 bg-paper rounded ${
            idx === 0 ? 'w-8' : idx === 1 ? 'w-24' : idx === columns - 1 ? 'w-16 ml-auto' : 'w-3/4'
          }`}
        />
      </td>
    ))}
  </tr>
);

export const LoadingSpinner: React.FC<{ label?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  label = 'Loading data...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 text-ink-soft">
      <div
        className={`${sizeClasses} border-rule border-t-ink rounded-full animate-spin`}
        role="status"
        aria-label={label}
      />
      {label && <span className="text-[13px] font-medium font-mono">{label}</span>}
    </div>
  );
};
