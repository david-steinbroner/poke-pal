import type { CounterRecommendation } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  Normal: "bg-stone-400",
  Fire: "bg-orange-500",
  Water: "bg-blue-500",
  Electric: "bg-yellow-400",
  Grass: "bg-green-500",
  Ice: "bg-cyan-300",
  Fighting: "bg-red-700",
  Poison: "bg-purple-500",
  Ground: "bg-amber-600",
  Flying: "bg-indigo-300",
  Psychic: "bg-pink-500",
  Bug: "bg-lime-500",
  Rock: "bg-amber-700",
  Ghost: "bg-purple-700",
  Dragon: "bg-indigo-600",
  Dark: "bg-stone-700",
  Steel: "bg-slate-400",
  Fairy: "bg-pink-300",
};

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
              <span
                key={t}
                className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${TYPE_COLORS[t] ?? "bg-gray-500"}`}
              >
                {t}
              </span>
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
