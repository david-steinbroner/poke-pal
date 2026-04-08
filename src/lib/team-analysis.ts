import { POKEMON_TYPES, type PokemonType, type Pokemon } from "./types";
import { getEffectiveness } from "./type-effectiveness";
import { buildNameSearchString, buildLeagueEligibleString } from "./search-string";
import type {
  TeamSlot,
  TeamAnalysis,
  TypeCoverage,
  TeamThreat,
  SwapSuggestion,
  LeagueId,
  RoleAssignment,
  TeamRole,
} from "./team-types";
import pokemonData from "@/data/pokemon.json";
import greatLeague from "@/data/leagues/great-league.json";
import ultraLeague from "@/data/leagues/ultra-league.json";
import masterLeague from "@/data/leagues/master-league.json";
import fantasyCup from "@/data/leagues/fantasy-cup.json";

// Cast JSON imports to proper League shape
const LEAGUES = {
  "great-league": greatLeague,
  "ultra-league": ultraLeague,
  "master-league": masterLeague,
  "fantasy-cup": fantasyCup,
} as const;

/**
 * Returns league metadata: name, cpCap, meta list, and optional type restrictions.
 */
export function getLeagueInfo(id: LeagueId) {
  const league = LEAGUES[id];
  return {
    name: league.name,
    cpCap: league.cpCap,
    meta: league.meta,
    typeRestrictions: "typeRestrictions" in league
      ? (league as typeof fantasyCup).typeRestrictions as PokemonType[]
      : undefined,
  };
}

/**
 * Finds a Pokemon by ID from the full pokemon dataset.
 */
export function getPokemonById(id: string): Pokemon | null {
  const found = (pokemonData as Pokemon[]).find((p) => p.id === id);
  return found ?? null;
}

/**
 * Collects all unique move types from a team member's fast and charged moves.
 */
function getMoveTypes(slot: NonNullable<TeamSlot>): PokemonType[] {
  const types = new Set<PokemonType>();
  for (const m of slot.fastMoves) types.add(m.type);
  for (const m of slot.chargedMoves) types.add(m.type);
  return [...types];
}

/**
 * Computes offensive coverage: for each of 18 defender types,
 * what's the best effectiveness any team member's move achieves.
 */
function computeOffensiveCoverage(
  members: NonNullable<TeamSlot>[],
): TypeCoverage[] {
  return POKEMON_TYPES.map((defenderType) => {
    let bestMultiplier = 0;
    const coveredBy: string[] = [];

    for (const member of members) {
      const allMoves = [...member.fastMoves, ...member.chargedMoves];
      let memberBest = 0;

      for (const move of allMoves) {
        // Effectiveness of a single move type against a single defender type
        const eff = getEffectiveness(move.type, [defenderType]);
        if (eff > memberBest) memberBest = eff;
      }

      if (memberBest > 1.0 && !coveredBy.includes(member.name)) {
        coveredBy.push(member.name);
      }
      if (memberBest > bestMultiplier) bestMultiplier = memberBest;
    }

    return {
      type: defenderType,
      multiplier: bestMultiplier,
      coveredBy,
    };
  });
}

/**
 * Computes defensive weaknesses: types that hit 2+ team members super effectively.
 */
function computeDefensiveWeaknesses(
  members: NonNullable<TeamSlot>[],
): TypeCoverage[] {
  const weaknesses: TypeCoverage[] = [];

  for (const attackType of POKEMON_TYPES) {
    const weakMembers: string[] = [];

    for (const member of members) {
      const eff = getEffectiveness(attackType, member.types);
      if (eff > 1.0) {
        weakMembers.push(member.name);
      }
    }

    // Only report if 2+ members share this weakness
    if (weakMembers.length >= 2) {
      weaknesses.push({
        type: attackType,
        multiplier: getEffectiveness(attackType, members[0]!.types), // representative
        coveredBy: weakMembers,
      });
    }
  }

  // Sort by number of weak members descending
  return weaknesses.sort((a, b) => b.coveredBy.length - a.coveredBy.length);
}

/**
 * Detects meta threats: Pokemon whose move types hit 2+ team members SE.
 */
function detectThreats(
  members: NonNullable<TeamSlot>[],
  leagueId: LeagueId,
): TeamThreat[] {
  const league = getLeagueInfo(leagueId);
  const threats: TeamThreat[] = [];

  for (const metaMon of league.meta) {
    const pokemon = getPokemonById(metaMon.pokemonId);
    if (!pokemon) continue;

    // Gather all move types this meta Pokemon has
    const moveTypes = new Set<PokemonType>();
    for (const m of pokemon.fastMoves) moveTypes.add(m.type);
    for (const m of pokemon.chargedMoves) moveTypes.add(m.type);

    // For each move type, check how many team members it hits SE
    const threatTypes: PokemonType[] = [];
    const threatenedSet = new Set<string>();

    for (const moveType of moveTypes) {
      const hitMembers: string[] = [];
      for (const member of members) {
        const eff = getEffectiveness(moveType, member.types);
        if (eff > 1.0) hitMembers.push(member.name);
      }
      if (hitMembers.length >= 2) {
        threatTypes.push(moveType);
        for (const name of hitMembers) threatenedSet.add(name);
      }
    }

    if (threatTypes.length > 0) {
      threats.push({
        pokemonId: metaMon.pokemonId,
        name: pokemon.name,
        threatTypes,
        threatenedMembers: [...threatenedSet],
      });
    }
  }

  return threats;
}

