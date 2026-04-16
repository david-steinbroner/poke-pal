# Copy Button & Pokemon Display Unification

**Date:** 2026-04-16
**Scope:** Unify copy button style, pokemon name typography, and vertical spacing across 4 team display contexts.

---

## Problem

4 different patterns for showing pokemon teams + copy actions:
1. Team Builder recommended teams — vertical stack, FAB copy
2. Team Builder my team — vertical stack, FAB copy
3. Leagues recommended teams — 2-col pill grid, inline copy
4. Rockets counter teams — dense single-line, inline copy

Copy buttons differ in style, placement, and interaction. Pokemon names vary in size. Spacing is inconsistent.

## Changes

### 1. Copy button: remove FAB, all inline

**Remove** `CopyFab` from Leagues and Team Builder pages. Replace with inline `CopyIconButton` components placed contextually:

**Leagues page:**
- "Copy Meta Search" inline button below the CP info line (scrollable body, not in header)
- "Copy Team Search" stays inline per recommended team (already correct)

**Team Builder page:**
- "Copy League" + "Copy My Team" as two side-by-side inline buttons below the header spacer div (first scrollable row, same pattern as before we added FAB)
- These scroll with content but are at the top so they're immediately visible

**Rockets page:** No change — already inline.

**Counter pages:** No change — already inline.

### 2. Pokemon name typography: standardize

All pokemon names across the app use the same style:
- `font-medium` (not bold, not normal)
- Default body size (no `text-sm`, no `text-lg`)
- Capitalize via data, not CSS `capitalize`

Applies to:
- Team Builder team slots (currently: `text-lg font-bold` → change to `font-medium`)
- Leagues meta list (currently: `font-medium` → correct, keep)
- Leagues recommended team pills (currently: `text-sm font-medium capitalize` → drop `text-sm capitalize`)
- Rockets counter pokemon (currently: `font-medium` within `text-sm` → drop `text-sm` wrapper)
- Counter pages pokemon list items (currently: `font-medium text-sm` → drop `text-sm`)

### 3. Vertical spacing: normalize rhythm

Between pokemon entries within a team/list:
- Use `space-y-2` (10px) consistently everywhere
- Currently varies: `space-y-1.5`, `space-y-2`, `space-y-3` across contexts

Between sections (e.g., "Counter by Type" → "Best Counter Pokemon"):
- Use `space-y-3` (15px) consistently

### 4. Inline copy button placement rules

| Context | Copy button position | Button label |
|---|---|---|
| Team Builder (top) | Side-by-side row below header | "Copy League" / "Copy My Team" |
| Leagues (meta) | Below CP info line | "Copy Meta Search" |
| Leagues (per team) | Below team description | "Copy Team Search" |
| Rockets (per encounter) | Below each section | "Copy Counter Types" / "Copy Counter Team" |
| Counter page | Below each section | "Copy Counter Types" / "Copy Top Counters" |

All use `CopyIconButton` component — same height, same style, same success state.

## Files to change

1. `src/components/copy-fab.tsx` — DELETE
2. `src/components/league/leagues-client.tsx` — remove CopyFab, add inline CopyIconButton
3. `src/app/teams/page.tsx` — remove CopyFab, restore inline copy buttons as first scrollable row
4. `src/components/rocket/rocket-encounter-card.tsx` — normalize spacing
5. `src/components/pokemon-list-item.tsx` — remove text-sm from name
6. `src/components/league/leagues-client.tsx` — normalize team pill text size
7. `src/components/counter-page-client.tsx` — normalize spacing

## What stays different

- Team Builder: vertical stack with role labels (LEAD/SAFE SWAP/CLOSER)
- Leagues: 2-col pill grid (tappable to counter page)
- Rockets: dense single-line format
- Amount of metadata (moves, strategy tips, type badges)
