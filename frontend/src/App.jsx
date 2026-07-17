import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import TournamentDetails from './pages/TournamentDetails';
import PremiumShowdown from './pages/PremiumShowdown';
import NotFound from './pages/NotFound';
import AuthModal from './components/AuthModal';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import TournamentRadar from './components/TournamentRadar';
import ThemeToggle from './components/ThemeToggle';
import SmoothScroll from './components/SmoothScroll';

// ─── Detect ?auth=true query param and auto-open login modal ─────────────────
const AuthQueryHandler = ({ setIsAuthOpen }) => {
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('auth') === 'true') {
      setIsAuthOpen(true);
      const newSearch = location.search.replace(/[?&]auth=true/, '').replace(/^&/, '?');
      window.history.replaceState({}, document.title, location.pathname + newSearch);
    }
  }, [location, setIsAuthOpen]);
  return null;
};

// ─── Resolve backend URL ──────────────────────────────────────────────────────
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  return '';
};
const API_BASE_URL = getApiBaseUrl();

// ─── Inner App (needs BrowserRouter context for hooks) ───────────────────────
const AppInner = () => {
  const [user, setUser]           = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading]     = useState(true);
  const navigate = useNavigate();

  // Session check — backend first, localStorage fallback for offline/demo
  useEffect(() => {
    const checkSession = async () => {
      // No backend available (Vercel / offline) → use localStorage only
      if (!API_BASE_URL) {
        try {
          const saved = localStorage.getItem('novahub_session');
          if (saved) setUser(JSON.parse(saved));
        } catch { localStorage.removeItem('novahub_session'); }
        setLoading(false);
        return;
      }

      // Try live backend session cookie
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
      } catch { /* backend unreachable */ }

      // Fallback to localStorage session (offline / Vercel preview)
      try {
        const saved = localStorage.getItem('novahub_session');
        if (saved) setUser(JSON.parse(saved));
      } catch { localStorage.removeItem('novahub_session'); }
      setLoading(false);
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    if (API_BASE_URL) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
      } catch { /* ignore */ }
    }
    localStorage.removeItem('novahub_session');
    setUser(null);
  };

  const handleRoleToggle = () => {
    if (!user) return;
    const newRole = user.role === 'host' ? 'participant' : 'host';
    setUser(prev => ({ ...prev, role: newRole }));
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#c4e4e3] dark:bg-[#090b11] flex flex-col items-center justify-center gap-4 text-[#1a1a1a] dark:text-white font-mono">
        <div className="border-[3px] border-[#1a1a1a] dark:border-white/20 bg-yellow-200 dark:bg-yellow-900/30 px-6 py-4 font-black uppercase tracking-widest text-sm animate-pulse">
          ⚡ Nova Hub Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#c4e4e3] dark:bg-[#090b11] text-[#1a1a1a] dark:text-[#f3f4f6] font-mono selection:bg-yellow-300 relative overflow-x-hidden transition-colors duration-300">

      {/* Auto-open auth modal on ?auth=true */}
      <AuthQueryHandler setIsAuthOpen={setIsAuthOpen} />

      {/* Sticky Navbar */}
      <Navbar
        user={user}
        handleLogout={handleLogout}
        handleRoleToggle={handleRoleToggle}
        setIsAuthOpen={setIsAuthOpen}
      />

      {/* Page Routes */}
      <main className="relative">
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                onOpenAuth={() => setIsAuthOpen(true)}
                user={user}
                onNavigate={(path) => navigate(`/${path}`)}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              user
                ? <Dashboard apiBaseUrl={API_BASE_URL} user={user} onRoleToggle={handleRoleToggle} />
                : <Navigate to="/?auth=true" replace />
            }
          />
          <Route path="/tournament/:id" element={<TournamentDetails user={user} />} />
          <Route path="/radar"          element={<TournamentRadar  user={user} />} />
          <Route path="/showdown"       element={<PremiumShowdown  user={user} />} />
          <Route path="*"               element={<NotFound />} />
        </Routes>
      </main>

      <Footer />

      {/* Floating Gemini AI Chatbot */}
      <Chatbot apiBaseUrl={API_BASE_URL} />

      {/* Day / Night theme capsule toggle */}
      <ThemeToggle />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        apiBaseUrl={API_BASE_URL}
        onAuthSuccess={(userData) => setUser(userData)}
      />
    </div>
  );
};

// ─── Root App (provides BrowserRouter context) ────────────────────────────────
export const App = () => (
  <BrowserRouter>
    <SmoothScroll>
      <AppInner />
    </SmoothScroll>
  </BrowserRouter>
);

export default App;
