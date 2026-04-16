import { POKEMON_TYPES, type PokemonType, type Pokemon } from "./types";
import { getEffectiveness } from "./type-effectiveness";
import { analyzeTeam, assignRoles, getPokemonById, getLeagueInfo } from "./team-analysis";
import { calculateTeamRating, type TeamRating } from "./team-rating";
import { pokemonToSlot } from "./pokemon-utils";
import { buildNameSearchString, buildLeagueEligibleString } from "./search-string";
import type { RoleAssignment, TeamSlot } from "./team-types";
import type { LeagueId } from "@/data/leagues";

// --- Types ---

export type StrategyTip = {
  role: "lead" | "safe-swap" | "closer";
  pokemonId: string;
  pokemonName: string;
  tip: string;
};

export type RecommendedTeam = {
  pokemonIds: [string, string, string];
  rating: TeamRating;
  score: number;
  coverageScore: number;
  roles: RoleAssignment[];
  searchString: string;
  tips: StrategyTip[];
};

// --- Constants ---

const TIER_SCORES: Record<string, number> = { S: 4, A: 3, B: 2, C: 1 };

/** Fast moves known for high energy generation */
const FAST_ENERGY_MOVES = new Set([
  "Mud Shot",
  "Lock-On",
  "Shadow Claw",
  "Psycho Cut",
  "Vine Whip",
  "Powder Snow",
  "Thunder Shock",
  "Water Gun",
]);

// --- Helpers ---

/**
 * Get the recommended moveset for a Pokemon in a given league.
 * Falls back to first available fast/charged moves from the pokemon data.
 */
function getRecommendedMoves(
  pokemon: Pokemon,
  leagueId: LeagueId,
): { fast: string; charged: string[] } {
  const league = getLeagueInfo(leagueId);
  const metaEntry = league.meta.find((m) => m.pokemonId === pokemon.id);

  if (metaEntry) {
    return {
      fast: metaEntry.recommendedFast,
      charged: metaEntry.recommendedCharged,
    };
  }

  // Fallback: first fast move, first two charged moves
  return {
    fast: pokemon.fastMoves[0]?.name ?? "Unknown",
    charged: pokemon.chargedMoves.slice(0, 2).map((m) => m.name),
  };
}

/**
 * Build a search string for a trio of Pokemon IDs + league CP cap.
 */
function buildTeamSearchString(ids: string[], leagueId: LeagueId): string {
  const names = ids
    .map((id) => getPokemonById(id))
    .filter((p): p is Pokemon => p !== null)
    .map((p) => p.name);

  if (names.length === 0) return "";

  const nameStr = buildNameSearchString(names);
  const league = getLeagueInfo(leagueId);
  if (league.cpCap >= 9999) return nameStr;
  return `${nameStr}&${buildLeagueEligibleString(league.cpCap)}`;
}

/**
 * Generate all unique 3-element combinations from an array (indices).
 */
function* combinations<T>(arr: T[], k: number): Generator<T[]> {
  if (k === 0) {
    yield [];
    return;
  }
  for (let i = 0; i <= arr.length - k; i++) {
    for (const rest of combinations(arr.slice(i + 1), k - 1)) {
      yield [arr[i]!, ...rest];
    }
  }
}

// --- Fast pass scorer ---

type FastScoreResult = {
  ids: [string, string, string];
  score: number;
  coverageCount: number;
};

/**
 * Lightweight scorer for a single combo of 3 Pokemon.
 * Evaluates offensive coverage, shared weakness penalty, tier bonus, and bulk.
 */
function fastScore(
  trio: Pokemon[],
  leagueId: LeagueId,
): FastScoreResult {
  const league = getLeagueInfo(leagueId);
  const metaMap = new Map(league.meta.map((m) => [m.pokemonId, m.tier]));

  // Offensive coverage: count how many of 18 types at least one member hits SE
  let coverageCount = 0;
  for (const defType of POKEMON_TYPES) {
    let covered = false;
    for (const pokemon of trio) {
      const allMoves = [...pokemon.fastMoves, ...pokemon.chargedMoves];
      for (const move of allMoves) {
        if (getEffectiveness(move.type as PokemonType, [defType]) > 1.0) {
          covered = true;
          break;
        }
      }
      if (covered) break;
    }
    if (covered) coverageCount++;
  }

  // Shared weakness penalty: for each attack type, count team members hit SE
  let sharedWeaknesses = 0;
  for (const atkType of POKEMON_TYPES) {
    let hitCount = 0;
    for (const pokemon of trio) {
      const eff = getEffectiveness(atkType, pokemon.types as PokemonType[]);
      if (eff > 1.0) hitCount++;
    }
    if (hitCount >= 2) sharedWeaknesses++;
  }

  // Tier bonus: sum tier scores for each member
  let tierScore = 0;
  for (const pokemon of trio) {
    const tier = metaMap.get(pokemon.id);
    tierScore += TIER_SCORES[tier ?? ""] ?? 0;
  }

  // Bulk score: average stat product (DEF * STA) normalized
  // Penalizes glass cannons like Mewtwo (high ATK, low DEF/STA)
  // Rewards bulky Pokemon like Snorlax, Venusaur
  let bulkScore = 0;
  for (const pokemon of trio) {
    const { def, sta } = pokemon.baseStats;
    // DEF * STA gives a bulk metric; normalize to 0-1 range
    // Typical range: 10000 (glass) to 50000 (tank)
    const bulk = def * sta;
    bulkScore += Math.min(bulk / 40000, 1);
  }
  bulkScore = bulkScore / 3; // average, 0-1

  const score =
    (coverageCount / 18) * 0.4 +
    bulkScore * 0.25 +
    (tierScore / (3 * 4)) * 0.15 -
    sharedWeaknesses * 0.15;

  return {
    ids: [trio[0]!.id, trio[1]!.id, trio[2]!.id],
    score,
    coverageCount,
  };
}

