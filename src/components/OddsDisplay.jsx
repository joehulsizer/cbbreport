import React from 'react';
import { Box } from '@chakra-ui/react';

const findBestOdds = (odds) => {
  let bestHome = -Infinity;
  let bestAway = -Infinity;
  let bestHomeBook = '';
  let bestAwayBook = '';

  Object.entries(odds).forEach(([book, bookOdds]) => {
    if (bookOdds.home > bestHome) {
      bestHome = bookOdds.home;
      bestHomeBook = book;
    }
    if (bookOdds.away > bestAway) {
      bestAway = bookOdds.away;
      bestAwayBook = book;
    }
  });

  return { bestHomeBook, bestAwayBook };
};

const OddsDisplay = ({ odds }) => {
  const { bestHomeBook, bestAwayBook } = findBestOdds(odds);

  return (
    <Box className="p-4 rounded-lg border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(odds).map(([book, bookOdds]) => (
          <div key={book} className="p-4 rounded-lg border">
            <div className="font-semibold capitalize mb-2">{book}</div>
            <div className="space-y-2">
              <div className={`text-sm ${book === bestHomeBook ? 'font-bold text-green-600' : ''}`}>
                Home: {bookOdds.home}
                {book === bestHomeBook && ' (Best)'}
              </div>
              <div className={`text-sm ${book === bestAwayBook ? 'font-bold text-green-600' : ''}`}>
                Away: {bookOdds.away}
                {book === bestAwayBook && ' (Best)'}
              </div>
              {bookOdds.homeSpread && (
                <div className="text-sm mt-2">
                  <div>Spread: {bookOdds.homeSpread} ({bookOdds.homeSpreadOdds})</div>
                  <div>        {bookOdds.awaySpread} ({bookOdds.awaySpreadOdds})</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
};

export default OddsDisplay;