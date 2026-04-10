"use client";

import Link from "next/link";
import { PokemonChip } from "@/components/pokemon-chip";
import { getPokemonName } from "@/lib/pokemon-utils";

type InlineTeamSectionProps = {
  team: string[];
  leagueId: string;
  leagueName?: string;
  onRemove: (pokemonId: string) => void;
};

export function InlineTeamSection({
  team,
  leagueId,
  leagueName,
  onRemove,
}: InlineTeamSectionProps) {
  if (team.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Header row: "Your Team" + rating (left) | arrow link (right) */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Your Team{leagueName ? ` - ${leagueName}` : ""}</span>
        <Link
          href={`/teams?l=${leagueId}&p=${team.join(",")}`}
          className="flex items-center justify-center min-h-11 min-w-11 text-primary hover:text-primary/80 active:opacity-70"
          aria-label="Edit team"
        >
          <span className="text-sm">→</span>
        </Link>
      </div>

      {/* Team chips + empty slot circles (single line) */}
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
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-dashed text-muted-foreground text-[13px]"
          >
            {team.length + i + 1}
          </span>
        ))}
      </div>
    </div>
  );
}