/**
 * Suggests swaps from the meta that cover offensive gaps.
 */
function suggestSwaps(
  members: NonNullable<TeamSlot>[],
  offensiveCoverage: TypeCoverage[],
  leagueId: LeagueId,
): SwapSuggestion[] {
  // Find uncovered types (multiplier <= 1.0)
  const gaps = offensiveCoverage
    .filter((c) => c.multiplier <= 1.0)
    .map((c) => c.type);

  if (gaps.length === 0) return [];

  const league = getLeagueInfo(leagueId);
  const teamIds = new Set(members.map((m) => m.pokemonId));
  const suggestions: SwapSuggestion[] = [];

  for (const metaMon of league.meta) {
    // Skip Pokemon already on the team
    if (teamIds.has(metaMon.pokemonId)) continue;

    const pokemon = getPokemonById(metaMon.pokemonId);
    if (!pokemon) continue;

    // Check which gaps this Pokemon's moves cover
    const moveTypes = new Set<PokemonType>();
    for (const m of pokemon.fastMoves) moveTypes.add(m.type);
    for (const m of pokemon.chargedMoves) moveTypes.add(m.type);

    const covered: PokemonType[] = [];
    for (const gap of gaps) {
      for (const moveType of moveTypes) {
        const eff = getEffectiveness(moveType, [gap]);
        if (eff > 1.0) {
          covered.push(gap);
          break;
        }
      }
    }

    if (covered.length > 0) {
      suggestions.push({
        pokemonId: pokemon.id,
        name: pokemon.name,
        types: pokemon.types,
        reason: `Covers ${covered.join(", ")} gaps`,
        gapsCovered: covered.length,
      });
    }
  }

  // Sort by gaps covered descending, return top 5
  return suggestions
    .sort((a, b) => b.gapsCovered - a.gapsCovered)
    .slice(0, 5);
}

/**
 * Builds the search string for the team: name filter + CP cap.
 * For Master League (cpCap 9999), skip the CP filter.
 */
function buildSearchString(
  members: NonNullable<TeamSlot>[],
  leagueId: LeagueId,
): string {
  if (members.length === 0) return "";

  const names = members.map((m) => m.name);
  const nameStr = buildNameSearchString(names);
  const league = getLeagueInfo(leagueId);

  // Master League has no meaningful CP cap
  if (league.cpCap >= 9999) return nameStr;

  const cpStr = buildLeagueEligibleString(league.cpCap);
  return `${nameStr}&${cpStr}`;
}

/**
 * Main analysis function: takes a team of up to 3 slots and a league,
 * returns full offensive/defensive analysis with threats and suggestions.
 */
export function analyzeTeam(
  team: TeamSlot[],
  leagueId: LeagueId,
): TeamAnalysis {
  // Filter out null slots
  const members = team.filter((s): s is NonNullable<TeamSlot> => s !== null);

  // Empty team returns zeroed-out analysis
  if (members.length === 0) {
    return {
      offensiveCoverage: POKEMON_TYPES.map((type) => ({
        type,
        multiplier: 0,
        coveredBy: [],
      })),
      defensiveWeaknesses: [],
      threats: [],
      suggestions: [],
      searchString: "",
      coverageScore: 0,
    };
  }

  const offensiveCoverage = computeOffensiveCoverage(members);
  const defensiveWeaknesses = computeDefensiveWeaknesses(members);
  const threats = detectThreats(members, leagueId);
  const suggestions = suggestSwaps(members, offensiveCoverage, leagueId);
  const searchString = buildSearchString(members, leagueId);
  const coverageScore = offensiveCoverage.filter((c) => c.multiplier > 1.0).length;

  return {
    offensiveCoverage,
    defensiveWeaknesses,
    threats,
    suggestions,
    searchString,
    coverageScore,
  };
}

/**
 * Scores how many of the league's meta Pokemon a team member can hit
 * super-effectively with its moves.
 */
