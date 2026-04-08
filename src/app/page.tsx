import { SearchInput } from "@/components/search-input";
import { HomeTeamPreview } from "@/components/home-team-preview";
import { getPokemonName } from "@/lib/pokemon-utils";
import currentRaids from "@/data/current-raids.json";
import pokemonData from "@/data/pokemon.json";
import greatLeague from "@/data/leagues/great-league.json";
import ultraLeague from "@/data/leagues/ultra-league.json";
import masterLeague from "@/data/leagues/master-league.json";
import fantasyCup from "@/data/leagues/fantasy-cup.json";
import Link from "next/link";

const allLeagues = [fantasyCup, greatLeague, ultraLeague, masterLeague];
const activeLeagues = allLeagues.filter((l) => l.active);

// Current raid bosses filtered to Pokemon we have data for
const raidBosses = [
  ...currentRaids.fivestar,
  ...currentRaids.mega,
  ...currentRaids.threestar,
].filter((id) => pokemonData.some((p) => p.id === id));

export default function Home() {
  return (
    <div className="space-y-6 pt-4">
      <h1 className="text-xl font-bold">Poke Pal</h1>
      <SearchInput />

      <div>
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Current Raids</h2>
        <div className="flex flex-wrap gap-2">
          {raidBosses.map((id) => (
              <Link
                key={id}
                href={`/counter/${id}`}
                className="inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors hover:bg-accent active:bg-accent active:scale-95"
              >
                {getPokemonName(id)}
              </Link>
          ))}
        </div>
      </div>

      {activeLeagues.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Go Battle League</h2>
          <div className="flex flex-wrap gap-2">
            {activeLeagues.map((l) => (
              <Link
                key={l.id}
                href={`/league/${l.id}`}
                className="inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors hover:bg-accent active:bg-accent active:scale-95"
              >
                {l.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Your Team</h2>
        <HomeTeamPreview />
      </div>
    </div>
  );
}
