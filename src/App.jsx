// src/App.jsx
import React, { useEffect, useState } from 'react';
import CBBReport from './components/CBBreport';
import Landing from './components/Landing';

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
  
  // Save KenPom preference to localStorage
  useEffect(() => {
    localStorage.setItem('useKenPom', useKenPom.toString());
  }, [useKenPom]);

  // A helper to count active advanced filters (if you want to pass to Landing)
  const countActiveFilters = (filters) => {
    if (!filters) return 0;
    return Object.values(filters).filter(
      v => v !== false && v !== null && v !== undefined && v !== '' 
    ).length;
  };

  // If loading...
  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  // If no data...
  if (!reportData) {
    return <div className="p-4">No data available</div>;
  }

  // Decide what to render: 'landing' or 'report'
  if (currentView === 'landing') {
    return (
      <Landing
        data={reportData}
        onViewReport={() => setCurrentView('report')}
        activeFilterCount={0 /* or a real number if you track filters in App */}
      />
    );
  }

  return (
    <CBBReport
      data={reportData}
      onBackToLanding={() => setCurrentView('landing')}
      useKenPom={useKenPom}
      onToggleRankingSystem={() => setUseKenPom(!useKenPom)}
    />
  );
};

export default App;
