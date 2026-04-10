"use client";

import { Suspense, useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LEAGUE_IDS, LEAGUE_SHORT_NAMES } from "@/lib/constants";
import { TeamSlotCard } from "@/components/team/team-slot";
import { ThreatList } from "@/components/team/threat-list";
import { CopyButton } from "@/components/copy-button";
import { FixedHeader } from "@/components/fixed-header";
import { PokemonChip } from "@/components/pokemon-chip";
import { SearchInput } from "@/components/search-input";
import { analyzeTeam, getLeagueInfo, getPokemonById } from "@/lib/team-analysis";
import { pokemonToSlot } from "@/lib/pokemon-utils";
import { loadTeam, saveTeam } from "@/lib/team-storage";
import { getGapTypes, calculateTeamRating, RATING_COLORS, RATING_LABELS } from "@/lib/team-rating";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import Link from "next/link";
import type { LeagueId, TeamSlot } from "@/lib/team-types";
import type { MetaPokemon } from "@/lib/types";

export default function TeamsPageWrapper() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading...</div>}>
      <TeamsPage />
    </Suspense>
  );
}

const SLOT_LABELS = ["Pokemon 1", "Pokemon 2", "Pokemon 3"] as const;

function MetaThreatsSection({ threats }: { threats: Parameters<typeof ThreatList>[0]["threats"] }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-2 text-sm font-medium active:opacity-70"
      >
        <span>Meta Threats ({threats.length})</span>
        {open ? (
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        ) : (
          <ChevronUpIcon className="size-4 text-muted-foreground" />
        )}
      </button>
      {open && <ThreatList threats={threats} />}
    </div>
  );
}

function TeamsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize from URL params first, localStorage on mount
  const urlLeague = searchParams.get("l") as LeagueId | null;
  const initialPokemon = searchParams.get("p")?.split(",").filter(Boolean) || [];

  const [league, setLeague] = useState<LeagueId>(urlLeague || LEAGUE_IDS[0]);
  const [mounted, setMounted] = useState(false);
  const [team, setTeam] = useState<[TeamSlot, TeamSlot, TeamSlot]>(() => [
    initialPokemon[0] ? pokemonToSlot(initialPokemon[0]) : null,
    initialPokemon[1] ? pokemonToSlot(initialPokemon[1]) : null,
    initialPokemon[2] ? pokemonToSlot(initialPokemon[2]) : null,
  ]);
  // Mount-only: load from URL or localStorage ONCE
  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    setMounted(true);
    // Load last edited league from localStorage if no URL param
    if (!urlLeague) {
      try {
        const last = localStorage.getItem("poke-pal:lastEditedLeague");
        if (last && (LEAGUE_IDS as readonly string[]).includes(last)) {
          setLeague(last as LeagueId);
        }
      } catch {}
    }
    if (initialPokemon.length === 0 && team.every((s) => s === null)) {
      const stored = loadTeam(league);
      if (stored.length > 0) {
        setTeam([
          stored[0] ? pokemonToSlot(stored[0]) : null,
          stored[1] ? pokemonToSlot(stored[1]) : null,
          stored[2] ? pokemonToSlot(stored[2]) : null,
        ] as [TeamSlot, TeamSlot, TeamSlot]);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist team + last edited league to localStorage whenever it changes
  useEffect(() => {
    const ids = team
      .filter((s): s is NonNullable<TeamSlot> => s !== null)
      .map((s) => s.pokemonId);
    saveTeam(league, ids);
    try { localStorage.setItem("poke-pal:lastEditedLeague", league); } catch {}
  }, [team, league]);

  // Sync state to URL
  useEffect(() => {
    const pokemonIds = team
      .filter((s): s is NonNullable<TeamSlot> => s !== null)
      .map((s) => s.pokemonId);
    const params = new URLSearchParams();
    params.set("l", league);
    if (pokemonIds.length > 0) {
      params.set("p", pokemonIds.join(","));
    }
    const url = `/teams?${params.toString()}`;
    router.replace(url, { scroll: false });
  }, [team, league, router]);

  const leagueInfo = useMemo(() => getLeagueInfo(league), [league]);

  const analysis = useMemo(
    () => analyzeTeam(team, league),
    [team, league],
  );

  const excludeIds = team
    .filter((s): s is NonNullable<TeamSlot> => s !== null)
    .map((s) => s.pokemonId);

  const handleLeagueChange = useCallback(
    (newLeague: LeagueId) => {
      if (newLeague === league) return;
      // Save current team under current league
      const currentIds = team
        .filter((s): s is NonNullable<TeamSlot> => s !== null)
        .map((s) => s.pokemonId);
      saveTeam(league, currentIds);
      // Switch league and load saved team for new league
      setLeague(newLeague);
      const stored = loadTeam(newLeague);
      if (stored.length > 0) {
        setTeam([
          stored[0] ? pokemonToSlot(stored[0]) : null,
          stored[1] ? pokemonToSlot(stored[1]) : null,
          stored[2] ? pokemonToSlot(stored[2]) : null,
        ] as [TeamSlot, TeamSlot, TeamSlot]);
      } else {
        setTeam([null, null, null]);
      }
    },
    [team, league],
  );

  function handleSlotRemove(index: 0 | 1 | 2) {
    setTeam((prev) => {
      const next = [...prev] as [TeamSlot, TeamSlot, TeamSlot];
      next[index] = null;
      // Save immediately so navigation doesn't lose state
      const ids = next.filter((s): s is NonNullable<TeamSlot> => s !== null).map((s) => s.pokemonId);
      saveTeam(league, ids);
      return next;
    });
  }

  function handlePokemonSelect(pokemonId: string) {
    // Skip if already on the team
    if (excludeIds.includes(pokemonId)) return;
    const slot = pokemonToSlot(pokemonId);
    if (!slot) return;
    setTeam((prev) => {
      const next = [...prev] as [TeamSlot, TeamSlot, TeamSlot];
      const emptyIndex = next.findIndex((s) => s === null);
      const targetIndex = emptyIndex >= 0 ? emptyIndex : 2; // replace last if full
      next[targetIndex] = slot;
      // Save immediately so navigation doesn't lose state
      const ids = next.filter((s): s is NonNullable<TeamSlot> => s !== null).map((s) => s.pokemonId);
      saveTeam(league, ids);
      return next;
    });
  }

  const hasTeam = team.some((s) => s !== null);

  const pokemonIds = team
    .filter((s): s is NonNullable<TeamSlot> => s !== null)
    .map((s) => s.pokemonId);

  // Meta suggestions filtered to exclude already-selected Pokemon
  const metaSuggestions = useMemo(
    () => (leagueInfo.meta as MetaPokemon[]).filter((m) => !excludeIds.includes(m.pokemonId)),
    [leagueInfo.meta, excludeIds],
  );

  // Types that would fill the team's offensive gaps
  const gapTypes = useMemo(
    () => (hasTeam ? getGapTypes(analysis.offensiveCoverage) : []),
    [hasTeam, analysis.offensiveCoverage],
  );

  // Team rating based on coverage + tier + weaknesses + threats
  const teamRating = useMemo(
    () => hasTeam ? calculateTeamRating(
      pokemonIds,
      league,
      analysis.offensiveCoverage,
      analysis.defensiveWeaknesses,
      analysis.threats,
    ) : null,
    [hasTeam, pokemonIds, league, analysis],
  );

  return (
    <div className="space-y-5 pb-8">
      <FixedHeader>
        <h1 className="text-xl font-bold">Team Builder</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Select a league and build your team. Copy the search string and paste in GO.
        </p>
        <div className="mt-3 flex gap-1.5">
          {(LEAGUE_IDS as readonly string[]).map((id) => {
            const isActive = league === id;
            const hasSavedTeam = mounted && (() => {
              try {
                const stored = localStorage.getItem(`poke-pal:team:${id}`);
                if (!stored) return false;
                const parsed = JSON.parse(stored);
                return Array.isArray(parsed) && parsed.length > 0;
              } catch { return false; }
            })();
            return (
              <button
                key={id}
                onClick={() => handleLeagueChange(id as LeagueId)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : hasSavedTeam
                      ? "border-2 border-primary/40 text-foreground"
                      : "border text-muted-foreground"
                }`}
              >
                {LEAGUE_SHORT_NAMES[id] ?? id}
              </button>
            );
          })}
        </div>
        {/* Team rating + Copy button in fixed header */}
        {teamRating && (
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[13px] font-semibold ${RATING_COLORS[teamRating]}`}>
              {teamRating}
            </span>
            <span className="text-[13px] text-muted-foreground">{RATING_LABELS[teamRating]}</span>
          </div>
        )}
        <div className="mt-2">
          {hasTeam && analysis.searchString ? (
            <CopyButton searchString={analysis.searchString} label="Copy Team Search String" />
          ) : (
            <button
              disabled
              className="w-full min-h-11 rounded-lg px-4 py-3 text-sm font-semibold bg-primary/30 text-primary-foreground/50 cursor-not-allowed"
            >
              Copy Team Search String
            </button>
          )}
        </div>
        {/* Discovery string — find complementary Pokemon in GO storage */}
        {analysis.discoveryString && (
          <div className="mt-2">
            <CopyButton
              searchString={analysis.discoveryString}
              label="Find Teammates in GO →"
              compact
            />
          </div>
        )}
      </FixedHeader>

      <div className="space-y-2">
        {SLOT_LABELS.map((label, i) => {
          const slot = team[i] ?? null;
          const isEmpty = slot === null;
          const showSuggestions = isEmpty && team.slice(0, i).every((s) => s !== null);
          const slotLabel = isEmpty && showSuggestions && gapTypes.length > 0 && i > 0
            ? `${label} — ${gapTypes.join(", ")}`
            : label;
          return (
            <div key={label}>
              <TeamSlotCard
                slot={slot}
                label={slotLabel}
                onRemove={() => handleSlotRemove(i as 0 | 1 | 2)}
                moveset={slot ? (() => {
                  const meta = (leagueInfo.meta as MetaPokemon[]).find(m => m.pokemonId === slot.pokemonId);
                  return meta
                    ? `${meta.recommendedFast} | ${meta.recommendedCharged.join(", ")}`
                    : undefined;
                })() : undefined}
              >
                {showSuggestions && metaSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {metaSuggestions.slice(0, 4).map((m) => {
                      const p = getPokemonById(m.pokemonId);
                      return (
                        <PokemonChip
                          key={m.pokemonId}
                          name={p?.name ?? m.pokemonId}
                          variant="add"
                          onAction={() => handlePokemonSelect(m.pokemonId)}
                        />
                      );
                    })}
                    <Link
                      href={`/league/${league}`}
                      className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:bg-accent"
                    >
                      See more →
                    </Link>
                  </div>
                )}
              </TeamSlotCard>
            </div>
          );
        })}
      </div>

      <SearchInput mode="select" onSelect={handlePokemonSelect} placeholder="Add a Pokemon..." />

      {/* Meta Threats — collapsible, starts collapsed */}
      {hasTeam && analysis.threats.length > 0 && (
        <MetaThreatsSection threats={analysis.threats} />
      )}

      {/* Spacer for fixed bottom bar */}
      <div className="h-12" />

      {/* Fixed league info bar above bottom nav */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+49px)] left-0 right-0 z-30 border-t-2 border-border bg-background/95 backdrop-blur-sm shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-lg px-4">
          <Link
            href={`/league/${league}`}
            className="flex items-center gap-1.5 py-2.5 text-[13px] font-medium text-muted-foreground active:opacity-70"
          >
            <span>←</span>
            <span>{leagueInfo.name} info</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
