import { Plus, Check } from "lucide-react";
import type { MetaPokemon } from "@/lib/types";

const TIER_COLORS: Record<string, string> = {
  S: "text-yellow-600 dark:text-yellow-400",
  A: "text-blue-600 dark:text-blue-400",
  B: "text-green-600 dark:text-green-400",
  C: "text-muted-foreground",
};

export function MetaPokemonCard({
  pokemon,
  onAdd,
  isOnTeam,
}: {
  pokemon: MetaPokemon;
  onAdd?: () => void;
  isOnTeam?: boolean;
}) {
  const displayName = pokemon.pokemonId.replace(/-/g, " ");

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span
        className={`shrink-0 text-sm font-bold ${TIER_COLORS[pokemon.tier] ?? "text-muted-foreground"}`}
      >
        {pokemon.tier}
      </span>
      <div className="flex-1 min-w-0">
        <span className="block truncate font-medium text-sm capitalize">
          {displayName}
        </span>
        <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
          <span>{pokemon.recommendedFast}</span>
          <span className="mx-1">|</span>
          <span>{pokemon.recommendedCharged.join(", ")}</span>
        </div>
      </div>
      {onAdd && (
        <button
          onClick={isOnTeam ? undefined : onAdd}
          className={`shrink-0 flex items-center justify-center min-h-11 min-w-11 rounded-lg transition-colors ${
            isOnTeam
              ? "text-green-600 dark:text-green-400 pointer-events-none"
              : "text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95"
          }`}
          style={{ touchAction: "manipulation" }}
          aria-disabled={isOnTeam}
          aria-label={
            isOnTeam
              ? `${displayName} added to team`
              : `Add ${displayName} to team`
          }
        >
          {isOnTeam ? (
            <Check className="h-5 w-5" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
}
