import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Zap, MapPin, Calendar, Clock, Award, Users, 
  Crosshair, Sparkles, Monitor, Activity, CheckCircle2, ChevronRight, X 
} from 'lucide-react';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// 3D Procedural Trophy Component (WebGL)
const GlowingTrophy = () => {
  const groupRef = useRef(null);

  // Define the coordinates of the 5 main city nodes (relative to base)
  // Bengaluru, Mumbai, Delhi, Kolkata, Guntur
  const nodes = [
    { name: 'BENGALURU_HUB-HQ', status: '[CONFIRMED]', color: '#22c55e', pos: [-2.0, 0.4, -1.8], height: 2.2, active: true },
    { name: 'GUNTUR_BATTLE_TURF', status: 'SYNCED', color: '#22c55e', pos: [0.8, -0.1, 1.2], height: 1.7, active: true },
    { name: 'DELHI_NODE-NORTH', status: '[VALIDATING]', color: '#06b6d4', pos: [1.2, 0.6, -2.4], height: 2.8, active: true },
    { name: 'MUMBAI', status: '', color: '#a855f7', pos: [-2.6, 0.2, 0.8], height: 2.1, active: false },
    { name: 'KOLKATA', status: '', color: '#ec4899', pos: [2.4, 0.1, -0.4], height: 1.9, active: false }
  ];

  // We can also generate a set of minor filler server blocks to make it look like a dense data grid
  const fillerTowers = [];
  // Use a pseudo-random seed to generate consistent coordinates
  let seed = 42;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // Generate around 25 filler columns
  for (let i = 0; i < 25; i++) {
    const x = (random() * 8) - 4;
    const z = (random() * 8) - 4;
    
    // Ensure they don't overlap too closely with the main nodes
    let tooClose = false;
    for (const node of nodes) {
      const dx = x - node.pos[0];
      const dz = z - node.pos[2];
      if (Math.sqrt(dx*dx + dz*dz) < 1.0) {
        tooClose = true;
        break;
      }
    }
    
    if (!tooClose) {
      fillerTowers.push({
        id: i,
        pos: [x, (random() * 0.8) - 0.4, z],
        height: random() * 1.5 + 0.4,
        scaleY: random() * 0.4 + 0.8
      });
    }
  }

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Tilt the grid slightly and rotate slowly
      groupRef.current.rotation.y = time * 0.05;
      
      // Tilt based on scroll progress
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? scrollY / docHeight : 0;

      // Adjust scale and position based on scroll just like previous code
      const targetScale = Math.max(0.45, 1.2 - scrollProgress * 0.7);
      groupRef.current.scale.set(targetScale, targetScale, targetScale);

      // Shifting position on screen
      groupRef.current.position.x = -scrollProgress * 3.5;
      groupRef.current.position.y = -0.3 - scrollProgress * 1.2;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.4, 0, 0]}>
      {/* 1. COORDINATE GRID FLOOR */}
      <gridHelper args={[12, 16, '#06b6d4', '#111122']} position={[0, -1.2, 0]} opacity={0.25} transparent />

      {/* 2. GLOWING NETWORKING DATA LINES */}
      {/* Line between Bengaluru and Guntur */}
      <mesh position={[-0.6, -1.18, -0.3]} rotation={[0, -Math.atan2(3.0, 2.8), 0]}>
        <boxGeometry args={[Math.sqrt(2.8*2.8 + 3.0*3.0), 0.015, 0.015]} />
        <meshBasicMaterial color="#22c55e" opacity={0.6} transparent />
      </mesh>
      {/* Line between Delhi and Guntur */}
      <mesh position={[1.0, -1.18, -0.6]} rotation={[0, -Math.atan2(-3.6, -0.4), 0]}>
        <boxGeometry args={[Math.sqrt(0.4*0.4 + 3.6*3.6), 0.015, 0.015]} />
        <meshBasicMaterial color="#06b6d4" opacity={0.5} transparent />
      </mesh>
      {/* Line between Mumbai and Bengaluru */}
      <mesh position={[-2.3, -1.18, -0.5]} rotation={[0, -Math.atan2(-2.6, 0.6), 0]}>
        <boxGeometry args={[Math.sqrt(0.6*0.6 + 2.6*2.6), 0.015, 0.015]} />
        <meshBasicMaterial color="#a855f7" opacity={0.4} transparent />
      </mesh>
      {/* Line between Kolkata and Delhi */}
      <mesh position={[1.8, -1.18, -1.4]} rotation={[0, -Math.atan2(2.0, 1.2), 0]}>
        <boxGeometry args={[Math.sqrt(1.2*1.2 + 2.0*2.0), 0.015, 0.015]} />
        <meshBasicMaterial color="#ec4899" opacity={0.4} transparent />
      </mesh>

      {/* 3. GENERATE MAJOR NODE TOWERS */}
      {nodes.map((node, index) => {
        const x = node.pos[0];
        const yBase = -1.2;
        const h = node.height;
        const z = node.pos[2];

        return (
          <group key={index} position={[x, yBase + h / 2, z]}>
            {/* Outer Tower Chassis */}
            <mesh>
              <boxGeometry args={[0.42, h, 0.42]} />
              <meshPhysicalMaterial 
                color="#090d16"
                roughness={0.2}
                metalness={0.9}
                transparent
                opacity={0.7}
                clearcoat={1.0}
              />
            </mesh>

            {/* Glowing Emissive Inner Core (Cylinder) */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, h - 0.1, 16]} />
              <meshPhysicalMaterial 
                color={node.color}
                emissive={node.color}
                emissiveIntensity={1.8}
                transparent
                opacity={0.8}
              />
            </mesh>

            {/* Glowing Emissive Indicator Bead on Top */}
            <mesh position={[0, h / 2 + 0.06, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color={node.color} />
            </mesh>

            {/* Drei HTML floating HUD Node tag */}
            <Html 
              position={[0, h / 2 + 0.35, 0]} 
              distanceFactor={8}
              center
            >
              <div 
                className={`font-mono text-[8px] md:text-[9px] px-2 py-0.5 rounded border whitespace-nowrap uppercase tracking-widest font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300 ${
                  node.color === '#22c55e'
                    ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-400'
                    : node.color === '#06b6d4'
                    ? 'bg-cyan-950/90 border-cyan-500/40 text-cyan-400'
                    : node.color === '#a855f7'
                    ? 'bg-purple-950/90 border-purple-500/40 text-purple-400'
                    : 'bg-pink-950/90 border-pink-500/40 text-pink-400'
                }`}
              >
                {node.active && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      node.color === '#22c55e' ? 'bg-emerald-400' : 'bg-cyan-400'
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                      node.color === '#22c55e' ? 'bg-emerald-500' : 'bg-cyan-500'
                    }`}></span>
                  </span>
                )}
                <span>
                  {node.name === 'MUMBAI' || node.name === 'KOLKATA' ? (
                    node.name
                  ) : (
                    <>
                      {node.name.split('_')[0]} <span className="opacity-60">{node.status}</span>
                    </>
                  )}
                </span>
              </div>
            </Html>
          </group>
        );
      })}

      {/* 4. GENERATE MINOR SERVER BLOCKS (Grid filler) */}
      {fillerTowers.map((tower) => {
        const x = tower.pos[0];
        const yBase = -1.2;
        const h = tower.height;
        const z = tower.pos[2];

        return (
          <group key={tower.id} position={[x, yBase + h / 2, z]}>
            <mesh>
              <boxGeometry args={[0.22, h, 0.22]} />
              <meshPhysicalMaterial 
                color="#061c2a"
                roughness={0.4}
                metalness={0.8}
                transparent
                opacity={0.5}
              />
            </mesh>
            <mesh position={[0, h / 2 + 0.02, 0]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color="#00f0ff" opacity={0.6} transparent />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const CITIES_DATA = {
  bengaluru: {
    name: "NOVA HUB // BENGALURU ALPHA",
    address: "6th Floor, Cyber Corridor Tower, Indira Nagar, Bengaluru - 560038",
    specs: "60x RTX 4080 Super Rigs, Intel i9-14900K, 360Hz BenQ Zowie Monitors, 10Gbps Dedicated Fiber Loop",
    slots: "24/32 Teams Checked-in",
    coords: [12.9716, 77.5946],
    status: "Registration Phase 1: OPEN",
    latency: "1.2 ms"
  },
  mumbai: {
    name: "NOVA HUB // MUMBAI NEXUS",
    address: "Nodal Plaza, Bandra Kurla Complex, Mumbai - 400051",
    specs: "80x RTX 4090 Rigs, AMD Ryzen 9 7950X3D, 540Hz ASUS ROG Panels, Low-Latency Local CDN Node",
    slots: "18/32 Teams Checked-in",
    coords: [19.0760, 72.8777],
    status: "Registration Phase 1: OPEN",
    latency: "0.8 ms"
  },
  delhi: {
    name: "NOVA HUB // DELHI NODAL",
    address: "Plot 12, Sector 62, Cyber City, Noida, Delhi NCR - 201301",
    specs: "50x RTX 4080 Super Rigs, Intel i9-14900K, 360Hz Monitors, LAN Server Rack Hub",
    slots: "31/32 Teams Checked-in",
    coords: [28.6139, 77.2090],
    status: "CRITICAL CAPACITY: 1 SLOT LEFT",
    latency: "1.5 ms"
  },
  hyderabad: {
    name: "NOVA HUB // HYDERABAD CYBER",
    address: "Apex Wing, Tech Park, Hitec City, Hyderabad - 500081",
    specs: "45x RTX 4080 Rigs, AMD Ryzen 7 7800X3D, 360Hz Monitors, Zero-Ping Local Switch Matrix",
    slots: "12/32 Teams Checked-in",
    coords: [17.3850, 78.4867],
    status: "Registration Phase 1: OPEN",
    latency: "1.1 ms"
  },
  chennai: {
    name: "NOVA HUB // CHENNAI MATRIX",
    address: "Tower 2, OMR Tech Corridor, Chennai - 600119",
    specs: "40x RTX 4070 Ti Rigs, Intel i7-14700K, 240Hz Monitors, Direct ISP Fiber Peer Link",
    slots: "8/32 Teams Checked-in",
    coords: [13.0827, 80.2707],
    status: "Registration Phase 1: OPEN",
    latency: "1.4 ms"
  },
  pune: {
    name: "NOVA HUB // PUNE NODE",
    address: "Tech Boulevard, Hinjawadi Phase 1, Pune - 411057",
    specs: "50x RTX 4080 Rigs, Intel i9-13900K, 360Hz Monitors, Local Match-Making CDN",
    slots: "15/32 Teams Checked-in",
    coords: [18.5204, 73.8567],
    status: "Registration Phase 1: OPEN",
    latency: "1.3 ms"
  },
  kolkata: {
    name: "NOVA HUB // KOLKATA VOID",
    address: "Infinity Zone, Salt Lake Sector V, Kolkata - 700091",
    specs: "40x RTX 4080 Rigs, Intel i9-13900K, 360Hz Monitors, Zero-Ping Matchmaking Lobby",
    slots: "9/32 Teams Checked-in",
    coords: [22.5726, 88.3639],
    status: "Registration Phase 1: OPEN",
    latency: "1.9 ms"
  }
};

export const PremiumShowdown = () => {
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const magneticButtonRef = useRef(null);
  const horizontalScrollRef = useRef(null);
  const sectionPinRef = useRef(null);
  const dashboardSectionRef = useRef(null);

  // Selector states
  const [selectedCity, setSelectedCity] = useState('bengaluru');
  const [map, setMap] = useState(null);
  const markerRef = useRef(null);

  // Registration Modal States
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regStep, setRegStep] = useState(1);
  const [teamName, setTeamName] = useState('');
  const [clanTag, setClanTag] = useState('');
  const [captainId, setCaptainId] = useState('');
  const [captainEmail, setCaptainEmail] = useState('');
  const [roster, setRoster] = useState(['', '', '', '', '']);
  const [regPassToken, setRegPassToken] = useState('');

  // Match Hover Dimming Interaction State
  const [hoveredMatchId, setHoveredMatchId] = useState(null);

  // 1. Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // 2. Fade in Dashboard on scroll (GSAP)
  useEffect(() => {
    const dashboard = dashboardSectionRef.current;
    if (!dashboard) return;

    const anim = gsap.fromTo(dashboard, 
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: dashboard,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        }
      }
    );

    return () => {
      anim.scrollTrigger?.kill();
    };
  }, []);



  // 3. Live Bracket Horizontal Scroll Pinning (GSAP)
  useEffect(() => {
    const pinSection = sectionPinRef.current;
    const scrollContainer = horizontalScrollRef.current;

    if (!pinSection || !scrollContainer) return;

    // Calculate total horizontal scroll width minus viewport width
    const getScrollWidth = () => scrollContainer.scrollWidth - window.innerWidth;
    
    // Pin section and translate scroll container horizontally on vertical scroll
    const pinAnimation = gsap.to(scrollContainer, {
      x: () => -getScrollWidth(),
      ease: 'none',
      scrollTrigger: {
        trigger: pinSection,
        pin: true,
        scrub: 1.2,
        start: 'top top',
        end: () => `+=${getScrollWidth()}`,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      pinAnimation.scrollTrigger?.kill();
    };
  }, []);



  // 5. Leaflet Dark Mode Map Setup
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstance.current) {
      const initialLocation = CITIES_DATA[selectedCity].coords;
      
      const m = L.map(mapContainerRef.current, {
        center: initialLocation,
        zoom: 14,
        zoomControl: false,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(m);

      L.control.zoom({ position: 'bottomright' }).addTo(m);

      mapInstance.current = m;
      setMap(m);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        setMap(null);
      }
    };
  }, []);

  // 6. Reactive Map Pan & Marker update on city change
  useEffect(() => {
    if (!map) return;
    const cityData = CITIES_DATA[selectedCity];
    if (!cityData) return;

    const loc = cityData.coords;
    map.setView(loc, 14);

    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    const neonIcon = L.divIcon({
      className: 'div-neon-pin',
      html: `<div class="relative flex items-center justify-center w-10 h-10">
               <div class="absolute w-10 h-10 bg-cyan-500/20 rounded-full animate-ping border border-cyan-400"></div>
               <div class="absolute w-6 h-6 bg-cyan-400/30 rounded-full border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_15px_#00f0ff]">
                 <div class="w-2.5 h-2.5 bg-cyan-300 rounded-full shadow-[0_0_5px_#00f0ff]"></div>
               </div>
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const marker = L.marker(loc, { icon: neonIcon })
      .addTo(map)
      .bindPopup(`
        <div class="bg-slate-950 text-white font-mono p-3 rounded-xl border border-cyan-500/30 text-xs w-48">
          <h4 class="font-bold text-cyan-400 flex items-center gap-1">⚡ ${cityData.name}</h4>
          <p class="text-[10px] text-gray-400 mt-1">${cityData.address}</p>
          <p class="text-[9px] text-purple-400 font-bold mt-1">Operational Matrix Gate</p>
        </div>
      `)
      .openPopup();

    markerRef.current = marker;
  }, [selectedCity, map]);

  // Bracket Mock Data
  const bracketData = {
    quarter: [
      { id: 'q1', t1: 'Entity Esports', t2: 'Alpha Rangers', s1: 2, s2: 0, status: 'completed' },
      { id: 'q2', t1: 'Cyber Pirates', t2: 'Neon Glitch', s1: 1, s2: 2, status: 'completed' },
      { id: 'q3', t1: 'Veloce Force', t2: 'Hydra Shock', s1: 0, s2: 2, status: 'completed' },
      { id: 'q4', t1: 'Zero Gravity', t2: 'Outlaw Gaming', s1: 2, s2: 1, status: 'completed' },
    ],
    semi: [
      { id: 's1', t1: 'Entity Esports', t2: 'Neon Glitch', s1: 1, s2: 2, status: 'completed' },
      { id: 's2', t1: 'Hydra Shock', t2: 'Zero Gravity', s1: 0, s2: 0, status: 'live' },
    ],
    final: [
      { id: 'f1', t1: 'Neon Glitch', t2: 'TBD (Winner SF2)', s1: 0, s2: 0, status: 'scheduled' }
    ]
  };

  return (
    <div className="bg-[#040408] text-white font-mono overflow-x-hidden min-h-screen relative selection:bg-cyan-500 selection:text-black">
      {/* 3D WebGL Background Canvas */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <ambientLight intensity={0.15} />
          <directionalLight position={[2, 4, 3]} intensity={1.5} color="#00f0ff" />
          <directionalLight position={[-2, -4, -3]} intensity={1.0} color="#d900ff" />
          <pointLight position={[0, 0, 2]} intensity={2.0} color="#00f0ff" distance={8} />
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <GlowingTrophy />
          </Float>
        </Canvas>
      </div>

      {/* Cyber Overlay Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10 bg-[linear-gradient(rgba(18,18,30,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,30,0.5)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* SECTION 1: SYSTEM CALIBRATION GATE (Center 3D Trophy Showcase) */}
      <section className="relative z-10 min-h-[90vh] flex flex-col items-center justify-center text-center px-6">
        {/* target HUD brackets */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[600px] h-[300px] border-l border-t border-cyan-500/20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[600px] h-[300px] border-r border-b border-purple-500/20 pointer-events-none" />

        {/* Left Side HUD widgets */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 w-64 hidden lg:flex flex-col gap-6 text-left font-mono z-20 pointer-events-none">
          <div className="bg-slate-950/75 backdrop-blur-md border border-cyan-500/20 p-4 rounded-xl space-y-3 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="text-[9px] font-bold uppercase tracking-widest text-cyan-400 border-b border-cyan-500/20 pb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              Global Hub Validation
            </div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">
              Protocol: <span className="text-green-400">Active</span>
            </div>
            
            {/* Sparkline Charts */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="border border-cyan-500/10 p-1.5 rounded bg-cyan-950/20">
                <div className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mb-1">Latency</div>
                <svg className="w-full h-8 stroke-cyan-400 stroke-[1.5] fill-none">
                  <path d="M0 25 L8 22 L16 28 L24 15 L32 20 L40 10 L48 24 L56 12 L64 22 L72 15 L80 18" />
                </svg>
              </div>
              <div className="border border-purple-500/10 p-1.5 rounded bg-purple-950/20">
                <div className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mb-1">Sync Load</div>
                <svg className="w-full h-8 stroke-purple-400 stroke-[1.5] fill-none">
                  <path d="M0 10 L8 15 L16 12 L24 25 L32 18 L40 28 L48 15 L56 22 L64 12 L72 26 L80 15" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/75 backdrop-blur-md border border-cyan-500/20 p-4 rounded-xl space-y-2 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="text-[9px] text-cyan-400 uppercase tracking-widest font-bold">
              Route: Bengaluru → Guntur
            </div>
            <div className="text-[11px] font-black text-white flex items-center gap-2">
              <span className="text-[8px] px-1 py-0.5 bg-green-500/10 border border-green-500/25 text-green-400 rounded font-bold">Ping</span>
              1.2 ms
            </div>
            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider pt-1 border-t border-white/5">
              Regional Traffic: <span className="text-cyan-400">Active</span>
            </div>
          </div>
        </div>

        {/* Right Side HUD widgets */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-64 hidden lg:flex flex-col gap-6 text-left font-mono z-20 pointer-events-none">
          <div className="bg-slate-950/75 backdrop-blur-md border border-cyan-500/20 p-4 rounded-xl space-y-3 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="text-[9px] font-bold uppercase tracking-widest text-cyan-400 border-b border-cyan-500/20 pb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              Global Hub Validation
            </div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">
              Protocol: <span className="text-green-400 font-bold">Active</span>
            </div>
            <div className="text-[10px] font-bold text-gray-400">
              Active Teams: <span className="text-white font-black text-xs">128/128</span>
            </div>
            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider pt-1.5 border-t border-white/5">
              Grid Sync Health: <span className="text-green-400 font-black">Optimal</span>
            </div>
          </div>
        </div>

        {/* Center Main Text Typography Block */}
        <div className="relative z-10 space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 border border-cyan-500/30 px-4 py-1.5 rounded-full bg-cyan-950/20 backdrop-blur-md text-[9px] tracking-[0.3em] text-cyan-400 font-bold uppercase animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> WebGL Node Link Status: Standby
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white font-display">
            NOVA NATIONAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">GRID</span>
          </h1>

          <p className="text-gray-400 text-xs md:text-sm font-mono tracking-wider max-w-2xl mx-auto uppercase">
            Initialize national validation sequence. Syncing offline national nodal corridors and regional server metrics.
          </p>

          {/* Scroll Down Indicator */}
          <div className="pt-16 flex flex-col items-center justify-center gap-2">
            <span className="text-[9px] font-bold text-cyan-450 uppercase tracking-[0.25em] animate-pulse">
              Scroll to Engage National Tournament Network
            </span>
            <div className="w-6 h-10 border-2 border-cyan-500/30 rounded-full p-1 flex justify-center">
              <div className="w-1.5 h-2.5 bg-cyan-400 rounded-full animate-[bounce_1.5s_infinite]" />
            </div>
          </div>
        </div>

        {/* Bottom Coordinates & status bar */}
        <div className="absolute bottom-8 left-8 right-8 hidden md:flex items-center justify-between font-mono text-[9px] text-cyan-400/70 z-20 pointer-events-none">
          <div className="bg-slate-950/75 backdrop-blur-md border border-cyan-500/20 px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            <span className="text-white font-bold uppercase">Regional Coordination [Guntur]: Established</span>
          </div>

          <div className="bg-slate-955/75 backdrop-blur-md border border-cyan-500/20 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <span className="uppercase text-gray-400 font-bold">Sync Progress:</span>
            <span className="text-green-400 font-bold tracking-tight">|||||||||||||||||||||| 100%</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: INTERACTIVE LAN DASHBOARD (Fades in on Scroll) */}
      <section ref={dashboardSectionRef} className="relative z-10 min-h-screen py-16 px-6 md:px-12 lg:px-20 flex flex-col justify-start">
        
        {/* Title / Subtitle Block */}
        <div className="max-w-7xl mx-auto w-full mb-8 text-left">
          <div className="inline-flex items-center gap-2 border border-cyan-500/30 px-4 py-1.5 rounded-full bg-cyan-950/20 backdrop-blur-md mb-4 text-[10px] tracking-[0.25em] text-cyan-400 font-bold uppercase shadow-[0_0_15px_rgba(0,240,255,0.15)]">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            NOVA NODE MATRIX // INDIA LAN QUALIFIERS
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-display uppercase tracking-tight leading-none text-white">
            NOVA HUB <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">OFFLINE NETWORK</span>
          </h1>
          
          <p className="text-gray-400 text-xs md:text-sm font-mono mt-3 max-w-4xl leading-relaxed uppercase tracking-wider">
            Zero-latency physical validation corridors across India. Find your nearest battle node, pre-verify your clan roster, and complete physical check-in.
          </p>
        </div>

        {/* Dashboard Split-Screen Grid */}
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          
          {/* Left panel (City Selector & Hub Info) */}
          <div className="lg:col-span-7 flex flex-col gap-6 bg-slate-950/40 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            
            {/* City Selection Bar */}
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 block mb-3">
                Select Nearest Battle Node:
              </span>
              <div className="flex flex-wrap gap-2.5">
                {Object.keys(CITIES_DATA).map((key) => {
                  const active = selectedCity === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCity(key)}
                      className={`px-4 py-2.5 font-mono font-bold text-[10px] uppercase rounded-xl border transition-all duration-200 ${
                        active 
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-450/80 shadow-[0_0_15px_rgba(0,240,255,0.25)]' 
                          : 'bg-white/[0.02] text-gray-400 border-white/5 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {key === 'delhi' ? 'Delhi NCR' : key}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hub Details Panel */}
            <div className="flex-1 flex flex-col justify-between border-t border-white/10 pt-6 gap-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCity}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl md:text-2xl font-black uppercase text-white flex items-center gap-2">
                      <span className="text-cyan-400">⚡</span> {CITIES_DATA[selectedCity].name}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mt-1 uppercase tracking-wide">
                      {CITIES_DATA[selectedCity].address}
                    </p>
                  </div>

                  {/* Operational Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl flex flex-col gap-1">
                      <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Operational Phase</span>
                      <span className="text-xs font-bold text-white uppercase">{CITIES_DATA[selectedCity].status}</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl flex flex-col gap-1">
                      <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Node Ping Latency</span>
                      <span className="text-xs font-black text-green-400">{CITIES_DATA[selectedCity].latency}</span>
                    </div>
                  </div>

                  {/* Hardware Configuration Specifications */}
                  <div className="bg-white/[0.02] border border-white/[0.06] p-5 rounded-2xl space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5" /> Hardware Configurations Available
                    </h4>
                    <p className="text-xs text-gray-300 font-mono uppercase leading-relaxed">
                      {CITIES_DATA[selectedCity].specs}
                    </p>
                  </div>

                  {/* Slot availability counter */}
                  <div className="flex items-center justify-between bg-purple-950/10 border border-purple-500/20 p-4 rounded-xl">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Slot Registrations:</span>
                    <span className="text-sm font-black text-purple-400 font-mono uppercase">{CITIES_DATA[selectedCity].slots}</span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Action buttons */}
              <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    setRegStep(1);
                    setIsRegModalOpen(true);
                  }}
                  className="flex-1 py-4 bg-cyan-400 hover:bg-white text-black font-black uppercase text-xs tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all cursor-pointer rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Crosshair className="w-4 h-4" /> Official Hub Registration
                </button>
                <button
                  onClick={() => {
                    document.getElementById('live-bracket-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-xs tracking-wider border border-white/10 transition-all rounded-xl"
                >
                  View Active Brackets
                </button>
              </div>
            </div>

          </div>

          {/* Right panel (Interactive Leaflet Map) */}
          <div className="lg:col-span-5 flex flex-col p-3 bg-slate-950/40 backdrop-blur-md border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div 
              ref={mapContainerRef} 
              className="flex-1 min-h-[350px] w-full rounded-2xl border border-white/10 overflow-hidden relative z-10"
              style={{ background: '#0a0a14' }}
            />
          </div>

        </div>

      </section>

      {/* HOW TO JOIN & EVENT ROADMAP SECTION */}
      <section className="relative z-10 py-24 px-6 md:px-24 bg-black/40 backdrop-blur-sm border-t border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left: How to Join */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div>
                <span className="text-[10px] tracking-[0.3em] uppercase text-cyan-400 font-bold block mb-1">★ Registration protocol</span>
                <h2 className="text-3xl md:text-4xl font-black uppercase text-white">HOW TO JOIN</h2>
              </div>
              <p className="text-gray-400 text-xs md:text-sm font-mono leading-relaxed">
                Follow the four-step physical coordination checklist to verify check-in status, register active rosters, and unlock tournament lobby slots.
              </p>
              
              <div className="flex flex-col gap-4 mt-2">
                {[
                  { step: '01', title: 'SUBMIT CAPTAIN SPEC', desc: 'Captain registers team name and primary communication email coordinates.' },
                  { step: '02', title: 'ROSTER SUBMISSION', desc: 'Input roster arrays (3-5 active players per squad) for anti-cheat verification.' },
                  { step: '03', title: 'COMPLETE GROUND CHECK-IN', desc: 'Arrive at the Bangalore Stadium LAN desk to scan player passes.' },
                  { step: '04', title: 'CLAIM BRACKET KEYS', desc: 'Lobby locks open automatically 2 hours prior to bracket scheduling.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-5 bg-white/[0.01] border border-white/[0.04] rounded-2xl shadow-lg hover:border-cyan-500/20 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950 flex items-center justify-center font-black text-cyan-400 border border-cyan-500/30 flex-shrink-0 text-sm">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-white">{item.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Timeline Roadmap */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div>
                <span className="text-[10px] tracking-[0.3em] uppercase text-purple-400 font-bold block mb-1">★ Official Timeline</span>
                <h2 className="text-3xl md:text-4xl font-black uppercase text-white">EVENT ROADMAP</h2>
              </div>
              <p className="text-gray-400 text-xs md:text-sm font-mono leading-relaxed">
                Hourly match plans and roster locks. Matches are direct local fiber configurations with zero latency brackets.
              </p>
              
              <div className="flex flex-col gap-4 mt-2 relative border-l border-white/10 pl-6 ml-4">
                {[
                  { day: 'DAY 01 / JULY 18', event: 'KICKOFF & CHECK-INS', details: '9:00 AM IST // Physical Check-in & Key Card Allocations\n11:00 AM IST // Opening Ceremony & Quarter-final Matches' },
                  { day: 'DAY 02 / JULY 19', event: 'THE BRACKET CLASH', details: '2:00 PM IST // Semi-final Bracket Keys Live Lobby Matches' },
                  { day: 'DAY 03 / JULY 20', event: 'FINALS & REWARDS', details: '4:00 PM IST // Championship Showdown followed by Payouts' }
                ].map((item, idx) => (
                  <div key={idx} className="relative mb-4">
                    {/* Timeline dot */}
                    <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-purple-500 border-2 border-black shadow-[0_0_10px_#9e00ff]" />
                    <span className="text-[10px] uppercase text-purple-400 font-black tracking-widest block mb-0.5">{item.day}</span>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">{item.event}</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed whitespace-pre-line font-mono">{item.details}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Pinned Horizontal Bracket Section */}
      <section ref={sectionPinRef} id="live-bracket-section" className="relative z-10 h-screen w-screen overflow-hidden flex items-center bg-black/60 backdrop-blur-sm border-t-2 border-b-2 border-white/5">
        {/* Adjusted top position and z-index to avoid horizontal header overlaps */}
        <div className="absolute top-6 left-8 md:left-24 z-20">
          <span className="text-[10px] tracking-[0.3em] uppercase text-cyan-400 font-bold block mb-1">★ Live Standings</span>
          <h2 className="text-4xl font-extrabold tracking-tighter uppercase text-white">TOURNAMENT BRACKET</h2>
        </div>

        {/* Increased padding-top to pt-44 to scroll bracket headers safely below absolute title */}
        <div 
          ref={horizontalScrollRef} 
          className="flex h-full items-center gap-16 px-12 md:px-24 pt-44 pb-12"
          style={{ willChange: 'transform' }}
        >
          {/* QUARTER FINALS */}
          <div className="w-[85vw] md:w-[480px] flex-shrink-0 flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-3 mb-2">
              <span className="w-6 h-6 rounded bg-cyan-950 flex items-center justify-center font-bold text-xs text-cyan-400 border border-cyan-400/40">1/4</span>
              <h3 className="text-lg font-black uppercase tracking-wider text-cyan-400">Quarter Finals</h3>
            </div>
            
            <div className="flex flex-col gap-4">
              {bracketData.quarter.map((match) => (
                <div 
                  key={match.id}
                  onMouseEnter={() => setHoveredMatchId(match.id)}
                  onMouseLeave={() => setHoveredMatchId(null)}
                  className={`matchup-card p-5 bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col gap-3 relative overflow-hidden group cursor-pointer ${
                    hoveredMatchId !== null && hoveredMatchId !== match.id ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
                  } ${hoveredMatchId === match.id ? 'border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.15)] -translate-y-1' : ''}`}
                >
                  <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-gray-500 mb-1">
                    <span>Match {match.id.toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded-full text-black font-extrabold ${match.status === 'completed' ? 'bg-gray-400' : 'bg-cyan-400 animate-pulse'}`}>
                      {match.status}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs md:text-sm font-bold ${match.s1 > match.s2 ? 'text-cyan-400 font-extrabold' : 'text-gray-300'}`}>{match.t1}</span>
                      <span className="text-sm font-black text-white bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/5">{match.s1}</span>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex justify-between items-center">
                      <span className={`text-xs md:text-sm font-bold ${match.s2 > match.s1 ? 'text-cyan-400 font-extrabold' : 'text-gray-300'}`}>{match.t2}</span>
                      <span className="text-sm font-black text-white bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/5">{match.s2}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEMI FINALS */}
          <div className="w-[85vw] md:w-[480px] flex-shrink-0 flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-purple-500/20 pb-3 mb-2">
              <span className="w-6 h-6 rounded bg-purple-950 flex items-center justify-center font-bold text-xs text-purple-400 border border-purple-400/40">1/2</span>
              <h3 className="text-lg font-black uppercase tracking-wider text-purple-400">Semi Finals</h3>
            </div>
            
            <div className="flex flex-col gap-8 justify-around h-[380px]">
              {bracketData.semi.map((match) => (
                <div 
                  key={match.id}
                  onMouseEnter={() => setHoveredMatchId(match.id)}
                  onMouseLeave={() => setHoveredMatchId(null)}
                  className={`matchup-card p-5 bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col gap-3 relative overflow-hidden group cursor-pointer ${
                    hoveredMatchId !== null && hoveredMatchId !== match.id ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
                  } ${hoveredMatchId === match.id ? 'border-purple-500/40 shadow-[0_0_20px_rgba(217,0,255,0.15)] -translate-y-1' : ''}`}
                >
                  <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-gray-500 mb-1">
                    <span>Match {match.id.toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded-full text-black font-extrabold ${match.status === 'completed' ? 'bg-gray-400' : 'bg-[#d900ff] animate-pulse text-white'}`}>
                      {match.status}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs md:text-sm font-bold ${match.s1 > match.s2 ? 'text-[#d900ff] font-extrabold' : 'text-gray-300'}`}>{match.t1}</span>
                      <span className="text-sm font-black text-white bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/5">{match.s1}</span>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex justify-between items-center">
                      <span className={`text-xs md:text-sm font-bold ${match.s2 > match.s1 ? 'text-[#d900ff] font-extrabold' : 'text-gray-300'}`}>{match.t2}</span>
                      <span className="text-sm font-black text-white bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/5">{match.s2}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FINALS */}
          <div className="w-[85vw] md:w-[480px] flex-shrink-0 flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-yellow-500/20 pb-3 mb-2">
              <span className="w-6 h-6 rounded bg-yellow-950 flex items-center justify-center font-bold text-xs text-yellow-400 border border-yellow-400/40">★</span>
              <h3 className="text-lg font-black uppercase tracking-wider text-yellow-400">Grand Finals</h3>
            </div>
            
            <div className="flex flex-col justify-center h-[380px]">
              {bracketData.final.map((match) => (
                <div 
                  key={match.id}
                  onMouseEnter={() => setHoveredMatchId(match.id)}
                  onMouseLeave={() => setHoveredMatchId(null)}
                  className={`matchup-card p-6 bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group cursor-pointer ${
                    hoveredMatchId !== null && hoveredMatchId !== match.id ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
                  } ${hoveredMatchId === match.id ? 'border-yellow-500/40 shadow-[0_0_20px_rgba(250,204,21,0.15)] -translate-y-1' : ''}`}
                >
                  <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-gray-500 mb-1">
                    <span>Championship Match</span>
                    <span className="px-2 py-0.5 rounded-full text-black font-extrabold bg-yellow-400">
                      {match.status}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm md:text-base font-bold text-gray-300">{match.t1}</span>
                      <span className="text-sm font-black text-white bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/5">{match.s1}</span>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm md:text-base font-bold text-gray-300">{match.t2}</span>
                      <span className="text-sm font-black text-white bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/5">{match.s2}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Rule Book & Performance Spec Deck */}
      <section className="relative z-10 py-24 px-6 md:px-24 bg-gradient-to-t from-black to-slate-950/70 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-5 flex flex-col items-start gap-4">
              <span className="text-[10px] tracking-[0.3em] uppercase text-cyan-400 font-bold">★ LAN Details</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none uppercase">
                Zero-Ping Physical Rules
              </h2>
              <p className="text-gray-400 text-xs md:text-sm font-mono leading-relaxed mt-2 uppercase tracking-wider">
                Nova Hub represents the premium offline gaming grid in the country. To maintain integrity, all squads must adhere to the physical check-in and validation protocol.
              </p>
              
              <div className="flex flex-col gap-4 mt-4 w-full">
                {[
                  { icon: <MapPin className="w-5 h-5 text-cyan-400" />, title: 'Hardware Validation', detail: 'On-site peripherals check & BIOS integrity check' },
                  { icon: <Calendar className="w-5 h-5 text-purple-400" />, title: 'Check-In Protocol', detail: 'Bring validation pass & roster IDs' },
                  { icon: <Clock className="w-5 h-5 text-pink-400" />, title: 'Zero Latency Rule', detail: 'Zero packet drops guaranteed' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl shadow-lg">
                    <div className="p-2 bg-white/[0.03] border border-white/10 rounded-lg">{item.icon}</div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-500 tracking-wider font-bold">{item.title}</p>
                      <p className="text-xs font-mono font-bold mt-0.5 text-white">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hardware Visual Deck */}
            <div className="lg:col-span-7 bg-white/[0.01] border border-white/[0.05] p-8 rounded-3xl backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-6">
              <h3 className="text-xl font-bold uppercase text-white flex items-center gap-2">
                <Monitor className="w-5 h-5 text-purple-400" /> BATTLE STATION INTEGRITY PROTOCOL
              </h3>
              <p className="text-xs text-gray-400 font-mono uppercase leading-relaxed">
                EVERY NODE CONTAINS PURE COMPETITIVE HARDWARE LINKED DIRECTLY OVER A DEDICATED FIBER NET. WALK-IN OR PRE-BOOKED SLOTS ARE ISOLATED TO PREVENT ROUTING LATENCY.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono uppercase">
                <div className="bg-white/[0.02] p-4 border border-white/5 rounded-xl">
                  <span className="text-[10px] text-cyan-400 font-bold block mb-1">PRO RIGS</span>
                  <span>RTX 4090 / i9 CPU</span>
                </div>
                <div className="bg-white/[0.02] p-4 border border-white/5 rounded-xl">
                  <span className="text-[10px] text-purple-400 font-bold block mb-1">REFRESH RATE</span>
                  <span>540Hz / 360Hz Panels</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ / Technical Specs Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: <Zap className="w-6 h-6 text-yellow-400" />, title: 'Zero Latency LAN', desc: 'Direct local fiber configurations for instant bracket updates and zero packet drops.' },
              { icon: <Award className="w-6 h-6 text-cyan-400" />, title: 'Ref Payout Sync', desc: 'Auto-syncing score sheet modules connected directly to tournament reward brackets.' },
              { icon: <Users className="w-6 h-6 text-purple-400" />, title: 'Team Roster Locks', desc: 'Roster coordinates are locked automatically 2 hours prior to bracket scheduling.' }
            ].map((item, idx) => (
              <div key={idx} className="p-8 bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] hover:border-cyan-500/20 transition-colors rounded-2xl flex flex-col gap-4 shadow-lg group">
                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl w-max group-hover:scale-110 transition-transform">{item.icon}</div>
                <h4 className="text-base font-bold uppercase tracking-wider text-white">{item.title}</h4>
                <p className="text-xs text-gray-400 font-mono leading-relaxed tracking-wide uppercase">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Nodal Registration Modal Overlay */}
      <AnimatePresence>
        {isRegModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-slate-950/95 border-2 border-cyan-500/50 p-8 md:p-10 rounded-3xl max-w-md w-full shadow-[0_0_40px_rgba(0,240,255,0.3)] space-y-6 text-left text-white font-mono"
            >
              {/* Close Button */}
              <button 
                onClick={() => {
                  setIsRegModalOpen(false);
                  setRegStep(1);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Progress Steps Header */}
              {regStep < 3 && (
                <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${regStep === 1 ? 'bg-cyan-400 text-black shadow-[0_0_8px_#00f0ff]' : 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'}`}>1</div>
                  <div className="h-0.5 w-8 bg-white/10" />
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${regStep === 2 ? 'bg-cyan-400 text-black shadow-[0_0_8px_#00f0ff]' : 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'}`}>2</div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-auto font-mono">Step {regStep} of 2</span>
                </div>
              )}

              {regStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-black uppercase text-cyan-400">CLAN SPECIFICATION</h3>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase">Enter your official squad info for target node: <span className="text-white font-bold">{selectedCity}</span></p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold uppercase text-cyan-400 tracking-wider">Team Name *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Entity Esports"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white font-bold outline-none uppercase"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold uppercase text-cyan-400 tracking-wider">Clan Tag (max 4 chars) *</label>
                      <input 
                        type="text" 
                        maxLength={4}
                        placeholder="e.g. ENT"
                        value={clanTag}
                        onChange={(e) => setClanTag(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white font-bold outline-none uppercase"
                      />
                    </div>
                  </div>

                  <button 
                    disabled={!teamName.trim() || !clanTag.trim()}
                    onClick={() => setRegStep(2)}
                    className="w-full py-3.5 bg-cyan-400 hover:bg-white text-black font-black uppercase text-xs rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.2)] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Proceed to Roster <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {regStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-black uppercase text-cyan-400">ROSTER VALIDATION</h3>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase">Define active handles for zero-ping local switch alignment</p>
                  </div>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] font-bold uppercase text-gray-500">Captain Name *</label>
                        <input 
                          type="text" 
                          placeholder="Captain Name"
                          value={captainId}
                          onChange={(e) => setCaptainId(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] font-bold uppercase text-gray-500">Captain Email *</label>
                        <input 
                          type="email" 
                          placeholder="Email Address"
                          value={captainEmail}
                          onChange={(e) => setCaptainEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>
                    </div>

                    {[1, 2, 3, 4, 5].map((idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <label className="text-[8px] font-bold uppercase text-gray-500">Player {idx} Handle Name *</label>
                        <input 
                          type="text" 
                          placeholder={`Player ${idx} Handle`}
                          value={roster[idx - 1]}
                          onChange={(e) => {
                            const newRoster = [...roster];
                            newRoster[idx - 1] = e.target.value;
                            setRoster(newRoster);
                          }}
                          className="w-full bg-slate-900 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setRegStep(1)}
                      className="px-4 py-3.5 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-xs rounded-xl border border-white/10 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      disabled={!captainId.trim() || !captainEmail.trim() || roster.some(p => !p.trim())}
                      onClick={() => {
                        const token = `LAN-PASS-${selectedCity.substring(0,3).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                        setRegPassToken(token);
                        setRegStep(3);
                      }}
                      className="flex-1 py-3.5 bg-cyan-400 hover:bg-white text-black font-black uppercase text-xs rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.2)] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Generate Access Pass
                    </button>
                  </div>
                </div>
              )}

              {regStep === 3 && (
                <div className="space-y-6 text-center">
                  <div className="bg-green-500/10 border border-green-500/30 w-max mx-auto p-3 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.15)] text-green-400 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <h3 className="text-xl font-black uppercase text-green-400 tracking-wide font-display">LAN CORRIDOR GRANTED</h3>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase">Roster successfully validated for physical nodal access</p>
                  </div>

                  {/* Pass Ticket Details Card */}
                  <div className="bg-white/[0.02] border border-white/10 p-5 rounded-2xl space-y-4 text-left font-mono">
                    <div className="flex justify-between border-b border-white/5 pb-2 text-[10px] uppercase font-bold text-gray-500">
                      <span>Node Target</span>
                      <span className="text-white font-black">{selectedCity}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2 text-[10px] uppercase font-bold text-gray-500">
                      <span>Clan Team</span>
                      <span className="text-cyan-400 font-black">{teamName} [{clanTag}]</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2 text-[10px] uppercase font-bold text-gray-500">
                      <span>Nodal Pass Token</span>
                      <span className="text-purple-400 font-black select-text">{regPassToken}</span>
                    </div>
                    
                    {/* Simulated QR Code SVG */}
                    <div className="bg-white p-2 rounded-xl w-32 h-32 mx-auto">
                      <svg className="w-full h-full text-black" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M0,0 h30 v30 h-30 z M5,5 v20 h20 v-20 z M10,10 h10 v10 h-10 z" />
                        <path d="M70,0 h30 v30 h-30 z M75,5 v20 h20 v-20 z M80,10 h10 v10 h-10 z" />
                        <path d="M0,70 h30 v30 h-30 z M5,75 v20 h20 v-20 z M10,80 h10 v10 h-10 z" />
                        <path d="M80,80 h10 v10 h-10 z" />
                        <rect x="40" y="5" width="5" height="15" />
                        <rect x="50" y="10" width="10" height="5" />
                        <rect x="45" y="25" width="15" height="5" />
                        <rect x="5" y="40" width="15" height="5" />
                        <rect x="25" y="45" width="5" height="15" />
                        <rect x="40" y="40" width="20" height="20" />
                        <rect x="70" y="45" width="10" height="5" />
                        <rect x="85" y="55" width="10" height="10" />
                        <rect x="45" y="70" width="15" height="5" />
                        <rect x="55" y="80" width="5" height="15" />
                      </svg>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setIsRegModalOpen(false);
                      setTeamName('');
                      setClanTag('');
                      setCaptainId('');
                      setCaptainEmail('');
                      setRoster(['', '', '', '', '']);
                      setRegStep(1);
                    }}
                    className="w-full py-3.5 bg-green-550 hover:bg-white border border-green-550 text-white hover:text-black font-black uppercase text-xs rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all cursor-pointer"
                  >
                    Confirm & Dismiss Pass
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Chat Assistant Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button className="relative flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 border-2 border-cyan-500/50 hover:border-cyan-400 text-cyan-400 hover:text-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer group">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 stroke-[2] fill-none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
          <span className="absolute -top-1.5 -right-1.5 px-1 py-0.5 bg-yellow-400 text-black text-[7px] font-black rounded uppercase tracking-wider font-mono border border-black animate-bounce shadow-md">
            AI
          </span>
        </button>
      </div>
    </div>
  );
};
export default PremiumShowdown;
