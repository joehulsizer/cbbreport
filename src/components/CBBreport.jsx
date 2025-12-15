import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Filter, TrendingUp, SlidersHorizontal, RefreshCw, Zap, AlertTriangle } from 'lucide-react';
import EnhancedGameCard from './EnhancedGameCard';
import AdvancedFilters from './AdvancedFilters';
import SearchAndFavorites from './SearchAndFavorites';
import ExportData from './ExportData';

const TimeSlotHeader = ({ time }) => (
  <div className="flex items-center space-x-2">
    <Calendar className="w-5 h-5 text-blue-600" />
    <h2 className="text-lg font-semibold text-gray-800">
      {new Date(time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })}
    </h2>
  </div>
);

const QuickStats = ({ stat, total, label, icon: Icon }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold mt-1">
          {stat}/{total}
        </p>
      </div>
      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
    </div>
  </motion.div>
);

const FilterButton = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all
      ${active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
  >
    {label}
  </button>
);

const CBBReport = ({ data, onBackToLanding, useKenPom, onToggleRankingSystem, darkMode }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showBestBets, setShowBestBets] = useState(false);
  const [showUpsetAlerts, setShowUpsetAlerts] = useState(false);
  
  // Helper function to get the appropriate ranking
  const getRanking = (teamData) => {
    return useKenPom ? (teamData.kenpom || teamData.net) : teamData.net;
  };
  
  const [advancedFilters, setAdvancedFilters] = useState(() => {
    const saved = localStorage.getItem('advancedFilters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.warn("Couldn't parse saved filters:", error);
      }
    }
    return {
      minOdds: -400,
      maxOdds: 400,
      maxSpread: 25,
      recentFormChange: false,
      highVariance: false,
      netChanges: false,
      overvaluedHome: false,
      valueAwayTeams: false,
      rivalryGames: false,
      hasInjuries: false,
      fullStrength: false,
      minKenPom: 1,
      maxKenPom: 358,
      minNET: 1,
      maxNET: 358,
      betterTeamUnderdog: false,
      winPercentageDiff: false,
    };
  });

  useEffect(() => {
    const currentSaved = localStorage.getItem('advancedFilters');
    const newValue = JSON.stringify(advancedFilters);
    if (currentSaved !== newValue) {
      localStorage.setItem('advancedFilters', newValue);
    }
  }, [advancedFilters]);

  // Filter games based on selection
  const filterGames = (games) => {
    return games.filter(game => {
      const odds = game.matchup.odds;
      const homeTeamData = game.teams[game.matchup.home];
      const awayTeamData = game.teams[game.matchup.away];

      // Spread filtering
      const spreads = Object.values(odds).map(bookmaker => ({
        home: Math.abs(parseFloat(bookmaker.homeSpread || 0)),
        away: Math.abs(parseFloat(bookmaker.awaySpread || 0))
      })).filter(spread => spread.home > 0 || spread.away > 0);

      if (spreads.length > 0) {
        const minSpread = Math.min(...spreads.map(s => Math.min(s.home, s.away)));
        
        if (minSpread > advancedFilters.maxSpread) {
          return false;
        }
      }

      // Check odds range
      const bestHomeOdds = Math.min(...Object.values(odds)
        .map(o => o.home || Infinity)
        .filter(odd => odd !== Infinity));
      const bestAwayOdds = Math.min(...Object.values(odds)
        .map(o => o.away || Infinity)
        .filter(odd => odd !== Infinity));
      
      if (bestHomeOdds < advancedFilters.minOdds || 
          bestHomeOdds > advancedFilters.maxOdds ||
          bestAwayOdds < advancedFilters.minOdds || 
          bestAwayOdds > advancedFilters.maxOdds) {
        return false;
      }

      // Check rankings (NET or KenPom based on toggle)
      const homeRank = getRanking(homeTeamData);
      const awayRank = getRanking(awayTeamData);
      
      if (homeRank < advancedFilters.minNET || 
          homeRank > advancedFilters.maxNET ||
          awayRank < advancedFilters.minNET || 
          awayRank > advancedFilters.maxNET) {
        return false;
      }

      // Check for overvalued home favorites
      if (advancedFilters.overvaluedHome) {
        const homeOdds = Object.values(odds)[0]?.home || 0;
        if (!(homeOdds < 0 && homeRank > awayRank)) {
          return false;
        }
      }

      // Check for valuable away teams
      if (advancedFilters.valueAwayTeams) {
        const awayOdds = Object.values(odds)[0]?.away || 0;
        if (!(awayRank <= 50 && awayOdds > 0)) {
          return false;
        }
      }

      // Check for better team (by ranking) as underdog
      if (advancedFilters.betterTeamUnderdog) {
        const bestHomeOdds = Math.min(...Object.values(odds)
          .map(o => o.home || Infinity)
          .filter(odd => odd !== Infinity));
        const bestAwayOdds = Math.min(...Object.values(odds)
          .map(o => o.away || Infinity)
          .filter(odd => odd !== Infinity));

        const homeIsBetter = homeRank < awayRank;
        const awayIsBetter = awayRank < homeRank;

        // Check if better team is underdog (has positive odds)
        if (homeIsBetter && bestHomeOdds <= 0) return false;
        if (awayIsBetter && bestAwayOdds <= 0) return false;
        if (!homeIsBetter && !awayIsBetter) return false;
      }

      // Add win percentage difference filter
      if (advancedFilters.winPercentageDiff) {
        const homeRecord = game.teams[game.matchup.home].record;
        const awayRecord = game.teams[game.matchup.away].record;
        
        // Calculate win percentages
        const [homeWins, homeLosses] = homeRecord.split('-').map(Number);
        const [awayWins, awayLosses] = awayRecord.split('-').map(Number);
        
        const homeWinPct = homeWins / (homeWins + homeLosses) * 100;
        const awayWinPct = awayWins / (awayWins + awayLosses) * 100;
        
        // Check if difference is less than 30%
        const winPctDiff = Math.abs(homeWinPct - awayWinPct);
        if (winPctDiff < 30) {
          return false;
        }
      }

      // Add other filters here...

      return true;
    });
  };

  // Filter games before grouping by time
  const filteredGames = filterGames(data.games);
  const gamesByTime = filteredGames.reduce((acc, game) => {
    const timeSlot = new Date(game.matchup.commence_time);
    timeSlot.setMinutes(0);
    const timeKey = timeSlot.toISOString();
    if (!acc[timeKey]) acc[timeKey] = [];
    acc[timeKey].push(game);
    return acc;
  }, {});

  // Calculate stats for both total and filtered games
  const totalGames = data.games.length;
  const filteredTotal = filteredGames.length;
  
  const totalTop50 = data.games.filter(game => 
    Math.min(
      getRanking(game.teams[game.matchup.home]),
      getRanking(game.teams[game.matchup.away])
    ) <= 50
  ).length;
  
  const filteredTop50 = filteredGames.filter(game => 
    Math.min(
      getRanking(game.teams[game.matchup.home]),
      getRanking(game.teams[game.matchup.away])
    ) <= 50
  ).length;

  // Track expanded state for each time slot
  const [expandedSlots, setExpandedSlots] = useState({});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto">
          <div className="py-6 px-4">
            {/* If onBackToLanding is passed, show a “Back” button */}
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="text-sm text-blue-600 underline mb-2"
              >
                &larr; Back to Landing
              </button>
            )}
  
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  College Basketball Daily Report
                </h1>
                {/* Ranking System Toggle */}
                <button
                  onClick={onToggleRankingSystem}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    useKenPom 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  {useKenPom ? 'KenPom Rankings' : 'NET Rankings'}
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <QuickStats 
                stat={filteredTotal}
                total={totalGames}
                label="Total Games Today"
                icon={Calendar}
              />
              <QuickStats 
                stat={filteredTop50}
                total={totalTop50}
                label="Top 50 Matchups"
                icon={TrendingUp}
              />
              <QuickStats 
                stat={Object.keys(gamesByTime).length}
                total={Object.keys(gamesByTime).length}
                label="Time Slots"
                icon={Filter}
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <FilterButton 
                active={selectedFilter === 'all'}
                label="All Games"
                onClick={() => setSelectedFilter('all')}
              />
              <FilterButton 
                active={selectedFilter === 'top50'}
                label="Top 50 Only"
                onClick={() => setSelectedFilter('top50')}
              />
              <FilterButton 
                active={selectedFilter === 'upset-alert'}
                label="Upset Alerts"
                onClick={() => setSelectedFilter('upset-alert')}
              />
              <button
                onClick={() => setShowBestBets(!showBestBets)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  showBestBets 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <Zap className="w-4 h-4" />
                Best Bets ({bestBets.length})
              </button>
              <button
                onClick={() => setShowUpsetAlerts(!showUpsetAlerts)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  showUpsetAlerts 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                Upset Watch ({upsetAlerts.length})
              </button>
              <button
                onClick={() => setShowAdvancedFilters(true)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600 transition-all flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Advanced Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Best Bets Section */}
        <AnimatePresence>
          {showBestBets && bestBets.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 shadow-xl text-white mb-6">
                <h2 className="text-2xl font-bold flex items-center mb-4">
                  <Zap className="w-7 h-7 mr-3" />
                  Best Betting Value Today
                </h2>
                <p className="opacity-90">Games with the best potential value based on rankings and odds</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bestBets.map(({ game, value }, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <EnhancedGameCard matchup={game} useKenPom={useKenPom} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Upset Alerts Section */}
        <AnimatePresence>
          {showUpsetAlerts && upsetAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 shadow-xl text-white mb-6">
                <h2 className="text-2xl font-bold flex items-center mb-4">
                  <AlertTriangle className="w-7 h-7 mr-3" />
                  Upset Watch
                </h2>
                <p className="opacity-90">Games with significant ranking mismatches - potential upset opportunities</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upsetAlerts.map((game, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <EnhancedGameCard matchup={game} useKenPom={useKenPom} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {filteredGames.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No games match your filters. Try adjusting them above.
            </div>
          ) : (
            Object.entries(gamesByTime).map(([timeSlot, games]) => (
              <div key={timeSlot} className="mb-4">
                <div
                  onClick={() => setExpandedSlots(prev => ({
                    ...prev,
                    [timeSlot]: !prev[timeSlot]
                  }))}
                  className="sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b dark:border-gray-700 mb-2 px-4 py-2 cursor-pointer flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <TimeSlotHeader time={timeSlot} />
                  <span className="text-sm text-gray-500">
                    {games.length} game(s)
                  </span>
                </div>

                <AnimatePresence>
                  {expandedSlots[timeSlot] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-6">
                        {games.map((game, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <EnhancedGameCard matchup={game} useKenPom={useKenPom} />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </motion.div>
      </main>

      {/* Advanced Filters Modal */}
      <AdvancedFilters
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        useKenPom={useKenPom}
      />
    </div>
  );
};

export default CBBReport;