import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Trophy, CalendarDays, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const tournamentData = {
  cricket: {
    title: 'Summer Cricket Cup',
    tags: ['cricket', 'league', 'local'],
    color: 'bg-[#e86c3f]', textColor: 'text-[#e86c3f]', emoji: '🏏',
    type: 'physical',
    gameDetails: 'A massive 8-team summer cricket league played across 4 local grounds. Hard tennis ball format with 10-over matches. Guaranteed minimum of 3 matches per team in the group stage before knockouts.',
    liveTournaments: [
      { name: 'Quarter Finals - Match 1', status: 'LIVE', team1: 'City Strikers', team2: 'East End XI', score: '84/3 vs 42/0', time: 'Over 5.2' }
    ],
    pastTournaments: [
      { name: 'Spring Cup 2025', winner: 'City Blasters', runnerUp: 'East End XI', date: 'March 2025' },
      { name: 'Winter Bash 2024', winner: 'Strikers', runnerUp: 'Northern Kings', date: 'Dec 2024' }
    ]
  },
  football: {
    title: 'City Football Clash',
    tags: ['soccer', 'knockout', 'fast'],
    color: 'bg-[#3cc85a]', textColor: 'text-[#3cc85a]', emoji: '⚽',
    type: 'physical',
    gameDetails: 'Fast-paced 5-a-side knockout tournament. 16 teams battle it out in a single weekend. High intensity, fast matches on turf pitches. Professional referees and live scoring.',
    liveTournaments: [
      { name: 'Semi Final 1', status: 'LIVE', team1: 'Red Devils', team2: 'Blue Falcons', score: '2 - 1', time: '64\'' }
    ],
    pastTournaments: [
      { name: 'Autumn Clash 2025', winner: 'Red Devils', runnerUp: 'Green Hornets', date: 'Sept 2025' },
      { name: 'Summer Kick 2024', winner: 'Blue Falcons', runnerUp: 'Iron Legs', date: 'June 2024' }
    ]
  },
  badminton: {
    title: 'State Badminton',
    tags: ['badminton', 'brackets', 'pro'],
    color: 'bg-[#ffb800]', textColor: 'text-[#b38100]', emoji: '🏸',
    type: 'physical',
    gameDetails: 'State level badminton championship featuring men\'s singles, women\'s singles, and mixed doubles. Professional grade umpires, indoor synthetic courts, and digital bracket tracking.',
    liveTournaments: [
      { name: 'Men\'s Singles Final', status: 'LIVE', team1: 'R. Sharma', team2: 'K. Patel', score: '21-19, 14-8', time: 'Set 2' }
    ],
    pastTournaments: [
      { name: 'Open Smash 2025', winner: 'R. Sharma', runnerUp: 'A. Singh', date: 'April 2025' },
      { name: 'City Classic 2024', winner: 'K. Patel', runnerUp: 'M. Gupta', date: 'Oct 2024' }
    ]
  },
  hoops: {
    title: 'Downtown Basketball',
    tags: ['hoops', 'groups', 'local'],
    color: 'bg-[#00b4d8]', textColor: 'text-[#008ba6]', emoji: '🏀',
    type: 'physical',
    gameDetails: 'Urban 3v3 basketball tournament hosted at the downtown community center. Group stage followed by sudden death playoffs. Live DJ, food trucks, and high-energy crowd.',
    liveTournaments: [
      { name: 'Group B Match', status: 'LIVE', team1: 'Dunkers', team2: 'Net Ninjas', score: '45 - 42', time: 'Q4 2:10' }
    ],
    pastTournaments: [
      { name: 'Winter Hoops 2025', winner: 'Alley Oops', runnerUp: 'Dunkers', date: 'Jan 2025' },
      { name: 'Street Ball 2024', winner: 'Net Ninjas', runnerUp: 'Blockers', date: 'July 2024' }
    ]
  },
  valorant: {
    title: 'Valorant Showdown',
    tags: ['esports', '5v5', 'online', 'fps'],
    color: 'bg-[#ff4655]', textColor: 'text-[#ff4655]', emoji: '🎯',
    type: 'online',
    gameDetails: 'Competitive 5v5 tactical FPS tournament on Nova Hub. Teams battle through group stages in best-of-3 series, leading to a live Grand Final. All matches are online and monitored with anti-cheat enabled.',
    liveTournaments: [
      { name: 'Semifinals - Match 2', status: 'LIVE', team1: 'Team Nova', team2: 'Phantom Kings', score: '9 - 7', time: 'Round 12' }
    ],
    pastTournaments: [
      { name: 'Valorant Open S2', winner: 'Team Nova', runnerUp: 'Shadow Edge', date: 'May 2025' },
      { name: 'Iron to Radiant Cup', winner: 'Phantom Kings', runnerUp: 'Neon Rush', date: 'Feb 2025' }
    ]
  },
  bgmi: {
    title: 'BGMI Battlegrounds',
    tags: ['battle royale', 'squads', 'online', 'mobile'],
    color: 'bg-[#f97316]', textColor: 'text-[#f97316]', emoji: '🔫',
    type: 'online',
    gameDetails: 'Squad-based online BGMI tournament with 25 teams of 4. Chicken dinner points system across 6 matches. Final standings based on kills + placement. Device restrictions: Android/iOS only, emulators banned.',
    liveTournaments: [
      { name: 'Match 3 - Erangel', status: 'LIVE', team1: 'Ghost Squad', team2: 'Iron Tier', score: '#1 vs #3', time: 'Zone 5' }
    ],
    pastTournaments: [
      { name: 'BGMI Showdown S3', winner: 'Ghost Squad', runnerUp: 'Alpha Boys', date: 'June 2025' },
      { name: 'Chicken Derby 2024', winner: 'Savage 4', runnerUp: 'Iron Tier', date: 'Nov 2024' }
    ]
  },
  freefire: {
    title: 'Free Fire Masters',
    tags: ['free fire', 'ranked', 'squads', 'online'],
    color: 'bg-[#eab308]', textColor: 'text-[#a37c00]', emoji: '🔥',
    type: 'online',
    gameDetails: 'Free Fire squad championship with 20 teams competing across 8 matches on Bermuda and Kalahari maps. Point-based ranking with kill bonuses. Grandmaster accounts only. Cash prize distributed to top 3 teams.',
    liveTournaments: [
      { name: 'Match 5 - Kalahari', status: 'LIVE', team1: 'Blaze Squad', team2: 'Nova Killers', score: '#2 vs #4', time: 'Zone 4' }
    ],
    pastTournaments: [
      { name: 'Free Fire Open 2025', winner: 'Blaze Squad', runnerUp: 'Headshot Kings', date: 'April 2025' },
      { name: 'Summer Clash FF 2024', winner: 'Nova Killers', runnerUp: 'Storm Riders', date: 'Aug 2024' }
    ]
  },
  chess: {
    title: 'Online Chess League',
    tags: ['chess', 'elo', 'online', 'blitz'],
    color: 'bg-white', textColor: 'text-[#1a1a1a]', emoji: '♟️',
    type: 'online',
    gameDetails: 'Rated online chess tournament with 32 players. Blitz format (5+2 increment). Hosted on chess.com with verified accounts. Players compete in a Swiss system over 7 rounds. Top ELO rated players get seeds.',
    liveTournaments: [
      { name: 'Round 5 - Board 1', status: 'LIVE', team1: 'Arjun Verma', team2: 'Kiran Rao', score: '3 - 2.5', time: 'Move 28' }
    ],
    pastTournaments: [
      { name: 'Blitz Masters 2025', winner: 'Arjun Verma', runnerUp: 'Kiran Rao', date: 'May 2025' },
      { name: 'Knight Open 2024', winner: 'Priya Shah', runnerUp: 'Amit Das', date: 'Dec 2024' }
    ]
  },
  'car-racing': {
    title: 'Veloce GP Series',
    tags: ['racing', 'car', 'time-trial', 'online'],
    color: 'bg-[#ef4444]', textColor: 'text-[#ef4444]', emoji: '🚗',
    type: 'online',
    gameDetails: 'High-octane online car racing tournament featuring 4 drivers in single-elimination time-trial format. Drivers compete across 5 laps on the Europa Drift circuit. Top speed recorded: 287 km/h. No wall riding allowed. Points awarded for fastest lap, clean overtakes, and podium finishes.',
    liveTournaments: [
      { name: 'Semi Final - Europa Drift', status: 'LIVE', team1: 'Speed Demon #7', team2: 'Nova Racer #3', score: 'Lap 3/5', time: '287 km/h' },
      { name: 'Qualifying Round', status: 'LIVE', team1: 'Turbo Ghost', team2: 'Iron Wheel', score: 'Lap 1/5', time: '241 km/h' }
    ],
    pastTournaments: [
      { name: 'Veloce Grand Prix S2', winner: 'Speed Demon', runnerUp: 'Nova Racer', date: 'June 2025' },
      { name: 'Night Circuit Cup 2024', winner: 'Iron Wheel', runnerUp: 'Turbo Ghost', date: 'Dec 2024' },
      { name: 'Sprint Series Open 2024', winner: 'Blitz Driver', runnerUp: 'Speed Demon', date: 'Aug 2024' }
    ]
  },
  'bike-racing': {
    title: 'Moto GP Pro Tour',
    tags: ['racing', 'bike', 'moto', 'online'],
    color: 'bg-[#f97316]', textColor: 'text-[#f97316]', emoji: '🏍️',
    type: 'online',
    gameDetails: 'Adrenaline-fueled online Moto GP tournament with 4 riders in a single-elimination bracket. Riders race across 4 rounds on the Himalayan Ridge virtual track. Safe passing rules and lane discipline strictly enforced. Top leaning angle recorded: 58°. Time trial and head-to-head modes available.',
    liveTournaments: [
      { name: 'Round 2 - Himalayan Ridge', status: 'LIVE', team1: 'Moto King #1', team2: 'Road Phantom', score: 'Round 2/4', time: '195 km/h' }
    ],
    pastTournaments: [
      { name: 'Moto GP Pro Season 1', winner: 'Road Phantom', runnerUp: 'Moto King', date: 'May 2025' },
      { name: 'Thunderbike Open 2024', winner: 'Speed Biker', runnerUp: 'Nova Rider', date: 'Nov 2024' },
      { name: 'Weekend Throttle Cup', winner: 'Moto King', runnerUp: 'Lean Machine', date: 'March 2025' }
    ]
  },
  'cycle-racing': {
    title: 'Tour de Nova Classic',
    tags: ['racing', 'cycle', 'gps', 'velodrome'],
    color: 'bg-[#22c55e]', textColor: 'text-[#22c55e]', emoji: '🚴',
    type: 'physical',
    gameDetails: 'Premier cycle racing championship held at the Sector 4 Velodrome, HubCity. 4-rider single-elimination bracket across a 35 km route. GPS tracking active throughout — all riders fitted with approved trackers. Helmets and safety gear mandatory. Points for stage wins, sprint bonuses, and mountain classifications.',
    liveTournaments: [
      { name: 'Stage 2 - Velodrome Sprint', status: 'LIVE', team1: 'Pedal Force', team2: 'Chain Breaker', score: 'KM 18/35', time: '54.2 km/h' }
    ],
    pastTournaments: [
      { name: 'Tour de Nova Edition 1', winner: 'Pedal Force', runnerUp: 'Cycle Storm', date: 'April 2025' },
      { name: 'HubCity Gran Fondo 2024', winner: 'Chain Breaker', runnerUp: 'Gear Grinder', date: 'Oct 2024' },
      { name: 'Velodrome Sprint Classic', winner: 'Cycle Storm', runnerUp: 'Pedal Force', date: 'Jan 2025' }
    ]
  },
  'school-football': {
    title: 'Inter-School Football Cup',
    tags: ['football', 'school', 'junior', 'u-16'],
    color: 'bg-yellow-200', textColor: 'text-yellow-600', emoji: '🎒',
    type: 'physical',
    gameDetails: 'Annual under-16 inter-school football tournament. High school teams from across the city battle it out in a month-long league. Encouraging sportsmanship and building young legends.',
    liveTournaments: [
      { name: 'Group Stage Match 4', status: 'LIVE', team1: 'Delhi Public School', team2: 'St. Joseph Academy', score: '1 - 0', time: '52\'' }
    ],
    pastTournaments: [
      { name: 'Junior Cup 2025', winner: 'Delhi Public School', runnerUp: 'Greenwood High', date: 'Feb 2025' }
    ]
  },
  'school-basketball': {
    title: 'Junior School Basketball Shield',
    tags: ['basketball', 'school', 'shield', 'u-14'],
    color: 'bg-yellow-200', textColor: 'text-yellow-600', emoji: '🏀',
    type: 'physical',
    gameDetails: 'Under-14 inter-school basketball clash. Junior athletes representing their secondary schools in full-court official matches. Promoted by regional school board associations.',
    liveTournaments: [
      { name: 'Quarter Final B', status: 'LIVE', team1: 'Emerald International', team2: 'Army Public School', score: '38 - 34', time: 'Q3 8:00' }
    ],
    pastTournaments: [
      { name: 'School Shield 2025', winner: 'Emerald International', runnerUp: 'YMCA Scholars', date: 'April 2025' }
    ]
  },
  'college-cricket': {
    title: 'Varsity Cricket Trophy',
    tags: ['cricket', 'college', 'varsity', 'trophy'],
    color: 'bg-[#cffafe]', textColor: 'text-blue-600', emoji: '🎓',
    type: 'physical',
    gameDetails: 'Inter-collegiate 20-over varsity cricket trophy. Highly competitive matches featuring state-level collegiate players. Supported by national varsity selection scouts.',
    liveTournaments: [
      { name: 'Semi Final 2', status: 'LIVE', team1: 'IIT Bangalore', team2: 'RV College of Engineering', score: '142/5 vs 128/6', time: 'Over 18.2' }
    ],
    pastTournaments: [
      { name: 'Varsity Trophy 2025', winner: 'IIT Bangalore', runnerUp: 'PES University', date: 'May 2025' }
    ]
  },
  'college-esports': {
    title: 'Inter-Collegiate Esports League',
    tags: ['esports', 'college', 'online', 'gaming'],
    color: 'bg-[#cffafe]', textColor: 'text-blue-600', emoji: '🎮',
    type: 'online',
    gameDetails: 'The ultimate collegiate gaming championship. Universities compete across Valorant, BGMI, and Chess. Official esports points table with campus rankings.',
    liveTournaments: [
      { name: 'Valorant Finals', status: 'LIVE', team1: 'BITS Pilani Gaming', team2: 'SRM Esports', score: '11 - 9', time: 'Map 2' }
    ],
    pastTournaments: [
      { name: 'Collegiate Open 2025', winner: 'SRM Esports', runnerUp: 'VIT Gamers', date: 'June 2025' }
    ]
  }
};

const TournamentDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = tournamentData[id];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#c4e4e3] font-mono flex-col gap-4">
        <h1 className="text-2xl font-bold">Tournament Not Found</h1>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-[#1a1a1a] text-white rounded-full">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#c4e4e3] text-[#1a1a1a] font-mono selection:bg-black selection:text-white pb-24">
      {/* Navbar Minimal */}
      <nav className="p-6 md:p-8 flex items-center justify-between sticky top-0 bg-[#c4e4e3]/90 backdrop-blur-md z-50 border-b border-[#1a1a1a]/10">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-bold hover:gap-3 transition-all px-4 py-2 bg-white/50 rounded-full border-2 border-[#1a1a1a]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <div 
          onClick={() => navigate('/')}
          className="bg-[#0f1117] border-[2.5px] border-[#1a1a1a] px-3.5 py-1.5 rounded-full flex items-center gap-3 transition-all duration-200 hover:scale-[1.03] shadow-[3px_3px_0px_rgba(26,26,26,1)] select-none cursor-pointer"
        >
          <img
            src="/sports_flower_icon.png"
            alt="Sports Icon Collage"
            className="h-8 w-8 object-contain shrink-0 filter drop-shadow-sm"
          />
          <span className="font-display font-black text-sm tracking-widest text-white whitespace-nowrap uppercase">
            NOVA <span className="text-gray-400 font-normal opacity-80">//</span> <span className="text-yellow-400 underline decoration-[3px] decoration-yellow-400 underline-offset-[5px]">HUB</span>
          </span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 md:px-8 mt-12">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-8 items-start mb-16"
        >
          <div className={`w-32 h-32 md:w-48 md:h-48 rounded-[2rem] flex items-center justify-center text-6xl md:text-8xl shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] border-[4px] border-[#1a1a1a] ${data.color} shrink-0`}>
            {data.emoji}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-4">
              {data.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-white border-2 border-[#1a1a1a] rounded-full text-[10px] uppercase tracking-widest font-bold">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black italic mb-6 leading-tight">
              {data.title}
            </h1>
            <p className="text-sm md:text-base font-mono opacity-80 max-w-2xl leading-relaxed bg-white/50 p-6 rounded-2xl border border-white">
              {data.gameDetails}
            </p>
          </div>
        </motion.div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column - Live Actions & Registration */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Live Tournament Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#1a1a1a] text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
              
              <div className="flex items-center gap-3 mb-8">
                <Activity className={`w-6 h-6 ${data.textColor}`} />
                <h2 className="text-2xl font-display italic font-bold">Live Tournaments</h2>
                <span className="ml-auto flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>

              {data.liveTournaments.map((match, idx) => (
                <div key={idx} className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-6 text-[10px] font-mono tracking-widest uppercase text-white/50">
                    <span>{match.name}</span>
                    <span>{match.time}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-right flex-1">
                      <div className="text-xl md:text-2xl font-black font-display">{match.team1}</div>
                    </div>
                    <div className={`px-4 py-2 ${data.color} text-[#1a1a1a] rounded-lg font-black text-xl md:text-2xl min-w-[120px] text-center shadow-inner`}>
                      {match.score}
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-xl md:text-2xl font-black font-display">{match.team2}</div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <button onClick={() => navigate(user ? '/dashboard?tab=join' : '/?auth=true')} className="bg-[#baffc9] border-[3px] border-[#1a1a1a] p-6 rounded-2xl flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_rgba(26,26,26,1)]">
                <Users className="w-8 h-8" />
                <span className="font-bold font-display uppercase text-xl">Register Team</span>
              </button>
              <button onClick={() => navigate(user ? '/dashboard?tab=host' : '/?auth=true')} className="bg-[#fcebb6] border-[3px] border-[#1a1a1a] p-6 rounded-2xl flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_rgba(26,26,26,1)]">
                <CalendarDays className="w-8 h-8" />
                <span className="font-bold font-display uppercase text-xl">Host Match</span>
              </button>
            </motion.div>

          </div>

          {/* Sidebar - Past Tournaments */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#121420] border-[3px] border-[#1a1a1a] dark:border-white/20 rounded-[2rem] p-8 shadow-[8px_8px_0px_rgba(26,26,26,1)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.15)] text-[#1a1a1a] dark:text-white sticky top-32 transition-colors"
            >
              <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-[#1a1a1a]/10 dark:border-white/10">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-display italic font-bold">Past Winners</h2>
              </div>

              <div className="space-y-6">
                {data.pastTournaments.map((past, idx) => (
                  <div key={idx} className="group relative">
                    <div className="text-[10px] font-mono text-[#1a1a1a]/50 dark:text-white/50 uppercase tracking-widest mb-2">{past.name} • {past.date}</div>
                    <div className="bg-gray-50 dark:bg-[#0f111a] border-2 border-[#1a1a1a]/10 dark:border-white/10 rounded-xl p-4 group-hover:border-[#1a1a1a] dark:group-hover:border-white/30 group-hover:bg-[#fcebb6]/30 dark:group-hover:bg-yellow-900/10 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-[#1a1a1a]/60 dark:text-white/60">Winner</span>
                        <span className="font-bold font-display text-[#1a1a1a] dark:text-white">{past.winner} 🏆</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#1a1a1a]/60 dark:text-white/60">Runner Up</span>
                        <span className="font-bold text-[#1a1a1a]/80 dark:text-white/80 text-sm">{past.runnerUp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;
