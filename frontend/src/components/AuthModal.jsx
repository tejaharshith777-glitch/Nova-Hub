import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, Mail, User, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

// ─── Local mock auth ─────────────────────────────────────────────────────────
// Used when the backend server is offline (e.g. on Vercel preview).
// Stores users in localStorage so sign-up / login always works.
const MOCK_USERS_KEY = 'novahub_mock_users';
const SESSION_KEY    = 'novahub_session';

const getUsers = () => {
  try { return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]'); } catch { return []; }
};
const saveUsers = (users) => localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
const saveSession = (user) => localStorage.setItem(SESSION_KEY, JSON.stringify(user));

const mockLocalAuth = (isLogin, payload) => {
  const users = getUsers();

  if (isLogin) {
    // Find by email — or auto-create for smooth demo UX
    let stored = users.find(u => u.email === payload.email);
    if (!stored) {
      stored = {
        id: 'local-' + Date.now(),
        username: payload.email.split('@')[0],
        email: payload.email,
        password: payload.password,
        role: 'host'
      };
      users.push(stored);
      saveUsers(users);
    }
    const session = { id: stored.id, username: stored.username, role: stored.role };
    saveSession(session);
    return session;
  } else {
    // Sign up
    if (users.find(u => u.email === payload.email || u.username === payload.username)) {
      throw new Error('Username or Email is already in use.');
    }
    const newUser = {
      id: 'local-' + Date.now(),
      username: payload.username,
      email: payload.email,
      password: payload.password,
      role: payload.role || 'participant'
    };
    users.push(newUser);
    saveUsers(users);
    const session = { id: newUser.id, username: newUser.username, role: newUser.role };
    saveSession(session);
    return session;
  }
};
// ─────────────────────────────────────────────────────────────────────────────

