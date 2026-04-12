# Team Rocket — Feature Spec

**Date**: 2026-04-12
**Version**: 1.1 (revised after product + engineering review)
**Status**: Approved

---

## Problem

Poke Pal helps users build optimal PvP teams for GO Battle League, but the other most frequent battle in Pokemon GO — Team Rocket encounters — has no support. Players fight Grunts dozens of times per week, plus Leaders and Giovanni for research quests. Each encounter has specific Pokemon lineups, and picking the wrong counters wastes revives and time. Users currently Google "best counters for Sierra" or scroll through long articles on GO Hub.

The app's core value prop is **copiable GO search strings for every battle**. Team Rocket is the biggest gap.

> **Note**: Previously deferred in roadmap as "different lane." Revisiting because Team Rocket shares the exact same core mechanic (know enemy → pick counters → copy search string) and fills out the product for the majority of PvE battles.

## Solution

Add a Rockets tab with pre-built counter teams for every Team Rocket encounter. Each encounter shows the enemy lineup, a recommended team of 3 counters, and one-tap copy buttons. A lightweight team-building assist helps users who don't have the top counters.

---

## User Flow

### Entry Points

1. **Bottom nav**: New "Rockets" tab (4th item: Home | Leagues | Teams | Rockets)
2. **Home page**: New "LIVE: TEAM ROCKET" collapsible section between RAIDS and COUNTERS

### Rockets Page (`/rockets`)

**FixedHeader** (matching existing pattern):
- Title: "Team Rocket"
- Subtitle: "Counter teams for every Grunt, Leader, and Giovanni."

**Three collapsible sections** (using existing `CollapsibleSection` pattern):

#### Section 1: GRUNTS

Organized by type. Each grunt type is a card:

```
┌─────────────────────────────────────────┐
│ ⚡ Electric                              │
│ "Get ready to be Pokemon"               │
│                                         │
│ THEY USE:                               │
│ Slot 1: Voltorb, Magnemite              │
│ Slot 2: Electrode, Magneton, Jolteon    │
│ Slot 3: Electivire, Ampharos            │
│                                         │
│ COUNTERS:                               │
│ Garchomp · Mud Shot | Earth Power, Outrage │
│ Rhyperior · Mud-Slap | Earthquake, Rock Wrecker │
│ Excadrill · Mud-Slap | Drill Run, Rock Slide │
│                                         │
│ [📋 Copy Counter Team]  [📋 Copy Type]  │
└─────────────────────────────────────────┘
```

