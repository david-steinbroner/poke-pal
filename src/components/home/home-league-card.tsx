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
    <div className="rounded-lg border px-4 py-3 space-y-2">
      <span className="block text-base font-semibold">{leagueName}</span>
      <CopyButton
        searchString={searchString}
        label="Copy Meta Search String"
        compact
      />
      <div className="flex justify-end">
        <Link
          href={`/league/${leagueId}`}
          className="text-xs text-muted-foreground hover:text-foreground active:opacity-70"
        >
          See more →
        </Link>
      </div>
    </div>
  );
}
