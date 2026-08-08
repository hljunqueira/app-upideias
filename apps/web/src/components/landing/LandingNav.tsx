"use client";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export default function LandingNav() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#analytics", label: "Analytics" },
    { href: "#creator", label: "Creator" },
    { href: "#ciclo", label: "Como funciona" },
    { href: "#planos", label: "Planos" },
  ];

  return (
    <header
      data-testid="landing-nav"
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled ? "bg-upBlack/75 backdrop-blur-xl border-b border-upBorder/60" : "bg-transparent border-b border-transparent"
      }`}
    >
      <motion.div
        style={{ scaleX: progress }}
        className="absolute top-0 left-0 right-0 h-[2px] bg-upPink origin-left"
        data-testid="scroll-progress-bar"
      />
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-0 group" data-testid="nav-logo">
          <img src="/UP-Logo-removebg-preview.png" alt="UP Ideias" className="h-14 w-auto object-contain transition-transform duration-300 group-hover:-rotate-6" />
          <span className="font-script text-white text-3xl lowercase font-semibold tracking-normal drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] -ml-2.5">
            ideias
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-testid={`nav-link-${l.label.toLowerCase().replace(/\s/g, "-")}`}
              className="text-sm font-medium text-white hover:text-upPink transition-colors duration-300 relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-upPink after:transition-all after:duration-300 hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            data-testid="nav-login-btn"
            className="hidden sm:inline-block text-sm text-upLightGray hover:text-white px-4 py-2 transition-colors duration-300"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            data-testid="nav-register-btn"
            className="text-sm font-semibold bg-upPink hover:bg-upPinkDark text-white px-5 py-2.5 rounded-full transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,83,104,0.45)] hover:-translate-y-0.5"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}
