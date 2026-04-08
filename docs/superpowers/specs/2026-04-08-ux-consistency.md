# UX Consistency & Team State Specification

**Date:** 2026-04-08
**Status:** Draft
**Addresses:** Founder feedback items 1-9

---

## Page Specifications

### 1. Home Page (`src/app/page.tsx`)

**Layout (top to bottom):**

1. `h1` "Poke Pal"
2. `SearchInput` component
3. **Raids** section -- quick-pick pills linking to `/counter/[id]`
4. **Go Battle League** section -- league pills linking to `/league/[id]`
5. **Your Team** section (replaces current static "Build a Team")

**Your Team section behavior (Problem 7):**

- **No saved team in any league:** Show a single pill `Start -->` linking to `/teams`
- **One or more saved teams exist:** For each league with a saved team, show:
  - League name as `text-xs text-muted-foreground` label (e.g., "Great League")
  - Team chips (same `PokemonChip` used on inline team section) -- tapping any chip or the row navigates to `/teams?l=[leagueId]&p=[ids]`
  - A `Clear` button (see Global Rules for design)
  - If the team has fewer than 3 members, also show a `Finish -->` pill linking to `/teams?l=[leagueId]&p=[ids]`

**Components reused from other pages:**
- `SearchInput` (own component)
- `PokemonChip` (new shared component, extracted from inline-team-section chips)
- `ClearButton` (new shared component)

**State reads:**
- `localStorage` via new `getAllSavedTeams()` helper (iterates `poke-pal:team:*` keys, returns `Array<{ leagueId: string; pokemonIds: string[] }>`)

**State writes:** None (read-only display). Clear button calls `clearTeam(leagueId)`.

**Note:** This page is currently a server component. The "Your Team" section must be a client component island (`HomeTeamPreview`) embedded within the server page, since it reads localStorage.

---

### 2. Counter Results Page (`src/app/counter/[pokemon]/page.tsx`)

**Layout (top to bottom):**

1. `BackButton`
2. Pokemon name + type badges
3. `CopyBar` with label **"Search string for counters"**
4. Weak-to / Resists type badges
5. **Top Counters** section -- list of `PokemonListItem` cards
6. **Budget Picks** section -- list of `PokemonListItem` cards
7. **Shadow Variant** section (conditional) -- `CopyBar` with label **"Shadow counters search string"**
8. "Build a team with [name]" link

**Component changes (Problems 2 & 3):**

The current `PokemonCard` is visually different from `MetaPokemonCard`. Both must be replaced by a single shared `PokemonListItem` component. On this page, each item shows:
- Pokemon name (capitalize, replace hyphens)
- Type badges (`TypeBadge` pills)
- Moveset line: fast move | charged moves
- Optional "Budget" badge
- **No action button** on this page (no + or X) -- counter results are informational

Card density must match the current `MetaPokemonCard`: `p-3`, `rounded-lg border`, `gap-3`, single `text-sm` name, `text-xs` moveset. No extra vertical padding beyond `p-3`. The current `PokemonCard` already uses `p-3` but should be verified to have no extra `space-y` or margin that inflates height.

**Components reused:**
- `BackButton`
- `CopyBar` (with new `label` prop)
- `PokemonListItem` (new unified component)
- `TypeBadge`

**State reads:** None (server component, data from JSON).

**State writes:** None.

**CopyBar labels:**
- Main: "Search string for counters"
- Shadow variant: "Shadow counters search string"

---

### 3. Leagues Landing (`src/app/leagues/page.tsx`)

**Layout (top to bottom):**

1. `h1` "Leagues"
2. **Live Now** section -- `LeagueCard` list
3. **Coming Up** section -- `LeagueCard` list (inactive)

**No changes required.** This page has no team state or Pokemon cards.

---

### 4. League Detail Page (`src/components/league/league-page-client.tsx`)

**Layout (top to bottom):**

1. `BackButton`
2. League name + CP cap + type restrictions
3. `CopyBar` with label **"Search for meta Pokemon"**
4. **Your Team** inline section (conditional, shows when team has members)
5. `TierAccordion` with meta Pokemon

**Component changes:**

- `CopyBar`: Add `label` prop, value = "Search for meta Pokemon"
- `InlineTeamSection`: See section below for full redesign
- `MetaPokemonCard` inside `TierAccordion`: Replace with shared `PokemonListItem` component that accepts an optional action button (+ / checkmark for "add to team")

**State reads:**
- `localStorage` via `loadTeam(leagueId)` on mount

**State writes:**
- `localStorage` via `saveTeam(leagueId, team)` whenever team array changes

