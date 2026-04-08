import { SearchInput } from "@/components/search-input";
import { QUICK_PICKS } from "@/lib/constants";
import pokemonData from "@/data/pokemon.json";
import greatLeague from "@/data/leagues/great-league.json";
import ultraLeague from "@/data/leagues/ultra-league.json";
import masterLeague from "@/data/leagues/master-league.json";
import fantasyCup from "@/data/leagues/fantasy-cup.json";
import Link from "next/link";

const allLeagues = [fantasyCup, greatLeague, ultraLeague, masterLeague];
const activeLeagues = allLeagues.filter((l) => l.active);

export default function Home() {
  return (
    <div className="space-y-6 pt-4">
      <div>
        <h1 className="text-xl font-bold">Pokemon GO PvP Search Strings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find counters, build teams, copy strings. Paste in GO.
        </p>
      </div>

      <SearchInput />

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">
          Quick Picks
        </h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_PICKS.map((id) => {
            const pokemon = pokemonData.find((p) => p.id === id);
            if (!pokemon) return null;
            return (
              <Link
                key={id}
                href={`/counter/${id}`}
                className="inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm capitalize transition-colors hover:bg-accent active:bg-accent active:scale-95"
              >
                {pokemon.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">
          What&apos;s Live
        </h2>
        {activeLeagues.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {activeLeagues.map((l) => (
              <Link
                key={l.id}
                href={`/league/${l.id}`}
                className="inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent active:bg-accent active:scale-95"
              >
                {l.name}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No active cups right now.
          </p>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">
          Build a Team
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/teams"
            className="inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent active:bg-accent active:scale-95"
          >
            Team Builder &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
