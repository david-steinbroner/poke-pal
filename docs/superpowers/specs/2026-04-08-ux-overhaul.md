# Poke Pal v0.5.2 UX Overhaul Specification

**Date**: 2026-04-08
**Version**: v0.5.2 -> v0.6.0
**Status**: Draft — with founder corrections below

## Founder Corrections (override any conflicting spec content)

1. **Raids are NOT a separate feature.** The counter search ("Who are you fighting?") handles raid bosses. Typing a raid boss gives counters + search string. No Raids tab needed.
2. **Quick Picks should show CURRENT RAID BOSSES**, not hardcoded PvP meta. Renamed to "Right Now" or unlabeled. Shows the active 5-star/mega/3-star rotation. Data from a `current-raids.json` file updated with each rotation.
3. **Team Rocket IS separate.** Fixed lineups, "could be" variations, needs its own UX. Will be a 4th nav tab when built. Not in this sprint.
4. **CopyBar is the differentiator**, not role assignment. Roles stay subtle/small. CopyBar is visually dominant.
5. **Bottom nav stays 3 tabs** for now: Search | Leagues | Teams. Rocket becomes 4th tab in a future sprint.
**Target device**: iPhone 375px (primary), any mobile browser

---

## Design Principles

These are non-negotiable constraints for every decision in this spec:

1. **The CopyBar IS the product.** Every screen exists to deliver a search string. The CopyBar is the loudest element on every page where it appears.
2. **Consolidate aggressively.** If three lines can become one line, they become one line. If a label is obvious from context, it gets deleted.
3. **"Who are you fighting?"** The home page IS the search input. No h1, no subtitle.
4. **Plan for raids and Team Rocket.** The architecture accommodates PvP counters, raid boss counters, and Team Rocket counters without a redesign.
5. **Roles are subtle context, not the feature.** The CopyBar is the differentiator.
6. **Remove chrome.** Version banners, back links, redundant section labels, instructional copy -- all go.

---

## 1. Home Page Overhaul

**File**: `src/app/page.tsx`
**Current state**: h1 + subtitle + search input + "Quick Picks" section + "What's Live" section + "Build a Team" section. Six distinct visual blocks competing for attention above the fold.

### Spec

**Remove entirely:**
- h1 "Pokemon GO PvP Search Strings" (line 17)
- Subtitle "Find counters, build teams, copy strings. Paste in GO." (lines 18-20)
- "Quick Picks" h2 label (lines 26-28)
- "What's Live" h2 label (lines 47-49)
- "Build a Team" entire section (lines 69-81) -- bottom nav already has Teams tab

**Modify:**
- SearchInput becomes the hero: `min-h-[52px] text-lg` with placeholder `"Who are you fighting?"`. No `autoFocus` (opening the keyboard on load is aggressive on mobile and blocks the Quick Picks).
- Quick Pick chips render immediately below the search input with `mt-3` spacing. No header. They are self-explanatory.
- Live league chips render below Quick Picks with `mt-4` spacing. Each chip gets a small green dot indicator (a 6px `bg-green-500 rounded-full` circle inline before the league name) instead of a section header. When no leagues are live, render nothing -- no empty state message. The leagues tab handles discovery.

**Future-proofing for raids and Team Rocket:**
- Below the live league chips, reserve a future slot for "Raid Bosses" and "Rocket Lineups" chip rows. These are NOT built now. The layout pattern is: search input -> quick picks -> contextual chip rows (live leagues, raid bosses, rocket lineups). Each chip row is a flat list of pills with no section header. The data source determines what appears.
- No structural changes needed when these features ship. Just add more chip rows.

**Resulting page structure (top to bottom):**
```
[Search input: "Who are you fighting?" -- 52px tall]
[gap: 12px]
[Quick Pick chips: Giratina, Cresselia, Bastiodon, ...]
[gap: 16px]
[Live league chips: * Fantasy Cup, * Great League]  (* = green dot)
```

**Above-the-fold on 375x667:** Search input + all chips. Zero scrolling needed. Zero explanatory text.

---

## 2. League Page Overhaul

**File**: `src/components/league/league-page-client.tsx`

### Spec

**Remove entirely:**
- Back link (lines 71-76) -- bottom nav handles this
- "Find meta Pokemon you own" label above CopyBar (lines 90-92)
- Season label from the metadata line ("Season 27 GBL" means nothing to players)
- "Updated {date}" from the metadata line -- users don't care when you updated, they care that it IS current

**Modify:**

