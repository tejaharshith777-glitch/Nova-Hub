import React from 'react';
import { Users, Award, MapPin, Globe } from 'lucide-react';

const pastelBgClasses = ['bg-white', 'bg-[#baffc9]', 'bg-[#ffdfba]', 'bg-[#cffafe]', 'bg-[#ffb3ba]', 'bg-[#fcebb6]'];

export const TournamentList = ({ tournaments = [], onSelectEvent, user }) => {
  if (tournaments.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-6 font-mono text-[#1a1a1a]">
      {tournaments.map((t, idx) => {
        const registeredCount = t.registeredTeams?.length || 0;
        const isFull = registeredCount >= t.maxTeams;
        const regsSaved = localStorage.getItem('novahub_mock_registrations');
        const mockRegs = regsSaved ? JSON.parse(regsSaved) : [];
        const isJoined = mockRegs.some(r => r.tournamentId === (t._id || t.id)) || 
                         t.registeredTeams?.some(team => 
                           (user?.email && team.captainEmail === user.email) || 
                           (user?.username && team.captainName?.toLowerCase() === user.username.toLowerCase())
                         );
        const cardBgClass = pastelBgClasses[idx % pastelBgClasses.length];

        return (
          <div 
            key={t._id || t.id || idx}
            className={`w-full flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 md:p-8 rounded-2xl border-[3px] border-[#1a1a1a] shadow-[6px_6px_0px_rgba(26,26,26,1)] hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-200 gap-6 ${cardBgClass}`}
          >
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="bg-[#1a1a1a] text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-wider">
                  {t.gameName}
                </span>
                <span className="bg-white border-2 border-[#1a1a1a] text-[10px] font-bold px-2 py-0.5 shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)]">
                  {t.format}
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-black font-display uppercase tracking-tight text-[#1a1a1a]">
                {t.title}
              </h3>
              
              <div className="flex flex-wrap gap-4 items-center font-bold text-xs uppercase opacity-85 mt-1">
                {t.venueType === 'offline' ? (
                  <span className="flex items-center gap-1 bg-white border-2 border-black px-2 py-0.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>
                      {t.venueDetails?.physicalAddress}
                      {t.distance !== undefined && t.distance !== null ? ` (${t.distance.toFixed(1)} km away)` : ''}
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2 bg-white border-2 border-black px-2 py-0.5 flex-wrap">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span>Online · {t.venueDetails?.serverRegion} Region</span>
                    {t.venueDetails?.platform && (
                      <span className="bg-[#1a1a1a] text-white px-1.5 py-0.2 text-[9px] font-black uppercase rounded-sm">
                        {t.venueDetails.platform}
                      </span>
                    )}
                  </span>
                )}

                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{registeredCount} / {t.maxTeams} Slots Filled</span>
                </span>
              </div>

              {t.rules && (
                <p className="text-xs text-[#1a1a1a]/70 italic font-semibold line-clamp-1 mt-1">
                  "Rules: {t.rules}"
                </p>
              )}
            </div>
            
            <div className="w-full lg:w-auto flex flex-col xs:flex-row items-stretch lg:items-end justify-between border-t-2 border-[#1a1a1a]/10 lg:border-t-0 pt-4 lg:pt-0 gap-6">
              <div className="flex lg:flex-col justify-between gap-4 font-bold text-sm text-right">
                <div>
                  <span className="text-[10px] uppercase font-bold opacity-60 block">Entry Fee</span>
                  <span>₹{t.entryFee}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold opacity-60 block">Prize Pool</span>
                  <span className="text-yellow-600">₹{t.prizePool}</span>
                </div>
              </div>

              {isJoined ? (
                <button
                  disabled
                  className="bg-white/40 border-[3px] border-[#1a1a1a] px-8 py-3.5 rounded-xl font-black uppercase text-xs shadow-[2px_2px_0px_rgba(26,26,26,1)] cursor-not-allowed text-[#1a1a1a]/70 whitespace-nowrap"
                >
                  ✓ Registered
                </button>
              ) : isFull ? (
                <button
                  disabled
                  className="bg-[#1a1a1a]/10 border-[3px] border-[#1a1a1a]/30 text-[#1a1a1a]/40 px-8 py-3.5 rounded-xl font-black uppercase text-xs cursor-not-allowed whitespace-nowrap"
                >
                  Slots Full
                </button>
              ) : (
                <button
                  onClick={() => onSelectEvent(t)}
                  className="bg-white hover:bg-yellow-200 border-[3px] border-[#1a1a1a] px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:shadow-[1px_1px_0px_rgba(26,26,26,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all interactive-target whitespace-nowrap"
                >
                  Register Team
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TournamentList;
