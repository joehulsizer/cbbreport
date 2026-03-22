// src/App.jsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import CBBReport from './components/CBBreport';
import Landing from './components/Landing';
import { Moon, Sun } from 'lucide-react';
import {
  getEasternYmd,
  sanitizeReportForDisplay,
  validateReportForEasternDate,
} from './utils/reportDisplay';

const REPORT_SOURCES = [
  {
    label: 'vercel-static',
    buildUrl: (cacheBust) => `/cbb_report_latest.json?cb=${cacheBust}`,
    init: {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    },
  },
  {
    label: 'github-raw-fallback',
    buildUrl: (cacheBust) =>
      `https://raw.githubusercontent.com/joehulsizer/cbbreport/main/public/cbb_report_latest.json?cb=${cacheBust}`,
    init: {
      cache: 'no-store',
    },
  },
];

const buildEmptyReport = (reportDateEastern) => ({
  generated_at: new Date().toISOString(),
  report_date_eastern: reportDateEastern,
  games: [],
});

const App = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastRefreshAtRef = useRef(0);

  // This state decides which "page" you're on: 'landing' or 'report'
  const [currentView, setCurrentView] = useState('landing');
  
  // Toggle between NET and KenPom rankings
  const [useKenPom, setUseKenPom] = useState(() => {
    const saved = localStorage.getItem('useKenPom');
    return saved === 'true';
  });
  
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  const loadReport = useCallback(async ({ silent = false } = {}) => {
    const expectedEasternDate = getEasternYmd();
    const cacheBust = Date.now();
    let repairedCandidate = null;
    let repairedCandidateMatchCount = -1;
    let repairedCandidateGeneratedAt = -Infinity;

    try {
      lastRefreshAtRef.current = Date.now();
      if (!silent) {
        setLoading(true);
      }

      for (const source of REPORT_SOURCES) {
        try {
          const response = await fetch(source.buildUrl(cacheBust), source.init);
          if (!response.ok) {
            throw new Error(`Report HTTP ${response.status}`);
          }

          const data = await response.json();
          const validation = validateReportForEasternDate(data, expectedEasternDate);

          if (validation.isExactMatch) {
            console.info(`[report] Loaded ${expectedEasternDate} slate from ${source.label}.`);
            setReportData(sanitizeReportForDisplay(data, expectedEasternDate));
            return;
          }

          if (validation.canRepair && validation.repairedReport) {
            const generatedAt = new Date(data.generated_at || 0).getTime();
            const shouldPromoteCandidate =
              validation.matchingGames > repairedCandidateMatchCount ||
              (validation.matchingGames === repairedCandidateMatchCount &&
                generatedAt > repairedCandidateGeneratedAt);

            if (shouldPromoteCandidate) {
              repairedCandidate = validation.repairedReport;
              repairedCandidateMatchCount = validation.matchingGames;
              repairedCandidateGeneratedAt = generatedAt;
            }
          }

          console.warn(
            `[report] Rejected stale slate from ${source.label}. Expected ${expectedEasternDate}, got ${data.report_date_eastern || 'unknown'} with ${validation.matchingGames}/${validation.totalGames} games on today's ET date.`
          );
        } catch (sourceError) {
          console.error(`[report] Failed loading from ${source.label}:`, sourceError);
        }
      }

      if (repairedCandidate) {
        console.warn(
          `[report] Repaired stale slate by keeping only ${repairedCandidateMatchCount} game(s) on ${expectedEasternDate}.`
        );
        setReportData(sanitizeReportForDisplay(repairedCandidate, expectedEasternDate));
        return;
      }

      console.error(`[report] No valid slate found for ${expectedEasternDate}; falling back to an empty board.`);
      setReportData((current) => {
        const currentValidation = validateReportForEasternDate(current, expectedEasternDate);
        return currentValidation.isValid
          ? sanitizeReportForDisplay(current, expectedEasternDate)
          : buildEmptyReport(expectedEasternDate);
      });
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  useEffect(() => {
    const maybeRefresh = () => {
      if (Date.now() - lastRefreshAtRef.current < 15000) {
        return;
      }

      loadReport({ silent: true });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        maybeRefresh();
      }
    };

    const handlePageShow = (event) => {
      if (event.persisted) {
        maybeRefresh();
      }
    };

    window.addEventListener('focus', maybeRefresh);
    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', maybeRefresh);
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadReport]);
  
  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('useKenPom', useKenPom.toString());
  }, [useKenPom]);
  
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // A helper to count active advanced filters (if you want to pass to Landing)
  const countActiveFilters = (filters) => {
    if (!filters) return 0;
    return Object.values(filters).filter(
      v => v !== false && v !== null && v !== undefined && v !== '' 
    ).length;
  };

  // Dark mode toggle button
  const DarkModeToggle = () => (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
      title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {darkMode ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-blue-600" />
      )}
    </button>
  );

  // If loading...
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading College Basketball Data...</p>
        </div>
      </div>
    );
  }

  // If no data...
  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">No data available</p>
        </div>
      </div>
    );
  }

  // Decide what to render: 'landing' or 'report'
  if (currentView === 'landing') {
    return (
      <>
        <DarkModeToggle />
        <Landing
          data={reportData}
          onViewReport={() => setCurrentView('report')}
          activeFilterCount={0 /* or a real number if you track filters in App */}
          onRefreshData={loadReport}
        />
      </>
    );
  }

  return (
    <>
      <DarkModeToggle />
      <CBBReport
        data={reportData}
        onBackToLanding={() => setCurrentView('landing')}
        useKenPom={useKenPom}
        onToggleRankingSystem={() => setUseKenPom(!useKenPom)}
        darkMode={darkMode}
        onRefreshData={loadReport}
      />
    </>
  );
};

export default App;
