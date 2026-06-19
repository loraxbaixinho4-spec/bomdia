import React, { useState } from "react";
import { Sparkles, RefreshCw, Award, Share2, Heart, Check, BookOpen, Lightbulb, Zap, CheckCircle } from "lucide-react";
import { Region } from "../types";

interface SustentaBotTipsProps {
  region: Region;
  onActionReward: (xp: number) => void;
}

interface EcoTip {
  title: string;
  category: "Reciclagem" | "Tecnologia Verde" | "Consumo Consciente" | "Energia";
  text: string;
  impactSaved: string;
  xpValue: number;
}

const ECO_TIPS_DATABASE: Record<Region, EcoTip[]> = {
  "Sudeste": [
    {
      title: "Descarte de Eletroeletrônicos",
      category: "Tecnologia Verde",
      text: "As capitais do Sudeste possuem alta densidade de coletores de lixo eletrônico. Redes como supermercados e estações de metrô possuem caixas verdes para baterias, carregadores antigos e celulares. Nunca descarte-os no lixo comum pois liberam cádmio e chumbo.",
      impactSaved: "-3.2kg CO2 e recuperação de metais nobres",
      xpValue: 15
    },
    {
      title: "Logística Reversa de Vidros de Conserva",
      category: "Reciclagem",
      text: "O vidro é 100% reciclável infinitas vezes. No Sudeste, cooperativas parceiras usam moedores industriais rápidos. Lave os potes e retire as tampas de metal (elas vão para a reciclagem de ferro).",
      impactSaved: "Até 30% de redução na energia de fabricação",
      xpValue: 10
    },
    {
      title: "Utilização de Biogás de Aterros",
      category: "Tecnologia Verde",
      text: "Grandes termelétricas metropolitanas no Sudeste já usam o metano capturado de aterros para produzir eletricidade limpa. Evite o desperdício orgânico promovendo a compostagem!",
      impactSaved: "Redução direta do potente gás metano atmosférico",
      xpValue: 20
    }
  ],
  "Sul": [
    {
      title: "Compostagem Doméstica Comunitária",
      category: "Consumo Consciente",
      text: "A Região Sul é referência em hortas comunitárias. Resíduos de cascas, café e talos de vegetais podem ser misturados a folhas secas ou serragem na proporção 1:2. O adubo rico substitui fertilizantes químicos.",
      impactSaved: "Evita emissão de metano e enriquece solos urbanos",
      xpValue: 15
    },
    {
      title: "Descarte Correto de Óleo de Cozinha",
      category: "Reciclagem",
      text: "Um único litro de óleo de cozinha usado pode contaminar até 25 mil litros de água potável nos rios da bacia gaúcha e catarinense. Armazene o óleo frio em garrafas PET e entregue aos pontos de coleta para fabricação de biodiesel.",
      impactSaved: "Evita poluição de lençóis freáticos locais",
      xpValue: 20
    }
  ],
  "Nordeste": [
    {
      title: "Aproveitamento Solar no Semiárido",
      category: "Energia",
      text: "O Nordeste lidera a geração eólica e solar do país. Você pode economizar energia em casa programando aparelhos eletrônicos para funcionar em horários de pico solar e mantendo as cortinas abertas para iluminação natural.",
      impactSaved: "Reduz a dependência das termelétricas térmicas caras",
      xpValue: 15
    },
    {
      title: "Combate ao Plástico nas Praias Costeiras",
      category: "Reciclagem",
      text: "O plástico descartado perturba a vida marinha das praias. Sempre que for à praia, leve uma sacola biodegradável para recolher tampinhas, canudos e PET de marcas de consumo que encontrar.",
      impactSaved: "Preservação da vida coralina e aves marinhas",
      xpValue: 25
    }
  ],
  "Norte": [
    {
      title: "Casca de Açaí como Embalagem Verde",
      category: "Tecnologia Verde",
      text: "Inovações regionais do Norte usam as fibras residuais das toneladas de caroço de açaí cozido para fabricar bioplásticos e eco-vasos degradáveis. Sempre apoie mercadorias de startups socioambientais locais.",
      impactSaved: "Estímulo à bioeconomia local renovável",
      xpValue: 20
    },
    {
      title: "Redução do Consumo de Plásticos nos Rios",
      category: "Consumo Consciente",
      text: "Nos rios amazônicos, microplásticos acumulam-se facilmente na fauna de peixes que alimentam populações tradicionais. Substitua sacolas plásticas por sacos de pano reutilizáveis em suas compras semanais.",
      impactSaved: "Redução da bioacumulação tóxica em peixes nativos",
      xpValue: 15
    }
  ],
  "Centro-Oeste": [
    {
      title: "Água de Chuva em Regiões de Seca",
      category: "Consumo Consciente",
      text: "No cerrado, a estação de seca exige economia de água estrutural. Instale barris coletores simples na calha do telhado para armazenar águas pluviais rápidas. Use-a para regar plantas de manhã ou lavar o pito.",
      impactSaved: "Preserve os reservatórios de água e aqüíferos vitais",
      xpValue: 20
    },
    {
      title: "Reciclagem de Defensivos e Embalagens",
      category: "Reciclagem",
      text: "O Centro-Oeste possui o maior volume de logística reversa de embalagens rígidas agrícolas do mundo. Garanta que recipientes industriais de insumos passem pela tríplice lavagem antes de devolver aos centros de distribuição.",
      impactSaved: "Evita contaminação do solo por lixiviação química",
      xpValue: 25
    }
  ]
};

