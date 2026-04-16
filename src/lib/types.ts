export const POKEMON_TYPES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy",
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

export type Pokemon = {
  id: string;
  name: string;
  types: PokemonType[];
  fastMoves: Move[];
  chargedMoves: Move[];
  baseStats: { atk: number; def: number; sta: number };
};

export type Move = {
  name: string;
  type: PokemonType;
  isCharged: boolean;
  pvpPower: number;
  pvpEnergy: number;
};

export type CounterRecommendation = {
  pokemon: string;
  fastMove: string;
  chargedMoves: string[];
  tier: "top" | "budget";
};

export type League = {
  id: string;
  name: string;
  cpCap: number;
  typeRestrictions?: PokemonType[];
  season: string;
  active: boolean;
  startDate: string;
  endDate: string;
  lastUpdated: string;
  meta: MetaPokemon[];
};

export type MetaPokemon = {
  pokemonId: string;
  tier: "S" | "A" | "B" | "C";
  recommendedFast: string;
  recommendedCharged: string[];
  elite?: string[];
};
