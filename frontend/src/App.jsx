import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { LogOut, ArrowRight, User, ShieldAlert } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import TournamentDetails from './pages/TournamentDetails';
import NotFound from './pages/NotFound';
import AuthModal from './components/AuthModal';
import VirtualCursor from './components/VirtualCursor';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';

const API_BASE_URL = 'http://localhost:5000';

export const App = () => {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check user session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.log('Session server check bypassed (using offline test state).');
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST' });
      setUser(null);
    } catch (err) {
      console.error(err);
    }
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
                  <Navigate to="/" replace />
                )
              }
            />
            <Route path="/tournament/:id" element={<TournamentDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />

        <Chatbot />

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
