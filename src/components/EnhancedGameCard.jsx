import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, TrendingDown, Shield } from 'lucide-react';
import OddsDisplay from './OddsDisplay';
import TeamComparison from './teamComparison';
import SimpleTeamStats from './SimpleTeamStats';
import { initializeHomeAdvantageRanks, getHomeAdvantageRank } from '../utils/homeAdvantageRanks';
import { determineQuadrant, reorganizeQuadGames, getOpponentRank } from '../utils/quadHelpers';

const QuadSection = ({ quad, data, expanded, onToggle, currentOpponent, currentOpponentNet, gameLocation, useKenPom }) => {
  const [wins, losses] = data.record.split('-').map(Number);
  
  // Determine if current opponent belongs in this quadrant
  const isOpponentQuad = currentOpponent && 
    determineQuadrant(currentOpponentNet, gameLocation) === quad;
  
  const getQuadColor = (quad) => {
    switch(quad) {
      case '1': return 'from-blue-500 to-blue-600';
      case '2': return 'from-green-500 to-green-600';
      case '3': return 'from-yellow-500 to-yellow-600';
      case '4': return 'from-gray-500 to-gray-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-4 rounded-lg overflow-hidden shadow-sm
        ${isOpponentQuad ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
    >
      <button
        onClick={onToggle}
        className="w-full text-left"
      >
        <div className={`bg-gradient-to-r ${getQuadColor(quad)} p-3 text-white`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Quad {quad}</span>
              <div className="text-sm opacity-90">
                {wins}-{losses} ({((wins / (wins + losses)) * 100).toFixed(1)}%)
              </div>
            </div>
            {isOpponentQuad && (
              <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
                Current Opponent
              </div>
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white"
        >
          <div className="p-4 space-y-2">
            {data.games.map((game, idx) => {
              const displayRank = getOpponentRank(game, useKenPom);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-center space-x-3 p-2 rounded
                    ${game.result === 'W' ? 'bg-green-50' : 'bg-red-50'}
                    ${game.opponent === currentOpponent ? 'ring-1 ring-blue-400' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center
                    ${game.result === 'W' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {game.result === 'W' ? 
                      <TrendingUp className="w-4 h-4" /> : 
                      <TrendingDown className="w-4 h-4" />
                    }
                  </div>
                  <span className="w-20">{game.score}</span>
                  <span className="w-20 text-gray-600">({game.location})</span>
                  <span className={`flex-grow ${game.opponent === currentOpponent ? 'font-bold text-blue-600' : ''}`}>
                    vs {game.opponent}
                  </span>
                  <span className="text-gray-500">({displayRank || game.oppNet})</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const TeamSection = ({ team, data, opponent, opponentNet, gameLocation, useKenPom }) => {
  // Reorganize quads based on the active ranking system
  const reorganizedQuads = reorganizeQuadGames(data.quadGames, useKenPom);
  
  const [expandedQuad, setExpandedQuad] = useState(() => {
    if (opponent && opponentNet) {
      return determineQuadrant(opponentNet, gameLocation);
    }
    return '1';
  });
  
  // Helper function to get the appropriate ranking
  const getRanking = (teamData) => {
    return useKenPom ? (teamData.kenpom || teamData.net) : teamData.net;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-6 shadow-sm mb-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            {team}
          </h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              {useKenPom ? 'KenPom' : 'NET'}: {getRanking(data) || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">
              {data.record} {data.confRecord && `(${data.confRecord})`}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(reorganizedQuads).map(([quad, quadData]) => (
          <QuadSection
            key={quad}
            quad={quad}
            data={quadData}
            expanded={expandedQuad === quad}
            onToggle={() => setExpandedQuad(expandedQuad === quad ? null : quad)}
            currentOpponent={opponent}
            currentOpponentNet={opponentNet}
            gameLocation={gameLocation}
            useKenPom={useKenPom}
          />
        ))}
      </div>
    </motion.div>
  );
};

const EnhancedGameCard = ({ matchup, useKenPom }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Helper function to get the appropriate ranking
  const getRanking = (teamData) => {
    return useKenPom ? (teamData.kenpom || teamData.net) : teamData.net;
  };

  useEffect(() => {
    const loadHomeAdvantageData = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch('src/CBBTrueHomeCourtChart.csv', {
          headers: {
            'Content-Type': 'text/csv',
            'Accept': 'text/csv'
          },
          cache: 'force-cache' // Use browser caching
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvData = await response.text();
        await initializeHomeAdvantageRanks(csvData);
        
      } catch (error) {
        console.error('Error loading home advantage data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeAdvantageData();
  }, []); // Only load once on mount

  if (isLoading) {
    return <div>Loading rankings...</div>;
  }

  return (
    <motion.div
      className="bg-gray-50 rounded-xl p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 -mx-6 -mt-6 px-6 py-4 rounded-t-xl">
        <div className="flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">
            {matchup.matchup.away} ({getRanking(matchup.teams[matchup.matchup.away]) || 'N/A'}) @ 
            {matchup.matchup.home} ({getRanking(matchup.teams[matchup.matchup.home]) || 'N/A'}) 
            <span className="text-sm ml-2 opacity-80">
              Home Advantage Rank: {getHomeAdvantageRank(matchup.matchup.home)}
            </span>
          </h2>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {new Date(matchup.matchup.commence_time).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Odds Display */}
      <div className="my-6">
        <OddsDisplay odds={matchup.matchup.odds} />
      </div>

      {/* Team Comparison */}
      

      {/* Team Stats */}
      <div className="my-6">
        <SimpleTeamStats
          homeTeam={matchup.matchup.home}
          awayTeam={matchup.matchup.away}
          homeData={matchup.teams[matchup.matchup.home]}
          awayData={matchup.teams[matchup.matchup.away]}
          odds={matchup.matchup.odds}
          useKenPom={useKenPom}
        />
      </div>

      {/* Team Sections */}
      <div className="space-y-6">
        <TeamSection 
          team={matchup.matchup.away}
          data={matchup.teams[matchup.matchup.away]}
          opponent={matchup.matchup.home}
          opponentNet={getRanking(matchup.teams[matchup.matchup.home])}
          gameLocation="away"
          useKenPom={useKenPom}
        />
        <TeamSection 
          team={matchup.matchup.home}
          data={matchup.teams[matchup.matchup.home]}
          opponent={matchup.matchup.away}
          opponentNet={getRanking(matchup.teams[matchup.matchup.away])}
          gameLocation="home"
          useKenPom={useKenPom}
        />
      </div>
    </motion.div>
  );
};

export default EnhancedGameCard;