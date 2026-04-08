# Pill & Container Audit — Poke Pal

Date: 2026-04-08

---

## 1. PILLS (rounded-full elements)

### P1 — TypeBadge (reusable component)
- **File**: `src/components/type-badge.tsx:4-10`
- **Visual**: Small rounded-full pill, colored background per type (e.g. `bg-orange-500`), white text
- **Classes**: `rounded-full px-2 py-0.5 text-xs font-medium text-white ${TYPE_COLORS[type]}`
- **Used on**: Counter page, league meta lists, team slots, threat list, swap suggestions
- **Interaction**: None (display only)

### P2 — "Rec" badge (inline in PokemonListItem)
- **File**: `src/components/pokemon-list-item.tsx:55-57`
- **Visual**: Small rounded-full pill, emerald green bg, dark green text, smaller than TypeBadge
- **Classes**: `rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`
- **Used on**: League meta tier lists (recommended counters)
- **Interaction**: None (display only)

### P3 — Team Rating badge (S/A/B/C)
- **File**: `src/app/teams/page.tsx:212`, `src/components/league/inline-team-section.tsx:36`
- **Visual**: Small rounded-full pill, color-coded by rating (yellow=S, blue=A, green=B, muted=C), text + bg
- **Classes (teams page)**: `rounded-full px-2 py-0.5 text-xs font-bold ${RATING_COLORS[rating]}`
- **Classes (inline section)**: `rounded-full px-1.5 py-0.5 text-xs font-bold ${RATING_COLORS[rating]}`
- **INCONSISTENCY**: px-2 on teams page vs px-1.5 on inline team section
- **Used on**: Team Builder header, league page inline team section
- **Interaction**: None (display only)

### P4 — Tier letter (inline in PokemonListItem)
- **File**: `src/components/pokemon-list-item.tsx:46-48`
- **Visual**: NOT a pill — plain colored text (S/A/B/C), no background, no border
- **Classes**: `text-sm font-bold shrink-0 ${TIER_COLORS[tier]}`
- **Used on**: League meta tier lists
- **Interaction**: None (display only)
- **Note**: TIER_COLORS (text-only) differs from RATING_COLORS (text+bg). Yellow/blue/green scheme is the same but rendering is different — one is a pill, one is naked text.

### P5 — "Live" badge (LeagueCard)
- **File**: `src/components/league-card.tsx:40-41`
- **Visual**: Small rounded-full pill, green bg, green text
- **Classes**: `rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300`
- **Used on**: Leagues list page
- **Interaction**: None (display only)

### P6 — "+N gaps" badge (SwapSuggestions)
- **File**: `src/components/team/swap-suggestions.tsx:42`
- **Visual**: Small rounded-full pill, green bg, green text — nearly identical to "Live" badge
- **Classes**: `rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300`
- **Used on**: Team Builder swap suggestions
- **Interaction**: None (display only)
- **DUPLICATE**: Exact same classes as "Live" badge (P5). Could share a component.

### P7 — PokemonChip (reusable component)
- **File**: `src/components/pokemon-chip.tsx:17`
- **Visual**: Medium rounded-full pill, bordered, card background, text + optional X or + icon
- **Classes**: `inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1.5 text-sm font-medium`
- **Used on**: Team Builder (meta suggestions in empty slots), inline team section, home team preview
- **Interaction**: Tappable — "remove" variant shows X icon (removes from team), "add" variant shows + icon (adds to team). On home preview, wrapped in Link (navigates to team page).

### P8 — Quick Pick pills (home page)
- **File**: `src/app/page.tsx:24-28`
- **Visual**: Medium rounded-full pill, bordered, no bg, hover accent. Same visual shape as PokemonChip but without icon.
- **Classes**: `inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm capitalize transition-colors hover:bg-accent active:bg-accent active:scale-95`
- **Used on**: Home page "Raids" section
- **Interaction**: Tappable — navigates to counter page

