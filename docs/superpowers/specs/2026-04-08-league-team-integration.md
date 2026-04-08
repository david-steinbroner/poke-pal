# League Page Team Building — Product Spec

## What This Is

An in-place team building flow on league/cup pages. Players tap + on meta Pokemon cards to assemble a 3-mon team without leaving the page. A floating bar at the bottom tracks their picks, gives them a search string, and links to the full team builder for coverage analysis.

This bridges the gap between browsing meta and building a team. Right now those are two separate workflows on two separate pages. This puts them in the same place.

## Why

The league meta page is where players decide what to run. The team builder is where they assemble it. Forcing a navigation between them adds friction and breaks context. A player scanning the Great League tier list should be able to tap three Pokemon and walk away with a search string — no page change, no league re-selection, no re-finding the Pokemon they just saw.

The full `/teams` page with coverage analysis, threats, and suggestions stays as-is. This feature is a lightweight on-ramp into it.

## Jobs to Be Done

1. "I'm scanning the meta list and want to remember 3 picks" — Player taps + on three cards and gets a search string immediately.
2. "I want to check if these 3 actually work together" — Player taps "Analyze" on the floating bar and lands in the full team builder with their picks pre-loaded.
3. "I changed my mind about one pick" — Player taps X on a chip in the bar, then taps + on a different card.

## UX Flow

### Starting State

League page renders exactly as it does today: back link, league header, meta CopyBar, tier accordions. No floating bar. No + buttons visible... wait, the + buttons are always visible on each card, they just do nothing until tapped.

### Step 1: Player Taps + on a Meta Card

The + icon on the right side of the `MetaPokemonCard` adds that Pokemon to the team. The floating team bar slides up from the bottom of the screen with that Pokemon as the first chip.

The + on the card changes to a checkmark icon. The card is not otherwise modified — same tier badge, name, moves.

### Step 2: Player Adds More

Tapping + on a second card adds it as chip 2. Third card fills the team. Each time, the floating bar updates: chips, search string, and the "Analyze" link all reflect the current picks.

### Step 3: Team is Full

If the player taps + on a fourth card, a toast appears: "Team full (3 max). Remove one to swap." The card's + does not change. Nothing is added.

### Step 4: Player Removes a Pick

Tapping X on a chip in the floating bar removes that Pokemon. The corresponding card's checkmark reverts to +. If the team drops to 0, the bar slides away.

### Step 5: Player Taps "Analyze"

The bar has an "Analyze" link that navigates to `/teams?l=[leagueSlug]&p=[id1,id2,id3]`. The team builder page already reads `l` and `p` from URL params and pre-loads the team. No new work needed on the team builder side.

### Step 6: Player Navigates Away

Team state resets. No persistence for MVP. If the player hits back and returns to the league page, the bar is gone and all cards show +. This is acceptable — the flow is fast enough to redo, and the team builder has its own state via URL params once they navigate there.

---

## Component Changes

### 1. MetaPokemonCard — Add Team Button

**File:** `src/components/meta-pokemon-card.tsx`

Current card layout:

```
[Tier] [Name + Moves                    ]
```

New card layout:

```
[Tier] [Name + Moves                 ] [+]
```

**Props added:**
- `onAdd?: () => void` — callback when + is tapped. If undefined, no + button renders (backward compatible for any future use outside league pages).
- `isOnTeam?: boolean` — when true, show checkmark instead of +, and disable the button.

**+ Button spec:**
- Icon: `Plus` from lucide-react (same icon used in team-slot.tsx empty state)
- When `isOnTeam` is true: `Check` icon from lucide-react, muted color, `pointer-events-none`
- Size: 44x44px touch target minimum. The icon itself can be 20x20 inside a 44x44 tappable area.
- Position: right side of the card, vertically centered. Uses `shrink-0` to prevent compression.
- Color: `text-muted-foreground` for +, `text-green-600 dark:text-green-400` for checkmark.
- The button has `aria-label="Add [Pokemon name] to team"` or `"[Pokemon name] added to team"`.

**What does NOT change:**
- Tier badge position and styling
- Pokemon name and move display
- Card border, padding, and spacing
- Cards without `onAdd` prop render identically to today

### 2. FloatingTeamBar — New Component

**File:** `src/components/league/floating-team-bar.tsx`

A fixed-position bar at the bottom of the viewport. Appears when 1+ Pokemon are in the team. Disappears when the team is empty.

**Layout (single row, left to right):**

```
[ Chip1 (x) ] [ Chip2 (x) ] [ Chip3 (x) ] | [ Copy ] [ Analyze -> ]
```

On narrower screens where 3 chips + buttons don't fit in one row, the bar stacks into two rows:

```
Row 1: [ Chip1 (x) ] [ Chip2 (x) ] [ Chip3 (x) ]
Row 2: [ Copy                ] [ Analyze ->       ]
```

