# Phase 2: UX & Navigation Spec

Date: 2026-04-08
Status: Draft
Depends on: v0.1.0 (shipped)

---

## Overview

Five features that ship together as one cohesive UX pass. The goal: a new user landing on Poke Pal for the first time can find the active cup, build a team, understand their coverage, and copy a search string — without any instructions.

These features connect:
- Leagues landing page gives users a clear entry point (Feature 1)
- Onboarding hint teaches the + button (Feature 3)
- Expandable team panel makes the build flow visible (Feature 2)
- Counter page improvements explain why counters work (Feature 4)
- Home page refocus removes duplication with the new leagues page (Feature 5)

---

## Feature 1: Leagues Landing Page (`/leagues`)

### What changes

**New file:** `src/app/leagues/page.tsx` — static page, server component.

**Modified files:**
- `src/components/bottom-nav.tsx` — change Leagues href from `/league/fantasy-cup` to `/leagues`. Update the match function to `p === "/leagues" || p.startsWith("/league/")`.
- `src/app/page.tsx` — remove the "League Meta" section (the `leagues.map()` block). Add a "What's Live" mini section (see Feature 5).
- `src/components/league-card.tsx` — add support for an `inactive` visual state (grayed out, shows start date instead of "Active" badge).

**No changes to:** `src/app/league/[leagueSlug]/page.tsx` (individual league pages stay as-is).

### Page layout (mobile, 375px)

```
[Poke Pal header area — none, the page IS the content]

Live Now
+------------------------------------------+
| Fantasy Cup: Great League Edition        |
| CP 1,500 · Memories in Motion · 14 meta |
| [Live Now] badge, green                  |
+------------------------------------------+
+------------------------------------------+
| Great League                             |
| CP 1,500 · Season 22 · 10 meta          |
| [Live Now] badge, green                  |
+------------------------------------------+

All Leagues
+------------------------------------------+
| Ultra League                    (grayed) |
| CP 2,500 · Season 22 · 10 meta          |
| Starts Apr 22                            |
+------------------------------------------+
+------------------------------------------+
| Master League                   (grayed) |
| CP ∞ · Season 22 · 10 meta              |
| Starts May 6                             |
+------------------------------------------+
```

### Active/inactive logic

The League JSON already has `active`, `startDate`, and `endDate` fields. The page reads all 4 league JSONs and splits them:

```typescript
const active = leagues.filter(l => l.active);
const inactive = leagues.filter(l => !l.active);
```

Since the app is statically generated, "active" is determined at build time based on the JSON values. No runtime date comparison needed for MVP.

### LeagueCard changes

Add two optional props to `LeagueCard`:

- `startDate?: string` — shown as "Starts Apr 14" when the league is inactive.
- `variant?: "default" | "inactive"` — when `"inactive"`, the card gets `opacity-50` and the badge shows the formatted start date instead of "Active".

The date formatting is simple: `new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })`.

### UX flow

1. User taps "Leagues" in bottom nav.
2. Lands on `/leagues`. Active cups are at the top with green "Live Now" badges.
3. User taps a league card.
4. Navigates to `/league/fantasy-cup` (existing page, no change).
5. Back button on league detail page should link to `/leagues` instead of `/`.

### Edge cases

- **All leagues inactive:** Show all under "All Leagues" heading. No "Live Now" section. Add a line: "No active cups right now. Check back when the next GBL rotation starts."
- **All leagues active:** Show all under "Live Now" heading. No "All Leagues" section.
- **Only one active league:** Still show the "Live Now" section with one card.

### Scope boundaries

- NOT building a league schedule/calendar view.
- NOT adding automated build triggers on GBL rotation dates (that is a Phase 4 data pipeline concern).
- NOT changing the league detail page layout or behavior.

---

## Feature 2: Expandable Team Panel on League Pages

### What changes

**Modified file:** `src/components/league/floating-team-bar.tsx` — rewrite to support collapsed and expanded states.

**No new files.** The expanded state renders inline within the same component.

