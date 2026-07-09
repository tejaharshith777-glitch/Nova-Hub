import React from 'react';
import { MapPin, Trophy } from 'lucide-react';

// Projection formulas to map lat/lon coordinates to SVG pixels (400x450 canvas)
const mapLonToX = (lon) => {
  const minLon = 68.0;
  const maxLon = 98.0;
  return ((lon - minLon) / (maxLon - minLon)) * 340 + 30; // x range [30, 370]
};

const mapLatToY = (lat) => {
  const minLat = 6.0;
  const maxLat = 38.0;
  // Invert y because SVG 0 is at the top
  return 420 - ((lat - minLat) / (maxLat - minLat)) * 390; // y range [30, 420]
};

export const EventMap = ({ physicalTournaments = [], activeCoords = {}, onSelectCity }) => {
  // Pre-defined test cities and coordinates
  const cities = [
    { name: 'Delhi', lat: 28.6139, lon: 77.2090, bg: '#ffb3ba' },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777, bg: '#cffafe' },
    { name: 'Bangalore', lat: 12.9784, lon: 77.5960, bg: '#baffc9' },
    { name: 'Guntur', lat: 16.3067, lon: 80.4365, bg: '#ffdfba' }
  ];

  const currentLat = activeCoords?.latitude;
  const currentLon = activeCoords?.longitude;

  return (
    <div className="w-full bg-[#fcebb6] border-[3px] border-[#1a1a1a] p-6 rounded-2xl shadow-[6px_6px_0px_rgba(26,26,26,1)] flex flex-col md:flex-row gap-6">
      
      {/* Map Section */}
      <div className="flex-1 bg-white border-[3px] border-[#1a1a1a] rounded-xl p-4 relative overflow-hidden h-[360px] flex items-center justify-center shadow-[4px_4px_0px_rgba(26,26,26,0.15)] select-none">
        
        {/* Retro Coordinate Overlay Grid */}
        <div className="absolute inset-0 carbon-grid opacity-30 pointer-events-none" />

        {/* Compass Sticker decoration */}
        <div className="absolute bottom-4 left-4 bg-yellow-100 border-2 border-black p-2 text-[9px] font-black uppercase shadow-[2px_2px_0px_rgba(26,26,26,1)] rotate-3 hidden sm:block">
          📍 ARENA RADAR ACTIVE
        </div>

        <svg viewBox="0 0 400 450" className="w-full h-full max-h-[340px] relative z-10">
          {/* Abstract background polygon of India contour for contextual layout */}
          <polygon
            points="180,30 200,20 230,50 250,90 280,100 300,120 340,160 360,200 330,220 300,240 270,260 250,280 230,300 210,320 200,340 185,380 180,410 178,430 170,410 160,380 150,340 140,310 120,290 100,280 75,270 82,240 90,220 70,210 65,190 85,170 110,185 130,190 140,170 150,140 160,110 165,80 175,50"
            fill="#f3f4f6"
            stroke="#1a1a1a"
            strokeWidth="3"
            strokeDasharray="4 4"
          />

          {/* Lines connecting user location to nearby physical events */}
          {currentLat && currentLon && physicalTournaments.map((t, idx) => {
            if (!t.venueDetails?.latitude) return null;
            const startX = mapLonToX(currentLon);
            const startY = mapLatToY(currentLat);
            const endX = mapLonToX(t.venueDetails.longitude);
            const endY = mapLatToY(t.venueDetails.latitude);

            return (
              <line
                key={idx}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeDasharray="3 3"
                className="animate-pulse"
              />
            );
          })}

          {/* User Location Radar ring animation */}
          {currentLat && currentLon && (
            <g>
              <circle
                cx={mapLonToX(currentLon)}
                cy={mapLatToY(currentLat)}
                r="18"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                className="animate-ping origin-center"
              />
              <circle
                cx={mapLonToX(currentLon)}
                cy={mapLatToY(currentLat)}
                r="6"
                fill="#ef4444"
                stroke="#1a1a1a"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Render Active Physical Tournament Pins */}
          {physicalTournaments.map((t, idx) => {
            if (!t.venueDetails?.latitude) return null;
            const x = mapLonToX(t.venueDetails.longitude);
            const y = mapLatToY(t.venueDetails.latitude);

            return (
              <g 
                key={t._id || idx} 
                className="cursor-pointer group"
                onClick={() => onSelectCity(t.venueDetails.physicalAddress.includes('Mumbai') ? 'Mumbai' : t.venueDetails.physicalAddress.includes('Delhi') ? 'Delhi' : 'Bangalore')}
              >
                <circle
                  cx={x}
                  cy={y}
                  r="9"
                  fill="#fbbf24"
                  stroke="#1a1a1a"
                  strokeWidth="2.5"
                  className="group-hover:scale-125 transition-transform"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#ef4444"
                />
                {/* Tooltip on pin hover */}
                <rect
                  x={x - 45}
                  y={y - 30}
                  width="90"
                  height="16"
                  fill="#1a1a1a"
                  rx="3"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <text
                  x={x}
                  y={y - 18}
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="opacity-0 group-hover:opacity-100 transition-opacity font-mono uppercase"
                >
                  {t.gameName}: {t.title.slice(0, 10)}...
                </text>
              </g>
            );
          })}

          {/* Render Major Hub Pins */}
          {cities.map((city) => {
            const x = mapLonToX(city.lon);
            const y = mapLatToY(city.lat);
            const isActive = Math.abs(currentLat - city.lat) < 0.1 && Math.abs(currentLon - city.lon) < 0.1;

            return (
              <g 
                key={city.name} 
                className="cursor-pointer" 
                onClick={() => onSelectCity(city.name)}
              >
                <rect
                  x={x - 22}
                  y={y - 12}
                  width="44"
                  height="16"
                  fill={isActive ? '#1a1a1a' : 'white'}
                  stroke="#1a1a1a"
                  strokeWidth="2"
                  className="hover:scale-105 transition-transform"
                />
                <text
                  x={x}
                  y={y}
                  fill={isActive ? 'white' : '#1a1a1a'}
                  fontSize="7"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-mono uppercase select-none"
                >
                  {city.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Info Sidebar Section */}
      <div className="w-full md:w-[260px] flex flex-col justify-between gap-4 font-mono text-[#1a1a1a]">
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase opacity-65 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" /> Active Local Arenas
          </span>
          <h3 className="text-xl font-black uppercase leading-tight">
            Interactive Match Radar
          </h3>
          <p className="text-xs leading-relaxed opacity-85">
            Click on major hubs (Bangalore, Mumbai, Delhi) or hovering match dots on the vector grid to filter matches in your proximity area instantly.
          </p>
        </div>

        <div className="bg-white border-[3px] border-[#1a1a1a] p-4 shadow-[4px_4px_0px_rgba(26,26,26,1)] rounded-xl space-y-2.5">
          <div className="text-[10px] font-black uppercase opacity-60">Near Match Pins:</div>
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
            {physicalTournaments.slice(0, 3).map((t, idx) => (
              <div 
                key={t._id || idx} 
                className="text-[10px] font-bold border-b border-[#1a1a1a]/10 pb-1 flex justify-between gap-2 uppercase"
              >
                <span className="truncate flex-1">● {t.title}</span>
                <span className="text-red-500 whitespace-nowrap">
                  {t.distance !== null ? `${t.distance.toFixed(0)}km` : 'TBD'}
                </span>
              </div>
            ))}
            {physicalTournaments.length === 0 && (
              <div className="text-[10px] font-bold text-center opacity-50 py-3 uppercase">
                No physical matches nearby
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default EventMap;
