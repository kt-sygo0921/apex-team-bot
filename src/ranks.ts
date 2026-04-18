export interface RankInfo {
  score: number;
  display: string;
  tier: string;
}

export const APEX_RANKS: Record<string, RankInfo> = {
  "rookie":       { score: 100,  display: "Rookie",       tier: "rookie" },
  "bronze iv":    { score: 200,  display: "Bronze IV",    tier: "bronze" },
  "bronze iii":   { score: 225,  display: "Bronze III",   tier: "bronze" },
  "bronze ii":    { score: 250,  display: "Bronze II",    tier: "bronze" },
  "bronze i":     { score: 275,  display: "Bronze I",     tier: "bronze" },
  "silver iv":    { score: 300,  display: "Silver IV",    tier: "silver" },
  "silver iii":   { score: 325,  display: "Silver III",   tier: "silver" },
  "silver ii":    { score: 350,  display: "Silver II",    tier: "silver" },
  "silver i":     { score: 375,  display: "Silver I",     tier: "silver" },
  "gold iv":      { score: 400,  display: "Gold IV",      tier: "gold" },
  "gold iii":     { score: 425,  display: "Gold III",     tier: "gold" },
  "gold ii":      { score: 450,  display: "Gold II",      tier: "gold" },
  "gold i":       { score: 475,  display: "Gold I",       tier: "gold" },
  "platinum iv":  { score: 500,  display: "Platinum IV",  tier: "platinum" },
  "platinum iii": { score: 525,  display: "Platinum III", tier: "platinum" },
  "platinum ii":  { score: 550,  display: "Platinum II",  tier: "platinum" },
  "platinum i":   { score: 575,  display: "Platinum I",   tier: "platinum" },
  "diamond iv":   { score: 600,  display: "Diamond IV",   tier: "diamond" },
  "diamond iii":  { score: 625,  display: "Diamond III",  tier: "diamond" },
  "diamond ii":   { score: 650,  display: "Diamond II",   tier: "diamond" },
  "diamond i":    { score: 675,  display: "Diamond I",    tier: "diamond" },
  "master":       { score: 800,  display: "Master",       tier: "master" },
  "predator":     { score: 1000, display: "Predator",     tier: "predator" },
};

export const RANK_TIERS: { name: string; emoji: string; roles: string[] }[] = [
  { name: "Rookie",   emoji: "🔰", roles: ["Rookie"] },
  { name: "Bronze",   emoji: "🥉", roles: ["Bronze IV", "Bronze III", "Bronze II", "Bronze I"] },
  { name: "Silver",   emoji: "🥈", roles: ["Silver IV", "Silver III", "Silver II", "Silver I"] },
  { name: "Gold",     emoji: "🥇", roles: ["Gold IV", "Gold III", "Gold II", "Gold I"] },
  { name: "Platinum", emoji: "🔷", roles: ["Platinum IV", "Platinum III", "Platinum II", "Platinum I"] },
  { name: "Diamond",  emoji: "💎", roles: ["Diamond IV", "Diamond III", "Diamond II", "Diamond I"] },
  { name: "Master",   emoji: "👑", roles: ["Master"] },
  { name: "Predator", emoji: "🦅", roles: ["Predator"] },
];

const TIER_EMOJI: Record<string, string> = {
  rookie: "🔰", bronze: "🥉", silver: "🥈", gold: "🥇",
  platinum: "🔷", diamond: "💎", master: "👑", predator: "🦅",
};

export function getRankEmoji(tier: string): string {
  return TIER_EMOJI[tier] ?? "❓";
}
