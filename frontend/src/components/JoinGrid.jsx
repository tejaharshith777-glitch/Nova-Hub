import React, { useState } from 'react';

const dummyEvents = [
  { id: '1', title: 'Weekend Cricket Bash', bg: 'bg-[#fef08a]', date: 'Oct 14', slots: '2/8 slots left' },
  { id: '2', title: 'Downtown Hoops', bg: 'bg-[#cffafe]', date: 'Oct 15', slots: '5/16 slots left' },
  { id: '3', title: 'Sunday League Football', bg: 'bg-[#fecdd3]', date: 'Oct 20', slots: '1/4 slots left' }
];

export const JoinGrid = ({ setCurrentPage }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  if (selectedEvent) {
    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col items-start relative z-10 font-mono">
        <button 
          onClick={() => setSelectedEvent(null)}
          className="mb-8 bg-white border-[3px] border-[#1a1a1a] px-4 py-2 font-bold uppercase text-xs shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:shadow-[1px_1px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all interactive-target"
        >
          &lt;- Back to Arenas
        </button>
        
        <div className="bg-[#baffc9] border-[3px] border-[#1a1a1a] p-10 md:p-14 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] w-full text-[#1a1a1a] relative">
          <h2 className="text-4xl md:text-5xl font-black font-display uppercase tracking-tight text-[#1a1a1a] mb-8 border-b-[3px] border-[#1a1a1a] pb-6">
            Submit Team Roster
          </h2>
          <p className="text-sm font-bold uppercase tracking-widest mb-10 opacity-70">
            Joining: {selectedEvent.title}
          </p>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase opacity-80">Player {num} Name</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full border-b-[3px] border-[#1a1a1a] bg-transparent outline-none py-1 font-mono text-sm font-bold focus:border-white transition-colors interactive-target placeholder-[#1a1a1a]/40"
                  />
                </div>
              ))}
            </div>
            
            <button
              type="button"
              className="w-full mt-10 bg-white hover:bg-yellow-100 border-[3px] border-[#1a1a1a] py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all interactive-target"
            >
              Confirm Roster & Get Pass
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-start relative z-10 font-mono">
      <button 
        onClick={() => setCurrentPage('buttonsPage')}
        className="mb-8 bg-white border-[3px] border-[#1a1a1a] px-4 py-2 font-bold uppercase text-xs shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:shadow-[1px_1px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all interactive-target"
      >
        &lt;- Go Back
      </button>

      <h2 className="text-5xl md:text-7xl font-black font-display uppercase tracking-tight text-[#1a1a1a] mb-12">
        Active Local Arenas
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {dummyEvents.map((t) => (
          <div
            key={t.id}
            className={`border-[3px] border-[#1a1a1a] p-8 rounded-2xl flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:-translate-y-1 transition-all duration-200 ${t.bg}`}
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="bg-white border-2 border-[#1a1a1a] px-2 py-1 text-[10px] font-bold uppercase shadow-[2px_2px_0px_rgba(26,26,26,1)] inline-block">
                  {t.date}
                </span>
                <span className="text-[10px] font-bold opacity-60">
                  {t.slots}
                </span>
              </div>
              <h3 className="text-3xl font-black font-display uppercase leading-[1.1] text-[#1a1a1a] mb-8">
                {t.title}
              </h3>
            </div>
            
            <button
              onClick={() => setSelectedEvent(t)}
              className="w-full bg-white border-[3px] border-[#1a1a1a] py-3 rounded-lg text-sm font-bold uppercase tracking-widest shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all interactive-target"
            >
              Select Event
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JoinGrid;
