import { GuildMember } from "discord.js";
import { APEX_RANKS, RankInfo } from "./ranks.js";

export interface Player {
  member: GuildMember;
  score: number;
  rankDisplay: string;
  rankTier: string;
  isEstimated: boolean;
}

export function getMemberRank(member: GuildMember): Player {
  let best: RankInfo | null = null;

  for (const role of member.roles.cache.values()) {
    const key = role.name.toLowerCase().trim();
    const info = APEX_RANKS[key];
    if (info && (!best || info.score > best.score)) {
      best = info;
    }
  }

  if (best) {
    return {
      member,
      score: best.score,
      rankDisplay: best.display,
      rankTier: best.tier,
      isEstimated: false,
    };
  }

  // ランク未設定はRookieとして扱う
  return {
    member,
    score: APEX_RANKS["rookie"].score,
    rankDisplay: "Rookie（未設定）",
    rankTier: "rookie",
    isEstimated: true,
  };
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function balanceTeams(players: Player[], numTeams: number): Player[][] {
  // 同スコアのプレイヤーをシャッフルしてからスコア降順でソート（毎回異なる結果になる）
  const shuffled = shuffleArray(players);
  const sorted = shuffled.sort((a, b) => b.score - a.score);

  const teams: Player[][] = Array.from({ length: numTeams }, () => []);
  const teamScores = new Array<number>(numTeams).fill(0);

  for (const player of sorted) {
    // 最もスコアが低いチームに割り当て
    const minIdx = teamScores.indexOf(Math.min(...teamScores));
    teams[minIdx].push(player);
    teamScores[minIdx] += player.score;
  }

  return teams;
}

export function calcTeamScore(team: Player[]): number {
  return team.reduce((sum, p) => sum + p.score, 0);
}
