import React from 'react';
import { Activity, ShieldCheck, Database, Tv, Sliders } from 'lucide-react';

interface Props {
  activeView: 'public' | 'admin';
  onViewChange: (view: 'public' | 'admin') => void;
  matchesCount: number;
}

export const Header: React.FC<Props> = ({ activeView, onViewChange, matchesCount }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo y título */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-xl">⚽</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wider uppercase text-white font-scoreboard text-2xl">
                Marcador <span className="text-emerald-400">En Vivo</span>
              </h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                SSE Stream
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>PostgreSQL & Drizzle ORM</span>
              <span className="text-slate-600">•</span>
              <span>{matchesCount} partidos disponibles</span>
            </p>
          </div>
        </div>

        {/* Selector de Vistas: Pública vs Administración */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => onViewChange('public')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeView === 'public'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Vista Pública</span>
          </button>
          <button
            onClick={() => onViewChange('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeView === 'admin'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Panel Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
