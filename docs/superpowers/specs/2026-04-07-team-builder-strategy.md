# Team Builder — Product Strategy Analysis

## 1. Competitive Landscape

### PvPoke (pvpoke.com)
The incumbent. Their team builder lets you pick 3-6 Pokemon and shows a threat matrix — which matchups you win, lose, and where you have gaps. It also runs simulations. The problem: it is dense, information-overloaded, and assumes you already know what you want. There is no guidance. You pick 3 Pokemon and it tells you how screwed you are. If you do not already understand the meta, it is useless.

PvPoke does NOT generate search strings. You leave PvPoke, open Pokemon GO, and manually scroll through hundreds of Pokemon trying to remember what you picked. That is the gap.

### PokeGenie
Collection-first. You scan your Pokemon with the camera, it tells you PvP IVs and ranks. It has a "Battle Simulator" but no team builder. It solves "is this Pokemon good?" not "what team should I run?" PokeGenie's strength is its installed base — millions of users with scanned collections. Its weakness is that it requires the scan step before you get any value. No team building workflow.

### PvP IV (apps)
IV checkers. Stadium Gaming, GoStadium, CalcyIV. They answer "what are this Pokemon's PvP IVs?" They do not build teams. Different problem space entirely.

### Pokebattler
Raid-focused. Their PvP features are an afterthought. Pokebattler wins on raid counters with personalized recommendations from imported collections, but their GBL tools are buried and clunky. Not a real competitor in the team building space.

### The gap Poke Pal can exploit
Nobody outputs a team as a search string. Every existing tool ends at "here is your team" and leaves the player to figure out how to find those Pokemon in their storage. PvPoke shows you a threat matrix you cannot act on without memorizing six Pokemon names. Poke Pal closes that last mile: you build a team, you get a search string, you paste it in GO, you see exactly those three Pokemon. Done.

The second gap: guided team building. PvPoke gives you an empty slate. Poke Pal can guide you through it — pick a lead, we suggest partners, you pick a closer, here is your string. Opinionated recommendations instead of a blank canvas.

## 2. User Segments

### Segment A: "I just hit Ace" (60% of team builder users)
Reached Ace rank (2000+ rating), wants to push higher but does not know team theory. They Google "best Great League team" and try whatever Reddit says. They want someone to tell them what to run. They do NOT want to analyze threat matrices.

**Workflow today:** Google "Great League team" -> Reddit post -> screenshot of 3 Pokemon -> manually find them in storage -> lose because they do not understand the team's play pattern.

**What they need:** Pick a Pokemon you like. We build a team around it. Copy the string, paste, go.

### Segment B: "Sweaty tryhard" (25%)
2500+ rating. Already knows the meta. Uses PvPoke simulations. Wants to check team coverage and find anti-meta picks. Will not abandon PvPoke's simulation depth.

**What they need:** Fast coverage check and the search string. They already know what they want — they just need the shortcut into the game. Poke Pal is their second tool, not their first.

### Segment C: "Casual battler" (15%)
Plays GBL for the encounter rewards. Picks their three highest CP Pokemon and hopes for the best. Will not use a team builder at all unless it is dead simple.

**What they need:** "Just give me a team" one-tap experience. They will never touch a coverage matrix.

### Build for Segment A. Segment B will use the search strings regardless. Segment C will not use team builder no matter what you build.

## 3. Differentiation — Search Strings as the Core Angle

This is where Poke Pal wins or loses. The team builder must output a search string as its primary artifact. Not a threat matrix. Not a simulation result. A copyable string.

### What Poke Pal can do that PvPoke cannot (or does not):

**1. "Find your team" search string**
You build a team of Medicham, Registeel, Galarian Stunfisk. Poke Pal gives you: `medicham,registeel,stunfisk`. You paste that in GO and see exactly those three Pokemon. If you have multiple Medicham, you see all of them and pick the best one. PvPoke cannot do this because PvPoke does not think about the in-game moment.

