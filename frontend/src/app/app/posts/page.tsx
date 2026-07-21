"use client";

import { useState } from "react";
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Bookmark,
  Calendar,
  ExternalLink
} from "lucide-react";
import { getStatusLabel } from "@up-analytics/lib";
import { StatusBadge } from "@up-analytics/ui";

export default function PostsPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const mockPosts = [
    {
      id: "post-1",
      title: "3 Hacks de Social Media que você não conhecia 🚀",
      caption: "Se você ainda comemora curtidas no Instagram em 2026, você está perdendo dinheiro. A verdade dói: curtida não paga boleto...",
      type: "Reels",
      status: "published",
      reach: 18400,
      likes: 1200,
      comments: 320,
      shares: 410,
      saves: 520,
      published_at: "2026-07-04T12:00:00Z"
    },
    {
      id: "post-2",
      title: "Estratégia vs. Postagem Aleatória: O que funciona?",
      caption: "O maior erro das marcas é postar por postar. Consistência sem estratégia é apenas ruído. Descubra como planejar...",
      type: "Carrossel",
      status: "published",
      reach: 12100,
      likes: 980,
      comments: 142,
      shares: 98,
      saves: 320,
      published_at: "2026-07-03T18:30:00Z"
    },
    {
      id: "post-3",
      title: "Funil de Conteúdo Inteligente no Instagram",
      caption: "Aprenda a guiar seu seguidor desde a descoberta até a conversão utilizando formatos corretos de posts.",
      type: "Reels",
      status: "pending",
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      published_at: "2026-07-06T15:00:00Z"
    },
    {
      id: "post-4",
      title: "Guia Completo da Evolution API e Automações",
      caption: "Como disparar relatórios automáticos de métricas do Instagram direto para o celular do cliente no WhatsApp.",
      type: "Carrossel",
      status: "draft",
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      published_at: null
    }
  ];

  const filteredPosts = mockPosts.filter(post => {
    const matchesStatus = filterStatus === "all" || post.status === filterStatus;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.caption.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite">Gestão de Posts</h1>
        <p className="text-sm text-upGray mt-1">Monitore publicações publicadas, agendadas e em rascunho.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-upGray" />
          <input
            type="text"
            placeholder="Buscar posts por título ou legenda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-upCard border border-upBorder rounded-xl text-sm text-upWhite placeholder-upGray outline-none focus:border-upPink/50 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-upGray" />
          <div className="inline-flex bg-upCard rounded-xl p-1 border border-upBorder">
            {[
              { id: "all", label: "Todos" },
              { id: "published", label: "Publicados" },
              { id: "pending", label: "Pendentes" },
              { id: "draft", label: "Rascunhos" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === tab.id ? "bg-upPink text-upWhite" : "text-upGray hover:text-upWhite"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div key={post.id} className="bg-upCard border border-upBorder hover:border-upBorder/80 rounded-2xl p-6 transition-all flex flex-col md:flex-row justify-between gap-6">
              <div className="flex flex-col gap-4 flex-grow max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md bg-upDark border border-upBorder text-xs text-upGray font-bold uppercase tracking-wider">
                    {post.type}
                  </span>
                  <StatusBadge status={post.status} />
                  {post.published_at && (
                    <span className="flex items-center gap-1 text-xs text-upGray font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.published_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-upWhite hover:text-upPink transition-colors flex items-center gap-2 cursor-pointer">
                    {post.title}
                  </h3>
                  <p className="text-sm text-upGray mt-2 leading-relaxed line-clamp-2">
                    {post.caption}
                  </p>
                </div>

                {/* Metrics Footer (Only if published) */}
                {post.status === "published" && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-upBorder/20">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-upGray font-bold uppercase tracking-wider">Alcance</span>
                      <span className="text-sm font-extrabold text-upWhite mt-1 flex items-center gap-1">
                        <Eye className="w-4 h-4 text-upPink" /> {post.reach.toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-upGray font-bold uppercase tracking-wider">Curtidas</span>
                      <span className="text-sm font-extrabold text-upWhite mt-1 flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4 text-upGray" /> {post.likes.toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-upGray font-bold uppercase tracking-wider">Comentários</span>
                      <span className="text-sm font-extrabold text-upWhite mt-1 flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-upGray" /> {post.comments}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-upGray font-bold uppercase tracking-wider">Compartilhados</span>
                      <span className="text-sm font-extrabold text-upWhite mt-1 flex items-center gap-1">
                        <Share2 className="w-4 h-4 text-upGray" /> {post.shares}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-upGray font-bold uppercase tracking-wider">Salvos</span>
                      <span className="text-sm font-extrabold text-upWhite mt-1 flex items-center gap-1">
                        <Bookmark className="w-4 h-4 text-upGray" /> {post.saves}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex md:flex-col justify-end md:justify-between items-end gap-4 shrink-0">
                <button className="px-4 py-2 border border-upBorder hover:bg-upDark text-upWhite text-xs font-bold rounded-xl transition-all flex items-center gap-1.5">
                  Ver Post <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-upCard border border-upBorder rounded-2xl p-12 text-center text-upGray">
            Nenhum post encontrado para os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  );
}
