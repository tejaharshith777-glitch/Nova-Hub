import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HostForm from '../components/HostForm';
import JoinEventPage from '../components/JoinEventPage';
import { Trophy, Zap, Users, CalendarDays, TrendingUp, Activity } from 'lucide-react';

// Simple deterministic PRNG to generate unique, consistent stats per user
const seedRandom = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (index) => {
    const x = Math.sin(hash + index) * 10000;
    return x - Math.floor(x);
  };
};

const mockParticipantTournaments = [
  { name: 'Summer Cricket Cup', sport: '🏏', status: 'LIVE', match: 'QF Match 1', time: 'Today 4PM', id: 'cricket' },
  { name: 'Valorant Showdown', sport: '🎯', status: 'LIVE', match: 'Semifinals', time: 'Online Now', id: 'valorant' },
  { name: 'BGMI Battlegrounds', sport: '🔫', status: 'UPCOMING', match: 'Match 4 - Erangel', time: 'Sat 8PM', id: 'bgmi' },
  { name: 'City Football Clash', sport: '⚽', status: 'UPCOMING', match: 'Group Stage', time: 'Sat 6PM', id: 'football' },
  { name: 'Online Chess League', sport: '♟️', status: 'COMPLETED', match: 'Round 7 Final', time: 'May 2025', id: 'chess' },
  { name: 'State Badminton', sport: '🏸', status: 'COMPLETED', match: "Men's Singles", time: 'Apr 2025', id: 'badminton' },
];

const mockHostTournaments = [
  { name: 'Summer Cricket Cup', sport: '🏏', status: 'LIVE', match: 'Manage QF 1', time: 'Host Console Open', id: 'cricket' },
  { name: 'City Football Clash', sport: '⚽', status: 'UPCOMING', match: 'Approve Teams', time: 'Host Console Open', id: 'football' },
  { name: 'Veloce Grand Prix Series', sport: '🏎️', status: 'LIVE', match: 'Leaderboard Sync', time: 'Host Console Open', id: 'car-racing' },
];

