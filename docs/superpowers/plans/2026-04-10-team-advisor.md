# Team Advisor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a state-driven team advisor to the Teams page that scans Pokemon GO screenshots, recommends optimal teams, and provides tactical strategy tips.

**Architecture:** 4-state flow on existing Teams page (Copy CP → Build Pool → Recommendations → Team Loaded). Screenshot processing via Cloudflare Pages Function + Claude Vision API. Two-pass combo scoring: lightweight fast pass on all combos, full analysis on top 5 only. Template-based strategy tips from move energy data.

**Tech Stack:** Next.js 16, TypeScript strict, Tailwind CSS, Cloudflare Pages Functions, Claude API (Haiku for vision), Vitest

**Revision:** v1.1 — incorporates product + engineering review feedback. Consolidated files, dead code cleanup, two-pass scoring, Pages Function instead of standalone Worker, skip link, future-proof storage.

**Spec:** `docs/superpowers/specs/2026-04-10-team-advisor-design.md`

**Figma:** Proposed Updates 5 in `Poke Pal — Screen Layouts` (4 Teams state screens)

---

## File Structure (Revised — consolidated per review)

### New Files (7, down from 13)

| File | Responsibility |
|------|----------------|
| `src/lib/team-advisor.ts` | Two-pass combo scorer + strategy tips generator (~250 lines) |
| `src/components/team/screenshot-upload.tsx` | Upload UI for 2 screenshots + scan button |
| `src/components/team/pokemon-pool.tsx` | "My Pokemon" collapsible chip grid + search |
| `src/components/team/recommended-teams.tsx` | Recommended team cards with strategy |
| `__tests__/team-advisor.test.ts` | Combo scoring, ranking, and strategy tips tests |
| `__tests__/pokemon-matcher.test.ts` | Name matching tests (for matchPokemonNames in pokemon-utils) |
| `functions/api/scan.ts` | Cloudflare Pages Function — screenshot → Claude Vision → Pokemon names |

### Modified Files (7)

| File | Change |
|------|--------|
| `src/app/teams/page.tsx` | Replace with 4-state flow. Remove league info row, rating row, discovery string. Add "skip" link. |
| `src/lib/team-storage.ts` | Add pool CRUD: `saveAdvisorState`, `loadAdvisorState`, `addToPool`, `removeFromPool`. Uses `poke-pal:advisor:{leagueId}` key. |
| `src/lib/pokemon-utils.ts` | Add `matchPokemonNames()` — OCR result matching. Reuses `getPokemonById`. |
| `src/lib/team-analysis.ts` | **Delete**: `buildDiscoveryString` (lines 269-324), `suggestSwaps` (lines 174-257). Remove `discoveryString` and `suggestions` from `analyzeTeam` return. |
| `src/lib/team-types.ts` | **Delete**: `SwapSuggestion` type, `discoveryString` field, `suggestions` field from `TeamAnalysis`. |
| `src/components/team/team-slot.tsx` | Add optional `role` prop to show LEAD/SAFE SWAP/CLOSER labels |
| `src/lib/constants.ts` | Bump APP_VERSION to 1.1.0 |

### What Got Consolidated (review feedback)

| Was | Now | Why |
|-----|-----|-----|
| `pool-storage.ts` (new) | Added to `team-storage.ts` | Same pattern, same file. Future-proof: single storage module to swap to API-backed store. |
| `pokemon-matcher.ts` (new) | Added to `pokemon-utils.ts` | Reuses `getPokemonById`, avoids duplicate pokemon.json import |
| `strategy-tips.ts` (new) | Merged into `team-advisor.ts` | Only consumer is the advisor. ~120 lines. |
| `workers/scan/` (new dir) | `functions/api/scan.ts` | Pages Function deploys with the project. No separate Worker, no CORS, no wrangler.toml. |
| `__tests__/pool-storage.test.ts` | Tests in `__tests__/team-advisor.test.ts` | Pool is just localStorage — 3 lines of test. |
| `__tests__/strategy-tips.test.ts` | Tests in `__tests__/team-advisor.test.ts` | Consolidated with advisor tests. |

---

## Chunk 1: Data Layer (pool-storage, pokemon-matcher, team-advisor, strategy-tips)

### Task 1: Pool Storage

**Files:**
- Create: `src/lib/pool-storage.ts`
- Create: `__tests__/pool-storage.test.ts`

- [ ] **Step 1: Write failing tests for pool storage**

```typescript
// __tests__/pool-storage.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { savePool, loadPool, clearPool, addToPool, removeFromPool } from "@/lib/pool-storage";

beforeEach(() => {
  localStorage.clear();
});

describe("pool-storage", () => {
  it("saves and loads a pool", () => {
    savePool("ultra-league", ["dragonite", "venusaur", "feraligatr"]);
    expect(loadPool("ultra-league")).toEqual(["dragonite", "venusaur", "feraligatr"]);
  });

  it("returns empty array for missing pool", () => {
    expect(loadPool("ultra-league")).toEqual([]);
  });

  it("clears a pool", () => {
    savePool("ultra-league", ["dragonite"]);
    clearPool("ultra-league");
    expect(loadPool("ultra-league")).toEqual([]);
  });

  it("adds to pool without duplicates", () => {
    savePool("ultra-league", ["dragonite"]);
    const result = addToPool("ultra-league", "venusaur");
    expect(result).toEqual(["dragonite", "venusaur"]);
    const noDupe = addToPool("ultra-league", "dragonite");
    expect(noDupe).toEqual(["dragonite", "venusaur"]);
  });

  it("removes from pool", () => {
    savePool("ultra-league", ["dragonite", "venusaur"]);
    const result = removeFromPool("ultra-league", "dragonite");
    expect(result).toEqual(["venusaur"]);
  });

  it("pools are per-league", () => {
    savePool("ultra-league", ["dragonite"]);
    savePool("great-league", ["azumarill"]);
    expect(loadPool("ultra-league")).toEqual(["dragonite"]);
    expect(loadPool("great-league")).toEqual(["azumarill"]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd ~/Projects/Pokemon\ GO/poke-pal && npx vitest run __tests__/pool-storage.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement pool-storage.ts**

```typescript
// src/lib/pool-storage.ts
const PREFIX = "poke-pal:pool:";

