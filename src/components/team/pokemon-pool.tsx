"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PokemonChip } from "@/components/pokemon-chip";
import { SearchInput } from "@/components/search-input";
import { ScreenshotUpload } from "@/components/team/screenshot-upload";
import { getPokemonName } from "@/lib/pokemon-utils";
import type { ReactNode } from "react";

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
  defaultOpen = true,
  onScan,
  isScanning = false,
  scanError,
}: PokemonPoolProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-1.5 py-2 text-sm font-semibold active:opacity-70"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        My Pokemon ({pool.length})
      </button>

      {isOpen && (
        <div className="space-y-3">
          {pool.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
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
      )}
    </div>
  );
}
