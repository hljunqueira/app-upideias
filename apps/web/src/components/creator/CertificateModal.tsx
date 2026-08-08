"use client";

import { X, Award, CheckCircle2, Download, Share2, ShieldCheck } from "lucide-react";
import { Course } from "@/lib/coursesStore";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  studentName?: string;
}

export function CertificateModal({
  isOpen,
  onClose,
  course,
  studentName = "Henrique Junqueira"
}: CertificateModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b0b0f] border border-upBorder/60 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden relative">
        {/* Top Header Controls */}
        <div className="px-6 py-4 border-b border-upBorder/40 flex items-center justify-between bg-upDark/60">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Certificado Digital de Conclusão</h3>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(course.title)}&organizationName=${encodeURIComponent("UP Creator Academy")}&issueYear=${new Date().getFullYear()}&issueMonth=${new Date().getMonth() + 1}&certId=${encodeURIComponent(`UP-${course.id.toUpperCase()}-2026`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0077b5] hover:bg-[#006396] text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Adicionar ao LinkedIn</span>
            </a>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-upPink hover:bg-upPink/90 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-upGray hover:text-white bg-white/5 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CERTIFICADO IMPRESSO DE ALTA QUALIDADE */}
        <div className="p-8 sm:p-12 text-center relative overflow-hidden bg-gradient-to-b from-[#12121c] via-[#0d0d14] to-[#08080c] border-8 border-[#1a1a26] m-4 sm:m-6 rounded-2xl print:m-0 print:border-none print:bg-white print:text-black">
          {/* Fundo D'água da Marca UP */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <img src="/UP-Logo-removebg-preview.png" alt="UP" className="w-96 h-auto" />
          </div>

          {/* Selo de Garantia Superior */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-extrabold tracking-widest uppercase shadow-lg">
              <ShieldCheck className="w-4 h-4" />
              <span>Certificado de Excelência UP Creator</span>
            </div>
          </div>

          {/* Texto Principal */}
          <p className="text-xs text-upGray uppercase tracking-widest font-semibold mb-2">
            Certificamos que
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight mb-3 drop-shadow-md">
            {studentName}
          </h1>
          <p className="text-xs sm:text-sm text-upGray max-w-lg mx-auto leading-relaxed mb-6">
            concluiu com êxito 100% da carga horária do curso de nível profissional:
          </p>

          {/* Nome do Curso */}
          <div className="p-4 bg-upDark/80 border border-upPink/30 rounded-2xl max-w-md mx-auto mb-8 shadow-[0_0_30px_rgba(255,83,104,0.15)]">
            <h2 className="text-lg sm:text-xl font-extrabold text-upPink font-display">
              {course.title}
            </h2>
            <p className="text-[11px] text-upGray mt-1 font-medium">
              Trilha: <strong className="text-white">{course.track}</strong> • Carga Horária:{" "}
              <strong className="text-white">{course.lessonsCount * 12} min</strong>
            </p>
          </div>

          {/* Assinatura e Código de Verificação */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-upBorder/40 max-w-lg mx-auto text-left">
            <div>
              <p className="text-[10px] text-upGray uppercase tracking-wider font-semibold">Emissão</p>
              <p className="text-xs font-bold text-white">{new Date().toLocaleDateString("pt-BR")}</p>
              <p className="text-[9px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verificado Autêntico
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-upGray uppercase tracking-wider font-semibold">Código de Autenticidade</p>
              <p className="text-xs font-mono font-bold text-upPink">UP-{course.id.toUpperCase()}-2026</p>
              <p className="text-[9px] text-upGray mt-0.5">Plataforma UP Ideias</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
