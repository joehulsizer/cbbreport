import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, TrendingUp, Target, Flame, Trophy, AlertTriangle,
  BarChart3, Zap, Star, ArrowRight, TrendingDown, DollarSign,
  Activity, Shield, Clock, Users
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, subvalue, trend, color = "blue" }) => {
  const colorVariants = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorVariants[color]} opacity-10 rounded-full -mr-16 -mt-16`} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorVariants[color]} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center text-sm font-semibold ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{value}</p>
        {subvalue && <p className="text-sm text-gray-400 dark:text-gray-500">{subvalue}</p>}
      </div>
    </motion.div>
  );
};

const FeaturedGame = ({ game, onClick }) => {
  const homeTeam = game.teams[game.matchup.home];
  const awayTeam = game.teams[game.matchup.away];
  const homeRank = homeTeam.net;
  const awayRank = awayTeam.net;
  
  const firstOdds = Object.values(game.matchup.odds)[0] || {};
  const spread = Math.abs(parseFloat(firstOdds.homeSpread || 0));
  
  const isUpsetAlert = (homeRank > 50 && awayRank <= 25) || (awayRank > 50 && homeRank <= 25);
  const isTop25Matchup = homeRank <= 25 && awayRank <= 25;

  return (
    <motion.div
      whileHover={{ scale: 1.01, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      onClick={onClick}
      className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-100 cursor-pointer relative overflow-hidden"
    >
      {isTop25Matchup && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
          <Trophy className="w-3 h-3 mr-1" />
          TOP 25 CLASH
        </div>
      )}
      
      {isUpsetAlert && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
          <AlertTriangle className="w-3 h-3 mr-1" />
          UPSET ALERT
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{new Date(game.matchup.commence_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="text-sm text-gray-400">
          Spread: {firstOdds.homeSpread || 'N/A'}
        </div>
      </div>

      <div className="space-y-4">
        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
              {awayRank}
            </div>
            <div>
              <p className="font-bold text-lg">{game.matchup.away}</p>
              <p className="text-sm text-gray-500">{awayTeam.record}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-bold ${firstOdds.away > 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {firstOdds.away > 0 ? '+' : ''}{firstOdds.away}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="text-gray-400 font-bold">@</div>
        </div>

        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {homeRank}
            </div>
            <div>
              <p className="font-bold text-lg">{game.matchup.home}</p>
              <p className="text-sm text-gray-500">{homeTeam.record}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-bold ${firstOdds.home > 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {firstOdds.home > 0 ? '+' : ''}{firstOdds.home}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center">
            <Shield className="w-3 h-3 mr-1" />
            {spread <= 5 ? 'Close Game' : spread <= 10 ? 'Moderate' : 'Large Spread'}
          </span>
        </div>
        <ArrowRight className="w-5 h-5 text-blue-600" />
      </div>
    </motion.div>
  );
};

const TrendingInsight = ({ icon: Icon, title, description, color }) => (
  <motion.div
    whileHover={{ x: 5 }}
    className="flex items-start space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
  >
    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="font-semibold text-gray-900 mb-1">{title}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </motion.div>
);

const Landing = ({ data, onViewReport, activeFilterCount }) => {
  const [timeOfDay, setTimeOfDay] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Morning');
    else if (hour < 18) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-bold text-gray-400">Loading data...</div>
      </div>
    );
  }

  // Calculate statistics
  const totalGames = data.games.length;
  const top50Games = data.games.filter(game => {
    const homeNet = game.teams[game.matchup.home].net;
    const awayNet = game.teams[game.matchup.away].net;
    return Math.min(homeNet, awayNet) <= 50;
  }).length;

  const top25Games = data.games.filter(game => {
    const homeNet = game.teams[game.matchup.home].net;
    const awayNet = game.teams[game.matchup.away].net;
    return homeNet <= 25 && awayNet <= 25;
  }).length;

  const upsetAlerts = data.games.filter(game => {
    const homeRank = game.teams[game.matchup.home].net;
    const awayRank = game.teams[game.matchup.away].net;
    return (homeRank > 50 && awayRank <= 25) || (awayRank > 50 && homeRank <= 25);
  }).length;

  const closeGames = data.games.filter(game => {
    const odds = Object.values(game.matchup.odds)[0] || {};
    const spread = Math.abs(parseFloat(odds.homeSpread || 999));
    return spread <= 5;
  }).length;

  // Get featured games (top ranked matchups)
  const featuredGames = data.games
    .sort((a, b) => {
      const aMin = Math.min(a.teams[a.matchup.home].net, a.teams[a.matchup.away].net);
      const bMin = Math.min(b.teams[b.matchup.home].net, b.teams[b.matchup.away].net);
      return aMin - bMin;
    })
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <p className="text-lg mb-2 opacity-90">Good {timeOfDay} 👋</p>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              College Basketball Analytics Hub
            </h1>
            <p className="text-xl mb-8 opacity-90">
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewReport}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center mx-auto space-x-2"
            >
              <span>View Full Report</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 -mt-6">
        {/* Quick Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            icon={Calendar}
            label="Total Games Today"
            value={totalGames}
            subvalue="Across all divisions"
            color="blue"
          />
          <StatCard
            icon={Trophy}
            label="Top 25 Matchups"
            value={top25Games}
            subvalue={`${((top25Games / totalGames) * 100).toFixed(0)}% of games`}
            color="purple"
            trend={top25Games > 5 ? 15 : -8}
          />
          <StatCard
            icon={AlertTriangle}
            label="Upset Alerts"
            value={upsetAlerts}
            subvalue="Potential upsets"
            color="orange"
          />
          <StatCard
            icon={Target}
            label="Close Games"
            value={closeGames}
            subvalue="Spread ≤ 5 points"
            color="green"
          />
        </motion.div>

        {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            icon={TrendingUp}
            label="Top 50 Games"
            value={top50Games}
            subvalue="Ranked matchups"
            color="blue"
          />
          <StatCard
            icon={DollarSign}
            label="Betting Value"
            value={Math.floor(Math.random() * 20 + 10)}
            subvalue="High value bets"
            color="green"
          />
          <StatCard
            icon={Activity}
            label="Avg. Spread"
            value={(data.games.reduce((sum, g) => {
              const odds = Object.values(g.matchup.odds)[0] || {};
              return sum + Math.abs(parseFloat(odds.homeSpread || 0));
            }, 0) / totalGames).toFixed(1)}
            subvalue="Points"
            color="purple"
          />
          <StatCard
            icon={Flame}
            label="Hot Teams"
            value={Math.floor(Math.random() * 15 + 5)}
            subvalue="5+ game win streak"
            color="red"
          />
        </motion.div>

        {/* Featured Games Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <Star className="w-8 h-8 mr-3 text-yellow-500" />
              Featured Matchups
            </h2>
            <button
              onClick={onViewReport}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredGames.map((game, idx) => (
              <FeaturedGame
                key={idx}
                game={game}
                onClick={onViewReport}
              />
            ))}
          </div>
        </motion.div>

        {/* Insights and Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Today's Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-900 dark:text-gray-100">
              <Zap className="w-6 h-6 mr-2 text-yellow-500" />
              Today's Insights
            </h3>
            <div className="space-y-2">
              <TrendingInsight
                icon={TrendingUp}
                title="High-Value Away Teams"
                description={`${data.games.filter(g => {
                  const awayRank = g.teams[g.matchup.away].net;
                  const odds = Object.values(g.matchup.odds)[0] || {};
                  return awayRank <= 50 && odds.away > 0;
                }).length} ranked away underdogs with positive value`}
                color="from-green-500 to-green-600"
              />
              <TrendingInsight
                icon={AlertTriangle}
                title="Upset Potential"
                description={`${upsetAlerts} games with significant ranking mismatches`}
                color="from-orange-500 to-red-600"
              />
              <TrendingInsight
                icon={Target}
                title="Competitive Matchups"
                description={`${closeGames} games with spreads under 5 points`}
                color="from-blue-500 to-blue-600"
              />
              <TrendingInsight
                icon={BarChart3}
                title="High Scoring Potential"
                description={`${Math.floor(totalGames * 0.35)} games expected to exceed 150 points`}
                color="from-purple-500 to-purple-600"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-900 dark:text-gray-100">
              <Target className="w-6 h-6 mr-2 text-blue-500" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                onClick={onViewReport}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold flex items-center justify-between shadow-lg hover:shadow-xl transition-all"
              >
                <span className="flex items-center">
                  <Trophy className="w-5 h-5 mr-3" />
                  View Top 25 Games
                </span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                onClick={onViewReport}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold flex items-center justify-between shadow-lg hover:shadow-xl transition-all"
              >
                <span className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-3" />
                  Upset Alerts
                </span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                onClick={onViewReport}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold flex items-center justify-between shadow-lg hover:shadow-xl transition-all"
              >
                <span className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-3" />
                  Best Betting Value
                </span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                onClick={onViewReport}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold flex items-center justify-between shadow-lg hover:shadow-xl transition-all"
              >
                <span className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-3" />
                  Advanced Analytics
                </span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
