# PoGo Pal — Pickup Instructions

Last session: 2026-04-16. Version: 1.8.0.
Live at: https://pogopal.com

## What shipped in v1.8.0

1. **Rebrand:** Poke Pal → PoGo Pal. Domains: pogopal.com, pogopal.co, pogopal.net.
2. **Data refresh:** Spring Cup + Master League metas from pvpoke with elite move flags. Rocket lineups (18 grunts, 3 leaders, Giovanni w/ Shadow Tornadus). Raids from LeekDuck (Mega Alakazam, Groudon, shadow Latios).
3. **League ranker:** Autocomplete pokemon ranking per league with score/tier/moveset + elite TM warnings.
4. **Leagues rebuild:** Tab nav, compact meta tiers (collapsible), recommended teams, live/past toggle.
5. **Raid tab:** Dedicated `/raids` page with collapsible tier sections.
6. **Nav:** Icons only, 5 tabs (Home, Raid, Rocket, League, Team). Uniform header heights.
7. **Rocket UX:** Counter-by-type first, "THEY USE [type]" row, quote tags on collapsed, scroll-jump fix. Essentials section removed. Giovanni subtitle wraps.
8. **Counter pages:** Counter-by-type + top counters as collapsible sections.
9. **FAB:** Floating copy button on Team Builder (persistent access mid-workflow). Inline copy on Leagues.
10. **Headers:** Descriptions removed (copy buttons stay fixed). Border-b instead of gradient. Title + tabs on one row.
11. **Home:** Raids section first (expanded by default), 3-col rocket pills, top-4 raid preview + "See all raids" link.
12. **Search string fixes:** `@1type` → `@type` (was missing secondary types). Counter scoring: ATK × bulk × moveDPS × STAB × shadow bonus.
13. **Type badges:** Softened from 500-weight to 700-weight colors.
14. **Dark mode:** Auto-follows system `prefers-color-scheme`. No toggle.
15. **Security:** CSP headers, X-Frame-Options, scan API hardened (media type allowlist, response sanitization). Next.js 16.2.4 (DoS CVE fix). 0 npm audit vulnerabilities.
16. **A11y:** aria-labels on nav, memory leak fixed (Object URL cleanup), !important removed.

## New scripts

```bash
npm run update:raids      # LeekDuck raid bosses
npm run update:rankings   # pvpoke rankings for Spring Cup + Master
npm run update:rockets    # Team Rocket lineups (curated data)
npm run update:all        # All of the above
```

## What's next (v1.9 roadmap)

### For Rachel (design system)
- **Design brief:** `docs/superpowers/specs/2026-04-16-design-system-brief.md`
- 11 pokemon display locations mapped with use cases + recommended variants
- Unified `<TeamCard>` component: compact / default / detailed variants
- Mobbin searches + inspiration apps listed in brief

### Engineering
1. **Reddit launch** — strategy doc at `docs/superpowers/specs/2026-04-16-reddit-launch-strategy.md`
2. **Analytics backend** — wire `src/lib/analytics.ts` to PostHog
3. **Automate raid refresh** — GitHub Action daily cron
4. **pokemon.json splitting** — /teams bundles 1.1MB to client; split to slim dataset
5. **TeamsPage decomposition** — 600+ line god-component → custom hooks
6. **DRY consolidation** — 6 duplicate type defs/constants across components
7. **ARIA combobox** — search dropdowns need role="listbox"/role="option"
8. **Dynamax raids** — no scraper source yet
9. **Shield scenarios** — 0/1/2 shield matchup simulations
10. **User accounts** — server-side storage

## Quick Resume

```bash
cd ~/Projects/Pokemon\ GO/poke-pal
npx next dev --hostname 0.0.0.0 --port 4000
# Test on phone: http://192.168.86.32:4000
# Deploy: npm run deploy (or push to main for auto-deploy)
```
