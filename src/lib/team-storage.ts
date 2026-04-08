/**
 * Persist team state per league in localStorage.
 * All access is wrapped in try/catch so private-browsing
 * and storage-full scenarios degrade silently.
 */

const STORAGE_KEY_PREFIX = "poke-pal:team:";

export function saveTeam(leagueId: string, team: string[]): void {
  try {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${leagueId}`,
      JSON.stringify(team),
    );
  } catch {
    // Private browsing or storage full — silently fail
  }
}

export function loadTeam(leagueId: string): string[] {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${leagueId}`);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.every((id) => typeof id === "string")) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function clearTeam(leagueId: string): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${leagueId}`);
  } catch {
    // silently fail
  }
}

export function getAllSavedTeams(): Array<{ leagueId: string; pokemonIds: string[] }> {
  const teams: Array<{ leagueId: string; pokemonIds: string[] }> = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        const leagueId = key.slice(STORAGE_KEY_PREFIX.length);
        const val = localStorage.getItem(key);
        if (val) {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.length > 0) {
            teams.push({ leagueId, pokemonIds: parsed });
          }
        }
      }
    }
  } catch {
    // silently fail
  }
  return teams;
}
