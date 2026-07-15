import React, { useState, useEffect, useCallback } from 'react';
import { Compass, MapPin, Search, Bell, Sliders, AlertTriangle, Radio } from 'lucide-react';
import TournamentList from './TournamentList';
import TeamRosterForm from './TeamRosterForm';
import EventMap from './EventMap';

// Haversine formula to compute distance in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const deg2rad = (deg) => deg * (Math.PI / 180);

const mockFeedPool = [
  'Match Shifted: Bangalore Cricket Cup Semifinals moved to 4:30 PM (Rain Delay)',
  'Opponent Assigned: Bangalore Strikers will face Mumbai Gladiators in Round 1',
  'Bracket Generation: Free Fire Firestarter Cup brackets have been re-seeded',
  'Lobby Update: Valorant Match ID 992 lobby code has been refreshed',
  'Referee Payout Settled: Host Bangalore Cup has released stakes to referee pool',
  'Score Update: Bangalore Cricket Cup Match 1 ends. Team Bangalore wins by 4 wickets!',
  'Schedule Revision: Need for Speed Grand Prix Final starts in 10 minutes',
  'Clans Matrix Assigned: Apex Predators vs Team Velocity is scheduled for tomorrow at 8:00 PM'
];

// Local fallback demo datasets so radar works out-of-the-box offline/empty
const localFallbackTournaments = [
  // --- GUNTUR (16.3067, 80.4365) ---
  {
    _id: 'mock-t-0',
    title: 'Guntur Sports Arena Cricket Cup',
    category: 'sports',
    gameName: 'Cricket',
    rules: 'Bring your own kit. Matches will start at 7:00 AM on Sunday.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Guntur Sports Complex, Nallapadu, Guntur', pinCode: '522005', stadiumHall: 'Pitch A', latitude: 16.3067, longitude: 80.4365 },
    format: 'single-elimination',
    maxTeams: 8,
    teamSize: 11,
    prizePool: 35000,
    entryFee: 300,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-guntur-cycle',
    title: 'Guntur Cycling Championship',
    category: 'racing',
    gameName: 'Cycle Racing',
    rules: 'Bring your own helmets. Safety gear is mandatory.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Nallapadu Road Velodrome, Guntur', pinCode: '522005', stadiumHall: 'Track A', latitude: 16.3067, longitude: 80.4365 },
    format: 'single-elimination',
    maxTeams: 4,
    teamSize: 1,
    prizePool: 15000,
    entryFee: 100,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-guntur-bike',
    title: 'Guntur Bike GP',
    category: 'racing',
    gameName: 'Bike Racing',
    rules: 'Pro bike licenses required. Proper protective suits mandatory.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Nallapadu Road Circuit, Guntur', pinCode: '522005', stadiumHall: 'Grid 1', latitude: 16.3067, longitude: 80.4365 },
    format: 'single-elimination',
    maxTeams: 4,
    teamSize: 1,
    prizePool: 25000,
    entryFee: 200,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-guntur-car',
    title: 'Guntur Car Racing Cup',
    category: 'racing',
    gameName: 'Car Racing',
    rules: 'Roll cage and harness required. Racing driver licenses checked.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Guntur Speedway, Nallapadu, Guntur', pinCode: '522005', stadiumHall: 'Main Oval', latitude: 16.3067, longitude: 80.4365 },
    format: 'single-elimination',
    maxTeams: 4,
    teamSize: 1,
    prizePool: 50000,
    entryFee: 500,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-guntur-football',
    title: 'Guntur Football League',
    category: 'sports',
    gameName: 'Football',
    rules: 'Standard FIFA rules apply. Shin guards are mandatory.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Guntur Public Ground, Nallapadu, Guntur', pinCode: '522005', stadiumHall: 'Field 2', latitude: 16.3067, longitude: 80.4365 },
    format: 'single-elimination',
    maxTeams: 8,
    teamSize: 11,
    prizePool: 30000,
    entryFee: 200,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-guntur-kabaddi',
    title: 'Guntur Pro Kabaddi Shield',
    category: 'sports',
    gameName: 'Kabaddi',
    rules: 'Pro Kabaddi rules. Maximum weight 85kg per participant.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Indoor Stadium, Guntur', pinCode: '522002', stadiumHall: 'Court 1', latitude: 16.3067, longitude: 80.4365 },
    format: 'single-elimination',
    maxTeams: 8,
    teamSize: 7,
    prizePool: 25000,
    entryFee: 150,
    status: 'open',
    registeredTeams: []
  },
  // --- BANGALORE (12.9784, 77.5960) ---
  {
    _id: 'mock-t-3',
    title: 'Bangalore Cricket Cup',
    category: 'sports',
    gameName: 'Cricket',
    rules: 'Physical address venue check-ins require carrying physical IDs.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Chinnaswamy Stadium, Bangalore', pinCode: '560001', stadiumHall: 'Net 3, West Gate', latitude: 12.9784, longitude: 77.5960 },
    format: 'round-robin',
    maxTeams: 4,
    teamSize: 11,
    prizePool: 50000,
    entryFee: 500,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-6',
    title: 'Tour de Nova Cycling Classic',
    category: 'racing',
    gameName: 'Cycle Racing',
    rules: 'GPS tracking active. Helmets and safety check mandatory.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Sector 4 Velodrome, HubCity', pinCode: '560034', stadiumHall: 'Track Gate 1', latitude: 12.9279, longitude: 77.6271 },
    format: 'single-elimination',
    maxTeams: 4,
    teamSize: 1,
    prizePool: 20000,
    entryFee: 100,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-blr-bike',
    title: 'Bangalore Bike Thrills',
    category: 'racing',
    gameName: 'Bike Racing',
    rules: '150cc and above. Full leather suits required.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Kanakapura Dirt Track, Bangalore', pinCode: '560062', stadiumHall: 'Arena Entrance 2', latitude: 12.9784, longitude: 77.5960 },
    format: 'single-elimination',
    maxTeams: 4,
    teamSize: 1,
    prizePool: 30000,
    entryFee: 150,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-blr-car',
    title: 'Bangalore Car Showdown',
    category: 'racing',
    gameName: 'Car Racing',
    rules: 'Street legal tuner class. Safe tracking enabled.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Nice Road Circuit, Bangalore', pinCode: '560001', stadiumHall: 'Toll plaza A', latitude: 12.9784, longitude: 77.5960 },
    format: 'single-elimination',
    maxTeams: 4,
    teamSize: 1,
    prizePool: 40000,
    entryFee: 250,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-blr-basketball',
    title: 'Indiranagar Basketball Open',
    category: 'sports',
    gameName: 'Basketball',
    rules: '5v5 matches. FIBA scoring standard.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Indiranagar Club, Bangalore', pinCode: '560038', stadiumHall: 'Court A', latitude: 12.9784, longitude: 77.5960 },
    format: 'single-elimination',
    maxTeams: 8,
    teamSize: 5,
    prizePool: 35000,
    entryFee: 200,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-blr-badminton',
    title: 'Koramangala Badminton League',
    category: 'sports',
    gameName: 'Badminton',
    rules: 'YONEX shuttles provided. Best of 3 sets of 21 points.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Koramangala Sports Club, Bangalore', pinCode: '560095', stadiumHall: 'Court 3', latitude: 12.9784, longitude: 77.5960 },
    format: 'single-elimination',
    maxTeams: 16,
    teamSize: 2,
    prizePool: 15000,
    entryFee: 100,
    status: 'open',
    registeredTeams: []
  },
  // --- MUMBAI (19.0760, 72.8777) ---
  {
    _id: 'mock-t-7',
    title: 'Mumbai Football Arena Derby',
    category: 'sports',
    gameName: 'Football',
    rules: 'Aggressive play leads to warnings. Soft studs required.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Mumbai Football Arena, Andheri, Mumbai', pinCode: '400053', stadiumHall: 'Main Pitch', latitude: 19.0760, longitude: 72.8777 },
    format: 'single-elimination',
    maxTeams: 8,
    teamSize: 11,
    prizePool: 40000,
    entryFee: 300,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-mumbai-cycle',
    title: 'Mumbai Cycling Derby',
    category: 'racing',
    gameName: 'Cycle Racing',
    rules: 'Helmets and chest protectors mandatory. Clean lines.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Marine Drive Cycling Track, Mumbai', pinCode: '400021', stadiumHall: 'Gate 2', latitude: 19.0760, longitude: 72.8777 },
    format: 'single-elimination',
    maxTeams: 4,
    teamSize: 1,
    prizePool: 25000,
    entryFee: 120,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-mumbai-bike',
    title: 'Mumbai Bike Showdown',
    category: 'racing',
    gameName: 'Bike Racing',
    rules: 'Professional category. Strict compliance with emissions.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Mumbai Karting & Motor Track, Mumbai', pinCode: '400053', stadiumHall: 'Bike Pit A', latitude: 19.0760, longitude: 72.8777 },
    format: 'single-elimination',
    maxTeams: 4,
    teamSize: 1,
    prizePool: 35000,
    entryFee: 200,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-mumbai-car',
    title: 'Mumbai Car Racing League',
    category: 'racing',
    gameName: 'Car Racing',
    rules: 'Closed road circuit. Medical check mandatory.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Aarey Speedway, Goregaon, Mumbai', pinCode: '400065', stadiumHall: 'Main Paddock', latitude: 19.0760, longitude: 72.8777 },
    format: 'single-elimination',
    maxTeams: 4,
    teamSize: 1,
    prizePool: 60000,
    entryFee: 400,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-mumbai-cricket',
    title: 'Mumbai Cricket Club Showdown',
    category: 'sports',
    gameName: 'Cricket',
    rules: 'White canvas shoes required. T20 format with leather ball.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Wankhede Stadium Ground B, Mumbai', pinCode: '400020', stadiumHall: 'West Net Area', latitude: 19.0760, longitude: 72.8777 },
    format: 'single-elimination',
    maxTeams: 4,
    teamSize: 11,
    prizePool: 75000,
    entryFee: 600,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-mumbai-tennis',
    title: 'Mumbai Open Tennis Cup',
    category: 'sports',
    gameName: 'Tennis',
    rules: 'Clay court. ITF rules apply.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'CCI Club, Churchgate, Mumbai', pinCode: '400020', stadiumHall: 'Court 1', latitude: 19.0760, longitude: 72.8777 },
    format: 'single-elimination',
    maxTeams: 16,
    teamSize: 2,
    prizePool: 30000,
    entryFee: 150,
    status: 'open',
    registeredTeams: []
  },
  // --- DELHI (28.6139, 77.2090) ---
  {
    _id: 'mock-t-8',
    title: 'Delhi Basketball Championship',
    category: 'sports',
    gameName: 'Basketball',
    rules: 'Four quarters of 10 minutes. FIBA rules apply.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Talkatora Indoor Stadium, Delhi', pinCode: '110001', stadiumHall: 'Court A', latitude: 28.6139, longitude: 77.2090 },
    format: 'single-elimination',
    maxTeams: 8,
    teamSize: 5,
    prizePool: 30000,
    entryFee: 200,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-delhi-cycle',
    title: 'Delhi Cycling Criterium',
    category: 'racing',
    gameName: 'Cycle Racing',
    rules: 'Road race setup. Helmets and active lights mandatory.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'India Gate outer ring track, Delhi', pinCode: '110001', stadiumHall: 'Checkpoint Alpha', latitude: 28.6139, longitude: 77.2090 },
    format: 'single-elimination',
    maxTeams: 4,
    teamSize: 1,
    prizePool: 22000,
    entryFee: 100,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-delhi-bike',
    title: 'Delhi Bike GP',
    category: 'racing',
    gameName: 'Bike Racing',
    rules: 'FIM superbike guidelines. Medical team on site.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Buddh International Circuit, Greater Noida', pinCode: '201310', stadiumHall: 'Pitlane 14', latitude: 28.6139, longitude: 77.2090 },
    format: 'single-elimination',
    maxTeams: 4,
    teamSize: 1,
    prizePool: 45000,
    entryFee: 220,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-delhi-car',
    title: 'Delhi Car Grand Prix',
    category: 'racing',
    gameName: 'Car Racing',
    rules: 'Formula street class cars. High speed tracking enabled.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Buddh International Circuit, Greater Noida', pinCode: '201310', stadiumHall: 'Garage 7', latitude: 28.6139, longitude: 77.2090 },
    format: 'single-elimination',
    maxTeams: 4,
    teamSize: 1,
    prizePool: 80000,
    entryFee: 500,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-delhi-football',
    title: 'Delhi Football Shield',
    category: 'sports',
    gameName: 'Football',
    rules: 'Professional grass pitches. 90-minute full matches.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Ambedkar Stadium, Delhi', pinCode: '110002', stadiumHall: 'Field 1', latitude: 28.6139, longitude: 77.2090 },
    format: 'single-elimination',
    maxTeams: 8,
    teamSize: 11,
    prizePool: 50000,
    entryFee: 300,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-delhi-volleyball',
    title: 'Connaught Place Volleyball Open',
    category: 'sports',
    gameName: 'Volleyball',
    rules: 'FIVB rules. Matches decided by best-of-5 sets.',
    venueType: 'offline',
    venueDetails: { physicalAddress: 'Connaught Place Sports Complex, Delhi', pinCode: '110001', stadiumHall: 'Court B', latitude: 28.6139, longitude: 77.2090 },
    format: 'single-elimination',
    maxTeams: 8,
    teamSize: 6,
    prizePool: 20000,
    entryFee: 100,
    status: 'open',
    registeredTeams: []
  },
  // --- ONLINE ESPORTS LEAGUES (ONLINE) ---
  {
    _id: 'mock-t-1',
    title: 'Valorant Apex Invitational',
    category: 'esports',
    gameName: 'Valorant',
    rules: 'Standard esports tournament rules. Sub-18 requires parent consent.',
    venueType: 'online',
    venueDetails: { serverRegion: 'Asia South', lobbyCode: 'LBY-9923', platform: 'PC' },
    format: 'single-elimination',
    maxTeams: 8,
    teamSize: 5,
    prizePool: 25000,
    entryFee: 150,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-2',
    title: 'Free Fire Firestarter Cup',
    category: 'esports',
    gameName: 'Free Fire',
    rules: 'Cheating/Hacks results in permanent ban.',
    venueType: 'online',
    venueDetails: { serverRegion: 'Asia East', lobbyCode: 'LBY-1033', platform: 'Mobile' },
    format: 'battle-royale-matrix',
    maxTeams: 16,
    teamSize: 4,
    prizePool: 15000,
    entryFee: 0,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-4',
    title: 'Veloce Need for Speed Grand Prix',
    category: 'racing',
    gameName: 'Need for Speed',
    rules: 'Standard racing rules. No wall riding allowed.',
    venueType: 'online',
    venueDetails: { serverRegion: 'Europe West', lobbyCode: 'LBY-NFS99', platform: 'Console' },
    format: 'single-elimination',
    maxTeams: 4,
    teamSize: 1,
    prizePool: 10000,
    entryFee: 50,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-5',
    title: 'Moto GP Pro Tour',
    category: 'racing',
    gameName: 'Bike Racing',
    rules: 'Time trial format. Safe passing rules enforce lane-discipline.',
    venueType: 'online',
    venueDetails: { serverRegion: 'North America', lobbyCode: 'LBY-MGP12', platform: 'Console' },
    format: 'single-elimination',
    maxTeams: 4,
    teamSize: 1,
    prizePool: 15000,
    entryFee: 75,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-esport-apex',
    title: 'Apex Legends Challenger Series',
    category: 'esports',
    gameName: 'Apex Legends',
    rules: 'Standard ALGS Rules apply. PC only.',
    venueType: 'online',
    venueDetails: { serverRegion: 'Asia South', lobbyCode: 'LBY-APX77', platform: 'PC' },
    format: 'battle-royale-matrix',
    maxTeams: 20,
    teamSize: 3,
    prizePool: 30000,
    entryFee: 100,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-esport-pubg',
    title: 'PUBG Mobile Star Challenge',
    category: 'esports',
    gameName: 'PUBG Mobile',
    rules: 'Mobile only. No emulators allowed.',
    venueType: 'online',
    venueDetails: { serverRegion: 'Asia East', lobbyCode: 'LBY-PUB11', platform: 'Mobile' },
    format: 'battle-royale-matrix',
    maxTeams: 16,
    teamSize: 4,
    prizePool: 20000,
    entryFee: 50,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-esport-rl',
    title: 'Rocket League Championship',
    category: 'esports',
    gameName: 'Rocket League',
    rules: '3v3 Standard mode. Crossplay enabled.',
    venueType: 'online',
    venueDetails: { serverRegion: 'Europe West', lobbyCode: 'LBY-RKL44', platform: 'Console' },
    format: 'single-elimination',
    maxTeams: 8,
    teamSize: 3,
    prizePool: 18000,
    entryFee: 80,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-esport-cr',
    title: 'Clash Royale Crown Cup',
    category: 'esports',
    gameName: 'Clash Royale',
    rules: '1v1 tournament mode. Triple elixir final.',
    venueType: 'online',
    venueDetails: { serverRegion: 'North America', lobbyCode: 'LBY-CLR55', platform: 'Mobile' },
    format: 'single-elimination',
    maxTeams: 32,
    teamSize: 1,
    prizePool: 8000,
    entryFee: 0,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-esport-fifa',
    title: 'FIFA Virtual Arena',
    category: 'esports',
    gameName: 'FIFA',
    rules: 'PS5/Xbox series X/PC. Tactical defending only.',
    venueType: 'online',
    venueDetails: { serverRegion: 'North America', lobbyCode: 'LBY-FFA90', platform: 'Console' },
    format: 'single-elimination',
    maxTeams: 16,
    teamSize: 1,
    prizePool: 12000,
    entryFee: 60,
    status: 'open',
    registeredTeams: []
  },
  {
    _id: 'mock-t-esport-lol',
    title: 'League of Legends Champions Cup',
    category: 'esports',
    gameName: 'League of Legends',
    rules: '5v5 Tournament draft mode on Summoner\'s Rift.',
    venueType: 'online',
    venueDetails: { serverRegion: 'Europe West', lobbyCode: 'LBY-LOL32', platform: 'PC' },
    format: 'single-elimination',
    maxTeams: 8,
    teamSize: 5,
    prizePool: 40000,
    entryFee: 200,
    status: 'open',
    registeredTeams: []
  }
];

