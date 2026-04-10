"use client";

import Link from "next/link";
import { SearchInput } from "@/components/search-input";
import { FixedHeader } from "@/components/fixed-header";
import { CollapsibleSection } from "./collapsible-section";
import { HomeLeagueCard } from "./home-league-card";

type LeagueData = {
  id: string;
  name: string;
  metaPokemonIds: string[];
  searchString: string;
};

type RaidBoss = {
  id: string;
  name: string;
  tag?: string;
};

type HomeClientProps = {
  leagues: LeagueData[];
  raidBosses: RaidBoss[];
};

export function HomeClient({ leagues, raidBosses }: HomeClientProps) {
  return (
    <div className="space-y-5">
      <FixedHeader>
        <h1 className="text-xl font-bold">Poke Pal</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Always know which Pokemon to play: find copiable search strings for every battle.
        </p>
      </FixedHeader>

      {/* Section 1: Live Leagues */}
      {leagues.length > 0 && (
        <CollapsibleSection id="leagues" label="GO BATTLE LEAGUES">
          <div className="space-y-3">
            {leagues.map((league) => (
              <HomeLeagueCard
                key={league.id}
                leagueId={league.id}
                leagueName={league.name}
                metaPokemonIds={league.metaPokemonIds}
                searchString={league.searchString}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Empty state: no active leagues */}
      {leagues.length === 0 && (
        <div className="space-y-3">
          <p className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">
            No leagues live right now
          </p>
          <p className="text-sm text-muted-foreground">
            Check back when the next GBL season starts.
          </p>
          <Link
            href="/leagues"
            className="inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Browse all leagues →
          </Link>
        </div>
      )}

      {/* Section 2: Live Raids */}
      {raidBosses.length > 0 && (
        <CollapsibleSection id="raids" label="RAIDS" accentColor="text-orange-600">
          <div className="flex flex-wrap gap-2">
            {raidBosses.map((boss) => (
              <Link
                key={boss.id}
                href={`/counter/${boss.id}`}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors hover:bg-accent active:bg-accent active:scale-95"
              >
                {boss.name}
                {boss.tag && !["3★", "1★"].includes(boss.tag) && (
                  <span className="text-[13px] font-normal text-muted-foreground">
                    {boss.tag}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Section 3: Counter Search */}
      <CollapsibleSection id="counters" label="COUNTERS" prefix="SEARCH:" accentColor="text-amber-600">
        <SearchInput placeholder="Who are you fighting?" />
      </CollapsibleSection>

      {/* Footer */}
      <footer className="pt-8 pb-4 text-center text-[13px] text-muted-foreground/50 space-y-1">
        <p>Poke Pal v1.0.4 · Open source · MIT License</p>
        <p>Built by Skunk Labs</p>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfDeXbnLSRJmte9vrxWlyNJl65jQ0FCU6y3qkESMdaJxi6Awg/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-muted-foreground/70 hover:text-muted-foreground transition-colors"
        >
          Send feedback →
        </a>
      </footer>
    </div>
  );
}
