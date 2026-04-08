import type { LeagueId } from "./team-types";
import { getLeagueInfo } from "./team-analysis";

const TIER_SCORES: Record<string, number> = { S: 4, A: 3, B: 2, C: 1 };

export type TeamRating = "S" | "A" | "B" | "C";

export const RATING_COLORS: Record<TeamRating, string> = {
  S: "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30",
  A: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
  B: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
  C: "text-muted-foreground bg-muted",
};

/**
 * Calculate team rating from average tier of selected Pokemon.
 * Pokemon not in the league meta default to C (score=1).
 */
export function calculateTeamRating(
  teamIds: string[],
  leagueId: LeagueId,
): TeamRating {
  if (teamIds.length === 0) return "C";

  const league = getLeagueInfo(leagueId);
  const metaMap = new Map(league.meta.map((m) => [m.pokemonId, m.tier]));

  const totalScore = teamIds.reduce((sum, id) => {
    const tier = metaMap.get(id) ?? "C";
    return sum + (TIER_SCORES[tier] ?? 1);
  }, 0);

  const avg = totalScore / teamIds.length;
  if (avg >= 3.5) return "S";
  if (avg >= 2.5) return "A";
  if (avg >= 1.5) return "B";
  return "C";
}

/**
 * Get the types that would fill the team's offensive gaps.
 * Returns type names that the team currently can't hit super effectively.
 */
export function getGapTypes(
  offensiveCoverage: { type: string; multiplier: number }[],
): string[] {
  return offensiveCoverage
    .filter((c) => c.multiplier <= 1.0)
    .map((c) => c.type)
    .slice(0, 3); // Top 3 gap types
}
