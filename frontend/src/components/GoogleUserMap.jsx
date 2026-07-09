import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Compass, Loader2 } from 'lucide-react';

export const GoogleUserMap = ({ onLocationChange }) => {
  const [coords, setCoords] = useState({ lat: 12.9784, lng: 77.5960 }); // Default: Bangalore
  const [locationName, setLocationName] = useState('Bangalore, Karnataka');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // 1. Dynamically load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    if (!apiKey) {
      setErrorMsg('VITE_GOOGLE_MAPS_API_KEY environment variable is missing.');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => setErrorMsg('Failed to load Google Maps script. Check your API key.');
    document.head.appendChild(script);

    return () => {
      // Cleanup script script if unmounted
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [apiKey]);

  // 2. Initialize Map and Search Autocomplete Box
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Instantiate Google Map
    const map = new window.google.maps.Map(mapRef.current, {
      center: coords,
      zoom: 13,
      disableDefaultUI: false,
      styles: [
        // Custom Retro/Muted map styles matching the Neo-Brutalist layout
        { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e8e7' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#e0e0e0' }] }
      ]
    });
    mapInstanceRef.current = map;

    // Instantiate Marker
    const marker = new window.google.maps.Marker({
      position: coords,
      map: map,
      draggable: true,
      animation: window.google.maps.Animation.DROP
    });
    markerInstanceRef.current = marker;

    // Handle marker drag event to resolve new coordinate locations
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      const newCoords = { lat: position.lat(), lng: position.lng() };
      setCoords(newCoords);
      reverseGeocode(newCoords);
    });

    // Initialize Autocomplete search box
    if (searchInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current);
      autocomplete.bindTo('bounds', map);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          console.warn("Place search returned no location geometry.");
          return;
        }

        const newCoords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };

        setCoords(newCoords);
        map.setCenter(newCoords);
        map.setZoom(15);
        marker.setPosition(newCoords);
        
        const shortName = place.formatted_address || place.name;
        setLocationName(shortName);

        if (onLocationChange) {
          onLocationChange({
            latitude: newCoords.lat,
            longitude: newCoords.lng,
            name: shortName
          });
        }
      });
    }
  }, [mapLoaded]);

  // 3. Helper function: Reverse Geocode coordinates to area/city name
  const reverseGeocode = (latLngObj) => {
    if (!window.google || !window.google.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ location: latLngObj }, (results, status) => {
      if (status === 'OK' && results[0]) {
        // Extract exact neighborhood/suburb and city
        const addressComponents = results[0].address_components;
        let area = '';
        let city = '';

        for (const component of addressComponents) {
          if (component.types.includes('sublocality') || component.types.includes('neighborhood')) {
            area = component.long_name;
          }
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
        }

        const fallbackName = results[0].formatted_address.split(',').slice(0, 2).join(',').trim();
        const displayAddressName = area && city ? `${area}, ${city}` : fallbackName;
        
        setLocationName(displayAddressName);

        if (onLocationChange) {
          onLocationChange({
            latitude: latLngObj.lat,
            longitude: latLngObj.lng,
            name: displayAddressName
          });
        }
      } else {
        console.warn('Google maps reverse geocoding failed:', status);
      }
    });
  };

  // 4. Geolocation API query handler
  const grabLiveLocation = () => {
    setLoadingGPS(true);
    setErrorMsg('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          setCoords(newCoords);
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(newCoords);
            mapInstanceRef.current.setZoom(15);
          }
          if (markerInstanceRef.current) {
            markerInstanceRef.current.setPosition(newCoords);
          }

          reverseGeocode(newCoords);
          setLoadingGPS(false);
        },
        (error) => {
          console.warn('GPS query error, centering on default fallback coords.', error);
          setLoadingGPS(false);
          setErrorMsg(`GPS expired/denied (Code: ${error.code}). Using Bangalore fallback.`);
          
          // Default fallback coordinates: Bangalore
          const fallback = { lat: 12.9784, lng: 77.5960 };
          setCoords(fallback);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(fallback);
          }
          if (markerInstanceRef.current) {
            markerInstanceRef.current.setPosition(fallback);
          }
          reverseGeocode(fallback);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setLoadingGPS(false);
      setErrorMsg('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="w-full bg-[#fcebb6] border-[3px] border-[#1a1a1a] p-6 rounded-2xl shadow-[6px_6px_0px_rgba(26,26,26,1)] flex flex-col gap-4 font-mono text-[#1a1a1a]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-[#1a1a1a] pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-white border-2 border-black p-1.5 rounded-lg shadow-[2px_2px_0px_rgba(26,26,26,1)]">
            <MapPin className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase opacity-60 block">Resolved Map Location</span>
            <span className="text-xs font-black uppercase">{locationName}</span>
          </div>
        </div>

        <button
          onClick={grabLiveLocation}
          disabled={loadingGPS}
          className="bg-white hover:bg-yellow-100 border-[3px] border-black px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
        >
          {loadingGPS ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Compass className="w-4 h-4" />
          )}
          <span>{loadingGPS ? 'Checking GPS...' : 'Scan GPS'}</span>
        </button>
      </div>

      {/* Places Autocomplete Input Box */}
      <div className="w-full relative">
        <input
          ref={searchInputRef}
          id="google-places-autocomplete"
          name="placesSearch"
          type="text"
          placeholder="Search places or type area name (e.g. Visakhapatnam, Hyderabad...)"
          className="w-full bg-white border-[3px] border-black p-3.5 rounded-xl font-bold text-xs placeholder-black/45 shadow-[4px_4px_0px_rgba(26,26,26,1)] outline-none"
        />
      </div>

      {errorMsg && (
        <p className="text-[10px] font-bold text-red-600 uppercase border border-red-500 bg-red-50 px-2 py-1">
          ⚠ ERROR: {errorMsg}
        </p>
      )}

      {/* Map Canvas div */}
      <div 
        ref={mapRef} 
        className="w-full h-[280px] bg-white border-[3px] border-black rounded-xl shadow-[4px_4px_0px_rgba(26,26,26,0.15)] relative overflow-hidden"
      >
        {!mapLoaded && !errorMsg && (
          <div className="absolute inset-0 bg-yellow-50 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-[10px] font-black uppercase">Loading Google Maps engine...</span>
          </div>
        )}
      </div>
      
      <div className="text-[9px] opacity-60 uppercase font-black tracking-widest text-center mt-1">
        💡 Pro-Tip: You can drag the red marker pin anywhere on the map to manually set your location coordinates.
      </div>
    </div>
  );
};

export default GoogleUserMap;
