"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { FixedHeader } from "@/components/fixed-header";
import { CopyIconButton } from "@/components/copy-icon-button";
import { CollapsibleSection } from "@/components/home/collapsible-section";
import { RankerInput } from "./ranker-input";
import { CollapsibleSubSection } from "@/components/rocket/collapsible-sub-section";
import { LEAGUE_SHORT_NAMES } from "@/data/leagues";
import Link from "next/link";

type MetaEntry = {
  pokemonId: string;
  name: string;
  tier: string;
  recommendedFast: string;
  recommendedCharged: string[];
  elite?: string[];
};

type TeamEntry = {
  name: string;
  pokemon: Array<{ id: string; name: string }>;
  why: string;
  lead: string;
  searchString: string;
};

type LeagueData = {
  id: string;
  name: string;
  cpCap: number;
  typeRestrictions?: string[];
  active: boolean;
  meta: MetaEntry[];
  metaSearchString: string;
  cpString: string;
  curatedTeams: TeamEntry[];
};

type LeaguesClientProps = {
  leagues: LeagueData[];
};

const STANDARD_IDS = new Set(["great-league", "ultra-league", "master-league"]);

const TIER_BADGE_COLORS: Record<string, string> = {
  S: "text-yellow-600 dark:text-yellow-400",
  A: "text-blue-600 dark:text-blue-400",
  B: "text-green-600 dark:text-green-400",
  C: "text-muted-foreground",
};

const TIER_LABELS: Record<string, string> = {
  S: "S TIER — META DEFINING",
  A: "A TIER — STRONG PICKS",
  B: "B TIER — SOLID OPTIONS",
  C: "C TIER — NICHE PICKS",
};

export function LeaguesClient({ leagues }: LeaguesClientProps) {
  const liveLeagues = leagues.filter((l) => l.active);
  // Past = only standard leagues that are NOT live. Special cups never appear in Past.
  const pastLeagues = leagues.filter((l) => !l.active && STANDARD_IDS.has(l.id));

  const [showLive, setShowLive] = useState(true);
  const displayLeagues = showLive ? liveLeagues : pastLeagues;

  const [selectedId, setSelectedId] = useState(liveLeagues[0]?.id ?? leagues[0]?.id ?? "");
  const league = leagues.find((l) => l.id === selectedId);

  if (!league) return null;

  const grouped = groupByTier(league.meta);

  return (
    <div className="flex flex-1 flex-col space-y-5 pb-28">
      <FixedHeader>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold shrink-0">Leagues</h1>
          <div className="flex flex-1 gap-1.5 justify-end">
            {displayLeagues.map((l) => {
              const isSelected = selectedId === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setSelectedId(l.id)}
                  className={`flex-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "border text-muted-foreground"
                  }`}
                >
                  {LEAGUE_SHORT_NAMES[l.id] ?? l.name}
                </button>
              );
            })}
            {pastLeagues.length > 0 && (
              <button
                onClick={() => {
                  const next = !showLive;
                  setShowLive(next);
                  const target = next ? liveLeagues : pastLeagues;
                  if (target.length > 0 && !target.find((l) => l.id === selectedId)) {
                    setSelectedId(target[0]!.id);
                  }
                }}
                className="shrink-0 rounded-lg border p-1.5 text-muted-foreground transition-colors hover:bg-accent"
                aria-label={showLive ? "Show past leagues" : "Show live leagues"}
              >
                <ArrowLeftRight className="size-4" />
              </button>
            )}
          </div>
        </div>
      </FixedHeader>

      {/* CP info + copy + ranker — scrollable body */}
      <div className="pt-1 space-y-2">
        <CopyIconButton searchString={league.metaSearchString} label="Copy Meta Search" />
        <p className="text-sm text-muted-foreground">
          {league.cpCap === 9999 ? "No CP limit" : `CP ${league.cpCap.toLocaleString()}`}
          {league.typeRestrictions && ` · ${league.typeRestrictions.join(", ")}`}
        </p>
      </div>
      <RankerInput leagueId={league.id} />

      {/* Meta list — sticky collapsible tiers */}
      {grouped.map(({ tier, pokemon }) => (
        <CollapsibleSection
          key={`${league.id}-${tier}`}
          id={`meta-${tier.toLowerCase()}`}
          label={`${TIER_LABELS[tier] ?? tier + " TIER"} (${pokemon.length})`}
        >
          <div className="space-y-1.5">
            {pokemon.map((p) => (
              <Link
                key={p.pokemonId}
                href={`/counter/${p.pokemonId}`}
                className="block rounded-lg border p-3 transition-colors hover:bg-accent active:bg-accent active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <span className={`font-bold shrink-0 ${TIER_BADGE_COLORS[p.tier] ?? "text-muted-foreground"}`}>
                    {p.tier}
                  </span>
                  <span className="font-medium">{p.name}</span>
                  {p.elite && p.elite.length > 0 && (
                    <span className="ml-auto shrink-0 text-sm text-yellow-600">★ Elite</span>
                  )}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {p.recommendedFast}
                  <span className="mx-1">|</span>
                  {p.recommendedCharged.map((m, i) => (
                    <span key={m}>
                      {i > 0 && ", "}
                      {p.elite?.includes(m) ? (
                        <span className="text-yellow-600">{m} ★</span>
                      ) : (
                        m
                      )}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </CollapsibleSection>
      ))}

      {/* Recommended Teams */}
      {league.curatedTeams.length > 0 && (
        <CollapsibleSection id="recommended-teams" label="RECOMMENDED TEAMS">
          <div className="space-y-2">
            {league.curatedTeams.map((team) => (
              <CollapsibleSubSection key={team.name} label={team.name}>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {team.pokemon.map((p, i) => (
                      <Link
                        key={p.id}
                        href={`/counter/${p.id}`}
                        className={`flex min-h-11 items-center justify-center rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition-colors hover:bg-accent active:bg-accent active:scale-[0.98] ${
                          i === team.pokemon.length - 1 && team.pokemon.length % 2 === 1
                            ? "col-span-2"
                            : ""
                        }`}
                      >
                        {p.name}
                        {p.id === team.lead && (
                          <span className="ml-1.5 text-xs text-muted-foreground uppercase">Lead</span>
                        )}
                      </Link>
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground">{team.why}</p>

                  <CopyIconButton
                    label="Copy Team Search"
                    searchString={team.searchString}
                  />
                </div>
              </CollapsibleSubSection>
            ))}
          </div>
        </CollapsibleSection>
      )}

      <footer className="mt-auto text-center text-xs text-muted-foreground/40 space-y-0.5">
        <p>★ = Elite TM / Legacy move</p>
        <p>Data from PvPoke</p>
      </footer>
    </div>
  );
}

function groupByTier(meta: MetaEntry[]) {
  const tiers = ["S", "A", "B", "C"] as const;
  return tiers
    .map((tier) => ({
      tier,
      pokemon: meta.filter((p) => p.tier === tier),
    }))
    .filter((g) => g.pokemon.length > 0);
}
