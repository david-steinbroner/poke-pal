# Font Size Accessibility Audit

**Date:** 2026-04-08
**Status:** Spec — ready for implementation
**Problem:** Fonts across Poke Pal are generally too small, making the app hard to read on mobile devices.

---

## Current Font Inventory

### text-xs (12px) — 14 occurrences

| File | Line | Content |
|------|------|---------|
| `src/app/page.tsx` | 33 | Section header "Current Raids" (uppercase tracking-wide) |
| `src/app/page.tsx` | 49 | Section header "Go Battle League" (uppercase tracking-wide) |
| `src/app/page.tsx` | 65 | Section header "My Teams" (uppercase tracking-wide) |
| `src/app/teams/page.tsx` | 210 | League tab buttons (Fantasy, Great, Ultra, Master) |
| `src/app/teams/page.tsx` | 297 | "See more" link in team slot suggestions |
| `src/app/teams/page.tsx` | 311 | "SEE LEAGUE INFO" link (uppercase tracking-wide) |
| `src/app/counter/[pokemon]/page.tsx` | 77,87,98 | "Weak to" / "2x" / "Resists" labels |
| `src/components/type-badge.tsx` | 16 | All type badges (Fire, Water, etc.) |
| `src/components/status-pill.tsx` | 22 | Status pills (Live, Rec) |
| `src/components/pokemon-list-item.tsx` | 68 | Move text below Pokemon name (fast move \| charged moves) |
| `src/components/team/team-slot.tsx` | 23,34 | Slot labels "POKEMON 1", "POKEMON 2", "POKEMON 3" (uppercase tracking-wide) |
| `src/components/team/team-slot.tsx` | 39 | Moveset text below Pokemon name |
| `src/components/team/threat-list.tsx` | 38 | "Threatens [names]" text |
| `src/components/league-card.tsx` | 44 | "Starts [date]" text on inactive leagues |
| `src/components/league/inline-team-section.tsx` | 49 | Empty slot circle numbers |

### text-sm (14px) — 16 occurrences

| File | Line | Content |
|------|------|---------|
| `src/app/page.tsx` | 27 | App subtitle/description |
| `src/app/teams/page.tsx` | 235 | Disabled "Copy Search String" button |
| `src/app/teams/page.tsx` | 245 | "Share" button |
| `src/app/teams/page.tsx` | 318 | "Meta Threats" section header |
| `src/app/counter/[pokemon]/page.tsx` | 112,136 | "Top Counters" / "Budget Picks" section headers |
| `src/app/leagues/page.tsx` | 32,60 | "Live Now" / "Coming Up" section headers |
| `src/app/leagues/page.tsx` | 52 | "No active cups" fallback text |
| `src/components/bottom-nav.tsx` | 33 | Nav bar links (Home, Leagues, Teams) |
| `src/components/copy-button.tsx` | 33 | Copy button text |
| `src/components/pokemon-chip.tsx` | 17 | Pokemon chip name text |
| `src/components/pokemon-list-item.tsx` | 47,54 | Tier letter + Pokemon name in list items |
| `src/components/team/team-slot.tsx` | 37 | Pokemon name in filled slot |
| `src/components/team/threat-list.tsx` | 16,30 | "No major threats" text + threat Pokemon name |
| `src/components/league/inline-team-section.tsx` | 27 | "Your Team" label |
| `src/components/league-card.tsx` | 49 | League card detail line (CP, season, meta count) |
| `src/components/league/league-page-client.tsx` | 91,95 | "< Leagues" back link + CP/type description |
| `src/components/search-input.tsx` | 91 | Search dropdown result items |
| `src/components/tier-accordion.tsx` | 52 | Accordion trigger labels ("S Tier -- Meta Defining") |

### text-base (16px) — 2 occurrences

| File | Line | Content |
|------|------|---------|
| `src/app/page.tsx` | 39 | Raid boss pill buttons |
| `src/components/home-team-preview.tsx` | 44 | League tab buttons on home page |

### text-lg (18px) — 1 occurrence

| File | Line | Content |
|------|------|---------|
| `src/components/search-input.tsx` | 83 | Search input field text |

### text-xl (20px) — 4 occurrences