const TRIVIA_QUESTIONS = [
  {
    q: "Qual material pode ser reciclado infinitas vezes sem perder qualidade?",
    options: ["Papel de jornal", "Vidro de conserva", "Plástico PET de garrafa", "Caixa de papelão"],
    correct: 1, // Vidro
    explain: "O vidro conserva todas as propriedades físicas originais independente de quantas vezes é moído e derretido de novo!"
  },
  {
    q: "Qual gás perigoso é reduzido na atmosfera quando fazemos compostagem orgânica correta?",
    options: ["Monóxido de carbono", "Gás Argônio", "Gás Metano (CH4)", "Hélio atmosférico"],
    correct: 2, // Metano
    explain: "O lixo orgânico em aterros sem oxigênio apodrece gerando metano (que retém 25x mais calor que o CO2). A compostagem com oxigênio evita isso!"
  },
  {
    q: "Lavar as embalagens de iogurte e latas de alumínio antes de reciclar ajuda em quê?",
    options: ["Aumenta o peso do metal", "Muda a cor do plástico", "Evita mau cheiro e proliferação de vetores nas cooperativas de catadores", "Faz o plástico derreter mais rápido"],
    correct: 2, 
    explain: "Retirar restos de comida evita atração de moscas e ratos nos galpões de separação, melhorando a saúde e agilidade dos profissionais de triagem!"
  }
];

