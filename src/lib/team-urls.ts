/**
 * Build an absolute team URL for sharing.
 */
export function buildAbsoluteTeamUrl(
  leagueId: string,
  teamIds: string[],
): string {
  return `https://poke-pal.pages.dev/teams?l=${leagueId}&p=${teamIds.join(",")}`;
}
