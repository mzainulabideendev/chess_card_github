import React, { useState } from 'react';
import {
  X,
  Code,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  FileText,
  Download,
  Eye,
  Settings,
  Layers,
  Palette,
  Layout,
  Trophy,
  Zap,
  TrendingUp,
  Shield,
  BookOpen,
  AlertTriangle,
  Swords,
  Clock,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { ChessGame, GameClassification } from '../types';
import { generateGameMarkdown } from './PlayerReportModal';

interface EmbedModalProps {
  game: ChessGame | null;
  onClose: () => void;
}

export const EmbedModal: React.FC<EmbedModalProps> = ({ game, onClose }) => {
  const [activeSnippetTab, setActiveSnippetTab] = useState<'markdown' | 'html'>('markdown');
  const [embedWidth, setEmbedWidth] = useState(440);
  const [embedTheme, setEmbedTheme] = useState<'dark' | 'light' | 'emerald' | 'gold'>('dark');
  const [showEngine, setShowEngine] = useState(true);
  const [showPlayers, setShowPlayers] = useState(true);
  const [showMoves, setShowMoves] = useState(true);
  const [showKeyMoments, setShowKeyMoments] = useState(true);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  if (!game) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const embedUrl = `${currentOrigin}/embed/game/${game.id}?theme=${embedTheme}&engine=${showEngine}&players=${showPlayers}&moves=${showMoves}&moments=${showKeyMoments}`;

  // Generate HTML Iframe Snippet
  const iframeSnippet = `<iframe
  src="${embedUrl}"
  width="${embedWidth}"
  height="580"
  frameborder="0"
  loading="lazy"
  allow="clipboard-write">
</iframe>`;

  // Generate Real-time Markdown Card Snippet (for GitHub READMEs, Discord, Blogs)
  const rawMarkdownText = generateGameMarkdown(game);

  const githubBadgeMarkdown = `[![Chess Game: ${game.white.username} vs ${game.black.username}](${currentOrigin}/api/badge/${game.id}?theme=${embedTheme})](${game.url || `${currentOrigin}/game/${game.id}`})`;

  const fullMarkdownCardSnippet = `### ♟️ Chess Game Analysis: ${game.white.username} vs ${game.black.username}

${githubBadgeMarkdown}

**Result:** ${game.white.result === 'win' ? '1' : game.white.result === 'draw' ? '½' : '0'} - ${game.black.result === 'win' ? '1' : game.black.result === 'draw' ? '½' : '0'} | **Time Control:** ${game.timeClass.toUpperCase()} (${game.timeControl})
**Opening:** ${game.openingName || game.eco || 'Standard Chess'}
**Engine Accuracy:** ${game.analysis?.accuracyEstimate ? `${game.analysis.accuracyEstimate}%` : 'N/A'}
${game.analysis?.brilliantMovesCount ? `**Tactical Highlights:** ✦ ${game.analysis.brilliantMovesCount} Brilliant Move(s)` : ''}

<details>
<summary><b>Click to expand full game analysis & PGN record</b></summary>

\`\`\`pgn
${game.pgn}
\`\`\`

</details>`;

  const activeSnippet = activeSnippetTab === 'markdown' ? fullMarkdownCardSnippet : iframeSnippet;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(activeSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([rawMarkdownText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess-analysis-${game.white.username}-vs-${game.black.username}.md`;
    a.click();
  };

  // Card theme classes mapping for Live Preview
  const themeCardStyles = {
    dark: 'bg-slate-950 border-amber-500/30 text-slate-100 shadow-amber-500/5',
    light: 'bg-slate-100 border-slate-300 text-slate-900 shadow-xl',
    emerald: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-500/10',
    gold: 'bg-amber-950/90 border-amber-500/50 text-amber-100 shadow-amber-500/20',
  };

  const accuracy = game.analysis?.accuracyEstimate;
  const brilliantCount = game.analysis?.brilliantMovesCount || 0;
  const greatCount = game.analysis?.greatMovesCount || 0;
  const keyMoment = game.analysis?.criticalMoments[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl relative overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                Live Embed & Markdown Card Studio
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  LIVE UPDATING
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Real-time synchronized preview for GitHub Readmes, Web, and Markdown Cards.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content: Split Grid */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
          {/* Left Column: Live Card Real-Time Preview */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-slate-200">
                <Eye className="w-4 h-4 text-amber-400" />
                Live Card Preview
              </span>
              <span>Width: {embedWidth}px</span>
            </div>

            {/* Live Interactive Preview Card Container */}
            <div className="flex justify-center bg-slate-950/80 p-6 rounded-2xl border border-slate-800/80 shadow-inner overflow-hidden">
              <div
                style={{ width: `${Math.min(embedWidth, 480)}px` }}
                className={`border rounded-2xl p-5 space-y-4 transition-all duration-300 shadow-2xl ${themeCardStyles[embedTheme]}`}
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1 font-extrabold tracking-wider uppercase text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    {game.analysis?.classification?.replace('_', ' ').toUpperCase() || 'CHESS CARD'}
                  </span>
                  <span className="opacity-70 font-semibold">{game.timeClass} • {game.movesCount} moves</span>
                </div>

                {/* Matchup & Players */}
                {showPlayers && (
                  <div className="space-y-1 py-1 border-y border-slate-800/60">
                    <div className="flex items-center justify-between font-bold text-sm">
                      <div className="truncate">
                        <span>{game.white.username}</span>
                        {game.white.rating && (
                          <span className="text-xs opacity-60 font-mono ml-1">({game.white.rating})</span>
                        )}
                      </div>
                      <span className="font-mono text-amber-400 px-2 py-0.5 bg-slate-900/80 rounded text-xs">
                        {game.white.result === 'win' ? '1' : game.white.result === 'draw' ? '½' : '0'} -{' '}
                        {game.black.result === 'win' ? '1' : game.black.result === 'draw' ? '½' : '0'}
                      </span>
                      <div className="truncate text-right">
                        {game.black.rating && (
                          <span className="text-xs opacity-60 font-mono mr-1">({game.black.rating})</span>
                        )}
                        <span>{game.black.username}</span>
                      </div>
                    </div>
                    {game.openingName && (
                      <p className="text-[11px] opacity-75 truncate italic">♟ {game.openingName}</p>
                    )}
                  </div>
                )}

                {/* Engine Accuracy & Badges */}
                {showEngine && (
                  <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="opacity-80">Estimated Accuracy</span>
                      <span className="text-emerald-400 font-extrabold">
                        {accuracy ? `${accuracy}%` : 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {brilliantCount > 0 && (
                        <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                          ✦ {brilliantCount} Brilliant
                        </span>
                      )}
                      {greatCount > 0 && (
                        <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                          ⭐ {greatCount} Great
                        </span>
                      )}
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                        ⚡ {game.analysis?.bestMovesCount || 0} Best
                      </span>
                    </div>
                  </div>
                )}

                {/* Key Moment Highlight */}
                {showKeyMoments && keyMoment && (
                  <div className="text-[11px] bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="font-bold text-amber-400">⚡ Key Moment (Move {keyMoment.moveNumber}):</span>
                    <p className="opacity-85 line-clamp-2">"{keyMoment.description}"</p>
                  </div>
                )}

                {/* Moves Preview */}
                {showMoves && (
                  <div className="text-[11px] font-mono opacity-80 pt-1 border-t border-slate-800/60 line-clamp-2">
                    <span className="font-bold text-slate-300 mr-1">Notation:</span>
                    {game.moveList.slice(0, 10).join(' ')}...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Customization & Real-Time Code Output */}
          <div className="lg:col-span-6 space-y-5 flex flex-col justify-between">
            {/* Real-time Customization Panel */}
            <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-200 border-b border-slate-800 pb-2">
                <Settings className="w-4 h-4 text-amber-400" />
                Real-Time Card Customizer
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Theme Style</label>
                  <select
                    value={embedTheme}
                    onChange={(e) => setEmbedTheme(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="dark">Dark Luxury</option>
                    <option value="light">Light Crisp</option>
                    <option value="emerald">Emerald Engine</option>
                    <option value="gold">Gold Champion</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Card Width ({embedWidth}px)</label>
                  <input
                    type="range"
                    min={320}
                    max={600}
                    step={10}
                    value={embedWidth}
                    onChange={(e) => setEmbedWidth(Number(e.target.value))}
                    className="w-full accent-amber-500 mt-2"
                  />
                </div>
              </div>

              {/* Toggle Controls */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEngine}
                    onChange={(e) => setShowEngine(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  Engine Analysis
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPlayers}
                    onChange={(e) => setShowPlayers(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  Player Info
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showKeyMoments}
                    onChange={(e) => setShowKeyMoments(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  Key Moments
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMoves}
                    onChange={(e) => setShowMoves(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  Move Notation
                </label>
              </div>
            </div>

            {/* Code Output Card Container */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                  <button
                    onClick={() => setActiveSnippetTab('markdown')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                      activeSnippetTab === 'markdown'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    GitHub Markdown Card
                  </button>

                  <button
                    onClick={() => setActiveSnippetTab('html')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                      activeSnippetTab === 'html'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    HTML Embed (&lt;iframe&gt;)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySnippet}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                  >
                    {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSnippet ? 'Copied Live Code!' : 'Copy Snippet'}
                  </button>

                  <button
                    onClick={handleDownloadMarkdown}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition-all"
                    title="Download .md File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Code Textarea Box */}
              <div className="relative">
                <textarea
                  readOnly
                  value={activeSnippet}
                  rows={8}
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 text-xs font-mono focus:outline-none select-all leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
