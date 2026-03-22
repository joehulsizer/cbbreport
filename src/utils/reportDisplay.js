const ET = 'America/New_York';
const ymdFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: ET,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function getEasternYmd(date = new Date()) {
  return ymdFmt.format(date);
}

/** Eastern calendar YYYY-MM-DD for an ISO commence time */
export function commenceDateEastern(iso) {
  if (!iso) return null;
  return ymdFmt.format(new Date(iso));
}

export function filterGamesToEasternDate(games, easternYmd) {
  if (!Array.isArray(games)) return [];
  return games.filter((game) => commenceDateEastern(game.matchup?.commence_time) === easternYmd);
}

export function validateReportForEasternDate(data, easternYmd = getEasternYmd()) {
  if (!data || !Array.isArray(data.games)) {
    return {
      isValid: false,
      isExactMatch: false,
      canRepair: false,
      matchingGames: 0,
      totalGames: 0,
      repairedReport: null,
    };
  }

  const matchingGames = filterGamesToEasternDate(data.games, easternYmd);
  const hasExpectedReportDate = data.report_date_eastern === easternYmd;
  const isExactMatch =
    hasExpectedReportDate && (data.games.length === 0 || matchingGames.length === data.games.length);
  const canRepair = matchingGames.length > 0 || (hasExpectedReportDate && data.games.length === 0);

  return {
    isValid: isExactMatch || canRepair,
    isExactMatch,
    canRepair,
    matchingGames: matchingGames.length,
    totalGames: data.games.length,
    repairedReport: canRepair
      ? {
          ...data,
          report_date_eastern: easternYmd,
          games: matchingGames,
        }
      : null,
  };
}

export function reportLooksMisdated(data) {
  if (!data?.games?.length || !data.report_date_eastern) return false;
  const mismatches = data.games.filter(
    (g) => commenceDateEastern(g.matchup?.commence_time) !== data.report_date_eastern
  );
  return mismatches.length > data.games.length * 0.5;
}

export function hoursSinceGenerated(data) {
  if (!data?.generated_at) return Infinity;
  return (Date.now() - new Date(data.generated_at).getTime()) / 3600000;
}

/** True if every game started more than ~36h ago (likely not "today's" board). */
export function slateIsEntirelyInThePast(data) {
  if (!data?.games?.length) return false;
  const cutoff = Date.now() - 36 * 3600000;
  return data.games.every((g) => {
    const t = g.matchup?.commence_time;
    return t && new Date(t).getTime() < cutoff;
  });
}
