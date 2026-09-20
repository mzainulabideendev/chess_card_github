import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Swords,
  Sparkles,
  Settings,
} from 'lucide-react';

import {
  PlayerProfile,
  ChessGame,
  PlayerReport,
  ProviderConfig,
  AnalysisJob,
} from './types';

import { Navbar } from './components/Navbar';
import { ChessUsernameInput } from './components/ChessUsernameInput';
import { PlayerHeader } from './components/PlayerHeader';
import { GameDetailView } from './components/GameDetailView';
import { EmbedModal } from './components/EmbedModal';
import { PlayerReportModal, generateGameMarkdown } from './components/PlayerReportModal';

import { OverviewView } from './components/DashboardViews/OverviewView';
import { GamesView } from './components/DashboardViews/GamesView';
import { BrilliantMovesView } from './components/DashboardViews/BrilliantMovesView';
import { SettingsView } from './components/DashboardViews/SettingsView';

export default function App() {
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>({
    chessComApiEnabled: true,
    chessComAuthorized: true,
    activeProvider: 'chess_com',
    statusMessage: 'Chess.com official PubAPI integration active.',
  });

  const [activeTab, setActiveTab] = useState<
    'overview' | 'games' | 'brilliant' | 'settings'
  >('overview');

  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [games, setGames] = useState<ChessGame[]>([]);
  const [report, setReport] = useState<PlayerReport | null>(null);
  const [currentJob, setCurrentJob] = useState<AnalysisJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [selectedGameForDetail, setSelectedGameForDetail] = useState<ChessGame | null>(null);
  const [selectedGameForEmbed, setSelectedGameForEmbed] = useState<ChessGame | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Fetch provider status on mount
  useEffect(() => {
    fetch('/api/chess/provider-status')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.chessComAuthorized === 'boolean') {
          setProviderConfig((prev) => ({
            ...prev,
            chessComApiEnabled: data.chessComApiEnabled,
            chessComAuthorized: data.chessComAuthorized,
            statusMessage: data.statusMessage,
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Poll active analysis job
  useEffect(() => {
    let interval: any;
    if (currentJob && (currentJob.status === 'processing' || currentJob.status === 'queued')) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/chess/job/${currentJob.jobId}`);
          if (res.ok) {
            const updatedJob: AnalysisJob = await res.json();
            setCurrentJob(updatedJob);

            if (updatedJob.status === 'completed') {
              clearInterval(interval);
              // Load games & profile & report
              fetchUserGames(updatedJob.username);
              fetchUserReport(updatedJob.username);
              fetchUserProfile(updatedJob.username);
            } else if (updatedJob.status === 'failed') {
              clearInterval(interval);
              setError(updatedJob.error || 'Analysis pipeline encountered an error.');
            }
          }
        } catch {
          // ignore transient poll error
        }
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [currentJob?.jobId, currentJob?.status]);

  // Do not auto-load any user on initial mount so search bar starts clean and empty

  const fetchUserProfile = async (username: string) => {
    try {
      const res = await fetch(`/api/chess/profile/${encodeURIComponent(username)}`);
      if (res.ok) {
        const p: PlayerProfile = await res.json();
        setProfile(p);
      }
    } catch {
      // profile optional
    }
  };

  const fetchUserGames = async (username: string) => {
    try {
      const res = await fetch(`/api/chess/games/${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        setGames(data.games || []);
      }
    } catch {
      setGames([]);
    }
  };

  const fetchUserReport = async (username: string) => {
    try {
      const res = await fetch(`/api/player/${encodeURIComponent(username)}/report`);
      if (res.ok) {
        const rep: PlayerReport = await res.json();
        setReport(rep);
      }
    } catch {
      setReport(null);
    }
  };

  const handleAnalyzeUsername = async (username: string) => {
    setError(null);
    setProfile(null);
    setGames([]);
    setReport(null);

    try {
      const res = await fetch('/api/chess/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to start profile analysis.');
        return;
      }

      if (data.status === 'completed') {
        setCurrentJob({
          jobId: data.jobId,
          username,
          status: 'completed',
          processedGames: data.processedGames || 0,
          totalGames: data.totalGames || 0,
          stage: '✓ Analysis complete',
        });
        fetchUserGames(username);
        fetchUserReport(username);
        fetchUserProfile(username);
        return;
      }

      setCurrentJob({
        jobId: data.jobId,
        username,
        status: 'processing',
        processedGames: 0,
        totalGames: 0,
        stage: 'Validating username...',
      });
    } catch (err: any) {
      setError('We couldn\'t load this profile. Check network connection or authorization.');
    }
  };

  const handleImportPgn = async (pgnText: string) => {
    setError(null);
    try {
      const res = await fetch('/api/chess/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pgnText }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid PGN text provided.');
        return;
      }

      fetchUserGames(data.username);
      fetchUserReport(data.username);
      setProfile({
        username: data.username,
        ratings: {},
      });
    } catch {
      setError('Failed to process imported PGN text.');
    }
  };

  const handleExportMarkdown = (game: ChessGame) => {
    const md = generateGameMarkdown(game);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-analysis-${game.id}.md`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 antialiased flex flex-col">
      {/* Header Navigation */}
      <Navbar
        providerConfig={providerConfig}
        activeTab={activeTab}
        setActiveTab={(t: any) => setActiveTab(t)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Search Hero Input Component */}
        <ChessUsernameInput
          onAnalyzeUsername={handleAnalyzeUsername}
          currentJob={currentJob}
          error={error}
        />

        {/* Player Header Banner */}
        <PlayerHeader profile={profile} totalGamesAnalyzed={games.length} />

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-mono font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Overview
          </button>

          <button
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'games'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Swords className="w-4 h-4" />
            Games ({games.length})
          </button>

          <button
            onClick={() => setActiveTab('brilliant')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'brilliant'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Brilliant & Great Highlights
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ml-auto ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            Compliance & Status
          </button>
        </div>

        {/* Tab Views Switching */}
        {activeTab === 'overview' && (
          <OverviewView
            games={games}
            report={report}
            profile={profile}
            onOpenGame={(g) => setSelectedGameForDetail(g)}
            onShare={(g) => setSelectedGameForDetail(g)}
            onEmbed={(g) => setSelectedGameForEmbed(g)}
            onOpenReport={() => setIsReportModalOpen(true)}
          />
        )}

        {activeTab === 'games' && (
          <GamesView
            games={games}
            profile={profile}
            onOpenGame={(g) => setSelectedGameForDetail(g)}
            onShare={(g) => setSelectedGameForDetail(g)}
            onEmbed={(g) => setSelectedGameForEmbed(g)}
          />
        )}

        {activeTab === 'brilliant' && (
          <BrilliantMovesView
            games={games}
            onOpenGame={(g) => setSelectedGameForDetail(g)}
            onShare={(g) => setSelectedGameForDetail(g)}
            onEmbed={(g) => setSelectedGameForEmbed(g)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            providerConfig={providerConfig}
            onRefresh={() => {
              fetch('/api/chess/provider-status')
                .then((res) => res.json())
                .then((data) => setProviderConfig((prev) => ({ ...prev, ...data })));
            }}
          />
        )}
      </main>

      {/* Game Detail View Modal */}
      {selectedGameForDetail && (
        <GameDetailView
          game={selectedGameForDetail}
          onClose={() => setSelectedGameForDetail(null)}
          onShare={(g) => setSelectedGameForEmbed(g)}
          onEmbed={(g) => setSelectedGameForEmbed(g)}
          onExportMarkdown={handleExportMarkdown}
        />
      )}

      {/* Embed Modal */}
      {selectedGameForEmbed && (
        <EmbedModal
          game={selectedGameForEmbed}
          onClose={() => setSelectedGameForEmbed(null)}
        />
      )}

      {/* Player Report Modal */}
      {isReportModalOpen && (
        <PlayerReportModal
          report={report}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Platform Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-8 text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 font-mono">Chess Intel</span>
            <span className="text-slate-700">•</span>
            <span>Real-time player analytics &amp; game intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Powered by Official Chess.com PubAPI</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
