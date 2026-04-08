"use client";

import { useMemo } from "react";
import { X, Plus } from "lucide-react";
import { analyzeTeam, getPokemonById } from "@/lib/team-analysis";
import {
  buildNameSearchString,
  buildLeagueEligibleString,
} from "@/lib/search-string";
import { CopyBar } from "@/components/copy-bar";
import type { LeagueId } from "@/lib/team-types";
import type { PokemonType } from "@/lib/types";
import pokemonData from "@/data/pokemon.json";

/* ---- Types ---- */
type InlineTeamSectionProps = {
  team: string[];
  leagueId: string;
  cpCap: number;
  onRemove: (pokemonId: string) => void;
  onAdd: (pokemonId: string) => void;
};

/* ---- Helpers ---- */
function getPokemonName(pokemonId: string): string {
  const pokemon = pokemonData.find((p) => p.id === pokemonId);
  return pokemon?.name ?? pokemonId;
}

function pokemonToSlot(id: string) {
  const p = getPokemonById(id);
  if (!p) return null;
  return {
    pokemonId: p.id,
    name: p.name,
    types: p.types as PokemonType[],
    fastMoves: p.fastMoves.map((m) => ({
      name: m.name,
      type: m.type as PokemonType,
    })),
    chargedMoves: p.chargedMoves.map((m) => ({
      name: m.name,
      type: m.type as PokemonType,
    })),
  };
}

/* ---- Component ---- */
export function InlineTeamSection({
  team,
  leagueId,
  cpCap,
  onRemove,
  onAdd,
}: InlineTeamSectionProps) {
  // Analyze team for coverage score and suggestions
  const analysis = useMemo(() => {
    const slots = [
      team[0] ? pokemonToSlot(team[0]) : null,
      team[1] ? pokemonToSlot(team[1]) : null,
      team[2] ? pokemonToSlot(team[2]) : null,
    ] as const;
    return analyzeTeam([...slots], leagueId as LeagueId);
  }, [team, leagueId]);

  // Build team search string
  const searchString = useMemo(() => {
    const names = team.map(getPokemonName);
    const nameStr = buildNameSearchString(names);
    if (cpCap >= 9999) return nameStr;
    return `${nameStr}&${buildLeagueEligibleString(cpCap)}`;
  }, [team, cpCap]);

  // Suggestions filtered to exclude current team members
  const suggestions = analysis.suggestions
    .filter((s) => !team.includes(s.pokemonId))
    .slice(0, 3);

  // Render nothing when team is empty
  if (team.length === 0) return null;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Your Team</span>
        <span className="text-sm font-medium text-muted-foreground">
          {analysis.coverageScore}/18
        </span>
      </div>

      {/* Team chips + empty slots */}
      <div className="flex flex-wrap gap-2">
        {team.map((pokemonId) => (
          <span
            key={pokemonId}
            className="inline-flex min-h-11 items-center gap-1 rounded-full border bg-card px-3 py-1.5 text-sm font-medium"
          >
            <span className="max-w-[120px] truncate">
              {getPokemonName(pokemonId)}
            </span>
            <button
              onClick={() => onRemove(pokemonId)}
              className="inline-flex items-center justify-center min-h-11 min-w-[20px] text-muted-foreground hover:text-foreground"
              style={{ touchAction: "manipulation" }}
              aria-label={`Remove ${getPokemonName(pokemonId)}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {Array.from({ length: 3 - team.length }).map((_, i) => (
          <span
            key={`empty-${i}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-dashed text-muted-foreground text-xs"
          >
            {team.length + i + 1}
          </span>
        ))}
      </div>

      {/* Suggestion chips (only when team < 3) */}
      {team.length < 3 && suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Try:</span>
          {suggestions.map((s) => (
            <button
              key={s.pokemonId}
              onClick={() => onAdd(s.pokemonId)}
              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium min-h-11 transition-colors hover:bg-accent active:bg-accent active:scale-95"
              style={{ touchAction: "manipulation" }}
            >
              <Plus className="h-3 w-3" />
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Copy bar with team search string */}
      <CopyBar searchString={searchString} />
    </div>
  );
}
