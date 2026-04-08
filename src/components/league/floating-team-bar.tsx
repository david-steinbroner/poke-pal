"use client";

import { useState, useCallback, useMemo } from "react";
import { X, Copy, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import {
  buildNameSearchString,
  buildLeagueEligibleString,
} from "@/lib/search-string";
import { analyzeTeam, getPokemonById } from "@/lib/team-analysis";
import type { LeagueId } from "@/lib/team-types";
import type { PokemonType } from "@/lib/types";
import pokemonData from "@/data/pokemon.json";

type FloatingTeamBarProps = {
  team: string[];
  leagueId: string;
  cpCap: number;
  onRemove: (pokemonId: string) => void;
  onAdd: (pokemonId: string) => void;
};

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

export function FloatingTeamBar({
  team,
  leagueId,
  cpCap,
  onRemove,
  onAdd,
}: FloatingTeamBarProps) {
  const [copied, setCopied] = useState(false);

  // Build search string
  const names = team.map(getPokemonName);
  const nameStr = buildNameSearchString(names);
  const searchString =
    cpCap >= 9999 ? nameStr : `${nameStr}&${buildLeagueEligibleString(cpCap)}`;

  // Run team analysis for suggestions + coverage score
  const analysis = useMemo(() => {
    const slots = [
      team[0] ? pokemonToSlot(team[0]) : null,
      team[1] ? pokemonToSlot(team[1]) : null,
      team[2] ? pokemonToSlot(team[2]) : null,
    ] as const;
    return analyzeTeam([...slots], leagueId as LeagueId);
  }, [team, leagueId]);

  const analyzeHref = `/teams?l=${leagueId}&p=${team.join(",")}`;
  const isFull = team.length >= 3;

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(searchString);
    if (success) {
      setCopied(true);
      if (navigator.vibrate) navigator.vibrate(50);
      toast("Copied! Paste in Pokemon GO");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast("Long-press the text to copy manually");
    }
  }, [searchString]);

  const isVisible = team.length > 0;

  // Top 3 suggestions, excluding Pokemon already on team
  const suggestions = analysis.suggestions
    .filter((s) => !team.includes(s.pokemonId))
    .slice(0, 3);

  return (
    <div
      role="region"
      aria-label="Team builder"
      aria-live="polite"
      className={`fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm px-4 pt-3 pb-[max(env(safe-area-inset-bottom,8px),8px)] transition-transform duration-300 motion-reduce:transition-none ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto max-w-lg space-y-2">
        {/* Line 1: Team slots + Copy */}
        <div className="flex items-center gap-2">
          {/* Team chips */}
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            {team.map((pokemonId) => (
              <span
                key={pokemonId}
                className="inline-flex items-center gap-1 rounded-full border bg-card px-2.5 py-1 text-xs font-medium"
              >
                {getPokemonName(pokemonId)}
                <button
                  onClick={() => onRemove(pokemonId)}
                  className="inline-flex items-center justify-center min-h-[44px] min-w-[24px] -my-2 -mr-1 text-muted-foreground hover:text-foreground"
                  style={{ touchAction: "manipulation" }}
                  aria-label={`Remove ${getPokemonName(pokemonId)}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {/* Empty slots */}
            {Array.from({ length: 3 - team.length }).map((_, i) => (
              <span
                key={`empty-${i}`}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-dashed text-muted-foreground"
              >
                <span className="text-xs">{team.length + i + 1}</span>
              </span>
            ))}
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-all active:scale-95 ${
              copied
                ? "bg-secondary text-secondary-foreground"
                : "bg-primary text-primary-foreground"
            }`}
            style={{ touchAction: "manipulation" }}
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Line 2: Suggestions (when not full) or Score + Team link (when full) */}
        {!isFull && suggestions.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="shrink-0 text-xs text-muted-foreground">
              Try:
            </span>
            {suggestions.map((s) => (
              <button
                key={s.pokemonId}
                onClick={() => onAdd(s.pokemonId)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent active:bg-accent active:scale-95"
                style={{ touchAction: "manipulation" }}
              >
                <Plus className="h-3 w-3" />
                {getPokemonName(s.pokemonId)}
              </button>
            ))}
            <span className="shrink-0 text-xs text-muted-foreground ml-auto">
              {analysis.coverageScore}/18
            </span>
          </div>
        )}

        {isFull && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">
              {analysis.coverageScore}/18 types covered
            </span>
            <Link
              href={analyzeHref}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-primary hover:underline"
              style={{ touchAction: "manipulation" }}
            >
              Team
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
