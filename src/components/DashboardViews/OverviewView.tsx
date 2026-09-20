import React from 'react';
import {
  Trophy,
  Swords,
  Sparkles,
  BarChart3,
  Clock,
  Award,
  Zap,
  TrendingUp,
  FileCode,
} from 'lucide-react';
import { ChessGame, PlayerReport, PlayerProfile } from '../../types';
import { GameCard } from '../GameCard';
import { RatingProgressionChart } from '../RatingProgressionChart';
import { ProfileStreakCardGenerator } from '../ProfileStreakCardGenerator';

interface OverviewViewProps {
  games: ChessGame[];
  report: PlayerReport | null;
  profile: PlayerProfile | null;
  onOpenGame: (game: ChessGame) => void;
  onShare: (game: ChessGame) => void;
  onEmbed: (game: ChessGame) => void;
  onOpenReport: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  games,
  report,
  profile,
  onOpenGame,
  onShare,
  onEmbed,
  onOpenReport,
}) => {
  const brilliantGames = games.filter(
    (g) => g.analysis?.classification === 'brilliant' || (g.analysis?.brilliantMovesCount || 0) > 0
  );

  const greatGames = games.filter(
    (g) => (g.analysis?.greatMovesCount || 0) > 0
  );

  const topGames = games.slice(0, 6);

  return (
    <div className="space-y-8">
      {!profile && games.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3 shadow-xl">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto">
            <Swords className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-100">Ready for Profile Intelligence Analysis</h3>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Type any Chess.com username into the search bar above (e.g., <span className="text-amber-400 font-mono font-bold">Hikaru</span>, <span className="text-amber-400 font-mono font-bold">MagnusCarlsen</span>, <span className="text-amber-400 font-mono font-bold">DanielNaroditsky</span>) and click <span className="text-slate-200 font-bold">Analyze Profile</span> to generate live rating charts, tactical reports, and custom GitHub cards.
          </p>
        </div>
      )}

      {/* Top Intelligence Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Analyzed Games */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-1">
          <span className="text-xs text-slate-400 font-medium">Games Analyzed</span>
          <div className="text-2xl lg:text-3xl font-mono font-extrabold text-slate-100">
            {games.length.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">Real PubAPI Archive Data</span>
        </div>

        {/* Win Rate */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-1">
          <span className="text-xs text-slate-400 font-medium">Win Rate</span>
          <div className="text-2xl lg:text-3xl font-mono font-extrabold text-emerald-400">
            {report ? `${report.winRate}%` : '0%'}
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">
            {report ? `${report.wins}W / ${report.losses}L / ${report.draws}D` : 'Calculated'}
          </span>
        </div>

        {/* Engine Brilliant Candidate Moves */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-1">
          <span className="text-xs text-slate-400 font-medium">Brilliant Games</span>
          <div className="text-2xl lg:text-3xl font-mono font-extrabold text-cyan-300 flex items-center gap-2">
            <span>✦ {brilliantGames.length}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">Engine Tactical Sacrifices</span>
        </div>

        {/* Average Opponent Rating */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-1">
          <span className="text-xs text-slate-400 font-medium font-sans">Avg Opponent Rating</span>
          <div className="text-2xl lg:text-3xl font-mono font-extrabold text-amber-400">
            {report && report.avgRating > 0 ? report.avgRating : 'Not available'}
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">
            Max faced: {report?.highestOpponentRating || 'N/A'}
          </span>
        </div>
      </div>

      {/* Rating Progression Line Chart Component */}
      <RatingProgressionChart games={games} profile={profile} />

      {/* GitHub Profile Streak & Rating Card Customizer */}
      <ProfileStreakCardGenerator
        profile={profile}
        winRate={report?.winRate || 62}
        totalGames={games.length}
        brilliantCount={brilliantGames.length}
        greatCount={greatGames.length}
      />

      {/* Report Summary Banner */}
      {report && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 justify-center md:justify-start">
              <Award className="w-5 h-5 text-amber-400" />
              Full Player Intelligence Report Ready
            </h3>
            <p className="text-xs text-slate-300">
              Generated opening win rates, tactical sacrifice breakdown, and Markdown export.
            </p>
          </div>

          <button
            onClick={onOpenReport}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all shrink-0"
          >
            Open Player Report
          </button>
        </div>
      )}

      {/* Top Analyzed Games */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Featured & Highlighted Games
          </h3>
          <span className="text-xs text-slate-400 font-mono">Real PGN Data</span>
        </div>

        {games.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs font-mono">
            No games available for this profile or filter selection.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topGames.map((game) => (
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
    </div>
  );
};
