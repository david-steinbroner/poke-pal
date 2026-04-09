"use client";

import { Suspense, useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LEAGUE_IDS, LEAGUE_SHORT_NAMES } from "@/lib/constants";
import { TeamSlotCard } from "@/components/team/team-slot";
import { ThreatList } from "@/components/team/threat-list";
import { CopyButton } from "@/components/copy-button";
import { PokemonChip } from "@/components/pokemon-chip";
import { SearchInput } from "@/components/search-input";
import { analyzeTeam, getLeagueInfo, getPokemonById } from "@/lib/team-analysis";
import { pokemonToSlot } from "@/lib/pokemon-utils";
import { loadTeam, saveTeam, clearTeam } from "@/lib/team-storage";
import { calculateTeamRating, RATING_COLORS } from "@/lib/team-rating";
import { getGapTypes } from "@/lib/team-rating";
import { ArrowRight } from "lucide-react";
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


function TeamsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize from URL params → last edited league → first league (fantasy-cup)
  const initialLeague = (searchParams.get("l") as LeagueId) || (() => {
    try {
      const last = localStorage.getItem("poke-pal:lastEditedLeague");
      if (last && (LEAGUE_IDS as readonly string[]).includes(last)) return last as LeagueId;
    } catch {}
    return LEAGUE_IDS[0];
  })();
  const initialPokemon = searchParams.get("p")?.split(",").filter(Boolean) || [];

  const [league, setLeague] = useState<LeagueId>(initialLeague);
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
      return next;
    });
  }

  function handleClear() {
    setTeam([null, null, null]);
    clearTeam(league);
  }

  const hasTeam = team.some((s) => s !== null);

  const pokemonIds = team
    .filter((s): s is NonNullable<TeamSlot> => s !== null)
    .map((s) => s.pokemonId);

  const teamRating = useMemo(
    () => (pokemonIds.length > 0 ? calculateTeamRating(pokemonIds, league) : null),
    [pokemonIds, league],
  );

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

  return (
    <div className="space-y-5 pt-4 pb-8">
      <div>
        <h1 className="text-xl font-bold">Team Builder</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Select a league and build your team; meta suggestions will adjust to maximize team synergy; copy Team Search String and paste in GO to assemble for battle.
        </p>
        <div className="mt-4 flex gap-1.5">
          {(LEAGUE_IDS as readonly string[]).map((id) => {
            const isActive = league === id;
            const hasSavedTeam = (() => {
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
      </div>

      <SearchInput mode="select" onSelect={handlePokemonSelect} placeholder="Add a Pokemon..." />

      {/* Copy button — greyed out until team has members */}
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

      {/* Team slots with inline suggestions on next empty slot */}
      <div className="space-y-2">
        {SLOT_LABELS.map((label, i) => {
          const slot = team[i] ?? null;
          const isEmpty = slot === null;
          // Only show suggestions in the NEXT slot to fill:
          // Slot 0 always shows if empty, slot 1 only if slot 0 is filled, slot 2 only if 0+1 filled
          const showSuggestions = isEmpty && team.slice(0, i).every((s) => s !== null);
          // For slots 2 & 3 (i > 0), include gap types in the header label
          const slotLabel = isEmpty && showSuggestions && gapTypes.length > 0 && i > 0
            ? `${label} — suggesting ${gapTypes.join(", ")}`
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
                      See more <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </TeamSlotCard>
            </div>
          );
        })}
      </div>

      <Link
        href={`/league/${league}`}
        className="flex items-center justify-center gap-1 text-[13px] uppercase tracking-wide text-muted-foreground/60 hover:text-muted-foreground"
      >
        SEE LEAGUE INFO <ArrowRight className="h-3 w-3" />
      </Link>

      {hasTeam && analysis.threats.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium">
            Meta Threats
          </h2>
          <ThreatList threats={analysis.threats} />
        </div>
      )}
    </div>
  );
}
