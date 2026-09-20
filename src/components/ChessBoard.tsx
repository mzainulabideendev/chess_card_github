import React, { useState, useEffect, useMemo } from 'react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import {
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Settings,
} from 'lucide-react';

interface ChessBoardProps {
  pgn: string;
  moveIndex?: number;
  onMoveChange?: (index: number) => void;
  orientation?: 'white' | 'black';
  theme?: 'classic' | 'emerald' | 'wood' | 'slate' | 'neon';
}

const UNICODE_PIECES: Record<string, string> = {
  wK: '♔',
  wQ: '♕',
  wR: '♖',
  wB: '♗',
  wN: '♘',
  wP: '♙',
  bK: '♚',
  bQ: '♛',
  bR: '♜',
  bB: '♝',
  bN: '♞',
  bP: '♟',
};

const THEME_STYLES = {
  classic: {
    light: 'bg-amber-100/90 text-amber-950',
    dark: 'bg-amber-800/80 text-amber-100',
    highlight: 'bg-amber-400/60',
    check: 'bg-rose-500/80',
  },
  emerald: {
    light: 'bg-emerald-100/90 text-emerald-950',
    dark: 'bg-emerald-800/90 text-emerald-100',
    highlight: 'bg-emerald-400/60',
    check: 'bg-rose-500/80',
  },
  wood: {
    light: 'bg-amber-200/90 text-amber-950',
    dark: 'bg-amber-900/90 text-amber-100',
    highlight: 'bg-yellow-500/50',
    check: 'bg-rose-600/80',
  },
  slate: {
    light: 'bg-slate-300 text-slate-900',
    dark: 'bg-slate-700 text-slate-100',
    highlight: 'bg-amber-500/50',
    check: 'bg-red-500/80',
  },
  neon: {
    light: 'bg-slate-800 text-cyan-300',
    dark: 'bg-slate-950 text-amber-400',
    highlight: 'bg-cyan-500/40',
    check: 'bg-rose-500/80',
  },
};

