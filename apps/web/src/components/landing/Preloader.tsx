"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Preloader() {
  const [done, setDone] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Timeout de segurança para nunca travar a tela
    const safetyTimeout = setTimeout(() => {
      setDone(true);
      document.body.style.overflow = "";
    }, 3200);

    return () => {
      clearTimeout(safetyTimeout);
      document.body.style.overflow = "";
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Processamento de Chroma Key em tempo real no Canvas
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let isRunning = true;

    const processFrame = () => {
      if (!isRunning || video.paused || video.ended) {
        if (isRunning && !done) {
          animationFrameId.current = requestAnimationFrame(processFrame);
        }
        return;
      }

      const width = video.videoWidth || 640;
      const height = video.videoHeight || 360;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.drawImage(video, 0, 0, width, height);

      try {
        const frame = ctx.getImageData(0, 0, width, height);
        const data = frame.data;
        const len = data.length;

        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Algoritmo de Chroma Key para Fundo Verde
          // Fundo verde: G é predominante sobre R e B
          // Logo branca: R, G e B são altos e equivalentes (r ~= g ~= b > 180)
          const maxRB = Math.max(r, b);
          const greenDominance = g - maxRB;

          if (greenDominance > 45 && g > 70) {
            // Fundo verde puro -> transparência total
            data[i + 3] = 0;
          } else if (greenDominance > 20 && g > 60) {
            // Zona de transição (borda suave / anti-aliasing e remoção de green spill)
            const alphaFactor = 1 - (greenDominance - 20) / 25;
            data[i + 3] = Math.floor(data[i + 3] * Math.max(0, Math.min(1, alphaFactor)));
            // Remove o reflexo esverdeado atenuando o canal verde para a média de R e B
            data[i + 1] = Math.floor((r + b) / 2);
          }
        }

        ctx.putImageData(frame, 0, 0);
      } catch (e) {
        // Fallback em caso de restrição de CORS
      }

      animationFrameId.current = requestAnimationFrame(processFrame);
    };

    const handlePlay = () => {
      setVideoLoaded(true);
      processFrame();
    };

    const handleEnded = () => {
      setTimeout(() => {
        setDone(true);
        document.body.style.overflow = "";
      }, 300);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("ended", handleEnded);

    // Tenta iniciar a reprodução automaticamente
    video.play().catch(() => {
      // Autoplay bloqueado pelo browser: fallback após 2s
      setTimeout(() => setDone(true), 2000);
    });

    return () => {
      isRunning = false;
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("ended", handleEnded);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 0.97,
            filter: "blur(12px)",
            transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[100] bg-[#0A0A0C] flex flex-col items-center justify-center select-none overflow-hidden"
          data-testid="preloader"
        >
          {/* Elemento de vídeo oculto usado como fonte de dados para o Chroma Key */}
          <video
            ref={videoRef}
            src="/logo-preloader.mp4"
            playsInline
            muted
            autoPlay
            preload="auto"
            className="absolute -top-[9999px] -left-[9999px] opacity-0 pointer-events-none"
          />

          {/* Canvas com Chroma Key ativo em 60fps */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center"
          >
            {/* Brilho neon sutil atrás da logo animada */}
            <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-rose-600/20 via-pink-500/15 to-purple-600/20 blur-3xl -z-10 animate-pulse" />

            <canvas
              ref={canvasRef}
              className="max-w-[340px] sm:max-w-[420px] w-full h-auto object-contain drop-shadow-[0_0_35px_rgba(255,83,104,0.45)]"
            />

            {/* Fallback de imagem caso o vídeo demore a carregar */}
            {!videoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src="/UP-Logo-removebg-preview.png"
                  alt="UP Logo"
                  className="h-20 w-auto object-contain drop-shadow-[0_0_30px_rgba(255,83,104,0.5)] animate-pulse"
                />
              </div>
            )}
          </motion.div>

          {/* Barra de progresso de carregamento com gradiente neon */}
          <div className="mt-8 w-44 h-[2.5px] bg-white/10 overflow-hidden rounded-full backdrop-blur-sm">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="h-full w-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 shadow-[0_0_12px_rgba(255,83,104,0.9)]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
