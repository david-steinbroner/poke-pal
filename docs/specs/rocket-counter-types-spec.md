# Spec: Collapsible Counters + Counter Types Section

**Feature**: Rocket Tab — Collapsible sub-sections with new "Counter by Type" guidance  
**Status**: Approved (post-review)  
**Date**: 2026-04-12  
**App Version**: v1.2.0 → v1.3.0

---

## Problem

When a player opens a Rocket grunt/leader card, the counters section lists 3 specific Pokemon with moves. This is great for experienced players who have those exact Pokemon powered up. But:

1. **New/casual players** often don't have the meta picks. They need to know *what types work*, not just *which Pokemon*.
2. **Card height** — showing all info at once (lineup + counters + copy button) makes cards tall on mobile, especially when multiple cards are expanded.
3. **The `fallbackString` data already exists** (e.g. `@1fighting`) but is only used to render small "Key types" badges — it's underutilized.

## Solution

Two changes to `RocketEncounterCard`:

### Change 1: Make "Counter Pokemon" collapsible

The existing counters section (specific Pokemon + moves + copy button) becomes a collapsible sub-section within the expanded card body, toggled by a chevron + header.

- **Header**: `▸ COUNTER POKEMON` (chevron + small caps label)
- **Default state**: **Expanded** (this is the primary action — don't bury it)
- **Expanded content**: Same as current — Pokemon names, moves, "why" text, key type badges, "Copy Counter Team" button + search string preview

### Change 2: Add "Counter by Type" section

A new collapsible sub-section below "Counter Pokemon" that gives type-based guidance.

- **Header**: `▸ COUNTER BY TYPE` (chevron + small caps label)
- **Default state**: Collapsed
- **Content**: A list of types with counts showing the ideal team composition:
  ```
  1 Fighting — beats Normal, Dark, Steel
  1 Water — beats Ground, Rock, Fire
  1 Psychic — beats Poison, Fighting
  ```
- **Copy button**: "Copy Counter Types" → same button style as all other copy buttons (consistency is the product)
- **Search preview**: Shows the search string below the button, same pattern as existing

---

## Data Changes

### Current shape (per grunt/leader/giovanni)
```json
{
  "counters": {
    "pokemon": [...],
    "searchString": "machamp,lucario,conkeldurr",
    "fallbackString": "@1fighting"
  }
}
```

### New shape
```json
{
  "counters": {
    "pokemon": [...],
    "searchString": "machamp,lucario,conkeldurr",
    "fallbackString": "@1fighting"
  },
  "counterTypes": {
    "team": [
      { "type": "Fighting", "count": 1, "beats": "Normal, Dark, Steel" },
      { "type": "Water", "count": 1, "beats": "Ground, Rock, Fire" }
    ],
    "searchString": "@fighting,@water"
  }
}
```

- `counterTypes` is a **new sibling** to `counters` (not nested inside it)
- `team[]` entries describe the ideal type composition
- `count` = how many of that type to bring (usually 1, could be 2 for mono-type grunts)
- `beats` = human-readable explanation of what that type covers on this specific grunt's team
- `searchString` = Pokemon GO search string using `,` (OR) with `@type` (either type slot)

### Search string format (IMPORTANT)
- Use `@type` (matches either type slot), NOT `@1type`
- Join with `,` (OR operator) so the search returns Pokemon of ANY recommended type
- Example: `@fighting,@water,@psychic`
- Do NOT use `&` (AND) — that would return zero results since no Pokemon is multiple types

### Fallback behavior
- If `counterTypes` is missing or empty, the section doesn't render (backwards compatible)
- Existing `fallbackString` stays for the "Key types" badges in the Counter Pokemon section

---

## Component Changes

### Extract `CollapsibleSubSection` component

A small reusable mini-accordion used inside the card body:
- Chevron + small caps label as tappable header (min 44px tap target)
- Toggles children visibility
- Used twice: Counter Pokemon + Counter by Type

### `rocket-encounter-card.tsx`

```
Card Header (type badge + name) ← existing, unchanged
├── Taunt quote ← existing, unchanged
├── They Use (slots) ← existing, unchanged
├── ▾ COUNTER POKEMON ← existing content, now collapsible, EXPANDED by default
│   ├── Pokemon + moves list
│   ├── Key types badges
│   ├── [Copy Counter Team] button
│   └── Search string preview
└── ▸ COUNTER BY TYPE ← NEW, COLLAPSED by default
    ├── Type composition list (count + type badge + beats)
    ├── [Copy Counter Types] button
    └── Search string preview
```

**New types** (add to existing types block):
```ts
type CounterTypeEntry = {
  type: string;
  count: number;
  beats: string;
};
```

**Props change**: Add optional `counterTypes` prop:
```ts
counterTypes?: {
  team: CounterTypeEntry[];
  searchString: string;
};
```

### `rocket-lineups.json`

Add `counterTypes` to every grunt, leader, and Giovanni entry. ~15 entries total.

### `rockets/page.tsx`

Pass `counterTypes` from data to `RocketEncounterCard`. Minimal change.

---

## UX Details

### Sub-section accordion behavior
- Each sub-section toggles independently (opening one doesn't close the other)
- Chevron rotates: `▸` collapsed → `▾` expanded
- Tapping the header row toggles the section
- Same `active:opacity-70` feedback as the main card header

### Copy buttons
- **All copy buttons look identical** — same dark full-width style, same copied state, same behavior
- The label text differentiates them: "Copy Counter Team" vs "Copy Counter Types"
- This is intentional — the uniform copy button IS the core product interaction

### Default states
- **Main card**: Grunts collapsed, Leaders/Giovanni expanded (unchanged)
- **Counter Pokemon**: Expanded by default (primary action, don't add taps to the core flow)
- **Counter by Type**: Collapsed by default (supplemental, for players who need type guidance)

### Mobile considerations
- Sub-section headers: min 44px tap target height
- No horizontal scrolling — type lists wrap naturally
- Copy buttons: full-width for easy tapping

---

## Scope

### In scope
- `CollapsibleSubSection` extracted component
- Collapsible sub-sections in RocketEncounterCard
- New `counterTypes` data for all grunts, leaders, Giovanni
- Copy button for type-based search strings

### Out of scope
- Reordering existing sections (taunt, "They Use" stay flat/always visible)
- Changes to the Rocket Essentials section at bottom
- Any backend/API changes (all data is static JSON)
- Animation/transitions on collapse (keep it snappy, no frills)
- Visual differentiation between copy buttons (they stay uniform)

---

## Files Touched

| File | Change |
|------|--------|
| `src/components/rocket/collapsible-sub-section.tsx` | NEW — extracted mini-accordion component |
| `src/components/rocket/rocket-encounter-card.tsx` | Use CollapsibleSubSection for both sections, add counterTypes rendering |
| `src/data/rocket-lineups.json` | Add `counterTypes` to all entries |
| `src/app/rockets/page.tsx` | Pass `counterTypes` prop through |

---

## Version
Bump to **v1.3.0** — new feature addition.
