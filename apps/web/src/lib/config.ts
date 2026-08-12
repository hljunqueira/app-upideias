"use client";

import { getStoredLandingData } from "./landingStore";

export function getSupportEmail(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPPORT_EMAIL) {
    return process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  }
  const landing = getStoredLandingData();
  return landing.footerContactEmail || "contato@upideias.com";
}

export function getSupportPhone(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP) {
    return process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP;
  }
  return "5511999999999";
}

export function getSupportWhatsAppUrl(message: string = "Olá, gostaria de saber mais informações sobre a plataforma UP Ideias"): string {
  const phone = getSupportPhone().replace(/\D/g, "");
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMsg}`;
}