**2. Guided team building with search strings at every step**
Step 1: Pick a lead. Step 2: We show you partners that cover the lead's weaknesses — each with a "Copy to find this Pokemon" string. Step 3: Pick a closer. Final: Here is your team string. Every step has an actionable string. PvPoke's team builder is a blank form you fill in yourself.

**3. "Safe swap" and "closer" strings**
Instead of just the team, generate separate strings for the safe swap role and closer role. When your lead gets countered mid-battle and you need to swap, you already know your safe swap. This is team theory encoded into search strings.

**4. Team + alternatives string**
`medicham,registeel,stunfisk,bastiodon,azumarill` — your team plus 2 alternates in case you do not have one of the core three powered up. PvPoke shows alternatives in a list. Poke Pal puts them all in one pasteable string.

### What Poke Pal should NOT try to do:
- Battle simulations. PvPoke owns this. Do not compete.
- Win/loss percentages. Requires simulation data Poke Pal does not have.
- IV optimization. PokeGenie owns this. Do not compete.

## 4. Growth Potential

### Sharing is the growth engine
Teams are inherently shareable. "What team should I run?" is the #1 question in every Pokemon GO PvP community. If Poke Pal generates a shareable URL for every team, those URLs get posted in Discord servers, Reddit comments, and Twitter threads.

Every shared team URL is a backlink. Every backlink is SEO fuel. Every click from Discord is a new user who sees the search string and thinks "this is useful."

### SEO opportunities
- `/league/great-league/team/medicham-registeel-stunfisk-galarian` is a long-tail keyword page
- "Great League team with Medicham" is a search query that currently returns Reddit threads. A dedicated page with structured content wins this.
- Team pages with meta descriptions like "Great League team: Medicham lead, Registeel safe swap, G-Stunfisk closer. Copy the search string and paste in Pokemon GO." are CTR magnets.

### Return visits
Team builder gives a reason to come back. Counter search is fire-and-forget — you look up Giratina counters once and you are done. But teams change every season. New cups rotate every 2 weeks. Players rebuild teams constantly. Team builder turns Poke Pal from a reference tool into a planning tool.

### Sharing math
If 10% of team builder users share a team URL, and each shared URL gets 5 clicks, that is a 50% viral coefficient on team builder users. That is how free tools grow.

## 5. Shareable URLs

Yes. This is non-negotiable. Teams must be encodable in the URL.

### URL format
```
/league/great-league/team/medicham-registeel-stunfisk-galarian
```

This format is already reserved in the spec. Use it.

### Why URL encoding over database storage
- Zero backend required. Static site stays static.
- URLs are self-contained — they work forever, no database to maintain.
- URLs are human-readable — you can see the team in the URL.
- URLs are copyable from the address bar — zero friction sharing.
- No user accounts needed.

### URL structure details
- Pokemon IDs separated by hyphens (same IDs used in `/counter/[pokemon]`)
- League slug prefix gives context (Great League vs Ultra League matters)
- Order encodes roles: first = lead, second = safe swap, third = closer
- Three Pokemon only. Six-Pokemon teams are for tournaments and are an edge case that does not justify the complexity.

### Edge cases
- Invalid Pokemon ID in URL: show "Go Back" error component, same pattern as counter page 404.
- Pokemon not in the dataset: same error handling.
- Duplicate Pokemon: silently deduplicate and show the team with unique members.
- Wrong league for the cup: show the team anyway but flag "Medicham is not eligible for Master League" with a visual warning.

## 6. Integration with Existing Features

### Counter search -> Team builder
On every counter page (`/counter/medicham`), add a CTA: "Build a team with Medicham" that links to the team builder with Medicham pre-selected as the lead. This is the highest-value cross-link because someone researching counters is one step away from wanting to build a team.

### League meta -> Team builder
On every league meta page (`/league/great-league`), add CTAs on each meta Pokemon: "Build a team around [Pokemon]" linking to team builder with that Pokemon as lead and the league pre-selected. The meta page is where players decide what to run — the team builder is where they assemble it.

### Team builder -> Counter search
On the team page, each Pokemon in the team should link to its counter page. "What beats Medicham?" is a natural question after you have picked Medicham for your team — you want to know your weaknesses.

