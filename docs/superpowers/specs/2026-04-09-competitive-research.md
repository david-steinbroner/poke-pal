# Competitive Research — Pokemon GO Companion App Landscape

Last updated: 2026-04-09

Figma visual companion: [Poke Pal — Screen Layouts > Competitive Research](https://www.figma.com/design/pzUuVqXAuLxl2ucJLIEguv/Poke-Pal-%E2%80%94-Screen-Layouts)

---

## Competitors Analyzed

| Competitor | URL | Lane | Threat Level |
|------------|-----|------|-------------|
| PvPoke | pvpoke.com | Battle simulator + rankings + team builder | High (feature overlap) |
| PokeBase | pokebase.app | Multi-game database + tools | Medium |
| Pokebattler | pokebattler.com | Simulation engine + raid counters | Low (different focus) |
| Pokemon GO Hub | pokemongohub.net | News + guides + database | Low (content site) |
| Leek Duck | leekduck.com | Events + news + resources | Low (different lane) |

---

## PvPoke

**What they do:** Open-source battle simulator, rankings, team builder, training mode.

**UX:** Desktop-first design crammed into mobile. Navigation is 5 big blue buttons stacked vertically — no hierarchy, no priority. Team Builder requires multiple steps: select Pokemon, pick movesets, click 'Rate Team', then scroll to bottom for search string. Information-dense but overwhelming for casual players.

**UI:** Dated visual design — background mountain image behind content, dark blue rounded buttons. Rankings page uses color-coded score bars (good) but layout is cramped on mobile. No design system — each page looks slightly different.

**Branding:** Minimal. Plain text logo 'pvpoke.com' in header. No icon, no mascot, no personality. Reads as 'open-source tool made by a developer' — both its strength (trust) and weakness (polish).

**Features:** Battle simulator (core differentiator), Rankings with score metrics, Team Builder with threat analysis, Training mode vs CPU, Tera Raid Calculator. Deep feature set — the power user tool.

**Values:** Accuracy, depth, transparency (open-source). Built for players who already understand PvP mechanics. No hand-holding.

**Gaps:**
- Search string buried at bottom of Team Builder
- No mobile-first design — tap targets too small
- No onboarding for new players
- Ads take significant viewport space (Marines banner)
- No current league awareness — manual selection only
- No 'what should I do now' coaching flow

---

## PokeBase

**What they do:** Database, Tools & Resources for GO + Champions + TCG Pocket.

**UX:** Portal-style navigation — expandable menu categories dumped vertically. Three games (GO, Champions, TCG Pocket) split attention. Great League tier list has type filter pills but no action. 'My Pokemon' gated behind account creation.

**UI:** Cleaner than PvPoke but generic. White background, gray borders, monospace headings. Tier list uses circular Pokemon avatars in horizontal scroll. Login/Join prominent — pushing accounts before showing value.

**Branding:** Pokeball logo with 'PokeBase'. Cute but not distinctive — pokeball used by dozens of tools. Purple accent is unusual. 'Daily Pull' adds gamification. Discord presence.

**Features:** Full GO database, 5 tier lists, My Pokemon (account-gated), Friend Finder, Mystery Gift Codes, Raid Bosses. Also Champions (Team Builder, Items) and TCG Pocket (Tracker, Decks).

**Values:** Breadth — one-stop-shop for all Pokemon games. Community building. Data completeness over actionability.

**Gaps:**
- No search string generation — tier lists are view-only
- Team Builder only for Champions, not GO
- Three-game spread means nothing done deeply
- Account wall before showing value
- No coaching or 'what to play today' guidance
- Labels own team builder 'V1' — they know it's early

---

## Pokebattler

**What they do:** World's #1 Pokemon GO battle simulator. Raid counters, PvP rankings, Pokebox.

**UX:** Data-dense homepage focused on current raid bosses. Good timeliness. Cluttered: news alerts, Patreon prompts, Discord links compete. PvP has Rankings, Pokedex, Simulator, Matrix tools — powerful but complex. Pokebox (import collection) is standout personalization.

**UI:** Dark blue/teal header, white body. Functional but corporate. Mobile layout works but isn't optimized. Raid bosses as icon grids by tier is effective. Simulation results are extremely data-heavy.

**Branding:** Positioned as 'World's #1 source' — authority-first. Patreon-supported adds trust but creates friction. Brand says 'most accurate' — appeals to hardcore players.

**Features:** Raid counters (30 best per boss), Raid simulator (30M+ sims), PvP rankings/simulator/matrix, Gym simulator, Rocket counters, Pokebox, Public profiles, Raid Party App. PvPoke imports FROM Pokebattler.

**Values:** Simulation accuracy above all. Personalization via Pokebox. This is the backend engine powering the ecosystem.

**Gaps:**
- No GO search string output anywhere
- No PvP team builder — raid-focused
- Desktop-first, not mobile-optimized
- Patreon paywall creates friction
- No league meta guidance — just raw rankings
- Complexity barrier — casual players bounce

---

## Pokemon GO Hub

**What they do:** News, Guides, Events and more. Blog/news site with database on separate subdomain.

**UX:** Content-first blog/news site with database on separate subdomain (db.pokemongohub.net). Tier lists are written articles, not tools. Search strings reference page explains syntax but doesn't generate. Forum adds community.

**UI:** Cloudflare bot protection blocked capture — indicates significant traffic. Article-style layouts, sidebar ads, standard blog formatting for tier lists.

**Branding:** Established media brand. 'News site' not a tool. Authority from editorial content, raid guides, event coverage. Database subdomain suggests tools bolted on later.

**Features:** News & events, Written tier lists (Great/Ultra/Master), Raid counter articles, Search Strings Cheat Sheet (syntax only), Database with Pokedex/Comparer, Forum, PvP IV pages.

**Values:** Editorial authority, timeliness, education. Teaches how to play, doesn't give tools to play better. Recognizes search string value but presents as education.

**Gaps:**
- Search strings explained, not generated
- No team builder at all
- Tier lists are articles — can't copy or act on them
- Database on separate subdomain — disjointed
- No mobile-first design
- Content goes stale between updates

---

## Leek Duck

**What they do:** Pokemon GO News, Events & Resources.

**UX:** Grid-based dashboard homepage — 2-column card layout with icons and short descriptions. Clean information hierarchy. Events page is timeline-based with good visual cues. But like everyone else, it's a portal — 'here are 8 things, pick one.' No guided flow.

**UI:** Best visual design of all competitors. Clean white cards on light gray background, consistent icon style, proper spacing. Dark navy header with duck logo is distinctive. Events page uses actual Pokemon GO event artwork. Mobile-friendly grid.

**Branding:** Strongest brand identity in the space. The leek duck mascot/logo is memorable and charming. Name is playful (Farfetch'd reference). Consistent visual identity. This is the only competitor that feels like a 'brand' rather than a 'tool.'

**Features:** Pen Pal (Friend Finder), Raid Bosses, Egg Hatches, Field Research, Raid NOW, Events calendar, Promo Codes, Rocket Lineups. Primarily reference/news — not a PvP tool.

**Values:** Accessibility and timeliness. Answers 'what's happening in Pokemon GO right now?' Visual, scannable, current. No deep analysis — at-a-glance awareness.

**Gaps:**
- No PvP content at all — no tier lists, no team builder
- No search string generation or even reference
- No battle analysis or counter recommendations
- Pure reference site — no actionable tools
- No personalization or saved data
- Different lane entirely — events/news, not competitive play

---

## Where Poke Pal Wins

Nobody — not PvPoke, not PokeBase, not Pokebattler, not GO Hub — does this:

> "You're playing Great League today. Here's what you'll face. Here's your team. Copy this. Go win."

They're all encyclopedias. Poke Pal is the coach. The search string IS the product. Every competitor either doesn't generate them, buries them, or just explains the syntax.

### Key Differentiators

- Search string as core product (not afterthought)
- Mobile-first design (not desktop crammed into phone)
- Zero setup, no account required
- Focused on one thing: GO PvP
- Opinionated flow: coach, not encyclopedia
- Modern, clean UX

---

## What Poke Pal is NOT

- **Not an encyclopedia.** We don't need every Pokemon, every move, every stat. PvPoke and GO Hub own that. We curate, not catalog.
- **Not a battle simulator.** Pokebattler runs 30M+ simulations. We're not competing on accuracy math. We're competing on speed to action.
- **Not a news site.** Leek Duck and GO Hub cover events. We don't write articles or chase the news cycle.
- **Not a multi-game platform.** PokeBase spreads across GO, Champions, TCG Pocket. We do one thing: GO PvP. That's it.
- **Not a social network.** No friend finder, no raid parties, no forums, no accounts. Zero friction, zero lock-in.
- **Not a power-user tool.** If you need to import a Pokebox or run custom simulations, go to PvPoke. We're for the player who wants to win NOW.

---

## Foundations to Win

- **Search string is the product.** Every screen ends with a copyable GO search string. This is the thing nobody else does. Protect it, perfect it, never bury it.
- **Mobile-first, always.** Players use this on their phone while playing GO. Every tap target 44px+, every flow completable with one hand. Desktop is secondary.
- **Opinionated > comprehensive.** Don't show everything — show the right thing. Curate the meta, recommend the team, tell them what to play today. Be a coach, not a wiki.
- **Current league awareness.** Know what's live in GBL right now. Auto-surface the active cup. 'What should I play today?' should be answered on first load.
- **Zero-setup onboarding.** No account, no import, no configuration. Open the app, see your league, copy the string. Value in under 10 seconds.
- **Design is the moat.** Every competitor looks dated or generic. Clean, modern, delightful UX is how Notion beat wikis and Linear beat Jira. This is a real advantage.
- **Speed to action.** Fewer taps to get the search string than any competitor. Every extra step is a reason to leave. Measure and minimize time-to-copy.
