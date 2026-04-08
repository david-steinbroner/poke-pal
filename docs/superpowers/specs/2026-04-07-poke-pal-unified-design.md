# Poke Pal — Unified Pokemon GO Companion

## Context

Three separate Pokemon GO projects exist (pogo-pal, battle-buddy, poke-pal) that each solve pieces of the same problem: helping players decide what Pokemon to use. They share overlapping goals but diverge in tech stack, design, and completeness. This spec defines the consolidated product that replaces all three.

The trigger: one cohesive, public-facing tool — not three half-finished ones.

## Product Vision

Poke Pal gives you **copyable Pokemon GO search strings** for any counter — type the boss, copy the string, paste it in GO, done.

The search string is the product. It's the single most actionable thing a Pokemon GO tool can output — something you paste directly into the game to instantly find the right Pokemon in your storage. Every screen, every recommendation leads with a search string.

The tool works fully without importing a collection. Importing unlocks personalized recommendations and collection management (future phases).

## Target User

Public tool. Any Pokemon GO player who Googles "Giratina counters" or "Great League meta April 2026." Reddit Pokemon GO communities (r/TheSilphRoad, r/pokemongo, r/PokemonGOBattleLeague) are the initial distribution channel. SEO is the long-term growth engine.

**One-sentence Reddit pitch:** "I built a free tool that gives you copyable search strings for any Pokemon GO counter — type the boss, copy, paste in GO, done."

## MVP Scope (v0.1)

Counter Search + League Meta. That's it. Ship fast, get users, iterate.

### Battle (default screen)

The app opens to one thing: a search box.

**Counter Search ("What beats X?")**

- **Instant search** — results appear as the user types, no submit button. Like PvPoke's search.
- Autocomplete dropdown shows matches with form disambiguation (Giratina-Altered, Giratina-Origin, Deoxys forms as separate entries).
- Popular/trending quick-picks below the search box (e.g., Giratina, Medicham, G-Stunfisk, Dialga, Swampert).
- No results: "No Pokemon found. Check the spelling." with quick-picks still visible.
- Each result has its own SSR route for SEO: `/counter/giratina-origin`

**Results page — above the fold (3 things only):**

1. **Copy bar (anchored at top of results, below Pokemon name/header)**
   - Static position — does not float or follow scroll. First thing you see after the header.
   - Shows the primary search string: `@1dark,@1dragon,@1fairy,@1ghost,@1ice`
   - Copy button with haptic feedback (on supported devices) + toast confirmation: "Copied! Switch to Pokemon GO and paste"
   - If clipboard API fails: search string displayed as selectable text so user can long-press to copy manually
   - **Auto-copy on result load** — string is copied to clipboard immediately when the page loads. Toast: "Copied! Switch to Pokemon GO and paste." User never has to find a copy button.

2. **Top 3-5 counters**
   - Name + type icons + moveset. Compact cards — no paragraph text.
   - Tappable to expand: typing details, why it's good, what it's weak to

3. **"Copied — switch to Pokemon GO and paste" instructional banner**
   - Persistent until dismissed. Teaches the core interaction on first use.

**Below the fold:**

4. **Budget Picks** — accessible alternatives (no legendaries, no XL-exclusive)

5. **More search strings (collapsed by default)**
   - Shadow counters: `shadow&@1dark,...`
   - High CP only: `@1dark,...&cp2500-`
   - Specific mons: `garchomp,rayquaza,salamence,...`

6. **Type reference (collapsed)**
   - Super effective attack types, types to resist, types to avoid
   - Plain English: "Use Pokemon with these attacks" / "Your Pokemon should resist"

### Leagues (secondary tab)

Go Battle League hub. Subtle tab — Battle should feel like the whole app.

**Leagues landing:**

- Current GBL season name and dates
- Active leagues/cups as cards, each showing:
  - Name, CP cap, type restrictions (if any)
  - Copyable search string to find eligible Pokemon in GO
  - "View Meta" CTA
  - **"Last updated: [date]"** — prominent, on every card

**View Meta page** (`/league/great-league`):

- Copyable search string at top: all meta Pokemon names for pasting into GO
- "Last updated: [date]" — prominent
- Tiers as collapsible accordion cards (S / A / B / C) — standard accordions, no sticky headers
- Each Pokemon card: name, type icons, recommended moveset. No role field, no notes paragraph — clean and scannable.
- Tappable to expand for details

