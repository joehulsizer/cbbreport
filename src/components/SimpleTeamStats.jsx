import React from 'react';
import { motion } from 'framer-motion';
import { Target, Activity, Shield, BarChart, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { reorganizeQuadGames, getOpponentRank } from '../utils/quadHelpers';

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

const getRecordVsRankings = (quadGames, opponentRank, type, useKenPom) => {
  const allGames = Object.values(quadGames)
    .flatMap(quad => quad.games)
    .filter(game => {
      const gameOppRank = getOpponentRank(game, useKenPom);
      return type === 'worse' 
        ? gameOppRank > opponentRank 
        : gameOppRank < opponentRank;
    });

  const wins = allGames.filter(game => game.result === 'W').length;
  return `${wins}-${allGames.length - wins}`;
};

const getRecordVsSimilar = (quadGames, opponentRank, useKenPom) => {
  const allGames = Object.values(quadGames)
    .flatMap(quad => quad.games)
    .filter(game => {
      const gameOppRank = getOpponentRank(game, useKenPom);
      const rankDiff = Math.abs(gameOppRank - opponentRank);
      return rankDiff <= 20;
    });

  const wins = allGames.filter(game => game.result === 'W').length;
  return `${wins}-${allGames.length - wins}`;
};

const StatCard = ({ label, value, icon: Icon, change, highlight, smaller }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`bg-white rounded-lg p-3 shadow-sm border
      ${highlight ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
      ${smaller ? 'transform scale-95' : ''}`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold mt-1">{value}</p>
        {change && (
          <div className={`text-sm mt-1 ${
            change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change > 0 ? '+' : ''}{change}
          </div>
        )}
      </div>
      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
    </div>
  </motion.div>
);

const TeamStatsSection = ({ team, data, opponentRank, isUnderdog, useKenPom }) => {
  const form = getRecentForm(data.quadGames);
  const formValue = `${form.wins}-${form.total - form.wins}`;
  
  const recordVsWorse = getRecordVsRankings(data.quadGames, opponentRank, 'worse', useKenPom);
  const recordVsBetter = getRecordVsRankings(data.quadGames, opponentRank, 'better', useKenPom);
  const recordVsSimilar = getRecordVsSimilar(data.quadGames, opponentRank, useKenPom);
  
  // Get the appropriate ranking
  const ranking = useKenPom ? (data.kenpom || data.net) : data.net;

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-3">{team}</h3>
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label={useKenPom ? "KenPom Ranking" : "NET Ranking"}
          value={`#${ranking || 'N/A'}`}
          icon={Target}
          change={data.previousNet ? data.previousNet - data.net : null}
          smaller={true}
        />
        <StatCard
          label="Overall Record"
          value={data.record}
          icon={Activity}
          smaller={true}
        />
        <StatCard
          label="Conference Record"
          value={data.confRecord}
          icon={Shield}
          smaller={true}
        />
        <StatCard
          label="Recent Form"
          value={formValue}
          icon={BarChart}
          smaller={true}
        />
        <StatCard
          label="vs. Worse Ranked"
          value={recordVsWorse}
          icon={TrendingDown}
          highlight={!isUnderdog}
          smaller={true}
        />
        <StatCard
          label="vs. Better Ranked"
          value={recordVsBetter}
          icon={TrendingUp}
          highlight={isUnderdog}
          smaller={true}
        />
        <StatCard
          label="vs. Similar Teams"
          value={recordVsSimilar}
          icon={Scale}
          smaller={true}
        />
      </div>
    </div>
  );
};

const SimpleTeamStats = ({ homeTeam, awayTeam, homeData, awayData, odds, useKenPom }) => {
  // Determine favorites/underdogs based on odds
  const firstBookmaker = Object.values(odds)[0] || {};
  const homeIsUnderdog = firstBookmaker.home > 0;
  const awayIsUnderdog = firstBookmaker.away > 0;
  
  // Get the appropriate ranking
  const getRanking = (teamData) => {
    return useKenPom ? (teamData.kenpom || teamData.net) : teamData.net;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TeamStatsSection 
        team={awayTeam} 
        data={awayData} 
        opponentRank={getRanking(homeData)}
        isUnderdog={awayIsUnderdog}
        useKenPom={useKenPom}
      />
      <TeamStatsSection 
        team={homeTeam} 
        data={homeData}
        opponentRank={getRanking(awayData)}
        isUnderdog={homeIsUnderdog}
        useKenPom={useKenPom}
      />
    </div>
  );
};

export default SimpleTeamStats;