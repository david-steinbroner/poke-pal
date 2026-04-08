# Team Builder — Product Spec

## What This Is

A screen where PvP players pick 3 Pokemon for a league team, see how well those 3 cover each other's weaknesses, identify what meta threats would wreck them, and copy a search string to find all 3 in-game.

This is Phase 2 of Poke Pal. Counter Search and League Meta are shipped. Team Builder builds on the same type effectiveness engine, search string generator, and Pokemon dataset.

## Jobs to Be Done

1. **"Do my 3 picks actually work together?"** — Player has a team idea and wants to validate that their coverage is solid before spending dust/candy.
2. **"What types destroy my team?"** — Player wants to see shared weaknesses so they know what leads to avoid in GBL.
3. **"Who should my third be?"** — Player has 2 picks locked and needs the third to patch holes.
4. **"Let me find my team in-game fast"** — Player wants to copy one search string that shows all 3 Pokemon in their GO storage.

## User Stories

- As a PvP player, I want to select 3 Pokemon for a specific league so I can evaluate them as a team.
- As a PvP player, I want to see which types my team covers well so I know what matchups I win.
- As a PvP player, I want to see which types my team is weak to so I know what to watch out for on the lead.
- As a PvP player, I want suggestions for alternatives when my team has a gap so I can fix it without starting over.
- As a PvP player, I want to copy a search string for my full team so I can find and star all 3 in Pokemon GO.
- As a PvP player, I want to pick from the current league's meta Pokemon so I'm not guessing from the full dex.

## UX Flow

### Entry Point

New tab in the header: **Battle | Leagues | Teams**. Teams is a peer of Leagues, secondary to Battle. Tapping "Teams" opens the Team Builder screen.

Also accessible from league meta pages via a "Build a Team" CTA button below the meta search string.

### Screen 1: League Select + Team Slots

Single-column mobile layout. Top to bottom:

**League Picker** — Horizontal pill selector showing active leagues (Great League, Ultra League, Master League, plus any active cup). Defaults to the first active open league. Selecting a league:
- Filters the Pokemon picker to that league's CP cap
- Scopes meta suggestions to that league's meta list
- Sets the CP filter on the team search string

**Team Slots (3)** — Three numbered card slots stacked vertically:
- Empty state: outlined dashed card, "Tap to add" with a + icon. 
- Filled state: Pokemon name, type badges, recommended moveset. X button to remove.
- Tapping an empty slot or the + opens the Pokemon picker (Screen 2).
- Tapping a filled slot opens the picker pre-filtered, allowing swap.

**Copy Bar** — Anchored below the team slots. Disabled/dimmed until at least 1 Pokemon is selected. Shows the team search string (names joined with commas, plus CP cap). Same component as counter page — tap to copy, toast confirmation.

Format: `medicham,stunfisk-galarian,bastiodon&cp-1500`

For Pokemon with hyphens in their GO search name (Galarian Stunfisk = `stunfisk`), use the GO-compatible name. The search string generator needs a `goSearchName` field or a name-to-search-name mapping.

**Coverage Analysis** — Appears below the copy bar once 2+ Pokemon are selected. Details in Screen 3 below.

### Screen 2: Pokemon Picker (Bottom Sheet)

Opens as a slide-up bottom sheet (half-screen, drag to expand to full). Not a new page — maintains team state.

**Search input** at top of sheet — same autocomplete component as the counter search, filtered to the current league's CP cap eligibility.

**Quick picks section** — "Meta Picks" showing the current league's meta Pokemon as tappable chips, ordered by tier (S first). Only shows Pokemon not already on the team.

**Full list below** — All 119 Pokemon in the dataset, alphabetical, filterable by the search input. Each row: name + type badges. Tapping selects it into the open slot and closes the sheet.

If the league has type restrictions (e.g., Fantasy Cup = Dragon/Steel/Fairy only), the picker only shows eligible Pokemon and displays a subtle label: "Dragon, Steel, and Fairy types only."

### Screen 3: Coverage Analysis

Renders below the team copy bar. Visible once 2+ Pokemon are on the team. Updates live as Pokemon are added/removed.

