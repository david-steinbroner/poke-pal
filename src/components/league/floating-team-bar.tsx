"use client";

import { useState, useCallback } from "react";
import { X, Copy, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import {
  buildNameSearchString,
  buildLeagueEligibleString,
} from "@/lib/search-string";
import pokemonData from "@/data/pokemon.json";

type FloatingTeamBarProps = {
  team: string[];
  leagueId: string;
  cpCap: number;
  onRemove: (pokemonId: string) => void;
};

/** Resolve a pokemonId to its display name (lowercase, from data). */
function getPokemonName(pokemonId: string): string {
  const pokemon = pokemonData.find((p) => p.id === pokemonId);
  return pokemon?.name ?? pokemonId;
}

/** Format a pokemonId for display: hyphens to spaces, capitalize each word. */
function formatDisplayName(pokemonId: string): string {
  return pokemonId
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function FloatingTeamBar({
  team,
  leagueId,
  cpCap,
  onRemove,
}: FloatingTeamBarProps) {
  const [copied, setCopied] = useState(false);

  // Build search string from team names
  const names = team.map(getPokemonName);
  const nameStr = buildNameSearchString(names);
  const searchString =
    cpCap >= 9999 ? nameStr : `${nameStr}&${buildLeagueEligibleString(cpCap)}`;

  // Build analyze URL
  const analyzeHref = `/teams?l=${leagueId}&p=${team.join(",")}`;

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

  return (
    <div
      role="region"
      aria-label="Team builder"
      aria-live="polite"
      className={`fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm px-4 py-3 pb-[env(safe-area-inset-bottom,12px)] transition-transform duration-300 motion-reduce:transition-none ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex flex-wrap items-center gap-2 max-w-2xl">
        {/* Pokemon name chips */}
        {team.map((pokemonId) => (
          <span
            key={pokemonId}
            className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm"
          >
            {formatDisplayName(pokemonId)}
            <button
              onClick={() => onRemove(pokemonId)}
              className="ml-0.5 inline-flex items-center justify-center min-h-[44px] min-w-[28px] -mr-1 text-muted-foreground hover:text-foreground"
              style={{ touchAction: "manipulation" }}
              aria-label={`Remove ${formatDisplayName(pokemonId)} from team`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}

        {/* Spacer pushes actions to the right on wide screens */}
        <div className="flex-1" />

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all active:scale-95 ${
            copied
              ? "bg-secondary text-secondary-foreground"
              : "bg-primary text-primary-foreground"
          }`}
          style={{ touchAction: "manipulation" }}
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copied!" : "Copy"}
        </button>

        {/* Analyze link */}
        <Link
          href={analyzeHref}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Analyze
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
