import React, { useState } from 'react';
import {
  Palette,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Code,
  Share2,
  RefreshCw,
  Zap,
  Flame,
  Award,
} from 'lucide-react';
import { PlayerProfile } from '../types';

interface ProfileStreakCardGeneratorProps {
  profile: PlayerProfile | null;
  winRate?: number;
  totalGames?: number;
  brilliantCount?: number;
  greatCount?: number;
  currentStreak?: number;
  longestStreak?: number;
}

interface ThemePreset {
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
  streakColor: string;
  logoColor: string;
}

const PRESET_THEMES: ThemePreset[] = [
  {
    name: 'GitHub Dark',
    backgroundColor: '#0d1117',
    textColor: '#dedede',
    accentColor: '#00abf0',
    borderColor: '#1e293b',
    streakColor: '#f59e0b',
    logoColor: '#81b64c',
  },
  {
    name: 'Dracula',
    backgroundColor: '#282a36',
    textColor: '#f8f8f2',
    accentColor: '#ff79c6',
    borderColor: '#6272a4',
    streakColor: '#50fa7b',
    logoColor: '#81b64c',
  },
  {
    name: 'Tokyo Night',
    backgroundColor: '#1a1b26',
    textColor: '#a9b1d6',
    accentColor: '#7aa2f7',
    borderColor: '#24283b',
    streakColor: '#bb9af7',
    logoColor: '#81b64c',
  },
  {
    name: 'Gold Champion',
    backgroundColor: '#1c1917',
    textColor: '#f5f5f4',
    accentColor: '#f59e0b',
    borderColor: '#44403c',
    streakColor: '#fbbf24',
    logoColor: '#f59e0b',
  },
  {
    name: 'Emerald Matrix',
    backgroundColor: '#022c22',
    textColor: '#ecfdf5',
    accentColor: '#10b981',
    borderColor: '#064e3b',
    streakColor: '#34d399',
    logoColor: '#10b981',
  },
  {
    name: 'Nord Frost',
    backgroundColor: '#2e3440',
    textColor: '#eceff4',
    accentColor: '#88c0d0',
    borderColor: '#434c5e',
    streakColor: '#a3be8c',
    logoColor: '#81b64c',
  },
  {
    name: "Synthwave '84",
    backgroundColor: '#241b2f',
    textColor: '#fdfdfd',
    accentColor: '#ff7edb',
    borderColor: '#473258',
    streakColor: '#fe4450',
    logoColor: '#ff7edb',
  },
  {
    name: 'Cyberpunk Neon',
    backgroundColor: '#0f172a',
    textColor: '#f8fafc',
    accentColor: '#06b6d4',
    borderColor: '#334155',
    streakColor: '#facc15',
    logoColor: '#81b64c',
  },
  {
    name: 'Light Crisp',
    backgroundColor: '#f8fafc',
    textColor: '#0f172a',
    accentColor: '#0284c7',
    borderColor: '#cbd5e1',
    streakColor: '#d97706',
    logoColor: '#81b64c',
  },
];