Header becomes two elements:
```
[h1: "Fantasy Cup"]
[metadata line: "CP 1,500 . Dragon, Steel, Fairy"]
```

One metadata line. CP cap + type restrictions merged with a dot separator. If no type restrictions, just show CP cap. If CP is 9999 (Master League), show "No CP limit". Format:
- Fantasy Cup: `CP 1,500 . Dragon, Steel, Fairy`
- Great League: `CP 1,500`
- Master League: `No CP limit`

Style: `text-sm text-muted-foreground`. One line. Done.

**CopyBar placement and styling:**
- CopyBar renders immediately below the metadata line with `mt-3` spacing.
- CopyBar uses the enhanced design from Section 6 (visually dominant, tinted background).
- No label above it. The string content and Copy button are self-explanatory.

**Empty team state:**
- Show a lightweight empty team prompt between the CopyBar and TierAccordion: three inline dashed circles (`h-8 w-8 rounded-full border-2 border-dashed`) with `text-xs text-muted-foreground` text "Tap + to build a team". This renders at all times when the team is empty, teaching the affordance.
- When a team exists, the InlineTeamSection replaces this prompt (current behavior, keep as-is).

**TierAccordion:**
- Renders below the CopyBar (or below the team section if a team is active).
- S Tier stays expanded by default. Others collapsed.
- Tier labels shortened: "S Tier (4)", "A Tier (6)", "B Tier (3)", "C Tier (2)". Drop the editorial descriptors ("Meta Defining", "Strong Picks").

**InlineTeamSection adjustments:**
- Reduce outer padding from `p-4` to `p-3`.
- Keep the existing structure (chips + suggestions + CopyBar + Full Analysis link + Share). It works.

**Resulting page structure (top to bottom, above fold on 375px):**
```
[h1: Fantasy Cup]
[CP 1,500 . Dragon, Steel, Fairy]
[CopyBar: search string + Copy button -- DOMINANT]
[empty team prompt or InlineTeamSection]
[S Tier (4) -- expanded]
```

---

## 3. Counter Page Overhaul

**File**: `src/app/counter/[pokemon]/page.tsx`

### Spec

**Remove entirely:**
- BackButton (line 53) -- bottom nav handles this
- "Build a team around X (Great League)" full-width link at the bottom (lines 175-180) -- or shrink to an inline text link (see below)

**Reorder content:**

Current order: name -> type badges -> effectiveness (Weak to / Resists) -> CopyBar -> counters
New order: name + type badges on one line -> CopyBar -> effectiveness -> counters

The CopyBar MUST be above the fold. On a 375px screen, the current layout pushes the CopyBar below the fold when there are many type effectiveness badges (e.g., Giratina has 4 weaknesses and 6+ resistances = ~120px of badges before the CopyBar).

**Header redesign:**
```
[h1: "Giratina Counters" + inline type badges]
```

Pokemon name as h1 with type badges inline on the same line (not on a separate line below). Type badges are small pills (`rounded-full bg-muted px-2 py-0.5 text-xs`) that sit to the right of the h1 text. If the name is long and badges wrap, that's fine -- but they share a `flex items-baseline gap-2` container instead of being on a separate row.

**CopyBar:**
- Renders immediately below the header, before any effectiveness badges.
- Uses the enhanced CopyBar design from Section 6.

**Type effectiveness section:**
- Renders BELOW the CopyBar.
- Keep current badge design (colored pills with type names). It's good reference material.
- Add `mt-4` spacing above this section.

**Counter lists:**
- "Top Counters" h2 label: keep, but restyle to `text-xs font-semibold uppercase tracking-wider text-muted-foreground`.
- "Budget Picks" h2 label: same style.
- PokemonCards: wrap each in a `Link` to `/counter/{pokemonId}`. Add a subtle `ChevronRight` icon on the right side. This creates the exploration loop.

**Shadow Variant:**
- Keep the section but move it directly below the main CopyBar (before the effectiveness badges). Label it "Shadow counters" with a small `text-xs text-muted-foreground` label, followed by its own CopyBar instance. Shadow Pokemon are critical in PvP and shouldn't be buried at the bottom.
- Alternative: if the shadow search string is short, render it as a secondary CopyBar directly below the main one with a "Shadow" badge. Two CopyBars stacked, main on top, shadow below.

**"Build a team" link:**
- Replace the full-width dashed-border CTA with a small inline text link: `text-xs text-muted-foreground hover:text-foreground` reading "Build a team with {name} ->". Place it at the very bottom, after the counter lists. It's a secondary action.
- Pass league context via a `?from=` query param when the user arrived from a league page. If no league context, default to Great League.

