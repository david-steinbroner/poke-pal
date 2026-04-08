# Poke Pal — Engineering Standards

This document will become the project's CLAUDE.md when the repo is created. It governs every coding session.

## Project Overview

Poke Pal is a Pokemon GO companion web app. It gives players copyable search strings for any counter. Built with Next.js App Router, Tailwind, shadcn/ui, deployed to Cloudflare Pages.

## Build & Test

```bash
npm run dev          # local dev server
npm run build        # production build (must pass before any push)
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
```

Run `npm run build` after every feature. Run `npm run lint && npm run typecheck` before every commit.

## Build Order

Build sequentially in this order. Each layer depends on the one before it.

**Phase 0 — Skeleton (do first, commit once)**
Next.js project init, Tailwind + shadcn/ui, TypeScript strict, PWA manifest, Sentry init, Cloudflare Pages config, app layout shell with header/nav, error boundary, global styles.

**Phase 1 — Data Layer**
1. Type effectiveness engine (`src/lib/type-effectiveness.ts`)
2. Search string generator (`src/lib/search-string.ts`)
3. Pokemon reference data JSON (`src/data/pokemon.json`, `src/data/moves.json`)
4. League/meta data JSON (`src/data/leagues/`)
5. Budget picks list (`src/data/budget-picks.json`)
6. Build-time validation script (`scripts/validate-data.ts`)

These are independent of UI. Write unit tests alongside each module.

**Phase 2 — Shared Components**
1. CopyBar (floating bottom bar with copy button + toast)
2. PokemonCard (counter card: name, types, moveset, expandable)
3. SearchInput (autocomplete with debounce)
4. ErrorStates (Retry, GoBack, Offline)
5. LeagueCard, MetaPokemonCard, TierAccordion

**Phase 3 — Routes**
1. `/` — home with search box and quick-picks
2. `/counter/[pokemon]` — counter results page with static generation
3. `/league/[league-slug]` — league meta page with static generation

**Phase 4 — Polish**
SEO metadata, PWA install prompt, hamburger menu (About, Feedback link, version), final Lighthouse check.

### Agent Strategy

Phases 1-3 can use parallel agents only within a phase, not across phases.

- **Phase 1:** Items 1-2 (type effectiveness + search strings) run in parallel. Items 3-5 (data files) run in parallel. Item 6 depends on all prior items.
- **Phase 2:** All components are independent — run in parallel.
- **Phase 3:** Route `/` first (search box), then `/counter/[pokemon]` and `/league/[league-slug]` in parallel.

## Git Workflow

**Commit frequency:** One commit per completed unit of work. A unit is: one data module with its tests, one component, one route, or one config change. Do not batch unrelated work.

**Commit message format:**
```
feat: add type effectiveness engine with unit tests
fix: correct dragon double-resistance calculation
chore: configure Sentry and PWA manifest
refactor: extract search string formatting to utility
```

Prefix: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`. Lowercase. No period. Under 72 characters.

**When to push:** After each phase completes and build passes. Never push broken builds.

**Branch strategy:** Work on `main` for MVP. No feature branches for solo dev.

## Session Handoff

At end of every session, update `SESSION_LOG.md` in project root:

```markdown
## Session: YYYY-MM-DD

### Completed
- [list of what shipped, with file paths]

### Next Up
- [exact next task, specific enough to start immediately]

### Blockers
- [anything broken, unclear, or waiting on external input]

