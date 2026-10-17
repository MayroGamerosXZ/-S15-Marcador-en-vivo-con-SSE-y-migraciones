import React from 'react';

interface Props {
  teamName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const TeamLogo: React.FC<Props> = ({ teamName, size = 'md', className = '' }) => {
  const norm = teamName.toLowerCase();

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24 sm:w-28 sm:h-28'
  }[size];

  // Escudo Real Madrid
  if (norm.includes('madrid')) {
    return (
      <div className={`relative flex items-center justify-center shrink-0 drop-shadow-[0_4px_12px_rgba(254,190,16,0.35)] ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 120" className="w-full h-full">
          {/* Corona */}
          <path d="M25 35 L30 18 L50 28 L70 18 L75 35 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          <circle cx="30" cy="18" r="3" fill="#EF4444" />
          <circle cx="50" cy="28" r="3.5" fill="#3B82F6" />
          <circle cx="70" cy="18" r="3" fill="#EF4444" />
          <circle cx="50" cy="12" r="3" fill="#F59E0B" />
          {/* Círculo base dorado */}
          <circle cx="50" cy="70" r="42" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="6" />
          <circle cx="50" cy="70" r="37" fill="#F8FAFC" stroke="#3B82F6" strokeWidth="2.5" />
          {/* Banda diagonal morada/azul */}
          <path d="M22 45 L78 95" stroke="#6366F1" strokeWidth="11" strokeLinecap="round" />
          {/* Letras entrelazadas MFC */}
          <text x="50" y="78" fontFamily="'Teko', sans-serif" fontSize="32" fontWeight="900" fill="#F59E0B" textAnchor="middle">M</text>
          <text x="44" y="72" fontFamily="'Teko', sans-serif" fontSize="22" fontWeight="900" fill="#1E3A8A" textAnchor="middle">F</text>
          <text x="56" y="80" fontFamily="'Teko', sans-serif" fontSize="22" fontWeight="900" fill="#1E3A8A" textAnchor="middle">C</text>
        </svg>
      </div>
    );
  }

  // Escudo FC Barcelona
  if (norm.includes('barcelona') || norm.includes('barça')) {
    return (
      <div className={`relative flex items-center justify-center shrink-0 drop-shadow-[0_4px_14px_rgba(165,0,68,0.45)] ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 110" className="w-full h-full">
          {/* Forma de escudo */}
          <path d="M10 20 Q50 10 90 20 C90 60 75 95 50 108 C25 95 10 60 10 20 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="3" />
          {/* Sección superior izquierda: Cruz de San Jorge */}
          <clipPath id="barcaTopLeft">
            <path d="M14 22 L50 22 L50 50 L14 50 Z" />
          </clipPath>
          <rect x="14" y="22" width="36" height="28" fill="#FFFFFF" clipPath="url(#barcaTopLeft)" />
          <path d="M30 22 L30 50 M14 36 L50 36" stroke="#DC2626" strokeWidth="6" clipPath="url(#barcaTopLeft)" />
          {/* Sección superior derecha: Barras de Cataluña (Senyera) */}
          <clipPath id="barcaTopRight">
            <path d="M50 22 L86 22 L86 50 L50 50 Z" />
          </clipPath>
          <rect x="50" y="22" width="36" height="28" fill="#FBBF24" clipPath="url(#barcaTopRight)" />
          <path d="M57 22 L57 50 M66 22 L66 50 M75 22 L75 50 M84 22 L84 50" stroke="#DC2626" strokeWidth="3.5" clipPath="url(#barcaTopRight)" />
          {/* Banda central dorada con FCB */}
          <rect x="13" y="50" width="74" height="12" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
          <text x="50" y="60" fontFamily="'Inter', sans-serif" fontSize="8" fontWeight="900" fill="#0F172A" textAnchor="middle" letterSpacing="2">FCB</text>
          {/* Sección inferior: Franjas azulgrana */}
          <clipPath id="barcaBottom">
            <path d="M13 62 C13 75 25 95 50 105 C75 95 87 75 87 62 Z" />
          </clipPath>
          <rect x="13" y="62" width="74" height="45" fill="#1E3A8A" clipPath="url(#barcaBottom)" />
          <path d="M32 62 L32 105 M50 62 L50 105 M68 62 L68 105" stroke="#991B1B" strokeWidth="9" clipPath="url(#barcaBottom)" />
          {/* Balón clásico central */}
          <circle cx="50" cy="80" r="8" fill="#FDE047" stroke="#78350F" strokeWidth="1.5" />
          <path d="M46 76 L54 76 L57 82 L50 86 L43 82 Z" fill="#78350F" opacity="0.6" />
        </svg>
      </div>
    );
  }

  // Escudo Manchester City
  if (norm.includes('city') || norm.includes('manchester city')) {
    return (
      <div className={`relative flex items-center justify-center shrink-0 drop-shadow-[0_4px_12px_rgba(108,171,221,0.4)] ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Círculo exterior azul cielo */}
          <circle cx="50" cy="50" r="46" fill="#6CABDD" stroke="#001838" strokeWidth="3" />
          <circle cx="50" cy="50" r="41" fill="#FFFFFF" stroke="#6CABDD" strokeWidth="2" />
          {/* Escudo interior */}
          <path d="M30 35 Q50 30 70 35 C70 58 60 70 50 78 C40 70 30 58 30 35 Z" fill="#6CABDD" stroke="#001838" strokeWidth="2" />
          {/* Barco dorado de Manchester */}
          <path d="M40 45 L60 45 L55 52 L45 52 Z" fill="#F59E0B" />
          <path d="M50 38 L50 45 M45 42 L55 42" stroke="#FFFFFF" strokeWidth="2" />
          {/* Rosa roja de Lancashire */}
          <circle cx="50" cy="65" r="5" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
          {/* Texto MANCHESTER CITY */}
          <text x="50" y="24" fontFamily="'Inter', sans-serif" fontSize="7" fontWeight="900" fill="#001838" textAnchor="middle" letterSpacing="1">MANCHESTER</text>
          <text x="50" y="88" fontFamily="'Inter', sans-serif" fontSize="7" fontWeight="900" fill="#001838" textAnchor="middle" letterSpacing="1">CITY</text>
        </svg>
      </div>
    );
  }

  // Escudo Liverpool FC
  if (norm.includes('liverpool')) {
    return (
      <div className={`relative flex items-center justify-center shrink-0 drop-shadow-[0_4px_14px_rgba(200,16,46,0.45)] ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 115" className="w-full h-full">
          {/* Shankly Gates & You'll Never Walk Alone */}
          <rect x="25" y="10" width="50" height="8" rx="2" fill="#00B2A9" stroke="#004C45" strokeWidth="1" />
          <text x="50" y="16" fontFamily="'Inter', sans-serif" fontSize="4.5" fontWeight="900" fill="#FFFFFF" textAnchor="middle">YOU'LL NEVER WALK ALONE</text>
          {/* Escudo Rojo principal */}
          <path d="M22 24 Q50 18 78 24 C78 70 65 95 50 108 C35 95 22 70 22 24 Z" fill="#C8102E" stroke="#F6EB61" strokeWidth="3" />
          {/* Llamas eternas laterales */}
          <path d="M14 45 Q10 38 15 32 Q18 42 14 45 Z" fill="#EF4444" />
          <path d="M86 45 Q90 38 85 32 Q82 42 86 45 Z" fill="#EF4444" />
          {/* Liver Bird mítico dorado */}
          <path d="M50 42 C45 42 42 46 42 52 C42 60 48 68 48 76 L52 76 C52 68 58 60 58 52 C58 46 55 42 50 42 Z" fill="#F6EB61" />
          <circle cx="50" cy="46" r="3.5" fill="#F6EB61" />
          <path d="M40 56 L60 56 L55 64 L45 64 Z" fill="#F6EB61" />
          <text x="50" y="94" fontFamily="'Teko', sans-serif" fontSize="16" fontWeight="700" fill="#FFFFFF" textAnchor="middle">L.F.C.</text>
        </svg>
      </div>
    );
  }

  // Escudo Bayern Múnich
  if (norm.includes('bayern') || norm.includes('múnich') || norm.includes('munich')) {
    return (
      <div className={`relative flex items-center justify-center shrink-0 drop-shadow-[0_4px_14px_rgba(220,5,45,0.45)] ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Anillo exterior rojo vivo */}
          <circle cx="50" cy="50" r="46" fill="#DC052D" stroke="#FFFFFF" strokeWidth="2" />
          {/* Anillo de texto blanco */}
          <circle cx="50" cy="50" r="38" fill="#FFFFFF" stroke="#DC052D" strokeWidth="2" />
          <circle cx="50" cy="50" r="26" fill="#0066B2" />
          {/* Rombo / Diamantes bávaros */}
          <clipPath id="bayernInner">
            <circle cx="50" cy="50" r="26" />
          </clipPath>
          <g clipPath="url(#bayernInner)">
            <rect x="20" y="20" width="60" height="60" fill="#0066B2" />
            <path d="M10 20 L90 70 M25 15 L95 55 M5 35 L85 85" stroke="#FFFFFF" strokeWidth="6" strokeDasharray="8 8" />
            <path d="M90 20 L10 70 M95 15 L25 55 M85 35 L5 85" stroke="#FFFFFF" strokeWidth="6" strokeDasharray="8 8" />
          </g>
          <text x="50" y="21" fontFamily="'Inter', sans-serif" fontSize="6.5" fontWeight="900" fill="#DC052D" textAnchor="middle">FC BAYERN</text>
          <text x="50" y="87" fontFamily="'Inter', sans-serif" fontSize="6" fontWeight="900" fill="#DC052D" textAnchor="middle">MÜNCHEN</text>
        </svg>
      </div>
    );
  }

  // Escudo Borussia Dortmund
  if (norm.includes('dortmund') || norm.includes('borussia') || norm.includes('bvb')) {
    return (
      <div className={`relative flex items-center justify-center shrink-0 drop-shadow-[0_4px_14px_rgba(253,225,0,0.5)] ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Círculo Amarillo Eléctrico */}
          <circle cx="50" cy="50" r="46" fill="#FDE100" stroke="#000000" strokeWidth="4" />
          <circle cx="50" cy="50" r="42" fill="#FDE100" stroke="#000000" strokeWidth="2" />
          {/* Letras BVB 09 en negro */}
          <text x="50" y="55" fontFamily="'Inter', sans-serif" fontSize="24" fontWeight="900" fill="#000000" textAnchor="middle" letterSpacing="-1">BVB</text>
          <text x="50" y="75" fontFamily="'Inter', sans-serif" fontSize="17" fontWeight="900" fill="#000000" textAnchor="middle">09</text>
        </svg>
      </div>
    );
  }

  // Fallback genérico estilo escudo de club elegante
  return (
    <div className={`relative flex items-center justify-center shrink-0 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border-2 border-emerald-500/40 text-emerald-300 font-black shadow-lg ${sizeClasses} ${className}`}>
      <span className="font-scoreboard text-xl uppercase tracking-wider">
        {teamName.substring(0, 3)}
      </span>
    </div>
  );
};
