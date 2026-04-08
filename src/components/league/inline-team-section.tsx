"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PokemonChip } from "@/components/pokemon-chip";
import { ClearButton } from "@/components/clear-button";
import { calculateTeamRating, RATING_COLORS } from "@/lib/team-rating";
import { getPokemonName } from "@/lib/pokemon-utils";
import type { LeagueId } from "@/lib/team-types";

type InlineTeamSectionProps = {
  team: string[];
  leagueId: string;
  onRemove: (pokemonId: string) => void;
  onClear?: () => void;
};

export function InlineTeamSection({
  team,
  leagueId,
  onRemove,
  onClear,
}: InlineTeamSectionProps) {
  const rating = useMemo(
    () => calculateTeamRating(team, leagueId as LeagueId),
    [team, leagueId],
  );

  if (team.length === 0) return null;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      {/* Header row: "Your Team" + rating (left) | ClearButton + "Team Builder -->" (right) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Your Team</span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${RATING_COLORS[rating]}`}
          >
            {rating}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {onClear && <ClearButton onClick={onClear} />}
          <Link
            href={`/teams?l=${leagueId}&p=${team.join(",")}`}
            className="text-xs font-medium text-primary hover:underline"
            style={{ touchAction: "manipulation" }}
          >
            Team Builder &rarr;
          </Link>
        </div>
      </div>

      {/* Team chips + empty slot circles */}
      <div className="flex flex-wrap gap-2 items-center">
        {team.map((pokemonId) => (
          <PokemonChip
            key={pokemonId}
            name={getPokemonName(pokemonId)}
            onRemove={() => onRemove(pokemonId)}
          />
        ))}
        {Array.from({ length: 3 - team.length }).map((_, i) => (
          <span
            key={`empty-${i}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-dashed text-muted-foreground text-xs"
          >
            {team.length + i + 1}
          </span>
        ))}
      </div>
    </div>
  );
}
