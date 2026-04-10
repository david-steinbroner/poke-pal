"use client";

import { CopyButton } from "@/components/copy-button";
import { getPokemonName } from "@/lib/pokemon-utils";
import { buildNameSearchString, buildLeagueEligibleString } from "@/lib/search-string";
import Link from "next/link";

type CuratedTeam = {
  name: string;
  pokemon: string[];
  why: string;
  lead: string;
  searchString: string;
};

type CuratedTeamsProps = {
  teams: CuratedTeam[];
  leagueId: string;
};

export function CuratedTeams({ teams, leagueId }: CuratedTeamsProps) {
  if (teams.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">
        Recommended Teams
      </h3>
      {teams.map((team) => (
        <div key={team.name} className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{team.name}</span>
            <Link
              href={`/teams?l=${leagueId}&p=${team.pokemon.join(",")}`}
              className="text-[13px] text-muted-foreground hover:text-foreground"
            >
              Edit →
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {team.pokemon.map((id, i) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[13px] font-medium capitalize"
              >
                {i === 0 && <span className="text-[11px] text-muted-foreground">Lead</span>}
                {getPokemonName(id)}
              </span>
            ))}
          </div>
          <p className="text-[13px] text-muted-foreground">{team.why}</p>
          <CopyButton searchString={team.searchString} label="Copy Team Search String" compact />
        </div>
      ))}
    </div>
  );
}
