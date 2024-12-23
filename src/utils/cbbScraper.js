// cbbScraper.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import { config } from '../../config.js';
import fs from 'fs';

export class CBBScraper {
    constructor() {
        this.baseUrl = config.BBALLNET_BASE_URL;
        this.failedTeams = [];  // Track failed attempts
    }

    logFailure(teamName, slug, url, error) {
        this.failedTeams.push({
            teamName,
            slug,
            url,
            error: error.message
        });
    }

    // Function to output failures to a file
    outputFailures() {
        const failureLog = this.failedTeams.map(f => 
            `Team: ${f.teamName}\nSlug Used: ${f.slug}\nAttempted URL: ${f.url}\nError: ${f.error}\n-------------------`
        ).join('\n');
        
        // Write to a file
        fs.writeFileSync('failed_teams.txt', failureLog);
        
        // Also log to console
        console.log('\nFailed Teams Summary:');
        console.table(this.failedTeams);
    }

    async getTeamData(teamSlug) {
        try {
            const url = `${this.baseUrl}${teamSlug}`;
            console.log(`Fetching data from: ${url}`);
            
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 10000,
                validateStatus: function (status) {
                    return status < 500;
                }
            });
            
            if (response.status === 404) {
                console.warn(`Team page not found for ${teamSlug}`);
                return this.getEmptyTeamData();
            }

            const $ = cheerio.load(response.data);
            
            // Extract NET ranking and record
            const headerInfo = $('.team-name div:nth-child(2)').text();
            const netMatch = headerInfo.match(/NET: (\d+)/);
            const prevNetMatch = headerInfo.match(/Previous: (\d+)/);
            const recordMatch = headerInfo.match(/Record: (\d+-\d+)/);
            const confRecordMatch = headerInfo.match(/\(Conf: (\d+-\d+)\)/);

            // Extract games data
            const games = [];
            $('table tr').each((_, row) => {
                const cols = $(row).find('td');
                if (cols.length >= 6) {
                    games.push({
                        result: $(cols[0]).text().trim(),
                        score_date: $(cols[1]).text().trim(),
                        location: $(cols[2]).text().trim(),
                        opponent_ranking: $(cols[3]).text().trim().replace(/[()]/g, ''),
                        opponent: $(cols[5]).text().trim()
                    });
                }
            });

            const { quadGames, upcoming } = this.organizeGamesIntoQuads(games);

