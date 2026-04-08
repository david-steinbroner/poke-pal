import Link from "next/link";
import { StatusPill } from "@/components/status-pill";

export function LeagueCard({
  id,
  name,
  cpCap,
  season,
  active,
  metaCount,
  variant = "default",
  startDate,
}: {
  id: string;
  name: string;
  cpCap: number;
  season: string;
  active: boolean;
  metaCount: number;
  variant?: "default" | "inactive";
  startDate?: string;
}) {
  const isInactive = variant === "inactive";
  const formattedStartDate = startDate
    ? new Date(startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Link
      href={`/league/${id}`}
      className={`block rounded-lg border p-3 transition-colors hover:bg-accent active:bg-accent active:scale-[0.98] ${
        isInactive ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{name}</h3>
        {active && !isInactive && (
          <StatusPill>Live</StatusPill>
        )}
        {isInactive && formattedStartDate && (
          <span className="text-xs text-muted-foreground">
            Starts {formattedStartDate}
          </span>
        )}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">
        <span>CP {cpCap === 9999 ? "∞" : cpCap.toLocaleString()}</span>
        <span className="mx-2">·</span>
        <span>{season}</span>
        <span className="mx-2">·</span>
        <span>{metaCount} meta picks</span>
      </div>
    </Link>
  );
}
