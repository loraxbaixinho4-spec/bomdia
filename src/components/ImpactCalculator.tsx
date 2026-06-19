import React, { useState } from "react";
import { Sparkles, Trash2, Droplets, Leaf, Award, ArrowUpRight, CheckCircle2 } from "lucide-react";

interface ImpactCalculatorProps {
  onAddImpact: (carbon: number, water: number, plastic: number, points: number) => void;
}

export default function ImpactCalculator({ onAddImpact }: ImpactCalculatorProps) {
  // Local active values
  const [plasticBottles, setPlasticBottles] = useState<number>(2);
  const [aluminumCans, setAluminumCans] = useState<number>(3);
  const [organicCompost, setOrganicCompost] = useState<number>(1); // in kg
  const [shortShowers, setShortShowers] = useState<number>(1); // count of 5-min showers

  // Calculations constants based on EPA & environmental index reports
  // 1 plastic bottle recycled ~= 80g plastic saved, 0.12kg CO2 avoided
  // 1 aluminum can recycled ~= 15g plastic-eq avoided, 350L water saved (primary aluminum production is water-intensive) and 0.2kg CO2 index
  // 1kg organic composted ~= 0.35kg methane CO2-equiv saved
  // 1 short shower (avoiding extra 5 min) ~= 60 Liters of clean water, 0.1kg CO2 heating reduction

  const carbonReduction = (plasticBottles * 0.12) + (aluminumCans * 0.2) + (organicCompost * 0.35) + (shortShowers * 0.1);
  const waterReduction = (aluminumCans * 350) + (shortShowers * 60);
  const plasticAvoided = (plasticBottles * 80) + (aluminumCans * 15);

  const calculatedPoints = Math.round((plasticBottles * 5) + (aluminumCans * 5) + (organicCompost * 15) + (shortShowers * 10));

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRegisterLog = () => {
    // Dispatch up to parent
    onAddImpact(carbonReduction, waterReduction, plasticAvoided, calculatedPoints);
    
    setToastMessage(`Sucesso! +${calculatedPoints} EcoPontos e +${Math.round(calculatedPoints / 2)} XP adicionados ao seu perfil! 🌟`);
    
    // Reset inputs
    setPlasticBottles(0);
    setAluminumCans(0);
    setOrganicCompost(0);
    setShortShowers(0);

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <div id="impact-calculator-card" className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Sparkles className="text-emerald-400 h-4 md:h-5 w-4 md:w-5" /> Calculadora de Impacto Diário
          </h3>
          <span className="bg-emerald-950/70 border border-emerald-800 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded-full">
            Simulador Real-Time
          </span>
        </div>
        <p className="text-xs text-zinc-400 mb-6">Quantifique seus hábitos sustentáveis de hoje e converta em recompensas digitais gamificadas.</p>

        {/* Inputs stack */}
        <div className="space-y-4">
          {/* Plastic bottles */}
          <div>
            <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>🥤 Garrafas PET Recicladas</span>
              <span className="text-emerald-400 font-bold">{plasticBottles} un</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={plasticBottles}
              onChange={(e) => setPlasticBottles(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Aluminum Cans */}
          <div>
            <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>🥫 Alumínio / Metal Reciclado</span>
              <span className="text-emerald-400 font-bold">{aluminumCans} un</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={aluminumCans}
              onChange={(e) => setAluminumCans(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Showers reduction */}
          <div>
            <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>🚿 Banhos Ecológicos (Sustentáveis)</span>
              <span className="text-emerald-400 font-bold">{shortShowers} banhos</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              value={shortShowers}
              onChange={(e) => setShortShowers(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Composting */}
          <div>
            <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>🍂 Sobras Compostadas (Compostagem)</span>
              <span className="text-emerald-400 font-bold">{organicCompost} kg</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={organicCompost}
              onChange={(e) => setOrganicCompost(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Calculations summaries */}
      <div className="mt-6 pt-4 border-t border-zinc-900">
        <div className="grid grid-cols-3 gap-2 mb-4 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60 text-center">
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-wider">CO₂ Reduzido</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">-{carbonReduction.toFixed(2)} kg</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-wider">Água Salpa</span>
            <span className="text-xs font-bold text-sky-400 font-mono">+{waterReduction} L</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-wider">Plástico Evitado</span>
            <span className="text-xs font-bold text-teal-400 font-mono">+{plasticAvoided} g</span>
          </div>
        </div>

        {/* Confirmation Toast */}
        {toastMessage && (
          <div className="mb-3 p-3 bg-emerald-950/90 border border-emerald-500/30 text-emerald-200 text-xs rounded-xl flex items-start gap-2.5 animate-pulse">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>{toastMessage}</span>
          </div>
        )}

        <button
          onClick={handleRegisterLog}
          disabled={calculatedPoints === 0}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-900 disabled:text-zinc-650 disabled:border-zinc-850 disabled:cursor-not-allowed border border-transparent text-zinc-950 font-bold py-3 px-4 rounded-xl text-center text-xs uppercase tracking-widest cursor-pointer shadow-md transition flex items-center justify-center gap-2"
        >
          <span>Registrar Atividades (+{calculatedPoints} pts)</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}
