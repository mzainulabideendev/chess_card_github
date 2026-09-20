import React from 'react';
import { Star, GitFork, ExternalLink, Code2, Clock } from 'lucide-react';
import { GitHubRepo } from '../types';

interface GitHubCardProps {
  repo: GitHubRepo;
}

export const GitHubCard: React.FC<GitHubCardProps> = ({ repo }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate text-slate-100 font-bold text-sm">
            <Code2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{repo.fullName}</span>
          </div>

          <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
            {repo.language}
          </span>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2">{repo.description}</p>
      </div>

      {/* Topics */}
      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {repo.topics.slice(0, 4).map((t) => (
            <span key={t} className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Stats & Link Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            {repo.stars.toLocaleString()}
          </span>

          <span className="flex items-center gap-1">
            <GitFork className="w-3.5 h-3.5 text-slate-400" />
            {repo.forks.toLocaleString()}
          </span>
        </div>

        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
        >
          Open Repo
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
