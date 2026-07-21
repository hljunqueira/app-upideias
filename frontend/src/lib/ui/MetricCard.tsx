import React from 'react';

interface MetricCardProps {
  name: string;
  value: string;
  change: string;
  status?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export function MetricCard({ name, value, change, status = 'neutral', icon }: MetricCardProps) {
  return (
    <div className="bg-upCard border border-upBorder rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-upPink/30 transition-all">
      <div className="flex justify-between items-center text-upGray">
        <span className="text-[10px] font-bold uppercase tracking-wider">{name}</span>
        {icon && <div className="text-upGray/80">{icon}</div>}
      </div>
      <div className="text-2xl font-extrabold text-upWhite mt-2">{value}</div>
      <span className={`text-[10px] font-semibold ${
        status === 'up' ? 'text-green-400' : status === 'down' ? 'text-upPink' : 'text-upGray'
      }`}>
        {change} vs. anterior
      </span>
    </div>
  );
}
