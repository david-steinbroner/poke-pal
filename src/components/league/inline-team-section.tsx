"use client";

import Link from "next/link";
import { PokemonChip } from "@/components/pokemon-chip";
import { getPokemonName } from "@/lib/pokemon-utils";
import { RATING_COLORS } from "@/lib/team-rating";
import type { TeamRating } from "@/lib/team-rating";

type InlineTeamSectionProps = {
  team: string[];
  leagueId: string;
  leagueName?: string;
  onRemove: (pokemonId: string) => void;
  rating?: TeamRating;
  coverageScore?: number;
};

export function InlineTeamSection({
  team,
  leagueId,
  onRemove,
  rating,
  coverageScore,
}: InlineTeamSectionProps) {
  if (team.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Your Team</span>
          {rating && (
            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold ${RATING_COLORS[rating]}`}>
              {rating}
            </span>
          )}
          {coverageScore !== undefined && (
            <span className="text-xs text-muted-foreground">
              {coverageScore}/18 types covered
            </span>
          )}
        </div>
        <Link
          href={`/teams?l=${leagueId}&p=${team.join(",")}`}
          className="text-primary hover:text-primary/80 active:opacity-70"
          aria-label="Edit team"
        >
          <span className="text-sm">→</span>
        </Link>
      </div>
      <div className="flex flex-nowrap overflow-x-auto gap-2 items-center">
        {team.map((pokemonId) => (
          <PokemonChip
            key={pokemonId}
            name={getPokemonName(pokemonId)}
            onAction={() => onRemove(pokemonId)}
          />
        ))}
        {Array.from({ length: 3 - team.length }).map((_, i) => (
          <span
            key={`empty-${i}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-dashed text-muted-foreground text-sm"
          >
            {team.length + i + 1}
          </span>
        ))}
      </div>
    </div>
  );
}