### P9 — GBL League pills (home page)
- **File**: `src/app/page.tsx:41-44`
- **Visual**: Medium rounded-full pill, bordered, hover accent — identical structure to Quick Picks but with `font-medium`
- **Classes**: `inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent active:bg-accent active:scale-95`
- **Used on**: Home page "Go Battle League" section
- **Interaction**: Tappable — navigates to league page
- **INCONSISTENCY vs P8**: Quick picks have `capitalize` but no `font-medium`. League pills have `font-medium` but no `capitalize`. Otherwise identical.

### P10 — "Start" pill (home page, no teams)
- **File**: `src/components/home-team-preview.tsx:28-30`
- **Visual**: Medium rounded-full pill, bordered, hover accent — same pattern as Quick Pick / League pills
- **Classes**: `inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent active:bg-accent active:scale-95`
- **Used on**: Home page when no teams saved
- **Interaction**: Tappable — navigates to /teams

### P11 — Counter page type badges (inline, NOT TypeBadge component)
- **File**: `src/app/counter/[pokemon]/page.tsx:58-61`
- **Visual**: Small rounded-full pill, muted bg, muted text — the defender's own types shown next to name
- **Classes**: `rounded-full bg-muted px-2 py-0.5 text-xs font-medium`
- **Used on**: Counter page header (next to Pokemon name)
- **Interaction**: None
- **INCONSISTENCY**: Different from TypeBadge (P1) which uses colored bg + white text. These use neutral muted styling for the same concept (Pokemon types).

### P12 — Counter page "Weak to" / "Resists" type pills (inline)
- **File**: `src/app/counter/[pokemon]/page.tsx:96-98, 112-114`
- **Visual**: Small rounded-full pill, colored bg per type, white text — visually identical to TypeBadge but rendered inline without the component
- **Classes**: `${TYPE_COLORS[t]} rounded-full px-2 py-0.5 text-xs font-medium text-white`
- **Used on**: Counter page effectiveness section
- **Interaction**: None
- **DUPLICATE**: Same exact classes as TypeBadge (P1) but not using the component. Some also append "2x" text.

### P13 — ClearButton
- **File**: `src/components/clear-button.tsx:7`
- **Visual**: Small rounded-full pill, bordered, muted text, hover muted bg
- **Classes**: `rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors`
- **Used on**: Team Builder header
- **Interaction**: Tappable — clears team

### P14 — Empty slot circles (inline team section)
- **File**: `src/components/league/inline-team-section.tsx:62-64`
- **Visual**: Small rounded-full circle, dashed border, muted text, shows slot number
- **Classes**: `inline-flex h-7 w-7 items-center justify-center rounded-full border border-dashed text-muted-foreground text-xs`
- **Used on**: League page inline team section
- **Interaction**: None

### P15 — Coverage chart type cells
- **File**: `src/components/team/coverage-chart.tsx:62-66`
- **Visual**: Small rounded-md (NOT rounded-full) cells in a 6-col grid, 3-letter type abbreviations
- **Classes**: `rounded-md px-1 py-1 text-center text-xs font-medium ${getBadgeStyle(type)}`
- **States**: Covered = type color bg + white text, Weakness = transparent + red border, Neutral = muted bg + muted text
- **Used on**: Team Builder coverage chart
- **Interaction**: None (has title tooltip)
- **Note**: These are rounded-md, not rounded-full — intentionally different from pills.

---

## 2. CARDS / CONTAINERS (bordered rectangular elements)

### C1 — PokemonListItem (reusable component)
- **File**: `src/components/pokemon-list-item.tsx:44`
- **Visual**: Rounded-lg, solid border, p-3, flex row with name/types/moves + action icon
- **Classes**: `flex items-center gap-3 rounded-lg border p-3`
- **Used on**: Counter page (top counters, budget picks), league meta tier lists
- **Interaction**: Wraps in Link on counter page (navigates). On league page, has add/added/remove action buttons.

