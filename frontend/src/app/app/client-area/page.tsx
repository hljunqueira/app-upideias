"use client";

import { Users, Plus, ShieldAlert } from "lucide-react";
import { PlanLockedContent } from "@up-analytics/ui";

export default function ClientAreaPage() {
  // Let's assume the user is currently on the Pro plan, so they cannot access the Agency-only Client Area.
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-2">
            <Users className="w-8 h-8 text-upPink" />
            Área do Cliente (Multi-Tenancy)
          </h1>
          <p className="text-sm text-upGray mt-1">
            Cadastre seus clientes, gerencie acessos e vincule múltiplas contas de Instagram.
          </p>
        </div>
      </div>

      <PlanLockedContent featureName="Área do Cliente & Multi-Tenancy" requiredPlan="Agência">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center bg-upCard border border-upBorder rounded-xl p-4">
            <span className="text-sm font-bold text-upWhite">Lista de Clientes Cadastrados</span>
            <button className="px-4 py-2 bg-upPink text-upWhite rounded-xl text-xs font-bold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Cadastrar Cliente
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-upCard border border-upBorder rounded-xl p-5 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-upWhite">Cliente 1: Padaria da Esquina</h4>
              <p className="text-xs text-upGray">Insta: @padaria_corner • 12k seguidores</p>
            </div>
            <div className="bg-upCard border border-upBorder rounded-xl p-5 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-upWhite">Cliente 2: Academia Fit</h4>
              <p className="text-xs text-upGray">Insta: @academia_fit • 24k seguidores</p>
            </div>
          </div>
        </div>
      </PlanLockedContent>
    </div>
  );
}
