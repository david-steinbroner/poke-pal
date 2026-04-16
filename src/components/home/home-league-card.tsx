"use client";

import Link from "next/link";
import { CopyButton } from "@/components/copy-button";

type HomeLeagueCardProps = {
  leagueId: string;
  leagueName: string;
  searchString: string;
};

export function HomeLeagueCard({
  leagueId,
  leagueName,
  searchString,
}: HomeLeagueCardProps) {
  return (
    <div className="rounded-lg border p-3 space-y-2">
      <span className="block text-base font-semibold">{leagueName}</span>
      <CopyButton
        searchString={searchString}
        label="Copy Meta Search String"
        compact
      />
      <Link
        href={`/league/${leagueId}`}
        className="flex min-h-11 items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent active:bg-accent active:scale-[0.98]"
      >
        See league details →
      </Link>
    </div>
  );
}
