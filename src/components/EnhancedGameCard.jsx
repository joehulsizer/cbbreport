import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, TrendingUp, TrendingDown, Shield, ChevronDown, ChevronUp, BarChart3, Target, Activity, Star, BookOpen } from 'lucide-react';
import OddsDisplay from './OddsDisplay';
import TeamComparison from './TeamComparison';
import SimpleTeamStats from './SimpleTeamStats';
import WinProbability from './WinProbability';
import EfficiencyCharts from './EfficiencyCharts';
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
  const [expandedSection, setExpandedSection] = useState('overview');
  const [isFavorited, setIsFavorited] = useState(false);
  
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
  
  // Load favorites from localStorage
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favoriteGames') || '[]');
    const gameId = `${matchup.matchup.away}-${matchup.matchup.home}`;
    setIsFavorited(favorites.includes(gameId));
  }, [matchup]);
  
  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteGames') || '[]');
    const gameId = `${matchup.matchup.away}-${matchup.matchup.home}`;
    
    if (favorites.includes(gameId)) {
      const newFavorites = favorites.filter(id => id !== gameId);
      localStorage.setItem('favoriteGames', JSON.stringify(newFavorites));
      setIsFavorited(false);
    } else {
      favorites.push(gameId);
      localStorage.setItem('favoriteGames', JSON.stringify(favorites));
      setIsFavorited(true);
    }
  };

  const SectionButton = ({ id, icon: Icon, label, active }) => (
    <button
      onClick={() => setExpandedSection(expandedSection === id ? null : id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
        active ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {active ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
    </button>
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-2xl mb-8 overflow-hidden border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 px-6 py-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        
        <div className="relative flex justify-between items-start text-white">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {getRanking(matchup.teams[matchup.matchup.away])}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{matchup.matchup.away}</h2>
                <p className="text-sm opacity-90">{matchup.teams[matchup.matchup.away].record}</p>
              </div>
            </div>
            
            <div className="text-center my-2">
              <span className="text-lg font-bold">@</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {getRanking(matchup.teams[matchup.matchup.home])}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{matchup.matchup.home}</h2>
                <p className="text-sm opacity-90">
                  {matchup.teams[matchup.matchup.home].record} • Home Advantage: #{getHomeAdvantageRank(matchup.matchup.home)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-3">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {new Date(matchup.matchup.commence_time).toLocaleString()}
              </span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFavorite}
              className={`p-2 rounded-full ${isFavorited ? 'bg-yellow-400' : 'bg-white/20 backdrop-blur-sm'}`}
            >
              <Star className={`w-5 h-5 ${isFavorited ? 'text-yellow-700 fill-yellow-700' : 'text-white'}`} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-wrap gap-3">
          <SectionButton id="overview" icon={Activity} label="Overview" active={expandedSection === 'overview'} />
          <SectionButton id="odds" icon={Target} label="Odds & Lines" active={expandedSection === 'odds'} />
          <SectionButton id="analytics" icon={BarChart3} label="Analytics" active={expandedSection === 'analytics'} />
          <SectionButton id="efficiency" icon={TrendingUp} label="Efficiency" active={expandedSection === 'efficiency'} />
          <SectionButton id="quads" icon={Shield} label="Quad Records" active={expandedSection === 'quads'} />
        </div>
      </div>

      {/* Content Sections */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {expandedSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SimpleTeamStats
                homeTeam={matchup.matchup.home}
                awayTeam={matchup.matchup.away}
                homeData={matchup.teams[matchup.matchup.home]}
                awayData={matchup.teams[matchup.matchup.away]}
                odds={matchup.matchup.odds}
                useKenPom={useKenPom}
              />
            </motion.div>
          )}

          {expandedSection === 'odds' && (
            <motion.div
              key="odds"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <OddsDisplay odds={matchup.matchup.odds} />
            </motion.div>
          )}

          {expandedSection === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <WinProbability
                homeTeam={matchup.matchup.home}
                awayTeam={matchup.matchup.away}
                homeData={matchup.teams[matchup.matchup.home]}
                awayData={matchup.teams[matchup.matchup.away]}
                odds={matchup.matchup.odds}
                useKenPom={useKenPom}
              />
            </motion.div>
          )}

          {expandedSection === 'efficiency' && (
            <motion.div
              key="efficiency"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EfficiencyCharts
                homeTeam={matchup.matchup.home}
                awayTeam={matchup.matchup.away}
                homeData={matchup.teams[matchup.matchup.home]}
                awayData={matchup.teams[matchup.matchup.away]}
                useKenPom={useKenPom}
              />
            </motion.div>
          )}

          {expandedSection === 'quads' && (
            <motion.div
              key="quads"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default EnhancedGameCard;