# Changelog

All notable changes to Poke Pal will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project uses [Semantic Versioning](https://semver.org/).

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
