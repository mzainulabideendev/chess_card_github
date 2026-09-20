import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, Trophy, Zap, Clock, Flame, Calendar, Award } from 'lucide-react';
import { ChessGame, PlayerProfile, TimeClass } from '../types';

interface RatingProgressionChartProps {
  games: ChessGame[];
  profile: PlayerProfile | null;
}

export const RatingProgressionChart: React.FC<RatingProgressionChartProps> = ({
  games,
  profile,
}) => {
  const [selectedTimeClass, setSelectedTimeClass] = useState<'all' | TimeClass>('all');

  // Compute rating progression data from games
  const chartData = useMemo(() => {
    if (!games || games.length === 0) return [];

    const targetUsername = profile?.username.toLowerCase();

    // Sort games chronologically (oldest first for line chart)
    const sorted = [...games].sort((a, b) => (a.endTime || 0) - (b.endTime || 0));

    const filtered = sorted.filter((g) => {
      if (selectedTimeClass === 'all') return true;
      return g.timeClass === selectedTimeClass;
    });

    return filtered.map((g, index) => {
      const isWhite = g.white.username.toLowerCase() === targetUsername;
      const playerObj = isWhite ? g.white : g.black;
      const opponentObj = isWhite ? g.black : g.white;

      const dateStr = g.endTime
        ? new Date(g.endTime * 1000).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })
        : `Game #${index + 1}`;

      const fullDateStr = g.endTime
        ? new Date(g.endTime * 1000).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : `Game #${index + 1}`;

      return {
        gameNum: index + 1,
        date: dateStr,
        fullDate: fullDateStr,
        rating: playerObj.rating || 1200,
        opponentRating: opponentObj.rating || 1200,
        opponent: opponentObj.username,
        result: playerObj.result,
        timeClass: g.timeClass || 'unknown',
        accuracy: g.analysis?.accuracyEstimate || null,
      };
    });
  }, [games, profile?.username, selectedTimeClass]);

  // Calculate rating stats
  const ratingMin = chartData.length > 0 ? Math.min(...chartData.map((d) => d.rating)) : 0;
  const ratingMax = chartData.length > 0 ? Math.max(...chartData.map((d) => d.rating)) : 0;
  const currentRating = chartData.length > 0 ? chartData[chartData.length - 1].rating : 0;
  const firstRating = chartData.length > 0 ? chartData[0].rating : 0;
  const ratingDiff = currentRating - firstRating;

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-amber-500/40 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
            <span>{data.fullDate}</span>
            <span className="capitalize text-amber-400 font-semibold">{data.timeClass}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Player Rating:</span>
            <span className="text-amber-400 font-extrabold text-sm">{data.rating}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Opponent ({data.opponent}):</span>
            <span className="text-slate-200 font-bold">{data.opponentRating}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-400">Result:</span>
            <span
              className={`font-bold capitalize px-1.5 py-0.5 rounded ${
                data.result === 'win'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                  : data.result === 'draw'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-950 text-rose-300 border border-rose-500/30'
              }`}
            >
              {data.result}
            </span>
          </div>

          {data.accuracy !== null && (
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Game Accuracy:</span>
              <span className="text-cyan-300 font-bold">{data.accuracy}%</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Rating Progression Over Time
          </h3>
          <p className="text-xs text-slate-400">
            Historical rating progression tracked from recent games archive data.
          </p>
        </div>

        {/* Time Class Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setSelectedTimeClass('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedTimeClass === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedTimeClass('rapid')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedTimeClass === 'rapid'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rapid
          </button>
          <button
            onClick={() => setSelectedTimeClass('blitz')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedTimeClass === 'blitz'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Blitz
          </button>
          <button
            onClick={() => setSelectedTimeClass('bullet')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedTimeClass === 'bullet'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bullet
          </button>
        </div>
      </div>

      {/* Official Ratings Badges Bar */}
      {profile && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 font-mono text-xs">
          <div className="flex items-center justify-between px-2">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Rapid
            </span>
            <span className="text-slate-100 font-bold">
              {profile.ratings.rapid?.rating || 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between px-2">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Blitz
            </span>
            <span className="text-slate-100 font-bold">
              {profile.ratings.blitz?.rating || 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between px-2">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Bullet
            </span>
            <span className="text-slate-100 font-bold">
              {profile.ratings.bullet?.rating || 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between px-2">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              Daily
            </span>
            <span className="text-slate-100 font-bold">
              {profile.ratings.daily?.rating || 'N/A'}
            </span>
          </div>
        </div>
      )}

      {/* Main Chart Canvas */}
      {chartData.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-12 text-center text-slate-500 font-mono text-xs">
          No game rating points recorded for this time class selection.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  dy={5}
                />
                <YAxis
                  domain={['dataMin - 25', 'dataMax + 25']}
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Line
                  name="Player Rating"
                  type="monotone"
                  dataKey="rating"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#f59e0b', stroke: '#020617', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#fbbf24', stroke: '#f59e0b', strokeWidth: 3 }}
                />
                <Line
                  name="Opponent Rating"
                  type="monotone"
                  dataKey="opponentRating"
                  stroke="#475569"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom Summary Pill */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div>
              Peak Range: <span className="text-slate-200 font-bold">{ratingMin}</span> -{' '}
              <span className="text-amber-400 font-bold">{ratingMax}</span>
            </div>
            <div>
              Net Trend:{' '}
              <span
                className={`font-bold ${
                  ratingDiff > 0
                    ? 'text-emerald-400'
                    : ratingDiff < 0
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }`}
              >
                {ratingDiff > 0 ? `+${ratingDiff}` : ratingDiff} pts
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
