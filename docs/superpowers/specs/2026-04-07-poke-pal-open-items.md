# Poke Pal — Open Items & Future Work

Things that need to happen but are not blocking the MVP build. Documented here so nothing gets lost. Solve these as they become relevant.

---

## Repo & Infrastructure Consolidation

**Current state:**
- pogo-pal: GitHub repo (`david-steinbroner/pogo-pal`), 267 commits, live on pogo-pal.pages.dev via Cloudflare Pages
- battle-buddy: no git repo, local only, not deployed
- poke-pal: no git repo, local only, has a Cloudflare D1 Worker (may or may not be deployed)

**What needs to happen:**
- [ ] Create new `poke-pal` GitHub repo for the unified project
- [ ] Connect new repo to Cloudflare Pages (new project, not reusing pogo-pal's)
- [ ] Decide working directory location (e.g., `Pokemon GO/poke-pal-app/` vs replacing existing `poke-pal/`)
- [ ] Keep pogo-pal.pages.dev live until new app has counter/battle feature parity
- [ ] Then set up Cloudflare redirect: pogo-pal.pages.dev → new domain
- [ ] Archive old projects (move to `Pokemon GO/_archive/` or mark as read-only reference)
- [ ] Decide what happens to poke-pal's existing D1 Worker and database — reuse for Phase 2 collection features or create fresh

---

## Business & Strategy Documents

None of these are blocking the build. Most get better after shipping with real user data.

- [ ] **Roadmap** — phased feature plan with rough timelines. Write after MVP ships and first user feedback arrives.
- [ ] **Strategy one-pager** — positioning, target user, competitive differentiation, first 3 growth moves. Could write a lightweight version now, flesh out later.
- [ ] **Market/competitive analysis** — PvPoke, PokeGenie, GamePress, Pokebattler, Stadium Gaming. What each does well, where the gaps are, where Poke Pal fits. Worth doing before Reddit launch to sharpen the pitch.
- [ ] **Business plan** — only relevant if pursuing monetization or investment. Premature until there are users and usage data.
- [ ] **Monetization strategy** — ads? premium tier? donations? Decide after understanding usage patterns. The spec mentions "paywall candidates" in Phase 3 but no specifics yet.

---

## Legal & IP

Pokemon fan projects operate in a gray area. Document the rules and stay within them.

- [ ] **Trademark research on "Poke Pal"** — The Pokemon Company aggressively protects "Poke" + "Pokemon" trademarks. "Poke Pal" is also used by at least one existing plush brand. Research whether this name is safe for a free web tool vs. a monetized product. Have 2-3 backup names ready.
- [ ] **Backup name options** — brainstorm alternatives that don't use "Poke," "Mon," or other Nintendo/TPC-adjacent terms. Examples to explore: GO Buddy, Battle Strings, Counter Copy, etc. (all need vetting)
- [ ] **Art and visual assets** — never use official Pokemon artwork, sprites, Poke Ball icons, or Nintendo assets. Options:
  - Type icons: create original SVGs (pogo-pal already has custom type icons — evaluate reuse)
  - Pokemon images: use silhouettes, or text-only (safest), or link to a community sprite resource that has clear licensing
  - App icon: must be original, no Poke Ball or Pokemon imagery
- [ ] **IP law basics to understand:**
  - Fan projects are tolerated as long as they're free, non-commercial, and don't use official assets
  - Monetization (ads, premium) increases legal risk significantly
  - The Pokemon Company has sent C&Ds to fan projects before (PokeVision, various Pokedex apps)
  - A "not affiliated with" disclaimer helps but doesn't provide legal protection
  - Consider: is this a hobby project or a business? The answer changes the risk profile.
- [ ] **Terms of service / privacy policy** — needed if collecting any data (even analytics). Cloudflare Web Analytics is cookieless and GDPR-compliant, so minimal exposure. Google Form feedback may collect emails. Write a simple privacy page before launching publicly.

---

## Community & Distribution

- [ ] **Reddit strategy:**
  - Target subs: r/TheSilphRoad (400K, serious PvP/research), r/pokemongo (4M, casual), r/PokemonGOBattleLeague (smaller, highly targeted)
  - 9:1 content-to-promotion ratio enforced on all subs. Build karma by contributing genuinely before posting the tool.
  - Launch post format: gif/video of the copy-paste flow in action, not a text post with a link. "I built a free tool that..." framing works well.
  - Don't cross-post simultaneously — mods communicate across Pokemon GO subs
  - Timing: post during US evening hours (highest Reddit Pokemon GO traffic)
- [ ] **Discord:**
  - Pokemon GO PvP Discord servers are where team-sharing happens most
  - Shareable team URLs (Phase 2) are the entry point here
  - Find the top 3-5 Pokemon GO Discord communities and join them before launching
- [ ] **Feedback channels:**
  - Google Form (MVP) — link in the app menu
  - Reddit comments on launch post — monitor and respond
  - Consider: a dedicated Discord server for Poke Pal? Only if there's enough interest to justify it. Don't create an empty community.
- [ ] **Content marketing (Phase 3):**
  - Seasonal meta guides (auto-generated or manually written) that rank for "Great League meta [month] [year]"
  - "Best counters for [new raid boss]" posts timed to raid rotations
  - These drive SEO backlinks and establish authority

---

## Data & Content Operations

- [ ] **Meta data update process:** Who updates the league JSON when a new GBL season starts? How long does it take? Commit to 48-hour turnaround. Document the exact steps so it's not bottlenecked on one person.
- [ ] **Pokemon data source:** Need to decide on the authoritative source for Pokemon stats, moves, and type data. Options: PokeAPI, Pokemon GO GameMaster file (data-mined), manual curation. GameMaster is most accurate for GO-specific data but changes with every app update.
- [ ] **Budget picks curation:** The ~50-80 "budget picks" list needs an owner and update cadence. Community moves shift which Pokemon are accessible. Review quarterly at minimum.
- [ ] **Raid boss / Rocket lineup tracking (Phase 2):** These rotate frequently. Need either a manual update process or a data source that can be scraped/pulled.
