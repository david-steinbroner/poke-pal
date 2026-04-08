"use client";

import { POKEMON_TYPES, type PokemonType } from "@/lib/types";
import { TYPE_COLORS } from "@/lib/constants";

type TypeCoverage = {
  type: PokemonType;
  multiplier: number;
  coveredBy: string[];
};

export function CoverageChart({
  offensiveCoverage,
  defensiveWeaknesses,
}: {
  offensiveCoverage: TypeCoverage[];
  defensiveWeaknesses: TypeCoverage[];
}) {
  // Build lookup maps for quick access
  const offenseMap = new Map(offensiveCoverage.map((c) => [c.type, c]));
  const defenseMap = new Map(defensiveWeaknesses.map((w) => [w.type, w]));

  // Count covered types (multiplier > 1.0 means super-effective coverage)
  const coveredCount = POKEMON_TYPES.filter((t) => {
    const coverage = offenseMap.get(t);
    return coverage && coverage.multiplier > 1.0;
  }).length;

  function getBadgeStyle(type: PokemonType): string {
    const coverage = offenseMap.get(type);
    const weakness = defenseMap.get(type);

    // Defensive weakness: red outline style
    const isWeakness = weakness && weakness.coveredBy.length >= 2;

    // Offensive coverage: filled with type color
    const isCovered = coverage && coverage.multiplier > 1.0;

    if (isCovered) {
      return `${TYPE_COLORS[type] ?? "bg-gray-500"} text-white`;
    }
    if (isWeakness) {
      return "bg-transparent border-2 border-red-500 text-red-500 dark:border-red-400 dark:text-red-400";
    }
    return "bg-muted text-muted-foreground";
  }

  return (
    <div>
      {/* Coverage score */}
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums">
          {coveredCount}/{POKEMON_TYPES.length}
        </span>
        <span className="text-sm text-muted-foreground">types covered</span>
      </div>

      {/* Type grid */}
      <div className="grid grid-cols-6 gap-1.5">
        {POKEMON_TYPES.map((type) => (
          <span
            key={type}
            className={`rounded-md px-1 py-1 text-center text-xs font-medium ${getBadgeStyle(type)}`}
            title={getTooltip(type, offenseMap, defenseMap)}
          >
            {type.slice(0, 3)}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-green-500" />
          Covered
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm border-2 border-red-500" />
          Weakness
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-muted" />
          Neutral
        </div>
      </div>
    </div>
  );
}

function getTooltip(
  type: PokemonType,
  offenseMap: Map<PokemonType, TypeCoverage>,
  defenseMap: Map<PokemonType, TypeCoverage>,
): string {
  const parts: string[] = [type];
  const coverage = offenseMap.get(type);
  const weakness = defenseMap.get(type);

  if (coverage && coverage.multiplier > 1.0) {
    parts.push(`Covered by: ${coverage.coveredBy.join(", ")}`);
  }
  if (weakness && weakness.coveredBy.length >= 2) {
    parts.push(`Threatens: ${weakness.coveredBy.join(", ")}`);
  }
  return parts.join(" - ");
}
