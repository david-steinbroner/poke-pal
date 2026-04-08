# Team Builder — Marketing & Growth Strategy

## Context

Team Builder is Poke Pal's Phase 2 feature. It lets players build a PvP team of 3 Pokemon, see type coverage and weaknesses, and get copyable search strings for their team. This document covers launch distribution on a $0 budget.

The existing MVP generates counter search strings and has league meta pages. Team Builder adds shareable team URLs as the primary new growth lever.

---

## 1. SEO Strategy

### URL Structure

```
/team                                          → Team Builder landing (entry point)
/team/great-league                             → Team Builder filtered to Great League
/team/ultra-league                             → Team Builder filtered to Ultra League
/team/master-league                            → Team Builder filtered to Master League
/league/great-league/team/medicham-registeel-stunfisk  → Shareable team page (static)
/league/ultra-league/team/giratina-altered-registeel-cresselia
```

The `/league/[league]/team/[mon1]-[mon2]-[mon3]` format was already reserved in the spec. These are the money pages — they get shared in Discord, Reddit, and Google indexes them as long-tail results.

### Pre-built Team Pages (Programmatic SEO)

Generate static pages for the top 20-30 meta teams per league. These are the teams that show up constantly in GBL discussion threads. Examples:

**Great League (1500 CP)**
- `/league/great-league/team/medicham-registeel-stunfisk` (ABB line)
- `/league/great-league/team/bastiodon-medicham-sableye`
- `/league/great-league/team/swampert-registeel-altaria`
- `/league/great-league/team/azumarill-galarian-stunfisk-skarmory`

**Ultra League (2500 CP)**
- `/league/ultra-league/team/giratina-altered-registeel-cresselia`
- `/league/ultra-league/team/swampert-talonflame-walrein`

**Master League (Open)**
- `/league/master-league/team/dialga-giratina-origin-groudon`
- `/league/master-league/team/zacian-mewtwo-kyogre`

