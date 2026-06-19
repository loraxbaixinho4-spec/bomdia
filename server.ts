import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing middleware
app.use(express.json());

// Lazy Supabase client initialization to prevent crashing if keys are missing on startup
let supabaseClient: any = null;
const isSupabaseConfigured = () => {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
};

function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }
  return supabaseClient;
}

// Memory fallback database for profiles if Supabase is not configured
const inMemoryProfiles = new Map<string, any>();

// Initialize Gemini safely and lazily to prevent crashing if the key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY local variable or environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. API: Environmental Data Real-time Indices
const regionalData: Record<string, {
  recycleRate: string;
  majorChallenge: string;
  ecoInnovation: string;
  regionalTip: string;
  activeUsers: number;
}> = {
  "Sudeste": {
    recycleRate: "6.4%",
    majorChallenge: "Descartes eletroeletrônicos e alta densidade de resíduos industriais em centros urbanos.",
    ecoInnovation: "Usinas de tratamento de biogás a partir de aterros sanitários e frotas de entrega elétricas.",
    regionalTip: "No Sudeste, use pontos de coleta reversa em supermercados para descartar lâmpadas e pilhas usadas.",
    activeUsers: 845
  },
  "Nordeste": {
    recycleRate: "2.2%",
    majorChallenge: "Gestão de resíduos em áreas costeiras e escassez estrutural de coleta seletiva formal.",
    ecoInnovation: "Pólos de reciclagem mecânica de redes de pesca descartadas e cooperativas digitais de catadores.",
    regionalTip: "Participe de iniciativas de conscientização em praias e apoie cooperativas locais que separam plástico PET.",
    activeUsers: 512
  },
  "Sul": {
    recycleRate: "8.6%",
    majorChallenge: "Logística reversa de agrotóxicos em zonas rurais e tratamento térmico de resíduos.",
    ecoInnovation: "Sistemas avançados de compostagem urbana comunitária e pavimentação com asfalto ecológico.",
    regionalTip: "Aproveite a alta cobertura de coleta seletiva no Sul para separar rigorosamente lixo orgânico de recicláveis seco.",
    activeUsers: 649
  },
  "Norte": {
    recycleRate: "1.2%",
    majorChallenge: "Dificuldades logísticas por transporte hidroviário e destinação de lixo em comunidades isoladas.",
    ecoInnovation: "Tecnologias de bioeconomia circular que transformam fibras de açaí e caroço em bioplásticos.",
    regionalTip: "Descubra os pontos de entrega para resíduos pesados perto dos portos fluviais e minimize o uso de plásticos descartáveis perto dos rios.",
    activeUsers: 231
  },
  "Centro-Oeste": {
    recycleRate: "2.9%",
    majorChallenge: "Descarte inadequado de resíduos agropecuários e grande distância física das indústrias recicladoras.",
    ecoInnovation: "Produção de biocombustíveis e biofertilizantes em larga escala de resíduos da cana de açúcar e milho.",
    regionalTip: "Apoie programas de recolhimento de lixo eletrônico promovidos por universidades públicas locais.",
    activeUsers: 398
  }
};

app.get("/api/environmental-data", (req: Request, res: Response) => {
  // Simulate real-time adjustments based on current timestamp to make it dynamic
  const now = new Date();
  const seconds = now.getSeconds();
  
  // Base stats that represent real world numbers + dynamic micro fluctuations
  const co2Level = (425.21 + Math.sin(seconds / 10) * 0.05).toFixed(2);
  const globalTempAnomaly = "+1.26°C";
  const renewableEnergyShare = (30.42 + (seconds / 150)).toFixed(2);
  const plasticAvoidedGlobal = Math.floor(12405900 + (Date.now() % 1000000) / 10);

  res.json({
    success: true,
    timestamp: now.toISOString(),
    globalMetrics: {
      co2: `${co2Level} ppm`,
      co2Description: "Concentração global em tempo real de CO2 na atmosfera.",
      temp: globalTempAnomaly,
      tempDescription: "Anomalia atual de temperatura em comparação com níveis pré-industriais.",
      renewable: `${renewableEnergyShare}%`,
      renewableDescription: "Fração atual de fontes renováveis na matriz elétrica global ponderada.",
      plasticAvoidedSinceEpoch: plasticAvoidedGlobal,
    },
    regionalData
  });
});

