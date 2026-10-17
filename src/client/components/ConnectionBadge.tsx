import React from 'react';
import { ConnectionStatus } from '../types';
import { Radio, RefreshCw, AlertCircle } from 'lucide-react';

interface Props {
  status: ConnectionStatus;
  matchId?: number;
}

export const ConnectionBadge: React.FC<Props> = ({ status, matchId }) => {
  if (!matchId) return null;

  const config = {
    connected: {
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10',
      dot: 'bg-emerald-400 animate-ping',
      solidDot: 'bg-emerald-500',
      text: 'Conectado (SSE Activo)',
      icon: Radio
    },
    reconnecting: {
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-amber-500/10',
      dot: 'bg-amber-400 animate-ping',
      solidDot: 'bg-amber-500',
      text: 'Reconectando stream...',
      icon: RefreshCw
    },
    disconnected: {
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/40 shadow-rose-500/10',
      dot: 'bg-rose-400',
      solidDot: 'bg-rose-500',
      text: 'Desconectado',
      icon: AlertCircle
    }
  }[status];

  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md transition-all shadow-md ${config.color}`}>
      <span className="relative flex h-2.5 w-2.5">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}></span>
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.solidDot}`}></span>
      </span>
      <Icon className={`w-3.5 h-3.5 ${status === 'reconnecting' ? 'animate-spin' : ''}`} />
      <span>{config.text}</span>
    </div>
  );
};
