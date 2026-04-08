# Spec: Replace Floating Team Bar with Inline Team Section

**Date:** 2026-04-08
**Status:** Draft
**Scope:** League pages only

---

## Problem

The floating team bar (`FloatingTeamBar`) is a fixed-position panel anchored above the bottom nav. It creates z-index battles with the nav, requires padding hacks (`pb-36`) on the page body, locks body scroll when expanded, and uses backdrop blur and animation logic that adds complexity without clear UX benefit. On small screens it obscures meta card content.

## Solution

Replace the floating bar with an inline section (`InlineTeamSection`) that lives in the normal document flow, positioned between the meta CopyBar and the S Tier accordion. It scrolls with the page like everything else. No fixed positioning, no z-index, no body scroll lock.

---

## Files Changed

### DELETE

| File | Reason |
|------|--------|
| `src/components/league/floating-team-bar.tsx` | Entire component replaced |

### CREATE

| File | Description |
|------|-------------|
| `src/components/league/inline-team-section.tsx` | New inline team section component |

### MODIFY

| File | Changes |
|------|---------|
| `src/components/league/league-page-client.tsx` | Remove `FloatingTeamBar` import/usage, remove `pb-36` padding hack, add `InlineTeamSection` between CopyBar and TierAccordion |

### UNCHANGED

| File | Notes |
|------|-------|
| `src/components/meta-pokemon-card.tsx` | `+` button behavior unchanged |
| `src/components/tier-accordion.tsx` | Team props unchanged |
| `src/components/copy-bar.tsx` | Reused inside InlineTeamSection for team search string |
| `src/lib/team-analysis.ts` | `analyzeTeam`, `getPokemonById` used as-is |
| `src/lib/team-types.ts` | Types used as-is |
| Bottom nav | No longer competing with a floating bar |
| `/teams` page | Unchanged, still accessible via Teams tab |

---

## InlineTeamSection Component

### Props

```typescript
type InlineTeamSectionProps = {
  team: string[];           // Array of pokemonId strings (0-3 items)
  leagueId: string;         // e.g. "great-league"
  cpCap: number;            // e.g. 1500, 2500, 9999
  onRemove: (pokemonId: string) => void;
  onAdd: (pokemonId: string) => void;
};
```

### Render Logic

- **team.length === 0:** Render nothing (return `null`).
- **team.length 1-2:** Show header, team chips, empty slot placeholders, suggestion chips, copy bar.
- **team.length === 3:** Show header, team chips (no empty slots), copy bar. Suggestions row hidden.

### Layout (mobile-first, 375px reference)

```
+-------------------------------------+
|  Your Team                   5/18   |  <- header row
|                                     |
|  [Altaria x]  [2]  [3]             |  <- team chips + empty slots
|                                     |
|  Try: [+ Registeel] [+ Steelix]    |  <- suggestion chips (when < 3)
|                                     |
|  +-------------------------------+  |
|  | altaria,registeel&cp-1500     | Copy|  <- CopyBar with team search string
|  +-------------------------------+  |
+-------------------------------------+
```

### Elements

**1. Header row** (`flex items-center justify-between`)
- Left: "Your Team" label, `text-sm font-semibold`
- Right: Coverage score from `analyzeTeam().coverageScore` displayed as `{score}/18`, `text-sm text-muted-foreground`

**2. Team chips** (`flex flex-wrap gap-1.5`)
- Filled slots: pill with Pokemon name + X button to remove. Style: `rounded-full border bg-card px-2.5 py-1 text-xs font-medium`. Long names use `truncate` with `max-w-[120px]`.
- Empty slots: dashed circle with slot number. Style: `h-7 w-7 rounded-full border border-dashed text-muted-foreground text-xs`, centered number.

**3. Suggestion chips** (only when `team.length < 3`)
- "Try:" label, `text-xs text-muted-foreground`
- Up to 3 tappable pills from `analyzeTeam().suggestions`, filtered to exclude Pokemon already on team.
- Each pill: `rounded-full border px-2.5 py-1 text-xs font-medium` with `Plus` icon (lucide, `h-3 w-3`). `onClick` calls `onAdd(suggestion.pokemonId)`.
- Container: `flex flex-wrap gap-1.5` to handle overflow on small screens.

**4. Copy bar** (reuses `CopyBar` component)
- Search string built from team names + CP cap, same logic as current floating bar:
  - `buildNameSearchString(names)` for the name filter
  - Append `&${buildLeagueEligibleString(cpCap)}` unless Master League (cpCap >= 9999)
- Uses the shared `CopyBar` component from `src/components/copy-bar.tsx`.

