import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, X, Filter, TrendingUp } from 'lucide-react';

const SearchAndFavorites = ({ games, onSelectGame, useKenPom }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const favorites = JSON.parse(localStorage.getItem('favoriteGames') || '[]');

  const getRanking = (teamData) => {
    return useKenPom ? (teamData.kenpom || teamData.net) : teamData.net;
  };

  const filteredGames = useMemo(() => {
    let filtered = games;

    // Filter by favorites
    if (showFavoritesOnly) {
      filtered = filtered.filter(game => {
        const gameId = `${game.matchup.away}-${game.matchup.home}`;
        return favorites.includes(gameId);
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(game => {
        const searchLower = searchTerm.toLowerCase();
        return (
          game.matchup.home.toLowerCase().includes(searchLower) ||
          game.matchup.away.toLowerCase().includes(searchLower) ||
          getRanking(game.teams[game.matchup.home]).toString().includes(searchLower) ||
          getRanking(game.teams[game.matchup.away]).toString().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [games, searchTerm, showFavoritesOnly, favorites, useKenPom]);

  return (
    <div className="relative">
      {/* Search Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
      >
        <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        <span className="font-semibold text-gray-700 dark:text-gray-300">Search Games</span>
        {favorites.length > 0 && (
          <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">
            {favorites.length}
          </span>
        )}
      </motion.button>

      {/* Search Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full mt-2 right-0 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Search & Favorites</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search teams, rankings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center space-x-2 mt-3">
                  <button
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                      showFavoritesOnly
                        ? 'bg-yellow-400 text-yellow-900'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-yellow-900' : ''}`} />
                    <span>Favorites Only</span>
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredGames.length} games
                  </span>
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto p-2">
                {filteredGames.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No games found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredGames.map((game, idx) => {
                      const gameId = `${game.matchup.away}-${game.matchup.home}`;
                      const isFavorite = favorites.includes(gameId);
                      const homeRank = getRanking(game.teams[game.matchup.home]);
                      const awayRank = getRanking(game.teams[game.matchup.away]);

                      return (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => {
                            onSelectGame(game);
                            setIsOpen(false);
                          }}
                          className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {game.matchup.away}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                (#{awayRank})
                              </span>
                            </div>
                            {isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">@</div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {game.matchup.home}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              (#{homeRank})
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {new Date(game.matchup.commence_time).toLocaleString()}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchAndFavorites;
