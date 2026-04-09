/**
 * Data freshness utilities — surfaces lastUpdated timestamps
 * from all data sources so the UI can show "Updated X days ago".
 */

import { ALL_LEAGUES } from "@/data/leagues";
import currentRaids from "@/data/current-raids.json";

export type DataSource = {
  label: string;
  lastUpdated: string;
  daysAgo: number;
  isStale: boolean;
};

const STALE_THRESHOLD_DAYS = 14;

function daysAgo(dateStr: string): number {
  const updated = new Date(dateStr).getTime();
  if (isNaN(updated)) return Infinity;
  return Math.floor((Date.now() - updated) / (1000 * 60 * 60 * 24));
}

/** Returns freshness info for all data sources */
export function getDataFreshness(): DataSource[] {
  const sources: DataSource[] = [];

  for (const league of ALL_LEAGUES) {
    const days = daysAgo(league.lastUpdated);
    sources.push({
      label: league.name,
      lastUpdated: league.lastUpdated,
      daysAgo: days,
      isStale: days > STALE_THRESHOLD_DAYS,
    });
  }

  const raidDays = daysAgo(currentRaids.lastUpdated);
  sources.push({
    label: "Current Raids",
    lastUpdated: currentRaids.lastUpdated,
    daysAgo: raidDays,
    isStale: raidDays > STALE_THRESHOLD_DAYS,
  });

  return sources;
}

/** Returns the oldest data source — useful for a single "Data updated X ago" indicator */
export function getOldestDataSource(): DataSource {
  const sources = getDataFreshness();
  return sources.reduce((oldest, src) =>
    src.daysAgo > oldest.daysAgo ? src : oldest
  );
}

/** Human-readable relative time: "today", "1 day ago", "3 days ago" */
export function formatFreshness(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}