export default function SustentaBotTips({ region, onActionReward }: SustentaBotTipsProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const [likes, setLikes] = useState<number>(14);
  const [hasLiked, setHasLiked] = useState(false);
  const [shared, setShared] = useState(false);
  const [claimed, setClaimed] = useState(false);

  // Trivia states
  const [currentTrivia, setCurrentTrivia] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [triviaStatus, setTriviaStatus] = useState<"unanswered" | "correct" | "incorrect">("unanswered");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const regionTips = ECO_TIPS_DATABASE[region] || ECO_TIPS_DATABASE["Sudeste"];
  const currentTip = regionTips[tipIndex % regionTips.length];

  const handleNextTip = () => {
    setTipIndex((prev) => prev + 1);
    setHasLiked(false);
    setLikes(Math.floor(Math.random() * 20) + 12);
    setShared(false);
    setClaimed(false);
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikes((p) => p - 1);
      setHasLiked(false);
    } else {
      setLikes((p) => p + 1);
      setHasLiked(true);
      // Encourage dynamic support
      onActionReward(2);
    }
  };

  const handleShare = () => {
    const text = `Dica de Sustentabilidade do SustentaBot para a Região ${region}: "${currentTip.title} - ${currentTip.text.substring(0, 100)}..." 🌱♻️`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank");
    setShared(true);
    onActionReward(4); // Reward sharing
    triggerToast("Parabéns por disseminar inovações ecológicas! +4 EcoPontos obtidos.");
  };

  const handleClaimReward = () => {
    if (claimed) return;
    setClaimed(true);
    onActionReward(currentTip.xpValue);
    triggerToast(`Você estudou o conselho e ganhou +${currentTip.xpValue} XP ecológico! 🌟`);
  };

  const handleAnswerTrivia = (optIdx: number) => {
    if (selectedOption !== null) return; // already answered
    setSelectedOption(optIdx);
    const questionsSet = TRIVIA_QUESTIONS[currentTrivia];
    if (optIdx === questionsSet.correct) {
      setTriviaStatus("correct");
      onActionReward(25); // high reward for correct learning
      triggerToast("Excelente! Resposta correta: +25 XP e +10 EcoPontos conquistados!");
    } else {
      setTriviaStatus("incorrect");
    }
  };

  const handleNextTrivia = () => {
    setCurrentTrivia((prev) => (prev + 1) % TRIVIA_QUESTIONS.length);
    setSelectedOption(null);
    setTriviaStatus("unanswered");
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="bg-[#FAFAF8] rounded-[24px] border border-[#EBE9E0] p-6 space-y-6">
      
      {/* Mini Floating Toast */}
      {toastMessage && (
        <div className="bg-[#5A5A40] text-white text-xs px-4 py-2.5 rounded-xl border border-[#A7C080]/30 shadow-md animate-fade-in flex items-center gap-1.5 leading-snug">
          <CheckCircle size={14} className="text-[#A7C080]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#E9EED9] flex items-center justify-center text-[#5A5A40]">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#3D3D33] tracking-tight">SustentaBot Conselhos</h3>
            <p className="text-[10px] uppercase tracking-wider font-mono text-[#8B9D83]">IA de recomendação de descarte e reciclagem</p>
          </div>
        </div>
        <span className="bg-[#5A5A40] text-white text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-full">
          {region}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Card: Dynamic Dica of the Day */}
        <div className="bg-white border border-[#EBE9E0] rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-[#5A5A40] bg-[#F2F4E8] px-2 py-0.5 rounded-md">
                {currentTip.category}
              </span>
              <span className="text-xs font-mono text-[#8B9D83]">Dica {tipIndex % regionTips.length + 1} de {regionTips.length}</span>
            </div>

            <h4 className="font-bold text-sm text-[#3D3D33] mt-3">{currentTip.title}</h4>
            <p className="text-xs text-zinc-600 mt-2 leading-relaxed">{currentTip.text}</p>

            <div className="mt-4 p-3 bg-[#F9F8F3] rounded-xl border border-[#F2F1EA]">
              <span className="text-[9px] uppercase font-mono text-[#8B9D83] block">Estimativa de impacto restaurador:</span>
              <span className="text-xs font-bold text-[#5A5A40] font-mono mt-0.5 block">{currentTip.impactSaved}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#FAFAF8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={handleLike} 
                className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border transition ${
                  hasLiked 
                    ? "bg-rose-50 border-rose-200 text-rose-500 font-bold" 
                    : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-650"
                }`}
              >
                <Heart size={13} fill={hasLiked ? "currentColor" : "none"} />
                <span>{likes}</span>
              </button>
              
              <button 
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-650 transition"
              >
                <Share2 size={13} />
                <span>{shared ? "Compartilhado!" : "Tweet"}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClaimReward}
                disabled={claimed}
                className={`font-mono text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition ${
                  claimed 
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                    : "bg-[#5A5A40] text-white hover:bg-[#484833]"
                }`}
              >
                {claimed ? "✔ Reivindicado" : `Ler (+${currentTip.xpValue} XP)`}
              </button>
              
              <button
                onClick={handleNextTip}
                className="p-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition"
                title="Próxima dica regional"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Card: Gamified Trivia Quiz of Sustentabilidade */}
        <div className="bg-white border border-[#EBE9E0] rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <Zap size={11} /> Desafio Rápido de Fixação
              </span>
              <span className="text-xs font-mono text-[#8B9D83]">Quiz {currentTrivia + 1}/3</span>
            </div>

            <h4 className="font-bold text-sm text-[#3D3D33] mt-3 leading-snug">
              {TRIVIA_QUESTIONS[currentTrivia].q}
            </h4>

            {/* Options list */}
            <div className="space-y-2 mt-4">
              {TRIVIA_QUESTIONS[currentTrivia].options.map((opt, idx) => {
                let btnStyle = "bg-zinc-50 hover:bg-zinc-100/80 text-zinc-700 border-zinc-200";
                
                if (selectedOption !== null) {
                  if (idx === TRIVIA_QUESTIONS[currentTrivia].correct) {
                    btnStyle = "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold";
                  } else if (idx === selectedOption) {
                    btnStyle = "bg-rose-50 text-rose-700 border-rose-300";
                  } else {
                    btnStyle = "bg-zinc-50 text-zinc-400 border-zinc-200 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerTrivia(idx)}
                    disabled={selectedOption !== null}
                    className={`w-full text-left p-2.5 text-xs rounded-xl border transition duration-200 flex items-start gap-2.5 ${btnStyle}`}
                  >
                    <span className="font-bold font-mono h-5 w-5 bg-white rounded-full flex items-center justify-center shadow-inner shrink-0 text-zinc-500">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-tight">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation if answered */}
          {selectedOption !== null && (
            <div className={`p-3 rounded-xl border text-xs mt-1 ${
              triviaStatus === "correct" ? "bg-emerald-50/50 border-emerald-100 text-emerald-800" : "bg-zinc-50 border-zinc-100 text-zinc-700"
            }`}>
              <strong className="block mb-0.5 font-mono uppercase text-[9px] tracking-widest text-[#5A5A40]">
                {triviaStatus === "correct" ? "✨ Sensacional! " : "Oops! explicação técnica:"}
              </strong>
              <p className="leading-tight font-sans">{TRIVIA_QUESTIONS[currentTrivia].explain}</p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            {selectedOption !== null && (
              <button
                onClick={handleNextTrivia}
                className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Próxima Pergunta</span>
                <Sparkles size={13} className="text-amber-500" />
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
