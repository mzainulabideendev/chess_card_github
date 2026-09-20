import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';
import { URLPreview } from '../types';

interface URLPreviewCardProps {
  preview: URLPreview;
}

export const URLPreviewCard: React.FC<URLPreviewCardProps> = ({ preview }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between">
      {preview.image && (
        <div className="w-full h-40 overflow-hidden bg-slate-950">
          <img
            src={preview.image}
            alt={preview.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            {preview.favicon ? (
              <img src={preview.favicon} alt="" className="w-3.5 h-3.5 rounded" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span className="truncate">{preview.domain}</span>
          </div>

          <h4 className="text-sm font-bold text-slate-100 line-clamp-2">{preview.title}</h4>
          <p className="text-xs text-slate-400 line-clamp-3">{preview.description}</p>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex justify-end">
          <a
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            Open Website
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
