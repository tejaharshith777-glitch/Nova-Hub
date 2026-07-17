import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, Navigation, CheckCircle } from 'lucide-react';

export const InteractiveLocationPicker = ({ onConfirmBooking, defaultCoords = { lat: 12.9784, lng: 77.5960 }, ticketPrice = 450 }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const tileLayerInstanceRef = useRef(null);

  const [coords, setCoords] = useState(defaultCoords);
  const [address, setAddress] = useState('Resolving starting coordinates...');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 1. Dynamically load Leaflet resources via CDN to avoid Vite asset resolution bugs
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.async = true;
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup loaded script node on unmount
      if (script.parentNode) script.parentNode.removeChild(script);
      if (link.parentNode) link.parentNode.removeChild(link);
    };
  }, []);

  // 2. Reverse Geocoding with 1-second debounce safety rate limiter
  const reverseGeocode = (lat, lng) => {
    // Clear any pending geocoding requests
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setLoadingAddress(true);
    setErrorMsg('');

    // Wait exactly 1 second (1000ms) after user stops dragging or clicking to avoid Nominatim limits
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'Nova-Hub-Ticketing-Application/1.0'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Filter to a friendly readable address or use display name
          const resolvedStr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setAddress(resolvedStr);
        } else {
          throw new Error('Nominatim returned non-OK status');
        }
      } catch (err) {
        console.warn('OSM Nominatim Reverse Geocode failed (likely rate-limited).', err);
        setErrorMsg('Nominatim geocoder limits exceeded. Using coordinate address fallback.');
        setAddress(`Venue (Coords: ${lat.toFixed(6)}, ${lng.toFixed(6)})`);
      } finally {
        setLoadingAddress(false);
      }
    }, 1000);
  };

  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a city or address to search.');
      return;
    }
    
    setIsSearching(true);
    setErrorMsg('');
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'Nova-Hub-Ticketing-Application/1.0'
          }
        }
      );
      
      if (response.ok) {
        const results = await response.json();
        if (results && results.length > 0) {
          const topResult = results[0];
          const lat = parseFloat(topResult.lat);
          const lon = parseFloat(topResult.lon);
          const resolvedName = topResult.display_name;
          
          const newCoords = { lat, lng: lon };
          setCoords(newCoords);
          setAddress(resolvedName);
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lon], 13);
          }
          if (markerInstanceRef.current) {
            markerInstanceRef.current.setLatLng([lat, lon]);
          }
        } else {
          alert('Could not find that location. Please try a different query.');
        }
      } else {
        throw new Error('Nominatim returned non-OK status');
      }
    } catch (err) {
      console.warn('OSM Nominatim Search failed.', err);
      alert('Failed to contact location database. Check your connection.');
    } finally {
      setIsSearching(false);
    }
  };

  // 3. Initialize Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;

    const L = window.L;

    // Instantiate map object
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([coords.lat, coords.lng], 13);
    mapInstanceRef.current = map;

    // Setup custom div icon to avoid network requests & support offline mode beautifully
    const markerIcon = L.divIcon({
      className: 'div-map-pin',
      html: `<div class="relative flex items-center justify-center w-8 h-8">
               <div class="absolute w-8 h-8 bg-yellow-400/30 rounded-full animate-ping border border-yellow-500"></div>
               <div class="absolute w-5 h-5 bg-[#1a1a1a] border-2 border-yellow-400 rounded-full flex items-center justify-center shadow-md">
                 <div class="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
               </div>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Create marker
    const marker = L.marker([coords.lat, coords.lng], {
      draggable: true,
      icon: markerIcon
    }).addTo(map);
    markerInstanceRef.current = marker;

    // Initial Geocode on mount
    reverseGeocode(coords.lat, coords.lng);

    // Marker Dragend event
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      const newCoords = { lat: position.lat, lng: position.lng };
      setCoords(newCoords);
      reverseGeocode(position.lat, position.lng);
    });

    // Map click event (moves marker and geocodes)
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      const newCoords = { lat, lng };
      setCoords(newCoords);
      reverseGeocode(lat, lng);
    });

    // Clean up map instance on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      map.remove();
    };
  }, [leafletLoaded]);

  // Reactive Map Tile layer toggle based on online/offline status
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;

    if (isOnline) {
      if (!tileLayerInstanceRef.current) {
        tileLayerInstanceRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
      }
      tileLayerInstanceRef.current.addTo(mapInstanceRef.current);
    } else {
      if (tileLayerInstanceRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerInstanceRef.current);
      }
    }
  }, [isOnline, leafletLoaded]);

  const handleBookingSubmit = () => {
    if (loadingAddress) {
      alert('Resolving location address, please wait a moment...');
      return;
    }
    if (onConfirmBooking) {
      onConfirmBooking({
        address,
        latitude: coords.lat,
        longitude: coords.lng
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 font-mono text-[#1a1a1a]">
      {/* City/Address Search Bar */}
      <div className="w-full bg-[#fcebb6] border-[3px] border-[#1a1a1a] p-4 rounded-2xl shadow-[4px_4px_0px_rgba(26,26,26,0.15)] flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex-1">
          <label htmlFor="search-address-input" className="text-[10px] uppercase font-black text-gray-500 block mb-1">
            Search City or Venue Address
          </label>
          <input 
            id="search-address-input"
            type="text"
            placeholder="e.g. Guntur, Bangalore, Connaught Place..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchSubmit();
              }
            }}
            className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold outline-none uppercase"
          />
        </div>
        <button
          type="button"
          onClick={handleSearchSubmit}
          disabled={isSearching}
          className="bg-yellow-200 hover:bg-yellow-300 border-2 border-black px-6 py-2.5 font-bold uppercase text-xs shadow-[2.5px_2.5px_0px_rgba(26,26,26,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)] transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
          <span>Search Location</span>
        </button>
      </div>

      {/* Map Container */}
      <div className="w-full relative h-[380px] bg-gray-100 border-[3px] border-[#1a1a1a] rounded-2xl overflow-hidden shadow-[4px_4px_0px_rgba(26,26,26,0.15)]">
        
        {/* Leaflet canvas div */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Offline Overlay */}
        {!isOnline && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-6 text-white font-mono gap-3 animate-fade-in">
            <span className="text-3xl animate-pulse">🌐</span>
            <span className="text-xs uppercase font-black tracking-wider text-yellow-300">Map Interface Offline</span>
            <span className="text-[10px] opacity-80 max-w-xs leading-relaxed">
              OpenStreetMap tile layers and search nodes require an internet connection to load.
            </span>
          </div>
        )}

        {/* Loading Overlay */}
        {!leafletLoaded && (
          <div className="absolute inset-0 bg-yellow-50/90 z-20 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a1a1a]" />
            <span className="text-xs uppercase font-black tracking-wider">Mounting OpenStreetMap Canvas...</span>
          </div>
        )}

        {/* ─── Modern SaaS Glassmorphism Card Overlay ─── */}
        {leafletLoaded && (
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-white dark:bg-[#1a1a2e]/95 backdrop-blur-md border-2 border-white/20 dark:border-white/10 p-4 rounded-xl shadow-xl flex flex-col gap-3 max-h-[140px] justify-between">
            <div className="flex items-start gap-2.5 min-h-0">
              <div className="bg-[#1a1a1a] dark:bg-yellow-400 text-white dark:text-black p-1.5 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-yellow-300 dark:text-black" />
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                <span className="text-[9px] uppercase font-black text-gray-500 dark:text-gray-300 block tracking-widest">
                  {loadingAddress ? 'Resolving street coordinates...' : 'Selected Venue Address'}
                </span>
                
                {loadingAddress ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Loader2 className="w-3 h-3 animate-spin text-purple-600 dark:text-purple-400" />
                    <span className="text-[10px] italic font-bold text-[#1a1a1a] dark:text-white">Nominatim Geocoder checking coordinates...</span>
                  </div>
                ) : (
                  <p className="text-[10px] font-black leading-tight mt-0.5 break-words text-[#1a1a1a] dark:text-white">
                    {address}
                  </p>
                )}

                {errorMsg && (
                  <span className="text-[8px] text-red-500 dark:text-red-400 font-bold block mt-1 uppercase">
                    ⚠ {errorMsg}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-2 shrink-0">
              <div className="text-left">
                <span className="text-[8px] uppercase font-black text-gray-400 dark:text-gray-300 block">Total cost</span>
                <span className="text-xs font-black text-[#1a1a1a] dark:text-white">₹{ticketPrice}</span>
              </div>

              <button
                onClick={handleBookingSubmit}
                disabled={loadingAddress}
                className={`
                  border-2 border-black dark:border-white/30 px-4 py-1.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5
                  ${loadingAddress 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-[#baffc9] dark:bg-[#22c55e] hover:bg-[#a3f0b2] dark:hover:bg-[#16a34a] text-[#1a1a1a] dark:text-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]'
                  }
                `}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Confirm & Book Ticket</span>
              </button>
            </div>
          </div>
        )}

      </div>
      
      <div className="text-[9px] opacity-60 uppercase font-black tracking-widest text-center mt-1">
        💡 Hint: Drag the blue marker pin or click anywhere on the map grid to update geocoding targets.
      </div>
    </div>
  );
};

export default InteractiveLocationPicker;
