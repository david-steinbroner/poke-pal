"use client";

type LeagueId = "great-league" | "ultra-league" | "master-league" | "fantasy-cup";

const LEAGUE_NAMES: Record<LeagueId, string> = {
  "great-league": "Great",
  "ultra-league": "Ultra",
  "master-league": "Master",
  "fantasy-cup": "Fantasy",
};

const LEAGUE_IDS = Object.keys(LEAGUE_NAMES) as LeagueId[];

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
          {LEAGUE_NAMES[id]}
        </button>
      ))}
    </div>
  );
}
