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

// Minimal monochrome icons (lucide).
// Tier pill (N + star) shows raid difficulty on the right.
// Mega → Crown on the LEFT (no right-side indicator).
// Shadow → Flame on the LEFT. Dynamax → Atom on the right.
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
  return (
    <div className="space-y-5">
      <FixedHeader>
        <h1 className="text-xl font-bold">Poke Pal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Always know which Pokemon to play; find copiable search strings for every battle.
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
                searchString={league.searchString}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Empty state: no active leagues */}
      {leagues.length === 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
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

      {/* Section 2: Team Rocket */}
      <CollapsibleSection id="rockets" label="TEAM ROCKET">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Grunts", hash: "rocket-grunts" },
            { label: "Leaders", hash: "rocket-leaders" },
            { label: "Giovanni", hash: "rocket-giovanni" },
          ].map(({ label, hash }) => (
            <Link
              key={label}
              href={`/rockets#${hash}`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent active:bg-accent active:scale-95"
            >
              {label}
            </Link>
          ))}
        </div>
      </CollapsibleSection>

      {/* Section 3: Live Raids */}
      {raidBosses.length > 0 && (
        <CollapsibleSection id="raids" label="RAIDS">
          <div className="grid grid-cols-2 gap-2">
            {raidBosses.map((boss) => (
              <Link
                key={boss.id}
                href={`/counter/${boss.id}`}
                className="flex min-h-11 items-center justify-between gap-2 rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors hover:bg-accent active:bg-accent active:scale-95"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  {boss.shadow && (
                    <Flame
                      aria-label="Shadow"
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    />
                  )}
                  {boss.mega && (
                    <Crown
                      aria-label="Mega raid"
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                    />
                  )}
                  <span className="truncate">{boss.name}</span>
                </span>
                <span className="shrink-0 text-muted-foreground">
                  <TierIndicator tier={boss.tier} />
                </span>
              </Link>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Section 4: Counter Search */}
      <CollapsibleSection id="counters" label="COUNTERS">
        <SearchInput placeholder="Who are you fighting?" />
      </CollapsibleSection>

      {/* Footer */}
      <footer className="pt-8 pb-4 text-center text-sm text-muted-foreground/50 space-y-1">
        <p>Poke Pal v{APP_VERSION} · Open source · MIT License</p>
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
