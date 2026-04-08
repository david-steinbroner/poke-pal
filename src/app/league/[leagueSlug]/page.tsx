import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TierAccordion } from "@/components/tier-accordion";
import { CopyBar } from "@/components/copy-bar";
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
import Link from "next/link";

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
    title: `${league.name} Meta — Poke Pal`,
    description: `Current ${league.name} meta picks for Pokemon GO PvP. ${league.season}.`,
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
  const metaNames = league.meta
    .map((m) => {
      const pokemon = pokemonData.find((p) => p.id === m.pokemonId);
      return pokemon?.name ?? m.pokemonId;
    });
  const metaSearchString = buildNameSearchString(metaNames);

  return (
    <div className="space-y-4 pt-4">
      <div>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back
        </Link>
        <h1 className="mt-2 text-xl font-bold">{league.name}</h1>
        <p className="text-sm text-muted-foreground">
          {league.season} · CP{" "}
          {league.cpCap === 9999 ? "∞" : league.cpCap.toLocaleString()} ·
          Updated {league.lastUpdated}
        </p>
        {"typeRestrictions" in league &&
          (league as { typeRestrictions?: string[] }).typeRestrictions && (
            <p className="mt-1 text-xs text-muted-foreground">
              Eligible types:{" "}
              {(league as { typeRestrictions: string[] }).typeRestrictions.join(
                ", ",
              )}
            </p>
          )}
      </div>

      <div className="space-y-2">
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Search for meta Pokemon you own
          </p>
          <CopyBar searchString={metaSearchString} />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Search by CP cap
          </p>
          <CopyBar searchString={cpString} />
        </div>
      </div>

      <TierAccordion meta={league.meta as MetaPokemon[]} />
    </div>
  );
}
