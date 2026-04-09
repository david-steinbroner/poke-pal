"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { PokemonChip } from "@/components/pokemon-chip";
import { getPokemonName } from "@/lib/pokemon-utils";
import { getAllSavedTeams } from "@/lib/team-storage";
import { LEAGUE_IDS, LEAGUE_SHORT_NAMES } from "@/data/leagues";

// Derived from barrel — order defined in leagues/index.ts
const LEAGUE_ORDER = LEAGUE_IDS;

export function HomeTeamPreview() {
  const [savedTeams, setSavedTeams] = useState<Map<string, string[]>>(new Map());
  const [selectedTab, setSelectedTab] = useState<string>(LEAGUE_ORDER[0]!);

  useEffect(() => {
    const saved = getAllSavedTeams();
    const map = new Map<string, string[]>();
    for (const t of saved) {
      map.set(t.leagueId, t.pokemonIds);
    }
    setSavedTeams(map);
    // Default to first league that has a team, or first in order
    const firstWithTeam = LEAGUE_ORDER.find((id) => map.has(id));
    if (firstWithTeam) setSelectedTab(firstWithTeam);
  }, []);

  const selectedPokemon = savedTeams.get(selectedTab);
  const hasTeam = selectedPokemon && selectedPokemon.length > 0;

  return (
    <div className="space-y-3">
      {/* All 4 league tabs — always visible */}
      <div className="flex flex-wrap gap-2">
        {LEAGUE_ORDER.map((id) => {
          const isActive = selectedTab === id;
          const leagueHasTeam = savedTeams.has(id);
          return (
            <button
              key={id}
              onClick={() => setSelectedTab(id)}
              className={`min-h-12 rounded-full px-4 py-2 text-base font-semibold transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : leagueHasTeam
                    ? "border-2 border-primary/30 text-foreground"
                    : "border text-muted-foreground hover:bg-accent"
              }`}
            >
              {LEAGUE_SHORT_NAMES[id] ?? id}
            </button>
          );
        })}
      </div>

      {/* Pokemon chips or Build button */}
      <div className="flex flex-wrap items-center gap-2">
        {hasTeam ? (
          <>
            {selectedPokemon.map((id) => (
              <PokemonChip key={id} name={getPokemonName(id)} />
            ))}
            <Link
              href={`/teams?l=${selectedTab}&p=${selectedPokemon.join(",")}`}
              className="inline-flex items-center justify-center rounded-full border px-2.5 py-1.5 text-muted-foreground hover:bg-accent"
              aria-label="Edit team"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          </>
        ) : (
          <Link
            href={`/teams?l=${selectedTab}`}
            className="inline-flex items-center justify-center rounded-full border px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent active:bg-accent active:scale-95"
            aria-label="Build team"
          >
            <Plus className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
