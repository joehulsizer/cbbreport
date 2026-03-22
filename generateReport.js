// generateReport.js
import { OddsFetcher } from './scripts/utils/oddsFetcher.js';
import { CBBScraper } from './scripts/utils/cbbScraper.js';
import { KenPomScraper } from './scripts/utils/kenpomScraper.js';
import { getEasternYmd, filterGamesForEasternReportDate } from './scripts/utils/reportDate.js';
import fs from 'fs';
import path from 'path';

// Helper function to add KenPom rankings to quad games
function addKenPomToQuadGames(quadGames, kenpomScraper) {
    const enrichedQuadGames = {};
    
    for (const [quad, quadData] of Object.entries(quadGames)) {
        enrichedQuadGames[quad] = {
            ...quadData,
            games: quadData.games.map(game => ({
                ...game,
                oppKenpom: kenpomScraper.getRanking(game.opponent)
            }))
        };
    }
    
    return enrichedQuadGames;
}

function writeJsonReports(report, timestamp) {
    fs.writeFileSync(`cbb_report_${timestamp}.json`, JSON.stringify(report, null, 2));
    const publicPath = path.join(process.cwd(), 'public', 'cbb_report_latest.json');
    fs.writeFileSync(publicPath, JSON.stringify(report, null, 2));
    console.log(`Wrote latest data to: ${publicPath}`);
}

async function generateDailyReport() {
    const oddsFetcher = new OddsFetcher();
    const cbbScraper = new CBBScraper();
    const kenpomScraper = new KenPomScraper();
    
    try {
        const reportYmd = getEasternYmd();
        const timestamp = new Date().toISOString().split('T')[0];

        // Get odds for a rolling window, then keep only games tipping on today's Eastern calendar date
        console.log('Fetching today\'s games and odds...');
        const rawGames = await oddsFetcher.getTodaysGames();
        const games = filterGamesForEasternReportDate(rawGames, reportYmd);

        console.log(
            `Odds API: ${rawGames.length} events in window; ${games.length} tip on ${reportYmd} (America/New_York).`
        );

        if (games.length === 0) {
            console.log('No games for this Eastern report date — writing empty slate so the site does not show stale games.');
            const emptyReport = {
                generated_at: new Date().toISOString(),
                report_date_eastern: reportYmd,
                games: []
            };
            writeJsonReports(emptyReport, timestamp);
            return;
        }

        console.log('Fetching KenPom / efficiency rankings...');
        await kenpomScraper.getAllRankings();

        // Process each game
        console.log(`Processing ${games.length} games...`);
        const reportData = [];
        
        for (const game of games) {
            console.log(`\nProcessing ${game.away} @ ${game.home}...`);
            
            try {
                const homeSlug = cbbScraper.teamNameToSlug(game.home);
                const awaySlug = cbbScraper.teamNameToSlug(game.away);
                
                console.log(`Converted team names to slugs: ${awaySlug} @ ${homeSlug}`);
                
                const [homeData, awayData] = await Promise.all([
                    cbbScraper.getTeamData(homeSlug),
                    cbbScraper.getTeamData(awaySlug)
                ]);
                
                // Add KenPom rankings to the data
                const homeKenpom = kenpomScraper.getRanking(game.home);
                const awayKenpom = kenpomScraper.getRanking(game.away);
                
                // Add KenPom rankings for all opponents in quad games
                const enrichHomeData = {
                    ...homeData,
                    kenpom: homeKenpom,
                    quadGames: addKenPomToQuadGames(homeData.quadGames, kenpomScraper)
                };
                
                const enrichAwayData = {
                    ...awayData,
                    kenpom: awayKenpom,
                    quadGames: addKenPomToQuadGames(awayData.quadGames, kenpomScraper)
                };
                
                reportData.push({
                    matchup: {
                        home: game.home,
                        away: game.away,
                        commence_time: game.commence_time,
                        odds: game.odds
                    },
                    teams: {
                        [game.home]: enrichHomeData,
                        [game.away]: enrichAwayData
                    }
                });
            } catch (error) {
                console.error(`Error processing game ${game.away} @ ${game.home}:`, error.message);
                // Continue with next game instead of failing completely
                continue;
            }
        }
        
        const report = {
            generated_at: new Date().toISOString(),
            report_date_eastern: reportYmd,
            games: reportData
        };

        writeJsonReports(report, timestamp);
        
        // (Optional) Generate a human-readable txt report too
        let readableReport = `College Basketball Daily Report - ${timestamp}\n\n`;
        for (const game of reportData) {
            readableReport += `=== ${game.matchup.away} @ ${game.matchup.home} ===\n`;
            readableReport += `Game Time: ${new Date(game.matchup.commence_time).toLocaleString()}\n\n`;
            // Add odds info
            readableReport += 'Odds:\n';
            Object.entries(game.matchup.odds).forEach(([book, odds]) => {
                readableReport += `${book}:\n`;
                if (odds.home && odds.away) {
                    readableReport += `  Moneyline: ${odds.home} (H) / ${odds.away} (A)\n`;
                }
                if (odds.homeSpread && odds.awaySpread) {
                    readableReport += `  Spread: ${odds.homeSpread} (${odds.homeSpreadOdds}) / ${odds.awaySpread} (${odds.awaySpreadOdds})\n`;
                }
            });
            readableReport += '\n';
            
            // Add team data
            ['away', 'home'].forEach(teamType => {
                const team = game.matchup[teamType];
                const teamData = game.teams[team];
                
                readableReport += `${team}:\n`;
                readableReport += `NET Rank: ${teamData.net} (Previous: ${teamData.previousNet})\n`;
                readableReport += `Record: ${teamData.record} (Conf: ${teamData.confRecord})\n\n`;
                
                // Quad info
                Object.entries(teamData.quadGames).forEach(([quad, quadData]) => {
                    readableReport += `Quad ${quad} (${quadData.record}):\n`;
                    quadData.games.forEach(gm => {
                        readableReport += `  ${gm.result} ${gm.score} ${gm.location} vs ${gm.opponent} (${gm.oppNet})\n`;
                    });
                    readableReport += '\n';
                });
                
                // Upcoming
                if (teamData.upcoming.length > 0) {
                    readableReport += 'Upcoming Games:\n';
                    teamData.upcoming.forEach(up => {
                        readableReport += `  ${up.quad} ${up.location} vs ${up.opponent} (${up.oppNet}) - ${up.date}\n`;
                    });
                    readableReport += '\n';
                }
            });
            
            readableReport += '\n=============================\n\n';
        }
        
        fs.writeFileSync(`cbb_report_${timestamp}.txt`, readableReport);
        
        if (cbbScraper.failedTeams.length > 0) {
            console.log('\nOutputting failed teams to file...');
            cbbScraper.outputFailures();
        }
        
        console.log('Report generation complete!');
        console.log(`Reports saved as cbb_report_${timestamp}.json and cbb_report_${timestamp}.txt`);
        
    } catch (error) {
        console.error('Error generating report:', error);
        throw error;
    }
}

// Run the report generator
generateDailyReport().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
