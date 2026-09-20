import React, { useState } from 'react';
import { Search, FileText, CheckCircle2, Circle, AlertCircle, Loader2 } from 'lucide-react';
import { AnalysisJob } from '../types';

interface ChessUsernameInputProps {
  onAnalyzeUsername: (username: string) => void;
  currentJob: AnalysisJob | null;
  error: string | null;
}

export const ChessUsernameInput: React.FC<ChessUsernameInputProps> = ({
  onAnalyzeUsername,
  currentJob,
  error,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onAnalyzeUsername(inputValue.trim());
  };

  const isProcessing = currentJob?.status === 'processing' || currentJob?.status === 'queued';

  // Determine stage checkmarks based on real job stage message
  const getStageStatus = (stageName: string) => {
    if (!currentJob || currentJob.status === 'queued') return 'pending';
    const stage = currentJob.stage.toLowerCase();

    if (stageName === 'profile') {
      if (stage.includes('profile loaded') || stage.includes('archives') || stage.includes('analyz') || currentJob.status === 'completed') {
        return 'completed';
      }
      if (stage.includes('validat') || stage.includes('profile')) return 'current';
      return 'pending';
    }

    if (stageName === 'archives') {
      if (stage.includes('archives') || stage.includes('analyz') || currentJob.status === 'completed') {
        return 'completed';
      }
      if (stage.includes('archives')) return 'current';
      return 'pending';
    }

    if (stageName === 'processing') {
      if (currentJob.status === 'completed') return 'completed';
      if (stage.includes('analyz') || stage.includes('processing')) return 'current';
      return 'pending';
    }

    if (stageName === 'report') {
      if (currentJob.status === 'completed') return 'completed';
      return 'pending';
    }

    return 'pending';
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
      {/* Glow background accent */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-100 tracking-tight">
            Analyze Chess.com Profile
          </h2>
          <p className="text-sm text-slate-400">
            Enter any public Chess.com username to fetch real game archives, compute positional metrics, and generate tactical analysis.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-slate-400 pointer-events-none">
              <Search className="w-5 h-5 text-amber-500" />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter Chess.com username (e.g. Hikaru, MagnusCarlsen, DanielNaroditsky)"
              disabled={isProcessing}
              className="w-full pl-12 pr-36 py-4 bg-slate-950/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono shadow-inner"
            />
            <button
              type="submit"
              disabled={isProcessing || !inputValue.trim()}
              className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Profile
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Notice */}
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl flex items-start gap-3 text-xs text-red-200">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Integration or Validation Alert</p>
              <p className="mt-0.5 text-red-200/90">{error}</p>
            </div>
          </div>
        )}

        {/* Real Progress Stage Tracker */}
        {currentJob && (
          <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300">
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                Pipeline Stage: {currentJob.stage}
              </span>
              <span className="font-mono text-amber-400">
                {currentJob.processedGames} / {currentJob.totalGames} Games
              </span>
            </div>

            {/* Stages List */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] pt-2 border-t border-slate-800/80 font-mono">
              <div className="flex items-center gap-1.5">
                {getStageStatus('profile') === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : getStageStatus('profile') === 'current' ? (
                  <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className={getStageStatus('profile') === 'completed' ? 'text-emerald-300 font-semibold' : 'text-slate-400'}>
                  Profile loaded
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {getStageStatus('archives') === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : getStageStatus('archives') === 'current' ? (
                  <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className={getStageStatus('archives') === 'completed' ? 'text-emerald-300 font-semibold' : 'text-slate-400'}>
                  Archives loaded
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {getStageStatus('processing') === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : getStageStatus('processing') === 'current' ? (
                  <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className={getStageStatus('processing') === 'completed' ? 'text-emerald-300 font-semibold' : 'text-slate-400'}>
                  Processing games
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {getStageStatus('report') === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className={getStageStatus('report') === 'completed' ? 'text-emerald-300 font-semibold' : 'text-slate-400'}>
                  Report generated
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
