"use client";

import { LEAGUE_IDS, LEAGUE_SHORT_NAMES } from "@/lib/constants";
import type { LeagueId } from "@/lib/team-types";

export function LeaguePicker({
  selected,
  onSelect,
}: {
  selected: LeagueId;
  onSelect: (id: LeagueId) => void;
}) {
  return (
    <div className="flex gap-2">
      {LEAGUE_IDS.map((id) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`min-h-11 flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            selected === id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {LEAGUE_SHORT_NAMES[id]}
        </button>
      ))}
    </div>
  );
}
