import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  MapPin, 
  Award, 
  Share2, 
  CheckCircle2, 
  ChevronRight, 
  HelpCircle, 
  Compass, 
  TrendingUp, 
  Shuffle, 
  Users, 
  Globe, 
  Cpu, 
  Trash2, 
  Droplets, 
  Flame, 
  RotateCcw,
  BookOpen,
  Info,
  User,
  Lock
} from "lucide-react";
import { 
  Region, 
  EnvironmentalGoal, 
  RealTimeData, 
  UserProfile, 
  RankingUser 
} from "./types";
import MetricCounter from "./components/MetricCounter";
import SustentaBotChat from "./components/SustentaBotChat";
import ImpactCalculator from "./components/ImpactCalculator";
import GamifiedGoals from "./components/GamifiedGoals";

// Helper function to retry network fetches with exponential backoff on transient errors
async function fetchWithRetry(url: string, options?: RequestInit, retries = 3, delay = 1000): Promise<Response> {
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type");
    // If the server returns plain HTML (caused by a temporary fallback server restart routing everything to index.html),
    // or if the status is not ok, treat as transient failure and try again.
    if (!response.ok || (contentType && contentType.includes("text/html"))) {
      throw new Error(`Request to ${url} failed with status ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchWithRetry(url, options, retries - 1, delay * 2);
  }
}

// Initial standard list of individual eco-goals
const DEFAULT_GOALS: EnvironmentalGoal[] = [
  {
    id: "g-1",
    title: "Triagem Seletiva Inteligente",
    description: "Higienizar e separar adequadamente 5 garrafas plásticas PET ou latinhas hoje.",
    category: "reciclagem",
    target: 5,
    current: 0,
    unit: "un",
    xpReward: 30,
    completed: false,
    type: "daily"
  },
  {
    id: "g-2",
    title: "Minimizar o Vapor",
    description: "Limitar seu tempo de banho em 5 minutos para economizar recursos hídricos potáveis.",
    category: "agua",
    target: 5,
    current: 0,
    unit: "m",
    xpReward: 25,
    completed: false,
    type: "daily"
  },
  {
    id: "g-3",
    title: "Eco Desplugado",
    description: "Retirar eletrodomésticos em modo stand-by da tomada ao dormir.",
    category: "energia",
    target: 1,
    current: 0,
    unit: "vez",
    xpReward: 15,
    completed: false,
    type: "daily"
  },
  {
    id: "g-4",
    title: "Logística Reversa Tech",
    description: "Descartar uma pilha, bateria ou cabo eletrônico desgastado em um ecoponto local.",
    category: "tecnologia",
    target: 1,
    current: 0,
    unit: "item",
    xpReward: 50,
    completed: false,
    type: "weekly"
  },
  {
    id: "g-5",
    title: "Adubo Urbano",
    description: "Coletar e encaminhar sobras alimentares orgânicas para composteira ou vaso de horta.",
    category: "reciclagem",
    target: 1,
    current: 0,
    unit: "kg",
    xpReward: 35,
    completed: false,
    type: "weekly"
  }
];

// Pools de metas adicionais e avançadas para quando o usuário concluir todas as ativas (Rodadas posteriores)
const EXTRA_GOALS_POOL_1: EnvironmentalGoal[] = [
  {
    id: "g-adv1",
    title: "Zero Desperdício Químico",
    description: "Substituir produtos de limpeza convencionais por vinagre de álcool e bicarbonato de sódio.",
    category: "reciclagem",
    target: 1,
    current: 0,
    unit: "vez",
    xpReward: 40,
    completed: false,
    type: "daily"
  },
  {
    id: "g-adv2",
    title: "Economia de Luz Extrema",
    description: "Aproveitar 100% de luz solar natural e manter lâmpadas apagadas até às 18h.",
    category: "energia",
    target: 1,
    current: 0,
    unit: "dia",
    xpReward: 35,
    completed: false,
    type: "daily"
  },
  {
    id: "g-adv3",
    title: "Prato Verde de Origem",
    description: "Consumir refeições 100% livres de carne ou derivados para mitigar impactos de metano.",
    category: "tecnologia",
    target: 1,
    current: 0,
    unit: "refeição",
    xpReward: 45,
    completed: false,
    type: "daily"
  },
  {
    id: "g-adv4",
    title: "Chuveiro Eficiente Máximo",
    description: "Reduzir o tempo de banho para no máximo 3 minutos marcados no cronômetro.",
    category: "agua",
    target: 1,
    current: 0,
    unit: "vez",
    xpReward: 30,
    completed: false,
    type: "daily"
  }
];

const EXTRA_GOALS_POOL_2: EnvironmentalGoal[] = [
  {
    id: "g-adv5",
    title: "Adeus Sacolas Descartáveis",
    description: "Fazer compras usando sacolas 100% retornáveis, recusando sacolas plásticas nos comércios.",
    category: "reciclagem",
    target: 1,
    current: 0,
    unit: "compra",
    xpReward: 45,
    completed: false,
    type: "daily"
  },
  {
    id: "g-adv6",
    title: "Detox de Standby de Equipamentos",
    description: "Desligar todas as extensões e filtros de linha com leds vermelhos brilhantes ao dormir.",
    category: "energia",
    target: 1,
    current: 0,
    unit: "noite",
    xpReward: 30,
    completed: false,
    type: "daily"
  },
  {
    id: "g-adv7",
    title: "Reuso Produtivo de Águas",
    description: "Capturar e reutilizar a água do ciclo de descarga ou lavagem de roupas para lavar quintais.",
    category: "agua",
    target: 1,
    current: 0,
    unit: "balde",
    xpReward: 50,
    completed: false,
    type: "daily"
  },
  {
    id: "g-adv8",
    title: "Logística Reversa Voluntária",
    description: "Coletar embalagens antigas de cosméticos ou medicamentos e entregar em farmácias coletoras.",
    category: "tecnologia",
    target: 1,
    current: 0,
    unit: "entrega",
    xpReward: 60,
    completed: false,
    type: "daily"
  }
];

export default function App() {
  // 1. Regional State
  const [currentRegion, setCurrentRegion] = useState<Region>("Sudeste");
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  
  // 2. Profile and Level Gamification States
  const [profile, setProfile] = useState<UserProfile>({
    name: "Ana Silva",
    region: "Sudeste",
    xp: 620,
    level: 3,
    points: 350,
    badges: ["welcome", "recycler_bronze"],
    carbonSaved: 14.2, // in kg CO2
    waterSaved: 350, // in Liters
    plasticAvoided: 850 // in grams
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("Ana Silva");

  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginNameInput, setLoginNameInput] = useState("");
  const [loginPasswordInput, setLoginPasswordInput] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Supabase Configuration Status
  const [supabaseStatus, setSupabaseStatus] = useState<{ configured: boolean; url: string | null }>({
    configured: false,
    url: null
  });

  // Fetch Supabase status on mount
  useEffect(() => {
    const checkSupabase = async () => {
      try {
        const response = await fetchWithRetry("/api/supabase-status", {}, 3, 500);
        const data = await response.json();
        if (data.success) {
          setSupabaseStatus({
            configured: data.configured,
            url: data.url
          });
        }
      } catch (err) {
        console.error("Erro ao verificar status do Supabase:", err);
      }
    };
    checkSupabase();
  }, []);

  // Sync profile changes to Supabase (with debounce of 1000ms)
  useEffect(() => {
    if (!isLoggedIn || !profile.name) return;

    const saveTimeout = setTimeout(async () => {
      try {
        await fetchWithRetry("/api/profile/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: profile.name,
            password: password || "1234",
            profile: profile
          })
        }, 2, 500);
      } catch (err) {
        console.error("Erro ao sincronizar com banco:", err);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [
    profile.name,
    profile.region,
    profile.xp,
    profile.level,
    profile.points,
    profile.badges.join(","),
    profile.carbonSaved,
    profile.waterSaved,
    profile.plasticAvoided,
    isLoggedIn,
    password
  ]);




  // 3. Goals list
  const [goals, setGoals] = useState<EnvironmentalGoal[]>(DEFAULT_GOALS);
  const [goalsCompletedToday, setGoalsCompletedToday] = useState(0);
  const [goalRound, setGoalRound] = useState(1);
  const [allGoalsCompletedModalShown, setAllGoalsCompletedModalShown] = useState(false);
  
  // 4. Real-time Environmental Data from server API
  const [environmentalData, setEnvironmentalData] = useState<RealTimeData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // 5. Ranking Users database
  const [rankingList, setRankingList] = useState<RankingUser[]>([]);

  // Keep leaderboard updated and sorted dynamically
  useEffect(() => {
    const defaultUsers = [
      { rank: 1, name: "Marcos R.", score: 2800, level: 5, region: "Sudeste" as Region },
      { rank: 2, name: "Júlia M.", score: 2500, level: 4, region: "Sul" as Region },
      { rank: 3, name: isLoggedIn ? `${profile.name} (Você)` : "Ana Silva", score: isLoggedIn ? profile.points : 1320, level: isLoggedIn ? profile.level : 3, region: isLoggedIn ? profile.region : ("Sudeste" as Region), isCurrentUser: true },
      { rank: 4, name: "Felipe L.", score: 980, level: 2, region: "Nordeste" as Region },
      { rank: 5, name: "Amanda S.", score: 710, level: 2, region: "Norte" as Region }
    ];

    // Sort descending by score, recalculate ranks (1st, 2nd, 3rd...)
    const sorted = [...defaultUsers].sort((a, b) => b.score - a.score);
    const ranked = sorted.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
    setRankingList(ranked);
  }, [profile.points, profile.level, profile.name, profile.region, isLoggedIn]);


  // Toast for congratulations
  const [congratsToast, setCongratsToast] = useState<string | null>(null);

  // Fetch real-time metrics
  const fetchMetrics = async () => {
    setIsSyncing(true);
    try {
      const response = await fetchWithRetry("/api/environmental-data", {}, 3, 500);
      const data = await response.json();
      if (data.success) {
        setEnvironmentalData(data);
      }
    } catch (err) {
      console.warn("Informando: Operando com dados ecológicos integrados/locais motivado por recarga rápida:", err);
    } finally {
      setTimeout(() => setIsSyncing(false), 800); // smooth indicator transitions
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Refresh metric count subtly every 35 seconds
    const interval = setInterval(() => {
      fetchMetrics();
    }, 35000);
    return () => clearInterval(interval);
  }, []);

  // Whenever user points/xp increases, let's keep ranking synced up dynamically
  useEffect(() => {
    const userScore = profile.xp + profile.points;
    setRankingList((prevList) => {
      const updated = prevList.map((player) => {
        if (player.isCurrentUser) {
          return { ...player, name: `${profile.name} (Você)`, score: userScore, level: profile.level };
        }
        return player;
      });
      // Sort table
      return updated
        .sort((a, b) => b.score - a.score)
        .map((player, idx) => ({ ...player, rank: idx + 1 }));
    });
  }, [profile.xp, profile.points, profile.level, profile.name]);

  // Handle goals toggling and dynamic compound achievements
  const handleToggleGoal = (id: string) => {
    setGoals((prevGoals) => {
      let tempCompletedTodayChange = 0;
      let targetGoal: EnvironmentalGoal | undefined;

      const updated = prevGoals.map((g) => {
        if (g.id === id) {
          const nextCompletedStatus = !g.completed;
          targetGoal = g;
          
          if (nextCompletedStatus) {
            tempCompletedTodayChange = 1;

            // Increment count temporarily for calculation
            const nextComboCount = goalsCompletedToday + 1;

            // Compound bonus rate: more consecutive goals today = higher points reward!
            const comboXpBonus = nextComboCount * 6; // +6, +12, +18... XP bonus per step
            const comboPointsBonus = Math.round(comboXpBonus / 2);
            
            // Reward base + combo multiplier bonuses
            addXpAndPoints(g.xpReward + comboXpBonus, Math.round(g.xpReward / 2) + comboPointsBonus);
            
            // Increment statistics based on category
            let dbCarbon = 0, dbWater = 0, dbPlastic = 0;
            if (g.category === "reciclagem") {
              dbPlastic += 200;
              dbCarbon += 0.5;
            } else if (g.category === "agua") {
              dbWater += 40;
            } else if (g.category === "energia") {
              dbCarbon += 0.8;
            } else if (g.category === "tecnologia") {
              dbPlastic += 100;
              dbCarbon += 1.2;
            }
            
            setProfile((current) => ({
              ...current,
              carbonSaved: current.carbonSaved + dbCarbon,
              waterSaved: current.waterSaved + dbWater,
              plasticAvoided: current.plasticAvoided + dbPlastic
            }));

            // Generate visual satisfaction notification with combo multiplier feedback
            triggerSimpleToast(`Meta "${g.title}" Concluída! Multiplicador Combo ${nextComboCount}x hoje: ganhou +${g.xpReward + comboXpBonus} XP (+${comboXpBonus} bônus) e +${Math.round(g.xpReward / 2) + comboPointsBonus} EcoPontos! 🔥🌱`);
          } else {
            tempCompletedTodayChange = -1;
            
            // Deduct base reward
            setProfile((current) => ({
              ...current,
              xp: Math.max(0, current.xp - g.xpReward),
              points: Math.max(0, current.points - Math.round(g.xpReward / 2))
            }));
            
            triggerSimpleToast(`Meta "${g.title}" remarcada como pendente.`);
          }
          return { ...g, completed: nextCompletedStatus };
        }
        return g;
      });

      // Update counters safely
      if (tempCompletedTodayChange !== 0) {
        setGoalsCompletedToday((prev) => Math.max(0, prev + tempCompletedTodayChange));
      }

      // Check if ALL goals in the current active list are completed
      const allCompletedNow = updated.every((g) => g.completed);
      if (allCompletedNow && updated.length > 0) {
        // Automatically trigger festive round-complete overlay modal after a brief satisfying delay
        setTimeout(() => {
          setAllGoalsCompletedModalShown(true);
        }, 500);
      }

      return updated;
    });
  };

  // Safe handler to fetch and inject a new batch / round of goals
  const handleAdvanceGoalsRound = () => {
    let nextGoalsPool: EnvironmentalGoal[] = [];
    
    // Choose which advanced list to inject
    if (goalRound === 1) {
      nextGoalsPool = EXTRA_GOALS_POOL_1;
    } else if (goalRound === 2) {
      nextGoalsPool = EXTRA_GOALS_POOL_2;
    } else {
      // Generate infinitive dynamic premium sets to keep users engaged infinitely
      nextGoalsPool = DEFAULT_GOALS.map((g, idx) => ({
        ...g,
        id: `dynamic-${goalRound}-${idx}`,
        title: `${g.title} Lendária v${goalRound}`,
        description: `Prática avançada ultra-eficiente: ${g.description}`,
        xpReward: g.xpReward + (goalRound * 10),
        completed: false
      }));
    }

    setGoals(nextGoalsPool);
    setGoalRound((prev) => prev + 1);
    setAllGoalsCompletedModalShown(false);

    // Give giant extra batch reward: 150 XP and 75 EcoPoints
    addXpAndPoints(150, 75);
    triggerSimpleToast(`Sucesso! Rodada ${goalRound} Finalizada! Recebido Bônus Especial de +150 XP e +75 EcoPontos e um novo lote de metas diárias extras foi gerado! 🌟♻️`);
  };

  const handleAddCustomImpact = (carbon: number, water: number, plastic: number, pointsToAdd: number) => {
    setProfile((current) => {
      const newXp = current.xp + Math.round(pointsToAdd / 2);
      // Simple formula to scale up levels: level up every 1000 XP
      const nextLevel = Math.floor(newXp / 1000) + 1;
      
      const leveledUp = nextLevel > current.level;
      if (leveledUp) {
        triggerSimpleToast(`✨ SENSACIONAL! Você avançou para o Nível ${nextLevel}! Continue liderando as iniciativas tecnológicas.`);
      }

      return {
        ...current,
        points: current.points + pointsToAdd,
        xp: newXp,
        level: nextLevel,
        carbonSaved: current.carbonSaved + carbon,
        waterSaved: current.waterSaved + water,
        plasticAvoided: current.plasticAvoided + plastic
      };
    });
  };

  // Reward utility for chatbot interaction
  const handleChatReward = (pointsEarned: number) => {
    addXpAndPoints(pointsEarned * 2, pointsEarned);
  };

  const addXpAndPoints = (xpEarned: number, pointsEarned: number) => {
    setProfile((current) => {
      const finalXp = current.xp + xpEarned;
      const finalLevel = Math.floor(finalXp / 1000) + 1;
      
      if (finalLevel > current.level) {
        triggerSimpleToast(`🎉 Nível Superior Desbloqueado: Nível ${finalLevel}! Seu impacto cresce a cada dia.`);
      }

      return {
        ...current,
        xp: finalXp,
        points: current.points + pointsEarned,
        level: finalLevel
      };
    });
  };

  const triggerSimpleToast = (text: string) => {
    setCongratsToast(text);
    setTimeout(() => {
      setCongratsToast(null);
    }, 4500);
  };

  const handleRegionChange = (reg: Region) => {
    setCurrentRegion(reg);
    setShowRegionSelector(false);
    triggerSimpleToast(`Região atualizada para: ${reg}. Carregando novos dados de inovações ecológicas...`);
  };

  // Share entire ecological achievements on Twitter/X or copies to device clipboard
  const handleShareOverall = () => {
    const shareMessage = `Estou no nível ${profile.level} com ${profile.points} EcoPontos no app de sustentabilidade SustentaTech! Economizei ${profile.carbonSaved.toFixed(1)}kg de CO₂ e ${(profile.plasticAvoided / 1000).toFixed(2)}kg de plástico hoje. Faça parte você também! 🌱💻♻️`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
    window.open(shareUrl, "_blank");
    triggerSimpleToast("Compartilhamento social aberto com sucesso!");
  };

  // Handle user login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginNameInput.trim()) {
      setLoginError("Por favor, insira seu nome de usuário.");
      return;
    }
    if (loginPasswordInput.length < 4) {
      setLoginError("A senha deve ter pelo menos 4 caracteres.");
      return;
    }
    
    try {
      const response = await fetchWithRetry("/api/profile/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: loginNameInput.trim(),
          password: loginPasswordInput,
          region: currentRegion
        })
      }, 2, 500);
      
      const data = await response.json();
      if (!data.success) {
        setLoginError(data.error || "Ocorreu um erro no login.");
        return;
      }
      
      // Save password and load profile state
      setPassword(loginPasswordInput);
      setProfile(data.profile);
      setCurrentRegion(data.profile.region);
      setIsLoggedIn(true);
      setLoginError("");
      
      if (data.isNewUser) {
        triggerSimpleToast(`Bem-vindo, ${data.profile.name}! Sua conta foi criada com sucesso! Bônus de +100 EcoPontos! 🍀🚀`);
      } else {
        triggerSimpleToast(`Bem-vindo de volta, ${data.profile.name}! Seus dados foram carregados diretamente com segurança! 📶🤖`);
      }
    } catch (err: any) {
      console.error(err);
      setLoginError("Erro ao se conectar com o servidor para autenticar.");
    }
  };

  // Regional indicators based on selected region
  const selectedRegionDetails = environmentalData?.regionalData[currentRegion] || {
    recycleRate: "Geral",
    majorChallenge: "Fortalecimento institucional de triagem seletiva.",
    ecoInnovation: "Iniciativas de créditos de carbono para cooperativas.",
    regionalTip: "Promova a reciclagem de plásticos secos e compostagem orgânica com vizinhos.",
    activeUsers: 350
  };

  return (
    <div id="natural-tones-root" className="min-h-screen bg-[#F9F8F3] font-sans text-[#33332D] pb-12 transition-all duration-300">
      
      {/* Toast Alert floating */}
      {congratsToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#5A5A40] text-white border border-[#A7C080]/30 rounded-2xl px-5 py-4 shadow-2xl max-w-sm flex items-start gap-3 transition-transform animate-slide-up">
          <Award className="text-[#A7C080] shrink-0 mt-0.5 h-6 w-6" />
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#E0E2D1] font-semibold">Mensagem do Ecossistema</p>
            <p className="text-sm mt-1 text-white leading-snug">{congratsToast}</p>
          </div>
        </div>
      )}

      {!isLoggedIn ? (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 md:py-20">
          <div className="w-full max-w-md bg-white border border-[#EBE9E0] rounded-[32px] p-8 md:p-10 shadow-xl relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute -right-12 -top-12 h-32 w-32 bg-[#E9EED9] rounded-full opacity-40 blur-xl"></div>
            <div className="absolute -left-12 -bottom-12 h-32 w-32 bg-[#F2F4E8] rounded-full opacity-40 blur-xl"></div>
            
            {/* Branding */}
            <div className="text-center space-y-3 relative z-10">
              <div className="inline-flex h-14 w-14 bg-[#5A5A40] rounded-full items-center justify-center shadow-md mb-2">
                <Compass className="text-white h-7 w-7 animate-spin-slow" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#3D3D33] tracking-tight">Entrar no SustentaTech</h2>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
                Participe dos desafios diários de sustentabilidade e gerencie seu impacto ambiental em tempo real.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="mt-8 space-y-4 relative z-10">
              {loginError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#5A5A40] mb-1.5 pl-1">
                  Seu Nome
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-zinc-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={loginNameInput}
                    onChange={(e) => setLoginNameInput(e.target.value)}
                    placeholder="Digite seu nome (ex: Ana Silva)"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAFAF8] border border-[#EBE9E0] rounded-2xl text-sm font-semibold text-[#3D3D33] placeholder-zinc-400 focus:outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/10 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#5A5A40] mb-1.5 pl-1">
                  Senha Secreta
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-zinc-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Sua senha (ex: 1234)"
                    value={loginPasswordInput}
                    onChange={(e) => setLoginPasswordInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#FAFAF8] border border-[#EBE9E0] rounded-2xl text-sm font-semibold text-[#3D3D33] placeholder-zinc-400 focus:outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/10 transition"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 font-mono mt-1.5 pl-1">
                  💡 Insira qualquer senha com no mínimo 4 caracteres para simular.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-[#5A5A40] text-white hover:bg-[#484833] font-bold text-sm py-3.5 rounded-2xl shadow-sm transition hover:shadow-md cursor-pointer mt-4 flex items-center justify-center gap-2"
              >
                <span>Entrar no Painel Ecológico</span>
                <Compass size={16} className="animate-pulse" />
              </button>
            </form>

            {/* Quick Helper for Simulation */}
            <div className="mt-6 pt-5 border-t border-[#FAFAF8] text-center">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Dica de Acesso Rápido</span>
              <p className="text-[11px] text-zinc-500 mt-1">
                Nome: <strong className="text-[#5A5A40]">Ana Silva</strong> — Senha: <strong className="text-[#5A5A40]">1234</strong>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header Bar */}
          <header className="bg-white border-b border-[#EBE9E0] px-6 py-4.5 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#5A5A40] rounded-full flex items-center justify-center shadow-inner">
              <Compass className="text-white h-5.5 w-5.5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-[#5A5A40]">SustentaTech</span>
                <span className="bg-[#F2F4E8] text-[#5A5A40] text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold border border-[#E0E2D1]">
                  v2.8 Eco
                </span>
              </div>
              <p className="text-xs text-[#8B9D83] font-sans">Tecnologia Inteligente para Gestão Climática e Coleta</p>
            </div>
          </div>

          {/* Environmental live summary bar header */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Supabase connection indicator badge */}
            <div 
              className={`border rounded-xl px-3 py-2 text-xs font-mono flex items-center gap-1.5 transition cursor-default select-none ${
                supabaseStatus.configured 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-150" 
                  : "bg-amber-50 text-amber-800 border-[#F5E6D0]"
              }`}
              title={supabaseStatus.configured ? "Banco de dados de nuvem Supabase ativo!" : "Supabase inoperante por falta de Chaves Secretas. Operando no modo local."}
            >
              <div className={`h-1.5 w-1.5 rounded-full ${supabaseStatus.configured ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse"}`}></div>
              <span>{supabaseStatus.configured ? "Supabase Ativo" : "Banco: Local"}</span>
            </div>

            <button
              onClick={fetchMetrics}
              disabled={isSyncing}
              className="bg-[#F2F4E8] hover:bg-[#E2E5D4] text-[#5A5A40] border border-[#E0E2D1] rounded-xl px-3 py-2 text-xs font-mono flex items-center gap-2 transition cursor-pointer"
              title="Sincronizar dados climáticos em tempo real"
            >
              <RotateCcw size={13} className={isSyncing ? "animate-spin" : ""} />
              <span>{isSyncing ? "Sincronizando..." : "Dados em Tempo Real"}</span>
            </button>

            {/* Profile state badge quick view */}
            <div className="bg-zinc-900 text-white rounded-xl px-4 py-1.5 flex items-center gap-3 border border-zinc-800 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-450 animate-pulse"></div>
              <div className="text-xs font-mono">
                <span className="text-zinc-400">Level</span>{" "}
                <strong className="text-[#A7C080] font-bold">{profile.level}</strong>
              </div>
              <div className="h-4 w-[1px] bg-zinc-800"></div>
              <div className="text-xs font-mono text-zinc-300">
                <strong>{profile.points}</strong> pts
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={() => {
                setIsLoggedIn(false);
                setLoginNameInput("");
                setLoginPasswordInput("");
                setPassword("");
                triggerSimpleToast("Sessão finalizada com sucesso! Progresso salvo no banco.");
              }}
              className="bg-white hover:bg-zinc-50 text-zinc-650 hover:text-zinc-900 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono flex items-center gap-1 transition cursor-pointer"
              title="Sair da conta e mudar de usuário"
            >
              <span>Sair</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container Wrapper */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8">
        
        {/* Welcome Section / Profile Setup Banner */}
        <section className="bg-white border border-[#EBE9E0] rounded-[32px] p-6 md:p-8 mb-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -right-16 -top-16 p-24 opacity-5 text-[#5A5A40]">
            <Compass size={240} />
          </div>

          <div className="space-y-3 max-w-[650px] relative z-10">
            <span className="bg-[#F2F4E8] text-[#5A5A40] text-[10px] uppercase font-mono font-bold tracking-widest px-3 py-1 rounded-full border border-[#E0E2D1]">
              Perfil Ambiental Ativo
            </span>
            {isEditingName ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (tempName.trim()) {
                    setProfile(curr => ({ ...curr, name: tempName.trim() }));
                    setIsEditingName(false);
                    triggerSimpleToast(`Nome de perfil atualizado para ${tempName.trim()}!`);
                  }
                }}
                className="flex items-center gap-2 mt-2 bg-[#FAFAF8] p-2.5 rounded-2xl border border-[#EBE9E0] max-w-sm"
              >
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Seu lindo nome ecológico..."
                  maxLength={24}
                  className="bg-white border border-[#EBE9E0] px-3 py-1.5 rounded-xl text-sm font-semibold text-[#3D3D33] focus:outline-none focus:border-[#5A5A40] transition w-full"
                />
                <button
                  type="submit"
                  className="bg-[#5A5A40] text-white hover:bg-[#484833] font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempName(profile.name);
                    setIsEditingName(false);
                  }}
                  className="text-zinc-500 hover:text-zinc-850 text-xs px-2.5 py-2 transition"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <h1 className="text-2xl md:text-3.5xl font-extrabold text-[#3D3D33] leading-tight tracking-tight flex items-center flex-wrap gap-2.5">
                Olá, <span>{profile.name}</span>
                <button
                  onClick={() => {
                    setTempName(profile.name);
                    setIsEditingName(true);
                  }}
                  className="text-xs font-mono font-medium text-[#5A5A40] bg-[#F2F4E8] hover:bg-[#E0E2D1] border border-[#E0E2D1] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Editar seu nome de herói ambiental"
                >
                  <span>✏ Alterar Nome</span>
                </button>
                <span>! 🌱 Baseado na sua região </span>
                <span className="text-[#5A5A40] underline decoration-[#A7C080] decoration-2">{currentRegion}</span>.
              </h1>
            )}
            <p className="text-sm text-zinc-650 leading-relaxed">
              Monitore métricas de impacto climático em tempo real, gerencie tarefas de compostagem urbana e receba instruções avançadas de reciclagem do <strong className="text-[#5A5A40]">SustentaBot</strong> personalizado.
            </p>

            {/* Micro indicators bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#5A5A40] pt-2">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#A7C080]" /> Região Selecionada: <strong>{currentRegion}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Users size={13} className="text-[#A7C080]" /> {selectedRegionDetails.activeUsers} Guardiões Ativos Localmente
              </span>
            </div>
          </div>

          {/* Action trigger right side */}
          <div className="shrink-0 space-y-3 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRegionSelector(!showRegionSelector)}
                type="button"
                className="bg-[#5A5A40] hover:bg-[#484833] text-white px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition flex items-center gap-2 cursor-pointer shadow-md shadow-[#5A5A40]/10"
              >
                <span>Mudar Sua Região</span>
                <MapPin size={14} />
              </button>
              
              <button
                onClick={handleShareOverall}
                type="button"
                className="bg-white hover:bg-[#F2F4E8] text-[#5A5A40] border border-[#EBE9E0] px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition flex items-center gap-2 cursor-pointer shadow-sm"
                title="Compartilhar suas realizações no Twitter / Redes sociais"
              >
                <span>Compartilhar</span>
                <Share2 size={14} />
              </button>
            </div>

            {/* Region selection options list dropdown inline */}
            {showRegionSelector && (
              <div className="bg-white border border-[#EBE9E0] rounded-2xl p-3 shadow-lg flex flex-col gap-1 w-full max-w-[260px] animate-fade-in">
                <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest px-2 mb-1">Selecione o Território Brasileiro:</p>
                {(["Sudeste", "Nordeste", "Sul", "Norte", "Centro-Oeste"] as Region[]).map((reg) => (
                  <button
                    key={reg}
                    onClick={() => handleRegionChange(reg)}
                    type="button"
                    className={`text-left text-xs px-3 py-2 rounded-xl transition flex items-center justify-between ${
                      currentRegion === reg 
                        ? "bg-[#F2F4E8] text-[#5A5A40] font-bold" 
                        : "hover:bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    <span>{reg}</span>
                    {currentRegion === reg && <span className="h-1.5 w-1.5 rounded-full bg-[#5A5A40]"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Global Live Ticker Indicators from dynamic API */}
        <MetricCounter
          metrics={environmentalData ? environmentalData.globalMetrics : null}
          personalCarbon={profile.carbonSaved}
          personalWater={profile.waterSaved}
          personalPlastic={profile.plasticAvoided}
          userLevel={profile.level}
          userPoints={profile.points}
        />

        {/* Dynamic Regional Insights Board banner */}
        <section className="bg-[#F2F4E8] border border-[#E0E2D1] rounded-[28px] p-6 mb-8 flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white border border-[#E0E2D1] flex items-center justify-center text-[#5A5A40] shrink-0">
              <Compass size={24} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#5A5A40] font-bold">Diagnóstico em Tempo Real</span>
              <h3 className="text-base font-extrabold text-[#3D3D33] mt-0.5">Inovações Verdes & Desafios: {currentRegion}</h3>
              <p className="text-xs text-[#5A5A40] mt-1.5 max-w-3xl leading-relaxed">
                <strong>Principais Desafios:</strong> {selectedRegionDetails.majorChallenge} <br />
                <strong>Ecoinovações de Destaque:</strong> {selectedRegionDetails.ecoInnovation}
              </p>
            </div>
          </div>
          <div className="bg-white/80 border border-[#E0E2D1] p-4.5 rounded-2xl max-w-sm shrink-0">
            <p className="text-[10px] font-mono text-[#5A5A40] uppercase tracking-wider font-bold mb-1">💡 Dica Ecológica Local sugerida:</p>
            <p className="text-xs text-zinc-700 leading-snug font-sans">{selectedRegionDetails.regionalTip}</p>
          </div>
        </section>

        {/* Interaction Center Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Custom chatbot with Grounding (Spans columns on desktop) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-[#EBE9E0] rounded-[32px] p-1.5 shadow-sm overflow-hidden">
              <SustentaBotChat 
                region={currentRegion}
                onActionReward={handleChatReward}
              />
            </div>
 
            {/* Static environmental handbook resource guide */}
            <div className="bg-white border border-[#EBE9E0] rounded-[32px] p-6">
              <h3 className="font-bold text-[#3D3D33] text-sm flex items-center gap-2 mb-3">
                <BookOpen className="text-[#A7C080] h-4.5 w-4.5" /> Guia Explicativo: O que são estes índices?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-600">
                <div className="bg-[#FAFAF8] p-3.5 rounded-xl border border-zinc-100">
                  <span className="font-mono text-[#5A5A40] font-bold block mb-1">Concentração de CO₂ (ppm)</span>
                  Partes por milhão na atmosfera. Atualmente acima de 425 ppm devido a queimas fósseis industriais. Cada grama que você desvia de lixões cooperando para reciclagem atenua as emissões associadas ao frete e extração virgem.
                </div>
                <div className="bg-[#FAFAF8] p-3.5 rounded-xl border border-zinc-100">
                  <span className="font-mono text-[#5A5A40] font-bold block mb-1">Economia Circular & Compostagem</span>
                  Reciclar alumínio poupa 95% da energia necessária para minerar bauxita bruta. A água economizada ao evitar mineração e processos industriais é contabilizada imediatamente ao reciclar pilhas ou descartar o lixo no local correto!
                </div>
              </div>
            </div>
          </div>
 
          {/* Right sidebar panel containing Gamified Actions and Impact Calculator */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Gamified Goals panel */}
            <div className="bg-white border border-[#EBE9E0] rounded-[32px] p-1.5 shadow-sm">
              <GamifiedGoals 
                goals={goals}
                onToggleGoal={handleToggleGoal}
                goalRound={goalRound}
                goalsCompletedToday={goalsCompletedToday}
                onAdvanceRound={handleAdvanceGoalsRound}
                allGoalsCompletedModalShown={allGoalsCompletedModalShown}
              />
            </div>
 
            {/* Impact logs simulator calculator */}
            <div className="bg-white border border-[#EBE9E0] rounded-[32px] p-1.5 shadow-sm">
              <ImpactCalculator
                onAddImpact={handleAddCustomImpact}
              />
            </div>
 
            {/* Monthly Eco Leaderboard panel */}
            <div className="bg-white border border-[#EBE9E0] rounded-[32px] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#3D3D33] text-sm flex items-center gap-2">
                  <Users className="text-[#A7C080] h-4.5 w-4.5" /> Ranking Mensal de Guardiões
                </h3>
                <span className="text-[10px] font-mono text-zinc-400">Região {currentRegion}</span>
              </div>
              
              <div className="space-y-3">
                {rankingList.map((player) => (
                  <div
                    key={player.name}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition ${
                      player.isCurrentUser 
                        ? "bg-[#F2F4E8] border-[#A7C080]/30 text-[#5A5A40] font-semibold" 
                        : "bg-white border-zinc-100 text-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono font-bold w-5 ${
                        player.rank === 1 ? "text-amber-500" : player.rank === 2 ? "text-zinc-400" : "text-zinc-500"
                      }`}>
                        {player.rank}º
                      </span>
                      
                      {/* Avatar placeholder circle with first letters */}
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shadow-inner ${
                        player.isCurrentUser ? "bg-[#5A5A40] text-white" : "bg-[#F2F4E8] text-[#5A5A40]"
                      }`}>
                        {player.name.substring(0, 2).toUpperCase()}
                      </div>
                      
                      <div>
                        <div className="text-xs">{player.name}</div>
                        <div className="text-[9px] text-zinc-400 font-mono">Lvl {player.level} • {player.region}</div>
                      </div>
                    </div>
                    
                    <span className="text-xs font-mono font-bold">{player.score.toLocaleString()} pts</span>
                  </div>
                ))}
              </div>
 
              {/* Reward info panel */}
              <div className="bg-[#D4A373]/10 border border-[#D4A373]/15 p-4 rounded-2xl mt-5">
                <span className="text-[10px] font-mono font-bold text-[#D4A373] uppercase tracking-wider block">PREMIAÇÃO DO MÊS DE JUNHO</span>
                <p className="text-xs text-[#5A4040] font-medium mt-1">Workshop exclusivo de Permacultura Urbana com assessores agronômicos.</p>
              </div>
            </div>
 
            {/* Small environmental tip of the day card footer sidebar */}
            <div className="bg-[#5A5A40] text-white rounded-[32px] p-6 shadow-md relative overflow-hidden hidden lg:block">
              <div className="absolute right-0 bottom-0 p-6 opacity-5 text-white">
                <Info size={120} />
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#E0E2D1] font-bold block mb-1">Como funciona a gamificação?</span>
              <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                Ao interagir com o robô SustentaBot, completar os desafios diários/semanais ou simular seus hábitos no medidor de impacto, você gera EcoPontos e eleva seu nível na plataforma. Convide seus amigos e compartilhe seu progresso ecológico!
              </p>
            </div>
 
          </div>

        </div>
      </main>
        </>
      )}

      {/* Elegant minimalist platform footer */}
      <footer className="mt-16 pt-8 border-t border-[#EBE9E0] text-center text-xs text-zinc-400 font-mono max-w-7xl mx-auto px-6">
        <p>SustentaTech — Monitoramento Climático e Educação Ambiental no Brasil.</p>
        <p className="mt-1.5 opacity-70">Painel com carregamento de dados ecológicos ativos em 2026. Feito com tecnologia de transição sustentável e IA.</p>
      </footer>

    </div>
  );
}
