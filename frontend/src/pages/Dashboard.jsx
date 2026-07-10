import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HostForm from '../components/HostForm';
import JoinEventPage from '../components/JoinEventPage';
import { 
  Trophy, Zap, Users, CalendarDays, TrendingUp, Activity, Radio, User, 
  Wallet, Gift, MessageSquare, Settings, Send, Check, X, Award, Shield, 
  Volume2, Trash2, Bell, ShieldAlert, Sparkles, Loader2, CreditCard
} from 'lucide-react';

// Mock chat responses mapping
const MOCK_REPLIES = {
  admin: [
    "I have notified the match referees. Please get ready in the lobby!",
    "Remember that brackets are locked once matches start.",
    "Make sure all your players are online 10 minutes prior."
  ],
  support: [
    "Your inquiry has been logged. Our developers are looking into it.",
    "Nova Hub pipelines are currently operational. Let us know if you find any lag.",
    "Thanks for the feedback! We are constantly updating the proximity algorithms."
  ],
  referee: [
    "All match scores must be submitted with screenshots for verification.",
    "Anti-cheat scanning is active. Disqualifications are irreversible.",
    "Play fair and respect your opponents."
  ],
  liaison: [
    "Clan tag updates are processed within 24 hours.",
    "Roster members must match their registered Game IDs.",
    "Clans matching is based on proximity filters."
  ]
};

// Default fallback tournaments in case backend returns empty
const defaultFallbackTournaments = [
  {
    _id: 'mock-t-cricket',
    title: 'Guntur Sports Arena Cricket Cup',
    category: 'sports',
    gameName: 'Cricket',
    rules: 'Bring your own kit. Matches start at 7:00 AM Sunday.',
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
    _id: 'mock-t-valorant',
    title: 'Valorant Regional Clash',
    category: 'esports',
    gameName: 'Valorant',
    rules: 'Anti-cheat required. No emulator players allowed.',
    venueType: 'online',
    venueDetails: { serverRegion: 'Mumbai', platform: 'PC', lobbyCode: 'VAL-LOBBY-99' },
    format: 'single-elimination',
    maxTeams: 4,
    teamSize: 5,
    prizePool: 25000,
    entryFee: 100,
    status: 'ongoing',
    registeredTeams: [
      { teamName: 'Apex Predators', captainEmail: 'apex@novahub.com', roster: [] },
      { teamName: 'Team Vipers', captainEmail: 'vipers@novahub.com', roster: [] }
    ]
  },
  {
    _id: 'mock-t-bgmi',
    title: 'BGMI Battlegrounds Cup',
    category: 'esports',
    gameName: 'BGMI',
    rules: 'Mobile only. Roster submissions are final.',
    venueType: 'online',
    venueDetails: { serverRegion: 'Asia', platform: 'Mobile', lobbyCode: 'BGMI-ROOM-22' },
    format: 'single-elimination',
    maxTeams: 16,
    teamSize: 4,
    prizePool: 15000,
    entryFee: 50,
    status: 'open',
    registeredTeams: []
  }
];

