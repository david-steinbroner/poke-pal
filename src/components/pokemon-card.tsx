import type { CounterRecommendation } from "@/lib/types";
import { TypeBadge } from "@/components/type-badge";

export function PokemonCard({
  counter,
  pokemonTypes,
}: {
  counter: CounterRecommendation;
  pokemonTypes?: string[];
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm capitalize">
            {counter.pokemon.replace(/-/g, " ")}
          </span>
          {counter.tier === "budget" && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
              Budget
            </span>
          )}
        </div>
        {pokemonTypes && (
          <div className="mt-1 flex gap-1">
            {pokemonTypes.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        )}
        <div className="mt-1.5 text-xs text-muted-foreground">
          <span>{counter.fastMove}</span>
          <span className="mx-1">|</span>
          <span>{counter.chargedMoves.join(", ")}</span>
        </div>
      </div>
    </div>
  );
}
