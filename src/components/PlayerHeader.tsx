import React, { useState } from 'react';
import { ExternalLink, Trophy, Flame, Zap, Clock, ShieldCheck, Github, Plus, Check } from 'lucide-react';
import { PlayerProfile } from '../types';

interface PlayerHeaderProps {
  profile: PlayerProfile | null;
  totalGamesAnalyzed: number;
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = ({ profile, totalGamesAnalyzed }) => {
  const [githubUsername, setGithubUsername] = useState<string>(() => {
    return localStorage.getItem(`github_${profile?.username}`) || '';
  });
  const [isEditingGithub, setIsEditingGithub] = useState(false);
  const [githubInput, setGithubInput] = useState('');

  if (!profile) return null;

  const getRatingDisplay = (rating?: number) => {
    if (rating && rating > 0) return rating.toString();
    return 'Not available';
  };

  const handleSaveGithub = (e: React.FormEvent) => {
    e.preventDefault();
    if (githubInput.trim()) {
      const clean = githubInput.trim().replace('https://github.com/', '').replace('/', '');
      setGithubUsername(clean);
      localStorage.setItem(`github_${profile.username}`, clean);
    } else {
      setGithubUsername('');
      localStorage.removeItem(`github_${profile.username}`);
    }
    setIsEditingGithub(false);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl relative overflow-hidden">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* User Identity Section */}
        <div className="flex items-center gap-5">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.username}
              className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl object-cover border-2 border-amber-500/30 shadow-lg shadow-amber-500/10"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-amber-500/40 flex items-center justify-center text-slate-950 font-black text-3xl shadow-lg">
              {profile.username.substring(0, 2).toUpperCase()}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {profile.title && (
                <span className="bg-amber-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded tracking-wide uppercase">
                  {profile.title}
                </span>
              )}
              <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-100 tracking-tight">
                {profile.name || profile.username}
              </h2>
            </div>

            <p className="text-sm font-mono text-amber-400">@{profile.username}</p>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 flex-wrap">
              <span>Status: <strong className="text-slate-200 capitalize">{profile.status || 'Active'}</strong></span>
              {profile.followers !== undefined && (
                <span>Followers: <strong className="text-slate-200">{profile.followers.toLocaleString()}</strong></span>
              )}

              {/* GitHub Account Badge on User Card */}
              {githubUsername ? (
                <a
                  href={`https://github.com/${githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-mono transition-all"
                  title="GitHub Profile"
                >
                  <Github className="w-3 h-3 text-amber-400" />
                  github.com/{githubUsername}
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              ) : (
                !isEditingGithub && (
                  <button
                    onClick={() => { setGithubInput(''); setIsEditingGithub(true); }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700/60 rounded-lg text-[11px] font-mono transition-all"
                  >
                    <Github className="w-3 h-3" />
                    + Add GitHub
                  </button>
                )
              )}

              {isEditingGithub && (
                <form onSubmit={handleSaveGithub} className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={githubInput}
                    onChange={(e) => setGithubInput(e.target.value)}
                    placeholder="GitHub username"
                    autoFocus
                    className="px-2 py-0.5 bg-slate-950 border border-amber-500/60 rounded text-[11px] text-slate-100 placeholder-slate-500 font-mono focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold rounded text-[11px]"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingGithub(false)}
                    className="px-1.5 py-0.5 text-slate-400 hover:text-slate-200 text-[11px]"
                  >
                    ✕
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Ratings Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
          {/* Rapid */}
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl text-center min-w-[110px]">
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] font-medium mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Rapid
            </div>
            <div className="text-lg font-mono font-bold text-slate-100">
              {getRatingDisplay(profile.ratings.rapid?.rating)}
            </div>
          </div>

          {/* Blitz */}
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl text-center min-w-[110px]">
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] font-medium mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Blitz
            </div>
            <div className="text-lg font-mono font-bold text-slate-100">
              {getRatingDisplay(profile.ratings.blitz?.rating)}
            </div>
          </div>

          {/* Bullet */}
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl text-center min-w-[110px]">
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] font-medium mb-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Bullet
            </div>
            <div className="text-lg font-mono font-bold text-slate-100">
              {getRatingDisplay(profile.ratings.bullet?.rating)}
            </div>
          </div>
        </div>

        {/* Games Analyzed Counter & Profile Link */}
        <div className="flex flex-col items-start lg:items-end justify-between gap-3 w-full lg:w-auto border-t lg:border-t-0 border-slate-800 pt-4 lg:pt-0">
          <div className="text-left lg:text-right">
            <span className="text-xs text-slate-400 font-medium block">Games Analyzed</span>
            <span className="text-2xl font-mono font-extrabold text-amber-400">
              {totalGamesAnalyzed > 0 ? totalGamesAnalyzed.toLocaleString() : '0'}
            </span>
          </div>

          {profile.url ? (
            <a
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-all"
            >
              View Chess.com Profile
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-xs text-slate-500 font-mono">Not available</span>
          )}
        </div>
      </div>
    </div>
  );
};
