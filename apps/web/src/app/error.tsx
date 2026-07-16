"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro capturado:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-upBlack flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,83,104,0.08),transparent_50%)] pointer-events-none" />

      <div className="z-10 flex flex-col items-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-upPink/10 text-upPink flex items-center justify-center border border-upPink/20 mb-6">
          <AlertTriangle className="w-8 h-8 animate-pulse" />
        </div>

        <h1 className="text-4xl font-extrabold text-upWhite tracking-tight">Ops! Algo deu errado</h1>
        <p className="text-sm text-upGray mt-3 leading-relaxed">
          Ocorreu um erro ao carregar as informações desta página. Tente recarregar ou volte mais tarde.
        </p>

        <button
          onClick={() => reset()}
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-upCard hover:bg-upDark text-upWhite text-sm font-bold border border-upBorder transition-all hover:scale-[1.02] cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-upPink" />
          <span>Tentar Novamente</span>
        </button>
      </div>
    </div>
  );
}
