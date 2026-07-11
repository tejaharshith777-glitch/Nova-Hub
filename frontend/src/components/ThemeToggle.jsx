import React, { useEffect, useState } from 'react';
import gsap from 'gsap';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    // Read from localStorage or default to light mode
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('novahub_theme');
      if (saved) return saved;
      // Default to light
      return 'light';
    }
    return 'light';
  });

  // Apply theme to document documentElement
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('novahub_theme', theme);
  }, [theme]);

  // Click toggle handler
  const handleToggle = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);

    // Spin/Scale click animation for button
    gsap.fromTo(
      '.theme-icon-container',
      { scale: 0.5, rotate: -180, opacity: 0.2 },
      { scale: 1, rotate: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' }
    );
  };

  return (
    <div className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center select-none font-mono">
      {/* Floating Capsule Container */}
      <div 
        onClick={handleToggle}
        className={`relative flex flex-col items-center justify-between p-3.5 w-[75px] h-[105px] rounded-[2.5rem] border-[3px] border-[#1a1a1a] transition-all duration-500 cursor-pointer shadow-[6px_6px_0px_rgba(26,26,26,1)] hover:scale-105 active:scale-95 ${
          theme === 'light' 
            ? 'bg-gradient-to-b from-amber-100 via-yellow-50 to-orange-100 text-[#1a1a1a]' 
            : 'bg-gradient-to-b from-[#0e0f19] via-[#1a1c30] to-[#0a0b12] text-white border-white/20 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
        }`}
        title={theme === 'light' ? 'Switch to Night Mode' : 'Switch to Day Mode'}
      >
        {/* Dynamic Sky Cloud Backdrop Details */}
        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none opacity-20">
          {theme === 'light' ? (
            // Soft day clouds
            <div className="absolute -left-2 top-8 w-12 h-6 bg-white/70 rounded-full blur-[1px]" />
          ) : (
            // Stars in dark mode
            <>
              <div className="absolute left-4 top-6 w-[2px] h-[2px] bg-white rounded-full animate-ping" />
              <div className="absolute right-3 top-12 w-[1px] h-[1px] bg-white rounded-full" />
              <div className="absolute left-6 top-16 w-[1.5px] h-[1.5px] bg-white rounded-full" />
            </>
          )}
        </div>

        {/* Floating Sun/Moon Interactive Button */}
        <div className="theme-icon-container relative flex items-center justify-center w-10 h-10 mt-0.5 z-10">
          {theme === 'light' ? (
            // SUN: Bright gold/orange with glowing animated rays
            <div className="relative flex items-center justify-center w-full h-full">
              {/* Outer Glow Halo */}
              <div className="absolute w-8 h-8 bg-yellow-400/30 rounded-full blur-md animate-pulse" />
              {/* Rays */}
              <svg className="absolute w-10 h-10 text-amber-500 animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 8" />
              </svg>
              {/* Sun Core */}
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-amber-500 border border-orange-500 shadow-[0_0_10px_#f59e0b]" />
            </div>
          ) : (
            // MOON: Silver cratered orb with orbit ring
            <div className="relative flex items-center justify-center w-full h-full">
              {/* Orbiting Ring */}
              <div className="absolute w-10 h-3.5 border border-white/20 rounded-full rotate-[-15deg] pointer-events-none" />
              {/* Lunar soft glow */}
              <div className="absolute w-8 h-8 bg-blue-400/20 rounded-full blur-sm" />
              {/* Moon Core (Cratered Orb) */}
              <div className="relative w-5 h-5 rounded-full bg-gradient-to-br from-slate-100 to-slate-400 border border-slate-300 flex items-center justify-center shadow-[0_0_8px_rgba(255,255,255,0.4)] overflow-hidden">
                {/* Crates details */}
                <div className="absolute top-0.5 left-1.5 w-1 h-1 rounded-full bg-slate-400/40" />
                <div className="absolute bottom-1.5 right-1 w-1.5 h-1.5 rounded-full bg-slate-400/40" />
                <div className="absolute bottom-1 left-1.5 w-0.8 h-0.8 rounded-full bg-slate-400/40" />
              </div>
            </div>
          )}
        </div>

        {/* Spaced Monospace Spaced Text */}
        <div className="flex flex-col items-center mt-1.5 z-10 select-none pointer-events-none">
          <span className="text-[8px] font-black uppercase tracking-[0.25em]">
            {theme === 'light' ? 'D A Y' : 'N I G H T'}
          </span>
        </div>
      </div>
    </div>
  );
};
export default ThemeToggle;
