import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { CopyBar } from "@/components/copy-bar";
import { PokemonCard } from "@/components/pokemon-card";
import { BackButton } from "@/components/back-button";
import { getCountersFor, getAllPokemonIds } from "@/lib/counters";
import {
  getEffectiveness,
  getSuperEffectiveTypes,
} from "@/lib/type-effectiveness";
import { POKEMON_TYPES } from "@/lib/types";
import type { PokemonType } from "@/lib/types";
import { TYPE_COLORS } from "@/lib/constants";
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
    <div className="space-y-4 pt-4">
      <div>
        <BackButton />
        <h1 className="mt-2 text-xl font-bold">{pokemon.name} Counters</h1>
        <div className="mt-1 flex gap-1">
          {pokemon.types.map((t) => (
            <span
              key={t}
              className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Type effectiveness badges */}
        {(() => {
          const defenderTypes = pokemon.types as PokemonType[];
          const weakTo = getSuperEffectiveTypes(defenderTypes);
          const resists = POKEMON_TYPES.filter(
            (t) => getEffectiveness(t, defenderTypes) < 1.0,
          );

          return (
            <div className="mt-3 space-y-2">
              {weakTo.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    Weak to
                  </span>
                  {weakTo.map((t) => {
                    const multiplier = getEffectiveness(t, defenderTypes);
                    const isDouble = multiplier > 2.0;
                    return (
                      <span
                        key={t}
                        className={`${TYPE_COLORS[t]} rounded-full px-2 py-0.5 text-xs font-medium text-white`}
                      >
                        {t}
                        {isDouble && " 2\u00d7"}
                      </span>
                    );
                  })}
                </div>
              )}
              {resists.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    Resists
                  </span>
                  {resists.map((t) => (
                    <span
                      key={t}
                      className={`${TYPE_COLORS[t]} rounded-full px-2 py-0.5 text-xs font-medium text-white`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      <CopyBar searchString={result.searchString} />

      {result.topCounters.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">
            Top Counters
          </h2>
          <div className="space-y-2">
            {result.topCounters.map((counter) => {
              const counterPokemon = pokemonData.find(
                (p) => p.id === counter.pokemon,
              );
              return (
                <PokemonCard
                  key={counter.pokemon}
                  counter={counter}
                  pokemonTypes={
                    counterPokemon?.types as PokemonType[] | undefined
                  }
                />
              );
            })}
          </div>
        </div>
      )}

      {result.budgetCounters.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">
            Budget Picks
          </h2>
          <div className="space-y-2">
            {result.budgetCounters.map((counter) => {
              const counterPokemon = pokemonData.find(
                (p) => p.id === counter.pokemon,
              );
              return (
                <PokemonCard
                  key={counter.pokemon}
                  counter={counter}
                  pokemonTypes={
                    counterPokemon?.types as PokemonType[] | undefined
                  }
                />
              );
            })}
          </div>
        </div>
      )}

      {result.shadowSearchString && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">
            Shadow Variant
          </h2>
          <CopyBar searchString={result.shadowSearchString} />
        </div>
      )}

      <Link
        href={`/teams?l=great-league&p=${pokemon.id}`}
        className="flex min-h-11 items-center justify-center rounded-lg border-2 border-dashed px-4 py-3 text-sm font-medium transition-colors hover:bg-accent active:bg-accent active:scale-[0.98]"
      >
        Build a team around {pokemon.name} (Great League)
      </Link>
    </div>
  );
}