### C2 — TeamSlotCard — filled state
- **File**: `src/components/team/team-slot.tsx:29`
- **Visual**: Rounded-lg, solid border, p-3, flex row with label/name/types + remove button
- **Classes**: `flex items-center gap-3 rounded-lg border p-3`
- **DUPLICATE**: Exact same outer classes as PokemonListItem (C1).
- **Used on**: Team Builder
- **Interaction**: Remove button (X icon)

### C3 — TeamSlotCard — empty state
- **File**: `src/components/team/team-slot.tsx:21`
- **Visual**: Rounded-lg, dashed border, p-3, centered label text, optional children (suggestions)
- **Classes**: `rounded-lg border border-dashed p-3`
- **Used on**: Team Builder (empty slots)
- **Interaction**: None directly, but may contain PokemonChip suggestions

### C4 — LeagueCard (reusable component)
- **File**: `src/components/league-card.tsx:33`
- **Visual**: Rounded-lg, solid border, p-4 (not p-3), hover accent, active scale
- **Classes**: `block rounded-lg border p-4 transition-colors hover:bg-accent active:bg-accent active:scale-[0.98]`
- **Used on**: Leagues list page
- **Interaction**: Entire card is a Link (navigates to league page)
- **INCONSISTENCY vs C1/C2**: p-4 instead of p-3

### C5 — InlineTeamSection container
- **File**: `src/components/league/inline-team-section.tsx:30`
- **Visual**: Rounded-lg, solid border, p-4, contains header row + chip row
- **Classes**: `rounded-lg border p-4 space-y-3`
- **Used on**: League detail page
- **Interaction**: Contains PokemonChips (removable) and arrow Link

### C6 — ThreatList item
- **File**: `src/components/team/threat-list.tsx:27-28`
- **Visual**: Rounded-lg, solid border, p-3, flex row with name/types/description
- **Classes**: `flex items-center gap-3 rounded-lg border p-3`
- **DUPLICATE**: Exact same outer classes as PokemonListItem (C1) and TeamSlotCard filled (C2).
- **Used on**: Team Builder threats section
- **Interaction**: None (display only)

### C7 — SwapSuggestion item
- **File**: `src/components/team/swap-suggestions.tsx:35`
- **Visual**: Rounded-lg, solid border, p-3, flex row, hover muted, active scale — a card that is a button
- **Classes**: `flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 active:scale-[0.98]`
- **Used on**: Team Builder suggestions section
- **Interaction**: Tappable — selects suggestion Pokemon

### C8 — Search dropdown list
- **File**: `src/components/search-input.tsx:87`
- **Visual**: Rounded-lg, solid border, bg-background, shadow, absolute positioned dropdown
- **Classes**: `absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-lg border bg-background shadow-sm`
- **Used on**: All pages with SearchInput
- **Interaction**: Contains dropdown item buttons

### C9 — Search dropdown items
- **File**: `src/components/search-input.tsx:91-93`
- **Visual**: Full-width button, min-h-11, hover muted bg, active state highlighted
- **Classes**: `w-full min-h-11 px-3 py-2 text-left text-sm capitalize hover:bg-muted`
- **Used on**: Search autocomplete dropdown
- **Interaction**: Tappable — selects Pokemon

---

## 3. BUTTONS (action elements)

### B1 — CopyButton
- **File**: `src/components/copy-button.tsx:32-34`
- **Visual**: Full-width, rounded-lg, primary bg, white text, active scale. Green when copied.
- **Classes**: `w-full min-h-11 rounded-lg px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98]` + `bg-primary text-primary-foreground` (default) or `bg-green-600 text-white` (copied)
- **Used on**: Counter page, team builder, league page
- **Interaction**: Tappable — copies search string to clipboard