**Resulting page structure (above fold on 375px):**
```
[Giratina Counters   Ghost Dragon]
[CopyBar: counter search string -- DOMINANT]
[Shadow counters CopyBar -- secondary]
[Weak to: Ice, Dragon, Dark, Ghost, Fairy]
[Resists: Normal, Fighting, Poison, Bug, ...]
[Top Counters]
  [Togekiss  >]
  [Gardevoir >]
  ...
```

---

## 4. Teams Page Overhaul

**File**: `src/app/teams/page.tsx`

### Spec

**Remove entirely:**
- Back link (lines 205-209)
- Subtitle "Build a team, check coverage, copy the search string." (lines 212-214)
- "Find your team in-game" label above CopyBar (lines 255-257)
- "Counter Details" section (lines 299-317) -- make each TeamSlotCard link to its counter page directly instead

**Above the fold:**
Three elements only:
1. h1 "Team Builder" + LeaguePicker on the same line (h1 left, LeaguePicker right, `flex items-center justify-between`)
2. Three team slot cards (current implementation, keep)
3. CopyBar (when team has 1+ Pokemon)

That's it above the fold. The CopyBar is the terminal action. Everything below it is supplementary.

**Below the fold:**

Coverage score: render as a prominent element between the CopyBar and the analysis sections. Format: `{score}/18 types covered` as `text-base font-semibold` with color coding:
- 0-6: `text-red-500`
- 7-12: `text-amber-500`
- 13-18: `text-green-500`

Suggestions: keep visible (they drive action). Restyle h2 to `text-xs font-semibold uppercase tracking-wider text-muted-foreground`.

Coverage chart + Threat list: collapse into an expandable "Analysis" section, default CLOSED. Most users want: pick team -> copy string -> done. The analysis is for power users who want to optimize.

Share button: promote from tiny `text-xs` link to a bordered button at `min-h-11 w-full` placed directly below the CopyBar. Format: `[Share2 icon] Share this team`. Only visible when team has 2+ Pokemon.

**Resulting page structure (above fold on 375px):**
```
[Team Builder          [Great League v]]
[Lead: ______] [Mid: ______] [Closer: ______]
[CopyBar: team search string -- DOMINANT]
[Share this team -- full-width bordered button]
[14/18 types covered -- green]
[Suggestions: Bastiodon, Medicham, Altaria]
[> Analysis (collapsed)]
```

---

## 5. Bottom Nav Architecture

**File**: `src/components/bottom-nav.tsx`

### Decision: Keep 3 tabs + mode selector on search page

**Rationale:**
- 3 tabs is the ideal number for thumb-zone navigation on mobile. 4 is acceptable, 5 is crowded.
- PvP counters, Raid counters, and Team Rocket counters all share the same UX pattern: search for a target -> see counters -> copy string. They differ only in the data source (PvP meta rankings vs raid boss stats vs Rocket lineups) and the counter scoring (PvP values bulk; raids value DPS; Rocket uses fixed lineups).
- Making these separate tabs would duplicate the entire search -> counter flow three times.
- A mode selector on the search/home page is the right approach: one search experience, three contexts.

**Spec:**

Bottom nav stays as-is: `Search | Leagues | Teams`

The Search tab (home page) gains a mode selector in the future:
- A segmented control or pill toggle below the search input: `PvP | Raids | Rocket`
- Default: PvP (current behavior)
- When Raids is selected: Quick Picks become current raid bosses. Counter pages show DPS-optimized counters. CopyBar strings filter for high-ATK Pokemon.
- When Rocket is selected: Quick Picks become current Rocket lineups (Sierra, Cliff, Arlo, Giovanni, grunts). Counter pages show lineup-specific counters.

This is NOT built now. The spec documents the architecture so no current decisions block it.

**What changes now:**
- Rename the "Search" nav label to "Search" (keep as-is -- it already works for all three modes).
- The `match` function for the Search tab already correctly matches `/` and `/counter/*`. No change needed.

**Leagues tab:**
- Stays as-is. Leagues are PvP-specific. Raids and Rocket don't have "leagues."
- In the future, the Leagues tab could evolve to "Browse" and include Raid Boss lists and Rocket lineups. But that's a future decision.

**Teams tab:**
- Stays as-is. Team building is PvP-specific for now.
- Raid teams and Rocket teams could reuse the same builder with different scoring. No nav change needed.

