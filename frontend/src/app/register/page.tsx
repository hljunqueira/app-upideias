"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRegister, loginWithGoogle } from "@up-analytics/lib";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiRegister(name, email, password);
      router.push("/app/dashboard");
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-upBlack min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-upPink/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-upCard border border-upBorder rounded-2xl p-8 z-10">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-upWhite">
            UP <span className="text-upPink">Analytics</span>
          </Link>
          <p className="text-xs text-upGray mt-1">by UpIdeias</p>
          <h2 className="text-lg font-bold text-upWhite mt-6">Criar sua conta gratuita</h2>
          <p className="text-sm text-upGray mt-1">Comece a transformar métricas em estratégia</p>
        </div>

        {error && (
          <div data-testid="register-error" className="mb-5 px-4 py-3 bg-upPink/10 border border-upPink/30 rounded-xl text-xs text-upPink font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-upLightGray" htmlFor="name">Nome completo</label>
            <input
              id="name"
              data-testid="register-name-input"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="px-4 py-3 bg-upBlack border border-upBorder rounded-xl text-upWhite placeholder-upGray text-sm focus:outline-none focus:border-upPink transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-upLightGray" htmlFor="email">E-mail</label>
            <input
              id="email"
              data-testid="register-email-input"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="px-4 py-3 bg-upBlack border border-upBorder rounded-xl text-upWhite placeholder-upGray text-sm focus:outline-none focus:border-upPink transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-upLightGray" htmlFor="password">Senha</label>
            <input
              id="password"
              data-testid="register-password-input"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="px-4 py-3 bg-upBlack border border-upBorder rounded-xl text-upWhite placeholder-upGray text-sm focus:outline-none focus:border-upPink transition-all"
            />
          </div>

          <button
            type="submit"
            data-testid="register-submit-button"
            disabled={loading}
            className="w-full py-3.5 bg-upPink hover:bg-upPinkDark text-upWhite font-bold rounded-xl transition-all shadow-lg hover:shadow-upPink/20 text-sm mt-2 disabled:opacity-60"
          >
            {loading ? "Criando conta..." : "Criar Conta Gratuita"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-grow h-px bg-upBorder"></div>
          <span className="text-[10px] text-upGray uppercase font-bold">ou</span>
          <div className="flex-grow h-px bg-upBorder"></div>
        </div>

        <button
          type="button"
          data-testid="google-register-button"
          onClick={loginWithGoogle}
          className="w-full py-3.5 bg-upBlack border border-upBorder hover:border-upPink/50 text-upWhite font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar com Google
        </button>

        <div className="mt-8 text-center text-xs text-upGray">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-upPink hover:underline font-semibold">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