| File | Line | Content |
|------|------|---------|
| `src/app/page.tsx` | 26 | "Poke Pal" page title |
| `src/app/teams/page.tsx` | 194 | "Team Builder" page title |
| `src/app/counter/[pokemon]/page.tsx` | 56 | Pokemon name (e.g. "Mewtwo") |
| `src/app/leagues/page.tsx` | 28 | "Leagues" page title |
| `src/components/league/league-page-client.tsx` | 94 | League name (e.g. "Fantasy Cup") |

### No explicit text size (inherits default ~16px)

| File | Line | Content |
|------|------|---------|
| `src/components/league-card.tsx` | 39 | League card name `<h3>` (font-medium, no size class) |
| `src/components/back-button.tsx` | 19 | Uses `text-sm` |

---

## Accessibility Problems

1. **text-xs (12px) is heavily overused** -- 14 occurrences including move text, slot labels, type badges, status pills, and section headers. 12px is below WCAG recommended minimums for mobile touch interfaces.

2. **text-sm (14px) is the de facto "body" size** -- Pokemon names, section headers, nav bar text, copy buttons, and list items all use 14px. On mobile, 14px for primary interactive content is borderline.

3. **Section headers use text-xs** -- "Current Raids", "Go Battle League", "My Teams" are all 12px uppercase. These organizational labels need to be scannable.

4. **Move text in counter cards is 12px** -- This is core gameplay information (what moves to use) rendered at the smallest possible size.

5. **League tabs on Teams page are 12px** -- Critical navigation elements at minimum readable size on a 375px screen.

---

## Proposed Font Size Bump

### Tailwind Defaults Reference
| Class | Current | Proposed |
|-------|---------|----------|
| text-xs | 12px / 0.75rem | -- |
| text-sm | 14px / 0.875rem | -- |
| text-base | 16px / 1rem | -- |
| text-[13px] | 13px / 0.8125rem | (new utility) |

### Recommendations by Element Category

#### 1. Section Headers (uppercase tracking-wide labels)
**Current:** `text-xs` (12px)
**Proposed:** `text-[13px]` (13px)
**Rationale:** One step up keeps them visually subordinate to content while crossing the readability threshold. Uppercase + tracking-wide already adds visual weight.

| File | Line | Current | Change to |
|------|------|---------|-----------|
| `src/app/page.tsx` | 33 | `text-xs font-medium uppercase tracking-wide` | `text-[13px] font-medium uppercase tracking-wide` |
| `src/app/page.tsx` | 49 | `text-xs font-medium uppercase tracking-wide` | `text-[13px] font-medium uppercase tracking-wide` |
| `src/app/page.tsx` | 65 | `text-xs font-medium uppercase tracking-wide` | `text-[13px] font-medium uppercase tracking-wide` |
| `src/app/teams/page.tsx` | 311 | `text-xs uppercase tracking-wide` | `text-[13px] uppercase tracking-wide` |

#### 2. Container Slot Labels (POKEMON 1, POKEMON 2, etc.)
**Current:** `text-xs` (12px)
**Proposed:** `text-[13px]` (13px)
**Rationale:** Same logic as section headers -- uppercase labels that need a small bump.

| File | Line | Current | Change to |
|------|------|---------|-----------|
| `src/components/team/team-slot.tsx` | 23 | `text-xs font-medium text-muted-foreground uppercase tracking-wide` | `text-[13px] font-medium text-muted-foreground uppercase tracking-wide` |
| `src/components/team/team-slot.tsx` | 34 | `text-xs font-medium text-muted-foreground uppercase tracking-wide` | `text-[13px] font-medium text-muted-foreground uppercase tracking-wide` |

#### 3. Pokemon Names in Cards / List Items
**Current:** `text-sm` (14px)
**Proposed:** `text-sm` (14px) -- KEEP
**Rationale:** Pokemon names are short words, 14px is adequate when the surrounding move text bumps up. The font-medium weight helps readability. No change needed.

| File | Line | Keep |
|------|------|------|
| `src/components/pokemon-list-item.tsx` | 54 | `font-medium text-sm` -- no change |
| `src/components/team/team-slot.tsx` | 37 | `font-medium text-sm` -- no change |
| `src/components/team/threat-list.tsx` | 30 | `font-medium text-sm` -- no change |

