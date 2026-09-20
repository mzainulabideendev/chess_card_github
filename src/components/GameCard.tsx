import React, { useState } from 'react';
import {
  Sparkles,
  Trophy,
  Zap,
  TrendingUp,
  Shield,
  BookOpen,
  AlertTriangle,
  Swords,
  Clock,
  Share2,
  Code,
  ExternalLink,
  ChevronRight,
  FileText,
  X,
  Copy,
  Check,
  Download,
  Eye,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { ChessGame, GameClassification } from '../types';
import { generateGameMarkdown } from './PlayerReportModal';

interface GameCardProps {
  game: ChessGame;
  targetUsername?: string;
  onOpenGame: (game: ChessGame) => void;
  onShare: (game: ChessGame) => void;
  onEmbed: (game: ChessGame) => void;
}

interface CardBadgeConfig {
  title: string;
  icon: React.ReactNode;
  bgGradient: string;
  borderColor: string;
  textColor: string;
}

const BADGE_CONFIGS: Record<GameClassification, CardBadgeConfig> = {
  brilliant: {
    title: 'BRILLIANT GAME',
    icon: <Sparkles className="w-4 h-4 text-cyan-300" />,
    bgGradient: 'from-cyan-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-cyan-500/40 hover:border-cyan-400',
    textColor: 'text-cyan-300',
  },
  best_performance: {
    title: 'BEST PERFORMANCE',
    icon: <Trophy className="w-4 h-4 text-amber-300" />,
    bgGradient: 'from-amber-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    textColor: 'text-amber-300',
  },
  tactical_battle: {
    title: 'TACTICAL BATTLE',
    icon: <Zap className="w-4 h-4 text-yellow-300" />,
    bgGradient: 'from-yellow-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-yellow-500/40 hover:border-yellow-400',
    textColor: 'text-yellow-300',
  },
  comeback: {
    title: 'COMEBACK VICTORY',
    icon: <TrendingUp className="w-4 h-4 text-emerald-300" />,
    bgGradient: 'from-emerald-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    textColor: 'text-emerald-300',
  },
  endgame: {
    title: 'ENDGAME TECHNIQUE',
    icon: <Shield className="w-4 h-4 text-indigo-300" />,
    bgGradient: 'from-indigo-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-indigo-500/40 hover:border-indigo-400',
    textColor: 'text-indigo-300',
  },
  opening_masterclass: {
    title: 'OPENING MASTERCLASS',
    icon: <BookOpen className="w-4 h-4 text-blue-300" />,
    bgGradient: 'from-blue-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-blue-500/40 hover:border-blue-400',
    textColor: 'text-blue-300',
  },
  mistake_review: {
    title: 'REVIEW THIS GAME',
    icon: <AlertTriangle className="w-4 h-4 text-rose-300" />,
    bgGradient: 'from-rose-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-rose-500/40 hover:border-rose-400',
    textColor: 'text-rose-300',
  },
  close_battle: {
    title: 'CLOSE BATTLE',
    icon: <Swords className="w-4 h-4 text-purple-300" />,
    bgGradient: 'from-purple-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-purple-500/40 hover:border-purple-400',
    textColor: 'text-purple-300',
  },
  longest_battle: {
    title: 'LONGEST BATTLE',
    icon: <Clock className="w-4 h-4 text-sky-300" />,
    bgGradient: 'from-sky-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-sky-500/40 hover:border-sky-400',
    textColor: 'text-sky-300',
  },
  normal: {
    title: 'STANDARD GAME',
    icon: <Sparkles className="w-4 h-4 text-slate-400" />,
    bgGradient: 'from-slate-900 via-slate-900 to-slate-950',
    borderColor: 'border-slate-800 hover:border-slate-700',
    textColor: 'text-slate-300',
  },
};

export const GameCard: React.FC<GameCardProps> = ({
  game,
  targetUsername,
  onOpenGame,
  onShare,
  onEmbed,
}) => {
  const [showMarkdownModal, setShowMarkdownModal] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [markdownViewMode, setMarkdownViewMode] = useState<'formatted' | 'raw'>('formatted');

  const classification = game.analysis?.classification || 'normal';
  const badge = BADGE_CONFIGS[classification];

  const whiteResult = game.white.result === 'win' ? '1' : game.white.result === 'draw' ? '½' : '0';
  const blackResult = game.black.result === 'win' ? '1' : game.black.result === 'draw' ? '½' : '0';

  const brilliantMovesCount = game.analysis?.brilliantMovesCount || 0;
  const greatMovesCount = game.analysis?.greatMovesCount || 0;
  const bookMovesCount = game.analysis?.bookMovesCount || 0;
  const bestMovesCount = game.analysis?.bestMovesCount || 0;
  const excellentMovesCount = game.analysis?.excellentMovesCount || 0;
  const goodMovesCount = game.analysis?.goodMovesCount || 0;
  const inaccuracyCount = game.analysis?.inaccuracyCount || 0;
  const mistakeCount = game.analysis?.mistakeCount || 0;
  const blunderCount = game.analysis?.blunderCount || 0;

  const accuracy = game.analysis?.accuracyEstimate;
  const keyMoment = game.analysis?.criticalMoments[0];

  const gameMarkdownText = generateGameMarkdown(game);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(gameMarkdownText);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([gameMarkdownText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-${game.white.username}-vs-${game.black.username}.md`;
    a.click();
  };

  return (
    <>
      <div
        id={`game-card-${game.id}`}
        className={`bg-gradient-to-b ${badge.bgGradient} border ${badge.borderColor} rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden group`}
      >
        {/* Top Classification Badge */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 ${badge.textColor}`}>
            {badge.icon}
            <span>{badge.title}</span>
          </div>

          <span className="text-xs font-mono text-slate-400 capitalize bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/80">
            {game.timeClass} • {game.movesCount} moves
          </span>
        </div>

        {/* Matchup Header */}
        <div className="space-y-2 py-1">
          <div className="flex items-center justify-between text-sm font-bold text-slate-100">
            <div className="flex items-center gap-2 truncate">
              <span className="text-slate-200">{game.white.username}</span>
              {game.white.rating && <span className="text-xs font-mono text-slate-400">({game.white.rating})</span>}
            </div>

            <span className="font-mono text-amber-400 px-2 py-0.5 bg-slate-950 rounded text-xs">
              {whiteResult} — {blackResult}
            </span>

            <div className="flex items-center gap-2 truncate justify-end">
              {game.black.rating && <span className="text-xs font-mono text-slate-400">({game.black.rating})</span>}
              <span className="text-slate-200">{game.black.username}</span>
            </div>
          </div>

          {/* Opening Name */}
          {game.openingName && (
            <p className="text-xs text-slate-400 truncate flex items-center gap-1">
              <span>♟</span> {game.openingName}
            </p>
          )}
        </div>

        {/* Engine Metrics Highlight & Move Classification Badges */}
        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-300">
            <span>Accuracy Estimate</span>
            <span className="text-emerald-400 font-bold">{accuracy ? `${accuracy}%` : 'Not available'}</span>
          </div>

          {/* Compact Badges Row for Move Types */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {brilliantMovesCount > 0 && (
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded text-[10px] font-bold" title="Brilliant Candidate Moves">
                ✦ {brilliantMovesCount} Brilliant
              </span>
            )}
            {greatMovesCount > 0 && (
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded text-[10px] font-bold" title="Great Moves">
                ⭐ {greatMovesCount} Great
              </span>
            )}
            {bookMovesCount > 0 && (
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded text-[10px] font-bold" title="Opening Book Theory Moves">
                📖 {bookMovesCount} Book
              </span>
            )}
            {bestMovesCount > 0 && (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold" title="Best Engine Moves">
                ⚡ {bestMovesCount} Best
              </span>
            )}
            {excellentMovesCount > 0 && (
              <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded text-[10px] font-bold" title="Excellent Moves">
                👍 {excellentMovesCount} Excellent
              </span>
            )}
            {goodMovesCount > 0 && (
              <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold" title="Good Moves">
                ✓ {goodMovesCount} Good
              </span>
            )}
            {inaccuracyCount > 0 && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold" title="Inaccuracies">
                ❓ {inaccuracyCount} Inaccuracy
              </span>
            )}
            {mistakeCount > 0 && (
              <span className="bg-orange-500/20 text-orange-300 border border-orange-500/40 px-2 py-0.5 rounded text-[10px] font-bold" title="Mistakes">
                ❌ {mistakeCount} Mistake
              </span>
            )}
            {blunderCount > 0 && (
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded text-[10px] font-bold" title="Blunders">
                💥 {blunderCount} Blunder
              </span>
            )}
          </div>

          {keyMoment && (
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div className="text-slate-300 font-semibold flex items-center gap-1">
                <span>⚡ Key Moment:</span>
                <span>{keyMoment.title}</span>
              </div>
              <p className="text-slate-400 italic line-clamp-2">"{keyMoment.description}"</p>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
          <button
            onClick={() => onOpenGame(game)}
            className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
          >
            Open Game
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onEmbed(game)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            title="Markdown & Embed Code Studio"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
          </button>

          <button
            onClick={() => onShare(game)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            title="Share Game"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onEmbed(game)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            title="Embed Game Card"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* In-Card Markdown Viewer Modal */}
      {showMarkdownModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-100">
                    Game Markdown Analysis
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    {game.white.username} vs {game.black.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono mr-1">
                  <button
                    onClick={() => setMarkdownViewMode('formatted')}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                      markdownViewMode === 'formatted'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    Formatted
                  </button>
                  <button
                    onClick={() => setMarkdownViewMode('raw')}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                      markdownViewMode === 'raw'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Code className="w-3 h-3" />
                    Raw Code
                  </button>
                </div>

                <button
                  onClick={handleCopyMarkdown}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedMarkdown ? 'Copied' : 'Copy'}
                </button>

                <button
                  onClick={handleDownloadMarkdown}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  .md
                </button>

                <button
                  onClick={() => setShowMarkdownModal(false)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto font-sans text-slate-200">
              {markdownViewMode === 'formatted' ? (
                <div className="markdown-body space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <Markdown
                    components={{
                      h1: ({ children }) => <h1 className="text-xl font-extrabold text-amber-400 border-b border-slate-800 pb-2 mb-3">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-sm font-bold text-slate-100 mt-4 mb-2 border-b border-slate-800/80 pb-1">{children}</h2>,
                      p: ({ children }) => <p className="text-xs text-slate-300 leading-relaxed my-1.5">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 my-2">{children}</ul>,
                      li: ({ children }) => <li className="text-xs text-slate-300">{children}</li>,
                      hr: () => <hr className="border-slate-800 my-3" />,
                      code: ({ children }) => <code className="bg-slate-900 text-emerald-400 font-mono text-[11px] p-2 rounded-xl block overflow-x-auto my-2 border border-slate-800 whitespace-pre-wrap">{children}</code>,
                    }}
                  >
                    {gameMarkdownText}
                  </Markdown>
                </div>
              ) : (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <pre className="font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
                    {gameMarkdownText}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
