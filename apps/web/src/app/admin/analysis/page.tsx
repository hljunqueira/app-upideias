"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface QueueItem {
  id: string;
  approvalId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPlan: string;
  instagramHandle: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "adjusted";
  origin: "agent" | "specialist";
  format: string;
  caption: string;
  imageUrl?: string | null;
  specialistNotes?: string;
  createdAt: string;
}

export default function AdminAnalysisQueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadQueue = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (planFilter !== "all") params.append("plan", planFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/analysis/queue?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [planFilter, statusFilter]);

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const adjustedCount = items.filter((i) => i.status === "adjusted").length;
  const approvedCount = items.filter((i) => i.status === "approved").length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-zinc-200">
      {/* Header Executivo Minimalista */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            Painel do Especialista
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Fila de Análise de Criativos
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Publicações e solicitações dos assinantes Premium, Pro e Enterprise aguardando parecer estratégico humano.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadQueue}
            className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-zinc-900 text-xs text-zinc-300 transition-colors"
          >
            Atualizar Fila
          </button>
        </div>
      </div>

      {/* Indicadores Sóbrios (Sem Ícones Decorativos) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-950">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
            Aguardando Parecer
          </span>
          <span className="text-2xl font-bold text-upPink tracking-tight mt-1 block">
            {pendingCount}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-zinc-950">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
            Ajustes Solicitados
          </span>
          <span className="text-2xl font-bold text-amber-400 tracking-tight mt-1 block">
            {adjustedCount}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-zinc-950">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
            Validadas pelo Assinante
          </span>
          <span className="text-2xl font-bold text-emerald-400 tracking-tight mt-1 block">
            {approvedCount}
          </span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-white/10 bg-zinc-950/60">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Plano:</span>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-zinc-900 border border-white/10 text-xs rounded-lg px-2.5 py-1 text-zinc-200 outline-none"
          >
            <option value="all">Todos com Especialista</option>
            <option value="Premium">Premium</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-white/10 text-xs rounded-lg px-2.5 py-1 text-zinc-200 outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Aguardando Avaliação</option>
            <option value="adjusted">Revisão Solicitada</option>
            <option value="approved">Aprovados</option>
          </select>
        </div>
      </div>

      {/* Lista da Fila */}
      {loading ? (
        <div className="p-12 border border-white/10 rounded-xl text-center text-xs text-zinc-500 uppercase tracking-wider">
          Carregando fila de publicações dos assinantes...
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 border border-white/10 rounded-xl bg-zinc-950/40 text-center">
          <p className="text-sm font-semibold text-zinc-300">
            Fila limpa no momento
          </p>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
            Todas as publicações de assinantes Premium, Pro e Enterprise foram avaliadas ou aguardam novas postagens sincronizadas.
          </p>
          <Link
            href="/admin/users"
            className="inline-block mt-4 text-xs text-upPink hover:underline font-mono"
          >
            Ver todos os clientes assinantes
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-white/10 bg-zinc-950 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                {item.imageUrl ? (
                  <div className="w-16 h-16 rounded-lg bg-zinc-900 border border-white/10 overflow-hidden shrink-0">
                    <img
                      src={item.imageUrl}
                      alt="Criativo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-mono text-zinc-500 shrink-0 uppercase">
                    Post
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">
                      {item.userName}
                    </span>
                    <span className="text-xs font-mono text-upPink">
                      {item.instagramHandle}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/10">
                      Plano {item.userPlan}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-medium">
                    {item.title}
                  </p>

                  {item.caption && (
                    <p className="text-xs text-zinc-400 line-clamp-1 max-w-xl">
                      {item.caption}
                    </p>
                  )}

                  {item.specialistNotes && (
                    <div className="mt-1 p-2 rounded bg-zinc-900 border border-white/5 text-[11px] text-zinc-300">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 block">
                        Último Parecer:
                      </span>
                      <span className="line-clamp-2">{item.specialistNotes}</span>
                    </div>
                  )}

                  <span className="text-[10px] text-zinc-500 font-mono mt-1">
                    Entrada na fila: {new Date(item.createdAt).toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded font-semibold ${
                    item.status === "pending"
                      ? "bg-upPink/10 text-upPink border border-upPink/30"
                      : item.status === "adjusted"
                      ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  {item.status === "pending"
                    ? "Aguardando Parecer"
                    : item.status === "adjusted"
                    ? "Revisão Solicitada"
                    : "Aprovado"}
                </span>

                <Link
                  href={`/admin/users/${item.userId}/posts`}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-upPink hover:text-white text-zinc-200 border border-white/10 text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Analisar Post
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
