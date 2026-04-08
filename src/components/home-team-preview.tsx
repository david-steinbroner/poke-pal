"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PokemonChip } from "@/components/pokemon-chip";
import { getPokemonName } from "@/lib/pokemon-utils";
import { getAllSavedTeams } from "@/lib/team-storage";
import { LEAGUE_NAMES, LEAGUE_SHORT_NAMES } from "@/lib/constants";

// Order: limited cups first, then regular cups
const LEAGUE_ORDER = ["fantasy-cup", "great-league", "ultra-league", "master-league"];

export function HomeTeamPreview() {
  const [teams, setTeams] = useState<Array<{ leagueId: string; pokemonIds: string[] }>>([]);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  useEffect(() => {
    const saved = getAllSavedTeams();
    const sorted = saved
      .filter((t) => LEAGUE_ORDER.includes(t.leagueId))
      .sort((a, b) => LEAGUE_ORDER.indexOf(a.leagueId) - LEAGUE_ORDER.indexOf(b.leagueId));
    setTeams(sorted);
    if (sorted.length > 0 && !selectedTab) {
      setSelectedTab(sorted[0]!.leagueId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (teams.length === 0) {
    return (
      <div className="flex flex-wrap gap-2">
        <Link
          href="/teams"
          className="inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors hover:bg-accent active:bg-accent active:scale-95"
        >
          Start &rarr;
        </Link>
      </div>
    );
  }

  const selectedTeam = teams.find((t) => t.leagueId === selectedTab);
  const teamUrl = selectedTeam
    ? `/teams?l=${selectedTeam.leagueId}&p=${selectedTeam.pokemonIds.join(",")}`
    : "/teams";

  return (
    <div className="space-y-2">
      {/* League tabs — only leagues with saved teams */}
      <div className="flex flex-wrap gap-1.5">
        {teams.map((team) => (
          <button
            key={team.leagueId}
            onClick={() => setSelectedTab(team.leagueId)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedTab === team.leagueId
                ? "bg-primary text-primary-foreground"
                : "border text-muted-foreground hover:bg-accent"
            }`}
            style={{ touchAction: "manipulation" }}
          >
            {LEAGUE_SHORT_NAMES[team.leagueId] ?? team.leagueId}
          </button>
        ))}
      </div>

      {/* Pokemon chips for selected tab */}
      {selectedTeam && (
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedTeam.pokemonIds.map((id) => (
            <PokemonChip key={id} name={getPokemonName(id)} />
          ))}
          <Link
            href={`/teams?l=${selectedTeam.leagueId}&p=${selectedTeam.pokemonIds.join(",")}`}
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent"
            style={{ touchAction: "manipulation" }}
          >
            Edit
          </Link>
        </div>
      )}
    </div>
  );
}
