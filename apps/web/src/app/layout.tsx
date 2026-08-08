import type { Metadata } from "next";
import { Inter, Unbounded, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const unbounded = Unbounded({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700", "800", "900"], display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-script", weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "UP Ideias — Estratégia, conteúdo e conhecimento em um só lugar",
  description:
    "O ecossistema UP Ideias: métricas do Instagram com IA (UP Analytics) e plataforma de cursos estilo streaming (UP Creator). Transforme métricas em estratégia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} ${unbounded.variable} ${caveat.variable} font-body text-upLightGray antialiased bg-upBlack min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
