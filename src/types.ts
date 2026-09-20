export type TimeClass = 'bullet' | 'blitz' | 'rapid' | 'daily' | 'classical' | 'unknown';

export interface PlayerStats {
  rating: number;
  bestRating?: number;
  winCount: number;
  lossCount: number;
  drawCount: number;
}

export interface PlayerProfile {
  username: string;
  avatar?: string;
  url?: string;
  title?: string;
  name?: string;
  followers?: number;
  country?: string;
  joined?: number; // timestamp
  status?: string;
  ratings: {
    rapid?: PlayerStats;
    blitz?: PlayerStats;
    bullet?: PlayerStats;
    daily?: PlayerStats;
  };
}

export interface ChessGamePlayer {
  username: string;
  rating?: number;
  result: string; // 'win' | 'checkmated' | 'agreed' | 'resigned' | 'timeout' | etc.
  avatar?: string;
}

export type MoveClassification =
  | 'book'
  | 'brilliant'
  | 'great'
  | 'best'
  | 'excellent'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder';

export interface EngineMoveAnalysis {
  moveNumber: number;
  ply: number;
  san: string;
  uci?: string;
  fenBefore: string;
  fenAfter: string;
  evalBefore: number; // in centipawns or mate score
  evalAfter: number;
  evalSwing: number;
  bestMoveSan?: string;
  classification: MoveClassification;
  isSacrifice: boolean;
  comment?: string;
  confidence: number; // 0.0 - 1.0
}

export type GameClassification =
  | 'brilliant'
  | 'best_performance'
  | 'tactical_battle'
  | 'comeback'
  | 'endgame'
  | 'opening_masterclass'
  | 'mistake_review'
  | 'close_battle'
  | 'longest_battle'
  | 'normal';

export interface CriticalMoment {
  ply: number;
  moveNumber: number;
  san: string;
  type: 'brilliant' | 'tactical' | 'eval_swing' | 'blunder' | 'comeback';
  title: string;
  description: string;
  evalBefore: number;
  evalAfter: number;
}

export interface GameAnalysis {
  gameId: string;
  accuracyEstimate: number; // e.g. 88.5%
  brilliantMovesCount: number;
  greatMovesCount?: number;
  bookMovesCount?: number;
  bestMovesCount?: number;
  excellentMovesCount?: number;
  goodMovesCount?: number;
  mistakeCount: number;
  blunderCount: number;
  inaccuracyCount: number;
  moveAnalyses: EngineMoveAnalysis[];
  criticalMoments: CriticalMoment[];
  summary: string;
  openingAccuracy: number;
  classification: GameClassification;
  classificationReason: string;
}

export interface ChessGame {
  id: string;
  url?: string;
  pgn: string;
  fen: string; // final fen
  timeControl: string;
  timeClass: TimeClass;
  rules: string;
  white: ChessGamePlayer;
  black: ChessGamePlayer;
  endTime?: number;
  eco?: string;
  openingName?: string;
  movesCount: number;
  moveList: string[]; // SAN moves
  analysis?: GameAnalysis;
  provider: 'chess_com' | 'lichess' | 'pgn_import';
}

export interface OpeningStat {
  eco: string;
  name: string;
  gamesCount: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

export interface PlayerReport {
  username: string;
  generatedAt: number;
  profile: PlayerProfile;
  totalGamesAnalyzed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  avgRating: number;
  highestOpponentRating?: number;
  avgGameLength: number;
  mostPlayedOpening?: OpeningStat;
  mostCommonTimeControl?: string;
  openingStats: OpeningStat[];
  brilliantGamesCount: number;
  blunderGamesCount: number;
  recentForm: ('W' | 'L' | 'D')[];
  factualSummaryPoints: string[];
}

export interface ProviderConfig {
  chessComApiEnabled: boolean;
  chessComAuthorized: boolean;
  activeProvider: 'chess_com' | 'lichess' | 'pgn_import';
  statusMessage: string;
}

export interface GitHubRepo {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
  updatedAt: string;
  url: string;
  ownerAvatar?: string;
}

export interface URLPreview {
  url: string;
  title: string;
  description: string;
  image?: string;
  favicon?: string;
  canonicalUrl?: string;
  domain: string;
}

export interface AnalysisJob {
  jobId: string;
  username: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  processedGames: number;
  totalGames: number;
  stage: string;
  currentArchive?: string;
  error?: string;
}

export interface GameFilterState {
  searchQuery: string;
  result: 'all' | 'win' | 'loss' | 'draw';
  color: 'all' | 'white' | 'black';
  timeClass: 'all' | 'bullet' | 'blitz' | 'rapid' | 'daily';
  classification: 'all' | GameClassification;
  opening: string;
  minRating: number;
  maxRating: number;
  sortBy: 'date_desc' | 'date_asc' | 'rating_desc' | 'accuracy_desc' | 'brilliant_desc';
}
