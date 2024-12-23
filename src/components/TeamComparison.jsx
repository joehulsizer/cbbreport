import React from 'react';
import { Card, CardBody } from '@chakra-ui/react';
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
  Legend
} from 'recharts';

const TeamComparison = ({ homeTeam, awayTeam, homeData, awayData }) => {
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

  return (
    <Card className="mb-6">
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team Basic Info */}
          <div className="flex justify-between items-center">
            <div className="text-center w-full">
              <div className="text-2xl font-bold mb-2">
                {awayTeam} vs {homeTeam}
              </div>
              <div className="text-gray-600">
                NET Rankings: {awayData.net} vs {homeData.net}
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name={homeTeam}
                  dataKey={homeTeam}
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.3}
                />
                <Radar
                  name={awayTeam}
                  dataKey={awayTeam}
                  stroke="#dc2626"
                  fill="#dc2626"
                  fillOpacity={0.3}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Form Chart */}
          <div className="h-48">
            <h3 className="text-lg font-semibold mb-2">Recent Form (Win %)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formData}>
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Bar dataKey={homeTeam} fill="#2563eb" />
                <Bar dataKey={awayTeam} fill="#dc2626" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default TeamComparison;