# Team Builder Architecture

**Date:** 2026-04-07
**Route:** `/team`
**Constraint:** Fully client-side. Static export (`output: "export"`). No API routes, no server components for dynamic data.

---

## 1. File Structure

```
src/
  app/
    team/
      page.tsx                  # "use client" — the team builder page
  lib/
    team-analysis.ts            # Core algorithm: coverage, weaknesses, suggestions
    team-types.ts               # All new types for team builder
  components/
    team-slot.tsx               # Single slot (empty state + filled state)
    team-slot-picker.tsx        # Pokemon autocomplete scoped to a slot
    team-league-selector.tsx    # League dropdown/tabs
    team-coverage-chart.tsx     # 18-type offensive + defensive grid
    team-threats.tsx            # Meta threats list
    team-suggestions.tsx        # Swap suggestions
    team-search-string.tsx      # Combined name search string + CopyBar
```

No new data files. All league JSON and pokemon.json are already sufficient.

---

## 2. New Types

All defined in `src/lib/team-types.ts`:

```typescript
import type { PokemonType, Pokemon, MetaPokemon, League } from "./types";

/** One slot in the team. null means empty. */
export type TeamSlot = {
  pokemonId: string;
  /** Which fast move the user prefers (defaults to first). */
  fastMove: string;
  /** Which charged moves (up to 2). Defaults to first two. */
  chargedMoves: string[];
} | null;

/** The full team state: exactly 3 slots + a league. */
export type TeamState = {
  slots: [TeamSlot, TeamSlot, TeamSlot];
  leagueId: string;
};

/** Offensive coverage: for each of 18 types, the best multiplier any team member can deal. */
export type CoverageMap = Record<PokemonType, {
  multiplier: number;
  /** Which team member(s) provide this coverage, by pokemonId. */
  coveredBy: string[];
}>;

/** Defensive profile: for each of 18 attack types, the worst (highest) multiplier across the team. */
export type WeaknessMap = Record<PokemonType, {
  multiplier: number;
  /** Which team member(s) are weak to this type. */
  weakMembers: string[];
}>;

/** A meta Pokemon that threatens the team, with why. */
export type ThreatEntry = {
  metaPokemon: MetaPokemon;
  /** The pokemon data for display. */
  pokemonId: string;
  pokemonName: string;
  pokemonTypes: PokemonType[];
  tier: "S" | "A" | "B" | "C";
  /** Which team slots it threatens (by pokemonId). */
  threatens: string[];
  /** Best multiplier it can deal against any team member. */
  bestMultiplier: number;
};

/** A suggestion for improving the team. */
export type SwapSuggestion = {
  /** Which slot index to swap (0, 1, 2). */
  slotIndex: number;
  /** The current Pokemon in that slot. */
  currentPokemonId: string;
  /** The suggested replacement. */
  suggestedPokemonId: string;
  suggestedPokemonName: string;
  /** Which uncovered types this swap would fix. */
  coversTypes: PokemonType[];
  /** How many current threats this swap would neutralize. */
  threatReduction: number;
};

/** The full analysis result for a team. */
export type TeamAnalysis = {
  offensiveCoverage: CoverageMap;
  defensiveWeaknesses: WeaknessMap;
  /** Types where no team member deals super-effective damage. */
  uncoveredTypes: PokemonType[];
  /** Types where 2+ team members are weak. */
  sharedWeaknesses: PokemonType[];
  /** Meta Pokemon that threaten the team, sorted by tier then multiplier. */
  threats: ThreatEntry[];
  /** Suggested swaps to improve coverage. */
  suggestions: SwapSuggestion[];
  /** Combined name search string for the 3 Pokemon. */
  searchString: string;
};
```

---

## 3. Core Algorithm

All defined in `src/lib/team-analysis.ts`.

### 3a. `analyzeTeam` (main entry point)

```typescript
import type { PokemonType } from "./types";
import type {
  TeamSlot, TeamAnalysis, CoverageMap, WeaknessMap,
  ThreatEntry, SwapSuggestion,
} from "./team-types";
import { getEffectiveness, getSuperEffectiveTypes } from "./type-effectiveness";
import { buildNameSearchString } from "./search-string";
import { POKEMON_TYPES } from "./types";
import pokemonData from "@/data/pokemon.json";

// League data imported dynamically by ID (see getLeagueData below).

export function analyzeTeam(
  slots: [TeamSlot, TeamSlot, TeamSlot],
  leagueId: string,
): TeamAnalysis | null
```

Returns `null` if fewer than 1 filled slot. Partial analysis (1-2 Pokemon) is valid and returned.

### 3b. `computeOffensiveCoverage`

For each of the 18 types, find the best super-effective multiplier any team member can deal via their actual moves (not just STAB types).

```typescript
export function computeOffensiveCoverage(
  filledSlots: NonNullable<TeamSlot>[],
): CoverageMap
```

