import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCountersFor, getAllPokemonIds } from "@/lib/counters";
import {
  getEffectiveness,
  getSuperEffectiveTypes,
} from "@/lib/type-effectiveness";
import { POKEMON_TYPES } from "@/lib/types";
import type { PokemonType } from "@/lib/types";
import pokemonData from "@/data/pokemon.json";
import { CounterPageClient } from "@/components/counter-page-client";

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
  const defenderTypes = pokemon.types as PokemonType[];
  const weakTo = getSuperEffectiveTypes(defenderTypes);
  const resists = POKEMON_TYPES.filter(
    (t) => getEffectiveness(t, defenderTypes) < 1.0,
  );

  const topCounterNames = result.topCounters.map((c) => {
    const p = pokemonData.find((p) => p.id === c.pokemon);
    return p?.name ?? c.pokemon;
  });
  const topCountersSearchString = topCounterNames
    .map((n) => n.toLowerCase())
    .join(",");

  return (
    <CounterPageClient
      pokemonName={pokemon.name}
      pokemonTypes={pokemon.types}
      typeSearchString={result.searchString}
      topCountersSearchString={topCountersSearchString}
      weakTo={weakTo.map((t) => ({
        type: t,
        isDouble: getEffectiveness(t, defenderTypes) > 2.0,
      }))}
      resists={resists}
      topCounters={result.topCounters.map((c) => {
        const p = pokemonData.find((p) => p.id === c.pokemon);
        return {
          name: p?.name ?? c.pokemon.replace(/-/g, " "),
          fastMove: c.fastMove,
          chargedMoves: c.chargedMoves,
        };
      })}
      budgetCounters={result.budgetCounters.map((c) => {
        const p = pokemonData.find((p) => p.id === c.pokemon);
        return {
          name: p?.name ?? c.pokemon.replace(/-/g, " "),
          fastMove: c.fastMove,
          chargedMoves: c.chargedMoves,
        };
      })}
    />
  );
}
