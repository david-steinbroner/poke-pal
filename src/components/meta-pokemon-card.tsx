import type { MetaPokemon } from "@/lib/types";

const TIER_COLORS: Record<string, string> = {
  S: "text-yellow-600 dark:text-yellow-400",
  A: "text-blue-600 dark:text-blue-400",
  B: "text-green-600 dark:text-green-400",
  C: "text-muted-foreground",
};

export function MetaPokemonCard({ pokemon }: { pokemon: MetaPokemon }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span
        className={`text-sm font-bold ${TIER_COLORS[pokemon.tier] ?? "text-muted-foreground"}`}
      >
        {pokemon.tier}
      </span>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm capitalize">
          {pokemon.pokemonId.replace(/-/g, " ")}
        </span>
        <div className="mt-1 text-xs text-muted-foreground">
          <span>{pokemon.recommendedFast}</span>
          <span className="mx-1">|</span>
          <span>{pokemon.recommendedCharged.join(", ")}</span>
        </div>
      </div>
    </div>
  );
}
