"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { TierAccordion } from "@/components/tier-accordion";
import { CopyBar } from "@/components/copy-bar";
import { InlineTeamSection } from "./inline-team-section";
import { saveTeam, loadTeam, clearTeam } from "@/lib/team-storage";
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

  // Restore team from localStorage on mount (avoids SSR mismatch)
  useEffect(() => {
    setTeam(loadTeam(leagueId));
  }, [leagueId]);

  // Persist team to localStorage whenever it changes
  useEffect(() => {
    saveTeam(leagueId, team);
  }, [team, leagueId]);

  function handleClearTeam() {
    setTeam([]);
    clearTeam(leagueId);
  }

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
    <div className="space-y-4 pt-4">
      <div>
        <h1 className="text-xl font-bold">{leagueName}</h1>
        <p className="text-sm text-muted-foreground">
          {cpCap === 9999 ? "No CP limit" : `CP ${cpCap.toLocaleString()}`}
          {typeRestrictions && ` · ${typeRestrictions.join(", ")}`}
        </p>
      </div>

      <CopyBar searchString={fullSearchString} />

      {team.length > 0 && (
        <InlineTeamSection
          team={team}
          leagueId={leagueId}
          cpCap={cpCap}
          onRemove={handleRemoveFromTeam}
          onAdd={handleAddToTeam}
          onClear={handleClearTeam}
        />
      )}

      <TierAccordion
        meta={meta}
        onAddToTeam={handleAddToTeam}
        teamPokemonIds={team}
      />
    </div>
  );
}
