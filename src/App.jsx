// src/App.jsx
import React, { useEffect, useState } from 'react';
import CBBReport from './components/CBBreport';
import Landing from './components/Landing';
import { Moon, Sun } from 'lucide-react';

const App = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        // ★★ NEW: Always fetch the "latest" JSON in the public folder
        const response = await fetch('/cbb_report_latest.json');
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error('Error loading report:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, []);
  
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
          darkMode={darkMode}
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
      />
    </>
  );
};

export default App;
