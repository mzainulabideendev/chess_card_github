import React from 'react';
import { ShieldCheck, ShieldAlert, Award, FileCode, Search, RefreshCw, Layers } from 'lucide-react';
import { ProviderConfig } from '../types';

interface NavbarProps {
  providerConfig: ProviderConfig;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewAnalysisClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  providerConfig,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Platform Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl tracking-tighter">
            ♞
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-100 text-lg tracking-tight">Chess Intel</h1>
              <span className="text-[10px] font-mono tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Real-Time Profile &amp; Game Intelligence
            </p>
          </div>
        </div>

        {/* Integration Status Indicator */}
        <div className="flex items-center gap-3 text-xs">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
              providerConfig.chessComAuthorized
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
            }`}
          >
            {providerConfig.chessComAuthorized ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            )}
            <span className="font-medium">
              {providerConfig.chessComAuthorized
                ? 'Chess.com PubAPI Authorized'
                : 'PGN Import Mode Active'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