export const ChessBoard: React.FC<ChessBoardProps> = ({
  pgn,
  moveIndex: externalMoveIndex,
  onMoveChange,
  orientation: initialOrientation = 'white',
  theme = 'emerald',
}) => {
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>(initialOrientation);
  const [currentPly, setCurrentPly] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [boardStyle, setBoardStyle] = useState(theme);
  const [showCoordinates, setShowCoordinates] = useState(true);

  // Initialize chess instance and parse move history
  const { chessHistory, moveFens, lastMoves } = useMemo(() => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgn);
      const history = chess.history({ verbose: true });

      const tempChess = new Chess();
      const fens: string[] = [tempChess.fen()];
      const moves: { from: Square; to: Square }[] = [];

      for (const m of history) {
        tempChess.move(m);
        fens.push(tempChess.fen());
        moves.push({ from: m.from, to: m.to });
      }

      return { chessHistory: history, moveFens: fens, lastMoves: moves };
    } catch {
      return { chessHistory: [], moveFens: [new Chess().fen()], lastMoves: [] };
    }
  }, [pgn]);

  // Sync with external move index if provided
  useEffect(() => {
    if (externalMoveIndex !== undefined && externalMoveIndex >= 0 && externalMoveIndex < moveFens.length) {
      setCurrentPly(externalMoveIndex);
    }
  }, [externalMoveIndex, moveFens.length]);

  // Handle autoplay
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentPly((prev) => {
          if (prev >= moveFens.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          if (onMoveChange) onMoveChange(next);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, moveFens.length, onMoveChange]);

  const currentChess = useMemo(() => {
    const fen = moveFens[currentPly] || moveFens[0];
    const c = new Chess();
    c.load(fen);
    return c;
  }, [moveFens, currentPly]);

  const board = currentChess.board();
  const lastMove = currentPly > 0 ? lastMoves[currentPly - 1] : null;
  const isCheck = currentChess.inCheck();

  const handleStep = (newPly: number) => {
    const clamped = Math.max(0, Math.min(moveFens.length - 1, newPly));
    setCurrentPly(clamped);
    if (onMoveChange) onMoveChange(clamped);
  };

  const currentTheme = THEME_STYLES[boardStyle] || THEME_STYLES.emerald;

  const rows = boardOrientation === 'white' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const cols = boardOrientation === 'white' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
      {/* Board Controls Top Bar */}
      <div className="flex items-center justify-between w-full px-2 text-xs text-slate-400 font-mono">
        <span>
          Ply {currentPly} / {moveFens.length - 1}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBoardOrientation((prev) => (prev === 'white' ? 'black' : 'white'))}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
          >
            Flip ({boardOrientation.toUpperCase()})
          </button>

          <select
            value={boardStyle}
            onChange={(e) => setBoardStyle(e.target.value as any)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none"
          >
            <option value="emerald">Emerald</option>
            <option value="classic">Classic</option>
            <option value="wood">Wood</option>
            <option value="slate">Slate</option>
            <option value="neon">Neon</option>
          </select>
        </div>
      </div>

      {/* Chessboard Grid */}
      <div className="w-full aspect-square bg-slate-950 border-4 border-slate-800 rounded-2xl p-2 shadow-2xl relative select-none">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-xl overflow-hidden">
          {rows.map((r) =>
            cols.map((c) => {
              const file = String.fromCharCode(97 + c);
              const rank = 8 - r;
              const squareName = `${file}${rank}` as Square;
              const piece = board[r][c];

              const isLight = (r + c) % 2 === 0;
              const isLastMoveSquare =
                lastMove && (lastMove.from === squareName || lastMove.to === squareName);
              const isKingInCheck =
                isCheck && piece && piece.type === 'k' && piece.color === currentChess.turn();

              let cellStyle = isLight ? currentTheme.light : currentTheme.dark;
              if (isKingInCheck) cellStyle = currentTheme.check;
              else if (isLastMoveSquare) cellStyle += ` ${currentTheme.highlight}`;

              return (
                <div
                  key={squareName}
                  className={`relative flex items-center justify-center font-bold text-3xl lg:text-4xl transition-colors ${cellStyle}`}
                >
                  {/* Coordinates overlay */}
                  {showCoordinates && (
                    <>
                      {c === (boardOrientation === 'white' ? 0 : 7) && (
                        <span className="absolute top-0.5 left-1 text-[10px] font-mono opacity-60 pointer-events-none">
                          {rank}
                        </span>
                      )}
                      {r === (boardOrientation === 'white' ? 7 : 0) && (
                        <span className="absolute bottom-0.5 right-1 text-[10px] font-mono opacity-60 pointer-events-none">
                          {file}
                        </span>
                      )}
                    </>
                  )}

                  {/* Render Piece */}
                  {piece && (
                    <span
                      className={`filter drop-shadow-md transition-transform transform active:scale-110 cursor-pointer ${
                        piece.color === 'w' ? 'text-amber-100' : 'text-slate-900'
                      }`}
                    >
                      {UNICODE_PIECES[`${piece.color}${piece.type.toUpperCase()}`]}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Move Playback Control Bar */}
      <div className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl w-full">
        <button
          onClick={() => handleStep(0)}
          disabled={currentPly === 0}
          className="p-2 text-slate-400 hover:text-slate-100 disabled:opacity-30 transition-colors"
          title="First Move"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleStep(currentPly - 1)}
          disabled={currentPly === 0}
          className="p-2 text-slate-400 hover:text-slate-100 disabled:opacity-30 transition-colors"
          title="Previous Move"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow font-bold transition-all"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        <button
          onClick={() => handleStep(currentPly + 1)}
          disabled={currentPly >= moveFens.length - 1}
          className="p-2 text-slate-400 hover:text-slate-100 disabled:opacity-30 transition-colors"
          title="Next Move"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleStep(moveFens.length - 1)}
          disabled={currentPly >= moveFens.length - 1}
          className="p-2 text-slate-400 hover:text-slate-100 disabled:opacity-30 transition-colors"
          title="Last Move"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
