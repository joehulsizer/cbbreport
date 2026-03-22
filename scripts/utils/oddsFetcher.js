// oddsFetcher.js
import axios from 'axios';
import { config } from '../../config.js';

export class OddsFetcher {
    constructor() {
        this.apiKey = config.ODDS_API_KEY;
        this.apiUrl = config.ODDS_API_URL;
    }

    async getTodaysGames() {
        try {
            console.log('Fetching odds from The Odds API...');
            // Bounded window so we don't get a stale mixed bag; we still filter to ET "today" in generateReport.
            const now = Date.now();
            const commenceTimeFrom = new Date(now - 18 * 60 * 60 * 1000).toISOString();
            const commenceTimeTo = new Date(now + 48 * 60 * 60 * 1000).toISOString();

            let response;
            try {
                response = await axios.get(this.apiUrl, {
                    params: {
                        apiKey: this.apiKey,
                        commenceTimeFrom,
                        commenceTimeTo,
                        ...config.ODDS_PARAMS
                    }
                });
            } catch (err) {
                // Some API versions reject time filters; fall back to unbounded pull (we filter by ET date in generateReport).
                if (err.response?.status === 400 || err.response?.status === 422) {
                    console.warn('Odds API rejected time window; retrying without commenceTime bounds.');
                    response = await axios.get(this.apiUrl, {
                        params: {
                            apiKey: this.apiKey,
                            ...config.ODDS_PARAMS
                        }
                    });
                } else {
                    throw err;
                }
            }

            if (response.data.length === 0) {
                console.log('No games found for today.');
                return [];
            }

            console.log(`Found ${response.data.length} games`);
            return this.processOddsResponse(response.data);
        } catch (error) {
            console.error('Error fetching odds:', error.message);
            if (error.response?.status === 429) {
                console.error('API rate limit exceeded. Please wait before trying again.');
            }
            return [];
        }
    }

    processOddsResponse(data) {
        return data.map(game => {
            const homeTeam = game.home_team;
            const awayTeam = game.away_team;
            const odds = {};

            config.PREFERRED_BOOKMAKERS.forEach(bookmaker => {
                const bookmakerData = game.bookmakers.find(b => 
                    b.key.toLowerCase() === bookmaker.toLowerCase()
                );

                if (bookmakerData) {
                    odds[bookmaker] = this.extractBookmakerOdds(bookmakerData, homeTeam, awayTeam);
                }
            });

            return {
                home: homeTeam,
                away: awayTeam,
                commence_time: game.commence_time,
                odds
            };
        });
    }

    extractBookmakerOdds(bookmakerData, homeTeam, awayTeam) {
        const odds = {};

        // Get moneyline odds
        const h2hMarket = bookmakerData.markets.find(m => m.key === 'h2h');
        if (h2hMarket) {
            const homeOdds = h2hMarket.outcomes.find(o => o.name === homeTeam);
            const awayOdds = h2hMarket.outcomes.find(o => o.name === awayTeam);
            odds.home = homeOdds?.price;
            odds.away = awayOdds?.price;
        }

        // Get spread odds
        const spreadsMarket = bookmakerData.markets.find(m => m.key === 'spreads');
        if (spreadsMarket) {
            const homeSpread = spreadsMarket.outcomes.find(o => o.name === homeTeam);
            const awaySpread = spreadsMarket.outcomes.find(o => o.name === awayTeam);
            odds.homeSpread = homeSpread?.point;
            odds.awaySpread = awaySpread?.point;
            odds.homeSpreadOdds = homeSpread?.price;
            odds.awaySpreadOdds = awaySpread?.price;
        }

        return odds;
    }
}