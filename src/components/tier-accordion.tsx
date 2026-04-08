"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { MetaPokemon } from "@/lib/types";
import { MetaPokemonCard } from "./meta-pokemon-card";

const TIER_LABELS: Record<string, string> = {
  S: "S Tier — Meta Defining",
  A: "A Tier — Strong Picks",
  B: "B Tier — Solid Options",
  C: "C Tier — Niche Picks",
};

export function TierAccordion({
  meta,
  onAddToTeam,
  teamPokemonIds,
}: {
  meta: MetaPokemon[];
  onAddToTeam?: (pokemonId: string) => void;
  teamPokemonIds?: string[];
}) {
  const tiers = ["S", "A", "B", "C"] as const;
  const grouped = tiers
    .map((tier) => ({
      tier,
      pokemon: meta.filter((p) => p.tier === tier),
    }))
    .filter((g) => g.pokemon.length > 0);

  return (
    <Accordion multiple defaultValue={["S", "A"]}>
      {grouped.map(({ tier, pokemon }) => (
        <AccordionItem key={tier} value={tier}>
          <AccordionTrigger className="text-sm font-medium">
            {TIER_LABELS[tier]} ({pokemon.length})
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {pokemon.map((p) => (
                <MetaPokemonCard
                  key={p.pokemonId}
                  pokemon={p}
                  onAdd={
                    onAddToTeam
                      ? () => onAddToTeam(p.pokemonId)
                      : undefined
                  }
                  isOnTeam={teamPokemonIds?.includes(p.pokemonId)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
