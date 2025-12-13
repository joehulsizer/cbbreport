// kenpomScraper.js
import axios from 'axios';
import * as cheerio from 'cheerio';

export class KenPomScraper {
    constructor() {
        this.baseUrl = 'https://kenpom.com/';
        this.rankings = new Map();
    }

    async getAllRankings() {
        try {
            console.log('Fetching KenPom rankings...');
            
            const response = await axios.get(this.baseUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 15000
            });

            const $ = cheerio.load(response.data);
            const rankings = {};

            // KenPom's table structure: find the main rankings table
            $('table#ratings-table tbody tr').each((index, row) => {
                const cols = $(row).find('td');
                
                if (cols.length >= 2) {
                    // First column is rank, second is team name
                    const rank = parseInt($(cols[0]).text().trim());
                    const teamName = $(cols[1]).find('a').text().trim();
                    
                    if (teamName && !isNaN(rank)) {
                        // Store with original KenPom name
                        rankings[teamName] = rank;
                        
                        // Also store with normalized variations
                        const normalized = this.normalizeTeamName(teamName);
                        rankings[normalized] = rank;
                        
                        // Store uppercase version for fuzzy matching
                        rankings[teamName.toUpperCase()] = rank;
                        rankings[normalized.toUpperCase()] = rank;
                        
                        // Debug first few entries
                        if (index < 5) {
                            console.log(`KenPom: "${teamName}" -> ${rank} (normalized: "${normalized}")`);
                        }
                    }
                }
            });

            console.log(`Loaded ${Object.keys(rankings).length / 4} unique KenPom rankings`);
            this.rankings = rankings;
            return rankings;
        } catch (error) {
            console.error('Error fetching KenPom rankings:', error.message);
            return {};
        }
    }

    normalizeTeamName(teamName) {
        // First, strip any ranking numbers that might be prepended
        teamName = teamName.replace(/^\d+\s+/, '').trim();
        
        // Special cases that need exact matching (including WITH mascots for direct lookup)
        const specialCases = {
            // Full team names with mascots (from Odds API)
            'GW Revolutionaries': 'George Washington',
            'Boston Univ. Terriers': 'Boston University',
            'Coppin St Eagles': 'Coppin St.',
            'East Tennessee St Buccaneers': 'East Tennessee St.',
            'Fort Wayne Mastodons': 'Purdue Fort Wayne',
            'Oklahoma St Cowboys': 'Oklahoma St.',
            'Prairie View Panthers': 'Prairie View A&M',
            'Texas State Bobcats': 'Texas St.',
            'Tenn-Martin Skyhawks': 'UT Martin',
            'Colorado St Rams': 'Colorado St.',
            'Fresno St Bulldogs': 'Fresno St.',
            'Utah State Aggies': 'Utah St.',
            'Weber State Wildcats': 'Weber St.',
            'Oregon St Beavers': 'Oregon St.',
            'South Dakota St Jackrabbits': 'South Dakota St.',
            'Long Beach St 49ers': 'Long Beach St.',
            'Montana St Bobcats': 'Montana St.',
            'Portland St Vikings': 'Portland St.',
            'Hawai\'i Rainbow Warriors': 'Hawaii',
            'Miss Valley St Delta Devils': 'Mississippi Valley St.',
            'Michigan St Spartans': 'Michigan St.',
            'San José St Spartans': 'San Jose St.',
            'Florida Int\'l Golden Panthers': 'Florida International',
            'Kansas St Wildcats': 'Kansas St.',
            'NC State Wolfpack': 'N.C. State',
            'Nicholls St Colonels': 'Nicholls',
            'Arkansas-Little Rock Trojans': 'Little Rock',
            'Penn State Nittany Lions': 'Penn St.',
            'UMKC Kangaroos': 'Kansas City',
            'Delaware St Hornets': 'Delaware St.',
            'Kent State Golden Flashes': 'Kent St.',
            'Cleveland St Vikings': 'Cleveland St.',
            'Miami (OH) RedHawks': 'Miami OH',
            'Chicago St Cougars': 'Chicago St.',
            'Loyola (MD) Greyhounds': 'Loyola MD',
            'Arkansas-Pine Bluff Golden Lions': 'Arkansas Pine Bluff',
            'SE Louisiana Lions': 'Southeastern Louisiana',
            'Mississippi St Bulldogs': 'Mississippi St.',
            'SE Missouri St Redhawks': 'Southeast Missouri',
            'St. Thomas (MN) Tommies': 'St. Thomas',
            'Wright St Raiders': 'Wright St.',
            'Boise State Broncos': 'Boise St.',
            'Morgan St Bears': 'Morgan St.',
            'Youngstown St Penguins': 'Youngstown St.',
            'CSU Fullerton Titans': 'Cal St. Fullerton',
            'Murray St Racers': 'Murray St.',
            'UT-Arlington Mavericks': 'UT Arlington',
            'Missouri St Bears': 'Missouri St.',
            'UConn Huskies': 'Connecticut',
            'Jackson St Tigers': 'Jackson St.',
            'South Carolina Upstate Spartans': 'USC Upstate',
            'Ball State Cardinals': 'Ball St.',
            'Bethune-Cookman Wildcats': 'Bethune Cookman',
            'Gardner-Webb Bulldogs': 'Gardner Webb',
            'N Colorado Bears': 'Northern Colorado',
            'New Mexico St Aggies': 'New Mexico St.',
            'Sam Houston St Bearkats': 'Sam Houston St.',
            'Idaho State Bengals': 'Idaho St.',
            'Omaha Mavericks': 'Nebraska Omaha',
            'UIC Flames': 'Illinois Chicago',
            'Pennsylvania Quakers': 'Penn',
            'Alabama St Hornets': 'Alabama St.',
            'Arizona St Sun Devils': 'Arizona St.',
            'Georgia St Panthers': 'Georgia St.',
            'Iowa State Cyclones': 'Iowa St.',
            'North Dakota St Bison': 'North Dakota St.',
            'SIU-Edwardsville Cougars': 'SIUE',
            'CSU Bakersfield Roadrunners': 'Cal St. Bakersfield',
            'UL Monroe Warhawks': 'Louisiana Monroe',
            'IUPUI Jaguars': 'IU Indy',
            'Florida St Seminoles': 'Florida St.',
            'Tenn-Martin Skyhawks': 'Tennessee Martin',
            'St. Francis (PA) Red Flash': 'Saint Francis PA',
            'Maryland-Eastern Shore Hawks': 'Maryland Eastern Shore',
            'Alcorn St Braves': 'Alcorn St.',
            'Ole Miss Rebels': 'Mississippi',
            'Wichita St Shockers': 'Wichita St.',
            'Grambling St Tigers': 'Grambling St.',
            'Northwestern St Demons': 'Northwestern St.',
            'San Diego St Aztecs': 'San Diego St.',
            'Sacramento St Hornets': 'Sacramento St.',
            'South Carolina St Bulldogs': 'South Carolina St.',
            'Indiana St Sycamores': 'Indiana St.',
            'Jacksonville St Gamecocks': 'Jacksonville St.',
            'Mt. St. Mary\'s Mountaineers': 'Mount St. Mary\'s',
            'Arkansas St Red Wolves': 'Arkansas St.',
            'Washington St Cougars': 'Washington St.',
            'Miami Hurricanes': 'Miami FL',
            'Tennessee St Tigers': 'Tennessee St.',
            'Ohio State Buckeyes': 'Ohio St.',
            'Tarleton State Texans': 'Tarleton St.',
            'Appalachian St Mountaineers': 'Appalachian St.',
            'Central Connecticut St Blue Devils': 'Central Connecticut',
            'Morehead St Eagles': 'Morehead St.',
            'Norfolk St Spartans': 'Norfolk St.',
            'Loyola (Chi) Ramblers': 'Loyola Chicago',
            
            // State abbreviations (without mascots)
            'Penn State': 'Penn St.',
            'Coppin St': 'Coppin St.',
            'East Tennessee St': 'East Tennessee St.',
            'Oklahoma St': 'Oklahoma St.',
            'Colorado St': 'Colorado St.',
            'Fresno St': 'Fresno St.',
            'Kansas St': 'Kansas St.',
            'Michigan St': 'Michigan St.',
            'South Dakota St': 'South Dakota St.',
            'Long Beach St': 'Long Beach St.',
            'Montana St': 'Montana St.',
            'Portland St': 'Portland St.',
            'Miss Valley St': 'Mississippi Valley St.',
            'San José St': 'San Jose St.',
            'San Jose St': 'San Jose St.',
            'Tenn-Martin': 'UT Martin',
            'NC State': 'N.C. State',
            'Oregon St': 'Oregon St.',
            'Utah State': 'Utah St.',
            'Weber State': 'Weber St.',
            'Nicholls St': 'Nicholls',
            'Iowa St.': 'Iowa St.',
            'Iowa St': 'Iowa St.',
            'Delaware St': 'Delaware St.',
            'Kent State': 'Kent St.',
            'Cleveland St': 'Cleveland St.',
            'Chicago St': 'Chicago St.',
            'Mississippi St': 'Mississippi St.',
            'Wright St': 'Wright St.',
            'Boise State': 'Boise St.',
            'Morgan St': 'Morgan St.',
            'Youngstown St': 'Youngstown St.',
            'Murray St': 'Murray St.',
            'Missouri St': 'Missouri St.',
            'Jackson St': 'Jackson St.',
            'Ball State': 'Ball St.',
            'New Mexico St': 'New Mexico St.',
            'Sam Houston St': 'Sam Houston St.',
            'Idaho State': 'Idaho St.',
            'Alabama St': 'Alabama St.',
            'Arizona St': 'Arizona St.',
            'Georgia St': 'Georgia St.',
            'Iowa State': 'Iowa St.',
            'North Dakota St': 'North Dakota St.',
            'Pennsylvania': 'Penn',
            'Florida St': 'Florida St.',
            'Alcorn St': 'Alcorn St.',
            'Wichita St': 'Wichita St.',
            'Grambling St': 'Grambling St.',
            'Northwestern St': 'Northwestern St.',
            'San Diego St': 'San Diego St.',
            'Sacramento St': 'Sacramento St.',
            'South Carolina St': 'South Carolina St.',
            'Indiana St': 'Indiana St.',
            'Jacksonville St': 'Jacksonville St.',
            'Mt. St. Mary\'s': 'Mount St. Mary\'s',
            'Arkansas St': 'Arkansas St.',
            'Washington St': 'Washington St.',
            'Tennessee St': 'Tennessee St.',
            'Ohio State': 'Ohio St.',
            'Tarleton State': 'Tarleton St.',
            'Appalachian St': 'Appalachian St.',
            'Central Connecticut St': 'Central Connecticut',
            'Morehead St': 'Morehead St.',
            'Norfolk St': 'Norfolk St.',
            'Loyola (Chi)': 'Loyola Chicago',
            'Maryland-Eastern Shore': 'Maryland Eastern Shore',
            
            // Abbreviations and special names
            'Col. of Charleston': 'Charleston',
            'GW': 'George Washington',
            'South Fla.': 'South Florida',
            'Southern Ill.': 'Southern Illinois',
            'Southern Ind.': 'Southern Indiana',
            'Boston Univ.': 'Boston University',
            'N.C. A&T': 'North Carolina A&T',
            'N.C. Central': 'North Carolina Central',
            'Southern Miss.': 'Southern Miss',
            'Southern Miss': 'Southern Miss',
            'Fla. Atlantic': 'Florida Atlantic',
            'Ga. Southern': 'Georgia Southern',
            'Eastern Ky.': 'Eastern Kentucky',
            'North Ala.': 'North Alabama',
            'Eastern Wash.': 'Eastern Washington',
            'Western Ill.': 'Western Illinois',
            'West Ga.': 'West Georgia',
            'Northern Ariz.': 'Northern Arizona',
            'Western Caro.': 'Western Carolina',
            'Central Ark.': 'Central Arkansas',
            'Southeastern La.': 'Southeastern Louisiana',
            'Middle Tenn.': 'Middle Tennessee',
            'Western Mich.': 'Western Michigan',
            'Northern Colo.': 'Northern Colorado',
            'ETSU': 'East Tennessee St.',
            'FDU': 'Fairleigh Dickinson',
            'UIC': 'Illinois Chicago',
            'UNI': 'Northern Iowa',
            'UIW': 'Incarnate Word',
            'UAlbany': 'Albany',
            'UMKC': 'Kansas City',
            'UNCW': 'UNC Wilmington',
            'UMES': 'Maryland Eastern Shore',
            'NIU': 'Northern Illinois',
            'UTRGV': 'UT Rio Grande Valley',
            'UT Martin': 'Tennessee Martin',
            'SFA': 'Stephen F. Austin',
            'UL Monroe': 'Louisiana Monroe',
            'ULM': 'Louisiana Monroe',
            'FGCU': 'Florida Gulf Coast',
            'IUPUI': 'IU Indy',
            'Sam Houston': 'Sam Houston St.',
            'SIU-Edwardsville': 'SIUE',
            'SIUE': 'SIUE',
            'Charleston So.': 'Charleston Southern',
            'Northern Ky.': 'Northern Kentucky',
            'Western Ky.': 'Western Kentucky',
            'Southeast Mo. St.': 'Southeast Missouri',
            'Southeast Missouri St.': 'Southeast Missouri',
            'SE Missouri St': 'Southeast Missouri',
            'SE Louisiana': 'Southeastern Louisiana',
            'Gardner-Webb': 'Gardner Webb',
            'Alcorn': 'Alcorn St.',
            'Central Mich.': 'Central Michigan',
            'Central Conn. St.': 'Central Connecticut',
            'Eastern Ill.': 'Eastern Illinois',
            'Eastern Mich.': 'Eastern Michigan',
            'App State': 'Appalachian St.',
            'Omaha': 'Nebraska Omaha',
            'Loyola Maryland': 'Loyola MD',
            'Loyola Chicago': 'Loyola Chicago',
            'CSU Bakersfield': 'Cal St. Bakersfield',
            'CSU Fullerton': 'Cal St. Fullerton',
            'Grambling': 'Grambling St.',
            'A&M-Corpus Christi': 'Texas A&M Corpus Chris',
            'Ole Miss': 'Mississippi',
            'Army West Point': 'Army',
            'California Baptist': 'Cal Baptist',
            'Bethune-Cookman': 'Bethune Cookman',
            'N Colorado': 'Northern Colorado',
            'Ark.-Pine Bluff': 'Arkansas Pine Bluff',
            'Mississippi Val.': 'Mississippi Valley St.',
            'Tarleton': 'Tarleton St.',
            
            // Regional variations
            'LMU (CA)': 'Loyola Marymount',
            'Miami': 'Miami FL',
            'Miami FL': 'Miami FL',
            'Miami (FL)': 'Miami FL',
            'Miami OH': 'Miami OH',
            'Miami (OH)': 'Miami OH',
            'Saint Mary\'s': 'Saint Mary\'s',
            'St. Mary\'s': 'Saint Mary\'s',
            'Saint Mary\'s (CA)': 'Saint Mary\'s',
            'Saint Mary\'s CA': 'Saint Mary\'s',
            'St. John\'s (NY)': 'St. John\'s',
            'St. Thomas (MN)': 'St. Thomas',
            'St. Francis (PA)': 'Saint Francis PA',
            'Loyola (MD)': 'Loyola MD',
            'Loyola (Chi)': 'Loyola Chicago',
            'Queens (NC)': 'Queens',
            
            // Common abbreviations
            'UConn': 'Connecticut',
            'USC': 'Southern California',
            'LSU': 'Louisiana St.',
            'SMU': 'Southern Methodist',
            'TCU': 'TCU',
            'VCU': 'VCU',
            'UCF': 'Central Florida',
            'UNLV': 'UNLV',
            'LIU': 'Long Island',
            'UAB': 'UAB',
            
            // Other special cases
            'Hawai\'i': 'Hawaii',
            'Florida Int\'l': 'Florida International',
            'Arkansas-Little Rock': 'Little Rock',
            'Arkansas-Pine Bluff': 'Arkansas Pine Bluff',
            'Fort Wayne': 'Purdue Fort Wayne',
            'Prairie View': 'Prairie View A&M',
            'Texas State': 'Texas St.',
            'South Carolina Upstate': 'USC Upstate'
        };
        
        // Check special cases first
        if (specialCases[teamName]) {
            return specialCases[teamName];
        }

        // Remove mascots - comprehensive list from your cbbScraper
        const removeMascotsRegex = /\s(Bulldogs|Blue Devils|Tar Heels|Wildcats|Crimson Tide|Tigers|Volunteers|Gators|Zips|Golden Lions|Saints|Explorers|Peacocks|Trailblazers|Jackrabbits|Rockets|Flyers|Revolutionaries|Red Storm|Hornets|Demons|Rattlers|Vaqueros|Green Wave|Texans|Longhorns|Fighting Hawks|Bengals|Hatters|Hilltoppers|Bisons|Pride|Wolves|Blue Hens|Fighting Camels|Crusaders|Golden Bears|Friars|Lobos|Screaming Eagles|Sycamores|Beacons|Golden Grizzlies|Wolfpack|Billikens|Antelopes|Big Red|Redbirds|Golden Flashes|Sooners|Bearcats|Gaels|Mastodons|Fighting Illini|Cyclones|Cavaliers|Titans|Badgers|Quakers|Patriots|Lakers|Gauchos|Horned Frogs|Tribe|Blazers|Braves|Jayhawks|Beavers|Mean Green|Privateers|Cowboys|Ragin' Cajuns|Broncs|Ramblers|Fighting Irish|Hoyas|Racers|Cornhuskers|Rainbow Warriors|49ers|Dolphins|Bulls|Thundering Herd|Seminoles|Falcons|Penguins|Colonials|Red Raiders|Norse|Terrapins|Nittany Lions|Hoosiers|Screaming|Eagles|Panthers|Cardinals|Hawks|Bears|Cougars|Huskies|Pirates|Warriors|Spartans|Broncos|Owls|Lions|Flames|Bobcats|Rams|Aggies|Miners|Knights|Seawolves|Blue Hose|Red Foxes|Golden Griffins|Retrievers|Jaspers|Kangaroos|Colonels|Commodores|Buffaloes|Crimson|Paladins|Bruins|Monarchs|Waves|Pilots|Thunderbirds|Lumberjacks|Boilermakers|Leathernecks|Toreros|Wolverines|Roadrunners|Vikings|Aztecs|Tritons|Keydets|Phoenix|Shockers|Ducks|Cardinal|Bison|Mustangs|Mavericks|Hawkeyes|Utes|Jaguars|Buckeyes|Coyotes|Royals|Rebels|Pioneers|Wolf Pack|Lancers|Redhawks|Skyhawks|Leopards|Vandals|Blue Demons|Bluejays|Chippewas|Minutemen|Sun Devils|Highlanders|Warhawks|Golden Hurricane|Delta Devils|Governors|Chanticleers|Red Wolves|Dukes|Anteaters|Razorbacks|Seahawks|Mountaineers|Islanders|Salukis|Trojans|Golden Gophers|Raiders|Gamecocks|Buccaneers|Demon Deacons|Matadors|Golden Eagles|Purple Eagles|Red Flash|Great Danes|Purple Aces|River Hawks|Terriers|Tommies|Mountain Hawks|Scarlet Knights|Golden Panthers|Hurricanes|Orange|Hokies|Midshipmen|Stags|Greyhounds|Sharks|Black Bears|Bonnies|Bearkats|Yellow Jackets|Blue Raiders|Mocs|Big Green|Catamounts|Dragons|Ospreys|Musketeers|Grizzlies|Dons|Spiders)$/i;

        let normalized = teamName.replace(removeMascotsRegex, '').trim();
        
        // Handle common patterns
        normalized = normalized
            .replace(/\sU\.?$/, '')
            .replace(/\sUniversity$/, '')
            .trim();
        
        return normalized;
    }

    getRanking(teamName) {
        if (!teamName) return null;
        
        // Clean up whitespace and newlines
        teamName = teamName.replace(/\s+/g, ' ').trim();
        
        // Try exact match first
        if (this.rankings[teamName]) {
            return this.rankings[teamName];
        }
        
        // Try normalized version
        const normalized = this.normalizeTeamName(teamName);
        if (this.rankings[normalized]) {
            return this.rankings[normalized];
        }
        
        // Try uppercase versions
        if (this.rankings[teamName.toUpperCase()]) {
            return this.rankings[teamName.toUpperCase()];
        }
        
        if (this.rankings[normalized.toUpperCase()]) {
            return this.rankings[normalized.toUpperCase()];
        }
        
        // Debug missing teams (only log if not empty after cleanup)
        if (teamName.trim()) {
            console.log(`⚠️  KenPom ranking not found for: "${teamName}" (normalized: "${normalized}")`);
        }
        
        return null;
    }
}