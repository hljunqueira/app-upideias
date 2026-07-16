"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [agree, setAgree] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate signup and redirect to app dashboard
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
          <h2 className="text-lg font-bold text-upWhite mt-6">Criar sua conta</h2>
          <p className="text-sm text-upGray mt-1">Experimente grátis por 7 dias</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-upLightGray" htmlFor="name">
              Nome Completo
            </label>
            <input
              id="name"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="px-4 py-3 bg-upBlack border border-upBorder rounded-xl text-upWhite placeholder-upGray text-sm focus:outline-none focus:border-upPink transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-upLightGray" htmlFor="email">
              E-mail corporativo
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
            <label className="text-xs font-semibold text-upLightGray" htmlFor="whatsapp">
              WhatsApp (com DDD)
            </label>
            <input
              id="whatsapp"
              type="tel"
              placeholder="(11) 99999-9999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
              className="px-4 py-3 bg-upBlack border border-upBorder rounded-xl text-upWhite placeholder-upGray text-sm focus:outline-none focus:border-upPink transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-upLightGray" htmlFor="password">
              Senha
            </label>
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

          <div className="flex items-start gap-3 mt-2">
            <input
              id="agree"
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              required
              className="mt-1 w-4 h-4 rounded border-upBorder bg-upBlack text-upPink focus:ring-upPink"
            />
            <label htmlFor="agree" className="text-xs text-upGray leading-relaxed">
              Aceito receber mensagens automáticas e relatórios no WhatsApp e concordo com os{" "}
              <Link href="/terms" className="text-upPink hover:underline">
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link href="/privacy" className="text-upPink hover:underline">
                Política de Privacidade
              </Link>
              .
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-upPink hover:bg-upPinkDark text-upWhite font-bold rounded-xl transition-all shadow-lg hover:shadow-upPink/20 text-sm mt-4"
          >
            Criar Minha Conta
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-upGray">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-upPink hover:underline font-semibold">
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}