#### 4. Move Text in Cards
**Current:** `text-xs` (12px)
**Proposed:** `text-[13px]` (13px)
**Rationale:** Move names are core gameplay info. 12px is too small for scanning quickly during battles.

| File | Line | Current | Change to |
|------|------|---------|-----------|
| `src/components/pokemon-list-item.tsx` | 68 | `text-xs text-muted-foreground` | `text-[13px] text-muted-foreground` |
| `src/components/team/team-slot.tsx` | 39 | `text-xs text-muted-foreground` | `text-[13px] text-muted-foreground` |
| `src/components/team/threat-list.tsx` | 38 | `text-xs text-muted-foreground` | `text-[13px] text-muted-foreground` |

#### 5. Type Badges
**Current:** `text-xs` (12px)
**Proposed:** `text-xs` (12px) -- KEEP
**Rationale:** Type badges are color-coded pill elements where the color carries the primary information. They sit inline next to names. Bumping them risks breaking the single-line layout on counter pages with 5+ weakness types. The compact size is intentional for density.

| File | Line | Keep |
|------|------|------|
| `src/components/type-badge.tsx` | 16 | `text-xs font-medium` -- no change |

#### 6. Status Pills (Live, Rec)
**Current:** `text-xs` (12px)
**Proposed:** `text-xs` (12px) -- KEEP
**Rationale:** Same as type badges -- small colored indicators where the color does the work. "Live" and "Rec" are 3-4 character words that read fine at 12px.

| File | Line | Keep |
|------|------|------|
| `src/components/status-pill.tsx` | 22 | `text-xs font-medium` -- no change |

#### 7. Nav Bar Text
**Current:** `text-sm` (14px)
**Proposed:** `text-base` (16px)
**Rationale:** Bottom nav is the primary navigation. 14px for "Home", "Leagues", "Teams" is undersized for a fixed nav bar. 16px with font-medium matches iOS/Android native tab bar conventions.

| File | Line | Current | Change to |
|------|------|---------|-----------|
| `src/components/bottom-nav.tsx` | 33 | `text-sm font-medium` | `text-base font-medium` |

#### 8. League Tabs on Teams Page
**Current:** `text-xs` (12px)
**Proposed:** `text-[13px]` (13px)
**Rationale:** Four tabs must fit on 375px. At `flex-1` + `px-2`, each tab gets ~88px. text-sm (14px) would work but "Fantasy" is 7 characters and "Master" is 6 -- both fit at 13px with room. Going to 14px risks "Fantasy" wrapping on very narrow screens, so 13px is the safe bump.

| File | Line | Current | Change to |
|------|------|---------|-----------|
| `src/app/teams/page.tsx` | 210 | `text-xs font-medium` | `text-[13px] font-medium` |

#### 9. Copy Button Text
**Current:** `text-sm` (14px)
**Proposed:** `text-sm` (14px) -- KEEP
**Rationale:** The copy button is a large tap target (min-h-11, full width) with font-semibold. 14px semibold in a big button reads clearly. The button's size compensates.

| File | Line | Keep |
|------|------|------|
| `src/components/copy-button.tsx` | 33 | `text-sm font-semibold` -- no change |

#### 10. Pokemon Chips
**Current:** `text-sm` (14px)
**Proposed:** `text-sm` (14px) -- KEEP
**Rationale:** Chips are compact by design. 14px font-medium in a pill with max-width truncation is readable.

| File | Line | Keep |
|------|------|------|
| `src/components/pokemon-chip.tsx` | 17 | `text-sm font-medium` -- no change |

#### 11. Counter Page Labels ("Weak to", "Resists", "2x")
**Current:** `text-xs` (12px)
**Proposed:** `text-[13px]` (13px)
**Rationale:** These are inline labels next to type badges. A small bump improves scannability without affecting badge alignment.

| File | Line | Current | Change to |
|------|------|---------|-----------|
| `src/app/counter/[pokemon]/page.tsx` | 77 | `text-xs font-medium text-muted-foreground` | `text-[13px] font-medium text-muted-foreground` |
| `src/app/counter/[pokemon]/page.tsx` | 87 | `text-xs font-medium text-muted-foreground` | `text-[13px] font-medium text-muted-foreground` |
| `src/app/counter/[pokemon]/page.tsx` | 98 | `text-xs font-medium text-muted-foreground` | `text-[13px] font-medium text-muted-foreground` |

