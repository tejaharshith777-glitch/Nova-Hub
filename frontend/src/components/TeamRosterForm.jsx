import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Ticket, Calendar, MapPin, Globe } from 'lucide-react';

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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleMemberChange = (index, field, value) => {
    const updated = [...roster];
    updated[index][field] = value;
    setRoster(updated);
  };

  const handleSubmit = async (e) => {
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

    setIsSubmitting(true);

    const payload = {
      teamName,
      captainName,
      captainEmail,
      roster: roster.map(m => ({ name: m.name.trim(), gameId: m.gameId.trim() })),
      eligibilityDocUrl: 'mock-badge-url.png',
      rulesAccepted
    };

    try {
      const res = await fetch(`${apiBaseUrl}/api/tournaments/${tournament._id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessData(data);
      } else {
        setErrorMsg(data.message || 'Server rejected team roster parameters.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network connectivity error. Could not join tournament.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
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

            <div className="bg-white border-[3px] border-[#1a1a1a] p-4 text-center shadow-[4px_4px_0px_rgba(26,26,26,1)]">
              <span className="text-[10px] uppercase font-black opacity-60 block">Roster Verification Token</span>
              <span className="text-md md:text-lg font-black tracking-wider text-red-500 font-display select-text block mt-1">
                {successData.registrationToken}
              </span>
            </div>

            {/* Venue & Lobby credentials */}
            <div className="bg-yellow-100 border-[3px] border-[#1a1a1a] p-6 shadow-[4px_4px_0px_rgba(26,26,26,1)] rounded-xl space-y-2">
              <span className="text-[10px] font-black uppercase text-yellow-700 block">Match Gateway Pass</span>
              {successData.venuePass?.type === 'online' ? (
                <div className="text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5"><Globe className="w-4 h-4 text-blue-500" /> Server Region: <span className="font-black text-black">{successData.venuePass.region}</span></p>
                  <p className="font-bold">Lobby Code: <span className="font-black text-red-500 select-text">{successData.venuePass.code}</span></p>
                </div>
              ) : (
                <div className="text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5"><MapPin className="w-4 h-4 text-red-500" /> Physical Venue: <span className="font-black text-black">{successData.venuePass.address}</span></p>
                  <p className="font-bold">Stadium Gate / Hall: <span className="font-black text-black">{successData.venuePass.room}</span></p>
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
        <p className="text-xs font-bold uppercase tracking-widest mb-10 opacity-70">
          Target Arena: {tournament.title}
        </p>
      )}

      {errorMsg && (
        <div className="bg-red-200 border-[3px] border-red-600 p-4 rounded-xl text-red-600 font-bold uppercase text-xs mb-8 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>ERROR: {errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SQUAD METADATA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b-[2px] border-black/10 pb-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="teamName" className="text-[10px] font-bold uppercase opacity-80">Clan Team Name *</label>
            <input
              id="teamName"
              type="text"
              required
              placeholder="e.g. Bangalore Strikers"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full border-b-[3px] border-black bg-transparent outline-none py-1.5 font-mono text-sm font-bold placeholder-[#1a1a1a]/40"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="captainName" className="text-[10px] font-bold uppercase opacity-80">Captain Name *</label>
            <input
              id="captainName"
              type="text"
              required
              placeholder="e.g. Dev R."
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              className="w-full border-b-[3px] border-black bg-transparent outline-none py-1.5 font-mono text-sm font-bold placeholder-[#1a1a1a]/40"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="captainEmail" className="text-[10px] font-bold uppercase opacity-80">Captain Email *</label>
            <input
              id="captainEmail"
              type="email"
              required
              placeholder="e.g. cap@novahub.com"
              value={captainEmail}
              onChange={(e) => setCaptainEmail(e.target.value)}
              className="w-full border-b-[3px] border-black bg-transparent outline-none py-1.5 font-mono text-sm font-bold placeholder-[#1a1a1a]/40"
            />
          </div>
        </div>

        {/* PLAYER SLOTS */}
        <div>
          <span className="text-[10px] font-bold uppercase text-black/60 block mb-4">Player Roster Slots ({teamSize} required)</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roster.map((member, idx) => (
              <div key={idx} className="bg-white/40 border-2 border-black p-4 rounded-xl flex flex-col gap-2 relative">
                <span className="absolute -top-3 -left-2.5 bg-white border border-black text-[9px] font-black uppercase px-2 shadow-[1px_1px_0px_rgba(26,26,26,1)]">
                  Slot #{idx + 1}
                </span>
                
                <div className="flex flex-col gap-1 mt-1.5">
                  <label className="text-[9px] font-black uppercase opacity-60">Player Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={member.name}
                    onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                    className="bg-transparent border-b border-black outline-none font-mono text-xs font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  <label className="text-[9px] font-black uppercase opacity-60">
                    {isEsports ? 'Game ID / Handle' : 'Player Card ID / Roll'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gamer#1337"
                    value={member.gameId}
                    onChange={(e) => handleMemberChange(idx, 'gameId', e.target.value)}
                    className="bg-transparent border-b border-black outline-none font-mono text-xs font-bold"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GUIDELINES VERIFICATION */}
        <div className="mt-8 space-y-4 pt-6 border-t-[3px] border-black/10">
          <label className="flex items-center gap-4 cursor-pointer group">
            <input 
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
          {isSubmitting ? 'Registering Squad...' : 'Confirm Roster & Get Pass Ticket'}
        </button>
      </form>
    </div>
  );
};

export default TeamRosterForm;
