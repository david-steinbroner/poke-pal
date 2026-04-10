import type { PokemonType } from "./types";

// LeagueId is now derived from data — re-export for convenience
export type { LeagueId } from "@/data/leagues";

export type TeamRole = "lead" | "safe-swap" | "closer";

export type RoleAssignment = {
  pokemonId: string;
  role: TeamRole;
  reasoning: string; // e.g., "Strong lead — covers 4 meta threats"
};

export type TeamSlot = {
  pokemonId: string;
  name: string;
  types: PokemonType[];
  fastMoves: { name: string; type: PokemonType }[];
  chargedMoves: { name: string; type: PokemonType }[];
} | null;

export type TypeCoverage = {
  type: PokemonType;
  multiplier: number;      // best effectiveness any team member achieves
  coveredBy: string[];     // pokemon names that cover this type
};

export type TeamThreat = {
  pokemonId: string;
  name: string;
  threatTypes: PokemonType[];  // attack types that hit 2+ team members SE
  threatenedMembers: string[]; // which team members are threatened
};

export type SwapSuggestion = {
  pokemonId: string;
  name: string;
  types: PokemonType[];
  reason: string;           // e.g. "covers Ice, Dragon; resists shared weaknesses"
  gapsCovered: number;
  score?: number;           // weighted composite score for ranking
};

export type TeamAnalysis = {
  offensiveCoverage: TypeCoverage[];   // all 18 types, sorted by coverage
  defensiveWeaknesses: TypeCoverage[]; // types that hit 2+ members SE
  threats: TeamThreat[];               // meta Pokemon that threaten the team
  suggestions: SwapSuggestion[];       // swap suggestions from meta
  searchString: string;                // combined name + CP search string
  coverageScore: number;               // X out of 18 types covered (SE)
};
