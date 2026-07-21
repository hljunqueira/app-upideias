import React from "react";
import { cn } from "../../utils/cn";
import { Heart, MessageCircle, Send, Bookmark, Eye, Signal, Battery, Wifi } from "lucide-react";

interface PhoneMockupPreviewProps {
  caption: string;
  reach: string;
  likes: string;
  comments: string;
  engagement: string;
  type: string;
  className?: string;
}

export const PhoneMockupPreview: React.FC<PhoneMockupPreviewProps> = ({
  caption,
  reach,
  likes,
  comments,
  engagement,
  type,
  className,
}) => {
  return (
    <div className={cn("relative mx-auto w-[280px] h-[550px] bg-black rounded-[40px] border-[8px] border-upBorder shadow-2xl overflow-hidden flex flex-col", className)}>
      {/* Dynamic Island / Notch */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-end px-3">
        <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
      </div>

      {/* Status Bar */}
      <div className="h-10 pt-2 px-6 flex justify-between items-center text-[10px] text-upWhite font-semibold z-40 select-none bg-upDark/30 backdrop-blur-sm shrink-0">
        <span>10:50</span>
        <div className="flex items-center gap-1">
          <Signal className="w-2.5 h-2.5" />
          <Wifi className="w-2.5 h-2.5" />
          <Battery className="w-3 h-3" />
        </div>
      </div>

      {/* Screen Content */}
      <div className="flex-1 overflow-y-auto bg-[#050508] p-3 flex flex-col gap-3 scrollbar-hide">
        {/* Fake Instagram Header */}
        <div className="flex items-center gap-2 border-b border-upBorder/40 pb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[8px] font-extrabold text-upWhite">UP</div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-upWhite">creator_upideias</span>
            <span className="text-[8px] text-upGray">Patrocinado • Facebook Ads</span>
          </div>
        </div>

        {/* Caption */}
        <p className="text-[10px] text-upWhite leading-relaxed line-clamp-3">
          {caption}
        </p>

        {/* Media Box */}
        <div className="relative aspect-square w-full rounded-xl bg-gradient-to-br from-upPink/20 to-purple-500/20 border border-upBorder/60 flex items-center justify-center overflow-hidden group">
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[8px] font-bold text-upWhite uppercase">
            {type}
          </span>
          <div className="z-10 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-upPink/10 text-upPink flex items-center justify-center border border-upPink/20 animate-pulse">
              <Eye className="w-6 h-6" />
            </div>
            <span className="text-[9px] text-upWhite font-extrabold tracking-wider uppercase">Visualização Ativa</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center text-upWhite py-1">
          <div className="flex gap-3">
            <Heart className="w-4 h-4 text-upPink fill-upPink" />
            <MessageCircle className="w-4 h-4" />
            <Send className="w-4 h-4" />
          </div>
          <Bookmark className="w-4 h-4" />
        </div>

        {/* Stats overlay box inside phone */}
        <div className="rounded-xl border border-upBorder bg-upCard/80 backdrop-blur-md p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center text-[8px] font-bold uppercase text-upGray tracking-wider">
            <span>Resultados do Anúncio</span>
            <span className="text-green-400 font-extrabold">ROAS 4.8x</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-center mt-1">
            <div className="bg-upDark/50 rounded-lg p-1.5 border border-upBorder/40">
              <div className="text-[10px] font-extrabold text-upWhite">{reach}</div>
              <div className="text-[6px] text-upGray uppercase mt-0.5">Alcance</div>
            </div>
            <div className="bg-upDark/50 rounded-lg p-1.5 border border-upBorder/40">
              <div className="text-[10px] font-extrabold text-upWhite">{likes}</div>
              <div className="text-[6px] text-upGray uppercase mt-0.5">Cliques</div>
            </div>
            <div className="bg-upDark/50 rounded-lg p-1.5 border border-upBorder/40">
              <div className="text-[10px] font-extrabold text-green-400">{engagement}</div>
              <div className="text-[6px] text-upGray uppercase mt-0.5">Engaj.</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Home Indicator Bar */}
      <div className="h-6 flex items-center justify-center shrink-0 bg-transparent z-40 select-none pb-1">
        <div className="w-24 h-1 bg-upWhite/40 rounded-full" />
      </div>
    </div>
  );
};
