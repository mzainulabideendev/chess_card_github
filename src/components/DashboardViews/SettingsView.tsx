import React from 'react';
import { ShieldCheck, ShieldAlert, Server, CheckCircle, RefreshCw } from 'lucide-react';
import { ProviderConfig } from '../../types';

interface SettingsViewProps {
  providerConfig: ProviderConfig;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ providerConfig, onRefresh }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-xl font-bold text-slate-100">Integration Compliance & Authorization</h3>
              <p className="text-xs text-slate-400">System parameters and rate limiter status</p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-check Status
          </button>
        </div>

        {/* Configuration Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-400">CHESS_COM_API_ENABLED</span>
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              {providerConfig.chessComApiEnabled ? 'TRUE' : 'FALSE'}
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-400">CHESS_COM_AUTHORIZED</span>
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              {providerConfig.chessComAuthorized ? 'TRUE' : 'FALSE'}
            </div>
          </div>
        </div>

        {/* Status Box */}
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
          providerConfig.chessComAuthorized
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
            : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
        }`}>
          {providerConfig.chessComAuthorized ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-bold block">Deployment Status</span>
            <p className="mt-0.5">{providerConfig.statusMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