### Collapsed state (default when team has 1+ Pokemon)

A compact single-line bar positioned above the bottom nav. Shows:

```
[Registeel] [Altaria] [3] | 11/18 | [Copy]
```

- Team member names as small chips (just the name, no X button in collapsed mode).
- Empty slot shown as a numbered circle (same as current).
- Coverage score as `N/18`.
- Copy button on the right.
- A small up-chevron (`ChevronUp` from lucide) on the far right as the expand affordance.
- No suggestions row in collapsed mode.

Height: ~48px. Background matches current: `bg-background/95 backdrop-blur-sm`.

### Expanded state

Tapping the bar (or the chevron) expands the panel to approximately 50% of the viewport height. The transition uses CSS `transform: translateY()` with a `transition-duration: 300ms ease-out`. No framer-motion.

Layout within the expanded panel (top to bottom):

```
+------------------------------------------+
| [ChevronDown]              Team (2/3)    |  <- header row
+------------------------------------------+
| [Registeel x] [Altaria x] [+ slot 3]    |  <- team slots with remove buttons
+------------------------------------------+
| Coverage: 11/18                          |
| [N][Fi][W][E][G][I][Fg][P][Gd]...       |  <- 18-type mini grid
| [Fl][Ps][B][R][Gh][Dr][Dk][St][Fa]      |  <- green = covered, gray = not
+------------------------------------------+
| Try: [+ Registeel] [+ Steelix] [+ Alta] |  <- suggestion chips
+------------------------------------------+
| [Copy Search String]                     |  <- full-width copy button
| [Full Analysis ->]                       |  <- link to /teams?l=...&p=...
+------------------------------------------+
```

**Coverage mini grid:** A 2-row grid of 9 type badges each. Each badge is 32x28px, shows the type's 3-letter abbreviation (Nor, Fir, Wat, Ele, Gra, Ice, Fig, Poi, Gro, Fly, Psy, Bug, Roc, Gho, Dra, Dar, Ste, Fai). Covered types use `TYPE_COLORS` from constants.ts for background. Uncovered types are `bg-muted text-muted-foreground`.

**Suggestions row:** Same logic as the current floating bar's suggestions — top 3 from `analysis.suggestions`, excluding Pokemon already on team. Each is a tappable chip with a `+` icon.

**"Full Analysis" link:** Routes to `/teams?l={leagueId}&p={team.join(",")}` — same as the current "Team" link but with clearer copy.

### Interaction details

- **Expand:** Tap anywhere on the collapsed bar, or tap the up-chevron.
- **Collapse:** Tap the down-chevron in the expanded header. Also collapse if the user taps a suggestion chip (to avoid blocking the tier list).
- **Remove Pokemon:** Tap the X on a team chip in expanded mode. If team goes to 0, panel hides (same as current behavior).
- **Scroll behind:** When expanded, the league page content behind the panel is still visible above the panel. The panel does not overlay the full screen — it pushes up from the bottom. Content behind is not scrollable while panel is expanded (add `overflow: hidden` to body, remove on collapse).

### Implementation approach

Use a single `isExpanded` boolean state. The panel's container has two height states:

```css
/* Collapsed */
.panel { height: 48px; }

/* Expanded */
.panel { height: 50vh; overflow-y: auto; }

/* Transition */
.panel { transition: height 300ms ease-out; }
```

The content inside renders conditionally: collapsed shows the compact row, expanded shows the full layout. Both are always in the DOM (for smooth transitions), but the expanded content has `opacity: 0; pointer-events: none` when collapsed, transitioning to `opacity: 1` with a slight delay (150ms) after the height animation starts.

### Edge cases

- **Very long Pokemon names:** Truncate at 8 characters in collapsed mode chips. Full name in expanded mode.
- **Team is full (3/3):** Suggestions row still shows (for swap ideas). The suggestion text changes to "Swap idea:" instead of "Try:".
- **No suggestions available:** Hide the suggestions row entirely.
- **Screen height < 600px:** Cap panel height at 60vh to avoid covering the entire viewport.

