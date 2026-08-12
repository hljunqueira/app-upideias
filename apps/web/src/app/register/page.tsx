"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowRight, Check, AlertCircle } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { apiRegister, loginWithGoogle } from "@/lib/api";
import { PlanConfig, getStoredPlans } from "@/lib/plansStore";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramPlan = searchParams.get("plan");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState(paramPlan || "pro");
  const [plansList, setPlansList] = useState<PlanConfig[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (paramPlan) setPlan(paramPlan);
  }, [paramPlan]);

  useEffect(() => {
    const list = getStoredPlans();
    setPlansList(list);
    const handleUpdate = () => setPlansList(getStoredPlans());
    window.addEventListener("up_plans_updated", handleUpdate);
    return () => window.removeEventListener("up_plans_updated", handleUpdate);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiRegister(name, email, password);
      router.push(`/checkout?plan=${plan}`);
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await loginWithGoogle(`/checkout?plan=${plan}`);
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com Google Auth.");
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell script="Começe hoje!" headline={"CRIE SUA\nCONTA UP."}>
      <div className="lg:hidden text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-0.5">
          <img src="/UP-Logo-removebg-preview.png" alt="UP" className="h-8 w-auto object-contain" />
          <span className="font-script text-2xl text-white font-normal -ml-2.5">ideias</span>
        </Link>
      </div>

      <h2 className="font-display text-3xl font-bold text-white">Criar sua conta</h2>
      <p className="text-sm text-upGray mt-2">Escolha o plano ideal e continue para o checkout seguro</p>

      {error && (
        <div data-testid="register-error" className="mt-6 px-4 py-3 bg-upPink/10 border border-upPink/30 rounded-xl text-xs text-upPink font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Plan selector */}
      <div className="grid grid-cols-3 gap-2.5 mt-7">
        {plansList.map((p) => {
          const priceDisplay = typeof p.priceMonthly === "number" ? `R$ ${p.priceMonthly}` : p.priceMonthly;
          const isSelected = plan.toLowerCase() === p.id.toLowerCase() || plan.toLowerCase() === p.name.toLowerCase();
          return (
            <button
              key={p.id}
              type="button"
              data-testid={`register-plan-${p.id}`}
              onClick={() => setPlan(p.id)}
              className={`relative rounded-2xl border px-3 py-3 text-left transition-all duration-300 ${isSelected
                ? "border-upPink bg-upPink/10 shadow-[0_0_20px_rgba(255,83,104,0.2)]"
                : "border-upBorder bg-upCard/50 hover:border-upPink/40"
                }`}
            >
              {p.featured && (
                <span className="absolute -top-2 right-2 text-[9px] bg-upPink text-white font-bold uppercase px-2 py-0.5 rounded-full">Top</span>
              )}
              <span className="block text-xs font-bold text-white font-display">{p.name}</span>
              <span className="block text-[11px] text-upGray mt-0.5">{priceDisplay}/mês</span>
              {isSelected && <Check className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 text-upPink" />}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-upLightGray uppercase tracking-wider" htmlFor="name">Nome completo</label>
          <input
            id="name"
            data-testid="register-name-input"
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="px-4 py-3.5 bg-upCard/60 backdrop-blur-md border border-upBorder rounded-2xl text-white placeholder-upGray text-sm focus:outline-none focus:border-upPink focus:shadow-[0_0_20px_rgba(255,83,104,0.15)] transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-upLightGray uppercase tracking-wider" htmlFor="email">E-mail</label>
          <input
            id="email"
            data-testid="register-email-input"
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
            data-testid="register-password-input"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="px-4 py-3.5 bg-upCard/60 backdrop-blur-md border border-upBorder rounded-2xl text-white placeholder-upGray text-sm focus:outline-none focus:border-upPink focus:shadow-[0_0_20px_rgba(255,83,104,0.15)] transition-all"
          />
        </div>

        <button
          type="submit"
          data-testid="register-submit-button"
          disabled={loading || googleLoading}
          className="group w-full py-4 bg-upPink hover:bg-upPinkDark text-white font-bold rounded-full transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,83,104,0.45)] hover:-translate-y-0.5 text-sm mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? "Processando..." : "Ir para o Checkout"}
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-grow h-px bg-upBorder"></div>
        <span className="text-[10px] text-upGray uppercase font-bold tracking-widest">ou</span>
        <div className="flex-grow h-px bg-upBorder"></div>
      </div>

      <button
        type="button"
        data-testid="google-register-button"
        onClick={handleGoogleRegister}
        disabled={googleLoading || loading}
        className="w-full py-3.5 bg-upCard/60 backdrop-blur-md border border-upBorder hover:border-upPink/50 text-white font-semibold rounded-full transition-all text-sm flex items-center justify-center gap-3 disabled:opacity-60"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {googleLoading ? "Conectando ao Google..." : "Continuar com Google"}
      </button>

      <div className="mt-8 text-center text-xs text-upGray">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-upPink hover:underline font-semibold" data-testid="register-goto-login">
          Entrar
        </Link>
      </div>
    </AuthShell>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-upBlack flex items-center justify-center text-upPink">Carregando Cadastro...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
