import React from 'react';

interface ClientLogoProps {
  name: string;
  type?: 'sunburst' | 'geometric' | 'quantum' | 'prism' | 'ferro' | 'abacus' | 'topview' | 'coderabbit' | 'higgsfield';
  className?: string;
  isLight?: boolean;
}

export const ClientLogo: React.FC<ClientLogoProps> = ({ name, type = 'sunburst', className = '', isLight = false }) => {
  const textColor = isLight ? 'text-neutral-900' : 'text-white';

  if (type === 'higgsfield') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        {/* Higgsfield Official Neon Lime Looping Ribbon Glyph */}
        <div className="w-8 h-8 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            <path
              d="M16 42 C 22 32, 32 32, 38 43 C 44 54, 50 63, 62 60 C 72 57, 78 65, 76 74 C 73 83, 58 85, 52 75 C 47 67, 52 52, 65 48 C 76 45, 82 54, 78 65"
              stroke="#D2FE27"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <span className={`font-bold tracking-tight text-lg font-['Space_Grotesk'] flex items-center ${isLight ? 'text-neutral-900' : 'text-[#D2FE27]'}`}>
          <span>Higgsfield</span>
        </span>
      </div>
    );
  }

  if (type === 'coderabbit') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        {/* CodeRabbit Official Orange Squircle Badge */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6B2B] via-[#FF5412] to-[#EE4400] text-white flex items-center justify-center p-1.5 shrink-0 shadow-md shadow-[#FF5412]/20 border border-white/10">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            {/* Soft inner depth shadow */}
            <path
              d="M75 42 C70.5 37 60 37.5 56.5 39 C55 34 50 24 43 21 C40.5 19.8 38 21.5 40 25.5 C43 31.5 49 37 53 38.5 C47 38.5 39 39 35 44 C33.5 46 34.5 47.5 37.5 48 C43.5 49 51 47.5 55 49 C48 51.5 38 56.5 34 65 C31 71.5 31 76 34 77.5 C36 78.5 39 77 39 74.5 C39 71 43 65.5 50 64 C56 62.5 61 65 62 70 C63 74 65.5 75 68 74 C71 73 70 68 67 63 C64 58 65 52 70 48.5 C74 45.5 76.5 43.5 75 42 Z"
              fill="#E03800"
              opacity="0.25"
              transform="translate(1, 1.5)"
            />
            {/* Primary Pure White CodeRabbit Silhouette */}
            <path
              d="M76 43 C71.5 37 60.5 37.5 57 39 C55.5 33.5 50.5 23.5 43.5 20.5 C41 19.5 38.5 21 40.5 25 C43.5 31 49.5 36.5 53.5 38 C47.5 38 39.5 38.5 35.5 43.5 C34 45.5 35 47 38 47.5 C44 48.5 51.5 47 55.5 48.5 C48.5 51 38.5 56 34.5 64.5 C31.5 71 31.5 75.5 34.5 77 C36.5 78 39.5 76.5 39.5 74 C39.5 70.5 43.5 65 50.5 63.5 C56.5 62 61.5 64.5 62.5 69.5 C63.5 73.5 66 74.5 68.5 73.5 C71.5 72.5 70.5 67.5 67.5 62.5 C64.5 57.5 65.5 51.5 70.5 48 C74.5 45 77.5 44 76 43 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>

        <span className={`font-black tracking-tight ${textColor} text-lg font-['Space_Grotesk'] flex items-center`}>
          <span>Code</span>
          <span className="text-[#FF5412]">Rabbit</span>
        </span>
      </div>
    );
  }

  if (type === 'topview') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        {/* Topview AI Authentic Icon Badge */}
        <div className="w-7 h-7 rounded-lg bg-black text-white border border-white/20 flex items-center justify-center p-1 shrink-0 shadow-xs">
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
            {/* Top-Left 4-Point Sparkle */}
            <path d="M37 19 C37 26 33 30 26 30 C33 30 37 34 37 41 C37 34 41 30 48 30 C41 30 37 26 37 19 Z" />
            {/* Dynamic Ascending Ribbon / Wave / Zigzag */}
            <path
              d="M18 73 C25 61 31 54 36 67 C41 80 47 76 54 53 C60 36 65 39 74 33 C84 45 74 58 64 69 C53 79 46 75 39 63 C33 52 28 59 23 79 Z"
            />
          </svg>
        </div>

        <span className={`font-black tracking-tight ${textColor} text-lg font-['Space_Grotesk'] flex items-center`}>
          <span>TOPVIEW</span>
          <span className="text-[#A855F7] ml-1">AI</span>
        </span>
      </div>
    );
  }

  if (type === 'abacus') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        {/* Abacus.AI Authentic Equalizer/Beads Vector Mark */}
        <svg
          className="w-7 h-7 shrink-0"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Column 1: Dark Slate top/bottom, Bright Cyan/Blue accent bead */}
          <rect x="2" y="3" width="3.2" height="6.5" rx="1.6" fill="#1E293B" />
          <circle cx="3.6" cy="16" r="2.8" fill="#007FFF" />
          <rect x="2" y="22.5" width="3.2" height="6.5" rx="1.6" fill="#1E293B" />

          {/* Column 2: Magenta bead at top, Dark pill below */}
          <rect x="9.5" y="1.5" width="3.2" height="5" rx="1.6" fill="#1E293B" />
          <circle cx="11.1" cy="10" r="2.8" fill="#D946EF" />
          <rect x="9.5" y="15.5" width="3.2" height="15" rx="1.6" fill="#1E293B" />

          {/* Column 3: Tall top pill, Turquoise bead, bottom pill */}
          <rect x="17" y="1.5" width="3.2" height="15" rx="1.6" fill="#1E293B" />
          <circle cx="18.6" cy="21.5" r="2.8" fill="#06B6D4" />
          <rect x="17" y="26.5" width="3.2" height="4" rx="1.6" fill="#1E293B" />

          {/* Column 4: Top pill, Violet/Purple bead, bottom pill */}
          <rect x="24.5" y="4" width="3.2" height="6.5" rx="1.6" fill="#1E293B" />
          <circle cx="26.1" cy="14" r="2.8" fill="#A855F7" />
          <rect x="24.5" y="20" width="3.2" height="8" rx="1.6" fill="#1E293B" />
        </svg>

        <span className={`font-black tracking-tight ${textColor} text-lg font-['Space_Grotesk'] flex items-center`}>
          <span>ABACUS</span>
          <span className="text-[#007FFF]">.</span>
          <span className="text-neutral-500 font-bold">AI</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {type === 'sunburst' && (
        <svg
          className={`w-6 h-6 ${textColor} shrink-0`}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Exact sunburst / fan geometry from LGPSM logo */}
          <path
            d="M5 24C5 24 10 16 17 14L15 24H5Z"
            fill="currentColor"
          />
          <path
            d="M8 24C8 24 13 13 22 10L19 24H8Z"
            fill="currentColor"
            opacity="0.85"
          />
          <path
            d="M12 24C12 24 17 9 26 8L23 24H12Z"
            fill="currentColor"
            opacity="0.7"
          />
          <path
            d="M17 24C17 24 21 6 29 6L27 24H17Z"
            fill="currentColor"
            opacity="0.5"
          />
        </svg>
      )}

      {type === 'geometric' && (
        <svg
          className={`w-6 h-6 ${textColor} shrink-0`}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="6" y="6" width="9" height="9" rx="2" fill="currentColor" />
          <rect x="17" y="6" width="9" height="9" rx="2" fill="currentColor" opacity="0.6" />
          <rect x="6" y="17" width="9" height="9" rx="2" fill="currentColor" opacity="0.6" />
          <rect x="17" y="17" width="9" height="9" rx="2" fill="currentColor" />
        </svg>
      )}

      {type === 'quantum' && (
        <svg
          className={`w-6 h-6 ${textColor} shrink-0`}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 3" />
          <circle cx="16" cy="16" r="4" fill="currentColor" />
        </svg>
      )}

      {type === 'prism' && (
        <svg
          className={`w-6 h-6 ${textColor} shrink-0`}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon points="16,5 27,25 5,25" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
          <line x1="16" y1="5" x2="16" y2="25" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
        </svg>
      )}

      {type === 'ferro' && (
        <svg
          className={`w-6 h-6 ${textColor} shrink-0`}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="8" fill="currentColor" />
          <circle cx="16" cy="6" r="2.5" fill="currentColor" />
          <circle cx="26" cy="16" r="2.5" fill="currentColor" />
          <circle cx="16" cy="26" r="2.5" fill="currentColor" />
          <circle cx="6" cy="16" r="2.5" fill="currentColor" />
        </svg>
      )}

      <span className={`font-extrabold tracking-tight ${textColor} text-lg uppercase font-['Space_Grotesk']`}>
        {name}
      </span>
    </div>
  );
};