// 1.1 API: Check Supabase connection status
app.get("/api/supabase-status", (req: Request, res: Response) => {
  res.json({
    success: true,
    configured: isSupabaseConfigured(),
    url: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 15) + "..." : null
  });
});

// 1.2 API: Login or Register a user
app.post("/api/profile/login", async (req: Request, res: Response) => {
  try {
    const { name, password, region } = req.body;
    
    if (!name || !password) {
      res.status(400).json({ success: false, error: "Nome e senha são obrigatórios." });
      return;
    }

    const username = name.trim();
    const isConfigured = isSupabaseConfigured();
    
    if (isConfigured) {
      const supabase = getSupabase();
      
      // Look up existing profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("name", username)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar no Supabase:", error);
        throw error;
      }

      if (data) {
        // Exists, check password
        if (data.password !== password) {
          res.json({ success: false, error: "Senha incorreta para este usuário." });
          return;
        }
        
        // Success
        res.json({
          success: true,
          mode: "supabase",
          profile: {
            name: data.name,
            region: data.region,
            xp: data.xp,
            level: data.level,
            points: data.points,
            badges: Array.isArray(data.badges) ? data.badges : JSON.parse(data.badges || "[]"),
            carbonSaved: Number(data.carbonSaved || 0),
            waterSaved: Number(data.waterSaved || 0),
            plasticAvoided: Number(data.plasticAvoided || 0)
          }
        });
      } else {
        // Register new user on the fly!
        const defaultProfile = {
          name: username,
          password: password,
          region: region || "Sudeste",
          xp: 0,
          level: 1,
          points: 100, // starting bonus from previous feature
          badges: ["welcome"],
          carbonSaved: 0,
          waterSaved: 0,
          plasticAvoided: 0
        };

        const { error: insertError } = await supabase
          .from("profiles")
          .insert([defaultProfile]);

        if (insertError) {
          console.error("Erro ao registrar no Supabase:", insertError);
          throw insertError;
        }

        const { password: _, ...cleanProfile } = defaultProfile;
        res.json({
          success: true,
          mode: "supabase",
          isNewUser: true,
          profile: cleanProfile
        });
      }
    } else {
      // Memory Fallback
      if (inMemoryProfiles.has(username)) {
        const stored = inMemoryProfiles.get(username);
        if (stored.password !== password) {
          res.json({ success: false, error: "Senha incorreta para este usuário." });
          return;
        }
        
        const { password: _, ...cleanProfile } = stored;
        res.json({
          success: true,
          mode: "local",
          profile: cleanProfile
        });
      } else {
        const defaultProfile = {
          name: username,
          password: password,
          region: region || "Sudeste",
          xp: 0,
          level: 1,
          points: 100, // starting bonus
          badges: ["welcome"],
          carbonSaved: 0,
          waterSaved: 0,
          plasticAvoided: 0
        };

        inMemoryProfiles.set(username, defaultProfile);
        
        const { password: _, ...cleanProfile } = defaultProfile;
        res.json({
          success: true,
          mode: "local",
          isNewUser: true,
          profile: cleanProfile
        });
      }
    }
  } catch (err: any) {
    console.error("Erro no login/cadastro:", err);
    res.status(500).json({ success: false, error: "Falha de comunicação com o banco de dados.", details: err.message });
  }
});

// 1.3 API: Save current profile progress
app.post("/api/profile/save", async (req: Request, res: Response) => {
  try {
    const { name, password, profile } = req.body;

    if (!name || !profile) {
      res.status(400).json({ success: false, error: "Informações incompletas para salvar." });
      return;
    }

    const username = name.trim();
    const isConfigured = isSupabaseConfigured();

    if (isConfigured) {
      const supabase = getSupabase();

      // Check password if it exists to make sure we don't overwrite other users
      if (password) {
        const { data: userCheck } = await supabase
          .from("profiles")
          .select("password")
          .eq("name", username)
          .maybeSingle();

        if (userCheck && userCheck.password !== password) {
          res.status(403).json({ success: false, error: "Ação não autorizada." });
          return;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          name: username,
          password: password || "1234", // fallback simple password
          region: profile.region,
          xp: profile.xp,
          level: profile.level,
          points: profile.points,
          badges: profile.badges,
          carbonSaved: profile.carbonSaved,
          waterSaved: profile.waterSaved,
          plasticAvoided: profile.plasticAvoided,
          updated_at: new Date().toISOString()
        }, { onConflict: "name" });

      if (error) {
        console.error("Erro ao fazer upsert no Supabase:", error);
        throw error;
      }

      res.json({ success: true, mode: "supabase" });
    } else {
      // Memory Fallback
      if (password && inMemoryProfiles.has(username)) {
        const stored = inMemoryProfiles.get(username);
        if (stored.password !== password) {
          res.status(403).json({ success: false, error: "Ação não autorizada." });
          return;
        }
      }

      inMemoryProfiles.set(username, {
        name: username,
        password: password || "1234",
        ...profile
      });

      res.json({ success: true, mode: "local" });
    }
  } catch (err: any) {
    console.error("Erro ao salvar progresso:", err);
    res.status(500).json({ success: false, error: "Falha ao salvar progresso no banco de dados.", details: err.message });
  }
});

