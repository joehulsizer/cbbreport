// generateReport.js
import { OddsFetcher } from './src/utils/oddsFetcher.js';
import { CBBScraper } from './src/utils/cbbScraper.js';
import fs from 'fs';

async function generateDailyReport() {
    const oddsFetcher = new OddsFetcher();
    const cbbScraper = new CBBScraper();
    
    try {
        // Get today's games and odds
        console.log('Fetching today\'s games and odds...');
        const games = await oddsFetcher.getTodaysGames();
        
        if (games.length === 0) {
            console.log('No games found for today. Exiting...');
            return;
        }

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
                
                reportData.push({
                    matchup: {
                        home: game.home,
                        away: game.away,
                        commence_time: game.commence_time,
                        odds: game.odds
                    },
                    teams: {
                        [game.home]: homeData,
                        [game.away]: awayData
                    }
                });
            } catch (error) {
                console.error(`Error processing game ${game.away} @ ${game.home}:`, error.message);
                // Continue with next game instead of failing completely
                continue;
            }
        }
        
        // Generate report files
        const timestamp = new Date().toISOString().split('T')[0];
        const report = {
            generated_at: new Date().toISOString(),
            games: reportData
        };
        
        // Save as JSON for programmatic use
        fs.writeFileSync(`cbb_report_${timestamp}.json`, JSON.stringify(report, null, 2));
        
        // Generate human-readable report
        let readableReport = `College Basketball Daily Report - ${timestamp}\n\n`;
        
        for (const game of reportData) {
            readableReport += `=== ${game.matchup.away} @ ${game.matchup.home} ===\n`;
            readableReport += `Game Time: ${new Date(game.matchup.commence_time).toLocaleString()}\n\n`;
            
            // Add odds information
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
                
                // Add quad information
                Object.entries(teamData.quadGames).forEach(([quad, quadData]) => {
                    readableReport += `Quad ${quad} (${quadData.record}):\n`;
                    quadData.games.forEach(game => {
                        readableReport += `  ${game.result} ${game.score} ${game.location} vs ${game.opponent} (${game.oppNet})\n`;
                    });
                    readableReport += '\n';
                });
                
                // Add upcoming games
                if (teamData.upcoming.length > 0) {
                    readableReport += 'Upcoming Games:\n';
                    teamData.upcoming.forEach(game => {
                        readableReport += `  ${game.quad} ${game.location} vs ${game.opponent} (${game.oppNet}) - ${game.date}\n`;
                    });
                    readableReport += '\n';
                }
            });
            
            readableReport += '\n=============================\n\n';
        }
        
        // Save readable report
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