export const ProfileStreakCardGenerator: React.FC<ProfileStreakCardGeneratorProps> = ({
  profile,
  winRate = 65,
  totalGames = 35,
  brilliantCount = 8,
  greatCount = 14,
  currentStreak = 4,
  longestStreak = 11,
}) => {
  const [theme, setTheme] = useState<ThemePreset>(PRESET_THEMES[0]);
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [formatMode, setFormatMode] = useState<'markdown' | 'html'>('markdown');

  const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const [customOrigin, setCustomOrigin] = useState<string>(defaultOrigin);

  if (!profile) return null;

  const username = profile.username;

  const themeQueryParam = encodeURIComponent(
    JSON.stringify({
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor,
      accentColor: theme.accentColor,
      borderColor: theme.borderColor,
      streakColor: theme.streakColor,
      logoColor: theme.logoColor,
    })
  );

  const activeOrigin = customOrigin.trim() || defaultOrigin;
  const cardApiUrl = `${activeOrigin}/api/card-with-avatar?username=${username}&theme=${themeQueryParam}`;

  const markdownSnippet = `[![Chess Profile Card](${cardApiUrl})](https://chess.com/member/${username})`;
  const htmlSnippet = `<a href="https://chess.com/member/${username}">\n  <img src="${cardApiUrl}" alt="${username} Chess Score Card" width="520" />\n</a>`;

  const codeOutput = formatMode === 'markdown' ? markdownSnippet : htmlSnippet;

  const isLocalhost = activeOrigin.includes('localhost') || activeOrigin.includes('127.0.0.1');

  const handleCopyMd = () => {
    navigator.clipboard.writeText(codeOutput);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(cardApiUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Custom GitHub Profile & Rating Score Card
          </h3>
          <p className="text-xs text-slate-400">
            Generate and customize your dynamic Chess.com profile card with avatar, ratings, win rate, brilliant moves & great moves.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 flex-wrap bg-slate-950 p-2 rounded-2xl border border-slate-800 text-xs font-mono max-w-xl">
          {PRESET_THEMES.map((p) => (
            <button
              key={p.name}
              onClick={() => setTheme(p)}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                theme.name === p.name
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout: Live Card Preview + Customizer Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Real-time Live SVG Card Preview */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950/80 p-6 rounded-2xl border border-slate-800/80 shadow-inner space-y-4">
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
            Live Preview (Updates with Custom Colors & Real Stats)
          </span>

          <div className="w-full overflow-x-auto flex justify-center py-2">
            {/* SVG Interactive Render Container */}
            <div
              style={{
                backgroundColor: theme.backgroundColor,
                borderColor: theme.borderColor,
                color: theme.textColor,
              }}
              className="w-[510px] min-h-[205px] border-2 rounded-2xl p-5 shadow-2xl relative font-sans space-y-4 transition-all duration-300 shrink-0"
            >
              {/* Top-Right Official Chess.com Logo */}
              <div className="absolute top-4 right-5 pointer-events-none" style={{ color: theme.logoColor }}>
                <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
                  <path d="M12 2C10.62 2 9.5 3.12 9.5 4.5C9.5 5.57 10.17 6.48 11.12 6.85C9.77 7.55 8.8 8.92 8.56 10.53C9.58 10.19 10.75 10 12 10C13.25 10 14.42 10.19 15.44 10.53C15.2 8.92 14.23 7.55 12.88 6.85C13.83 6.48 14.5 5.57 14.5 4.5C14.5 3.12 13.38 2 12 2ZM6.33 12.08C6.12 12.89 6 13.73 6 14.6C6 16.63 6.64 18.51 7.73 20H16.27C17.36 18.51 18 16.63 18 14.6C18 13.73 17.88 12.89 17.67 12.08C16.03 11.39 14.09 11 12 11C9.91 11 7.97 11.39 6.33 12.08ZM4 21V22H20V21H4Z" />
                </svg>
              </div>

              {/* Top Row: Avatar + Name + Title */}
              <div className="flex items-center gap-4">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.username}
                    style={{ borderColor: theme.accentColor }}
                    className="w-16 h-16 rounded-full object-cover border-2 shadow-lg"
                  />
                ) : (
                  <div
                    style={{ backgroundColor: theme.accentColor }}
                    className="w-16 h-16 rounded-full flex items-center justify-center font-black text-xl text-slate-950 shadow-lg"
                  >
                    {profile.username.substring(0, 2).toUpperCase()}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    {profile.title && (
                      <span
                        style={{ backgroundColor: theme.accentColor, color: '#020617' }}
                        className="font-black text-[10px] px-2 py-0.5 rounded tracking-wide uppercase"
                      >
                        {profile.title}
                      </span>
                    )}
                    <h4 style={{ color: theme.textColor }} className="text-lg font-extrabold tracking-tight">
                      {profile.name || profile.username}
                    </h4>
                  </div>
                  <p style={{ color: theme.accentColor }} className="text-xs font-mono">
                    @{profile.username}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderColor: theme.borderColor }} className="border-t border-opacity-50" />

              {/* Stats Grid: Blitz/Rapid, Bullet, Win Rate, Longest Streak, Brilliant, Great */}
              <div className="space-y-3 font-mono">
                <div className="grid grid-cols-3 gap-2 text-left">
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wider block">Blitz / Rapid</span>
                    <span className="text-xs font-bold text-slate-100">
                      {profile.ratings.blitz?.rating || '1600'} / {profile.ratings.rapid?.rating || '1500'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wider block">Bullet Rating</span>
                    <span className="text-xs font-bold text-slate-200">
                      {profile.ratings.bullet?.rating || '1550'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wider block">Win Rate</span>
                    <span style={{ color: theme.accentColor }} className="text-xs font-bold">
                      {winRate}% ({totalGames}G)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-left pt-2 border-t border-slate-800/40">
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wider block">Longest Streak</span>
                    <span style={{ color: theme.streakColor }} className="text-xs font-extrabold">
                      {longestStreak} Wins
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wider block">Brilliant Moves</span>
                    <span style={{ color: theme.streakColor }} className="text-xs font-extrabold">
                      {brilliantCount} Moves
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wider block">Great Moves</span>
                    <span style={{ color: theme.accentColor }} className="text-xs font-extrabold">
                      {greatCount} Moves
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Custom Color Pickers & Snippet Exporter */}
        <div className="lg:col-span-5 space-y-4">
          {/* Custom Color Controls */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs font-mono">
            <span className="text-slate-300 font-bold block border-b border-slate-800 pb-2">
              🎨 Color Customizer
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-slate-200">{theme.backgroundColor}</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.textColor}
                    onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-slate-200">{theme.textColor}</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-slate-200">{theme.accentColor}</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Streak / Highlight</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.streakColor}
                    onChange={(e) => setTheme({ ...theme, streakColor: e.target.value })}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-slate-200">{theme.streakColor}</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Chess.com Logo Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.logoColor}
                    onChange={(e) => setTheme({ ...theme, logoColor: e.target.value })}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-slate-200">{theme.logoColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Markdown / HTML Code & Host Domain Settings */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-300 font-bold text-xs font-mono">
                GitHub Readme Integration Code
              </span>

              {/* Format Toggle */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
                <button
                  onClick={() => setFormatMode('markdown')}
                  className={`px-2 py-0.5 rounded ${formatMode === 'markdown' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Markdown
                </button>
                <button
                  onClick={() => setFormatMode('html')}
                  className={`px-2 py-0.5 rounded ${formatMode === 'html' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  HTML
                </button>
              </div>
            </div>

            {/* Custom Host Domain Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">
                Target App Host URL (Must be publicly accessible for GitHub READMEs)
              </label>
              <input
                type="text"
                value={customOrigin}
                onChange={(e) => setCustomOrigin(e.target.value)}
                placeholder="https://your-deployed-app.run.app"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {isLocalhost && (
              <div className="p-2 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[10px] text-amber-300 font-sans space-y-0.5">
                <p className="font-bold">⚠️ Localhost URL Detected</p>
                <p className="text-amber-300/80">
                  GitHub's servers (<span className="font-mono">camo.githubusercontent.com</span>) cannot fetch image URLs starting with <span className="font-mono">http://localhost</span>. Enter your live app URL above or use the shared URL when embedding in GitHub!
                </p>
              </div>
            )}

            <textarea
              readOnly
              value={codeOutput}
              rows={3}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 text-xs font-mono focus:outline-none select-all"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMd}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
              >
                {copiedMd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedMd ? 'Copied Code!' : `Copy ${formatMode === 'markdown' ? 'Markdown' : 'HTML'}`}
              </button>

              <button
                onClick={handleCopyUrl}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1"
                title="Copy Direct SVG URL"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ExternalLink className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