### Build Status
- Last build: PASS/FAIL
- Last commit: [hash + message]
```

Keep entries concise. This is how the next session picks up instantly.

## Code Standards

### TypeScript
- Strict mode (`strict: true`).
- No `any`. Use `unknown` and narrow.
- Export typed interfaces for all public APIs.
- Prefer `type` over `interface` unless extending.

### Naming
- Files: `kebab-case.ts`, `kebab-case.tsx`
- Components: `PascalCase` in code, `kebab-case.tsx` filename. Example: `CopyBar` in `copy-bar.tsx`.
- Functions/variables: `camelCase`. Names read like English: `getCountersFor`, `buildSearchString`, `isLeagueActive`.
- No abbreviations. `pokemon` not `pkmn`. `recommendation` not `rec`.
- Constants: `UPPER_SNAKE_CASE` for true constants.

### Components
- One component per file. Co-locate types at top.
- Props type: `[ComponentName]Props`.
- Named exports, no default exports.
- Flat structure — sub-components in same directory, not nested folders.
- No emojis or decorative icons in rendered text.
- Max file length: 300 lines. Split if longer.

### Imports
Order: React/Next → third-party → project aliases (`@/lib`, `@/components`, `@/data`) → relative. Blank line between groups.

### Tailwind / CSS
- Utility-first. No custom CSS unless Tailwind cannot express it.
- Default spacing scale only. No arbitrary values (`w-[137px]`).
- Dark mode via shadcn built-in. Respect `prefers-color-scheme`.
- No custom color palette in v0.1.

## Project Structure

```
src/
  app/
    layout.tsx              # root layout, error boundary, fonts
    page.tsx                # home (search box + quick-picks)
    counter/
      [pokemon]/
        page.tsx            # counter results
    league/
      [league-slug]/
        page.tsx            # league meta
  components/
    copy-bar.tsx
    pokemon-card.tsx
    search-input.tsx
    error-states.tsx
    league-card.tsx
    meta-pokemon-card.tsx
    tier-accordion.tsx
    header.tsx
    menu-sheet.tsx
  lib/
    type-effectiveness.ts
    search-string.ts
    types.ts
    constants.ts
    utils.ts
  data/
    pokemon.json
    moves.json
    budget-picks.json
    leagues/
      great-league.json
      ultra-league.json
      master-league.json
scripts/
  validate-data.ts
public/
  manifest.json
```

Components are shared, not co-located with routes. Routes stay thin — they compose components and fetch data.

## Documentation

- **README.md:** Project description, tech stack, how to run, how to deploy. Update when adding routes or changing build.
- **CLAUDE.md:** This file. The rules. Update only when conventions change.
- **SESSION_LOG.md:** Updated every session. See Session Handoff above.
- **CHANGELOG.md:** Update when pushing a phase. Standard keepachangelog format.
- Do not create other docs unless explicitly asked.

## Infrastructure Setup (Phase 0 — Before Feature Code)

1. **GitHub repo:** `gh repo create poke-pal --public`. Add `.gitignore` (Node). Push skeleton.
2. **Next.js init:** `npx create-next-app@latest` with App Router, TypeScript, Tailwind, ESLint. Add shadcn/ui.
3. **Cloudflare Pages:** Connect GitHub repo in Cloudflare dashboard. Build command: `npm run build`. Install `@cloudflare/next-on-pages`.
4. **PWA manifest:** `public/manifest.json` with app name, icons, `display: standalone`, theme color.
5. **Sentry:** `npm install @sentry/nextjs`. Run setup wizard. DSN in env var, never hardcode.
6. **Cloudflare Web Analytics:** Enable in Cloudflare dashboard. No code.
7. **Google Form:** Create form (feedback text required, email optional). Get share link for menu.

All of this ships as Phase 0. No feature code until this builds on Cloudflare.

## Design Conventions

- No emojis anywhere in the UI.
- No decorative icons. Text labels for everything. Icons only for: hamburger menu, close (X), copy, expand/collapse chevron.
- Typography: system font stack (`font-sans`). `text-sm` secondary, `text-base` body, `text-lg` headings, `text-xl` page titles.
- Spacing: Tailwind defaults only. No arbitrary values.
- Color: shadcn default palette with dark mode. No custom colors.
- Touch targets: 44px minimum (`min-h-11 min-w-11`).
- Clean and functional. No gradients, no shadows deeper than `shadow-sm`, no animations beyond transitions.
- Mobile-first. Design for 375px, scale up.

## Testing & Quality

**What to test:**
- Type effectiveness: all 18 types, dual-type interactions, GO multipliers. Compare 10 matchups vs PvPoke.
- Search string generator: output format, combinators, edge cases.
- Build-time validation: catches stale dates, missing fields, empty arrays.
- Components: manual browser testing in v0.1. Component tests in Phase 2.

**Before every push:**
1. `npm run lint` passes
2. `npm run typecheck` passes
3. `npm run build` passes
4. Manual: search works, copy works, counter page renders, league page renders

**"Done" for each feature:**
- Renders on mobile (375px) and desktop (1280px)
- Dark mode doesn't break layout or contrast
- No TypeScript errors, no console errors
- Build passes

## Security

- Never hardcode API keys or secrets.
- Sentry DSN in environment variables.
- No `.env` files committed.
- Validate all URL params in dynamic routes. Unknown slugs get GoBack error, not a crash.