Each pre-built page includes:
- The 3 Pokemon with recommended movesets
- Type coverage chart (what types your team covers, what it's weak to)
- Copyable search string for the full team
- "Customize this team" CTA that opens Team Builder with those 3 pre-filled
- Links to each Pokemon's individual counter page

### Target Keywords

| Keyword Pattern | Monthly Search Volume (est.) | Page |
|---|---|---|
| `[pokemon] counters pokemon go` | 1K-10K per mon | `/counter/[pokemon]` (existing) |
| `great league team pokemon go` | 2K-5K | `/team/great-league` |
| `best great league team 2026` | 1K-3K | `/team/great-league` |
| `ultra league team builder` | 500-1K | `/team/ultra-league` |
| `pokemon go pvp team builder` | 1K-3K | `/team` |
| `medicham registeel stunfisk team` | 100-500 | `/league/great-league/team/medicham-registeel-stunfisk` |
| `great league meta [month] 2026` | 1K-5K | `/league/great-league` (existing) |
| `pokemon go search string` | 500-1K | Homepage + all pages |
| `pokemon go search string for [type]` | 100-500 per type | Counter pages |
| `best [league] teams season [N]` | 500-2K | `/team/[league]` |

### Title Tag Format

Follow the existing pattern but add month/year for freshness:

```
Team Builder landing:
"Pokemon GO PvP Team Builder — Build, Analyze & Copy Search Strings (April 2026)"

League-specific builder:
"Great League Team Builder — Pokemon GO PvP (April 2026) - Poke Pal"

Pre-built team pages:
"Medicham + Registeel + Stunfisk Team — Great League Pokemon GO (April 2026)"

Individual counter pages (existing, no change):
"Giratina Counters & Search Strings - Pokemon GO (April 2026)"
```

### Meta Descriptions

```
Team Builder landing:
"Build your Pokemon GO PvP team of 3. See type coverage, find weaknesses, and copy search strings to paste directly in-game. Free, no login."

Pre-built team page:
"Medicham, Registeel, and Galarian Stunfisk Great League team analysis. Coverage chart, weakness breakdown, and copyable search strings for Pokemon GO."
```

### Internal Linking

- Every counter page (`/counter/giratina`) links to popular teams that include that Pokemon
- Every league meta page links to the Team Builder filtered to that league
- Team Builder landing links to pre-built popular teams per league
- Pre-built team pages link back to individual counter pages for each team member

### Structured Data (JSON-LD)

Add HowTo schema to the Team Builder landing page:

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Build a Pokemon GO PvP Team",
  "step": [
    {"text": "Choose your lead Pokemon"},
    {"text": "Pick 2 partners that cover its weaknesses"},
    {"text": "Copy the team search string"},
    {"text": "Paste in Pokemon GO to find your team"}
  ]
}
```

---

## 2. Reddit Strategy

### Subreddit Rules Summary

| Subreddit | Self-Promo Rules | Post Style | Size |
|---|---|---|---|
| r/TheSilphRoad | 9:1 content-to-promo ratio. Must be active commenter. Tool posts allowed if high quality. Mods check post history. | Analysis, research, data-driven. No memes. | ~600K |
| r/PokemonGO | Looser rules. OC tools get upvoted if useful. Screenshots/GIFs do well. | Casual, visual, accessible. Memes welcome. | ~4M |
| r/PokemonGOBattleLeague | Smallest but highest intent. PvP-focused. Tool posts welcome. | Strategy, team comp, meta discussion. | ~60K |

### Pre-Launch: Build Karma (Start Now)

Before posting about Poke Pal, spend 2-3 weeks being genuinely helpful in these subs:

- Answer "what team should I use for Great League" questions with detailed type analysis
- Comment on team comp posts with coverage observations
- Share meta insights during cup rotations
- Upvote and engage with other community tools

This is not optional. Accounts that only post links get removed.

### Launch Post: r/PokemonGOBattleLeague (first)

Post here first because it's the most targeted audience and lowest risk of removal. Use the feedback to refine before posting to bigger subs.

**Post Title:** "I built a free Team Builder that shows your team's type coverage and gives you a search string to copy into GO"

**Post Body:**

```
I kept running into the same problem: I'd build a Great League team on PvPoke, 
then have to manually figure out the search string to find those 3 Pokemon in 
my storage.

