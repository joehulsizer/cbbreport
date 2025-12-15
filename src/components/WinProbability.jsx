import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Activity, Zap } from 'lucide-react';

const WinProbability = ({ homeTeam, awayTeam, homeData, awayData, odds, useKenPom }) => {
  // Get ranking
  const homeRank = useKenPom ? (homeData.kenpom || homeData.net) : homeData.net;
  const awayRank = useKenPom ? (awayData.kenpom || awayData.net) : awayData.net;
  
  // Calculate win probability based on multiple factors
  const calculateWinProbability = () => {
    let homeScore = 0;
    let awayScore = 0;
    
    // Ranking differential (40% weight)
    const rankDiff = awayRank - homeRank;
    if (rankDiff > 0) {
      homeScore += Math.min(40, rankDiff / 2);
    } else {
      awayScore += Math.min(40, Math.abs(rankDiff) / 2);
    }
    
    // Home court advantage (10% weight)
    homeScore += 10;
    
    // Recent form (20% weight)
    const getRecentWinPct = (quadGames) => {
      const allGames = Object.values(quadGames)
        .flatMap(quad => quad.games)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      const wins = allGames.filter(game => game.result === 'W').length;
      return (wins / allGames.length) * 20;
    };
    
    homeScore += getRecentWinPct(homeData.quadGames);
    awayScore += getRecentWinPct(awayData.quadGames);
    
    // Overall record (15% weight)
    const getWinPct = (record) => {
      const [wins, losses] = record.split('-').map(Number);
      return (wins / (wins + losses)) * 15;
    };
    
    homeScore += getWinPct(homeData.record);
    awayScore += getWinPct(awayData.record);
    
    // Odds-based adjustment (15% weight)
    const firstOdds = Object.values(odds)[0] || {};
    if (firstOdds.home && firstOdds.away) {
      const oddsProb = convertOddsToProbability(firstOdds.home, firstOdds.away);
      homeScore += oddsProb.home * 15;
      awayScore += oddsProb.away * 15;
    }
    
    // Normalize to 100%
    const total = homeScore + awayScore;
    return {
      home: (homeScore / total) * 100,
      away: (awayScore / total) * 100
    };
  };
  
  const convertOddsToProbability = (homeOdds, awayOdds) => {
    const homeProb = homeOdds > 0 
      ? 100 / (homeOdds + 100) 
      : Math.abs(homeOdds) / (Math.abs(homeOdds) + 100);
    const awayProb = awayOdds > 0 
      ? 100 / (awayOdds + 100) 
      : Math.abs(awayOdds) / (Math.abs(awayOdds) + 100);
    
    const total = homeProb + awayProb;
    return {
      home: homeProb / total,
      away: awayProb / total
    };
  };
  
  const probability = calculateWinProbability();
  
  // Calculate expected value
  const calculateExpectedValue = () => {
    const firstOdds = Object.values(odds)[0] || {};
    if (!firstOdds.home || !firstOdds.away) return { home: 0, away: 0 };
    
    const homeWinProb = probability.home / 100;
    const awayWinProb = probability.away / 100;
    
    const homePayout = firstOdds.home > 0 ? firstOdds.home / 100 : 100 / Math.abs(firstOdds.home);
    const awayPayout = firstOdds.away > 0 ? firstOdds.away / 100 : 100 / Math.abs(firstOdds.away);
    
    return {
      home: ((homeWinProb * homePayout) - (1 - homeWinProb)) * 100,
      away: ((awayWinProb * awayPayout) - (1 - awayWinProb)) * 100
    };
  };
  
  const expectedValue = calculateExpectedValue();
  
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold mb-6 flex items-center">
        <Target className="w-6 h-6 mr-2 text-blue-600" />
        Win Probability Analysis
      </h3>
      
      {/* Visual Probability Bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="font-semibold text-gray-700">{awayTeam}</span>
          <span className="font-semibold text-gray-700">{homeTeam}</span>
        </div>
        
        <div className="relative h-12 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${probability.away}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-start pl-4"
          >
            <span className="text-white font-bold">{probability.away.toFixed(1)}%</span>
          </motion.div>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${probability.home}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute right-0 h-full bg-gradient-to-l from-purple-500 to-purple-600 flex items-center justify-end pr-4"
          >
            <span className="text-white font-bold">{probability.home.toFixed(1)}%</span>
          </motion.div>
        </div>
      </div>
      
      {/* Detailed Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Away Win %</p>
          <p className="text-3xl font-bold text-blue-600">{probability.away.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Rank: #{awayRank}</p>
        </div>
        
        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Home Win %</p>
          <p className="text-3xl font-bold text-purple-600">{probability.home.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Rank: #{homeRank}</p>
        </div>
      </div>
      
      {/* Expected Value */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
          <Zap className="w-4 h-4 mr-2 text-yellow-500" />
          Expected Value (EV)
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg ${expectedValue.away > 5 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
            <p className="text-xs text-gray-600 mb-1">{awayTeam} EV</p>
            <p className={`text-xl font-bold ${expectedValue.away > 5 ? 'text-green-600' : expectedValue.away > 0 ? 'text-gray-700' : 'text-red-600'}`}>
              {expectedValue.away > 0 ? '+' : ''}{expectedValue.away.toFixed(1)}%
            </p>
            {expectedValue.away > 5 && (
              <p className="text-xs text-green-600 font-semibold mt-1">Good Value</p>
            )}
          </div>
          
          <div className={`p-3 rounded-lg ${expectedValue.home > 5 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
            <p className="text-xs text-gray-600 mb-1">{homeTeam} EV</p>
            <p className={`text-xl font-bold ${expectedValue.home > 5 ? 'text-green-600' : expectedValue.home > 0 ? 'text-gray-700' : 'text-red-600'}`}>
              {expectedValue.home > 0 ? '+' : ''}{expectedValue.home.toFixed(1)}%
            </p>
            {expectedValue.home > 5 && (
              <p className="text-xs text-green-600 font-semibold mt-1">Good Value</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Betting Recommendation */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
        <p className="font-semibold mb-1 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Recommendation
        </p>
        <p className="text-sm">
          {Math.max(expectedValue.home, expectedValue.away) > 5 
            ? `Best value: ${expectedValue.home > expectedValue.away ? homeTeam : awayTeam} (${Math.max(expectedValue.home, expectedValue.away).toFixed(1)}% EV)`
            : 'No significant value detected. Consider other betting options.'}
        </p>
      </div>
    </div>
  );
};

export default WinProbability;
