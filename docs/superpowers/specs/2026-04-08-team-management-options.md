# Team Management: Design Options

**Date:** 2026-04-08
**Status:** Awaiting founder decision

---

## Current State

- Header row: "Team Builder" title + "Clear" pill button (right-aligned)
- Below header: league name line (e.g. "Great League") with rating badge, OR "Add Cup:" with league pills when no cup is set
- Storage: `poke-pal:team:{leagueId}` keys in localStorage, one array of pokemon IDs per league
- `getAllSavedTeams()` already exists in `team-storage.ts` -- iterates localStorage and returns all non-empty teams
- 4 leagues: Great, Ultra, Master, Fantasy Cup
- `handleLeagueChange` currently wipes the team when switching between set cups

## Core Requirement

One team per league. Navigate between them. Warn before replacing. All on the Teams page.

---

## Option A: "Saved" Dropdown Menu

Replace the "Clear" pill with a "Saved" pill in the same position (top-right of header). Tapping it opens a dropdown overlay.

### Layout (375px)

```
[ Team Builder            [Saved v] ]
  Great League  ★★★
```

Dropdown when open:

```
+-----------------------------+
| Great League   Swampert...  |  <- current, highlighted
| Ultra League   (empty)      |
| Master League  Dialga...    |
| Fantasy Cup    (empty)      |
+-----------------------------+
| Clear Team                  |
+-----------------------------+
```

### Interaction Flow

1. **Load saved team:** Tap "Saved" -> tap a league row with a team -> team loads, dropdown closes.
2. **See availability:** Empty leagues show "(empty)" in muted text. Not tappable as a load action -- instead, tapping an empty league sets the current builder to that league with a blank team.
3. **One team per league enforced:** When you save (auto-save on change, already implemented), it writes to `poke-pal:team:{currentLeague}`. Only one key per league can exist.
4. **Unsaved changes on switch:** Current team is auto-saved before switching (already happens in `handleLeagueChange`). No warning needed because saves are automatic.
5. **Replace existing team warning:** If you're on a blank builder, pick "Ultra League" from the dropdown, and Ultra already has a saved team -- show a confirmation: "Ultra League already has a team (Swampert, Registeel, Trevenant). Replace it?" with Cancel / Replace buttons.
6. **Move team to different league:** Not a direct action. User would: load their Great League team, clear Great League, then set the cup to Ultra League. Could add a "Move to..." sub-action later, but not in v1.
7. **Clear button:** Moves inside the dropdown as a bottom row. "Clear Team" removes the current league's saved team.

### Pros
- Minimal footprint -- one small pill replaces the existing Clear pill
- Familiar dropdown pattern, low learning curve
- Works well on 375px because the dropdown is a full-width overlay
- Leaves the header clean

### Cons
- Teams are hidden behind a tap -- user can't see at a glance which leagues have teams
- Moving a team between leagues requires multiple steps
- Dropdown menus on mobile can feel fiddly if the touch target is small

---

## Option B: League Tabs / Chips Below Header

Horizontal row of pills below the header, one per league. Filled = has saved team. Outlined = empty. Active = currently selected.

### Layout (375px)

```
[ Team Builder                     ]
[ *Great*  Ultra  Master  Fantasy  ]
  Great League  ★★★
```

Pill states:
- **Active + has team:** Solid background (e.g. `bg-foreground text-background`) -- currently viewing this team
- **Inactive + has team:** Filled dot or subtle background -- tappable to load
- **Inactive + empty:** Outlined/ghost -- tappable to start a new team in that league
- **Active + empty:** Solid background but no team loaded -- user is building for this league

### Interaction Flow

1. **Load saved team:** Tap an inactive pill that has a team -> auto-saves current team, loads the tapped league's team, pill becomes active.
2. **See availability:** All four leagues always visible. Visual weight tells you which have teams. Glanceable.
3. **One team per league enforced:** Same storage model. One pill = one league = one localStorage key.
4. **Unsaved changes on switch:** Auto-save before switching. Already implemented.
5. **Replace existing team warning:** If you manually type in 3 new Pokemon while viewing Great League, the old team is already being replaced in real time (auto-save on every change). No separate warning needed -- the user is editing in place. The warning is only needed for the "move team to league" case.
6. **Move team to different league:** Long-press or add a small "..." menu on the active pill. Menu shows "Move to Ultra League" / "Move to Master League" etc., only listing leagues that are empty. If the target league has a team, show the replace warning.
7. **Clear button:** Replaced by the pill row. To clear, user can tap the active pill to get a small popover: "Clear this team?" or add a trash icon next to the active league name line.

### Pros
- All leagues visible at once -- user immediately sees which have teams
- Single tap to switch, very fast
- Familiar tab pattern (like browser tabs or segment controls)
- Natural home for the "current league" indicator (replaces the "Add Cup" pills)
- Replaces both the "Add Cup" row AND the Clear button -- cleaner

