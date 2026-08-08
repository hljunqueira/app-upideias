"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <>
      <section className="relative py-32 lg:py-44 bg-upDark overflow-hidden noise" data-testid="final-cta-section">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-upPink/[0.08] blur-[140px] rounded-full" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.img
            src="/UP-Logo-removebg-preview.png"
            alt="UP Ideias"
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-24 w-auto mx-auto mb-10 drop-shadow-[0_0_40px_rgba(255,83,104,0.5)]"
          />
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]"
          >
            Pronto para crescer
            <br />
            com <span className="text-upPink">estratégia</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg text-upGray max-w-xl mx-auto leading-relaxed"
          >
            Junte-se aos criadores, negócios e agências que trocaram a sorte por dados,
            IA e conhecimento.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10"
          >
            <Link
              href="/register"
              data-testid="final-cta-btn"
              className="group inline-flex items-center gap-2 bg-upPink hover:bg-upPinkDark text-white font-semibold text-lg px-10 py-5 rounded-full transition-all duration-300 hover:shadow-[0_0_50px_rgba(255,83,104,0.55)] hover:-translate-y-1"
            >
              Criar minha conta grátis
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="bg-upBlack border-t border-upBorder" data-testid="landing-footer">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-12">
          <div>
            <img src="/UP_Ideias_transparente.png" alt="UP Ideias" className="h-24 w-auto -ml-4" />
            <p className="text-sm text-upGray leading-relaxed max-w-xs mt-2">
              Estratégia, conteúdo e conhecimento para o seu crescimento digital.
            </p>
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-5">Plataforma</p>
            <ul className="space-y-3 text-sm text-upGray">
              <li><a href="#analytics" className="hover:text-upPink transition-colors">UP Analytics</a></li>
              <li><a href="#creator" className="hover:text-upPink transition-colors">UP Creator</a></li>
              <li><a href="#planos" className="hover:text-upPink transition-colors">Planos</a></li>
              <li><Link href="/login" className="hover:text-upPink transition-colors" data-testid="footer-login-link">Entrar</Link></li>
              <li><Link href="/register" className="hover:text-upPink transition-colors" data-testid="footer-register-link">Criar conta</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-5">Legal</p>
            <ul className="space-y-3 text-sm text-upGray">
              <li><Link href="/terms" className="hover:text-upPink transition-colors">Termos de uso</Link></li>
              <li><Link href="/privacy" className="hover:text-upPink transition-colors">Privacidade</Link></li>
              <li><Link href="/data-deletion" className="hover:text-upPink transition-colors">Exclusão de dados</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-upBorder/60 py-6">
          <p className="text-center text-xs text-upGray">
            © {new Date().getFullYear()} UP Ideias. Todos os direitos reservados. — <span className="text-upPink">by UpIdeias</span>
          </p>
        </div>
      </footer>
    </>
  );
}
