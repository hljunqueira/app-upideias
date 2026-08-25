import React from "react";
import { cn } from "../../utils/cn";
import { Heart, MessageCircle, Send, Bookmark, Signal, Battery, Wifi } from "lucide-react";

interface PhoneMockupPreviewProps {
  caption: string;
  reach: string;
  likes: string;
  comments: string;
  engagement: string;
  type: string;
  imageUrl?: string;
  username?: string;
  profilePictureUrl?: string;
  publishedAt?: string;
  className?: string;
}

export const PhoneMockupPreview: React.FC<PhoneMockupPreviewProps> = ({
  caption,
  reach,
  likes,
  comments,
  engagement,
  imageUrl,
  username = "hlj.dev",
  profilePictureUrl,
  publishedAt,
  className,
}) => {
  return (
    <div className={cn("relative mx-auto w-[320px] h-[680px] bg-black rounded-[46px] border-[8px] border-neutral-800 shadow-2xl overflow-hidden flex flex-col", className)}>
      {/* Dynamic Island / Notch */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-end px-3">
        <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800" />
      </div>

      {/* Status Bar */}
      <div className="h-10 pt-2 px-6 flex justify-between items-center text-[10px] text-white font-semibold z-40 select-none bg-black/50 backdrop-blur-sm shrink-0">
        <span>10:50</span>
        <div className="flex items-center gap-1.5">
          <Signal className="w-2.5 h-2.5" />
          <Wifi className="w-2.5 h-2.5" />
          <Battery className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Screen Content */}
      <div className="flex-1 overflow-y-auto bg-[#0a0a0f] p-3.5 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-white/10">
        {/* Header do Instagram */}
        <div className="flex items-center gap-2.5 border-b border-white/5 pb-2.5 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px] shrink-0">
            {profilePictureUrl ? (
              <img src={profilePictureUrl} alt={username} referrerPolicy="no-referrer" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[8px] font-extrabold text-white">
                {username.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-white truncate">{username.startsWith('@') ? username : `@${username}`}</span>
            <span className="text-[9px] text-neutral-400">Publicação Oficial • Instagram</span>
          </div>
        </div>

        {/* Foto do Post em Alta Definição */}
        {imageUrl ? (
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-900 border border-white/5 shrink-0">
            <img src={imageUrl} alt="Post" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-square w-full rounded-xl bg-neutral-900 border border-white/5 flex items-center justify-center text-xs text-neutral-500 shrink-0">
            Sem imagem
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-between items-center text-white py-0.5 shrink-0">
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <MessageCircle className="w-4 h-4 text-neutral-300" />
            <Send className="w-4 h-4 text-neutral-300" />
          </div>
          <Bookmark className="w-4 h-4 text-neutral-300" />
        </div>

        {/* Curtidas & Data */}
        <div className="flex items-center justify-between text-[11px] shrink-0">
          <span className="font-bold text-white">{likes} {Number(likes) === 1 ? 'curtida' : 'curtidas'}</span>
          {publishedAt && (
            <span className="text-[9px] text-neutral-400">{new Date(publishedAt).toLocaleDateString('pt-BR')}</span>
          )}
        </div>

        {/* Legenda Completa com Destaque */}
        <div className="text-[11px] text-neutral-300 leading-relaxed whitespace-pre-line bg-white/[0.03] p-3 rounded-xl border border-white/5">
          <span className="font-bold text-white mr-1.5">{username.startsWith('@') ? username : `@${username}`}</span>
          {caption}
        </div>

        {/* Estatísticas do Post */}
        <div className="rounded-xl border border-white/10 bg-[#12121a] p-3 flex flex-col gap-2 shrink-0 mt-2">
          <div className="flex justify-between items-center text-[9px] font-bold uppercase text-neutral-400 tracking-wider">
            <span>Métricas do Post</span>
            <span className="text-emerald-400 font-bold">{engagement}% Engaj.</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center mt-1">
            <div className="bg-black/40 rounded-lg p-1.5 border border-white/5">
              <div className="text-[11px] font-bold text-white">{likes}</div>
              <div className="text-[7px] text-neutral-400 uppercase mt-0.5">Curtidas</div>
            </div>
            <div className="bg-black/40 rounded-lg p-1.5 border border-white/5">
              <div className="text-[11px] font-bold text-white">{comments || 0}</div>
              <div className="text-[7px] text-neutral-400 uppercase mt-0.5">Comentários</div>
            </div>
            <div className="bg-black/40 rounded-lg p-1.5 border border-white/5">
              <div className="text-[11px] font-bold text-white">{reach || 110}</div>
              <div className="text-[7px] text-neutral-400 uppercase mt-0.5">Alcance</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Home Indicator Bar */}
      <div className="h-5 flex items-center justify-center shrink-0 bg-transparent z-40 select-none pb-1">
        <div className="w-24 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
};
