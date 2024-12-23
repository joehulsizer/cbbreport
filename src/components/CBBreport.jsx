import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, TrendingUp, SlidersHorizontal } from 'lucide-react';
import EnhancedGameCard from './EnhancedGameCard';
import AdvancedFilters from './AdvancedFilters';

const TimeSlotHeader = ({ time }) => (
  <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b mb-6">
    <div className="max-w-7xl mx-auto py-3 px-4">
      <div className="flex items-center space-x-2">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">
          {new Date(time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </h2>
      </div>
    </div>
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

const CBBReport = ({ data }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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
      maxNET: 358
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

      // Check NET rankings
      const homeTeamData = game.teams[game.matchup.home];
      const awayTeamData = game.teams[game.matchup.away];

      if (homeTeamData.net < advancedFilters.minNET || 
          homeTeamData.net > advancedFilters.maxNET ||
          awayTeamData.net < advancedFilters.minNET || 
          awayTeamData.net > advancedFilters.maxNET) {
        return false;
      }

      // Check for overvalued home favorites
      if (advancedFilters.overvaluedHome) {
        const homeOdds = Object.values(odds)[0]?.home || 0;
        if (!(homeOdds < 0 && homeTeamData.net > awayTeamData.net)) {
          return false;
        }
      }

      // Check for valuable away teams
      if (advancedFilters.valueAwayTeams) {
        const awayOdds = Object.values(odds)[0]?.away || 0;
        if (!(awayTeamData.net <= 50 && awayOdds > 0)) {
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
      game.teams[game.matchup.home].net,
      game.teams[game.matchup.away].net
    ) <= 50
  ).length;
  
  const filteredTop50 = filteredGames.filter(game => 
    Math.min(
      game.teams[game.matchup.home].net,
      game.teams[game.matchup.away].net
    ) <= 50
  ).length;

  // Get unique time slots for both total and filtered games
  const totalTimeSlots = new Set(data.games.map(game => {
    const timeSlot = new Date(game.matchup.commence_time);
    timeSlot.setMinutes(0);
    return timeSlot.toISOString();
  })).size;

  const filteredTimeSlots = new Set(filteredGames.map(game => {
    const timeSlot = new Date(game.matchup.commence_time);
    timeSlot.setMinutes(0);
    return timeSlot.toISOString();
  })).size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto">
          <div className="py-6 px-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                College Basketball Daily Report
              </h1>
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
                stat={filteredTimeSlots}
                total={totalTimeSlots}
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
                onClick={() => setShowAdvancedFilters(true)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition-all flex items-center gap-2"
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 1) NO MATCHES FOUND MESSAGE */}
          {filteredGames.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No games match your filters. Try adjusting them above.
            </div>
          ) : (
            // 2) NORMAL RENDER IF GAMES EXIST
            Object.entries(gamesByTime).map(([timeSlot, games]) => (
              <div key={timeSlot}>
                <TimeSlotHeader time={timeSlot} />
                <div className="space-y-6">
                  {games.map((game, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <EnhancedGameCard matchup={game} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </motion.div>
      </main>


      {/* Add the AdvancedFilters component */}
      <AdvancedFilters
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
      />
    </div>
  );
};

export default CBBReport;