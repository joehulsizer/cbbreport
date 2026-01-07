# Sports Analytics Dashboard - Complete Blueprint 🏀

> **A comprehensive guide to building a professional sports analytics platform**
> 
> This document provides a complete blueprint for creating an advanced sports analytics dashboard. Originally built for College Basketball, this architecture can be adapted for any sport (NFL, NBA, MLB, Soccer, etc.).

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Core Concepts](#core-concepts)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Data Structure](#data-structure)
6. [Component System](#component-system)
7. [Feature Implementation](#feature-implementation)
8. [Styling Philosophy](#styling-philosophy)
9. [State Management](#state-management)
10. [Adapting to Other Sports](#adapting-to-other-sports)
11. [Setup & Development](#setup--development)
12. [Deployment](#deployment)

---

## Project Overview

### What This Is

A **professional-grade sports analytics dashboard** that provides:
- Real-time game data visualization
- Advanced statistical analysis
- Win probability calculations
- Betting value indicators
- Interactive charts and comparisons
- Dark mode support
- Data export capabilities
- Search and favorites system

### Why This Architecture

This project uses a **component-based architecture** that separates:
- **Data presentation** from data fetching
- **UI components** from business logic
- **Reusable patterns** that work across sports
- **Modular features** that can be added/removed independently

### Design Philosophy

1. **User-First**: Beautiful, intuitive, fast
2. **Data-Driven**: All insights backed by statistics
3. **Responsive**: Works perfectly on any device
4. **Performant**: Optimized rendering and state management
5. **Extensible**: Easy to add new sports/features

---

## Core Concepts

### 1. Two-Page Architecture

#### Landing Page (Dashboard)
- **Purpose**: Quick overview, featured content
- **Components**: Stats cards, featured matchups, insights
- **Goal**: Engage users, provide at-a-glance value

#### Report Page (Main Application)
- **Purpose**: Deep dive into data
- **Components**: Filters, game cards, analytics
- **Goal**: Comprehensive analysis tools

### 2. Data Flow Pattern

```
External Data Source (JSON/API)
    ↓
App.jsx (Data Loading & State)
    ↓
Landing.jsx OR CBBReport.jsx (Page-Level Logic)
    ↓
Feature Components (GameCard, Analytics, etc.)
    ↓
UI Components (Buttons, Cards, Charts)
```

### 3. State Management Strategy

- **Local State**: Component-specific UI states (expanded, hover)
- **Lifted State**: Shared between siblings (filters, selected items)
- **Persistent State**: localStorage (preferences, favorites)
- **Props Drilling**: Acceptable for 2-3 levels, otherwise lift state

### 4. Component Composition

```jsx
<Page>
  <Section>
    <FeatureComponent>
      <UIComponent />
    </FeatureComponent>
  </Section>
</Page>
```

**Example:**
```jsx
<CBBReport>                    // Page
  <MainContent>                // Section
    <EnhancedGameCard>         // Feature
      <TeamComparison>         // Feature
        <StatCard />           // UI Component
      </TeamComparison>
    </EnhancedGameCard>
  </MainContent>
</CBBReport>
```

---

## Architecture

### File Structure

```
src/
├── App.jsx                 # Root component, data loading, routing
├── index.css               # Global styles, Tailwind imports
├── main.jsx               # React entry point
│
├── components/            # All React components
│   ├── Landing.jsx       # Dashboard/home page
│   ├── CBBreport.jsx     # Main report page
│   │
│   ├── EnhancedGameCard.jsx      # Individual game display
│   ├── WinProbability.jsx        # Win % calculator
│   ├── EfficiencyCharts.jsx      # Performance visualizations
│   ├── TeamComparison.jsx        # Side-by-side comparison
│   ├── SimpleTeamStats.jsx       # Quick stats overview
│   ├── OddsDisplay.jsx           # Betting odds from bookmakers
│   │
│   ├── AdvancedFilters.jsx       # Filter modal
│   ├── SearchAndFavorites.jsx   # Search functionality
│   ├── ExportData.jsx            # Data export
│   └── ConferenceStandings.jsx   # Rankings table
│
└── utils/                # Helper functions
    ├── homeAdvantageRanks.js
    ├── quadHelpers.js
    └── ... (sport-specific utilities)
```

### Key Architectural Decisions

#### 1. **Component Hierarchy**

```
App (Data Provider)
  ↓
Landing OR Report (Page Logic)
  ↓
Feature Components (Business Logic)
  ↓
UI Components (Pure Presentation)
```

#### 2. **Data Loading Strategy**

```javascript
// Centralized in App.jsx
useEffect(() => {
  const loadData = async () => {
    const response = await fetch('/data.json');
    const data = await response.json();
    setData(data);
  };
  loadData();
}, []);
```

**Why**: Single source of truth, easy to swap data sources

#### 3. **Routing (View Switching)**

```javascript
const [currentView, setCurrentView] = useState('landing');

return currentView === 'landing' 
  ? <Landing onViewReport={() => setCurrentView('report')} />
  : <Report onBackToLanding={() => setCurrentView('landing')} />
```

**Why**: Simple, no router dependency, fast transitions

---

## Technology Stack

### Core Dependencies

```json
{
  "react": "^18.2.0",              // UI framework
  "react-dom": "^18.2.0",          // DOM rendering
  "framer-motion": "^10.18.0",     // Animations
  "lucide-react": "^0.469.0",      // Icons
  "recharts": "^2.15.0",           // Charts
  "tailwindcss": "^3.4.17",        // Styling
  "vite": "^5.0.0"                 // Build tool
}
```

### Why These Choices?

**React 18**: 
- Concurrent features
- Automatic batching
- Suspense support

**Framer Motion**:
- Declarative animations
- Layout animations
- Gesture support

**Recharts**:
- React-native charts
- Responsive
- Customizable

**Tailwind CSS**:
- Utility-first
- Dark mode built-in
- Small bundle size

**Vite**:
- Fast HMR
- Optimized builds
- Modern ESM

---

## Data Structure

### Expected JSON Format

```json
{
  "games": [
    {
      "matchup": {
        "home": "Team Name",
        "away": "Team Name",
        "commence_time": "2024-01-15T19:00:00Z",
        "odds": {
          "draftkings": {
            "home": -150,
            "away": 130,
            "homeSpread": -3.5,
            "awaySpread": 3.5,
            "homeSpreadOdds": -110,
            "awaySpreadOdds": -110
          },
          "fanduel": { /* same structure */ }
        }
      },
      "teams": {
        "Team Name": {
          "net": 15,           // Ranking (lower is better)
          "kenpom": 12,        // Alternative ranking system
          "record": "20-3",    // Win-Loss
          "confRecord": "10-1", // Conference record
          "quadGames": {       // Performance by quality
            "1": {
              "record": "5-2",
              "games": [
                {
                  "opponent": "Opponent Name",
                  "result": "W",
                  "score": "75-70",
                  "location": "home",
                  "date": "2024-01-10",
                  "oppNet": 8
                }
              ]
            },
            "2": { /* same structure */ },
            "3": { /* same structure */ },
            "4": { /* same structure */ }
          }
        }
      }
    }
  ]
}
```

### Data Requirements by Sport

**Basketball (current)**:
- Rankings (NET/KenPom)
- Quad system (opponent quality tiers)
- Point spreads
- Moneyline odds

**Football (adaptation)**:
- Power rankings
- Division records
- Over/under lines
- Player props

**Soccer (adaptation)**:
- League standings
- Goal differential
- Draw odds
- Both teams to score

**Baseball (adaptation)**:
- ERA, batting average
- Run lines
- Pitcher matchups
- Over/under runs

---

## Component System

### Component Types

#### 1. **Page Components** (Routes)

**Purpose**: Handle page-level logic, data fetching, navigation

```jsx
const Landing = ({ data, onViewReport }) => {
  // Calculate page-level stats
  const totalGames = data.games.length;
  
  // Render layout with sections
  return (
    <div>
      <HeroSection />
      <StatsSection stats={stats} />
      <FeaturedSection games={featured} />
    </div>
  );
};
```

**Key Patterns**:
- Receive data from parent (App)
- Compute derived stats
- Pass callbacks for navigation
- Organize into sections

#### 2. **Feature Components** (Business Logic)

**Purpose**: Implement specific features with their logic

```jsx
const WinProbability = ({ homeTeam, awayTeam, homeData, awayData, odds }) => {
  // Business logic: Calculate win probability
  const probability = calculateWinProbability();
  const expectedValue = calculateExpectedValue();
  
  // Render with UI components
  return (
    <div>
      <ProbabilityBar home={probability.home} away={probability.away} />
      <EVDisplay homeEV={expectedValue.home} awayEV={expectedValue.away} />
    </div>
  );
};
```

**Key Patterns**:
- Encapsulate feature logic
- Use helper functions
- Return composed UI
- Handle feature state

#### 3. **UI Components** (Presentation)

**Purpose**: Pure presentation, reusable across features

```jsx
const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div whileHover={{ scale: 1.02 }} className={`card-${color}`}>
    <Icon />
    <p>{label}</p>
    <h3>{value}</h3>
  </motion.div>
);
```

**Key Patterns**:
- No business logic
- Accept data via props
- Highly reusable
- Styled variants

### Component Communication

#### Props Down

```jsx
<Parent>
  <Child data={parentData} onEvent={handleEvent} />
</Parent>
```

#### Events Up

```jsx
const Child = ({ onEvent }) => {
  return <button onClick={() => onEvent(data)}>Click</button>
};
```

#### Shared State (Lifting)

```jsx
const Parent = () => {
  const [sharedState, setSharedState] = useState(initial);
  
  return (
    <>
      <ChildA data={sharedState} onChange={setSharedState} />
      <ChildB data={sharedState} />
    </>
  );
};
```

---

## Feature Implementation

### 1. Win Probability Calculator

**Concept**: Predict game outcome using multiple factors

**Algorithm**:
```javascript
const calculateWinProbability = () => {
  let homeScore = 0;
  let awayScore = 0;
  
  // Ranking differential (40% weight)
  const rankDiff = awayRank - homeRank;
  if (rankDiff > 0) homeScore += Math.min(40, rankDiff / 2);
  else awayScore += Math.min(40, Math.abs(rankDiff) / 2);
  
  // Home court advantage (10% weight)
  homeScore += 10;
  
  // Recent form (20% weight)
  homeScore += getRecentWinPct(homeData) * 20;
  awayScore += getRecentWinPct(awayData) * 20;
  
  // Overall record (15% weight)
  homeScore += getWinPct(homeRecord) * 15;
  awayScore += getWinPct(awayRecord) * 15;
  
  // Odds-based adjustment (15% weight)
  const oddsProb = convertOddsToProbability(odds);
  homeScore += oddsProb.home * 15;
  awayScore += oddsProb.away * 15;
  
  // Normalize to 100%
  const total = homeScore + awayScore;
  return {
    home: (homeScore / total) * 100,
    away: (awayScore / total) * 100
  };
};
```

**Expected Value**:
```javascript
const calculateEV = (winProb, odds) => {
  const payout = odds > 0 ? odds / 100 : 100 / Math.abs(odds);
  return ((winProb * payout) - (1 - winProb)) * 100;
};
```

**Adaptation for Other Sports**:
- Adjust weight percentages
- Add sport-specific factors (weather, injuries, etc.)
- Modify home advantage based on sport

### 2. Advanced Filtering System

**Concept**: Multi-criteria filtering with persistence

**Implementation**:
```javascript
const [filters, setFilters] = useState(() => {
  const saved = localStorage.getItem('filters');
  return saved ? JSON.parse(saved) : defaultFilters;
});

useEffect(() => {
  localStorage.setItem('filters', JSON.stringify(filters));
}, [filters]);

const filterGames = (games) => {
  return games.filter(game => {
    // Ranking filter
    if (game.rank < filters.minRank || game.rank > filters.maxRank) {
      return false;
    }
    
    // Odds filter
    if (game.odds < filters.minOdds || game.odds > filters.maxOdds) {
      return false;
    }
    
    // Add more conditions...
    return true;
  });
};
```

**Filter Types**:
- **Range Filters**: Rankings, odds, spreads
- **Boolean Filters**: Upset alerts, rivalry games
- **Multi-Select**: Conferences, teams
- **Composite**: Better team as underdog

### 3. Search & Favorites

**Concept**: Quick access to relevant games

**Search Implementation**:
```javascript
const filteredGames = useMemo(() => {
  if (!searchTerm) return games;
  
  return games.filter(game => {
    const searchLower = searchTerm.toLowerCase();
    return (
      game.homeTeam.toLowerCase().includes(searchLower) ||
      game.awayTeam.toLowerCase().includes(searchLower) ||
      game.homeRank.toString().includes(searchLower) ||
      game.awayRank.toString().includes(searchLower)
    );
  });
}, [games, searchTerm]);
```

**Favorites Implementation**:
```javascript
const toggleFavorite = (gameId) => {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  
  if (favorites.includes(gameId)) {
    const newFavorites = favorites.filter(id => id !== gameId);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  } else {
    favorites.push(gameId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
};
```

### 4. Data Export

**Concept**: Allow users to analyze data externally

**JSON Export**:
```javascript
const exportToJSON = (games) => {
  const data = games.map(game => ({
    home: game.home,
    away: game.away,
    homeRank: game.homeRank,
    awayRank: game.awayRank,
    odds: game.odds
  }));
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { 
    type: 'application/json' 
  });
  downloadFile(blob, `games-${Date.now()}.json`);
};
```

**CSV Export**:
```javascript
const exportToCSV = (games) => {
  const headers = ['Home Team', 'Away Team', 'Home Rank', 'Away Rank', 'Odds'];
  const rows = games.map(game => [
    game.home,
    game.away,
    game.homeRank,
    game.awayRank,
    game.odds
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  downloadFile(blob, `games-${Date.now()}.csv`);
};
```

### 5. Interactive Charts

**Concept**: Visual data representation using Recharts

**Radar Chart** (Performance Across Categories):
```jsx
<RadarChart data={radarData}>
  <PolarGrid />
  <PolarAngleAxis dataKey="category" />
  <PolarRadiusAxis domain={[0, 100]} />
  <Radar 
    dataKey="homeTeam" 
    stroke="#8b5cf6" 
    fill="#8b5cf6" 
    fillOpacity={0.5} 
  />
  <Radar 
    dataKey="awayTeam" 
    stroke="#3b82f6" 
    fill="#3b82f6" 
    fillOpacity={0.5} 
  />
  <Legend />
</RadarChart>
```

**Line Chart** (Trend Over Time):
```jsx
<LineChart data={formData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="game" />
  <YAxis domain={[0, 100]} />
  <Line 
    type="monotone" 
    dataKey="homeTeam" 
    stroke="#8b5cf6" 
    strokeWidth={3} 
  />
  <Line 
    type="monotone" 
    dataKey="awayTeam" 
    stroke="#3b82f6" 
    strokeWidth={3} 
  />
</LineChart>
```

---

## Styling Philosophy

### Tailwind CSS Approach

**Utility-First Benefits**:
- No CSS file management
- Consistent spacing/colors
- Responsive by default
- Easy dark mode

**Component Patterns**:

```jsx
// Card pattern
<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
  {content}
</div>

// Button pattern
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all">
  Click Me
</button>

// Gradient pattern
<div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
  {content}
</div>
```

### Dark Mode Implementation

**Setup** (tailwind.config.js):
```javascript
module.exports = {
  darkMode: 'class',  // Class-based dark mode
  // ...
};
```

**Usage**:
```jsx
// Root element gets 'dark' class
<html className={darkMode ? 'dark' : ''}>

// Components use dark: prefix
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  Content adapts to theme
</div>
```

**Toggle Implementation**:
```jsx
const [darkMode, setDarkMode] = useState(() => {
  const saved = localStorage.getItem('darkMode');
  return saved === 'true';
});

useEffect(() => {
  localStorage.setItem('darkMode', darkMode);
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [darkMode]);
```

### Animation Patterns

**Framer Motion Patterns**:

```jsx
// Fade in on mount
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  {content}
</motion.div>

// Slide in from side
<motion.div
  initial={{ x: -100, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ type: "spring" }}
>
  {content}
</motion.div>

// Hover scale
<motion.div whileHover={{ scale: 1.05 }}>
  {content}
</motion.div>

// Stagger children
<motion.div variants={containerVariants}>
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

### Responsive Design

**Breakpoint Strategy**:
```jsx
// Mobile first
<div className="
  text-sm          /* mobile */
  md:text-base     /* tablet+ */
  lg:text-lg       /* desktop+ */
">

// Grid that adapts
<div className="
  grid 
  grid-cols-1      /* mobile: 1 column */
  md:grid-cols-2   /* tablet: 2 columns */
  lg:grid-cols-4   /* desktop: 4 columns */
  gap-4
">
```

---

## State Management

### Local Component State

**Use for**: UI-only state that doesn't need sharing

```jsx
const [isExpanded, setIsExpanded] = useState(false);
const [hoveredItem, setHoveredItem] = useState(null);
```

### Lifted State

**Use for**: State shared between siblings

```jsx
const Parent = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  
  return (
    <>
      <GameList onSelect={setSelectedGame} />
      <GameDetails game={selectedGame} />
    </>
  );
};
```

### Persistent State (localStorage)

**Use for**: User preferences that should persist

```jsx
const [favorites, setFavorites] = useState(() => {
  const saved = localStorage.getItem('favorites');
  return saved ? JSON.parse(saved) : [];
});

useEffect(() => {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}, [favorites]);
```

### Computed State (useMemo)

**Use for**: Expensive calculations that should be cached

```jsx
const filteredAndSorted = useMemo(() => {
  return games
    .filter(game => meetsFilters(game, filters))
    .sort((a, b) => a.time - b.time);
}, [games, filters]);
```

### Performance Optimization

**React.memo** for expensive components:
```jsx
const ExpensiveComponent = React.memo(({ data }) => {
  // Heavy rendering
}, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  return prevProps.data.id === nextProps.data.id;
});
```

**useCallback** for stable function references:
```jsx
const handleClick = useCallback((id) => {
  setSelected(id);
}, []);  // Stable across renders
```

---

## Adapting to Other Sports

### Step-by-Step Adaptation Guide

#### 1. **Data Structure Mapping**

**Basketball → Football Example**:

```javascript
// Basketball
{
  net: 15,
  quadGames: { "1": {...}, "2": {...} }
}

// Football Equivalent
{
  powerRanking: 8,
  divisionGames: { 
    "division": {...}, 
    "conference": {...},
    "nonConference": {...}
  }
}
```

#### 2. **Component Renaming**

```bash
# Basketball
EnhancedGameCard.jsx
WinProbability.jsx
QuadSection.jsx

# Football
EnhancedMatchupCard.jsx
GamePrediction.jsx
RecordSection.jsx
```

#### 3. **Metric Adjustments**

**Basketball Win Probability Factors**:
- Ranking: 40%
- Home court: 10%
- Recent form: 20%
- Overall record: 15%
- Odds: 15%

**Football Win Probability Factors**:
- Power ranking: 35%
- Home field: 15%
- Recent form: 20%
- Turnover differential: 10%
- Overall record: 10%
- Odds: 10%

#### 4. **Sport-Specific Features**

**Basketball**:
- Quad records (opponent quality)
- NET/KenPom rankings
- Point spreads
- Over/under totals

**Football**:
- Division standings
- Strength of schedule
- Point spreads
- Over/under totals
- Player props

**Soccer**:
- League tables
- Goal differential
- Draw odds
- Both teams to score
- Correct score

**Baseball**:
- Pitcher ERA
- Batting averages
- Run lines
- Over/under runs
- First 5 innings

#### 5. **Visual Adjustments**

```jsx
// Basketball colors
const teamColors = {
  home: 'from-purple-500 to-purple-600',
  away: 'from-blue-500 to-blue-600'
};

// Football colors
const teamColors = {
  home: 'from-green-600 to-green-700',
  away: 'from-red-600 to-red-700'
};
```

### Universal Components (No Changes Needed)

These components work across all sports:
- Dark mode toggle
- Search functionality
- Export features
- Advanced filters (adjust criteria)
- Favorites system
- Chart components (Recharts)

### Sport-Specific Components (Need Adaptation)

```
Basketball Specific:
- QuadSection.jsx → [Sport]RecordSection.jsx
- homeAdvantageRanks.js → [Sport]AdvantageCalc.js

Football Specific:
- DivisionStandings.jsx
- PlayoffScenarios.jsx
- InjuryReport.jsx

Soccer Specific:
- LeagueTable.jsx
- FormGuide.jsx
- HeadToHead.jsx
```

---

## Setup & Development

### Prerequisites

```bash
node >= 18.0.0
npm or yarn
```

### Installation

```bash
# Clone repository
git clone [your-repo-url]
cd sports-analytics

# Install dependencies
npm install

# Start development server
npm run dev
```

### Project Structure Setup

```bash
# Create new sport adaptation
mkdir src/components/[sport]

# Copy and adapt templates
cp src/components/CBBreport.jsx src/components/[sport]/Report.jsx
cp src/components/EnhancedGameCard.jsx src/components/[sport]/GameCard.jsx
```

### Environment Variables

```bash
# .env
VITE_DATA_SOURCE=https://api.example.com/games
VITE_API_KEY=your_api_key_here
```

### Development Workflow

1. **Data First**: Get sample data in correct format
2. **Layout**: Create page structure with placeholders
3. **Components**: Build feature components one at a time
4. **Styling**: Add Tailwind classes for appearance
5. **Interactions**: Add state management and events
6. **Animations**: Enhance with Framer Motion
7. **Testing**: Test on different devices/browsers
8. **Optimization**: Add useMemo, React.memo where needed

### Testing Checklist

```
□ All pages load without errors
□ Data displays correctly
□ Filters work and persist
□ Search finds relevant results
□ Favorites can be added/removed
□ Export generates correct files
□ Charts render properly
□ Dark mode toggles correctly
□ Responsive on mobile/tablet/desktop
□ Animations are smooth
□ No console errors
□ Fast page load times
```

---

## Deployment

### Build Process

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**vercel.json**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Environment Configuration

**Production**:
```bash
# .env.production
VITE_DATA_SOURCE=https://api.production.com/games
VITE_API_KEY=prod_key
```

**Development**:
```bash
# .env.development
VITE_DATA_SOURCE=http://localhost:3000/games
VITE_API_KEY=dev_key
```

---

## Advanced Concepts

### Performance Optimization

**Code Splitting**:
```javascript
const Analytics = lazy(() => import('./components/Analytics'));

<Suspense fallback={<Loading />}>
  <Analytics />
</Suspense>
```

**Image Optimization**:
```jsx
<img 
  src={imageSrc} 
  loading="lazy" 
  alt="Description"
/>
```

**Bundle Analysis**:
```bash
npm run build -- --mode analyze
```

### Accessibility

**Keyboard Navigation**:
```jsx
<button
  onClick={handleClick}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
  tabIndex={0}
  aria-label="Descriptive label"
>
```

**Screen Reader Support**:
```jsx
<div role="region" aria-label="Game statistics">
  <h2 id="stats-heading">Statistics</h2>
  <div aria-labelledby="stats-heading">
    {stats}
  </div>
</div>
```

### SEO Optimization

**Meta Tags** (index.html):
```html
<meta name="description" content="Professional sports analytics dashboard">
<meta property="og:title" content="Sports Analytics">
<meta property="og:description" content="...">
<meta property="og:image" content="/preview.jpg">
```

**Structured Data**:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  "name": "Team A vs Team B",
  "startDate": "2024-01-15T19:00:00Z"
}
</script>
```

---

## Troubleshooting

### Common Issues

**Blank Screen**:
- Check console for errors
- Verify data structure matches expected format
- Ensure all components are properly imported

**Slow Performance**:
- Add React.memo to expensive components
- Use useMemo for heavy calculations
- Implement virtual scrolling for long lists

**Styling Issues**:
- Clear Tailwind cache: `npx tailwindcss --purge`
- Check dark mode class on html element
- Verify Tailwind config includes all content files

**Data Not Loading**:
- Check network tab in DevTools
- Verify API endpoint is correct
- Check CORS settings
- Ensure data format is valid JSON

---

## Best Practices

### Code Organization

```javascript
// ✅ Good: Organized, readable
const GameCard = ({ game }) => {
  // 1. Hooks
  const [expanded, setExpanded] = useState(false);
  
  // 2. Derived values
  const isUpset = game.homeRank > game.awayRank + 30;
  
  // 3. Event handlers
  const handleExpand = () => setExpanded(!expanded);
  
  // 4. Render
  return (/* JSX */);
};

// ❌ Bad: Disorganized
const GameCard = ({ game }) => {
  const handleExpand = () => setExpanded(!expanded);
  const isUpset = game.homeRank > game.awayRank + 30;
  const [expanded, setExpanded] = useState(false);
  return (/* JSX */);
};
```

### Component Design

```javascript
// ✅ Good: Single responsibility
const StatCard = ({ label, value }) => (/* UI */);
const StatSection = ({ stats }) => stats.map(s => <StatCard {...s} />);

// ❌ Bad: Too much responsibility
const StatsEverything = ({ data, filters, onFilter }) => {
  // Filtering logic
  // Display logic
  // Event handling
  // All in one component
};
```

### State Management

```javascript
// ✅ Good: Minimal state
const [games] = useState(initialGames);
const filtered = useMemo(() => filterGames(games, filters), [games, filters]);

// ❌ Bad: Duplicate state
const [games] = useState(initialGames);
const [filteredGames, setFilteredGames] = useState([]);
useEffect(() => {
  setFilteredGames(filterGames(games, filters));
}, [games, filters]);
```

---

## Resources

### Documentation

- **React**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Framer Motion**: https://www.framer.com/motion
- **Recharts**: https://recharts.org
- **Vite**: https://vitejs.dev

### Learning Path

1. **Week 1**: React fundamentals, component basics
2. **Week 2**: State management, hooks
3. **Week 3**: Styling with Tailwind
4. **Week 4**: Animations with Framer Motion
5. **Week 5**: Charts with Recharts
6. **Week 6**: Build complete feature
7. **Week 7**: Optimize and deploy

### Community

- **GitHub**: Star and fork this repo
- **Discord**: Join sports analytics developers
- **Twitter**: Follow #SportsAnalytics

---

## Conclusion

This blueprint provides everything needed to build a professional sports analytics dashboard for any sport. The architecture is:

✅ **Modular**: Easy to add/remove features
✅ **Scalable**: Handles large datasets efficiently  
✅ **Maintainable**: Clear code organization
✅ **Beautiful**: Modern, animated UI
✅ **Performant**: Optimized rendering
✅ **Responsive**: Works on all devices
✅ **Extensible**: Easy to adapt to new sports

### Next Steps

1. **Clone and Run**: Get the project running locally
2. **Explore**: Examine each component to understand patterns
3. **Customize**: Adapt for your specific sport
4. **Enhance**: Add your own unique features
5. **Deploy**: Launch your analytics platform
6. **Iterate**: Continuously improve based on user feedback

### Support

Found this helpful? Consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 🔀 Contributing improvements

---

**Built with ❤️ for sports analytics enthusiasts**

*Remember: Great analytics platforms start with great data and intuitive design. Focus on providing value to users, and the rest will follow.*
