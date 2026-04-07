import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CopyBar } from "@/components/copy-bar";
import { PokemonCard } from "@/components/pokemon-card";
import { getCountersFor, getAllPokemonIds } from "@/lib/counters";
import pokemonData from "@/data/pokemon.json";
import type { PokemonType } from "@/lib/types";
import Link from "next/link";

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
    title: `${pokemon.name} Counters — Poke Pal`,
    description: `Best counters for ${pokemon.name} in Pokemon GO. Copy the search string and paste in-game.`,
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
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back
        </Link>
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
    </div>
  );
}
