# Poke Pal MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy Poke Pal v0.1 — a Pokemon GO companion that gives players copyable search strings for any counter, plus league meta info.

**Architecture:** Next.js App Router with static generation for all pages. Data lives in JSON files. Type effectiveness engine computes counters at build time. Search string generator converts counter data into Pokemon GO paste-able syntax. Deployed to Cloudflare Pages.

**Tech Stack:** Next.js 15, React 19, TypeScript (strict), Tailwind CSS, shadcn/ui, @cloudflare/next-on-pages, Sentry, Vitest

**Spec:** `docs/superpowers/specs/2026-04-07-poke-pal-unified-design.md`
**Standards:** `docs/superpowers/specs/2026-04-07-poke-pal-engineering-standards.md`

**Reference code to port:**
- Type effectiveness matrix: `../battle-buddy/src/data/types.ts` (GO multipliers, full 18x18 matrix)
- Type chart (super/resist/immune): `../pogo-pal/src/state.js` lines 31-50
- Budget counters data: `../pogo-pal/src/data/budgetCounters.js`
- Pokemon name→type mappings: `../pogo-pal/src/csv/pokedex.js` (~600 Pokemon)

---

## File Structure

```
poke-pal/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout, fonts, error boundary, metadata
│   │   ├── page.tsx                      # Home — search box + quick-picks
│   │   ├── counter/
│   │   │   └── [pokemon]/
│   │   │       └── page.tsx              # Counter results page (static gen)
│   │   └── league/
│   │       └── [leagueSlug]/
│   │           └── page.tsx              # League meta page (static gen)
│   ├── components/
│   │   ├── copy-bar.tsx                  # Search string display + copy button + toast
│   │   ├── pokemon-card.tsx              # Counter card: name, types, moveset, expandable
│   │   ├── search-input.tsx              # Autocomplete search with debounce
│   │   ├── error-states.tsx              # Retry, GoBack, Offline components
│   │   ├── league-card.tsx               # League/cup card for leagues landing
│   │   ├── meta-pokemon-card.tsx         # Pokemon card within league meta tiers
│   │   ├── tier-accordion.tsx            # Collapsible S/A/B/C tier sections
│   │   ├── header.tsx                    # App header with tabs and hamburger
│   │   ├── menu-sheet.tsx                # Slide-out menu (About, Feedback, Version)
│   │   └── toast-provider.tsx            # Toast notification system
│   ├── lib/
│   │   ├── types.ts                      # All TypeScript types (Pokemon, Move, League, etc.)
│   │   ├── type-effectiveness.ts         # GO type chart, multiplier calculations
│   │   ├── search-string.ts              # Pokemon GO search string generator
│   │   ├── counters.ts                   # Counter recommendation engine
│   │   ├── constants.ts                  # App-wide constants
│   │   └── utils.ts                      # Shared utilities (cn, formatDate, etc.)
│   └── data/
│       ├── pokemon.json                  # ~200 battle-relevant Pokemon with types + moves
│       ├── moves.json                    # Move data (name, type, pvp power/energy)
│       ├── budget-picks.json             # ~50-80 accessible counter Pokemon
│       └── leagues/
│           ├── great-league.json         # Great League meta
│           ├── ultra-league.json         # Ultra League meta
│           └── master-league.json        # Master League meta
├── scripts/
│   └── validate-data.ts                  # Build-time data validation
├── public/
│   └── manifest.json                     # PWA manifest
├── __tests__/
│   ├── type-effectiveness.test.ts        # Type chart unit tests
│   ├── search-string.test.ts             # Search string generator tests
│   ├── counters.test.ts                  # Counter engine tests
│   └── validate-data.test.ts             # Data validation tests
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .gitignore
├── .env.example                          # Sentry DSN placeholder
├── CLAUDE.md                             # Engineering standards (from spec)
├── SESSION_LOG.md
├── CHANGELOG.md
└── README.md
```

---

## Chunk 1: Phase 0 — Project Skeleton

Everything here must build and deploy before any feature code.

### Task 1: Create GitHub repo and init Next.js project

