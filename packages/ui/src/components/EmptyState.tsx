import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export function EmptyState({ title, description, actionLabel, onAction, icon = '📁' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-upCard border border-upBorder border-dashed rounded-2xl">
      <div className="text-4xl mb-4 select-none">{icon}</div>
      <h3 className="text-base font-bold text-upWhite">{title}</h3>
      <p className="text-xs text-upGray mt-2 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-5 py-2.5 bg-upPink hover:bg-upPinkDark text-upWhite text-xs font-bold rounded-xl transition-all shadow-md shadow-upPink/10"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
