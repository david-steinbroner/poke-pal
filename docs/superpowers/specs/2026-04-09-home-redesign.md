# Home Page Redesign Spec

Last updated: 2026-04-09
Figma: Screen Layouts file, "Home - 2" prototype

---

## Header & Onboarding

**Title:** "Poke Pal"
**Subtitle:** "Know what to play. Copy the search string. Go win."

That's the entire onboarding. One line that explains the product, the mechanic, and the outcome. No "your battle assistant" — too vague. No instructions on how to use the app. The subtitle IS the instruction.

Alternative subtitles to test:
- "The right team. The right string. Go win."
- "Search strings for every battle."
- "Your GO Battle League cheat sheet."

---

## Page Structure

Three sections, all open by default. Sections are collapsible by tapping the section label (no chevron on sections — label itself is the tap target). State saved in localStorage.

### Section 1: LIVE: GO BATTLE LEAGUES

All active leagues shown, each expanded by default. Each league card has:
- **League name** — tappable to toggle expand/collapse. Chevron (↓ expanded, → collapsed) on right side.
- **"Top performing metas:"** label
- **Pokemon pills** — top meta picks, 3 per row, tappable (→ counter page). "See more →" at end.
- **"Copy Full Meta Search String"** button — full width, dark, prominent. The hero action.

When a league is collapsed: just the league name row with → chevron. No picks, no copy button.

When the LIVE: GO BATTLE LEAGUES section is collapsed: the entire block hides (all leagues, all content). Just the "LIVE: GO BATTLE LEAGUES" label visible. When reopened, all leagues restore to their previous expand/collapse state.

**State persistence:** Both section-level and individual league-level collapse state saved to localStorage.

### Section 2: LIVE: RAIDS

Section label: "LIVE: RAIDS"

Content: Pokemon pills in a wrap layout — current raid bosses. Each pill tappable → counter page (where the copy button lives). No inline copy button, no expansion. Just pills.

When collapsed: label only, pills hidden.

### Section 3: SEARCH: COUNTERS

Section label: "SEARCH: COUNTERS"

Content:
- Search input with placeholder: "Who are you fighting?"
- Quick pick pills below — popular/common countered Pokemon (NOT raid bosses — different from raids section above)

When collapsed: label only, search input hidden.

---

## Collapse Behavior

| Element | Tap target | Chevron? | Saves state? |
|---------|-----------|----------|-------------|
| Section (LIVE: LEAGUES) | Section label text | No | Yes, localStorage |
| Section (LIVE: RAIDS) | Section label text | No | Yes, localStorage |
| Section (SEARCH: COUNTERS) | Section label text | No | Yes, localStorage |
| Individual league card | League name row | Yes (↓/→) | Yes, localStorage |

**First visit:** Everything open, all leagues expanded.
**Return visit:** Restored from localStorage.

---

## Navigation

Bottom nav stays: **Home** | **Leagues** | **Teams**

No Raid tab. No hamburger menu. Three tabs.

---

## What's Removed from Current Home

- Generic instructional copy ("Search a Pokemon or select from Current Raids...")
- "MY BATTLE LEAGUE TEAMS" section (lives on Teams tab)
- Mid-page connector text
- Anything that makes home feel like a table of contents

---

## Data Requirements

- `getActiveLeagues()` — already exists, build-time
- `getUpcomingLeagues()` — already exists, not needed on home
- `current-raids.json` — already exists
- `pokemon.json` — needed for pills, but should use slim search index instead
- **New: GBL schedule automation** — needed to prevent stale "LIVE" data. Separate task.

---

## Open Questions

- Subtitle copy — test with real users
- Quick picks under counter search — what Pokemon? Most searched? Most common in meta?
- Should collapsed section labels change color/opacity to indicate collapsed state?
