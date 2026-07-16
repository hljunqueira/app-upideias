import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UP Analytics by UpIdeias - Transforme métricas em estratégia",
  description: "Plataforma SaaS para empresas, criadores e agências acompanharem métricas do Instagram, receberem diagnósticos com IA e gerenciarem automações.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} text-upLightGray antialiased bg-upBlack min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
