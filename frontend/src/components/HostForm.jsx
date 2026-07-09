import React, { useState } from 'react';

export const HostForm = ({ setCurrentPage }) => {
  const [form, setForm] = useState({
    eventName: '', sport: 'Cricket', format: 'Single Elimination (Knockout)',
    venue: '', startDate: '', endDate: '', slots: '', entryFee: '', prizePool: '',
    contact: '', rules: ''
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.eventName.trim()) newErrors.eventName = 'Event name is required';
    if (!form.venue.trim()) newErrors.venue = 'Venue is required';
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.slots) newErrors.slots = 'Number of slots is required';
    if (!form.contact.trim()) newErrors.contact = 'Contact number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm({ eventName: '', sport: 'Cricket', format: 'Single Elimination (Knockout)', venue: '', startDate: '', endDate: '', slots: '', entryFee: '', prizePool: '', contact: '', rules: '' });
  };

  if (submitted) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center relative z-10 py-16 text-center">
        <div className="text-8xl mb-6 animate-bounce">🎉</div>
        <h2 className="text-5xl font-black font-display uppercase mb-4 text-[#1a1a1a]">Tournament Launched!</h2>
        <p className="font-mono text-lg text-[#1a1a1a]/70 mb-2">Your event <strong>"{form.eventName}"</strong> has been submitted.</p>
        <p className="font-mono text-sm text-[#1a1a1a]/50 mb-10">Our team will verify and activate your tournament within 24 hours.</p>
        <div className="bg-[#baffc9] border-[3px] border-[#1a1a1a] rounded-2xl p-8 w-full max-w-md shadow-[6px_6px_0px_rgba(26,26,26,1)] text-left space-y-3 font-mono text-sm mb-10">
          <div className="flex justify-between"><span className="font-bold uppercase opacity-60">Sport</span><span className="font-bold">{form.sport}</span></div>
          <div className="flex justify-between"><span className="font-bold uppercase opacity-60">Format</span><span className="font-bold">{form.format}</span></div>
          <div className="flex justify-between"><span className="font-bold uppercase opacity-60">Venue</span><span className="font-bold">{form.venue}</span></div>
          <div className="flex justify-between"><span className="font-bold uppercase opacity-60">Start Date</span><span className="font-bold">{form.startDate}</span></div>
          <div className="flex justify-between"><span className="font-bold uppercase opacity-60">Slots</span><span className="font-bold">{form.slots} Teams</span></div>
          {form.prizePool && <div className="flex justify-between"><span className="font-bold uppercase opacity-60">Prize Pool</span><span className="font-bold">₹{form.prizePool}</span></div>}
        </div>
        <div className="flex gap-4 flex-wrap justify-center">
          <button onClick={resetForm} className="bg-white border-[3px] border-[#1a1a1a] px-6 py-3 font-bold uppercase shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:shadow-[1px_1px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all interactive-target">
            Host Another
          </button>
          <button onClick={() => setCurrentPage('buttonsPage')} className="bg-[#fcebb6] border-[3px] border-[#1a1a1a] px-6 py-3 font-bold uppercase shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:shadow-[1px_1px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all interactive-target">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-start relative z-10">
      <button
        onClick={() => setCurrentPage('buttonsPage')}
        className="mb-8 bg-white border-[3px] border-[#1a1a1a] px-4 py-2 font-bold uppercase text-xs shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:shadow-[1px_1px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all interactive-target"
      >
        &lt;- Go Back
      </button>

      <div className="bg-[#fcebb6] border-[3px] border-[#1a1a1a] p-10 md:p-16 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] w-full font-mono text-[#1a1a1a] relative">
        <h2 className="text-5xl md:text-7xl font-black font-display uppercase tracking-tight text-[#1a1a1a] mb-12 border-b-[3px] border-[#1a1a1a] pb-6">
          Set Up Local Match.
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-12">
          {/* SECTION 1: Basic Info */}
          <div className="space-y-8">
            <h3 className="text-2xl font-black uppercase border-b-2 border-[#1a1a1a] pb-2 inline-block">1. Core Details</h3>

            <div className="flex flex-col md:flex-row md:items-baseline gap-4">
              <label htmlFor="eventName" className="text-sm font-bold uppercase w-1/3">Event Name *</label>
              <div className="w-full md:w-2/3">
                <input name="eventName" id="eventName" value={form.eventName} onChange={handleChange}
                  type="text" placeholder="e.g., Summer Cricket Clash"
                  className={`w-full border-b-[3px] bg-transparent outline-none py-2 font-mono text-lg font-bold focus:border-white transition-colors interactive-target placeholder-[#1a1a1a]/40 ${errors.eventName ? 'border-red-500' : 'border-black'}`}
                />
                {errors.eventName && <p className="text-red-600 text-xs mt-1 font-bold">{errors.eventName}</p>}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-baseline gap-4">
              <label htmlFor="sport" className="text-sm font-bold uppercase w-1/3">Sport Category</label>
              <select name="sport" id="sport" value={form.sport} onChange={handleChange} className="w-full md:w-2/3 border-b-[3px] border-black bg-transparent outline-none py-2 font-mono text-lg font-bold focus:border-white transition-colors interactive-target cursor-pointer">
                <optgroup label="⚡ Physical Sports">
                  <option>Cricket</option>
                  <option>Football</option>
                  <option>Basketball</option>
                  <option>Badminton</option>
                  <option>Tennis</option>
                  <option>Volleyball</option>
                  <option>Kabaddi</option>
                </optgroup>
                <optgroup label="🎮 Online / Esports">
                  <option>Valorant</option>
                  <option>BGMI</option>
                  <option>Free Fire</option>
                  <option>Chess (Online)</option>
                  <option>PUBG Mobile</option>
                  <option>Call of Duty Mobile</option>
                  <option>Clash Royale</option>
                </optgroup>
              </select>
            </div>

            <div className="flex flex-col md:flex-row md:items-baseline gap-4">
              <label htmlFor="format" className="text-sm font-bold uppercase w-1/3">Tournament Format</label>
              <select name="format" id="format" value={form.format} onChange={handleChange} className="w-full md:w-2/3 border-b-[3px] border-black bg-transparent outline-none py-2 font-mono text-lg font-bold focus:border-white transition-colors interactive-target cursor-pointer">
                <option>Single Elimination (Knockout)</option>
                <option>Double Elimination</option>
                <option>Round Robin (League)</option>
                <option>Group Stage + Knockout</option>
              </select>
            </div>
          </div>

          {/* SECTION 2: Logistics */}
          <div className="space-y-8">
            <h3 className="text-2xl font-black uppercase border-b-2 border-[#1a1a1a] pb-2 inline-block">2. Time & Location</h3>

            <div className="flex flex-col md:flex-row md:items-baseline gap-4">
              <label htmlFor="venue" className="text-sm font-bold uppercase w-1/3">Exact Venue / Ground *</label>
              <div className="w-full md:w-2/3">
                <input name="venue" id="venue" value={form.venue} onChange={handleChange}
                  type="text" placeholder="e.g., Central Park, Pitch B"
                  className={`w-full border-b-[3px] bg-transparent outline-none py-2 font-mono text-lg font-bold focus:border-white transition-colors interactive-target placeholder-[#1a1a1a]/40 ${errors.venue ? 'border-red-500' : 'border-black'}`}
                />
                {errors.venue && <p className="text-red-600 text-xs mt-1 font-bold">{errors.venue}</p>}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-baseline gap-4">
              <label htmlFor="startDate" className="text-sm font-bold uppercase w-1/3">Start Date *</label>
              <div className="w-full md:w-2/3">
                <input name="startDate" id="startDate" value={form.startDate} onChange={handleChange}
                  type="date"
                  className={`w-full border-b-[3px] bg-transparent outline-none py-2 font-mono text-lg font-bold focus:border-white transition-colors interactive-target ${errors.startDate ? 'border-red-500' : 'border-black'}`}
                />
                {errors.startDate && <p className="text-red-600 text-xs mt-1 font-bold">{errors.startDate}</p>}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-baseline gap-4">
              <label htmlFor="endDate" className="text-sm font-bold uppercase w-1/3">End Date</label>
              <input name="endDate" id="endDate" value={form.endDate} onChange={handleChange}
                type="date"
                className="w-full md:w-2/3 border-b-[3px] border-black bg-transparent outline-none py-2 font-mono text-lg font-bold focus:border-white transition-colors interactive-target"
              />
            </div>
          </div>

          {/* SECTION 3: Entries & Prizes */}
          <div className="space-y-8">
            <h3 className="text-2xl font-black uppercase border-b-2 border-[#1a1a1a] pb-2 inline-block">3. Slots & Economics</h3>

            <div className="flex flex-col md:flex-row md:items-baseline gap-4">
              <label htmlFor="slots" className="text-sm font-bold uppercase w-1/3">Max Entry Slots (Teams) *</label>
              <div className="w-full md:w-2/3">
                <input name="slots" id="slots" value={form.slots} onChange={handleChange}
                  type="number" placeholder="16"
                  className={`w-full border-b-[3px] bg-transparent outline-none py-2 font-mono text-lg font-bold focus:border-white transition-colors interactive-target placeholder-[#1a1a1a]/40 ${errors.slots ? 'border-red-500' : 'border-black'}`}
                />
                {errors.slots && <p className="text-red-600 text-xs mt-1 font-bold">{errors.slots}</p>}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-baseline gap-4">
              <label htmlFor="entryFee" className="text-sm font-bold uppercase w-1/3">Entry Fee (Per Team)</label>
              <div className="w-full md:w-2/3 flex items-baseline">
                <span className="text-lg font-bold mr-2">₹</span>
                <input name="entryFee" id="entryFee" value={form.entryFee} onChange={handleChange}
                  type="number" placeholder="500"
                  className="w-full border-b-[3px] border-black bg-transparent outline-none py-2 font-mono text-lg font-bold focus:border-white transition-colors interactive-target placeholder-[#1a1a1a]/40"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-baseline gap-4">
              <label htmlFor="prizePool" className="text-sm font-bold uppercase w-1/3">Total Prize Pool</label>
              <div className="w-full md:w-2/3 flex items-baseline">
                <span className="text-lg font-bold mr-2">₹</span>
                <input name="prizePool" id="prizePool" value={form.prizePool} onChange={handleChange}
                  type="number" placeholder="10000"
                  className="w-full border-b-[3px] border-black bg-transparent outline-none py-2 font-mono text-lg font-bold focus:border-white transition-colors interactive-target placeholder-[#1a1a1a]/40"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Contact & Rules */}
          <div className="space-y-8">
            <h3 className="text-2xl font-black uppercase border-b-2 border-[#1a1a1a] pb-2 inline-block">4. Operations</h3>

            <div className="flex flex-col md:flex-row md:items-baseline gap-4">
              <label htmlFor="contact" className="text-sm font-bold uppercase w-1/3">Organizer Contact No. *</label>
              <div className="w-full md:w-2/3">
                <input name="contact" id="contact" value={form.contact} onChange={handleChange}
                  type="text" placeholder="+91 9999999999"
                  className={`w-full border-b-[3px] bg-transparent outline-none py-2 font-mono text-lg font-bold focus:border-white transition-colors interactive-target placeholder-[#1a1a1a]/40 ${errors.contact ? 'border-red-500' : 'border-black'}`}
                />
                {errors.contact && <p className="text-red-600 text-xs mt-1 font-bold">{errors.contact}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <label htmlFor="rules" className="text-sm font-bold uppercase">Tournament Rules & Guidelines</label>
              <textarea name="rules" id="rules" value={form.rules} onChange={handleChange}
                placeholder="List equipment rules, referee decisions, reporting times, etc..."
                rows="4"
                className="w-full border-[3px] border-[#1a1a1a] bg-white outline-none p-4 font-mono text-sm font-bold focus:bg-[#baffc9] transition-colors interactive-target shadow-[4px_4px_0px_rgba(26,26,26,1)] resize-none"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-16 bg-white hover:bg-[#baffc9] border-[3px] border-[#1a1a1a] py-6 rounded-xl font-black uppercase tracking-widest text-xl shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[6px] hover:translate-y-[6px] transition-all interactive-target"
          >
            Launch Tournament Now 🚀
          </button>
        </form>
      </div>
    </div>
  );
};

export default HostForm;
