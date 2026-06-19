export type Region = "Sudeste" | "Nordeste" | "Sul" | "Norte" | "Centro-Oeste";

export interface MessageSource {
  title: string;
  url: string;
}

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  sources?: MessageSource[];
  isFallback?: boolean;
}

export interface EnvironmentalGoal {
  id: string;
  title: string;
  description: string;
  category: "reciclagem" | "energia" | "agua" | "tecnologia";
  target: number;
  current: number;
  unit: string;
  xpReward: number;
  completed: boolean;
  type: "daily" | "weekly";
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  xpValue: number;
}

export interface RankingUser {
  rank: number;
  name: string;
  score: number;
  level: number;
  region: Region;
  isCurrentUser?: boolean;
}

export interface UserProfile {
  name: string;
  region: Region;
  xp: number;
  level: number;
  points: number;
  badges: string[]; // List of badge IDs
  carbonSaved: number; // in kg CO2
  waterSaved: number; // in liters
  plasticAvoided: number; // in grams
}

export interface GlobalMetrics {
  co2: string;
  co2Description: string;
  temp: string;
  tempDescription: string;
  renewable: string;
  renewableDescription: string;
  plasticAvoidedSinceEpoch: number;
}

export interface RealTimeData {
  success: boolean;
  timestamp: string;
  globalMetrics: GlobalMetrics;
  regionalData: Record<Region, {
    recycleRate: string;
    majorChallenge: string;
    ecoInnovation: string;
    regionalTip: string;
    activeUsers: number;
  }>;
}