            return {
                net: parseInt(netMatch?.[1]) || null,
                previousNet: parseInt(prevNetMatch?.[1]) || null,
                record: recordMatch?.[1] || 'N/A',
                confRecord: confRecordMatch?.[1] || 'N/A',
                quadGames,
                upcoming
            };
        } catch (error) {
            console.error(`Error scraping data for ${teamSlug}:`, error.message);
            this.logFailure(teamSlug, teamSlug, `${this.baseUrl}${teamSlug}`, error);
            return this.getEmptyTeamData();
        }
    }

    getEmptyTeamData() {
        return {
            net: null,
            previousNet: null,
            record: 'N/A',
            confRecord: 'N/A',
            quadGames: {
                "1": { record: "0-0", games: [] },
                "2": { record: "0-0", games: [] },
                "3": { record: "0-0", games: [] },
                "4": { record: "0-0", games: [] }
            },
            upcoming: []
        };
    }

    organizeGamesIntoQuads(games) {
        const quadGames = {
            "1": { record: "0-0", games: [] },
            "2": { record: "0-0", games: [] },
            "3": { record: "0-0", games: [] },
            "4": { record: "0-0", games: [] }
        };
        
        const upcoming = [];
        
        games.forEach(game => {
            let [score, date] = (game.score_date || "").split(" ");
            
            if (game.result.startsWith('Q')) {
                upcoming.push({
                    quad: game.result,
                    location: game.score_date,
                    opponent: game.opponent,
                    oppNet: parseInt(game.location.replace(/[()]/g, '')),
                    date: game.opponent_ranking
                });
                return;
            }
            
            let quad;
            const oppRank = parseInt(game.opponent_ranking);
            
            if (game.location === 'Home') {
                if (oppRank <= 30) quad = "1";
                else if (oppRank <= 75) quad = "2";
                else if (oppRank <= 160) quad = "3";
                else quad = "4";
            } else if (game.location === 'Away') {
                if (oppRank <= 75) quad = "1";
                else if (oppRank <= 135) quad = "2";
                else if (oppRank <= 240) quad = "3";
                else quad = "4";
            } else { // Neutral
                if (oppRank <= 50) quad = "1";
                else if (oppRank <= 100) quad = "2";
                else if (oppRank <= 200) quad = "3";
                else quad = "4";
            }
            
            quadGames[quad].games.push({
                result: game.result,
                score,
                location: game.location,
                opponent: game.opponent,
                oppNet: oppRank
            });
        });
        
        Object.keys(quadGames).forEach(quad => {
            const wins = quadGames[quad].games.filter(g => g.result === 'W').length;
            const total = quadGames[quad].games.length;
            quadGames[quad].record = `${wins}-${total - wins}`;
        });
        
        return { quadGames, upcoming };
    }

    teamNameToSlug(teamName) {
        const specialCases = {
            // Common Abbreviations
            'SMU': 'southern-methodist',
            'UCF': 'ucf',
            'VMI': 'vmi',
            'UNLV': 'unlv',
            'UMKC': 'missouri-kansas-city',
            'UConn': 'connecticut',
            'UMBC': 'maryland-baltimore-county',
            'UMass Lowell': 'umass-lowell',
            'UMass': 'massachusetts',
            'IUPUI': 'iupui',
            'LIU': 'long-island',
            'USC': 'southern-california',
            'LSU': 'louisiana-state',
            'VCU': 'virginia-commonwealth',
            'TCU': 'texas-christian',
            'Fort Wayne': 'ipfw',
            'Miami (OH)': 'miami-oh',
            'William & Mary': 'william-mary',
            'UC Santa Barbara': 'california-santa-barbara',
            'UAB': 'alabama-birmingham',
            'Charleston': 'college-of-charleston',
            'Houston Christian': 'houston-baptist',
            'McNeese': 'mcneese-state',
            'Louisiana': 'louisiana-lafayette',
            'Grambling St': 'grambling',
            'Saint Mary\'s': 'saint-marys-ca',
            'Loyola (Chi)': 'loyola-il',
            'NC State': 'north-carolina-state',
            


            
            // State Schools
            'Indiana': 'indiana',
            'Florida': 'florida',
            'Maryland': 'maryland',
            'Virginia Tech': 'virginia-tech',
            'Georgia Tech': 'georgia-tech',
            'Texas Tech': 'texas-tech',
            'Penn State': 'penn-state',
            'Arizona': 'arizona',
            'Arizona State': 'arizona-state',
            'Mississippi State': 'mississippi-state',
            'San Diego State': 'san-diego-state',
            'Michigan State': 'michigan-state',
            'Florida State': 'florida-state',
            'Kansas State': 'kansas-state',
            'Washington State': 'washington-state',
            'Jacksonville State': 'jacksonville-state',
            'Sam Houston State': 'sam-houston-state',
            'Youngstown State': 'youngstown-state',
            'Wright State': 'wright-state',
            'Fresno State': 'fresno-state',
            'Colorado State': 'colorado-state',
            'Kennesaw State': 'kennesaw-state',
            'San José State': 'san-jose-state',
            'Georgia State': 'georgia-state',
            'Chicago State': 'chicago-state',
            'Morehead State': 'morehead-state',
            'Tennessee State': 'tennessee-state',
            'Arkansas State': 'arkansas-state',
            'South Carolina State': 'south-carolina-state',
            'Central Connecticut State': 'central-connecticut-state',
            'Coppin State': 'coppin-state',
            'Boise State': 'boise-state',
            'Weber State': 'weber-state',
            'Southeast Missouri State': 'southeast-missouri-state',
    
            // UC/CSU System
            'UC Davis': 'california-davis',
            'UC Irvine': 'california-irvine',
            'UC San Diego': 'california-san-diego',
            'UC Riverside': 'california-riverside',
            'UCLA': 'ucla',
            'CSU Northridge': 'cal-state-northridge',
            'CSU Bakersfield': 'cal-state-bakersfield',
            'CSU Fullerton': 'cal-state-fullerton',
            'Cal Baptist': 'california-baptist',
            'Cal Poly': 'cal-poly',
    
            // UNC System
            'UNC Wilmington': 'north-carolina-wilmington',
            'UNC Asheville': 'north-carolina-asheville',
            'UNC Greensboro': 'north-carolina-greensboro',
            'UNC': 'north-carolina',
            'North Carolina A&T': 'north-carolina-at',
            
            // Directional Schools
            'Northern Kentucky': 'northern-kentucky',
            'North Florida': 'north-florida',
            'South Florida': 'south-florida',
            'Northern Colorado': 'northern-colorado',
            'Western Illinois': 'western-illinois',
            'Southern Indiana': 'southern-indiana',
            'Southern Illinois': 'southern-illinois',
            'Eastern Illinois': 'eastern-illinois',
            'South Alabama': 'south-alabama',
            'Northern Arizona': 'northern-arizona',
            'Northern Iowa': 'northern-iowa',
            'Southern Utah': 'southern-utah',
            'East Tennessee State': 'east-tennessee-state',
            'Southern Mississippi': 'southern-mississippi',
    
            // Special Cases
            'St. Thomas (MN)': 'st-thomas-mn',
            'Mount St. Mary\'s': 'mount-st-marys',
            'Saint Francis (PA)': 'saint-francis-pa',
            'St. Francis (PA)': 'saint-francis-pa',
            'Saint Bonaventure': 'st-bonaventure',
            'Queens University': 'queens-nc',
            'Queens': 'queens-nc',
            'Omaha': 'nebraska-omaha',
            'SIU Edwardsville': 'southern-illinois-edwardsville',
            'Tennessee-Martin': 'tennessee-martin',
            'Tenn-Martin': 'tennessee-martin',
            'UT Arlington': 'ut-arlington',
            'UL Monroe': 'louisiana-monroe',
            'Loyola (MD)': 'loyola-md',
            'Marquette': 'marquette',
            'Florida International': 'florida-international',
            'FIU': 'florida-international',
            'Mississippi Valley State': 'mississippi-valley-state',
            'Ole Miss': 'mississippi',
            'Boston University': 'boston-university',
    
            // Base Names
            'Vermont': 'vermont',
            'Dartmouth': 'dartmouth',
            'Drexel': 'drexel',
            'Xavier': 'xavier',
            'Syracuse': 'syracuse',
            'Navy': 'navy',
            'Fairfield': 'fairfield',
            'Lehigh': 'lehigh',
            'Niagara': 'niagara',
            'Robert Morris': 'robert-morris',
            'Albany': 'albany',
            'Evansville': 'evansville',
            'Bradley': 'bradley',
            'Miami (FL)': 'miami-fl',
            'Miami FL': 'miami-fl',
            'Austin Peay': 'austin-peay',
            'Jacksonville': 'jacksonville',
            'San Francisco': 'san-francisco',
            'Montana': 'montana',
            'Richmond': 'richmond',
            'Chattanooga': 'chattanooga',
            'Bowling Green': 'bowling-green',
            'Stanford': 'stanford',
            'Princeton': 'princeton',
            'Portland': 'portland',
            'Butler': 'butler',
            'Clemson': 'clemson',
            'Drake': 'drake',
            'Denver': 'denver',
            'Harvard': 'harvard',
            'Gonzaga': 'gonzaga',
            'Lafayette': 'lafayette',
            'Manhattan': 'manhattan',
            'Mercer': 'mercer',
            'Pacific': 'pacific',
            'Maine': 'maine',
            'California': 'california',
            'Rutgers': 'rutgers',
    
            // A&M Schools
            'Texas A&M': 'texas-am',
            'Texas A&M-CC': 'texas-am-corpus-christi',
            'Texas A&M-Commerce': 'texas-am-commerce',
            'Alabama A&M': 'alabama-am',
            'Florida A&M': 'florida-am',
            'Boston University': 'boston-university',
            'LIU': 'long-island-university',
            'Long Island': 'long-island-university',
            'Bowling Green': 'bowling-green-state',
            'Mount St. Mary\'s': 'mount-st-marys',
            'UT Arlington': 'texas-arlington',
            'Southern Indiana': 'southern-indiana',
            'SE Missouri State': 'southeast-missouri-state',
            'Bradley': 'bradley-university',
            'Umass Lowell': 'massachusetts-lowell',
            'Albany': 'albany-ny',
            'Miss Valley State': 'mississippi-valley-state',
            'Miami': 'miami-fl',
            'n colorado': 'northern-colorado',
            'UCF': 'central-florida',
            'VMI': 'virginia-military-institute',
            'Boston Univ.': 'boston-university',
            'Mount St. Mary\'s': 'mount-st-marys',
            'Southern Miss': 'southern-mississippi',
            'UNLV': 'nevada-las-vegas',
            'Southern Indiana': 'southern-indiana',
            'SIU Edwardsville': 'southern-illinois-edwardsville',
            'N Colorado': 'northern-colorado',
            'Cal Poly': 'cal-poly'


        };
    
        // Process team name first
        let processedName = teamName
            .replace(/\sU\b/, ' University')
            .replace(/\sSt\b/, ' State')
            .replace(/\bFla\b/, 'Florida')
            .replace(/\bCal\b/, 'California')
            .replace(/\bMt\.\s/, 'Mount ')
            .replace(/Int'l/, 'International')
            .replace(/\bN\.\s/, 'North ')
            .replace(/\bS\.\s/, 'South ');
    
        // Check for exact match first
        if (specialCases[processedName]) {
            return specialCases[processedName];
        }
        // if the team is mount st marys, we need to revert the change we made to the st when we made it into state
        if (processedName === 'mount state marys') {
            processedName = processedName.replace('state', 'st');
        }
        if (processedName === 'california poly') {
            processedName = processedName.replace('california', 'cal');
        }

        // Remove "University" if present
        const withoutUniversity = processedName.replace(/\sUniversity/, '');
        if (specialCases[withoutUniversity]) {
            return specialCases[withoutUniversity];
        }
    
        // Remove mascots
        const removeSuffixRegex = /\s(Bulldogs|Volunteers|Golden Bears|Golden Grizzlies|Wolfpack|Billikens|Antelopes||Big Red|Redbirds|Crimson Tide|Golden Flashes|Sooners|Bearcats|Sooners|Gaels|Mastodons|Fighting Illini|Cyclones|Cavaliers|Titans|Badgers|Quakers|Patriots|Lakers|Gauchos|Horned Frogs|Tribe|Blazers|Braves|Jayhawks|Beavers|Mean Green|Privateers|Cowboys|Ragin\' Cajuns|Bearcats|Broncs|Ramblers|Fighting Irish|Hoyas|Gaels|Racers|Cornhuskers|Rainbow Warriors|49ers|Dolphins|Bulls|Thundering Herd|Seminoles|Falcons|Penguins|Colonials|Red Raiders|Norse|Terrapins|Nittany Lions|Hoosiers|Screaming|Tigers|Eagles|Panthers|Wildcats|Cardinals|Hawks|Bears|Cougars|Huskies|Pirates|Warriors|Spartans|Broncos|Owls|Lions|Flames|Bobcats|Blue Devils|Rams|Aggies|Miners|Knights|Seawolves|Blue Hose|Red Foxes|Golden Griffins|Retrievers|Jaspers|Kangaroos|Colonels|Commodores|Buffaloes|Crimson|Paladins|Bruins|Monarchs|Waves|Pilots|Thunderbirds|Lumberjacks|Boilermakers|Leathernecks|Toreros|Wolverines|Roadrunners|Vikings|Aztecs|Tritons|Keydets|Phoenix|Shockers|Ducks|Cardinal|Bison|Mustangs|Mavericks|Hawkeyes|Utes|Jaguars|Buckeyes|Coyotes|Royals|Rebels|Pioneers|Wolf Pack|Lancers|Redhawks|Skyhawks|Leopards|Vandals|Blue Demons|Bluejays|Chippewas|Minutemen|Sun Devils|Highlanders|Warhawks|Tar Heels|Golden Hurricane|Delta Devils|Governors|Chanticleers|Red Wolves|Dukes|Anteaters|Razorbacks|Seahawks|Mountaineers|Islanders|Salukis|Trojans|Golden Gophers|Raiders|Gamecocks|Buccaneers|Demon Deacons|Matadors|Golden Eagles|Purple Eagles|Red Flash|Great Danes|Purple Aces|River Hawks|Terriers|Tommies|Mountain Hawks|Scarlet Knights|Golden Panthers|Hurricanes|Orange|Hokies|Midshipmen|Stags|Greyhounds|Sharks|Black Bears|Bonnies|Bearkats|Yellow Jackets|Blue Raiders|Mocs|Big Green|Catamounts|Dragons|Ospreys|Gators|Musketeers|Grizzlies|Dons|Spiders)$/i;
    
        const withoutMascot = withoutUniversity.replace(removeSuffixRegex, '');
        
        // Check processed name against special cases
        if (specialCases[withoutMascot.trim()]) {
            return specialCases[withoutMascot.trim()];
        }
    
        // Final processing for anything not caught above
        return withoutMascot
            .toLowerCase()
            .replace(/^the\s+/, '')
            .replace(/\([^)]+\)/g, '')
            .replace(/[.']/g, '')
            .replace(/&/g, 'and')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .trim();
    }
}