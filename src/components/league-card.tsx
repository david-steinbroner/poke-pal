import Link from "next/link";

export function LeagueCard({
  id,
  name,
  cpCap,
  season,
  active,
  metaCount,
}: {
  id: string;
  name: string;
  cpCap: number;
  season: string;
  active: boolean;
  metaCount: number;
}) {
  return (
    <Link
      href={`/league/${id}`}
      className="block rounded-lg border p-4 transition-colors hover:bg-accent active:bg-accent active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{name}</h3>
        {active && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
            Active
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