**State lifecycle:**
- On mount: Load saved team for THIS league from localStorage
- On add/remove: Save immediately
- On clear: Explicit button tap only -- calls `clearTeam(leagueId)`

---

### 5. Inline Team Section (`src/components/league/inline-team-section.tsx`)

**Layout (inside bordered card):**

1. **Header row:** "Your Team" label (left), `ClearButton` (right)
2. **Team chips row:** `PokemonChip` for each member + numbered empty-slot circles for remaining slots. Each chip has an X to remove.
3. **Role labels:** If 2+ members, show role prefix on chips (Lead / Swap / Closer) with color coding
4. **Suggestion chips** (conditional, when < 3 members): "Try:" label + `PokemonChip` with + icon
5. `CopyBar` with label **"Your team search string"**
6. **Coverage line** (Problem 5): Replace raw "16/18" with "Covers 16 of 18 attack types" as `text-xs text-muted-foreground`
7. **Action row:** `Team Builder -->` button (Problem 6, renamed from "Full Analysis") + Share button

**Changes from current:**

| Current | Specified |
|---------|-----------|
| `Clear` is a text link next to score | `ClearButton` component, right side of header row |
| Coverage shows "16/18" | Shows "Covers 16 of 18 attack types" |
| "Full Analysis -->" | "Team Builder -->" |
| CopyBar has no label | Label: "Your team search string" |

**Components reused:**
- `PokemonChip` (shared)
- `ClearButton` (shared)
- `CopyBar` (with label)

---

### 6. Teams Page (`src/app/teams/page.tsx`)

**Layout (top to bottom):**

1. `BackButton`
2. `h1` "Team Builder"
3. `LeaguePicker`
4. **Team slots** -- 3x `TeamSlotCard` (Lead / Mid / Closer)
5. **Meta picks** (conditional, when < 3 slots filled) -- pill buttons from league meta
6. `TeamSlotPicker` drawer
7. **When team has members:**
   - `CopyBar` with label **"Find your team in-game"**
   - Share link button
   - `CoverageChart`
   - Meta Threats section
   - Suggestions section
   - Counter Details cross-links

**State lifecycle changes (Problem 1 -- the critical fix):**

Current behavior (broken):
```
useEffect depends on [league]
--> loads from localStorage every time league changes
--> overwrites whatever the user had, causing confusion
```

Specified behavior:
```
On initial mount:
  1. Read URL params (?l=...&p=...)
  2. If URL has pokemon params: use those, ignore localStorage
  3. If URL has NO pokemon params: load from localStorage for the URL league (or default league)

On league switch (LeaguePicker change):
  1. Save current team to localStorage under CURRENT league (before switching)
  2. Clear all 3 slots to empty
  3. Set new league
  4. Do NOT load from localStorage for the new league
```

The key change: `handleLeagueChange` must explicitly clear slots. The `useEffect` that restores from localStorage must ONLY run on initial mount, not on league changes. Use a `mountedRef` or split the initialization logic out of the effect.

**CopyBar labels:**
- Team search string: "Find your team in-game" (already has this as a `<p>` above it -- move into CopyBar label prop instead)

**Clear button:**
Add a `ClearButton` in the header area or near the slot cards. Currently there is no clear-all on the teams page.

**Components reused:**
- `BackButton`
- `LeaguePicker`
- `TeamSlotCard`
- `CopyBar` (with label)
- `ClearButton` (shared)
- `CoverageChart`, `ThreatList`, `SwapSuggestions` (unchanged)

---

## Shared Components

### `PokemonListItem` (new -- replaces `PokemonCard` and `MetaPokemonCard`)

A single component used everywhere a Pokemon appears as a list row.

**File:** `src/components/pokemon-list-item.tsx`

**Props:**
```typescript
type PokemonListItemProps = {
  name: string;
  types?: string[];
  fastMove?: string;
  chargedMoves?: string[];
  tier?: string;         // S/A/B/C -- shown as colored letter prefix
  badge?: string;        // e.g. "Budget" -- shown as green pill
  action?: {
    type: "add" | "added" | "remove";
    onAction: () => void;
  };
};
```

**Visual spec:**
- `flex items-center gap-3 rounded-lg border p-3` (matches current MetaPokemonCard)
- Optional tier letter on left (`text-sm font-bold`, color per tier)
- Name: `text-sm font-medium capitalize`, single line truncate
- Types: `TypeBadge` row, `mt-1`
- Moveset: `text-xs text-muted-foreground`, format "Fast | Charged1, Charged2"
- Action button on right: `min-h-11 min-w-11` tap target
  - "add": `Plus` icon, `text-muted-foreground hover:text-foreground`
  - "added": `Check` icon, `text-green-600`, `pointer-events-none`
  - "remove": `X` icon, `text-muted-foreground hover:text-foreground`
  - `undefined`: no button shown