Algorithm:
1. For each of 18 defender types (single-type target):
2. For each team member, look at all their moves (fast + charged).
3. For each move, call `getEffectiveness(move.type, [targetType])`.
4. Track the best multiplier and which team members achieve it.
5. A type is "covered" if bestMultiplier > 1.0.

This uses move types, not Pokemon types, because a Water-type Pokemon might carry Ice Beam which covers Grass.

### 3c. `computeDefensiveWeaknesses`

For each of the 18 attack types, find the worst vulnerability across the team.

```typescript
export function computeDefensiveWeaknesses(
  filledSlots: NonNullable<TeamSlot>[],
): WeaknessMap
```

Algorithm:
1. For each of 18 attack types:
2. For each team member, call `getEffectiveness(attackType, pokemon.types)`.
3. Track the highest multiplier (worst weakness) and which members are weak (multiplier > 1.0).
4. A "shared weakness" is any type where 2+ members have multiplier > 1.0.

### 3d. `findThreats`

Given the league meta, find Pokemon that threaten the team.

```typescript
export function findThreats(
  filledSlots: NonNullable<TeamSlot>[],
  leagueId: string,
): ThreatEntry[]
```

Algorithm:
1. Load the league JSON for the given leagueId.
2. For each meta Pokemon in tier S, A, B (skip C for brevity):
3. Look up its recommended moves.
4. For each team member, compute effectiveness of the meta Pokemon's moves against the team member's types.
5. If any move deals > 1.0x against any team member, it is a threat.
6. Sort by: tier rank first (S > A > B), then bestMultiplier descending.
7. Cap at 10 threats.

### 3e. `suggestSwaps`

Recommend replacements to fill coverage gaps.

```typescript
export function suggestSwaps(
  filledSlots: NonNullable<TeamSlot>[],
  uncoveredTypes: PokemonType[],
  threats: ThreatEntry[],
  leagueId: string,
): SwapSuggestion[]
```

Algorithm:
1. If no uncovered types, return empty.
2. For each team slot, consider removing that Pokemon and scanning all Pokemon in the league meta (plus the full pokemon.json pool) for candidates whose moves cover the uncovered types.
3. Score each candidate: +2 per uncovered type it fixes, +1 per threat it would no longer be weak to.
4. For each slot, return the top-1 candidate if it improves the score.
5. Sort suggestions by highest score first. Cap at 3.

### 3f. `getLeagueData` (helper)

```typescript
import greatLeague from "@/data/leagues/great-league.json";
import ultraLeague from "@/data/leagues/ultra-league.json";
import masterLeague from "@/data/leagues/master-league.json";
import fantasyCup from "@/data/leagues/fantasy-cup.json";
import type { League } from "./types";

const LEAGUES: Record<string, League> = {
  "great-league": greatLeague as League,
  "ultra-league": ultraLeague as League,
  "master-league": masterLeague as League,
  "fantasy-cup": fantasyCup as League,
};

export function getLeagueData(leagueId: string): League | undefined {
  return LEAGUES[leagueId];
}
```

All league data is statically imported and bundled. No dynamic fetching.

### 3g. `buildTeamSearchString`

```typescript
export function buildTeamSearchString(
  filledSlots: NonNullable<TeamSlot>[],
): string
```

Delegates to the existing `buildNameSearchString` from `search-string.ts`, passing the Pokemon names. Output is a comma-separated name search string ready to paste in Pokemon GO.

---

## 4. Component Tree

```
TeamPage
  |-- TeamLeagueSelector          (league tabs)
  |-- TeamSlot x3                 (each slot)
  |     |-- TeamSlotPicker        (autocomplete, shown when slot is empty or editing)
  |-- TeamCoverageChart           (18-type grid, shown when >= 1 slot filled)
  |-- TeamThreats                 (threat list, shown when >= 1 slot filled)
  |-- TeamSuggestions             (swap recs, shown when >= 2 slots filled)
  |-- TeamSearchString            (CopyBar wrapper, shown when >= 1 slot filled)
```

### Component Props

```typescript
// TeamPage — no props, it is the route component. Manages all state.

// team-league-selector.tsx
type TeamLeagueSelectorProps = {
  leagueId: string;
  onLeagueChange: (leagueId: string) => void;
};

// team-slot.tsx
type TeamSlotProps = {
  slot: TeamSlot;
  index: number;
  onSelect: (pokemonId: string) => void;
  onRemove: () => void;
  onEditMoves: (fastMove: string, chargedMoves: string[]) => void;
};

// team-slot-picker.tsx (reuses the same autocomplete pattern as SearchInput)
type TeamSlotPickerProps = {
  onSelect: (pokemonId: string) => void;
  /** Pokemon IDs already on the team, to exclude from results. */
  excludeIds: string[];
  placeholder?: string;
};

// team-coverage-chart.tsx
type TeamCoverageChartProps = {
  offensiveCoverage: CoverageMap;
  defensiveWeaknesses: WeaknessMap;
  uncoveredTypes: PokemonType[];
  sharedWeaknesses: PokemonType[];
};

// team-threats.tsx
type TeamThreatsProps = {
  threats: ThreatEntry[];
};

// team-suggestions.tsx
type TeamSuggestionsProps = {
  suggestions: SwapSuggestion[];
  onAcceptSwap: (slotIndex: number, newPokemonId: string) => void;
};

// team-search-string.tsx (thin wrapper around CopyBar)
type TeamSearchStringProps = {
  searchString: string;
};
```

