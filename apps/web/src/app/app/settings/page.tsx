"use client";

import { useState } from "react";
import { Settings, User, Key, Bell, Shield, Save, Check } from "lucide-react";

export default function SettingsPage() {
  const [userName, setUserName] = useState("Creator");
  const [userEmail, setUserEmail] = useState("creator@upideias.com");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-2">
          <Settings className="w-8 h-8 text-upPink" />
          Configurações da Conta
        </h1>
        <p className="text-sm text-upGray mt-1">Configure suas preferências, perfil de acesso e segurança.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 bg-upCard border border-upBorder rounded-2xl p-4 h-fit flex flex-col gap-1">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold bg-upPink text-upWhite w-full text-left">
            <User className="w-4 h-4" /> Perfil de Usuário
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-upGray hover:text-upWhite hover:bg-upDark/50 w-full text-left">
            <Key className="w-4 h-4" /> Senha & Segurança
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-upGray hover:text-upWhite hover:bg-upDark/50 w-full text-left">
            <Bell className="w-4 h-4" /> Preferências
          </button>
        </div>

        {/* Content Form */}
        <div className="md:col-span-2 bg-upCard border border-upBorder rounded-2xl p-6">
          <h2 className="text-xs font-bold text-upWhite uppercase tracking-wider mb-6 flex items-center gap-2">
            <User className="w-4 h-4 text-upPink" /> Informações de Perfil
          </h2>

          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-upGray uppercase tracking-wider">Nome Completo</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-3 bg-upDark border border-upBorder rounded-xl text-sm text-upWhite placeholder-upGray outline-none focus:border-upPink/50 transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-upGray uppercase tracking-wider">Endereço de E-mail</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-4 py-3 bg-upDark border border-upBorder rounded-xl text-sm text-upWhite placeholder-upGray outline-none focus:border-upPink/50 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-upPink hover:bg-upPinkDark text-upWhite text-xs font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-upPink/20 flex items-center justify-center gap-2 w-fit mt-4"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-green-400" /> Salvo com sucesso!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Salvar Alterações
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
