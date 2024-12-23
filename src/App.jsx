import React, { useEffect, useState } from 'react';
import CBBReport from './components/CBBreport';

const App = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        // have the file name be dynamic
        const response = await fetch(`cbb_report_${new Date().toISOString().split('T')[0]}.json`);
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

  if (loading) return <div className="p-4">Loading...</div>;
  if (!reportData) return <div className="p-4">No data available</div>;

  return <CBBReport data={reportData} />;
};

export default App;