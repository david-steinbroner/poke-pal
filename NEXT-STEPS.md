# PoGo Pal — Pickup Instructions

Last session: 2026-04-16. Version: 1.8.0.

## What shipped in v1.8.0

1. **Data refresh:** Spring Cup (Fairy/Grass/Water, 1500 CP) + Master League metas from pvpoke with elite move flags. Rocket lineups updated (18 grunts, 3 leaders, Giovanni w/ Shadow Tornadus). Raids refreshed from LeekDuck.
2. **League ranker:** "How does YOUR pokemon rank?" input on Leagues page. Autocomplete over 1560 pokemon, lazy-loads pvpoke rankings per league, shows rank/score/tier/moveset with elite TM warnings.
3. **Leagues rebuild:** Tab-based navigation (active leagues only), compact meta list with tier badges and elite move flags, Rocket-style collapsible recommended teams with 2-col pokemon pills.
4. **Raid tab:** New dedicated `/raids` page with collapsible tier sections mirroring Rocket page pattern.
5. **Nav reorder:** Home, Raid, Rocket, League, Team — icon + stacked label for iPhone SE fit.
6. **Rocket UX fixes:** Counter-by-type renders first (faster to copy). Type badge moved from header to "THEY USE" row. Quote tags visible when collapsed. Scroll-jump fix on deep-link.
7. **FAB (floating action button):** Quick-access button for copy-to-clipboard search strings on relevant pages.
8. **Header unification:** Consistent page header component across all routes — same layout, spacing, and back-nav behavior.
9. **Home polish:** "See more" buttons enlarged to 44pt tap targets.
10. **Bottom nav hidden on Leagues** — leagues page has its own tab navigation.

## New scripts

```bash
npm run update:raids      # LeekDuck raid bosses
npm run update:rankings   # pvpoke rankings for Spring Cup + Master
npm run update:rockets    # Team Rocket lineups (curated data)
npm run update:all        # All of the above
```

## What's next

1. **Deploy to Cloudflare Pages** — build passes, ready to push.
2. **Reddit launch** — post to r/TheSilphArena + r/pokemongo. Draft the post.
3. **Analytics backend** — `src/lib/analytics.ts` logs to console; wire to PostHog or self-hosted.
4. **Automate raid refresh** — GitHub Action daily cron to pull LeekDuck data.
5. **Dynamax raids** — no scraper source yet; monitor for community data.
6. **Shield scenario matchups** — simulate 0/1/2 shield scenarios for pokemon battles.
7. **IV/rank lookup integration** — let users check IV spreads and stat-product ranks.
8. **Legacy/elite move warnings on more pages** — extend elite TM flags beyond Leagues to Raids, Rockets, and Team.
9. **User accounts with server-side storage** — persist teams and preferences across devices.

## Quick Resume

```bash
cd ~/Projects/Pokemon\ GO/poke-pal
npx next dev --hostname 0.0.0.0 --port 4000
# Test on phone: http://192.168.86.32:4000
```
