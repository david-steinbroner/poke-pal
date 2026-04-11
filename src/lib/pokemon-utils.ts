import { getPokemonById } from "./team-analysis";
import type { TeamSlot } from "./team-types";
import type { PokemonType } from "./types";
import searchIndex from "@/data/pokemon-search-index.json";

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

/**
 * Match an array of raw names (e.g. from OCR) to Pokemon IDs in our dataset.
 * Tries case-insensitive exact match, then form-name normalization, then base
 * name before parentheses. Deduplicates matched results and reports unmatched.
 */
export function matchPokemonNames(names: string[]): {
  matched: { id: string; name: string }[];
  unmatched: string[];
  dupes: { name: string; count: number }[];
} {
  const index = searchIndex as { id: string; name: string }[];

  // Build a lowercase name → entry map for fast lookups
  const nameMap = new Map<string, { id: string; name: string }>();
  for (const entry of index) {
    nameMap.set(entry.name.toLowerCase(), entry);
  }

  const matchedMap = new Map<string, { id: string; name: string }>();
  const unmatched: string[] = [];
  const dupeCounts = new Map<string, number>();

  for (const raw of names) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();

    // 1. Case-insensitive exact match on name
    const exactMatch = nameMap.get(lower);
    if (exactMatch) {
      if (matchedMap.has(exactMatch.id)) {
        dupeCounts.set(exactMatch.name, (dupeCounts.get(exactMatch.name) ?? 1) + 1);
      }
      matchedMap.set(exactMatch.id, exactMatch);
      continue;
    }

    // 2. Normalize form name: "Giratina (Altered)" → "giratina-altered"
    const normalized = lower
      .replace(/\s*\(([^)]+)\)\s*/, "-$1")
      .replace(/\s+/g, "-");
    const byNormalized = getPokemonById(normalized);
    if (byNormalized) {
      matchedMap.set(byNormalized.id, { id: byNormalized.id, name: byNormalized.name });
      continue;
    }

    // 3. Try base name before parentheses: "Giratina (Altered)" → "giratina"
    const baseName = lower.replace(/\s*\(.*\)\s*/, "").trim();
    const baseMatch = nameMap.get(baseName);
    if (baseMatch) {
      matchedMap.set(baseMatch.id, baseMatch);
      continue;
    }

    // Also try base name as an ID directly
    const baseId = baseName.replace(/\s+/g, "-");
    const byBaseId = getPokemonById(baseId);
    if (byBaseId) {
      matchedMap.set(byBaseId.id, { id: byBaseId.id, name: byBaseId.name });
      continue;
    }

    unmatched.push(trimmed);
  }

  return {
    matched: [...matchedMap.values()],
    unmatched,
    dupes: [...dupeCounts.entries()].map(([name, count]) => ({ name, count })),
  };
}
