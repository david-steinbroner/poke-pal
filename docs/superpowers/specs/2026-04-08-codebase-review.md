# Poke Pal Codebase Review — Pre-v0.8.0 Cleanup

Date: 2026-04-08
Files analyzed: 44 source files across src/
Test files: 0 (none exist)

---

## DELETE — Dead Code to Remove

### Unused Exports (never imported anywhere)

| Export | File | Line |
|--------|------|------|
| `OfflineError` | `src/components/error-states.tsx` | :40 |
| `hasAnyTeam()` | `src/lib/team-storage.ts` | :64 |
| `buildTeamUrl()` | `src/lib/team-urls.ts` | :5 |
| `buildShadowSearchString()` | `src/lib/search-string.ts` | :14 |
| `buildHighCpSearchString()` | `src/lib/search-string.ts` | :19 |
| `getResistantTypes()` | `src/lib/type-effectiveness.ts` | :64 |
| `getWeakToTypes()` | `src/lib/type-effectiveness.ts` | :76 |
| `buttonVariants` | `src/components/ui/button.tsx` | :6 (exported but never imported externally) |

### Entire Components to Delete (per v0.8.0 feedback)

| Component | File | Reason |
|-----------|------|--------|
| `ClearButton` | `src/components/clear-button.tsx` | Feedback items #9, #12: Remove all Clear buttons. Only individual X removal. |
| `BackButton` | `src/components/back-button.tsx` | Feedback items #3, #14: Remove back button from Teams and League pages. Only used in teams/page.tsx, league-page-client.tsx, counter/page.tsx. Keep only for counter page or delete entirely. |

### Entire UI Component Unused

| Component | File | Reason |
|-----------|------|--------|
| `Sheet` (all exports) | `src/components/ui/sheet.tsx` | Zero imports anywhere in codebase. 139 lines of dead code. |

### CopyBar Will Be Replaced

| Component | File | Reason |
|-----------|------|--------|
| `CopyBar` | `src/components/copy-bar.tsx` | Feedback items #4-8: Kill the search string display, replace with CopyButton + DualCopyButtons. |

**CopyBar is imported in 3 places that will break:**
- `src/components/league/league-page-client.tsx` (line 6)
- `src/app/teams/page.tsx` (line 10)
- `src/app/counter/[pokemon]/page.tsx` (line 4)

### Stale Directory

The `web/` directory at project root contains its own `node_modules/`, `package.json`, and `src/`. Appears to be a previous iteration of the project. Should be deleted or gitignored.

---

## EXTRACT — Duplicate Code to Consolidate

### 1. `pokemonToSlot()` — defined identically in 2 files

**Locations:**
- `src/app/teams/page.tsx` (line 35)
- `src/components/league/league-page-client.tsx` (line 28)

Both are byte-for-byte identical: look up Pokemon by ID, map fast/charged moves to `{name, type}` shape.

**Action:** Extract to `src/lib/team-utils.ts` and export once.

### 2. `pokemonData.find(p => p.id === id)` — appears in 8+ files, 9 call sites

**Locations:**
- `src/app/page.tsx` (line 24)
- `src/app/counter/[pokemon]/page.tsx` (lines 27, 45, 129, 155)
- `src/app/league/[leagueSlug]/page.tsx` (line 52)
- `src/components/tier-accordion.tsx` (line 22, via `getDisplayName`)
- `src/components/league/inline-team-section.tsx` (line 19, via `getPokemonName`)
- `src/lib/counters.ts` (line 17)

`getPokemonById()` already exists in `src/lib/team-analysis.ts` (line 46) but only 0 of these files use it. They all do the raw `.find()` instead.

**Action:** All call sites should use `getPokemonById()` from `team-analysis.ts`. Or better: move `getPokemonById` to a standalone `src/lib/pokemon-lookup.ts` so it doesn't require importing the heavy team-analysis module.

### 3. Pokemon name lookup helpers — 3 separate inline functions

| Function | File | Line |
|----------|------|------|
| `getPokemonName(pokemonId)` | `src/components/league/inline-team-section.tsx` | :18 |
| `getDisplayName(pokemonId)` | `src/components/tier-accordion.tsx` | :21 |
| inline `pokemon.name ?? id.replace(/-/g, " ")` | `src/components/home-team-preview.tsx` | :61 |
| inline `counterPokemon?.name ?? counter.pokemon.replace(/-/g, " ")` | `src/app/counter/[pokemon]/page.tsx` | :132, :159 |

All do the same thing: look up ID, return name or formatted fallback.

**Action:** Single `getPokemonName(id: string): string` in the shared lookup module.

### 4. Team URL construction — manually built in 2 places