#### 12. Section Headers with text-sm (Top Counters, Budget Picks, etc.)
**Current:** `text-sm` (14px)
**Proposed:** `text-sm` (14px) -- KEEP
**Rationale:** These are `font-medium` section labels at 14px. They sit below the page title and above card lists. 14px is adequate for this hierarchy level.

#### 13. Search Dropdown Results
**Current:** `text-sm` (14px)
**Proposed:** `text-base` (16px)
**Rationale:** Dropdown items are tap targets. 16px matches the search input's text-lg feel and makes results easier to read and tap accurately.

| File | Line | Current | Change to |
|------|------|---------|-----------|
| `src/components/search-input.tsx` | 91 | `text-sm` | `text-base` |

#### 14. League Card Detail Line
**Current:** `text-sm` (14px)
**Proposed:** `text-sm` (14px) -- KEEP
**Rationale:** The "CP 1500 . Season 22 . 15 meta picks" line is secondary info. 14px is fine here.

#### 15. "See more" and small nav links
**Current:** `text-xs` (12px)
**Proposed:** `text-[13px]` (13px)

| File | Line | Current | Change to |
|------|------|---------|-----------|
| `src/app/teams/page.tsx` | 297 | `text-xs font-medium` | `text-[13px] font-medium` |

---

## Summary of All Changes

### Files to edit:

**`src/app/page.tsx`** (3 changes)
- Line 33: `text-xs` -> `text-[13px]` (section header)
- Line 49: `text-xs` -> `text-[13px]` (section header)
- Line 65: `text-xs` -> `text-[13px]` (section header)

**`src/app/teams/page.tsx`** (3 changes)
- Line 210: `text-xs` -> `text-[13px]` (league tabs)
- Line 297: `text-xs` -> `text-[13px]` ("See more" link)
- Line 311: `text-xs` -> `text-[13px]` ("SEE LEAGUE INFO" link)

**`src/app/counter/[pokemon]/page.tsx`** (3 changes)
- Line 77: `text-xs` -> `text-[13px]` ("Weak to" label)
- Line 87: `text-xs` -> `text-[13px]` ("2x" label)
- Line 98: `text-xs` -> `text-[13px]` ("Resists" label)

**`src/components/bottom-nav.tsx`** (1 change)
- Line 33: `text-sm` -> `text-base` (nav links)

**`src/components/search-input.tsx`** (1 change)
- Line 91: `text-sm` -> `text-base` (dropdown results)

**`src/components/pokemon-list-item.tsx`** (1 change)
- Line 68: `text-xs` -> `text-[13px]` (move text)

**`src/components/team/team-slot.tsx`** (3 changes)
- Line 23: `text-xs` -> `text-[13px]` (slot label, empty state)
- Line 34: `text-xs` -> `text-[13px]` (slot label, filled state)
- Line 39: `text-xs` -> `text-[13px]` (moveset text)

**`src/components/team/threat-list.tsx`** (1 change)
- Line 38: `text-xs` -> `text-[13px]` ("Threatens..." text)

**Total: 16 class changes across 8 files.**

### What stays the same:
- Type badges (text-xs) -- color carries meaning, density matters
- Status pills (text-xs) -- short colored labels
- Pokemon names in cards (text-sm) -- adequate with font-medium
- Pokemon chips (text-sm) -- compact by design
- Copy buttons (text-sm) -- large tap target compensates
- Page titles (text-xl) -- already fine
- Search input (text-lg) -- already fine
- Section sub-headers like "Top Counters" (text-sm) -- adequate hierarchy
- League card details (text-sm) -- secondary info

### Constraints verified:
- **League tabs at 375px**: 4 tabs at `flex-1 px-2` = ~88px each. "Fantasy" at 13px font-medium = ~55px. Fits with 33px padding. Safe.
- **Counter cards**: Move text bump from 12px to 13px adds ~1px line height. No layout impact.
- **Overall density**: Only bumping by 1px (12->13) in most places. The only 2px bumps are nav bar and search results, which are primary interactive elements.
