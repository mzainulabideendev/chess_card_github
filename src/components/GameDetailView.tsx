import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  AlertCircle,
  Download,
  Share2,
  Code,
  FileText,
  TrendingUp,
  Award,
} from 'lucide-react';
import { ChessGame, CriticalMoment, MoveClassification } from '../types';
import { ChessBoard } from './ChessBoard';

interface GameDetailViewProps {
  game: ChessGame | null;
  onClose: () => void;
  onShare: (game: ChessGame) => void;
  onEmbed: (game: ChessGame) => void;
  onExportMarkdown: (game: ChessGame) => void;
}

const getMoveBadge = (classification?: MoveClassification) => {
  switch (classification) {
    case 'brilliant':
      return { icon: '✦', color: 'text-cyan-300 bg-cyan-950/80 border-cyan-500/50 font-bold', label: 'Brilliant' };
    case 'great':
      return { icon: '⭐', color: 'text-blue-300 bg-blue-950/80 border-blue-500/50 font-bold', label: 'Great' };
    case 'book':
      return { icon: '📖', color: 'text-indigo-300 bg-indigo-950/80 border-indigo-500/40 font-bold', label: 'Book' };
    case 'best':
      return { icon: '⚡', color: 'text-emerald-300 bg-emerald-950/80 border-emerald-500/40', label: 'Best' };
    case 'excellent':
      return { icon: '👍', color: 'text-green-300 bg-green-950/80 border-green-500/40', label: 'Excellent' };
    case 'good':
      return { icon: '✓', color: 'text-slate-300 bg-slate-900 border-slate-800', label: 'Good' };
    case 'inaccuracy':
      return { icon: '❓', color: 'text-yellow-300 bg-yellow-950/80 border-yellow-500/40', label: 'Inaccuracy' };
    case 'mistake':
      return { icon: '❌', color: 'text-orange-300 bg-orange-950/80 border-orange-500/40', label: 'Mistake' };
    case 'blunder':
      return { icon: '💥', color: 'text-rose-300 bg-rose-950/80 border-rose-500/50 font-bold', label: 'Blunder' };
    default:
      return { icon: '', color: 'text-slate-300 bg-slate-900 border-slate-800', label: 'Move' };
  }
};

export const GameDetailView: React.FC<GameDetailViewProps> = ({
  game,
  onClose,
  onShare,
  onEmbed,
  onExportMarkdown,
}) => {
  const [selectedPly, setSelectedPly] = useState(0);

  if (!game) return null;

  const whiteResult = game.white.result === 'win' ? '1' : game.white.result === 'draw' ? '½' : '0';
  const blackResult = game.black.result === 'win' ? '1' : game.black.result === 'draw' ? '½' : '0';

  const moveAnalyses = game.analysis?.moveAnalyses || [];
  const currentAnalysis = moveAnalyses[selectedPly - 1];

  const criticalMoments = game.analysis?.criticalMoments || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Detail Header Bar */}
        <div className="p-4 lg:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-slate-100 flex items-center gap-2">
                <span>{game.white.username}</span>
                <span className="text-amber-400 font-mono text-sm">{whiteResult} - {blackResult}</span>
                <span>{game.black.username}</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {game.openingName || game.eco || 'Standard Chess'} • {game.timeClass.toUpperCase()} • {game.movesCount} moves
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onExportMarkdown(game)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Markdown Report
            </button>

            <button
              onClick={() => onEmbed(game)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
              Embed Card
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main 2-Column Board + Analysis Panel */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Chessboard */}
          <div className="lg:col-span-6 flex flex-col items-center justify-start space-y-4">
            {/* Player Cards Header */}
            <div className="w-full grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
                <span className="text-slate-400 block font-sans text-[11px]">White Player</span>
                <span className="font-bold text-slate-100">{game.white.username}</span>
                {game.white.rating && <span className="text-amber-400 block">({game.white.rating})</span>}
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-right">
                <span className="text-slate-400 block font-sans text-[11px]">Black Player</span>
                <span className="font-bold text-slate-100">{game.black.username}</span>
                {game.black.rating && <span className="text-amber-400 block">({game.black.rating})</span>}
              </div>
            </div>

            {/* Real Interactive Chessboard */}
            <ChessBoard
              pgn={game.pgn}
              moveIndex={selectedPly}
              onMoveChange={(ply) => setSelectedPly(ply)}
            />

            {/* Current Move Engine Evaluation Panel */}
            {currentAnalysis && (
              <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-bold text-amber-400 uppercase">
                    Move {currentAnalysis.moveNumber}: {currentAnalysis.san}
                  </span>
                  {(() => {
                    const badge = getMoveBadge(currentAnalysis.classification);
                    return (
                      <span className={`capitalize font-semibold px-2 py-0.5 rounded border text-[11px] ${badge.color}`}>
                        {badge.icon} {badge.label}
                      </span>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-3 gap-2 text-slate-400 text-[11px]">
                  <div>Eval Before: <strong className="text-slate-200">{currentAnalysis.evalBefore > 0 ? `+${currentAnalysis.evalBefore}` : currentAnalysis.evalBefore}</strong></div>
                  <div>Eval After: <strong className="text-slate-200">{currentAnalysis.evalAfter > 0 ? `+${currentAnalysis.evalAfter}` : currentAnalysis.evalAfter}</strong></div>
                  <div>Swing: <strong className={currentAnalysis.evalSwing >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{currentAnalysis.evalSwing >= 0 ? `+${currentAnalysis.evalSwing}` : currentAnalysis.evalSwing}</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Move Timeline & Critical Moments */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-start">
            {/* Critical Moments List */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Engine Key Moments & Tactical Moves
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {game.analysis?.brilliantMovesCount || 0}✦ Brilliant • {game.analysis?.greatMovesCount || 0}⭐ Great
                </span>
              </h4>

              {criticalMoments.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No significant critical moments flagged by engine analysis.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {criticalMoments.map((cm, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPly(cm.ply)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        selectedPly === cm.ply
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono font-semibold">
                        <span className="flex items-center gap-1.5">
                          {cm.type === 'brilliant' && <span className="text-cyan-300">✦</span>}
                          {cm.type === 'tactical' && <span className="text-blue-300">⭐</span>}
                          {cm.type === 'blunder' && <span className="text-rose-400">⚠</span>}
                          {cm.title}
                        </span>
                        <span className="text-[10px] text-slate-400">Ply {cm.ply}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 font-sans line-clamp-2">{cm.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SAN Move Timeline Box */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex-1 flex flex-col space-y-3 min-h-[220px]">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-200">Move Timeline</h4>
                <span className="text-[11px] text-slate-400 font-mono">Click any move to jump board</span>
              </div>

              <div className="flex-1 overflow-y-auto max-h-64 pr-2 font-mono text-xs grid grid-cols-2 gap-2">
                {game.moveList.map((moveSan, index) => {
                  const ply = index + 1;
                  const moveNum = Math.ceil(ply / 2);
                  const isWhiteMove = ply % 2 !== 0;
                  const ma = moveAnalyses[index];
                  const badge = getMoveBadge(ma?.classification);

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedPly(ply)}
                      className={`p-2 rounded-lg text-left border flex items-center justify-between transition-all ${
                        selectedPly === ply
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : `${badge.color} hover:brightness-125`
                      }`}
                    >
                      <span>{isWhiteMove ? `${moveNum}. ${moveSan}` : `... ${moveSan}`}</span>
                      {badge.icon && <span className="ml-1 text-[11px]">{badge.icon}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
