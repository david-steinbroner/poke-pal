/**
 * Fetch pvpoke rankings for active leagues and write slim JSON for the ranker.
 *
 * Run: npx tsx scripts/fetch-rankings.ts
 *
 * Outputs to public/data/rankings/<league>.json with shape:
 *   { speciesId, speciesName, rank, score, moveset, elite[] }
 *
 * Also fetches pvpoke pokemon gamemaster to flag elite/legacy moves.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), "public/data/rankings");

type PvPokeRanking = {
  speciesId: string;
  speciesName: string;
  rating: number;
  moveset: string[];
  score: number;
};

type PvPokePokemon = {
  speciesId: string;
  eliteMoves?: string[];
};

type SlimRanking = {
  speciesId: string;
  speciesName: string;
  rank: number;
  score: number;
  moveset: string[];
  elite: string[];
};

const LEAGUE_ENDPOINTS: Record<string, { url: string; label: string }> = {
  "spring-cup": {
    url: "https://pvpoke.com/data/rankings/spring/overall/rankings-1500.json",
    label: "Spring Cup (GL)",
  },
  "master-league": {
    url: "https://pvpoke.com/data/rankings/all/overall/rankings-10000.json",
    label: "Master League",
  },
};

const GAMEMASTER_URL = "https://pvpoke.com/data/gamemaster/pokemon.json";

function formatMoveName(moveId: string): string {
  return moveId
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

async function fetchJson<T>(url: string): Promise<T> {
  console.log(`  Fetching ${url}`);
  const res = await fetch(url, {
    headers: { "User-Agent": "poke-pal/1.8.0 (pokemon-go-companion)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  console.log("[fetch-rankings] Loading pvpoke pokemon gamemaster for elite move flags...");
  const gamemaster = await fetchJson<PvPokePokemon[]>(GAMEMASTER_URL);
  const eliteMap = new Map<string, Set<string>>();
  for (const p of gamemaster) {
    if (p.eliteMoves && p.eliteMoves.length > 0) {
      eliteMap.set(p.speciesId, new Set(p.eliteMoves));
    }
  }
  console.log(`  ${eliteMap.size} pokemon have elite moves`);

  for (const [leagueId, { url, label }] of Object.entries(LEAGUE_ENDPOINTS)) {
    console.log(`\n[fetch-rankings] ${label}...`);
    const rankings = await fetchJson<PvPokeRanking[]>(url);

    const slim: SlimRanking[] = rankings.map((entry, i) => {
      const eliteMoves = eliteMap.get(entry.speciesId);
      const elite = entry.moveset.filter((m) => eliteMoves?.has(m)) ?? [];

      return {
        speciesId: entry.speciesId,
        speciesName: entry.speciesName,
        rank: i + 1,
        score: entry.score,
        moveset: entry.moveset.map(formatMoveName),
        elite: elite.map(formatMoveName),
      };
    });

    const outPath = join(OUT_DIR, `${leagueId}.json`);
    writeFileSync(outPath, JSON.stringify(slim, null, 2) + "\n");
    console.log(`  Wrote ${outPath} (${slim.length} entries, ${Math.round(Buffer.byteLength(JSON.stringify(slim)) / 1024)}KB)`);

    // Validate: check for known meta mons
    console.log(`  Top 5: ${slim.slice(0, 5).map((s) => s.speciesName).join(", ")}`);
  }

  console.log("\n[fetch-rankings] Done.");
}

main().catch((err) => {
  console.error("[fetch-rankings] Failed:", err);
  process.exit(1);
});