// 2. API: Sustainability Chatbot with Google Grounding
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { message, history, region } = req.body;

    if (!message) {
      res.status(400).json({ success: false, error: "A mensagem do usuário é obrigatória." });
      return;
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (keyError: any) {
      console.warn("Gemini key error:", keyError.message);
      // Helpful fallback response if API Key is not set or initialized
      res.json({
        success: true,
        text: `Olá! Eu sou o **Ecobot**. No momento estou operando no **modo local offline** (sem chave de API ativada). 

Aqui está uma dica rápida de reciclagem baseada na sua região **${region || "Geral"}**:
- **Dica ecológica:** Sabia que separar tampinhas plásticas ajuda muito as oficinas de reciclagem locais? Lave bem as embalagens plásticas e descarte-as limpas para garantir o reaproveitamento!
  
*Para bater um papo em tempo real comigo utilizando inteligência artificial, configure sua chave no painel de Secrets da plataforma.*`,
        fallback: true
      });
      return;
    }

    const regionalContext = region ? `O usuário está na região brasileira: **${region}**. Personalize a resposta com foco regional se fizer sentido (exemplo de reciclagem, dados ou inovações locais: ${JSON.stringify(regionalData[region] || {})}).` : "Não especificado";

    const systemPrompt = `Você é o "SustentaBot", um assistente de inteligência artificial de elite e consultor especializado em sustentabilidade, ecologia de ponta, economia circular, descarte e reciclagem inteligente de resíduos.
Seu objetivo é fornecer respostas práticas, objetivas, cientificamente embasadas e fáceis de aplicar no dia a dia.

Contexto da conversa:
- ${regionalContext}
- Ofereça dicas de reciclagem extremamente práticas (ex: como lavar embalagens antes, triagem correta, logística reversa).
- Destaque inovações tecnológicas ecológicas (ex: créditos de carbono baseados em IA, sensores IoT em lixeiras inteligentes, novos materiais biodegradáveis).
- Mantenha um tom otimista, focado em tecnologia e ação positiva coletiva.
- Sempre responda em Português brasileiro.

IMPORTANTE: Você tem acesso ao Google Search para buscar dados ecológicos recentes e reais. Use-o sempre que for perguntado sobre dados estatísticos urgentes, taxas de reciclagem, leis nacionais brasileiras (como a PNRS) ou novidades ecológicas de 2026.`;

    // Process standard chat history
    const formattedHistory = (history || []).map((h: any) => ({
      role: h.sender === "user" ? "user" : "model",
      parts: [{ text: h.text }]
    }));

    // Generate output with Search Grounding enabled
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        tools: [
          { googleSearch: {} }
        ],
      }
    });

    const replyText = response.text || "Desculpe, não consegui formular uma resposta no momento.";
    
    // Check if grounding metadata exists to show sources!
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Fonte externa",
      url: chunk.web?.uri || "#"
    })).filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.url === v.url) === i) || [];

    res.json({
      success: true,
      text: replyText,
      sources: sources.slice(0, 3) // Return top 3 unique sources
    });

  } catch (error: any) {
    console.error("Erro na rota de chat:", error);
    res.status(500).json({
      success: false,
      error: "Ocorreu um erro interno ao processar a resposta da IA. Verifique as configurações.",
      details: error.message
    });
  }
});

// Start integration with Vite or production file serving
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SustentaTech Server] Rodando com sucesso na porta ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Falha ao iniciar o servidor express:", error);
});
