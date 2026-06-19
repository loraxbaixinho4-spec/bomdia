import React from "react";
import { CheckSquare, Square, Award, Flame, Droplets, Trash2, Cpu, Zap, Star, Sparkles, RefreshCw } from "lucide-react";
import { EnvironmentalGoal } from "../types";

interface GamifiedGoalsProps {
  goals: EnvironmentalGoal[];
  onToggleGoal: (id: string) => void;
  goalRound: number;
  goalsCompletedToday: number;
  onAdvanceRound: () => void;
  allGoalsCompletedModalShown: boolean;
}

export default function GamifiedGoals({ 
  goals, 
  onToggleGoal,
  goalRound,
  goalsCompletedToday,
  onAdvanceRound,
  allGoalsCompletedModalShown
}: GamifiedGoalsProps) {
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "reciclagem":
        return <Trash2 className="text-emerald-600 h-4 w-4" />;
      case "agua":
        return <Droplets className="text-blue-500 h-4 w-4" />;
      case "energia":
        return <Flame className="text-amber-500 h-4 w-4" />;
      case "tecnologia":
        return <Cpu className="text-purple-500 h-4 w-4" />;
      default:
        return <Award className="text-[#5A5A40] h-4 w-4" />;
    }
  };

  const completedCount = goals.filter((g) => g.completed).length;
  const currentProgressPct = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;
  const isAllDone = completedCount === goals.length && goals.length > 0;

  // Calculate the current active combo multiplier reward (e.g. +6 XP addition per consecutive goal)
  const currentComboBonus = goalsCompletedToday * 6;

  return (
    <div className="bg-white border border-[#EBE9E0] rounded-[24px] p-5 flex flex-col justify-between h-full relative overflow-hidden">
      
      {/* Decorative subtle header background pattern */}
      <div className="absolute right-0 top-0 h-24 w-24 bg-[#F2F4E8]/40 rounded-bl-full pointer-events-none"></div>

      <div>
        <div className="flex items-center justify-between mb-2.5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="h-8.5 w-8.5 rounded-full bg-[#F2F4E8] flex items-center justify-center text-[#5A5A40]">
              <Award size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-[#3D3D33] text-sm tracking-tight leading-none">
                Missões Diárias
              </h3>
              <span className="text-[10px] font-mono font-bold text-[#8B9D83] uppercase tracking-widest mt-0.5 block">
                Rodada {goalRound} de Desafios
              </span>
            </div>
          </div>
          
          <span className="bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/15 font-mono font-bold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">
            Ativo
          </span>
        </div>
        
        <p className="text-xs text-zinc-500 mb-5 pl-0.5 leading-relaxed">
          Pratique ações reais de descarte e economia e marque-as abaixo para ganhar EcoPontos crescentes.
        </p>

        {/* Dynamic Combo Multiplier Dashboard */}
        <div className="bg-[#FAFAF8] p-3 rounded-2xl border border-[#EBE9E0] mb-5 space-y-2 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-500 flex items-center gap-1">
              <Zap size={11} className="text-amber-500 fill-amber-500" /> Combo Acumulado de Hoje
            </span>
            <span className="text-xs font-mono font-extrabold text-[#5A5A40]">
              {goalsCompletedToday}x Concluídos
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-zinc-200/50">
            <span className="text-[10px] text-zinc-650 leading-tight">Pontos extras por meta consecutiva ativa:</span>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
              +{currentComboBonus} XP Combo
            </span>
          </div>
        </div>

        {/* Progress meter */}
        <div className="bg-[#FAFAF8] p-3.5 rounded-2xl border border-[#EBE9E0] mb-5">
          <div className="flex justify-between text-xs font-mono text-zinc-600 mb-2">
            <span>Progresso da Rodada</span>
            <span className="font-extrabold text-[#5A5A40]">{completedCount} de {goals.length} resolvidas</span>
          </div>
          <div className="w-full bg-zinc-250/60 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${currentProgressPct}%` }}
            />
          </div>
        </div>

        {/* Goals list */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {goals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => onToggleGoal(goal.id)}
              className={`p-3.5 rounded-2xl border transition duration-200 flex items-start gap-3 cursor-pointer select-none ${
                goal.completed
                  ? "bg-emerald-50/40 border-emerald-200/70 opacity-90 hover:opacity-100"
                  : "bg-[#FAFAF8] border-[#EBE9E0] hover:border-zinc-400"
              }`}
            >
              <button className="shrink-0 mt-0.5" type="button">
                {goal.completed ? (
                  <CheckSquare className="text-emerald-600 h-5 w-5" />
                ) : (
                  <Square className="text-zinc-450 hover:text-zinc-650 h-5 w-5" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded ${
                    goal.completed ? "bg-emerald-100 text-emerald-700" : "bg-[#F2F4E8] text-[#5A5A40]"
                  }`}>
                    {goal.type === "daily" ? "Diária" : "Inovação"}
                  </span>
                  <span className="p-0.5 bg-white rounded border border-[#EBE9E0]">
                    {getCategoryIcon(goal.category)}
                  </span>
                </div>
                <h4 className={`text-xs font-bold mt-1 text-zinc-850 leading-tight transition ${
                  goal.completed ? "line-through text-zinc-400 font-medium" : ""
                }`}>
                  {goal.title}
                </h4>
                <p className="text-[11px] text-zinc-500 mt-1 pl-0.5 leading-tight">{goal.description}</p>
                
                {/* Reward XP tag */}
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="text-[9px] bg-white text-zinc-600 font-mono font-semibold px-2 py-0.5 rounded-full border border-zinc-200">
                    +{goal.xpReward} XP Base
                  </span>
                  {goal.completed && (
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 font-mono font-bold px-1.5 py-0.5 rounded-full">
                      ✓ Completo
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded Concluded Round Card with Call-to-action for NEXT ROUND */}
      {allGoalsCompletedModalShown && (
        <div className="mt-5 p-4 bg-gradient-to-br from-[#E9EED9] to-white border border-[#A7C080]/30 rounded-2xl shadow-md space-y-3.5 relative overflow-hidden animate-fade-in">
          <div className="absolute right-[-10px] bottom-[-10px] text-[#A7C080]/15 transform -rotate-12">
            <Star size={70} fill="currentColor" />
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <Sparkles size={14} className="animate-spin-slow" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-[#3D3D33] uppercase font-mono tracking-wide">Lote Completo!</h4>
              <p className="text-[10px] text-[#5A5A40]">Você cumpriu todas as metas da rodada {goalRound}.</p>
            </div>
          </div>
          
          <p className="text-xs text-[#5A5A40] leading-snug relative z-10 pl-0.5">
            Brilhante! Desbloqueie o próximo lote de metas diárias alternativas avançadas agora mesmo para continuar expandindo seu progresso.
          </p>

          <button
            onClick={onAdvanceRound}
            className="w-full bg-[#5A5A40] hover:bg-[#484833] text-white font-bold text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 relative z-10 cursor-pointer shadow-sm text-center"
          >
            <RefreshCw size={12} className="animate-pulse" />
            <span>Resgatar Recompensa & Novas Metas (+150 XP)</span>
          </button>
        </div>
      )}

    </div>
  );
}
