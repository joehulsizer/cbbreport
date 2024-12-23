import React from 'react';
import { motion } from 'framer-motion';
import { Target, Activity, Shield, BarChart } from 'lucide-react';

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

const StatCard = ({ label, value, icon: Icon, change }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-lg p-4 shadow-sm border"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold mt-1">{value}</p>
        {change && (
          <div className={`text-sm mt-1 ${
            change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change > 0 ? '+' : ''}{change}
          </div>
        )}
      </div>
      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
    </div>
  </motion.div>
);

const TeamStatsSection = ({ team, data }) => {
  const form = getRecentForm(data.quadGames);
  const formValue = `${form.wins}-${form.total - form.wins}`;

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{team}</h3>
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="NET Ranking"
          value={`#${data.net || 'N/A'}`}
          icon={Target}
          change={data.previousNet ? data.previousNet - data.net : null}
        />
        <StatCard
          label="Overall Record"
          value={data.record}
          icon={Activity}
        />
        <StatCard
          label="Conference Record"
          value={data.confRecord}
          icon={Shield}
        />
        <StatCard
          label="Recent Form"
          value={formValue}
          icon={BarChart}
        />
      </div>
    </div>
  );
};

const SimpleTeamStats = ({ homeTeam, awayTeam, homeData, awayData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <TeamStatsSection team={awayTeam} data={awayData} />
      <TeamStatsSection team={homeTeam} data={homeData} />
    </div>
  );
};

export default SimpleTeamStats;