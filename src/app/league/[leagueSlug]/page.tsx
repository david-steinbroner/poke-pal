import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  buildLeagueEligibleString,
  buildNameSearchString,
} from "@/lib/search-string";
import type { MetaPokemon } from "@/lib/types";
import pokemonData from "@/data/pokemon.json";
import greatLeague from "@/data/leagues/great-league.json";
import ultraLeague from "@/data/leagues/ultra-league.json";
import masterLeague from "@/data/leagues/master-league.json";
import fantasyCup from "@/data/leagues/fantasy-cup.json";
import { LeaguePageClient } from "@/components/league/league-page-client";

const leagues = [fantasyCup, greatLeague, ultraLeague, masterLeague];

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

  return (
    <LeaguePageClient
      leagueId={league.id}
      leagueName={league.name}
      cpCap={league.cpCap}
      season={league.season}
      lastUpdated={league.lastUpdated}
      typeRestrictions={typeRestrictions}
      meta={league.meta as MetaPokemon[]}
      metaSearchString={metaSearchString}
      cpString={cpString}
    />
  );
}