// --- Strategy tip generation ---

/**
 * Generates template-based tactical advice for each role assignment.
 */
export function generateStrategyTips(
  roles: RoleAssignment[],
  leagueId: LeagueId,
): StrategyTip[] {
  const tips: StrategyTip[] = [];
  if (roles.length === 0) return tips;

  // Build a map of pokemonId -> role for cross-referencing
  // Build a map of pokemonId -> role for cross-referencing

  // Find the lead assignment for safe-swap tips
  const leadRole = roles.find((r) => r.role === "lead");

  for (const role of roles) {
    const pokemon = getPokemonById(role.pokemonId);
    if (!pokemon) continue;

    const moves = getRecommendedMoves(pokemon, leagueId);
    const chargedMoves = pokemon.chargedMoves;

    // Find the recommended charged moves with their energy costs
    const recommendedCharged = moves.charged
      .map((name) => {
        const move = chargedMoves.find((m) => m.name === name);
        return move ? { name: move.name, energy: move.pvpEnergy } : null;
      })
      .filter((m): m is { name: string; energy: number } => m !== null);

    // Sort by energy cost for cheap/expensive classification
    const sorted = [...recommendedCharged].sort((a, b) => a.energy - b.energy);
    const cheapest = sorted[0];
    const mostExpensive = sorted[sorted.length - 1];

    const tip = generateTipForRole(
      role.role,
      pokemon,
      moves.fast,
      sorted,
      cheapest,
      mostExpensive,
      leadRole,
      roles,
      leagueId,
    );

    tips.push({
      role: role.role,
      pokemonId: pokemon.id,
      pokemonName: pokemon.name,
      tip,
    });
  }

  return tips;
}

function generateTipForRole(
  role: "lead" | "safe-swap" | "closer",
  pokemon: Pokemon,
  fastMoveName: string,
  sortedCharged: { name: string; energy: number }[],
  cheapest: { name: string; energy: number } | undefined,
  mostExpensive: { name: string; energy: number } | undefined,
  leadRole: RoleAssignment | undefined,
  allRoles: RoleAssignment[],
  leagueId: LeagueId,
): string {
  switch (role) {
    case "lead":
      return generateLeadTip(pokemon, fastMoveName, sortedCharged, cheapest, mostExpensive);
    case "safe-swap":
      return generateSafeSwapTip(pokemon, fastMoveName, sortedCharged, leadRole, leagueId);
    case "closer":
      return generateCloserTip(pokemon, fastMoveName, sortedCharged, cheapest, mostExpensive, allRoles, leagueId);
  }
}

function generateLeadTip(
  pokemon: Pokemon,
  fastMoveName: string,
  sortedCharged: { name: string; energy: number }[],
  cheapest: { name: string; energy: number } | undefined,
  mostExpensive: { name: string; energy: number } | undefined,
): string {
  // Bait + nuke pattern: cheap (<=40) AND expensive (>=60)
  if (
    cheapest &&
    mostExpensive &&
    cheapest.name !== mostExpensive.name &&
    cheapest.energy <= 40 &&
    mostExpensive.energy >= 60
  ) {
    return `Use ${cheapest.name} to bait shields, then land ${mostExpensive.name}`;
  }

  // Fast energy lead
  if (FAST_ENERGY_MOVES.has(fastMoveName) && cheapest) {
    return `Fast energy with ${fastMoveName} — pressure shields early with ${cheapest.name}`;
  }

  // Fallback: moveset summary
  const chargedNames = sortedCharged.map((m) => m.name).join(", ");
  return `${fastMoveName} | ${chargedNames || "no charged moves"}`;
}

