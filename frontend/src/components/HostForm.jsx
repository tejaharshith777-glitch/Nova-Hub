import React, { useState } from 'react';

export const HostForm = ({ setCurrentPage, apiBaseUrl, user }) => {
  const [form, setForm] = useState({
    eventName: '', 
    sport: 'Cricket', 
    format: 'Single Elimination (Knockout)',
    venue: '', 
    startDate: '', 
    endDate: '', 
    slots: '', 
    entryFee: '', 
    prizePool: '',
    contact: '', 
    rules: '',
    // Additional location/routing fields
    serverRegion: 'Asia South',
    lobbyCode: '',
    pinCode: '',
    stadiumHall: '',
    latitude: '',
    longitude: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if selected sport is an online esports game
  const isEsports = [
    'Valorant', 
    'BGMI', 
    'Free Fire', 
    'Chess (Online)', 
    'PUBG Mobile', 
    'Call of Duty Mobile', 
    'Clash Royale'
  ].includes(form.sport);

  // Determine if selected sport is a physical/offline racing sport
  const isRacing = [
    'Cycle Racing',
    'Bike Racing',
    'Car Racing'
  ].includes(form.sport);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const fetchGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        alert(`Successfully fetched coordinates: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
      },
      (error) => {
        console.error('GPS error:', error);
        alert('Could not fetch GPS coordinates. Please type them manually.');
      }
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!form.eventName.trim()) newErrors.eventName = 'Event name is required';
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.slots) newErrors.slots = 'Number of slots is required';
    if (!form.contact.trim()) newErrors.contact = 'Contact number is required';

    if (!isEsports) {
      if (!form.venue.trim()) newErrors.venue = 'Exact physical address is required';
      if (!form.pinCode.trim()) newErrors.pinCode = 'Pin code is required';
    } else {
      if (!form.serverRegion) newErrors.serverRegion = 'Server Region is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setIsSubmitting(true);

    const generatedLobby = form.lobbyCode.trim() || 'LBY-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    const payload = {
      title: form.eventName,
      category: isEsports ? 'esports' : isRacing ? 'racing' : 'sports',
      gameName: form.sport,
      rules: form.rules,
      venueType: isEsports ? 'online' : 'offline',
      venueDetails: isEsports ? {
        serverRegion: form.serverRegion,
        lobbyCode: generatedLobby
      } : {
        physicalAddress: form.venue,
        pinCode: form.pinCode,
        stadiumHall: form.stadiumHall || 'Main Arena',
        latitude: parseFloat(form.latitude) || 0,
        longitude: parseFloat(form.longitude) || 0
      },
      format: form.format === 'Single Elimination (Knockout)' ? 'single-elimination' :
              form.format === 'Double Elimination' ? 'double-elimination' :
              form.format === 'Round Robin (League)' ? 'round-robin' : 'battle-royale-matrix',
      maxTeams: parseInt(form.slots),
      teamSize: isRacing ? 1 : (form.sport === 'Cricket' ? 11 : form.sport === 'Football' ? 11 : form.sport === 'Basketball' ? 5 : form.sport === 'Badminton' ? 2 : 5),
      prizePool: parseFloat(form.prizePool) || 0,
      entryFee: parseFloat(form.entryFee) || 0,
      prizeDistribution: {
        firstPlace: 60,
        secondPlace: 30,
        thirdPlace: 10
      }
    };

    if (!apiBaseUrl) {
      // Offline mode simulation fallback
      setIsSubmitting(true);
      setTimeout(() => {
        const mockTournament = {
          _id: 'mock-t-' + Date.now(),
          ...payload,
          hostId: { _id: user?.id || 'mock-host-id', username: user?.username || 'Host' },
          status: 'open',
          registeredTeams: [],
          startDate: form.startDate || new Date(Date.now() + 86400000).toISOString(),
          endDate: form.endDate || new Date(Date.now() + 172800000).toISOString()
        };

        const saved = localStorage.getItem('novahub_mock_tournaments');
        const current = saved ? JSON.parse(saved) : [];
        current.push(mockTournament);
        localStorage.setItem('novahub_mock_tournaments', JSON.stringify(current));

        setSubmitted(true);
        setIsSubmitting(false);
      }, 1000);
      return;
    }

    try {
      // Post to backend API
      const res = await fetch(`${apiBaseUrl}/api/tournaments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setApiError(data.message || 'Server rejected tournament parameters.');
      }
    } catch (err) {
      console.error(err);
      setApiError('Network connection error. Check if the server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm({
      eventName: '', sport: 'Cricket', format: 'Single Elimination (Knockout)',
      venue: '', startDate: '', endDate: '', slots: '', entryFee: '', prizePool: '',
      contact: '', rules: '', serverRegion: 'Asia South', lobbyCode: '', pinCode: '',
      stadiumHall: '', latitude: '', longitude: ''
    });
    setApiError('');
  };

  if (submitted) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center relative z-10 py-16 text-center">
        <div className="text-8xl mb-6 animate-bounce">🎉</div>
        <h2 className="text-5xl font-black font-display uppercase mb-4 text-[#1a1a1a]">Tournament Launched!</h2>
        <p className="font-mono text-lg text-[#1a1a1a]/70 mb-2">Your event <strong>"{form.eventName}"</strong> is active on public timelines.</p>
        <p className="font-mono text-sm text-[#1a1a1a]/50 mb-10">Players can now discover this listing and enroll their roster squad.</p>
        <div className="bg-[#baffc9] border-[3px] border-[#1a1a1a] rounded-2xl p-8 w-full max-w-md shadow-[6px_6px_0px_rgba(26,26,26,1)] text-left space-y-3 font-mono text-sm mb-10">
          <div className="flex justify-between"><span className="font-bold uppercase opacity-60">Sport</span><span className="font-bold">{form.sport}</span></div>
          <div className="flex justify-between"><span className="font-bold uppercase opacity-60">Format</span><span className="font-bold">{form.format}</span></div>
          <div className="flex justify-between">
            <span className="font-bold uppercase opacity-60">Venue</span>
            <span className="font-bold truncate max-w-[200px]">{isEsports ? `Online (${form.serverRegion})` : form.venue}</span>
          </div>
          {!isEsports && form.latitude && (
            <div className="flex justify-between">
              <span className="font-bold uppercase opacity-60">Coordinates</span>
              <span className="font-bold text-xs">{form.latitude}, {form.longitude}</span>
            </div>
          )}
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
        <h2 className="text-4xl md:text-5xl font-black font-display uppercase tracking-tight text-[#1a1a1a] mb-12 border-b-[3px] border-[#1a1a1a] pb-6">
          Set Up Tourney.
        </h2>

        {apiError && (
          <div className="bg-red-200 border-[3px] border-red-600 p-4 rounded-xl text-red-600 font-bold uppercase text-xs mb-8">
            ERROR: {apiError}
          </div>
        )}

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
                <optgroup label="🏎️ Racing Sports">
                  <option>Cycle Racing</option>
                  <option>Bike Racing</option>
                  <option>Car Racing</option>
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

            {/* Offline Venue Fields */}
            {!isEsports && (
              <>
                <div className="flex flex-col md:flex-row md:items-baseline gap-4">
                  <label htmlFor="venue" className="text-sm font-bold uppercase w-1/3">Physical Venue / Ground *</label>
                  <div className="w-full md:w-2/3">
                    <input name="venue" id="venue" value={form.venue} onChange={handleChange}
                      type="text" placeholder="e.g., Central Park Pitch B"
                      className={`w-full border-b-[3px] bg-transparent outline-none py-2 font-mono text-lg font-bold focus:border-white transition-colors interactive-target placeholder-[#1a1a1a]/40 ${errors.venue ? 'border-red-500' : 'border-black'}`}
                    />
                    {errors.venue && <p className="text-red-600 text-xs mt-1 font-bold">{errors.venue}</p>}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-baseline gap-4">
                  <label htmlFor="pinCode" className="text-sm font-bold uppercase w-1/3">Pin Code *</label>
                  <div className="w-full md:w-2/3">
                    <input name="pinCode" id="pinCode" value={form.pinCode} onChange={handleChange}
                      type="text" placeholder="e.g., 560001"
                      className={`w-full border-b-[3px] bg-transparent outline-none py-2 font-mono text-lg font-bold focus:border-white transition-colors interactive-target placeholder-[#1a1a1a]/40 ${errors.pinCode ? 'border-red-500' : 'border-black'}`}
                    />
                    {errors.pinCode && <p className="text-red-600 text-xs mt-1 font-bold">{errors.pinCode}</p>}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-baseline gap-4">
                  <label htmlFor="stadiumHall" className="text-sm font-bold uppercase w-1/3">Stadium Gate / Hall</label>
                  <input name="stadiumHall" id="stadiumHall" value={form.stadiumHall} onChange={handleChange}
                    type="text" placeholder="e.g., Gate 4 Net Arena"
                    className="w-full md:w-2/3 border-b-[3px] border-black bg-transparent outline-none py-2 font-mono text-lg font-bold focus:border-white transition-colors interactive-target placeholder-[#1a1a1a]/40"
                  />
                </div>

                {/* GPS Coordinates Capture */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <label className="text-sm font-bold uppercase w-1/3">GPS Coordinates</label>
                  <div className="w-full md:w-2/3 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-xs font-bold opacity-60">Lat:</span>
                      <input name="latitude" value={form.latitude} onChange={handleChange}
                        type="number" step="0.000001" placeholder="12.9784"
                        className="w-full border-b-[2px] border-black bg-transparent outline-none py-1 font-mono text-sm font-bold placeholder-[#1a1a1a]/40"
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-xs font-bold opacity-60">Lon:</span>
                      <input name="longitude" value={form.longitude} onChange={handleChange}
                        type="number" step="0.000001" placeholder="77.5960"
                        className="w-full border-b-[2px] border-black bg-transparent outline-none py-1 font-mono text-sm font-bold placeholder-[#1a1a1a]/40"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={fetchGPSLocation}
                      className="bg-white border-2 border-black px-3 py-1.5 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all w-full sm:w-auto whitespace-nowrap interactive-target"
                    >
                      Use GPS Coords
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Esports Online Fields */}
            {isEsports && (
              <>
                <div className="flex flex-col md:flex-row md:items-baseline gap-4">
                  <label htmlFor="serverRegion" className="text-sm font-bold uppercase w-1/3">Server Region *</label>
                  <div className="w-full md:w-2/3">
                    <select name="serverRegion" id="serverRegion" value={form.serverRegion} onChange={handleChange} className="w-full border-b-[3px] border-black bg-transparent outline-none py-2 font-mono text-lg font-bold focus:border-white transition-colors interactive-target cursor-pointer">
                      <option>Asia South</option>
                      <option>Asia East</option>
                      <option>Europe West</option>
                      <option>North America</option>
                    </select>
                    {errors.serverRegion && <p className="text-red-600 text-xs mt-1 font-bold">{errors.serverRegion}</p>}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-baseline gap-4">
                  <label htmlFor="lobbyCode" className="text-sm font-bold uppercase w-1/3">Lobby Code</label>
                  <input name="lobbyCode" id="lobbyCode" value={form.lobbyCode} onChange={handleChange}
                    type="text" placeholder="Auto-generated if left blank"
                    className="w-full md:w-2/3 border-b-[3px] border-black bg-transparent outline-none py-2 font-mono text-lg font-bold focus:border-white transition-colors interactive-target placeholder-[#1a1a1a]/40"
                  />
                </div>
              </>
            )}

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
            disabled={isSubmitting}
            className="w-full mt-16 bg-white hover:bg-[#baffc9] border-[3px] border-[#1a1a1a] py-6 rounded-xl font-black uppercase tracking-widest text-xl shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[6px] hover:translate-y-[6px] transition-all interactive-target disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing Listing...' : 'Launch Tournament Now 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HostForm;
