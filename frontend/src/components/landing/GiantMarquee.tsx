"use client";

const items = ["ESTRATÉGIA", "MÉTRICAS", "IA", "CONTEÚDO", "CURSOS", "CRESCIMENTO"];

export default function GiantMarquee() {
  return (
    <div className="relative bg-upBlack border-y border-upBorder/50 py-8 overflow-hidden" data-testid="giant-marquee">
      <div className="flex whitespace-nowrap animate-marquee-fast w-max">
        {[...Array(2)].map((_, k) => (
          <div key={k} className="flex items-center">
            {items.map((w, i) => (
              <span key={w + k} className="flex items-center">
                <span className={`font-display font-bold text-6xl lg:text-7xl tracking-tight mx-6 ${i % 2 === 0 ? "text-stroke" : "text-upPink"}`}>
                  {w}
                </span>
                <span className="text-upPink text-3xl mx-2">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