function generateSafeSwapTip(
  pokemon: Pokemon,
  fastMoveName: string,
  sortedCharged: { name: string; energy: number }[],
  leadRole: RoleAssignment | undefined,
  _leagueId: LeagueId,
): string {
  if (leadRole) {
    const leadPokemon = getPokemonById(leadRole.pokemonId);
    if (leadPokemon) {
      // Find types that hit the lead SE
      const leadWeakTypes = POKEMON_TYPES.filter(
        (t) => getEffectiveness(t, leadPokemon.types as PokemonType[]) > 1.0,
      );

      // Check which of those this Pokemon resists
      const resistedTypes = leadWeakTypes.filter(
        (t) => getEffectiveness(t, pokemon.types as PokemonType[]) < 1.0,
      );

      if (resistedTypes.length > 0) {
        return `Swap to ${pokemon.name} against ${resistedTypes.join(", ")} — resists what threatens ${leadPokemon.name}`;
      }
    }
  }

  // Fallback
  const chargedNames = sortedCharged.map((m) => m.name).join(", ");
  const moveset = `${fastMoveName} | ${chargedNames || "no charged moves"}`;
  return `Switch to ${pokemon.name} to draw out counters. ${moveset}`;
}

function generateCloserTip(
  pokemon: Pokemon,
  fastMoveName: string,
  sortedCharged: { name: string; energy: number }[],
  cheapest: { name: string; energy: number } | undefined,
  mostExpensive: { name: string; energy: number } | undefined,
  allRoles: RoleAssignment[],
  _leagueId: LeagueId,
): string {
  // Nuke move pattern (>=60 energy)
  const nuke = sortedCharged.find((m) => m.energy >= 60);
  if (nuke) {
    return `Farm energy, then close with ${nuke.name}`;
  }

  // Unique coverage: types this closer hits SE that the other 2 can't
  const otherIds = allRoles
    .filter((r) => r.pokemonId !== pokemon.id)
    .map((r) => r.pokemonId);
  const otherPokemon = otherIds
    .map((id) => getPokemonById(id))
    .filter((p): p is Pokemon => p !== null);

  const closerMoveTypes = new Set<PokemonType>();
  for (const m of pokemon.fastMoves) closerMoveTypes.add(m.type as PokemonType);
  for (const m of pokemon.chargedMoves) closerMoveTypes.add(m.type as PokemonType);

  const uniqueCoverage: PokemonType[] = [];
  for (const defType of POKEMON_TYPES) {
    const closerHits = [...closerMoveTypes].some(
      (mt) => getEffectiveness(mt, [defType]) > 1.0,
    );
    if (!closerHits) continue;

    const othersHit = otherPokemon.some((p) => {
      const types = new Set<PokemonType>();
      for (const m of p.fastMoves) types.add(m.type as PokemonType);
      for (const m of p.chargedMoves) types.add(m.type as PokemonType);
      return [...types].some((mt) => getEffectiveness(mt, [defType]) > 1.0);
    });

    if (!othersHit) uniqueCoverage.push(defType);
  }

  if (uniqueCoverage.length > 0) {
    return `Covers ${uniqueCoverage.slice(0, 3).join(", ")} that the rest can't`;
  }

  // Fallback
  const chargedName = cheapest?.name ?? sortedCharged[0]?.name ?? "charged moves";
  return `Close games with ${chargedName}`;
}

// --- Main recommendation engine ---

/**
 * Two-pass scoring algorithm for team recommendations.
 *
 * Fast pass: lightweight scorer on ALL C(n,3) combos.
 * Full pass: detailed analysis on top results only.
 */
export function recommendTeams(
  poolIds: string[],
  leagueId: LeagueId,
  maxResults: number = 10,
): RecommendedTeam[] {
  // Resolve pool to valid Pokemon
  const league = getLeagueInfo(leagueId);
  const typeRestrictions = league.typeRestrictions as PokemonType[] | undefined;

  let pool = poolIds
    .map((id) => getPokemonById(id))
    .filter((p): p is Pokemon => p !== null);

  // Filter by league type restrictions (e.g. Fantasy Cup: Dragon/Steel/Fairy only)
  if (typeRestrictions && typeRestrictions.length > 0) {
    pool = pool.filter((p) =>
      p.types.some((t) => typeRestrictions.includes(t as PokemonType)),
    );
  }

  // Need at least 3 Pokemon to form a team
  if (pool.length < 3) return [];

  // --- Fast pass: score all C(n,3) combos ---
  const scored: FastScoreResult[] = [];
  for (const trio of combinations(pool, 3)) {
    scored.push(fastScore(trio, leagueId));
  }

  // Sort by score descending, keep top maxResults
  scored.sort((a, b) => b.score - a.score);
  const topCombos = scored.slice(0, maxResults);

  // --- Full pass: detailed analysis on top results ---
  const results: RecommendedTeam[] = [];

  for (const combo of topCombos) {
    const slots: TeamSlot[] = combo.ids.map((id) => pokemonToSlot(id));
    const analysis = analyzeTeam(slots, leagueId);
    const rating = calculateTeamRating(
      combo.ids,
      leagueId,
      analysis.offensiveCoverage,
      analysis.defensiveWeaknesses,
      analysis.threats,
    );
    const roles = assignRoles(slots, leagueId);
    const tips = generateStrategyTips(roles, leagueId);
    const searchString = buildTeamSearchString(combo.ids, leagueId);

    results.push({
      pokemonIds: combo.ids,
      rating,
      score: combo.score,
      coverageScore: analysis.coverageScore,
      roles,
      searchString,
      tips,
    });
  }

  return results;
}
