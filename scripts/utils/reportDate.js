/**
 * Report "today" is the calendar date in America/New_York (ET) when the job runs.
 * Game tip times are compared on that same calendar day so late ET games stay grouped correctly.
 */
const EASTERN_TZ = 'America/New_York';

const ymdFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: EASTERN_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** @param {Date} [date] */
export function getEasternYmd(date = new Date()) {
  return ymdFormatter.format(date);
}

/**
 * @param {string} commenceIso - game.commence_time from Odds API
 * @param {string} reportYmd - YYYY-MM-DD from getEasternYmd() at generation time
 */
export function isGameOnEasternReportDate(commenceIso, reportYmd) {
  if (!commenceIso) return false;
  const gameYmd = ymdFormatter.format(new Date(commenceIso));
  return gameYmd === reportYmd;
}

/**
 * @param {Array<{ commence_time: string }>} games
 * @param {string} reportYmd
 */
export function filterGamesForEasternReportDate(games, reportYmd) {
  return games.filter((g) => isGameOnEasternReportDate(g.commence_time, reportYmd));
}
