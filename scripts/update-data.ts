/**
 * Data update helper — validates league, raid, and Pokemon data.
 * Run after editing any JSON in src/data/ to catch issues before build.
 *
 * Run: npx tsx scripts/update-data.ts
 *
 * What this checks:
 * - All league meta Pokemon IDs exist in pokemon.json
 * - All raid boss IDs exist in pokemon.json
 * - All leagues have required fields (id, name, cpCap, meta, lastUpdated)
 * - No duplicate Pokemon IDs
 * - lastUpdated dates are valid ISO strings
 * - Reports stale data (lastUpdated > 14 days ago)
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const dataDir = join(__dirname, "..", "src", "data");
const leagueDir = join(dataDir, "leagues");

// Load Pokemon data
const pokemon: { id: string; name: string }[] = JSON.parse(
  readFileSync(join(dataDir, "pokemon.json"), "utf-8")
);
const pokemonIds = new Set(pokemon.map((p) => p.id));

let errors = 0;
let warnings = 0;
const now = Date.now();
const STALE_DAYS = 14;

function error(msg: string) {
  console.error(`  ✗ ${msg}`);
  errors++;
}
function warn(msg: string) {
  console.warn(`  ⚠ ${msg}`);
  warnings++;
}
function ok(msg: string) {
  console.log(`  ✓ ${msg}`);
}

// Check for duplicate Pokemon IDs
console.log("\n--- Pokemon Data ---");
const idCounts = new Map<string, number>();
for (const p of pokemon) {
  idCounts.set(p.id, (idCounts.get(p.id) || 0) + 1);
}
const dupes = [...idCounts].filter(([, count]) => count > 1);
if (dupes.length > 0) {
  for (const [id, count] of dupes) error(`Duplicate Pokemon ID: ${id} (${count}x)`);
} else {
  ok(`${pokemon.length} Pokemon, no duplicates`);
}

// Check leagues
console.log("\n--- Leagues ---");
const leagueFiles = readdirSync(leagueDir).filter((f) => f.endsWith(".json"));

for (const file of leagueFiles) {
  const league = JSON.parse(readFileSync(join(leagueDir, file), "utf-8"));
  console.log(`\n  ${league.name || file}:`);

  // Required fields
  for (const field of ["id", "name", "cpCap", "meta", "lastUpdated", "season", "active", "startDate", "endDate"]) {
    if (!(field in league)) error(`Missing field: ${field}`);
  }

  // lastUpdated freshness
  if (league.lastUpdated) {
    const updated = new Date(league.lastUpdated).getTime();
    if (isNaN(updated)) {
      error(`Invalid lastUpdated date: ${league.lastUpdated}`);
    } else {
      const daysAgo = Math.floor((now - updated) / (1000 * 60 * 60 * 24));
      if (daysAgo > STALE_DAYS) {
        warn(`Data is ${daysAgo} days old (last updated ${league.lastUpdated})`);
      } else {
        ok(`Data is ${daysAgo} day${daysAgo !== 1 ? "s" : ""} old`);
      }
    }
  }

  // Meta Pokemon exist
  if (Array.isArray(league.meta)) {
    const missing = league.meta
      .map((m: { pokemonId: string }) => m.pokemonId)
      .filter((id: string) => !pokemonIds.has(id));
    if (missing.length > 0) {
      error(`Meta Pokemon not in pokemon.json: ${missing.join(", ")}`);
    } else {
      ok(`${league.meta.length} meta picks, all valid`);
    }

    // Check meta has required fields
    for (const m of league.meta) {
      if (!m.pokemonId || !m.tier || !m.recommendedFast || !m.recommendedCharged) {
        error(`Incomplete meta entry: ${JSON.stringify(m)}`);
      }
    }
  }
}

// Check raids
console.log("\n--- Current Raids ---");
const raids = JSON.parse(readFileSync(join(dataDir, "current-raids.json"), "utf-8"));

if (raids.lastUpdated) {
  const updated = new Date(raids.lastUpdated).getTime();
  const daysAgo = Math.floor((now - updated) / (1000 * 60 * 60 * 24));
  if (daysAgo > STALE_DAYS) {
    warn(`Raid data is ${daysAgo} days old (last updated ${raids.lastUpdated})`);
  } else {
    ok(`Raid data is ${daysAgo} day${daysAgo !== 1 ? "s" : ""} old`);
  }
}

const allRaidIds = [
  ...(raids.fivestar || []),
  ...(raids.mega || []),
  ...(raids.threestar || []),
  ...(raids.onestar || []),
];
const missingRaids = allRaidIds.filter((id: string) => !pokemonIds.has(id));
if (missingRaids.length > 0) {
  warn(`Raid bosses not in pokemon.json (won't show on home): ${missingRaids.join(", ")}`);
} else {
  ok(`${allRaidIds.length} raid bosses, all valid`);
}

// Summary
console.log("\n--- Summary ---");
console.log(`  ${errors} error${errors !== 1 ? "s" : ""}, ${warnings} warning${warnings !== 1 ? "s" : ""}`);
if (errors > 0) {
  console.error("\n  Fix errors before building!\n");
  process.exit(1);
} else {
  console.log("\n  Data looks good.\n");
}
