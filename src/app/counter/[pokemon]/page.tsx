import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CopyButton } from "@/components/copy-button";
import { PokemonListItem } from "@/components/pokemon-list-item";
import { BackButton } from "@/components/back-button";
import { FixedHeader } from "@/components/fixed-header";
import { getCountersFor, getAllPokemonIds } from "@/lib/counters";
import {
  getEffectiveness,
  getSuperEffectiveTypes,
} from "@/lib/type-effectiveness";
import { POKEMON_TYPES } from "@/lib/types";
import type { PokemonType } from "@/lib/types";
import { TypeBadge } from "@/components/type-badge";
import pokemonData from "@/data/pokemon.json";

export function generateStaticParams() {
  return getAllPokemonIds().map((pokemon) => ({ pokemon }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pokemon: string }>;
}): Promise<Metadata> {
  const { pokemon: pokemonId } = await params;
  const pokemon = pokemonData.find((p) => p.id === pokemonId);
  if (!pokemon) return { title: "Not Found" };
  return {
    title: `${pokemon.name} Counters — Pokemon GO Search Strings`,
    description: `Best counters for ${pokemon.name} in Pokemon GO. Copy the search string and paste in-game.`,
    openGraph: {
      title: `${pokemon.name} Counters — Pokemon GO Search Strings`,
      description: `Best counters for ${pokemon.name} in Pokemon GO. Copy the search string and paste in-game.`,
    },
  };
}

export default async function CounterPage({
  params,
}: {
  params: Promise<{ pokemon: string }>;
}) {
  const { pokemon: pokemonId } = await params;
  const pokemon = pokemonData.find((p) => p.id === pokemonId);
  if (!pokemon) notFound();

  const result = getCountersFor(pokemonId);

  return (
    <div className="space-y-5">
      <FixedHeader>
        <BackButton />
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-bold">{pokemon.name}</h1>
          {pokemon.types.map((t) => (
            <TypeBadge key={t} type={t} variant="muted" />
          ))}
        </div>
        <div className="mt-3">
          <CopyButton searchString={result.searchString} label="Copy Counters Search String" />
        </div>
      </FixedHeader>

      {/* Type effectiveness badges */}
      {(() => {
        const defenderTypes = pokemon.types as PokemonType[];
        const weakTo = getSuperEffectiveTypes(defenderTypes);
        const resists = POKEMON_TYPES.filter(
          (t) => getEffectiveness(t, defenderTypes) < 1.0,
        );

        return (
          <div className="space-y-3">
            {weakTo.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">
                  Weak to
                </span>
                {weakTo.map((t) => {
                  const multiplier = getEffectiveness(t, defenderTypes);
                  const isDouble = multiplier > 2.0;
                  return (
                    <span key={t} className="inline-flex items-center gap-0.5">
                      <TypeBadge type={t} />
                      {isDouble && (
                        <span className="text-sm font-medium text-muted-foreground">
                          2{"\u00d7"}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
            {resists.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">
                  Resists
                </span>
                {resists.map((t) => (
                  <TypeBadge key={t} type={t} />
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {result.topCounters.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            Top Counters
          </h2>
          <div className="space-y-3">
            {result.topCounters.map((counter) => {
              const counterPokemon = pokemonData.find(
                (p) => p.id === counter.pokemon,
              );
              const counterName = counterPokemon?.name ?? counter.pokemon.replace(/-/g, " ");
              return (
                <PokemonListItem
                  key={counter.pokemon}
                  name={counterName}
                  fastMove={counter.fastMove}
                  chargedMoves={counter.chargedMoves}
                />
              );
            })}
          </div>
        </div>
      )}

      {result.budgetCounters.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            Budget Picks
          </h2>
          <div className="space-y-3">
            {result.budgetCounters.map((counter) => {
              const counterPokemon = pokemonData.find(
                (p) => p.id === counter.pokemon,
              );
              const counterName = counterPokemon?.name ?? counter.pokemon.replace(/-/g, " ");
              return (
                <PokemonListItem
                  key={counter.pokemon}
                  name={counterName}
                  fastMove={counter.fastMove}
                  chargedMoves={counter.chargedMoves}
                />
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