### Scope boundaries

- NOT adding drag-to-reorder on team slots.
- NOT adding a "rate my team" score beyond the existing coverage score.
- NOT changing the team analysis logic in `team-analysis.ts`.

---

## Feature 3: Team Building Onboarding

### What changes

**New file:** `src/components/league/team-hint.tsx` — a small hint component.

**Modified file:** `src/components/league/league-page-client.tsx` — render the hint when conditions are met.

### Behavior

When ALL of these are true:
1. The user has never tapped a + button on any league page (checked via `localStorage` key `poke-pal:has-built-team`).
2. The current team is empty (no Pokemon selected).
3. The page has finished rendering (useEffect, not SSR).

Then show a hint near the first S-tier Pokemon card.

### Visual design

The hint appears directly below the first `MetaPokemonCard` in the S tier section. It is not a tooltip or popover — it is an inline element inserted into the flow.

```
+------------------------------------------+
| S  Registeel                       [+]   |  <- first S-tier card
+------------------------------------------+
|   Tap + to start building a team   ^     |  <- hint, with arrow pointing up-right
+------------------------------------------+
| S  Bastiodon                       [+]   |
+------------------------------------------+
```

- Text: "Tap + to start building a team"
- Font: `text-xs text-muted-foreground`
- A small arrow character (Unicode `\u2197` or a CSS triangle) pointing toward the + button area.
- Background: `bg-muted/50 rounded-md px-3 py-2` — subtle, not attention-grabbing.
- No close button. It disappears automatically.

### Dismissal

The hint disappears when:
- The user taps any + button (the `handleAddToTeam` function sets `localStorage` `poke-pal:has-built-team` to `"true"` and updates a React state `hasSeenHint`).
- On subsequent visits, the hint never shows because `localStorage` is already set.

### Implementation

In `league-page-client.tsx`:

```typescript
const [showHint, setShowHint] = useState(false);

useEffect(() => {
  if (typeof window !== "undefined") {
    const seen = localStorage.getItem("poke-pal:has-built-team");
    if (!seen) setShowHint(true);
  }
}, []);

function handleAddToTeam(pokemonId: string) {
  // existing logic...
  if (showHint) {
    localStorage.setItem("poke-pal:has-built-team", "true");
    setShowHint(false);
  }
}
```

Pass `showHint` to `TierAccordion` which passes it to the first `MetaPokemonCard` rendering. The hint renders as a sibling element after the first S-tier card.

### Edge cases

- **localStorage unavailable (private browsing):** Wrap in try/catch. If localStorage throws, just don't show the hint. No crashes.
- **No S-tier Pokemon in a league:** Show the hint after the first card in whatever the highest tier is.
- **User clears localStorage:** They see the hint again. That is fine.

### Scope boundaries

- NOT a multi-step walkthrough or tutorial.
- NOT a modal or overlay.
- NOT persisted to a server — localStorage only.
- The hint does NOT animate in. It is present on render or not.

---

## Feature 4: Counter Page Improvements

### What changes

**Modified file:** `src/app/counter/[pokemon]/page.tsx` — add type effectiveness section, "Build a team" button, fix back navigation.

**New file:** `src/components/counter/type-effectiveness-badges.tsx` — renders the offensive/defensive type badges.

### Type effectiveness visual

Below the Pokemon's type badges and above the CopyBar, add a new section showing what this Pokemon is weak to and what it resists.

```
+------------------------------------------+
| Giratina Altered Counters                |
| [Ghost] [Dragon]                         |
|                                          |
| Weak to:                                 |
| [Ice] [Ghost] [Dragon] [Dark] [Fairy]   |
|                                          |
| Resists:                                 |
| [Normal] [Fire] [Water] [Electric]       |
| [Grass] [Fighting] [Poison] [Bug]        |
+------------------------------------------+
```

**Badge design:** Each badge is a rounded pill with the type's background color from `TYPE_COLORS` and white text. Same style as existing type badges but slightly smaller: `px-2 py-0.5 text-xs rounded-full text-white font-medium`.

