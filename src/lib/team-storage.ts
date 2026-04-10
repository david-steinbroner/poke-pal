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

/* ------------------------------------------------------------------ */
/*  Advisor / Pool storage — prefix: poke-pal:advisor:<leagueId>       */
/* ------------------------------------------------------------------ */

const ADVISOR_KEY_PREFIX = "poke-pal:advisor:";

export type AdvisorState = { pool: string[]; cpCopied: boolean };

const DEFAULT_ADVISOR_STATE: AdvisorState = { pool: [], cpCopied: false };

export function saveAdvisorState(leagueId: string, state: AdvisorState): void {
  try {
    localStorage.setItem(
      `${ADVISOR_KEY_PREFIX}${leagueId}`,
      JSON.stringify(state),
    );
  } catch {
    // Private browsing or storage full — silently fail
  }
}

export function loadAdvisorState(leagueId: string): AdvisorState {
  try {
    const stored = localStorage.getItem(`${ADVISOR_KEY_PREFIX}${leagueId}`);
    if (!stored) return { ...DEFAULT_ADVISOR_STATE };
    const parsed = JSON.parse(stored);
    if (
      parsed &&
      Array.isArray(parsed.pool) &&
      parsed.pool.every((id: unknown) => typeof id === "string") &&
      typeof parsed.cpCopied === "boolean"
    ) {
      return parsed as AdvisorState;
    }
    return { ...DEFAULT_ADVISOR_STATE };
  } catch {
    return { ...DEFAULT_ADVISOR_STATE };
  }
}

export function addToPool(leagueId: string, pokemonId: string): string[] {
  const state = loadAdvisorState(leagueId);
  if (!state.pool.includes(pokemonId)) {
    state.pool.push(pokemonId);
    saveAdvisorState(leagueId, state);
  }
  return state.pool;
}

export function removeFromPool(leagueId: string, pokemonId: string): string[] {
  const state = loadAdvisorState(leagueId);
  state.pool = state.pool.filter((id) => id !== pokemonId);
  saveAdvisorState(leagueId, state);
  return state.pool;
}

export function clearPool(leagueId: string): void {
  const state = loadAdvisorState(leagueId);
  state.pool = [];
  state.cpCopied = false;
  saveAdvisorState(leagueId, state);
}

export function setCpCopied(leagueId: string): void {
  const state = loadAdvisorState(leagueId);
  state.cpCopied = true;
  saveAdvisorState(leagueId, state);
}

/* ------------------------------------------------------------------ */
/*  Saved teams enumeration                                            */
/* ------------------------------------------------------------------ */

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
