# Sprint 3 — Pre-Launch Polish

Sprint goal: Remove the remaining blockers before sharing Poke Pal publicly.

Baseline: v0.3.7, 31 tests, 129 pages, 119 Pokemon, 4 leagues. QA 14/14 PASS. Marketing audit 5/10.

Target: Marketing audit 8/10. Link previews work. Team state persists. Shareable URLs exist.

---

## Feature 1: Persistent Team State

**Problem**: Users lose their team picks when navigating between pages. This is the biggest UX gap — you add 2 Pokemon on a league page, tap a counter link, come back, and your team is gone.

**Solution**: Persist team state per league in localStorage.

### Implementation

- Key format: `poke-pal:team:{leagueId}` (e.g., `poke-pal:team:great-league`)
- Value: JSON array of Pokemon IDs (e.g., `["medicham","registeel","stunfisk-galarian"]`)
- Restore on mount in `league-page-client.tsx` (inline team section) and `teams/page.tsx` (full analysis page)
- When navigating to `/teams`, read from localStorage for the selected league
- Clear button in inline team section — removes the key entirely
- Show team indicator in bottom nav Teams tab: dot badge when any league has a saved team
- Wrap all localStorage access in try/catch for private browsing / storage-full scenarios

### Files to touch
- `src/app/league/[leagueSlug]/league-page-client.tsx` — save on add/remove, restore on mount
- `src/app/teams/page.tsx` — restore on mount for selected league
- `src/components/bottom-nav.tsx` — dot badge on Teams tab
- `src/lib/team-storage.ts` (new) — `saveTeam()`, `loadTeam()`, `clearTeam()`, `hasAnyTeam()` helpers

