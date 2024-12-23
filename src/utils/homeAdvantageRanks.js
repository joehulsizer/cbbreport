// Add a flag to track initialization
let isInitialized = false;

// Cache the loaded data
const homeAdvantageRanks = new Map();

// Helper function to normalize team names
const normalizeTeamName = (name) => {
  if (!name) return '';
  
  // First standardize the name format
  let normalized = name
    .toUpperCase()
    .replace(/['']/g, '') // Handle different apostrophe types
    .replace(/[\.-]/g, ' ') // Convert dots and hyphens to spaces
    .replace(/\s+/g, ' ') // Standardize spaces
    .trim();

  // Handle special case for Miami (OH)
  if (normalized.includes('MIAMI') && (normalized.includes('OH') || normalized.includes('OHIO'))) {
    normalized = 'MIAMI OH';
  }

  // Check direct mapping first
  const directMapping = teamNameMappings[normalized];
  if (directMapping) return directMapping;

  // Apply transformations
  normalized = normalized
    .replace(/^(SAINT|ST\.?)\s+/, 'ST ') // Standardize Saint/St.
    .replace(/\s+(STATE|ST\.?)$/, ' ST') // Standardize State/St.
    .replace(/^(CS|CSU|UC|UT)\s+/, '') // Remove common prefixes
    .replace(/\s+(GOLDEN )?(EAGLES|WARRIORS|TIGERS|KNIGHTS|RAIDERS|BEARS|COUGARS|TITANS|GRIZZLIES|PIRATES|LIONS|GAELS)$/, '');

  // Check mapping after normalization
  return teamNameMappings[normalized] || normalized;
};

// Expand team name mappings
const teamNameMappings = {
  'CORNELL BIG RED': 'CORNELL',
  'ARMY KNIGHTS': 'ARMY',
  'TOWSON TIGERS': 'TOWSON ST',
  'COLGATE RAIDERS': 'COLGATE',
  'MISSOURI TIGERS': 'MISSOURI',
  'MIAMI (OH) REDHAWKS': 'MIAMI OHIO',
  'STONEHILL SKYHAWKS': 'STONEHILL',
  'MISSOURI ST BEARS': 'MISSOURI ST',
  'CHARLESTON COUGARS': 'COLL OF CHARLESTON',
  'CSU FULLERTON TITANS': 'CS-FULLERTON',
  'OAKLAND GOLDEN GRIZZLIES': 'OAKLAND',
  'SETON HALL PIRATES': 'SETON HALL',
  'LOYOLA MARYMOUNT LIONS': 'LOYOLA-MARYMOUNT',
  "SAINT MARY'S GAELS": 'ST MARYS-CA',
  "HAWAI'I RAINBOW WARRIORS": 'HAWAII',
  'HAWAII RAINBOW WARRIORS': 'HAWAII',
  'MIAMI OH REDHAWKS': 'MIAMI OHIO',
  'MIAMI OHIO': 'MIAMI OHIO',
  "HAWAI'I": 'HAWAII',
  'SAINT MARYS': 'ST MARYS-CA',
  'SAINT MARYS CA': 'ST MARYS-CA',
  'MIAMI (OH) REDHAWKS': 'MIAMI OHIO',
  'MIAMI OHIO': 'MIAMI OHIO',
  'MIAMI (OH)': 'MIAMI OHIO',
  'SAINT MARYS GAELS': 'ST MARYS-CA',
  'ST MARYS GAELS': 'ST MARYS-CA',
  "SAINT MARY'S GAELS": 'ST MARYS-CA',
  "ST MARY'S GAELS": 'ST MARYS-CA',
  'SAINT MARYS': 'ST MARYS-CA',
  'ST MARYS': 'ST MARYS-CA',
  'SAINT MARYS CA': 'ST MARYS-CA',
  'ST MARYS CA': 'ST MARYS-CA',
  'LOYOLA (CHI) RAMBLERS': 'LOYOLA-IL',
  'NORTH DAKOTA ST BISON': 'N DAKOTA ST',
  // Add reverse mappings
  'CORNELL': 'CORNELL',
  'ARMY': 'ARMY',
  'TOWSON ST': 'TOWSON ST',
  'MIAMI OH': 'MIAMI OHIO',
  'MISSOURI ST': 'MISSOURI ST',
  'CS-FULLERTON': 'CS-FULLERTON',
  'HAWAII': 'HAWAII',
  'ST MARYS-CA': 'ST MARYS-CA'
};

const initializeHomeAdvantageRanks = async (csvData) => {
  // Don't initialize multiple times
  if (isInitialized) return;
  
  if (!csvData) {
    console.error('No CSV data received');
    return;
  }

  try {
    const lines = csvData.split('\n');
    const dataLines = lines.slice(4); // Skip header rows
    
    dataLines.forEach((line, index) => {
      if (!line.trim()) return;
      
      const columns = line.split(',');
      if (columns.length < 11) return; // Ensure we have enough columns
      
      const teamName = columns[0].trim();
      const hfEdge = parseFloat(columns[10]); // "True HFEdge" column
      
      if (teamName && !isNaN(hfEdge)) {
        // Store both original and normalized names
        homeAdvantageRanks.set(teamName, hfEdge);
        const normalizedName = normalizeTeamName(teamName);
        homeAdvantageRanks.set(normalizedName, hfEdge);

        // Debug log for first few teams
        if (index < 5) {
          console.log(`Loaded: ${teamName} -> ${hfEdge}`);
        }
      }
    });

    isInitialized = true;
    console.log(`Initialized ${homeAdvantageRanks.size} team rankings`);

    // Debug log for some sample lookups
    console.log(`Sample lookup - DUKE: ${homeAdvantageRanks.get('DUKE')}`);
    console.log(`Sample lookup - KENTUCKY: ${homeAdvantageRanks.get('KENTUCKY')}`);
    console.log(`Sample lookup - NORTH CAROLINA: ${homeAdvantageRanks.get('NORTH CAROLINA')}`);

  } catch (error) {
    console.error('Error processing CSV data:', error);
  }
};

// Add a debug function to help identify missing mappings
const debugTeamLookup = (teamName) => {
  const normalizedName = normalizeTeamName(teamName);
  const rank = homeAdvantageRanks.get(normalizedName);
  
  const availableTeams = Array.from(homeAdvantageRanks.keys())
    .filter(k => k.includes(normalizedName) || normalizedName.includes(k));
  
  console.log({
    original: teamName,
    normalized: normalizedName,
    found: rank !== undefined,
    availableTeams,
    possibleMatches: availableTeams.map(t => ({
      name: t,
      rank: homeAdvantageRanks.get(t)
    }))
  });
  
  return rank;
};

// Update the getHomeAdvantageRank function to handle fuzzy matches
const getHomeAdvantageRank = (teamName) => {
  if (!teamName) return 'N/A';
  
  const normalizedName = normalizeTeamName(teamName);
  let rank = homeAdvantageRanks.get(normalizedName);
  
  // If not found directly, try to find a fuzzy match
  if (!rank) {
    const availableTeams = Array.from(homeAdvantageRanks.keys())
      .filter(k => k.includes(normalizedName) || normalizedName.includes(k));
    
    if (availableTeams.length > 0) {
      // Use the first match if multiple are found
      rank = homeAdvantageRanks.get(availableTeams[0]);
    }
  }
  
  if (!rank && process.env.NODE_ENV === 'development') {
    console.debug(`Home advantage rank not found for: ${teamName} (normalized: ${normalizedName})`);
    return debugTeamLookup(teamName);
  }
  
  return rank || 'N/A';
};

export { initializeHomeAdvantageRanks, getHomeAdvantageRank };