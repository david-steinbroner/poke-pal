export type RankEntry = {
  speciesId: string;
  speciesName: string;
  rank: number;
  score: number;
  moveset: string[];
  elite: string[];
};

export type RankResult = {
  entry: RankEntry;
  total: number;
  tier: "S" | "A" | "B" | "C" | "D";
};

export function scoreToTier(score: number): "S" | "A" | "B" | "C" | "D" {
  if (score >= 95) return "S";
  if (score >= 90) return "A";
  if (score >= 85) return "B";
  if (score >= 80) return "C";
  return "D";
}

export function lookupRanking(
  rankings: Map<string, RankEntry>,
  speciesId: string,
  total: number,
): RankResult | null {
  const entry = rankings.get(speciesId);
  if (!entry) return null;
  return { entry, total, tier: scoreToTier(entry.score) };
}

export function buildRankingsMap(rankings: RankEntry[]): Map<string, RankEntry> {
  const map = new Map<string, RankEntry>();
  for (const entry of rankings) {
    map.set(entry.speciesId, entry);
  }
  return map;
}

/** Convert our pokemon.json `id` (kebab-case) to pvpoke `speciesId` (underscore-case) */
export function ourIdToPvpoke(id: string): string {
  return id.replace(/-/g, "_");
}

/** Convert pvpoke `speciesId` to our kebab-case id */
export function pvpokeIdToOurs(speciesId: string): string {
  return speciesId.replace(/_/g, "-");
}
