import { Chess } from 'chess.js';
import { ChessGame, ChessGamePlayer, TimeClass } from '../types';

/**
 * Standard PGN Header Extractor
 */
export function parsePgnHeaders(pgnString: string): Record<string, string> {
  const headers: Record<string, string> = {};
  const headerRegex = /^\[([A-Za-z0-9_]+)\s+"(.*)"\]$/gm;
  let match;
  while ((match = headerRegex.exec(pgnString)) !== null) {
    headers[match[1]] = match[2];
  }
  return headers;
}

/**
 * Determines TimeClass based on TimeControl header
 */
export function determineTimeClass(timeControl?: string, rules?: string): TimeClass {
  if (rules && rules.toLowerCase() !== 'chess') {
    return 'unknown';
  }
  if (!timeControl) return 'unknown';

  if (timeControl.includes('/')) {
    // Days per turn e.g. "1/86400"
    return 'daily';
  }

  const parts = timeControl.split('+');
  const baseSeconds = parseInt(parts[0], 10);
  if (isNaN(baseSeconds)) return 'unknown';

  if (baseSeconds < 180) {
    return 'bullet'; // < 3 mins
  } else if (baseSeconds <= 600) {
    return 'blitz'; // 3 - 10 mins
  } else if (baseSeconds <= 7200) {
    return 'rapid'; // 10 mins - 2 hours
  } else {
    return 'daily';
  }
}

/**
 * Map raw result codes to user-facing results
 */
export function normalizeResult(resultHeader?: string, whiteUsername?: string, targetUser?: string): string {
  if (!resultHeader) return 'unknown';
  return resultHeader;
}

/**
 * Parses raw PGN text into a normalized ChessGame object
 */
export function parsePgnToGame(
  pgnString: string,
  gameId: string,
  provider: 'chess_com' | 'lichess' | 'pgn_import' = 'pgn_import',
  externalUrl?: string
): ChessGame | null {
  try {
    const chess = new Chess();
    // Load PGN using chess.js
    chess.loadPgn(pgnString);

    const headers = parsePgnHeaders(pgnString);

    const whiteName = headers['White'] || 'White Player';
    const blackName = headers['Black'] || 'Black Player';
    const whiteElo = headers['WhiteElo'] ? parseInt(headers['WhiteElo'], 10) : undefined;
    const blackElo = headers['BlackElo'] ? parseInt(headers['BlackElo'], 10) : undefined;
    const rawResult = headers['Result'] || '*';
    const eco = headers['ECO'];
    const openingName = headers['Opening'] || headers['Variant'] || undefined;
    const timeControl = headers['TimeControl'] || '300';
    const timeClass = determineTimeClass(timeControl);

    // Extract move list (SAN) from history
    const history = chess.history();
    const finalFen = chess.fen();

    const whitePlayer: ChessGamePlayer = {
      username: whiteName,
      rating: whiteElo,
      result: rawResult === '1-0' ? 'win' : rawResult === '0-1' ? 'loss' : 'draw',
    };

    const blackPlayer: ChessGamePlayer = {
      username: blackName,
      rating: blackElo,
      result: rawResult === '0-1' ? 'win' : rawResult === '1-0' ? 'loss' : 'draw',
    };

    let endTime: number | undefined = undefined;
    if (headers['UTCDate'] && headers['UTCTime']) {
      const dateStr = `${headers['UTCDate'].replace(/\./g, '-')}T${headers['UTCTime']}Z`;
      const parsedTime = Date.parse(dateStr);
      if (!isNaN(parsedTime)) {
        endTime = parsedTime;
      }
    } else if (headers['Date']) {
      const dateStr = headers['Date'].replace(/\./g, '-');
      const parsedTime = Date.parse(dateStr);
      if (!isNaN(parsedTime)) {
        endTime = parsedTime;
      }
    }

    return {
      id: gameId,
      url: externalUrl,
      pgn: pgnString,
      fen: finalFen,
      timeControl,
      timeClass,
      rules: headers['Rules'] || 'chess',
      white: whitePlayer,
      black: blackPlayer,
      endTime,
      eco,
      openingName,
      movesCount: Math.ceil(history.length / 2),
      moveList: history,
      provider,
    };
  } catch (err) {
    console.error('Failed to parse PGN:', err);
    return null;
  }
}
