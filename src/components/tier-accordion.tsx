"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { MetaPokemon } from "@/lib/types";
import { PokemonListItem } from "./pokemon-list-item";
import pokemonData from "@/data/pokemon.json";

const TIER_LABELS: Record<string, string> = {
  S: "S Tier — Meta Defining",
  A: "A Tier — Strong Picks",
  B: "B Tier — Solid Options",
  C: "C Tier — Niche Picks",
};

/** Look up display name from pokemon data, or format the ID as fallback. */
function getDisplayName(pokemonId: string): string {
  const found = pokemonData.find((p) => p.id === pokemonId);
  return found?.name ?? pokemonId.replace(/-/g, " ");
}

export function TierAccordion({
  meta,
  onAddToTeam,
  teamPokemonIds,
  recommendedIds,
}: {
  meta: MetaPokemon[];
  onAddToTeam?: (pokemonId: string) => void;
  teamPokemonIds?: string[];
  recommendedIds?: string[];
}) {
  const recSet = new Set(recommendedIds ?? []);
  const tiers = ["S", "A", "B", "C"] as const;
  const grouped = tiers
    .map((tier) => ({
      tier,
      pokemon: meta.filter((p) => p.tier === tier),
    }))
    .filter((g) => g.pokemon.length > 0);

  return (
    <Accordion multiple defaultValue={["S"]}>
      {grouped.map(({ tier, pokemon }) => {
        // Sort recommended Pokemon to top within each tier
        const sorted = [...pokemon].sort((a, b) => {
          const aRec = recSet.has(a.pokemonId) ? 0 : 1;
          const bRec = recSet.has(b.pokemonId) ? 0 : 1;
          return aRec - bRec;
        });

        return (
          <AccordionItem key={tier} value={tier}>
            <AccordionTrigger className="text-sm font-medium">
              {TIER_LABELS[tier]} ({pokemon.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {sorted.map((p) => {
                  const isOnTeam = teamPokemonIds?.includes(p.pokemonId) ?? false;
                  return (
                    <PokemonListItem
                      key={p.pokemonId}
                      name={getDisplayName(p.pokemonId)}
                      tier={p.tier}
                      fastMove={p.recommendedFast}
                      chargedMoves={p.recommendedCharged}
                      recommended={recSet.has(p.pokemonId)}
                      action={
                        onAddToTeam
                          ? isOnTeam
                            ? "added"
                            : "add"
                          : undefined
                      }
                      onAction={
                        onAddToTeam
                          ? () => onAddToTeam(p.pokemonId)
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
