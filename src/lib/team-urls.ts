/**
 * Build a shareable team URL using query params.
 * Uses /teams which already handles l= and p= params.
 */
export function buildTeamUrl(leagueId: string, teamIds: string[]): string {
  return `/teams?l=${leagueId}&p=${teamIds.join(",")}`;
}

/**
 * Build an absolute team URL for sharing.
 */
export function buildAbsoluteTeamUrl(
  leagueId: string,
  teamIds: string[],
): string {
  return `https://poke-pal.pages.dev${buildTeamUrl(leagueId, teamIds)}`;
}