**Files:**
- Create: entire project scaffold
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`

- [ ] **Step 1: Create GitHub repo**

```bash
cd "/Users/davidsteinbroner/Projects/Pokemon GO/poke-pal"
gh repo create poke-pal --public --description "Pokemon GO search string companion" --clone=false
git init
```

- [ ] **Step 2: Init Next.js project in current directory**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Select: App Router, TypeScript, Tailwind, ESLint, src/ directory, `@/*` import alias.

- [ ] **Step 3: Verify it builds**

```bash
npm run build
```

Expected: Build succeeds, `.next/` directory created.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: init Next.js project with TypeScript, Tailwind, App Router"
```

---

### Task 2: Add shadcn/ui

**Files:**
- Modify: `tailwind.config.ts`
- Create: `src/lib/utils.ts`
- Create: `components.json`

- [ ] **Step 1: Init shadcn**

```bash
npx shadcn@latest init
```

Select: New York style, Zinc base color, CSS variables for colors.

- [ ] **Step 2: Add components we'll need**

```bash
npx shadcn@latest add button input sheet accordion collapsible
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: add shadcn/ui with button, input, sheet, accordion, collapsible"
```

---

### Task 3: TypeScript strict mode and lint config

**Files:**
- Modify: `tsconfig.json`
- Modify: `package.json` (add typecheck script)

- [ ] **Step 1: Enable strict mode in tsconfig.json**

Verify `"strict": true` is set (create-next-app usually sets this). Add:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **Step 2: Add typecheck script to package.json**

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 3: Run lint and typecheck**

```bash
npm run lint && npm run typecheck
```

Expected: Both pass.

- [ ] **Step 4: Commit**

```bash
git add tsconfig.json package.json
git commit -m "chore: enable strict TypeScript and add typecheck script"
```

---

### Task 4: PWA manifest

**Files:**
- Create: `public/manifest.json`
- Modify: `src/app/layout.tsx` (add manifest link)

- [ ] **Step 1: Create manifest.json**

```json
{
  "name": "Poke Pal",
  "short_name": "Poke Pal",
  "description": "Pokemon GO search strings for any counter",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#09090b",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 2: Add manifest link to layout.tsx metadata**

In `src/app/layout.tsx`, add to the metadata export:

```typescript
export const metadata: Metadata = {
  title: "Poke Pal — Pokemon GO Search Strings",
  description: "Copyable Pokemon GO search strings for any counter. Type the boss, copy the string, paste in GO.",
  manifest: "/manifest.json",
};
```

- [ ] **Step 3: Create placeholder icons**

Create simple 192x192 and 512x512 PNG placeholders (solid color square with "PP" text). These get replaced with real icons later.

- [ ] **Step 4: Commit**

```bash
git add public/manifest.json src/app/layout.tsx public/icon-192.png public/icon-512.png
git commit -m "chore: add PWA manifest and placeholder icons"
```

---

### Task 5: Sentry setup

**Files:**
- Create: `.env.example`
- Create: `.env.local` (not committed)
- Modify: `src/app/layout.tsx`
- Create: `sentry.client.config.ts`

- [ ] **Step 1: Install Sentry**

```bash
npm install @sentry/nextjs
```

- [ ] **Step 2: Create .env.example**

```
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

- [ ] **Step 3: Create sentry.client.config.ts**

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  release: "poke-pal@0.1.0",
});
```

- [ ] **Step 4: Add .env.local to .gitignore**

Verify `.env*.local` is in `.gitignore` (create-next-app includes this by default).

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add .env.example sentry.client.config.ts package.json package-lock.json .gitignore
git commit -m "chore: add Sentry with basic error capture"
```

---

### Task 6: Cloudflare Pages config

**Files:**
- Modify: `next.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Cloudflare adapter**

```bash
npm install @cloudflare/next-on-pages
npm install --save-dev wrangler
```

- [ ] **Step 2: Update next.config.ts for Cloudflare**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
```

Note: We're using full static export (`output: "export"`) since all pages are statically generated. This is the simplest Cloudflare Pages setup — no Workers, no edge runtime. Just HTML files on a CDN.

- [ ] **Step 3: Add deploy script to package.json**

```json
{
  "scripts": {
    "deploy": "npm run build && wrangler pages deploy .next/static"
  }
}
```

Note: The actual Cloudflare Pages connection (GitHub auto-deploy) is configured in the Cloudflare dashboard, not in code. This script is for manual deploys.

- [ ] **Step 4: Verify build produces static output**

```bash
npm run build
ls out/
```

Expected: `out/` directory with static HTML files.

- [ ] **Step 5: Commit**

```bash
git add next.config.ts package.json package-lock.json
git commit -m "chore: configure static export for Cloudflare Pages"
```

---

### Task 7: App layout shell

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/globals.css` (modify existing)
- Create: `src/components/header.tsx`
- Create: `src/app/page.tsx` (replace default)

- [ ] **Step 1: Write root layout with system font, dark mode support**

`src/app/layout.tsx`:

```typescript
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Poke Pal — Pokemon GO Search Strings",
  description: "Copyable Pokemon GO search strings for any counter. Type the boss, copy the string, paste in GO.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <main className="mx-auto max-w-lg px-4 pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Write header component**

`src/components/header.tsx`:

```typescript
"use client";

import { useState } from "react";
import { MenuSheet } from "./menu-sheet";

type Tab = "battle" | "leagues";

export function Header({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 bg-background pb-2 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Poke Pal</h1>
        <button
          className="min-h-11 min-w-11 flex items-center justify-center"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
      <nav className="mt-2 flex gap-2">
        <button
          className={`min-h-11 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "battle"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => onTabChange("battle")}
        >
          Battle
        </button>
        <button
          className={`min-h-11 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "leagues"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => onTabChange("leagues")}
        >
          Leagues
        </button>
      </nav>
      <MenuSheet open={menuOpen} onOpenChange={setMenuOpen} />
    </header>
  );
}
```

- [ ] **Step 3: Write placeholder menu sheet**

`src/components/menu-sheet.tsx`:

```typescript
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const FEEDBACK_URL = "https://forms.gle/PLACEHOLDER"; // Replace with real Google Form URL

export function MenuSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Poke Pal</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            v0.1.0
          </p>
          <a
            href={FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm underline"
          >
            Send Feedback
          </a>
          <div className="text-xs text-muted-foreground">
            <p>Not affiliated with Niantic, The Pokemon Company, or Nintendo.</p>
            <p className="mt-1">Built by David Steinbroner</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 4: Replace default home page with placeholder**

`src/app/page.tsx`:

```typescript
export default function Home() {
  return (
    <div className="py-8 text-center">
      <p className="text-muted-foreground">Search coming soon.</p>
    </div>
  );
}
```

- [ ] **Step 5: Clean up globals.css**

Keep only Tailwind directives and shadcn CSS variables. Remove all default Next.js demo styles.

- [ ] **Step 6: Verify build and run dev**

```bash
npm run build && npm run dev
```

Visit `http://localhost:3000` — should see "Poke Pal" header with Battle/Leagues tabs and placeholder content.

- [ ] **Step 7: Commit**

```bash
git add src/ public/
git commit -m "feat: add app layout shell with header, tabs, and menu"
```

---

### Task 8: Error boundary

**Files:**
- Create: `src/app/error.tsx`
- Create: `src/app/not-found.tsx`
- Create: `src/components/error-states.tsx`

- [ ] **Step 1: Write error state components**

`src/components/error-states.tsx`:

```typescript
"use client";

import { Button } from "@/components/ui/button";

export function RetryError({
  message = "Something went wrong. Please try again.",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="text-muted-foreground">{message}</p>
      <Button onClick={onRetry} className="min-h-11">
        Retry
      </Button>
    </div>
  );
}

export function GoBackError({
  message = "Page not found.",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="text-muted-foreground">{message}</p>
      <Button asChild className="min-h-11">
        <a href="/">Go Back</a>
      </Button>
    </div>
  );
}

export function OfflineError() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="text-muted-foreground">
        You appear to be offline. Check your connection and try again.
      </p>
      <Button onClick={() => window.location.reload()} className="min-h-11">
        Retry
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Write global error boundary**

`src/app/error.tsx`:

```typescript
"use client";

import { RetryError } from "@/components/error-states";

export default function Error({ reset }: { reset: () => void }) {
  return <RetryError onRetry={reset} />;
}
```

- [ ] **Step 3: Write not-found page**

`src/app/not-found.tsx`:

```typescript
import { GoBackError } from "@/components/error-states";

export default function NotFound() {
  return <GoBackError />;
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/error-states.tsx src/app/error.tsx src/app/not-found.tsx
git commit -m "feat: add error boundary and error state components"
```

---

### Task 9: Push Phase 0 to GitHub

- [ ] **Step 1: Final build check**

```bash
npm run lint && npm run typecheck && npm run build
```

All must pass.

- [ ] **Step 2: Push to GitHub**

```bash
git remote add origin https://github.com/david-steinbroner/poke-pal.git
git branch -M main
git push -u origin main
```

- [ ] **Step 3: Connect Cloudflare Pages**

In Cloudflare dashboard:
1. Pages → Create a project → Connect to Git
2. Select `poke-pal` repo
3. Build command: `npm run build`
4. Build output directory: `out`
5. Deploy

- [ ] **Step 4: Verify deployment**

Visit the Cloudflare Pages URL. Should see the app shell.

---

## Chunk 2: Phase 1 — Data Layer

All modules in this phase are independent of UI. Each gets unit tests.

### Task 10: TypeScript types

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Write all shared types**

`src/lib/types.ts`:

```typescript
export const POKEMON_TYPES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy",
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

export type Pokemon = {
  id: string;
  name: string;
  types: PokemonType[];
  fastMoves: Move[];
  chargedMoves: Move[];
  baseStats: { atk: number; def: number; sta: number };
};

export type Move = {
  name: string;
  type: PokemonType;
  isCharged: boolean;
  pvpPower: number;
  pvpEnergy: number;
};

export type CounterRecommendation = {
  pokemon: string;
  fastMove: string;
  chargedMoves: string[];
  tier: "top" | "budget";
};

export type League = {
  id: string;
  name: string;
  cpCap: number;
  typeRestrictions?: PokemonType[];
  season: string;
  active: boolean;
  startDate: string;
  endDate: string;
  lastUpdated: string;
  meta: MetaPokemon[];
};

export type MetaPokemon = {
  pokemonId: string;
  tier: "S" | "A" | "B" | "C";
  recommendedFast: string;
  recommendedCharged: string[];
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add shared TypeScript types for Pokemon, moves, leagues"
```

---

### Task 11: Type effectiveness engine

**Files:**
- Create: `src/lib/type-effectiveness.ts`
- Create: `__tests__/type-effectiveness.test.ts`

Port from `../battle-buddy/src/data/types.ts` — it already has the correct GO multipliers in a clean 18x18 matrix format.

- [ ] **Step 1: Write the failing tests**

`__tests__/type-effectiveness.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  getEffectiveness,
  getSuperEffectiveTypes,
  getResistantTypes,
  getWeakToTypes,
} from "@/lib/type-effectiveness";

describe("getEffectiveness", () => {
  it("returns 1.6 for fire attacking grass", () => {
    expect(getEffectiveness("Fire", ["Grass"])).toBeCloseTo(1.6);
  });

  it("returns 0.625 for fire attacking water", () => {
    expect(getEffectiveness("Fire", ["Water"])).toBeCloseTo(0.625);
  });

  it("returns 0.391 for electric attacking ground (GO immune)", () => {
    expect(getEffectiveness("Electric", ["Ground"])).toBeCloseTo(0.391);
  });

  it("multiplies for dual types: fire vs grass/steel = 1.6 * 1.6 = 2.56", () => {
    expect(getEffectiveness("Fire", ["Grass", "Steel"])).toBeCloseTo(2.56);
  });

  it("handles opposing dual types: fire vs water/rock = 0.625 * 0.625 = 0.390625", () => {
    expect(getEffectiveness("Fire", ["Water", "Rock"])).toBeCloseTo(0.390625);
  });

  it("returns 1.0 for neutral matchup", () => {
    expect(getEffectiveness("Normal", ["Fire"])).toBeCloseTo(1.0);
  });
});

describe("getSuperEffectiveTypes", () => {
  it("returns correct types for a mono-type defender", () => {
    const result = getSuperEffectiveTypes(["Dragon"]);
    expect(result).toContain("Ice");
    expect(result).toContain("Dragon");
    expect(result).toContain("Fairy");
    expect(result).not.toContain("Fire");
  });

  it("sorts by multiplier descending for dual types", () => {
    // Ground/Dragon: Ice is 1.6*1.6=2.56, Dragon is 1.6*1.0=1.6
    const result = getSuperEffectiveTypes(["Ground", "Dragon"]);
    const iceIndex = result.indexOf("Ice");
    const dragonIndex = result.indexOf("Dragon");
    expect(iceIndex).toBeLessThan(dragonIndex);
  });
});

describe("getWeakToTypes (what the defender hits hard)", () => {
  it("returns fire's offensive strengths", () => {
    const result = getWeakToTypes(["Fire"]);
    expect(result).toContain("Grass");
    expect(result).toContain("Bug");
    expect(result).toContain("Ice");
    expect(result).toContain("Steel");
  });
});
```

- [ ] **Step 2: Install Vitest and run tests to verify they fail**

```bash
npm install --save-dev vitest @vitejs/plugin-react
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Create `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

```bash
npm test
```

Expected: FAIL — modules don't exist yet.

- [ ] **Step 3: Write the type effectiveness engine**

`src/lib/type-effectiveness.ts`:

```typescript
import { type PokemonType, POKEMON_TYPES } from "./types";

const SE = 1.6;
const NE = 1.0;
const NVE = 0.625;
const IMM = 0.391;

// Full 18x18 effectiveness matrix: CHART[attackType][defenderType]
// Ported from battle-buddy/src/data/types.ts
const CHART: Record<PokemonType, Record<PokemonType, number>> = {
  Normal:   { Normal: NE, Fire: NE, Water: NE, Electric: NE, Grass: NE, Ice: NE, Fighting: NE, Poison: NE, Ground: NE, Flying: NE, Psychic: NE, Bug: NE, Rock: NVE, Ghost: IMM, Dragon: NE, Dark: NE, Steel: NVE, Fairy: NE },
  Fire:     { Normal: NE, Fire: NVE, Water: NVE, Electric: NE, Grass: SE, Ice: SE, Fighting: NE, Poison: NE, Ground: NE, Flying: NE, Psychic: NE, Bug: SE, Rock: NVE, Ghost: NE, Dragon: NVE, Dark: NE, Steel: SE, Fairy: NE },
  Water:    { Normal: NE, Fire: SE, Water: NVE, Electric: NE, Grass: NVE, Ice: NE, Fighting: NE, Poison: NE, Ground: SE, Flying: NE, Psychic: NE, Bug: NE, Rock: SE, Ghost: NE, Dragon: NVE, Dark: NE, Steel: NE, Fairy: NE },
  Electric: { Normal: NE, Fire: NE, Water: SE, Electric: NVE, Grass: NVE, Ice: NE, Fighting: NE, Poison: NE, Ground: IMM, Flying: SE, Psychic: NE, Bug: NE, Rock: NE, Ghost: NE, Dragon: NVE, Dark: NE, Steel: NVE, Fairy: NE },
  Grass:    { Normal: NE, Fire: NVE, Water: SE, Electric: NE, Grass: NVE, Ice: NE, Fighting: NE, Poison: NVE, Ground: SE, Flying: NVE, Psychic: NE, Bug: NVE, Rock: SE, Ghost: NE, Dragon: NVE, Dark: NE, Steel: NVE, Fairy: NE },
  Ice:      { Normal: NE, Fire: NVE, Water: NVE, Electric: NE, Grass: SE, Ice: NVE, Fighting: NE, Poison: NE, Ground: SE, Flying: SE, Psychic: NE, Bug: NE, Rock: NE, Ghost: NE, Dragon: SE, Dark: NE, Steel: NVE, Fairy: NE },
  Fighting: { Normal: SE, Fire: NE, Water: NE, Electric: NE, Grass: NE, Ice: SE, Fighting: NE, Poison: NVE, Ground: NE, Flying: NVE, Psychic: NVE, Bug: NVE, Rock: SE, Ghost: IMM, Dragon: NE, Dark: SE, Steel: SE, Fairy: NVE },
  Poison:   { Normal: NE, Fire: NE, Water: NE, Electric: NE, Grass: SE, Ice: NE, Fighting: NE, Poison: NVE, Ground: NVE, Flying: NE, Psychic: NE, Bug: NE, Rock: NVE, Ghost: NVE, Dragon: NE, Dark: NE, Steel: IMM, Fairy: SE },
  Ground:   { Normal: NE, Fire: SE, Water: NE, Electric: SE, Grass: NVE, Ice: NE, Fighting: NE, Poison: SE, Ground: NE, Flying: IMM, Psychic: NE, Bug: NVE, Rock: SE, Ghost: NE, Dragon: NE, Dark: NE, Steel: SE, Fairy: NE },
  Flying:   { Normal: NE, Fire: NE, Water: NE, Electric: NVE, Grass: SE, Ice: NE, Fighting: SE, Poison: NE, Ground: NE, Flying: NE, Psychic: NE, Bug: SE, Rock: NVE, Ghost: NE, Dragon: NE, Dark: NE, Steel: NVE, Fairy: NE },
  Psychic:  { Normal: NE, Fire: NE, Water: NE, Electric: NE, Grass: NE, Ice: NE, Fighting: SE, Poison: SE, Ground: NE, Flying: NE, Psychic: NVE, Bug: NE, Rock: NE, Ghost: NE, Dragon: NE, Dark: IMM, Steel: NVE, Fairy: NE },
  Bug:      { Normal: NE, Fire: NVE, Water: NE, Electric: NE, Grass: SE, Ice: NE, Fighting: NVE, Poison: NVE, Ground: NE, Flying: NVE, Psychic: SE, Bug: NE, Rock: NE, Ghost: NVE, Dragon: NE, Dark: SE, Steel: NVE, Fairy: NVE },
  Rock:     { Normal: NE, Fire: SE, Water: NE, Electric: NE, Grass: NE, Ice: SE, Fighting: NVE, Poison: NE, Ground: NVE, Flying: SE, Psychic: NE, Bug: SE, Rock: NE, Ghost: NE, Dragon: NE, Dark: NE, Steel: NVE, Fairy: NE },
  Ghost:    { Normal: IMM, Fire: NE, Water: NE, Electric: NE, Grass: NE, Ice: NE, Fighting: NE, Poison: NE, Ground: NE, Flying: NE, Psychic: SE, Bug: NE, Rock: NE, Ghost: SE, Dragon: NE, Dark: NVE, Steel: NE, Fairy: NE },
  Dragon:   { Normal: NE, Fire: NE, Water: NE, Electric: NE, Grass: NE, Ice: NE, Fighting: NE, Poison: NE, Ground: NE, Flying: NE, Psychic: NE, Bug: NE, Rock: NE, Ghost: NE, Dragon: SE, Dark: NE, Steel: NVE, Fairy: IMM },
  Dark:     { Normal: NE, Fire: NE, Water: NE, Electric: NE, Grass: NE, Ice: NE, Fighting: NVE, Poison: NE, Ground: NE, Flying: NE, Psychic: SE, Bug: NE, Rock: NE, Ghost: SE, Dragon: NE, Dark: NVE, Steel: NVE, Fairy: NVE },
  Steel:    { Normal: NE, Fire: NVE, Water: NVE, Electric: NVE, Grass: NE, Ice: SE, Fighting: NE, Poison: NE, Ground: NE, Flying: NE, Psychic: NE, Bug: NE, Rock: SE, Ghost: NE, Dragon: NE, Dark: NE, Steel: NVE, Fairy: SE },
  Fairy:    { Normal: NE, Fire: NVE, Water: NE, Electric: NE, Grass: NE, Ice: NE, Fighting: SE, Poison: NVE, Ground: NE, Flying: NE, Psychic: NE, Bug: NE, Rock: NE, Ghost: NE, Dragon: SE, Dark: SE, Steel: NVE, Fairy: NE },
};

/** Get damage multiplier for an attack type against defender type(s) */
export function getEffectiveness(
  attackType: PokemonType,
  defenderTypes: PokemonType[],
): number {
  let multiplier = 1.0;
  for (const defType of defenderTypes) {
    multiplier *= CHART[attackType][defType];
  }
  return multiplier;
}

