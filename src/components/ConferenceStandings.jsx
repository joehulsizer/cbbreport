import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Target, Medal } from 'lucide-react';

const ConferenceStandings = ({ games, useKenPom }) => {
  const [selectedConference, setSelectedConference] = useState('all');

  const getRanking = (teamData) => {
    return useKenPom ? (teamData.kenpom || teamData.net) : teamData.net;
  };

  // Extract conference standings from game data
  const conferenceData = useMemo(() => {
    const conferences = {};

    games.forEach(game => {
      const homeTeam = game.teams[game.matchup.home];
      const awayTeam = game.teams[game.matchup.away];

      // Extract conference from conf record if available
      // This is a simplified version - you'd need proper conference data
      [
        { name: game.matchup.home, data: homeTeam },
        { name: game.matchup.away, data: awayTeam }
      ].forEach(({ name, data }) => {
        const [wins, losses] = data.record.split('-').map(Number);
        const confRecord = data.confRecord || '0-0';
        const [confWins, confLosses] = confRecord.split('-').map(Number);
        
        // Use a simplified conference extraction
        const conference = 'Conference'; // You'd need actual conference data
        
        if (!conferences[conference]) {
          conferences[conference] = [];
        }

        // Check if team already exists
        const existingTeam = conferences[conference].find(t => t.name === name);
        if (!existingTeam) {
          conferences[conference].push({
            name,
            wins,
            losses,
            confWins,
            confLosses,
            rank: getRanking(data),
            winPct: wins / (wins + losses),
            confWinPct: confWins > 0 ? confWins / (confWins + confLosses) : 0
          });
        }
      });
    });

    // Sort teams within each conference
    Object.keys(conferences).forEach(conf => {
      conferences[conf].sort((a, b) => b.confWinPct - a.confWinPct || b.winPct - a.winPct);
    });

    return conferences;
  }, [games, useKenPom]);

  const conferences = Object.keys(conferenceData);
  const selectedTeams = selectedConference === 'all' 
    ? Object.values(conferenceData).flat().sort((a, b) => a.rank - b.rank).slice(0, 25)
    : conferenceData[selectedConference] || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <Trophy className="w-7 h-7 mr-3 text-yellow-500" />
          Conference Standings
        </h2>
        
        <select
          value={selectedConference}
          onChange={(e) => setSelectedConference(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold"
        >
          <option value="all">Top 25 Teams</option>
          {conferences.map(conf => (
            <option key={conf} value={conf}>{conf}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300 dark:border-gray-600">
              <th className="text-left py-3 px-2 text-sm font-bold text-gray-700 dark:text-gray-300">Rank</th>
              <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Team</th>
              <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Overall</th>
              <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Conference</th>
              <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Win %</th>
              <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                {useKenPom ? 'KenPom' : 'NET'}
              </th>
            </tr>
          </thead>
          <tbody>
            {selectedTeams.map((team, idx) => (
              <motion.tr
                key={team.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="py-3 px-2">
                  <div className="flex items-center">
                    {idx < 3 && (
                      <Medal className={`w-5 h-5 mr-1 ${
                        idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : 'text-orange-600'
                      }`} />
                    )}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{idx + 1}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{team.name}</span>
                </td>
                <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">
                  {team.wins}-{team.losses}
                </td>
                <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">
                  {team.confWins}-{team.confLosses}
                </td>
                <td className="text-center py-3 px-4">
                  <span className={`font-semibold ${
                    team.winPct >= 0.75 ? 'text-green-600 dark:text-green-400' :
                    team.winPct >= 0.5 ? 'text-blue-600 dark:text-blue-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {(team.winPct * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    #{team.rank}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTeams.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No standings data available</p>
        </div>
      )}
    </div>
  );
};

export default ConferenceStandings;
