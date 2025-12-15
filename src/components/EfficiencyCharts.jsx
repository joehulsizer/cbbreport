import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, LineChart, Line
} from 'recharts';
import { TrendingUp, Activity, Shield, Zap } from 'lucide-react';

const EfficiencyCharts = ({ homeTeam, awayTeam, homeData, awayData, useKenPom }) => {
  // Calculate quad performance percentages
  const getQuadPerformance = (quadGames) => {
    return Object.entries(quadGames).reduce((acc, [quad, data]) => {
      const [wins, losses] = data.record.split('-').map(Number);
      acc[`quad${quad}`] = wins / (wins + losses) * 100 || 0;
      return acc;
    }, {});
  };

  const homeQuads = getQuadPerformance(homeData.quadGames);
  const awayQuads = getQuadPerformance(awayData.quadGames);

  // Radar chart data
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

  // Recent form data (last 10 games)
  const getRecentFormData = (quadGames, teamName) => {
    const allGames = Object.values(quadGames)
      .flatMap(quad => quad.games)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-10);

    return allGames.map((game, idx) => ({
      game: idx + 1,
      [teamName]: game.result === 'W' ? 100 : 0,
    }));
  };

  const homeFormData = getRecentFormData(homeData.quadGames, homeTeam);
  const awayFormData = getRecentFormData(awayData.quadGames, awayTeam);

  // Combine form data
  const combinedFormData = homeFormData.map((home, idx) => ({
    game: `G${idx + 1}`,
    [homeTeam]: home[homeTeam],
    [awayTeam]: awayFormData[idx] ? awayFormData[idx][awayTeam] : 0,
  }));

  // Win percentage comparison by location
  const getLocationStats = (quadGames) => {
    const stats = { home: { w: 0, l: 0 }, away: { w: 0, l: 0 }, neutral: { w: 0, l: 0 } };
    
    Object.values(quadGames).forEach(quad => {
      quad.games.forEach(game => {
        const location = game.location.toLowerCase();
        if (stats[location]) {
          if (game.result === 'W') stats[location].w++;
          else stats[location].l++;
        }
      });
    });

    return {
      home: stats.home.w / (stats.home.w + stats.home.l) * 100 || 0,
      away: stats.away.w / (stats.away.w + stats.away.l) * 100 || 0,
      neutral: stats.neutral.w / (stats.neutral.w + stats.neutral.l) * 100 || 0,
    };
  };

  const homeLocationStats = getLocationStats(homeData.quadGames);
  const awayLocationStats = getLocationStats(awayData.quadGames);

  const locationData = [
    {
      location: 'Home',
      [homeTeam]: homeLocationStats.home,
      [awayTeam]: awayLocationStats.home,
    },
    {
      location: 'Away',
      [homeTeam]: homeLocationStats.away,
      [awayTeam]: awayLocationStats.away,
    },
    {
      location: 'Neutral',
      [homeTeam]: homeLocationStats.neutral,
      [awayTeam]: awayLocationStats.neutral,
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Quad Performance Radar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Shield className="w-6 h-6 mr-2 text-blue-600" />
          Quadrant Performance Analysis
        </h3>
        
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
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
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-4 gap-3 mt-4">
          {[1, 2, 3, 4].map(quad => (
            <div key={quad} className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-600 mb-1">Quad {quad}</p>
              <p className="text-sm font-bold text-blue-600">{awayQuads[`quad${quad}`].toFixed(0)}%</p>
              <p className="text-xs text-gray-400">vs</p>
              <p className="text-sm font-bold text-purple-600">{homeQuads[`quad${quad}`].toFixed(0)}%</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Form Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Activity className="w-6 h-6 mr-2 text-green-600" />
          Recent Form (Last 10 Games)
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={combinedFormData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="game" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey={homeTeam}
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey={awayTeam}
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">{awayTeam} Recent</p>
            <p className="text-2xl font-bold text-blue-600">
              {awayFormData.filter(g => g[awayTeam] === 100).length}-{awayFormData.filter(g => g[awayTeam] === 0).length}
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">{homeTeam} Recent</p>
            <p className="text-2xl font-bold text-purple-600">
              {homeFormData.filter(g => g[homeTeam] === 100).length}-{homeFormData.filter(g => g[homeTeam] === 0).length}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Win % by Location */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-orange-600" />
          Win Percentage by Location
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={locationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="location" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey={homeTeam} fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            <Bar dataKey={awayTeam} fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-600 mb-1">Home</p>
            <p className="text-sm font-bold text-blue-600">{awayLocationStats.home.toFixed(0)}%</p>
            <p className="text-xs text-gray-400">vs</p>
            <p className="text-sm font-bold text-purple-600">{homeLocationStats.home.toFixed(0)}%</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-600 mb-1">Away</p>
            <p className="text-sm font-bold text-blue-600">{awayLocationStats.away.toFixed(0)}%</p>
            <p className="text-xs text-gray-400">vs</p>
            <p className="text-sm font-bold text-purple-600">{homeLocationStats.away.toFixed(0)}%</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-600 mb-1">Neutral</p>
            <p className="text-sm font-bold text-blue-600">{awayLocationStats.neutral.toFixed(0)}%</p>
            <p className="text-xs text-gray-400">vs</p>
            <p className="text-sm font-bold text-purple-600">{homeLocationStats.neutral.toFixed(0)}%</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EfficiencyCharts;
