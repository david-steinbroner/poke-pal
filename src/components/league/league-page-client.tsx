"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { TierAccordion } from "@/components/tier-accordion";
import { CopyBar } from "@/components/copy-bar";
import { SearchInput } from "@/components/search-input";
import { BackButton } from "@/components/back-button";
import { InlineTeamSection } from "./inline-team-section";
import { saveTeam, loadTeam, clearTeam } from "@/lib/team-storage";
import { analyzeTeam } from "@/lib/team-analysis";
import { pokemonToSlot } from "@/lib/pokemon-utils";
import type { MetaPokemon } from "@/lib/types";
import type { LeagueId } from "@/lib/team-types";

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

  // Analyze team for suggestions when team has members
  const analysis = useMemo(() => {
    if (team.length === 0) return null;
    const slots = [
      team[0] ? pokemonToSlot(team[0]) : null,
      team[1] ? pokemonToSlot(team[1]) : null,
      team[2] ? pokemonToSlot(team[2]) : null,
    ];
    return analyzeTeam(slots, leagueId as LeagueId);
  }, [team, leagueId]);

  // Recommended IDs from analysis suggestions
  const recommendedIds = useMemo(() => {
    if (!analysis) return undefined;
    return analysis.suggestions
      .filter((s) => !team.includes(s.pokemonId))
      .map((s) => s.pokemonId);
  }, [analysis, team]);

  // Contextual CopyBar: meta string when no team, team string when team exists
  const fullSearchString =
    cpCap === 9999 ? metaSearchString : `${metaSearchString}&${cpString}`;

  const copyBarLabel =
    team.length > 0 ? "Find your team in-game" : "Search for meta Pokemon";
  const copyBarString =
    team.length > 0 && analysis ? analysis.searchString : fullSearchString;

  return (
    <div className="space-y-4 pt-4">
      <div>
        <BackButton />
        <h1 className="mt-2 text-xl font-bold">{leagueName}</h1>
        <p className="text-sm text-muted-foreground">
          {cpCap === 9999 ? "No CP limit" : `CP ${cpCap.toLocaleString()}`}
          {typeRestrictions && ` · ${typeRestrictions.join(", ")}`}
        </p>
      </div>

      <SearchInput
        mode="select"
        onSelect={handleAddToTeam}
        placeholder="Add a Pokemon..."
      />

      <CopyBar searchString={copyBarString} label={copyBarLabel} />

      {team.length > 0 && (
        <InlineTeamSection
          team={team}
          leagueId={leagueId}
          onRemove={handleRemoveFromTeam}
          onClear={handleClearTeam}
        />
      )}

      <TierAccordion
        meta={meta}
        onAddToTeam={handleAddToTeam}
        teamPokemonIds={team}
        recommendedIds={recommendedIds}
      />
    </div>
  );
}
