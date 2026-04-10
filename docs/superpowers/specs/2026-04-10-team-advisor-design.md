# Team Advisor — Design Spec

**Date**: 2026-04-10
**Version**: 1.1 (revised after product + engineering review)
**Status**: Draft

---

## Problem

Users can't answer "What's my best team for Ultra League?" in the app. The current Teams page lets you manually pick 3 Pokemon and see coverage analysis, but it doesn't recommend teams based on what you actually have. Users end up copying a CP search string, looking at their GO storage, and asking Google AI for team recs — that flow should live in Poke Pal.

## Solution

Enhance the Teams page with a state-driven advisor flow. Users scan their Pokemon GO storage via screenshots (or manually enter Pokemon), and the app recommends optimal teams with movesets and tactical strategy.

---

## User Flow

### State 1 — Select League + Copy Search String

**Trigger**: Fresh visit or no scanned pool for this league.

- League tabs at top (existing, unchanged)
- Primary CTA: **"Copy cp-2500"** (dynamic per league CP cap)
  - Great League: `cp-1500`
  - Ultra League: `cp-2500`
  - Master League: no CP filter needed — show `cp4000-` or skip
- Helper text: "Paste in Pokemon GO and sort by CP. Then come back and add your Pokemon."
- No team slots visible yet
- No team copy button in header (disabled state)

**Transition to State 2**: User taps the copy button, OR taps "I already know my Pokemon →" skip link.

> **Skip link**: Below the CP copy button, a text link "I already know my Pokemon →" bypasses the copy step and goes directly to pool building. This handles users who already searched in GO, users in private browsing, and returning users who don't need the CP string again.

### State 2 — Build Your Pool

**Trigger**: CP string has been copied.

Two input methods, both feeding the same pool:

#### Screenshot Upload
- "Upload GO Screenshots" area with 2 upload slots
- Tap to select from camera roll / drag-drop on desktop
- "Scan My Pokemon" button (sends to Cloudflare Worker → Claude Vision API)
- Processing state: spinner + "Reading your Pokemon..."
- Error state: "Couldn't read this screenshot — try a clearer one"
- Cost: ~$0.002-0.006 per scan (2 images)

#### Manual Entry
- Search bar: "Add a Pokemon..." (reuses existing SearchInput component)
- Tapping a search result adds it to the pool

#### My Pokemon Section
- Collapsible: **"My Pokemon (22)"** with chevron
- Grid of Pokemon chips showing all Pokemon in pool
- Each chip has X to remove
- Search bar at bottom for manual adds
- "Rescan" button to redo screenshots
- Pool persists in localStorage per league key: `poke-pal:pool:{leagueId}`

**Transition to State 3**: Pool reaches 3+ Pokemon.

### State 3 — Recommendations

**Trigger**: Pool has 3+ Pokemon.

#### Recommendation Engine
- Brute-force all combinations of 3 from pool
  - 24 Pokemon = 2,024 combos
  - 36 Pokemon = 7,140 combos
  - All run client-side in <100ms using existing `analyzeTeam` + `calculateTeamRating`
- Rank by team rating score
- Show top 3-5 recommended teams

#### Recommended Teams Section
- Collapsible: **"Recommended Teams"** — best team expanded, rest collapsed
- Each team card contains:
  - **Pokemon row**: 3 Pokemon chips with type badges
  - **Team rating**: badge (S/A/B/C/D) + coverage score (X/18 types)
  - **Movesets**: per Pokemon — "Dragon Breath | Dragon Claw, Hurricane"
  - **Strategy section**:
    - **Lead**: who and why — "Generalist lead — cheap Dragon Claw pressures shields early"
    - **Safe Swap**: when to switch — "Swap to Venusaur against Water or Ground types"
    - **Closer**: endgame plan — "Farm energy, close with Ice Beam for Dragon/Flying coverage"
  - **"Use This Team"** button

Recommendations re-run live when pool changes (add/remove Pokemon).

**Transition to State 4**: User taps "Use This Team".

### State 4 — Team Loaded

**Trigger**: User selects a recommended team OR manually fills 3 slots.

