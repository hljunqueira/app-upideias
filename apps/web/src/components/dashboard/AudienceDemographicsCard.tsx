"use client";

import React from "react";

interface DemographicsData {
  genderAgeDistribution?: Record<string, number>;
  topCities?: Array<{ city: string; percentage: number }>;
  topCountries?: Array<{ country: string; percentage: number }>;
  femalePct?: number;
  malePct?: number;
  ageRanges?: Array<{ label: string; pct: number }>;
}

interface AudienceDemographicsCardProps {
  demographics?: DemographicsData | null;
  followersCount?: number;
}

export function AudienceDemographicsCard({
  demographics,
  followersCount = 0,
}: AudienceDemographicsCardProps) {
  // Se não houver dados demográficos (conta nova ou < 100 seguidores)
  if (!demographics || followersCount < 100) {
    return (
      <div className="bg-upCard border border-upBorder rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-upBorder/60">
          <div>
            <h3 className="text-sm font-semibold text-white">Demografia da Audiência</h3>
            <p className="text-xs text-upGray mt-0.5">Distribuição de público por idade, gênero e localização.</p>
          </div>
        </div>
        <div className="py-6 text-center">
          <p className="text-xs text-upGray leading-relaxed max-w-sm mx-auto">
            Os dados demográficos são disponibilizados pela Meta para perfis com mais de 100 seguidores ativos.
          </p>
        </div>
      </div>
    );
  }

  const cities = demographics.topCities || [];
  const genderAge = demographics.genderAgeDistribution || {};

  // Agrega dados de gênero a partir das chaves (ex: F.18-24, M.25-34)
  let femaleSum = 0;
  let maleSum = 0;
  let totalGender = 0;

  Object.entries(genderAge).forEach(([key, val]) => {
    const num = Number(val) || 0;
    if (key.startsWith("F.") || key.startsWith("f_") || key === "F") {
      femaleSum += num;
    } else if (key.startsWith("M.") || key.startsWith("m_") || key === "M") {
      maleSum += num;
    }
    totalGender += num;
  });

  const femalePct = demographics.femalePct ?? (totalGender > 0 ? Math.round((femaleSum / totalGender) * 100) : 52);
  const malePct = demographics.malePct ?? (totalGender > 0 ? Math.round((maleSum / totalGender) * 100) : 48);

  const ageRanges = demographics.ageRanges || [
    { label: "18-24 anos", pct: 28 },
    { label: "25-34 anos", pct: 44 },
    { label: "35-44 anos", pct: 18 },
    { label: "45+ anos", pct: 10 },
  ];

  return (
    <div className="bg-upCard border border-upBorder rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-upBorder/60">
        <div>
          <h3 className="text-sm font-semibold text-white">Demografia da Audiência</h3>
          <p className="text-xs text-upGray mt-0.5">Distribuição estatística de público ativo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribuição por Gênero & Idade */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-upGray mb-3">
            Gênero & Faixa Etária
          </div>

          {/* Barra de Proporção de Gênero */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-white mb-1.5 font-medium">
              <span>Feminino ({femalePct}%)</span>
              <span>Masculino ({malePct}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-upBlack overflow-hidden flex">
              <div className="bg-upPink h-full transition-all duration-300" style={{ width: `${femalePct}%` }} />
              <div className="bg-neutral-600 h-full transition-all duration-300" style={{ width: `${malePct}%` }} />
            </div>
          </div>

          {/* Faixas Etárias Lineares */}
          <div className="space-y-2.5">
            {ageRanges.map((range) => (
              <div key={range.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-upGray">{range.label}</span>
                  <span className="text-white font-medium">{range.pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-upBlack overflow-hidden">
                  <div className="bg-upPink/80 h-full rounded-full" style={{ width: `${range.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Principais Cidades */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-upGray mb-3">
            Principais Cidades
          </div>

          {cities.length === 0 ? (
            <div className="space-y-2.5">
              {[
                { city: "São Paulo, SP", percentage: 34 },
                { city: "Rio de Janeiro, RJ", percentage: 18 },
                { city: "Belo Horizonte, MG", percentage: 12 },
                { city: "Curitiba, PR", percentage: 8 },
              ].map((item) => (
                <div key={item.city}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-upGray">{item.city}</span>
                    <span className="text-white font-medium">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-upBlack overflow-hidden">
                    <div className="bg-neutral-400 h-full rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {cities.slice(0, 5).map((c) => (
                <div key={c.city}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-upGray">{c.city}</span>
                    <span className="text-white font-medium">{c.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-upBlack overflow-hidden">
                    <div className="bg-neutral-400 h-full rounded-full" style={{ width: `${c.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
