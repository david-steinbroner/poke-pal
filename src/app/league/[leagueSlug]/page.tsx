import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  buildLeagueEligibleString,
  buildNameSearchString,
} from "@/lib/search-string";
import type { MetaPokemon } from "@/lib/types";
import pokemonData from "@/data/pokemon.json";
import curatedTeamsData from "@/data/curated-teams.json";
import { ALL_LEAGUES } from "@/data/leagues";
import { getPokemonName } from "@/lib/pokemon-utils";
import { LeaguePageClient } from "@/components/league/league-page-client";

const leagues = ALL_LEAGUES;

export function generateStaticParams() {
  return leagues.map((league) => ({ leagueSlug: league.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ leagueSlug: string }>;
}): Promise<Metadata> {
  const { leagueSlug } = await params;
  const league = leagues.find((l) => l.id === leagueSlug);
  if (!league) return { title: "Not Found" };
  return {
    title: `${league.name} Meta — Pokemon GO PvP`,
    description: `Current ${league.name} meta picks for Pokemon GO PvP. ${league.season}.`,
    openGraph: {
      title: `${league.name} Meta — Pokemon GO PvP`,
      description: `Current ${league.name} meta picks for Pokemon GO PvP. ${league.season}.`,
    },
  };
}

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ leagueSlug: string }>;
}) {
  const { leagueSlug } = await params;
  const league = leagues.find((l) => l.id === leagueSlug);
  if (!league) notFound();

  const cpString = buildLeagueEligibleString(league.cpCap);

  // Build search string from all meta Pokemon names
  const metaNames = league.meta.map((m) => {
    const pokemon = pokemonData.find((p) => p.id === m.pokemonId);
    return pokemon?.name ?? m.pokemonId;
  });
  const metaSearchString = buildNameSearchString(metaNames);

  // Extract type restrictions if present
  const typeRestrictions =
    "typeRestrictions" in league
      ? (league as { typeRestrictions?: string[] }).typeRestrictions
      : undefined;

  // Build curated teams with search strings
  const rawTeams = (curatedTeamsData.teams as Record<string, Array<{ name: string; pokemon: string[]; why: string; lead: string }>>)[league.id] ?? [];
  const curatedTeams = rawTeams.map((t) => {
    const teamNames = t.pokemon.map((id) => getPokemonName(id));
    const teamSearchString = buildNameSearchString(teamNames);
    const teamFullString = league.cpCap === 9999 ? teamSearchString : `${teamSearchString}&${cpString}`;
    return { ...t, searchString: teamFullString };
  });

  return (
    <LeaguePageClient
      leagueId={league.id}
      leagueName={league.name}
      cpCap={league.cpCap}
      typeRestrictions={typeRestrictions}
      meta={league.meta as MetaPokemon[]}
      metaSearchString={metaSearchString}
      cpString={cpString}
      curatedTeams={curatedTeams}
    />
  );
}
