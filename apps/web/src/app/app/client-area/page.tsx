"use client";

import { useState } from "react";
import { 
  Users, 
  Plus, 
  ShieldAlert, 
  Building2, 
  Crown, 
  Instagram, 
  CheckCircle2, 
  ExternalLink,
  Lock,
  ArrowUpRight,
  UserCheck,
  Search
} from "lucide-react";

import { PlanGate } from "@/components/common/PlanGate";

export default function ClientAreaPage() {
  // Simulação de plano ativo para teste visual (Pro | Agência | Enterprise)
  const [userPlan, setUserPlan] = useState<"Pro" | "Agência" | "Enterprise">("Pro");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const mockClients = [
    { id: "c1", name: "Padaria da Esquina", handle: "@padaria_corner", followers: "12.4K", status: "Ativo", postsPending: 1 },
    { id: "c2", name: "Academia Fit Corp", handle: "@academia_fit", followers: "24.8K", status: "Ativo", postsPending: 2 },
    { id: "c3", name: "Boutique Moda Elegance", handle: "@moda.elegance", followers: "8.1K", status: "Ativo", postsPending: 0 },
    { id: "c4", name: "Clínica Odonto Riso", handle: "@odontoriso", followers: "15.3K", status: "Ativo", postsPending: 0 },
    { id: "c5", name: "Restaurante Sabor & Arte", handle: "@saborearte", followers: "19.5K", status: "Ativo", postsPending: 1 }
  ];

  const maxClientsForAgency = 5;
  const isAgencyLocked = userPlan === "Agência" && mockClients.length >= maxClientsForAgency;

  return (
    <PlanGate featureKey="clientArea" featureTitle="Gestão de Clientes">
      <div className="flex flex-col gap-8 max-w-5xl mx-auto animate-fadeIn text-upLightGray">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-3">
            <Building2 className="w-8 h-8 text-upPink" />
            Gestão de Clientes & Marcas
          </h1>
          <p className="text-sm text-upGray mt-1">
            Cadastre as marcas dos seus clientes, acompanhe aprovações e gerencie múltiplos perfis.
          </p>
        </div>

        {/* Simulação de Teste de Plano */}
        <div className="flex items-center gap-2 bg-upDark p-1.5 rounded-2xl border border-upBorder/60">
          <span className="text-[10px] text-upGray uppercase font-extrabold px-2">Testar Plano:</span>
          {(["Pro", "Agência", "Enterprise"] as const).map((plan) => (
            <button
              key={plan}
              onClick={() => setUserPlan(plan)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                userPlan === plan
                  ? "bg-upPink text-white shadow-md"
                  : "text-upGray hover:text-white"
              }`}
            >
              {plan}
            </button>
          ))}
        </div>
      </div>

      {/* Condicional Por Plano */}
      {userPlan === "Pro" ? (
        /* Caso 1: Plano Pro/Iniciante (Bloqueado) */
        <div className="bg-[#0e0e14] border border-upBorder/60 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-upPink/10 text-upPink border border-upPink/30 flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-extrabold text-white">Recurso Exclusivo para Gestores</h3>
            <p className="text-xs text-upGray leading-relaxed">
              A **Gestão de Clientes & Marcas** permite que você gerencie múltiplos perfis de clientes sob a sua conta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-2 text-left">
            <div className="bg-upDark/60 border border-upBorder/50 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-amber-400">Plano Agência</span>
              <p className="text-xs font-bold text-white">Até 5 Clientes Incluídos</p>
              <p className="text-[10px] text-upGray">Ideal para freelancers e pequenas agências.</p>
            </div>

            <div className="bg-upDark/80 border border-upPink/40 p-4 rounded-2xl space-y-1 relative overflow-hidden">
              <span className="text-[10px] font-extrabold uppercase text-upPink">Plano Enterprise</span>
              <p className="text-xs font-bold text-white">Clientes & Marcas Ilimitados</p>
              <p className="text-[10px] text-upGray">Sem qualquer limitação de cadastros.</p>
            </div>
          </div>

          <div className="pt-2">
            <button className="px-8 py-3.5 bg-upPink hover:bg-upPink/90 text-white rounded-2xl text-xs font-extrabold shadow-[0_0_25px_rgba(255,83,104,0.4)] transition cursor-pointer">
              Fazer Upgrade de Plano Agora
            </button>
          </div>
        </div>
      ) : (
        /* Caso 2 & 3: Plano Agência ou Enterprise */
        <div className="space-y-6">
          
          {/* Banner de Status do Plano */}
          <div className="bg-upCard border border-upBorder/60 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-upPink/10 text-upPink rounded-2xl border border-upPink/20">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Plano Ativo: <span className="text-upPink font-extrabold">{userPlan}</span>
                </h3>
                <p className="text-xs text-upGray mt-0.5">
                  {userPlan === "Agência"
                    ? `Você está utilizando 5 de 5 slots de clientes permitidos no Plano Agência.`
                    : `Gestão Ilimitada de Marcas & Clientes liberada no Plano Enterprise.`}
                </p>
              </div>
            </div>

            {userPlan === "Agência" && (
              <button className="px-4 py-2 bg-upPink/20 hover:bg-upPink/30 text-upPink border border-upPink/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0">
                <ArrowUpRight className="w-4 h-4" />
                <span>Desbloquear Clientes Ilimitados (Enterprise)</span>
              </button>
            )}
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-upGray" />
              <input
                type="text"
                placeholder="Buscar cliente ou marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-upCard border border-upBorder rounded-2xl text-xs text-upWhite placeholder-upGray outline-none focus:border-upPink/50 transition-all"
              />
            </div>

            <button
              onClick={() => {
                if (isAgencyLocked) {
                  alert("Limite de 5 clientes atingido no Plano Agência! Faça upgrade para o Enterprise para cadastrar clientes ilimitados.");
                } else {
                  setIsAddModalOpen(true);
                }
              }}
              className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
                isAgencyLocked
                  ? "bg-upDark text-upGray border border-upBorder cursor-not-allowed"
                  : "bg-upPink hover:bg-upPink/90 text-white shadow-[0_0_20px_rgba(255,83,104,0.3)] cursor-pointer"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Cliente</span>
            </button>
          </div>

          {/* Grid de Clientes Cadastrados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockClients
              .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.handle.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((client) => (
                <div
                  key={client.id}
                  className="bg-[#0e0e14] border border-upBorder/60 hover:border-upPink/40 rounded-3xl p-6 shadow-xl space-y-4 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">{client.name}</h4>
                      <p className="text-xs font-mono text-upPink mt-0.5">{client.handle}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      {client.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-upBorder/30">
                    <div className="bg-upDark/50 p-3 rounded-2xl border border-upBorder/30">
                      <span className="text-[10px] text-upGray uppercase font-semibold">Seguidores</span>
                      <p className="text-xs font-extrabold text-white mt-0.5">{client.followers}</p>
                    </div>
                    <div className="bg-upDark/50 p-3 rounded-2xl border border-upBorder/30">
                      <span className="text-[10px] text-upGray uppercase font-semibold">Posts Pendentes</span>
                      <p className="text-xs font-extrabold text-upPink mt-0.5">{client.postsPending} postagens</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
    </PlanGate>
  );
}
