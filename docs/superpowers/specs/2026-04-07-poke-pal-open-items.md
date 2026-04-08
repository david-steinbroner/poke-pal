# Poke Pal — Open Items & Future Work

Tracked since 2026-04-07. Updated 2026-04-08 after nav + cleanup session.

Items marked [DONE] were completed. Remaining items are prioritized by phase.

---

## Repo & Infrastructure Consolidation

- [x] Create new `poke-pal` GitHub repo for the unified project
- [x] Connect new repo to Cloudflare Pages (new project, not reusing pogo-pal's)
- [x] Decide working directory location — using `Pokemon GO/poke-pal/`
- [ ] Keep pogo-pal.pages.dev live until new app has counter/battle feature parity
- [ ] Then set up Cloudflare redirect: pogo-pal.pages.dev → poke-pal.pages.dev
- [ ] Archive old projects (move to `Pokemon GO/_archive/` or mark as read-only reference)
- [ ] Decide what happens to poke-pal's existing D1 Worker and database — reuse for Phase 2 collection features or create fresh

---

## Completed (as of 2026-04-08)

- [x] Counter search with search strings — type a Pokemon, get copyable GO search string
- [x] League meta with tier rankings — Great, Ultra, Master, Fantasy Cup with S/A/B/C tiers
- [x] Team Builder — pick 3 Pokemon for any league, see coverage analysis + search string
- [x] In-place team building on league pages — + button on meta cards, floating bar with suggestions
- [x] Fantasy Cup: Great League Edition — Dragon/Steel/Fairy, 14 meta picks
- [x] Bottom nav bar — Search | Leagues | Teams on all pages
- [x] Cloudflare Pages deploy — live at https://poke-pal.pages.dev
- [x] Codebase cleanup — dead files removed, TYPE_COLORS extracted, deps cleaned up
- [x] iOS mobile fixes — clipboard fallback, touch targets, active states

---

## UX Polish (Phase 2 — Next)

- [ ] **Team building flow needs to be self-explanatory** — new users don't know they can tap + on league pages to start building. Needs onboarding hint or empty state guidance.
- [ ] **Expandable team panel** — mini player at bottom → full mode with coverage chart. Currently the floating bar is compact but doesn't expand in place.
- [ ] **Counter page improvements** — type matchup visuals (offensive/defensive chart), clearer "why this counter" explanation.

---

## Navigation & Awareness (Phase 2)

- [ ] **Active cup awareness** — only show currently live cups, auto-rotate with GBL schedule. Right now all 4 leagues show equally.
- [ ] **Shareable clean team URLs** — `/league/great-league/team/mon1-mon2-mon3` for social sharing.
- [ ] **"Rate my team" / "What should I run?" quiz entry points** — alternative ways into the team builder for users who don't know what they want.

---

## Data & Scoring (Phase 3)

- [ ] **Better counter scoring** — currently ATK-only. Should factor in STAB, bulk, energy generation, shield pressure.
- [ ] **Data freshness strategy** — who updates league JSON when a new GBL season starts? Commit to 48-hour turnaround. Document the exact steps.
- [ ] **Pokemon data source** — decide on authoritative source: PokeAPI, GO GameMaster file (data-mined), or manual curation.
- [ ] **Budget picks curation** — the 46-pick list needs an owner and quarterly review cadence.
- [ ] **Collection import** (big lift, future) — let users import their Pokemon storage for personalized recommendations. Requires auth, storage, significant data work.

---

## Growth & Distribution (Phase 3)

- [ ] **Reddit launch** — r/TheSilphRoad, r/pokemongo, r/PokemonGOBattleLeague. Gif/video of copy-paste flow. Build karma first, US evening timing.
- [ ] **Discord** — join top 3-5 Pokemon GO PvP Discords. Shareable team URLs are the entry point.
- [ ] **Twitter/X** — short clips of the tool in action, timed to GBL season changes and raid rotations.
- [ ] **SEO** — seasonal meta guides ("Great League meta April 2026"), counter pages for new raid bosses.
- [ ] **Service worker for offline PWA** — cache static pages for offline use.

---

## Accessibility & Quality

- [ ] **ARIA/accessibility pass** — screen reader labels, focus management, keyboard nav on all interactive elements.
- [ ] **Feedback channels** — real Google Form link (currently placeholder), consider Discord server if there's interest.

---

## Business & Strategy Documents

None blocking the build. Most improve after shipping with real user data.

- [ ] **Roadmap** — see `2026-04-08-roadmap.md`
- [ ] **Strategy one-pager** — positioning, differentiation, first 3 growth moves
- [ ] **Market/competitive analysis** — PvPoke, PokeGenie, GamePress, Pokebattler, Stadium Gaming
- [ ] **Monetization strategy** — ads? premium? donations? Decide after usage data

---

## Legal & IP

Pokemon fan projects operate in a gray area. Stay within the rules.

- [ ] **Trademark research on "Poke Pal"** — TPC aggressively protects "Poke" + "Pokemon" trademarks. Have 2-3 backup names ready.
- [ ] **Art and visual assets** — never use official Pokemon artwork. Use type-only SVGs or text-only (safest).
- [ ] **Terms of service / privacy policy** — needed before public Reddit launch. Cloudflare Web Analytics is cookieless/GDPR-compliant, minimal exposure.
