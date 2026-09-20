import React, { useState } from 'react';
import { Sparkles, Zap, Award, Star, Flame } from 'lucide-react';
import { ChessGame } from '../../types';
import { GameCard } from '../GameCard';

interface BrilliantMovesViewProps {
  games: ChessGame[];
  onOpenGame: (game: ChessGame) => void;
  onShare: (game: ChessGame) => void;
  onEmbed: (game: ChessGame) => void;
}

export const BrilliantMovesView: React.FC<BrilliantMovesViewProps> = ({
  games,
  onOpenGame,
  onShare,
  onEmbed,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'brilliant' | 'great'>('all');

  const totalBrilliantMoves = games.reduce((acc, g) => acc + (g.analysis?.brilliantMovesCount || 0), 0);
  const totalGreatMoves = games.reduce((acc, g) => acc + (g.analysis?.greatMovesCount || 0), 0);

  const filteredGames = games.filter((g) => {
    const brilliantCount = g.analysis?.brilliantMovesCount || 0;
    const greatCount = g.analysis?.greatMovesCount || 0;
    const isBrilliantClass = g.analysis?.classification === 'brilliant';
    const isTacticalClass = g.analysis?.classification === 'tactical_battle';

    if (filterMode === 'brilliant') {
      return brilliantCount > 0 || isBrilliantClass;
    }
    if (filterMode === 'great') {
      return greatCount > 0 || isTacticalClass;
    }
    return brilliantCount > 0 || greatCount > 0 || isBrilliantClass || isTacticalClass;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-300" />
              Engine Tactical Intelligence Showcase
            </h3>
            <p className="text-xs text-slate-400">
              High-impact engine classifications flagging tactical sacrifices, critical swing moves, and game-changing combinations.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="bg-cyan-950/80 border border-cyan-500/40 px-3.5 py-2 rounded-xl flex items-center gap-2 text-cyan-300 font-bold">
              <span>✦ Brilliant:</span>
              <span className="text-sm">{totalBrilliantMoves}</span>
            </div>

            <div className="bg-blue-950/80 border border-blue-500/40 px-3.5 py-2 rounded-xl flex items-center gap-2 text-blue-300 font-bold">
              <span>⭐ Great:</span>
              <span className="text-sm">{totalGreatMoves}</span>
            </div>
          </div>
        </div>

        {/* Filter Toggles */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all flex items-center gap-1.5 ${
              filterMode === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            All Highlights ({filteredGames.length})
          </button>

          <button
            onClick={() => setFilterMode('brilliant')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all flex items-center gap-1.5 ${
              filterMode === 'brilliant'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'bg-slate-950 text-cyan-300 hover:bg-slate-800 border border-cyan-500/30'
            }`}
          >
            <span>✦</span>
            Brilliant Candidates Only
          </button>

          <button
            onClick={() => setFilterMode('great')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all flex items-center gap-1.5 ${
              filterMode === 'great'
                ? 'bg-blue-500 text-slate-950 font-bold shadow'
                : 'bg-slate-950 text-blue-300 hover:bg-slate-800 border border-blue-500/30'
            }`}
          >
            <span>⭐</span>
            Great Moves Only
          </button>
        </div>
      </div>

      {filteredGames.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center space-y-2">
          <p className="text-slate-200 font-semibold text-sm">
            No games match the selected tactical filter ({filterMode}).
          </p>
          <p className="text-xs text-slate-500 font-mono">
            Candidate moves require tactical sacrifices or high positional evaluation swings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onOpenGame={onOpenGame}
              onShare={onShare}
              onEmbed={onEmbed}
            />
          ))}
        </div>
      )}
    </div>
  );
};
