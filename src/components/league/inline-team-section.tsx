"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PokemonChip } from "@/components/pokemon-chip";
import { getPokemonName } from "@/lib/pokemon-utils";
import type { LeagueId } from "@/lib/team-types";

type InlineTeamSectionProps = {
  team: string[];
  leagueId: string;
  onRemove: (pokemonId: string) => void;
};

export function InlineTeamSection({
  team,
  leagueId,
  onRemove,
}: InlineTeamSectionProps) {
  if (team.length === 0) return null;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      {/* Header row: "Your Team" + rating (left) | arrow link (right) */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Your Team</span>
        <Link
          href={`/teams?l=${leagueId}&p=${team.join(",")}`}
          className="text-primary hover:text-primary/80"
          aria-label="Edit team"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      {/* Team chips + empty slot circles (single line) */}
      <div className="flex flex-nowrap overflow-hidden gap-2 items-center">
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
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-dashed text-muted-foreground text-[13px]"
          >
            {team.length + i + 1}
          </span>
        ))}
      </div>
    </div>
  );
}