**Usage map:**

| Page | tier | badge | action |
|------|------|-------|--------|
| Counter results (top counters) | -- | -- | none |
| Counter results (budget picks) | -- | "Budget" | none |
| League detail (tier accordion) | S/A/B/C | -- | add or added |
| Team builder (meta picks) | -- | -- | add |

**Current files to delete after migration:**
- `src/components/pokemon-card.tsx`
- `src/components/meta-pokemon-card.tsx`

---

### `PokemonChip` (new -- extracted from inline-team-section)

A compact pill showing a Pokemon name with optional role prefix and optional action icon.

**File:** `src/components/pokemon-chip.tsx`

**Props:**
```typescript
type PokemonChipProps = {
  name: string;
  role?: "lead" | "safe-swap" | "closer";
  action?: {
    type: "remove" | "add";
    onAction: () => void;
  };
  onClick?: () => void;  // for navigation
};
```

**Visual spec:**
- `inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1.5 text-sm font-medium`
- Role prefix: `text-[10px] font-semibold uppercase tracking-wide` with color (blue=lead, amber=swap, emerald=closer)
- Name: `max-w-[120px] truncate`
- Action icon: X (h-3 w-3) or Plus (h-3 w-3), with `p-1` touch padding

**Usage map:**
- Inline team section: chips with X remove
- Home page team preview: chips (tappable, navigate to teams page)
- Suggestion chips in inline team section: chips with + add

---

### `CopyBar` (modified -- `src/components/copy-bar.tsx`)

**New prop:** `label?: string`

**Visual change:** When `label` is provided, render a `text-xs text-muted-foreground` span above the search string inside the bar, or as a line above the bar. Preferred: above the bar as a separate line, not inside, to avoid crowding.

```tsx
{label && (
  <p className="mb-1 text-xs text-muted-foreground">{label}</p>
)}
<div className="relative flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/[0.06] p-3">
  ...
</div>
```

**Label values by context:**

| Context | Label |
|---------|-------|
| Counter page (main) | "Search string for counters" |
| Counter page (shadow) | "Shadow counters search string" |
| League detail page | "Search for meta Pokemon" |
| Inline team section | "Your team search string" |
| Teams page | "Find your team in-game" |

---

### `ClearButton` (new -- `src/components/clear-button.tsx`)

**Problem 8 fix.** The current "Clear" is a bare text link that's too easy to miss.

**Visual spec:**
- `inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors`
- Touch target: `min-h-8` via padding
- `style={{ touchAction: "manipulation" }}`
- Text: "Clear"
- No icon needed (keeps it small)

**Usage:**
- Inline team section header row (right side)
- Teams page (near slot cards or header)
- Home page team preview (per league row)

---

### `TeamSlotCard` (unchanged layout, minor consistency note)

Keep as-is. This is the only component that uses the "tall card with empty state" pattern, and that's appropriate for the team builder's primary interaction. It does NOT need to match `PokemonListItem` -- it serves a different purpose (slot assignment vs. information display).

---

### `BackButton` (unchanged)

No changes needed.

---

### `BottomNav` (unchanged)

No changes needed.

---

## Global Rules

### CopyBar Label Conventions

Every `CopyBar` instance MUST have a `label` prop. The label:
- Uses `text-xs text-muted-foreground`
- Appears as a line above the bar (not inside it)
- Describes what the string does, not what it is
- Phrased as a short instruction or description: "Search string for counters", "Find your team in-game"
- Never exceeds one line