**Chip spec:**
- Each chip shows the Pokemon name (capitalized, hyphens replaced with spaces).
- X button on each chip to remove. Touch target 44px.
- Chip style: `rounded-full border px-3 py-1.5 text-sm`. Similar to the counter detail chips in the team builder page.
- Max 3 chips. Empty slots are not shown (no placeholder chips).

**Copy button:**
- Reuses the copy logic from `CopyBar` (textarea fallback for iOS HTTP).
- Label: "Copy" / "Copied!" toggle with 2s timeout.
- The search string format matches what the team builder produces: `name1,name2,name3&cp-[cap]`. For Master League (cpCap 9999), omit the CP filter.
- Uses `buildNameSearchString` and `buildLeagueEligibleString` from `src/lib/search-string.ts`.
- Toast on copy: "Copied! Paste in Pokemon GO" (same toast as existing CopyBar).

**Analyze link:**
- Text: "Analyze" with a right arrow.
- Links to `/teams?l=[leagueSlug]&p=[comma-separated pokemonIds]`.
- Styled as a text link or small button, not a full CopyBar-style button. Visually secondary to Copy.

**Positioning:**
- `position: fixed; bottom: 0; left: 0; right: 0;`
- `z-index: 50` (above page content, below modals/toasts if any).
- Background: `bg-background/95 backdrop-blur-sm border-t` for a frosted glass effect that doesn't fully obscure content behind it.
- Padding: `px-4 py-3`. Safe area padding on bottom for iOS notch devices: `pb-[env(safe-area-inset-bottom, 12px)]`.

**Animation:**
- Slides up when appearing (first Pokemon added), slides down when disappearing (last Pokemon removed).
- CSS transition or `framer-motion` if already in the project. If neither, a simple CSS `translate-y` transition is fine. No heavy animation library for this.

**Props:**
```typescript
type FloatingTeamBarProps = {
  team: { pokemonId: string; name: string }[];
  leagueSlug: string;
  cpCap: number;
  onRemove: (pokemonId: string) => void;
};
```

### 3. League Page — State Management + Wiring

**File:** `src/app/league/[leagueSlug]/page.tsx`

This page is currently a server component. It needs client-side state for the team. Two options:

**Option A (recommended): Extract a client wrapper.**

Keep the server component for metadata generation and data loading. Add a new client component `LeaguePageClient` that receives the league data as props and manages team state.

```
// page.tsx (server component, unchanged data loading)
export default async function LeaguePage({ params }) {
  // ... load league data as today ...
  return <LeaguePageClient league={league} />;
}
```

```
// src/components/league/league-page-client.tsx ("use client")
// Receives league data, manages team state, renders tier accordions + floating bar
```

**Option B: Wrap just the interactive parts in a client island.**

Keep the current page structure, wrap the `TierAccordion` and `FloatingTeamBar` in a client component that manages state. Less refactoring but messier boundaries.

Go with Option A. Cleaner separation.

**State shape:**

```typescript
const [team, setTeam] = useState<string[]>([]);
// Array of pokemonIds, max length 3
// Order = insertion order
```

**Handlers:**

```typescript
function handleAddToTeam(pokemonId: string) {
  if (team.length >= 3) {
    toast("Team full (3 max). Remove one to swap.");
    return;
  }
  if (team.includes(pokemonId)) return; // already on team, no-op
  setTeam((prev) => [...prev, pokemonId]);
}

function handleRemoveFromTeam(pokemonId: string) {
  setTeam((prev) => prev.filter((id) => id !== pokemonId));
}
```

**Wiring to MetaPokemonCard:**

The `TierAccordion` component currently renders `MetaPokemonCard` for each meta Pokemon. It needs to pass down `onAdd` and `isOnTeam` per card. This means `TierAccordion` also needs to accept a callback and the current team set.

`TierAccordion` changes:
- New optional props: `onAddToTeam?: (pokemonId: string) => void` and `teamPokemonIds?: string[]`.
- When present, each `MetaPokemonCard` gets `onAdd={() => onAddToTeam(pokemonId)}` and `isOnTeam={teamPokemonIds.includes(pokemonId)}`.
- When absent (if TierAccordion is used elsewhere without team building), cards render without + buttons. Backward compatible.

**Bottom padding:**

When the floating bar is visible, add `pb-24` (or a calculated value) to the page container so the last tier accordion content isn't hidden behind the bar. When the bar is hidden, remove the padding.

```typescript
<div className={`space-y-4 pt-4 ${team.length > 0 ? "pb-28" : ""}`}>
```

The exact padding value depends on the bar height. 28 (7rem) should cover a two-row bar + safe area. Test on iPhone SE (smallest common viewport).

---

## Search String Generation

The floating bar builds the search string using existing utilities:

```typescript
import { buildNameSearchString, buildLeagueEligibleString } from "@/lib/search-string";
import pokemonData from "@/data/pokemon.json";

function buildTeamSearchString(pokemonIds: string[], cpCap: number): string {
  const names = pokemonIds.map((id) => {
    const pokemon = pokemonData.find((p) => p.id === id);
    return pokemon?.name ?? id;
  });
  const nameStr = buildNameSearchString(names);
  if (cpCap >= 9999) return nameStr;
  return `${nameStr}&${buildLeagueEligibleString(cpCap)}`;
}
```

