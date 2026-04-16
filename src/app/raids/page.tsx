"use client";

import Link from "next/link";
import { Star, Flame, Crown } from "lucide-react";
import { FixedHeader } from "@/components/fixed-header";
import { CollapsibleSection } from "@/components/home/collapsible-section";
import currentRaids from "@/data/current-raids.json";
import { getPokemonName } from "@/lib/pokemon-utils";

type RichBoss = { id: string; tier: 1 | 3 | 5 | "mega"; shadow: boolean };

const bosses: RichBoss[] = Array.isArray(
  (currentRaids as { bosses?: RichBoss[] }).bosses,
)
  ? (currentRaids as { bosses: RichBoss[] }).bosses
  : [];

function cleanDisplayName(id: string): string {
  return getPokemonName(id).replace(
    /\s*\((?:Shadow|Mega|Alolan|Galarian|Hisuian|Paldean)\)/gi,
    "",
  );
}

type TierGroup = {
  label: string;
  id: string;
  icon: React.ReactNode;
  bosses: { id: string; name: string; shadow: boolean }[];
};

function buildGroups(): TierGroup[] {
  const groups: TierGroup[] = [];

  const fiveStar = bosses.filter((b) => b.tier === 5 && !b.shadow);
  if (fiveStar.length > 0) {
    groups.push({
      label: "5-STAR RAIDS",
      id: "raids-5star",
      icon: <span className="inline-flex items-center gap-0.5"><span>5</span><Star className="h-3 w-3 fill-current" /></span>,
      bosses: fiveStar.map((b) => ({ id: b.id, name: cleanDisplayName(b.id), shadow: false })),
    });
  }

  const mega = bosses.filter((b) => b.tier === "mega");
  if (mega.length > 0) {
    groups.push({
      label: "MEGA RAIDS",
      id: "raids-mega",
      icon: <Crown className="h-4 w-4" />,
      bosses: mega.map((b) => ({ id: b.id, name: cleanDisplayName(b.id), shadow: false })),
    });
  }

  const threeStar = bosses.filter((b) => b.tier === 3 && !b.shadow);
  if (threeStar.length > 0) {
    groups.push({
      label: "3-STAR RAIDS",
      id: "raids-3star",
      icon: <span className="inline-flex items-center gap-0.5"><span>3</span><Star className="h-3 w-3 fill-current" /></span>,
      bosses: threeStar.map((b) => ({ id: b.id, name: cleanDisplayName(b.id), shadow: false })),
    });
  }

  const oneStar = bosses.filter((b) => b.tier === 1 && !b.shadow);
  if (oneStar.length > 0) {
    groups.push({
      label: "1-STAR RAIDS",
      id: "raids-1star",
      icon: <span className="inline-flex items-center gap-0.5"><span>1</span><Star className="h-3 w-3 fill-current" /></span>,
      bosses: oneStar.map((b) => ({ id: b.id, name: cleanDisplayName(b.id), shadow: false })),
    });
  }

  const shadow = bosses.filter((b) => b.shadow);
  if (shadow.length > 0) {
    groups.push({
      label: "SHADOW RAIDS",
      id: "raids-shadow",
      icon: <Flame className="h-4 w-4" />,
      bosses: shadow.map((b) => ({ id: b.id, name: cleanDisplayName(b.id), shadow: true })),
    });
  }

  return groups;
}

const groups = buildGroups();
export default function RaidsPage() {
  return (
    <div className="flex flex-1 flex-col space-y-3">
      <FixedHeader>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Raids</h1>
          <span aria-hidden className="invisible rounded-lg border px-2.5 py-1.5 text-sm">.</span>
        </div>
      </FixedHeader>

      {groups.map((group) => (
        <CollapsibleSection key={group.id} id={group.id} label={group.label}>
          <div className="space-y-1.5">
            {group.bosses.map((boss) => (
              <Link
                key={boss.id}
                href={`/counter/${boss.id}`}
                className="flex min-h-11 items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition-colors hover:bg-accent active:bg-accent active:scale-[0.98]"
              >
                <span className="flex min-w-0 items-center gap-2">
                  {boss.shadow && (
                    <Flame className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate">{boss.name}</span>
                </span>
                <span className="shrink-0 text-muted-foreground text-xs">
                  See counters →
                </span>
              </Link>
            ))}
          </div>
        </CollapsibleSection>
      ))}

      {groups.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No raid data available. Try running <code>npm run update:raids</code>.
        </p>
      )}

      <footer className="mt-auto text-center text-xs text-muted-foreground/40">
        <p>Data from LeekDuck · {currentRaids.lastUpdated}</p>
      </footer>
    </div>
  );
}
