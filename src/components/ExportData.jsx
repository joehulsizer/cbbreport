import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, X, Check } from 'lucide-react';

const ExportData = ({ games, useKenPom }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [showSuccess, setShowSuccess] = useState(false);

  const getRanking = (teamData) => {
    return useKenPom ? (teamData.kenpom || teamData.net) : teamData.net;
  };

  const exportToJSON = () => {
    const data = games.map(game => ({
      away_team: game.matchup.away,
      away_rank: getRanking(game.teams[game.matchup.away]),
      away_record: game.teams[game.matchup.away].record,
      home_team: game.matchup.home,
      home_rank: getRanking(game.teams[game.matchup.home]),
      home_record: game.teams[game.matchup.home].record,
      commence_time: game.matchup.commence_time,
      odds: game.matchup.odds,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, `cbb-games-${new Date().toISOString().split('T')[0]}.json`);
  };

  const exportToCSV = () => {
    const headers = [
      'Away Team',
      'Away Rank',
      'Away Record',
      'Home Team',
      'Home Rank',
      'Home Record',
      'Game Time',
      'Best Home Odds',
      'Best Away Odds',
    ];

    const rows = games.map(game => {
      const odds = Object.values(game.matchup.odds)[0] || {};
      return [
        game.matchup.away,
        getRanking(game.teams[game.matchup.away]),
        game.teams[game.matchup.away].record,
        game.matchup.home,
        getRanking(game.teams[game.matchup.home]),
        game.teams[game.matchup.home].record,
        new Date(game.matchup.commence_time).toLocaleString(),
        odds.home || 'N/A',
        odds.away || 'N/A',
      ];
    });

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadFile(blob, `cbb-games-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportToMarkdown = () => {
    let markdown = `# College Basketball Games - ${new Date().toLocaleDateString()}\n\n`;
    markdown += `*Using ${useKenPom ? 'KenPom' : 'NET'} Rankings*\n\n`;

    games.forEach(game => {
      const awayRank = getRanking(game.teams[game.matchup.away]);
      const homeRank = getRanking(game.teams[game.matchup.home]);
      const odds = Object.values(game.matchup.odds)[0] || {};

      markdown += `## ${game.matchup.away} (#${awayRank}) @ ${game.matchup.home} (#${homeRank})\n\n`;
      markdown += `- **Time:** ${new Date(game.matchup.commence_time).toLocaleString()}\n`;
      markdown += `- **Away Record:** ${game.teams[game.matchup.away].record}\n`;
      markdown += `- **Home Record:** ${game.teams[game.matchup.home].record}\n`;
      markdown += `- **Odds:** Home ${odds.home || 'N/A'}, Away ${odds.away || 'N/A'}\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    downloadFile(blob, `cbb-games-${new Date().toISOString().split('T')[0]}.md`);
  };

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setIsOpen(false);
    }, 2000);
  };

  const handleExport = () => {
    switch (exportFormat) {
      case 'json':
        exportToJSON();
        break;
      case 'csv':
        exportToCSV();
        break;
      case 'markdown':
        exportToMarkdown();
        break;
      default:
        exportToJSON();
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all font-semibold"
      >
        <Download className="w-5 h-5" />
        <span className="hidden sm:inline">Export Data</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="absolute top-full mt-2 right-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Export Games</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {showSuccess ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-green-600 dark:text-green-400 font-semibold">Export Successful!</p>
                </motion.div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Export {games.length} games in your preferred format
                  </p>

                  <div className="space-y-3 mb-6">
                    <button
                      onClick={() => setExportFormat('json')}
                      className={`w-full p-3 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                        exportFormat === 'json'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">JSON</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Structured data format
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setExportFormat('csv')}
                      className={`w-full p-3 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                        exportFormat === 'csv'
                          ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <FileSpreadsheet className="w-5 h-5 text-green-600" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">CSV</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Excel-compatible format
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setExportFormat('markdown')}
                      className={`w-full p-3 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                        exportFormat === 'markdown'
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <FileText className="w-5 h-5 text-purple-600" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Markdown</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Formatted text document
                        </p>
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={handleExport}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Export Now</span>
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportData;
