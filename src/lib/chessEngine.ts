import { Chess, Square, PieceSymbol } from 'chess.js';
import {
  ChessGame,
  GameAnalysis,
  EngineMoveAnalysis,
  MoveClassification,
  CriticalMoment,
  GameClassification,
} from '../types';

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

/**
 * Calculates raw static position evaluation in centipawns (positive = White leads, negative = Black leads)
 */
export function evaluatePosition(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -10000 : 10000;
  }
  if (chess.isDraw()) {
    return 0;
  }

  let whiteScore = 0;
  let blackScore = 0;

  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        let val = PIECE_VALUES[piece.type];

        // Central control bonus (e4, d4, e5, d5)
        if ((r === 3 || r === 4) && (c === 3 || c === 4)) {
          val += 25;
        }
        // Advanced pawn bonus
        if (piece.type === 'p') {
          if (piece.color === 'w' && r <= 3) val += (7 - r) * 10;
          if (piece.color === 'b' && r >= 4) val += r * 10;
        }

        if (piece.color === 'w') {
          whiteScore += val;
        } else {
          blackScore += val;
        }
      }
    }
  }

  return whiteScore - blackScore;
}

/**
 * Helper to check if a move constitutes a sacrifice
 */
function isMaterialSacrifice(
  chessBefore: Chess,
  san: string,
  evalBefore: number,
  evalAfter: number
): boolean {
  try {
    const tempChess = new Chess(chessBefore.fen());
    const moveResult = tempChess.move(san);
    if (!moveResult) return false;

    const turnMult = chessBefore.turn() === 'w' ? 1 : -1;
    const playerEvalAfter = evalAfter * turnMult;
    const playerEvalBefore = evalBefore * turnMult;
    const evalDiff = playerEvalAfter - playerEvalBefore;

    // 1. Capturing a lower value piece with a higher value piece (e.g. RxN, QxB, BxP)
    if (moveResult.captured) {
      const movingVal = PIECE_VALUES[moveResult.piece];
      const capturedVal = PIECE_VALUES[moveResult.captured];
      // Giving up piece value for tactical or positional advantage
      if (movingVal > capturedVal && evalDiff >= -50) {
        return true;
      }
    }

    // 2. Moving a non-pawn piece (N, B, R, Q) into an attacked square
    if (moveResult.piece !== 'p' && moveResult.piece !== 'k') {
      const destSquare = moveResult.to as Square;
      const isAttackedByOpponent = tempChess.isAttacked(destSquare, tempChess.turn());
      if (isAttackedByOpponent && playerEvalAfter >= -100) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Single move evaluation and classification
 */
export function classifyMove(
  evalBefore: number,
  evalAfter: number,
  turn: 'w' | 'b',
  isSacrifice: boolean,
  isCheckmate: boolean,
  ply: number = 100
): { classification: MoveClassification; evalSwing: number; confidence: number } {
  const turnMult = turn === 'w' ? 1 : -1;
  const playerEvalBefore = evalBefore * turnMult;
  const playerEvalAfter = evalAfter * turnMult;
  const evalSwing = playerEvalAfter - playerEvalBefore;

  let classification: MoveClassification = 'good';
  let confidence = 0.85;

  if (isCheckmate && playerEvalAfter > 5000) {
    classification = 'great';
    confidence = 0.98;
  } else if (isSacrifice && (evalSwing >= -30 || playerEvalAfter >= 100)) {
    classification = 'brilliant';
    confidence = 0.94;
  } else if (evalSwing >= 100 || (evalSwing >= 40 && playerEvalAfter >= 150)) {
    classification = 'great';
    confidence = 0.92;
  } else if (ply <= 8 && !isSacrifice && evalSwing >= -25) {
    classification = 'book';
    confidence = 0.95;
  } else if (evalSwing >= -15) {
    classification = 'best';
    confidence = 0.88;
  } else if (evalSwing >= -45) {
    classification = 'excellent';
    confidence = 0.85;
  } else if (evalSwing >= -90) {
    classification = 'good';
    confidence = 0.82;
  } else if (evalSwing >= -180) {
    classification = 'inaccuracy';
    confidence = 0.82;
  } else if (evalSwing >= -350) {
    classification = 'mistake';
    confidence = 0.85;
  } else {
    classification = 'blunder';
    confidence = 0.95;
  }

  return { classification, evalSwing, confidence };
}

/**
 * detectBrilliantMoves algorithm
 */
export function detectBrilliantMoves(game: ChessGame, moveAnalyses: EngineMoveAnalysis[]): EngineMoveAnalysis[] {
  return moveAnalyses.filter(
    (ma) => ma.classification === 'brilliant' || ma.classification === 'great' || (ma.isSacrifice && ma.evalAfter >= -1.0)
  );
}

/**
 * Full game analysis engine
 */
export function analyzeGame(game: ChessGame, targetUsername?: string): GameAnalysis {
  const chess = new Chess();
  const moveAnalyses: EngineMoveAnalysis[] = [];
  const criticalMoments: CriticalMoment[] = [];

  let evalBefore = evaluatePosition(chess);
  let fenBefore = chess.fen();

  let brilliantCount = 0;
  let greatCount = 0;
  let bookCount = 0;
  let bestCount = 0;
  let excellentCount = 0;
  let goodCount = 0;
  let mistakeCount = 0;
  let blunderCount = 0;
  let inaccuracyCount = 0;
  let totalCPLoss = 0;

  // Determine player color relative to target user if specified
  const targetLower = targetUsername?.toLowerCase();
  const targetColor =
    targetLower && game.black.username.toLowerCase() === targetLower ? 'b' : 'w';

  for (let i = 0; i < game.moveList.length; i++) {
    const san = game.moveList[i];
    const turn = chess.turn();
    const ply = i + 1;
    const moveNumber = Math.ceil(ply / 2);

    const isTargetPlayerTurn = turn === targetColor;

    // Simulate move to calculate accurate evalAfter before checking material sacrifice
    const tempChess = new Chess(chess.fen());
    tempChess.move(san);
    const evalAfter = evaluatePosition(tempChess);
    const fenAfter = tempChess.fen();

    const isSac = isMaterialSacrifice(chess, san, evalBefore, evalAfter);

    chess.move(san);

    const { classification, evalSwing, confidence } = classifyMove(
      evalBefore,
      evalAfter,
      turn,
      isSac,
      chess.isCheckmate(),
      ply
    );

    if (isTargetPlayerTurn) {
      if (classification === 'brilliant') brilliantCount++;
      if (classification === 'great') greatCount++;
      if (classification === 'book') bookCount++;
      if (classification === 'best') bestCount++;
      if (classification === 'excellent') excellentCount++;
      if (classification === 'good') goodCount++;
      if (classification === 'mistake') mistakeCount++;
      if (classification === 'blunder') blunderCount++;
      if (classification === 'inaccuracy') inaccuracyCount++;
      if (evalSwing < 0) totalCPLoss += Math.abs(evalSwing);
    } else {
      if (classification === 'brilliant') brilliantCount++;
      if (classification === 'great') greatCount++;
      if (classification === 'book') bookCount++;
      if (classification === 'best') bestCount++;
      if (classification === 'excellent') excellentCount++;
      if (classification === 'good') goodCount++;
    }

    const moveAnalysis: EngineMoveAnalysis = {
      moveNumber,
      ply,
      san,
      fenBefore,
      fenAfter,
      evalBefore: Number((evalBefore / 100).toFixed(2)),
      evalAfter: Number((evalAfter / 100).toFixed(2)),
      evalSwing: Number((evalSwing / 100).toFixed(2)),
      classification,
      isSacrifice: isSac,
      confidence,
    };

    moveAnalyses.push(moveAnalysis);

    // Identify critical moments
    if (classification === 'brilliant') {
      criticalMoments.push({
        ply,
        moveNumber,
        san,
        type: 'brilliant',
        title: `Move ${moveNumber}: Brilliant ${san}`,
        description: `Tactical sacrifice resulting in high positional leverage (Engine Eval: ${(evalAfter / 100).toFixed(1)}).`,
        evalBefore: Number((evalBefore / 100).toFixed(1)),
        evalAfter: Number((evalAfter / 100).toFixed(1)),
      });
    } else if (classification === 'great') {
      criticalMoments.push({
        ply,
        moveNumber,
        san,
        type: 'tactical',
        title: `Move ${moveNumber}: Great Move (${san})`,
        description: `Crucial game-changing move with high evaluation swing (+${Number((evalSwing / 100).toFixed(1))}).`,
        evalBefore: Number((evalBefore / 100).toFixed(1)),
        evalAfter: Number((evalAfter / 100).toFixed(1)),
      });
    } else if (Math.abs(evalSwing) > 200 && classification === 'blunder') {
      criticalMoments.push({
        ply,
        moveNumber,
        san,
        type: 'blunder',
        title: `Move ${moveNumber}: Major Blunder (${san})`,
        description: `Significant evaluation drop of ${Math.abs(Number((evalSwing / 100).toFixed(1)))} pawns.`,
        evalBefore: Number((evalBefore / 100).toFixed(1)),
        evalAfter: Number((evalAfter / 100).toFixed(1)),
      });
    }

    evalBefore = evalAfter;
    fenBefore = fenAfter;
  }

  // Calculate estimated accuracy
  const targetMovesCount = Math.max(1, Math.floor(game.moveList.length / 2));
  const avgCPLoss = totalCPLoss / targetMovesCount;
  // Standard accuracy formula: 100 - (avgCPL / 3.5) capped between 35 and 99.2
  const estimatedAccuracy = Math.max(35, Math.min(99.2, Number((100 - avgCPLoss / 3.5).toFixed(1))));

  // Determine game classification
  let gameClassification: GameClassification = 'normal';
  let classificationReason = 'Standard game execution.';

  const isWin =
    targetColor === 'w'
      ? game.white.result === 'win'
      : game.black.result === 'win';

  const opponentRating =
    targetColor === 'w' ? game.black.rating : game.white.rating;
  const playerRating =
    targetColor === 'w' ? game.white.rating : game.black.rating;

  if (brilliantCount > 0) {
    gameClassification = 'brilliant';
    classificationReason = `Engine detected ${brilliantCount} brilliant candidate move${brilliantCount > 1 ? 's' : ''}.`;
  } else if (greatCount > 0) {
    gameClassification = 'tactical_battle';
    classificationReason = `Engine detected ${greatCount} great move${greatCount > 1 ? 's' : ''} in tactical battle.`;
  } else if (isWin && opponentRating && playerRating && opponentRating >= playerRating + 80) {
    gameClassification = 'best_performance';
    classificationReason = `Upset victory against opponent rated ${opponentRating} (+${opponentRating - playerRating}).`;
  } else if (isWin && criticalMoments.some(cm => cm.type === 'blunder') && game.movesCount > 25) {
    gameClassification = 'comeback';
    classificationReason = 'Turned around a major evaluation disadvantage to win.';
  } else if (game.movesCount >= 50) {
    gameClassification = 'longest_battle';
    classificationReason = `Grinding endgame battle lasting ${game.movesCount} moves.`;
  } else if (game.movesCount < 20 && isWin) {
    gameClassification = 'opening_masterclass';
    classificationReason = `Fast victory in ${game.movesCount} moves out of the opening.`;
  } else if (blunderCount >= 2 || mistakeCount >= 4) {
    gameClassification = 'mistake_review';
    classificationReason = `${blunderCount} blunders and ${mistakeCount} mistakes available for analysis.`;
  } else if (Math.abs(evalBefore) < 150 && game.movesCount >= 30) {
    gameClassification = 'close_battle';
    classificationReason = 'Tightly contested game with balanced engine evaluation throughout.';
  }

  const openingAccuracy = Math.max(70, Math.min(100, Number((100 - inaccuracyCount * 3).toFixed(1))));

  return {
    gameId: game.id,
    accuracyEstimate: estimatedAccuracy,
    brilliantMovesCount: brilliantCount,
    greatMovesCount: greatCount,
    bookMovesCount: bookCount,
    bestMovesCount: bestCount,
    excellentMovesCount: excellentCount,
    goodMovesCount: goodCount,
    mistakeCount,
    blunderCount,
    inaccuracyCount,
    moveAnalyses,
    criticalMoments,
    summary: `${game.openingName || game.eco || 'Game'} ended in ${game.movesCount} moves. ${classificationReason}`,
    openingAccuracy,
    classification: gameClassification,
    classificationReason,
  };
}
