import type { PokemonType } from "./types";

export function buildTypeSearchString(types: PokemonType[]): string {
  if (types.length === 0) return "";
  return types.map((t) => `@1${t.toLowerCase()}`).join(",");
}

export function buildNameSearchString(names: string[]): string {
  return names.map((n) => n.toLowerCase()).join(",");
}

export function buildShadowSearchString(types: PokemonType[]): string {
  const typeString = buildTypeSearchString(types);
  if (!typeString) return "";
  return `shadow&${typeString}`;
}

export function buildHighCpSearchString(
  types: PokemonType[],
  minCp: number,
): string {
  const typeString = buildTypeSearchString(types);
  if (!typeString) return "";
  return `${typeString}&cp${minCp}-`;
}

export function buildLeagueEligibleString(cpCap: number): string {
  return `cp-${cpCap}`;
}