**Logic:** Use the existing `getEffectiveness()` function from `type-effectiveness.ts`. For a Pokemon with types `[Ghost, Dragon]`:
- "Weak to" = types where the combined defensive multiplier > 1.0 (attacker deals super-effective damage).
- "Resists" = types where the combined defensive multiplier < 1.0 (attacker deals not-very-effective or immune damage).

The defensive multiplier for a dual-type Pokemon is: `getEffectiveness(attackerType, defenderType1) * getEffectiveness(attackerType, defenderType2)`. Iterate all 18 types as attackers.

Show the labels "Weak to" and "Resists" as `text-xs font-medium text-muted-foreground mb-1`.

### "Build a team around" button

Below the Top Counters section, add a button:

```
+------------------------------------------+
| Build a team around Giratina ->          |
+------------------------------------------+
```

- Style: Same dashed-border button as the "Build a Team" button on home page.
- Link: `/teams?l=great-league&p={pokemonId}` — defaults to Great League. The Teams page will pre-fill the first slot.
- The `great-league` default is fine for MVP. The counter page doesn't know which league context the user came from.

### Back button fix

Replace the current hardcoded `<Link href="/">` back button with a client component that uses `router.back()`.

**New file:** `src/components/back-button.tsx` — a reusable client component:

```typescript
"use client";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="text-sm text-muted-foreground hover:text-foreground"
      style={{ touchAction: "manipulation" }}
    >
      &larr; Back
    </button>
  );
}
```

This component also replaces the back link on the league detail page (`league-page-client.tsx`), which currently always goes to `/`.

### Edge cases

- **Pokemon with one type:** Effectiveness calculation only uses one type (no multiplication). Same display.
- **No weaknesses (unlikely but possible):** Hide the "Weak to" section.
- **Double weakness (4x in main games, ~2.56x in GO):** Show the type once but with a `2x` indicator next to it — e.g., `[Ice 2x]`. Threshold: multiplier > 2.0.
- **`router.back()` with no history:** If the user navigated directly to `/counter/giratina-altered` (bookmarked or shared link), `router.back()` goes to the browser's previous page (possibly outside the app). This is acceptable — it is standard browser behavior. The alternative (always going home) is worse for users who came from a league page.

### Scope boundaries

- NOT adding a move-by-move breakdown of why each counter wins.
- NOT adding PvP simulation results.
- NOT changing the counter scoring algorithm.
- NOT adding league context to the counter page (which league the user came from).

---

## Feature 5: Home Page Refocus

### What changes

**Modified file:** `src/app/page.tsx` — remove League Meta section, add "What's Live" mini section.

### New layout (mobile, 375px)

```
+------------------------------------------+
| Poke Pal                                 |
| Type the boss, copy the string,          |
| paste in GO.                             |
+------------------------------------------+
| [Search input]                           |
+------------------------------------------+
| [Build a Team ->]                        |
+------------------------------------------+
| Quick Picks                              |
| [Giratina] [Medicham] [G-Stunfisk] ...  |
+------------------------------------------+
| What's Live                              |
| Fantasy Cup  ·  Great League             |
+------------------------------------------+
```

### "What's Live" section

Replaces the full league cards. Shows just the names of active leagues as inline links.

```typescript
const activeCups = leagues.filter(l => l.active);
```

Rendered as:

```tsx
<div>
  <h2 className="mb-2 text-sm font-medium text-muted-foreground">
    What's Live
  </h2>
  <div className="flex flex-wrap gap-x-3 gap-y-1">
    {activeCups.map((league) => (
      <Link
        key={league.id}
        href={`/league/${league.id}`}
        className="text-sm font-medium text-primary hover:underline"
      >
        {league.name}
      </Link>
    ))}
  </div>
</div>
```

If no leagues are active, show: "No active cups right now." as `text-sm text-muted-foreground`.

This section takes 1-2 lines of vertical space instead of the current 4 full-height league cards.