export const Dashboard = ({ apiBaseUrl, user, onRoleToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const tab = queryParams.get('tab');
  
  const [currentPage, setCurrentPage] = useState(
    tab === 'host' ? 'hostPage' : tab === 'join' ? 'joinPage' : 'buttonsPage'
  );

  useEffect(() => {
    if (tab === 'host') setCurrentPage('hostPage');
    else if (tab === 'join') setCurrentPage('joinPage');
    else setCurrentPage('buttonsPage');
  }, [tab]);

  const isHost = user?.role === 'host';
  const isParticipant = user?.role === 'participant';

  // Seed stats and list uniquely for each user
  const username = user?.username || 'Player';
  const getRand = seedRandom(username);

  // Participant stats
  const participantMatches = Math.floor(getRand(1) * 20) + 5;
  const participantWinRate = Math.floor(getRand(2) * 40) + 40;
  const participantTrophies = Math.floor(getRand(3) * 6) + 1;
  const participantTeams = Math.floor(getRand(4) * 8) + 2;

  const participantStats = [
    { label: 'Matches Played', value: String(participantMatches), icon: Activity, color: 'bg-[#bde3fb]' },
    { label: 'Win Rate', value: `${participantWinRate}%`, icon: TrendingUp, color: 'bg-[#baffc9]' },
    { label: 'Trophies Won', value: String(participantTrophies), icon: Trophy, color: 'bg-[#fcebb6]' },
    { label: 'Teams Joined', value: String(participantTeams), icon: Users, color: 'bg-[#fce4fb]' },
  ];

  // Host stats
  const hostHosted = Math.floor(getRand(5) * 8) + 2;
  const hostTeams = Math.floor(getRand(6) * 30) + 10;
  const hostBrackets = Math.floor(getRand(7) * 4) + 1;
  const hostPayouts = Math.floor(getRand(8) * 15) * 1000 + 3000;

  const hostStats = [
    { label: 'Tournaments Hosted', value: String(hostHosted), icon: Trophy, color: 'bg-[#fcebb6]' },
    { label: 'Registered Teams', value: String(hostTeams), icon: Users, color: 'bg-[#bde3fb]' },
    { label: 'Active Brackets', value: String(hostBrackets), icon: Activity, color: 'bg-[#fce4fb]' },
    { label: 'Referee Payouts', value: `₹${hostPayouts.toLocaleString()}`, icon: Zap, color: 'bg-[#baffc9]' },
  ];

  const stats = isHost ? hostStats : participantStats;

  // Render a different slice of mock tournaments depending on user
  const rawTournaments = isHost ? mockHostTournaments : mockParticipantTournaments;
  const tournaments = rawTournaments.filter((_, idx) => getRand(idx + 10) > 0.25);

  if (currentPage === 'hostPage') return (
    <div className="min-h-screen bg-[#c4e4e3] flex flex-col items-center pt-32 pb-20 px-8 justify-start font-mono">
      <HostForm setCurrentPage={setCurrentPage} apiBaseUrl={apiBaseUrl} user={user} />
    </div>
  );

  if (currentPage === 'joinPage') return (
    <div className="min-h-screen bg-[#c4e4e3] flex flex-col items-center pt-32 pb-20 px-8 justify-start font-mono">
      <JoinEventPage setCurrentPage={setCurrentPage} apiBaseUrl={apiBaseUrl} user={user} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#c4e4e3] pt-28 pb-20 px-6 md:px-12 font-mono text-[#1a1a1a]">
      <div className="max-w-6xl mx-auto">

        {/* Welcome Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#1a1a1a]/50 mb-1">Welcome back,</p>
          <h1 className="text-4xl md:text-5xl font-black font-display uppercase tracking-tight">
            {user?.username || 'Player'} <span className="text-[#1a1a1a]/30">·</span> <span className="text-2xl md:text-3xl capitalize text-[#1a1a1a]/60">{user?.role}</span>
          </h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <div key={stat.label} className={`${stat.color} border-[3px] border-[#1a1a1a] rounded-2xl p-5 shadow-[4px_4px_0px_rgba(26,26,26,1)] flex flex-col gap-2`}>
              <stat.icon className="w-5 h-5 opacity-60" />
              <div className="text-3xl font-black font-display">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-widest font-bold opacity-60">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {(isHost || !user) && (
            <button
              onClick={() => setCurrentPage('hostPage')}
              className="text-left bg-[#fcebb6] border-[3px] border-[#1a1a1a] p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all group interactive-target"
            >
              <div className="bg-white border-[3px] border-[#1a1a1a] p-2 w-max rounded-lg mb-4 shadow-[2px_2px_0px_rgba(26,26,26,1)] group-hover:rotate-12 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black font-display uppercase text-[#1a1a1a] mb-2">Host Events</h2>
              <p className="text-xs font-bold opacity-70 leading-relaxed">Set up local matches, define brackets, and manage entries.</p>
            </button>
          )}

          {(isParticipant || !user) && (
            <button
              onClick={() => setCurrentPage('joinPage')}
              className="text-left bg-[#baffc9] border-[3px] border-[#1a1a1a] p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all group interactive-target"
            >
              <div className="bg-white border-[3px] border-[#1a1a1a] p-2 w-max rounded-lg mb-4 shadow-[2px_2px_0px_rgba(26,26,26,1)] group-hover:-rotate-12 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black font-display uppercase text-[#1a1a1a] mb-2">Join Teams</h2>
              <p className="text-xs font-bold opacity-70 leading-relaxed">Submit rosters, join open tournaments, and check match schedules.</p>
            </button>
          )}
        </div>

        {/* Active Tournaments */}
        <div className="bg-white border-[3px] border-[#1a1a1a] rounded-2xl shadow-[6px_6px_0px_rgba(26,26,26,1)] overflow-hidden">
          <div className="border-b-[3px] border-[#1a1a1a] px-8 py-5 flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <CalendarDays className="w-5 h-5" /> My Active Tournaments
            </h2>
            <button onClick={() => navigate('/')} className="text-xs font-bold uppercase underline decoration-yellow-400 decoration-2 interactive-target">
              Browse All →
            </button>
          </div>
          <div className="divide-y divide-[#1a1a1a]/10">
            {tournaments.map((t, i) => (
              <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-[#c4e4e3]/30 transition-colors cursor-pointer group" onClick={() => navigate(`/tournament/${t.id}`)}>
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{t.sport}</span>
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-[10px] uppercase tracking-widest opacity-50">{t.match} · {t.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border-2 border-[#1a1a1a] ${t.status === 'LIVE' ? 'bg-red-400 text-white' : t.status === 'UPCOMING' ? 'bg-yellow-200' : 'bg-gray-100'}`}>
                    {t.status}
                  </span>
                  <span className="text-[#1a1a1a]/30 group-hover:text-[#1a1a1a] transition-colors">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