### Team builder -> League meta
Team page should show which league the team is built for, linking back to the meta page. "See all Great League meta picks" helps users discover Pokemon they might not have considered.

### Search string continuity
The team builder search string should use the same `buildNameSearchString` utility from `src/lib/search-string.ts`. The existing function already handles name lists. The integration is trivial.

## 7. Data Freshness

### How important: Critical for league meta, irrelevant for team builder mechanics.

The team builder itself is type-effectiveness math — it does not go stale. Medicham still beats Registeel regardless of the meta shift. What goes stale is which Pokemon are meta-relevant, and that is the league data, not the team builder.

### Update cadence
- **League meta data:** Every GBL rotation (every 2-4 weeks). The 48-hour commitment from the spec is right.
- **Pokemon dataset:** Only when Niantic adds new Pokemon to GO or changes moves. This happens roughly monthly. Not urgent — most meta shifts are about existing Pokemon getting move updates, not new Pokemon.
- **Type effectiveness:** Never changes. Hardcoded and correct.

### Minimum viable freshness
Update league meta within 48 hours of each GBL season rotation. That is 6-8 updates per GBL season (roughly every 3 months). Miss one update and Reddit will call the site dead. The "Last updated" timestamp is the trust signal.

### What you do NOT need
- Live data feeds. Overkill for a static site.
- Automated scraping of PvPoke rankings. Manual curation is better quality and the cadence is manageable.
- Real-time meta tracking. The meta shifts slowly — weekly at most, and usually only at the start of a new cup.

## 8. Monetization Potential

### Short answer: Do not monetize yet. Pure growth play.

### Why not now
- Zero users. Monetization before product-market fit is premature optimization.
- The Pokemon GO tool ecosystem is dominated by free tools. PvPoke is free. PokeGenie is free with optional premium (for raid coordination, not PvP). Charging for basic team building when PvPoke does it free would kill adoption.
- Ads on a mobile-first PWA with 44px touch targets will either be tiny (no revenue) or intrusive (kills UX). Not worth it.

### Future monetization candidates (Phase 3+)
- **AI team strategy narratives:** "Here is how to play this team — lead Medicham, if you see Azumarill, swap to Registeel..." Generated by Claude API. This is genuinely valuable and defensible. Premium feature.
- **Collection-aware team building:** "From your Pokemon, the best Great League team you can build is..." Requires collection import (Phase 2). Premium tier after free users establish the habit.
- **Tournament team export:** For Silph Arena or community tournaments. Niche but high willingness to pay.
- **Seasonal meta guides:** Comprehensive written guides for each cup rotation. Could be gated or ad-supported.

### The real monetization is distribution
Get 10K monthly active users through SEO and sharing first. Then you have optionality — ads, premium, sponsorships, or just a donation button. None of that matters at zero users.

## 9. MVP Scope

### What delivers value (build this):

**1. Three-slot team tray**
Persistent at the bottom of the screen. Pick Pokemon to fill Lead / Safe Swap / Closer slots. Tap a slot to change it. Visual: three circles with Pokemon sprites or names, always visible.

**2. "Build around [Pokemon]" entry point**
User picks one Pokemon (from search, from meta page, or from counter page). Team builder suggests 2-3 partner options for each remaining slot based on type coverage gaps. User picks from suggestions or searches for their own.

**3. Coverage summary**
Simple visual showing what types the team covers and what gaps remain. Not a full threat matrix — just "Your team is weak to: Fighting, Ground" in plain text with type badges. Enough to make an informed swap.

**4. Team search string**
The output. `medicham,registeel,stunfisk` as a copyable string in the CopyBar component (already built). Auto-copy on team completion, same pattern as counter page.

**5. Shareable team URL**
`/league/great-league/team/medicham-registeel-stunfisk-galarian`. Static page generated or client-rendered from URL params. Shows the team, coverage, and search string. Shareable in Discord/Reddit.

**6. Cross-links**
"Build a team with [Pokemon]" CTAs on counter pages and league meta pages.

