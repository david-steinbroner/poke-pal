import type { Metadata } from "next";
import Link from "next/link";
import { LeagueCard } from "@/components/league-card";

import fantasyCup from "@/data/leagues/fantasy-cup.json";
import greatLeague from "@/data/leagues/great-league.json";
import ultraLeague from "@/data/leagues/ultra-league.json";
import masterLeague from "@/data/leagues/master-league.json";

export const metadata: Metadata = {
  title: "Leagues — Poke Pal",
  description: "Browse Pokemon GO Battle League cups and seasons.",
};

const allLeagues = [fantasyCup, greatLeague, ultraLeague, masterLeague];

export default function LeaguesPage() {
  const liveLeagues = allLeagues.filter((l) => l.active);
  const upcomingLeagues = allLeagues.filter((l) => !l.active);

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back
        </Link>
        <h1 className="text-xl font-bold">Leagues</h1>
      </div>

      {liveLeagues.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">
            Live Now
          </h2>
          <div className="space-y-2">
            {liveLeagues.map((league) => (
              <LeagueCard
                key={league.id}
                id={league.id}
                name={league.name}
                cpCap={league.cpCap}
                season={league.season}
                active={league.active}
                metaCount={league.meta.length}
              />
            ))}
          </div>
        </div>
      )}

      {liveLeagues.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No active cups right now. Check back when the next GBL rotation
          starts.
        </p>
      )}

      {upcomingLeagues.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">
            Coming Up
          </h2>
          <div className="space-y-2">
            {upcomingLeagues.map((league) => (
              <LeagueCard
                key={league.id}
                id={league.id}
                name={league.name}
                cpCap={league.cpCap}
                season={league.season}
                active={league.active}
                metaCount={league.meta.length}
                variant="inactive"
                startDate={league.startDate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
