# Poke Pal — Open Items & Future Work

Tracked since 2026-04-07. Updated 2026-04-08 after Phase 2 + Polish session.

Items marked [x] were completed. Remaining items are prioritized by sprint.

---

## Repo & Infrastructure Consolidation

- [x] Create new `poke-pal` GitHub repo for the unified project
- [x] Connect new repo to Cloudflare Pages (new project, not reusing pogo-pal's)
- [x] Decide working directory location — using `Pokemon GO/poke-pal/`
- [ ] Keep pogo-pal.pages.dev live until new app has counter/battle feature parity
- [ ] Then set up Cloudflare redirect: pogo-pal.pages.dev -> poke-pal.pages.dev
- [ ] Archive old projects (move to `Pokemon GO/_archive/` or mark as read-only reference)
- [ ] Decide what happens to poke-pal's existing D1 Worker and database — reuse for collection features or create fresh

---

## Completed (as of v0.3.7)

### Phase 1 — MVP (2026-04-07)
- [x] Counter search with search strings — type a Pokemon, get copyable GO search string
- [x] League meta with tier rankings — Great, Ultra, Master, Fantasy Cup with S/A/B/C tiers
- [x] 119 Pokemon with real GO stats, moves, base stats
- [x] iOS mobile fixes — clipboard fallback, touch targets, active states
- [x] Cloudflare Pages deploy — live at https://poke-pal.pages.dev

### Phase 1.5 — Team Builder (2026-04-08 early)
- [x] Team Builder (`/teams`) — pick 3 Pokemon for any league, see coverage analysis + search string
- [x] In-place team building on league pages — + button on meta cards, floating bar with suggestions
- [x] Fantasy Cup: Great League Edition — Dragon/Steel/Fairy, 14 meta picks

### Phase 2 — Nav + Cleanup (2026-04-08 mid)
- [x] Bottom nav bar — Search | Leagues | Teams on all pages
- [x] Codebase cleanup — dead files removed, TYPE_COLORS extracted, deps cleaned up

### Phase 2 + Polish (2026-04-08 late)
- [x] Leagues landing page (`/leagues`) — Live Now + Coming Up sections
- [x] Home page refocused — search-first, "What's Live" pill links
- [x] Counter page type effectiveness badges — Weak to / Resists with 2x labels
- [x] "Build a team around X (Great League)" button on counter pages
- [x] BackButton with history fallback
- [x] Inline team section replaced floating bar — no more z-index/nav overlap
- [x] Bottom nav positioned correctly with team panel above it
- [x] S tier expanded by default, other tiers collapsed
- [x] Search strings strip parenthetical form names (GO compatibility)
- [x] CopyBar truncated to one line
- [x] "Full Analysis ->" link when team has 2+ Pokemon
- [x] What's Live links styled as tappable pills
- [x] Version banner on all pages (v0.3.7)

---

## Next Sprint — Pre-Launch Polish

- [ ] **Persistent team state (localStorage)** — users lose picks on navigation
- [ ] **OG tags + home page copy rewrite** — dead link previews, no social presence
- [ ] **Shareable clean team URLs** (`/league/[league]/team/[mons]`) — growth engine
- [ ] **Role-based team analysis (lead/mid/closer)** — differentiator
- [ ] **Extract TypeBadge component + remove disabled Sentry** — code health

---

## Future Sprints

- [ ] Active cup automation — auto-rotate with GBL schedule
- [ ] More cups from GBL schedule
- [ ] Better counter scoring — STAB, bulk, energy generation, shield pressure
- [ ] SEO pages for popular teams
- [ ] Collection import (big lift) — requires auth, storage, significant data work
- [ ] Service worker / offline PWA
- [ ] Reddit/Discord launch — gif/video of copy-paste flow

---

## Growth & Distribution

- [ ] **Reddit launch** — r/TheSilphRoad, r/pokemongo, r/PokemonGOBattleLeague. Gif/video of copy-paste flow. Build karma first, US evening timing.
- [ ] **Discord** — join top 3-5 Pokemon GO PvP Discords. Shareable team URLs are the entry point.
- [ ] **Twitter/X** — short clips of the tool in action, timed to GBL season changes and raid rotations.
- [ ] **SEO** — seasonal meta guides, counter pages for new raid bosses.

---

## Accessibility & Quality

- [ ] **ARIA/accessibility pass** — screen reader labels, focus management, keyboard nav on all interactive elements.
- [ ] **Feedback channels** — real Google Form link (currently placeholder), consider Discord server if there's interest.

---

## Legal & IP

- [ ] **Trademark research on "Poke Pal"** — TPC aggressively protects "Poke" + "Pokemon" trademarks. Have 2-3 backup names ready.
- [ ] **Art and visual assets** — never use official Pokemon artwork. Use type-only SVGs or text-only (safest).
- [ ] **Terms of service / privacy policy** — needed before public Reddit launch.
