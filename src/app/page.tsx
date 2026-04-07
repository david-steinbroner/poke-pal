import { SearchInput } from "@/components/search-input";
import { LeagueCard } from "@/components/league-card";
import { QUICK_PICKS } from "@/lib/constants";
import pokemonData from "@/data/pokemon.json";
import greatLeague from "@/data/leagues/great-league.json";
import ultraLeague from "@/data/leagues/ultra-league.json";
import masterLeague from "@/data/leagues/master-league.json";
import Link from "next/link";

const leagues = [greatLeague, ultraLeague, masterLeague];

export default function Home() {
  return (
    <div className="space-y-6 pt-4">
      <div>
        <h1 className="text-xl font-bold">Poke Pal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Type the boss, copy the string, paste in GO.
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
                className="rounded-full border px-3 py-1.5 text-sm capitalize transition-colors hover:bg-accent"
              >
                {pokemon.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">
          League Meta
        </h2>
        <div className="space-y-2">
          {leagues.map((league) => (
            <LeagueCard
              key={league.id}
              id={league.id}
              name={league.name}
              cpCap={league.cpCap}
              season={league.season}
              active={league.active}
              metaCount={league.meta.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