**Section: "Your team handles"** — Grid of type badges showing types the team covers offensively. A type is "covered" if at least one team member has a super-effective STAB move against it (fast or charged move type that is SE against the target type AND matches one of the user's Pokemon types for STAB). Display as green-tinted type badges. Sorted by coverage strength (how many team members cover it).

**Section: "Watch out for"** — Grid of type badges showing types that hit 2+ team members super effectively. These are shared weaknesses. Display as red-tinted type badges. Each badge shows a count: "2/3" or "3/3" indicating how many team members are weak to it.

**Section: "Suggestions"** — Only appears if there are gaps (uncovered types) or shared weaknesses. Shows 1-3 Pokemon from the league meta that would improve coverage. Each suggestion card:
- Pokemon name + type badges
- One-line reason: "Covers [Ice, Ground] — your team's biggest gap"
- "Swap for Slot 3" button (or whichever slot is empty / weakest)

Suggestion logic: for each uncovered type or shared weakness, find meta Pokemon (not already on the team) whose STAB moves cover those gaps. Rank by how many gaps they fill. Show top 3.

If coverage is solid (all 18 types addressed, no type hits 2+ members SE), show: "Solid coverage. No major gaps."

### Screen 4: Team Detail (Deferred — not MVP of Team Builder)

Shareable URL at `/league/[league-slug]/team/[mon1]-[mon2]-[mon3]`. Static generation for popular team combos, dynamic for the rest. Deferred to Team Builder v2.

## Data Requirements

### What We Have (no new data needed)

- **119 Pokemon** with types, moves, base stats (`src/data/pokemon.json`)
- **18x18 type effectiveness matrix** with GO multipliers (`src/lib/type-effectiveness.ts`)
- **`getEffectiveness(attackType, defenderTypes)`** — returns multiplier for any attack vs defender
- **`getSuperEffectiveTypes(defenderTypes)`** — returns types that are SE against a Pokemon
- **Search string generator** — `buildTypeSearchString`, `buildNameSearchString`, `buildLeagueEligibleString`
- **League meta data** — per-league meta Pokemon with tiers and movesets
- **League CP caps** — 1500, 2500, unlimited

### What We Need to Build

**`getTeamCoverage(pokemonIds: string[])`** — New function in a `src/lib/team-analysis.ts` module. Takes 2-3 Pokemon IDs, returns:

```typescript
type TeamAnalysis = {
  // Types the team can hit super effectively (via STAB moves)
  coveredTypes: { type: PokemonType; coveredBy: string[] }[];
  // Types that are NOT covered by any team member's SE STAB moves
  uncoveredTypes: PokemonType[];
  // Types that hit 2+ team members super effectively
  sharedWeaknesses: { type: PokemonType; weakMembers: string[]; count: number }[];
  // Types that hit only 1 team member SE (informational, not alarming)
  singleWeaknesses: { type: PokemonType; weakMember: string }[];
  // Pokemon from meta that would best fill gaps
  suggestions: TeamSuggestion[];
  // Combined team search string
  searchString: string;
};

type TeamSuggestion = {
  pokemonId: string;
  reason: string;        // "Covers Ice, Ground"
  gapsFilled: number;    // for ranking
  swapSlot?: number;     // which slot benefits most from this swap
};
```

**`goSearchName` mapping** — Some Pokemon have different names in GO search vs our IDs. Examples:
- `stunfisk-galarian` in our data = `stunfisk` in GO search (GO uses the base name and the Galarian form is the common one in GL)
- `giratina-altered` = `giratina` in GO search

For MVP: use the Pokemon `name` field lowercased as the search term. If this produces bad results for specific cases, add a `goSearchName` override field to `pokemon.json` entries that need it. Don't over-engineer this — test the top 20 meta picks in GO and fix mismatches.

**Team state management** — Client-side only. `useState` in the Team Builder page component. No persistence for MVP (no localStorage, no URL state). Users rebuild teams each session.

### What We Explicitly Do NOT Need

- No server-side API. All computation runs client-side from the static JSON data.
- No team sharing URLs for MVP (reserved route exists at `/league/[league-slug]/team/[mon1]-[mon2]-[mon3]`).
- No team persistence/save slots.
- No matchup simulation (win/loss prediction against specific opponents).
- No ELO or ranking data.
- No move customization (uses recommended movesets from meta data or best STAB from pokemon.json).

## Coverage Analysis Logic — Detailed

### Offensive Coverage ("Your team handles")

For each of the 18 types, check if any team member can hit it super effectively with STAB:

```
For each targetType in all 18 types:
  For each teamMember:
    memberMoveTypes = unique types from fastMoves + chargedMoves
    For each moveType in memberMoveTypes:
      if getEffectiveness(moveType, [targetType]) > 1.0:
        if moveType is in teamMember.types (STAB):
          mark targetType as "covered" by this member
        else:
          mark targetType as "soft covered" (non-STAB, weaker)
```

Display "covered" types prominently. "Soft covered" types shown with a dimmer treatment — they're addressed but not strongly.

### Defensive Weaknesses ("Watch out for")

For each of the 18 types, check how many team members it hits super effectively:

```
For each attackType in all 18 types:
  weakCount = 0
  For each teamMember:
    if getEffectiveness(attackType, teamMember.types) > 1.0:
      weakCount++
  if weakCount >= 2: shared weakness (red, show count)
  if weakCount == 1: single weakness (neutral, informational)
```

### Suggestion Engine

```
1. Collect all uncoveredTypes + types from sharedWeaknesses
2. These are "gaps"
3. For each Pokemon in the current league's meta (not on team):
   a. Count how many gaps this Pokemon's STAB moves cover offensively
   b. Count how many sharedWeaknesses this Pokemon resists defensively
   c. Score = offensive_fills + defensive_fills
4. Sort by score descending
5. Return top 3
6. For each suggestion, set swapSlot to the team member who contributes
   least to coverage (or the empty slot if team has < 3)
```

## Edge Cases

| Case | Behavior |
|------|----------|
| 0 Pokemon selected | Copy bar disabled. Coverage section hidden. Show empty slots with instructional text. |
| 1 Pokemon selected | Copy bar active (single name + CP cap). Coverage section hidden — need 2+ for team analysis. |
| 2 Pokemon selected | Full coverage analysis shown. Third slot shows "Add a third to complete your team." Suggestions section recommends third picks. |
| 3 Pokemon selected | Full coverage analysis. Suggestions only appear if gaps exist. |
| Same Pokemon selected twice | Prevent it. Picker excludes Pokemon already on the team. |
| Pokemon not in dataset | Only Pokemon from `pokemon.json` are selectable. No free-text entry. |
| League with type restrictions | Picker filters to eligible types only. Label shows restrictions. If user switches leagues after picking, clear team and show toast: "Team cleared — [new league] has different rules." |
| League switch without type restriction change | Keep team if all members are under the new CP cap. Clear if any exceed it, with toast explaining why. |
| No active leagues | Show all leagues as options (shouldn't happen in practice). |
| All 18 types covered, no shared weaknesses | "Solid coverage. No major gaps." No suggestions section. |
| Team is 3 Pokemon of same type | Shared weaknesses section will be full of red. Suggestions will strongly recommend diversity. Working as intended. |
| Dataset has no good suggestions for a gap | Show "No strong options in the current meta for [type]. Check the full counter list." with link to counter search for that type. |

## MVP vs Deferred

### MVP (Team Builder v1)

- League picker (pill selector, active leagues)
- 3 team slots with add/remove/swap
- Pokemon picker bottom sheet with search + meta quick picks
- Copy bar with team search string
- Offensive coverage grid (types your team handles)
- Defensive weakness grid (shared weaknesses)
- Suggestion engine (fill gaps from meta)
- Type restriction filtering for cups
- Client-side state only

### Deferred (Team Builder v2)

- **Shareable team URLs** (`/league/great-league/team/medicham-stunfisk_galarian-bastiodon`) — the growth lever. Players share teams in Discord/Reddit constantly. This is the #1 post-MVP priority.
- **URL-based team state** — encode team in query params so refreshing doesn't lose it. Stepping stone to shareable URLs.
- **Team persistence** — save teams to localStorage. "My Teams" section.
- **Multiple saved teams** — save/name/compare teams.
- **Lead/closer/safe switch roles** — assign roles to each slot. Changes suggestion logic.
- **Meta threat matchups** — "Your team vs the meta" table showing win/loss predictions against top 10 meta picks.
- **AI strategy narrative** — Claude API generates a paragraph explaining how to play the team (lead X, swap to Y if you see Z, closer is W).
- **Static generation for popular teams** — pre-render top 50 team combos per league for SEO.
- **Collection-aware suggestions** — "From your Pokemon" section that only suggests mons the user actually has (requires collection import from Phase 2).

## Integration with Existing Features

### Counter Search Integration

From a counter result page (`/counter/giratina`), add a CTA: "Add to Team" button on each counter card. Tapping it:
1. Navigates to Team Builder
2. Pre-fills the league (inferred from context, or asks)
3. Adds the counter Pokemon to the first empty slot

This is a v2 integration. For MVP, Team Builder is standalone.

### League Meta Integration

From a league meta page (`/league/great-league`), add:
- "Build a Team" button below the meta search string copy bar
- Tapping it navigates to Team Builder with that league pre-selected

The Pokemon picker's "Meta Picks" section pulls directly from the league's `meta` array, reusing the same data.

### Search String Generator

Team search string uses `buildNameSearchString` from `src/lib/search-string.ts`:
```
buildNameSearchString(["medicham", "stunfisk-galarian", "bastiodon"])
→ "medicham,stunfisk-galarian,bastiodon"
```

Combined with CP cap:
```
`${buildNameSearchString(teamNames)}&${buildLeagueEligibleString(cpCap)}`
→ "medicham,stunfisk-galarian,bastiodon&cp-1500"
```

For Master League (no CP cap), omit the CP filter.

## Route

```
/teams              → Team Builder page (client-side, not statically generated)
```

No static generation needed — this is an interactive tool, not a content page. SEO value comes from shareable team URLs in v2.

## New Files

```
src/app/teams/page.tsx              — Team Builder page
src/lib/team-analysis.ts            — getTeamCoverage(), suggestion engine
src/components/team-slot.tsx         — Empty/filled team slot card
src/components/pokemon-picker.tsx    — Bottom sheet Pokemon selector
src/components/coverage-grid.tsx     — Type coverage visualization
src/components/league-picker.tsx     — Horizontal pill league selector
src/components/team-suggestion.tsx   — Suggestion card with swap CTA
__tests__/team-analysis.test.ts     — Coverage + suggestion engine tests
```

## Verification

### Functional

- Select Great League, add Medicham + G-Stunfisk + Bastiodon. Verify:
  - Coverage grid shows Fighting, Ground, Rock, Steel as covered
  - Shared weaknesses shows Ground (hits G-Stunfisk + Bastiodon) and Fighting (hits Bastiodon + Registeel... wait, Registeel isn't on the team). Verify the actual weaknesses match the type chart.
  - Search string: `medicham,stunfisk-galarian,bastiodon&cp-1500`
  - Copy works on iOS Safari over HTTP (same fallback as counter page)

- Select 2 Pokemon with overlapping weakness (e.g., two Steel types). Verify shared weakness section shows the overlap prominently.

- Switch from Great League to Ultra League mid-build. Verify team clears if CP is violated, or persists if compatible.

- Fantasy Cup picker only shows Dragon/Steel/Fairy types.

- Try to add the same Pokemon twice. Verify it's blocked.

### Search String Accuracy

Paste these team search strings into Pokemon GO and verify they return the correct Pokemon:
- `medicham,azumarill,registeel&cp-1500`
- `giratina,cresselia,registeel&cp-2500`
- `dialga,mewtwo,groudon`

### Coverage Engine

- Team of 3 Water types should show shared Electric and Grass weaknesses.
- Team of Medicham (Fighting/Psychic) + Sableye (Dark/Ghost) + Registeel (Steel) — classic GL core. Should show solid coverage with minimal shared weaknesses.

### Performance

- Adding/removing Pokemon should update coverage analysis instantly (no perceptible delay). All computation is in-memory against 119 Pokemon.
- Bottom sheet picker should open in <100ms.
