import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LogOut, ArrowRight, User, ShieldAlert } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import TournamentDetails from './pages/TournamentDetails';
import PremiumShowdown from './pages/PremiumShowdown';
import NotFound from './pages/NotFound';
import AuthModal from './components/AuthModal';
import VirtualCursor from './components/VirtualCursor';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import TournamentRadar from './components/TournamentRadar';

// Detect query parameters inside router to auto-open Sign Up / Sign In modal
const AuthQueryHandler = ({ setIsAuthOpen }) => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('auth') === 'true') {
      setIsAuthOpen(true);
      // clean up URL search params without reload
      const newSearch = location.search.replace(/[?&]auth=true/, '').replace(/^&/, '?');
      window.history.replaceState({}, document.title, location.pathname + newSearch);
    }
  }, [location, setIsAuthOpen]);

  return null;
};

const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || '';
};

const API_BASE_URL = getApiBaseUrl();

export const App = () => {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check user session (backend first, fall back to localStorage)
  useEffect(() => {
    const checkSession = async () => {
      if (!API_BASE_URL) {
        // Skip calling backend if offline/not local
        try {
          const saved = localStorage.getItem('novahub_session');
          if (saved) setUser(JSON.parse(saved));
        } catch (e) {
          localStorage.removeItem('novahub_session');
        }
        setLoading(false);
        return;
      }

      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: 'include',
          signal: controller.signal
        });
        clearTimeout(t);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        // Backend unavailable — fall through to localStorage
      }
      // Restore session from localStorage (offline / Vercel fallback)
      try {
        const saved = localStorage.getItem('novahub_session');
        if (saved) setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('novahub_session');
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    if (API_BASE_URL) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, { 
          method: 'POST',
          credentials: 'include'
        });
      } catch (err) {
        // ignore if backend offline
      }
    }
    localStorage.removeItem('novahub_session');
    setUser(null);
  };

  const handleRoleToggle = () => {
    if (!user) return;
    const newRole = user.role === 'host' ? 'participant' : 'host';
    setUser(prev => ({ ...prev, role: newRole }));
    alert(`Test Mode: Role toggled to ${newRole.toUpperCase()}.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#c4e4e3] flex flex-col items-center justify-center gap-4 text-[#1a1a1a]">
        <div className="border-[3px] border-[#1a1a1a] bg-yellow-200 p-4 font-bold uppercase tracking-wider hard-shadow">
          Loading Nova Hub...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#c4e4e3] text-[#1a1a1a] font-mono selection:bg-yellow-300 relative overflow-x-hidden">
        {/* Helper to open auth modal when guest lands on ?auth=true */}
        <AuthQueryHandler setIsAuthOpen={setIsAuthOpen} />

        {/* Retro Custom Cursor Overlay */}
        <VirtualCursor />

        {/* Retro Header Sticky Navbar */}
        <Navbar 
          user={user} 
          handleLogout={handleLogout} 
          handleRoleToggle={handleRoleToggle} 
          setIsAuthOpen={setIsAuthOpen} 
        />

        {/* Main Content Router */}
        <main className="relative">
          <Routes>
            <Route
              path="/"
              element={
                <LandingPage
                  onOpenAuth={() => setIsAuthOpen(true)}
                  user={user}
                  onNavigate={(path) => {
                    window.location.href = `/${path}`;
                  }}
                />
              }
            />
            <Route
              path="/dashboard"
              element={
                user ? (
                  <Dashboard
                    apiBaseUrl={API_BASE_URL}
                    user={user}
                    onRoleToggle={handleRoleToggle}
                  />
                ) : (
                  <Navigate to="/?auth=true" replace />
                )
              }
            />
            <Route path="/tournament/:id" element={<TournamentDetails user={user} />} />
            <Route path="/radar" element={<TournamentRadar />} />
            <Route path="/showdown" element={<PremiumShowdown />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />

        <Chatbot apiBaseUrl={API_BASE_URL} />

        {/* Access Authentication Modal */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          apiBaseUrl={API_BASE_URL}
          onAuthSuccess={(userData) => setUser(userData)}
        />
      </div>
    </BrowserRouter>
  );
};
export default App;
