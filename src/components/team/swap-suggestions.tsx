"use client";

import type { PokemonType } from "@/lib/types";
import { TypeBadge } from "@/components/type-badge";

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
                <TypeBadge key={t} type={t} />
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