### Cons
- Takes up a horizontal row of space (~36px height)
- 4 pills on 375px = tight. "Fantasy" is 7 chars. Needs short names (Great / Ultra / Master / Fantasy) -- already defined in `LEAGUE_SHORT_NAMES`
- If more leagues are added later, horizontal scrolling or wrapping needed

---

## Option C: Inline Team Switcher

The league name line (currently "Great League") becomes a tappable element. Tapping it reveals a dropdown/sheet showing all leagues with inline team previews.

### Layout (375px)

```
[ Team Builder                     ]
  Great League v  ★★★
```

Tapping "Great League v" opens:

```
+---------------------------------+
| GREAT LEAGUE                    |
|   Swampert / Registeel / Trev.  |  <- current, highlighted
|                                 |
| ULTRA LEAGUE                    |
|   Giratina / Cresselia / Regi.  |
|                                 |
| MASTER LEAGUE                   |
|   (no team saved)               |
|                                 |
| FANTASY CUP                     |
|   (no team saved)               |
+---------------------------------+
```

### Interaction Flow

1. **Load saved team:** Tap league name -> tap a league from the list -> loads that team, closes the sheet.
2. **See availability:** The expanded list shows mini previews (pokemon names or sprites) for leagues with teams, and "(no team saved)" for empty leagues.
3. **One team per league enforced:** Same storage model.
4. **Unsaved changes on switch:** Auto-save before switching.
5. **Replace existing team warning:** If switching to a league that already has a team, no warning -- you're just viewing/editing it. If you want to "start fresh" in a league that has a team, the sheet could have a small "x" or "clear" on each league row.
6. **Move team to different league:** The sheet could support drag-to-reorder or a "Move to..." action, but this adds complexity. v1: not supported directly.
7. **Clear button:** Each league row in the sheet gets a small clear/trash icon. Or keep a "Clear" action at the bottom of the sheet for the active league.

### Pros
- Rich preview -- user sees team composition for each league before switching
- No extra UI elements on the main screen (the league name was already there)
- Scales to more leagues since it's a scrollable list

### Cons
- Hides team overview behind a tap, like Option A
- The sheet/dropdown is more complex to build (pokemon name previews, layout)
- The "v" chevron on the league name is a subtle affordance -- users might not discover it
- On 375px, the sheet needs to be a bottom sheet or full-width dropdown to show previews legibly

---

## Quick Fixes (apply regardless of option chosen)

### 1. "Add Cup" -> "Select League"

Current copy "Add Cup:" is unclear. Change to "Select League:" since we're selecting which league to build a team for.

**File:** `src/app/teams/page.tsx`, line 226
**Change:** `"Add Cup:"` -> `"Select League:"`

Note: If Option B is chosen, this row is replaced entirely by the pill tabs and this copy change is moot.

### 2. Padding between "Team Builder" and the line below

Currently the header `div` has no bottom spacing. The league name / "Add Cup" row sits tight against the title.

**File:** `src/app/teams/page.tsx`, line 207
**Change:** Add `mb-1` or `gap-1` to the outer wrapper, or add `mt-1` to the cup name / pill row. A `1` unit (4px) gap is enough to breathe without wasting space on mobile.

---

## Recommendation: Option B (League Tabs / Chips)

Option B is the strongest choice for three reasons:

**1. Glanceability.** The core workflow is "I have teams in Great and Ultra, I want to switch between them." Tabs make both teams visible and one tap away. Options A and C hide this behind a dropdown.

**2. Replaces two UI elements with one.** The tab row replaces both the "Add Cup" pills (for new users with no cup set) and the Clear button. When no cup is set, all pills are outlined/empty -- tapping one selects it. This is the same interaction as the current "Add Cup" pills but persists after selection, so users can switch later.

**3. Fits the 375px constraint.** With `LEAGUE_SHORT_NAMES` already defined (Great / Ultra / Master / Fantasy), four pills fit comfortably in a row. The pills are the same component pattern already used for "Add Cup" -- just promoted to a persistent element.

The main trade-off is vertical space (~36px), but it replaces the "Add Cup" row (which was the same height) and the Clear button, so the net space impact is zero or positive.

### Implementation notes for Option B

- Reuse `LEAGUE_SHORT_NAMES` for pill labels
- Call `getAllSavedTeams()` on mount to know which pills to fill
- Active pill: `bg-foreground text-background`
- Has-team pill: small dot indicator or `bg-muted` fill
- Empty pill: `border border-border text-muted-foreground`
- On pill tap: auto-save current, load target league's team (or set empty if no team)
- Clear action: small "x" icon appears on the active pill when it has a team, or move to a "..." menu
- The `cupSet` boolean can be removed -- there's always a selected league (default to Great League)
