import React from 'react';

export const SmartphoneMockup: React.FC = () => {
  return (
    <div className="relative w-32 sm:w-40 md:w-48 aspect-[9/18] bg-white rounded-[2.2rem] p-2.5 shadow-2xl border-4 border-slate-900/20 flex flex-col justify-between overflow-hidden shrink-0 select-none transition-transform duration-300 hover:scale-105">
      {/* Speaker / Notch */}
      <div className="w-10 sm:w-12 h-1.5 bg-slate-800/80 rounded-full mx-auto mb-2 shrink-0" />

      {/* Screen Frame */}
      <div className="flex-1 bg-gradient-to-b from-[#5c136a] via-[#480d54] to-[#2e0536] rounded-[1.4rem] p-2.5 flex flex-col justify-between items-center relative overflow-hidden border border-white/10 shadow-inner">
        {/* Subtle decorative curved ambient arc matching screenshot */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,186,19,0.18)_0%,transparent_75%)] pointer-events-none" />

        {/* Sparkling 4-point star icon in center */}
        <div className="my-auto flex flex-col items-center justify-center relative">
          <div className="relative">
            {/* 4-point sparkle icon with glowing shadow */}
            <svg
              className="w-12 h-12 sm:w-14 sm:h-14 text-white fill-white drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z" />
            </svg>
            <span className="absolute -top-1 -right-1 text-[#F5BA13] text-sm font-black animate-pulse select-none">
              +
            </span>
          </div>
        </div>

        {/* 4 Widget Pill Bars (2x2 Grid) */}
        <div className="w-full grid grid-cols-2 gap-1.5 pt-1 relative z-10 shrink-0">
          <div className="h-4 sm:h-5 rounded-lg bg-white/20 backdrop-blur-xs border border-white/10" />
          <div className="h-4 sm:h-5 rounded-lg bg-white/20 backdrop-blur-xs border border-white/10" />
          <div className="h-4 sm:h-5 rounded-lg bg-white/20 backdrop-blur-xs border border-white/10" />
          <div className="h-4 sm:h-5 rounded-lg bg-white/20 backdrop-blur-xs border border-white/10" />
        </div>
      </div>

      {/* Bottom Home Indicator */}
      <div className="w-10 sm:w-12 h-1 bg-slate-700/60 rounded-full mx-auto mt-2 shrink-0" />
    </div>
  );
};
