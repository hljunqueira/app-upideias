"use client";

import { useState, useEffect } from "react";
import { 
  BrainCircuit, 
  Sparkles, 
  ArrowUpRight, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  CheckSquare,
  RefreshCw
} from "lucide-react";
import { generateAiInsight } from "@up-analytics/lib";
import { AiInsight } from "@up-analytics/types";

import { PlanGate } from "@/components/common/PlanGate";

export default function AiStrategyPage() {
  const [insight, setInsight] = useState<AiInsight | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsight = async () => {
    setLoading(true);
    try {
      const data = await generateAiInsight("ig-account-123");
      setInsight(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, []);

  return (
    <PlanGate featureKey="aiStrategy" featureTitle="Estratégia IA">
      <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-upPink" />
            Estratégia IA
          </h1>
          <p className="text-sm text-upGray mt-1">
            Diagnósticos inteligentes de perfil gerados com base em inteligência artificial.
          </p>
        </div>

        <button 
          onClick={fetchInsight}
          disabled={loading}
          className="px-4 py-2 bg-upCard hover:bg-upDark text-upWhite border border-upBorder rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Recarregar Diagnóstico
        </button>
      </div>

      {loading ? (
        <div className="bg-upCard border border-upBorder rounded-2xl p-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-upPink/20 border-t-upPink animate-spin"></div>
          <span className="text-sm text-upGray font-medium">Analisando métricas de perfil com a IA...</span>
        </div>
      ) : insight ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Insights Panel */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-upCard border border-upBorder rounded-2xl p-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-upPink bg-upPink/10 px-2.5 py-1 rounded-md">
                Análise Semanal (Gemini Pro)
              </span>
              <h2 className="text-xl font-bold text-upWhite mt-4">{insight.title}</h2>
              <p className="text-sm text-upGray mt-3 leading-relaxed">{insight.summary}</p>
            </div>

            {/* Metrics Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Positive Indicators */}
              <div className="bg-upCard border border-upBorder rounded-2xl p-6">
                <div className="flex items-center gap-2 text-green-400 mb-4 font-bold text-sm uppercase tracking-wider">
                  <TrendingUp className="w-5 h-5" />
                  O Que Melhorou
                </div>
                <ul className="flex flex-col gap-3">
                  {insight.what_improved.map((item: string, index: number) => (
                    <li key={index} className="text-xs text-upGray flex items-start gap-2.5 leading-relaxed">
                      <span className="text-green-400 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Negative Indicators */}
              <div className="bg-upCard border border-upBorder rounded-2xl p-6">
                <div className="flex items-center gap-2 text-upPink mb-4 font-bold text-sm uppercase tracking-wider">
                  <TrendingDown className="w-5 h-5" />
                  Pontos de Atenção
                </div>
                <ul className="flex flex-col gap-3">
                  {insight.what_got_worse.map((item: string, index: number) => (
                    <li key={index} className="text-xs text-upGray flex items-start gap-2.5 leading-relaxed">
                      <span className="text-upPink mt-0.5">⚠</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Opportunities */}
            <div className="bg-upCard border border-upBorder rounded-2xl p-6">
              <div className="flex items-center gap-2 text-upWhite mb-4 font-bold text-sm uppercase tracking-wider">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Oportunidades de Ouro
              </div>
              <ul className="flex flex-col gap-3">
                {insight.opportunities.map((item: string, index: number) => (
                  <li key={index} className="text-xs text-upGray flex items-start gap-2.5 leading-relaxed">
                    <span className="text-yellow-400 font-bold mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Actions and Next Steps */}
          <div className="flex flex-col gap-6">
            {/* Recommended Actions */}
            <div className="bg-upCard border border-upBorder rounded-2xl p-6">
              <h3 className="text-sm font-bold text-upWhite uppercase tracking-wider mb-6 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-upPink" />
                Ações Recomendadas
              </h3>
              <ul className="flex flex-col gap-4">
                {insight.recommended_actions.map((action: string, index: number) => (
                  <li key={index} className="flex gap-3 items-start bg-upDark/40 p-3 rounded-xl border border-upBorder/30">
                    <span className="w-5 h-5 rounded-full bg-upPink/10 text-upPink flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-xs text-upLightGray leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ideas Suggestions */}
            <div className="bg-upCard border border-upBorder rounded-2xl p-6">
              <h3 className="text-sm font-bold text-upWhite uppercase tracking-wider mb-6 flex items-center gap-2">
                Sugestões de Post
              </h3>
              {insight.content_suggestions.map((suggestion: any, index: number) => (
                <div key={index} className="flex flex-col gap-3 bg-upDark/50 p-4 rounded-xl border border-upBorder/60">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded-md bg-upPink/10 text-upPink text-[10px] font-bold uppercase">
                      {suggestion.format}
                    </span>
                    <span className="text-[10px] text-upGray">{suggestion.objective}</span>
                  </div>
                  <h4 className="text-sm font-bold text-upWhite leading-snug">{suggestion.theme}</h4>
                  <button className="w-full mt-2 py-2.5 bg-upPink hover:bg-upPinkDark text-upWhite text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1">
                    Gerar Postagem <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-upCard border border-upBorder rounded-2xl p-12 text-center text-upGray">
          Nenhum diagnóstico gerado ainda.
        </div>
      )}
    </div>
    </PlanGate>
  );
}
