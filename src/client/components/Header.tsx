import React from 'react';
import { Tv, Sliders, Radio, Zap, Trophy } from 'lucide-react';

interface Props {
  activeView: 'public' | 'admin';
  onViewChange: (view: 'public' | 'admin') => void;
  matchesCount: number;
}

export const Header: React.FC<Props> = ({ activeView, onViewChange, matchesCount }) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo y Branding Deportivo Oficial */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 flex items-center justify-center shadow-xl shadow-emerald-500/25">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="text-2xl animate-pulse">⚽</span>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[9px] font-black text-slate-950">
              ✓
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase text-white font-scoreboard leading-none">
                LIVESCORE <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">PRO</span>
              </h1>
              <span className="bg-emerald-500/15 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                SSE LIVE
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 flex items-center gap-2 mt-0.5">
              <span className="text-emerald-400">Jornada en Directo</span>
              <span className="text-slate-600">•</span>
              <span>PostgreSQL & Drizzle ORM</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">{matchesCount} Partidos Sintonizables</span>
            </p>
          </div>
        </div>

        {/* Switch de Vistas: Pública vs Administración */}
        <div className="flex items-center bg-slate-900/95 p-1.5 rounded-2xl border border-slate-800 shadow-2xl">
          <button
            onClick={() => onViewChange('public')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 ${
              activeView === 'public'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Vista Espectador</span>
          </button>
          <button
            onClick={() => onViewChange('admin')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 ${
              activeView === 'admin'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/30 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Panel Árbitro</span>
          </button>
        </div>
      </div>
    </header>
  );
};
