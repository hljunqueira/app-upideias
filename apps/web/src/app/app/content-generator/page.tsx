"use client";

import { useState } from "react";
import { 
  PenTool, 
  SlidersHorizontal,
  Send,
  Loader2,
  Calendar,
  Save,
  Check
} from "lucide-react";
import { generateContentIdeas, saveToContentLibrary, addContentToCalendar } from "@up-analytics/lib";
import { ContentIdea } from "@up-analytics/types";

export default function ContentGeneratorPage() {
  const [niche, setNiche] = useState("");
  const [objective, setObjective] = useState("Engajamento");
  const [tone, setTone] = useState("Profissional");
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const [calendarStatus, setCalendarStatus] = useState<Record<string, boolean>>({});

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche) return;

    setLoading(true);
    try {
      const data = await generateContentIdeas(niche, objective);
      const customizedData = data.map(item => ({
        ...item,
        niche,
        objective,
        tone
      }));
      setIdeas(customizedData);
    } catch (error) {
      console.error("Erro ao gerar ideias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLibrary = async (idea: ContentIdea) => {
    try {
      await saveToContentLibrary({
        user_id: idea.user_id,
        client_id: null,
        type: idea.format || 'post',
        title: idea.theme || idea.title || 'Ideia de Conteúdo',
        content: idea.caption || idea.script || idea.hook || '',
        tags: idea.hashtags || [],
      });
      setSavedStatus(prev => ({ ...prev, [idea.id]: true }));
      setTimeout(() => {
        setSavedStatus(prev => ({ ...prev, [idea.id]: false }));
      }, 3000);
    } catch (err) {
      console.error("Erro ao salvar na biblioteca:", err);
    }
  };

  const handleAddToCalendar = async (idea: ContentIdea) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await addContentToCalendar({
        user_id: idea.user_id,
        client_id: null,
        content_idea_id: idea.id,
        instagram_account_id: idea.instagram_account_id || '',
        planned_date: today,
        planned_time: '18:00',
        status: 'planned',
        notes: `Tema: ${idea.theme || idea.title}. Gancho: ${idea.hook || ''}`,
      });
      setCalendarStatus(prev => ({ ...prev, [idea.id]: true }));
      setTimeout(() => {
        setCalendarStatus(prev => ({ ...prev, [idea.id]: false }));
      }, 3000);
    } catch (err) {
      console.error("Erro ao agendar no calendário:", err);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-2">
          <PenTool className="w-8 h-8 text-upPink" />
          Gerador Estratégico de Conteúdo
        </h1>
        <p className="text-sm text-upGray mt-1">
          Crie pautas estruturadas, roteiros de Reels e legendas alinhadas aos objetivos da sua marca.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Settings Form */}
        <div className="md:col-span-1 bg-upCard border border-upBorder rounded-2xl p-6 h-fit">
          <h2 className="text-sm font-bold text-upWhite uppercase tracking-wider mb-6 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-upPink" />
            Parâmetros
          </h2>

          <form onSubmit={handleGenerate} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-upGray uppercase tracking-wider">Seu Nicho / Tema</label>
              <input
                type="text"
                placeholder="Ex: Desenvolvimento Web, Nutrição"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-4 py-3 bg-upDark border border-upBorder rounded-xl text-sm text-upWhite placeholder-upGray outline-none focus:border-upPink/50 transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-upGray uppercase tracking-wider">Objetivo</label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full px-4 py-3 bg-upDark border border-upBorder rounded-xl text-sm text-upWhite outline-none focus:border-upPink/50 transition-all"
              >
                <option value="Engajamento">Engajamento / Alcance</option>
                <option value="Vendas">Vendas / Conversão</option>
                <option value="Autoridade">Autoridade / Educação</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-upGray uppercase tracking-wider">Tom da Voz</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-4 py-3 bg-upDark border border-upBorder rounded-xl text-sm text-upWhite outline-none focus:border-upPink/50 transition-all"
              >
                <option value="Profissional">Profissional & Autoritário</option>
                <option value="Casual">Casual & Descontraído</option>
                <option value="Persuasivo">Persuasivo & Inspirador</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !niche}
              className="w-full py-3.5 bg-upPink hover:bg-upPinkDark disabled:opacity-50 text-upWhite text-sm font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-upPink/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando Estratégia...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Gerar Ideias
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated Output */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {ideas.length > 0 ? (
            ideas.map((idea) => (
              <div key={idea.id} className="bg-upCard border border-upBorder rounded-2xl p-6 flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-upPink/10 text-upPink text-[10px] font-bold uppercase tracking-wider">
                      {idea.format}
                    </span>
                    <h3 className="text-lg font-bold text-upWhite mt-2">{idea.theme}</h3>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveToLibrary(idea)}
                      className="p-2 bg-upDark hover:bg-upBorder border border-upBorder text-upLightGray hover:text-upWhite rounded-lg transition-all"
                      title="Salvar na Biblioteca"
                    >
                      {savedStatus[idea.id] ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Body details */}
                <div className="flex flex-col gap-4">
                  {idea.hook && (
                    <div className="p-4 rounded-xl bg-upDark/50 border border-upBorder/40">
                      <span className="text-[10px] text-upGray font-bold uppercase tracking-wider">Gancho Inicial (0-3s)</span>
                      <p className="text-xs text-upWhite mt-1 font-semibold italic">"{idea.hook}"</p>
                    </div>
                  )}

                  {idea.caption && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-upGray font-bold uppercase tracking-wider">Legenda Sugerida</span>
                      <p className="text-xs text-upLightGray whitespace-pre-line leading-relaxed bg-upDark/30 p-4 rounded-xl border border-upBorder/20">
                        {idea.caption}
                      </p>
                    </div>
                  )}

                  {idea.script && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-upGray font-bold uppercase tracking-wider">Roteiro visual & Cena</span>
                      <p className="text-xs text-upLightGray whitespace-pre-line leading-relaxed bg-upDark/30 p-4 rounded-xl border border-upBorder/20">
                        {idea.script}
                      </p>
                    </div>
                  )}

                  {idea.hashtags && (
                    <div className="flex flex-wrap gap-2">
                      {idea.hashtags.map((tag) => (
                        <span key={tag} className="text-xs text-upPink font-medium">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer action */}
                <div className="flex justify-end gap-3 border-t border-upBorder/30 pt-4 mt-2">
                  <button 
                    onClick={() => handleAddToCalendar(idea)}
                    className="px-4 py-2 border border-upBorder hover:bg-upDark text-upWhite text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    {calendarStatus[idea.id] ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Agendado no Calendário
                      </>
                    ) : (
                      <>
                        <Calendar className="w-3.5 h-3.5" />
                        Enviar ao Calendário
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-upCard border border-upBorder rounded-2xl p-16 text-center text-upGray flex flex-col items-center justify-center gap-4 h-full min-h-[300px]">
              <div className="w-12 h-12 rounded-2xl bg-upPink/10 text-upPink border border-upPink/20 flex items-center justify-center">
                <PenTool className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-upWhite">Aguardando Parâmetros</h3>
                <p className="text-xs text-upGray mt-1 max-w-xs mx-auto">
                  Preencha o formulário ao lado e clique em "Gerar" para ver ideias criadas de posts personalizadas para o seu negócio.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