---

## 5. State Management

All state lives in `TeamPage` via `useState`. No URL params for team state (too complex for 3 slots with move overrides). No external state library needed.

```typescript
// src/app/team/page.tsx
"use client";

import { useState, useMemo } from "react";
import type { TeamSlot, TeamState } from "@/lib/team-types";
import { analyzeTeam } from "@/lib/team-analysis";
import pokemonData from "@/data/pokemon.json";

export default function TeamPage() {
  const [teamState, setTeamState] = useState<TeamState>({
    slots: [null, null, null],
    leagueId: "great-league",
  });

  const analysis = useMemo(
    () => analyzeTeam(teamState.slots, teamState.leagueId),
    [teamState],
  );

  // Handler: set a Pokemon in a slot
  function setSlot(index: 0 | 1 | 2, pokemonId: string) {
    const pokemon = pokemonData.find((p) => p.id === pokemonId);
    if (!pokemon) return;
    setTeamState((prev) => {
      const slots = [...prev.slots] as [TeamSlot, TeamSlot, TeamSlot];
      slots[index] = {
        pokemonId,
        fastMove: pokemon.fastMoves[0]?.name ?? "",
        chargedMoves: pokemon.chargedMoves.slice(0, 2).map((m) => m.name),
      };
      return { ...prev, slots };
    });
  }

  // Handler: clear a slot
  function clearSlot(index: 0 | 1 | 2) {
    setTeamState((prev) => {
      const slots = [...prev.slots] as [TeamSlot, TeamSlot, TeamSlot];
      slots[index] = null;
      return { ...prev, slots };
    });
  }

  // Handler: change league
  function setLeague(leagueId: string) {
    setTeamState((prev) => ({ ...prev, leagueId }));
  }

  // Handler: override moves on a slot
  function setMoves(
    index: 0 | 1 | 2,
    fastMove: string,
    chargedMoves: string[],
  ) {
    setTeamState((prev) => {
      const slots = [...prev.slots] as [TeamSlot, TeamSlot, TeamSlot];
      const current = slots[index];
      if (!current) return prev;
      slots[index] = { ...current, fastMove, chargedMoves };
      return { ...prev, slots };
    });
  }

  // ... render component tree
}
```

The `useMemo` on `analyzeTeam` ensures the algorithm only reruns when the team or league changes, not on every render. The analysis computation scans ~100-300 Pokemon (the full pokemon.json) and 18 types, which is negligible in the browser (< 5ms).

---

## 6. Reuse Plan

### Reuse directly (no modifications)

| Existing code | Used for |
|---|---|
| `src/lib/types.ts` | All base types (`PokemonType`, `Pokemon`, `Move`, `League`, `MetaPokemon`, `POKEMON_TYPES`) |
| `src/lib/type-effectiveness.ts` | `getEffectiveness()`, `getSuperEffectiveTypes()`, `getResistantTypes()` |
| `src/lib/search-string.ts` | `buildNameSearchString()` for the team search string |
| `src/data/pokemon.json` | Full Pokemon dataset for lookups and candidate scanning |
| `src/data/leagues/*.json` | League meta data for threat analysis |
| `src/components/copy-bar.tsx` | Reused inside `TeamSearchString` for the copy interaction |
| `src/components/ui/button.tsx` | Buttons throughout team builder UI |
| `src/components/ui/input.tsx` | Used inside `TeamSlotPicker` autocomplete |

### Adapt pattern (new code, same approach)

| Existing pattern | New component | What changes |
|---|---|---|
| `SearchInput` autocomplete | `TeamSlotPicker` | Same keyboard nav + dropdown, but `onSelect` returns pokemonId instead of navigating. Accepts `excludeIds` to prevent duplicates. |
| `PokemonCard` display | `TeamSlot` (filled state) | Shows Pokemon name, types, moves, plus a remove button and move-edit controls. |
| `TYPE_COLORS` map in `pokemon-card.tsx` | Extract to `src/lib/constants.ts` | Move the `TYPE_COLORS` record to a shared constant so both `PokemonCard` and `TeamCoverageChart` can import it. |

### Net new code

