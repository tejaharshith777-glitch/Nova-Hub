import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';

const Navbar = ({ user, handleLogout, handleRoleToggle, setIsAuthOpen }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#c4e4e3] border-b-[3px] border-[#1a1a1a] py-4 px-6 md:px-12 flex justify-between items-center shadow-sm">
      <Link to="/" className="flex items-center gap-2 group interactive-target" onClick={() => setIsMobileOpen(false)}>
        <div className="border-[3px] border-[#1a1a1a] bg-yellow-200 px-3 py-1 font-bold text-base uppercase tracking-tighter hover:bg-[#1a1a1a] hover:text-white transition-colors duration-150 shadow-[2px_2px_0px_rgba(26,26,26,1)]">
          NH
        </div>
        <span className="text-sm font-bold tracking-widest uppercase text-[#1a1a1a]">
          NOVA // <span className="underline decoration-yellow-400 decoration-[3px]">HUB</span>
        </span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider hidden md:flex text-[#1a1a1a]">
        <Link to="/" className="hover:underline decoration-yellow-400 decoration-2 interactive-target">
          Home
        </Link>
        
        <Link to={user ? "/dashboard?tab=host" : "/?auth=true"} className="hover:underline decoration-yellow-400 decoration-2 interactive-target">
          Host Event
        </Link>

        <Link to={user ? "/dashboard?tab=join" : "/?auth=true"} className="hover:underline decoration-yellow-400 decoration-2 interactive-target">
          Join Tournament
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
          <div className="flex items-center gap-3 bg-white border-[3px] border-[#1a1a1a] px-3.5 py-1 shadow-[3px_3px_0px_rgba(26,26,26,1)]">
            <span className="text-[10px] font-bold text-gaming-dark">
              {user.username} ({user.role})
            </span>
            <button
              onClick={handleRoleToggle}
              className="bg-yellow-100 hover:bg-yellow-200 border-l border-r border-[#1a1a1a] px-2 py-0.5 text-[9px] uppercase font-bold text-[#1a1a1a] interactive-target"
              title="Toggle host/player mode"
            >
              Swap
            </button>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 font-bold transition-colors interactive-target"
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
          className="text-[#1a1a1a] bg-white border-2 border-[#1a1a1a] p-1 shadow-[2px_2px_0px_rgba(26,26,26,1)] interactive-target"
        >
          {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {isMobileOpen && (
        <div className="absolute top-[67px] left-0 w-full bg-[#c4e4e3] border-b-[3px] border-[#1a1a1a] p-6 flex flex-col gap-4 md:hidden shadow-lg z-40 font-mono text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">
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
