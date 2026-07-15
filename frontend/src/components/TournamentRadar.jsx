import React, { useState, useEffect } from 'react';
import { useJsApiLoader, GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { MapPin, Compass, Trophy, Navigation, ShieldAlert, Award, Globe, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Pastel color classes list for cards
const pastelBgClasses = ['bg-[#baffc9]', 'bg-[#ffdfba]', 'bg-[#cffafe]', 'bg-[#ffb3ba]', 'bg-[#fcebb6]', 'bg-[#fce4fb]'];

// Haversine formula calculation
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

// 5-6 Realistic Mock Tournaments (latitudes and longitudes near Bangalore and surrounding regions)
const MOCK_TOURNAMENTS = [
  {
    id: 't1',
    title: 'Bangalore Cricket Derby',
    gameName: 'Cricket',
    venueType: 'offline',
    venueAddress: 'Chinnaswamy Stadium, Bangalore',
    latitude: 12.9784,
    longitude: 77.5960,
    entryFee: 300,
    prizePool: 50000,
    slotsFilled: 12,
    maxSlots: 16
  },
  {
    id: 't2',
    title: 'Koramangala Badminton Open',
    gameName: 'Badminton',
    venueType: 'offline',
    venueAddress: 'Koramangala Sports Club, Bangalore',
    latitude: 12.9350,
    longitude: 77.6250,
    entryFee: 150,
    prizePool: 15000,
    slotsFilled: 8,
    maxSlots: 8
  },
  {
    id: 't3',
    title: 'Mysore Cycling Classic',
    gameName: 'Cycle Racing',
    venueType: 'offline',
    venueAddress: 'Chamundi Hill Circuit, Mysore',
    latitude: 12.2958,
    longitude: 76.6394,
    entryFee: 100,
    prizePool: 20000,
    slotsFilled: 4,
    maxSlots: 10
  },
  {
    id: 't4',
    title: 'Chennai Football League',
    gameName: 'Football',
    venueType: 'offline',
    venueAddress: 'Jawaharlal Nehru Stadium, Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    entryFee: 500,
    prizePool: 75000,
    slotsFilled: 6,
    maxSlots: 12
  },
  {
    id: 't5',
    title: 'Guntur Car Championship',
    gameName: 'Car Racing',
    venueType: 'offline',
    venueAddress: 'Guntur Speedway, Guntur',
    latitude: 16.3067,
    longitude: 80.4365,
    entryFee: 1000,
    prizePool: 120000,
    slotsFilled: 2,
    maxSlots: 6
  },
  {
    id: 't6',
    title: 'Apex Legends Challenger Cup',
    gameName: 'Apex Legends',
    venueType: 'online',
    venueAddress: 'Asia South Region Server',
    latitude: null,
    longitude: null,
    entryFee: 50,
    prizePool: 25000,
    slotsFilled: 18,
    maxSlots: 20
  }
];

export const TournamentRadar = () => {
  const navigate = useNavigate();
  const [coords, setCoords] = useState({ latitude: 12.9784, longitude: 77.5960 }); // Default Bangalore
  const [locationName, setLocationName] = useState('Bangalore (Default Coords)');
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState(null);
  
  const [radius, setRadius] = useState(100); // Default radius filter is 100km
  const [selectedPin, setSelectedPin] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9784, lng: 77.5960 });
  const [dbTournaments, setDbTournaments] = useState([]);

  useEffect(() => {
    const fetchDbTournaments = async () => {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 
        (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
          ? 'http://localhost:5000' 
          : '');
      try {
        const res = await fetch(`${apiBaseUrl}/api/tournaments`);
        if (res.ok) {
          const data = await res.json();
          // Transform db tournaments to fit radar pins
          const mapped = data.map((t) => {
            // Give them realistic coordinates around Bangalore if not set
            const baseLat = 12.9784;
            const baseLng = 77.5960;
            // Generate deterministic coords based on title hash so they stay in the same place
            let hash = 0;
            for (let i = 0; i < t.title.length; i++) {
              hash = t.title.charCodeAt(i) + ((hash << 5) - hash);
            }
            const offsetLat = ((hash % 100) / 1000) * (hash > 0 ? 1 : -1);
            const offsetLng = (((hash >> 4) % 100) / 1000) * (hash > 0 ? -1 : 1);

            return {
              id: t._id,
              title: t.title,
              gameName: t.gameName,
              venueType: t.venueType,
              venueAddress: t.venueType === 'offline' ? (t.venueDetails?.physicalAddress || 'Ground Venue') : 'Online Server',
              latitude: t.venueType === 'offline' ? (t.venueDetails?.latitude || (baseLat + offsetLat)) : null,
              longitude: t.venueType === 'offline' ? (t.venueDetails?.longitude || (baseLng + offsetLng)) : null,
              entryFee: t.entryFee || 0,
              prizePool: t.prizePool || 0,
              slotsFilled: t.registeredTeams?.length || 0,
              maxSlots: t.maxTeams,
              isDynamic: true
            };
          });
          setDbTournaments(mapped);
        }
      } catch (err) {
        console.warn("Failed to fetch database tournaments for radar:", err);
      }
    };
    fetchDbTournaments();
  }, []);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey,
    libraries: ['places']
  });

  // 1. Geolocation fetch
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        setMapCenter({ lat: latitude, lng: longitude });
        setLocationName(`Detected Coordinates (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        setGeoLoading(false);
        setGeoError(null);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        let errorMsg = 'Access Denied. Check browser settings.';
        if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out. Using default fallback.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location unavailable. Using default fallback.';
        }
        setGeoError(errorMsg);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  // Calculate distances and process tournaments
  const processedTournaments = [...dbTournaments, ...MOCK_TOURNAMENTS].map((t) => {
    if (t.venueType === 'online') {
      return { ...t, distance: 0 }; // Online has no physical distance
    }
    const dist = haversineDistance(
      coords.latitude,
      coords.longitude,
      t.latitude,
      t.longitude
    );
    return { ...t, distance: dist };
  });

  // Filter tournaments based on radius
  const filteredTournaments = processedTournaments.filter((t) => {
    if (t.venueType === 'online') return true; // Online tournaments are always relevant
    return t.distance !== null && t.distance <= radius;
  });

  const handleRecenter = () => {
    setMapCenter({ lat: coords.latitude, lng: coords.longitude });
  };

  // Neo-Brutalist Google Map Styles
  const mapOptions = {
    disableDefaultUI: false,
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#1a1a1a' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c4e4e3' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
      { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#666666' }] },
      { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#e0e0e0' }] }
    ]
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 md:p-8 font-mono text-[#1a1a1a]">
      {/* Title Header */}
      <div className="w-full bg-[#ffdfba] border-[3px] border-[#1a1a1a] shadow-[6px_6px_0px_rgba(26,26,26,1)] p-6 md:p-8 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-[#1a1a1a] text-[#ffdfba] text-xs font-black uppercase px-2 py-0.5 tracking-wider inline-flex items-center gap-1.5 mb-2">
            <Compass className="w-3.5 h-3.5 animate-spin" /> PROXIMITY GPS ACTIVE
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#1a1a1a] leading-none mb-2 font-display">
            TOURNAMENT RADAR
          </h1>
          <p className="text-xs md:text-sm font-bold text-[#1a1a1a]/70">
            Find competitive sports and gaming matches in your surrounding area.
          </p>
        </div>
        <div className="flex flex-col gap-1 text-left md:text-right font-bold text-xs uppercase bg-white border-2 border-[#1a1a1a] p-3 rounded-lg">
          <span className="opacity-60">Your Current Hub Location:</span>
          <span className="text-[#1a1a1a] flex items-center gap-1">
            <MapPin className="w-4 h-4 text-red-500" />
            {locationName}
          </span>
        </div>
      </div>

      {/* Geolocation Status Bar */}
      {geoLoading && (
        <div className="w-full bg-[#fcebb6] border-[3px] border-[#1a1a1a] shadow-[4px_4px_0px_rgba(26,26,26,1)] p-4 rounded-xl mb-6 font-bold uppercase text-xs animate-pulse flex items-center gap-2">
          <Navigation className="w-4 h-4 animate-bounce" /> Querying Satellite GPS Location Coordinates...
        </div>
      )}

      {geoError && (
        <div className="w-full bg-[#ffb3ba] border-[3px] border-[#1a1a1a] shadow-[4px_4px_0px_rgba(26,26,26,1)] p-4 rounded-xl mb-6 font-bold uppercase text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#1a1a1a]" />
            <span>GPS Unavailable: {geoError}</span>
          </div>
          <button 
            onClick={() => {
              setCoords({ latitude: 12.9784, longitude: 77.5960 });
              setMapCenter({ lat: 12.9784, lng: 77.5960 });
              setGeoError(null);
            }} 
            className="bg-white border-2 border-black px-2.5 py-1 text-[10px] hover:bg-[#1a1a1a] hover:text-white transition-colors cursor-pointer"
          >
            Use Bangalore Default
          </button>
        </div>
      )}

      {/* Radar Map & Slider Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 items-stretch">
        
        {/* Google Map Box */}
        <div className="lg:col-span-2 flex flex-col bg-white border-[3px] border-[#1a1a1a] shadow-[6px_6px_0px_rgba(26,26,26,1)] rounded-2xl overflow-hidden min-h-[400px] relative">
          {loadError && (
            <div className="absolute inset-0 bg-[#ffb3ba]/20 flex flex-col items-center justify-center p-6 text-center">
              <ShieldAlert className="w-12 h-12 mb-3 text-red-500" />
              <h3 className="font-bold text-lg uppercase mb-1">Google Maps failed to load</h3>
              <p className="text-xs max-w-sm opacity-70">Make sure VITE_GOOGLE_MAPS_API_KEY is defined or check your browser console.</p>
            </div>
          )}

          {!isLoaded && !loadError ? (
            <div className="absolute inset-0 bg-white flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-[#1a1a1a] border-t-transparent mb-3" />
              <span className="text-xs font-bold uppercase">Synthesizing Match Map Grid...</span>
            </div>
          ) : (
            isLoaded && (
              <GoogleMap
                mapContainerClassName="w-full h-full min-h-[400px]"
                center={mapCenter}
                zoom={coords.latitude === 12.9784 && coords.longitude === 77.5960 ? 10 : 13}
                options={mapOptions}
                onClick={() => setSelectedPin(null)}
              >
                {/* User Coordinates marker */}
                <MarkerF
                  position={{ lat: coords.latitude, lng: coords.longitude }}
                  title="You (Proximity Center)"
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#3b82f6',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                  }}
                />

                {/* Tournaments Pin markers */}
                {filteredTournaments.map((t) => {
                  if (t.venueType === 'online') return null; // Online events don't render on the map
                  return (
                    <MarkerF
                      key={t.id}
                      position={{ lat: t.latitude, lng: t.longitude }}
                      title={t.title}
                      onClick={() => {
                        setSelectedPin(t);
                        setMapCenter({ lat: t.latitude, lng: t.longitude });
                      }}
                      icon={{
                        path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                        scale: 6,
                        fillColor: '#ef4444',
                        fillOpacity: 1,
                        strokeColor: '#1a1a1a',
                        strokeWeight: 2,
                      }}
                    />
                  );
                })}

                {/* Popup Info Window */}
                {selectedPin && (
                  <InfoWindowF
                    position={{ lat: selectedPin.latitude, lng: selectedPin.longitude }}
                    onCloseClick={() => setSelectedPin(null)}
                  >
                    <div className="p-2 font-mono text-xs max-w-[200px] text-[#1a1a1a]">
                      <h4 className="font-black uppercase border-b border-[#1a1a1a]/20 pb-1 mb-1.5">{selectedPin.title}</h4>
                      <p className="font-bold opacity-80 mb-1">{selectedPin.gameName} Tournament</p>
                      <p className="opacity-60 mb-2">{selectedPin.venueAddress}</p>
                      <div className="flex justify-between font-black text-red-500 mb-2">
                        <span>Distance:</span>
                        <span>{selectedPin.distance ? `${selectedPin.distance.toFixed(1)} km` : 'TBD'}</span>
                      </div>
                      <button 
                        onClick={() => navigate(`/tournament/${selectedPin.id}`)}
                        className="w-full py-1.5 bg-yellow-200 hover:bg-yellow-300 text-black border border-black font-black uppercase text-[9px] rounded shadow-[1px_1px_0px_rgba(0,0,0,1)] text-center cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </InfoWindowF>
                )}
              </GoogleMap>
            )
          )}
          
          {/* Map Recenter button overlay */}
          <button 
            onClick={handleRecenter}
            className="absolute bottom-4 right-4 bg-white hover:bg-yellow-100 border-[3px] border-[#1a1a1a] shadow-[2px_2px_0px_rgba(26,26,26,1)] px-3 py-2 text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition-all hover:translate-y-[1px] cursor-pointer z-[1]"
          >
            <Compass className="w-4 h-4 text-blue-500 animate-pulse" /> Re-Center
          </button>
        </div>

        {/* Proximity Control Slider Panel */}
        <div className="flex flex-col justify-between bg-[#bde3fb] border-[3px] border-[#1a1a1a] shadow-[6px_6px_0px_rgba(26,26,26,1)] rounded-2xl p-6 md:p-8">
          
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-1">
              <Award className="w-5 h-5 text-yellow-500" /> Proximity Controls
            </h3>
            <p className="text-xs leading-relaxed font-bold text-[#1a1a1a]/70">
              Drag the neubrutalist slider to adjust the scanning radius. Any offline events outside this boundary will be automatically filtered out.
            </p>
          </div>

          <div className="my-8 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase opacity-65">Scanning Range:</span>
              <span className="bg-[#1a1a1a] text-white text-lg font-black px-3 py-1 rounded shadow-[2.5px_2.5px_0px_rgba(26,26,26,0.3)]">
                {radius} KM
              </span>
            </div>
            
            <input 
              type="range"
              min="10"
              max="600"
              step="10"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full accent-[#1a1a1a] h-3 bg-white border-2 border-black rounded-lg appearance-none cursor-pointer"
            />
            
            <div className="flex justify-between font-bold text-[9px] uppercase opacity-75">
              <span>10km</span>
              <span>150km</span>
              <span>300km</span>
              <span>450km</span>
              <span>600km</span>
            </div>
          </div>

          <div className="bg-white border-2 border-[#1a1a1a] p-4 rounded-xl shadow-[3px_3px_0px_rgba(26,26,26,1)] text-xs font-bold space-y-2">
            <div className="flex justify-between border-b border-[#1a1a1a]/10 pb-1.5">
              <span className="opacity-60">Radar Status:</span>
              <span className="text-green-600">Scan Complete</span>
            </div>
            <div className="flex justify-between border-b border-[#1a1a1a]/10 pb-1.5">
              <span className="opacity-60">Active Pin Count:</span>
              <span>{filteredTournaments.filter(t => t.venueType === 'offline').length} Arena(s)</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">Online Leagues:</span>
              <span>{filteredTournaments.filter(t => t.venueType === 'online').length} Available</span>
            </div>
          </div>

        </div>

      </div>

      {/* Tournament Cards Feed */}
      <div>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#1a1a1a] mb-6 flex items-center gap-2">
          <span>⚔️</span> MATCH RADAR STREAM ({filteredTournaments.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((t, idx) => {
            const cardBgClass = pastelBgClasses[idx % pastelBgClasses.length];
            const isFull = t.slotsFilled >= t.maxSlots;

            return (
              <div 
                key={t.id}
                className={`border-[3px] border-[#1a1a1a] rounded-2xl p-5 shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)] hover:translate-x-[2.5px] hover:translate-y-[2.5px] transition-all flex flex-col justify-between gap-4 font-bold text-xs uppercase ${cardBgClass}`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-[#1a1a1a] text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-wide">
                      {t.gameName}
                    </span>
                    {t.venueType === 'online' ? (
                      <span className="bg-white border-2 border-[#1a1a1a] text-[9px] font-black px-2 py-0.5 text-blue-600 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Online
                      </span>
                    ) : (
                      <span className="bg-white border-2 border-[#1a1a1a] text-[9px] font-black px-2 py-0.5 text-red-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Physical
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-[#1a1a1a] mb-2 leading-tight font-display">
                    {t.title}
                  </h3>

                  <p className="text-[10px] text-[#1a1a1a]/70 font-bold mb-4 line-clamp-1">
                    📍 {t.venueAddress}
                  </p>
                </div>

                <div className="space-y-3.5 border-t border-[#1a1a1a]/10 pt-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="opacity-60">Entry Fee:</span>
                    <span>{t.entryFee === 0 ? 'Free' : `₹${t.entryFee}`}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="opacity-60">Prize Pool:</span>
                    <span className="text-yellow-600">₹{t.prizePool}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="opacity-60">Slots:</span>
                    <span className="flex items-center gap-1 text-[10px]">
                      <Users className="w-3.5 h-3.5" />
                      {t.slotsFilled} / {t.maxSlots}
                    </span>
                  </div>

                  {t.venueType === 'offline' && (
                    <div className="flex justify-between items-center text-red-500 font-black text-[10px] border-t border-dashed border-[#1a1a1a]/20 pt-2">
                      <span>Proximity:</span>
                      <span>{t.distance ? `${t.distance.toFixed(1)} KM Away` : 'Calculating...'}</span>
                    </div>
                  )}

                  <button 
                    disabled={isFull}
                    onClick={() => navigate(`/tournament/${t.id}`)}
                    className={`w-full py-2.5 rounded-xl border-[2.5px] border-[#1a1a1a] font-black text-[10px] uppercase shadow-[2.5px_2.5px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-[2.5px] hover:translate-y-[2.5px] transition-all cursor-pointer ${
                      isFull 
                        ? 'bg-[#1a1a1a]/10 text-[#1a1a1a]/30 shadow-none cursor-not-allowed translate-x-[2.5px] translate-y-[2.5px]'
                        : 'bg-white hover:bg-yellow-200'
                    }`}
                  >
                    {isFull ? 'Roster Slots Full' : 'Register Team'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTournaments.length === 0 && (
          <div className="w-full border-[3px] border-[#1a1a1a] bg-white p-12 text-center rounded-2xl shadow-[6px_6px_0px_rgba(26,26,26,1)]">
            <Trophy className="w-12 h-12 text-[#1a1a1a]/40 mx-auto mb-3" />
            <h3 className="font-black text-xl uppercase mb-1">No tournaments found</h3>
            <p className="text-xs font-bold opacity-60 max-w-sm mx-auto leading-relaxed">
              Drag the radius filter range slider or try broadening your coordinates override search to check a wider region.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentRadar;
