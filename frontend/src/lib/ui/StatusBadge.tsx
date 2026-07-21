import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  const config: Record<string, { bg: string; text: string; label: string }> = {
    draft: { bg: 'bg-upGray/10', text: 'text-upGray', label: 'Rascunho' },
    pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Pendente' },
    approved: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Aprovado' },
    rejected: { bg: 'bg-upPink/10', text: 'text-upPink', label: 'Reprovado' },
    changes_requested: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Ajustar' },
    published: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Publicado' },
    active: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Ativo' },
    inactive: { bg: 'bg-upBorder', text: 'text-upGray', label: 'Inativo' },
  };

  const current = config[normalized] || { bg: 'bg-upGray/10', text: 'text-upGray', label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${current.bg} ${current.text}`}>
      {current.label}
    </span>
  );
}
