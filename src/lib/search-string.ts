import type { PokemonType } from "./types";

export function buildTypeSearchString(types: PokemonType[]): string {
  if (types.length === 0) return "";
  return types.map((t) => `@1${t.toLowerCase()}`).join(",");
}

export function buildNameSearchString(names: string[]): string {
  return names
    .map((n) => n.replace(/\s*\(.*?\)\s*/g, "").trim().toLowerCase())
    .join(",");
}

export function buildLeagueEligibleString(cpCap: number): string {
  return `cp-${cpCap}`;
}
