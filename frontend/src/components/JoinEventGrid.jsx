import React, { useState } from 'react';
import { Compass, Users, Trophy, DollarSign, Award, Grid, MapPin } from 'lucide-react';

const pastelBgs = ['#ffb3ba', '#ffdfba', '#ffffba', '#cffafe', '#e8f0fe', '#dcfce7'];

export const JoinEventGrid = ({ tournaments = [], user, onOpenRegistration }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('All');

  const filtered = tournaments.filter(t => {
    // Filter physical sports and racing categories
    if (t.category !== 'sports' && t.category !== 'racing') return false;

    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.gameName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = sportFilter === 'All' || t.gameName === sportFilter;
    return matchesSearch && matchesSport;
  });

  return (
    <div className="space-y-8 font-mono text-[#1a1a1a]">
      {/* Search Filter Header */}
      <div className="bg-white border-[3px] border-[#1a1a1a] p-4 rounded-xl shadow-[4px_4px_0px_rgba(26,26,26,1)] grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search leagues or ground venues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-b-[3px] border-[#1a1a1a] py-1.5 px-3 text-xs outline-none focus:border-yellow-400 font-bold md:col-span-2 interactive-target"
        />
        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          className="w-full bg-transparent border-b-[3px] border-[#1a1a1a] py-1.5 px-3 text-xs outline-none font-bold interactive-target"
        >
          <option value="All">All Sports</option>
          <option value="Cricket">Cricket</option>
          <option value="Football">Football</option>
          <option value="Basketball">Basketball</option>
          <option value="Tennis">Tennis</option>
        </select>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((t, idx) => {
          const registeredCount = t.registeredTeams?.length || 0;
          const isFull = registeredCount >= t.maxTeams;
          const userJoined = t.registeredTeams?.some(team => team.captainEmail === user?.email);
          const cardBg = pastelBgs[idx % pastelBgs.length];

          // Alternate slightly rotated visual layouts for editorial quirky feel
          const rotation = idx % 3 === 0 ? 'rotate-1' : idx % 3 === 1 ? '-rotate-1' : 'rotate-0';

          return (
            <div
              key={t._id}
              className={`border-[3px] border-[#1a1a1a] p-6 rounded-2xl flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all duration-150 relative overflow-hidden group ${rotation}`}
              style={{ backgroundColor: cardBg }}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-white border-2 border-[#1a1a1a] px-2 py-0.5 shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)] font-mono">
                    {t.gameName}
                  </span>
                  <div className="text-[10px] font-bold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{registeredCount}/{t.maxTeams} Teams</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold font-display uppercase tracking-tight text-[#1a1a1a] leading-tight mb-2 truncate">
                  {t.title}
                </h3>
                
                <p className="text-[10px] font-semibold text-[#1a1a1a]/80 mb-1 flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#1a1a1a]" /> {t.venueDetails?.physicalAddress || 'Ground Venue'}
                </p>
                {t.rules && (
                  <p className="text-[10px] text-[#1a1a1a]/70 italic mt-3 font-semibold line-clamp-2">
                    "Rules: {t.rules}"
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t-[3px] border-[#1a1a1a]/10">
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-bold">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#1a1a1a]/60 block font-mono">Entry fee</span>
                    <span>₹{t.entryFee}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-[#1a1a1a]/60 block font-mono">Prize Pool</span>
                    <span className="text-yellow-600">₹{t.prizePool}</span>
                  </div>
                </div>

                {userJoined ? (
                  <button
                    disabled
                    className="w-full bg-white/20 border-[3px] border-[#1a1a1a] py-2.5 rounded-lg text-xs font-bold uppercase cursor-not-allowed flex items-center justify-center gap-1 shadow-[2px_2px_0px_rgba(26,26,26,1)]"
                  >
                    ✓ Enrolled
                  </button>
                ) : isFull ? (
                  <button
                    disabled
                    className="w-full bg-[#1a1a1a]/5 border-[3px] border-[#1a1a1a]/30 py-2.5 rounded-lg text-xs font-bold uppercase text-[#1a1a1a]/40"
                  >
                    Roster Slots Full
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenRegistration(t)}
                    className="w-full bg-white hover:bg-yellow-200 border-[3px] border-[#1a1a1a] py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:shadow-[1px_1px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all interactive-target"
                  >
                    Register Team
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white border-[3px] border-[#1a1a1a] p-12 rounded-2xl text-center shadow-[4px_4px_0px_rgba(26,26,26,1)]">
          <Compass className="w-12 h-12 mx-auto text-[#1a1a1a]/40 mb-4 stroke-[1.5]" />
          <p className="text-xs text-gaming-muted uppercase font-bold">
            No active sports tournaments are currently listed.
          </p>
        </div>
      )}
    </div>
  );
};
export default JoinEventGrid;