---

## 6. CopyBar Design Spec

**File**: `src/components/copy-bar.tsx`

### Current state
`bg-muted/50 border rounded-lg p-3` container with `code truncate text-sm font-mono` string and a `bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm` Copy button.

The CopyBar currently looks like every other card on the page. It blends in. It should scream "THIS IS WHY YOU'RE HERE."

### Spec

**Container:**
```
bg-primary/[0.06] border border-primary/20 rounded-xl p-3.5
```
- Subtle brand-tinted background instead of generic muted.
- Brand-tinted border to distinguish from content cards.
- Slightly more rounded (`rounded-xl` vs `rounded-lg`) to differentiate from rectangular content cards.
- Slightly more padding (`p-3.5`) for breathing room.

**Search string display:**
```
code: flex-1 truncate text-sm font-mono text-foreground/80
```
- Slightly dimmed text since the string is opaque and not meant to be read in full.
- `truncate` stays -- the string is long and unreadable anyway.

**Copy button:**
```
shrink-0 rounded-lg min-h-[44px] min-w-[72px] px-5 text-base font-semibold
bg-primary text-primary-foreground
transition-all active:scale-95 active:opacity-70
```
- `min-h-[44px]`: iOS tap target compliance.
- `min-w-[72px]`: prevents the button from being too narrow on small strings.
- `text-base font-semibold`: larger, bolder than current `text-sm font-medium`.
- Keep the `copied` state behavior (bg-secondary for 2s).

**Copied state duration:**
- Increase from 2000ms to 3000ms. The user needs time to switch to Pokemon GO.

**No label above the CopyBar anywhere in the app.**
Every instance currently has a label ("Find meta Pokemon you own", "Find your team in-game"). All are removed. The CopyBar is self-explanatory: it shows a search string and a Copy button. Users who have Pokemon GO understand instantly.

**Visual weight:**
The CopyBar should be the ONLY element on any page with a filled primary-color button of that size. All other buttons and links use outlined/ghost styles. This makes the CopyBar the natural focal point without needing labels, arrows, or instructional text.

---

## 7. Global Cleanup List

### Layout (`src/app/layout.tsx`)

| Line(s) | Element | Action |
|---------|---------|--------|
| 54-56 | Version banner `v{APP_VERSION}` | **Remove.** Delete the entire div. No user needs to see "v0.5.2" on every page. Move version to a future settings/about page if needed. |
| 57 | `pb-20` on main | **Change to `pb-24`.** Ensures content clears the bottom nav + home indicator on all iPhone models (iPhone 14 Pro has a 34px home indicator). |

### Home Page (`src/app/page.tsx`)

| Line(s) | Element | Action |
|---------|---------|--------|
| 17 | `<h1>Pokemon GO PvP Search Strings</h1>` | **Remove.** |
| 18-20 | Subtitle paragraph | **Remove.** |
| 26-28 | "Quick Picks" h2 label | **Remove.** |
| 47-49 | "What's Live" h2 label | **Remove.** Replace with green dot indicators on each live league chip. |
| 62-66 | Empty state "No active cups right now." | **Remove.** If nothing is live, show nothing. |
| 69-81 | "Build a Team" entire section | **Remove.** Bottom nav handles this. |

### Search Input (`src/components/search-input.tsx`)

| Line(s) | Element | Action |
|---------|---------|--------|
| 63 | `placeholder="Search a Pokemon..."` | **Change to `"Who are you fighting?"`** |
| 69 | `className="min-h-11 text-base"` | **Change to `"min-h-[52px] text-lg"`** to make the search input the dominant element. |

### Leagues Landing (`src/app/leagues/page.tsx`)

| Line(s) | Element | Action |
|---------|---------|--------|
| 29-36 | Back link + h1 row | **Remove back link.** Keep h1 "Leagues". |

### League Detail (`src/components/league/league-page-client.tsx`)

| Line(s) | Element | Action |
|---------|---------|--------|
| 71-76 | Back link | **Remove.** |
| 79 | `{season} . CP {cpCap} . Updated {lastUpdated}` | **Change to `CP {cpCap}` + type restrictions only.** Drop season and lastUpdated. |
| 82-86 | Type restrictions as separate line | **Merge into metadata line.** `CP 1,500 . Dragon, Steel, Fairy` on one line. |
| 90-92 | "Find meta Pokemon you own" label | **Remove.** |

### Counter Page (`src/app/counter/[pokemon]/page.tsx`)

