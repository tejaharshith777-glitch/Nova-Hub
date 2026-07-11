import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Trophy, Zap, MapPin, Calendar, Clock, Award, Users, Crosshair, Sparkles } from 'lucide-react';

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

export const PremiumShowdown = () => {
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const magneticButtonRef = useRef(null);
  const horizontalScrollRef = useRef(null);
  const sectionPinRef = useRef(null);

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

  // 2. Cinematic Typography Reveal (GSAP)
  useEffect(() => {
    gsap.fromTo(
      '.reveal-line',
      { y: '100%', rotateX: 30, opacity: 0 },
      {
        y: '0%',
        rotateX: 0,
        opacity: 1,
        duration: 1.4,
        ease: 'power4.out',
        stagger: 0.15,
        delay: 0.2,
      }
    );

    gsap.fromTo(
      '.hero-fade-in',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 1.0 }
    );
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

  // 4. Magnetic CTA Button micro-interaction (GSAP)
  useEffect(() => {
    const button = magneticButtonRef.current;
    if (!button) return;

    const handleMouseMove = (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Translate button slightly toward mouse (magnetic drag)
      gsap.to(button, {
        x: x * 0.35,
        y: y * 0.35,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      // Snap button back on leave
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // 5. Leaflet Dark Mode Map Setup
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent duplicate map initialization
    if (!mapInstance.current) {
      // Set to sample physical LAN center (e.g. Bangalore Stadium Arena coordinates)
      const location = [12.9716, 77.5946];
      
      mapInstance.current = L.map(mapContainerRef.current, {
        center: location,
        zoom: 14,
        zoomControl: false,
        scrollWheelZoom: false,
      });

      // CartoDB Dark Matter tiles (premium dark mode theme)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(mapInstance.current);

      // Custom animated pulsing neon map pin icon
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

      L.marker(location, { icon: neonIcon })
        .addTo(mapInstance.current)
        .bindPopup(`
          <div class="bg-slate-950 text-white font-mono p-2.5 rounded-xl border border-cyan-500/30 text-xs">
            <h4 class="font-bold text-cyan-400 flex items-center gap-1">⚡ NOVA STADIUM HUB</h4>
            <p class="text-[10px] text-gray-400 mt-1">Hall 4A, Bangalore Tech City LAN Arena</p>
            <p class="text-[9px] text-purple-400 font-bold mt-1">Check-in starts: 9:00 AM IST</p>
          </div>
        `)
        .openPopup();

      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

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
      
      {/* Hero Section Container */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center items-center px-6 text-center select-none pt-24">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Animated Subtitle */}
          <div className="hero-fade-in inline-flex items-center gap-2 border border-cyan-500/30 px-4 py-1.5 rounded-full bg-cyan-950/20 backdrop-blur-md mb-8 text-xs tracking-[0.25em] text-cyan-400 font-bold uppercase shadow-[0_0_15px_rgba(0,240,255,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Vite Esports Showcase // Est. 2026
          </div>

          {/* Cinematic Large Header */}
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black font-display uppercase tracking-tighter leading-[0.85] overflow-hidden flex flex-col mb-8 select-none">
            <span className="overflow-hidden h-[1.1em] block">
              <span className="reveal-line inline-block origin-bottom-left text-white">THE ULTIMATE</span>
            </span>
            <span className="overflow-hidden h-[1.1em] block">
              <span className="reveal-line inline-block origin-bottom-left text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">SHOWDOWN</span>
            </span>
          </h1>

          <p className="hero-fade-in text-gray-400 text-xs md:text-sm font-mono max-w-xl leading-relaxed uppercase tracking-wider mb-12">
            Brace yourselves. The premier local LAN arena showdown commences. Track matching coordinates, brackets, live scores, and physical turfs inside a single cyber interface.
          </p>

          {/* Magnetic CTA Register Button */}
          <div className="hero-fade-in relative">
            <button
              ref={magneticButtonRef}
              className="px-10 py-5 bg-[#00f0ff] hover:bg-white text-black font-black uppercase text-sm tracking-widest border-[3px] border-black shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all cursor-pointer rounded-2xl"
            >
              Register Team Now
            </button>
          </div>

        </div>

        {/* Scroll Indicator (rendered relative to avoid absolute overlaps on short viewports) */}
        <div className="hero-fade-in mt-16 flex flex-col items-center gap-2 opacity-50 select-none">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Scroll to Arena</span>
          <div className="w-5 h-8 border-2 border-white rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-white rounded-full animate-bounce"></div>
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

      {/* Info Cards & Interactive Venue Map Section */}
      <section className="relative z-10 py-24 px-6 md:px-24 bg-gradient-to-t from-black to-slate-950/70 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-5 flex flex-col items-start gap-4">
              <span className="text-[10px] tracking-[0.3em] uppercase text-cyan-400 font-bold">★ LAN Details</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none uppercase">
                STADIUM VENUE MAP
              </h2>
              <p className="text-gray-400 text-xs md:text-sm font-mono leading-relaxed mt-2 uppercase tracking-wider">
                We're taking local showdowns offline. Head to the physical coordinates below to complete check-in, meet referees, and secure your tournament lobby key cards.
              </p>
              
              <div className="flex flex-col gap-4 mt-4 w-full">
                {[
                  { icon: <MapPin className="w-5 h-5 text-cyan-400" />, title: 'Location Coordinates', detail: 'Bangalore Stadium Hall 4A' },
                  { icon: <Calendar className="w-5 h-5 text-purple-400" />, title: 'Tournament Date', detail: 'July 18–20, 2026' },
                  { icon: <Clock className="w-5 h-5 text-pink-400" />, title: 'Check-in Time', detail: '9:00 AM IST onwards' },
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

            {/* Glassmorphic Map Container (Leaflet Dark Mode Map) */}
            <div className="lg:col-span-7">
              <div className="p-3 bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <div 
                  ref={mapContainerRef} 
                  className="h-80 md:h-[400px] w-full rounded-[2rem] border border-white/10 overflow-hidden relative z-10"
                  style={{ background: '#0a0a14' }}
                />
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
    </div>
  );
};
export default PremiumShowdown;
