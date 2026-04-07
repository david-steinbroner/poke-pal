import type { CounterRecommendation, PokemonType } from "./types";
import { getSuperEffectiveTypes } from "./type-effectiveness";
import { buildTypeSearchString } from "./search-string";
import pokemonData from "@/data/pokemon.json";
import budgetPicks from "@/data/budget-picks.json";

type CounterResult = {
  topCounters: CounterRecommendation[];
  budgetCounters: CounterRecommendation[];
  searchString: string;
  shadowSearchString: string;
  superEffectiveTypes: PokemonType[];
};

/** Find the best counters for a given Pokemon by ID */
export function getCountersFor(pokemonId: string): CounterResult {
  const target = pokemonData.find((p) => p.id === pokemonId);
  if (!target) {
    return {
      topCounters: [],
      budgetCounters: [],
      searchString: "",
      shadowSearchString: "",
      superEffectiveTypes: [],
    };
  }

  const defenderTypes = target.types as PokemonType[];
  const superEffective = getSuperEffectiveTypes(defenderTypes);
  const searchString = buildTypeSearchString(superEffective);

  // Find Pokemon with super-effective STAB moves
  const candidates = pokemonData
    .filter((p) => {
      const hasSeMove =
        p.fastMoves.some((m) =>
          superEffective.includes(m.type as PokemonType),
        ) ||
        p.chargedMoves.some((m) =>
          superEffective.includes(m.type as PokemonType),
        );
      return hasSeMove && p.id !== pokemonId;
    })
    .map((p) => {
      // Score: prefer Pokemon whose own types match super-effective types (STAB)
      const bestFast = p.fastMoves
        .filter((m) => superEffective.includes(m.type as PokemonType))
        .sort((a, b) => b.pvpPower - a.pvpPower)[0];
      const bestCharged = p.chargedMoves
        .filter((m) => superEffective.includes(m.type as PokemonType))
        .sort((a, b) => b.pvpPower - a.pvpPower)
        .slice(0, 2);

      const fast = bestFast ?? p.fastMoves[0];
      const charged =
        bestCharged.length > 0 ? bestCharged : p.chargedMoves.slice(0, 1);

      return {
        pokemon: p.id,
        fastMove: fast?.name ?? "Unknown",
        chargedMoves: charged.map((m) => m.name),
        score: p.baseStats.atk,
        isBudget: budgetPicks.includes(p.id),
      };
    })
    .sort((a, b) => b.score - a.score);

  const topCounters: CounterRecommendation[] = candidates
    .slice(0, 5)
    .map(({ score, isBudget, ...rest }) => ({ ...rest, tier: "top" as const }));

  const budgetCounters: CounterRecommendation[] = candidates
    .filter((c) => c.isBudget)
    .slice(0, 5)
    .map(({ score, isBudget, ...rest }) => ({
      ...rest,
      tier: "budget" as const,
    }));

  return {
    topCounters,
    budgetCounters,
    searchString,
    shadowSearchString: searchString ? `shadow&${searchString}` : "",
    superEffectiveTypes: superEffective,
  };
}

/** Get all Pokemon IDs that have data (for generateStaticParams) */
export function getAllPokemonIds(): string[] {
  return pokemonData.map((p) => p.id);
}
