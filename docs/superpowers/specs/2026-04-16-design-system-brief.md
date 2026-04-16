# PoGo Pal — Design System Brief for Rachel

**Date:** 2026-04-16
**For:** Rachel (Product Design Lead)
**From:** David + engineering team

---

## What we're solving

The app has 11 locations that display pokemon in lists/groups, each built independently with different layouts, spacing, typography, and interaction patterns. Users experience what feels like a different app on each tab. We need a unified design system that:

1. **Displays pokemon consistently** — whether it's a team of 3, a counter list of 5, a meta tier list of 14, or a raid boss list
2. **Handles add/remove/copy interactions** — the core product loop is browse → copy search string → paste in Pokemon GO
3. **Adapts density by context** — mid-battle (Rockets) needs fast scanning, planning (Team Builder) needs detail
4. **Feels like one app** across all 5 tabs

---

## The 11 locations

### Teams of 3 pokemon

| # | Page | What it shows | User's goal | Speed | Current pattern |
|---|---|---|---|---|---|
| 1 | Team Builder — My Team | Active team being built | Assemble/refine | Slow (planning) | Vertical cards, role labels, movesets, remove buttons |
| 2 | Team Builder — Recommended | AI suggestions from pool | Pick a pre-built team | Medium | Collapsible, roles, strategy tips, "Use This Team" |
| 3 | Leagues — Recommended | Curated team ideas | Discover teams | Medium | 2-col pill grid, LEAD label, description, Copy button |
| 4 | League Detail — Curated | Same curated teams | Quick-grab search string | Medium | Pill list, team name, Copy button |
| 5 | League Detail — Inline Bar | Team status while browsing | Passive awareness | Glance | Fixed bottom bar, horizontal pills, rating |

### Counter/meta pokemon lists (variable count)

| # | Page | What it shows | User's goal | Speed | Current pattern |
|---|---|---|---|---|---|
| 6 | Rockets — Counters | 3 counter pokemon per grunt | Beat a grunt NOW | Fast (mid-battle) | Single-line: Name · Fast \| Charged, Charged |
| 7 | Counter page — Top Counters | 5 best counters | Prep for a fight | Medium | Bordered cards, name + movesets |
| 8 | Counter page — Budget Picks | 5 accessible alternatives | Find what you have | Medium | Same as #7, collapsed |
| 9 | Leagues — Tier lists | S/A/B/C meta pokemon | Browse the meta | Medium | Bordered cards, tier badge + name + moves |
| 10 | Raids — Boss lists | Raid bosses by tier | Find boss, tap for counters | Medium | Bordered rows, name + tier indicator |
| 11 | Home — Raid preview | Top 4 current bosses | Quick glance | Fast | 2-col grid, name + tier star |

---

## Interaction patterns to unify

### Copy flow
Every list has a "Copy [something]" button. Currently uses 3 different button components in different positions. Need one pattern:
- Where does the copy button live relative to the list?
- What does it look like?
- What does the success state look like?

### Add/remove
- Team Builder: tap + to add, tap X to remove
- League Detail: tap pokemon to add to team
- Need: consistent "I'm selecting/deselecting" interaction

### Navigation
- Leagues tier list: tap pokemon → counter page
- Raids: tap boss → counter page
- Recommended teams: tap pokemon → counter page
- Need: consistent "this is tappable and goes somewhere" affordance

### Density
- **Fast** (Rockets, mid-battle): single-line, minimal chrome, max info density
- **Medium** (Leagues, Counters, Raids): bordered rows/cards, name + key info
- **Slow** (Team Builder): full detail, editable, strategy context

---

## Design tokens to define

- **Pokemon name style**: size, weight, case — one standard
- **Moveset display**: how to show fast + charged moves consistently
- **Tier/role badges**: size, color, position
- **Elite TM indicator**: how to flag legacy/elite moves
- **Card/row container**: border, padding, radius, tap states
- **Spacing**: between items in a list, between sections
- **Copy button**: size, style, position, label pattern

---

## Inspiration apps (for Mobbin)

Search for these patterns:
- "sports stats reference app" (ESPN for stat density)
- "copy to clipboard button mobile" (Google Translate for copy flow)
- "tier list ranking cards mobile"
- "collapsible accordion sections"
- "card list with badges and tags"

Specific apps to study:
- **ESPN** — stat density, tier rankings
- **Coinbase** — clean utility, list-heavy, quick actions
- **Google Translate** — copy-result flow
- **Stronglifts 5x5** — browse → act, collapsible sets, badges
- **Shazam** — one-tap copy/share action

---

## Proposed component: `<TeamCard>`

Three variants, one component:

**Compact** — pills/list/bar. Name-only or name+moves. For browsing/copying.
- Props: `layout` ("pills" | "bar" | "list"), `showMoves`, `showTier`, `showElite`, `linkTo`, `onCopy`

**Default** — collapsed compact row, expands to roles + movesets + tips. For recommendation selection.
- Props: `expandable`, `showRoles`, `showStrategy`, `onUseTeam`

**Detailed** — editable card stack. Roles, movesets, gap hints, remove buttons. For team building.
- Props: `editable`, `onRemove`, `showRating`, `showGapHints`

---

## What stays different per context

- Amount of metadata (moves, roles, types, strategy)
- Layout orientation (vertical stack vs pill grid vs single-line vs horizontal bar)
- Available actions (copy, add, remove, navigate, use team)
- Number of pokemon (3 for teams, 5 for counters, 10-14 for tiers, variable for raids)

## What must be the same everywhere

- Pokemon name typography
- Copy button style and placement pattern
- Tap state / affordance for interactive items
- Spacing rhythm between items
- Elite TM / legacy move indicator
- Container border/radius treatment