This matches the same logic in `team-analysis.ts` `buildSearchString`. No new search string utilities needed.

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Tap + when team has 3 | Toast: "Team full (3 max). Remove one to swap." Card stays as +. |
| Tap + on a Pokemon already on team | No-op. Card already shows checkmark. Button is visually disabled. |
| Remove all Pokemon from bar | Bar slides down and disappears. Bottom padding removed. All cards revert to + icon. |
| Navigate to another league page | Team state resets (useState is per-page). Acceptable for MVP. |
| Navigate to team builder via "Analyze" and then press back | Team state on league page is gone. Player would need to re-add. The team builder has its own URL-persisted state. |
| League with type restrictions (Fantasy Cup) | No special handling needed. Only that league's meta Pokemon appear in the tier accordion, so only eligible Pokemon can be added. |
| League page already has a CopyBar for "Find meta Pokemon you own" | The floating team bar is a separate element. The existing CopyBar stays in its current position within the page flow. The floating bar is fixed at the viewport bottom, visually distinct. No conflict. |
| Pokemon names with hyphens (e.g., stunfisk-galarian) | Chip displays "Stunfisk Galarian" (replace hyphens, capitalize). Search string uses the name field from pokemon.json as-is (lowercase). Same behavior as existing team builder. |
| Screen reader | + button has `aria-label`. Checkmark state is announced. Floating bar chips have remove button labels. Bar has `role="region"` and `aria-label="Team builder"`. |

---

## What This Does NOT Change

- `/teams` page works independently, unchanged.
- Counter pages (`/counter/[pokemon]`) are unchanged.
- Home page is unchanged.
- `MetaPokemonCard` without `onAdd` prop renders identically to current production.
- `TierAccordion` without team props renders identically to current production.
- No new routes. No new pages. No new data files.

---

## New Files

```
src/components/league/floating-team-bar.tsx    — Floating bar with chips, copy, analyze link
src/components/league/league-page-client.tsx   — Client wrapper for league page with team state
```

## Modified Files

```
src/components/meta-pokemon-card.tsx           — Add onAdd + isOnTeam props, render + / check icon
src/components/tier-accordion.tsx              — Pass through onAddToTeam + teamPokemonIds to cards
src/app/league/[leagueSlug]/page.tsx           — Delegate rendering to LeaguePageClient
```

---

## Acceptance Criteria

1. On any league page, each meta Pokemon card shows a + button on the right side.
2. Tapping + adds the Pokemon to a floating bar at the bottom. The card's + becomes a checkmark.
3. The floating bar shows up to 3 Pokemon as removable chips.
4. The floating bar shows a Copy button that copies `name1,name2,name3&cp-[cap]` to clipboard.
5. The floating bar shows an "Analyze" link that navigates to `/teams?l=[league]&p=[id1,id2,id3]`.
6. The team builder page loads with the correct league and Pokemon pre-selected from those URL params (already works, no changes needed).
7. Tapping + when 3 Pokemon are already selected shows a toast and does not add.
8. Tapping X on a chip removes that Pokemon. The corresponding card reverts to +.
9. When all Pokemon are removed, the bar disappears and bottom padding is removed.
10. The bar does not cover the last accordion content (bottom padding adjusts).
11. All touch targets are 44px minimum.
12. Copy works on iOS Safari over HTTP (textarea fallback).

---

## Verification

### Manual Testing

- Great League page: add Medicham, G-Stunfisk, Bastiodon. Verify:
  - Bar shows three chips with correct names
  - Copy produces `medicham,stunfisk-galarian,bastiodon&cp-1500`
  - "Analyze" links to `/teams?l=great-league&p=medicham,stunfisk-galarian,bastiodon`
  - That URL loads the team builder with all three pre-filled
- Fantasy Cup page: add 3 Pokemon, verify bar works identically
- Master League: verify search string omits CP filter
- Add 3, tap + on a 4th: verify toast appears, team unchanged
- Remove middle chip: verify bar updates, card reverts to +
- Remove all: verify bar disappears, scroll to bottom to confirm no hidden content
- iPhone SE viewport: verify bar doesn't overflow, chips wrap to two rows if needed
- Test Copy on iOS Safari HTTP: verify textarea fallback works

### Automated

No new test files required for MVP. The search string generation uses existing tested utilities. The state logic is simple enough that manual testing covers it. If team building state grows more complex in v2, add unit tests for the handlers.

---

## MVP Scope Boundary

This spec covers the league page integration only. The following are explicitly out of scope:

- No coverage analysis in the floating bar (that's what the "Analyze" link is for)
- No drag-to-reorder chips
- No team persistence across page navigations
- No localStorage save
- No "Build a Team" CTA button (the + on each card replaces this)
- No changes to the `/teams` page
- No changes to counter pages
