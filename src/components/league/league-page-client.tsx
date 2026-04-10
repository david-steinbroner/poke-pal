"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { TierAccordion } from "@/components/tier-accordion";
import { CopyButton } from "@/components/copy-button";
import { FixedHeader } from "@/components/fixed-header";
import Link from "next/link";
import { InlineTeamSection } from "./inline-team-section";
import { saveTeam, loadTeam } from "@/lib/team-storage";
import { analyzeTeam } from "@/lib/team-analysis";
import { pokemonToSlot } from "@/lib/pokemon-utils";
import { calculateTeamRating, RATING_COLORS } from "@/lib/team-rating";
import { CuratedTeams } from "@/components/home/curated-teams";
import type { MetaPokemon } from "@/lib/types";
import type { LeagueId } from "@/lib/team-types";

type CuratedTeam = {
  name: string;
  pokemon: string[];
  why: string;
  lead: string;
  searchString: string;
};

type LeaguePageClientProps = {
  leagueId: string;
  leagueName: string;
  cpCap: number;
  typeRestrictions?: string[];
  meta: MetaPokemon[];
  metaSearchString: string;
  cpString: string;
  curatedTeams?: CuratedTeam[];
};


export function LeaguePageClient({
  leagueId,
  leagueName,
  cpCap,
  typeRestrictions,
  meta,
  metaSearchString,
  cpString,
  curatedTeams = [],
}: LeaguePageClientProps) {
  const [team, setTeam] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Restore team from localStorage on mount (avoids SSR mismatch)
  useEffect(() => {
    setTeam(loadTeam(leagueId));
    setLoaded(true);
  }, [leagueId]);

  // Persist team to localStorage whenever it changes — but only after initial load
  useEffect(() => {
    if (!loaded) return;
    saveTeam(leagueId, team);
  }, [team, leagueId, loaded]);

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

  // Recommended IDs (placeholder — will be powered by Team Advisor)
  const recommendedIds = undefined;

  // Full meta search string (with CP filter when applicable)
  const fullSearchString =
    cpCap === 9999 ? metaSearchString : `${metaSearchString}&${cpString}`;

  return (
    <div className="space-y-4">
      <FixedHeader>
        <h1 className="text-xl font-bold">{leagueName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {cpCap === 9999 ? "No CP limit" : `CP ${cpCap.toLocaleString()}`}
          {typeRestrictions && ` · ${typeRestrictions.join(", ")}`}
        </p>
        <div className="mt-3">
          <CopyButton searchString={fullSearchString} label="Copy Meta Search String" />
        </div>
      </FixedHeader>

      <TierAccordion
        meta={meta}
        onAddToTeam={handleAddToTeam}
        teamPokemonIds={team}
        recommendedIds={recommendedIds}
      />

      {/* Curated team recommendations */}
      {curatedTeams.length > 0 && (
        <CuratedTeams
          teams={curatedTeams}
          leagueId={leagueId}
          onAddToTeam={handleAddToTeam}
          teamPokemonIds={team}
        />
      )}

      {/* Spacer so content isn't hidden behind fixed team bar */}
      {team.length > 0 && <div className="h-28" />}

      {/* Fixed team bar above bottom nav */}
      {team.length > 0 && (
        <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+49px)] left-0 right-0 z-30 border-t-2 border-border bg-background/95 backdrop-blur-sm shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
          <div className="mx-auto max-w-lg px-4 pt-4 pb-5">
            <InlineTeamSection
              team={team}
              leagueId={leagueId}
              onRemove={handleRemoveFromTeam}
              rating={analysis ? calculateTeamRating(
                team,
                leagueId as LeagueId,
                analysis.offensiveCoverage,
                analysis.defensiveWeaknesses,
                analysis.threats,
              ) : undefined}
              coverageScore={analysis?.coverageScore}
            />
          </div>
        </div>
      )}
    </div>
  );
}
