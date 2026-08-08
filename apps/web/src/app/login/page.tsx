"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (email.trim().toLowerCase() === "admin@upideias.com") {
        router.push("/admin");
      } else {
        router.push("/app/dashboard");
      }
    }, 400);
  };

  return (
    <AuthShell script="bem-vindo de volta!" headline={"ENTRE NO\nMUNDO UP."}>
      <div className="lg:hidden text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-0.5">
          <img src="/UP-Logo-removebg-preview.png" alt="UP" className="h-8 w-auto object-contain" />
          <span className="font-script text-2xl text-white font-normal -ml-2.5">ideias</span>
        </Link>
      </div>

      <h2 className="font-display text-3xl font-bold text-white">Entrar na sua conta</h2>
      <p className="text-sm text-upGray mt-2">Acesse o painel com seus dados</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-8">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-upLightGray uppercase tracking-wider" htmlFor="email">E-mail</label>
          <input
            id="email"
            data-testid="login-email-input"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-3.5 bg-upCard/60 backdrop-blur-md border border-upBorder rounded-2xl text-white placeholder-upGray text-sm focus:outline-none focus:border-upPink focus:shadow-[0_0_20px_rgba(255,83,104,0.15)] transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-upLightGray uppercase tracking-wider" htmlFor="password">Senha</label>
          <input
            id="password"
            data-testid="login-password-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-4 py-3.5 bg-upCard/60 backdrop-blur-md border border-upBorder rounded-2xl text-white placeholder-upGray text-sm focus:outline-none focus:border-upPink focus:shadow-[0_0_20px_rgba(255,83,104,0.15)] transition-all"
          />
        </div>

        <button
          type="submit"
          data-testid="login-submit-button"
          disabled={loading}
          className="group w-full py-4 bg-upPink hover:bg-upPinkDark text-white font-bold rounded-full transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,83,104,0.45)] hover:-translate-y-0.5 text-sm mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? "Entrando..." : "Entrar no Painel"}
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </form>

      {/* Quick Fill Credentials Buttons */}
      <div className="mt-6 p-3.5 bg-upCard/40 border border-upBorder/60 rounded-2xl flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-upGray text-center">Atalho de Acesso Rápido</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setEmail("user@upideias.com");
              setPassword("usuario123");
            }}
            className="px-3 py-2 bg-upDark hover:bg-upPink/10 border border-upBorder hover:border-upPink/40 rounded-xl text-xs text-white transition-all text-left flex flex-col"
          >
            <span className="font-bold text-upPink">👤 Usuário</span>
            <span className="text-[10px] text-upGray truncate">user@upideias.com</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setEmail("admin@upideias.com");
              setPassword("admin123");
            }}
            className="px-3 py-2 bg-upDark hover:bg-purple-500/10 border border-upBorder hover:border-purple-500/40 rounded-xl text-xs text-white transition-all text-left flex flex-col"
          >
            <span className="font-bold text-purple-400">⚡ Admin</span>
            <span className="text-[10px] text-upGray truncate">admin@upideias.com</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-grow h-px bg-upBorder"></div>
        <span className="text-[10px] text-upGray uppercase font-bold tracking-widest">ou</span>
        <div className="flex-grow h-px bg-upBorder"></div>
      </div>

      <button
        type="button"
        data-testid="google-login-button"
        onClick={() => router.push("/app/dashboard")}
        className="w-full py-3.5 bg-upCard/60 backdrop-blur-md border border-upBorder hover:border-upPink/50 text-white font-semibold rounded-full transition-all text-sm flex items-center justify-center gap-3"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continuar com Google
      </button>

      <div className="mt-8 text-center text-xs text-upGray">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-upPink hover:underline font-semibold" data-testid="login-goto-register">
          Criar conta
        </Link>
      </div>
    </AuthShell>
  );
}