### B2 — LeaguePicker buttons
- **File**: `src/components/team/league-picker.tsx:19`
- **Visual**: Rounded-lg, flex-1, min-h-11, primary bg when selected, muted bg when not
- **Classes**: `min-h-11 flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors` + `bg-primary text-primary-foreground` (selected) or `bg-muted text-muted-foreground hover:bg-muted/80` (unselected)
- **Used on**: Team Builder
- **Interaction**: Tappable — switches league

### B3 — Share team link button
- **File**: `src/app/teams/page.tsx:276-278`
- **Visual**: Full-width, rounded-lg, bordered, muted text, hover muted bg, min-h-11
- **Classes**: `flex w-full min-h-11 items-center justify-center gap-2 rounded-lg border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors`
- **Used on**: Team Builder
- **Interaction**: Tappable — copies team share URL

### B4 — BackButton
- **File**: `src/components/back-button.tsx:18`
- **Visual**: Plain text link, no border/bg, muted text, arrow character
- **Classes**: `text-sm text-muted-foreground hover:text-foreground active:opacity-70`
- **Used on**: Counter page
- **Interaction**: Tappable — navigates back

### B5 — "Build a team" link
- **File**: `src/app/counter/[pokemon]/page.tsx:180-183`
- **Visual**: Plain text link, muted text, hover underline, arrow character
- **Classes**: `text-xs text-muted-foreground hover:underline`
- **Used on**: Counter page bottom
- **Interaction**: Tappable — navigates to teams page

### B6 — Leagues back link
- **File**: `src/components/league/league-page-client.tsx:98`
- **Visual**: Plain text link, muted text, no underline
- **Classes**: `text-sm text-muted-foreground hover:text-foreground`
- **Used on**: League detail page
- **Interaction**: Tappable — navigates to leagues list

---

## 4. INCONSISTENCY SUMMARY

### 4a. Duplicate implementations (same visual, different code)

| Issue | Where | Fix |
|---|---|---|
| "Weak to" / "Resists" type pills render inline instead of using `<TypeBadge>` | `counter/[pokemon]/page.tsx:96-114` | Replace with `<TypeBadge>` component |
| "+N gaps" badge and "Live" badge are identical classes | `swap-suggestions.tsx:42`, `league-card.tsx:40` | Extract shared `<StatusBadge variant="green">` |
| PokemonListItem, TeamSlotCard (filled), ThreatList item all share `flex items-center gap-3 rounded-lg border p-3` | 3 files | Extract base `<CardRow>` wrapper |

### 4b. Inconsistent sizing on same concept

| Issue | Where | Delta |
|---|---|---|
| Rating badge padding differs | teams page: `px-2`, inline section: `px-1.5` | Standardize to `px-2` |
| LeagueCard uses `p-4`, all other list cards use `p-3` | `league-card.tsx` vs `pokemon-list-item.tsx` etc. | Pick one (p-3 for list items, p-4 for section containers) |
| Quick Pick pills have `capitalize` + no `font-medium`; League pills have `font-medium` + no `capitalize` | `page.tsx:27` vs `page.tsx:43` | Both should have `font-medium capitalize` |

### 4c. Same data, different visual treatment

| Issue | Where | Delta |
|---|---|---|
| Pokemon types shown as colored `<TypeBadge>` pills everywhere EXCEPT the counter page header, where they are neutral muted pills | `counter/[pokemon]/page.tsx:58-61` | Either use `<TypeBadge>` here too, or intentionally differentiate with a `variant="muted"` prop |
| Tier letters in PokemonListItem are plain colored text; Team Rating (same S/A/B/C) is a colored pill | `pokemon-list-item.tsx:46` vs `team-rating.ts` | Intentional? Tier is compact inline; Rating is a standalone badge. Document the intent or unify. |

---

## 5. CONSOLIDATION RECOMMENDATIONS

### Proposed pill system (4 variants)

**Variant 1 — TypePill** (existing `TypeBadge`, rename for clarity)
- Shape: `rounded-full px-2 py-0.5 text-xs font-medium`
- Filled: type-colored bg + white text (current default)
- Muted: `bg-muted text-muted-foreground` (for counter page header)
- Outlined: `border-2 border-red-500 text-red-500` (for coverage weakness)
- Use for: ALL type indicators everywhere, plus coverage chart if migrated

