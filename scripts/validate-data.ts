import fs from "fs";
import path from "path";

type LeagueValidation = {
  id: string;
  active: boolean;
  endDate: string;
  lastUpdated: string;
  meta: { pokemonId: string; tier: string }[];
};

type ValidationResult = {
  warnings: string[];
  errors: string[];
};

export function validateLeagues(leagues: LeagueValidation[]): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const now = new Date();

  if (leagues.every((l) => !l.active)) {
    warnings.push("All leagues are inactive");
  }

  for (const league of leagues) {
    if (new Date(league.endDate) < now) {
      warnings.push(`League "${league.id}" endDate is in the past (${league.endDate})`);
    }
    if (league.active && league.meta.length === 0) {
      warnings.push(`League "${league.id}" is active but has no meta Pokemon`);
    }
  }

  return { warnings, errors };
}

export function validatePokemon(pokemon: { id: string; types: string[]; fastMoves: unknown[]; chargedMoves: unknown[] }[]): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  for (const p of pokemon) {
    if (p.types.length === 0) {
      errors.push(`Pokemon "${p.id}" has no types`);
    }
    if (p.fastMoves.length === 0) {
      errors.push(`Pokemon "${p.id}" has no fast moves`);
    }
    if (p.chargedMoves.length === 0) {
      errors.push(`Pokemon "${p.id}" has no charged moves`);
    }
  }

  return { warnings, errors };
}

if (process.argv[1]?.endsWith("validate-data.ts")) {
  const leaguesDir = path.join(process.cwd(), "src/data/leagues");
  const pokemonPath = path.join(process.cwd(), "src/data/pokemon.json");

  const leagues = fs
    .readdirSync(leaguesDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(leaguesDir, f), "utf-8")));

  const pokemon = JSON.parse(fs.readFileSync(pokemonPath, "utf-8"));

  const leagueResult = validateLeagues(leagues);
  const pokemonResult = validatePokemon(pokemon);

  const allWarnings = [...leagueResult.warnings, ...pokemonResult.warnings];
  const allErrors = [...leagueResult.errors, ...pokemonResult.errors];

  if (allWarnings.length > 0) {
    console.warn("WARNINGS:");
    allWarnings.forEach((w) => console.warn(`  ⚠ ${w}`));
  }

  if (allErrors.length > 0) {
    console.error("ERRORS:");
    allErrors.forEach((e) => console.error(`  ✗ ${e}`));
    process.exit(1);
  }

  if (allWarnings.length === 0 && allErrors.length === 0) {
    console.log("Data validation passed.");
  }
}
