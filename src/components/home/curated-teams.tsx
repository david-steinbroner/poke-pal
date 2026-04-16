"use client";

import { CopyButton } from "@/components/copy-button";
import { PokemonChip } from "@/components/pokemon-chip";
import { getPokemonName } from "@/lib/pokemon-utils";

type CuratedTeam = {
  name: string;
  pokemon: string[];
  why: string;
  lead: string;
  searchString: string;
};

type CuratedTeamsProps = {
  teams: CuratedTeam[];
  leagueId: string;
  onAddToTeam?: (pokemonId: string) => void;
  teamPokemonIds?: string[];
};

export function CuratedTeams({ teams, onAddToTeam, teamPokemonIds = [] }: CuratedTeamsProps) {
  if (teams.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Recommended Teams
      </h3>
      {teams.map((team) => (
        <div key={team.name} className="rounded-lg border p-4 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {team.pokemon.map((id) => {
              const isOnTeam = teamPokemonIds.includes(id);
              return (
                <PokemonChip
                  key={id}
                  name={getPokemonName(id)}
                  variant={isOnTeam ? "added" : "add"}
                  onAction={onAddToTeam && !isOnTeam ? () => onAddToTeam(id) : undefined}
                />
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{team.name}</span>
            {" — "}{team.why}
          </p>
          <CopyButton searchString={team.searchString} label="Copy Team Search String" compact />
        </div>
      ))}
    </div>
  );
}