/** Get attack types that are super effective against defender, sorted by multiplier desc */
export function getSuperEffectiveTypes(
  defenderTypes: PokemonType[],
): PokemonType[] {
  return POKEMON_TYPES
    .filter((atkType) => getEffectiveness(atkType, defenderTypes) > 1.0)
    .sort(
      (a, b) =>
        getEffectiveness(b, defenderTypes) - getEffectiveness(a, defenderTypes),
    );
}

/** Get types the defender resists (attack types that deal reduced damage) */
export function getResistantTypes(
  defenderTypes: PokemonType[],
): PokemonType[] {
  return POKEMON_TYPES.filter(
    (atkType) => getEffectiveness(atkType, defenderTypes) < 1.0,
  );
}

/** Get types the defender hits hard offensively (what the defender's types are super effective against) */
export function getWeakToTypes(
  defenderTypes: PokemonType[],
): PokemonType[] {
  const dangerous: PokemonType[] = [];
  for (const defType of defenderTypes) {
    for (const targetType of POKEMON_TYPES) {
      if (CHART[defType][targetType] > 1.0 && !dangerous.includes(targetType)) {
        dangerous.push(targetType);
      }
    }
  }
  return dangerous;
}
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/type-effectiveness.ts __tests__/type-effectiveness.test.ts vitest.config.ts package.json package-lock.json
git commit -m "feat: add type effectiveness engine with GO multipliers and tests"
```

---

### Task 12: Search string generator

**Files:**
- Create: `src/lib/search-string.ts`
- Create: `__tests__/search-string.test.ts`

- [ ] **Step 1: Write the failing tests**

`__tests__/search-string.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  buildTypeSearchString,
  buildNameSearchString,
  buildShadowSearchString,
  buildHighCpSearchString,
  buildLeagueEligibleString,
} from "@/lib/search-string";