function scoreMetaCoverage(
  slot: NonNullable<TeamSlot>,
  leagueId: LeagueId,
): { score: number; names: string[] } {
  const league = getLeagueInfo(leagueId);
  const moveTypes = getMoveTypes(slot);
  const hitNames: string[] = [];

  for (const metaMon of league.meta) {
    const pokemon = getPokemonById(metaMon.pokemonId);
    if (!pokemon) continue;
    // Check if any move type is SE against this meta Pokemon
    for (const moveType of moveTypes) {
      const eff = getEffectiveness(moveType, pokemon.types as PokemonType[]);
      if (eff > 1.0) {
        hitNames.push(pokemon.name);
        break;
      }
    }
  }

  return { score: hitNames.length, names: hitNames };
}

/**
 * Scores how well a Pokemon covers another's weaknesses.
 * Returns the count of the target's weakness types that this Pokemon resists.
 */
function scoreWeaknessCoverage(
  slot: NonNullable<TeamSlot>,
  weaknessTypes: PokemonType[],
): { score: number; coveredTypes: PokemonType[] } {
  const covered: PokemonType[] = [];
  for (const wType of weaknessTypes) {
    const eff = getEffectiveness(wType, slot.types);
    if (eff < 1.0) {
      covered.push(wType);
    }
  }
  return { score: covered.length, coveredTypes: covered };
}

/**
 * Assigns lead / safe-swap / closer roles to each team member.
 *
 * - Lead: covers the widest range of meta threats (most SE hits on meta Pokemon).
 * - Safe swap: best covers the lead's defensive weaknesses.
 * - Closer: the remaining Pokemon, rounds out team coverage.
 *
 * When team has < 3 Pokemon: 1 = lead only, 2 = lead + safe-swap.
 */
export function assignRoles(
  team: TeamSlot[],
  leagueId: LeagueId,
): RoleAssignment[] {
  const members = team.filter(
    (s): s is NonNullable<TeamSlot> => s !== null,
  );

  if (members.length === 0) return [];

  // Score each member by meta coverage for lead selection
  const metaScores = members.map((m) => ({
    slot: m,
    ...scoreMetaCoverage(m, leagueId),
  }));

  // Pick lead: highest meta coverage score
  metaScores.sort((a, b) => b.score - a.score);
  const lead = metaScores[0]!;

  const assignments: RoleAssignment[] = [
    {
      pokemonId: lead.slot.pokemonId,
      role: "lead" as TeamRole,
      reasoning:
        lead.score > 0
          ? `Covers ${lead.score} meta threat${lead.score !== 1 ? "s" : ""}`
          : "Best available lead",
    },
  ];

  if (members.length === 1) return assignments;

  // Find lead's weaknesses (types that hit lead SE)
  const leadWeaknesses = POKEMON_TYPES.filter(
    (t) => getEffectiveness(t, lead.slot.types) > 1.0,
  );

  // Score remaining members by how well they cover lead's weaknesses
  const remaining = members.filter(
    (m) => m.pokemonId !== lead.slot.pokemonId,
  );

  const swapScores = remaining.map((m) => ({
    slot: m,
    ...scoreWeaknessCoverage(m, leadWeaknesses),
  }));

  swapScores.sort((a, b) => b.score - a.score);
  const safeSwap = swapScores[0]!;

  assignments.push({
    pokemonId: safeSwap.slot.pokemonId,
    role: "safe-swap" as TeamRole,
    reasoning:
      safeSwap.coveredTypes.length > 0
        ? `Covers ${lead.slot.name}'s weakness to ${safeSwap.coveredTypes.join(", ")}`
        : `Covers ${lead.slot.name}'s gaps`,
  });

  if (members.length === 2) return assignments;

  // Closer: the remaining Pokemon
  const closer = remaining.find(
    (m) => m.pokemonId !== safeSwap.slot.pokemonId,
  );
  if (closer) {
    // Figure out what types this closer uniquely covers
    const assignedIds = new Set([lead.slot.pokemonId, safeSwap.slot.pokemonId]);
    const otherMembers = members.filter((m) => assignedIds.has(m.pokemonId));
    const closerMoveTypes = getMoveTypes(closer);

    // Types that closer covers SE but the other two don't
    const uniqueCoverage: PokemonType[] = [];
    for (const defType of POKEMON_TYPES) {
      const closerHits = closerMoveTypes.some(
        (mt) => getEffectiveness(mt, [defType]) > 1.0,
      );
      if (!closerHits) continue;

      const othersHit = otherMembers.some((m) => {
        const mTypes = getMoveTypes(m);
        return mTypes.some((mt) => getEffectiveness(mt, [defType]) > 1.0);
      });

      if (!othersHit) uniqueCoverage.push(defType);
    }

    assignments.push({
      pokemonId: closer.pokemonId,
      role: "closer" as TeamRole,
      reasoning:
        uniqueCoverage.length > 0
          ? `Rounds out coverage for ${uniqueCoverage.slice(0, 3).join(", ")}`
          : "Rounds out team coverage",
    });
  }

  return assignments;
}
