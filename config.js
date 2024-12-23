// config.js
import 'dotenv/config'

export const config = {
    ODDS_API_KEY: process.env.ODDS_API_KEY || "default_key",
    ODDS_API_URL: "https://api.the-odds-api.com/v4/sports/basketball_ncaab/odds",
    BBALLNET_BASE_URL: "https://bballnet.com/teams/",
    PREFERRED_BOOKMAKERS: [
        "fanduel",
        "draftkings",
        "betmgm",
        "caesars",
        "espnbet"
    ],
    ODDS_PARAMS: {
        regions: "us",
        markets: "h2h,spreads",
        oddsFormat: "american"
    }
};