| Line(s) | Element | Action |
|---------|---------|--------|
| 53 | `<BackButton />` | **Remove.** |
| 54 | `<h1>` "X Counters" | **Keep but make type badges inline** (same line as h1, not a separate row). |
| 55-64 | Type badges as separate div below h1 | **Move inline with h1** in a flex container. |
| 67-113 | Type effectiveness section (Weak to / Resists) | **Move below CopyBar.** Currently renders above CopyBar, pushing it below the fold. |
| 116 | `<CopyBar>` | **Move to directly after the h1 + type badges row.** |
| 119-120 | "Top Counters" h2 | **Restyle:** `text-xs font-semibold uppercase tracking-wider text-muted-foreground`. |
| 142-143 | "Budget Picks" h2 | **Same restyle.** |
| 166-173 | Shadow Variant section at bottom | **Move to directly below main CopyBar** (before effectiveness badges). |
| 175-180 | "Build a team around X (Great League)" | **Replace** with inline text link `text-xs` at the very bottom. Pass league context from referrer. |

### CopyBar (`src/components/copy-bar.tsx`)

| Line(s) | Element | Action |
|---------|---------|--------|
| 25 | Container `bg-muted/50` | **Change to `bg-primary/[0.06] border-primary/20 rounded-xl p-3.5`.** |
| 29-35 | Copy button | **Change to `min-h-[44px] min-w-[72px] px-5 text-base font-semibold`.** |
| 16 | Copied timeout 2000ms | **Change to 3000ms.** |

### Bottom Nav (`src/components/bottom-nav.tsx`)

| Element | Action |
|---------|--------|
| Current 3-tab structure | **No change.** Structure supports future PvP/Raids/Rocket mode selector on the search page. |

### Inline Team Section (`src/components/league/inline-team-section.tsx`)

| Line(s) | Element | Action |
|---------|---------|--------|
| 107 | Container `p-4` | **Change to `p-3`.** Reduce padding to save vertical space. |
| 122 | Coverage score `text-sm font-medium text-muted-foreground` | **Change to `text-base font-bold`** with conditional color (red 0-6, amber 7-12, green 13-18). |
| 138-146 | Role labels `text-[10px]` | **Change to `text-xs`.** Keep colored text but add a subtle pill background: `bg-blue-500/10 px-1.5 py-0.5 rounded-full` (swap: amber, closer: emerald). |
| 163-170 | Empty slot circles `h-7 w-7` | **Change to `h-9 w-9`.** |

### Teams Page (`src/app/teams/page.tsx`)

| Line(s) | Element | Action |
|---------|---------|--------|
| 205-209 | Back link | **Remove.** |
| 212-214 | Subtitle | **Remove.** |
| 255-257 | "Find your team in-game" label | **Remove.** |
| 262-270 | Share button (tiny text link) | **Promote** to full-width bordered button at `min-h-11`. |
| 273-276 | CoverageChart | **Wrap in collapsible "Analysis" section**, default closed. |
| 278-285 | ThreatList | **Wrap in same collapsible section.** |
| 299-317 | "Counter Details" section | **Remove.** Make TeamSlotCards link to counter pages directly. |

### Tier Accordion (`src/components/tier-accordion.tsx`)

| Element | Action |
|---------|--------|
| Tier labels "S Tier -- Meta Defining" etc. | **Shorten** to "S Tier (4)", "A Tier (6)", etc. Drop editorial descriptors. |
| AccordionTrigger | **Ensure `min-h-[44px]`** for tap target compliance. |

### Pokemon Card (`src/components/pokemon-card.tsx`)

| Element | Action |
|---------|--------|
| Outer container | **Wrap in `Link` to `/counter/{pokemonId}`.** |
| Right side | **Add `ChevronRight` icon** (`h-4 w-4 text-muted-foreground`). |

### League Card (`src/components/league-card.tsx`)

| Element | Action |
|---------|--------|
| Season label | **Remove.** |
| Meta count | **Remove** from card (visible on detail page). |
| Inactive card `opacity-50` | **Change to `opacity-70`** or remove opacity entirely and rely on absence of "Live" badge. |

---

## 8. Acceptance Criteria

### Home Page
- [ ] No h1 or subtitle text renders on the home page
- [ ] Search input is 52px tall with placeholder "Who are you fighting?"
- [ ] Quick Pick chips render directly below search with no label
- [ ] Live league chips render below Quick Picks with green dot indicators, no label
- [ ] No "Build a Team" section exists
- [ ] Entire home page fits above the fold on 375x667

