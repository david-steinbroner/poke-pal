"use client";

import { useState, useEffect, useRef } from "react";
import { buildRankingsMap, type RankEntry } from "@/lib/ranker";

type UseLeagueRankingsResult = {
  rankings: Map<string, RankEntry>;
  total: number;
  loading: boolean;
  error: string | null;
};

const cache = new Map<string, { map: Map<string, RankEntry>; total: number }>();

export function useLeagueRankings(leagueId: string): UseLeagueRankingsResult {
  const [rankings, setRankings] = useState<Map<string, RankEntry>>(new Map());
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef<string | null>(null);

  // Hydrate rankings from cache or fetch (intentional mount-time setState)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const cached = cache.get(leagueId);
    if (cached) {
      setRankings(cached.map);
      setTotal(cached.total);
      setLoading(false);
      return;
    }

    if (fetchedRef.current === leagueId) return;
    fetchedRef.current = leagueId;

    setRankings(new Map());
    setTotal(0);
    setLoading(true);
    setError(null);

    fetch(`/data/rankings/${leagueId}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Rankings not found for ${leagueId}`);
        return res.json() as Promise<RankEntry[]>;
      })
      .then((data) => {
        const map = buildRankingsMap(data);
        cache.set(leagueId, { map, total: data.length });
        setRankings(map);
        setTotal(data.length);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load rankings");
        setLoading(false);
      });
  }, [leagueId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return { rankings, total, loading, error };
}
