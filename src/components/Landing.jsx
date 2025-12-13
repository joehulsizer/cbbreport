// src/components/Landing.jsx
import React from 'react';

/**
 * This is the new Landing (Dashboard) page.
 * It shows some quick stats and a button to go to the full report.
 */
const Landing = ({ data, onViewReport, activeFilterCount }) => {
  if (!data) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold">No data available</h2>
      </div>
    );
  }

  // Count total games
  const totalGames = data.games.length;
  // Count top 50 games
  const top50Games = data.games.filter(game => {
    const homeNet = game.teams[game.matchup.home].net;
    const awayNet = game.teams[game.matchup.away].net;
    return Math.min(homeNet, awayNet) <= 50;
  }).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">CBB Dashboard</h1>
          <p className="text-gray-500">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <button
          onClick={onViewReport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
        >
          View Full Report
        </button>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Games */}
        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
          <p className="text-sm text-gray-500">Total Games</p>
          <p className="text-2xl font-bold mt-1">{totalGames}</p>
        </div>

        {/* Top 50 Games */}
        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
          <p className="text-sm text-gray-500">Top 50 Matchups</p>
          <p className="text-2xl font-bold mt-1">{top50Games}</p>
        </div>

        {/* Active Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
          <p className="text-sm text-gray-500">Active Filters</p>
          <p className="text-2xl font-bold mt-1">{activeFilterCount}</p>
        </div>
      </div>

      {/* (Optional) You could list featured games or special sections here */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Featured Games (Top 50)</h2>
        {top50Games === 0 ? (
          <p className="text-gray-500">No Top 50 games today.</p>
        ) : (
          data.games
            .filter(game => {
              const homeNet = game.teams[game.matchup.home].net;
              const awayNet = game.teams[game.matchup.away].net;
              return Math.min(homeNet, awayNet) <= 50;
            })
            .slice(0, 5) // Only show 5
            .map((game, idx) => (
              <div key={idx} className="border-b last:border-none py-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">
                      {game.matchup.away} @ {game.matchup.home}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(game.matchup.commence_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Landing;
