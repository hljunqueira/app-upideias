"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login and redirect to app dashboard
    router.push("/app/dashboard");
  };

  return (
    <div className="bg-upBlack min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-upPink/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-upCard border border-upBorder rounded-2xl p-8 z-10">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-upWhite">
            UP <span className="text-upPink">Analytics</span>
          </Link>
          <p className="text-xs text-upGray mt-1">by UpIdeias</p>
          <h2 className="text-lg font-bold text-upWhite mt-6">Entrar na sua conta</h2>
          <p className="text-sm text-upGray mt-1">Insira seus dados de acesso abaixo</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-upLightGray" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="px-4 py-3 bg-upBlack border border-upBorder rounded-xl text-upWhite placeholder-upGray text-sm focus:outline-none focus:border-upPink transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-upLightGray" htmlFor="password">
                Senha
              </label>
              <a href="#" className="text-xs text-upPink hover:underline">Esqueceu a senha?</a>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="px-4 py-3 bg-upBlack border border-upBorder rounded-xl text-upWhite placeholder-upGray text-sm focus:outline-none focus:border-upPink transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-upPink hover:bg-upPinkDark text-upWhite font-bold rounded-xl transition-all shadow-lg hover:shadow-upPink/20 text-sm mt-2"
          >
            Entrar no Painel
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-upGray">
          Não tem uma conta?{" "}
          <Link href="/register" className="text-upPink hover:underline font-semibold">
            Criar conta gratuitamente
          </Link>
        </div>
      </div>
    </div>
  );
}
