"use client";

import { useEffect, useRef, useState } from "react";
import { Video, ShieldCheck, Lock } from "lucide-react";

interface ProtectedVideoPlayerProps {
  videoUrl: string;
  title?: string;
  videoProvider?: "youtube" | "cloudflare" | "vimeo" | "panda" | "mp4" | "hls";
  playbackSpeed?: number;
  onSpeedChange?: (speed: number) => void;
}

export function ProtectedVideoPlayer({
  videoUrl,
  title = "Aula UP Creator",
  videoProvider = "youtube",
  playbackSpeed = 1,
  onSpeedChange
}: ProtectedVideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper para formatar a URL do YouTube com parâmetros de privacidade e JS API
  const formatEmbedUrl = (url: string): string => {
    if (!url) return "";

    let videoId = "";
    if (url.includes("youtube.com/watch")) {
      const match = url.match(/v=([^&]+)/);
      if (match) videoId = match[1];
    } else if (url.includes("youtu.be/")) {
      const parts = url.split("youtu.be/");
      if (parts[1]) videoId = parts[1].split("?")[0];
    } else if (url.includes("youtube.com/embed/")) {
      const parts = url.split("youtube.com/embed/");
      if (parts[1]) videoId = parts[1].split("?")[0];
    }

    if (videoId) {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://www.upideias.com";
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=1&origin=${encodeURIComponent(origin)}`;
    }

    return url;
  };

  const formattedUrl = formatEmbedUrl(videoUrl);

  // Efeito para enviar o comando de alteração de velocidade de reprodução (1x, 1.25x, 1.5x, 2x)
  useEffect(() => {
    if (videoProvider === "youtube" && iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({
            event: "command",
            func: "setPlaybackRate",
            args: [playbackSpeed]
          }),
          "*"
        );
      } catch {
        /* ignore */
      }
    } else if (videoProvider === "mp4" && videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, videoProvider]);

  return (
    <div
      className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden border border-upBorder/60 shadow-2xl group select-none"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* SHIELD OVERLAY DO TOPO: Bloqueia o clique no título/logo "Assistir no YouTube" */}
      {videoProvider === "youtube" && (
        <div
          className="absolute top-0 left-0 right-0 h-[15%] z-20 bg-transparent cursor-default"
          title="Vídeo protegido - Exclusivo na Plataforma UP Creator"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* RENDERIZADOR DE STREAMING MULTI-PROVEDOR */}
      {videoProvider === "mp4" ? (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          className="w-full h-full object-contain"
          onLoadedData={() => setIsLoaded(true)}
          onContextMenu={(e) => e.preventDefault()}
        />
      ) : formattedUrl ? (
        <iframe
          ref={iframeRef}
          src={formattedUrl}
          title={title}
          className="w-full h-full border-0 relative z-10"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
          <Video className="w-12 h-12 text-upPink mb-3 opacity-80" />
          <p className="text-sm font-bold text-white">Carregando Streaming de Aula...</p>
        </div>
      )}

      {/* BADGE VISUAL DE PROTEÇÃO */}
      <div className="absolute top-3 left-3 z-30 bg-black/70 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[9px] font-semibold text-emerald-400 flex items-center gap-1.5 pointer-events-none shadow-lg">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Transmissão Segura Anti-Download HLS</span>
      </div>
    </div>
  );
}
