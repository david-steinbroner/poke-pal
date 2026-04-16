/**
 * League barrel export — single source of truth for all league data.
 *
 * To add a new league:
 * 1. Create the JSON file in this directory (e.g. jungle-cup.json)
 * 2. Import it below and add it to ALL_LEAGUES
 * 3. Add its ID to LEAGUE_IDS
 * That's it — 3 lines in this file instead of 5+ files.
 */

import fantasyCup from "./fantasy-cup.json";
import greatLeague from "./great-league.json";
import ultraLeague from "./ultra-league.json";
import masterLeague from "./master-league.json";
import springCup from "./spring-cup.json";
import type { MetaPokemon } from "@/lib/types";

export type League = {
  id: string;
  name: string;
  cpCap: number;
  season: string;
  active: boolean;
  startDate: string;
  endDate: string;
  lastUpdated: string;
  typeRestrictions?: string[];
  meta: MetaPokemon[];
};

/** League IDs in display order — active cups first, then standard, then inactive */
export const LEAGUE_IDS = [
  "spring-cup",
  "master-league",
  "fantasy-cup",
  "great-league",
  "ultra-league",
] as const;

/** League ID union type */
export type LeagueId = (typeof LEAGUE_IDS)[number];

/**
 * All leagues in display order.
 * This array drives everything: nav tabs, static page generation, team analysis.
 */
export const ALL_LEAGUES: League[] = [
  springCup as unknown as League,
  masterLeague as unknown as League,
  fantasyCup as unknown as League,
  greatLeague as unknown as League,
  ultraLeague as unknown as League,
];

/** Lookup map: league ID → league data */
export const LEAGUE_MAP = Object.fromEntries(
  ALL_LEAGUES.map((l) => [l.id, l])
) as Record<string, League>;

/** Active leagues (for "Live Now" sections) */
export const getActiveLeagues = () => ALL_LEAGUES.filter((l) => l.active);

/** Inactive leagues (for "Coming Up" sections) */
export const getUpcomingLeagues = () => ALL_LEAGUES.filter((l) => !l.active);

/** Short display names for compact UI */
export const LEAGUE_SHORT_NAMES: Record<string, string> = Object.fromEntries(
  ALL_LEAGUES.map((l) => {
    // "Fantasy Cup: Great League Edition" → "Fantasy"
    // "Great League" → "Great"
    const short = l.name.split(/[\s:]/)[0]!;
    return [l.id, short];
  })
);
