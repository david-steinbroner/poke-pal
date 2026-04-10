import { getPokemonName } from "@/lib/pokemon-utils";
import { buildNameSearchString, buildLeagueEligibleString } from "@/lib/search-string";
import currentRaids from "@/data/current-raids.json";
import pokemonData from "@/data/pokemon.json";
import curatedTeamsData from "@/data/curated-teams.json";
import { getActiveLeagues } from "@/data/leagues";
import { HomeClient } from "@/components/home/home-client";

const activeLeagues = getActiveLeagues();

// Build league data with search strings (at build time)
const leagueData = activeLeagues.map((league) => {
  const metaNames = league.meta.map((m) => {
    const pokemon = pokemonData.find((p) => p.id === m.pokemonId);
    return pokemon?.name ?? m.pokemonId;
  });
  const metaSearchString = buildNameSearchString(metaNames);
  const cpString = buildLeagueEligibleString(league.cpCap);
  const fullSearchString =
    league.cpCap === 9999 ? metaSearchString : `${metaSearchString}&${cpString}`;

  // Build curated teams with search strings
  const rawTeams = (curatedTeamsData.teams as Record<string, Array<{ name: string; pokemon: string[]; why: string; lead: string }>>)[league.id] ?? [];
  const curatedTeams = rawTeams.map((t) => {
    const teamNames = t.pokemon.map((id) => getPokemonName(id));
    const teamSearchString = buildNameSearchString(teamNames);
    const teamFullString = league.cpCap === 9999 ? teamSearchString : `${teamSearchString}&${cpString}`;
    return { ...t, searchString: teamFullString };
  });

  return {
    id: league.id,
    name: league.name,
    metaPokemonIds: league.meta.map((m) => m.pokemonId),
    searchString: fullSearchString,
    curatedTeams,
  };
});

// Current raid bosses filtered to Pokemon we have data for, tagged by raid type
type RaidTag = "5★" | "Mega" | "Shadow" | "Dynamax" | "3★" | "1★";
const raidEntries: { ids: string[]; tag: RaidTag }[] = [
  { ids: currentRaids.fivestar, tag: "5★" },
  { ids: currentRaids.mega, tag: "Mega" },
  { ids: currentRaids.shadow, tag: "Shadow" },
  { ids: currentRaids.dynamax, tag: "Dynamax" },
  { ids: currentRaids.threestar, tag: "3★" },
  { ids: currentRaids.onestar, tag: "1★" },
];
const raidBosses = raidEntries
  .flatMap(({ ids, tag }) => ids.map((id) => ({ id, tag })))
  .filter(({ id }) => pokemonData.some((p) => p.id === id))
  .map(({ id, tag }) => ({ id, name: getPokemonName(id), tag }));

export default function Home() {
  return (
    <HomeClient
      leagues={leagueData}
      raidBosses={raidBosses}
    />
  );
}