| File | Purpose | Approx lines |
|---|---|---|
| `src/lib/team-types.ts` | Type definitions | ~80 |
| `src/lib/team-analysis.ts` | Core algorithm (5 exported functions) | ~200 |
| `src/app/team/page.tsx` | Page component with state | ~120 |
| `src/components/team-slot.tsx` | Slot display + picker toggle | ~80 |
| `src/components/team-slot-picker.tsx` | Autocomplete adapted from SearchInput | ~70 |
| `src/components/team-league-selector.tsx` | League tabs | ~40 |
| `src/components/team-coverage-chart.tsx` | 18-type visual grid | ~100 |
| `src/components/team-threats.tsx` | Threat list | ~60 |
| `src/components/team-suggestions.tsx` | Swap suggestions | ~70 |
| `src/components/team-search-string.tsx` | CopyBar wrapper | ~15 |
| **Total** | | **~835** |

---

## 7. Static Export Compatibility

The `/team` route is a `"use client"` page. It performs zero server-side data fetching. All data comes from static JSON imports that are bundled at build time.

Key decisions:

- **No `generateStaticParams`** needed. The route is `/team` (no dynamic segments).
- **No `generateMetadata` with dynamic data.** Metadata is hardcoded:
  ```typescript
  export const metadata = {
    title: "Team Builder — Poke Pal",
    description: "Build a PvP team, analyze type coverage, and get a search string.",
  };
  ```
  Note: Since the page component itself is `"use client"`, the metadata export must go in a separate `layout.tsx` or a parallel `page.tsx` that re-exports it. The simplest approach: create `src/app/team/layout.tsx` as a server component that only exports metadata and renders `{children}`.
- **All JSON imports** (`pokemon.json`, league files) are bundled into the client JS chunk. This is the same pattern used by the existing counter pages.
- **No `useSearchParams` or `useRouter` for state.** Team state is `useState` only. This avoids any SSR/hydration issues with URL params on static export.

Layout file for metadata:

```typescript
// src/app/team/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Builder — Poke Pal",
  description:
    "Build a PvP team, analyze type coverage, and get a search string for Pokemon GO.",
};

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

---

## 8. Testing Plan

All tests go in `src/__tests__/` or colocated as `*.test.ts` files.

### Unit tests (pure logic, no React)

| Test file | What it covers |
|---|---|
| `team-analysis.test.ts` | `computeOffensiveCoverage` |
| | - Team of Garchomp (Dragon/Ground moves) should cover Electric, Fire, Rock, Steel, etc. |
| | - Empty team returns neutral multiplier for all types. |
| | `computeDefensiveWeaknesses` |
| | - Garchomp + Giratina team has shared Ice weakness (both are Dragon). |
| | - Single Water-type is weak to Electric and Grass. |
| | `findThreats` |
| | - In Great League, a team of 3 Dragon-types should list Fairy/Ice meta threats (e.g., Azumarill). |
| | - A well-balanced team should have fewer S-tier threats. |
| | `suggestSwaps` |
| | - Team with zero Fairy coverage should suggest a Fairy-move Pokemon. |
| | - Full coverage team returns empty suggestions. |
| | `buildTeamSearchString` |
| | - 3 Pokemon returns comma-separated lowercase names. |
| | - 1 Pokemon returns just that name. |
| | `analyzeTeam` |
| | - Returns null for 0 filled slots. |
| | - Returns partial analysis for 1-2 filled slots. |

### Integration tests (React component rendering)

| Test | What it verifies |
|---|---|
| TeamPage renders 3 empty slots on mount | Slots show picker state |
| Selecting a Pokemon fills the slot | Slot shows name, types, moves |
| Removing a Pokemon clears the slot | Slot returns to empty state |
| Changing league reruns analysis | Threats list updates |
| CopyBar shows combined search string | String matches expected format |

### What NOT to test

- `type-effectiveness.ts` and `search-string.ts` should have their own tests already. Do not re-test the type chart.
- Visual styling. No snapshot tests.
- Third-party shadcn components.

---

## Appendix: Coverage Chart Rendering Strategy

The `TeamCoverageChart` renders an 18-column grid (one per type). Each cell shows:
- Offensive: the best multiplier the team can deal to that type. Color-coded: green (> 1.0x), gray (1.0x), red (< 1.0x but no green available).
- Defensive: the worst multiplier the team takes from that type. Color-coded: red (> 1.0x), gray (1.0x), green (< 1.0x).

On mobile (the primary use case), the chart scrolls horizontally or collapses into a vertical list. The vertical list groups types into three categories:

1. **Covered** -- types the team hits super-effectively
2. **Neutral** -- types with no super-effective or resistant matchup
3. **Gaps** -- types the team cannot hit super-effectively + types that hit the team super-effectively

This grouped view is the default on screens under 640px. The grid view is shown on wider screens.
