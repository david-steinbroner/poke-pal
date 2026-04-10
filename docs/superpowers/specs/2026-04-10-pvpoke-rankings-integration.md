# PvPoke Rankings Integration — Scope

Last updated: 2026-04-10

## Goal

Replace our homegrown type-coverage team rating with PvPoke's pre-computed battle simulation data. This gives us real win/loss matchup data without building our own simulator.

## Data Source

PvPoke (MIT licensed, open source) publishes pre-computed rankings per league:

```
https://raw.githubusercontent.com/pvpoke/pvpoke/master/src/data/rankings/all/overall/rankings-{cpCap}.json
```

- `rankings-1500.json` — Great League + cups with 1500 CP cap
- `rankings-2500.json` — Ultra League
- `rankings-10000.json` — Master League

### Data per Pokemon (from PvPoke rankings)

| Field | Type | What it gives us |
|-------|------|-----------------|
| `speciesId` | string | Pokemon ID (underscore format, we convert to hyphens) |
| `rating` | number | Overall battle rating (>500 = generally wins) |
| `score` | number | Percentile score (0-100) |
| `matchups` | array | Top 5 favorable matchups with win ratings |
| `counters` | array | Top 5 unfavorable matchups (what beats this Pokemon) |
| `moveset` | string[] | Recommended 3-move combination |
| `stats.product` | number | Stat product (atk × def × hp) — bulk indicator |

## What We Build

### 1. Import Script: `scripts/import-pvpoke-rankings.mjs`

Fetches rankings for each active league's CP cap, transforms IDs to hyphen format, stores as:
```
src/data/rankings/great-league-rankings.json
src/data/rankings/ultra-league-rankings.json
src/data/rankings/master-league-rankings.json
src/data/rankings/fantasy-cup-rankings.json  (uses 1500 since it's GL-based)
```

Each file is a map: `{ [pokemonId]: { rating, score, matchups, counters, moveset, statProduct } }`

### 2. Team Rating Rewrite: `src/lib/team-rating.ts`

Replace current coverage-based formula with matchup-based scoring:

**New algorithm:**
1. For each meta Pokemon in the league, check: does at least one of your 3 team members beat it? (Use the matchups/counters data — if the meta Pokemon appears in one of your team member's `matchups` array with a rating > 500, you beat it.)
2. **Threat coverage** = % of meta Pokemon your team can answer. This is PvPoke's "Threat Score" concept.
3. **Shared counters penalty** = if the same opponent appears in the `counters` list of 2+ of your team members, that's a hard counter to your team.
4. **Bulk score** = average `statProduct` of your team vs league average.
5. **Consistency bonus** = all 3 Pokemon have high individual `score` values.

**Rating formula:**
```
threatCoverage (50%) + sharedCounterPenalty (25%) + bulkScore (15%) + consistencyBonus (10%)
```

**Grade thresholds** (calibrated against known good/bad teams):
- S: Covers 80%+ meta threats, no shared counters, above-average bulk
- A: Covers 65%+ meta threats, ≤1 shared counter
- B: Covers 50%+ meta threats
- C: Covers 35%+ meta threats or 2+ shared counters
- D: Below 35% threat coverage

### 3. Smarter Suggestions: `src/lib/team-analysis.ts`

Upgrade `suggestSwaps()` to use matchup data:

**Current:** Suggests Pokemon that cover offensive type gaps.
**New:** Suggests Pokemon whose `matchups` list covers the meta threats your current team LOSES to.

Algorithm:
1. Find which meta Pokemon your current team can't beat (none of your Pokemon have them in `matchups` with rating > 500)
2. For each candidate, count how many of those uncovered threats appear in the candidate's `matchups`
3. Also check: does the candidate share counters with your existing team? (anti-synergy penalty)
4. Rank by: threats covered (60%) + anti-synergy (20%) + individual score (20%)

### 4. Suggested Movesets

PvPoke provides `moveset` (recommended fast + 2 charged moves) per Pokemon. Display this on:
- Team slot cards on Teams page
- League page meta cards (already show recommended moves, but could validate against PvPoke data)

## Files Changed

| File | Change |
|------|--------|
| `scripts/import-pvpoke-rankings.mjs` | NEW — fetch + transform script |
| `src/data/rankings/*.json` | NEW — one per league |
| `src/lib/team-rating.ts` | REWRITE — matchup-based scoring |
| `src/lib/team-analysis.ts` | MODIFY — suggestSwaps() uses matchup data |
| `src/lib/rankings.ts` | NEW — lookup helpers for rankings data |

## Files NOT Changed

- `src/app/page.tsx` — home page unaffected
- `src/components/home/*` — home components unaffected
- `src/app/counter/*/page.tsx` — counter pages keep type-based search strings
- `src/data/leagues/*.json` — league meta picks stay manually curated

## Risks

1. **PvPoke data format could change** — they're open source and may restructure. Our import script should fail loudly if the shape changes.
2. **Rankings are for open league, not cups** — Fantasy Cup (type-restricted) won't have a separate rankings file. We'd use Great League rankings filtered to allowed types. Accuracy will be lower for cups.
3. **Data freshness** — PvPoke updates rankings with each game balance change. We need to re-run the import when moves get buffed/nerfed.
4. **Bundle size** — Each rankings file is ~200-400KB. With 4 leagues that's ~1MB+ of JSON. May need to lazy-load or only include top 100 per league.

## Build Order

1. Import script + rankings data files (additive, no existing code changes)
2. `src/lib/rankings.ts` helper (additive)
3. Team rating rewrite (swap in new formula, keep old as fallback)
4. Suggestion engine upgrade
5. Test with known good/bad teams, calibrate thresholds
6. Build + test + verify
