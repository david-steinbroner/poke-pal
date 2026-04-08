"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { TierAccordion } from "@/components/tier-accordion";
import { DualCopyButtons } from "@/components/dual-copy-buttons";
import { SearchInput } from "@/components/search-input";
import Link from "next/link";
import { InlineTeamSection } from "./inline-team-section";
import { saveTeam, loadTeam } from "@/lib/team-storage";
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
  // Store last visited league slug for bottom nav memory
  useEffect(() => {
    try {
      localStorage.setItem("poke-pal:lastLeague", leagueId);
    } catch {}
  }, [leagueId]);

  const [team, setTeam] = useState<string[]>([]);

  // Restore team from localStorage on mount (avoids SSR mismatch)
  useEffect(() => {
    setTeam(loadTeam(leagueId));
  }, [leagueId]);

  // Persist team to localStorage whenever it changes
  useEffect(() => {
    saveTeam(leagueId, team);
  }, [team, leagueId]);

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

  // Full meta search string (with CP filter when applicable)
  const fullSearchString =
    cpCap === 9999 ? metaSearchString : `${metaSearchString}&${cpString}`;

  return (
    <div className="space-y-4 pt-4">
      <div className="sticky top-0 z-10 bg-background pb-2 pt-4 -mx-4 px-4">
        <Link href="/leagues" className="text-sm text-muted-foreground hover:text-foreground">← Leagues</Link>
      </div>
      <div>
        <h1 className="text-xl font-bold">{leagueName}</h1>
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

      <DualCopyButtons
        buttons={[
          { searchString: fullSearchString, label: "Copy Meta Pokemon" },
          ...(team.length > 0 && analysis?.searchString
            ? [{ searchString: analysis.searchString, label: "Copy Your Team" }]
            : []),
        ]}
      />

      {team.length > 0 && (
        <InlineTeamSection
          team={team}
          leagueId={leagueId}
          onRemove={handleRemoveFromTeam}
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
