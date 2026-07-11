import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
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
  const trophyRef = useRef(null);

  // useFrame runs in R3F render loop (gpu-optimized)
  useFrame(() => {
    if (trophyRef.current) {
      // Automatic rotation
      trophyRef.current.rotation.y += 0.005;

      // Link rotation & scaling directly to window scroll progress
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? scrollY / docHeight : 0;

      // Object zooms out and shifts left as user scrolls down
      const targetScale = Math.max(0.4, 1.2 - scrollProgress * 0.9);
      trophyRef.current.scale.set(targetScale, targetScale, targetScale);

      // Shifting position on screen
      trophyRef.current.position.x = -scrollProgress * 4.0;
      trophyRef.current.position.y = -scrollProgress * 1.5;
    }
  });

  return (
    <group ref={trophyRef}>
      {/* Central Cyber Gem/Core */}
      <mesh position={[0, 0, 0]}>
        <octahedronGeometry args={[1.5, 0]} />
        <meshPhysicalMaterial 
          color="#00f0ff" 
          emissive="#d900ff"
          emissiveIntensity={0.2}
          metalness={0.9} 
          roughness={0.15} 
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Cyber Base */}
      <mesh position={[0, -1.8, 0]}>
        <cylinderGeometry args={[1.2, 1.5, 0.4, 8]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>
      
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.6, 8]} />
        <meshStandardMaterial color="#00f0ff" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Outer Orbiting Grid Rims */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.04, 16, 100]} />
        <meshBasicMaterial color="#d900ff" wireframe />
      </mesh>

      <mesh rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={[2.8, 0.02, 16, 100]} />
        <meshBasicMaterial color="#00f0ff" wireframe />
      </mesh>

      {/* Top Halo Ring */}
      <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.0, 0.05, 8, 50]} />
        <meshStandardMaterial color="#00f0ff" metalness={0.9} roughness={0.1} emissive="#00f0ff" emissiveIntensity={0.5} />
      </mesh>
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

        <div className="relative z-10 space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 border border-cyan-500/30 px-4 py-1.5 rounded-full bg-cyan-950/20 backdrop-blur-md text-[9px] tracking-[0.3em] text-cyan-400 font-bold uppercase animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> WebGL Node Link Status: Standby
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white font-display">
            SHOWDOWN <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">ARENA</span>
          </h1>

          <p className="text-gray-400 text-xs md:text-sm font-mono tracking-wider max-w-lg mx-auto uppercase">
            Initialize validation sequence. Syncing offline battle nodal corridors and low-ping server metrics.
          </p>

          {/* Scroll Down Indicator */}
          <div className="pt-16 flex flex-col items-center justify-center gap-2">
            <span className="text-[9px] font-bold text-cyan-450 uppercase tracking-[0.25em] animate-pulse">
              Scroll to Sync Offline Grid
            </span>
            <div className="w-6 h-10 border-2 border-cyan-500/30 rounded-full p-1 flex justify-center">
              <div className="w-1.5 h-2.5 bg-cyan-400 rounded-full animate-[bounce_1.5s_infinite]" />
            </div>
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
    </div>
  );
};
export default PremiumShowdown;
