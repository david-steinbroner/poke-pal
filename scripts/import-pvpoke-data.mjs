#!/usr/bin/env node
/**
 * Import Pokemon data from PvPoke's open-source gamemaster.
 * Transforms to Poke Pal format and writes pokemon.json + pokemon-search-index.json.
 *
 * Usage: node scripts/import-pvpoke-data.mjs
 */

import { writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

const POKEMON_URL = "https://raw.githubusercontent.com/pvpoke/pvpoke/master/src/data/gamemaster/pokemon.json";
const MOVES_URL = "https://raw.githubusercontent.com/pvpoke/pvpoke/master/src/data/gamemaster/moves.json";

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatName(speciesName) {
  // Clean up display name
  return speciesName
    .replace(/_/g, " ")
    .split(" ")
    .map(w => capitalize(w))
    .join(" ");
}

function formatType(type) {
  // PvPoke uses lowercase, we use capitalized
  return capitalize(type);
}

async function main() {
  console.log("Fetching PvPoke Pokemon data...");
  const rawPokemon = await fetchJSON(POKEMON_URL);
  console.log(`  Got ${rawPokemon.length} Pokemon entries`);

  console.log("Fetching PvPoke moves data...");
  const rawMoves = await fetchJSON(MOVES_URL);
  console.log(`  Got ${rawMoves.length} move entries`);

  // Build move lookup maps
  const moveMap = new Map();
  for (const move of rawMoves) {
    moveMap.set(move.moveId, move);
    // Also map by name for fallback
    moveMap.set(move.name?.toUpperCase()?.replace(/\s+/g, "_"), move);
  }

  // Filter: only released Pokemon, skip megas/shadows for now (they have separate entries)
  const released = rawPokemon.filter(p => p.released);
  console.log(`  ${released.length} released Pokemon`);

  // Load existing data to preserve any custom entries
  let existingMap = new Map();
  try {
    const existing = JSON.parse(readFileSync(join(DATA_DIR, "pokemon.json"), "utf8"));
    for (const p of existing) {
      existingMap.set(p.id, p);
    }
    console.log(`  ${existingMap.size} existing entries loaded`);
  } catch {
    console.log("  No existing pokemon.json found");
  }

  const pokemonList = [];
  let skipped = 0;

  for (const p of released) {
    // Normalize ID to use hyphens (PvPoke uses underscores)
    const id = p.speciesId.replace(/_/g, "-");
    const name = p.speciesName || formatName(id);

    // Resolve fast moves
    const fastMoves = (p.fastMoves || []).map(moveId => {
      const move = moveMap.get(moveId) || moveMap.get(moveId.toUpperCase());
      if (!move) return null;
      return {
        name: move.name,
        type: formatType(move.type),
        isCharged: false,
        pvpPower: move.power || 0,
        pvpEnergy: move.energyGain || 0,
      };
    }).filter(Boolean);

    // Resolve charged moves
    const chargedMoves = (p.chargedMoves || []).map(moveId => {
      const move = moveMap.get(moveId) || moveMap.get(moveId.toUpperCase());
      if (!move) return null;
      return {
        name: move.name,
        type: formatType(move.type),
        isCharged: true,
        pvpPower: move.power || 0,
        pvpEnergy: move.energy || 0,
      };
    }).filter(Boolean);

    // Include elite moves too
    const eliteChargedMoves = (p.eliteMoves || []).map(moveId => {
      const move = moveMap.get(moveId) || moveMap.get(moveId.toUpperCase());
      if (!move) return null;
      // Check if it's a fast or charged move
      const isCharged = (move.energy || 0) > 0;
      return {
        name: move.name,
        type: formatType(move.type),
        isCharged,
        pvpPower: move.power || 0,
        pvpEnergy: isCharged ? (move.energy || 0) : (move.energyGain || 0),
      };
    }).filter(Boolean);

    // Add elite moves to their respective arrays if not already present
    for (const em of eliteChargedMoves) {
      if (em.isCharged) {
        if (!chargedMoves.some(m => m.name === em.name)) {
          chargedMoves.push(em);
        }
      } else {
        if (!fastMoves.some(m => m.name === em.name)) {
          fastMoves.push(em);
        }
      }
    }

    // Skip if no moves at all
    if (fastMoves.length === 0 && chargedMoves.length === 0) {
      skipped++;
      continue;
    }

    const types = (p.types || []).map(formatType);
    const baseStats = {
      atk: p.baseStats?.atk || 0,
      def: p.baseStats?.def || 0,
      sta: p.baseStats?.hp || p.baseStats?.sta || 0,
    };

    pokemonList.push({
      id,
      name,
      types,
      fastMoves,
      chargedMoves,
      baseStats,
    });
  }

  // Sort alphabetically by name
  pokemonList.sort((a, b) => a.name.localeCompare(b.name));

  console.log(`\nTransformed ${pokemonList.length} Pokemon (skipped ${skipped} with no moves)`);

  // Write pokemon.json
  const pokemonPath = join(DATA_DIR, "pokemon.json");
  writeFileSync(pokemonPath, JSON.stringify(pokemonList, null, 2) + "\n");
  console.log(`Wrote ${pokemonPath}`);

  // Write slim search index
  const searchIndex = pokemonList.map(p => ({ id: p.id, name: p.name }));
  const searchIndexPath = join(DATA_DIR, "pokemon-search-index.json");
  writeFileSync(searchIndexPath, JSON.stringify(searchIndex) + "\n");
  console.log(`Wrote ${searchIndexPath}`);

  // Stats
  const totalFastMoves = new Set(pokemonList.flatMap(p => p.fastMoves.map(m => m.name))).size;
  const totalChargedMoves = new Set(pokemonList.flatMap(p => p.chargedMoves.map(m => m.name))).size;
  console.log(`\nStats:`);
  console.log(`  Pokemon: ${pokemonList.length}`);
  console.log(`  Unique fast moves: ${totalFastMoves}`);
  console.log(`  Unique charged moves: ${totalChargedMoves}`);
  console.log(`  Types: ${new Set(pokemonList.flatMap(p => p.types)).size}`);
}

main().catch(console.error);
