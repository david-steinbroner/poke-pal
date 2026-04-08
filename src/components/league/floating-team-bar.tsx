"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { X, Copy, ChevronUp, ChevronDown, Plus } from "lucide-react";
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

/* ─── Constants ─── */
const COLLAPSED_HEIGHT = 56; // px — enough for one row of chips + copy

/* ─── Types ─── */
type FloatingTeamBarProps = {
  team: string[];
  leagueId: string;
  cpCap: number;
  onRemove: (pokemonId: string) => void;
  onAdd: (pokemonId: string) => void;
};

/* ─── Helpers ─── */
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

/* ─── Component ─── */
export function FloatingTeamBar({
  team,
  leagueId,
  cpCap,
  onRemove,
  onAdd,
}: FloatingTeamBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Lock body scroll when expanded
  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [expanded]);

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

  // Collapse when team becomes empty
  useEffect(() => {
    if (team.length === 0) setExpanded(false);
  }, [team.length]);

  // The expanded height for the panel (collapsed row + expanded content).
  // We use max-height to animate open/close with overflow hidden.
  const EXPANDED_MAX_HEIGHT = "60vh";

  return (
    <div
      role="region"
      aria-label="Team builder"
      aria-live="polite"
      className="fixed left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm pointer-events-auto"
      style={{
        bottom: "calc(3rem + env(safe-area-inset-bottom, 0px))",
        // Animate max-height so the panel grows upward from its bottom edge.
        // The bottom is anchored above the nav; content is clipped by overflow.
        maxHeight: isVisible
          ? expanded
            ? EXPANDED_MAX_HEIGHT
            : `${COLLAPSED_HEIGHT}px`
          : "0px",
        overflow: "hidden",
        transition: "max-height 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Inner wrapper uses flex-column reversed so that the collapsed row
          stays pinned to the bottom (visually the top of the panel above nav)
          and expanded content appears above it, scrolling if needed. */}
      <div
        className="flex flex-col-reverse"
        style={{ maxHeight: EXPANDED_MAX_HEIGHT }}
      >
        {/* ── Collapsed row (always visible when panel is open) ── */}
        <div
          className="flex shrink-0 items-center gap-2 px-4"
          style={{ height: `${COLLAPSED_HEIGHT}px` }}
        >
          {/* Team chips + empty slots */}
          <div className="flex flex-1 flex-wrap items-center gap-1.5 overflow-hidden">
            {team.map((pokemonId) => (
              <span
                key={pokemonId}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border bg-card px-2.5 py-1 text-xs font-medium"
              >
                {getPokemonName(pokemonId)}
              </span>
            ))}
            {Array.from({ length: 3 - team.length }).map((_, i) => (
              <span
                key={`empty-${i}`}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed text-muted-foreground"
              >
                <span className="text-xs">{team.length + i + 1}</span>
              </span>
            ))}
          </div>

          {/* Coverage score */}
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            {analysis.coverageScore}/18
          </span>

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

          {/* Expand / collapse chevron */}
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="shrink-0 inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-foreground transition-colors"
            style={{ touchAction: "manipulation" }}
            aria-label={expanded ? "Collapse team panel" : "Expand team panel"}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* ── Expanded content (scrollable, above the collapsed row) ── */}
        <div
          aria-hidden={!expanded}
          className="overflow-y-auto overscroll-contain px-4 pb-2"
          style={{
            // Let this region shrink/scroll within the available space
            minHeight: 0,
          }}
        >
          <div className="mx-auto max-w-lg space-y-3">
            {/* Team slots with types and remove button */}
            <div className="space-y-2">
              {team.map((pokemonId) => {
                const slot = pokemonToSlot(pokemonId);
                return (
                  <div
                    key={pokemonId}
                    className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2"
                  >
                    <span className="text-sm font-medium">
                      {getPokemonName(pokemonId)}
                    </span>
                    {slot && (
                      <div className="flex gap-1">
                        {slot.types.map((t) => (
                          <span
                            key={t}
                            className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => onRemove(pokemonId)}
                      className="ml-auto inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-muted-foreground hover:text-foreground"
                      style={{ touchAction: "manipulation" }}
                      aria-label={`Remove ${getPokemonName(pokemonId)}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}

              {/* Empty slot placeholders */}
              {Array.from({ length: 3 - team.length }).map((_, i) => (
                <div
                  key={`empty-slot-${i}`}
                  className="flex items-center rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground"
                >
                  Slot {team.length + i + 1} — tap a Pokemon above to add
                </div>
              ))}
            </div>

            {/* Suggestion chips */}
            {!isFull && suggestions.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">
                  Try:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s.pokemonId}
                      onClick={() => onAdd(s.pokemonId)}
                      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent active:bg-accent active:scale-95"
                      style={{ touchAction: "manipulation" }}
                    >
                      <Plus className="h-3 w-3" />
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Full-width copy button */}
            <button
              onClick={handleCopy}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all active:scale-[0.98] ${
                copied
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
              style={{ touchAction: "manipulation" }}
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy Search String"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
