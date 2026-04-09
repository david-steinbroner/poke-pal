/**
 * Generates a slim search index from pokemon.json.
 * Only includes {id, name} pairs — keeps the client bundle small
 * when scaling past ~200 Pokemon.
 *
 * Run: npx tsx scripts/generate-search-index.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const dataDir = join(__dirname, "..", "src", "data");
const pokemon = JSON.parse(readFileSync(join(dataDir, "pokemon.json"), "utf-8"));

type PokemonEntry = { id: string; name: string };

const index: PokemonEntry[] = pokemon.map((p: PokemonEntry) => ({
  id: p.id,
  name: p.name,
}));

// Sort alphabetically for consistent output
index.sort((a: PokemonEntry, b: PokemonEntry) => a.name.localeCompare(b.name));

const outPath = join(dataDir, "pokemon-search-index.json");
writeFileSync(outPath, JSON.stringify(index, null, 2) + "\n");

console.log(`Generated search index: ${index.length} Pokemon → ${outPath}`);
