import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { GameFilterState, GameClassification } from '../types';

interface GameFiltersProps {
  filters: GameFilterState;
  onChangeFilters: (newFilters: GameFilterState) => void;
  availableOpenings: string[];
}

export const GameFilters: React.FC<GameFiltersProps> = ({
  filters,
  onChangeFilters,
  availableOpenings,
}) => {
  const handleReset = () => {
    onChangeFilters({
      searchQuery: '',
      result: 'all',
      color: 'all',
      timeClass: 'all',
      classification: 'all',
      opening: 'all',
      minRating: 0,
      maxRating: 3500,
      sortBy: 'date_desc',
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-6 space-y-4 shadow-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Global Search Bar (Requirement #15) */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChangeFilters({ ...filters, searchQuery: e.target.value })}
            placeholder="Search games, opponents, openings, moves..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all font-mono"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Result Filter */}
          <select
            value={filters.result}
            onChange={(e) => onChangeFilters({ ...filters, result: e.target.value as any })}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-amber-500"
          >
            <option value="all">Result: All</option>
            <option value="win">Result: Wins</option>
            <option value="loss">Result: Losses</option>
            <option value="draw">Result: Draws</option>
          </select>

          {/* Time Control Filter */}
          <select
            value={filters.timeClass}
            onChange={(e) => onChangeFilters({ ...filters, timeClass: e.target.value as any })}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-amber-500"
          >
            <option value="all">Time Control: All</option>
            <option value="bullet">Bullet</option>
            <option value="blitz">Blitz</option>
            <option value="rapid">Rapid</option>
            <option value="daily">Daily</option>
          </select>

          {/* Classification Filter */}
          <select
            value={filters.classification}
            onChange={(e) => onChangeFilters({ ...filters, classification: e.target.value as any })}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-amber-500"
          >
            <option value="all">Classification: All</option>
            <option value="brilliant">Brilliant Games</option>
            <option value="best_performance">Best Performance</option>
            <option value="tactical_battle">Tactical Battle</option>
            <option value="comeback">Comeback</option>
            <option value="endgame">Endgame</option>
            <option value="opening_masterclass">Opening Masterclass</option>
            <option value="mistake_review">Review Games</option>
            <option value="close_battle">Close Battle</option>
            <option value="longest_battle">Longest Battle</option>
          </select>

          {/* Sort By */}
          <select
            value={filters.sortBy}
            onChange={(e) => onChangeFilters({ ...filters, sortBy: e.target.value as any })}
            className="bg-slate-950 border border-slate-800 text-amber-400 font-semibold text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-amber-500"
          >
            <option value="date_desc">Sort: Latest First</option>
            <option value="rating_desc">Sort: Highest Rating Opponent</option>
            <option value="accuracy_desc">Sort: Highest Accuracy</option>
            <option value="brilliant_desc">Sort: Most Brilliant Moves</option>
          </select>

          <button
            onClick={handleReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-700 transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
