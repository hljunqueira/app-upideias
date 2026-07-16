"use client";

import { useState } from "react";
import { 
  Library, 
  Search, 
  FolderPlus, 
  Image as ImageIcon, 
  Video, 
  FileText,
  Trash2,
  Calendar
} from "lucide-react";

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const mockLibraryItems = [
    {
      id: "lib-1",
      title: "Identidade Visual - UP Analytics",
      type: "image",
      description: "Logo oficial, paleta de cores hexadecimais e fontes da plataforma.",
      updated_at: "2026-07-04T15:00:00Z"
    },
    {
      id: "lib-2",
      title: "Roteiro Padrão Reels",
      type: "document",
      description: "Modelo estrutural de 3 segundos de gancho + 10 segundos de valor + 2 segundos CTA.",
      updated_at: "2026-07-03T11:00:00Z"
    },
    {
      id: "lib-3",
      title: "Vídeo de Introdução da UpIdeias",
      type: "video",
      description: "Vídeo explicativo institucional para usar de fundo nos Reels.",
      updated_at: "2026-06-30T10:00:00Z"
    }
  ];

  const filteredItems = mockLibraryItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-upWhite flex items-center gap-2">
            <Library className="w-8 h-8 text-upPink" />
            Biblioteca de Conteúdo
          </h1>
          <p className="text-sm text-upGray mt-1">Armazene ideias salvadas, assets de design e mídias.</p>
        </div>

        <button className="px-4 py-2 bg-upCard hover:bg-upDark text-upWhite border border-upBorder rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0">
          <FolderPlus className="w-4 h-4" /> Upload de Arquivo
        </button>
      </div>

      {/* Controls */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-upGray" />
        <input
          type="text"
          placeholder="Buscar arquivos ou referências..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-upCard border border-upBorder rounded-xl text-sm text-upWhite placeholder-upGray outline-none focus:border-upPink/50 transition-all"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-upCard border border-upBorder hover:border-upBorder/85 rounded-2xl p-5 flex flex-col justify-between gap-6 transition-all">
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-upDark border border-upBorder flex items-center justify-center text-upPink">
                  {item.type === "image" && <ImageIcon className="w-5 h-5" />}
                  {item.type === "video" && <Video className="w-5 h-5" />}
                  {item.type === "document" && <FileText className="w-5 h-5" />}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-upWhite leading-snug">{item.title}</h3>
                  <p className="text-xs text-upGray mt-2 leading-relaxed">{item.description}</p>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-upBorder/30 pt-4 text-[10px] text-upGray">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(item.updated_at).toLocaleDateString("pt-BR")}
                </span>

                <button className="text-upGray hover:text-upPink transition-all" title="Excluir item">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-upCard border border-upBorder rounded-2xl p-12 text-center text-upGray">
            Nenhum item encontrado na biblioteca.
          </div>
        )}
      </div>
    </div>
  );
}
