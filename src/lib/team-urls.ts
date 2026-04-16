/**
 * Build an absolute team URL for sharing.
 */
export function buildAbsoluteTeamUrl(
  leagueId: string,
  teamIds: string[],
): string {
  return `https://pogopal.com/teams?l=${leagueId}&p=${teamIds.join(",")}`;
}