| Location | Code |
|----------|------|
| `src/components/league/inline-team-section.tsx:51` | `/teams?l=${leagueId}&p=${team.join(",")}` |
| `src/components/home-team-preview.tsx:52` | `/teams?l=${team.leagueId}&p=${team.pokemonIds.join(",")}` |

Meanwhile `buildTeamUrl()` exists in `src/lib/team-urls.ts` but is never imported.

**Action:** Use `buildTeamUrl()` everywhere or inline the pattern consistently.

### 5. Copy-to-clipboard + toast pattern — 2 files

| File | Lines |
|------|-------|
| `src/components/copy-bar.tsx` | 10-19 |
| `src/app/teams/page.tsx` | 211-219 |

Both: call `copyToClipboard()`, check success, show toast, handle failure.

**Action:** When building CopyButton, centralize the copy+toast+vibrate pattern into a single `useCopy(text)` hook or utility.

### 6. `TYPE_COLORS` usage pattern

`TYPE_COLORS` from `src/lib/constants.ts` is used in:
- `src/components/type-badge.tsx` (line 1) — the centralized component
- `src/components/team/coverage-chart.tsx` (line 4) — accesses directly
- `src/app/counter/[pokemon]/page.tsx` (line 14) — renders type badges inline instead of using `TypeBadge`

Counter page (line 92-98) renders colored type pills manually instead of using the `TypeBadge` component.

**Action:** Counter page should use `TypeBadge` for "Weak to" and "Resists" sections.

### 7. `LeagueId` type — defined in 2 places

| File | Line |
|------|------|
| `src/lib/team-types.ts` | :3 |
| `src/components/team/league-picker.tsx` | :3 (local `type LeagueId`) |

**Action:** `league-picker.tsx` should import from `team-types.ts`.

### 8. `LEAGUE_NAMES` / `LEAGUE_IDS` — defined in 2 places

| File | Constants |
|------|-----------|
| `src/components/home-team-preview.tsx` (lines 10-17) | `LEAGUE_NAMES` Record + `LEAGUE_IDS` array |
| `src/components/team/league-picker.tsx` (lines 5-12) | `LEAGUE_NAMES` Record + `LEAGUE_IDS` array |

**Action:** Extract to `src/lib/constants.ts` or a shared `leagues.ts`.

### 9. Team state management — duplicated across 3 files

| File | Pattern |
|------|---------|
| `src/app/teams/page.tsx` | `loadTeam`, `saveTeam`, `clearTeam`, `useEffect` sync |
| `src/components/league/league-page-client.tsx` | `loadTeam`, `saveTeam`, `clearTeam`, `useEffect` sync |
| `src/components/home-team-preview.tsx` | `getAllSavedTeams`, `clearTeam` |

Both teams/page.tsx and league-page-client.tsx have identical `useEffect` patterns for load-on-mount and save-on-change.

**Action:** Create a `useTeam(leagueId)` hook that encapsulates:
- Load from localStorage on mount
- Save to localStorage on change
- `add`, `remove`, `clear` methods
- Returns `[team, { add, remove, clear }]`

---

## MERGE — Components That Should Become One

### 1. TeamSlotCard + PokemonListItem — overlapping visual patterns

Both render a Pokemon with types, moves, and an action button in a bordered row.

| Feature | TeamSlotCard | PokemonListItem |
|---------|-------------|-----------------|
| Types display | TypeBadge | TypeBadge |
| Move display | No | Yes |
| Action button | X (remove) / + (add) | +, check, X, chevron |
| Empty state | Dashed border + "Tap to add" | N/A |
| Tier badge | No | Yes |

**Verdict:** Don't merge. They serve different purposes. TeamSlotCard has an empty state and is a slot container. PokemonListItem is a list row. But they could share a `PokemonRow` base layout.

### 2. CopyBar -> CopyButton + DualCopyButtons (v0.8.0 requirement)

Not a merge, but a replacement. CopyBar dies. Two new components:
- `CopyButton` — full-width or half-width button with copy+toast behavior
- `DualCopyButtons` — layout container for 2 CopyButtons side by side

---

## REFACTOR — Patterns to Clean Up

### 1. Counter page inlines type badge rendering instead of using TypeBadge

`src/app/counter/[pokemon]/page.tsx` lines 88-98 render `<span className={TYPE_COLORS[t]} ...>` manually. Should use `<TypeBadge type={t} />` with optional props for the "2x" suffix.

### 2. `team-analysis.ts` imports all 4 league JSONs at module level

`src/lib/team-analysis.ts` (lines 15-18) imports all league data unconditionally. This is fine for SSR/static generation but means any client component importing `getPokemonById` also pulls in all league data.

**Action:** Split `getPokemonById` into its own module (`pokemon-lookup.ts`) so components that only need name lookup don't import league data.

