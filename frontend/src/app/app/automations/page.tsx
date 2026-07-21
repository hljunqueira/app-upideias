"use client";

import { useState } from "react";
import { 
  MessageSquare, 
  Send, 
  Smartphone, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { sendWhatsAppMessage } from "@up-analytics/lib";

export default function AutomationsPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageSent, setMessageSent] = useState<boolean | null>(null);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setLoading(true);
    setMessageSent(null);
    try {
      const success = await sendWhatsAppMessage(phoneNumber, "Olá! Este é um teste real de notificação enviado pelo UP Analytics.");
      if (success) {
        setMessageSent(true);
      } else {
        setMessageSent(false);
      }
    } catch (error) {
      console.error(error);
      setMessageSent(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-upPink" />
          Mensagens Automáticas
        </h1>
        <p className="text-sm text-upGray mt-1 font-medium">
          Integração oficial com a Evolution API para notificações automatizadas no WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* WhatsApp Setup status */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-upCard border border-upBorder rounded-2xl p-6">
            <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider mb-6 flex items-center gap-2">
              <Settings className="w-4 h-4 text-upPink" />
              Status da API
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-upGray">Instância:</span>
                <span className="font-bold text-upWhite">UP_ANALYTICS_PRO</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-upGray">Status:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 font-bold text-[10px]">Conectado</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-upGray">Versão:</span>
                <span className="text-upGray font-semibold">Evolution v1.8.2</span>
              </div>
            </div>
          </div>

          <div className="bg-upCard border border-upBorder rounded-2xl p-6">
            <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider mb-4">Recursos Ativos</h2>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 text-xs text-upLightGray cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-upBorder text-upPink focus:ring-upPink bg-upDark w-4 h-4" />
                Relatório Semanal de Desempenho
              </label>
              <label className="flex items-center gap-3 text-xs text-upLightGray cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-upBorder text-upPink focus:ring-upPink bg-upDark w-4 h-4" />
                Alertas de Queda no Alcance
              </label>
              <label className="flex items-center gap-3 text-xs text-upLightGray cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-upBorder text-upPink focus:ring-upPink bg-upDark w-4 h-4" />
                Novas ideias diárias do Gemini
              </label>
            </div>
          </div>
        </div>

        {/* WhatsApp Test Message Form */}
        <div className="md:col-span-2 bg-upCard border border-upBorder rounded-2xl p-6">
          <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider mb-6 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-upPink" />
            Enviar Mensagem de Teste
          </h2>

          <form onSubmit={handleSendTest} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-upGray uppercase tracking-wider">Número do WhatsApp (DDI + DDD + Número)</label>
              <input
                type="tel"
                placeholder="Ex: 5511999999999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 bg-upDark border border-upBorder rounded-xl text-sm text-upWhite placeholder-upGray outline-none focus:border-upPink/50 transition-all"
                required
              />
              <span className="text-[10px] text-upGray leading-normal">
                Insira o código do país (ex: 55 para o Brasil) seguido do DDD e o celular sem espaços ou traços.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !phoneNumber}
              className="px-6 py-3.5 bg-upPink hover:bg-upPinkDark disabled:opacity-50 text-upWhite text-sm font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-upPink/20 flex items-center justify-center gap-2 w-fit"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Enviando Teste...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Enviar Teste WhatsApp
                </>
              )}
            </button>
          </form>

          {/* Alert Message Responses */}
          {messageSent === true && (
            <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-green-400">Mensagem Enviada!</h4>
                <p className="text-[11px] text-upGray mt-1 leading-relaxed">
                  A mensagem de teste foi entregue com sucesso via Evolution API para a fila do WhatsApp.
                </p>
              </div>
            </div>
          )}

          {messageSent === false && (
            <div className="mt-6 p-4 rounded-xl bg-upPink/10 border border-upPink/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-upPink shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-upPink">Falha no Envio</h4>
                <p className="text-[11px] text-upGray mt-1 leading-relaxed">
                  Não foi possível entregar a mensagem. Verifique se o número inserido está correto e possui WhatsApp ativo.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