So I built Poke Pal's Team Builder. You pick 3 Pokemon, it shows you:
- What types your team covers (and what it doesn't)
- Where your weaknesses overlap
- A search string you can copy and paste directly into Pokemon GO

[GIF: 10-second screen recording showing pick 3 Pokemon → see coverage → tap copy → switch to Pokemon GO → paste → team appears]

It also generates shareable team URLs, so you can send your team comp to 
friends: [example link]

Free, no login, works on any phone. Would love feedback from this community.

Link: [URL]
```

**Key elements:**
- Lead with the problem, not the tool
- GIF is mandatory — Reddit upvotes visuals, not text links
- Show the copy-paste flow in the GIF (this is the differentiator)
- Ask for feedback (invites comments, boosts engagement)
- Do NOT cross-post to all three subs on the same day

### Launch Post: r/TheSilphRoad (2-3 days later)

**Post Title:** "Tool: Team Builder with type coverage analysis and in-game search strings"

**Post Body:**

```
Building on the counter search tool I shared a while back — Poke Pal now has 
a Team Builder.

Pick your 3 Pokemon for any league. It shows:
- Full type coverage chart (what your team hits super effectively)
- Defensive weaknesses (where you're double-weak)
- One-tap copy of a search string that finds all 3 in your Pokemon storage

The team URLs are shareable: pokepal.app/league/great-league/team/medicham-registeel-stunfisk

[GIF of the flow]

Data is updated within 48 hours of every season rotation. Currently covering 
Great League, Ultra League, Master League, and [current cup].

Feedback welcome — especially on coverage accuracy and meta teams I should 
pre-build.
```

**Silph Road specifics:**
- Use the `[Tool]` tag if the sub has one
- Mention data freshness (they care about this)
- Frame as "building on" previous work if you've posted before
- Include technical detail they respect (48-hour update cycle)

### Launch Post: r/PokemonGO (3-5 days after Silph Road)

**Post Title:** "I made a free team builder that gives you a search string to paste right into Pokemon GO [OC]"

**Post Body:**

```
Tired of scrolling through 2000 Pokemon trying to find your Great League team?

I built a tool where you pick your 3 Pokemon, and it gives you a search string 
you can copy and paste directly into Pokemon GO. Your team shows up instantly.

It also tells you what types your team is weak to, so you can fix gaps before 
you hit Battle.

[GIF showing the full flow from pick → copy → paste in GO → team appears]

Free, no app to download, works on your phone browser.

Try it: [URL]
```

**r/PokemonGO specifics:**
- Keep it simple — this is a casual audience
- The GIF does the selling
- Don't use PvP jargon (ABB line, safe swap) — say "your team" and "what it's weak to"
- Tag as [OC] if the sub supports it

### Ongoing Reddit Strategy

After launch, contribute value to stay visible:

- When someone posts "Rate my team" → reply with a Poke Pal link showing their team's coverage
- When season rotations happen → post a quick meta update with links to pre-built teams
- When someone asks "what team for [cup]" → reply with specific team links
- Share interesting coverage gaps you find (e.g., "TIL this 3-Pokemon team has zero weaknesses to any single type")

---

## 3. Discord Strategy

### Target Servers

| Server | Size | How to Share | Notes |
|---|---|---|---|
| Pokemon GO Community (official-adjacent) | 100K+ | #tools-and-resources channel | Most have dedicated channels for tool sharing |
| GO Stadium | 20K+ | #pvp-resources | Competitive PvP community, high intent |
| PvPoke Discord | 10K+ | Tread carefully — this is a competitor's community | Only share if genuinely adding value, not poaching |
| Local Pokemon GO Discords | Varies | #pvp-discussion or #resources | Find through Facebook groups, Silph Road community map |
| Pokemon GO YouTuber Discords | 5K-50K | #resources or #pvp-chat | Share after building rapport |

### Approach Template for Community Managers

Do NOT DM community managers cold with a link. Instead:

1. Join the server and participate for 1-2 weeks
2. Help people with team comp questions using your knowledge
3. When someone asks a team-building question, share a Poke Pal team link naturally
4. If there's a #tools channel, post there after you've been active

**If you do reach out to a mod/admin:**

```
Hey [name] — I've been hanging out in [server] for a bit helping with PvP 
team questions. I built a free team builder tool (Poke Pal) that generates 
search strings you can paste into Pokemon GO. No login, no ads.

Would it be appropriate to share it in #[resources channel]? Happy to have 
you check it out first: [URL]

No worries if it doesn't fit — just wanted to ask before posting.
```

**Key:** Ask permission, don't assume. Mods appreciate being asked.

### Discord-Native Sharing

Team Builder URLs should work well when pasted in Discord:

- Open Graph meta tags so the URL unfurls with a preview (team name, league, Pokemon names)
- Keep the preview image simple: the 3 Pokemon names + league badge
- Make the URL human-readable: `pokepal.app/league/great-league/team/medicham-registeel-stunfisk`

---

## 4. Twitter/X Strategy

### Account Setup

- Handle: @PokePalApp (or similar — check availability)
- Bio: "Free Pokemon GO PvP tool. Build teams, copy search strings, paste in-game. No login, no ads."
- Pinned tweet: GIF of the copy-paste flow

### Hashtags

| Hashtag | Usage |
|---|---|
| #PokemonGO | Every post (mandatory for discoverability) |
| #GoBattleLeague | PvP-specific posts |
| #GBL | Shorter alternative, widely used |
| #PvP | General PvP context |
| #GreatLeague / #UltraLeague / #MasterLeague | League-specific posts |
| #Pokemon | Broad reach, lower intent |
| #PokemonGOPvP | Niche but targeted |

Do NOT use more than 3-4 hashtags per post. Put them at the end, not inline.

### Post Formats That Work

**Format 1: Team of the Day**
```
Great League team of the day:

Medicham (Counter / Ice Punch + Psychic)
Registeel (Lock On / Focus Blast + Flash Cannon)  
G-Stunfisk (Mud Shot / Rock Slide + Earthquake)

Coverage: Hits 14/18 types super effectively
Weakness: Ground (only Medicham resists)

Copy the search string and paste in GO:
[link to team page]

#PokemonGO #GoBattleLeague
```

**Format 2: Quick Tip**
```
If your Great League team is weak to Charm, you're going to have a bad time 
this season.

Check your team's weaknesses before you queue:
[link to team builder]

#PokemonGO #GBL
```

**Format 3: Season Rotation**
```
New GBL season just dropped. Updated meta for:
- Great League
- Ultra League  
- [New Cup]

Pre-built teams for each league ready to copy:
[link]

#PokemonGO #GoBattleLeague
```

**Format 4: Reply Guy Strategy**
Search Twitter for:
- "what team should I use pokemon go"
- "great league team"
- "GBL team help"

Reply with a helpful team suggestion AND a link:
```
That's a solid core 2. For the third slot, you want something that covers 
the Fighting weakness. Try: [team link]
```

This is the highest-ROI Twitter activity. One helpful reply to someone with 5K followers can drive more traffic than 10 original posts.

### Posting Cadence

- 3-4 tweets per week during GBL seasons
- Spike to daily during season rotations and new cup launches
- Always post within 24 hours of a meta shift (new move added, Pokemon rebalance)
- Best times: 6-8 PM local time in US timezones (post-work Pokemon GO hours)

---

## 5. Content Marketing

### Blog/Guide Pages

Create content pages that rank for informational queries and funnel to the tool. These live on the same domain (e.g., `/guide/[slug]`).

**Priority 1: Seasonal Meta Guides**
```
/guide/great-league-meta-season-23
"Great League Meta Guide — Season 23 (April 2026)"
```
- Top meta Pokemon with movesets
- 3-5 recommended teams with shareable links
- What changed from last season
- Search strings for each team
- Update within 48 hours of season start

These are your highest-traffic pages during season launches. Publish the day the season starts.

**Priority 2: Team Archetype Guides**
```
/guide/great-league-abb-teams
"Best ABB Teams for Great League — Pokemon GO PvP"
```
- Explain the team archetype (ABB = 2 Pokemon share a type, lead draws out the counter)
- 5-7 example teams with shareable links
- When to use this archetype vs. others
- Evergreen content, update per season

**Priority 3: "Best Teams" List Posts**
```
/guide/best-great-league-teams-april-2026
"10 Best Great League Teams — April 2026"
```
- Listicle format (performs well in search)
- Each team links to its shareable Team Builder page
- Include budget-friendly teams (not just legendaries)
- Update monthly

**Priority 4: How-To Guides**
```
/guide/pokemon-go-search-strings
"Pokemon GO Search Strings — Complete Guide (2026)"
```
- Comprehensive reference for the search string syntax
- This is a topic with steady search volume and almost no good results
- Position Poke Pal as the authoritative source
- Link to the tool throughout

### Content Calendar

| Timing | Content | Purpose |
|---|---|---|
| Season launch day | Meta guide for each active league | Capture search spike |
| Season launch +1 day | "Best teams" listicle per league | Long-tail capture |
| Mid-season | Team archetype deep dive | Evergreen SEO |
| Cup rotation | Cup-specific guide + pre-built teams | Time-sensitive traffic |
| Ongoing | Search string reference guide (update as needed) | Steady evergreen traffic |

---

## 6. Viral Mechanics

### Shareable Team URLs (Core Growth Loop)

This is the single most important growth lever. The loop:

1. Player builds a team in Team Builder
2. Gets a shareable URL: `pokepal.app/league/great-league/team/medicham-registeel-stunfisk`
3. Shares it in Discord / Reddit / Twitter / group chat
4. Friend clicks, sees the team + coverage + search string
5. Friend builds their own team, shares their URL
6. Repeat

**For this to work, the shared page must deliver value instantly** — no "sign up to see this team" gates. The full team analysis, coverage chart, and search string must be visible on the shared URL with zero friction.

### "Rate My Team" Flow

Add a lightweight rating/feedback mechanic:

1. User builds a team
2. Sees a "Share for feedback" button that generates the URL
3. The shared page includes a "How would you rate this team?" prompt (1-5 stars or thumbs up/down)
4. This gives users a reason to share AND gives recipients a reason to engage

Even without building actual voting, just framing the share as "get feedback on your team" increases sharing intent. People want validation.

### Coverage Score

Give every team a simple score: "Coverage: 14/18 types" or a letter grade (A+, B-, etc.). Scores are inherently shareable — people want to show off good scores and challenge friends to beat them.

```
"My Great League team covers 16/18 types. Can you beat that?"
[Team Builder link]
```

### Social Open Graph Images

When a team URL is shared on any platform, the link preview should show:

- The 3 Pokemon names (text, not images — avoids trademark issues)
- The league name
- The coverage score
- "Built with Poke Pal — Pokemon GO Team Builder"

Generate these as dynamic OG images (Next.js `ImageResponse` API or a static template).

### Compare Teams

"Compare my team vs yours" — two team URLs side by side showing coverage differences. This creates a natural reason for TWO people to use the tool and share results.

---

## 7. Influencer/Creator Outreach

### Target Creators

**Tier 1: Large Pokemon GO YouTubers (100K+ subs)**
| Creator | Channel | Why |
|---|---|---|
| PogoKieng | YouTube, 300K+ | GBL content, reviews tools |
| Reis2Occasion | YouTube, 100K+ | PvP analysis, team building |
| FPSticks | YouTube, 200K+ | GBL content, beginner-friendly |
| HomesliceGO | YouTube, 100K+ | PvP meta analysis |
| JFarmakis | YouTube, 150K+ | GBL commentary |

**Tier 2: Mid-size creators (10K-100K subs)**
- Better outreach success rate than Tier 1
- Often more willing to feature community tools
- Search YouTube for "great league team 2026" and "GBL season [N]" to find active creators

**Tier 3: Twitter/X PvP accounts (1K-10K followers)**
- Easiest to reach, most likely to share
- Search for accounts that regularly post GBL teams and tips

### Outreach Template (Tier 1-2)

```
Subject: Free tool for your GBL viewers — Team Builder with copy-paste search strings

Hi [name],

I watch your [specific recent video] content and noticed you often recommend 
team comps to your viewers. I built a free tool that might be useful for them.

Poke Pal's Team Builder lets players:
- Build a team of 3 and see type coverage instantly
- Copy a search string that finds those exact Pokemon in-game
- Share their team via a URL (great for your Discord or video descriptions)

Example: [link to a team they recently recommended]

It's free, no ads, no login. I built it as a solo project because I kept 
wanting this tool while watching GBL content.

If you think it's useful, I'd love for you to try it. No pressure to feature 
it — just want it in the hands of PvP players.

[Your name]
[URL]
```

**Key principles:**
- Reference their specific content (proves you actually watch)
- Pre-build a team they recently recommended and link to it
- No ask for a "feature" or "shoutout" — let them decide
- Emphasize free/no ads/no login — removes their concern about promoting something sketchy
- Keep it short

### Outreach Template (Tier 3 / Twitter DM)

```
Hey [name] — I built a free PvP team builder that generates search strings 
you can paste into GO. Thought you might find it useful for your team posts.

Here's the team you posted yesterday: [link to their team in Poke Pal]

No login, no ads, just a tool. Let me know what you think.
```

### Timing

Reach out during the first week of a new GBL season when creators are actively making team recommendation content. Your tool becomes immediately useful for their content.

---

## 8. Launch Timing

### Best Windows

| Window | Why | Priority |
|---|---|---|
| GBL Season launch day | Highest search volume for team comps. Everyone is looking for teams. | Best possible timing |
| New cup rotation (every 2 weeks) | Players need new teams for unfamiliar formats | Good secondary window |
| GO Fest / Pokemon GO events | Player activity spikes but PvP isn't the focus | Moderate — good for general awareness |
| Community Day | High activity but not PvP-related | Low priority for Team Builder specifically |

### Recommended Launch Sequence

**Week -3 to -1: Pre-launch**
- Build Reddit karma in all three subs (comment, help, engage)
- Set up Twitter account and post 5-10 GBL tips/team comps
- Join target Discord servers and participate

**Day 0: Soft launch**
- Post in r/PokemonGOBattleLeague (smallest, most targeted)
- Share in 1-2 Discord servers you're active in
- Tweet with GIF

**Day 2-3: Incorporate feedback, fix bugs**
- Respond to every Reddit comment
- Fix any issues people report
- Update pre-built teams if people suggest better ones

**Day 4-5: Main launch**
- Post in r/TheSilphRoad
- Share in remaining Discord servers
- Send influencer outreach emails

**Day 7-10: Broad launch**
- Post in r/PokemonGO
- Tweet threads about specific teams
- Begin "reply guy" strategy on Twitter

**Ongoing: Season rotation cadence**
- Every season rotation (every 2-4 weeks): update meta, publish guides, post on Reddit
- This becomes the recurring growth engine

### Season Alignment

Check the GBL schedule at pokemongolive.com. Ideal launch is 1-3 days before a new season starts, so you're ready when the search volume spikes. If a season just started, wait for the next rotation.

---

## 9. Metrics to Track

### Primary Metrics (Weekly Review)

| Metric | Tool | Target (Month 1) | Why It Matters |
|---|---|---|---|
| Unique visitors | Cloudflare Web Analytics | 1,000+ | Basic reach |
| Team Builder page views | Cloudflare Web Analytics | 500+ | Feature adoption |
| Search string copies | Custom event (Phase 2: Posthog) | Can't track in v0.1 without Posthog | Core value action |
| Shareable team URLs created | Server logs or Cloudflare analytics (unique /league/*/team/* paths) | 100+ | Growth loop health |
| Return visitors (7-day) | Cloudflare Web Analytics | 15%+ of total | Retention signal |

### Secondary Metrics

| Metric | Tool | Why It Matters |
|---|---|---|
| Reddit post upvotes | Manual check | Community reception |
| Reddit comments | Manual check | Engagement depth |
| Google Search Console impressions | GSC (free) | SEO traction |
| Google Search Console clicks | GSC | SEO conversion |
| Indexed pages | GSC | Crawl coverage |
| Referral sources | Cloudflare Analytics | Which channels drive traffic |
| PWA installs | Can track via `beforeinstallprompt` event | Retention potential |
| Bounce rate on team pages | Cloudflare Analytics | Page quality |

### What "Success" Looks Like

**Month 1 (launch month):**
- 1,000+ unique visitors
- 3+ Reddit posts with >50 upvotes
- 100+ shareable team URLs accessed
- At least 1 influencer/creator mentions the tool organically

**Month 3:**
- 5,000+ monthly unique visitors
- Google ranking page 1 for 5+ "[league] team" keywords
- Steady organic traffic from search (not just Reddit spikes)
- Team URLs being shared in Discord servers you didn't post in

**Month 6:**
- 10,000+ monthly unique visitors
- Recognized in the Pokemon GO PvP community as a useful tool
- Organic mentions on Reddit without you posting
- Content pages ranking for seasonal queries

### What to Watch For (Danger Signals)

- Zero return visitors → tool isn't sticky, core loop is broken
- High bounce on team pages → shared URLs aren't delivering value
- No Reddit engagement → post format or timing is wrong
- Stale data complaints → update commitment is failing (kills trust fast)

---

## 10. Zero-Budget Tactics

Everything above is designed for $0. Here's a summary of the highest-ROI free tactics:

### Tier 1: Do These First (Highest Impact)

1. **Shareable team URLs with Open Graph previews** — this is the entire growth engine. Every share is a free ad. Build this well.
2. **Reddit launch posts with GIF** — a single viral Reddit post can drive 5,000+ visitors in a day. The GIF is what makes it shareable.
3. **Pre-built team pages for SEO** — 20-30 static pages for popular teams. Zero ongoing cost, compounds over time.
4. **Google Search Console** — submit sitemap, monitor indexing. Free and essential.

### Tier 2: Do These in Week 2-4

5. **Season rotation meta guides** — publish the day the season starts. Capture the search spike.
6. **Twitter "reply guy" strategy** — search for team questions, reply with helpful links. 20 minutes/day.
7. **Discord sharing** — share in servers where you've built rapport. Don't carpet-bomb.
8. **Influencer outreach (Tier 3 first)** — small PvP Twitter accounts are most likely to respond.

### Tier 3: Ongoing Compound Growth

9. **Search string reference guide** — evergreen content page that ranks for "pokemon go search strings."
10. **Team archetype guides** — evergreen content that links to pre-built teams.
11. **Coverage score as a share hook** — "My team covers 16/18 types" is inherently shareable.
12. **Compare teams** — creates a reason for 2 people to use the tool instead of 1.

### Free Tools to Use

| Tool | Purpose | Cost |
|---|---|---|
| Cloudflare Web Analytics | Traffic, referrers, devices | Free (already set up) |
| Google Search Console | SEO monitoring, indexing | Free |
| Canva | Quick social graphics if needed | Free tier |
| OBS Studio | Screen recording for GIFs | Free |
| ezgif.com | Convert screen recording to GIF | Free |
| TinyPNG | Compress OG images | Free |
| Twitter/X | Distribution | Free |
| Reddit | Distribution | Free |
| Discord | Distribution | Free |

### What NOT to Spend Money On

- Paid ads (Pokemon GO audience is too niche for cost-effective paid acquisition)
- Logo design (text logo is fine, avoid anything that looks like official Pokemon branding)
- Hosting (Cloudflare Pages free tier handles this)
- Analytics (Cloudflare Web Analytics + Google Search Console cover launch needs)
- Email marketing (no email capture mechanism yet, add in Phase 3)

---

## Implementation Checklist

### Before Launch (Build These)

- [ ] Shareable team URLs with full team analysis visible
- [ ] Open Graph meta tags on team pages (title, description, image)
- [ ] Pre-built team pages for top 20-30 meta teams per league
- [ ] `/team` landing page targeting "pokemon go pvp team builder"
- [ ] `/team/[league]` pages targeting "[league] team builder"
- [ ] Coverage score or grade displayed on every team page
- [ ] Internal links from counter pages to teams containing that Pokemon
- [ ] Internal links from league pages to Team Builder
- [ ] Google Search Console verified and sitemap submitted
- [ ] Screen recording of the copy-paste flow converted to GIF

### Launch Week

- [ ] Post in r/PokemonGOBattleLeague (Day 0)
- [ ] Share in 1-2 Discord servers (Day 0)
- [ ] Tweet with GIF (Day 0)
- [ ] Respond to all Reddit comments (Day 0-3)
- [ ] Fix reported issues (Day 1-3)
- [ ] Post in r/TheSilphRoad (Day 4)
- [ ] Send influencer outreach (Day 4-5)
- [ ] Post in r/PokemonGO (Day 7)

### Ongoing (Every Season Rotation)

- [ ] Update league meta data within 48 hours
- [ ] Publish meta guide for each active league
- [ ] Update pre-built team pages
- [ ] Post Reddit update in r/PokemonGOBattleLeague
- [ ] Tweet updated teams
- [ ] Update title tags with current month/year
