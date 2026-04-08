"use client";

import type { PokemonType } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  Normal: "bg-stone-400",
  Fire: "bg-orange-500",
  Water: "bg-blue-500",
  Electric: "bg-yellow-400",
  Grass: "bg-green-500",
  Ice: "bg-cyan-500",
  Fighting: "bg-red-700",
  Poison: "bg-purple-500",
  Ground: "bg-amber-600",
  Flying: "bg-indigo-400",
  Psychic: "bg-pink-500",
  Bug: "bg-lime-500",
  Rock: "bg-amber-700",
  Ghost: "bg-purple-700",
  Dragon: "bg-indigo-600",
  Dark: "bg-stone-700",
  Steel: "bg-slate-400",
  Fairy: "bg-pink-400",
};

type SwapSuggestion = {
  pokemonId: string;
  name: string;
  types: PokemonType[];
  reason: string;
  gapsCovered: number;
};

export function SwapSuggestions({
  suggestions,
  onSelect,
}: {
  suggestions: SwapSuggestion[];
  onSelect: (pokemonId: string) => void;
}) {
  if (suggestions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Your team looks solid. No swaps suggested.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.pokemonId}
          onClick={() => onSelect(suggestion.pokemonId)}
          className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 active:scale-[0.98]"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm capitalize">
                {suggestion.name}
              </span>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                +{suggestion.gapsCovered} gaps
              </span>
            </div>
            <div className="mt-1 flex gap-1">
              {suggestion.types.map((t) => (
                <span
                  key={t}
                  className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${TYPE_COLORS[t] ?? "bg-gray-500"}`}
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {suggestion.reason}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
