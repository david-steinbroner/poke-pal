import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TierAccordion } from "@/components/tier-accordion";
import { CopyBar } from "@/components/copy-bar";
import { buildLeagueEligibleString } from "@/lib/search-string";
import type { MetaPokemon } from "@/lib/types";
import greatLeague from "@/data/leagues/great-league.json";
import ultraLeague from "@/data/leagues/ultra-league.json";
import masterLeague from "@/data/leagues/master-league.json";
import Link from "next/link";

const leagues = [greatLeague, ultraLeague, masterLeague];

export function generateStaticParams() {
  return leagues.map((league) => ({ leagueSlug: league.id }));
}

export function generateMetadata({
  params,
}: {
  params: { leagueSlug: string };
}): Metadata {
  const league = leagues.find((l) => l.id === params.leagueSlug);
  if (!league) return { title: "Not Found" };
  return {
    title: `${league.name} Meta — Poke Pal`,
    description: `Current ${league.name} meta picks for Pokemon GO PvP. ${league.season}.`,
  };
}

export default function LeaguePage({
  params,
}: {
  params: { leagueSlug: string };
}) {
  const league = leagues.find((l) => l.id === params.leagueSlug);
  if (!league) notFound();

  const cpString = buildLeagueEligibleString(league.cpCap);

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
      </div>

      <CopyBar searchString={cpString} />

      <TierAccordion meta={league.meta as MetaPokemon[]} />
    </div>
  );
}