### What gets removed

The entire "League Meta" block:

```tsx
// DELETE THIS:
<div>
  <h2 className="mb-2 text-sm font-medium text-muted-foreground">
    League Meta
  </h2>
  <div className="space-y-2">
    {leagues.map((league) => (
      <LeagueCard ... />
    ))}
  </div>
</div>
```

The `LeagueCard` import can be removed from `page.tsx` (it is still used in `/leagues`).

### Edge cases

- **No active leagues:** Show "No active cups right now." The section still renders so the home page doesn't feel empty.
- **Many active leagues (3+):** The links wrap naturally with `flex-wrap`. Even 4 league names fit comfortably on a single line at 375px.

### Scope boundaries

- NOT redesigning the search input or quick picks.
- NOT adding a "recently viewed" or "your teams" section.
- NOT adding analytics or tracking to home page interactions.

---

## Cross-cutting concerns

### Static generation

All new pages (`/leagues`) are statically generated. No dynamic routes added. The existing `generateStaticParams` in league and counter pages is unchanged.

### Bottom nav active state

After Feature 1, the nav matching needs to handle:
- `/leagues` — Leagues tab active
- `/league/fantasy-cup` — Leagues tab active
- `/` — Search tab active
- `/counter/*` — Search tab active
- `/teams` — Teams tab active

The updated match function: `(p: string) => p === "/leagues" || p.startsWith("/league/")`.

### Performance budget

- No new JS libraries. All features use existing dependencies (React, Next.js, lucide-react, sonner).
- The expandable panel uses CSS transitions only — no animation library.
- The type effectiveness calculation on counter pages runs at build time (server component), not client-side.
- localStorage reads are wrapped in useEffect to avoid SSR hydration mismatches.

### Accessibility

- Expandable panel: `aria-expanded` on the toggle button, `role="region"` on the panel.
- Onboarding hint: `role="status"` so screen readers announce it.
- Type effectiveness badges: each badge is a `<span>` with the type name as text content (already accessible).
- Back button: has clear "Back" text content.
- All new interactive elements have `min-h-11` (44px) touch targets.

---

## Files summary

### New files (3)
- `src/app/leagues/page.tsx` — Leagues landing page
- `src/components/counter/type-effectiveness-badges.tsx` — Weakness/resistance badges
- `src/components/back-button.tsx` — Reusable router.back() button

### New file (optional, small)
- `src/components/league/team-hint.tsx` — Onboarding hint component

### Modified files (5)
- `src/components/bottom-nav.tsx` — Leagues href and match function
- `src/app/page.tsx` — Remove league cards, add "What's Live"
- `src/components/league-card.tsx` — Add inactive variant with start date
- `src/components/league/floating-team-bar.tsx` — Expandable collapsed/expanded states
- `src/components/league/league-page-client.tsx` — Onboarding hint integration, back button swap

### Unchanged files
- `src/app/league/[leagueSlug]/page.tsx` — no changes
- `src/lib/team-analysis.ts` — no changes
- `src/lib/type-effectiveness.ts` — no changes (used by new component, not modified)
- `src/data/leagues/*.json` — no changes (already have active, startDate, endDate fields)
- `src/app/counter/[pokemon]/page.tsx` — modified for Features 4 (type badges, build button, back button)

---

## Implementation order

These features are interconnected but can be built in this sequence with incremental verification:

1. **Back button component** (Feature 4, partial) — small reusable piece, swap into both counter and league pages.
2. **Leagues landing page** (Feature 1) — new route + nav update + LeagueCard inactive variant.
3. **Home page refocus** (Feature 5) — remove league cards, add "What's Live". Verify home page + leagues page are not duplicating content.
4. **Counter page improvements** (Feature 4) — type effectiveness badges + "build a team" button.
5. **Onboarding hint** (Feature 3) — small addition to league pages.
6. **Expandable team panel** (Feature 2) — largest change, modify floating-team-bar.tsx.

After each step: build, verify no TypeScript errors, check mobile layout at 375px.
