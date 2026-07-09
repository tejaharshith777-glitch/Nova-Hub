import React from 'react';

export const TeamRosterForm = ({ tournament }) => {
  return (
    <div className="bg-[#baffc9] border-[3px] border-[#1a1a1a] p-10 md:p-16 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] max-w-2xl mx-auto font-mono text-[#1a1a1a] relative">
      <div className="absolute -top-4 -right-4 bg-white border-[3px] border-[#1a1a1a] px-4 py-2 font-bold uppercase shadow-[4px_4px_0px_rgba(26,26,26,1)] -rotate-6 text-xs">
        Roster #992
      </div>

      <h2 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tight text-[#1a1a1a] mb-8 border-b-[3px] border-[#1a1a1a] pb-6">
        Submit Team Roster.
      </h2>
      
      {tournament && (
        <p className="text-xs font-bold uppercase tracking-widest mb-10 opacity-70">
          Target Arena: {tournament.title}
        </p>
      )}

      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div key={num} className="flex flex-col gap-2">
              <label htmlFor={`player-${num}`} className="text-[10px] font-bold uppercase opacity-80">Player {num} Name</label>
              <input
                id={`player-${num}`}
                name={`player-${num}`}
                type="text"
                placeholder="Full Name"
                className="w-full border-b-[3px] border-[#1a1a1a] bg-transparent outline-none py-1 font-mono text-sm font-bold focus:border-white transition-colors interactive-target placeholder-[#1a1a1a]/40"
              />
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-4 pt-8 border-t-[3px] border-[#1a1a1a]">
          <label htmlFor="verify-age" className="flex items-center gap-4 cursor-pointer group">
            <input id="verify-age" name="verify-age" type="checkbox" className="w-5 h-5 accent-[#1a1a1a] border-[3px] border-[#1a1a1a]" />
            <span className="text-xs font-bold uppercase opacity-80 group-hover:opacity-100 transition-opacity">
              Verify all players are within age bounds
            </span>
          </label>
          <label htmlFor="accept-guidelines" className="flex items-center gap-4 cursor-pointer group">
            <input id="accept-guidelines" name="accept-guidelines" type="checkbox" className="w-5 h-5 accent-[#1a1a1a] border-[3px] border-[#1a1a1a]" />
            <span className="text-xs font-bold uppercase opacity-80 group-hover:opacity-100 transition-opacity">
              Accept physical ground guidelines
            </span>
          </label>
        </div>

        <button
          type="button"
          className="w-full mt-10 bg-white hover:bg-yellow-100 border-[3px] border-[#1a1a1a] py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all interactive-target"
        >
          Confirm Roster & Get Pass
        </button>
      </form>
    </div>
  );
};
export default TeamRosterForm;