### League Detail
- [ ] No back link renders
- [ ] Metadata is ONE line: CP + type restrictions only
- [ ] No "Find meta Pokemon you own" label above CopyBar
- [ ] CopyBar uses tinted background and is the most visually prominent element
- [ ] Empty team prompt shows when no team is active
- [ ] Tier labels are shortened (no editorial descriptors)

### Counter Page
- [ ] No back button renders
- [ ] Pokemon name and type badges are on the same line
- [ ] CopyBar renders immediately after the header (above type effectiveness)
- [ ] Shadow CopyBar renders below main CopyBar (before effectiveness badges)
- [ ] Type effectiveness (Weak to / Resists) renders below CopyBar
- [ ] Counter cards are tappable links to their counter pages
- [ ] "Build a team" is a small inline link at the bottom, not a full-width CTA

### Teams Page
- [ ] No back link or subtitle
- [ ] h1 and LeaguePicker are on the same row
- [ ] CopyBar renders directly below the team slots (no label above it)
- [ ] Share button is full-width bordered, not a tiny text link
- [ ] Coverage score is prominent with color coding
- [ ] Coverage chart and threats are collapsed in an "Analysis" accordion by default
- [ ] "Counter Details" section is removed

### CopyBar (global)
- [ ] Background is `bg-primary/[0.06]` with `border-primary/20`
- [ ] Copy button is 44px+ tall, `text-base font-semibold`
- [ ] Copied state persists for 3 seconds
- [ ] No label appears above any CopyBar instance in the app
- [ ] CopyBar is the only element on each page with a large filled primary button

### Global
- [ ] Version banner is removed from layout
- [ ] Main content padding is `pb-24`
- [ ] No back links exist anywhere in the app
- [ ] All section headers either removed or restyled to `text-xs font-semibold uppercase tracking-wider`

---

## 9. Estimated Vertical Space Savings

| Page | Removed/Compressed Elements | Estimated Savings |
|------|---------------------------|-------------------|
| Layout (all pages) | Version banner | ~20px |
| Home | h1 + subtitle + 3 section headers + Build a Team section | ~170px |
| League detail | Back link + verbose metadata + CopyBar label | ~80px |
| Counter | Back button + reorder (CopyBar above effectiveness) | ~60px above fold |
| Teams | Back link + subtitle + CopyBar label + Counter Details section | ~120px |

On a 375x667 iPhone SE, the home page savings of 170px represent 25% of the viewport returned to actionable content.

---

## 10. Implementation Priority

### Phase 1: CopyBar + Chrome Removal (1 session)
1. Redesign CopyBar component (Section 6)
2. Remove version banner from layout
3. Remove all back links (4 files)
4. Remove all CopyBar labels (3 files)
5. Change `pb-20` to `pb-24`

### Phase 2: Home Page (1 session)
1. Remove h1, subtitle, section headers, Build a Team section
2. Resize search input (52px, new placeholder)
3. Add green dot to live league chips

### Phase 3: Counter Page Reorder (1 session)
1. Move CopyBar above effectiveness badges
2. Move shadow CopyBar below main CopyBar
3. Make header + type badges inline
4. Make PokemonCards linkable
5. Shrink "Build a team" to inline link

### Phase 4: League Detail (1 session)
1. Collapse metadata to one line
2. Remove back link (already done in Phase 1)
3. Add empty team prompt
4. Shorten tier labels

### Phase 5: Teams Page (1 session)
1. Remove subtitle, rearrange h1 + LeaguePicker
2. Remove CopyBar label, Counter Details section
3. Promote share button
4. Wrap analysis in collapsible accordion
5. Add coverage score color coding

---

## 11. What This Spec Does NOT Cover

- **Raid boss counters or Team Rocket counters.** This spec documents how they fit architecturally (Section 5) but does not spec the data pipeline, counter scoring, or UI for these features.
- **Search input autofocus.** Intentionally excluded. Opening the keyboard on mobile load blocks the Quick Picks and live league chips from view. The search input's size and placeholder are sufficient to communicate "type here."
- **Onboarding or tooltips.** Per the roadmap: "the design should speak for itself."
- **PokemonCard redesign.** Only the linkability change is specced. The card's internal layout is fine.
- **LeagueCard redesign.** Only the metadata simplification is specced.
- **Color scheme or typography changes.** Geist Sans is fine. The current color scheme works. This is a layout and hierarchy overhaul, not a visual rebrand.
