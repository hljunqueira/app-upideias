import React from 'react';

interface PlanLockedContentProps {
  featureName: string;
  requiredPlan?: string;
  children?: React.ReactNode;
}

export function PlanLockedContent({ featureName, requiredPlan = 'Pro', children }: PlanLockedContentProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-upBorder bg-upCard/40">
      {/* Blurred background preview */}
      <div className="filter blur-md opacity-40 select-none pointer-events-none p-6">
        {children || (
          <div className="flex flex-col gap-4">
            <div className="h-6 w-1/3 bg-upBorder rounded"></div>
            <div className="h-24 bg-upBorder rounded"></div>
            <div className="h-10 bg-upBorder rounded"></div>
          </div>
        )}
      </div>

      {/* Glassmorphic lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-upBlack/70 backdrop-blur-sm p-6 text-center z-10">
        <div className="w-12 h-12 rounded-full bg-upPink/10 border border-upPink/20 flex items-center justify-center text-upPink mb-4">
          🔒
        </div>
        <h3 className="text-base font-bold text-upWhite">Recurso Bloqueado</h3>
        <p className="text-xs text-upGray mt-2 max-w-xs leading-relaxed">
          O recurso <strong>{featureName}</strong> está disponível a partir do plano <strong>{requiredPlan}</strong>.
        </p>
        <button className="mt-6 px-6 py-2.5 bg-upPink hover:bg-upPinkDark text-upWhite text-xs font-bold rounded-xl transition-all shadow-lg shadow-upPink/20">
          Fazer Upgrade de Plano
        </button>
      </div>
    </div>
  );
}