export const Dashboard = ({ apiBaseUrl, user, onRoleToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');

  // Page Routing State ('dashboard' | 'hostPage' | 'joinPage')
  const [currentPage, setCurrentPage] = useState(
    tabParam === 'host' ? 'hostPage' : 'dashboard'
  );

  // Active Tab State inside Sidebar
  const [activeTab, setActiveTab] = useState(
    tabParam === 'join' ? 'all-tournaments' : 'all-tournaments'
  );

  // Global Tournaments Database State
  const [tournaments, setTournaments] = useState([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);

  // Tournament Selected for Join / Roster Form
  const [selectedTournament, setSelectedTournament] = useState(null);

  // Mobile Sidebar Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // User Local Profile State (updates name/email mock)
  const [profileName, setProfileName] = useState(user?.username || 'Player');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'player@novahub.com');

  // Wallet State (Persisted in localStorage)
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('novahub_wallet_balance');
    return saved ? parseFloat(saved) : 2500;
  });
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('novahub_transactions');
    return saved ? JSON.parse(saved) : [
      { id: 'tx-1', type: 'Credit', desc: 'Welcome Bonus Credited', amount: 2500, date: 'July 2026' }
    ];
  });
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawUpi, setWithdrawUpi] = useState('');

  // Daily Rewards Claim State
  const [lastClaimTime, setLastClaimTime] = useState(() => {
    return localStorage.getItem('novahub_last_claim_time') || '';
  });
  const [dailyAnimation, setDailyAnimation] = useState(false);

  // Achievements/Milestones State
  const [claimedAchievements, setClaimedAchievements] = useState(() => {
    const saved = localStorage.getItem('novahub_claimed_achievements');
    return saved ? JSON.parse(saved) : [];
  });

  // User Custom Clan / Team State
  const [activeTeam, setActiveTeam] = useState(() => {
    return localStorage.getItem('novahub_active_team') || user?.activeTeam || '';
  });
  const [clanTag, setClanTag] = useState(() => {
    return localStorage.getItem('novahub_clan_tag') || '';
  });
  const [createClanName, setCreateClanName] = useState('');
  const [createClanTag, setCreateClanTag] = useState('');
  const [createRoster, setCreateRoster] = useState(['Player 2', 'Player 3', 'Player 4', 'Player 5']);

  // Messages / Chat Console State
  const [activeChat, setActiveChat] = useState('admin'); // 'admin' | 'support' | 'referee' | 'liaison'
  const [chatInputs, setChatInputs] = useState({ admin: '', support: '', referee: '', liaison: '' });
  const [chatLogs, setChatLogs] = useState(() => {
    const saved = localStorage.getItem('novahub_chat_logs');
    return saved ? JSON.parse(saved) : {
      admin: [
        { sender: 'contact', text: 'Hey there! Are you ready for your next tournament match?', time: '10:30 AM' },
        { sender: 'contact', text: 'Please ensure you check in 15 minutes before the start time.', time: '10:31 AM' }
      ],
      support: [
        { sender: 'contact', text: 'Hello! Welcome to Nova Hub Support. How can we assist you today?', time: '09:15 AM' }
      ],
      referee: [
        { sender: 'contact', text: 'Scores for Match 4 have been verified. Roster eligibility check passed.', time: 'Yesterday' }
      ],
      liaison: [
        { sender: 'contact', text: 'Clan tag modifications are currently locked for this season.', time: '2 days ago' }
      ]
    };
  });
  const [unreadCount, setUnreadCount] = useState(5);

  // Settings Panel Config
  const [settingsSound, setSettingsSound] = useState(true);
  const [settingsAlerts, setSettingsAlerts] = useState(true);
  const [settingsAntiCheat, setSettingsAntiCheat] = useState(true);
  const [settingsDevFallback, setSettingsDevFallback] = useState(false);

  // Fetch tournaments from backend
  const fetchTournamentsList = useCallback(async () => {
    setLoadingTournaments(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/tournaments`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setTournaments(data);
        } else {
          setTournaments(defaultFallbackTournaments);
        }
      } else {
        setTournaments(defaultFallbackTournaments);
      }
    } catch (err) {
      console.warn('Backend unavailable, falling back to mock datasets.', err);
      setTournaments(defaultFallbackTournaments);
    } finally {
      setLoadingTournaments(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchTournamentsList();
  }, [fetchTournamentsList]);

  // Sync wallet balance to localstorage
  useEffect(() => {
    localStorage.setItem('novahub_wallet_balance', walletBalance);
  }, [walletBalance]);

  // Sync transactions list to localstorage
  useEffect(() => {
    localStorage.setItem('novahub_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Sync active team / clan
  useEffect(() => {
    localStorage.setItem('novahub_active_team', activeTeam);
    localStorage.setItem('novahub_clan_tag', clanTag);
  }, [activeTeam, clanTag]);

  // Sync chat logs
  useEffect(() => {
    localStorage.setItem('novahub_chat_logs', JSON.stringify(chatLogs));
  }, [chatLogs]);

  // Sync claimed achievements
  useEffect(() => {
    localStorage.setItem('novahub_claimed_achievements', JSON.stringify(claimedAchievements));
  }, [claimedAchievements]);

  // Handle transaction logger helper
  const addTransaction = (type, desc, amount) => {
    const newTx = {
      id: 'tx-' + Date.now(),
      type,
      desc,
      amount,
      date: new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric', day: 'numeric' })
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // 1. Deposit Handler
  const handleDeposit = (e) => {
    e.preventDefault();
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }
    setWalletBalance(prev => prev + val);
    addTransaction('Credit', 'Cash Deposit (Simulated Card)', val);
    setDepositAmount('');
    setShowDepositModal(false);
    alert(`Successfully deposited ₹${val.toLocaleString()} to your Nova wallet!`);
  };

  // 2. Withdrawal Handler
  const handleWithdraw = (e) => {
    e.preventDefault();
    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val <= 0) {
      alert('Please enter a valid withdrawal amount.');
      return;
    }
    if (val > walletBalance) {
      alert('Insufficient funds in your Nova wallet.');
      return;
    }
    if (!withdrawUpi.trim()) {
      alert('Please enter a valid UPI ID or bank account details.');
      return;
    }
    setWalletBalance(prev => prev - val);
    addTransaction('Debit', `Cash Withdrawal to ${withdrawUpi}`, val);
    setWithdrawAmount('');
    setWithdrawUpi('');
    setShowWithdrawModal(false);
    alert(`Withdrawal request of ₹${val.toLocaleString()} submitted!`);
  };

  // 3. Claim Daily Reward
  const claimDaily = () => {
    const now = Date.now();
    if (lastClaimTime) {
      const hoursDiff = (now - parseInt(lastClaimTime)) / (1000 * 60 * 60);
      if (hoursDiff < 24) {
        alert('Daily reward already claimed! Please come back later.');
        return;
      }
    }

    setDailyAnimation(true);
    setTimeout(() => {
      const reward = Math.floor(Math.random() * 250) + 50; // Random reward ₹50 - ₹300
      setWalletBalance(prev => prev + reward);
      addTransaction('Credit', 'Daily Login Check-In Reward', reward);
      localStorage.setItem('novahub_last_claim_time', now.toString());
      setLastClaimTime(now.toString());
      setDailyAnimation(false);
      alert(`🎉 Congratulations! You unlocked a neubrutalist chest and claimed ₹${reward}!`);
    }, 1200);
  };

  // 4. Claim Achievement Milestone
  const claimAchievement = (id, rewardAmt) => {
    if (claimedAchievements.includes(id)) return;
    setWalletBalance(prev => prev + rewardAmt);
    addTransaction('Credit', `Milestone Unlocked: ${id.replace('-', ' ')}`, rewardAmt);
    setClaimedAchievements(prev => [...prev, id]);
    alert(`🏆 Milestone claimed! ₹${rewardAmt} added to your wallet.`);
  };

  // 5. Establish Clan
  const handleCreateClan = (e) => {
    e.preventDefault();
    if (!createClanName.trim() || !createClanTag.trim()) {
      alert('Please enter clan name and clan tag.');
      return;
    }
    const tag = createClanTag.toUpperCase().slice(0, 4);
    setActiveTeam(createClanName);
    setClanTag(tag);
    alert(`Success! Team "${createClanName}" [${tag}] is established.`);
  };

  // 6. Send Chat Message & Trigger simulated reply
  const sendChatMessage = (contactId) => {
    const textMsg = chatInputs[contactId]?.trim();
    if (!textMsg) return;

    // Log user message
    const userMsgObj = { sender: 'user', text: textMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const updatedLogs = { ...chatLogs };
    updatedLogs[contactId] = [...(updatedLogs[contactId] || []), userMsgObj];

    // Clear input
    setChatInputs(prev => ({ ...prev, [contactId]: '' }));
    setChatLogs(updatedLogs);

    // Simulated contact response timer
    setTimeout(() => {
      const responses = MOCK_REPLIES[contactId] || ["Received! Support pipelines are processing your request."];
      const randomResponseText = responses[Math.floor(Math.random() * responses.length)];
      const replyMsgObj = {
        sender: 'contact',
        text: randomResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      const newLogs = { ...updatedLogs };
      newLogs[contactId] = [...(newLogs[contactId] || []), replyMsgObj];
      setChatLogs(newLogs);
      
      if (settingsSound) {
        // play simulated subtle beep
        console.log('Simulated beep sound effect.');
      }
    }, 1000);
  };

  // 7. Clear/Reset all local data
  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all dashboard mock balances, chats, and active clans?')) {
      localStorage.removeItem('novahub_wallet_balance');
      localStorage.removeItem('novahub_transactions');
      localStorage.removeItem('novahub_active_team');
      localStorage.removeItem('novahub_clan_tag');
      localStorage.removeItem('novahub_chat_logs');
      localStorage.removeItem('novahub_claimed_achievements');
      localStorage.removeItem('novahub_last_claim_time');
      
      setWalletBalance(2500);
      setTransactions([{ id: 'tx-1', type: 'Credit', desc: 'Welcome Bonus Credited', amount: 2500, date: 'July 2026' }]);
      setActiveTeam('');
      setClanTag('');
      setClaimedAchievements([]);
      setLastClaimTime('');
      setChatLogs({
        admin: [
          { sender: 'contact', text: 'Hey there! Are you ready for your next tournament match?', time: '10:30 AM' },
          { sender: 'contact', text: 'Please ensure you check in 15 minutes before the start time.', time: '10:31 AM' }
        ],
        support: [
          { sender: 'contact', text: 'Hello! Welcome to Nova Hub Support. How can we assist you today?', time: '09:15 AM' }
        ],
        referee: [
          { sender: 'contact', text: 'Scores for Match 4 have been verified. Roster eligibility check passed.', time: 'Yesterday' }
        ],
        liaison: [
          { sender: 'contact', text: 'Clan tag modifications are currently locked for this season.', time: '2 days ago' }
        ]
      });
      alert('Data reset to default values.');
    }
  };

  // Calculate achievements stats
  const registeredCount = tournaments.filter(t => t.registeredTeams?.some(team => team.captainEmail === user?.email)).length;
  const isClanCreated = !!activeTeam;
  const isHighRoller = walletBalance >= 5000;

  // Custom Sidebar Menu Options
  const sidebarMenu = [
    { id: 'all-tournaments', label: 'All Tournaments', icon: Trophy, badge: null },
    { id: 'my-tournaments', label: 'My Tournaments', icon: CalendarDays, badge: null },
    { id: 'live-tournaments', label: 'Live Tournaments', icon: Radio, badge: 'pulse' },
    { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp, badge: null },
    { id: 'teams', label: 'Teams', icon: Users, badge: null },
    { id: 'my-profile', label: 'My Profile', icon: User, badge: null },
    { id: 'wallet', label: 'Wallet', icon: Wallet, badge: null },
    { id: 'rewards', label: 'Rewards', icon: Gift, badge: null },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  // Renders the host listing form view
  if (currentPage === 'hostPage') {
    return (
      <div className="min-h-screen bg-[#c4e4e3] flex flex-col items-center pt-32 pb-20 px-4 md:px-8 justify-start font-mono">
        <div className="w-full max-w-4xl">
          <button 
            onClick={() => { setCurrentPage('dashboard'); fetchTournamentsList(); }}
            className="mb-8 bg-white border-[3px] border-[#1a1a1a] px-4 py-2 font-black uppercase text-xs shadow-[3px_3px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_rgba(26,26,26,1)] transition-all interactive-target"
          >
            ← Back to Dashboard
          </button>
          <HostForm setCurrentPage={() => { setCurrentPage('dashboard'); fetchTournamentsList(); }} apiBaseUrl={apiBaseUrl} user={user} />
        </div>
      </div>
    );
  }

  // Renders team roster registration form view
  if (selectedTournament) {
    // Custom wrapper that checks entry fee against wallet balance before showing roster form
    const fee = selectedTournament.entryFee || 0;
    const canAfford = walletBalance >= fee;

    const handleRegisterSuccess = (updatedTournament) => {
      // Deduct entry fee
      if (fee > 0) {
        setWalletBalance(prev => prev - fee);
        addTransaction('Debit', `Entry Fee: ${selectedTournament.title}`, fee);
      }
      setSelectedTournament(null);
      setActiveTab('my-tournaments');
      fetchTournamentsList();
      alert(`Success! Roster submitted. Entry Fee of ₹${fee} deducted from wallet.`);
    };

    return (
      <div className="min-h-screen bg-[#c4e4e3] flex flex-col items-center pt-32 pb-20 px-4 md:px-8 justify-start font-mono text-[#1a1a1a]">
        <div className="w-full max-w-3xl bg-white border-[3px] border-[#1a1a1a] p-6 md:p-8 rounded-2xl shadow-[6px_6px_0px_rgba(26,26,26,1)]">
          <div className="flex justify-between items-center border-b-[3px] border-[#1a1a1a] pb-4 mb-6">
            <h2 className="text-xl md:text-2xl font-black uppercase">Tournament Entry Gate</h2>
            <button 
              onClick={() => setSelectedTournament(null)}
              className="bg-[#ffb3ba] border-2 border-black p-1 hover:translate-x-[1px] hover:translate-y-[1px] shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!canAfford ? (
            <div className="bg-[#ffb3ba] border-[3px] border-[#1a1a1a] p-6 rounded-xl flex flex-col gap-4 text-center">
              <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
              <h3 className="text-lg font-black uppercase">Insufficient Funds</h3>
              <p className="text-xs font-bold opacity-80">
                This tournament requires an entry fee of <span className="underline">₹{fee}</span>. Your current balance is only <span className="underline">₹{walletBalance}</span>.
              </p>
              <div className="flex gap-4 justify-center mt-2">
                <button 
                  onClick={() => { setSelectedTournament(null); setActiveTab('wallet'); }} 
                  className="bg-white border-2 border-black px-4 py-2 text-xs font-bold uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                >
                  Go to Wallet
                </button>
                <button 
                  onClick={() => setSelectedTournament(null)} 
                  className="bg-[#1a1a1a] text-white border-2 border-black px-4 py-2 text-xs font-bold uppercase"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <JoinEventPage 
              setCurrentPage={() => setSelectedTournament(null)} 
              apiBaseUrl={apiBaseUrl} 
              user={user} 
              customJoinFlow={{
                tournament: selectedTournament,
                onSuccess: handleRegisterSuccess
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#c4e4e3] pt-24 pb-12 font-mono text-[#1a1a1a] relative">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* Mobile Header Bar */}
        <div className="md:hidden flex justify-between items-center bg-white border-[3px] border-[#1a1a1a] p-4 rounded-xl shadow-[4px_4px_0px_rgba(26,26,26,1)] mb-6">
          <span className="text-sm font-black uppercase">Dashboard Console</span>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-yellow-200 border-2 border-black px-3 py-1 text-xs font-black uppercase"
          >
            Menu
          </button>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          
          {/* ─── SIDEBAR CONTAINER (Desktop) ─── */}
          <aside className={`
            md:block md:col-span-1 bg-[#0d111b] border-[3px] border-[#1a1a1a] p-5 rounded-2xl shadow-[6px_6px_0px_rgba(26,26,26,1)] text-white font-mono
            ${mobileMenuOpen ? 'block fixed inset-x-4 top-24 z-40 max-h-[80vh] overflow-y-auto' : 'hidden'}
          `}>
            {/* Header info */}
            <div className="border-b-2 border-white/10 pb-4 mb-4 flex items-center gap-3">
              <div className="h-10 w-10 bg-yellow-200 border-2 border-black rounded-lg text-black flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_rgba(255,255,255,0.25)]">
                {profileName.slice(0,2).toUpperCase()}
              </div>
              <div className="truncate">
                <span className="text-[10px] font-black uppercase text-[#fcebb6] block tracking-wider">
                  {user?.role === 'host' ? '⚡ Host Admin' : '🛡️ Player Standings'}
                </span>
                <span className="text-xs font-black uppercase block truncate">{profileName}</span>
              </div>
            </div>

            {/* Nav list */}
            <nav className="flex flex-col gap-1.5">
              {sidebarMenu.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                      if (item.id === 'messages') {
                        setUnreadCount(0); // clear unread count upon click
                      }
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold uppercase text-xs transition-all text-left
                      ${isActive 
                        ? 'bg-[#fcebb6] text-[#1a1a1a] border-2 border-[#1a1a1a] shadow-[2.5px_2.5px_0px_rgba(26,26,26,1)] translate-x-[0.5px] translate-y-[0.5px]' 
                        : 'hover:bg-white/10 text-white/80 hover:text-white'
                      }
                    `}
                  >
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-[#1a1a1a]' : 'text-white/60'}`} />
                    <span>{item.label}</span>
                    
                    {/* Badge indicator */}
                    {item.badge === 'pulse' && (
                      <span className="flex h-2 w-2 relative ml-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}

                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="ml-auto bg-purple-600 border border-black text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Discord card at bottom */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="bg-[#1a2130] border-2 border-white/10 p-4 rounded-xl text-center flex flex-col gap-3">
                <span className="text-[10px] uppercase font-bold text-white/50 block tracking-widest">Join Discord Community</span>
                <span className="text-[9px] text-white/70 block leading-relaxed">Connect with esports fans, find teammates, and check game brackets.</span>
                <button
                  onClick={() => alert('Discord Overlay Activated! Connected to Nova Hub #lobby successfully.')}
                  className="w-full bg-[#5865F2] hover:bg-[#4d5bdf] border-2 border-black text-white text-[10px] py-2 uppercase font-black tracking-widest shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all interactive-target"
                >
                  Join Now
                </button>
              </div>
            </div>
          </aside>

          {/* ─── MAIN CONTENT VIEW (Desktop) ─── */}
          <main className="col-span-1 md:col-span-3 bg-white border-[3px] border-[#1a1a1a] rounded-2xl shadow-[6px_6px_0px_rgba(26,26,26,1)] p-6 min-h-[70vh] flex flex-col gap-6">
            
            {/* Tab Header Banner */}
            <div className="border-b-[3px] border-[#1a1a1a] pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  {activeTab === 'all-tournaments' && <Trophy className="w-6 h-6 text-yellow-500" />}
                  {activeTab === 'my-tournaments' && <CalendarDays className="w-6 h-6 text-green-500" />}
                  {activeTab === 'live-tournaments' && <Radio className="w-6 h-6 text-red-500 animate-pulse" />}
                  {activeTab === 'leaderboard' && <TrendingUp className="w-6 h-6 text-blue-500" />}
                  {activeTab === 'teams' && <Users className="w-6 h-6 text-purple-500" />}
                  {activeTab === 'my-profile' && <User className="w-6 h-6 text-pink-500" />}
                  {activeTab === 'wallet' && <Wallet className="w-6 h-6 text-yellow-600" />}
                  {activeTab === 'rewards' && <Gift className="w-6 h-6 text-orange-500" />}
                  {activeTab === 'messages' && <MessageSquare className="w-6 h-6 text-purple-600" />}
                  {activeTab === 'settings' && <Settings className="w-6 h-6 text-gray-500" />}
                  <span>{activeTab.replace('-', ' ')}</span>
                </h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">
                  Nova Hub Standings Console · Active View
                </p>
              </div>

              {/* Show host creation trigger inside tournaments headers */}
              {user?.role === 'host' && (activeTab === 'all-tournaments' || activeTab === 'my-tournaments') && (
                <button
                  onClick={() => setCurrentPage('hostPage')}
                  className="bg-yellow-200 border-[3px] border-black px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all interactive-target flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Host Event</span>
                </button>
              )}
            </div>

            {/* ─── TAB CONTENT VIEWS ─── */}

            {/* TAB 1: ALL TOURNAMENTS */}
            {activeTab === 'all-tournaments' && (
              <div className="flex-1 flex flex-col gap-4">
                {loadingTournaments ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                    <span className="text-xs uppercase font-black">Scanning match pipelines...</span>
                  </div>
                ) : (
                  <JoinEventPage 
                    setCurrentPage={setCurrentPage} 
                    apiBaseUrl={apiBaseUrl} 
                    user={user} 
                    customJoinFlow={{
                      onSelectOverride: (t) => setSelectedTournament(t)
                    }}
                  />
                )}
              </div>
            )}

            {/* TAB 2: MY TOURNAMENTS */}
            {activeTab === 'my-tournaments' && (
              <div className="flex-1 flex flex-col gap-6">
                {(() => {
                  const myEvents = tournaments.filter(t => {
                    const isHost = t.hostId?._id === user?.id || t.hostId === user?.id || t.hostId?.username === user?.username;
                    const isPlayer = t.registeredTeams?.some(team => team.captainEmail === user?.email);
                    return isHost || isPlayer;
                  });

                  if (myEvents.length === 0) {
                    return (
                      <div className="bg-[#bde3fb] border-[3px] border-[#1a1a1a] p-8 rounded-2xl shadow-[4px_4px_0px_rgba(26,26,26,1)] text-center">
                        <CalendarDays className="w-12 h-12 text-[#1a1a1a]/60 mx-auto mb-4" />
                        <h3 className="text-lg font-black uppercase mb-1">No Active Registrations</h3>
                        <p className="text-xs font-bold opacity-75 max-w-md mx-auto mb-6">
                          You haven't hosted or joined any active tournaments yet. Check the main board to register or swap to host mode.
                        </p>
                        <button
                          onClick={() => setActiveTab('all-tournaments')}
                          className="bg-white hover:bg-yellow-100 border-[3px] border-black px-6 py-2.5 text-xs font-black uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all interactive-target"
                        >
                          Find Tournaments
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-4">
                      {myEvents.map((t, idx) => {
                        const isHost = t.hostId?._id === user?.id || t.hostId === user?.id || t.hostId?.username === user?.username;
                        return (
                          <div 
                            key={t._id || idx} 
                            onClick={() => navigate(`/tournament/${t._id}`)}
                            className="bg-white hover:bg-yellow-50 border-[3px] border-[#1a1a1a] p-5 rounded-2xl shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(26,26,26,1)] transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                          >
                            <div>
                              <div className="flex gap-2 items-center mb-1">
                                <span className="bg-[#1a1a1a] text-white text-[9px] px-1.5 py-0.2 uppercase font-black">
                                  {t.gameName}
                                </span>
                                <span className={`text-[9px] px-1.5 py-0.2 uppercase font-black border border-black ${isHost ? 'bg-purple-200' : 'bg-green-200'}`}>
                                  {isHost ? 'Hosted by me' : 'Joined by me'}
                                </span>
                              </div>
                              <h3 className="text-base font-black uppercase">{t.title}</h3>
                              <span className="text-[10px] text-gray-500 block uppercase font-bold mt-1">
                                Format: {t.format} · Slots: {t.registeredTeams?.length || 0}/{t.maxTeams}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`text-[9px] px-2.5 py-1 font-black border-2 border-black rounded-full uppercase ${t.status === 'ongoing' || t.status === 'live' ? 'bg-red-400 text-white' : 'bg-yellow-100'}`}>
                                {t.status === 'ongoing' || t.status === 'live' ? 'LIVE' : t.status}
                              </span>
                              <span className="text-gray-400 group-hover:text-black">→</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 3: LIVE TOURNAMENTS */}
            {activeTab === 'live-tournaments' && (
              <div className="flex-1 flex flex-col gap-6">
                {(() => {
                  const liveEvents = tournaments.filter(t => t.status === 'ongoing' || t.status === 'live');
                  
                  if (liveEvents.length === 0) {
                    return (
                      <div className="bg-[#ffb3ba] border-[3px] border-[#1a1a1a] p-8 rounded-2xl shadow-[4px_4px_0px_rgba(26,26,26,1)] text-center">
                        <Radio className="w-12 h-12 text-[#1a1a1a]/60 mx-auto mb-4 animate-bounce" />
                        <h3 className="text-lg font-black uppercase mb-1">No Ongoing Matches</h3>
                        <p className="text-xs font-bold opacity-75 max-w-md mx-auto">
                          There are currently no active live matches running. Check back shortly or host one yourself to start brackets.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-4">
                      {liveEvents.map((t, idx) => (
                        <div 
                          key={t._id || idx}
                          onClick={() => navigate(`/tournament/${t._id}`)}
                          className="bg-white hover:bg-red-50 border-[3px] border-black p-5 rounded-2xl shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(26,26,26,1)] transition-all cursor-pointer flex justify-between items-center gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <span className="flex h-3.5 w-3.5 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                            </span>
                            <div>
                              <h3 className="text-base font-black uppercase">{t.title}</h3>
                              <span className="text-[9px] uppercase font-black bg-black text-white px-1.5 py-0.2 inline-block mt-1">
                                {t.gameName}
                              </span>
                              <span className="text-[10px] text-gray-500 font-bold uppercase ml-2">
                                Region: {t.venueDetails?.serverRegion || 'India'}
                              </span>
                            </div>
                          </div>
                          
                          <button className="bg-red-400 hover:bg-red-500 border-2 border-black px-4 py-1.5 text-[10px] font-black uppercase text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all">
                            Spectate / Manage
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 4: LEADERBOARD */}
            {activeTab === 'leaderboard' && (
              <div className="flex-1 flex flex-col gap-6">
                <p className="text-xs font-bold opacity-75 leading-relaxed bg-yellow-50 border border-yellow-300 p-3 rounded-lg">
                  💡 Standings show global team power indexes calculated from match brackets, placement points, and anti-cheat validations.
                </p>

                <div className="border-[3px] border-[#1a1a1a] rounded-2xl overflow-hidden shadow-[4px_4px_0px_rgba(26,26,26,1)] font-mono text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1a1a1a] text-white uppercase font-black text-[10px] tracking-wider border-b-[3px] border-black">
                        <th className="p-3">Rank</th>
                        <th className="p-3">Team / Clan</th>
                        <th className="p-3 text-center">Matches</th>
                        <th className="p-3 text-center">Wins</th>
                        <th className="p-3 text-center">Kills</th>
                        <th className="p-3 text-center">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1a]/15">
                      {[
                        { rank: 1, name: 'Apex Predators', tag: 'APX', played: 14, wins: 11, kills: 124, pts: 348 },
                        { rank: 2, name: 'Team Vipers', tag: 'VPR', played: 12, wins: 9, kills: 98, pts: 278 },
                        { rank: 3, name: 'Team Glitch', tag: 'GLT', played: 15, wins: 8, kills: 110, pts: 254 },
                        { rank: 4, name: 'Zero Ping Esports', tag: 'ZP', played: 13, wins: 7, kills: 84, pts: 218 },
                        { rank: 5, name: 'Hyper Shadows', tag: 'HSD', played: 11, wins: 5, kills: 64, pts: 154 },
                        { rank: 6, name: 'Fatal Error', tag: 'ERR', played: 10, wins: 4, kills: 48, pts: 120 }
                      ].map((team, idx) => {
                        const medal = team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : team.rank === 3 ? '🥉' : null;
                        const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                        return (
                          <tr key={team.rank} className={`${rowBg} hover:bg-yellow-50 transition-colors font-bold`}>
                            <td className="p-3 font-black text-center">{medal || team.rank}</td>
                            <td className="p-3">
                              <span className="uppercase text-[#1a1a1a]">{team.name}</span>
                              <span className="bg-gray-200 border border-black px-1 text-[9px] ml-2 font-black rounded-sm">{team.tag}</span>
                            </td>
                            <td className="p-3 text-center">{team.played}</td>
                            <td className="p-3 text-center text-green-600">{team.wins}</td>
                            <td className="p-3 text-center text-red-500">{team.kills}</td>
                            <td className="p-3 text-center font-black">{team.pts}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: TEAMS */}
            {activeTab === 'teams' && (
              <div className="flex-1 flex flex-col gap-6">
                {isClanCreated ? (
                  /* Clan Dashboard Panel */
                  <div className="bg-[#fce4fb] border-[3px] border-[#1a1a1a] p-6 rounded-2xl shadow-[6px_6px_0px_rgba(26,26,26,1)] flex flex-col gap-6">
                    <div className="flex justify-between items-start border-b-[2px] border-[#1a1a1a]/20 pb-4">
                      <div>
                        <span className="text-[10px] uppercase font-black bg-white border border-black px-2 py-0.5 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                          Active Squad Registered
                        </span>
                        <h3 className="text-2xl font-black uppercase mt-2">{activeTeam}</h3>
                        <span className="text-xs opacity-60 font-bold block">Tag: [{clanTag}]</span>
                      </div>
                      
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to disband your clan? All squad history will be cleared.')) {
                            setActiveTeam('');
                            setClanTag('');
                          }
                        }}
                        className="bg-white hover:bg-red-100 border-[3px] border-black p-2 text-red-500 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        title="Disband Clan"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div>
                      <h4 className="text-sm font-black uppercase mb-3 flex items-center gap-1.5">
                        <Users className="w-4 h-4" /> Active Roster Members
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Captain */}
                        <div className="bg-white border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,1)] flex justify-between items-center">
                          <div>
                            <span className="text-[9px] uppercase font-black text-purple-600">Captain (You)</span>
                            <div className="text-xs font-black uppercase">{profileName}</div>
                          </div>
                          <Award className="w-5 h-5 text-yellow-500" />
                        </div>

                        {/* Roster Members */}
                        {createRoster.map((player, idx) => (
                          <div key={idx} className="bg-white border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,1)] flex justify-between items-center">
                            <div>
                              <span className="text-[9px] uppercase font-black text-gray-500">Player {idx + 2}</span>
                              <div className="text-xs font-black uppercase">{player}</div>
                            </div>
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border-[3px] border-[#1a1a1a] p-4 rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                      <span className="text-[10px] uppercase font-black opacity-60 block">Private Tournament Access Token</span>
                      <span className="text-sm font-black uppercase tracking-wider block mt-1 font-mono text-purple-600">
                        PASS-{clanTag}-SQUAD-1337
                      </span>
                      <span className="text-[9px] block text-gray-400 mt-2">
                        Use this pass code to verify entries at physical venues or esports lobby integrations.
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Create Clan Setup Form */
                  <div className="bg-[#baffc9] border-[3px] border-[#1a1a1a] p-6 rounded-2xl shadow-[6px_6px_0px_rgba(26,26,26,1)] flex flex-col gap-4">
                    <h3 className="text-lg font-black uppercase mb-1">Establish Your Clan</h3>
                    <p className="text-xs font-bold opacity-75">
                      Create your clan identity, assign a tag, and invite players. Joining tournaments will automatically import this roster.
                    </p>

                    <form onSubmit={handleCreateClan} className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] uppercase font-black block mb-1">Clan/Team Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Bangalore Strikers"
                            value={createClanName}
                            onChange={(e) => setCreateClanName(e.target.value)}
                            className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-black block mb-1">Clan Tag (Max 4 chars)</label>
                          <input
                            type="text"
                            placeholder="e.g. BST"
                            value={createClanTag}
                            onChange={(e) => setCreateClanTag(e.target.value)}
                            maxLength={4}
                            className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold uppercase outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-black block mb-2">Configure Default Roster Members</label>
                        <div className="grid grid-cols-2 gap-2">
                          {createRoster.map((player, idx) => (
                            <input
                              key={idx}
                              type="text"
                              value={player}
                              onChange={(e) => {
                                const newR = [...createRoster];
                                newR[idx] = e.target.value;
                                setCreateRoster(newR);
                              }}
                              className="bg-white border-2 border-black p-2 text-xs font-bold outline-none"
                              placeholder={`Player ${idx + 2}`}
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="bg-white hover:bg-yellow-100 border-[3px] border-black py-3 text-xs font-black uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all mt-2"
                      >
                        Establish Clan Roster
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: MY PROFILE */}
            {activeTab === 'my-profile' && (
              <div className="flex-1 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Column: Player Card Visual */}
                  <div className="md:col-span-1 bg-[#ffb3ba] border-[3px] border-[#1a1a1a] p-5 rounded-2xl shadow-[4px_4px_0px_rgba(26,26,26,1)] flex flex-col gap-4 text-center">
                    <div className="h-20 w-20 bg-white border-[3px] border-black rounded-full mx-auto flex items-center justify-center font-black text-3xl shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                      {profileName.slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black bg-white border border-black px-2 py-0.5 rounded-sm">
                        {user?.role.toUpperCase()}
                      </span>
                      <h3 className="text-xl font-black uppercase mt-3 truncate">{profileName}</h3>
                      <p className="text-[10px] font-bold opacity-60 truncate">{profileEmail}</p>
                    </div>

                    <div className="bg-white border-2 border-black p-2 rounded-xl text-xs font-bold uppercase mt-2">
                      <div>Balance: ₹{walletBalance.toLocaleString()}</div>
                      <div className="text-[10px] opacity-60 mt-1">Clan: {activeTeam ? `[${clanTag}]` : 'None'}</div>
                    </div>
                  </div>

                  {/* Right Column: Edit form */}
                  <div className="md:col-span-2 bg-[#fcebb6] border-[3px] border-black p-6 rounded-2xl shadow-[4px_4px_0px_rgba(26,26,26,1)] flex flex-col gap-4">
                    <h3 className="text-base font-black uppercase">Edit Credentials</h3>
                    
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-black block mb-1">Username</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-black block mb-1">Email Address</label>
                        <input
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold outline-none"
                        />
                      </div>
                    </div>

                    {/* Role swap toggle trigger */}
                    <div className="border-t border-[#1a1a1a]/15 pt-4 flex flex-col gap-3">
                      <span className="text-[10px] uppercase font-black opacity-60 block">Toggle Administrative Modes</span>
                      <button
                        onClick={() => {
                          onRoleToggle();
                          alert('Role swapped! The server coordinates role permissions dynamically.');
                        }}
                        className="bg-white hover:bg-purple-100 border-[3px] border-black py-2.5 text-xs font-black uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-4 h-4 text-purple-600" />
                        <span>Swap Role Mode ({user?.role === 'host' ? 'To Player' : 'To Host'})</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 7: WALLET */}
            {activeTab === 'wallet' && (
              <div className="flex-1 flex flex-col gap-6">
                
                {/* Wallet Balance Card */}
                <div className="bg-[#baffc9] border-[3px] border-[#1a1a1a] p-6 rounded-2xl shadow-[6px_6px_0px_rgba(26,26,26,1)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-black opacity-60 block tracking-widest">Available Wallet Balance</span>
                    <h3 className="text-4xl font-black uppercase mt-1">₹{walletBalance.toLocaleString()}</h3>
                    <span className="text-[9px] font-bold text-gray-500 block uppercase mt-1">
                      Safe currency secured by simulated mock banks.
                    </span>
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setShowDepositModal(true)}
                      className="flex-1 sm:flex-none bg-white hover:bg-yellow-100 border-[3px] border-black px-5 py-2.5 text-xs font-black uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4 text-green-600" />
                      <span>Deposit</span>
                    </button>
                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      className="flex-1 sm:flex-none bg-[#1a1a1a] text-white hover:bg-black border-[3px] border-black px-5 py-2.5 text-xs font-black uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4 text-white" />
                      <span>Withdraw</span>
                    </button>
                  </div>
                </div>

                {/* Transaction history */}
                <div>
                  <h4 className="text-xs font-black uppercase mb-3 tracking-widest opacity-60">Transaction History</h4>
                  <div className="border-[3px] border-[#1a1a1a] rounded-2xl overflow-hidden shadow-[4px_4px_0px_rgba(26,26,26,1)]">
                    <div className="bg-[#1a1a1a] text-white text-[10px] font-black uppercase p-3 grid grid-cols-3">
                      <span>Transaction Detail</span>
                      <span className="text-center">Date</span>
                      <span className="text-right">Amount</span>
                    </div>
                    <div className="divide-y divide-[#1a1a1a]/15 max-h-[250px] overflow-y-auto font-mono text-xs">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="p-3 grid grid-cols-3 items-center hover:bg-yellow-50/50 bg-white font-bold">
                          <div className="truncate">
                            <span className="text-[10px] block opacity-50 uppercase">{tx.type}</span>
                            <span className="uppercase text-[#1a1a1a] block truncate">{tx.desc}</span>
                          </div>
                          <span className="text-center text-gray-500">{tx.date}</span>
                          <span className={`text-right font-black ${tx.type === 'Credit' ? 'text-green-600' : 'text-red-500'}`}>
                            {tx.type === 'Credit' ? '+' : '-'}₹{tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 8: REWARDS */}
            {activeTab === 'rewards' && (
              <div className="flex-1 flex flex-col gap-6">
                
                {/* Daily Reward Box */}
                <div className="bg-[#fcebb6] border-[3px] border-[#1a1a1a] p-6 rounded-2xl shadow-[6px_6px_0px_rgba(26,26,26,1)] flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                    <div className={`
                      h-16 w-16 bg-white border-2 border-black rounded-2xl flex items-center justify-center text-3xl shadow-[3px_3px_0px_rgba(0,0,0,1)]
                      ${dailyAnimation ? 'animate-bounce' : 'sticker-hover'}
                    `}>
                      📦
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black opacity-60 block tracking-widest">Daily Reward Chest</span>
                      <h3 className="text-lg font-black uppercase mt-1">Unlock Daily Loot</h3>
                      <p className="text-xs font-bold text-gray-500 block uppercase mt-0.5">
                        Claim free credits once every 24 hours to support entry fees!
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={claimDaily}
                    disabled={dailyAnimation}
                    className="w-full sm:w-auto bg-white hover:bg-yellow-200 border-[3px] border-black px-6 py-3.5 text-xs font-black uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-1.5"
                  >
                    {dailyAnimation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4 text-red-500" />}
                    <span>{dailyAnimation ? 'Unlocking Box...' : 'Claim Daily Reward'}</span>
                  </button>
                </div>

                {/* Achievements List */}
                <div>
                  <h4 className="text-xs font-black uppercase mb-3 tracking-widest opacity-60">Achievement Milestones</h4>
                  <div className="flex flex-col gap-4">
                    {[
                      { id: 'first-blood', title: 'Novice Challenger', desc: 'Register squad for at least 1 tournament.', req: 1, current: registeredCount, reward: 200 },
                      { id: 'clan-chief', title: 'Clan Master', desc: 'Create/Establish a team roster.', req: 1, current: isClanCreated ? 1 : 0, reward: 300 },
                      { id: 'high-roller', title: 'High Roller', desc: 'Accumulate ₹5,000 in your Nova Wallet balance.', req: 5000, current: walletBalance, reward: 500 }
                    ].map((ach) => {
                      const pct = Math.min(100, Math.floor((ach.current / ach.req) * 100));
                      const isDone = ach.current >= ach.req;
                      const isClaimed = claimedAchievements.includes(ach.id);

                      return (
                        <div key={ach.id} className="bg-white border-[3px] border-black p-5 rounded-2xl shadow-[4px_4px_0px_rgba(26,26,26,1)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex gap-2 items-center mb-1">
                              <h5 className="text-sm font-black uppercase">{ach.title}</h5>
                              <span className="text-[9px] uppercase font-black bg-yellow-200 border border-black px-1.5 py-0.2">
                                Reward: ₹{ach.reward}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 font-bold uppercase">{ach.desc}</p>
                            
                            {/* Progress bar */}
                            <div className="mt-3 w-full max-w-md bg-gray-100 border-2 border-black h-4 rounded-full overflow-hidden relative">
                              <div 
                                className="bg-[#baffc9] h-full border-r-2 border-black transition-all" 
                                style={{ width: `${pct}%` }} 
                              />
                              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black uppercase">
                                {ach.id === 'high-roller' ? `₹${ach.current}/₹${ach.req}` : `${ach.current}/${ach.req}`} ({pct}%)
                              </span>
                            </div>
                          </div>

                          <div>
                            {isClaimed ? (
                              <button disabled className="bg-gray-100 border-[3px] border-gray-300 text-gray-400 px-4 py-2 rounded-xl text-xs font-black uppercase cursor-not-allowed">
                                Claimed ✓
                              </button>
                            ) : isDone ? (
                              <button 
                                onClick={() => claimAchievement(ach.id, ach.reward)}
                                className="bg-yellow-200 hover:bg-yellow-300 border-[3px] border-black px-4 py-2 rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                              >
                                Claim Reward
                              </button>
                            ) : (
                              <button disabled className="bg-white border-[3px] border-gray-300 text-gray-300 px-4 py-2 rounded-xl text-xs font-black uppercase cursor-not-allowed">
                                Locked 🔒
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 9: MESSAGES */}
            {activeTab === 'messages' && (
              <div className="flex-1 border-[3px] border-[#1a1a1a] rounded-2xl overflow-hidden shadow-[4px_4px_0px_rgba(26,26,26,1)] grid grid-cols-1 sm:grid-cols-3 h-[450px] font-mono text-xs text-[#1a1a1a]">
                
                {/* Left Side: Contacts list */}
                <div className="bg-[#0d111b] border-r-2 border-[#1a1a1a] flex flex-col text-white">
                  <span className="text-[9px] uppercase font-black opacity-60 tracking-wider p-3 block border-b border-white/10">
                    Active Conversations
                  </span>
                  
                  <div className="flex flex-col overflow-y-auto divide-y divide-white/5 flex-1">
                    {[
                      { id: 'admin', name: 'Suresh (Tournament Admin)', desc: 'Brackets & scheduling check' },
                      { id: 'support', name: 'System Host Support', desc: 'General coordinates check-in' },
                      { id: 'referee', name: 'Match Referee Desk', desc: 'Rules & score submissions' },
                      { id: 'liaison', name: 'Clans Liaison Bot', desc: 'Rosters & Clan tags help' }
                    ].map((c) => {
                      const isSelected = activeChat === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setActiveChat(c.id)}
                          className={`w-full p-3 text-left transition-all ${isSelected ? 'bg-white/10 text-yellow-200' : 'hover:bg-white/5'}`}
                        >
                          <div className="font-black uppercase text-[11px] truncate">{c.name}</div>
                          <div className="text-[9px] text-white/55 truncate mt-0.5">{c.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Message Window */}
                <div className="sm:col-span-2 flex flex-col bg-white">
                  
                  {/* Chat window header */}
                  <div className="bg-yellow-50 border-b-2 border-black p-3.5 flex justify-between items-center">
                    <span className="font-black uppercase text-[10px]">
                      Chat Session: {activeChat === 'admin' ? 'Suresh (Admin)' : activeChat === 'support' ? 'System Support' : activeChat === 'referee' ? 'Referee' : 'Clans Liaison'}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] bg-green-200 border border-black px-1.5 py-0.2 rounded-sm font-black">
                      <span className="h-1.5 w-1.5 bg-green-600 rounded-full inline-block animate-pulse" />
                      <span>Online</span>
                    </span>
                  </div>

                  {/* Messages logs area */}
                  <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 min-h-0 bg-yellow-50/15">
                    {(chatLogs[activeChat] || []).map((msg, idx) => {
                      const isUser = msg.sender === 'user';
                      return (
                        <div key={idx} className={`flex flex-col max-w-[80%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}>
                          <div className={`p-2.5 rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] ${isUser ? 'bg-[#bde3fb]' : 'bg-white'}`}>
                            <p className="font-bold text-xs leading-relaxed">{msg.text}</p>
                          </div>
                          <span className="text-[8px] text-gray-400 mt-1 uppercase font-bold">{msg.time}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input Box */}
                  <div className="border-t-[3px] border-black p-3.5 flex gap-2 bg-white">
                    <input
                      type="text"
                      placeholder="Type a response to support..."
                      value={chatInputs[activeChat]}
                      onChange={(e) => {
                        const newInputs = { ...chatInputs };
                        newInputs[activeChat] = e.target.value;
                        setChatInputs(newInputs);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') sendChatMessage(activeChat);
                      }}
                      className="flex-1 bg-white border-2 border-black px-3.5 py-2 text-xs font-bold outline-none"
                    />
                    <button
                      onClick={() => sendChatMessage(activeChat)}
                      className="bg-yellow-200 hover:bg-yellow-300 border-[3px] border-black p-2.5 shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 10: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="flex-1 flex flex-col gap-6">
                
                <div className="bg-[#bde3fb] border-[3px] border-black p-5 rounded-2xl shadow-[4px_4px_0px_rgba(26,26,26,1)] flex flex-col gap-4">
                  <h3 className="text-base font-black uppercase flex items-center gap-1.5">
                    <Sliders className="w-5 h-5" /> Preferences Configuration
                  </h3>

                  <div className="flex flex-col gap-3 font-bold text-xs uppercase">
                    
                    {/* Switch 1 */}
                    <label className="flex items-center justify-between p-2.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-blue-500" />
                        <span>Enable Chat Sound Effects</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsSound}
                        onChange={(e) => setSettingsSound(e.target.checked)}
                        className="h-4 w-4 border-2 border-black outline-none"
                      />
                    </label>

                    {/* Switch 2 */}
                    <label className="flex items-center justify-between p-2.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-yellow-500" />
                        <span>Enable Real-time Match Push Alerts</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsAlerts}
                        onChange={(e) => setSettingsAlerts(e.target.checked)}
                        className="h-4 w-4 border-2 border-black outline-none"
                      />
                    </label>

                    {/* Switch 3 */}
                    <label className="flex items-center justify-between p-2.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span>Background Anti-Cheat Scan (Vanguard Integration)</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsAntiCheat}
                        onChange={(e) => setSettingsAntiCheat(e.target.checked)}
                        className="h-4 w-4 border-2 border-black outline-none"
                      />
                    </label>

                  </div>
                </div>

                {/* Reset Data card */}
                <div className="bg-[#ffb3ba] border-[3px] border-black p-5 rounded-2xl shadow-[4px_4px_0px_rgba(26,26,26,1)] flex flex-col gap-3">
                  <h3 className="text-base font-black uppercase">Developer Administration</h3>
                  <p className="text-xs font-bold opacity-75">
                    Clear stored balances, claimed achievements, and simulated chats to default settings for fresh testing.
                  </p>
                  
                  <button
                    onClick={handleResetData}
                    className="w-max bg-white hover:bg-red-50 border-[3px] border-black px-5 py-2 text-xs font-black uppercase text-red-500 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all interactive-target"
                  >
                    Reset Dashboard Memory
                  </button>
                </div>

              </div>
            )}

          </main>

        </div>
      </div>

      {/* ─── MODALS ─── */}

      {/* 1. DEPOSIT MODAL */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-[#0d111b]/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 font-mono text-[#1a1a1a]">
          <div className="bg-white border-[3px] border-black p-6 rounded-2xl w-full max-w-md shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center border-b-2 border-black pb-3 mb-4">
              <span className="font-black uppercase text-sm">Deposit Funds</span>
              <button onClick={() => setShowDepositModal(false)} className="bg-red-200 border border-black p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] uppercase font-black block mb-1">Deposit Amount (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 text-xs font-bold outline-none"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black block mb-1">Simulated Card Details</label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  className="w-full bg-white border-2 border-black p-2 text-xs font-bold outline-none"
                  disabled
                />
                <span className="text-[9px] text-gray-400 block mt-1">Stripe sandbox payment simulated automatically.</span>
              </div>

              <button
                type="submit"
                className="w-full bg-green-200 hover:bg-green-300 border-[3px] border-black py-2.5 text-xs font-black uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all"
              >
                Deposit Mock Cash
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. WITHDRAWAL MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-[#0d111b]/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 font-mono text-[#1a1a1a]">
          <div className="bg-white border-[3px] border-black p-6 rounded-2xl w-full max-w-md shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center border-b-2 border-black pb-3 mb-4">
              <span className="font-black uppercase text-sm">Withdraw Funds</span>
              <button onClick={() => setShowWithdrawModal(false)} className="bg-red-200 border border-black p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] uppercase font-black block mb-1">Withdrawal Amount (INR)</label>
                <input
                  type="number"
                  placeholder={`Max: ₹${walletBalance}`}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 text-xs font-bold outline-none"
                  min="1"
                  max={walletBalance}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black block mb-1">Recipient UPI ID or Bank Details</label>
                <input
                  type="text"
                  placeholder="e.g. user@paytm"
                  value={withdrawUpi}
                  onChange={(e) => setWithdrawUpi(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 text-xs font-bold outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-200 hover:bg-red-300 border-[3px] border-black py-2.5 text-xs font-black uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all"
              >
                Withdraw Mock Cash
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