- 3 team slots filled (existing TeamSlotCard UI)
- Copy Team Search String button in header (active)
- Strategy tips persist below team slots
- Meta Threats section (existing, collapsible)
- Can still swap individual Pokemon via search bar
- "My Pokemon" section collapses automatically
- "Recommended Teams" section collapses automatically

---

## Removals from Current Teams Page

- **Remove**: "← League info" link + team rating badge + "X/18 types covered" row
  - Rating and coverage will be shown within recommended team cards instead
- **Remove**: "Find Teammates in GO →" discovery string button
  - Replaced by the CP copy string + scan flow

---

## Strategy Tips Engine

Template-based tactical advice generated from existing move data in league JSONs.

### Templates

| Condition | Template |
|-----------|----------|
| Pokemon has cheap + expensive charged move | "Use {cheap} to bait shields, then land {expensive}" |
| Lead has high meta coverage | "Generalist lead — wins or ties most neutral matchups" |
| Lead has cheap fast move (Mud Shot, Lock-On, Shadow Claw) | "Fast energy gain — pressure shields early with {charged}" |
| Safe swap resists lead's weaknesses | "Switch to {name} against {weakness types}" |
| Safe swap has broad neutral coverage | "Few hard losses — draws out opponent's counter" |
| Closer has nuke moves (80+ energy) | "Farm energy on previous matchup, close with {move}" |
| Closer has unique type coverage | "Covers {types} that the rest of the team can't" |
| Team uses ABB archetype (2 same type in back) | "Double {type} core draws out the counter early" |

### Data Sources
- `recommendedFast` and `recommendedCharged` from league JSON meta entries
- `fastMoves` and `chargedMoves` from `pokemon.json` (energy cost, damage, type)
- `assignRoles()` from `team-analysis.ts` (lead/safe-swap/closer assignment)

### Moveset Energy Thresholds
- Cheap: ≤40 energy (Dragon Claw, Aqua Tail, Cross Chop)
- Mid: 45-55 energy (Hydro Cannon, Frenzy Plant, Shadow Ball)
- Expensive/Nuke: ≥60 energy (Earthquake, Focus Blast, Hurricane)

---

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `src/lib/team-advisor.ts` | Brute-force combo scorer + strategy tips generator (merged — only ~250 lines total) |
| `src/components/team/screenshot-upload.tsx` | Upload UI for 2 screenshots + scan button |
| `src/components/team/pokemon-pool.tsx` | "My Pokemon" collapsible section with chips + search |
| `src/components/team/recommended-teams.tsx` | Recommended team cards with strategy |
| `functions/api/scan.ts` | Cloudflare Pages Function — receives screenshots, calls Claude Vision, returns Pokemon names |

### Modified Files

| File | Change |
|------|--------|
| `src/app/teams/page.tsx` | State machine for 4-step flow. Remove league info row + rating row. |
| `src/lib/team-storage.ts` | Add pool CRUD functions (savePool, loadPool, clearPool, addToPool, removeFromPool) alongside existing team storage. Same pattern, `poke-pal:advisor:{leagueId}` key. |
| `src/lib/pokemon-utils.ts` | Add `matchPokemonNames()` for OCR result matching. Reuses `getPokemonById`. |
| `src/lib/team-analysis.ts` | **Remove dead code**: `buildDiscoveryString`, `suggestSwaps`. Remove `discoveryString` and `suggestions` from `analyzeTeam` return. |
| `src/lib/team-types.ts` | **Remove dead types**: `SwapSuggestion`, `discoveryString` field, `suggestions` field from `TeamAnalysis`. |
| `src/lib/team-rating.ts` | No changes — used as-is by advisor |

### Dead Code Removal

These are deleted as part of the rewrite — they are replaced by the new advisor flow:

| What | Where | Why Dead |
|------|-------|----------|
| `buildDiscoveryString()` | `team-analysis.ts:269-324` | "Find Teammates in GO" button removed |
| `suggestSwaps()` | `team-analysis.ts:174-257` | Meta suggestions replaced by combo recommender |
| `SwapSuggestion` type | `team-types.ts:37-43` | Only used by `suggestSwaps` |
| `discoveryString` field | `team-types.ts:50`, `team-analysis.ts` | Button removed |
| `suggestions` field | `team-types.ts:48`, `team-analysis.ts` | Function removed |