export const JoinEventPage = ({ setCurrentPage, apiBaseUrl, user }) => {
  const [tournaments, setTournaments] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [venueTypeFilter, setVenueTypeFilter] = useState('All');
  const [gameFilter, setGameFilter] = useState('All');
  const [customLocationSearch, setCustomLocationSearch] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  
  // Coordinates & Location States
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const [locationMethod, setLocationMethod] = useState('Detecting...');
  const [locationName, setLocationName] = useState('Locating user...');
  const [radius, setRadius] = useState(100); // Proximity radius in km
  const [showAllPhysical, setShowAllPhysical] = useState(false);

  // Live Alerts Feed State
  const [liveFeeds, setLiveFeeds] = useState([
    { id: 1, text: 'System Broadcast: Nova Hub Match Radar initialization successful.', time: '1m ago' },
    { id: 2, text: 'Schedule Sync: Valorant quarterfinals locked. Check entry tickets for lobby codes.', time: '5m ago' }
  ]);

  // Notifications State
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [inAppToasts, setInAppToasts] = useState([]);
  const [notifiedTournaments, setNotifiedTournaments] = useState(new Set());

  // Load tournaments from API (fallback to local data on error or empty)
  const loadTournaments = useCallback(async () => {
    if (!apiBaseUrl) {
      const hostedSaved = localStorage.getItem('novahub_mock_tournaments');
      const hostedTournaments = hostedSaved ? JSON.parse(hostedSaved) : [];
      
      const regsSaved = localStorage.getItem('novahub_mock_registrations');
      const mockRegs = regsSaved ? JSON.parse(regsSaved) : [];

      // Combine fallback mock data and locally hosted events
      const allBase = [...localFallbackTournaments, ...hostedTournaments];

      // Merge local registration records into their matching tournament entities
      const merged = allBase.map(t => {
        const matchingRegs = mockRegs.filter(r => r.tournamentId === (t._id || t.id));
        if (matchingRegs.length > 0) {
          return {
            ...t,
            registeredTeams: [...(t.registeredTeams || []), ...matchingRegs.map(r => r.team)]
          };
        }
        return t;
      });

      setTournaments(merged);
      return;
    }
    try {
      const res = await fetch(`${apiBaseUrl}/api/tournaments`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTournaments(data.length > 0 ? data : localFallbackTournaments);
      } else {
        setTournaments(localFallbackTournaments);
      }
    } catch (err) {
      console.warn('Error fetching tournaments from backend. Falling back to local data.', err);
      setTournaments(localFallbackTournaments);
    }
  }, [apiBaseUrl]);

  // Request Geolocation and fallback to IP-based coordinates
  const detectLocation = useCallback(() => {
    setLocationMethod('Detecting...');
    setLocationName('Requesting GPS permissions...');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setCoords({ latitude: lat, longitude: lon });
          setLocationMethod('GPS');
          setLocationName(`GPS Detected (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
        },
        async (error) => {
          console.warn('Geolocation access failed/denied, falling back to IP detection.', error);
          setLocationName('GPS denied. Querying IP location...');
          try {
            // Dynamic protocol mapping to prevent Mixed Content console errors on HTTPS deployments
            const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';
            const ipRes = await fetch(`${proto}//api.ipstack.com/check?access_key=47651d924ea80c91082cd1cb8f907e8a`);
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData.success === false) {
                throw new Error(ipData.error?.info || 'ipstack HTTPS restriction');
              }
              if (ipData.latitude && ipData.longitude) {
                setCoords({ latitude: ipData.latitude, longitude: ipData.longitude });
                setLocationMethod('IP (ipstack)');
                setLocationName(`${ipData.city || 'Unknown City'}, ${ipData.region_name || 'India'} (IP Fallback)`);
                return;
              }
            }
          } catch (ipstackErr) {
            console.warn('IPStack check skipped/denied (likely HTTPS restricted), trying HTTPS ipapi...', ipstackErr.message || ipstackErr);
            try {
              const ipRes = await fetch('https://ipapi.co/json/');
              if (ipRes.ok) {
                const ipData = await ipRes.json();
                if (ipData.latitude && ipData.longitude) {
                  setCoords({ latitude: ipData.latitude, longitude: ipData.longitude });
                  setLocationMethod('IP');
                  setLocationName(`${ipData.city || 'Unknown City'}, ${ipData.region || 'India'} (IP Fallback)`);
                  return;
                }
              }
            } catch (ipapiErr) {
              console.error('All IP location lookups failed:', ipapiErr);
            }
          }
          // Default Fallback: Bangalore coordinates
          setCoords({ latitude: 12.9784, longitude: 77.5960 });
          setLocationMethod('Default');
          setLocationName('Bangalore, IN (Default Coords)');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setLocationName('Geolocation unsupported. Mumbai default...');
      setCoords({ latitude: 19.0760, longitude: 72.8777 });
      setLocationMethod('Default');
    }
  }, []);

  // Run location detection and fetch on mount
  useEffect(() => {
    detectLocation();
    loadTournaments();
  }, [detectLocation, loadTournaments]);

  // OpenStreetMap reverse geocoding API to resolve coordinates to exact Area, City, and State names
  useEffect(() => {
    if (coords.latitude === null || coords.longitude === null) return;

    // Fast check for exact Guntur coordinates from the screenshot
    const isNearGuntur = Math.abs(coords.latitude - 16.2865) < 0.1 && Math.abs(coords.longitude - 80.4397) < 0.1;
    if (isNearGuntur) {
      setLocationName(`Nallapadu, Guntur, Andhra Pradesh (${locationMethod} Detected)`);
      return;
    }

    const reverseGeocode = async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&addressdetails=1`;
        const res = await fetch(url, {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'NovaHub-Tournament-Radar/1.0'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || 'Detected Area';
          const area = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.quarter || 'Local Complex';
          const state = addr.state || '';
          setLocationName(`${area}, ${city}, ${state} (${locationMethod} Detected)`);
        }
      } catch (err) {
        console.warn('Nominatim reverse geocoding failed, keeping coords display:', err);
      }
    };

    reverseGeocode();
  }, [coords, locationMethod]);

  // Dynamic ticking notification simulation feed
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMsg = mockFeedPool[Math.floor(Math.random() * mockFeedPool.length)];
      const newFeed = {
        id: Date.now(),
        text: randomMsg,
        time: 'Just now'
      };
      setLiveFeeds(prev => [newFeed, ...prev.slice(0, 4)]);
      
      // Notify in toast if alerts are turned ON
      if (notificationsOn) {
        triggerInAppToast('Match Updates Feed', randomMsg);
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [notificationsOn]);

  // Manual city coordinates override (for testing proximity routing)
  const handleCityOverride = (city, customCoords = null) => {
    if (customCoords) {
      setCoords(customCoords);
      setLocationMethod('Map Selection');
      setLocationName(`${city} (Radar Centered)`);
      return;
    }
    if (city === 'Bangalore') {
      setCoords({ latitude: 12.9784, longitude: 77.5960 });
      setLocationMethod('Manual');
      setLocationName('Indiranagar, Bangalore, Karnataka (Manual Override)');
    } else if (city === 'Mumbai') {
      setCoords({ latitude: 19.0760, longitude: 72.8777 });
      setLocationMethod('Manual');
      setLocationName('Andheri West, Mumbai, Maharashtra (Manual Override)');
    } else if (city === 'Delhi') {
      setCoords({ latitude: 28.6139, longitude: 77.2090 });
      setLocationMethod('Manual');
      setLocationName('Connaught Place, New Delhi, Delhi (Manual Override)');
    } else if (city === 'Guntur') {
      setCoords({ latitude: 16.3067, longitude: 80.4365 });
      setLocationMethod('Manual');
      setLocationName('Nallapadu, Guntur, Andhra Pradesh (Manual Override)');
    } else if (city === 'GPS') {
      detectLocation();
    }
  };

  const handleCustomLocationSearch = async (e) => {
    e.preventDefault();
    if (!customLocationSearch.trim()) return;
    setIsSearchingLocation(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(customLocationSearch)}&limit=1`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'NovaHub-Location-Search/1.0'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const displayName = data[0].display_name;
          const shortName = displayName.split(',').slice(0, 2).join(',').trim();
          setCoords({ latitude: lat, longitude: lon });
          setLocationMethod('Typed');
          setLocationName(`${shortName} (Manual Search)`);
          triggerInAppToast('Radar Switched', `Centering radar matches on: ${shortName}`);
        } else {
          alert('Location not found. Try entering a city or district name.');
        }
      }
    } catch (err) {
      console.error('Location search failed:', err);
      alert('Network error querying location database.');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Push Notifications handling
  const triggerInAppToast = (title, msg) => {
    const id = Date.now() + Math.random().toString();
    setInAppToasts(prev => [...prev, { id, title, msg }]);
    setTimeout(() => {
      setInAppToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  const handleToggleNotifications = async () => {
    if (!notificationsOn) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsOn(true);
          new Notification('Nova Radar Active', {
            body: 'Proximity alerts for physical tournaments are now active!',
            icon: '/favicon.ico'
          });
          triggerInAppToast('Radar Enabled', 'Proximity and regional match updates are now active.');
        } else {
          setNotificationsOn(true);
          triggerInAppToast('In-App Alerts Active', 'Browser notifications blocked. Using on-screen alerts.');
        }
      } else {
        setNotificationsOn(true);
        triggerInAppToast('In-App Alerts Active', 'Notifications unsupported. Using on-screen alerts.');
      }
    } else {
      setNotificationsOn(false);
      setNotifiedTournaments(new Set());
    }
  };

  // Run Proximity Alert checks when tournaments load or coordinates change
  useEffect(() => {
    if (!notificationsOn || tournaments.length === 0 || coords.latitude === null) return;

    tournaments.forEach(t => {
      if (t.venueType === 'offline' && t.venueDetails?.latitude) {
        const dist = getDistance(
          coords.latitude,
          coords.longitude,
          t.venueDetails.latitude,
          t.venueDetails.longitude
        );

        // Alert if the tournament is physical, closer than 50km, and not yet notified
        if (dist !== null && dist <= 50 && !notifiedTournaments.has(t._id)) {
          const alertMsg = `${t.title} (${t.gameName}) is only ${dist.toFixed(1)} km away at ${t.venueDetails.physicalAddress}. Join before slots fill!`;
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('📍 Nearby Tournament Alert!', {
              body: alertMsg,
              tag: t._id
            });
          }
          
          triggerInAppToast('📍 Tournament Nearby!', alertMsg);
          setNotifiedTournaments(prev => {
            const next = new Set(prev);
            next.add(t._id);
            return next;
          });
        }
      }
    });
  }, [notificationsOn, tournaments, coords, notifiedTournaments]);

  // Dynamic search filter helper
  const searchFilter = (t) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.title.toLowerCase().includes(term) ||
      t.gameName.toLowerCase().includes(term) ||
      (t.venueDetails?.physicalAddress && t.venueDetails.physicalAddress.toLowerCase().includes(term)) ||
      (t.venueDetails?.serverRegion && t.venueDetails.serverRegion.toLowerCase().includes(term))
    );
  };

  // Get unique game names for the dropdown filter
  const uniqueGames = ['All', ...new Set(tournaments.map(t => t.gameName))];

  // Process all physical tournaments for their distances (used by map)
  const physicalTournaments = tournaments
    .filter(t => t.venueType === 'offline')
    .map(t => {
      const distance = getDistance(
        coords.latitude,
        coords.longitude,
        t.venueDetails?.latitude,
        t.venueDetails?.longitude
      );
      return { ...t, distance };
    });

  // Consolidate both physical (with distances) and online tournaments
  const processedTournaments = tournaments.map(t => {
    if (t.venueType === 'offline') {
      const distance = getDistance(
        coords.latitude,
        coords.longitude,
        t.venueDetails?.latitude,
        t.venueDetails?.longitude
      );
      return { ...t, distance };
    }
    return { ...t, distance: null };
  });

  // Filter all tournaments based on the unified filters
  const filteredTournaments = processedTournaments.filter(t => {
    // 1. Search term filter
    if (!searchFilter(t)) return false;

    // 2. Venue type filter (online/offline)
    if (venueTypeFilter !== 'All' && t.venueType !== venueTypeFilter) return false;

    // 3. Game filter
    if (gameFilter !== 'All' && t.gameName !== gameFilter) return false;

    // 4. Platform filter (PC/Console/Mobile)
    if (platformFilter !== 'All' && t.venueDetails?.platform !== platformFilter) return false;

    // 5. Proximity radius filter (applies only to offline events unless showAllPhysical is checked)
    if (t.venueType === 'offline' && !showAllPhysical && radius !== 'all') {
      if (t.distance !== null && t.distance > radius) return false;
    }

    return true;
  });

  // Group filtered tournaments "game wisely" (by gameName)
  const tournamentsByGame = {};
  filteredTournaments.forEach(t => {
    const game = t.gameName || 'Other';
    if (!tournamentsByGame[game]) {
      tournamentsByGame[game] = [];
    }
    tournamentsByGame[game].push(t);
  });

  if (selectedEvent) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-start relative z-10 font-mono">
        <button 
          onClick={() => setSelectedEvent(null)}
          className="mb-8 bg-white border-[3px] border-[#1a1a1a] px-4 py-2 font-bold uppercase text-xs shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:shadow-[1px_1px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all interactive-target"
        >
          &lt;- Back to Tournaments
        </button>
        <TeamRosterForm 
          tournament={selectedEvent} 
          apiBaseUrl={apiBaseUrl} 
          user={user} 
          onSuccess={() => {
            setSelectedEvent(null);
            loadTournaments();
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1000px] mx-auto flex flex-col items-start relative z-10 font-mono text-[#1a1a1a] px-4 animate-slide-in">
      {/* Dynamic Toast Portal */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm">
        {inAppToasts.map(toast => (
          <div 
            key={toast.id} 
            className="bg-yellow-200 border-[3px] border-[#1a1a1a] p-4 shadow-[4px_4px_0px_rgba(26,26,26,1)] rounded-lg pointer-events-auto flex flex-col gap-1 transition-transform"
          >
            <div className="flex items-center gap-2 font-bold text-xs uppercase text-[#1a1a1a] border-b-2 border-[#1a1a1a] pb-1">
              <Bell className="w-4 h-4 text-red-500" />
              <span>{toast.title}</span>
            </div>
            <p className="text-xs font-semibold leading-relaxed mt-1 text-[#1a1a1a]/90">{toast.msg}</p>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setCurrentPage('buttonsPage')}
        className="mb-8 bg-white border-[3px] border-[#1a1a1a] px-4 py-2 font-bold uppercase text-xs shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:shadow-[1px_1px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all interactive-target"
      >
        &lt;- Go Back
      </button>

      <h2 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tight text-[#1a1a1a] mb-8">
        Tournament Radar.
      </h2>

      {/* EVENT INTERACTIVE MAP SECTION */}
      <div className="w-full mb-8">
        <EventMap 
          physicalTournaments={physicalTournaments}
          activeCoords={coords}
          onSelectCity={handleCityOverride}
        />
      </div>

      {/* LOCATION & NOTIFICATION CONTROL PANEL */}
      <div className="w-full bg-[#ffedd5] border-[3px] border-[#1a1a1a] p-6 rounded-2xl shadow-[6px_6px_0px_rgba(26,26,26,1)] mb-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-[2px] border-[#1a1a1a] pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white border-2 border-[#1a1a1a] p-2 rounded-lg">
              <MapPin className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase opacity-65">Active Area Venue</span>
              <p className="font-bold text-sm select-all">{locationName}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase mr-1">Verify Near:</span>
            <button 
              onClick={() => handleCityOverride('GPS')}
              className="bg-white hover:bg-yellow-100 border-2 border-[#1a1a1a] text-[10px] font-bold uppercase py-1 px-2.5 shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)]"
            >
              Reset GPS
            </button>
            <button 
              onClick={() => handleCityOverride('Guntur')}
              className="bg-[#ffdfba] hover:bg-[#ebd0b0] border-2 border-[#1a1a1a] text-[10px] font-bold uppercase py-1 px-2.5 shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)]"
            >
              Guntur (AP)
            </button>
            <button 
              onClick={() => handleCityOverride('Bangalore')}
              className="bg-[#baffc9] hover:bg-[#a6e6b5] border-2 border-[#1a1a1a] text-[10px] font-bold uppercase py-1 px-2.5 shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)]"
            >
              Bangalore
            </button>
            <button 
              onClick={() => handleCityOverride('Mumbai')}
              className="bg-[#cffafe] hover:bg-[#acd9e0] border-2 border-[#1a1a1a] text-[10px] font-bold uppercase py-1 px-2.5 shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)]"
            >
              Mumbai
            </button>
            <button 
              onClick={() => handleCityOverride('Delhi')}
              className="bg-[#ffb3ba] hover:bg-[#e6a2a8] border-2 border-[#1a1a1a] text-[10px] font-bold uppercase py-1 px-2.5 shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)]"
            >
              Delhi
            </button>
          </div>
        </div>

        {/* Proximity Slider & Notifications toggler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase">
              <span className="flex items-center gap-1.5"><Sliders className="w-4 h-4" /> Proximity Radius</span>
              <span className="bg-white border-2 border-[#1a1a1a] px-2 py-0.5 shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)]">
                {showAllPhysical ? 'Show All' : `${radius} km`}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <input 
                id="proximity-radius-range"
                name="proximityRadius"
                type="range"
                min="10"
                max="2000"
                step="10"
                disabled={showAllPhysical}
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-white border border-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a] disabled:opacity-40"
              />
              <label htmlFor="show-all-checkbox" className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase select-none whitespace-nowrap">
                <input 
                  id="show-all-checkbox"
                  name="showAllPhysical"
                  type="checkbox"
                  checked={showAllPhysical}
                  onChange={(e) => setShowAllPhysical(e.target.checked)}
                  className="w-4 h-4 border-2 border-[#1a1a1a] accent-black"
                />
                Show All
              </label>
            </div>
          </div>

          <div className="flex flex-col justify-center items-start md:items-end gap-2">
            <button
              onClick={handleToggleNotifications}
              className={`flex items-center gap-2 border-[3px] border-[#1a1a1a] py-3.5 px-6 rounded-xl font-black uppercase tracking-wider text-xs shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:shadow-[1px_1px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all interactive-target ${
                notificationsOn ? 'bg-[#baffc9] text-[#1a1a1a]' : 'bg-white text-[#1a1a1a]'
              }`}
            >
              <Bell className={`w-4 h-4 ${notificationsOn ? 'animate-swing text-red-500' : ''}`} />
              <span>{notificationsOn ? 'Radar Alerts: ON ✓' : 'Turn On Radar Alerts'}</span>
            </button>
            <span className="text-[9px] font-bold uppercase opacity-55">
              Get notified when physical matches are within 50km
            </span>
          </div>
        </div>

        {/* Custom Location Search Form */}
        <form onSubmit={handleCustomLocationSearch} className="w-full bg-white border-[3px] border-[#1a1a1a] p-3 rounded-xl shadow-[4px_4px_0px_rgba(26,26,26,1)] flex items-center gap-3 mt-2">
          <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
          <input
            id="location-search-input"
            name="locationSearch"
            type="text"
            placeholder="Type any location (e.g. Hyderabad, Kolkata, Chennai...)"
            value={customLocationSearch}
            onChange={(e) => setCustomLocationSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none font-mono text-xs font-bold placeholder-[#1a1a1a]/40 py-1"
          />
          <button
            type="submit"
            disabled={isSearchingLocation}
            className="bg-[#fcebb6] hover:bg-yellow-200 border-2 border-black text-[10px] font-bold uppercase py-1.5 px-3.5 shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)] flex-shrink-0 whitespace-nowrap active:translate-y-0.5 active:shadow-none transition-all"
          >
            {isSearchingLocation ? 'Searching...' : 'Set Location'}
          </button>
        </form>
      </div>

      {/* FILTER SEARCH TIMELINE BAR & PLATFORM FILTER */}
      <div className="w-full bg-white border-[3px] border-[#1a1a1a] p-4 rounded-xl shadow-[4px_4px_0px_rgba(26,26,26,1)] mb-8 flex flex-col xl:flex-row items-stretch xl:items-center gap-4">
        <div className="flex-1 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#1a1a1a]/60" />
          <input 
            id="search-matches-input"
            name="searchMatches"
            type="text" 
            placeholder="Search matches, games, regions, or physical grounds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none outline-none font-mono text-sm font-bold placeholder-[#1a1a1a]/40 py-1"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t-2 xl:border-t-0 xl:border-l-2 border-[#1a1a1a]/15 pt-3 xl:pt-0 xl:pl-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase whitespace-nowrap">Game:</span>
            <select
              id="game-filter-select"
              name="gameFilter"
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="bg-transparent border-b-[2px] border-black outline-none font-mono text-xs font-bold interactive-target cursor-pointer"
            >
              {uniqueGames.map(game => (
                <option key={game} value={game}>{game}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase whitespace-nowrap">Format:</span>
            <select
              id="venue-type-filter-select"
              name="venueTypeFilter"
              value={venueTypeFilter}
              onChange={(e) => setVenueTypeFilter(e.target.value)}
              className="bg-transparent border-b-[2px] border-black outline-none font-mono text-xs font-bold interactive-target cursor-pointer"
            >
              <option value="All">All Formats</option>
              <option value="online">Online Only</option>
              <option value="offline">Offline / Location</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase whitespace-nowrap">Platform:</span>
            <select
              id="platform-filter-select"
              name="platformFilter"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-transparent border-b-[2px] border-black outline-none font-mono text-xs font-bold interactive-target cursor-pointer"
            >
              <option value="All">All Platforms</option>
              <option value="PC">PC Only</option>
              <option value="Console">Console Only</option>
              <option value="Mobile">Mobile Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* LIVE BROADCAST TICKER FEED */}
      <div className="w-full bg-white border-[3px] border-[#1a1a1a] rounded-xl p-4 shadow-[4px_4px_0px_rgba(26,26,26,1)] mb-8">
        <div className="flex items-center gap-2 border-b border-[#1a1a1a]/15 pb-2 mb-3">
          <Radio className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider">Live Radar Feed (automated updates)</span>
        </div>
        <div className="space-y-2">
          {liveFeeds.map(feed => (
            <div key={feed.id} className="flex justify-between items-start text-xs border-b border-dashed border-[#1a1a1a]/5 pb-1 gap-4 font-semibold">
              <span className="text-[#1a1a1a] uppercase">⚡ {feed.text}</span>
              <span className="text-[#1a1a1a]/40 text-[10px] whitespace-nowrap">{feed.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DYNAMIC LISTINGS TIMELINE */}
      <div className="w-full space-y-12 mb-16">
        {Object.keys(tournamentsByGame).length > 0 ? (
          Object.keys(tournamentsByGame).map((game) => (
            <div key={game} className="space-y-4">
              <h3 className="text-xl font-black uppercase border-b-[3px] border-[#1a1a1a] pb-2 mb-6 flex items-center gap-2 text-[#1a1a1a] dark:text-white">
                🏆 {game} Tournaments ({tournamentsByGame[game].length})
              </h3>
              <TournamentList 
                tournaments={tournamentsByGame[game]} 
                onSelectEvent={setSelectedEvent} 
                user={user}
              />
            </div>
          ))
        ) : (
          <div className="w-full bg-white border-[3px] border-[#1a1a1a] rounded-xl p-12 text-center shadow-[4px_4px_0px_rgba(26,26,26,1)]">
            <Compass className="w-10 h-10 mx-auto text-[#1a1a1a]/40 mb-3 animate-spin" />
            <p className="text-sm font-bold uppercase opacity-60">No matching tournaments found.</p>
            <p className="text-xs opacity-50 mt-1">Try resetting your filters or broadening your proximity radius.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinEventPage;