export function savePool(leagueId: string, pool: string[]): void {
  try {
    localStorage.setItem(`${PREFIX}${leagueId}`, JSON.stringify(pool));
  } catch {}
}

export function loadPool(leagueId: string): string[] {
  try {
    const stored = localStorage.getItem(`${PREFIX}${leagueId}`);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function clearPool(leagueId: string): void {
  try {
    localStorage.removeItem(`${PREFIX}${leagueId}`);
  } catch {}
}

export function addToPool(leagueId: string, pokemonId: string): string[] {
  const pool = loadPool(leagueId);
  if (!pool.includes(pokemonId)) {
    pool.push(pokemonId);
    savePool(leagueId, pool);
  }
  return pool;
}

export function removeFromPool(leagueId: string, pokemonId: string): string[] {
  const pool = loadPool(leagueId).filter((id) => id !== pokemonId);
  savePool(leagueId, pool);
  return pool;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd ~/Projects/Pokemon\ GO/poke-pal && npx vitest run __tests__/pool-storage.test.ts`
Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
cd ~/Projects/Pokemon\ GO/poke-pal
git add src/lib/pool-storage.ts __tests__/pool-storage.test.ts
git commit -m "feat: add pool storage for Team Advisor Pokemon pool per league"
```

---

### Task 2: Pokemon Name Matcher

OCR results from screenshots won't always match our IDs exactly. This module fuzzy-matches names like "Giratina (Altered)" → "giratina-altered".

**Files:**
- Create: `src/lib/pokemon-matcher.ts`
- Create: `__tests__/pokemon-matcher.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/pokemon-matcher.test.ts
import { describe, it, expect } from "vitest";
import { matchPokemonNames } from "@/lib/pokemon-matcher";

describe("matchPokemonNames", () => {
  it("matches exact names", () => {
    const result = matchPokemonNames(["Dragonite", "Venusaur"]);
    expect(result.matched).toContainEqual(expect.objectContaining({ id: "dragonite" }));
    expect(result.matched).toContainEqual(expect.objectContaining({ id: "venusaur" }));
    expect(result.unmatched).toEqual([]);
  });

  it("matches case-insensitive", () => {
    const result = matchPokemonNames(["DRAGONITE", "venusaur"]);
    expect(result.matched.length).toBe(2);
  });

  it("matches form names with parentheses", () => {
    const result = matchPokemonNames(["Giratina (Altered)"]);
    expect(result.matched[0]?.id).toBe("giratina-altered");
  });

  it("reports unmatched names", () => {
    const result = matchPokemonNames(["Dragonite", "FakeMon123"]);
    expect(result.matched.length).toBe(1);
    expect(result.unmatched).toEqual(["FakeMon123"]);
  });

  it("deduplicates matched Pokemon", () => {
    const result = matchPokemonNames(["Dragonite", "Dragonite", "dragonite"]);
    expect(result.matched.length).toBe(1);
  });

  it("handles empty input", () => {
    const result = matchPokemonNames([]);
    expect(result.matched).toEqual([]);
    expect(result.unmatched).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd ~/Projects/Pokemon\ GO/poke-pal && npx vitest run __tests__/pokemon-matcher.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement pokemon-matcher.ts**

```typescript
// src/lib/pokemon-matcher.ts
import pokemonData from "@/data/pokemon.json";
import type { Pokemon } from "./types";

const allPokemon = pokemonData as Pokemon[];

// Build lookup maps once
const byId = new Map(allPokemon.map((p) => [p.id, p]));
const byNameLower = new Map(allPokemon.map((p) => [p.name.toLowerCase(), p]));

// "Giratina (Altered)" → "giratina-altered"
function normalizeFormName(name: string): string {
  return name
    .replace(/\s*\(([^)]+)\)\s*/, "-$1") // "Foo (Bar)" → "Foo-Bar"
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export function matchPokemonNames(names: string[]): {
  matched: { id: string; name: string }[];
  unmatched: string[];
} {
  const matched: { id: string; name: string }[] = [];
  const unmatched: string[] = [];
  const seenIds = new Set<string>();

  for (const raw of names) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // Try exact name match (case-insensitive)
    let found = byNameLower.get(trimmed.toLowerCase());

    // Try normalized form name as ID
    if (!found) {
      const normalized = normalizeFormName(trimmed);
      found = byId.get(normalized);
    }

    // Try just the base name (before parentheses)
    if (!found) {
      const baseName = trimmed.split("(")[0]!.trim().toLowerCase();
      found = byNameLower.get(baseName);
    }

    if (found && !seenIds.has(found.id)) {
      seenIds.add(found.id);
      matched.push({ id: found.id, name: found.name });
    } else if (!found) {
      unmatched.push(trimmed);
    }
  }

  return { matched, unmatched };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd ~/Projects/Pokemon\ GO/poke-pal && npx vitest run __tests__/pokemon-matcher.test.ts`
Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
cd ~/Projects/Pokemon\ GO/poke-pal
git add src/lib/pokemon-matcher.ts __tests__/pokemon-matcher.test.ts
git commit -m "feat: add Pokemon name matcher for OCR result fuzzy matching"
```

---

### Task 3: Team Advisor (Combo Scorer)

**Files:**
- Create: `src/lib/team-advisor.ts`
- Create: `__tests__/team-advisor.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/team-advisor.test.ts
import { describe, it, expect } from "vitest";
import { recommendTeams } from "@/lib/team-advisor";

describe("recommendTeams", () => {
  it("returns up to 5 ranked teams from a pool", () => {
    // Use well-known Ultra League Pokemon
    const pool = ["dragonite", "venusaur", "feraligatr", "swampert", "togekiss", "machamp"];
    const results = recommendTeams(pool, "ultra-league");
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    // Each result has 3 Pokemon
    for (const team of results) {
      expect(team.pokemonIds.length).toBe(3);
      expect(team.rating).toBeDefined();
      expect(team.coverageScore).toBeGreaterThanOrEqual(0);
      expect(team.roles.length).toBe(3);
    }
  });

  it("returns teams sorted by score descending", () => {
    const pool = ["dragonite", "venusaur", "feraligatr", "swampert", "togekiss"];
    const results = recommendTeams(pool, "ultra-league");
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score);
    }
  });

  it("returns empty for pool smaller than 3", () => {
    expect(recommendTeams(["dragonite", "venusaur"], "ultra-league")).toEqual([]);
  });

  it("handles pool of exactly 3 — returns 1 team", () => {
    const results = recommendTeams(["dragonite", "venusaur", "feraligatr"], "ultra-league");
    expect(results.length).toBe(1);
  });

  it("skips Pokemon IDs not in pokemon.json", () => {
    const results = recommendTeams(["dragonite", "venusaur", "feraligatr", "fakemon"], "ultra-league");
    expect(results.length).toBe(1);
    expect(results[0]!.pokemonIds).not.toContain("fakemon");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd ~/Projects/Pokemon\ GO/poke-pal && npx vitest run __tests__/team-advisor.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement team-advisor.ts**

```typescript
// src/lib/team-advisor.ts
import { analyzeTeam, assignRoles } from "./team-analysis";
import { calculateTeamRating, type TeamRating } from "./team-rating";
import { pokemonToSlot } from "./pokemon-utils";
import type { TeamSlot, RoleAssignment } from "./team-types";
import type { LeagueId } from "@/data/leagues";

export type RecommendedTeam = {
  pokemonIds: [string, string, string];
  rating: TeamRating;
  score: number;
  coverageScore: number;
  roles: RoleAssignment[];
  searchString: string;
};

// Numeric score for sorting (higher = better)
const RATING_SCORES: Record<TeamRating, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 };

/**
 * Brute-force all C(n,3) combinations from pool, score each, return top 5.
 * With 24 Pokemon = 2,024 combos — runs in <100ms.
 */
export function recommendTeams(
  poolIds: string[],
  leagueId: LeagueId,
  maxResults = 5,
): RecommendedTeam[] {
  // Filter to valid Pokemon only
  const validIds = poolIds.filter((id) => pokemonToSlot(id) !== null);
  if (validIds.length < 3) return [];

  const scored: RecommendedTeam[] = [];

  // Generate all combinations of 3
  for (let i = 0; i < validIds.length - 2; i++) {
    for (let j = i + 1; j < validIds.length - 1; j++) {
      for (let k = j + 1; k < validIds.length; k++) {
        const ids: [string, string, string] = [validIds[i]!, validIds[j]!, validIds[k]!];
        const slots: [TeamSlot, TeamSlot, TeamSlot] = [
          pokemonToSlot(ids[0]),
          pokemonToSlot(ids[1]),
          pokemonToSlot(ids[2]),
        ];

        const analysis = analyzeTeam(slots, leagueId);
        const rating = calculateTeamRating(
          ids,
          leagueId,
          analysis.offensiveCoverage,
          analysis.defensiveWeaknesses,
          analysis.threats,
        );
        const roles = assignRoles(slots, leagueId);

        scored.push({
          pokemonIds: ids,
          rating,
          score: RATING_SCORES[rating] + analysis.coverageScore / 18, // tiebreak by coverage
          coverageScore: analysis.coverageScore,
          roles,
          searchString: analysis.searchString,
        });
      }
    }
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, maxResults);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd ~/Projects/Pokemon\ GO/poke-pal && npx vitest run __tests__/team-advisor.test.ts`
Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
cd ~/Projects/Pokemon\ GO/poke-pal
git add src/lib/team-advisor.ts __tests__/team-advisor.test.ts
git commit -m "feat: add team advisor brute-force combo scoring engine"
```

---

### Task 4: Strategy Tips Engine

**Files:**
- Create: `src/lib/strategy-tips.ts`
- Create: `__tests__/strategy-tips.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/strategy-tips.test.ts
import { describe, it, expect } from "vitest";
import { generateStrategyTips } from "@/lib/strategy-tips";
import type { RoleAssignment } from "@/lib/team-types";

describe("generateStrategyTips", () => {
  it("generates tips for a 3-Pokemon team with roles", () => {
    const roles: RoleAssignment[] = [
      { pokemonId: "dragonite", role: "lead", reasoning: "Covers 5 meta threats" },
      { pokemonId: "venusaur", role: "safe-swap", reasoning: "Covers Water weakness" },
      { pokemonId: "feraligatr", role: "closer", reasoning: "Rounds out coverage" },
    ];
    const tips = generateStrategyTips(roles, "ultra-league");
    expect(tips.length).toBe(3);
    // Each tip has a role and text
    expect(tips[0]!.role).toBe("lead");
    expect(tips[0]!.pokemonName).toBe("Dragonite");
    expect(tips[0]!.tip.length).toBeGreaterThan(10);
    expect(tips[1]!.role).toBe("safe-swap");
    expect(tips[2]!.role).toBe("closer");
  });

  it("returns empty for no roles", () => {
    expect(generateStrategyTips([], "ultra-league")).toEqual([]);
  });

  it("mentions move names in tips", () => {
    const roles: RoleAssignment[] = [
      { pokemonId: "dragonite", role: "lead", reasoning: "" },
      { pokemonId: "venusaur", role: "safe-swap", reasoning: "" },
      { pokemonId: "feraligatr", role: "closer", reasoning: "" },
    ];
    const tips = generateStrategyTips(roles, "ultra-league");
    // At least one tip should reference a move name
    const allText = tips.map((t) => t.tip).join(" ");
    expect(allText.length).toBeGreaterThan(50);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd ~/Projects/Pokemon\ GO/poke-pal && npx vitest run __tests__/strategy-tips.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement strategy-tips.ts**

The logic: look up each Pokemon's recommended moves from the league meta JSON. Classify charged moves by energy cost. Generate role-specific tips using templates.

```typescript
// src/lib/strategy-tips.ts
import { getPokemonById, getLeagueInfo } from "./team-analysis";
import type { RoleAssignment } from "./team-types";
import type { LeagueId } from "@/data/leagues";
import type { PokemonType } from "./types";
import { getEffectiveness } from "./type-effectiveness";

export type StrategyTip = {
  role: "lead" | "safe-swap" | "closer";
  pokemonId: string;
  pokemonName: string;
  tip: string;
};

// Energy thresholds for move classification
const CHEAP_ENERGY = 40;
const NUKE_ENERGY = 60;

// Fast moves known for fast energy generation
const FAST_ENERGY_MOVES = new Set([
  "Mud Shot", "Lock-On", "Shadow Claw", "Psycho Cut", "Vine Whip",
  "Powder Snow", "Thunder Shock", "Water Gun", "Incinerate",
]);

function getRecommendedMoves(pokemonId: string, leagueId: LeagueId) {
  const league = getLeagueInfo(leagueId);
  const meta = league.meta.find((m) => m.pokemonId === pokemonId);
  if (meta) {
    return { fast: meta.recommendedFast, charged: meta.recommendedCharged };
  }
  // Fallback: use first moves from pokemon.json
  const p = getPokemonById(pokemonId);
  if (!p) return null;
  return {
    fast: p.fastMoves[0]?.name ?? "",
    charged: p.chargedMoves.slice(0, 2).map((m) => m.name),
  };
}

function classifyChargedMoves(pokemonId: string): {
  cheap: string[];
  mid: string[];
  nuke: string[];
} {
  const p = getPokemonById(pokemonId);
  if (!p) return { cheap: [], mid: [], nuke: [] };
  const cheap: string[] = [];
  const mid: string[] = [];
  const nuke: string[] = [];
  for (const m of p.chargedMoves) {
    // pvpEnergy is energy GENERATED by fast moves, but for charged moves
    // it represents energy COST (negative in some datasets, positive in ours)
    const cost = Math.abs(m.pvpEnergy);
    if (cost <= CHEAP_ENERGY) cheap.push(m.name);
    else if (cost >= NUKE_ENERGY) nuke.push(m.name);
    else mid.push(m.name);
  }
  return { cheap, mid, nuke };
}

function generateLeadTip(pokemonId: string, leagueId: LeagueId): string {
  const moves = getRecommendedMoves(pokemonId, leagueId);
  if (!moves) return "Lead Pokemon.";

  const classified = classifyChargedMoves(pokemonId);
  const parts: string[] = [];

  if (FAST_ENERGY_MOVES.has(moves.fast)) {
    parts.push(`Fast energy with ${moves.fast}`);
  }

  if (classified.cheap.length > 0 && classified.nuke.length > 0) {
    const cheapMove = moves.charged.find((m) => classified.cheap.includes(m)) ?? classified.cheap[0];
    const nukeMove = moves.charged.find((m) => classified.nuke.includes(m)) ?? classified.nuke[0];
    parts.push(`use ${cheapMove} to bait shields, then land ${nukeMove}`);
  } else if (classified.cheap.length > 0) {
    const cheapMove = moves.charged.find((m) => classified.cheap.includes(m)) ?? classified.cheap[0];
    parts.push(`pressure shields early with ${cheapMove}`);
  } else {
    parts.push(`${moves.fast} | ${moves.charged.join(", ")}`);
  }

  return parts.join(" — ") + ".";
}

function generateSwapTip(
  pokemonId: string,
  leadId: string,
  leagueId: LeagueId,
): string {
  const p = getPokemonById(pokemonId);
  const lead = getPokemonById(leadId);
  if (!p || !lead) return "Safe swap option.";

  // Find types that hit the lead SE — the swap should resist these
  const leadWeaknesses: PokemonType[] = [];
  const allTypes: PokemonType[] = [
    "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
    "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
    "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy",
  ];
  for (const t of allTypes) {
    if (getEffectiveness(t, lead.types as PokemonType[]) > 1.0) {
      leadWeaknesses.push(t);
    }
  }

  const resisted = leadWeaknesses.filter(
    (t) => getEffectiveness(t, p.types as PokemonType[]) < 1.0,
  );

  const moves = getRecommendedMoves(pokemonId, leagueId);

  if (resisted.length > 0) {
    return `Swap to ${p.name} against ${resisted.join(", ")} types — resists what threatens ${lead.name}. ${moves ? moves.fast + " | " + moves.charged.join(", ") : ""}.`;
  }

  return `Switch to ${p.name} to draw out counters. ${moves ? moves.fast + " | " + moves.charged.join(", ") : ""}.`;
}

function generateCloserTip(
  pokemonId: string,
  teamIds: string[],
  leagueId: LeagueId,
): string {
  const p = getPokemonById(pokemonId);
  if (!p) return "Closer.";

  const moves = getRecommendedMoves(pokemonId, leagueId);
  const classified = classifyChargedMoves(pokemonId);

  const parts: string[] = [];

  if (classified.nuke.length > 0) {
    const nukeMove = moves?.charged.find((m) => classified.nuke.includes(m)) ?? classified.nuke[0];
    parts.push(`Farm energy, then close with ${nukeMove}`);
  } else {
    parts.push(`Close games with ${moves?.charged[0] ?? "charged moves"}`);
  }

  // Find unique coverage this closer provides
  const closerMoveTypes = new Set(p.chargedMoves.map((m) => m.type));
  const allTypes: PokemonType[] = [
    "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
    "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
    "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy",
  ];
  const uniqueCoverage: string[] = [];
  for (const defType of allTypes) {
    const closerHits = [...closerMoveTypes].some(
      (mt) => getEffectiveness(mt as PokemonType, [defType]) > 1.0,
    );
    if (closerHits) {
      const othersHit = teamIds
        .filter((id) => id !== pokemonId)
        .some((id) => {
          const other = getPokemonById(id);
          if (!other) return false;
          return other.chargedMoves.some(
            (m) => getEffectiveness(m.type as PokemonType, [defType]) > 1.0,
          );
        });
      if (!othersHit) uniqueCoverage.push(defType);
    }
  }

  if (uniqueCoverage.length > 0) {
    parts.push(`covers ${uniqueCoverage.slice(0, 3).join(", ")} that the rest can't`);
  }

  return parts.join(" — ") + ".";
}

export function generateStrategyTips(
  roles: RoleAssignment[],
  leagueId: LeagueId,
): StrategyTip[] {
  if (roles.length === 0) return [];

  const allIds = roles.map((r) => r.pokemonId);
  const leadRole = roles.find((r) => r.role === "lead");

  return roles.map((role) => {
    const p = getPokemonById(role.pokemonId);
    const name = p?.name ?? role.pokemonId;

    let tip: string;
    switch (role.role) {
      case "lead":
        tip = generateLeadTip(role.pokemonId, leagueId);
        break;
      case "safe-swap":
        tip = generateSwapTip(role.pokemonId, leadRole?.pokemonId ?? "", leagueId);
        break;
      case "closer":
        tip = generateCloserTip(role.pokemonId, allIds, leagueId);
        break;
      default:
        tip = "";
    }

    return { role: role.role, pokemonId: role.pokemonId, pokemonName: name, tip };
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd ~/Projects/Pokemon\ GO/poke-pal && npx vitest run __tests__/strategy-tips.test.ts`
Expected: 3 tests PASS

- [ ] **Step 5: Commit**

```bash
cd ~/Projects/Pokemon\ GO/poke-pal
git add src/lib/strategy-tips.ts __tests__/strategy-tips.test.ts
git commit -m "feat: add template-based strategy tips engine for team advisor"
```

---

## Chunk 2: UI Components (screenshot-upload, pokemon-pool, recommended-teams)

### Task 5: Screenshot Upload Component

**Files:**
- Create: `src/components/team/screenshot-upload.tsx`

- [ ] **Step 1: Create the component**

This component handles the upload UI — 2 image slots, preview thumbnails, scan button, loading/error states. It calls a `onScan` callback with the selected files.

```typescript
// src/components/team/screenshot-upload.tsx
"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";

type ScreenshotUploadProps = {
  onScan: (files: File[]) => Promise<void>;
  isScanning: boolean;
  error?: string | null;
  maxFiles?: number;
};

export function ScreenshotUpload({
  onScan,
  isScanning,
  error,
  maxFiles = 2,
}: ScreenshotUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(selected: FileList | null) {
    if (!selected) return;
    const newFiles = Array.from(selected).slice(0, maxFiles - files.length);
    const combined = [...files, ...newFiles].slice(0, maxFiles);
    setFiles(combined);
    // Generate previews
    const newPreviews = combined.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => {
      prev.forEach(URL.revokeObjectURL);
      return newPreviews;
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed);
      return prev.filter((_, i) => i !== index);
    });
  }

  return (
    <div className="space-y-3">
      {/* Upload area */}
      {files.length < maxFiles && (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-sm text-muted-foreground hover:border-foreground/30 hover:bg-accent/50 active:scale-[0.99]"
        >
          <Upload className="h-4 w-4" />
          Upload GO Screenshots ({files.length}/{maxFiles})
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Preview thumbnails */}
      {previews.length > 0 && (
        <div className="flex gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border">
              <img src={src} alt={`Screenshot ${i + 1}`} className="h-full w-full object-cover" />
              <button
                onClick={() => removeFile(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                aria-label="Remove screenshot"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Scan button */}
      {files.length > 0 && (
        <button
          onClick={() => onScan(files)}
          disabled={isScanning}
          className="w-full min-h-11 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {isScanning ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Reading your Pokemon...
            </span>
          ) : (
            "Scan My Pokemon"
          )}
        </button>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd ~/Projects/Pokemon\ GO/poke-pal && npx tsc --noEmit src/components/team/screenshot-upload.tsx`
Expected: no errors (or check with full build)

- [ ] **Step 3: Commit**

```bash
cd ~/Projects/Pokemon\ GO/poke-pal
git add src/components/team/screenshot-upload.tsx
git commit -m "feat: add screenshot upload component for team advisor"
```

---

### Task 6: Pokemon Pool Component

**Files:**
- Create: `src/components/team/pokemon-pool.tsx`

- [ ] **Step 1: Create the component**

Collapsible "My Pokemon (N)" section with chip grid, search bar for manual adds, and rescan link.

```typescript
// src/components/team/pokemon-pool.tsx
"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { PokemonChip } from "@/components/pokemon-chip";
import { SearchInput } from "@/components/search-input";
import { getPokemonName } from "@/lib/pokemon-utils";

type PokemonPoolProps = {
  pool: string[];
  onRemove: (pokemonId: string) => void;
  onAdd: (pokemonId: string) => void;
  onRescan: () => void;
  defaultOpen?: boolean;
};

export function PokemonPool({
  pool,
  onRemove,
  onAdd,
  onRescan,
  defaultOpen = true,
}: PokemonPoolProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1 py-2 text-sm font-semibold active:opacity-70"
      >
        {open ? (
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        ) : (
          <ChevronRightIcon className="size-4 text-muted-foreground" />
        )}
        My Pokemon ({pool.length})
      </button>

      {open && (
        <div className="space-y-3">
          {pool.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pool.map((id) => (
                <PokemonChip
                  key={id}
                  name={getPokemonName(id)}
                  variant="remove"
                  onAction={() => onRemove(id)}
                />
              ))}
            </div>
          )}

          <SearchInput
            mode="select"
            onSelect={onAdd}
            placeholder="Add a Pokemon..."
          />

          <button
            onClick={onRescan}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 active:opacity-70"
          >
            Rescan
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/Projects/Pokemon\ GO/poke-pal
git add src/components/team/pokemon-pool.tsx
git commit -m "feat: add Pokemon pool component with collapsible chip grid"
```

---

### Task 7: Recommended Teams Component

**Files:**
- Create: `src/components/team/recommended-teams.tsx`

- [ ] **Step 1: Create the component**

Shows ranked team cards. Best team expanded with movesets + strategy, rest collapsed.

```typescript
// src/components/team/recommended-teams.tsx
"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { getPokemonName } from "@/lib/pokemon-utils";
import { RATING_COLORS } from "@/lib/team-rating";
import type { RecommendedTeam } from "@/lib/team-advisor";
import type { StrategyTip } from "@/lib/strategy-tips";
import type { LeagueId } from "@/data/leagues";
import { getLeagueInfo, getPokemonById } from "@/lib/team-analysis";
import type { MetaPokemon } from "@/lib/types";

type RecommendedTeamsProps = {
  teams: RecommendedTeam[];
  tips: Map<string, StrategyTip[]>; // keyed by pokemonIds.join(",")
  leagueId: LeagueId;
  onUseTeam: (pokemonIds: [string, string, string]) => void;
};

function getMoveset(pokemonId: string, leagueId: LeagueId): string {
  const league = getLeagueInfo(leagueId);
  const meta = (league.meta as MetaPokemon[]).find((m) => m.pokemonId === pokemonId);
  if (meta) {
    return `${meta.recommendedFast} | ${meta.recommendedCharged.join(", ")}`;
  }
  const p = getPokemonById(pokemonId);
  if (!p) return "";
  const fast = p.fastMoves[0]?.name ?? "";
  const charged = p.chargedMoves.slice(0, 2).map((m) => m.name).join(", ");
  return `${fast} | ${charged}`;
}

const ROLE_LABELS: Record<string, string> = {
  lead: "LEAD",
  "safe-swap": "SAFE SWAP",
  closer: "CLOSER",
};

export function RecommendedTeams({
  teams,
  tips,
  leagueId,
  onUseTeam,
}: RecommendedTeamsProps) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  if (teams.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Recommended Teams</h3>

      {teams.map((team, idx) => {
        const isExpanded = idx === expandedIndex;
        const key = team.pokemonIds.join(",");
        const teamTips = tips.get(key) ?? [];

        if (!isExpanded) {
          // Collapsed card
          return (
            <button
              key={key}
              onClick={() => setExpandedIndex(idx)}
              className="flex w-full items-center justify-between rounded-lg border bg-card p-3 text-left active:opacity-70"
            >
              <span className="flex items-center gap-1 text-sm font-medium">
                <ChevronRightIcon className="size-4 text-muted-foreground" />
                {team.pokemonIds.map((id) => getPokemonName(id)).join(" · ")}
              </span>
              <span className={`rounded-md px-2 py-0.5 text-sm font-semibold ${RATING_COLORS[team.rating]}`}>
                {team.rating}
              </span>
            </button>
          );
        }

        // Expanded card
        return (
          <div key={key} className="rounded-lg border bg-card p-4 space-y-3">
            {/* Header: coverage + rating */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setExpandedIndex(-1)}
                className="flex items-center gap-1 text-sm text-muted-foreground"
              >
                <ChevronDownIcon className="size-4" />
                {team.coverageScore}/18 types covered
              </button>
              <span className={`rounded-md px-2 py-0.5 text-sm font-semibold ${RATING_COLORS[team.rating]}`}>
                {team.rating}
              </span>
            </div>

            {/* Pokemon with roles + movesets */}
            {team.roles.map((role) => (
              <div key={role.pokemonId} className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {ROLE_LABELS[role.role] ?? role.role}
                </p>
                <p className="font-semibold">{getPokemonName(role.pokemonId)}</p>
                <p className="text-sm text-muted-foreground">
                  {getMoveset(role.pokemonId, leagueId)}
                </p>
              </div>
            ))}

            {/* Strategy */}
            {teamTips.length > 0 && (
              <>
                <hr className="border-border" />
                <p className="text-sm font-semibold">Strategy</p>
                {teamTips.map((tip) => (
                  <p key={tip.pokemonId} className="text-sm text-muted-foreground">
                    {tip.tip}
                  </p>
                ))}
              </>
            )}

            {/* Use This Team */}
            <button
              onClick={() => onUseTeam(team.pokemonIds)}
              className="w-full min-h-11 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all active:scale-[0.98]"
            >
              Use This Team
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/Projects/Pokemon\ GO/poke-pal
git add src/components/team/recommended-teams.tsx
git commit -m "feat: add recommended teams component with strategy tips"
```

---

## Chunk 3: Teams Page Rewrite + TeamSlot Update

### Task 8: Update TeamSlotCard with Role Label

**Files:**
- Modify: `src/components/team/team-slot.tsx`

- [ ] **Step 1: Add optional `role` prop**

Read the current file, then add a `role` prop that shows a small label above the Pokemon name.

In `src/components/team/team-slot.tsx`, add `role?: string` to the props and render it:

```typescript
// Add role to props:
  role?: string;

// In the filled slot render, above the name row, add:
      {role && (
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {role}
        </p>
      )}
```

- [ ] **Step 2: Verify existing tests still pass**

Run: `cd ~/Projects/Pokemon\ GO/poke-pal && npx vitest run`
Expected: all existing tests pass

- [ ] **Step 3: Commit**

```bash
cd ~/Projects/Pokemon\ GO/poke-pal
git add src/components/team/team-slot.tsx
git commit -m "feat: add role label prop to TeamSlotCard"
```

---

### Task 9: Rewrite Teams Page with 4-State Flow

This is the biggest task. Replace the current Teams page with the state-driven advisor flow.

**Files:**
- Modify: `src/app/teams/page.tsx` (full rewrite)

- [ ] **Step 1: Read the current teams page to understand all imports and patterns**

Read `src/app/teams/page.tsx` fully (already done in planning — 355 lines).

- [ ] **Step 2: Rewrite teams/page.tsx**

The new page has 4 states driven by: `hasPool` (pool.length > 0), `hasTeam` (team has non-null slots), and `cpCopied` (localStorage flag).

Key changes from current page:
- **Remove**: league info row, rating row, discovery string button
- **Add**: CP copy button (State 1), screenshot upload (State 2), pokemon pool (State 2-4), recommended teams (State 3-4)
- **Keep**: league tabs, team slots, copy team search string, search input, meta threats

The state transitions:
1. No pool, no team → show CP copy button + upload + search
2. CP copied → show upload + pool + search (pool building)
3. Pool has 3+ → show recommendations + pool (collapsed) + search
4. Team loaded → show team slots + strategy + pool (collapsed) + recs (collapsed)

```
State logic:
- cpCopied && pool.length === 0 → State 2 (building pool, no recs yet)
- pool.length >= 3 && !hasTeam → State 3 (show recommendations)
- hasTeam → State 4 (team loaded)
- else → State 1 (fresh)
```

Write the full page.tsx following the patterns from the current page (Suspense wrapper, URL sync, localStorage persistence, league switching). Import all new components. Wire up the scan handler (calls `/api/scan` endpoint, matches results, saves to pool).

This file will be ~400 lines. Follow the exact same patterns as the current page for: `useSearchParams`, `useRouter`, `mountedRef`, `handleLeagueChange`, `handlePokemonSelect`, `handleSlotRemove`, localStorage sync.

- [ ] **Step 3: Verify the build compiles**

Run: `cd ~/Projects/Pokemon\ GO/poke-pal && npx next build`
Expected: build succeeds (pages may have SSR issues to fix)

- [ ] **Step 4: Run all tests**

Run: `cd ~/Projects/Pokemon\ GO/poke-pal && npx vitest run`
Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
cd ~/Projects/Pokemon\ GO/poke-pal
git add src/app/teams/page.tsx
git commit -m "feat: rewrite Teams page with 4-state advisor flow"
```

---

### Task 10: Bump Version

**Files:**
- Modify: `src/lib/constants.ts`
- Modify: `VERSION`

- [ ] **Step 1: Bump APP_VERSION to 1.1.0**

In `src/lib/constants.ts`, change `APP_VERSION` from `"1.0.2"` to `"1.1.0"`.

In `VERSION` file at project root, update to `1.1.0`.

- [ ] **Step 2: Commit**

```bash
cd ~/Projects/Pokemon\ GO/poke-pal
git add src/lib/constants.ts VERSION
git commit -m "chore: bump version to 1.1.0 for Team Advisor release"
```

---

## Chunk 4: Cloudflare Worker for Screenshot Scanning

### Task 11: Create the Scan Worker

The app uses `output: "export"` (static), so we can't use Next.js API routes. Instead, create a standalone Cloudflare Worker that the frontend calls.

**Files:**
- Create: `workers/scan/index.ts`
- Create: `workers/scan/wrangler.toml`
- Create: `workers/scan/package.json`

- [ ] **Step 1: Create wrangler.toml**

```toml
# workers/scan/wrangler.toml
name = "poke-pal-scan"
main = "index.ts"
compatibility_date = "2024-12-01"

[vars]
# ANTHROPIC_API_KEY set via `wrangler secret put ANTHROPIC_API_KEY`
```

- [ ] **Step 2: Create package.json**

```json
{
  "name": "poke-pal-scan",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  },
  "devDependencies": {
    "wrangler": "^3.0.0"
  }
}
```

- [ ] **Step 3: Create the Worker**

```typescript
// workers/scan/index.ts
interface Env {
  ANTHROPIC_API_KEY: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const PROMPT = `List every Pokemon visible in this Pokemon GO storage screenshot. Return ONLY a JSON array of Pokemon names, e.g. ["Dragonite", "Venusaur", "Feraligatr"]. Include every visible Pokemon. Do not include any other text.`;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
    }

    try {
      const formData = await request.formData();
      const files: File[] = [];

      for (const [, value] of formData.entries()) {
        if (value instanceof File && value.type.startsWith("image/")) {
          if (value.size > 5 * 1024 * 1024) {
            return new Response(
              JSON.stringify({ error: "File too large (max 5MB)" }),
              { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
            );
          }
          files.push(value);
        }
      }

      if (files.length === 0) {
        return new Response(
          JSON.stringify({ error: "No image files provided" }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
        );
      }

      if (files.length > 2) {
        return new Response(
          JSON.stringify({ error: "Max 2 screenshots" }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
        );
      }

      // Convert files to base64 for Claude API
      const imageContent = await Promise.all(
        files.map(async (file) => {
          const buffer = await file.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
          const mediaType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
          return {
            type: "image" as const,
            source: { type: "base64" as const, media_type: mediaType, data: base64 },
          };
        }),
      );

      // Call Claude API
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: [
                ...imageContent,
                { type: "text", text: PROMPT },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Claude API error:", errText);
        return new Response(
          JSON.stringify({ error: "Screenshot analysis failed" }),
          { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
        );
      }

      const result = await response.json() as {
        content: Array<{ type: string; text?: string }>;
      };

      const textBlock = result.content.find((b) => b.type === "text");
      if (!textBlock?.text) {
        return new Response(
          JSON.stringify({ error: "No results from analysis" }),
          { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
        );
      }

      // Parse the JSON array from Claude's response
      const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return new Response(
          JSON.stringify({ error: "Could not parse Pokemon list" }),
          { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
        );
      }

      const names = JSON.parse(jsonMatch[0]) as string[];

      return new Response(
        JSON.stringify({ pokemon: names }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
      );
    } catch (err) {
      console.error("Worker error:", err);
      return new Response(
        JSON.stringify({ error: "Internal error" }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
      );
    }
  },
};
```

- [ ] **Step 4: Commit**

```bash
cd ~/Projects/Pokemon\ GO/poke-pal
git add workers/
git commit -m "feat: add Cloudflare Worker for screenshot scanning via Claude Vision"
```

- [ ] **Step 5: Deploy the Worker**

```bash
cd ~/Projects/Pokemon\ GO/poke-pal/workers/scan
npm install
wrangler secret put ANTHROPIC_API_KEY
# (paste API key when prompted)
wrangler deploy
```

Note the deployed URL (e.g., `https://poke-pal-scan.<your-subdomain>.workers.dev`) — this goes into the frontend scan handler.

- [ ] **Step 6: Add Worker URL to frontend**

Create or update an env config in the frontend so the scan handler knows where to POST. Store the Worker URL in a constant (not .env, since this is a static export):

In `src/lib/constants.ts`, add:
```typescript
export const SCAN_WORKER_URL = "https://poke-pal-scan.<subdomain>.workers.dev";
```

- [ ] **Step 7: Commit**

```bash
cd ~/Projects/Pokemon\ GO/poke-pal
git add src/lib/constants.ts
git commit -m "feat: add scan worker URL to constants"
```

---

## Chunk 5: Integration Testing + Polish

### Task 12: Full Integration Test

- [ ] **Step 1: Run all tests**

Run: `cd ~/Projects/Pokemon\ GO/poke-pal && npx vitest run`
Expected: all tests pass (existing + new)

- [ ] **Step 2: Run the build**

Run: `cd ~/Projects/Pokemon\ GO/poke-pal && npx next build`
Expected: build succeeds, static pages generated

- [ ] **Step 3: Manual test locally**

Run: `cd ~/Projects/Pokemon\ GO/poke-pal && npx next dev --hostname 0.0.0.0 --port 3001`

Test the flow:
1. Go to http://localhost:3001/teams
2. Select Ultra League tab
3. Tap "Copy cp-2500" — verify it copies to clipboard
4. Upload area and search bar should now be interactive
5. Use search bar to manually add: dragonite, venusaur, feraligatr, swampert, togekiss
6. "Recommended Teams" section should appear with ranked teams
7. Expand top team — verify movesets and strategy tips show
8. Tap "Use This Team" — verify team loads into slots with role labels
9. Verify "Copy Team Search String" works
10. Switch leagues — verify pool/team persistence per league

- [ ] **Step 4: Test on mobile**

Open http://192.168.86.32:3001/teams on iPhone Safari.
Verify touch targets, copy behavior, and layout.

- [ ] **Step 5: Commit any fixes**

```bash
cd ~/Projects/Pokemon\ GO/poke-pal
git add -A
git commit -m "fix: integration fixes for Team Advisor flow"
```

---

### Task 13: Update CHANGELOG and Session Log

- [ ] **Step 1: Add to CHANGELOG.md**

Add a `## [1.1.0] - 2026-04-10` section documenting the Team Advisor feature.

- [ ] **Step 2: Update SESSION_LOG.md**

Add session entry with what was built, decisions made, current state.

- [ ] **Step 3: Commit**

```bash
cd ~/Projects/Pokemon\ GO/poke-pal
git add CHANGELOG.md SESSION_LOG.md
git commit -m "docs: update changelog and session log for v1.1.0 Team Advisor"
```

---

## Task Order Summary (Revised)

| Task | What | Depends On |
|------|------|-----------|
| 1 | Dead code cleanup (team-analysis.ts, team-types.ts) | — |
| 2 | Pool storage + name matcher (add to team-storage.ts, pokemon-utils.ts) | — |
| 3 | Team Advisor Engine + Strategy Tips (team-advisor.ts) | — |
| 4 | Screenshot Upload Component | — |
| 5 | Pokemon Pool Component | Task 2 |
| 6 | Recommended Teams Component | Task 3 |
| 7 | TeamSlot Role Label | — |
| 8 | Teams Page Rewrite (4-state flow) | Tasks 1-7 |
| 9 | Pages Function for scanning | — |
| 10 | Version Bump + Integration Testing | Tasks 8, 9 |
| 11 | Docs (changelog, session log) | Task 10 |

**Parallelizable:** Tasks 1-4 and 7 and 9 can all run in parallel. Tasks 5-6 after their deps. Task 8 waits for 1-7. 

**Total new files:** 7 (down from 13). **Total modified files:** 7. **Dead code removed:** ~200 lines.
