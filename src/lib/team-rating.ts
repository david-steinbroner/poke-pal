import type { LeagueId } from "./team-types";
import type { TypeCoverage, TeamThreat } from "./team-types";
import { getLeagueInfo } from "./team-analysis";

const TIER_SCORES: Record<string, number> = { S: 4, A: 3, B: 2, C: 1 };

export type TeamRating = "S" | "A" | "B" | "C" | "D";

export const RATING_COLORS: Record<TeamRating, string> = {
  S: "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30",
  A: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
  B: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
  C: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30",
  D: "text-muted-foreground bg-muted",
};

export const RATING_LABELS: Record<TeamRating, string> = {
  S: "Strong team",
  A: "Good team",
  B: "Decent team",
  C: "Gaps in coverage",
  D: "Needs work",
};

/**
 * Calculate team rating from coverage quality + tier + defensive weaknesses.
 *
 * Factors (weighted):
 * - Offensive coverage: how many types can you hit SE (40%)
 * - Tier quality: average meta tier of picks (20%)
 * - Shared weaknesses: penalty for stacked weaknesses (20%)
 * - Meta threat count: how many meta Pokemon threaten 2+ of your team (20%)
 */
export function calculateTeamRating(
  teamIds: string[],
  leagueId: LeagueId,
  offensiveCoverage?: TypeCoverage[],
  defensiveWeaknesses?: TypeCoverage[],
  threats?: TeamThreat[],
): TeamRating {
  if (teamIds.length === 0) return "D";

  const league = getLeagueInfo(leagueId);
  const metaMap = new Map(league.meta.map((m) => [m.pokemonId, m.tier]));

  // 1. Tier score (0-1 scale)
  const totalTierScore = teamIds.reduce((sum, id) => {
    const tier = metaMap.get(id) ?? "C";
    return sum + (TIER_SCORES[tier] ?? 1);
  }, 0);
  const tierScore = totalTierScore / (teamIds.length * 4); // 0-1

  // 2. Offensive coverage (0-1 scale) — how many of 18 types can you hit SE
  const coveredTypes = offensiveCoverage
    ? offensiveCoverage.filter((c) => c.multiplier > 1.0).length
    : 0;
  const coverageScore = coveredTypes / 18; // 0-1

  // 3. Shared weakness count — HARD penalty
  // Each shared weakness (type that hits 2+ team members SE) is very bad
  const sharedWeaknessCount = defensiveWeaknesses?.length ?? 0;

  // 4. Meta threat count — how many meta Pokemon threaten 2+ of your team
  const threatCount = threats?.length ?? 0;

  // Base score from coverage (primary) + tier (secondary)
  let score = coverageScore * 0.5 + tierScore * 0.5;

  // Hard penalties — shared weaknesses are team-killers
  score -= sharedWeaknessCount * 0.15;

  // Each meta threat that hits 2+ members is a real problem
  score -= threatCount * 0.06;

  // Clamp to 0-1
  score = Math.max(0, Math.min(1, score));

  // Tighter thresholds — S should be rare
  if (score >= 0.85) return "S";
  if (score >= 0.65) return "A";
  if (score >= 0.45) return "B";
  if (score >= 0.30) return "C";
  return "D";
}

/**
 * Get the types that would fill the team's offensive gaps.
 */
export function getGapTypes(
  offensiveCoverage: { type: string; multiplier: number }[],
): string[] {
  return offensiveCoverage
    .filter((c) => c.multiplier <= 1.0)
    .map((c) => c.type)
    .slice(0, 3);
}
