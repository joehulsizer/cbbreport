// quadHelpers.js - Utility functions for quad game calculations

/**
 * Determine which quadrant a game belongs to based on opponent ranking and location
 * @param {number} oppRank - Opponent's ranking (NET or KenPom)
 * @param {string} location - Game location: 'Home', 'Away', or 'Neutral'
 * @returns {string} - Quad number ('1', '2', '3', or '4')
 */
export function determineQuadrant(oppRank, location) {
  if (!oppRank || !location) return null;

  const loc = location.toLowerCase();
  
  switch (loc) {
    case 'home':
      if (oppRank <= 30) return '1';
      if (oppRank <= 75) return '2';
      if (oppRank <= 160) return '3';
      return '4';
    
    case 'neutral':
      if (oppRank <= 50) return '1';
      if (oppRank <= 100) return '2';
      if (oppRank <= 200) return '3';
      return '4';
    
    case 'away':
      if (oppRank <= 75) return '1';
      if (oppRank <= 135) return '2';
      if (oppRank <= 240) return '3';
      return '4';
    
    default:
      return null;
  }
}

/**
 * Reorganize games into quads based on the specified ranking system
 * @param {Object} quadGames - Original quad games organized by NET
 * @param {boolean} useKenPom - Whether to use KenPom rankings
 * @returns {Object} - Reorganized quad games
 */
export function reorganizeQuadGames(quadGames, useKenPom = false) {
  // Create fresh quad structure
  const newQuads = {
    "1": { record: "0-0", games: [] },
    "2": { record: "0-0", games: [] },
    "3": { record: "0-0", games: [] },
    "4": { record: "0-0", games: [] }
  };
  
  // Collect all games from all quads
  const allGames = [];
  Object.values(quadGames).forEach(quadData => {
    allGames.push(...quadData.games);
  });
  
  // Reassign each game to the appropriate quad
  allGames.forEach(game => {
    const oppRank = useKenPom ? (game.oppKenpom || game.oppNet) : game.oppNet;
    const quad = determineQuadrant(oppRank, game.location);
    
    if (quad) {
      newQuads[quad].games.push(game);
    }
  });
  
  // Calculate records for each quad
  Object.keys(newQuads).forEach(quad => {
    const wins = newQuads[quad].games.filter(g => g.result === 'W').length;
    const total = newQuads[quad].games.length;
    newQuads[quad].record = `${wins}-${total - wins}`;
  });
  
  return newQuads;
}

/**
 * Get the appropriate opponent ranking based on the mode
 * @param {Object} game - Game object with oppNet and oppKenpom
 * @param {boolean} useKenPom - Whether to use KenPom rankings
 * @returns {number} - The appropriate ranking
 */
export function getOpponentRank(game, useKenPom = false) {
  return useKenPom ? (game.oppKenpom || game.oppNet) : game.oppNet;
}

