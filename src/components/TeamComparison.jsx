import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Shield, Activity } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

const TeamComparison = ({ homeTeam, awayTeam, homeData, awayData, useKenPom }) => {
  const [activeView, setActiveView] = useState('overall');
  // Calculate quad performance scores for each team
  const getQuadPerformance = (quadGames) => {
    return Object.entries(quadGames).reduce((acc, [quad, data]) => {
      const [wins, losses] = data.record.split('-').map(Number);
      acc[`quad${quad}`] = (wins / (wins + losses)) * 100 || 0;
      return acc;
    }, {});
  };

  const homeQuads = getQuadPerformance(homeData.quadGames);
  const awayQuads = getQuadPerformance(awayData.quadGames);

  const radarData = [
    {
      category: 'Quad 1',
      [homeTeam]: homeQuads.quad1,
      [awayTeam]: awayQuads.quad1,
      fullMark: 100,
    },
    {
      category: 'Quad 2',
      [homeTeam]: homeQuads.quad2,
      [awayTeam]: awayQuads.quad2,
      fullMark: 100,
    },
    {
      category: 'Quad 3',
      [homeTeam]: homeQuads.quad3,
      [awayTeam]: awayQuads.quad3,
      fullMark: 100,
    },
    {
      category: 'Quad 4',
      [homeTeam]: homeQuads.quad4,
      [awayTeam]: awayQuads.quad4,
      fullMark: 100,
    },
  ];

  // Calculate recent form (last 5 games)
  const getRecentForm = (quadGames) => {
    const allGames = Object.values(quadGames)
      .flatMap(quad => quad.games)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return {
      wins: allGames.filter(game => game.result === 'W').length,
      total: allGames.length
    };
  };

  const homeForm = getRecentForm(homeData.quadGames);
  const awayForm = getRecentForm(awayData.quadGames);

  const formData = [
    {
      name: 'Last 5 Games',
      [homeTeam]: (homeForm.wins / homeForm.total) * 100,
      [awayTeam]: (awayForm.wins / awayForm.total) * 100,
    }
  ];

  // Get rankings
  const homeRank = useKenPom ? (homeData.kenpom || homeData.net) : homeData.net;
  const awayRank = useKenPom ? (awayData.kenpom || awayData.net) : awayData.net;

  const ComparisonStat = ({ label, homeValue, awayValue, icon: Icon, higherIsBetter = true }) => {
    const homeNumeric = parseFloat(homeValue) || 0;
    const awayNumeric = parseFloat(awayValue) || 0;
    const homeIsBetter = higherIsBetter ? homeNumeric > awayNumeric : homeNumeric < awayNumeric;
    const awayIsBetter = higherIsBetter ? awayNumeric > homeNumeric : awayNumeric < homeNumeric;

    return (
      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
        <div className="flex items-center justify-center mb-2">
          <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 items-center">
          <div className={`text-center p-2 rounded ${awayIsBetter ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
            <p className={`font-bold ${awayIsBetter ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {awayValue}
            </p>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-400">vs</span>
          </div>
          <div className={`text-center p-2 rounded ${homeIsBetter ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
            <p className={`font-bold ${homeIsBetter ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {homeValue}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
        {awayTeam} <span className="text-gray-400">vs</span> {homeTeam}
      </h2>

      {/* View Toggle */}
      <div className="flex justify-center space-x-2 mb-6">
        <button
          onClick={() => setActiveView('overall')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            activeView === 'overall'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Overall Stats
        </button>
        <button
          onClick={() => setActiveView('quad')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            activeView === 'quad'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Quad Performance
        </button>
        <button
          onClick={() => setActiveView('form')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            activeView === 'form'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Recent Form
        </button>
      </div>

      {/* Overall Stats View */}
      {activeView === 'overall' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <ComparisonStat
            label="Ranking"
            awayValue={`#${awayRank}`}
            homeValue={`#${homeRank}`}
            icon={Target}
            higherIsBetter={false}
          />
          <ComparisonStat
            label="Overall Record"
            awayValue={awayData.record}
            homeValue={homeData.record}
            icon={Activity}
          />
          <ComparisonStat
            label="Conference Record"
            awayValue={awayData.confRecord || 'N/A'}
            homeValue={homeData.confRecord || 'N/A'}
            icon={Shield}
          />
          <ComparisonStat
            label="Recent Form (L5)"
            awayValue={`${getRecentForm(awayData.quadGames).wins}-${getRecentForm(awayData.quadGames).total - getRecentForm(awayData.quadGames).wins}`}
            homeValue={`${getRecentForm(homeData.quadGames).wins}-${getRecentForm(homeData.quadGames).total - getRecentForm(homeData.quadGames).wins}`}
            icon={TrendingUp}
          />
        </motion.div>
      )}

      {/* Quad Performance View */}
      {activeView === 'quad' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" className="dark:stroke-gray-600" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#6b7280', fontSize: 14 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
              <Radar
                name={homeTeam}
                dataKey={homeTeam}
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.5}
                strokeWidth={2}
              />
              <Radar
                name={awayTeam}
                dataKey={awayTeam}
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
                strokeWidth={2}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Recent Form View */}
      {activeView === 'form' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6b7280' }} />
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Bar dataKey={homeTeam} fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              <Bar dataKey={awayTeam} fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{awayTeam}</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {((homeForm.wins / homeForm.total) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate (L5)</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{homeTeam}</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {((awayForm.wins / awayForm.total) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate (L5)</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TeamComparison;