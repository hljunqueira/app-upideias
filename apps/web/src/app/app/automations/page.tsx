"use client";

import { useState } from "react";
import { 
  Send, 
  Smartphone, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  BellRing,
  ShieldCheck,
  Zap
} from "lucide-react";
import { sendWhatsAppMessage } from "@up-analytics/lib";

import { PlanGate } from "@/components/common/PlanGate";

export default function AutomationsPage() {
  const [phoneNumber, setPhoneNumber] = useState("5511999999999");
  const [loading, setLoading] = useState(false);
  const [messageSent, setMessageSent] = useState<boolean | null>(null);
  const [savedSettings, setSavedSettings] = useState(false);

  // Toggles de notificacoes
  const [notifications, setNotifications] = useState({
    weeklyReport: true,
    reachAlerts: true,
    approvalsReminder: true,
    newCourses: true
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setLoading(true);
    setMessageSent(null);
    try {
      const success = await sendWhatsAppMessage(
        phoneNumber,
        "🟢 UP Ideias: Seu número foi conectado com sucesso para receber notificações de desempenho e lembretes de postagens!"
      );
      if (success) {
        setMessageSent(true);
        setSavedSettings(true);
        setTimeout(() => setSavedSettings(false), 3000);
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
    <PlanGate featureKey="whatsappAutomations" featureTitle="Notificações via WhatsApp">
      <div className="flex flex-col gap-8 max-w-4xl mx-auto animate-fadeIn text-upLightGray">
      
      {/* Title com Ícone Oficial do WhatsApp */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-3">
            {/* SVG Oficial do WhatsApp */}
            <div className="w-9 h-9 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 fill-[#25D366]" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </div>
            <span>Notificações via WhatsApp</span>
          </h1>
          <p className="text-sm text-upGray mt-1">
            Receba relatórios semanais de desempenho, alertas de engajamento e avisos no seu celular.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Lado Esquerdo: Status da Conexão */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-upCard border border-upBorder rounded-3xl p-6 space-y-4 shadow-xl">
            <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#25D366]" />
              Status da Conexão
            </h2>

            <div className="flex flex-col gap-3.5 pt-2">
              <div className="flex justify-between items-center text-xs border-b border-upBorder/30 pb-3">
                <span className="text-upGray font-medium">Serviço:</span>
                <span className="font-bold text-upWhite flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                  Notificações UP
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-upBorder/30 pb-3">
                <span className="text-upGray font-medium">Status:</span>
                <span className="px-2.5 py-1 rounded-full bg-[#25D366]/15 text-[#25D366] font-extrabold text-[10px] border border-[#25D366]/30">
                  Ativo & Conectado
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-upGray font-medium">Canal Oficial:</span>
                <span className="text-upWhite font-semibold">WhatsApp Verificado</span>
              </div>
            </div>
          </div>

          <div className="bg-upCard border border-upBorder rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider flex items-center gap-2">
              <BellRing className="w-4 h-4 text-upPink" />
              Notificações Desejadas
            </h2>
            
            <div className="flex flex-col gap-3.5 pt-1">
              <label className="flex items-center gap-3 text-xs text-upLightGray cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifications.weeklyReport}
                  onChange={() => handleToggle("weeklyReport")}
                  className="rounded border-upBorder text-upPink focus:ring-upPink bg-upDark w-4 h-4 accent-upPink"
                />
                <span>Relatório Semanal de Desempenho</span>
              </label>

              <label className="flex items-center gap-3 text-xs text-upLightGray cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifications.reachAlerts}
                  onChange={() => handleToggle("reachAlerts")}
                  className="rounded border-upBorder text-upPink focus:ring-upPink bg-upDark w-4 h-4 accent-upPink"
                />
                <span>Alertas de Queda no Alcance</span>
              </label>

              <label className="flex items-center gap-3 text-xs text-upLightGray cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifications.approvalsReminder}
                  onChange={() => handleToggle("approvalsReminder")}
                  className="rounded border-upBorder text-upPink focus:ring-upPink bg-upDark w-4 h-4 accent-upPink"
                />
                <span>Lembrete de Posts para Aprovação</span>
              </label>

              <label className="flex items-center gap-3 text-xs text-upLightGray cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifications.newCourses}
                  onChange={() => handleToggle("newCourses")}
                  className="rounded border-upBorder text-upPink focus:ring-upPink bg-upDark w-4 h-4 accent-upPink"
                />
                <span>Avisos de Cursos & Módulos</span>
              </label>
            </div>
          </div>
        </div>

        {/* Lado Direito: Formulário do Número de WhatsApp */}
        <div className="md:col-span-2 bg-upCard border border-upBorder rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider mb-6 flex items-center gap-2">
              <Smartphone className="w-4.5 h-4.5 text-[#25D366]" />
              Configurar Celular para Receber Notificações
            </h2>

            <form onSubmit={handleSendTest} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-upGray uppercase tracking-wider">
                  Número do seu WhatsApp (Com DDD)
                </label>
                <input
                  type="tel"
                  placeholder="Ex: 5511999999999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-upDark border border-upBorder rounded-2xl text-sm text-upWhite placeholder-upGray outline-none focus:border-[#25D366]/60 transition-all font-mono"
                  required
                />
                <span className="text-[10px] text-upGray leading-relaxed">
                  Insira o número completo com DDD (ex: 55 para o Brasil + DDD + Número do Celular).
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !phoneNumber}
                  className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-black text-xs font-extrabold rounded-2xl transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Enviando Teste...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-black" />
                      <span>Salvar & Enviar Notificação de Teste</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Alertas de Sucesso / Erro */}
            {messageSent === true && (
              <div className="mt-6 p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-start gap-3 animate-fadeIn">
                <CheckCircle className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#25D366]">WhatsApp Conectado com Sucesso!</h4>
                  <p className="text-[11px] text-upGray mt-1 leading-relaxed">
                    Uma mensagem de teste foi enviada para o seu WhatsApp. Suas preferências de notificação já estão ativas.
                  </p>
                </div>
              </div>
            )}

            {messageSent === false && (
              <div className="mt-6 p-4 rounded-2xl bg-upPink/10 border border-upPink/30 flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-upPink shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-upPink">Não foi possível enviar a mensagem</h4>
                  <p className="text-[11px] text-upGray mt-1 leading-relaxed">
                    Verifique se o número inserido contém o código do país (ex: 55) e o DDD correto.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-upDark/50 border border-upBorder/40 p-4 rounded-2xl flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-[11px] text-upGray leading-relaxed">
              <strong className="text-white">Dica:</strong> As notificações via WhatsApp ajudam a você nunca perder um aviso importante sobre a performance da sua conta ou aprovação de posts.
            </p>
          </div>
        </div>
      </div>
    </div>
    </PlanGate>
  );
}