export const AuthModal = ({ isOpen, onClose, apiBaseUrl, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('participant');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setUsername(''); setEmail(''); setPassword(''); setRole('participant');
    setError(''); setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload  = isLogin
      ? { email, password }
      : { username, email, password, role };

    let userData = null;

    // ── 1. Try the real backend (5-second timeout) ──────────────────────────
    try {
      const controller = new AbortController();
      const timeout    = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${apiBaseUrl}${endpoint}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
        credentials: 'include',
        signal:  controller.signal
      });
      clearTimeout(timeout);

      const data = await res.json();
      if (res.ok) {
        userData = data.user;
        // Also persist locally so Vercel / offline sessions survive
        saveSession(userData);
      } else {
        setError(data.message || 'Authentication failed. Please verify credentials.');
        setLoading(false);
        return;
      }
    } catch (err) {
      // ── 2. Backend unreachable → fall back to localStorage mock auth ──────
      try {
        userData = mockLocalAuth(isLogin, payload);
      } catch (mockErr) {
        setError(mockErr.message || 'Authentication failed.');
        setLoading(false);
        return;
      }
    }

    if (userData) {
      setSuccess(isLogin ? `Welcome back, ${userData.username}! 🎉` : `Account created! Welcome, ${userData.username}! 🎉`);
      setTimeout(() => {
        onAuthSuccess(userData);
        onClose();
        resetForm();
      }, 800);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#c4e4e3]/80 backdrop-blur-md z-[99999] p-4 font-mono select-none">
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white border-[3px] border-[#1a1a1a] w-full max-w-md p-8 md:p-10 rounded-2xl shadow-[8px_8px_0px_rgba(26,26,26,1)] relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8 border-b-[3px] border-[#1a1a1a] pb-4">
            <h3 className="text-2xl font-black font-display uppercase tracking-tight text-[#1a1a1a]">
              {isLogin ? 'Access Identity' : 'Register Profile'}
            </h3>
            <button 
              onClick={() => { onClose(); resetForm(); }}
              disabled={loading}
              className="text-[#1a1a1a] bg-yellow-200 border-2 border-[#1a1a1a] p-1 shadow-[2px_2px_0px_rgba(26,26,26,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[0px_0px_0px_rgba(26,26,26,1)] transition-all interactive-target"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

          {/* Toggle Tab */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => { setIsLogin(true); resetForm(); }}
              className={`py-3 rounded-xl border-[3px] border-[#1a1a1a] text-xs font-bold uppercase tracking-wider transition-all interactive-target ${
                isLogin ? 'bg-[#1a1a1a] text-white shadow-[4px_4px_0px_#fef08a] translate-x-[-2px] translate-y-[-2px]' : 'bg-white text-[#1a1a1a] shadow-[2px_2px_0px_rgba(26,26,26,1)] hover:bg-yellow-100'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); resetForm(); }}
              className={`py-3 rounded-xl border-[3px] border-[#1a1a1a] text-xs font-bold uppercase tracking-wider transition-all interactive-target ${
                !isLogin ? 'bg-[#1a1a1a] text-white shadow-[4px_4px_0px_#fef08a] translate-x-[-2px] translate-y-[-2px]' : 'bg-white text-[#1a1a1a] shadow-[2px_2px_0px_rgba(26,26,26,1)] hover:bg-yellow-100'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border-[2px] border-red-300 p-3 text-xs text-red-700 font-bold mb-5 flex items-start gap-2 rounded-xl">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="bg-green-50 border-[2px] border-green-300 p-3 text-xs text-green-700 font-bold mb-5 flex items-center gap-2 rounded-xl">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username for registration */}
            {!isLogin && (
              <div>
                <label className="text-[10px] uppercase font-bold text-[#1a1a1a]/70 block mb-2">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    minLength={3}
                    placeholder="e.g. ApexCaptain"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white border-[3px] border-[#1a1a1a] py-3 px-3 pl-10 text-sm font-bold text-[#1a1a1a] focus:bg-yellow-50 outline-none interactive-target rounded-xl"
                  />
                  <User className="w-4 h-4 text-[#1a1a1a] absolute left-3.5 top-3.5 stroke-[2.5]" />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-[10px] uppercase font-bold text-[#1a1a1a]/70 block mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@novahub.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border-[3px] border-[#1a1a1a] py-3 px-3 pl-10 text-sm font-bold text-[#1a1a1a] focus:bg-yellow-50 outline-none interactive-target rounded-xl"
                />
                <Mail className="w-4 h-4 text-[#1a1a1a] absolute left-3.5 top-3.5 stroke-[2.5]" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] uppercase font-bold text-[#1a1a1a]/70 block mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={4}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border-[3px] border-[#1a1a1a] py-3 px-3 pl-10 text-sm font-bold text-[#1a1a1a] focus:bg-yellow-50 outline-none font-sans tracking-widest interactive-target rounded-xl"
                />
                <KeyRound className="w-4 h-4 text-[#1a1a1a] absolute left-3.5 top-3.5 stroke-[2.5]" />
              </div>
            </div>

            {/* Access Role (Register only) */}
            {!isLogin && (
              <div>
                <label className="text-[10px] uppercase font-bold text-[#1a1a1a]/70 block mb-2">Select Role</label>
                <div className="relative flex">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-white border-[3px] border-[#1a1a1a] py-3 px-3 pl-10 text-sm font-bold text-[#1a1a1a] focus:bg-yellow-50 outline-none interactive-target appearance-none rounded-xl"
                  >
                    <option value="participant">Participant (Roster Gamer)</option>
                    <option value="host">Tournament Organizer (Host)</option>
                  </select>
                  <Shield className="w-4 h-4 text-[#1a1a1a] absolute left-3.5 top-3.5 stroke-[2.5]" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-yellow-200 hover:bg-yellow-300 border-[3px] border-[#1a1a1a] text-[#1a1a1a] font-black uppercase tracking-wider text-sm py-4 rounded-xl transition-all shadow-[6px_6px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed interactive-target"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Processing...
                </span>
              ) : isLogin ? 'Access Portal' : 'Register Identity'}
            </button>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthModal;
