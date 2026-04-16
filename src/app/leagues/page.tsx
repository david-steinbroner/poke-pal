import type { Metadata } from "next";
import { getActiveLeagues, getUpcomingLeagues } from "@/data/leagues";
import { LeaguesClient } from "@/components/league/leagues-client";
import {
  buildLeagueEligibleString,
  buildNameSearchString,
} from "@/lib/search-string";
import pokemonData from "@/data/pokemon.json";
import curatedTeamsData from "@/data/curated-teams.json";
import { getPokemonName } from "@/lib/pokemon-utils";

export const metadata: Metadata = {
  title: "Leagues — PoGo Pal",
  description:
    "Browse Pokemon GO Battle League cups and seasons. See what's live now.",
  openGraph: {
    title: "Leagues — PoGo Pal",
    description:
      "Browse Pokemon GO Battle League cups and seasons. See what's live now.",
  },
};

type LeagueClientData = {
  id: string;
  name: string;
  cpCap: number;
  typeRestrictions?: string[];
  active: boolean;
  meta: Array<{
    pokemonId: string;
    name: string;
    tier: string;
    recommendedFast: string;
    recommendedCharged: string[];
    elite?: string[];
  }>;
  metaSearchString: string;
  cpString: string;
  curatedTeams: Array<{
    name: string;
    pokemon: Array<{ id: string; name: string }>;
    why: string;
    lead: string;
    searchString: string;
  }>;
};

function buildLeagueClientData(): LeagueClientData[] {
  const activeLeagues = getActiveLeagues();
  const upcomingLeagues = getUpcomingLeagues();
  const allOrdered = [...activeLeagues, ...upcomingLeagues];

  return allOrdered.map((league) => {
    const cpString = buildLeagueEligibleString(league.cpCap);
    const metaNames = league.meta.map((m) => {
      const p = pokemonData.find((p) => p.id === m.pokemonId);
      return p?.name ?? m.pokemonId;
    });
    const metaSearchString = buildNameSearchString(metaNames);
    const fullSearchString =
      league.cpCap === 9999 ? metaSearchString : `${metaSearchString}&${cpString}`;

    const rawTeams =
      (curatedTeamsData.teams as Record<string, Array<{ name: string; pokemon: string[]; why: string; lead: string }>>)[league.id] ?? [];
    const curatedTeams = rawTeams.map((t) => ({
      ...t,
      pokemon: t.pokemon.map((id) => ({ id, name: getPokemonName(id) })),
      searchString:
        league.cpCap === 9999
          ? buildNameSearchString(t.pokemon.map(getPokemonName))
          : `${buildNameSearchString(t.pokemon.map(getPokemonName))}&${cpString}`,
    }));

    return {
      id: league.id,
      name: league.name,
      cpCap: league.cpCap,
      typeRestrictions:
        "typeRestrictions" in league
          ? (league as { typeRestrictions?: string[] }).typeRestrictions
          : undefined,
      active: league.active,
      meta: league.meta.map((m) => ({
        ...m,
        name: getPokemonName(m.pokemonId),
        elite: (m as { elite?: string[] }).elite,
      })),
      metaSearchString: fullSearchString,
      cpString,
      curatedTeams,
    };
  });
}

export default function LeaguesPage() {
  const leagues = buildLeagueClientData();

  return <LeaguesClient leagues={leagues} />;
}
