# Cup Selector: Teams Page Redesign

**Date:** 2026-04-08
**Status:** Draft
**Scope:** `/src/app/teams/page.tsx`, `/src/components/team/league-picker.tsx`, constants

---

## 1. Teams Page Layout (Top to Bottom)

### Current

```
Team Builder    [S]  Clear
[Great] [Ultra] [Master] [Fantasy]   <-- LeaguePicker buttons
[Search input...]
[Copy Search String]  [Share]
[Slot 1] [Slot 2] [Slot 3]
[Coverage / Threats / Swaps]
```

### New

```
Team Builder    [S]  Clear
Fantasy Cup: Great League Edition     <-- cup name line (or "Add Cup" pills)
[Search input...]
[Copy Search String]  [Share]
[Slot 1] [Slot 2] [Slot 3]
[Coverage / Threats / Swaps]
```

The `<LeaguePicker>` component is removed from the page entirely. In its place, a single line appears directly below the header row showing either:
- The full cup name (when a league is set), or
- An "Add Cup" pill selector (when no league context exists)

### Header Row Detail

The header row stays the same: "Team Builder" title, team rating badge (when applicable), and Clear button (when team has pokemon). The cup name line sits between the header row and the search input.

---

## 2. Cup State Management

### State Source (unchanged)

```ts
const [league, setLeague] = useState<LeagueId>(initialLeague);
```

`initialLeague` is derived from URL param `?l=` or falls back to `"great-league"`.

### New: "No cup" sentinel

Add a new state to distinguish "user explicitly chose a league" from "page loaded with a default fallback":

```ts
const hasCupContext = searchParams.has("l");
const [cupSet, setCupSet] = useState<boolean>(hasCupContext || initialPokemon.length > 0);
```

- `cupSet = true`: URL had `?l=` param (came from league page or shared link) or team was loaded from URL. Show cup name.
- `cupSet = false`: User landed on `/teams` with no params and no stored team. Show "Add Cup" pills.

When a stored team is loaded from localStorage on mount (lines 53-66 of current code), `cupSet` should also be set to `true` since a stored team is always keyed to a league.

### handleLeagueChange (updated trigger)

The existing `handleLeagueChange` callback stays as-is. It:
1. Saves current team under current league
2. Clears all slots
3. Sets the new league

The only change: it also sets `setCupSet(true)` after the user picks a cup from the pills.

### handleClear (updated)

When the user clears the team, also reset cup state:
```ts
function handleClear() {
  setTeam([null, null, null]);
  clearTeam(league);
  setCupSet(false);  // <-- new: go back to "Add Cup" pills
}
```

---

## 3. "Add Cup" UI Behavior

### When `cupSet === false`

Render a row of inline pill buttons (not a dropdown, not a modal):

```
Add Cup:  [Great] [Ultra] [Master] [Fantasy]
```

- "Add Cup:" is static label text, `text-sm text-muted-foreground`
- Each pill uses `LEAGUE_SHORT_NAMES[id]` as label
- Pills are styled as tappable rounded chips: `rounded-full border px-3 py-1 text-sm`
- Tapping a pill calls `handleLeagueChange(id)` and `setCupSet(true)`

### When `cupSet === true`

Render the cup's full display name:

```
Fantasy Cup: Great League Edition
```

- Uses `LEAGUE_NAMES[league]` for the display text
- Styled as `text-sm text-muted-foreground` (not tappable, static text)
- Some leagues may need expanded display names (e.g., "Fantasy Cup: Great League Edition" vs just "Great League"). This mapping can live in constants or be computed from existing `LEAGUE_NAMES`.

### Cup name is NOT tappable

Once set, the cup name is static. To change cups, the user clears the team (Clear button), which resets to pills. This keeps the interaction simple and avoids accidental league switches that would wipe the team.

---

## 4. Cross-Page Team-Cup Binding

This is largely how things already work. Teams are stored in localStorage keyed by league ID (`poke-pal:team:{leagueId}`). The cup selector just makes this relationship visible on the Teams page.

### Flow: League Page -> Teams Page

1. User is on `/leagues/fantasy-cup` viewing the Fantasy Cup meta
2. User taps "Team Builder ->" arrow in the InlineTeamSection
3. Navigation goes to `/teams?l=fantasy-cup&p=...` (existing behavior)
4. Teams page reads `?l=fantasy-cup`, sets `league = "fantasy-cup"`, `cupSet = true`
5. Cup name line shows "Fantasy Cup"

