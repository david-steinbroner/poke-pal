"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PokemonChip } from "@/components/pokemon-chip";
import { getPokemonName } from "@/lib/pokemon-utils";
import { getAllSavedTeams } from "@/lib/team-storage";
import { LEAGUE_NAMES, LEAGUE_IDS } from "@/lib/constants";

export function HomeTeamPreview() {
  const [teams, setTeams] = useState<Array<{ leagueId: string; pokemonIds: string[] }>>([]);

  useEffect(() => {
    setTeams(getAllSavedTeams());
  }, []);

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
            <div className="flex flex-1 flex-nowrap overflow-x-auto items-center gap-1.5 scrollbar-none">
              {team.pokemonIds.map((id) => {
                const name = getPokemonName(id);
                return (
                  <Link key={id} href={teamUrl}>
                    <PokemonChip name={name} />
                  </Link>
                );
              })}
            </div>
            <Link
              href={teamUrl}
              className="shrink-0 ml-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Edit team"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