### Styling

- Outer wrapper: `rounded-lg border p-4 space-y-3`
- No `fixed` or `sticky` positioning
- No `backdrop-blur`, no `z-index`
- No expand/collapse animation, no body scroll lock
- Matches existing page visual language (same border, card, and text styles)

### Helpers Reused from Floating Bar

These functions from `floating-team-bar.tsx` should be extracted or reimplemented in the new component:

- `getPokemonName(pokemonId)` -- looks up display name from `pokemon.json`
- `pokemonToSlot(id)` -- converts a pokemonId to a `TeamSlot` for `analyzeTeam`
- Search string construction using `buildNameSearchString` and `buildLeagueEligibleString`
- `analyzeTeam` call via `useMemo` keyed on `[team, leagueId]`

---

## Changes to league-page-client.tsx

### Before (current)

```tsx
import { FloatingTeamBar } from "./floating-team-bar";

// In JSX:
<div className={`space-y-4 pt-4 ${team.length > 0 ? "pb-36" : ""}`}>
  {/* ... header, CopyBar, TierAccordion ... */}
  <FloatingTeamBar team={team} leagueId={leagueId} cpCap={cpCap}
    onRemove={handleRemoveFromTeam} onAdd={handleAddToTeam} />
</div>
```

### After

```tsx
import { InlineTeamSection } from "./inline-team-section";

// In JSX:
<div className="space-y-4 pt-4">
  {/* ... header ... */}

  <div className={team.length > 0 ? "opacity-40 transition-opacity" : "transition-opacity"}>
    <p className="mb-1 text-xs font-medium text-muted-foreground">
      Find meta Pokemon you own
    </p>
    <CopyBar searchString={fullSearchString} />
  </div>

  <InlineTeamSection
    team={team}
    leagueId={leagueId}
    cpCap={cpCap}
    onRemove={handleRemoveFromTeam}
    onAdd={handleAddToTeam}
  />

  <TierAccordion meta={meta} onAddToTeam={handleAddToTeam} teamPokemonIds={team} />
</div>
```

Key changes:
1. `FloatingTeamBar` import replaced with `InlineTeamSection` import
2. `pb-36` conditional padding removed (no longer needed)
3. `InlineTeamSection` placed between CopyBar and TierAccordion in the DOM
4. Meta CopyBar opacity-40 behavior stays as-is (already implemented)

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Long Pokemon names (e.g. "galarian-stunfisk") | `truncate` with `max-w-[120px]` on chip text |
| 3 suggestion chips overflow on 320px screen | `flex-wrap` on suggestion container |
| Team goes from 0 to 1 | Section appears instantly (conditional render, no animation) |
| Team goes from 1 to 0 | Section disappears instantly (renders `null`) |
| Team is full (3/3) | Suggestion row hidden, score updates, copy bar shows all 3 |
| Master League (cpCap 9999) | Copy bar omits CP filter, shows names only |
| User taps + on a Pokemon already on team | `handleAddToTeam` short-circuits (existing behavior in league-page-client) |
| User taps + when team is full | Toast "Team full (3 max). Remove one to swap." (existing behavior) |

---

## Acceptance Criteria

- [ ] `FloatingTeamBar` component deleted, no remaining imports
- [ ] No `fixed`, `sticky`, or `z-50` positioning in team UI
- [ ] No `pb-28`/`pb-36` padding hacks in league page
- [ ] No `document.body.style.overflow` manipulation
- [ ] InlineTeamSection renders nothing when team is empty
- [ ] InlineTeamSection appears between CopyBar and TierAccordion when 1+ Pokemon added
- [ ] Team chips show Pokemon names with X to remove
- [ ] Empty slots shown as dashed circles with slot numbers
- [ ] Coverage score (X/18) displayed in header row
- [ ] Suggestion chips shown when team < 3, hidden when full
- [ ] Suggestion chips call `onAdd` when tapped
- [ ] Copy bar shows correct search string (names + CP cap)
- [ ] Copy bar works (copies to clipboard, shows toast)
- [ ] Meta CopyBar dims to `opacity-40` when team has Pokemon (existing behavior preserved)
- [ ] Bottom nav unaffected, no overlap issues
- [ ] All existing team state management (`useState<string[]>`) unchanged

---

## What This Spec Does NOT Cover

- The `/teams` page (unchanged)
- MetaPokemonCard internals (unchanged)
- TierAccordion internals (unchanged)
- Team analysis logic (unchanged)
- Any new routes or pages
- Animations or transitions (intentionally omitted for simplicity)
