import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Ticket, Calendar, MapPin, Globe, CreditCard, Loader2, Copy, Share2 } from 'lucide-react';

export const TeamRosterForm = ({ tournament, apiBaseUrl, user, onSuccess }) => {
  const teamSize = tournament?.teamSize || 5;
  const isEsports = tournament?.venueType === 'online';

  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState(user?.username || '');
  const [captainEmail, setCaptainEmail] = useState(user?.email || '');
  const [roster, setRoster] = useState(
    Array.from({ length: teamSize }, () => ({ name: '', gameId: '' }))
  );
  const [rulesAccepted, setRulesAccepted] = useState(false);
  
  // Registration States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Payment Simulation States
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentFinished, setPaymentFinished] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleMemberChange = (index, field, value) => {
    const updated = [...roster];
    updated[index][field] = value;
    setRoster(updated);
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!teamName.trim() || !captainName.trim() || !captainEmail.trim()) {
      setErrorMsg('Please fill in team name, captain name, and email.');
      return;
    }

    const invalidMember = roster.some(m => !m.name.trim() || !m.gameId.trim());
    if (invalidMember) {
      setErrorMsg('Please fill in all player names and game handle IDs.');
      return;
    }

    if (!rulesAccepted) {
      setErrorMsg('You must accept the tournament rules and anti-cheat guidelines.');
      return;
    }

    // If entry fee exists, prompt simulated payment check-out
    if (tournament.entryFee > 0) {
      setShowCheckout(true);
    } else {
      submitRegistration();
    }
  };

  const simulatePayment = () => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentFinished(true);
      setTimeout(() => {
        setShowCheckout(false);
        submitRegistration();
      }, 1500);
    }, 2000);
  };

  const submitRegistration = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    const payload = {
      teamName,
      captainName,
      captainEmail,
      roster: roster.map(m => ({ name: m.name.trim(), gameId: m.gameId.trim() })),
      eligibilityDocUrl: 'mock-badge-url.png',
      rulesAccepted
    };

    if (!apiBaseUrl) {
      // Offline mode simulation fallback
      setTimeout(() => {
        const mockReg = {
          teamName,
          captainName,
          captainEmail,
          roster: roster.map(m => ({ name: m.name.trim(), gameId: m.gameId.trim() })),
          registrationToken: 'TOKEN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          rulesAccepted: true
        };

        // Save in localStorage so Dashboard and JoinEventPage can load and merge it
        const savedRegs = localStorage.getItem('novahub_mock_registrations');
        const currentRegs = savedRegs ? JSON.parse(savedRegs) : [];
        currentRegs.push({
          tournamentId: tournament._id || tournament.id,
          team: mockReg
        });
        localStorage.setItem('novahub_mock_registrations', JSON.stringify(currentRegs));

        // Create mock success data structure matching backend API response
        const mockSuccessData = {
          registrationToken: mockReg.registrationToken,
          venuePass: tournament.venueType === 'online' ? {
            type: 'online',
            region: tournament.venueDetails?.serverRegion || 'Asia South',
            code: tournament.venueDetails?.lobbyCode || 'LBY-MOCK-99'
          } : {
            type: 'offline',
            address: tournament.venueDetails?.physicalAddress || 'Ground Venue',
            room: tournament.venueDetails?.stadiumHall || 'Pitch A'
          },
          tournament: {
            ...tournament,
            registeredTeams: [...(tournament.registeredTeams || []), mockReg]
          }
        };

        setSuccessData(mockSuccessData);
        setIsSubmitting(false);
      }, 1000);
      return;
    }

    // Always persist registration locally so history/dashboard always show it
    const localRegToken = 'TOKEN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const mockReg = {
      teamName,
      captainName,
      captainEmail,
      roster: roster.map(m => ({ name: m.name.trim(), gameId: m.gameId.trim() })),
      registrationToken: localRegToken,
      rulesAccepted: true
    };
    const savedRegs = localStorage.getItem('novahub_mock_registrations');
    const currentRegs = savedRegs ? JSON.parse(savedRegs) : [];
    if (!currentRegs.some(r => r.tournamentId === (tournament._id || tournament.id) && r.team?.captainEmail === captainEmail)) {
      currentRegs.push({
        tournamentId: tournament._id || tournament.id,
        team: mockReg
      });
      localStorage.setItem('novahub_mock_registrations', JSON.stringify(currentRegs));
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/tournaments/${tournament._id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok) {
        // Update stored token with server's token if provided
        const updatedRegs = JSON.parse(localStorage.getItem('novahub_mock_registrations') || '[]');
        const myReg = updatedRegs.find(r => r.tournamentId === (tournament._id || tournament.id) && r.team?.captainEmail === captainEmail);
        if (myReg && data.registrationToken) {
          myReg.team.registrationToken = data.registrationToken;
          localStorage.setItem('novahub_mock_registrations', JSON.stringify(updatedRegs));
        }
        setSuccessData(data);
      } else {
        // API failed but local reg already saved — show offline success
        const offlineSuccess = {
          registrationToken: localRegToken,
          venuePass: tournament.venueType === 'online' ? {
            type: 'online',
            region: tournament.venueDetails?.serverRegion || 'Asia South',
            code: tournament.venueDetails?.lobbyCode || 'LBY-MOCK-99'
          } : {
            type: 'offline',
            address: tournament.venueDetails?.physicalAddress || 'Ground Venue',
            room: tournament.venueDetails?.stadiumHall || 'Pitch A'
          },
          tournament: { ...tournament, registeredTeams: [...(tournament.registeredTeams || []), mockReg] }
        };
        setSuccessData(offlineSuccess);
      }
    } catch (err) {
      console.error(err);
      // Network error but local reg already saved — show offline success
      const offlineSuccess = {
        registrationToken: localRegToken,
        venuePass: tournament.venueType === 'online' ? {
          type: 'online',
          region: tournament.venueDetails?.serverRegion || 'Asia South',
          code: tournament.venueDetails?.lobbyCode || 'LBY-MOCK-99'
        } : {
          type: 'offline',
          address: tournament.venueDetails?.physicalAddress || 'Ground Venue',
          room: tournament.venueDetails?.stadiumHall || 'Pitch A'
        },
        tournament: { ...tournament, registeredTeams: [...(tournament.registeredTeams || []), mockReg] }
      };
      setSuccessData(offlineSuccess);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = (token) => {
    const inviteUrl = `${window.location.origin}/tournament/${tournament._id}?invite=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (showCheckout) {
    return (
      <div className="bg-[#fce4fb] border-[3px] border-[#1a1a1a] p-10 md:p-14 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] max-w-md mx-auto font-mono text-[#1a1a1a] relative z-20 text-center space-y-6">
        <div className="bg-[#5f259f] border-2 border-black w-max mx-auto px-4 py-2 rotate-3 shadow-[2.5px_2.5px_0px_rgba(26,26,26,1)] text-white font-black text-sm uppercase flex items-center gap-1.5">
          <span>PhonePe</span>
          <span className="bg-yellow-300 text-black px-1.5 py-0.2 text-[8px] rounded font-sans">DEMO</span>
        </div>
        
        <h2 className="text-3xl font-black font-display uppercase border-b-[3px] border-black pb-4">
          Scan & Pay Entry Fee
        </h2>

        <div className="bg-white border-[3px] border-black p-4 rounded-xl shadow-[4px_4px_0px_rgba(26,26,26,1)] text-left">
          <span className="text-[10px] font-black uppercase opacity-60 block">Event Entry Stake</span>
          <p className="font-bold text-base truncate">{tournament.title}</p>
          <div className="flex justify-between items-baseline mt-4 border-t border-black/10 pt-2 font-black">
            <span>TOTAL FEE:</span>
            <span className="text-xl text-purple-700">₹{tournament.entryFee}</span>
          </div>
        </div>

        {paymentProcessing ? (
          <div className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-purple-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800">Verifying PhonePe Transaction...</span>
          </div>
        ) : paymentFinished ? (
          <div className="py-12 flex flex-col items-center gap-4 text-green-600">
            <CheckCircle className="w-10 h-10" />
            <span className="text-xs font-bold uppercase tracking-wider">Payment Verified! Booking slot...</span>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Interactive Mock QR Code */}
            <div 
              onClick={simulatePayment}
              className="relative w-44 h-44 mx-auto !bg-white border-[3px] border-black p-3 shadow-[4px_4px_0px_rgba(26,26,26,1)] overflow-hidden flex items-center justify-center group cursor-pointer"
              title="Click QR Code to Pay"
            >
              {/* Moving scanner laser line */}
              <div className="absolute left-0 right-0 h-1 bg-purple-600 shadow-[0_0_8px_#8b5cf6] animate-[scan_2s_ease-in-out_infinite] z-10" />
              
              {/* Mock QR SVG */}
              <svg className="w-full h-full text-black opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 100" fill="currentColor">
                <path d="M0,0 h30 v30 h-30 z M5,5 v20 h20 v-20 z M10,10 h10 v10 h-10 z" />
                <path d="M70,0 h30 v30 h-30 z M75,5 v20 h20 v-20 z M80,10 h10 v10 h-10 z" />
                <path d="M0,70 h30 v30 h-30 z M5,75 v20 h20 v-20 z M10,80 h10 v10 h-10 z" />
                <path d="M80,80 h10 v10 h-10 z" />
                <rect x="40" y="5" width="5" height="15" />
                <rect x="50" y="10" width="10" height="5" />
                <rect x="45" y="25" width="15" height="5" />
                <rect x="5" y="40" width="15" height="5" />
                <rect x="25" y="45" width="5" height="15" />
                <rect x="40" y="40" width="20" height="20" />
                <rect x="75" y="40" width="10" height="5" />
                <rect x="85" y="50" width="10" height="10" />
                <rect x="5" y="60" width="5" height="5" />
                <rect x="45" y="70" width="15" height="5" />
                <rect x="55" y="80" width="5" height="15" />
                <rect x="70" y="75" width="5" height="10" />
                <rect x="85" y="75" width="5" height="5" />
              </svg>
            </div>

            <p className="text-[10px] uppercase font-bold text-gray-500 max-w-xs mx-auto">
              Scan QR code above with any UPI app or click it directly to trigger a demo payment simulator.
            </p>

            <div className="space-y-3 pt-2">
              <button
                onClick={simulatePayment}
                className="w-full bg-[#baffc9] hover:bg-[#a6e6b5] border-[3px] border-black py-3.5 rounded-xl font-black uppercase tracking-wider text-xs shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(26,26,26,1)] transition-all interactive-target"
              >
                Verify & Pay (Demo)
              </button>
              <button
                onClick={() => setShowCheckout(false)}
                className="w-full bg-white hover:bg-gray-100 border-[3px] border-black py-3 rounded-xl font-black uppercase tracking-wider text-xs shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(26,26,26,1)] transition-all interactive-target"
              >
                Cancel Registration
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (successData) {
    const inviteToken = successData.registrationToken;
    const registeredTeamsList = successData.tournament?.registeredTeams || [];
    // Estimate Seed based on when they joined
    const seedRank = registeredTeamsList.length || 1;

    return (
      <div className="w-full max-w-2xl mx-auto py-8 space-y-8 font-mono text-[#1a1a1a]">
        
        {/* RETRO TICKET PASS CARD */}
        <div className="bg-[#baffc9] border-[3px] border-[#1a1a1a] rounded-[2rem] shadow-[8px_8px_0px_rgba(26,26,26,1)] overflow-hidden relative">
          
          {/* Jagged border ticket layout */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-8 bg-[#c4e4e3] border-r-[3px] border-y-[3px] border-black rounded-r-full" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-4 h-8 bg-[#c4e4e3] border-l-[3px] border-y-[3px] border-black rounded-l-full" />

          {/* Ticket Header */}
          <div className="border-b-[3px] border-dashed border-[#1a1a1a] p-8 md:p-12 text-center space-y-4">
            <div className="bg-white border-2 border-black w-max mx-auto p-2 rotate-3 shadow-[2.5px_2.5px_0px_rgba(26,26,26,1)]">
              <Ticket className="w-8 h-8 text-[#1a1a1a]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase bg-white border-2 border-black px-2 py-0.5 shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)]">
                Entry Pass Matrix
              </span>
              <h2 className="text-3xl md:text-4xl font-black font-display uppercase tracking-tight mt-3 text-center">
                ROSTER REGISTERED!
              </h2>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-8 md:p-12 space-y-6">
            <div className="flex justify-between items-center text-xs font-bold uppercase border-b-2 border-black/10 pb-2">
              <span>Tournament:</span>
              <span className="font-black text-[#1a1a1a]">{tournament.title}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs font-bold uppercase border-b-2 border-black/10 pb-2">
              <span>Team Name:</span>
              <span className="font-black text-[#1a1a1a]">{teamName}</span>
            </div>

            <div className="flex justify-between items-center text-xs font-bold uppercase border-b-2 border-black/10 pb-2">
              <span>Assigned Seed:</span>
              <span className="font-black text-red-500">Seed Rank #{seedRank}</span>
            </div>

            {/* Unique Invite Link Section */}
            <div className="bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_rgba(26,26,26,1)] space-y-2">
              <span className="text-[10px] font-black uppercase opacity-60 block">Share / Invite Squad Members</span>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/tournament/${tournament._id}?invite=${inviteToken}`}
                  className="w-full bg-gray-50 dark:!bg-slate-900 border border-black/15 dark:border-white/10 py-1.5 px-2.5 text-xs outline-none font-semibold truncate select-text text-slate-800 dark:!text-slate-200"
                />
                <button
                  onClick={() => handleCopyLink(inviteToken)}
                  className="bg-yellow-200 border-2 border-black p-2 font-bold uppercase shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-1 text-[10px]"
                >
                  {copiedLink ? 'Copied!' : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="bg-white border-[3px] border-[#1a1a1a] p-4 text-center shadow-[4px_4px_0px_rgba(26,26,26,1)]">
              <span className="text-[10px] uppercase font-black opacity-60 block">Roster Verification Token</span>
              <span className="text-md md:text-lg font-black tracking-wider text-[#1a1a1a] font-display select-text block mt-1">
                {inviteToken}
              </span>
            </div>

            {/* Venue & Lobby credentials */}
            <div className="bg-yellow-100 border-[3px] border-[#1a1a1a] p-6 shadow-[4px_4px_0px_rgba(26,26,26,1)] rounded-xl space-y-2">
              <span className="text-[10px] font-black uppercase text-yellow-700 dark:text-yellow-400 block">Match Gateway Pass</span>
              {successData.venuePass?.type === 'online' ? (
                <div className="text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5"><Globe className="w-4 h-4 text-blue-500" /> Server Region: <span className="font-black text-[#1a1a1a]">{successData.venuePass.region}</span></p>
                  <p className="font-bold">Lobby Code: <span className="font-black text-red-500 select-text">{successData.venuePass.code}</span></p>
                </div>
              ) : (
                <div className="text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5"><MapPin className="w-4 h-4 text-red-500" /> Physical Venue: <span className="font-black text-[#1a1a1a]">{successData.venuePass.address}</span></p>
                  <p className="font-bold">Stadium Gate / Hall: <span className="font-black text-[#1a1a1a]">{successData.venuePass.room}</span></p>
                </div>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={onSuccess}
          className="w-full bg-[#fcebb6] hover:bg-yellow-200 border-[3px] border-[#1a1a1a] py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-[6px_6px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_rgba(26,26,26,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all interactive-target"
        >
          Confirm & Back to Radar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#baffc9] border-[3px] border-[#1a1a1a] p-10 md:p-14 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] max-w-2xl mx-auto font-mono text-[#1a1a1a] relative">
      <div className="absolute -top-4 -right-4 bg-white border-[3px] border-[#1a1a1a] px-4 py-2 font-bold uppercase shadow-[4px_4px_0px_rgba(26,26,26,1)] -rotate-6 text-xs">
        Roster Slots: {teamSize}
      </div>

      <h2 className="text-4xl md:text-5xl font-black font-display uppercase tracking-tight text-[#1a1a1a] mb-8 border-b-[3px] border-[#1a1a1a] pb-6">
        Submit Team Roster.
      </h2>
      
      {tournament && (
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest mb-10 opacity-70">
          <span>Target Arena: {tournament.title}</span>
          {tournament.entryFee > 0 && <span className="bg-yellow-200 border border-black py-0.5 px-2">FEE: ₹{tournament.entryFee}</span>}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-200 border-[3px] border-red-600 p-4 rounded-xl text-red-600 font-bold uppercase text-xs mb-8 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>ERROR: {errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleRegisterClick} className="space-y-8">
        
        {/* SQUAD METADATA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b-[2px] border-black/10 dark:border-white/10 pb-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="teamName" className="text-[10px] font-bold uppercase opacity-80">Clan Team Name *</label>
            <input
              id="teamName"
              name="teamName"
              type="text"
              required
              placeholder="e.g. Bangalore Strikers"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full border-b-[3px] border-black dark:border-white/30 bg-transparent outline-none py-1.5 font-mono text-sm font-bold !text-[#1a1a1a] dark:!text-[#f3f4f6] placeholder-black/40 dark:placeholder-white/40"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="captainName" className="text-[10px] font-bold uppercase opacity-80">Captain Name *</label>
            <input
              id="captainName"
              name="captainName"
              type="text"
              required
              placeholder="e.g. Dev R."
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              className="w-full border-b-[3px] border-black dark:border-white/30 bg-transparent outline-none py-1.5 font-mono text-sm font-bold !text-[#1a1a1a] dark:!text-[#f3f4f6] placeholder-black/40 dark:placeholder-white/40"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="captainEmail" className="text-[10px] font-bold uppercase opacity-80">Captain Email *</label>
            <input
              id="captainEmail"
              name="captainEmail"
              type="email"
              required
              placeholder="e.g. cap@novahub.com"
              value={captainEmail}
              onChange={(e) => setCaptainEmail(e.target.value)}
              className="w-full border-b-[3px] border-black dark:border-white/30 bg-transparent outline-none py-1.5 font-mono text-sm font-bold !text-[#1a1a1a] dark:!text-[#f3f4f6] placeholder-black/40 dark:placeholder-white/40"
            />
          </div>
        </div>

        {/* PLAYER SLOTS */}
        <div>
          <span className="text-[10px] font-bold uppercase text-black/60 dark:text-white/60 block mb-4">Player Roster Slots ({teamSize} required)</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roster.map((member, idx) => (
              <div key={idx} className="bg-white/40 dark:bg-black/30 border-2 border-black dark:border-white/20 p-4 rounded-xl flex flex-col gap-2 relative">
                <span className="absolute -top-3 -left-2.5 bg-white dark:bg-slate-900 border border-black dark:border-white/20 text-[9px] font-black uppercase px-2 shadow-[1px_1px_0px_rgba(26,26,26,1)] dark:shadow-[1px_1px_0px_rgba(255,255,255,0.1)]">
                  Slot #{idx + 1}
                </span>
                
                <div className="flex flex-col gap-1 mt-1.5">
                  <label htmlFor={`member-name-${idx}`} className="text-[9px] font-black uppercase text-[#1a1a1a]/60 dark:text-white/60">Player Name</label>
                  <input
                    id={`member-name-${idx}`}
                    name={`memberName-${idx}`}
                    type="text"
                    required
                    placeholder="Full Name"
                    value={member.name}
                    onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                    className="bg-transparent border-b border-black dark:border-white/30 outline-none font-mono text-xs font-bold !text-[#1a1a1a] dark:!text-[#f3f4f6] placeholder-black/40 dark:placeholder-white/40"
                  />
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  <label htmlFor={`member-gameId-${idx}`} className="text-[9px] font-black uppercase text-[#1a1a1a]/60 dark:text-white/60">
                    {isEsports ? 'Game ID / Handle' : 'Player Card ID / Roll'}
                  </label>
                  <input
                    id={`member-gameId-${idx}`}
                    name={`memberGameId-${idx}`}
                    type="text"
                    required
                    placeholder="e.g. Gamer#1337"
                    value={member.gameId}
                    onChange={(e) => handleMemberChange(idx, 'gameId', e.target.value)}
                    className="bg-transparent border-b border-black dark:border-white/30 outline-none font-mono text-xs font-bold !text-[#1a1a1a] dark:!text-[#f3f4f6] placeholder-black/40 dark:placeholder-white/40"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GUIDELINES VERIFICATION */}
        <div className="mt-8 space-y-4 pt-6 border-t-[3px] border-black/10">
          <label htmlFor="guidelines-checkbox" className="flex items-center gap-4 cursor-pointer group">
            <input 
              id="guidelines-checkbox"
              name="rulesAccepted"
              type="checkbox" 
              checked={rulesAccepted}
              onChange={(e) => setRulesAccepted(e.target.checked)}
              className="w-5 h-5 accent-[#1a1a1a] border-[3px] border-[#1a1a1a]" 
            />
            <span className="text-xs font-bold uppercase opacity-80 group-hover:opacity-100 transition-opacity">
              Accept tournament guidelines & anti-cheat policies
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-10 bg-white hover:bg-yellow-100 border-[3px] border-[#1a1a1a] py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all interactive-target disabled:opacity-50"
        >
          {isSubmitting ? 'Registering Squad...' : 'Confirm Roster & Proceed to Entry Fee'}
        </button>
      </form>
    </div>
  );
};

export default TeamRosterForm;