### Edge cases
- Private browsing: localStorage throws. Catch and degrade silently (team works in-session but doesn't persist).
- Storage full: catch QuotaExceededError, degrade silently.
- Stale Pokemon IDs: if a Pokemon ID in storage doesn't match current data, filter it out on load.
- Multiple tabs: no cross-tab sync needed for v1. Last write wins.

### Tests
- Save and load round-trips correctly
- Clear removes the key
- Invalid JSON in storage doesn't crash (returns empty array)
- Missing Pokemon IDs are filtered out

---

## Feature 2: OG Tags + Home Page Copy

**Problem**: Sharing any Poke Pal link on Discord, Reddit, or iMessage shows a dead preview — no title, no description, no card. The home page headline is generic. Both are launch blockers.

**Solution**: Add OpenGraph and Twitter meta tags. Rewrite home page headline.

### Implementation

#### Root layout (`src/app/layout.tsx`)
- `og:title`: "Poke Pal — Pokemon GO PvP Search Strings"
- `og:description`: "Find counters, build teams, copy search strings. Paste in Pokemon GO."
- `og:type`: "website"
- `og:url`: "https://poke-pal.pages.dev"
- `twitter:card`: "summary"
- `twitter:title`: same as og:title
- `twitter:description`: same as og:description
- No `og:image` yet — needs design work. Omit rather than use a bad placeholder.

#### Counter pages (`src/app/counter/[pokemon]/page.tsx`)
- `og:title`: "{Pokemon} Counters — Pokemon GO Search Strings"
- `og:description`: "Top counters for {Pokemon} in Pokemon GO PvP. Copy the search string, paste in GO."
- Use Next.js `generateMetadata()` export

#### League pages (`src/app/league/[leagueSlug]/page.tsx`)
- `og:title`: "{League Name} Meta — Pokemon GO PvP"
- `og:description`: "S/A/B/C tier rankings for {League Name}. Build a team, copy the search string."
- Use Next.js `generateMetadata()` export

#### Home page copy (`src/app/page.tsx`)
- Headline: "Pokemon GO PvP Search Strings"
- Subtitle: "Find counters, build teams, copy strings. Paste in GO."
- Remove any generic "Welcome to Poke Pal" type copy

### Files to touch
- `src/app/layout.tsx` — root metadata
- `src/app/counter/[pokemon]/page.tsx` — generateMetadata
- `src/app/league/[leagueSlug]/page.tsx` — generateMetadata
- `src/app/page.tsx` — headline/subtitle copy

### Verification
- Deploy to Cloudflare Pages
- Test with https://www.opengraph.xyz/ for each page type
- Test Discord link preview (paste URL in a DM)
- Test iMessage link preview

---

## Feature 3: Shareable Team URLs

**Problem**: Users can't share their team builds. Discord conversations like "I'm running Medicham / Registeel / G-Stunfisk" have no link to share. This is the primary growth mechanism we're missing.

**Solution**: New route that encodes a team in the URL and renders full analysis.

### Implementation

#### New route: `/league/[leagueSlug]/team/[teamSlug]/page.tsx`
- `teamSlug` is hyphen-joined Pokemon IDs: `medicham-registeel-stunfisk-galarian`
- Server component that:
  1. Parses the slug into Pokemon IDs (split on `-`, match against pokemon.json)
  2. Runs `analyzeTeam()` from existing team-analysis.ts
  3. Renders coverage chart, defensive weaknesses, meta threats, search string
- No `generateStaticParams` — too many team combos. Use dynamic rendering.

#### Slug parsing
- Split `teamSlug` on `-`
- Match greedily against known Pokemon IDs (handle multi-word IDs like `stunfisk-galarian` by trying longest match first)
- If any ID doesn't match, show a "Team not found" state with link back to the league page
- Validate team size (1-6 Pokemon, typically 3)

#### OG tags
- `og:title`: "Medicham / Registeel / G-Stunfisk — Great League Team"
- `og:description`: "Team coverage analysis and search string for Pokemon GO PvP."
- Use `generateMetadata()` with the parsed team

#### Share button
- Add "Share" button in inline team section (league pages) and `/teams` page
- Copies the clean URL: `https://poke-pal.pages.dev/league/great-league/team/medicham-registeel-stunfisk-galarian`
- Uses existing clipboard utility with iOS fallback
- Toast confirmation: "Team link copied"

### Files to touch
- `src/app/league/[leagueSlug]/team/[teamSlug]/page.tsx` (new) — server component
- `src/app/league/[leagueSlug]/league-page-client.tsx` — Share button in inline team section
- `src/app/teams/page.tsx` — Share button
- `src/lib/team-slug.ts` (new) — `parseTeamSlug()`, `buildTeamSlug()` helpers

### Edge cases
- Invalid Pokemon IDs in URL: show error state, don't crash
- Empty team slug: redirect to league page
- Duplicate Pokemon in slug: deduplicate silently
- Very long slugs (6+ Pokemon): cap at 6, ignore extras

### Tests
- `buildTeamSlug` produces expected hyphenated string
- `parseTeamSlug` round-trips correctly
- Multi-word Pokemon IDs (stunfisk-galarian) parse correctly
- Invalid IDs return empty matches

---

## Feature 4: Role-Based Team Analysis

**Problem**: Users build a team of 3 but don't know who to lead with, who to swap to, or who to save for end-game. This is what separates good players from great ones. No other search-string tool tells you this.

**Solution**: Assign lead / safe-swap / closer roles to each team member and display them.

### Implementation

#### New types (`src/lib/types.ts`)
```typescript
type TeamRole = "lead" | "safe-swap" | "closer";

interface TeamMemberWithRole {
  pokemon: Pokemon;
  role: TeamRole;
  reasoning: string; // One-line explanation
}
```

#### New function (`src/lib/team-analysis.ts`)
```typescript
function assignRoles(team: Pokemon[], leagueId: string): TeamMemberWithRole[]
```

Logic:
- **Lead**: Best coverage against the league's most common leads (S-tier Pokemon). Highest offensive type advantage score against S/A-tier meta.
- **Safe swap**: Covers the lead's weaknesses. If the lead is weak to Fighting, the safe swap resists Fighting. Evaluated by how many of the lead's "weak to" types the swap resists.
- **Closer**: Wins end-game matchups. Highest bulk stat (DEF * STA) among remaining team members. The closer needs to survive shields-down scenarios.

Reasoning examples:
- "Leads well against Registeel and Bastiodon"
- "Covers Medicham's weakness to Flying and Fairy"
- "High bulk wins shields-down matchups"

#### Display
- In `/teams` page: show role label next to each Pokemon name (pill badge)
- In inline team section on league pages: show role label under each Pokemon name
- Role labels styled as small pills: Lead (blue), Safe Swap (amber), Closer (green)

### Files to touch
- `src/lib/types.ts` — TeamRole, TeamMemberWithRole types
- `src/lib/team-analysis.ts` — `assignRoles()` function
- `src/app/teams/page.tsx` — display role labels
- `src/app/league/[leagueSlug]/league-page-client.tsx` — display role labels in inline team section

### Edge cases
- Team of 1 or 2: assign roles to what's available (1 = lead only, 2 = lead + closer)
- All Pokemon have the same type coverage: fall back to bulk ordering
- No league data available: skip role assignment, don't crash

### Tests
- 3-Pokemon team gets exactly 3 unique roles
- 1-Pokemon team gets "lead" role
- Roles change when team composition changes
- Function doesn't crash with empty team

---

## Feature 5: TypeBadge + Sentry Cleanup

**Problem**: The `TypeBadge` rendering logic (colored pill with type name) is duplicated across 6+ files. Sentry is configured but the DSN is empty and it's not connected — it's dead weight in the bundle.

**Solution**: Extract shared component. Remove unused dependency.

### Implementation

#### Extract TypeBadge (`src/components/type-badge.tsx`)
```typescript
interface TypeBadgeProps {
  type: string;
  className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  // Uses TYPE_COLORS from constants.ts
  // Renders colored pill with type name
}
```

Replace all inline type badge rendering across these files:
- `src/components/pokemon-card.tsx`
- `src/components/meta-pokemon-card.tsx`
- `src/app/counter/[pokemon]/page.tsx`
- `src/app/league/[leagueSlug]/league-page-client.tsx`
- `src/app/teams/page.tsx`
- Any other files with inline type badge rendering

#### Remove Sentry
- Remove `@sentry/nextjs` from `package.json`
- Delete `sentry.client.config.ts`
- Remove any Sentry imports from `next.config.ts` or `layout.tsx`
- Run `npm install` to update lockfile

### Files to touch
- `src/components/type-badge.tsx` (new) — extracted component
- `src/components/pokemon-card.tsx` — use TypeBadge
- `src/components/meta-pokemon-card.tsx` — use TypeBadge
- `src/app/counter/[pokemon]/page.tsx` — use TypeBadge
- `src/app/league/[leagueSlug]/league-page-client.tsx` — use TypeBadge
- `src/app/teams/page.tsx` — use TypeBadge
- `package.json` — remove @sentry/nextjs
- `sentry.client.config.ts` — delete
- `next.config.ts` — remove Sentry references if any

### Verification
- `npx tsc --noEmit` passes
- `npm run build` succeeds
- Visual regression: type badges look identical before and after extraction
- Bundle size decreases (Sentry removal)

---

## Sprint Checklist

- [ ] Feature 1: Persistent team state (localStorage)
- [ ] Feature 2: OG tags + home page copy rewrite
- [ ] Feature 3: Shareable clean team URLs
- [ ] Feature 4: Role-based team analysis
- [ ] Feature 5: TypeBadge extraction + Sentry removal
- [ ] QA round 5: all pages, all features
- [ ] Marketing audit target: 8/10
- [ ] Deploy to Cloudflare Pages
- [ ] Test link previews on Discord, Reddit, iMessage