describe("buildTypeSearchString", () => {
  it("joins types with commas using @1 prefix", () => {
    expect(buildTypeSearchString(["Dark", "Dragon", "Fairy"])).toBe(
      "@1dark,@1dragon,@1fairy"
    );
  });

  it("lowercases type names", () => {
    expect(buildTypeSearchString(["Fire"])).toBe("@1fire");
  });

  it("returns empty string for empty array", () => {
    expect(buildTypeSearchString([])).toBe("");
  });
});

describe("buildNameSearchString", () => {
  it("joins Pokemon names with commas", () => {
    expect(buildNameSearchString(["Garchomp", "Rayquaza", "Salamence"])).toBe(
      "garchomp,rayquaza,salamence"
    );
  });
});

describe("buildShadowSearchString", () => {
  it("adds shadow filter to type string", () => {
    expect(buildShadowSearchString(["Dark", "Ice"])).toBe(
      "shadow&@1dark,@1ice"
    );
  });
});

describe("buildHighCpSearchString", () => {
  it("adds CP floor to type string", () => {
    expect(buildHighCpSearchString(["Dark", "Ice"], 2500)).toBe(
      "@1dark,@1ice&cp2500-"
    );
  });
});

describe("buildLeagueEligibleString", () => {
  it("builds CP cap string for Great League", () => {
    expect(buildLeagueEligibleString(1500)).toBe("cp-1500");
  });

  it("builds CP cap string for Ultra League", () => {
    expect(buildLeagueEligibleString(2500)).toBe("cp-2500");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- __tests__/search-string.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Write the search string generator**

`src/lib/search-string.ts`:

```typescript
import type { PokemonType } from "./types";

/** Build a Pokemon GO search string from super-effective attack types.
 *  Output format: @1dark,@1dragon,@1fairy
 *  The @1 prefix in Pokemon GO filters by move type. */
export function buildTypeSearchString(types: PokemonType[]): string {
  if (types.length === 0) return "";
  return types.map((t) => `@1${t.toLowerCase()}`).join(",");
}

/** Build a search string from specific Pokemon names.
 *  Output format: garchomp,rayquaza,salamence */
export function buildNameSearchString(names: string[]): string {
  return names.map((n) => n.toLowerCase()).join(",");
}

/** Build a shadow-only variant of a type search string.
 *  Output format: shadow&@1dark,@1ice */
export function buildShadowSearchString(types: PokemonType[]): string {
  const typeString = buildTypeSearchString(types);
  if (!typeString) return "";
  return `shadow&${typeString}`;
}

/** Build a high-CP variant of a type search string.
 *  Output format: @1dark,@1ice&cp2500- */
export function buildHighCpSearchString(
  types: PokemonType[],
  minCp: number,
): string {
  const typeString = buildTypeSearchString(types);
  if (!typeString) return "";
  return `${typeString}&cp${minCp}-`;
}

/** Build a league eligibility search string by CP cap.
 *  Output format: cp-1500 (finds Pokemon at or below 1500 CP) */
export function buildLeagueEligibleString(cpCap: number): string {
  return `cp-${cpCap}`;
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- __tests__/search-string.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/search-string.ts __tests__/search-string.test.ts
git commit -m "feat: add Pokemon GO search string generator with tests"
```

---

### Task 13: Pokemon and move reference data

**Files:**
- Create: `src/data/pokemon.json`
- Create: `src/data/moves.json`
- Create: `src/lib/constants.ts`

This is the largest data task. We need ~200 battle-relevant Pokemon (not all 900+). Start with the top counters and meta Pokemon, expand later.

- [ ] **Step 1: Create constants file**

`src/lib/constants.ts`:

```typescript
export const APP_VERSION = "0.1.0";

export const QUICK_PICKS = [
  "giratina-altered",
  "medicham",
  "stunfisk-galarian",
  "dialga",
  "swampert",
  "mewtwo",
  "kyogre",
  "rayquaza",
] as const;
```

- [ ] **Step 2: Create starter Pokemon data**

`src/data/pokemon.json` — Start with ~30-50 key Pokemon that appear as top counters or meta picks. Structure matches the `Pokemon` type. This gets expanded before launch but needs enough data to build and test all UI.

Create a JSON file with entries like:
```json
[
  {
    "id": "garchomp",
    "name": "Garchomp",
    "types": ["Dragon", "Ground"],
    "fastMoves": [
      { "name": "Dragon Tail", "type": "Dragon", "isCharged": false, "pvpPower": 13, "pvpEnergy": 9 },
      { "name": "Mud Shot", "type": "Ground", "isCharged": false, "pvpPower": 3, "pvpEnergy": 9 }
    ],
    "chargedMoves": [
      { "name": "Outrage", "type": "Dragon", "isCharged": true, "pvpPower": 110, "pvpEnergy": 60 },
      { "name": "Earthquake", "type": "Ground", "isCharged": true, "pvpPower": 120, "pvpEnergy": 65 },
      { "name": "Sand Tomb", "type": "Ground", "isCharged": true, "pvpPower": 25, "pvpEnergy": 40 }
    ],
    "baseStats": { "atk": 261, "def": 193, "sta": 239 }
  }
]
```

Include at minimum: Garchomp, Giratina-Altered, Giratina-Origin, Mewtwo, Kyogre, Rayquaza, Dialga, Swampert, Medicham, Stunfisk-Galarian, Machamp, Tyranitar, Mamoswine, Togekiss, Lucario, Metagross, Dragonite, Salamence, Rhyperior, Excadrill, Darkrai, Chandelure, Glaceon, Rampardos, Terrakion, Palkia, Zekrom, Reshiram, Landorus, Registeel, Azumarill, Trevenant, Bastiodon, Sableye, Altaria.

Source stats/moves from PokeAPI or PvPoke. Exact data to be populated during execution — the schema is what matters for the plan.

- [ ] **Step 3: Create starter moves data**

`src/data/moves.json` — All moves referenced by the Pokemon in pokemon.json. Same structure as the `Move` type.

- [ ] **Step 4: Commit**

```bash
git add src/data/pokemon.json src/data/moves.json src/lib/constants.ts
git commit -m "feat: add starter Pokemon and move reference data (~35 Pokemon)"
```

---

### Task 14: Budget picks data

**Files:**
- Create: `src/data/budget-picks.json`

- [ ] **Step 1: Create budget picks list**

`src/data/budget-picks.json` — Array of Pokemon IDs that are widely accessible (no legendaries, no XL candy exclusive, no legacy moves required). Reference: `../pogo-pal/src/data/budgetCounters.js`

```json
[
  "machamp",
  "swampert",
  "glaceon",
  "espeon",
  "roserade",
  "mamoswine",
  "electivire",
  "magnezone",
  "togekiss",
  "excadrill",
  "chandelure",
  "hydreigon",
  "haxorus",
  "darmanitan",
  "gengar",
  "alakazam",
  "dragonite",
  "gyarados",
  "hariyama",
  "golem",
  "aggron",
  "honchkrow",
  "weavile",
  "gardevoir",
  "salamence"
]
```

Expand to 50-80 entries during execution.

- [ ] **Step 2: Commit**

```bash
git add src/data/budget-picks.json
git commit -m "feat: add budget picks list (~25 accessible counter Pokemon)"
```

---

### Task 15: League meta data

**Files:**
- Create: `src/data/leagues/great-league.json`
- Create: `src/data/leagues/ultra-league.json`
- Create: `src/data/leagues/master-league.json`

- [ ] **Step 1: Create Great League meta**

`src/data/leagues/great-league.json`:

```json
{
  "id": "great-league",
  "name": "Great League",
  "cpCap": 1500,
  "season": "Season 22",
  "active": true,
  "startDate": "2026-03-25",
  "endDate": "2026-04-22",
  "lastUpdated": "2026-04-07",
  "meta": [
    {
      "pokemonId": "medicham",
      "tier": "S",
      "recommendedFast": "Counter",
      "recommendedCharged": ["Ice Punch", "Psychic"]
    },
    {
      "pokemonId": "stunfisk-galarian",
      "tier": "S",
      "recommendedFast": "Mud Shot",
      "recommendedCharged": ["Rock Slide", "Earthquake"]
    }
  ]
}
```

Populate with 15-25 meta Pokemon across S/A/B/C tiers. Source from PvPoke rankings.

- [ ] **Step 2: Create Ultra League and Master League meta**

Same format. Populate with current meta.

- [ ] **Step 3: Commit**

```bash
git add src/data/leagues/
git commit -m "feat: add league meta data for Great, Ultra, Master leagues"
```

---

### Task 16: Counter recommendation engine

**Files:**
- Create: `src/lib/counters.ts`
- Create: `__tests__/counters.test.ts`

- [ ] **Step 1: Write the failing tests**

`__tests__/counters.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { getCountersFor } from "@/lib/counters";

describe("getCountersFor", () => {
  it("returns top and budget counters for a Pokemon ID", () => {
    const result = getCountersFor("giratina-altered");
    expect(result.topCounters.length).toBeGreaterThan(0);
    expect(result.topCounters.length).toBeLessThanOrEqual(5);
    expect(result.budgetCounters.length).toBeGreaterThanOrEqual(0);
  });

  it("returns counters with required fields", () => {
    const result = getCountersFor("giratina-altered");
    const counter = result.topCounters[0];
    expect(counter).toBeDefined();
    expect(counter!.pokemon).toBeTruthy();
    expect(counter!.fastMove).toBeTruthy();
    expect(counter!.chargedMoves.length).toBeGreaterThan(0);
    expect(counter!.tier).toBe("top");
  });

  it("returns search string for the counters", () => {
    const result = getCountersFor("giratina-altered");
    expect(result.searchString).toContain("@1");
  });

  it("returns empty result for unknown Pokemon", () => {
    const result = getCountersFor("nonexistent-pokemon");
    expect(result.topCounters).toEqual([]);
    expect(result.searchString).toBe("");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- __tests__/counters.test.ts
```

- [ ] **Step 3: Write the counter engine**

`src/lib/counters.ts`:

```typescript
import type { CounterRecommendation, PokemonType } from "./types";
import { getSuperEffectiveTypes } from "./type-effectiveness";
import { buildTypeSearchString } from "./search-string";
import pokemonData from "@/data/pokemon.json";
import budgetPicks from "@/data/budget-picks.json";

type CounterResult = {
  topCounters: CounterRecommendation[];
  budgetCounters: CounterRecommendation[];
  searchString: string;
  shadowSearchString: string;
  superEffectiveTypes: PokemonType[];
};

/** Find the best counters for a given Pokemon by ID */
export function getCountersFor(pokemonId: string): CounterResult {
  const target = pokemonData.find((p) => p.id === pokemonId);
  if (!target) {
    return {
      topCounters: [],
      budgetCounters: [],
      searchString: "",
      shadowSearchString: "",
      superEffectiveTypes: [],
    };
  }

  const defenderTypes = target.types as PokemonType[];
  const superEffective = getSuperEffectiveTypes(defenderTypes);
  const searchString = buildTypeSearchString(superEffective);

  // Find Pokemon with super-effective STAB moves
  const candidates = pokemonData
    .filter((p) => {
      const hasSeMove = p.fastMoves.some((m) =>
        superEffective.includes(m.type as PokemonType)
      ) || p.chargedMoves.some((m) =>
        superEffective.includes(m.type as PokemonType)
      );
      return hasSeMove && p.id !== pokemonId;
    })
    .map((p) => {
      // Score: prefer Pokemon whose own types match super-effective types (STAB)
      const bestFast = p.fastMoves
        .filter((m) => superEffective.includes(m.type as PokemonType))
        .sort((a, b) => b.pvpPower - a.pvpPower)[0];
      const bestCharged = p.chargedMoves
        .filter((m) => superEffective.includes(m.type as PokemonType))
        .sort((a, b) => b.pvpPower - a.pvpPower)
        .slice(0, 2);

      const fast = bestFast ?? p.fastMoves[0];
      const charged = bestCharged.length > 0
        ? bestCharged
        : p.chargedMoves.slice(0, 1);

      return {
        pokemon: p.id,
        fastMove: fast!.name,
        chargedMoves: charged.map((m) => m.name),
        score: p.baseStats.atk,
        isBudget: budgetPicks.includes(p.id),
      };
    })
    .sort((a, b) => b.score - a.score);

  const topCounters: CounterRecommendation[] = candidates
    .slice(0, 5)
    .map(({ score, isBudget, ...rest }) => ({ ...rest, tier: "top" as const }));

  const budgetCounters: CounterRecommendation[] = candidates
    .filter((c) => c.isBudget)
    .slice(0, 5)
    .map(({ score, isBudget, ...rest }) => ({
      ...rest,
      tier: "budget" as const,
    }));

  return {
    topCounters,
    budgetCounters,
    searchString,
    shadowSearchString: searchString ? `shadow&${searchString}` : "",
    superEffectiveTypes: superEffective,
  };
}

/** Get all Pokemon IDs that have data (for generateStaticParams) */
export function getAllPokemonIds(): string[] {
  return pokemonData.map((p) => p.id);
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- __tests__/counters.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/counters.ts __tests__/counters.test.ts
git commit -m "feat: add counter recommendation engine with tests"
```

---

### Task 17: Build-time data validation

**Files:**
- Create: `scripts/validate-data.ts`
- Create: `__tests__/validate-data.test.ts`

- [ ] **Step 1: Write the failing tests**

`__tests__/validate-data.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { validateLeagues, validatePokemon } from "../scripts/validate-data";

describe("validateLeagues", () => {
  it("warns if all leagues are inactive", () => {
    const result = validateLeagues([
      { id: "test", active: false, endDate: "2026-01-01", lastUpdated: "2026-01-01", meta: [] },
    ]);
    expect(result.warnings).toContain("All leagues are inactive");
  });

  it("warns if endDate is in the past", () => {
    const result = validateLeagues([
      { id: "test", active: true, endDate: "2025-01-01", lastUpdated: "2025-01-01", meta: [] },
    ]);
    expect(result.warnings.some((w: string) => w.includes("past"))).toBe(true);
  });

  it("passes for valid active league", () => {
    const result = validateLeagues([
      { id: "test", active: true, endDate: "2099-01-01", lastUpdated: "2026-04-07", meta: [{ pokemonId: "test", tier: "S" }] },
    ]);
    expect(result.warnings).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Write the validation script**

`scripts/validate-data.ts`:

```typescript
import fs from "fs";
import path from "path";

type LeagueValidation = {
  id: string;
  active: boolean;
  endDate: string;
  lastUpdated: string;
  meta: { pokemonId: string; tier: string }[];
};

type ValidationResult = {
  warnings: string[];
  errors: string[];
};

export function validateLeagues(leagues: LeagueValidation[]): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const now = new Date();

  if (leagues.every((l) => !l.active)) {
    warnings.push("All leagues are inactive");
  }

  for (const league of leagues) {
    if (new Date(league.endDate) < now) {
      warnings.push(`League "${league.id}" endDate is in the past (${league.endDate})`);
    }
    if (league.active && league.meta.length === 0) {
      warnings.push(`League "${league.id}" is active but has no meta Pokemon`);
    }
  }

  return { warnings, errors };
}

export function validatePokemon(pokemon: { id: string; types: string[]; fastMoves: unknown[]; chargedMoves: unknown[] }[]): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  for (const p of pokemon) {
    if (p.types.length === 0) {
      errors.push(`Pokemon "${p.id}" has no types`);
    }
    if (p.fastMoves.length === 0) {
      errors.push(`Pokemon "${p.id}" has no fast moves`);
    }
    if (p.chargedMoves.length === 0) {
      errors.push(`Pokemon "${p.id}" has no charged moves`);
    }
  }

  return { warnings, errors };
}

// Run as CLI script
if (process.argv[1]?.endsWith("validate-data.ts")) {
  const leaguesDir = path.join(process.cwd(), "src/data/leagues");
  const pokemonPath = path.join(process.cwd(), "src/data/pokemon.json");

  const leagues = fs
    .readdirSync(leaguesDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(leaguesDir, f), "utf-8")));

  const pokemon = JSON.parse(fs.readFileSync(pokemonPath, "utf-8"));

  const leagueResult = validateLeagues(leagues);
  const pokemonResult = validatePokemon(pokemon);

  const allWarnings = [...leagueResult.warnings, ...pokemonResult.warnings];
  const allErrors = [...leagueResult.errors, ...pokemonResult.errors];

  if (allWarnings.length > 0) {
    console.warn("WARNINGS:");
    allWarnings.forEach((w) => console.warn(`  ⚠ ${w}`));
  }

  if (allErrors.length > 0) {
    console.error("ERRORS:");
    allErrors.forEach((e) => console.error(`  ✗ ${e}`));
    process.exit(1);
  }

  if (allWarnings.length === 0 && allErrors.length === 0) {
    console.log("Data validation passed.");
  }
}
```

- [ ] **Step 3: Run tests**

```bash
npm test -- __tests__/validate-data.test.ts
```

Expected: All PASS.

- [ ] **Step 4: Add validate script to package.json**

```json
{
  "scripts": {
    "validate": "npx tsx scripts/validate-data.ts"
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add scripts/validate-data.ts __tests__/validate-data.test.ts package.json
git commit -m "feat: add build-time data validation with tests"
```

---

### Task 18: Push Phase 1

- [ ] **Step 1: Run all checks**

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

All must pass.

- [ ] **Step 2: Push**

```bash
git push
```

---

## Chunk 3: Phase 2 — Components

All components are independent — can be built in parallel.

### Task 19: Toast provider

**Files:**
- Create: `src/components/toast-provider.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Install sonner (toast library)**

```bash
npm install sonner
```

- [ ] **Step 2: Create toast provider**

`src/components/toast-provider.tsx`:

```typescript
"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return <Toaster position="top-center" duration={3000} />;
}
```

- [ ] **Step 3: Add to layout.tsx**

Add `<ToastProvider />` inside the `<body>` in `src/app/layout.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/components/toast-provider.tsx src/app/layout.tsx package.json package-lock.json
git commit -m "feat: add toast notification provider"
```

---

### Task 20: CopyBar component

**Files:**
- Create: `src/components/copy-bar.tsx`

- [ ] **Step 1: Write CopyBar**

`src/components/copy-bar.tsx`:

```typescript
"use client";

import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyBar({ searchString }: { searchString: string }) {
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(searchString);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      toast("Copied! Switch to Pokemon GO and paste");
    } catch {
      toast("Tap and hold the text to copy manually");
    }
  }, [searchString]);

  // Auto-copy on mount
  useEffect(() => {
    if (searchString) {
      copyToClipboard();
    }
  }, [searchString, copyToClipboard]);

  if (!searchString) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
      <code className="flex-1 select-all break-all text-sm font-mono">
        {searchString}
      </code>
      <Button
        onClick={copyToClipboard}
        size="sm"
        className="min-h-11 min-w-11 shrink-0"
      >
        Copy
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/copy-bar.tsx
git commit -m "feat: add CopyBar component with auto-copy and haptic feedback"
```

---

### Task 21: PokemonCard component

**Files:**
- Create: `src/components/pokemon-card.tsx`

- [ ] **Step 1: Write PokemonCard**

`src/components/pokemon-card.tsx`:

```typescript
"use client";

import { useState } from "react";
import type { CounterRecommendation, PokemonType } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  Normal: "bg-stone-400", Fire: "bg-orange-500", Water: "bg-blue-500",
  Electric: "bg-yellow-400", Grass: "bg-green-500", Ice: "bg-cyan-300",
  Fighting: "bg-red-700", Poison: "bg-purple-500", Ground: "bg-amber-600",
  Flying: "bg-indigo-300", Psychic: "bg-pink-500", Bug: "bg-lime-500",
  Rock: "bg-amber-700", Ghost: "bg-purple-700", Dragon: "bg-violet-600",
  Dark: "bg-stone-700", Steel: "bg-slate-400", Fairy: "bg-pink-300",
};

function TypeBadge({ type }: { type: PokemonType }) {
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium text-white ${TYPE_COLORS[type] ?? "bg-gray-500"}`}
    >
      {type}
    </span>
  );
}

