import { PlayerProfile, ChessGame, ProviderConfig } from '../../types';
import { parsePgnToGame } from '../pgnParser';

export interface IChessDataProvider {
  name: string;
  isAuthorized(): boolean;
  getPlayerProfile(username: string): Promise<PlayerProfile | null>;
  getGamesArchives(username: string): Promise<string[]>;
  getMonthlyGames(username: string, year: string, month: string): Promise<ChessGame[]>;
}

/**
 * Global Configuration for Integration Compliance
 */
export const providerConfig: ProviderConfig = {
  chessComApiEnabled: process.env.CHESS_COM_API_ENABLED !== 'false', // Default enabled
  chessComAuthorized: process.env.CHESS_COM_AUTHORIZED !== 'false', // Default authorized
  activeProvider: 'chess_com',
  statusMessage: 'Official Chess.com PubAPI active.',
};

/**
 * Chess.com Provider implementation using official PubAPI
 */
export class ChessComProvider implements IChessDataProvider {
  name = 'Chess.com PubAPI';

  isAuthorized(): boolean {
    return providerConfig.chessComApiEnabled && providerConfig.chessComAuthorized;
  }

  private get headers() {
    return {
      'User-Agent': 'ChessProfileIntelligencePlatform/1.0 (contact@app.com)',
      'Accept': 'application/json',
    };
  }

  async getPlayerProfile(username: string): Promise<PlayerProfile | null> {
    if (!this.isAuthorized()) {
      throw new Error('Chess.com data integration unavailable for this deployment.');
    }

    const cleanUsername = username.trim().toLowerCase();
    const profileUrl = `https://api.chess.com/pub/player/${cleanUsername}`;
    const statsUrl = `https://api.chess.com/pub/player/${cleanUsername}/stats`;

    const profileRes = await fetch(profileUrl, { headers: this.headers });
    if (profileRes.status === 404) {
      return null;
    }
    if (!profileRes.ok) {
      throw new Error(`Chess.com API HTTP ${profileRes.status}: Failed to load profile.`);
    }

    const profileData = await profileRes.json();

    let statsData: any = {};
    try {
      const statsRes = await fetch(statsUrl, { headers: this.headers });
      if (statsRes.ok) {
        statsData = await statsRes.json();
      }
    } catch {
      // stats optional
    }

    const mapStats = (statObj: any) => {
      if (!statObj || !statObj.last) return undefined;
      const record = statObj.record || {};
      return {
        rating: statObj.last.rating,
        bestRating: statObj.best?.rating,
        winCount: record.win || 0,
        lossCount: record.loss || 0,
        drawCount: record.draw || 0,
      };
    };

    return {
      username: profileData.username,
      avatar: profileData.avatar,
      url: profileData.url,
      title: profileData.title,
      name: profileData.name,
      followers: profileData.followers,
      country: profileData.country,
      joined: profileData.joined,
      status: profileData.status,
      ratings: {
        rapid: mapStats(statsData.chess_rapid),
        blitz: mapStats(statsData.chess_blitz),
        bullet: mapStats(statsData.chess_bullet),
        daily: mapStats(statsData.chess_daily),
      },
    };
  }

  async getGamesArchives(username: string): Promise<string[]> {
    if (!this.isAuthorized()) {
      return [];
    }

    const cleanUsername = username.trim().toLowerCase();
    const archivesUrl = `https://api.chess.com/pub/player/${cleanUsername}/games/archives`;

    const res = await fetch(archivesUrl, { headers: this.headers });
    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.archives || [];
  }

  async getMonthlyGames(username: string, year: string, month: string): Promise<ChessGame[]> {
    if (!this.isAuthorized()) {
      return [];
    }

    const cleanUsername = username.trim().toLowerCase();
    const formattedMonth = month.padStart(2, '0');
    const gamesUrl = `https://api.chess.com/pub/player/${cleanUsername}/games/${year}/${formattedMonth}`;

    const res = await fetch(gamesUrl, { headers: this.headers });
    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const rawGames = data.games || [];

    const games: ChessGame[] = [];

    for (let i = 0; i < rawGames.length; i++) {
      const g = rawGames[i];
      if (!g.pgn) continue;

      const gameId = g.url ? g.url.split('/').pop() || `game-${i}` : `game-${year}-${month}-${i}`;
      const parsedGame = parsePgnToGame(g.pgn, gameId, 'chess_com', g.url);

      if (parsedGame) {
        // Ensure accurate player details from object if PGN headers miss avatar/ratings
        if (g.white) {
          parsedGame.white.username = g.white.username || parsedGame.white.username;
          parsedGame.white.rating = g.white.rating ?? parsedGame.white.rating;
          if (g.white.result) {
            parsedGame.white.result =
              g.white.result === 'win'
                ? 'win'
                : ['agreed', 'repetition', 'stalemate', 'insufficient', '50move', 'timeversusinsufficient'].includes(g.white.result)
                ? 'draw'
                : 'loss';
          }
        }
        if (g.black) {
          parsedGame.black.username = g.black.username || parsedGame.black.username;
          parsedGame.black.rating = g.black.rating ?? parsedGame.black.rating;
          if (g.black.result) {
            parsedGame.black.result =
              g.black.result === 'win'
                ? 'win'
                : ['agreed', 'repetition', 'stalemate', 'insufficient', '50move', 'timeversusinsufficient'].includes(g.black.result)
                ? 'draw'
                : 'loss';
          }
        }
        if (g.time_class) {
          parsedGame.timeClass = g.time_class;
        }

        games.push(parsedGame);
      }
    }

    return games;
  }
}

/**
 * PGN Import Provider for manual / file upload
 */
export class PGNImportProvider {
  name = 'PGN Import Provider';

  parsePgnText(pgnText: string): ChessGame[] {
    const rawGames = pgnText.split(/\n\s*\n(?=\[Event )/g);
    const games: ChessGame[] = [];

    for (let i = 0; i < rawGames.length; i++) {
      const pgnChunk = rawGames[i].trim();
      if (!pgnChunk) continue;

      const gameId = `imported-${Date.now()}-${i}`;
      const game = parsePgnToGame(pgnChunk, gameId, 'pgn_import');
      if (game) {
        games.push(game);
      }
    }

    return games;
  }
}
