import type { Metadata } from "next";
import { LeagueCard } from "@/components/league-card";
import { FixedHeader } from "@/components/fixed-header";
import { getActiveLeagues, getUpcomingLeagues } from "@/data/leagues";

export const metadata: Metadata = {
  title: "Leagues — Poke Pal",
  description:
    "Browse Pokemon GO Battle League cups and seasons. See what's live now.",
  openGraph: {
    title: "Leagues — Poke Pal",
    description:
      "Browse Pokemon GO Battle League cups and seasons. See what's live now.",
  },
};

export default function LeaguesPage() {
  const liveLeagues = getActiveLeagues();
  const upcomingLeagues = getUpcomingLeagues();

  return (
    <div className="space-y-6">
      <FixedHeader>
        <h1 className="text-xl font-bold">Leagues</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a league, copy Meta Search String, and paste in GO to find collected metas.
        </p>
      </FixedHeader>

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