### Header & Menu

**Header:** "Poke Pal" left-aligned, hamburger icon right-aligned. Below: tab buttons (Battle / Leagues) with Battle visually dominant.

**Menu (hamburger → slide-out sheet):**

- **Version info:** "v0.1.0 · Data updated Apr 7, 2026"
- **Send Feedback** → opens Google Form in new tab
- **About** → "Not affiliated with Niantic, The Pokemon Company, or Nintendo." + "Built by David Steinbroner"

### Feedback

"Send Feedback" opens a Google Form in a new tab. Responses go to a Google Sheet. Zero code to build. Upgrade to in-app form when volume justifies it.

### User-Facing Errors

Three reusable components:

1. **Retry** — transient failures (data didn't load, network hiccup). Message + "Retry" button that retries the request.
2. **Go Back** — dead ends (404, unknown Pokemon, bad URL). Message + "Go Back" button.
3. **Offline** — no connectivity. Message + "Retry" that checks connection first.

Each takes a `message` prop for context. One global error boundary wrapping the app — not per-section.

### Error Tracking

Basic **Sentry** init with release tags matching app version. Default error capture, source maps, device/browser info. No custom breadcrumbs or context in v0.1 — add when there's error volume to triage. Free tier (5K errors/month).

### Analytics

**Cloudflare Web Analytics** — free, no cookies, GDPR-compliant, zero code. Page views, visitors, referrers, devices. Enabled in Cloudflare dashboard.

Custom event tracking (Posthog) deferred to Phase 2.

### Platform & Device Support

- **Website deployed as PWA** — no app store, no dev license. "Add to Home Screen" install. Push PWA install prompts — home screen = return visits.
- **Updates:** Push to GitHub → Cloudflare auto-deploys in ~30 seconds. Everyone gets latest on next page load.
- **Devices:** iPhone (Safari), Android (Chrome), iPad, desktop. Mobile-first responsive layout.
- **Dark mode:** Respects `prefers-color-scheme` system preference. shadcn components handle it. Manual toggle in Phase 2.
- **Accessibility (MVP):**
  - 44px minimum touch targets
  - WCAG AA color contrast (4.5:1 text, 3:1 large text)
  - Semantic HTML (`<button>` not `<div onClick>`)
  - Never `user-scalable=no` — pinch-zoom always allowed
  - Font sizes in `rem` — respects system text size settings
  - Remaining accessibility items (keyboard nav, reduced-motion, ARIA, Lighthouse >90) are Phase 2 polish

## Deferred (Post-MVP)

### Phase 2: Depth
- **Team Builder** — guided 3-step flow (pick lead → partners → closer), persistent team tray, coverage analysis, role assignment, shareable team URLs
- Team Rocket leader lineups with pre-packaged counter sets
- Current raid bosses / Dynamax (live data)
- Collection import (PokeGenie CSV upload)
- Collection browse/filter/manage
- Collection-aware recommendations ("From your Pokemon" sections)
- Manual Pokemon entry
- AI-generated team strategy narratives (Claude API)
- Smart triage: investment advisor, trade recs, transfer recs, purify recs
- Custom Sentry breadcrumbs and error context
- Posthog event tracking
- Dark mode manual toggle
- Full accessibility pass (keyboard nav, ARIA, reduced-motion, Lighthouse >90)

### Phase 3: Growth
- Beta program with Python auto-scanner access
- Community features (share teams, vote on meta)
- Paywall candidates (advanced analytics, AI strategy)
- Content: seasonal meta guides for SEO
- Push notifications (raid rotation, cup change, Rocket Takeover)

### Reserved Routes (for future URL stability)
```
/league/[league-slug]/team/[mon1]-[mon2]-[mon3]  → Shareable team URL (Phase 2)
/raid/[pokemon]                                   → Raid counter page (Phase 2)
/team-rocket/[leader]                             → Rocket leader page (Phase 2)
```

## Tech Stack

### Frontend
- **Next.js** on Cloudflare Pages (via `@cloudflare/next-on-pages`)
- **React 19** with App Router
- **Tailwind CSS** + **shadcn/ui** components
- Modern clean aesthetic — no retro theme, no sci-fi theme
- Mobile-first, PWA installable
- **Static generation** via `generateStaticParams` for all `/counter/[pokemon]` pages — pre-rendered at build time, served from CDN, zero compute per request. Handles viral traffic without hitting Cloudflare's free-tier SSR limits.
- League pages: also statically generated, rebuilt on data update push.

### Backend (Phase 2)
- **poke-pal's existing Hono + D1 Worker** on Cloudflare Workers
- D1 database with Pokemon collection, candy inventory, trainer profile
- PokeGenie CSV import endpoint already built
- PVP rank columns (great/ultra/master) already in schema

### Data
- **Pokemon + move reference data:** JSON files covering all ~900 Pokemon with types, moves, and base stats. Sourced from PokeAPI / GameMaster file. Static reference data, not curated per-Pokemon.
- **Counter recommendations:** Computed from type effectiveness engine (any Pokemon gets counters automatically). Top counters = highest-DPS Pokemon of each super effective type. Budget picks = smaller curated list (~50-80 Pokemon) flagged as widely accessible (no legendaries, no XL-exclusive).
- **League meta data:** Curated JSON per active league/cup. Updated manually each GBL season rotation (~every 2-4 weeks). **48-hour update commitment** on season rotations — stale data kills Reddit trust. Show "Last updated: [date]" prominently on every meta page.
- **Build-time validation:** Warns if all leagues are inactive or if dates are in the past. Catches stale data before deploy.
- Sources: PvPoke rankings, community meta analysis, budget counter lists from pogo-pal

### Search String Engine
- Utility module that generates Pokemon GO search strings from:
  - Type effectiveness (super effective move types → `@1type` syntax)
  - Specific Pokemon names
  - CP caps (`cp-1500`, `cp-2500`)
  - Filters: shadow, lucky, buddy level, shiny
  - Combinators: `&` (AND), `,` (OR), `!` (NOT)
- Every recommendation surface in the app calls this engine
- Search strings are the primary output — the product, not a feature

## Route Structure (SEO)

```
/                          → Home (Battle / counter search)
/counter/[pokemon]         → Counter page for specific Pokemon (static gen)
/league/[league-slug]      → Meta page for a league/cup (static gen)
```

All pages statically generated at build time. Full HTML content visible to search engines.

**SEO title format:** "Giratina Counters & Search Strings - Pokemon GO (April 2026)" — include month/year for freshness signals. Google favors recently updated Pokemon GO content.

## Data Models

### Pokemon (reference data, JSON)
```typescript
interface Pokemon {
  id: string;           // e.g., "garchomp", "giratina-origin"
  name: string;         // "Garchomp"
  types: PokemonType[]; // ["Ground", "Dragon"]
  fastMoves: Move[];
  chargedMoves: Move[];
  baseStats: { atk: number; def: number; sta: number };
}
```

### Move (reference data, JSON)
```typescript
interface Move {
  name: string;         // "Dragon Tail"
  type: PokemonType;    // "Dragon"
  isCharged: boolean;
  pvpPower: number;
  pvpEnergy: number;    // energy cost (charged) or energy gain (fast)
}
```

### Counter Recommendation (computed or curated)
```typescript
interface CounterRec {
  pokemon: string;      // Pokemon ID
  fastMove: string;     // Move name
  chargedMoves: string[]; // 1-2 move names
  tier: 'top' | 'budget';
}
```

### League/Cup
```typescript
interface League {
  id: string;           // "great-league"
  name: string;         // "Great League"
  cpCap: number;        // 1500
  typeRestrictions?: PokemonType[];
  season: string;       // "Season 22"
  active: boolean;
  startDate: string;
  endDate: string;
  lastUpdated: string;  // "2026-04-07" — displayed prominently
  meta: MetaPokemon[];
}

interface MetaPokemon {
  pokemonId: string;
  tier: 'S' | 'A' | 'B' | 'C';
  recommendedFast: string;
  recommendedCharged: string[];
}
```

## Type Effectiveness Engine

Port from pogo-pal's existing logic. Pokemon GO uses a modified type chart:
- Super effective: 1.6x (not 2x like main series)
- Not very effective: 0.625x
- Immune (in main series): 0.391x (double not-effective in GO)
- STAB bonus: 1.2x

The engine takes a defending Pokemon's types and returns:
- Super effective attack types (sorted by multiplier for dual types)
- Resistant types (what the defender's moves won't hurt)
- Types to avoid (what the defender hits hard)

This powers both the counter search and the search string generation.

## Key UX Principles

1. **The search string is the product.** Not a feature — the product. Every screen leads with a copyable string. Auto-copy on load. Copy bar anchored at top of results — first thing you see.
2. **Instant search.** No submit button, no page reload. Results as you type.
3. **Above the fold = search string + top 5 counters.** Everything else is below the fold or collapsed.
4. **Counter cards are scannable.** Name, type icons, moveset. Details behind a tap. No paragraph text on cards.
5. **No import required.** Fully useful from first visit. Collection enriches but never gates.
6. **Mobile-first.** Touch targets 44px+. One-hand operation.
7. **SEO-first.** Every page statically generated with full content. Month/year in titles for freshness.
8. **Data freshness is trust.** "Last updated" on every meta page. 48-hour update commitment on season rotations.

## Verification Plan

### Build
- `npm run build` succeeds on Cloudflare Pages
- All static pages render with full content (curl test)
- Search string copy works on iOS Safari and Chrome Android (haptic + toast)

### Functional
- Counter search: type "Gira..." → autocomplete shows Giratina-Altered and Giratina-Origin → select → correct search string + counter list
- Auto-copy on result load → toast confirmation
- Floating copy bar stays visible when scrolling
- League meta: Great League shows S/A/B/C tiers with correct Pokemon and "Last updated" date
- Accordion tiers expand/collapse correctly
- Error states: invalid Pokemon route shows Go Back component, offline shows Retry

### SEO
- `/counter/giratina` returns full HTML (not a loading spinner)
- `<title>` includes Pokemon name + "Counters & Search Strings" + month/year
- `<meta description>` is unique per page
- Post-launch: verify indexing via Google Search Console (not a ship-gate — takes days/weeks)

### Data
- Type effectiveness matches PvPoke for 10 sample matchups
- Search strings produce correct results when pasted into Pokemon GO
- Budget picks are all non-legendary, non-XL-exclusive
- Build-time validation catches stale/inactive league data

---

## Decision Log

Changes made based on reviews from 5 agents (specification, system-architect, product-strategy, marketing/growth, UX/design). Documenting the reasoning so future decisions can build on these.

### Removed: Coming Soon placeholder cards
**Why:** UX reviewer said they look like broken features to users arriving via SEO. Strategy reviewer said they dilute focus. The app should feel complete, not under construction. Add Rocket/Raids when they actually work.

### Removed: Team Builder from MVP (moved to Phase 2)
**Why:** All five reviewers flagged this. The spec reviewer called it "the biggest offender" for MVP scope. The engineer estimated 1-2 days just for team builder. The strategist said it's "the thing you build after you know people care." Counter Search alone is a complete value loop: search → copy → paste → done. Ship that first. Team Builder is Phase 2 with shareable team URLs as its growth lever.

### Removed: Sticky tier headers
**Why:** Spec reviewer flagged as unnecessary polish. Standard collapsible accordions are sufficient for v0.1.

### Removed: "Coming next" cup rotation schedule
**Why:** Spec reviewer noted it requires maintaining a future schedule. Show what's active now. Cut the rest.

### Removed: MetaPokemon.role and .notes fields
**Why:** Spec reviewer caught that `role` is team-context-dependent (Medicham can lead or close), so assigning a single role in meta data creates confusion. Notes added visual clutter that the UX reviewer said to eliminate from cards. Cards should be: name, types, moveset. Details behind a tap.

### Removed: CounterRec.reason field from card view
**Why:** UX reviewer said counter cards should be scannable — name, type icons, moveset. No paragraph text. Reason/details go behind a tap-to-expand.

### Removed: Per-section error boundaries
**Why:** Spec reviewer said per-section boundaries are premature for a 4-route app. One global boundary is enough.

### Removed: Custom Sentry breadcrumbs and context
**Why:** Spec reviewer said heavy instrumentation is overkill with zero users. Basic Sentry init with default capture. Add custom instrumentation when there's error volume.

### Removed: 10-item accessibility checklist
**Why:** Spec reviewer said too much for solo dev shipping fast. MVP targets the big three: touch targets, contrast, semantic HTML. Remaining items (keyboard nav, ARIA, reduced-motion, Lighthouse >90) are Phase 2 polish that the framework (shadcn) mostly handles by default.

### Added: Auto-copy on result load
**Why:** UX reviewer recommended removing a step from the core flow. User searches → string is already in clipboard → toast says "switch to GO and paste." One fewer tap = less friction on the core value prop.

### Changed: Copy bar anchored at top of results (not floating)
**Why:** UX reviewer originally recommended floating bottom bar. David reviewed and decided floating bars get messy — browser chrome, keyboard, and OS UI all compete for bottom space on mobile. Anchored at top of results is cleaner: user lands on page, search string is the first thing they see, they copy and go. No scroll-jank, no z-index fights.

### Added: Haptic feedback + toast on copy
**Why:** Strategy reviewer said the copy button IS the product and the spec didn't specify the interaction. Haptic feedback confirms the action physically. Toast tells the user what to do next. Selectable text fallback handles clipboard API failures.

### Added: Instant search (no submit button)
**Why:** UX reviewer recommended the PvPoke pattern — results appear as you type. Removes friction, feels faster, keeps the user in flow.

### Added: Month/year in SEO title tags
**Why:** Marketing reviewer noted Google favors recently updated Pokemon GO content. "Giratina Counters (April 2026)" signals freshness and improves ranking.

### Added: "Last updated" timestamps on meta pages
**Why:** Strategy reviewer warned that data going stale by even two weeks will get the app called "dead" on Reddit. Prominent freshness dates build trust. 48-hour update commitment on season rotations.

### Added: Reserved routes for Phase 2
**Why:** Marketing reviewer said shareable team URLs (`/league/[league]/team/[mons]`) are the #1 organic growth lever — players share teams in Discord and Reddit constantly. Planning the URL structure now prevents breaking links later. Also reserved `/raid/` and `/team-rocket/` routes.

### Added: Static generation via generateStaticParams
**Why:** Engineer recommended pre-rendering all counter pages at build time instead of SSR. Static HTML from CDN = instant loads, zero compute cost, handles viral Reddit traffic without hitting Cloudflare's free-tier SSR limits (100K req/day). No ISR needed — rebuild on data update.

### Added: Build-time validation for stale data
**Why:** Engineer recommended a check that warns if all leagues are inactive or dates are in the past. Catches stale data before it deploys and embarrasses you on Reddit.

### Changed: "What should I use?" framing → search string-first positioning
**Why:** Strategy reviewer said "What should I use?" is too vague and sounds like every counter tool. The search string is what differentiates from PvPoke, PokeGenie, GamePress. Lead with the unique mechanic everywhere — product vision, Reddit pitch, page headers.

### Changed: Bottom tab bar treatment
**Why:** UX reviewer said Battle should feel like the whole app. Leagues is secondary. Don't make both tabs equally prominent. Battle is the default, Leagues is a quiet secondary option.

### Changed: Feedback from in-app modal → Google Form link
**Why:** The spec contradicted itself (referenced both). For a beta with <20 users, a Google Form is zero code and zero maintenance. Build in-app feedback when volume justifies it.

### Noted: "Poke Pal" naming has moderate trademark risk
**Why:** Marketing reviewer flagged that The Pokemon Company aggressively protects "Poke" trademarks, and "Poke Pal" is already used by a plush brand. Fine for a free web tool with a disclaimer. Have a backup name ready if it grows. Never use official Pokemon artwork or the Poke Ball icon.

### Noted: Reddit self-promotion rules
**Why:** Marketing reviewer flagged the 9:1 content-to-promotion ratio on r/TheSilphRoad and r/pokemongo. Post a gif of the copy-paste flow in action, not a link drop. Build karma in the subs first. Don't cross-post the same link simultaneously.

### Noted: Retention is weak without collection
**Why:** Marketing reviewer noted there's no reason to return over PvPoke without collection features. For MVP, push PWA install hard (home screen = return visits) and make data updates visible per season rotation so the app feels "alive."
