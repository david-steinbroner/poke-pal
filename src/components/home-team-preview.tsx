"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PokemonChip } from "@/components/pokemon-chip";
import { ClearButton } from "@/components/clear-button";
import { getPokemonName } from "@/lib/pokemon-utils";
import { getAllSavedTeams, clearTeam } from "@/lib/team-storage";
import { LEAGUE_NAMES, LEAGUE_IDS } from "@/lib/constants";

export function HomeTeamPreview() {
  const [teams, setTeams] = useState<Array<{ leagueId: string; pokemonIds: string[] }>>([]);

  useEffect(() => {
    setTeams(getAllSavedTeams());
  }, []);

  const handleClear = (leagueId: string) => {
    clearTeam(leagueId);
    setTeams((prev) => prev.filter((t) => t.leagueId !== leagueId));
  };

  // Sort teams in the canonical league order
  const leagueOrder = LEAGUE_IDS as readonly string[];
  const sortedTeams = teams
    .filter((t) => leagueOrder.includes(t.leagueId))
    .sort((a, b) => leagueOrder.indexOf(a.leagueId) - leagueOrder.indexOf(b.leagueId));

  if (sortedTeams.length === 0) {
    return (
      <div className="flex flex-wrap gap-2">
        <Link
          href="/teams"
          className="inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent active:bg-accent active:scale-95"
        >
          Start &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedTeams.map((team) => {
        const teamUrl = `/teams?l=${team.leagueId}&p=${team.pokemonIds.join(",")}`;
        return (
          <div key={team.leagueId} className="flex items-center gap-2">
            <span className="shrink-0 text-xs text-muted-foreground">
              {LEAGUE_NAMES[team.leagueId] ?? team.leagueId}
            </span>
            <div className="flex flex-1 flex-wrap items-center gap-1.5">
              {team.pokemonIds.map((id) => {
                const name = getPokemonName(id);
                return (
                  <Link key={id} href={teamUrl}>
                    <PokemonChip name={name} />
                  </Link>
                );
              })}
              {team.pokemonIds.length < 3 && (
                <Link
                  href={teamUrl}
                  className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Finish &rarr;
                </Link>
              )}
            </div>
            <ClearButton onClick={() => handleClear(team.leagueId)} />
          </div>
        );
      })}
    </div>
  );
}
