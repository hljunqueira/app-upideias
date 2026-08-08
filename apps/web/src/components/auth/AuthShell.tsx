"use client";
import Link from "next/link";
import BgVideo from "@/components/landing/BgVideo";

export default function AuthShell({ children, headline, script }: { children: React.ReactNode; headline: string; script: string }) {
  return (
    <div className="bg-upBlack min-h-screen flex">
      {/* Brand panel */}
      <div className="hidden lg:flex relative w-[44%] overflow-hidden flex-col justify-between p-12">
        <BgVideo
          className="absolute inset-0 w-full h-full object-cover [filter:grayscale(1)_brightness(0.8)]"
          src="https://assets.mixkit.co/videos/18140/18140-720.mp4"
        />
        <div className="video-tint" />
        <div className="absolute inset-0 bg-gradient-to-br from-upBlack/70 via-upBlack/40 to-upBlack/80" />

        <Link href="/" className="relative flex items-center gap-0.5 group w-max" data-testid="auth-logo-home">
          <img src="/UP-Logo-removebg-preview.png" alt="UP" className="h-9 w-auto object-contain transition-transform duration-300 group-hover:-rotate-6" />
          <span className="font-script text-2xl text-white font-normal -ml-2.5 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
            ideias
          </span>
        </Link>

        <div className="relative">
          <p className="font-script text-upPink text-4xl mb-4 rotate-[-2deg] origin-left drop-shadow-[0_0_20px_rgba(255,83,104,0.4)]">
            {script}
          </p>
          <h1 className="font-display font-bold tracking-tight text-white text-5xl xl:text-6xl leading-[1.0] whitespace-pre-line">
            {headline}
          </h1>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {[["Métricas", "em tempo real"], ["6+ trilhas", "no UP Creator"], ["Garantia", "de 7 dias"]].map(([v, l]) => (
              <div key={l} className="flex items-baseline gap-2">
                <span className="font-display text-lg font-bold text-upPink">{v}</span>
                <span className="text-[11px] text-upLightGray/70 uppercase tracking-wider">{l}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-upLightGray/50">
          © {new Date().getFullYear()} UP Ideias — <span className="font-script text-upPink text-sm">by UpIdeias</span>
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-upPink/[0.06] rounded-full blur-[110px] pointer-events-none" />
        <div className="w-full max-w-md relative z-10">{children}</div>
      </div>
    </div>
  );
}