### Flow: Teams Page -> Search Tab (Your Team section)

1. `HomeTeamPreview` already calls `getAllSavedTeams()` and displays teams grouped by league
2. No changes needed here. The team saved under `fantasy-cup` shows up labeled "Fantasy Cup" using `LEAGUE_NAMES`.

### Flow: Teams Page -> Leagues Tab -> Cup Page

1. User builds a team on Teams page under Fantasy Cup
2. Team is saved to `localStorage` as `poke-pal:team:fantasy-cup`
3. User navigates to `/leagues/fantasy-cup`
4. `LeaguePageClient` calls `loadTeam(leagueId)` on mount (line 49-50)
5. `InlineTeamSection` renders that team inline on the league page

No new work needed for cross-page binding. The existing localStorage keying handles it.

---

## 5. Tab Navigation Scenarios

### Scenario: User opens Teams tab directly (no URL params)

1. No `?l=` param, no `?p=` param
2. Check localStorage for any stored team under the default league (`great-league`)
3. If a stored team exists: load it, set `cupSet = true`, show "Great League" as cup name
4. If no stored team: `cupSet = false`, show "Add Cup" pills, team slots are empty

### Scenario: User navigates from League page

1. URL has `?l=fantasy-cup`
2. `cupSet = true` immediately
3. Load stored team for `fantasy-cup` from localStorage (if any)
4. Cup name line shows "Fantasy Cup"

### Scenario: User switches tabs away and back

1. Teams page state is in React state + URL params
2. Returning to Teams tab re-mounts the component
3. URL params are preserved in browser history, so league and team restore correctly
4. `cupSet` re-derives from `searchParams.has("l")`

### Scenario: User shares a team link

1. Share URL includes `?l=fantasy-cup&p=pokemon1,pokemon2,pokemon3`
2. Recipient opens link, `cupSet = true`, team and cup load from URL
3. Cup name shows "Fantasy Cup"

---

## 6. Edge Cases

### No cup set + user adds pokemon via search

If the user starts adding pokemon before selecting a cup:
- The team saves under the default `great-league` key
- Once they pick a cup via pills, `handleLeagueChange` saves current team under `great-league`, clears slots, and switches to the new league
- This means pokemon added before cup selection get saved to Great League, then lost from view when switching

**Decision:** Allow adding pokemon without a cup. The default fallback is `great-league`. If the user later picks a different cup via pills, the existing `handleLeagueChange` behavior (save + clear + switch) applies. This matches current behavior where switching leagues clears the team.

### Team cleared, then cup cleared

1. User taps Clear
2. Team slots empty, localStorage entry removed for that league
3. `cupSet` resets to `false`
4. "Add Cup" pills appear
5. User can pick a new cup and start fresh

### URL has `?l=` but no stored team

1. `cupSet = true` (URL had league param)
2. Team slots are empty
3. Cup name shows (e.g., "Ultra League")
4. User can add pokemon, they save under that league

### Invalid league ID in URL

1. `?l=invalid-league` doesn't match any `LEAGUE_IDS` entry
2. Fall back to `great-league` (current behavior via type coercion)
3. `cupSet = true` since `?l=` was present, but display shows "Great League"

---

## 7. Files Changed

| File | Change |
|------|--------|
| `src/app/teams/page.tsx` | Remove `<LeaguePicker>` import and usage. Add `cupSet` state. Add cup name line or "Add Cup" pills below header. Update `handleClear` to reset `cupSet`. |
| `src/components/team/league-picker.tsx` | No changes (can be deleted later if unused elsewhere, but leave for now). |
| `src/lib/constants.ts` | Optionally add `LEAGUE_DISPLAY_NAMES` for extended cup names if needed (e.g., "Fantasy Cup: Great League Edition"). |

---

## 8. Acceptance Criteria

- [ ] LeaguePicker buttons no longer render on Teams page
- [ ] Cup name line appears below "Team Builder" header when a league is set
- [ ] "Add Cup" pills appear when no league context exists (direct navigation, no stored team)
- [ ] Tapping a cup pill sets the league and shows the cup name
- [ ] Clear button resets team AND cup, returning to "Add Cup" pills
- [ ] Navigating from a league page pre-sets the cup (URL param `?l=`)
- [ ] Team saved on Teams page appears on the corresponding league page's InlineTeamSection
- [ ] Team saved on Teams page appears on the Search tab's HomeTeamPreview
- [ ] Sharing a team link preserves both cup and team members
- [ ] Cup name is not tappable (static text once set)
