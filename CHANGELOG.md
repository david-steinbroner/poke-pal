# Changelog

All notable changes to Poke Pal will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project uses [Semantic Versioning](https://semver.org/).

---

## [1.7.1] - 2026-04-14

### Added
- **Back button** on Counter and League detail pages — lucide `ArrowLeft` at `size-6` above the page title in `FixedHeader`; 44px tap target.

### Changed
- `BackButton` component uses lucide `ArrowLeft` instead of `←` text glyph.

## [1.7.0] - 2026-04-14

### Added
- **Teams page collapsibles converted to `CollapsibleSection`**: My Team, My Pokemon, Recommended Teams, and Meta Threats now get the same sticky-on-scroll + gradient-fade treatment as the rest of the app.

### Changed
- Counter page: `Top Counters` / `Budget Picks` subheaders bumped to `font-semibold` for consistency with Teams baseline.
- `home-league-card` padding unified to `p-3` (was `px-4 py-3`).

## [1.6.1] - 2026-04-14

### Changed
- Removed accent colors from all section headers (home, rockets, teams, leagues) — all now use `text-muted-foreground` for a single neutral look.
- `CollapsibleSection` no longer accepts `accentColor` prop.
- Leagues page sections (`LIVE NOW`, `COMING UP`) converted to `CollapsibleSection` — inherit sticky behavior + gradient fade.

## [1.6.0] - 2026-04-14

### Changed
- **Design system unification pass**: section headers across home, rockets, and teams aligned to a single pattern — `text-sm font-medium uppercase tracking-wide`, accent color on label (later removed in 1.6.1), chevron on right.
- `CollapsibleSection`: removed `prefix` prop (no more `LIVE:` / `SEARCH:` prefix words).
- Page-level `space-y-*` normalized to `space-y-5` across counter, league detail, and leagues list.

## [1.5.6] - 2026-04-14

### Changed
- Raid chips on home sorted: non-shadow 5★ → 3★ → 1★ → Mega → Dynamax → all shadows (by tier desc).

## [1.5.5] - 2026-04-14

### Changed
- Raid chip icons: Shadow → lucide `Flame` (was `Ghost`); Mega → lucide `Crown` moved to the left side (was `Sparkles` on right); tier (1/3/5) + Dynamax still on the right.

## [1.5.4] - 2026-04-14

### Changed
- Home raid chips strip regional/shadow/mega suffixes from display names — pills show base names only ("Vulpix", "Marowak"). Counter page keeps the full form name.

## [1.5.3] - 2026-04-14

### Added
- Sticky section headers now carry the same 24px `from-background to-transparent` fade gradient the main `FixedHeader` uses, absolutely positioned below the row.

## [1.5.2] - 2026-04-14

### Changed
- Sticky section header renders as a full-width row across the content column (`-mx-4 px-4` + `w-[calc(100%+2rem)]`), not just behind the text.

## [1.5.1] - 2026-04-14

### Changed
- Replaced the custom one-way sticky hook with native `position: sticky` on section headers — sticks whenever natural position scrolls under the top bar, releases when the section's end passes. Hook `useStickyOnScrollDown` deleted (dead code).

## [1.5.0] - 2026-04-14

### Added
- **Sticky collapsible section headers**: section header docks below the main `FixedHeader` when scrolling down through its body. `FixedHeader` publishes `--fixed-header-h` CSS variable for descendants to align against.

## [1.4.2] - 2026-04-14

### Fixed
- **Counter pages for single-type Pokemon were blank**: root cause was single-type entries in `pokemon.json` stored with `"None"` as a placeholder second type, which wasn't in the type-effectiveness chart and poisoned multiplier math with `NaN`. Fixed `getEffectiveness()` to skip non-chart defender types. Affected Mewtwo, Kyogre, Groudon, Vulpix (Alolan), Dhelmise, and every other pure-type boss.

## [1.4.1] - 2026-04-14

### Changed
- Raid chips: two-column grid that stretches to fill; monochrome lucide icons replacing emoji (`Star`, `Sparkles`, `Ghost`, `Atom`); tier pill shows `N ★` (number + single star).

## [1.4.0] - 2026-04-14

### Added
- **Structured `bosses[]` array** in `current-raids.json` with `{ id, tier, shadow }` per entry; legacy tier arrays (`fivestar`, `mega`, `shadow`, etc.) kept for back-compat.
- Raid chips render shadow icon on left + tier icon on right; `cleanDisplayName()` strips `(Shadow)` and `(Mega)` from pokemon.json labels.

## [1.3.0] - 2026-04-13

### Added
- **`scripts/fetch-raids.ts`**: scrapes `leekduck.com/raid-bosses/` and writes `src/data/current-raids.json` — normalizes names (Mega/Shadow/Alolan/Galarian/Hisuian/Paldean) to our pokemon IDs, prefers `-shadow`/`-mega` variants when they exist, warns on unmatched names.
- `npm run update:raids` script hook.
- TODO comment in the script sketches a future GitHub Action for daily cron automation (not yet built).

### Known gaps
- Dynamax raids: LeekDuck has no stable listing page, so `dynamax[]` stays empty. Needs another source or manual curation.

## [1.2.0] - 2026-04-12

### Added
- **Team Rocket tab**: new 4th nav tab with counter teams for every Grunt, Leader, and Giovanni
- **Rocket Essentials**: curated squad of 6 Pokemon that handle ~90% of Rocket encounters, with "Copy Squad" button
- **18 Grunt type cards**: each with enemy lineup (3 slots), recommended 3-Pokemon counter team, key type badges, and one-tap "Copy Counter Team" button
- **3 Leader cards**: Sierra, Cliff, Arlo with variable slot 2/3 lineups and "best all-around" counter teams with why-it-works explanations
- **Giovanni card**: current legendary (Shadow Tornadus), full lineup, counter team
- **Search string visibility**: every copy button shows what it searches below the button (e.g. "Searches: swampert,mamoswine,machamp")
- **Key type badges**: per-encounter type indicators showing what types you need for balanced team building
- **Home page Team Rocket section**: Sierra, Cliff, Arlo, Giovanni pills linking to Rockets tab
- **`CopyIconButton` shared component**: extracted from Teams page for reuse across Teams and Rockets
- **Rocket lineups data file**: `src/data/rocket-lineups.json` sourced from LeekDuck (April 2026)
- **Figma wireframes**: Current v1.2.0 section with Home, Rocket, and Rocket (scrolled) frames

### Changed
- Bottom nav: 4 tabs (Home | Leagues | Rocket | Teams), evenly spaced with `basis-0`
- Home page section order: Leagues → Team Rocket → Raids → Counters
- Home footer version now reads from `APP_VERSION` constant (was hardcoded `v1.0.5`)
- Teams page imports `CopyIconButton` from shared component (was inline)

### Fixed
- Version drift: home footer was showing v1.0.5 while constants had v1.1.0

---

## [1.1.0] - 2026-04-10

### Added
- **Team Advisor**: 4-state flow on Teams page — copy league CP string, build Pokemon pool, get team recommendations, load team with analysis
- **Team Advisor engine** (`team-advisor.ts`): Two-pass brute-force combo scoring (fast pass on all C(n,3) combos, full analysis on top 5) with template-based strategy tips
- **Screenshot scanning** (`functions/api/scan.ts`): Cloudflare Pages Function that sends GO storage screenshots to Claude Vision API and returns Pokemon names
- **Pokemon name matcher** (`pokemon-utils.ts`): Fuzzy matches OCR names to dataset IDs — case-insensitive, form names, base names
- **Pool storage** (`team-storage.ts`): localStorage persistence for Pokemon pool per league with advisor state
- **Smart empty slot hints**: shows which types your team can't beat yet, with copy button for GO search string that finds counter Pokemon
- **Pool suggestion chips**: empty team slots show top 3 Pokemon from your pool that best fill coverage gaps (scored by offensive gap coverage + defensive weakness resistance)
- **Dual copy buttons**: "League" (copies CP/type filter) and "My Team" (copies team search string) side by side in header
- **Team Analysis section**: rating badge + label, coverage score, shared weakness details with Pokemon names — only shows with full team of 3
- **Strategy section**: Lead/Safe Swap/Closer tactical tips based on move energy costs, type matchups, and role assignments
- **Role labels on team slots**: LEAD / SAFE SWAP / CLOSER appear when all 3 slots filled
- **Auto-sort by role**: team reorders to Lead → Safe Swap → Closer when 3rd Pokemon is added
- **Compact on remove**: removing a Pokemon shifts remaining ones up, no gaps
- **Screenshot upload component**: upload 2 GO screenshots with preview thumbnails, scan button, error handling
- **Pokemon pool component**: collapsible "My Pokemon (N)" with dual-action chips (+/×), search bar, screenshot upload
- **Recommended teams component**: collapsible ranked team cards with movesets, roles, strategy tips, "Use This Team" button

### Changed
- Teams page completely rewritten with state-driven advisor flow
- Copy search strings now use correct counter types (Ground to beat Electric, not Electric itself)
- Search strings exclude Pokemon already on your team
- Fantasy Cup search string includes type restrictions (`@dragon,@steel,@fairy`)
- Master League search string uses `cp2500-` instead of broken `cp4000-`
- PokemonChip supports new "pool" variant with + (add to team) and × (remove from pool)
- SearchInput blurs and scrolls to top after selecting (prevents iOS keyboard scroll jump)
- TeamSlotCard supports role label, copy hint button, and children (suggestion chips)

### Removed
- `buildDiscoveryString` from team-analysis.ts (replaced by advisor scan flow)
- `suggestSwaps` from team-analysis.ts (replaced by combo recommender)
- `SwapSuggestion` type from team-types.ts
- `discoveryString` and `suggestions` fields from `TeamAnalysis`
- "Find Teammates in GO" discovery string button
- League info row + rating row from Teams page header (moved into Analysis section)
- Standalone "Swap a Pokemon" search bar from State 4

### Fixed (post-build polish)
- Scoring: added bulk (DEF×STA) to penalize glass cannons, rebalanced weights, tightened rating thresholds
- Scoring: suggestion chips use full team rating instead of gap counting
- League type restrictions: recommendations and suggestions filter by allowed types (Fantasy Cup)
- CP copy string: includes type restrictions for special cups, Master League uses `cp2500-`
- Counter search strings: use correct counter types (`@1ground` to beat Electric) and exclude team members
- Movesets: fallback to pokemon.json when Pokemon isn't in league meta
- Scan: Vision prompt identifies by sprite not nickname, dupe messages show per-Pokemon counts
- UX: pool chips 2 per row stretching, scroll to top on actions, "Add a 2nd Pokemon first" on slot 3
- Max recommended teams increased from 5 to 10

---

## [1.0.6] - 2026-04-10

### Added
- 1560 Pokemon from PvPoke gamemaster (was 318) — full Pokemon GO dex with types, moves, base stats
- Import script: `scripts/import-pvpoke-data.mjs` for future data updates
- Curated team recommendations: 3 per league (12 total) with "why it works" explanations and copy buttons
- Curated teams on league detail pages — Pokemon pills with + buttons to add directly to your team
- "Find Teammates in GO" discovery search string on Teams page — generates a GO search string targeting move types that counter your team's weaknesses
- Team rating system: coverage-dominant scoring with hard penalties for shared weaknesses and meta threats
- Team rating badge on Teams page (below copy button) and league team container
- Types covered indicator (X/18 types covered) on Teams page and league team container
- Smarter team suggestions: scored by gap coverage (50%) + anti-synergy resistance (25%) + meta tier (25%)
- Shadow/Dynamax raid type tags in `current-raids.json`
- Empty state team rating: shows "— · 0/18 types covered" before any Pokemon are added
- PokemonChip "added" variant (check mark, dimmed) for curated team Pokemon already on your team

### Changed
- Home page: league cards simplified to static cards (name + copy button + see more link, no expand/collapse)
- Home page: removed curated teams (moved to league pages)
- Home page: subtitle updated to semicolon instead of colon
- Chevrons standardized to future-state: right (▸) = collapsed, down (▾) = expanded
- Tier accordion chevrons moved next to title text (was right-aligned)
- Font size: base bumped to 18px, all hardcoded `text-[13px]` replaced with rem-based `text-sm`
- "Edition" shortened to "Ed." in league names
- Ultra League now active, Great League inactive (reflecting current GBL rotation)
- Back buttons removed from league and counter pages — browser back handles navigation
- Pokemon list items: +/✓/X icons moved to top row (right-aligned), moveset gets full width
- Team slot cards: "POKEMON 1/2/3" label removed, X moved to top row
- Counter/raid result cards: dashed borders on non-tappable Pokemon cards
- League team container: "Your Team" (removed cup name), tighter padding, coverage score shown
- Teams page: league info link moved to rating line (left-aligned), removed sticky bottom bar
- Curated team cards: title merged into description paragraph, pills are first row
- Copy feedback: toast notifications removed — green button state only

### Fixed
- Team rating formula: coverage-dominant (70%) with hard penalties instead of tier-dominant
- Hydration mismatches in Teams page (localStorage reads moved to useEffect)
- useEffect infinite loop in FixedHeader (added dependency array + ResizeObserver)
- Dead imports removed across 10+ files
- Duplicate CollapsibleSection components merged into one with prefix prop

### Removed
- Back buttons from league and counter pages
- "POKEMON 1/2/3" labels from team slot cards
- Curated teams from home page
- Sticky league info bar from Teams page
- `home-team-preview.tsx` component
- `handleClear`, `teamRating`, `RATING_COLORS` unused variables from Teams page

---

## [1.0.5] - 2026-04-10

### Added
- Curated teams, smarter suggestions, improved team rating (initial implementation)

---

## [1.0.4] - 2026-04-09

### Added
- Home page redesign: coaching flow with collapsible LIVE: LEAGUES, LIVE: RAIDS, SEARCH: COUNTERS sections
- Fixed header bar on all pages — title, subtitle, and copy buttons always visible while scrolling
- Fade gradient below fixed header for smooth content scroll-behind
- Shadow/Dynamax raid type tags on home page raid pills
- Persistent team bar on league pages — fixed above bottom nav, always visible
- League info bar on Teams page — quick link back to league detail
- Collapsible Meta Threats section on Teams page (starts collapsed)
- Footer on home page: version, MIT license, Skunk Labs credit, feedback form link
- Google Form for beta feedback
- localStorage collapse state persistence for sections and league cards
- Quick pick pills for counter search (S/A tier meta Pokemon)
- Empty state for no active leagues

### Changed
- Home subtitle: "Always know which Pokemon to play: find copiable search strings for every battle."
- Chevron icons standardized: down=expanded, up=collapsed (Lucide ChevronDown/Up everywhere)
- Navigation arrows standardized: → for navigate, ← for back (text characters, not Lucide icons)
- Back button on same line as page title (counter pages match league page pattern)
- Copy button moved into fixed header on league, counter, and teams pages
- Toast notifications removed from copy actions — green button state is the only feedback
- Raid tag text bumped from 11px to 13px for readability
- Section spacing tightened on home page (space-y-8 → space-y-5)
- Team slot Pokemon name made bolder and larger (font-semibold text-base)
- Touch targets: section headers, remove button, arrow links all min 44px
- Collapsible sections merged into single component with prefix prop

### Fixed
- useEffect infinite loop in FixedHeader (no dependency array → ResizeObserver)
- Hydration mismatch: localStorage reads in Teams page moved to useEffect
- Team not persisting when navigating from Teams to league page (save effect race condition)
- iOS scroll jump on copy — clipboard textarea focus() with preventScroll + requestAnimationFrame restore
- Content scrolling behind iOS status bar — fixed header covers safe area
- useLayoutEffect for header measurement (eliminates visible spacer jump on page load)
- z-index: fade gradient lowered to z-20 to avoid overlap with team bar (z-30)

### Removed
- home-team-preview.tsx (team preview moved to Teams tab)
- Duplicate CollapsibleSearchSection component
- Dead imports: RATING_COLORS, handleClear, teamRating, LeagueSlug, useMemo, LeagueId
- Toast import from copy-button.tsx
- Sticky headers on league/counter pages (caused iOS scroll jumps, replaced by FixedHeader)

---

## [1.0.3] - 2026-04-09

### Added
- Competitive research: full landscape analysis of PvPoke, PokeBase, Pokebattler, GO Hub, Leek Duck
- Competitive research Figma page with screenshots, UX/UI/branding/features/gaps analysis per competitor
- Product positioning: "What Poke Pal is NOT" and "Foundations to Win" strategy docs
- Markdown source of truth at `docs/superpowers/specs/2026-04-09-competitive-research.md`
- Figma visual companion on "Competitive Research" page of Screen Layouts file

---

## [1.0.2] - 2026-04-09

### Added
- 199 new Pokemon (119 → 318): PvP meta, raid counters, Ultra Beasts, Megas, Primals, Community Day, Gen 5-9
- League barrel export (`src/data/leagues/index.ts`) — adding a league is now 3 lines in 1 file instead of 5+
- Slim search index (`pokemon-search-index.json`) — {id, name} pairs only for lighter client bundle
- Data freshness utility (`src/lib/data-freshness.ts`) — surfaces lastUpdated from all data sources
- Data validation script (`scripts/update-data.ts`) — validates all league/raid JSON, reports staleness
- Search index generator (`scripts/generate-search-index.ts`)
- Explainer copy on Home, Leagues, and Teams pages for onboarding
- Mid-page connector text on Home between raids and leagues sections
- "Your Team - [League Name]" label on league detail inline team section

### Changed
- League detail: removed SearchInput and "Copy Your Team" button — team building belongs on Teams tab
- League detail: single "Copy Meta Search String" button (was dual copy)
- League detail: back arrow + title on same line, tiers above team section
- Teams: removed Share button (not needed at MVP)
- Teams: renamed "Copy Search String" → "Copy Team Search String" (full width)
- Home: "MY TEAMS" → "MY BATTLE LEAGUE TEAMS"
- Home: updated explainer copy to mention all entry points
- SearchInput now imports slim search index instead of full pokemon.json
- Refactored 4 files to use league barrel export instead of individual imports
- LeagueId type now derived from barrel export, not hardcoded

### Removed
- Share button and share URL logic from Teams page
- SearchInput from league detail pages
- DualCopyButtons from league detail pages
- Duplicate league imports across 4 consumer files

---

## [1.0.1] - 2026-04-08

### Fixed
- Font accessibility: bumped text-xs to text-[13px] across 9 files for readability
- Bottom nav: text-base for readability
- More space between Team Builder header and league tabs (mt-2 to mt-4)

---

## [1.0.0] - 2026-04-08

### Added
- Explainer text on home page — tells new users what Poke Pal does
- 1-star raids included in Current Raids section

### Changed
- Better copy toast: "Copied -- paste in Pokemon GO search"
- Nav bar: text only, no icons

### Removed
- Dead code: coverage-chart, swap-suggestions, clear-button components
- Inline touchAction attributes (already global in CSS)

---

## [0.9.0] - 2026-04-08

### Added
- League tabs on Teams page — persistent, shows saved team status per league
- My Teams with league tabs + selected team chips below
- "See more" link on all 3 containers

### Changed
- Teams page containers redesigned: Select League, See more, type suggestions in header
- Nav: Search renamed to Home
- Leagues tab always goes to /leagues
- Poke Pal header matches page header size

### Removed
- Dead roleMap/roles code
- league-picker.tsx (replaced by cup selector)

---

## [0.8.0] - 2026-04-08

### Added
- CopyButton component replaces CopyBar everywhere
- DualCopyButtons for pages with two copy actions
- PokemonChip variant for compact display
- Nav memory — remembers last visited league tab
- Suggestion pills render inside team slot containers

### Changed
- League page back button goes to /leagues (not browser history)
- Counter cards: removed "Counters" from title, types on same line as name (right-aligned)
- Suggestion pills only show in next slot to fill
- Counter page: single "Copy Counters Search String" button, removed shadow + build-a-team

### Fixed
- Spacing between counter cards (space-y-2 to space-y-3)
- Copy + Share buttons moved to top of teams page, side by side with disabled states

---

## [0.8.1] - 2026-04-08

### Changed
- Design system consolidation — TypeBadge, StatusPill, PokemonChip unified

---

## [0.8.3] - 2026-04-08

### Added
- Cup selector replaces league picker on Teams page
- Counter cards match league style (no types), team slots show movesets

### Changed
- League picker moved below team slots, above coverage
- "Current Raids" label on home page
- Scrollable team pills with arrow margin

### Fixed
- Selecting a cup keeps existing team — only clears when switching cups

---

## [0.7.0] - 2026-04-08

### Added
- Shared components for UX consistency across all pages
- League meta picks shown on teams page when slots are empty
- Poke Pal header on home page
- Back buttons restored on all subpages

---

## [0.7.1] - 2026-04-08

### Changed
- Codebase cleanup: extracted shared utils, deleted dead code

---

## [0.6.0] - 2026-04-08

### Changed
- UX overhaul: copy-bar-first layout on all pages
- Aggressive cleanup of unused UI elements

---

## [0.5.0] - 2026-04-08

### Added
- Role-based team analysis: lead, safe-swap, closer positions
- Shareable team URLs with clean routes

---

## [0.5.1] - 2026-04-08

### Fixed
- Build a Team section matches Quick Picks / What's Live format

---

## [0.5.2] - 2026-04-08

### Fixed
- Nav bar padding + active tab bold highlight

---

## [0.4.0] - 2026-04-08

### Added
- Persistent team state via localStorage — teams survive navigation
- OG meta tags for link previews
- TypeBadge extracted as shared component (was duplicated across 6+ files)

### Removed
- Sentry integration (was configured but not connected)

---

## [0.3.0] - 2026-04-08

### Changed
- Replaced floating team bar with inline team section on league pages — no more z-index/nav overlap

---

## [0.3.1] - 2026-04-08

### Fixed
- Truncated search strings to one line with ellipsis

---

## [0.3.2] - 2026-04-08

### Changed
- What's Live links styled as tappable pills (matching Quick Picks)

---

## [0.3.3] - 2026-04-08

### Fixed
- Team chips match standard pill size (min-h-11, px-3, text-sm)

---

## [0.3.4] - 2026-04-08

### Fixed
- Team chips same height as Try chips — removed min-h-11

---

## [0.3.5] - 2026-04-08

### Fixed
- Shrunk team/suggestion chips, added "Full Analysis" link when team has 2+ Pokemon

---

## [0.3.6] - 2026-04-08

### Fixed
- Search strings strip parenthetical form names — GO uses base names only

---

## [0.3.7] - 2026-04-08

### Changed
- Only S tier expanded by default on league pages (A/B/C collapsed)

---

## [0.2.0] - 2026-04-08

### Added
- Version banner visible on every page for cache debugging

---

## [0.2.1] - 2026-04-08

### Fixed
- Expandable team panel anchored above nav — max-height animation with overflow clip

---

## [0.2.2] - 2026-04-08

### Fixed
- Expand panel to 60vh — was too constrained at 320px

---

## [0.2.3] - 2026-04-08

### Fixed
- Panel shows collapsed row correctly — removed flex-col-reverse

---

## [0.1.0] - 2026-04-08

### Added
- Complete MVP: counter search, league meta, team builder
- 119 Pokemon with real GO stats, moves, base stats
- 4 leagues: Great League, Ultra League, Master League, Fantasy Cup
- Fantasy Cup: Great League Edition — Dragon/Steel/Fairy, 1500 CP, 14 meta picks
- Counter engine: top 5 counters + budget picks + copyable GO search string
- League search strings: combined meta names + CP cap, one-tap copy
- Team Builder: pick 3 Pokemon, coverage analysis, meta threats, swap suggestions
- In-place team building on league pages with smart suggestions
- Bottom nav (Search | Leagues | Teams) on all pages
- Leagues landing page with Live Now + Coming Up
- Home page: search-first layout, Quick Picks, What's Live pills
- Counter page: type effectiveness badges (Weak to / Resists with 2x labels)
- BackButton with history fallback
- iOS mobile support: clipboard fallback for HTTP, 44px touch targets, active state fixes
- Static export: 129 pages generated for Cloudflare Pages
- Dev proxy for mobile testing over local network
- 31 tests passing, TypeScript strict mode, zero errors

### Fixed
- Async params for Next.js 15+ (params as Promise)
- shadcn v4 Button (no asChild), Accordion (multiple/value props)
- Dual toast popups from auto-copy on mount
- Budget picks orphans (13 of 25 had no matching Pokemon)
- Touch targets bumped to 44px minimum
- Type badge contrast for Ice, Flying, Fairy
- Mobile copy on iOS Safari/Chrome over HTTP
- iOS tap delay via touch-action: manipulation
- iOS :active states via touchstart listener
- Cross-origin dev block for HMR

---

## [Unreleased] - Pre-web-app (Scanner + Skill)

### Added
- Product specification for unified Poke Pal app (consolidates pogo-pal + battle-buddy + poke-pal)
- Engineering standards document
- Open items tracker
- Session log for cross-session continuity

### Product Decisions Made
- Core product: copyable Pokemon GO search strings as primary output
- MVP scope: Counter Search + League Meta only
- Tech stack: Next.js App Router on Cloudflare Pages, Tailwind + shadcn/ui
- Distribution: Reddit communities for launch, SEO for long-term growth

---

## [1.2.0] - 2026-03-31 (Scanner)

### Added
- Retina 2x screenshot capture via Quartz CGWindowListCreateImage
- Quartz Core Graphics mouse events for iPhone Mirroring
- IV Calculator — brute-force from CP + HP + species + level + star rating
- Hybrid processing pipeline (Claude + local math)
- Base stats database (1710 Pokemon from pvpoke)
- Batch timestamps, scanner test command, recorded swipe gestures

### Fixed
- Emergency stop via pynput, swipe gestures, grid traversal, resume, retry limits
- Atomic checkpoints, 10k dust ambiguity, min CP 10, division by zero

---

## [1.1.0] - 2026-03-28 (Scanner)

### Fixed
- Corrupt checkpoint.json recovery
- Resume scroll positioning
- Skip option on persistent scan errors
- scan_log.json replaced with JSONL (fixes O(n^2) I/O)
- Calibration schema validation

---

## [1.0.0] - 2026-03-28 (Scanner)

### Added
- Full Pokemon GO strategic advisor Claude Skill
- Automated collection scanner (pyautogui + iPhone Mirroring)
- Cloudflare Workers web UI with D1 database
- Reference guides for PVP, PVE, resource management, screenshots
