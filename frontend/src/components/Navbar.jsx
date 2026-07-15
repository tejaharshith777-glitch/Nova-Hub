import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Menu, X, User } from 'lucide-react';

const Navbar = ({ user, handleLogout, handleRoleToggle, setIsAuthOpen }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#c4e4e3] dark:bg-[#07090d] border-b-[3px] border-[#1a1a1a] dark:border-white/10 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm transition-colors duration-300">
      <a
        href="/"
        className="flex items-center group interactive-target"
        onClick={(e) => {
          e.preventDefault();
          setIsMobileOpen(false);
          window.location.href = '/';
        }}
      >
        <div className="bg-[#0f1117] border-[2.5px] border-[#1a1a1a] dark:border-white/20 px-6 py-1.5 rounded-full flex items-center gap-5 transition-all duration-200 hover:scale-[1.03] shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.15)] select-none">
          <img
            src="/sports_flower_icon.png"
            alt="Sports Icon Collage"
            className="h-8 w-8 object-contain shrink-0 filter drop-shadow-sm"
          />
          <span className="font-display font-black text-sm md:text-base tracking-widest text-white whitespace-nowrap uppercase">
            NOVA <span className="text-gray-400 font-normal opacity-80">//</span> <span className="text-yellow-400 underline decoration-[3px] decoration-yellow-400 underline-offset-[5px]">HUB</span>
          </span>
        </div>
      </a>

      {/* Desktop Navigation */}
      <nav className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider hidden md:flex text-[#1a1a1a] dark:text-gray-300 transition-colors">
        <Link to="/" className="hover:underline decoration-yellow-400 decoration-2 interactive-target">
          Home
        </Link>
        
        <Link to={user ? "/dashboard?tab=host" : "/?auth=true"} className="hover:underline decoration-yellow-400 decoration-2 interactive-target">
          Host Event
        </Link>

        <Link to={user ? "/dashboard?tab=join" : "/?auth=true"} className="hover:underline decoration-yellow-400 decoration-2 interactive-target">
          Join Tournament
        </Link>

        <Link to="/showdown" className="hover:underline decoration-yellow-400 decoration-2 text-purple-700 hover:text-cyan-600 font-extrabold interactive-target flex items-center gap-0.5">
          ★ Showdown Arena
        </Link>

        <a
          href="/#contact"
          onClick={e => { e.preventDefault(); const el = document.getElementById('contact'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
          className="hover:underline decoration-yellow-400 decoration-2 interactive-target cursor-pointer"
        >
          Help Desk
        </a>

        {user && (
          <Link to="/dashboard" className="hover:underline decoration-yellow-400 decoration-2 interactive-target">
            Dashboard
          </Link>
        )}

        {user ? (
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border-[3px] border-[#1a1a1a] dark:border-white/10 px-3.5 py-1.5 shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.15)] rounded-xl transition-colors duration-300">
            <User className="w-3.5 h-3.5 text-purple-600 dark:text-cyan-400" />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#1a1a1a] dark:text-white truncate max-w-[120px] font-sans" title={user.username}>
              {user.username}
            </span>
            <span className="bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full font-sans">
              {user.role}
            </span>
            <button
              onClick={handleRoleToggle}
              className="bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 border-l border-r border-[#1a1a1a] dark:border-white/10 px-2 py-0.5 text-[9px] uppercase font-bold text-[#1a1a1a] dark:text-yellow-400 interactive-target"
              title="Toggle host/player mode"
            >
              Swap
            </button>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-bold transition-colors interactive-target"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthOpen(true)}
            className="bg-yellow-200 hover:bg-yellow-300 border-[3px] border-[#1a1a1a] text-[#1a1a1a] px-4 py-1.5 shadow-[4px_4px_0px_rgba(26,26,26,1)] active:shadow-[1px_1px_0px_rgba(26,26,26,1)] active:translate-x-[3px] active:translate-y-[3px] transition-all interactive-target"
          >
            Sign In
          </button>
        )}
      </nav>

      {/* Mobile Menu Action Bar */}
      <div className="flex md:hidden items-center gap-3">
        {user ? (
          <div className="flex items-center gap-2 bg-white border-2 border-[#1a1a1a] px-2.5 py-1 shadow-[2px_2px_0px_rgba(26,26,26,1)] text-[10px] font-bold">
            <span className="truncate max-w-[80px]">{user.username}</span>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 font-bold transition-colors interactive-target ml-1"
              title="Logout"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthOpen(true)}
            className="bg-yellow-200 hover:bg-yellow-300 border-2 border-[#1a1a1a] text-[#1a1a1a] text-[10px] font-black uppercase px-3 py-1 shadow-[2px_2px_0px_rgba(26,26,26,1)] interactive-target"
          >
            Sign In
          </button>
        )}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-[#1a1a1a] dark:text-white bg-white dark:bg-slate-900 border-2 border-[#1a1a1a] dark:border-white/10 p-1 shadow-[2px_2px_0px_rgba(26,26,26,1)] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.15)] interactive-target"
        >
          {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {isMobileOpen && (
        <div className="absolute top-[67px] left-0 w-full bg-[#c4e4e3] dark:bg-[#07090d] border-b-[3px] border-[#1a1a1a] dark:border-white/10 p-6 flex flex-col gap-4 md:hidden shadow-lg z-40 font-mono text-xs font-bold uppercase tracking-wider text-[#1a1a1a] dark:text-white transition-colors duration-300">
          <Link 
            to="/" 
            className="hover:underline decoration-yellow-400 decoration-2 py-2 interactive-target"
            onClick={() => setIsMobileOpen(false)}
          >
            Home
          </Link>
          <Link 
            to={user ? "/dashboard?tab=host" : "/?auth=true"} 
            className="hover:underline decoration-yellow-400 decoration-2 py-2 interactive-target"
            onClick={() => setIsMobileOpen(false)}
          >
            Host Event
          </Link>
          <Link 
            to={user ? "/dashboard?tab=join" : "/?auth=true"} 
            className="hover:underline decoration-yellow-400 decoration-2 py-2 interactive-target"
            onClick={() => setIsMobileOpen(false)}
          >
            Join Tournament
          </Link>
          <Link 
            to="/showdown" 
            className="hover:underline decoration-yellow-400 decoration-2 text-purple-700 font-extrabold py-2 interactive-target flex items-center gap-1"
            onClick={() => setIsMobileOpen(false)}
          >
            ★ Showdown Arena
          </Link>
          <a
            href="/#contact"
            onClick={e => {
              e.preventDefault();
              setIsMobileOpen(false);
              const el = document.getElementById('contact');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:underline decoration-yellow-400 decoration-2 py-2 interactive-target cursor-pointer block"
          >
            Help Desk
          </a>
          {user && (
            <>
              <Link 
                to="/dashboard" 
                className="hover:underline decoration-yellow-400 decoration-2 py-2 interactive-target"
                onClick={() => setIsMobileOpen(false)}
              >
                Dashboard
              </Link>
              <div className="border-t border-[#1a1a1a]/15 pt-4 flex flex-col gap-2">
                <div className="text-[10px] text-gray-600">Active Role: {user.role.toUpperCase()}</div>
                <button
                  onClick={() => {
                    handleRoleToggle();
                    setIsMobileOpen(false);
                  }}
                  className="bg-yellow-200 hover:bg-yellow-300 border-2 border-[#1a1a1a] py-2 px-4 shadow-[2px_2px_0px_rgba(26,26,26,1)] text-[10px] font-bold text-center uppercase interactive-target"
                >
                  Swap Role Mode
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