### What is over-engineering (do not build):

- Battle simulations or win rates. Requires simulation engine Poke Pal does not have.
- Team rating or score. Implies an accuracy Poke Pal cannot deliver without simulation data.
- Six-Pokemon tournament teams. Triples the complexity for a niche use case.
- Team history or saved teams. Requires user accounts or local storage management. Add later.
- "Meta team" presets (ABB, ABA formations). Cool but adds complexity to an MVP that should focus on the search string output.
- Drag-and-drop reordering. Overkill for 3 slots.
- Pokemon sprite images. Nice-to-have but adds asset management. Text names with type badges are enough.

### Implementation estimate
The team builder MVP is 2-3 days of work:
- Team tray component: 0.5 day
- Partner suggestion logic (type coverage): 0.5 day
- Coverage summary component: 0.5 day
- Team page route with URL encoding: 0.5 day
- Cross-links on existing pages: 0.25 day
- Testing and polish: 0.5 day

### Data requirements
Zero new data. The existing 119-Pokemon dataset, type effectiveness engine, and search string generator are sufficient. Partner suggestions are computed from type coverage gaps — the same logic the counter engine already uses.

## 10. Risk Assessment

### Risk 1: Suggestion quality (HIGH)
The counter engine currently scores Pokemon by ATK stat only (noted in session log: "Currently ATK-only, should factor in bulk/STAB/energy"). If the team builder suggests partners using the same simplistic scoring, it will recommend glass cannons like Alakazam over proven meta picks like Medicham. Bad suggestions will get the tool roasted on Reddit.

**Mitigation:** Use the curated league meta data for suggestions instead of computed counters. If a user picks Medicham as lead in Great League, suggest partners from the Great League meta list. The meta data is already curated and correct. Fall back to computed suggestions only for Pokemon or leagues without curated data.

### Risk 2: Scope creep (HIGH)
Team builder is the feature that killed the MVP timeline the first time — all five spec reviewers flagged it. The temptation to add simulations, ratings, threat matrices, and tournament support is strong. Each addition delays ship date and dilutes the search string differentiator.

**Mitigation:** Hard scope boundary: the MVP outputs a search string and a shareable URL. Nothing else. No simulations, no scores, no ratings. If it does not produce a search string, it does not belong in v1 of team builder.

### Risk 3: Stale suggestions (MEDIUM)
If league meta data goes stale (missed a rotation update), the team builder suggests outdated Pokemon. A team built around a Pokemon that just got nerfed in a move rebalance will make the tool look bad.

**Mitigation:** Already addressed by the 48-hour update commitment and "Last updated" timestamps. Team builder inherits this from league meta. Show the timestamp on the team page too.

### Risk 4: URL fragility (LOW)
If Pokemon IDs change (e.g., renaming `stunfisk-galarian` to `galarian-stunfisk`), all shared team URLs break.

**Mitigation:** Pokemon IDs are already established in the dataset and used in counter page URLs. Changing them would break counter pages too. This is a known constraint, not a new risk from team builder. If IDs must change, add redirects.

### Risk 5: Low engagement (MEDIUM)
Team builder might get built and nobody uses it. The counter search could be the only feature that matters.

**Mitigation:** Cross-links from counter pages and league meta ensure every user sees the team builder. Shareable URLs create organic distribution. If engagement is still low after 30 days, it means counter search is the product and team builder is a nice-to-have. That is fine — you learn fast because the build cost is 2-3 days, not 2-3 months.

---

## Summary: What to build, in what order

1. Ship the MVP without team builder first (already done).
2. Deploy to Cloudflare Pages. Get real users from Reddit.
3. Validate that people actually use counter search and league meta.
4. Build team builder MVP in 2-3 days: team tray, partner suggestions from league meta, coverage summary, search string output, shareable URLs.
5. Cross-link from existing pages.
6. Post a team builder announcement on Reddit with a gif showing the copy-paste flow.
7. Measure: are team URLs getting shared? Are team pages getting traffic? If yes, invest more. If no, move to collection import instead.
