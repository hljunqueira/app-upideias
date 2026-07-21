"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-upBlack flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,83,104,0.08),transparent_50%)] pointer-events-none" />
      
      <div className="z-10 flex flex-col items-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-upPink/10 text-upPink flex items-center justify-center border border-upPink/20 mb-6 animate-bounce">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h1 className="text-6xl font-black text-upWhite tracking-tighter">404</h1>
        <h2 className="text-xl font-bold text-upWhite mt-4">Página não encontrada</h2>
        <p className="text-sm text-upGray mt-2 leading-relaxed">
          O link que você acessou pode estar quebrado ou a página foi removida. Retorne ao painel para continuar acompanhando suas métricas.
        </p>

        <Link 
          href="/app/dashboard" 
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-upPink hover:bg-upPinkDark text-upWhite text-sm font-bold transition-all hover:scale-[1.02]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