### 3. Teams page is 340 lines — approaching complexity threshold

`src/app/teams/page.tsx` at 339 lines has:
- URL param parsing
- localStorage sync
- Team state management
- Analysis computation
- Share handling
- Slot rendering with inline suggestions
- Coverage/threat/suggestion sections

**Action:** Extract the team state logic into `useTeam()` hook. Extract the share logic. The rendering sections are fine but would benefit from the state extraction.

### 4. `pokemonData` imported in 8 files — full 119-Pokemon JSON

Files importing `pokemon.json` that could use `getPokemonById` instead:
- `src/components/search-input.tsx` — Needs full list for search. Justified.
- `src/components/tier-accordion.tsx` — Only needs name lookup. Should use `getPokemonById`.
- `src/components/league/inline-team-section.tsx` — Only needs name lookup. Should use `getPokemonById`.
- `src/app/page.tsx` — Only needs name lookup for QUICK_PICKS. Should use `getPokemonById`.
- `src/app/counter/[pokemon]/page.tsx` — SSR page, needs full data. Justified.
- `src/app/league/[leagueSlug]/page.tsx` — SSR page, needs name lookup. Justified (server component).
- `src/lib/counters.ts` — Needs full data for counter calculation. Justified.
- `src/lib/team-analysis.ts` — Needs full data. Justified.

**3 client components import full pokemon.json unnecessarily:** `search-input.tsx` is justified, but `tier-accordion.tsx` and `inline-team-section.tsx` only need name lookup.

### 5. `TeamSlot` type defined in 2 places

| File | Line |
|------|------|
| `src/lib/team-types.ts` | :13 (canonical) |
| `src/components/team/team-slot.tsx` | :7 (local redefinition) |

**Action:** `team-slot.tsx` should import `TeamSlot` from `team-types.ts`.

### 6. Inline `toast()` calls are inconsistent

| File | Toast message |
|------|--------------|
| `copy-bar.tsx` | `"Copied! Paste in Pokemon GO"` |
| `league-page-client.tsx` | `"Team full (3 max). Remove one to swap."` |
| `teams/page.tsx` | `"Link copied!"` / `"Could not copy link"` |

No consistency in tone/format. Minor but worth standardizing in CopyButton.

---

## NOTES — Observations

### Unused Dependencies in package.json

| Package | Status |
|---------|--------|
| `tw-animate-css` | Imported in `globals.css` via `@import "tw-animate-css"`. Used only by accordion animations. Justified but could be replaced with 2 custom keyframes. |
| `@base-ui/react` | Used by all 4 UI components (accordion, button, input, sheet). Sheet is unused though. |
| `shadcn` (devDependency) | CLI tool, not a runtime dep. Fine. |

All other dependencies are actively used.

### Test Coverage: Zero

No test files exist anywhere in the project. Priority test targets:
1. `src/lib/type-effectiveness.ts` — Pure functions, easy to test, high value
2. `src/lib/counters.ts` — Pure functions, core feature
3. `src/lib/team-analysis.ts` — Complex logic, most likely to have bugs
4. `src/lib/team-rating.ts` — Pure functions
5. `src/lib/search-string.ts` — Pure functions, critical for correctness
6. `src/lib/team-storage.ts` — Needs mocking localStorage but straightforward

### Performance

The full `pokemon.json` (119 Pokemon) is small enough that importing it in multiple client components is not a real performance concern today. But the pattern of importing `team-analysis.ts` just for `getPokemonById` pulls in all league JSON data unnecessarily — that is worth fixing.

### Architecture Quality

The codebase is well-structured for its size. Clean separation between:
- Data layer (`src/data/`)
- Business logic (`src/lib/`)
- UI components (`src/components/`)
- Pages (`src/app/`)

Main issues are duplication (the `pokemonToSlot` and `pokemonData.find` patterns) and the lack of a centralized team state hook.

---

## Summary: Priority Actions for v0.8.0 Pre-Work

1. **Delete** `ui/sheet.tsx`, `clear-button.tsx` (after removing imports), unused exports
2. **Extract** `pokemonToSlot()` to shared `src/lib/team-utils.ts`
3. **Extract** `getPokemonById` + `getPokemonName` to `src/lib/pokemon-lookup.ts`
4. **Extract** `LEAGUE_NAMES` / `LEAGUE_IDS` to `src/lib/constants.ts`
5. **Extract** `useTeam()` hook to `src/lib/use-team.ts`
6. **Fix** `LeagueId` and `TeamSlot` type imports in `league-picker.tsx` and `team-slot.tsx`
7. **Replace** inline type badges in counter page with `TypeBadge` component
8. **Build** `CopyButton` + `DualCopyButtons` to replace `CopyBar`
9. **Delete** `web/` directory (stale previous iteration)