**Rationale:** The search string itself is our differentiator vs. PokeGenie (we show it, they don't). But without context, a truncated search string is meaningless. The label bridges that gap.

---

### Button Label Conventions

Buttons say what they DO, not where they GO or what comes next.

| Bad | Good | Why |
|-----|------|-----|
| "Full Analysis -->" | "Team Builder -->" | That's the page it opens |
| "Build a Team" (static) | "Start -->" or team preview | Reflects current state |
| "Clear" (text link) | "Clear" (styled button) | Must be discoverable |

Arrow `-->` suffix is used on navigation pills/links that go to another page. Action buttons (Clear, Copy, Share) do NOT get arrows.

---

### Clear Button Design

All "Clear" actions use the shared `ClearButton` component. Rules:
- Always visible when there's something to clear (never hidden behind a menu)
- Positioned at the right edge of the section header
- Does NOT require confirmation -- teams are easy to rebuild and are only local state
- After clearing: team array becomes `[]`, localStorage key is removed via `clearTeam(leagueId)`

---

### Pokemon Display: One Component, Two Variants

There are exactly two visual treatments for Pokemon across the app:

1. **`PokemonListItem`** -- information-dense row used in lists (counters, meta tiers, etc.)
2. **`PokemonChip`** -- compact pill used in team compositions and suggestions

No other Pokemon display patterns should exist. If a new feature needs to show Pokemon, it must use one of these two.

---

### Team State Lifecycle

**Storage format:** `localStorage` key `poke-pal:team:[leagueId]`, value is `JSON.stringify(string[])` of pokemon IDs.

**SAVE rules:**
- Whenever a Pokemon is added or removed, on ANY page (league detail, teams page)
- Save happens in a `useEffect` watching the team array
- Save targets the CURRENT league's key only

**LOAD rules:**

| Context | When | Source | Behavior |
|---------|------|--------|----------|
| Teams page, initial mount | URL has `?p=` | URL params | Use URL pokemon, ignore localStorage |
| Teams page, initial mount | URL has NO `?p=` | localStorage for URL league | Load saved team |
| Teams page, league switch | User taps different league | N/A | Save current team under old league, then CLEAR slots. Do NOT load new league's team. |
| League detail page, mount | Always | localStorage for this league | Load saved team |
| Home page, mount | Always | All localStorage team keys | Show preview for each league that has a saved team |

**CLEAR rules:**
- Explicit `ClearButton` tap only
- Switching leagues does NOT clear (old league's team stays in localStorage)
- Switching leagues on the Teams page clears the DISPLAYED slots but preserves the old league's localStorage
- `clearTeam(leagueId)` removes the localStorage key entirely

**New helper needed in `team-storage.ts`:**

```typescript
export function getAllSavedTeams(): Array<{ leagueId: string; pokemonIds: string[] }> {
  const teams: Array<{ leagueId: string; pokemonIds: string[] }> = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        const leagueId = key.slice(STORAGE_KEY_PREFIX.length);
        const val = localStorage.getItem(key);
        if (val) {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.length > 0) {
            teams.push({ leagueId, pokemonIds: parsed });
          }
        }
      }
    }
  } catch {}
  return teams;
}
```

---

### Coverage Score Display

Never show a raw fraction like "16/18" without context. Always render as a full sentence:

- "Covers 16 of 18 attack types" -- `text-xs text-muted-foreground`
- This appears in the inline team section, below the CopyBar

On the full Teams page, the `CoverageChart` component provides its own visual context and does not need this sentence.

---

## Implementation Sequence

Recommended order to minimize conflicts:

1. **`CopyBar` label prop** -- small change, touches every page
2. **`ClearButton` component** -- new file, no dependencies
3. **`PokemonListItem` component** -- new file, then swap into counter page and tier accordion
4. **`PokemonChip` component** -- extract from inline-team-section
5. **Inline team section updates** -- coverage text, button rename, ClearButton, CopyBar label
6. **Teams page state fix** -- the `handleLeagueChange` + mount-only load refactor
7. **Home page team preview** -- new client component island, uses `getAllSavedTeams`
8. **Delete old components** -- `pokemon-card.tsx`, `meta-pokemon-card.tsx`

---

## Files Changed

| File | Change Type |
|------|-------------|
| `src/components/copy-bar.tsx` | Modified (add `label` prop) |
| `src/components/clear-button.tsx` | New |
| `src/components/pokemon-list-item.tsx` | New (replaces pokemon-card + meta-pokemon-card) |
| `src/components/pokemon-chip.tsx` | New (extracted from inline-team-section) |
| `src/components/league/inline-team-section.tsx` | Modified (coverage text, button rename, ClearButton, CopyBar label) |
| `src/components/league/league-page-client.tsx` | Modified (CopyBar label) |
| `src/components/tier-accordion.tsx` | Modified (use PokemonListItem) |
| `src/app/page.tsx` | Modified (embed HomeTeamPreview client component) |
| `src/app/counter/[pokemon]/page.tsx` | Modified (use PokemonListItem, CopyBar labels) |
| `src/app/teams/page.tsx` | Modified (state lifecycle fix, ClearButton, CopyBar label) |
| `src/lib/team-storage.ts` | Modified (add `getAllSavedTeams`) |
| `src/components/pokemon-card.tsx` | Deleted |
| `src/components/meta-pokemon-card.tsx` | Deleted |