export function PokemonCard({
  counter,
  types,
}: {
  counter: CounterRecommendation;
  types: PokemonType[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 min-h-11"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium capitalize">
            {counter.pokemon.replace(/-/g, " ")}
          </span>
          <div className="mt-1 flex gap-1">
            {types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div>{counter.fastMove}</div>
          <div>{counter.chargedMoves.join(" / ")}</div>
        </div>
      </div>
      {expanded && (
        <div className="mt-3 border-t pt-3 text-sm text-muted-foreground">
          <p>Fast: {counter.fastMove}</p>
          <p>Charged: {counter.chargedMoves.join(", ")}</p>
        </div>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/pokemon-card.tsx
git commit -m "feat: add PokemonCard component with expandable details"
```

---

### Task 22: SearchInput component

**Files:**
- Create: `src/components/search-input.tsx`

- [ ] **Step 1: Write SearchInput with autocomplete**

`src/components/search-input.tsx`:

```typescript
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import pokemonData from "@/data/pokemon.json";

type PokemonOption = {
  id: string;
  name: string;
};

export function SearchInput() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const lower = query.toLowerCase();
    return pokemonData
      .filter((p) => p.name.toLowerCase().includes(lower) || p.id.includes(lower))
      .slice(0, 8)
      .map((p): PokemonOption => ({ id: p.id, name: p.name }));
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
    setIsOpen(results.length > 0);
  }, [results]);

  function selectPokemon(pokemon: PokemonOption) {
    setQuery("");
    setIsOpen(false);
    router.push(`/counter/${pokemon.id}`);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!isOpen) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && results[selectedIndex]) {
      event.preventDefault();
      selectPokemon(results[selectedIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search a Pokemon..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className="min-h-11 text-base"
        autoComplete="off"
      />
      {isOpen && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-lg border bg-background shadow-sm">
          {results.map((pokemon, index) => (
            <li key={pokemon.id}>
              <button
                className={`w-full min-h-11 px-3 py-2 text-left text-sm capitalize hover:bg-muted ${
                  index === selectedIndex ? "bg-muted" : ""
                }`}
                onMouseDown={() => selectPokemon(pokemon)}
              >
                {pokemon.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/search-input.tsx
git commit -m "feat: add SearchInput component with autocomplete dropdown"
```

---

### Task 23: League components

**Files:**
- Create: `src/components/league-card.tsx`
- Create: `src/components/meta-pokemon-card.tsx`
- Create: `src/components/tier-accordion.tsx`

- [ ] **Step 1: Write LeagueCard**

`src/components/league-card.tsx`:

```typescript
import Link from "next/link";
import type { League } from "@/lib/types";
import { CopyBar } from "./copy-bar";
import { buildLeagueEligibleString } from "@/lib/search-string";

export function LeagueCard({ league }: { league: League }) {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{league.name}</h3>
          <p className="text-sm text-muted-foreground">CP {league.cpCap}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Last updated: {league.lastUpdated}
        </p>
      </div>
      {league.typeRestrictions && league.typeRestrictions.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Types: {league.typeRestrictions.join(", ")}
        </p>
      )}
      <CopyBar searchString={buildLeagueEligibleString(league.cpCap)} />
      <Link
        href={`/league/${league.id}`}
        className="inline-block min-h-11 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        View Meta
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Write MetaPokemonCard**

`src/components/meta-pokemon-card.tsx`:

```typescript
"use client";

import { useState } from "react";
import type { MetaPokemon } from "@/lib/types";

export function MetaPokemonCard({ meta }: { meta: MetaPokemon }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      className="w-full rounded-lg border p-3 text-left min-h-11 hover:bg-muted/50"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium capitalize">
          {meta.pokemonId.replace(/-/g, " ")}
        </span>
        <span className="text-sm text-muted-foreground">
          {meta.recommendedFast}
        </span>
      </div>
      {expanded && (
        <div className="mt-2 text-sm text-muted-foreground">
          <p>Fast: {meta.recommendedFast}</p>
          <p>Charged: {meta.recommendedCharged.join(", ")}</p>
        </div>
      )}
    </button>
  );
}
```

- [ ] **Step 3: Write TierAccordion**

`src/components/tier-accordion.tsx`:

```typescript
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { MetaPokemon } from "@/lib/types";
import { MetaPokemonCard } from "./meta-pokemon-card";

type TierGroup = {
  tier: "S" | "A" | "B" | "C";
  pokemon: MetaPokemon[];
};

export function TierAccordion({ tiers }: { tiers: TierGroup[] }) {
  return (
    <Accordion type="multiple" defaultValue={["S"]}>
      {tiers.map((group) => (
        <AccordionItem key={group.tier} value={group.tier}>
          <AccordionTrigger className="min-h-11 text-base font-medium">
            {group.tier} Tier ({group.pokemon.length})
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {group.pokemon.map((meta) => (
                <MetaPokemonCard key={meta.pokemonId} meta={meta} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/league-card.tsx src/components/meta-pokemon-card.tsx src/components/tier-accordion.tsx
git commit -m "feat: add league card, meta Pokemon card, and tier accordion components"
```

---

### Task 24: Push Phase 2

- [ ] **Step 1: Run all checks**

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

- [ ] **Step 2: Push**

```bash
git push
```

---

## Chunk 4: Phase 3 — Routes + Phase 4 — Polish

### Task 25: Home page (Battle tab with search)

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Write home page**

`src/app/page.tsx`:

```typescript
import { SearchInput } from "@/components/search-input";
import { QUICK_PICKS } from "@/lib/constants";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6 pt-4">
      <div>
        <h2 className="mb-2 text-lg font-bold">What beats it?</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Search a Pokemon to get copyable search strings for its counters.
        </p>
        <SearchInput />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
          Popular
        </h3>
        <div className="flex flex-wrap gap-2">
          {QUICK_PICKS.map((id) => (
            <Link
              key={id}
              href={`/counter/${id}`}
              className="min-h-11 rounded-md border px-3 py-2 text-sm capitalize hover:bg-muted"
            >
              {id.replace(/-/g, " ")}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in dev mode**

```bash
npm run dev
```

Visit `http://localhost:3000`. Should see search box and quick-pick buttons.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add home page with search input and popular quick-picks"
```

---

### Task 26: Counter results page

**Files:**
- Create: `src/app/counter/[pokemon]/page.tsx`

- [ ] **Step 1: Write counter page with static generation**

`src/app/counter/[pokemon]/page.tsx`:

```typescript
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCountersFor, getAllPokemonIds } from "@/lib/counters";
import { CopyBar } from "@/components/copy-bar";
import { PokemonCard } from "@/components/pokemon-card";
import { SearchInput } from "@/components/search-input";
import pokemonData from "@/data/pokemon.json";
import type { PokemonType } from "@/lib/types";

export function generateStaticParams() {
  return getAllPokemonIds().map((id) => ({ pokemon: id }));
}

export function generateMetadata({
  params,
}: {
  params: { pokemon: string };
}): Metadata {
  const pokemon = pokemonData.find((p) => p.id === params.pokemon);
  if (!pokemon) return { title: "Not Found" };

  const now = new Date();
  const monthYear = now.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return {
    title: `${pokemon.name} Counters & Search Strings - Pokemon GO (${monthYear})`,
    description: `Best counters for ${pokemon.name} in Pokemon GO. Copy the search string, paste in GO, find your counters instantly.`,
  };
}

export default function CounterPage({
  params,
}: {
  params: { pokemon: string };
}) {
  const pokemon = pokemonData.find((p) => p.id === params.pokemon);
  if (!pokemon) notFound();

  const result = getCountersFor(params.pokemon);

  return (
    <div className="space-y-6 pt-4">
      <div>
        <SearchInput />
      </div>

      <div>
        <h2 className="text-lg font-bold capitalize">
          {pokemon.name} Counters
        </h2>
        <p className="text-sm text-muted-foreground">
          Use these types against {pokemon.name}
        </p>
      </div>

      {/* Copy bar — anchored at top of results */}
      <CopyBar searchString={result.searchString} />

      {/* Instructional banner */}
      <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
        Copied — switch to Pokemon GO and paste
      </p>

      {/* Top counters */}
      <div>
        <h3 className="mb-2 text-sm font-medium">Top Counters</h3>
        <div className="space-y-2">
          {result.topCounters.map((counter) => {
            const counterPokemon = pokemonData.find(
              (p) => p.id === counter.pokemon,
            );
            return (
              <PokemonCard
                key={counter.pokemon}
                counter={counter}
                types={(counterPokemon?.types ?? []) as PokemonType[]}
              />
            );
          })}
        </div>
      </div>

      {/* Budget picks */}
      {result.budgetCounters.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Budget Picks</h3>
          <p className="mb-2 text-xs text-muted-foreground">
            No legendaries, no XL candy required
          </p>
          <div className="space-y-2">
            {result.budgetCounters.map((counter) => {
              const counterPokemon = pokemonData.find(
                (p) => p.id === counter.pokemon,
              );
              return (
                <PokemonCard
                  key={counter.pokemon}
                  counter={counter}
                  types={(counterPokemon?.types ?? []) as PokemonType[]}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* More search strings (collapsed) */}
      {result.shadowSearchString && (
        <details>
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium">
            More Search Strings
          </summary>
          <div className="space-y-3 pt-2">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">
                Shadow counters only
              </p>
              <CopyBar searchString={result.shadowSearchString} />
            </div>
          </div>
        </details>
      )}

      {/* Type reference (collapsed) */}
      <details>
        <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium">
          Type Reference
        </summary>
        <div className="space-y-2 pt-2 text-sm">
          <div>
            <p className="font-medium">Use these attack types:</p>
            <p className="text-muted-foreground">
              {result.superEffectiveTypes.join(", ")}
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}
```

- [ ] **Step 2: Verify in dev mode**

```bash
npm run dev
```

Visit `http://localhost:3000/counter/giratina-altered` (or whatever Pokemon is in the data). Should see copy bar, counters, expandable sections.

- [ ] **Step 3: Verify static generation builds**

```bash
npm run build
```

Check that `/counter/[pokemon]` pages are listed as statically generated in the build output.

- [ ] **Step 4: Commit**

```bash
git add src/app/counter/
git commit -m "feat: add counter results page with static generation and SEO metadata"
```

---

### Task 27: League meta page

**Files:**
- Create: `src/app/league/[leagueSlug]/page.tsx`

- [ ] **Step 1: Write league page with static generation**

`src/app/league/[leagueSlug]/page.tsx`:

```typescript
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { CopyBar } from "@/components/copy-bar";
import { TierAccordion } from "@/components/tier-accordion";
import { buildNameSearchString } from "@/lib/search-string";
import type { League, MetaPokemon } from "@/lib/types";

function getLeague(slug: string): League | undefined {
  try {
    const filePath = path.join(process.cwd(), `src/data/leagues/${slug}.json`);
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data) as League;
  } catch {
    return undefined;
  }
}

function getAllLeagueSlugs(): string[] {
  const dir = path.join(process.cwd(), "src/data/leagues");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

export function generateStaticParams() {
  return getAllLeagueSlugs().map((slug) => ({ leagueSlug: slug }));
}

export function generateMetadata({
  params,
}: {
  params: { leagueSlug: string };
}): Metadata {
  const league = getLeague(params.leagueSlug);
  if (!league) return { title: "Not Found" };

  const now = new Date();
  const monthYear = now.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return {
    title: `${league.name} Meta & Search Strings - Pokemon GO (${monthYear})`,
    description: `${league.name} meta tier list for ${league.season}. Copy search strings to find meta Pokemon in your storage.`,
  };
}

export default function LeaguePage({
  params,
}: {
  params: { leagueSlug: string };
}) {
  const league = getLeague(params.leagueSlug);
  if (!league) notFound();

  const metaNames = league.meta.map((m) =>
    m.pokemonId.replace(/-/g, " "),
  );
  const metaSearchString = buildNameSearchString(metaNames);

  const tiers = (["S", "A", "B", "C"] as const)
    .map((tier) => ({
      tier,
      pokemon: league.meta.filter((m) => m.tier === tier),
    }))
    .filter((group) => group.pokemon.length > 0);

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h2 className="text-lg font-bold">{league.name} Meta</h2>
        <p className="text-sm text-muted-foreground">
          {league.season} · CP {league.cpCap}
        </p>
        <p className="text-xs text-muted-foreground">
          Last updated: {league.lastUpdated}
        </p>
      </div>

      <CopyBar searchString={metaSearchString} />

      <TierAccordion tiers={tiers} />
    </div>
  );
}
```

- [ ] **Step 2: Verify in dev mode and build**

```bash
npm run dev
```

Visit `http://localhost:3000/league/great-league`.

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/league/
git commit -m "feat: add league meta page with tier accordion and static generation"
```

---

### Task 28: Wire header tabs into home page

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`

The home page needs to show either Battle (search) or Leagues depending on the active tab. Since this is static export, use client-side state.

- [ ] **Step 1: Create a client wrapper for tab state**

Update `src/app/page.tsx` to be a client component that switches between Battle view and Leagues view based on tab selection. Import Header, SearchInput, LeagueCard, and league data.

- [ ] **Step 2: Move Header into page (not layout) since it needs tab state**

- [ ] **Step 3: Test both tabs in dev mode**

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "feat: wire header tabs to switch between Battle and Leagues views"
```

---

### Task 29: Final polish — PWA install prompt, Lighthouse check

**Files:**
- Modify: `src/app/layout.tsx` (add viewport meta, theme-color)
- Verify: `public/manifest.json` has all required fields

- [ ] **Step 1: Verify PWA manifest is complete**

Check that `manifest.json` has: `name`, `short_name`, `start_url`, `display: standalone`, `theme_color`, `background_color`, icons at 192 and 512.

- [ ] **Step 2: Run final build**

```bash
npm run lint && npm run typecheck && npm test && npm run validate && npm run build
```

All must pass.

- [ ] **Step 3: Run Lighthouse in Chrome DevTools**

Check: Performance, Accessibility, Best Practices, SEO. Note scores but don't block on them for v0.1.

- [ ] **Step 4: Commit and push**

```bash
git add .
git commit -m "chore: final polish — verify PWA manifest, build, and Lighthouse"
git push
```

---

### Task 30: Deploy and verify

- [ ] **Step 1: Verify Cloudflare Pages auto-deployed**

Check Cloudflare dashboard for successful deployment.

- [ ] **Step 2: Test on production URL**

- Home page loads, search works
- `/counter/giratina-altered` shows counters and copy bar
- `/league/great-league` shows meta tiers
- Copy button works on mobile Safari and Chrome
- Dark mode works (if system is set to dark)
- Menu opens, About and Feedback link work
- Invalid URL shows 404 page

- [ ] **Step 3: Update SESSION_LOG.md and CHANGELOG.md**

---

## Summary

| Phase | Tasks | What Ships |
|-------|-------|------------|
| 0 — Skeleton | Tasks 1-9 | Next.js project, shadcn, PWA, Sentry, Cloudflare, app shell, error boundary |
| 1 — Data Layer | Tasks 10-18 | Types, type effectiveness engine, search strings, Pokemon data, league data, counters engine, validation |
| 2 — Components | Tasks 19-24 | CopyBar, PokemonCard, SearchInput, LeagueCard, MetaPokemonCard, TierAccordion, toast |
| 3 — Routes | Tasks 25-28 | Home page, counter page (static), league page (static), tab navigation |
| 4 — Polish | Tasks 29-30 | PWA verification, Lighthouse, deploy, production testing |

**Total: 30 tasks.** Phases 1 items can run in parallel. Phase 2 components can all run in parallel. Phase 3 routes can partially parallel (counter + league pages are independent).
