import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, TrendingUp, Target, Percent, Calendar, AlertTriangle,
  Activity, BarChart2, Zap, Shield, Users, Crosshair
} from 'lucide-react';

const FilterSection = ({ title, icon: Icon, children, active }) => {
  // Add a dynamic background or border when active
  const baseClass = "space-y-3 p-4 rounded-lg transition-colors duration-200";
  const activeClass = active
    ? "bg-green-50 border-l-4 border-green-500"
    : "bg-gray-50";

  return (
    <div className={`${baseClass} ${activeClass}`}>
      <h3 className="font-semibold text-gray-700 flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {title}
      </h3>
      {children}
    </div>
  );
};


const RangeInput = ({ label, value, onChange, min, max, step = 1, placeholder }) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <input 
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full mt-1 px-3 py-2 border rounded-lg"
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
    />
  </div>
);

const ToggleButton = ({ label, active, onChange }) => (
  <button
    onClick={() => onChange(!active)}
    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-left
      ${active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
  >
    {label}
  </button>
);

const AdvancedFilters = ({ isOpen, onClose, filters, onFiltersChange, useKenPom }) => {
  const rankingLabel = useKenPom ? 'KenPom' : 'NET';
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-30"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed right-4 top-24 w-[520px] bg-white rounded-xl shadow-xl z-40 p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Advanced Filters</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Odds & Spreads */}
              <FilterSection title="Odds & Spreads" icon={TrendingUp}>
                <div className="grid grid-cols-2 gap-3">
                  <RangeInput
                    label="Min Odds"
                    value={filters.minOdds}
                    onChange={(value) => onFiltersChange({...filters, minOdds: value})}
                    min={-1000}
                    max={1000}
                    placeholder="-400"
                  />
                  <RangeInput
                    label="Max Odds"
                    value={filters.maxOdds}
                    onChange={(value) => onFiltersChange({...filters, maxOdds: value})}
                    min={-1000}
                    max={1000}
                    placeholder="+400"
                  />
                </div>
                <div className="mt-3">
                  <label className="text-sm text-gray-600 block mb-2">Max Absolute Spread</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="0.5"
                      value={filters.maxSpread}
                      onChange={(e) => onFiltersChange({...filters, maxSpread: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                    <span className="text-sm font-medium w-12">{filters.maxSpread}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Will show games with spreads between -{filters.maxSpread} and +{filters.maxSpread}
                  </p>
                </div>
              </FilterSection>

              {/* Rankings & Metrics */}
              <FilterSection title="Rankings & Metrics" icon={Target}>
                <div className="grid grid-cols-2 gap-4">
                  <RangeInput
                    label={`Min ${rankingLabel} Rank`}
                    value={filters.minNET}
                    onChange={(value) => onFiltersChange({...filters, minNET: value})}
                    min={1}
                    max={358}
                    placeholder="1"
                  />
                  <RangeInput
                    label={`Max ${rankingLabel} Rank`}
                    value={filters.maxNET}
                    onChange={(value) => onFiltersChange({...filters, maxNET: value})}
                    min={1}
                    max={358}
                    placeholder="358"
                  />
                  <RangeInput
                    label="Min Offensive Efficiency"
                    value={filters.minOffEff}
                    onChange={(value) => onFiltersChange({...filters, minOffEff: value})}
                    min={0}
                    max={150}
                    step={0.1}
                    placeholder="100"
                  />
                </div>
              </FilterSection>

              {/* Performance Trends */}
              <FilterSection 
                  title="Performance Trends"
                  icon={Activity}
                  active={
                    filters.recentFormChange ||
                    filters.netChanges ||
                    filters.highVariance
                  }
                >
                  <div className="space-y-2">
                    <ToggleButton
                      label="Recent Form Changes"
                      active={filters.recentFormChange}
                      onChange={(value) => onFiltersChange({...filters, recentFormChange: value})}
                    />
                    <ToggleButton
                      label="Significant NET Ranking Changes"
                      active={filters.netChanges}
                      onChange={(value) => onFiltersChange({...filters, netChanges: value})}
                    />
                    <ToggleButton
                      label="High Variance Teams (3pt Dependent)"
                      active={filters.highVariance}
                      onChange={(value) => onFiltersChange({...filters, highVariance: value})}
                    />
                  </div>
              </FilterSection>

              {/* Situational Factors */}
              <FilterSection 
                title="Situational Factors"
                icon={Crosshair}
                active={
                  filters.overvaluedHome ||
                  filters.valueAwayTeams ||
                  filters.rivalryGames ||
                  filters.conferenceOnly ||
                  filters.betterTeamUnderdog
                }>
                <div className="space-y-2">
                  <ToggleButton
                    label="Overvalued Home Favorites"
                    active={filters.overvaluedHome}
                    onChange={(value) => onFiltersChange({...filters, overvaluedHome: value})}
                  />
                  <ToggleButton
                    label="Strong Away Teams with Value"
                    active={filters.valueAwayTeams}
                    onChange={(value) => onFiltersChange({...filters, valueAwayTeams: value})}
                  />
                  <ToggleButton
                    label="Rivalry Games"
                    active={filters.rivalryGames}
                    onChange={(value) => onFiltersChange({...filters, rivalryGames: value})}
                  />
                  <ToggleButton
                    label="Conference Games Only"
                    active={filters.conferenceOnly}
                    onChange={(value) => onFiltersChange({...filters, conferenceOnly: value})}
                  />
                  <ToggleButton
                    label={`Better Team (${rankingLabel}) as Underdog`}
                    active={filters.betterTeamUnderdog}
                    onChange={(value) => onFiltersChange({...filters, betterTeamUnderdog: value})}
                  />
                </div>
              </FilterSection>

              {/* Team Status */}
              <FilterSection title="Team Status" icon={AlertTriangle}>
                <div className="space-y-2">
                  <ToggleButton
                    label="Games with Significant Injuries"
                    active={filters.hasInjuries}
                    onChange={(value) => onFiltersChange({...filters, hasInjuries: value})}
                  />
                  <ToggleButton
                    label="Full Strength Teams Only"
                    active={filters.fullStrength}
                    onChange={(value) => onFiltersChange({...filters, fullStrength: value})}
                  />
                </div>
              </FilterSection>

              {/* Statistical Thresholds */}
              <FilterSection 
                title="Statistical Thresholds" 
                icon={BarChart2}
                active={filters.winPercentageDiff}
              >
                <div className="space-y-2">
                  <RangeInput
                    label="Min 3PT %"
                    value={filters.min3ptPercent}
                    onChange={(value) => onFiltersChange({...filters, min3ptPercent: value})}
                    min={0}
                    max={100}
                    step={0.1}
                    placeholder="35"
                  />
                  <RangeInput
                    label="Min 3PT Attempts"
                    value={filters.min3ptAttempts}
                    onChange={(value) => onFiltersChange({...filters, min3ptAttempts: value})}
                    min={0}
                    max={50}
                    placeholder="20"
                  />
                  <ToggleButton
                    label="30%+ Win Percentage Difference"
                    active={filters.winPercentageDiff}
                    onChange={(value) => onFiltersChange({...filters, winPercentageDiff: value})}
                  />
                </div>
              </FilterSection>
            </div>

            {/* Active Filters Count */}
            <div className="mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                {Object.values(filters).filter(v => v !== false && v !== null && v !== undefined).length} active filters
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => onFiltersChange({
                minOdds: -400,
                maxOdds: 400,
                maxSpread: 25,
                minNET: 1,
                maxNET: 358,
                minKenPom: 1,
                minOffEff: 100,
                min3ptPercent: 35,
                min3ptAttempts: 20,
                recentFormChange: false,
                highVariance: false,
                netChanges: false,
                overvaluedHome: false,
                valueAwayTeams: false,
                rivalryGames: false,
                conferenceOnly: false,
                hasInjuries: false,
                fullStrength: false,
                winPercentageDiff: false
              })}
              className="w-full mt-2 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Reset All Filters
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdvancedFilters;