### Scan Endpoint: Cloudflare Pages Function

**Path**: `functions/api/scan.ts` — deploys automatically with Cloudflare Pages (no separate Worker, no CORS config needed).

**Request**: `POST` with `FormData` containing 1-2 image files.

**Processing**:
1. Validate: max 2 images, max 5MB each, image/* MIME type
2. Convert to base64
3. Call Claude API (claude-haiku-4-5 for cost efficiency) with prompt:
   - "List every Pokemon visible in this Pokemon GO storage screenshot. Return only a JSON array of Pokemon names."
4. Parse JSON response
5. Return raw names — client-side `matchPokemonNames()` handles matching to our dataset

**Response**: `{ pokemon: string[] }`

**Cost**: ~$0.001-0.003 per image with Haiku.

**Environment**: Cloudflare Pages Function. API key stored via `wrangler secret put ANTHROPIC_API_KEY`. No separate deployment needed.

### Combo Scoring Algorithm (Two-Pass)

**Fast pass** — scores all C(n,3) combos with a lightweight function:
```
for each combination of 3 from pool:
  score = offensiveCoverageScore + tierBonus - sharedWeaknessPenalty
  
sort by score descending
keep top 5
```

**Full pass** — runs detailed analysis on top 5 only:
```
for each top-5 combo:
  analysis = analyzeTeam(combo, leagueId)
  rating = calculateTeamRating(combo, leagueId, analysis)
  roles = assignRoles(combo, leagueId)
  tips = generateStrategyTips(combo, roles, leagueId)
```

The fast pass computes only coverage + weakness penalty (no threats, no search strings, no meta iteration). This keeps brute-force under 50ms even for 36 Pokemon (7,140 combos).

### State Persistence

| Key | Value | When |
|-----|-------|------|
| `poke-pal:advisor:{leagueId}` | `{ pool: string[], cpCopied: boolean }` | After scan, manual add/remove, or CP copy |
| `poke-pal:team:{leagueId}` | `string[]` (Pokemon IDs) | After "Use This Team" or manual pick (existing, unchanged) |
| `poke-pal:lastEditedLeague` | `string` (league ID) | On league change (existing, unchanged) |

Pool and cpCopied are consolidated into one key per league. Team storage stays separate (already in production).

### Future-Proofing: Account Storage

All storage access goes through `team-storage.ts` functions (`savePool`, `loadPool`, `saveTeam`, `loadTeam`). Components never touch `localStorage` directly. This means swapping to an API-backed store (when user accounts are added) only requires changing the storage module internals — no component changes needed.

Design constraints for future account support:
- All data keyed by Pokemon IDs (stable across devices)
- Storage interface is sync now but can become async later (wrap in Promise)
- No device-specific data in the pool (no file paths, no blob URLs)

---

## Constraints

- **Free tier**: 2 screenshots max (~24 Pokemon)
- **Paid tier** (future): more screenshots, more combos
- **No IV awareness**: recommendations based on species + moves + types only
- **No shadow/purified optimization**: treated as same species
- **Strategy tips are template-based**: not AI-generated per request
- **Pool is per-league**: switching leagues shows that league's pool (if any)

---

## Not Included (Future)

- Paid tier with expanded screenshot limits
- Manual quick-entry as standalone mode (searchable multi-select grid)
- IV-aware recommendations (needs full scanner pipeline data)
- Shadow/Purified/Mega optimization
- Share recommended team via URL
- Raids tab
- Integration with D1 scanner database (would bypass screenshot step entirely)

---

## Success Criteria

1. User can go from "I want to play Ultra League" to "here's my best team with movesets and strategy" in under 2 minutes
2. Recommended teams are competitive (would score B+ or higher on team rating)
3. Strategy tips are specific and actionable (not generic "this Pokemon is good")
4. Screenshot scanning correctly identifies 90%+ of Pokemon in GO storage screenshots
5. Page feels guided, not overwhelming — each state shows only what's relevant