**Two copy buttons per grunt card:**
- **"Copy Counter Team"** — copies specific Pokemon names: `garchomp,rhyperior,excadrill`
- **"Copy Type"** — copies broader type search: `@1ground` (for users who don't have the exact Pokemon)

Grunt cards are collapsed by default. Tapping the header row expands. This keeps the page scannable since there are ~15 grunt types.

#### Section 2: LEADERS

Three cards, one per leader. Each is expanded by default (users come here for a specific leader). Same card layout as grunts but with a key difference: **leaders have variable lineups** — slot 2 and slot 3 have multiple possibilities.

```
┌─────────────────────────────────────────┐
│ Sierra                                   │
│                                         │
│ THEY USE:                               │
│ Slot 1: Sableye (always)                │
│ Slot 2: Honchkrow / Gardevoir / Flygon  │
│ Slot 3: Houndoom / Alakazam / Shiftry   │
│                                         │
│ BEST ALL-AROUND TEAM:                   │
│ Tyranitar · Smack Down | Crunch, Stone Edge │
│ Togekiss · Charm | Ancient Power, Flamethrower │
│ Machamp · Counter | Cross Chop, Rock Slide │
│                                         │
│ [📋 Copy Counter Team]                  │
│                                         │
│ Don't have these?                       │
│ [📋 Copy Dark + Fairy + Fighting types] │
└─────────────────────────────────────────┘
```

**Leader counters are "best all-around"** — a team that handles the most common slot 2/3 combos. Not perfectly optimized for every permutation, but reliably good.

**"Don't have these?"** — fallback button with type-based search string. Broader net for users without the specific top picks.

#### Section 3: GIOVANNI

Same as leader card but with emphasis. Giovanni always has Persian slot 1 and a rotating legendary slot 3.

```
┌─────────────────────────────────────────┐
│ Giovanni                                 │
│ Current legendary: Shadow Entei          │
│                                         │
│ THEY USE:                               │
│ Slot 1: Persian (always)                │
│ Slot 2: Nidoking / Garchomp / Rhyperior │
│ Slot 3: Shadow Entei (current)          │
│                                         │
│ BEST ALL-AROUND TEAM:                   │
│ Machamp · Counter | Cross Chop, Rock Slide │
│ Swampert · Water Gun | Hydro Cannon, Earthquake │
│ Kyogre · Waterfall | Surf, Thunder      │
│                                         │
│ [📋 Copy Counter Team]                  │
│                                         │
│ Don't have these?                       │
│ [📋 Copy Fighting + Water + Water types]│
└─────────────────────────────────────────┘
```

### Home Page Section

New collapsible section between RAIDS and COUNTERS:

```
LIVE: TEAM ROCKET ▾

  Sierra →    Cliff →    Arlo →    Giovanni →
```

Four tappable pills linking to `/rockets` (with anchor or scroll behavior). Matches the existing raid boss pill styling. Only shows Leaders + Giovanni — grunts are too many for the home page.

---

## Data Model

### `src/data/rocket-lineups.json`

```typescript
{
  lastUpdated: string;          // "2026-04-12"
  grunts: RocketEncounter[];
  leaders: RocketEncounter[];
  giovanni: RocketEncounter;    // single object, not array
}

type RocketEncounter = {
  id: string;                   // "electric", "sierra", "giovanni"
  name: string;                 // "Electric Grunt", "Sierra", "Giovanni"
  type?: string;                // grunt type (e.g. "Electric") — grunts only
  taunt?: string;               // grunt taunt phrase — grunts only
  subtitle?: string;            // "Current legendary: Shadow Entei" — Giovanni only
  slots: string[][];            // [[slot1 options], [slot2 options], [slot3 options]]
  counters: CounterTeam;
};

type CounterTeam = {
  pokemon: CounterPick[];       // exactly 3
  searchString: string;         // "garchomp,rhyperior,excadrill"
  fallbackString: string;       // "@1ground"
};

type CounterPick = {
  id: string;                   // pokemon.json ID
  name: string;                 // display name
  fastMove: string;
  chargedMoves: string[];       // 1-2 moves
  why?: string;                 // optional 1-liner: "Resists Electric, double Ground damage"
};
```

### Data Freshness

- **`lastUpdated`** field at root — displayed on page as "Lineups as of Apr 12"
- **Grunt lineups**: change every few months. Low maintenance.
- **Leader lineups**: rotate every 1-2 months with new research quests. Medium maintenance.
- **Giovanni legendary**: changes per Team Rocket event. Medium maintenance.
- **Update process**: same as raids/leagues — manual JSON edit + version bump. The existing `scripts/update-data.ts` validation script will be extended to cover this file.

---

## New Files

| File | Purpose |
|------|---------|
| `src/data/rocket-lineups.json` | All Rocket encounter data |
| `src/app/rockets/page.tsx` | Rockets page (route) |
| `src/components/rocket/rocket-encounter-card.tsx` | Reusable card for grunt/leader/Giovanni |
| `src/components/home/home-rocket-section.tsx` | Home page Leader pills |
| `src/components/copy-icon-button.tsx` | Extracted from teams/page.tsx for reuse |

## Modified Files

| File | Change |
|------|--------|
| `src/components/bottom-nav.tsx` | Add 4th nav item "Rockets" |
| `src/app/teams/page.tsx` | Import CopyIconButton from shared component |
| `src/components/home/home-client.tsx` | Add TEAM ROCKET section between RAIDS and COUNTERS |
| `src/lib/constants.ts` | Add `APP_VERSION = "1.2.0"` |
| `VERSION` | `1.2.0` |
| `CHANGELOG.md` | New entry |

## Reused Components

- `FixedHeader` — page header
- `CollapsibleSection` — section headers with expand/collapse
- `CopyButton` or `CopyIconButton` pattern — copy search strings
- `TypeBadge` — type indicators on grunt cards
- Existing type color mapping from `constants.ts`

---

## Scope Boundaries

### In scope
- Static counter recommendations (curated, not computed)
- Copy buttons per encounter (specific team + broad type fallback)
- Home page section with leader quick links
- 4th nav tab

### Out of scope (lighter than Team Builder)
- No pool / scanning / advisor flow
- No team rating or coverage scoring
- No screenshot upload
- No localStorage persistence (no team to save — counters are read-only reference)
- No league tabs (Rocket battles aren't league-gated)
- No per-slot counter optimization (one "best all-around" team per encounter)

### Future considerations (not building now)
- "I beat this one" tracking / checklist for research quests
- Automatic lineup detection from Niantic announcements
- Per-slot counter switching ("I'm seeing Gardevoir in slot 2, show me better counters for that")

---

## Resolved Decisions (from product + engineering review)

1. **Nav: Option A (4th tab)** — separate Rockets tab + home page section. Nav uses `flex-1` so 4 items fit; verify at 320px width during build.
2. **Extract `CopyIconButton`** — currently inline in `teams/page.tsx`. Refactor to `src/components/copy-icon-button.tsx` before Rockets reuses it.
3. **Grunt card accordion** — use a lightweight local `useState` toggle per card (not `CollapsibleSection` which has localStorage persistence). Simple `details/summary` or button+conditional render.
4. **Home pills: no anchor links** — pills link to `/rockets` page directly. No hash-based scrolling (avoids App Router complexity).
5. **Data model: drop `fallbackTypes`** — `CounterTeam.fallbackString` is the single source of truth for fallback search strings.
6. **Version drift** — fix home footer hardcoded `v1.0.5` to use `APP_VERSION` from constants during this build.
7. **Shadow Pokemon** — out of scope. No shadow catch info on cards (adds noise, can revisit post-launch).

## Open Questions

1. **Data accuracy**: Current Rocket lineups sourced from LeekDuck + GO Hub. Claude populates the initial JSON.
2. **Grunt count**: ~14 grunt types. Collapsed cards keep it manageable. Verify scroll on small screens during build.