**Variant 2 — StatusPill** (new shared component)
- Shape: `rounded-full px-2 py-0.5 text-xs font-medium`
- Green variant: `bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300` (Live, +N gaps)
- Emerald variant: `bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400` (Rec)
- Rating variant: uses `RATING_COLORS` (S/A/B/C)
- Use for: "Live" badge, "+N gaps" badge, "Rec" badge, team rating badge

**Variant 3 — ChipPill** (existing `PokemonChip`, keep as-is)
- Shape: `rounded-full border bg-card px-3 py-1.5 text-sm font-medium`
- With remove icon, add icon, or no icon
- Use for: team member chips, suggestion chips

**Variant 4 — NavPill** (new shared component, or unify home page pills)
- Shape: `rounded-full border px-3 py-1.5 text-sm font-medium min-h-11 hover:bg-accent active:scale-95`
- Use for: Quick picks, league links on home page, "Start" link, ClearButton (smaller variant)

### Proposed container system (3 variants)

**Variant 1 — CardRow** (extract from PokemonListItem pattern)
- Shape: `rounded-lg border p-3 flex items-center gap-3`
- Use for: PokemonListItem, TeamSlotCard (filled), ThreatList items
- Interactive subvariant: add `hover:bg-muted/50 active:scale-[0.98]` for SwapSuggestion items

**Variant 2 — CardSection** (bordered section container)
- Shape: `rounded-lg border p-4 space-y-3`
- Use for: LeagueCard, InlineTeamSection, any bordered content section
- Interactive subvariant: add `hover:bg-accent active:scale-[0.98]` for LeagueCard

**Variant 3 — EmptySlot**
- Shape: `rounded-lg border border-dashed p-3`
- Use for: TeamSlotCard empty state

### Proposed button system (3 variants)

**Primary**: `rounded-lg bg-primary text-primary-foreground min-h-11 px-4 py-3 text-sm font-semibold`
- Use for: CopyButton, any primary CTA

**Secondary/Outline**: `rounded-lg border min-h-11 text-sm font-medium text-muted-foreground hover:bg-muted`
- Use for: Share button, LeaguePicker unselected state

**Text**: `text-sm text-muted-foreground hover:text-foreground`
- Use for: BackButton, breadcrumb links, "Build a team" link

---

## 6. QUICK WINS (low effort, high impact)

1. **Replace inline type pills on counter page with `<TypeBadge>`** — 2 locations in `counter/[pokemon]/page.tsx` (lines 96-98, 112-114). Deletes ~10 lines of duplicate code.

2. **Standardize rating badge padding** — change `px-1.5` to `px-2` in `inline-team-section.tsx:36`. One-character fix.

3. **Unify home page pill classes** — add `font-medium capitalize` to both Quick Pick and League pill classes in `page.tsx`. Two lines.

4. **Extract `<StatusPill variant="green">` component** — replaces identical green badge markup in `league-card.tsx:40` and `swap-suggestions.tsx:42`. Could also absorb the "Rec" badge from `pokemon-list-item.tsx:55`.

5. **Add `variant="muted"` to TypeBadge** — for the counter page header type display at `counter/[pokemon]/page.tsx:58-61`, so it uses the same component with a different visual treatment.

---

## 7. TOTAL COUNT

| Category | Distinct Variants | Ideal Target |
|---|---|---|
| Pills | 15 | 4 (TypePill, StatusPill, ChipPill, NavPill) |
| Containers | 9 | 3 (CardRow, CardSection, EmptySlot) |
| Buttons | 6 | 3 (Primary, Secondary, Text) |
| **Total** | **30** | **10** |

Reducing from 30 distinct visual elements to 10 shared variants would eliminate the visual jarring and make the app feel cohesive.
