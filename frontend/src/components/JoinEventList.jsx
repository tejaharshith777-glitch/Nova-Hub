import React from 'react';

const dummyTournaments = [
  { id: '1', title: 'Weekend Cricket Bash', bg: 'bg-[#fef08a]', date: 'Oct 14', slots: '2/8 slots left' },
  { id: '2', title: 'Downtown Hoops', bg: 'bg-[#cffafe]', date: 'Oct 15', slots: '5/16 slots left' },
  { id: '3', title: 'Sunday League Football', bg: 'bg-[#fecdd3]', date: 'Oct 20', slots: '1/4 slots left' }
];

export const JoinEventList = ({ onSelectEvent }) => {
  return (
    <div className="w-full">
      <h2 className="text-5xl font-black font-display uppercase tracking-tight text-[#1a1a1a] mb-12">
        Active Local Arenas
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {dummyTournaments.map((t) => (
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
              onClick={() => onSelectEvent(t)}
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
export default JoinEventList;
