import React, { useState } from 'react';
import { ChessGame, GameFilterState, PlayerProfile } from '../../types';
import { GameCard } from '../GameCard';
import { GameFilters } from '../GameFilters';

interface GamesViewProps {
  games: ChessGame[];
  profile: PlayerProfile | null;
  onOpenGame: (game: ChessGame) => void;
  onShare: (game: ChessGame) => void;
  onEmbed: (game: ChessGame) => void;
}

export const GamesView: React.FC<GamesViewProps> = ({
  games,
  profile,
  onOpenGame,
  onShare,
  onEmbed,
}) => {
  const [filters, setFilters] = useState<GameFilterState>({
    searchQuery: '',
    result: 'all',
    color: 'all',
    timeClass: 'all',
    timeClasses: [],
    classification: 'all',
    opening: 'all',
    minRating: 0,
    maxRating: 3500,
    sortBy: 'date_desc',
  });

  const availableOpenings = Array.from(
    new Set(games.map((g) => g.openingName || g.eco || '').filter(Boolean))
  );

  // Filter games strictly
  const targetLower = profile?.username.toLowerCase() || '';

  const filteredGames = games.filter((game) => {
    // Search query filter (opponent, move, opening, year)
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const oppName =
        game.white.username.toLowerCase() === targetLower
          ? game.black.username.toLowerCase()
          : game.white.username.toLowerCase();
      const opName = (game.openingName || game.eco || '').toLowerCase();
      const moves = game.moveList.join(' ').toLowerCase();

      if (!oppName.includes(q) && !opName.includes(q) && !moves.includes(q) && !q.includes(game.timeClass)) {
        return false;
      }
    }

    // Result Filter
    if (filters.result !== 'all') {
      const isWhite = game.white.username.toLowerCase() === targetLower;
      const playerResult = isWhite ? game.white.result : game.black.result;
      const oppResult = isWhite ? game.black.result : game.white.result;

      if (filters.result === 'win' && playerResult !== 'win') return false;
      if (filters.result === 'loss' && oppResult !== 'win') return false;
      if (filters.result === 'draw' && (playerResult === 'win' || oppResult === 'win')) return false;
    }

    // Multi-Select Time Control Filter (Rapid, Blitz, Bullet, Daily)
    if (filters.timeClasses && filters.timeClasses.length > 0) {
      if (!filters.timeClasses.includes(game.timeClass)) {
        return false;
      }
    } else if (filters.timeClass !== 'all' && game.timeClass !== filters.timeClass) {
      return false;
    }

    // Classification Filter
    if (filters.classification !== 'all' && game.analysis?.classification !== filters.classification) {
      return false;
    }

    return true;
  });

  // Sorting
  filteredGames.sort((a, b) => {
    if (filters.sortBy === 'accuracy_desc') {
      return (b.analysis?.accuracyEstimate || 0) - (a.analysis?.accuracyEstimate || 0);
    }
    if (filters.sortBy === 'brilliant_desc') {
      return (b.analysis?.brilliantMovesCount || 0) - (a.analysis?.brilliantMovesCount || 0);
    }
    if (filters.sortBy === 'rating_desc') {
      const oppA = a.white.username.toLowerCase() === targetLower ? a.black.rating || 0 : a.white.rating || 0;
      const oppB = b.white.username.toLowerCase() === targetLower ? b.black.rating || 0 : b.white.rating || 0;
      return oppB - oppA;
    }
    return (b.endTime || 0) - (a.endTime || 0);
  });

  return (
    <div className="space-y-6">
      <GameFilters
        filters={filters}
        onChangeFilters={setFilters}
        availableOpenings={availableOpenings}
      />

      <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-2">
        <span>Showing {filteredGames.length} of {games.length} analyzed games</span>
      </div>

      {filteredGames.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center space-y-2">
          <p className="text-slate-200 font-semibold text-sm">No games available for this search filter.</p>
          <p className="text-xs text-slate-500 font-mono">Try adjusting search parameters or selecting another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              targetUsername={profile?.username}
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
