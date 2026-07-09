import React, { useState, useEffect, useCallback } from 'react';
import { Compass, MapPin, Search, Bell, Sliders, AlertTriangle } from 'lucide-react';
import TournamentList from './TournamentList';
import TeamRosterForm from './TeamRosterForm';

// Haversine formula to compute distance in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const deg2rad = (deg) => deg * (Math.PI / 180);

export const JoinEventPage = ({ setCurrentPage, apiBaseUrl, user }) => {
  const [tournaments, setTournaments] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Coordinates & Location States
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const [locationMethod, setLocationMethod] = useState('Detecting...');
  const [locationName, setLocationName] = useState('Locating user...');
  const [radius, setRadius] = useState(100); // Proximity radius in km
  const [showAllPhysical, setShowAllPhysical] = useState(false);

  // Notifications State
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [inAppToasts, setInAppToasts] = useState([]);
  const [notifiedTournaments, setNotifiedTournaments] = useState(new Set());

  // Load tournaments from API
  const loadTournaments = useCallback(async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/tournaments`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTournaments(data);
      }
    } catch (err) {
      console.error('Error fetching tournaments:', err);
    }
  }, [apiBaseUrl]);

  // Request browser Geolocation and fallback to IP-based coordinates
  const detectLocation = useCallback(() => {
    setLocationMethod('Detecting...');
    setLocationName('Requesting GPS permissions...');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setCoords({ latitude: lat, longitude: lon });
          setLocationMethod('GPS');
          setLocationName(`GPS Detected (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
        },
        async (error) => {
          console.warn('Geolocation access failed/denied, falling back to IP detection.', error);
          setLocationName('GPS denied. Querying IP location...');
          try {
            const ipRes = await fetch('https://ipapi.co/json/');
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData.latitude && ipData.longitude) {
                setCoords({ latitude: ipData.latitude, longitude: ipData.longitude });
                setLocationMethod('IP');
                setLocationName(`${ipData.city || 'Unknown City'}, ${ipData.region || 'India'} (IP Fallback)`);
                return;
              }
            }
          } catch (ipErr) {
            console.error('IP location API failed:', ipErr);
          }
          // Default Fallback: Bangalore coordinates
          setCoords({ latitude: 12.9784, longitude: 77.5960 });
          setLocationMethod('Default');
          setLocationName('Bangalore, IN (Default Coords)');
        },
        { timeout: 5000 }
      );
    } else {
      setLocationName('Geolocation unsupported. Mumbai default...');
      setCoords({ latitude: 19.0760, longitude: 72.8777 });
      setLocationMethod('Default');
    }
  }, []);

  // Run location detection and fetch on mount
  useEffect(() => {
    detectLocation();
    loadTournaments();
  }, [detectLocation, loadTournaments]);

  // Manual city coordinates override (for testing proximity routing)
  const handleCityOverride = (city) => {
    if (city === 'Bangalore') {
      setCoords({ latitude: 12.9784, longitude: 77.5960 });
      setLocationMethod('Manual');
      setLocationName('Bangalore (Override Coords)');
    } else if (city === 'Mumbai') {
      setCoords({ latitude: 19.0760, longitude: 72.8777 });
      setLocationMethod('Manual');
      setLocationName('Mumbai (Override Coords)');
    } else if (city === 'Delhi') {
      setCoords({ latitude: 28.6139, longitude: 77.2090 });
      setLocationMethod('Manual');
      setLocationName('Delhi (Override Coords)');
    } else if (city === 'GPS') {
      detectLocation();
    }
  };

  // Push Notifications handling
  const triggerInAppToast = (title, msg) => {
    const id = Date.now() + Math.random().toString();
    setInAppToasts(prev => [...prev, { id, title, msg }]);
    setTimeout(() => {
      setInAppToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  const handleToggleNotifications = async () => {
    if (!notificationsOn) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsOn(true);
          new Notification('Nova Radar Active', {
            body: 'Proximity alerts for physical tournaments are now active!',
            icon: '/favicon.ico'
          });
          triggerInAppToast('Radar Enabled', 'Proximity and regional match updates are now active.');
        } else {
          alert('Notification permission denied by browser. Falling back to in-app alerts.');
          setNotificationsOn(true);
          triggerInAppToast('In-App Alerts Active', 'Browser notifications blocked. Using on-screen alerts.');
        }
      } else {
        setNotificationsOn(true);
        triggerInAppToast('In-App Alerts Active', 'Notifications unsupported. Using on-screen alerts.');
      }
    } else {
      setNotificationsOn(false);
      setNotifiedTournaments(new Set());
    }
  };

  // Run Proximity Alert checks when tournaments load or coordinates change
  useEffect(() => {
    if (!notificationsOn || tournaments.length === 0 || coords.latitude === null) return;

    tournaments.forEach(t => {
      if (t.venueType === 'offline' && t.venueDetails?.latitude) {
        const dist = getDistance(
          coords.latitude,
          coords.longitude,
          t.venueDetails.latitude,
          t.venueDetails.longitude
        );

        // Alert if the tournament is physical, closer than 50km, and not yet notified
        if (dist !== null && dist <= 50 && !notifiedTournaments.has(t._id)) {
          const alertMsg = `${t.title} (${t.gameName}) is only ${dist.toFixed(1)} km away at ${t.venueDetails.physicalAddress}. Join before slots fill!`;
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('📍 Nearby Tournament Alert!', {
              body: alertMsg,
              tag: t._id
            });
          }
          
          triggerInAppToast('📍 Tournament Nearby!', alertMsg);
          setNotifiedTournaments(prev => {
            const next = new Set(prev);
            next.add(t._id);
            return next;
          });
        }
      }
    });
  }, [notificationsOn, tournaments, coords, notifiedTournaments]);

  // Dynamic search filter helper
  const searchFilter = (t) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.title.toLowerCase().includes(term) ||
      t.gameName.toLowerCase().includes(term) ||
      (t.venueDetails?.physicalAddress && t.venueDetails.physicalAddress.toLowerCase().includes(term)) ||
      (t.venueDetails?.serverRegion && t.venueDetails.serverRegion.toLowerCase().includes(term))
    );
  };

  // 1. Process Physical (Offline) Tournaments with distances
  const physicalTournaments = tournaments
    .filter(t => t.venueType === 'offline')
    .map(t => {
      const distance = getDistance(
        coords.latitude,
        coords.longitude,
        t.venueDetails?.latitude,
        t.venueDetails?.longitude
      );
      return { ...t, distance };
    })
    .filter(searchFilter)
    .filter(t => showAllPhysical || radius === 'all' || t.distance === null || t.distance <= radius)
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

  // 2. Process Esports (Online) Tournaments
  const esportsTournaments = tournaments
    .filter(t => t.venueType === 'online')
    .filter(searchFilter)
    .sort((a, b) => {
      const regA = a.venueDetails?.serverRegion || '';
      const regB = b.venueDetails?.serverRegion || '';
      return regA.localeCompare(regB);
    });

  if (selectedEvent) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-start relative z-10 font-mono">
        <button 
          onClick={() => setSelectedEvent(null)}
          className="mb-8 bg-white border-[3px] border-[#1a1a1a] px-4 py-2 font-bold uppercase text-xs shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:shadow-[1px_1px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all interactive-target"
        >
          &lt;- Back to Tournaments
        </button>
        <TeamRosterForm 
          tournament={selectedEvent} 
          apiBaseUrl={apiBaseUrl} 
          user={user} 
          onSuccess={() => {
            setSelectedEvent(null);
            loadTournaments();
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1000px] mx-auto flex flex-col items-start relative z-10 font-mono text-[#1a1a1a] px-4">
      {/* Dynamic Toast Portal */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm">
        {inAppToasts.map(toast => (
          <div 
            key={toast.id} 
            className="bg-yellow-200 border-[3px] border-[#1a1a1a] p-4 shadow-[4px_4px_0px_rgba(26,26,26,1)] rounded-lg pointer-events-auto flex flex-col gap-1 transition-transform animate-slide-in"
          >
            <div className="flex items-center gap-2 font-bold text-xs uppercase text-[#1a1a1a] border-b-2 border-[#1a1a1a] pb-1">
              <Bell className="w-4 h-4 text-red-500" />
              <span>{toast.title}</span>
            </div>
            <p className="text-xs font-semibold leading-relaxed mt-1 text-[#1a1a1a]/90">{toast.msg}</p>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setCurrentPage('buttonsPage')}
        className="mb-8 bg-white border-[3px] border-[#1a1a1a] px-4 py-2 font-bold uppercase text-xs shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:shadow-[1px_1px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all interactive-target"
      >
        &lt;- Go Back
      </button>

      <h2 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tight text-[#1a1a1a] mb-8">
        Tournament Radar.
      </h2>

      {/* LOCATION & NOTIFICATION CONTROL PANEL */}
      <div className="w-full bg-[#ffedd5] border-[3px] border-[#1a1a1a] p-6 rounded-2xl shadow-[6px_6px_0px_rgba(26,26,26,1)] mb-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-[2px] border-[#1a1a1a] pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white border-2 border-[#1a1a1a] p-2 rounded-lg">
              <MapPin className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase opacity-60">Detected Coordinates</span>
              <p className="font-bold text-sm">{locationName}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase mr-1">Verify Near:</span>
            <button 
              onClick={() => handleCityOverride('GPS')}
              className="bg-white hover:bg-yellow-100 border-2 border-[#1a1a1a] text-[10px] font-bold uppercase py-1 px-2.5 shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)]"
            >
              Reset GPS
            </button>
            <button 
              onClick={() => handleCityOverride('Bangalore')}
              className="bg-[#baffc9] hover:bg-[#a6e6b5] border-2 border-[#1a1a1a] text-[10px] font-bold uppercase py-1 px-2.5 shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)]"
            >
              Bangalore
            </button>
            <button 
              onClick={() => handleCityOverride('Mumbai')}
              className="bg-[#cffafe] hover:bg-[#acd9e0] border-2 border-[#1a1a1a] text-[10px] font-bold uppercase py-1 px-2.5 shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)]"
            >
              Mumbai
            </button>
            <button 
              onClick={() => handleCityOverride('Delhi')}
              className="bg-[#ffb3ba] hover:bg-[#e6a2a8] border-2 border-[#1a1a1a] text-[10px] font-bold uppercase py-1 px-2.5 shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)]"
            >
              Delhi
            </button>
          </div>
        </div>

        {/* Proximity Slider & Notifications toggler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase">
              <span className="flex items-center gap-1.5"><Sliders className="w-4 h-4" /> Proximity Radius</span>
              <span className="bg-white border-2 border-[#1a1a1a] px-2 py-0.5 shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)]">
                {showAllPhysical ? 'Show All' : `${radius} km`}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <input 
                type="range"
                min="10"
                max="2000"
                step="10"
                disabled={showAllPhysical}
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-white border border-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a] disabled:opacity-40"
              />
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase select-none whitespace-nowrap">
                <input 
                  type="checkbox"
                  checked={showAllPhysical}
                  onChange={(e) => setShowAllPhysical(e.target.checked)}
                  className="w-4 h-4 border-2 border-[#1a1a1a] accent-black"
                />
                Show All
              </label>
            </div>
          </div>

          <div className="flex flex-col justify-center items-start md:items-end gap-2">
            <button
              onClick={handleToggleNotifications}
              className={`flex items-center gap-2 border-[3px] border-[#1a1a1a] py-3.5 px-6 rounded-xl font-black uppercase tracking-wider text-xs shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:shadow-[1px_1px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all interactive-target ${
                notificationsOn ? 'bg-[#baffc9] text-[#1a1a1a]' : 'bg-white text-[#1a1a1a]'
              }`}
            >
              <Bell className={`w-4 h-4 ${notificationsOn ? 'animate-swing text-red-500' : ''}`} />
              <span>{notificationsOn ? 'Radar Alerts: ON ✓' : 'Turn On Radar Alerts'}</span>
            </button>
            <span className="text-[9px] font-bold uppercase opacity-55">
              Get notified when physical matches are within 50km
            </span>
          </div>
        </div>
      </div>

      {/* FILTER SEARCH TIMELINE BAR */}
      <div className="w-full bg-white border-[3px] border-[#1a1a1a] p-4 rounded-xl shadow-[4px_4px_0px_rgba(26,26,26,1)] mb-8 flex items-center gap-3">
        <Search className="w-5 h-5 text-[#1a1a1a]/60" />
        <input 
          type="text" 
          placeholder="Search by title, game, region, or physical venue location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none outline-none font-mono text-sm font-bold placeholder-[#1a1a1a]/40 py-1"
        />
      </div>

      {/* DYNAMIC LISTINGS TIMELINE */}
      <div className="w-full space-y-12 mb-16">
        
        {/* PHYSICAL TOURNAMENTS SECTION */}
        <div>
          <h3 className="text-xl font-black uppercase border-b-[3px] border-[#1a1a1a] pb-2 mb-6 flex items-center gap-2">
            📍 Physical Tournaments Near You
          </h3>
          {physicalTournaments.length > 0 ? (
            <TournamentList 
              tournaments={physicalTournaments} 
              onSelectEvent={setSelectedEvent} 
              user={user}
            />
          ) : (
            <div className="w-full bg-white border-[3px] border-[#1a1a1a] rounded-xl p-8 text-center shadow-[4px_4px_0px_rgba(26,26,26,1)]">
              <Compass className="w-10 h-10 mx-auto text-[#1a1a1a]/40 mb-3" />
              <p className="text-sm font-bold uppercase opacity-60">No physical tournaments in range.</p>
              <p className="text-xs opacity-50 mt-1">Try broadening your proximity radius slider or override your city above.</p>
            </div>
          )}
        </div>

        {/* ESPORTS TOURNAMENTS SECTION */}
        <div>
          <h3 className="text-xl font-black uppercase border-b-[3px] border-[#1a1a1a] pb-2 mb-6 flex items-center gap-2">
            🎮 Global Esports Leagues
          </h3>
          {esportsTournaments.length > 0 ? (
            <TournamentList 
              tournaments={esportsTournaments} 
              onSelectEvent={setSelectedEvent} 
              user={user}
            />
          ) : (
            <div className="w-full bg-white border-[3px] border-[#1a1a1a] rounded-xl p-8 text-center shadow-[4px_4px_0px_rgba(26,26,26,1)]">
              <Compass className="w-10 h-10 mx-auto text-[#1a1a1a]/40 mb-3" />
              <p className="text-sm font-bold uppercase opacity-60">No esports matches found.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default JoinEventPage;
