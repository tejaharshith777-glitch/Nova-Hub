import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Trophy, Coins, Users, ShieldAlert, Award, Compass, MessageSquare, RefreshCw, Mail } from 'lucide-react';
import LiveLeaderboard from './LiveLeaderboard';
import TournamentBracket from './TournamentBracket';

export const ParticipantDashboard = ({ apiBaseUrl, socket, user }) => {
  const [activeTab, setActiveTab] = useState('discover'); // 'discover', 'live', 'contact'
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState('All');
  const [sortBy, setSortBy] = useState('prizePool'); // 'prizePool', 'entryFee', 'slots'

  // Load All Tournaments
  const loadTournaments = async () => {
    if (!apiBaseUrl || !apiBaseUrl.trim()) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/tournaments`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTournaments(data);
        if (data.length > 0 && !selectedTournament) {
          // Default to first tournament
          setSelectedTournament(data[0]);
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
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      loadMatches(selectedTournament._id);
    }
  }, [selectedTournament]);

  // Setup Socket listener for matches updates
  useEffect(() => {
    if (!socket) return;
    const handleScoreUpdate = (data) => {
      if (selectedTournament && data.tournament._id === selectedTournament._id) {
        setMatches(data.matches);
      }
    };

    const handleTournamentUpdate = (data) => {
      loadTournaments(); // Reload all listing slots
      if (selectedTournament && data.tournament._id === selectedTournament._id) {
        setMatches(data.matches);
        setSelectedTournament(data.tournament);
      }
    };

    socket.on('scoreUpdate', handleScoreUpdate);
    socket.on('tournamentUpdate', handleTournamentUpdate);

    return () => {
      socket.off('scoreUpdate');
      socket.off('tournamentUpdate');
    };
  }, [socket, selectedTournament]);

  // Handle Join Registration
  const handleRegister = async (tourneyId) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/tournaments/${tourneyId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        alert('Successfully registered for tournament!');
        loadTournaments();
        // Update selected if matching
        if (selectedTournament && selectedTournament._id === tourneyId) {
          setSelectedTournament(data.tournament);
        }
      } else {
        alert(data.message || 'Failed to join');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during registration.');
    }
  };

  // Filters & Sorting logic
  const filteredTournaments = tournaments
    .filter(t => {
      const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.gameName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchGame = gameFilter === 'All' || t.gameName === gameFilter;
      return matchSearch && matchGame;
    })
    .sort((a, b) => {
      if (sortBy === 'prizePool') return b.prizePool - a.prizePool;
      if (sortBy === 'entryFee') return a.entryFee - b.entryFee;
      if (sortBy === 'slots') {
        const slotsA = a.maxTeams - (a.registeredTeams?.length || 0);
        const slotsB = b.maxTeams - (b.registeredTeams?.length || 0);
        return slotsB - slotsA;
      }
      return 0;
    });

  const getTeamName = (teamObj) => {
    if (!teamObj) return 'TBD';
    return teamObj.activeTeam || teamObj.username || 'Participant';
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 relative z-10 font-sans min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-bold font-display uppercase tracking-tight text-white">
            Gamer Arena Console
          </h1>
          <p className="text-xs text-gaming-muted mt-1">
            Discover tournaments, register with one click, and watch real-time bracket scoring updates
          </p>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex gap-2 bg-gaming-card/60 p-1.5 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-display uppercase flex items-center gap-1.5 transition-colors interactive-target ${
              activeTab === 'discover' ? 'bg-gaming-purple text-white' : 'text-gaming-muted hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" /> Discover Brackets
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-display uppercase flex items-center gap-1.5 transition-colors interactive-target ${
              activeTab === 'live' ? 'bg-gaming-purple text-white' : 'text-gaming-muted hover:text-white'
            }`}
          >
            <RefreshCw className="w-4 h-4" /> Live Spectator Board
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-display uppercase flex items-center gap-1.5 transition-colors interactive-target ${
              activeTab === 'contact' ? 'bg-gaming-purple text-white' : 'text-gaming-muted hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Contact Matrix
          </button>
        </div>
      </div>

      {/* ==========================================
          TAB 1: TOURNAMENT DISCOVERY TIMELINE
          ========================================== */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="glass-panel p-4 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative col-span-2">
              <input
                type="text"
                placeholder="Search tournaments or games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gaming-slate border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs focus:border-gaming-cyan outline-none text-white font-sans"
              />
              <Search className="w-3.5 h-3.5 text-gaming-muted absolute left-3 top-3" />
            </div>

            {/* Game filter */}
            <div>
              <select
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                className="w-full bg-gaming-slate border border-white/10 rounded-lg py-2 px-3 text-xs focus:border-gaming-cyan outline-none text-white"
              >
                <option value="All">All Games</option>
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

            {/* Sorting */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gaming-slate border border-white/10 rounded-lg py-2 px-3 text-xs focus:border-gaming-cyan outline-none text-white"
              >
                <option value="prizePool">Prize Pool: High to Low</option>
                <option value="entryFee">Entry Fee: Low to High</option>
                <option value="slots">Open Slots: Most to Least</option>
              </select>
            </div>
          </div>

          {/* Cards Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredTournaments.map(t => {
              const joined = t.registeredTeams?.some(team => team._id === user?.id || team === user?.id);
              const isFull = t.registeredTeams?.length >= t.maxTeams;

              return (
                <div
                  key={t._id}
                  className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between group hover:neon-border-cyan transition-all duration-300"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] bg-gaming-purple/20 border border-gaming-purple/40 text-gaming-cyan font-bold tracking-wider px-2 py-0.5 rounded uppercase font-display">
                        {t.gameName}
                      </span>
                      <div className="text-[10px] text-gaming-muted font-bold font-display flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gaming-purple" /> 
                        <span>{t.registeredTeams?.length || 0}/{t.maxTeams} Clans</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold font-display text-white mt-1 group-hover:text-gaming-cyan transition-colors truncate">
                      {t.title}
                    </h3>
                    <p className="text-xs text-gaming-muted mt-2 font-semibold">Rules: {t.rules}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-gaming-muted block">Entry Fee</span>
                        <span className="text-sm font-bold font-display text-white">₹{t.entryFee}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-gaming-muted block">Prize Pool</span>
                        <span className="text-sm font-bold font-display text-gaming-green">₹{t.prizePool}</span>
                      </div>
                    </div>

                    {joined ? (
                      <button
                        disabled
                        className="w-full bg-gaming-green/10 border border-gaming-green/30 text-gaming-green font-bold font-display uppercase tracking-wider text-xs py-3 rounded-lg flex items-center justify-center gap-1.5"
                      >
                        ✓ Registered
                      </button>
                    ) : isFull ? (
                      <button
                        disabled
                        className="w-full bg-white/5 border border-white/10 text-gaming-muted font-bold font-display uppercase tracking-wider text-xs py-3 rounded-lg"
                      >
                        Slots Full
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(t._id)}
                        className="w-full bg-gaming-cyan hover:bg-gaming-cyan/85 border border-gaming-cyan/30 text-gaming-dark font-bold font-display uppercase tracking-wider text-xs py-3 rounded-lg transition-all duration-200 shadow-neon-cyan interactive-target"
                      >
                        One-Click Entry Registration
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTournaments.length === 0 && (
            <div className="glass-panel p-12 rounded-2xl text-center border border-white/5">
              <Compass className="w-12 h-12 mx-auto text-gaming-muted mb-4" />
              <p className="text-sm text-gaming-muted">
                No matching active tournaments found. Try checking back later!
              </p>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 2: LIVE SCORE SPECTATOR BOARD & BRACKET
          ========================================== */}
      {activeTab === 'live' && (
        <div className="space-y-8">
          {/* Select Listing to View */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-gaming-muted block">Select Active Battle Arena</span>
              {tournaments.length === 0 ? (
                <span className="text-sm font-semibold text-white mt-1">No active battlegrounds listed</span>
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
                  <span className="text-[9px] uppercase font-bold text-gaming-muted block">Host Organizer</span>
                  <span className="text-sm font-bold font-display text-gaming-cyan uppercase">
                    {selectedTournament.hostId?.username || 'Admin Host'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-gaming-muted block">Joined Teams</span>
                  <span className="text-sm font-bold font-display text-white">
                    {selectedTournament.registeredTeams?.length || 0} / {selectedTournament.maxTeams}
                  </span>
                </div>
              </div>
            )}
          </div>

          {selectedTournament ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Leaderboard layout (2 columns equivalent on lg) */}
              <div className="lg:col-span-2">
                <LiveLeaderboard
                  socket={socket}
                  tournamentId={selectedTournament._id}
                />
              </div>

              {/* Tournament details card */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold font-display uppercase tracking-widest text-gaming-cyan border-b border-white/5 pb-2">
                  Match Directives
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gaming-muted block">Host Contact Matrix</span>
                    <span className="text-xs font-semibold text-white mt-0.5 block flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gaming-purple" /> {selectedTournament.hostId?.email || 'host@novahub.com'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gaming-muted block">Scoring Rules</span>
                    <p className="text-xs text-gaming-muted mt-1 leading-relaxed">
                      {selectedTournament.rules}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gaming-muted block">Tournament Format</span>
                    <span className="text-xs font-semibold text-gaming-green uppercase mt-0.5 block">
                      {selectedTournament.format}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bracket Tree */}
              <div className="lg:col-span-3 glass-panel p-6 rounded-2xl border border-white/5">
                <h3 className="text-sm font-bold font-display uppercase tracking-widest text-white mb-4">
                  Elimination Brackets
                </h3>
                <TournamentBracket
                  matches={matches}
                  isHost={false}
                />
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center border border-white/5">
              <Compass className="w-12 h-12 mx-auto text-gaming-muted mb-4" />
              <p className="text-sm text-gaming-muted">
                No active games selected. Explore brackets inside thetimeline tab.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 3: DIRECT HOST CONTACT COMPONENT
          ========================================== */}
      {activeTab === 'contact' && (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 max-w-xl mx-auto relative overflow-hidden">
          <h2 className="text-lg font-bold font-display text-white uppercase tracking-wider mb-4">
            Direct Host Matrix Gateway
          </h2>
          <p className="text-xs text-gaming-muted mb-6 leading-relaxed">
            Nova Hub provides decentralized host parameters. In order to reduce crowded server routes, contact the organizer directly through secure SMTP client hooks or Discord integrations.
          </p>

          {selectedTournament ? (
            <div className="space-y-4">
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gaming-purple block font-display">Organizer ID</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    {selectedTournament.hostId?.username || 'Administrative Staff'}
                  </span>
                  <span className="text-xs text-gaming-muted">Linked to: {selectedTournament.title}</span>
                </div>
                <a
                  href={`mailto:${selectedTournament.hostId?.email || 'admin@novahub.com'}?subject=Nova Hub Support Inquiry`}
                  className="bg-gaming-cyan hover:bg-gaming-cyan/85 border border-gaming-cyan/30 py-2.5 px-4 rounded-lg text-gaming-dark text-xs font-bold font-display uppercase flex items-center gap-1.5 transition-all duration-200 interactive-target"
                >
                  <Mail className="w-4 h-4" /> Email Host
                </a>
              </div>

              <div className="border-t border-white/5 pt-4 text-center">
                <span className="text-[10px] text-gaming-muted">
                  Bypassing third-party servers. End-to-end communication matrix active.
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gaming-muted text-center py-6">
              Please select a tournament inside the Spectator tab to load corresponding host credentials.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
export default ParticipantDashboard;
