"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { TierAccordion } from "@/components/tier-accordion";
import { CopyBar } from "@/components/copy-bar";
import { FloatingTeamBar } from "./floating-team-bar";
import type { MetaPokemon } from "@/lib/types";

type LeaguePageClientProps = {
  leagueId: string;
  leagueName: string;
  cpCap: number;
  season: string;
  lastUpdated: string;
  typeRestrictions?: string[];
  meta: MetaPokemon[];
  metaSearchString: string;
  cpString: string;
};

export function LeaguePageClient({
  leagueId,
  leagueName,
  cpCap,
  season,
  lastUpdated,
  typeRestrictions,
  meta,
  metaSearchString,
  cpString,
}: LeaguePageClientProps) {
  const [team, setTeam] = useState<string[]>([]);

  function handleAddToTeam(pokemonId: string) {
    if (team.length >= 3) {
      toast("Team full (3 max). Remove one to swap.");
      return;
    }
    if (team.includes(pokemonId)) return;
    setTeam((prev) => [...prev, pokemonId]);
  }

  function handleRemoveFromTeam(pokemonId: string) {
    setTeam((prev) => prev.filter((id) => id !== pokemonId));
  }

  const fullSearchString =
    cpCap === 9999 ? metaSearchString : `${metaSearchString}&${cpString}`;

  return (
    <div className={`space-y-4 pt-4 ${team.length > 0 ? "pb-36" : ""}`}>
      <div>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back
        </Link>
        <h1 className="mt-2 text-xl font-bold">{leagueName}</h1>
        <p className="text-sm text-muted-foreground">
          {season} · CP {cpCap === 9999 ? "\u221E" : cpCap.toLocaleString()} ·
          Updated {lastUpdated}
        </p>
        {typeRestrictions && (
          <p className="mt-1 text-xs text-muted-foreground">
            Eligible types: {typeRestrictions.join(", ")}
          </p>
        )}
      </div>

      <div className={team.length > 0 ? "opacity-40 transition-opacity" : "transition-opacity"}>
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          Find meta Pokemon you own
        </p>
        <CopyBar searchString={fullSearchString} />
      </div>

      <TierAccordion
        meta={meta}
        onAddToTeam={handleAddToTeam}
        teamPokemonIds={team}
      />

      <FloatingTeamBar
        team={team}
        leagueId={leagueId}
        cpCap={cpCap}
        onRemove={handleRemoveFromTeam}
        onAdd={handleAddToTeam}
      />
    </div>
  );
}
