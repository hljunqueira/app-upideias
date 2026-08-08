import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" });

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
      <body className={`${inter.variable} ${outfit.variable} font-body text-upLightGray antialiased bg-upBlack min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
