import React, { useEffect, useState } from "react";
import { Trees, Flame, Droplets, Trash2, Cpu, Globe, Award } from "lucide-react";
import { GlobalMetrics } from "../types";

interface MetricCounterProps {
  metrics: GlobalMetrics | null;
  personalCarbon: number;
  personalWater: number;
  personalPlastic: number;
  userLevel: number;
  userPoints: number;
}

export default function MetricCounter({
  metrics,
  personalCarbon,
  personalWater,
  personalPlastic,
  userLevel,
  userPoints,
}: MetricCounterProps) {
  // Local counting states to simulate counting up live or slight micro fluctuations for engagement
  const [livePlasticCount, setLivePlasticCount] = useState<number>(0);

  useEffect(() => {
    if (metrics) {
      setLivePlasticCount(metrics.plasticAvoidedSinceEpoch);
    }
  }, [metrics]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLivePlasticCount((prev) => {
        if (prev === 0) return 0;
        // Global plastic avoided increases dynamically every second
        return prev + Math.floor(Math.random() * 3) + 1;
      });
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* 1. Global Carbon Panel */}
      <div id="metric-global" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-white relative overflow-hidden transition duration-300 hover:border-emerald-500/40">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-400">
          <Globe size={120} />
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-zinc-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Dados Atmosféricos Globais
          </span>
          <Globe className="text-emerald-400 h-5 w-5" />
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-3xl font-bold tracking-tight text-white flex items-baseline gap-2">
              {metrics?.co2 || "425.21 ppm"}
              <span className="text-xs font-normal text-emerald-400 font-mono">LIVE</span>
            </div>
            <p className="text-zinc-400 text-sm mt-1">{metrics?.co2Description || "Concentração média de CO₂ atmosférico."}</p>
          </div>
          <div className="pt-2 border-t border-zinc-800 flex justify-between text-xs font-mono text-zinc-500">
            <span>Anomalia Térmica: {metrics?.temp || "+1.26°C"}</span>
            <span>Matriz Renovável: {metrics?.renewable || "30.42%"}</span>
          </div>
        </div>
      </div>

      {/* 2. Plastic Ocean Ticker */}
      <div id="metric-ocean" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-white relative overflow-hidden transition duration-300 hover:border-sky-500/40">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-sky-400">
          <Trash2 size={120} />
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-zinc-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse"></span>
            Combate ao Plástico Descartável
          </span>
          <Trash2 className="text-sky-400 h-5 w-5" />
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-white">
              {livePlasticCount === 0 
                ? "12,405,923" 
                : livePlasticCount.toLocaleString("pt-BR")
              }
              <span className="text-sm font-normal text-sky-400 ml-1 font-sans"> kg</span>
            </div>
            <p className="text-zinc-400 text-sm mt-1">Estimativa de lixo plástico evitado nos oceanos mundialmente hoje.</p>
          </div>
          <div className="pt-2 border-t border-zinc-800 text-xs font-mono text-zinc-500">
            Mais de 8 milhões de toneladas entram nos oceanos anualmente.
          </div>
        </div>
      </div>

      {/* 3. Personal Eco-Impact */}
      <div id="metric-personal" className="bg-zinc-900 border border-emerald-950 rounded-2xl p-6 text-white relative overflow-hidden transition duration-300 hover:border-emerald-500/50 shadow-lg shadow-emerald-950/10">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-400">
          <Award size={120} />
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-emerald-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            Seu Impacto Coletado
          </span>
          <Cpu className="text-emerald-400 h-5 w-5" />
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="text-center bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800">
            <div className="flex justify-center text-emerald-400 mb-1">
              <Flame size={16} />
            </div>
            <div className="text-base font-bold font-mono text-white">{personalCarbon.toFixed(1)}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-tight font-sans">CO₂ evitado (kg)</div>
          </div>
          <div className="text-center bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800">
            <div className="flex justify-center text-blue-400 mb-1">
              <Droplets size={16} />
            </div>
            <div className="text-base font-bold font-mono text-white">{personalWater.toFixed(0)}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-tight font-sans">Água economizada (L)</div>
          </div>
          <div className="text-center bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800">
            <div className="flex justify-center text-teal-400 mb-1">
              <Trees size={16} />
            </div>
            <div className="text-base font-bold font-mono text-white">{(personalPlastic / 1000).toFixed(2)}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-tight font-sans">Plástico poupado (kg)</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-zinc-400 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
          <span className="font-mono text-emerald-400 font-semibold uppercase tracking-wider">Level {userLevel}</span>
          <span className="font-mono font-medium text-emerald-200">{userPoints} EcoPontos</span>
        </div>
      </div>
    </div>
  );
}
