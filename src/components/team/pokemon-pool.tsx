"use client";

import { PokemonChip } from "@/components/pokemon-chip";
import { SearchInput } from "@/components/search-input";
import { ScreenshotUpload } from "@/components/team/screenshot-upload";
import { CollapsibleSection } from "@/components/home/collapsible-section";
import { getPokemonName } from "@/lib/pokemon-utils";

type PokemonPoolProps = {
  pool: string[];
  onRemove: (pokemonId: string) => void;
  onAdd: (pokemonId: string) => void;
  onAddToTeam?: (pokemonId: string) => void;
  teamIds?: string[];
  defaultOpen?: boolean;
  onScan?: (files: File[]) => Promise<void>;
  isScanning?: boolean;
  scanError?: string | null;
};

export function PokemonPool({
  pool,
  onRemove,
  onAdd,
  onAddToTeam,
  teamIds = [],
  onScan,
  isScanning = false,
  scanError,
}: PokemonPoolProps) {
  return (
    <CollapsibleSection id="teams-my-pokemon" label={`MY POKEMON (${pool.length})`}>
      <div className="space-y-3">
        {pool.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5">
            {pool.map((id) => {
              const isOnTeam = teamIds.includes(id);
              return onAddToTeam ? (
                <PokemonChip
                  key={id}
                  name={getPokemonName(id)}
                  variant={isOnTeam ? "added" : "pool"}
                  onAction={isOnTeam ? undefined : () => onAddToTeam(id)}
                  onSecondaryAction={() => onRemove(id)}
                />
              ) : (
                <PokemonChip
                  key={id}
                  name={getPokemonName(id)}
                  variant="remove"
                  onAction={() => onRemove(id)}
                />
              );
            })}
          </div>
        )}

        <SearchInput
          mode="select"
          onSelect={onAdd}
          placeholder="Add a Pokemon..."
        />

        {onScan && (
          <ScreenshotUpload
            onScan={onScan}
            isScanning={isScanning}
            error={scanError}
          />
        )}
      </div>
    </CollapsibleSection>
  );
}
