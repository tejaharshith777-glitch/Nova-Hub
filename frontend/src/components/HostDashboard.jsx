import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Sliders, MessageSquare, Shield, DollarSign, Calendar, Clock, Trophy, Mail, Compass } from 'lucide-react';
import StripeModal from './StripeModal';
import TournamentBracket from './TournamentBracket';

export const HostDashboard = ({ apiBaseUrl, socket, user }) => {
  const [activeTab, setActiveTab] = useState('manage'); // 'create', 'manage', 'comm'
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isStripeOpen, setIsStripeOpen] = useState(false);

  // Form states for creating tournament
  const [formData, setFormData] = useState({
    title: '',
    gameName: 'Valorant',
    rules: '',
    format: 'Single Elimination',
    maxTeams: 8,
    prizePool: 5000,
    entryFee: 100,
    startDate: '',
    startTime: ''
  });

  // Load Host's Tournaments
  const loadTournaments = async () => {
    if (!apiBaseUrl || !apiBaseUrl.trim()) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/tournaments`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        // Filter by current host
        const hostMatches = data.filter(t => t.hostId?._id === user?.id || t.hostId === user?.id);
        setTournaments(hostMatches);
        if (hostMatches.length > 0 && !selectedTournament) {
          setSelectedTournament(hostMatches[0]);
        }
      }
    } catch (err) {
      console.error('Error loading tournaments:', err);
    }
  };

  // Load matches for selected tournament
  const loadMatches = async (tourneyId) => {
    if (!tourneyId) return;
    if (!apiBaseUrl || !apiBaseUrl.trim()) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/tournaments/${tourneyId}/matches`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      }
    } catch (err) {
      console.error('Error loading matches:', err);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, [user]);

  useEffect(() => {
    if (selectedTournament) {
      loadMatches(selectedTournament._id);
    }
  }, [selectedTournament]);

  // Setup Socket listener for matches updates
  useEffect(() => {
    if (!socket) return;
    socket.on('scoreUpdate', (data) => {
      if (selectedTournament && data.tournament._id === selectedTournament._id) {
        setMatches(data.matches);
      }
    });

    socket.on('tournamentUpdate', (data) => {
      if (selectedTournament && data.tournament._id === selectedTournament._id) {
        setMatches(data.matches);
        setSelectedTournament(data.tournament);
      }
    });

    return () => {
      socket.off('scoreUpdate');
      socket.off('tournamentUpdate');
    };
  }, [socket, selectedTournament]);

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setIsStripeOpen(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/tournaments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        alert('Tournament created and published successfully!');
        loadTournaments();
        setActiveTab('manage');
        setSelectedTournament(data.tournament);
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error publishing tournament.');
    }
  };

  // Update Match score directly from interactive bracket
  const handleUpdateMatchScore = async (matchId, scorePayload) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/matches/${matchId}/score`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scorePayload),
        credentials: 'include'
      });
      if (res.ok) {
        loadMatches(selectedTournament._id);
      } else {
        const err = await res.json();
        alert(`Failed to update score: ${err.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 relative z-10 font-sans min-h-screen">
      {/* Stripe mock checkout */}
      <StripeModal
        isOpen={isStripeOpen}
        onClose={() => setIsStripeOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        amount="₹500"
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-bold font-display uppercase tracking-tight text-white">
            Host Control Dashboard
          </h1>
          <p className="text-xs text-gaming-muted mt-1">
            Publish gaming streams, orchestrate matches, and adjust live points
          </p>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex gap-2 bg-gaming-card/60 p-1.5 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-display uppercase flex items-center gap-1.5 transition-colors interactive-target ${
              activeTab === 'manage' ? 'bg-gaming-purple text-white' : 'text-gaming-muted hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" /> Manage Matches
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-display uppercase flex items-center gap-1.5 transition-colors interactive-target ${
              activeTab === 'create' ? 'bg-gaming-purple text-white' : 'text-gaming-muted hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" /> Create Listing
          </button>
          <button
            onClick={() => setActiveTab('comm')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-display uppercase flex items-center gap-1.5 transition-colors interactive-target ${
              activeTab === 'comm' ? 'bg-gaming-purple text-white' : 'text-gaming-muted hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Players Hub
          </button>
        </div>
      </div>

      {/* ==========================================
          TAB 1: CREATE TOURNAMENT LISTING
          ========================================== */}
      {activeTab === 'create' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 rounded-2xl border border-white/5 max-w-2xl mx-auto relative overflow-hidden"
        >
          <h2 className="text-lg font-bold font-display text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <PlusCircle className="text-gaming-purple w-5 h-5" /> Host Tournament Set-Up
          </h2>

          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gaming-muted block mb-1">Tournament Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Free Fire Clan Clash"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-gaming-slate border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-gaming-cyan outline-none text-white font-sans"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gaming-muted block mb-1">Select Game Title</label>
                <select
                  name="gameName"
                  value={formData.gameName}
                  onChange={handleChange}
                  className="w-full bg-gaming-slate border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-gaming-cyan outline-none text-white"
                >
                  <option value="Valorant">Valorant</option>
                  <option value="Free Fire">Free Fire</option>
                  <option value="BGMI">BGMI</option>
                  <option value="Apex Legends">Apex Legends</option>
                  <option value="Need for Speed">Need for Speed</option>
                  <option value="Asphalt 9">Asphalt 9</option>
                  <option value="F1 2026">F1 2026</option>
                  <option value="Car Racing">Car Racing</option>
                  <option value="Bike Racing">Bike Racing</option>
                  <option value="Cycle Racing">Cycle Racing</option>
                  <option value="School Football">School Football</option>
                  <option value="School Basketball">School Basketball</option>
                  <option value="College Cricket">College Cricket</option>
                  <option value="College Esports">College Esports</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-gaming-muted block mb-1">Rules & Guidelines</label>
              <textarea
                name="rules"
                rows={3}
                placeholder="List placement metrics, bans, and team regulations..."
                value={formData.rules}
                onChange={handleChange}
                className="w-full bg-gaming-slate border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-gaming-cyan outline-none text-white font-sans"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gaming-muted block mb-1">Slot Capacities</label>
                <select
                  name="maxTeams"
                  value={formData.maxTeams}
                  onChange={handleChange}
                  className="w-full bg-gaming-slate border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-gaming-cyan outline-none text-white"
                >
                  <option value={4}>4 Teams</option>
                  <option value={8}>8 Teams</option>
                  <option value={16}>16 Teams</option>
                  <option value={32}>32 Teams</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gaming-muted block mb-1">Format</label>
                <select
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  className="w-full bg-gaming-slate border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-gaming-cyan outline-none text-white"
                >
                  <option value="Single Elimination">Single Elimination</option>
                  <option value="Double Elimination">Double Elimination</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gaming-muted block mb-1">Listing Stake Fee</label>
                <div className="w-full bg-gaming-slate border border-white/10 rounded-lg py-2.5 px-3 text-sm text-gaming-green font-bold">
                  ₹500 (fixed)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gaming-muted block mb-1">Prize Pool (INR)</label>
                <div className="relative">
                  <input
                    type="number"
                    name="prizePool"
                    required
                    value={formData.prizePool}
                    onChange={handleChange}
                    className="w-full bg-gaming-slate border border-white/10 rounded-lg py-2.5 px-3 pl-8 text-sm focus:border-gaming-cyan outline-none text-white font-sans font-display"
                  />
                  <Trophy className="w-4 h-4 text-gaming-muted absolute left-2.5 top-3.5" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gaming-muted block mb-1">Entry Fee (INR)</label>
                <div className="relative">
                  <input
                    type="number"
                    name="entryFee"
                    required
                    value={formData.entryFee}
                    onChange={handleChange}
                    className="w-full bg-gaming-slate border border-white/10 rounded-lg py-2.5 px-3 pl-8 text-sm focus:border-gaming-cyan outline-none text-white font-sans font-display"
                  />
                  <DollarSign className="w-4 h-4 text-gaming-muted absolute left-2.5 top-3.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gaming-muted block mb-1">Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full bg-gaming-slate border border-white/10 rounded-lg py-2.5 px-3 pl-8 text-sm focus:border-gaming-cyan outline-none text-white font-sans"
                  />
                  <Calendar className="w-4 h-4 text-gaming-muted absolute left-2.5 top-3.5" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gaming-muted block mb-1">Start Time</label>
                <div className="relative">
                  <input
                    type="time"
                    name="startTime"
                    required
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full bg-gaming-slate border border-white/10 rounded-lg py-2.5 px-3 pl-8 text-sm focus:border-gaming-cyan outline-none text-white font-sans"
                  />
                  <Clock className="w-4 h-4 text-gaming-muted absolute left-2.5 top-3.5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-gaming-purple hover:bg-gaming-purple/80 text-white font-bold font-display uppercase tracking-wider text-xs py-4 rounded-xl transition-all duration-300 shadow-neon-purple interactive-target"
            >
              Continue to Listing Stake Checkout
            </button>
          </form>
        </motion.div>
      )}

      {/* ==========================================
          TAB 2: MANAGE TOURNAMENT BRACKETS
          ========================================== */}
      {activeTab === 'manage' && (
        <div className="space-y-8">
          {/* Tournament selection */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-gaming-muted block">Select Listing to Control</span>
              {tournaments.length === 0 ? (
                <span className="text-sm font-semibold text-white mt-1">No active listings created yet</span>
              ) : (
                <select
                  value={selectedTournament?._id || ''}
                  onChange={(e) => {
                    const select = tournaments.find(t => t._id === e.target.value);
                    setSelectedTournament(select);
                  }}
                  className="bg-gaming-slate border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-gaming-cyan outline-none text-white mt-1.5 font-sans"
                >
                  {tournaments.map(t => (
                    <option key={t._id} value={t._id}>{t.title} ({t.gameName})</option>
                  ))}
                </select>
              )}
            </div>

            {selectedTournament && (
              <div className="flex gap-4">
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-gaming-muted block">Joined Players</span>
                  <span className="text-sm font-bold font-display text-gaming-cyan">
                    {selectedTournament.registeredTeams?.length || 0} / {selectedTournament.maxTeams} Teams
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-gaming-muted block">Tournament Status</span>
                  <span className="text-sm font-bold font-display text-gaming-green uppercase">
                    {selectedTournament.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bracket render area */}
          {selectedTournament ? (
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold font-display text-white uppercase tracking-wider">
                    Elimination Tree & Nodes
                  </h3>
                  <p className="text-xs text-gaming-muted mt-1">
                    Click directly on any match box below to edit scores, assign winners, and advance brackets
                  </p>
                </div>
              </div>

              <TournamentBracket
                matches={matches}
                isHost={true}
                onUpdateMatch={handleUpdateMatchScore}
              />
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center border border-white/5">
              <Compass className="w-12 h-12 mx-auto text-gaming-muted mb-4 animate-bounce" />
              <p className="text-sm text-gaming-muted">
                You have not created any tournaments. Go to the "Create Listing" tab to get started.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 3: PLAYERS COMMUNICATION HUB
          ========================================== */}
      {activeTab === 'comm' && (
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h2 className="text-lg font-bold font-display text-white uppercase tracking-wider mb-4">
            Participants Registry
          </h2>
          <p className="text-xs text-gaming-muted mb-6">
            Direct host matrix details to bypass third-party congestions. Contact registered players directly.
          </p>

          {selectedTournament?.registeredTeams?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedTournament.registeredTeams.map((team, idx) => (
                <div key={team._id || idx} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gaming-cyan block font-display">Clan Team</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{team.activeTeam || 'Solo Clan'}</span>
                    <span className="text-xs text-gaming-muted">Registered: {team.username}</span>
                  </div>
                  <a
                    href={`mailto:${team.email || 'gamer@novahub.com'}?subject=Nova Hub: ${selectedTournament.title}`}
                    className="bg-gaming-purple hover:bg-gaming-purple/80 border border-gaming-purple/30 p-2.5 rounded-lg text-white transition-all duration-200 interactive-target"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gaming-muted text-center py-8">
              No registered participants are listed under the currently selected tournament.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
export default HostDashboard;
