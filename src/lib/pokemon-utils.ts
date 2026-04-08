import { getPokemonById } from "./team-analysis";
import type { TeamSlot } from "./team-types";
import type { PokemonType } from "./types";

export function pokemonToSlot(id: string): TeamSlot {
  const p = getPokemonById(id);
  if (!p) return null;
  return {
    pokemonId: p.id,
    name: p.name,
    types: p.types as PokemonType[],
    fastMoves: p.fastMoves.map((m) => ({
      name: m.name,
      type: m.type as PokemonType,
    })),
    chargedMoves: p.chargedMoves.map((m) => ({
      name: m.name,
      type: m.type as PokemonType,
    })),
  };
}

/** Get Pokemon display name by ID */
export function getPokemonName(id: string): string {
  const p = getPokemonById(id);
  return p?.name ?? id.replace(/-/g, " ");
}
