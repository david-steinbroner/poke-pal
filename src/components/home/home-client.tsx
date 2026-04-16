"use client";

import Link from "next/link";
import { Star, Atom, Flame, Crown } from "lucide-react";
import { SearchInput } from "@/components/search-input";
import { FixedHeader } from "@/components/fixed-header";
import { CollapsibleSection } from "./collapsible-section";
import { HomeLeagueCard } from "./home-league-card";
import { APP_VERSION } from "@/lib/constants";

type LeagueData = {
  id: string;
  name: string;
  searchString: string;
};

type RaidBoss = {
  id: string;
  name: string;
  tier: 1 | 3 | 5 | "mega" | "dynamax";
  shadow: boolean;
  mega: boolean;
  dynamax: boolean;
};

type HomeClientProps = {
  leagues: LeagueData[];
  raidBosses: RaidBoss[];
};

function TierIndicator({ tier }: { tier: RaidBoss["tier"] }) {
  if (tier === "mega") return null;
  if (tier === "dynamax") {
    return <Atom aria-label="Dynamax raid" className="h-3.5 w-3.5 shrink-0" />;
  }
  return (
    <span className="inline-flex items-center gap-0.5 tabular-nums" aria-label={`${tier}-star raid`}>
      <span>{tier}</span>
      <Star className="h-3 w-3 shrink-0 fill-current" />
    </span>
  );
}

export function HomeClient({ leagues, raidBosses }: HomeClientProps) {
  const previewBosses = raidBosses.slice(0, 4);

  return (
    <div className="flex flex-1 flex-col space-y-3">
      <FixedHeader>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Poke Pal</h1>
          <span aria-hidden className="invisible rounded-lg border px-2.5 py-1.5 text-sm">.</span>
        </div>
      </FixedHeader>

      {/* Section 1: Raids (top 4 + see more) */}
      {raidBosses.length > 0 && (
        <CollapsibleSection id="raids" label="RAIDS" forceOpen>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {previewBosses.map((boss) => (
                <Link
                  key={boss.id}
                  href={`/counter/${boss.id}`}
                  className="flex min-h-11 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors hover:bg-accent active:bg-accent active:scale-[0.98]"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    {boss.shadow && (
                      <Flame aria-label="Shadow" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    {boss.mega && (
                      <Crown aria-label="Mega raid" className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate">{boss.name}</span>
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    <TierIndicator tier={boss.tier} />
                  </span>
                </Link>
              ))}
            </div>
            <Link
              href="/raids"
              className="flex min-h-11 items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent active:bg-accent active:scale-[0.98]"
            >
              See all raids →
            </Link>
          </div>
        </CollapsibleSection>
      )}

      {/* Section 2: Team Rocket */}
      <CollapsibleSection id="rockets" label="TEAM ROCKET">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Grunts", hash: "rocket-grunts" },
            { label: "Leaders", hash: "rocket-leaders" },
            { label: "Giovanni", hash: "rocket-giovanni" },
          ].map(({ label, hash }) => (
            <Link
              key={label}
              href={`/rockets#${hash}`}
              className="flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent active:bg-accent active:scale-95"
            >
              {label}
            </Link>
          ))}
        </div>
      </CollapsibleSection>

      {/* Section 3: Live Leagues */}
      {leagues.length > 0 && (
        <CollapsibleSection id="leagues" label="GO BATTLE LEAGUES">
          <div className="space-y-3">
            {leagues.map((league) => (
              <HomeLeagueCard
                key={league.id}
                leagueId={league.id}
                leagueName={league.name}
                searchString={league.searchString}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {leagues.length === 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            No leagues live right now
          </p>
          <Link
            href="/leagues"
            className="flex min-h-11 items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            Browse all leagues →
          </Link>
        </div>
      )}

      {/* Section 4: Counter Search */}
      <CollapsibleSection id="counters" label="COUNTERS">
        <SearchInput placeholder="Who are you fighting?" />
      </CollapsibleSection>

      {/* Footer */}
      <footer className="mt-auto text-center text-xs text-muted-foreground/40 space-y-0.5">
        <p>Poke Pal v{APP_VERSION} · Built by Skunk Labs</p>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfDeXbnLSRJmte9vrxWlyNJl65jQ0FCU6y3qkESMdaJxi6Awg/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block hover:text-muted-foreground transition-colors"
        >
          Send feedback →
        </a>
      </footer>
    </div>
  );
}
