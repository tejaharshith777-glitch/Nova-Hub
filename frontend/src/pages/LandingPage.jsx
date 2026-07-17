import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Trophy, Sparkles, Pin, Compass, Info, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import FeaturedCarousel from '../components/FeaturedCarousel';
import ScrollReveal from '../components/ScrollReveal';

const ScrollParallaxHeading = ({ children, className, axis = "x", speed = 30, direction = 1 }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const transformValue = useTransform(scrollYProgress, [0, 1], [direction * -speed, direction * speed]);
  
  // Smooth out the scroll motion using a spring transition (inertia takes ~1 second to settle)
  const smoothTransform = useSpring(transformValue, {
    stiffness: 60,
    damping: 25,
    mass: 1
  });

  const style = axis === "y" ? { y: smoothTransform } : { x: smoothTransform };

  return (
    <motion.h2 ref={ref} style={style} className={className}>
      {children}
    </motion.h2>
  );
};

const HologramCard = () => {
  const cardRef = useRef(null);
  const ringRef1 = useRef(null);
  const ringRef2 = useRef(null);
  const texture = useTexture('/cyber_sports_trophy.png');

  useFrame((state) => {
    const { x, y } = state.pointer; // Mouse pointer coordinates between -1 and 1
    const time = state.clock.getElapsedTime();

    if (cardRef.current) {
      // Tilt toward mouse pointer with smooth interpolation
      cardRef.current.rotation.y = THREE.MathUtils.lerp(cardRef.current.rotation.y, x * 0.4, 0.1);
      cardRef.current.rotation.x = THREE.MathUtils.lerp(cardRef.current.rotation.x, -y * 0.4, 0.1);

      // Subtle float up and down
      cardRef.current.position.y = Math.sin(time * 1.5) * 0.1;
    }

    if (ringRef1.current) {
      ringRef1.current.rotation.y = time * 0.4;
      ringRef1.current.rotation.x = time * 0.1;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z = -time * 0.6;
      ringRef2.current.rotation.y = time * 0.2;
    }
  });

  return (
    <group>
      {/* Centered Holographic Render Image Card */}
      <group ref={cardRef}>
        {/* Inner Image Mesh */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[2.5, 2.5]} />
          <meshBasicMaterial map={texture} transparent opacity={0.95} />
        </mesh>
        
        {/* Glassmorphic border glow frame */}
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[2.7, 2.7]} />
          <meshPhysicalMaterial 
            color="#00f0ff"
            emissive="#d900ff"
            emissiveIntensity={0.2}
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>

      {/* Orbiting cyber rings */}
      <mesh ref={ringRef1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.9, 0.02, 16, 100]} />
        <meshBasicMaterial color="#d900ff" wireframe />
      </mesh>

      <mesh ref={ringRef2} rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={[2.1, 0.015, 16, 100]} />
        <meshBasicMaterial color="#00f0ff" wireframe />
      </mesh>
      
      {/* Top and Bottom futuristic light indicators */}
      <mesh position={[0, 1.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.03, 8, 32]} />
        <meshStandardMaterial color="#00f0ff" metalness={0.9} roughness={0.1} emissive="#00f0ff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

const Interactive3DHologram = () => {
  return (
    <div className="w-full h-[380px] md:h-[420px] bg-slate-950 border-[3px] border-[#1a1a1a] rounded-[2rem] shadow-[8px_8px_0px_rgba(26,26,26,1)] overflow-hidden relative group">
      {/* Top neubrutalist panel header */}
      <div className="absolute top-0 inset-x-0 bg-yellow-200 border-b-[3px] border-[#1a1a1a] px-5 py-2.5 flex items-center justify-between z-20">
        <span className="text-[10px] font-black tracking-widest text-[#1a1a1a] uppercase flex items-center gap-1.5 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 border border-[#1a1a1a]" />
          WebGL Active: Nova Hub Visualizer
        </span>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]/20" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]/20" />
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 4], fov: 50 }} className="z-10 mt-6">
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#00f0ff" />
        <pointLight position={[0, -2, 2]} intensity={2.0} color="#d900ff" />
        <React.Suspense fallback={null}>
          <HologramCard />
        </React.Suspense>
      </Canvas>

      {/* Retro overlay stripes */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(transparent_50%,rgba(0,0,0,0.4))] z-15" />
    </div>
  );
};

const mockSportsList = [
  { id: '1', title: 'Summer Cricket Cup', type: 'Cricket', slots: '6/8 Slots Taken', fee: '₹1,500', venue: 'Nehru Ground Pitch A', bg: '#fef08a' },
  { id: '2', title: 'City Football League', type: 'Football', slots: '12/16 Slots Taken', fee: '₹3,000', venue: 'Bangalore Stadium Hall 2', bg: '#ffedd5' },
  { id: '3', title: 'District Basketball Clash', type: 'Basketball', slots: '3/8 Slots Taken', fee: '₹1,000', venue: 'YMCA Court 1', bg: '#ffffff' },
  { id: '4', title: 'State Badminton Smash', type: 'Badminton', slots: '28/32 Slots Taken', fee: '₹500', venue: 'Indiranagar Club Hall A', bg: '#cffafe' },
  { id: '5', title: 'Local Tennis League', type: 'Tennis', slots: '4/8 Slots Taken', fee: '₹1,200', venue: 'KSLTA Court 3', bg: '#dcfce7' }
];

const FAQ_ITEMS = [
  {
    id: "faq1",
    question: "What is Nova Hub?",
    answer: "Nova Hub is a unified community sports and esports dashboard built for tournament discovery, real-time brackets, team registration, and player stats."
  },
  {
    id: "faq2",
    question: "Is Nova Hub free to use?",
    answer: "Yes, Nova Hub is free for players to explore events, register rosters, and track matches. Tournament hosts can access premium administration dashboards."
  },
  {
    id: "faq3",
    question: "Does Nova Hub organize physical tournaments?",
    answer: "Yes, we coordinate local sports bookings, manage offline check-ins, and schedule matches at physical arenas, turf zones, and esports centers."
  },
  {
    id: "faq4",
    question: "Does Nova Hub need special permissions?",
    answer: "We only request standard authentication for team captains and optional location access to show local physical tournament radars near you."
  },
  {
    id: "faq5",
    question: "What can I add to my team roster?",
    answer: "You can add 3-5 active player handles, game IDs, or physical student/player card IDs depending on the tournament's specific guidelines."
  },
  {
    id: "faq6",
    question: "Can I customize my hosted tournament?",
    answer: "Absolutely! Hosts can define custom bracket types (single/double elimination), set entry fees, write custom guidelines, and schedule match times."
  },
  {
    id: "faq7",
    question: "Can I register my clan under multiple sports?",
    answer: "Yes, you can register different rosters under the same clan/team name for football, cricket, basketball, or online esports leagues."
  },
  {
    id: "faq8",
    question: "Does Nova Hub sync brackets in real-time?",
    answer: "Yes, match scores, standings, and automated bracket advancements are synced live to player radars, dashboards, and streams instantly."
  },
  {
    id: "faq9",
    question: "Which games and sports are supported?",
    answer: "We support physical sports (Cricket, Football, Badminton, Basketball) and major esports platforms (Valorant, BGMI, Free Fire, and general PC/Mobile gaming)."
  },
  {
    id: "faq10",
    question: "Can I check-in offline with a digital pass?",
    answer: "Yes! Each successful registration generates a unique Roster Verification Pass with a QR code and gate details for seamless physical entry."
  },
  {
    id: "faq11",
    question: "Is my player data and handle private?",
    answer: "Roster details and verification tokens are encrypted, ensuring only tournament admins and team captains have access to invite codes."
  },
  {
    id: "faq12",
    question: "Will more tournament templates be added?",
    answer: "Yes, custom round-robin templates, league standings boards, and automated team coordinator notifications are actively in development."
  }
];

export const LandingPage = ({ onOpenAuth, user }) => {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('WELCOME');
  const [openFaq, setOpenFaq] = useState({});

  const toggleFaq = (id) => setOpenFaq(prev => ({ ...prev, [id]: !prev[id] }));

  const servicesContainerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: servicesContainerRef,
    offset: ['start start', 'end start']
  });

  const card1Scale = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [1, 0.96, 0.92, 0.88, 0.88]);
  const card1Brightness = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], ["brightness(1)", "brightness(0.9)", "brightness(0.8)", "brightness(0.7)", "brightness(0.7)"]);

  const card2Scale = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [1, 1, 0.96, 0.92, 0.92]);
  const card2Brightness = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], ["brightness(1)", "brightness(1)", "brightness(0.9)", "brightness(0.8)", "brightness(0.8)"]);

  const card3Scale = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [1, 1, 1, 0.96, 0.96]);
  const card3Brightness = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], ["brightness(1)", "brightness(1)", "brightness(1)", "brightness(0.9)", "brightness(0.9)"]);

  const card4Scale = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [1, 1, 1, 1, 0.96]);
  const card4Brightness = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], ["brightness(1)", "brightness(1)", "brightness(1)", "brightness(1)", "brightness(0.9)"]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(window.scrollY / totalScroll);
      }

      const sections = [
        { id: 'hero', name: 'WELCOME' },
        { id: 'tournaments', name: 'OUR LEAGUES' },
        { id: 'school-tournaments', name: 'SCHOOL CUPS' },
        { id: 'college-tournaments', name: 'COLLEGE TROPHIES' },
        { id: 'journey', name: 'START JOURNEY' },
        { id: 'team', name: 'THE TEAM' },
        { id: 'case-study', name: 'CASE STUDY' },
        { id: 'faq', name: 'FAQ' },
        { id: 'testimonials', name: 'REVIEWS' },
        { id: 'contact', name: 'CONTACT DESK' },
        { id: 'services', name: 'OUR SERVICES' }
      ];

      let current = 'WELCOME';
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4) {
            current = section.name;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCols = 25;
  const filledCols = Math.round(scrollProgress * totalCols);

  const dots = [];
  for (let r = 0; r < 4; r++) {
    const rowDots = [];
    for (let c = 0; c < totalCols; c++) {
      const isFilled = c < filledCols;
      rowDots.push(
        <span 
          key={c} 
          className={`w-[3px] h-[3px] md:w-[4px] md:h-[4px] rounded-sm transition-colors duration-150 ${
            isFilled ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-900/15 dark:bg-zinc-100/15'
          }`} 
        />
      );
    }
    dots.push(
      <div key={r} className="flex gap-[2px] md:gap-[3px]">
        {rowDots}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#c4e4e3] text-[#1a1a1a] select-none font-mono overflow-x-hidden">
      {/* Carbon Backdrop Grid */}
      <div className="absolute inset-0 carbon-grid opacity-20 pointer-events-none" />

      {/* Sticky Left Monospace Badge */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 -rotate-90 origin-left z-50 pointer-events-none hidden md:block">
        <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#1a1a1a] bg-yellow-200 border-2 border-[#1a1a1a] px-3 py-1 shadow-[2px_2px_0px_rgba(26,26,26,1)]">
          ★ NOVA HUB // SPORTS &amp; ESPORTS PLATFORM // EST. 2026
        </span>
      </div>

      {/* ==========================================
          FRAME 1: HERO SECTION
         ========================================== */}
      <section id="hero" className="min-h-[95vh] flex flex-col md:flex-row items-center justify-between px-8 md:px-24 pt-32 pb-20 relative z-10 gap-12 bg-[#c4e4e3] dark:bg-gradient-to-br dark:from-[#090b16] dark:via-[#111324] dark:to-[#1e0f35] text-[#1a1a1a] dark:text-white border-b-[4px] border-[#1a1a1a] dark:border-white/10 transition-colors duration-500 overflow-hidden">
        {/* Skewed Yellow Accent Slash Grid matching Picture 1 */}
        <div className="absolute right-0 bottom-0 top-0 w-[42%] bg-[#facc15] dark:bg-[#1a1c30] -skew-x-[18deg] origin-top-right z-0 pointer-events-none hidden md:block border-l-[4px] border-[#1a1a1a] dark:border-l-white/10 transition-all duration-500" />
        
        {/* Subtle dot overlay matching Picture 1 */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(26,26,26,0.06)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none transition-all duration-500" />

        {/* Left Typography Block */}
        <div className="w-full md:w-[55%] text-left flex flex-col gap-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-900 border-2 border-[#1a1a1a] dark:border-cyan-500/35 px-3 py-1 text-[#1a1a1a] dark:text-cyan-400 shadow-[2px_2px_0px_rgba(26,26,26,1)] dark:shadow-[2px_2px_0px_rgba(0,240,255,0.8)] transition-all duration-500">
              ★ Active WebGL Tournament Grid
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black font-display text-[#1a1a1a] dark:text-white leading-none uppercase transition-colors duration-500"
          >
            Behind the Greatest Matches, <br />
            There's <span className="text-[#e86c3f] dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-yellow-300 dark:via-yellow-400 dark:to-orange-400">Nova Hub</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xs md:text-sm font-semibold max-w-lg leading-relaxed text-[#1a1a1a]/85 dark:text-white/80 font-mono uppercase tracking-wide transition-colors duration-500"
          >
            Quietly syncing local sports turf bookings and global esports brackets to deliver professional tournament events. Set roster sizes, allocate ground slots, and verify clan rosters.
          </motion.p>

          <div className="flex gap-4 pt-4">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-[#1a1a1a] dark:bg-cyan-500 hover:bg-black dark:hover:bg-cyan-400 text-white dark:text-slate-950 px-8 py-4 border-2 border-[#1a1a1a] dark:border-slate-950 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-[5px_5px_0px_rgba(26,26,26,1)] dark:shadow-[5px_5px_0px_rgba(217,0,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 interactive-target"
              >
                Go to Dashboard Console <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-[#1a1a1a] dark:bg-cyan-500 hover:bg-black dark:hover:bg-cyan-400 text-white dark:text-slate-950 px-8 py-4 border-2 border-[#1a1a1a] dark:border-slate-950 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-[5px_5px_0px_rgba(26,26,26,1)] dark:shadow-[5px_5px_0px_rgba(217,0,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 interactive-target"
              >
                Host a Tournament Now <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Floating group collage image matching Picture 1 */}
        <div className="w-full md:w-[45%] flex justify-center items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 2 }}
            transition={{ type: 'spring', stiffness: 120, delay: 0.2 }}
            className="w-full max-w-md relative group"
          >
            <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500 hidden dark:block" />
            <img 
              src="/esports_sports_group.png" 
              alt="Nova Hub Gamers and Sports Players" 
              className="relative w-full h-auto object-cover rounded-3xl border-[3px] border-[#1a1a1a] dark:border-cyan-500/30 shadow-[12px_12px_0px_rgba(26,26,26,1)] dark:shadow-[12px_12px_0px_rgba(217,0,255,0.4)] transition-all duration-500"
            />
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          FRAME 2: PORTFOLIO GRID (A glimpse of our work)
         ========================================== */}
      <section id="tournaments" className="py-24 max-w-6xl mx-auto px-8 relative z-10">
        <div className="mb-12 max-w-2xl">
          <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#1a1a1a]/50 mb-3">
            <span className="w-5 h-[2px] bg-[#1a1a1a]/30 inline-block" />Our Tournaments
          </span>
          <ScrollParallaxHeading axis="x" direction={1} speed={30} className="text-4xl md:text-5xl font-black italic font-display text-[#1a1a1a] mb-4 leading-tight">
            A glimpse of our <span className="text-[#e86c3f]">tournaments</span>
          </ScrollParallaxHeading>
          <div className="flex gap-3 mb-4">
            <span className="px-3 py-1 bg-[#1a1a1a] text-white text-[10px] font-black uppercase tracking-widest rounded-full">🏟️ Local Sports</span>
            <span className="px-3 py-1 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">🎮 Online Esports</span>
          </div>
          <p className="text-[11px] font-mono text-[#1a1a1a]/70 leading-relaxed uppercase tracking-widest">
            From weekend cricket to global Valorant showdowns — we run brackets for every arena, physical or digital.
          </p>
        </div>

        {/* Physical Sports Label */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-black uppercase tracking-widest text-[#1a1a1a]/40">⚡ Physical Sports</span>
          <div className="flex-1 h-px bg-[#1a1a1a]/10"></div>
        </div>

        {/* 2x2 Grid - Physical Sports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 overflow-hidden">
          
          {/* Card 1 - Cricket */}
          <ScrollReveal direction="left" delay={0}>
            <div onClick={() => navigate('/tournament/cricket')} className="border border-green-300/30 bg-gradient-to-br from-[#112615] to-[#09140b] rounded-[2rem] p-6 relative flex flex-col justify-end h-80 md:h-96 overflow-hidden group hover:border-green-400/50 transition-colors cursor-pointer">
              <img 
                src="/cricket_card.jpg" 
                alt="Summer Cricket Cup" 
                className="absolute inset-0 w-full h-full object-cover scale-[1.08] -translate-y-[3%] group-hover:scale-[1.12] transition-transform duration-500"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#09140b] via-[#09140b]/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 px-2">
                <h3 className="text-xl md:text-2xl font-display italic font-bold text-white">Summer Cricket Cup</h3>
                <span className="text-[10px] md:text-xs font-mono text-white/50">cricket, league, local</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 2 - Football */}
          <ScrollReveal direction="right" delay={0.15}>
            <div onClick={() => navigate('/tournament/football')} className="border border-emerald-300/30 bg-gradient-to-br from-[#082a17] to-[#03140a] rounded-[2rem] p-6 relative flex flex-col justify-end h-80 md:h-96 overflow-hidden group hover:border-emerald-400/50 transition-colors cursor-pointer">
              <img 
                src="/football_card.jpg" 
                alt="FIFA World Cup Player Album 2026" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#03140a] via-[#03140a]/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 px-2">
                <h3 className="text-xl md:text-2xl font-display italic font-bold text-white">City Football Clash</h3>
                <span className="text-[10px] md:text-xs font-mono text-white/50">soccer, knockout, fast</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 3 - Badminton */}
          <ScrollReveal direction="left" delay={0}>
            <div onClick={() => navigate('/tournament/badminton')} className="border border-yellow-300/30 bg-gradient-to-br from-[#261f08] to-[#120f04] rounded-[2rem] p-6 relative flex flex-col justify-end h-80 md:h-96 overflow-hidden group hover:border-yellow-400/50 transition-colors cursor-pointer">
              <img 
                src="/badminton_card.png" 
                alt="State Badminton" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#120f04] via-[#120f04]/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 px-2">
                <h3 className="text-xl md:text-2xl font-display italic font-bold text-white">State Badminton</h3>
                <span className="text-[10px] md:text-xs font-mono text-white/50">badminton, brackets, pro</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 4 - Basketball */}
          <ScrollReveal direction="right" delay={0.15}>
            <div onClick={() => navigate('/tournament/hoops')} className="border border-cyan-300/30 bg-gradient-to-br from-[#05202e] to-[#021017] rounded-[2rem] p-6 relative flex flex-col justify-end h-80 md:h-96 overflow-hidden group hover:border-cyan-400/50 transition-colors cursor-pointer">
              <img 
                src="/basketball_card.png" 
                alt="Downtown Basketball" 
                className="absolute inset-0 w-full h-full object-cover scale-[1.08] -translate-y-[3%] group-hover:scale-[1.12] transition-transform duration-500"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#021017] via-[#021017]/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 px-2">
                <h3 className="text-xl md:text-2xl font-display italic font-bold text-white">Downtown Basketball</h3>
                <span className="text-[10px] md:text-xs font-mono text-white/50">hoops, groups, local</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Online Esports Label */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 mt-16 pt-12 border-t border-[#1a1a1a]/10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_rgba(26,26,26,1)] rounded-full text-[9px] font-black uppercase tracking-wider text-purple-700 mb-3">
              🎮 Cyber Arenas
            </span>
            <ScrollParallaxHeading axis="y" direction={-1} speed={25} className="text-3xl md:text-4xl font-inter font-black uppercase tracking-tight text-[#1a1a1a]">
              Online Esports <span className="text-purple-600">Showdowns</span>
            </ScrollParallaxHeading>
            <p className="text-[11px] font-mono text-[#1a1a1a]/60 mt-1 uppercase tracking-wider">
              Compete globally from your setup. Real-time bracket sync and anti-cheat tracking.
            </p>
          </div>
        </div>

        {/* 2x2 Grid - Online Games */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24 overflow-hidden">

          {/* Card 5 - Valorant */}
          <ScrollReveal direction="left" delay={0}>
            <div onClick={() => navigate('/tournament/valorant')} className="border border-purple-300/50 bg-gradient-to-br from-[#0f0f1a] to-[#1a0a2a] rounded-[2rem] p-6 relative flex flex-col justify-end h-80 md:h-96 overflow-hidden group hover:border-purple-400/70 transition-colors cursor-pointer">
              <img 
                src="/valorant_card.png" 
                alt="Valorant Showdown" 
                className="absolute inset-0 w-full h-full object-cover scale-[1.08] -translate-y-[3%] group-hover:scale-[1.12] transition-transform duration-500"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a2a] via-[#1a0a2a]/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 px-2">
                <h3 className="text-xl md:text-2xl font-display italic font-bold text-white">Valorant Showdown</h3>
                <span className="text-[10px] md:text-xs font-mono text-white/50">esports, 5v5, online</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 6 - BGMI */}
          <ScrollReveal direction="right" delay={0.15}>
            <div onClick={() => navigate('/tournament/bgmi')} className="border border-orange-300/30 bg-gradient-to-br from-[#1a1008] to-[#2a1800] rounded-[2rem] p-6 relative flex flex-col justify-end h-80 md:h-96 overflow-hidden group hover:border-orange-400/50 transition-colors cursor-pointer">
              <img 
                src="/pubg_card.png" 
                alt="BGMI Battlegrounds" 
                className="absolute inset-0 w-full h-full object-cover scale-[1.08] -translate-y-[3%] group-hover:scale-[1.12] transition-transform duration-500"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2a1800] via-[#2a1800]/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 px-2">
                <h3 className="text-xl md:text-2xl font-display italic font-bold text-white">BGMI Battlegrounds</h3>
                <span className="text-[10px] md:text-xs font-mono text-white/50">battle royale, squads, online</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 7 - Free Fire */}
          <ScrollReveal direction="left" delay={0}>
            <div onClick={() => navigate('/tournament/freefire')} className="border border-yellow-300/30 bg-gradient-to-br from-[#0a1a00] to-[#1a2e00] rounded-[2rem] p-6 relative flex flex-col justify-end h-80 md:h-96 overflow-hidden group hover:border-yellow-400/50 transition-colors cursor-pointer">
              <img 
                src="/freefire_card.jpg" 
                alt="Free Fire Masters" 
                className="absolute inset-0 w-full h-full object-cover scale-[1.08] -translate-y-[3%] group-hover:scale-[1.12] transition-transform duration-500"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e00] via-[#1a2e00]/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 px-2">
                <h3 className="text-xl md:text-2xl font-display italic font-bold text-white">Free Fire Masters</h3>
                <span className="text-[10px] md:text-xs font-mono text-white/50">free fire, ranked, squads</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 8 - Chess */}
          <ScrollReveal direction="right" delay={0.15}>
            <div onClick={() => navigate('/tournament/chess')} className="border border-gray-300/30 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-[2rem] p-6 relative flex flex-col justify-end h-80 md:h-96 overflow-hidden group hover:border-gray-400/50 transition-colors cursor-pointer">
              <img 
                src="/chess_card.png" 
                alt="Online Chess League" 
                className="absolute inset-0 w-full h-full object-cover scale-[1.08] -translate-y-[3%] group-hover:scale-[1.12] transition-transform duration-500"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2d2d2d] via-[#2d2d2d]/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 px-2">
                <h3 className="text-xl md:text-2xl font-display italic font-bold text-white">Online Chess League</h3>
                <span className="text-[10px] md:text-xs font-mono text-white/50">chess, elo, online blitz</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Racing Tournaments Label */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 mt-16 pt-12 border-t border-[#1a1a1a]/10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_rgba(26,26,26,1)] rounded-full text-[9px] font-black uppercase tracking-wider text-red-700 mb-3">
              🏁 Speed Tracks
            </span>
            <ScrollParallaxHeading axis="y" direction={1} speed={25} className="text-3xl md:text-4xl font-inter font-black uppercase tracking-tight text-[#1a1a1a]">
              Racing <span className="text-red-600">Tournaments</span>
            </ScrollParallaxHeading>
            <p className="text-[11px] font-mono text-[#1a1a1a]/60 mt-1 uppercase tracking-wider">
              High-octane time trials, virtual circuits, and leaderboards for speed junkies.
            </p>
          </div>
        </div>

        {/* Racing Grid - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 overflow-hidden">

          {/* Card R1 - Car Racing */}
          <ScrollReveal direction="up" delay={0}>
            <div onClick={() => navigate('/tournament/car-racing')} className="border border-red-300/40 bg-gradient-to-br from-[#1a0000] to-[#2a0a0a] rounded-[2rem] p-6 relative flex flex-col justify-end h-80 md:h-96 overflow-hidden group hover:border-red-400/70 transition-colors cursor-pointer">
              <img 
                src="/veloce_card.png" 
                alt="Veloce GP Series" 
                className="absolute inset-0 w-full h-full object-cover scale-[1.08] -translate-y-[3%] group-hover:scale-[1.12] transition-transform duration-500"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2a0a0a] via-[#2a0a0a]/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 px-2">
                <h3 className="text-xl md:text-2xl font-display italic font-bold text-white">Veloce GP Series</h3>
                <span className="text-[10px] md:text-xs font-mono text-white/50">racing, car, time-trial</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card R2 - Bike Racing */}
          <ScrollReveal direction="up" delay={0.12}>
            <div onClick={() => navigate('/tournament/bike-racing')} className="border border-orange-300/40 bg-gradient-to-br from-[#1a0a00] to-[#2a1400] rounded-[2rem] p-6 relative flex flex-col justify-end h-80 md:h-96 overflow-hidden group hover:border-orange-400/70 transition-colors cursor-pointer">
              <img 
                src="/motogp_card.png" 
                alt="Moto GP Pro Tour" 
                className="absolute inset-0 w-full h-full object-cover scale-[1.08] -translate-y-[3%] group-hover:scale-[1.12] transition-transform duration-500"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2a1400] via-[#2a1400]/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 px-2">
                <h3 className="text-xl md:text-2xl font-display italic font-bold text-white">Moto GP Pro Tour</h3>
                <span className="text-[10px] md:text-xs font-mono text-white/50">racing, bike, online</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card R3 - Cycle Racing */}
          <ScrollReveal direction="up" delay={0.24}>
            <div onClick={() => navigate('/tournament/cycle-racing')} className="border border-green-300/40 bg-gradient-to-br from-[#001a08] to-[#002a10] rounded-[2rem] p-6 relative flex flex-col justify-end h-80 md:h-96 overflow-hidden group hover:border-green-400/70 transition-colors cursor-pointer">
              <img 
                src="/cycle_card.jpg" 
                alt="Tour de Nova Classic" 
                className="absolute inset-0 w-full h-full object-cover scale-[1.08] -translate-y-[3%] group-hover:scale-[1.12] transition-transform duration-500"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#002a10] via-[#002a10]/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 px-2">
                <h3 className="text-xl md:text-2xl font-display italic font-bold text-white">Tour de Nova Classic</h3>
                <span className="text-[10px] md:text-xs font-mono text-white/50">cycle, gps, velodrome</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* School vs School Header */}
        <div id="school-tournaments" className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 mt-16 pt-12 border-t border-[#1a1a1a]/10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-200 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_rgba(26,26,26,1)] rounded-full text-[9px] font-black uppercase tracking-wider text-[#1a1a1a] mb-3">
              🎒 Junior League
            </span>
            <ScrollParallaxHeading axis="y" direction={-1} speed={25} className="text-3xl md:text-4xl font-inter font-black uppercase tracking-tight text-[#1a1a1a]">
              School vs School <span className="text-[#e86c3f]">Tournaments</span>
            </ScrollParallaxHeading>
            <p className="text-[11px] font-mono text-[#1a1a1a]/60 mt-1 uppercase tracking-wider">
              High-school battles representing regional bragging rights and legacy shields.
            </p>
          </div>
        </div>

        {/* School Grid - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 overflow-hidden">
          {/* Card 1 - School Football */}
          <ScrollReveal direction="left" delay={0}>
            <div onClick={() => navigate('/tournament/school-football')} className="border border-yellow-300/40 bg-gradient-to-br from-[#1a1708] to-[#2b250c] rounded-[2rem] p-6 relative flex flex-col justify-end h-80 md:h-96 overflow-hidden group hover:border-yellow-400/70 transition-colors cursor-pointer text-white">
              <img 
                src="/school_football_card.png" 
                alt="Inter-School Football Cup" 
                className="absolute inset-0 w-full h-full object-cover scale-[1.08] -translate-y-[3%] group-hover:scale-[1.12] transition-transform duration-500"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2b250c] via-[#2b250c]/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 px-2">
                <h3 className="text-xl md:text-2xl font-display italic font-bold text-white">Inter-School Football Cup</h3>
                <span className="text-[10px] md:text-xs font-mono text-white/50">football, school, junior</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 2 - School Basketball */}
          <ScrollReveal direction="right" delay={0.15}>
            <div onClick={() => navigate('/tournament/school-basketball')} className="border border-amber-300/40 bg-gradient-to-br from-[#1c1208] to-[#2e1c0c] rounded-[2rem] p-6 relative flex flex-col justify-end h-80 md:h-96 overflow-hidden group hover:border-amber-400/70 transition-colors cursor-pointer text-white">
              <img 
                src="/school_basketball_card.png" 
                alt="Junior School Basketball Shield" 
                className="absolute inset-0 w-full h-full object-cover scale-[1.08] -translate-y-[3%] group-hover:scale-[1.12] transition-transform duration-500"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2e1c0c] via-[#2e1c0c]/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 px-2">
                <h3 className="text-xl md:text-2xl font-display italic font-bold text-white">Junior School Basketball Shield</h3>
                <span className="text-[10px] md:text-xs font-mono text-white/50">basketball, school, shield</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* College vs College Header */}
        <div id="college-tournaments" className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 mt-16 pt-12 border-t border-[#1a1a1a]/10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#cffafe] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_rgba(26,26,26,1)] rounded-full text-[9px] font-black uppercase tracking-wider text-blue-700 mb-3">
              🎓 Varsity Cup
            </span>
            <ScrollParallaxHeading axis="y" direction={1} speed={25} className="text-3xl md:text-4xl font-inter font-black uppercase tracking-tight text-[#1a1a1a]">
              College vs College <span className="text-blue-600">Tournaments</span>
            </ScrollParallaxHeading>
            <p className="text-[11px] font-mono text-[#1a1a1a]/60 mt-1 uppercase tracking-wider">
              High-intensity collegiate showdowns, sports scholarships, and campus bragging rights.
            </p>
          </div>
        </div>

        {/* College Grid - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 overflow-hidden">
          {/* Card 1 - College Cricket */}
          <ScrollReveal direction="left" delay={0}>
            <div onClick={() => navigate('/tournament/college-cricket')} className="border border-blue-300/40 bg-gradient-to-br from-[#081b2a] to-[#0c2b42] rounded-[2rem] p-6 relative flex flex-col justify-end h-80 md:h-96 overflow-hidden group hover:border-blue-400/70 transition-colors cursor-pointer text-white">
              <div className="absolute inset-0 top-0 left-0 right-0 bottom-20 flex items-center justify-center pointer-events-none">
                <img 
                  src="/varsity_cricket_card.jpg" 
                  alt="Varsity Cricket Trophy" 
                  className="w-[90%] h-[75%] object-contain rounded-xl border border-white/10 shadow-[0_12px_24px_rgba(0,0,0,0.3)] transition-all duration-500 group-hover:scale-105"
                />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 px-2">
                <h3 className="text-xl md:text-2xl font-display italic font-bold text-white">Varsity Cricket Trophy</h3>
                <span className="text-[10px] md:text-xs font-mono text-white/50">cricket, college, varsity</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 2 - College Esports */}
          <ScrollReveal direction="right" delay={0.15}>
            <div onClick={() => navigate('/tournament/college-esports')} className="border border-cyan-300/40 bg-gradient-to-br from-[#051e24] to-[#0a2e38] rounded-[2rem] p-6 relative flex flex-col justify-end h-80 md:h-96 overflow-hidden group hover:border-cyan-400/70 transition-colors cursor-pointer text-white">
              <img 
                src="/college_esports_card.png" 
                alt="Inter-Collegiate Esports League" 
                className="absolute inset-0 w-full h-full object-cover scale-[1.08] -translate-y-[3%] group-hover:scale-[1.12] transition-transform duration-500"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a2e38] via-[#0a2e38]/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 px-2">
                <h3 className="text-xl md:text-2xl font-display italic font-bold text-white">Inter-Collegiate Esports League</h3>
                <span className="text-[10px] md:text-xs font-mono text-white/50">esports, college, gaming</span>
              </div>
            </div>
          </ScrollReveal>
        </div>


        <div className="mb-12 max-w-2xl pt-12 border-t border-[#1a1a1a]/10">
          <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#1a1a1a]/50 mb-3">
            <span className="w-5 h-[2px] bg-[#1a1a1a]/30 inline-block" />What We Build
          </span>
          <ScrollParallaxHeading axis="y" direction={1} speed={25} className="text-3xl md:text-4xl font-black italic font-display text-[#1a1a1a] mb-6 leading-tight">
            Leagues we help you <span className="text-[#e86c3f]">build...</span>
          </ScrollParallaxHeading>
          <p className="text-[11px] font-mono text-[#1a1a1a]/70 leading-relaxed uppercase tracking-widest">
            From zero to kickoff, we design digital systems that simplify complexity, and turn bold ideas into local tournaments people love - and players believe in.
          </p>
        </div>

        {/* Tilted overlapping cards row */}
        <div className="flex justify-start md:justify-center -space-x-4 md:-space-x-8 mt-12 overflow-x-auto overflow-y-visible py-12 px-4 hide-scrollbar">
          {[
            { 
              bg: 'bg-[#402010]', rot: '-rotate-[15deg]', h: 'h-36 md:h-48', border: 'border-white/20',
              content: (
                <div className="absolute inset-0 flex flex-col justify-center items-center opacity-80 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl mb-2">🏆</span>
                  <div className="w-12 h-2 bg-white/30 rounded-full"></div>
                </div>
              )
            },
            { 
              bg: 'bg-[#facc15]', rot: 'rotate-[12deg]', h: 'h-40 md:h-56', border: 'border-black/10',
              content: (
                <div className="absolute inset-0 flex flex-col justify-center items-center gap-2 opacity-80 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-16 h-8 border-2 border-black/20 rounded-lg flex items-center justify-center font-black text-black/40 text-xs">VS</div>
                  <div className="w-12 h-2 bg-black/20 rounded-full"></div>
                </div>
              )
            },
            { 
              bg: 'bg-[#1a1a1a]', rot: '-rotate-[8deg]', h: 'h-36 md:h-48', border: 'border-white/20',
              content: (
                <div className="absolute inset-0 flex flex-col justify-center items-center gap-3 group-hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-white/10 relative">
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#3cc85a] rounded-full border border-[#1a1a1a]"></div>
                  </div>
                  <div className="w-14 h-2 bg-white/20 rounded-full"></div>
                  <div className="w-8 h-2 bg-white/10 rounded-full"></div>
                </div>
              )
            },
            { 
              bg: 'bg-white', rot: 'rotate-[15deg]', h: 'h-40 md:h-56', border: 'border-gray-200',
              content: (
                <div className="absolute inset-0 flex flex-col justify-center items-center gap-2 group-hover:rotate-12 transition-transform duration-300">
                  <div className="grid grid-cols-3 gap-1.5 p-2 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                    <div className="w-4 h-4 bg-gray-200 rounded-sm"></div>
                    <div className="w-4 h-4 bg-[#3cc85a] rounded-sm shadow-[0_0_8px_rgba(60,200,90,0.6)]"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded-sm"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded-sm"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded-sm"></div>
                    <div className="w-4 h-4 bg-[#e86c3f] rounded-sm"></div>
                  </div>
                </div>
              )
            },
            { 
              bg: 'bg-[#00b4d8]', rot: '-rotate-[12deg]', h: 'h-36 md:h-48', border: 'border-white/30',
              content: (
                <div className="absolute inset-0 flex justify-center items-center">
                  <Compass className="w-10 h-10 text-black/50 group-hover:rotate-90 group-hover:scale-125 transition-transform duration-500 ease-in-out" strokeWidth={1.5} />
                </div>
              )
            },
            { 
              bg: 'bg-[#e86c3f]', rot: 'rotate-[10deg]', h: 'h-40 md:h-56', border: 'border-white/20',
              content: (
                <div className="absolute inset-0 flex items-end justify-center gap-2 pb-14">
                  <div className="w-4 h-6 bg-white/40 rounded-t-sm group-hover:h-12 transition-all duration-300"></div>
                  <div className="w-4 h-12 bg-white/80 rounded-t-sm group-hover:h-20 transition-all duration-500 delay-75 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                  <div className="w-4 h-8 bg-white/60 rounded-t-sm group-hover:h-16 transition-all duration-300 delay-150"></div>
                </div>
              )
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`w-28 min-w-[7rem] md:w-36 md:min-w-[9rem] ${item.h} rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl border-2 ${item.border} transform hover:-translate-y-6 md:hover:-translate-y-8 hover:scale-105 transition-all duration-300 ${item.rot} ${item.bg} relative overflow-hidden flex-shrink-0 cursor-pointer group hover:z-50`}
            >
              {item.content}
              <div className={`absolute top-3 left-3 w-3 h-3 md:w-4 md:h-4 rounded-full ${item.bg === 'bg-[#facc15]' || item.bg === 'bg-white' ? 'bg-black/10' : 'bg-white/20'}`}></div>
              <div className={`absolute bottom-4 left-4 right-4 h-1.5 md:h-2 rounded-full ${item.bg === 'bg-[#facc15]' || item.bg === 'bg-white' ? 'bg-black/10' : 'bg-white/20'}`}></div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          FRAME 3: ASYMMETRICAL FEATURES OVERLAPS
         ========================================== */}
      <section id="journey" className="py-24 max-w-6xl mx-auto px-8 relative z-10 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left rotatable title */}
          <div className="lg:col-span-4 flex items-center justify-start lg:justify-center relative h-16 lg:h-80">
            <ScrollReveal direction="left" delay={0}>
              <ScrollParallaxHeading axis="y" direction={-1} speed={25} className="text-3xl font-extrabold font-display uppercase tracking-wider text-[#1a1a1a] lg:-rotate-90 lg:origin-center lg:absolute lg:-translate-x-8">
                Start your journey
              </ScrollParallaxHeading>
            </ScrollReveal>
          </div>

          {/* Right overlapping cards deck */}
          <div className="lg:col-span-8 flex flex-col md:flex-row gap-8 relative items-center justify-center">
            {/* Card 1 */}
            <ScrollReveal direction="up" delay={0.1}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                onClick={() => user ? navigate('/dashboard?tab=host') : onOpenAuth()}
                className="bg-yellow-100 border-[3px] border-[#1a1a1a] p-8 rounded-2xl w-full md:w-80 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] relative z-20 md:-rotate-3 interactive-target cursor-pointer"
              >
                <div className="bg-[#cffafe] border-2 border-[#1a1a1a] p-2 w-max rounded-lg mb-4 shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)]">
                  <Sparkles className="w-5 h-5 text-[#1a1a1a]" />
                </div>
                <h3 className="text-lg font-bold font-display uppercase text-[#1a1a1a] mb-3">
                  Host Events
                </h3>
                <p className="text-[10px] text-[#1a1a1a]/85 leading-relaxed font-semibold">
                  Set up local matches. Capture physical ground coordinates, specify entry slots, verify list stakes, set referee payouts, and issue private address passes to captain check-ins.
                </p>
              </motion.div>
            </ScrollReveal>

            {/* Card 2 */}
            <ScrollReveal direction="up" delay={0.25}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                onClick={() => user ? navigate('/dashboard?tab=join') : onOpenAuth()}
                className="bg-[#dcfce7] border-[3px] border-[#1a1a1a] p-8 rounded-2xl w-full md:w-80 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] relative z-10 md:rotate-3 md:-translate-x-4 interactive-target cursor-pointer"
              >
                <div className="bg-yellow-200 border-2 border-[#1a1a1a] p-2 w-max rounded-lg mb-4 shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)]">
                  <Pin className="w-5 h-5 text-[#1a1a1a]" />
                </div>
                <h3 className="text-lg font-bold font-display uppercase text-[#1a1a1a] mb-3">
                  Join Teams
                </h3>
                <p className="text-[10px] text-[#1a1a1a]/85 leading-relaxed font-semibold">
                  Submit team rosters. Provide details for up to 6 players, verify age bounds, accept guidelines, and check private coordinate lobby access immediately.
                </p>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ==========================================
          FRAME 4: WHO WE ARE
         ========================================== */}
      <section id="team" className="py-24 max-w-6xl mx-auto px-8 relative z-10 border-t border-[#1a1a1a]/10">
        <div className="mb-20">
          <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#1a1a1a]/50 mb-3">
            <span className="w-5 h-[2px] bg-[#1a1a1a]/30 inline-block" />The Team
          </span>
          <ScrollParallaxHeading axis="y" direction={-1} speed={25} className="text-4xl md:text-5xl font-black italic font-display text-[#1a1a1a] mb-6 leading-tight">
            Who we are <span className="text-[#e86c3f]">(and why that matters)</span>
          </ScrollParallaxHeading>
          <p className="text-[11px] font-mono text-[#1a1a1a]/70 uppercase tracking-widest">
            Finally, meet the team behind the action!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-start overflow-hidden">
          {/* Left Column */}
          <ScrollReveal direction="left" delay={0}>
            <div className="space-y-20 relative">
              {/* Mock Polaroid Cluster */}
              <div className="relative w-full h-64 flex justify-center items-center group">
                <div className="absolute inset-0 bg-[#bde3fb]/20 rounded-xl" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                {/* Photo 1 */}
                <div className="w-32 h-40 bg-white p-2 shadow-xl -rotate-[15deg] absolute left-12 top-4 group-hover:-rotate-[25deg] transition-transform duration-500 rounded-sm">
                  <div className="w-full h-28 bg-[#dcfce7] rounded-sm overflow-hidden flex items-center justify-center text-4xl">⚽</div>
                  <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full border-2 border-white shadow-md bg-blue-500 flex items-center justify-center text-white font-bold text-[10px]">NL</div>
                </div>
                {/* Photo 2 */}
                <div className="w-36 h-44 bg-white p-2 shadow-2xl rotate-[5deg] absolute left-1/3 top-2 group-hover:rotate-[10deg] group-hover:scale-110 transition-transform duration-500 rounded-sm z-10">
                  <div className="w-full h-32 bg-[#cffafe] rounded-sm overflow-hidden flex items-center justify-center text-5xl">🏆</div>
                  <div className="absolute -bottom-3 -left-3 w-8 h-8 rounded-full border-2 border-white shadow-md bg-red-500 flex items-center justify-center text-white font-bold text-[10px]">PL</div>
                </div>
                {/* Dashed Line SVG simulating the one in the image */}
                <svg className="absolute top-0 right-10 w-32 h-32 text-[#1a1a1a]/20" fill="none" viewBox="0 0 100 100">
                  <path d="M10,90 Q50,10 90,50" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                  <polygon points="90,50 85,45 85,55" fill="currentColor" />
                </svg>
              </div>

              <div className="font-mono text-xs text-[#1a1a1a]/80 leading-relaxed space-y-4">
                <p>Tournaments have always been our thing - from chaotic WhatsApp groups to organizing local ground slots. When we're not designing, you'll find us coordinating new leagues, chasing weekend trophies, or vibing with our running club.</p>
                <p>Because, at the core of it all, we love helping local sports move faster, cleaner, and with fewer misfires. When things click, your tournament becomes undeniable.</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Right Column */}
          <ScrollReveal direction="right" delay={0.2}>
            <div className="space-y-20 relative pt-12 md:pt-32">
              <div className="font-mono text-xs text-[#1a1a1a]/80 leading-relaxed space-y-4">
                <p>We're a strategic team who works hands-on with fast-moving organizers. Driven by clarity, simplicity, and love for action. We've built brackets, interfaces, and systems for physical sports across the country.</p>
                <p>That same drive to communicate clearly and explore new perspectives shows up in how we work, and how we live. We speak code, sports, and community - slowly but surely, one match at a time.</p>
              </div>

              {/* Mock Polaroid Cluster */}
              <div className="relative w-full h-64 flex justify-center items-center group">
                <div className="absolute inset-0 bg-[#bde3fb]/20 rounded-xl" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="w-28 h-36 bg-white p-1.5 shadow-lg rotate-[12deg] absolute right-12 bottom-4 group-hover:rotate-[20deg] transition-transform duration-500 rounded-sm">
                  <div className="w-full h-28 bg-[#ffedd5] rounded-sm overflow-hidden flex items-center justify-center text-3xl">🏏</div>
                </div>
                <div className="w-28 h-36 bg-white p-1.5 shadow-xl -rotate-[8deg] absolute right-1/3 bottom-8 group-hover:-rotate-[15deg] group-hover:scale-110 transition-transform duration-500 rounded-sm z-10">
                  <div className="w-full h-28 bg-[#fef08a] rounded-sm overflow-hidden flex items-center justify-center text-3xl">🏀</div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==========================================
          FRAME 5: CASE STUDY
         ========================================== */}
      <section id="case-study" className="py-24 max-w-5xl mx-auto px-8 relative z-10 border-t border-[#1a1a1a]/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <ScrollParallaxHeading axis="y" direction={1} speed={25} className="text-4xl md:text-[2.75rem] font-display italic font-bold text-[#1a1a1a] mb-6 max-w-2xl leading-tight">
              System Control: Scaling Local Tournaments with a Digital Engine
            </ScrollParallaxHeading>
            <p className="text-xs font-mono text-[#1a1a1a]/70 leading-relaxed max-w-xl">
              Translating chaotic weekend matches into production ready brackets using a reusable digital ecosystem.
            </p>
          </div>
          <button 
            onClick={() => user ? navigate('/dashboard') : onOpenAuth()}
            className="hidden md:flex bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full font-bold font-mono text-[10px] items-center gap-2 hover:scale-105 transition-transform shadow-[0_8px_16px_rgba(0,0,0,0.4)] interactive-target uppercase tracking-wider whitespace-nowrap cursor-pointer z-50 relative"
          >
            View Live <span className="rotate-45 block">↗</span>
          </button>
        </div>

        {/* Two-Column Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 overflow-hidden">
          <ScrollReveal direction="up" delay={0}>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow h-full">
              <div>
                <h3 className="text-xl font-display italic font-bold text-[#1a1a1a] mb-4">Overview</h3>
                <p className="text-xs font-mono text-[#1a1a1a]/70 leading-relaxed mb-6">
                  Team: Andreas (Full-stack), Andres (Product/Manager), Sam (Design System Lead), Tom (Arena concepts), Copywriter, and Will (Dev)
                </p>
              </div>
              <p className="text-[10px] font-mono text-[#1a1a1a]/40">Created at: https://novahub.com/</p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={0.15}>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow h-full">
              <div>
                <h3 className="text-xl font-display italic font-bold text-[#1a1a1a] mb-4">What I worked on</h3>
                <p className="text-xs font-mono text-[#1a1a1a]/70 leading-relaxed">
                  Design system theming, UI layout across tournament pages, bracket translation, copy to layout structuring, QA support, and live score update templates.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Hero Image Mockup */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="w-full h-80 md:h-[32rem] bg-gradient-to-br from-[#2b3a20] to-[#1e2a15] rounded-[2rem] mb-6 overflow-hidden relative flex flex-col shadow-xl group cursor-pointer" onClick={() => user ? navigate('/dashboard') : onOpenAuth()}>
            {/* Top Bar simulating a browser/website */}
            <div className="w-full h-16 border-b border-white/10 flex items-center justify-between px-8 text-white text-[10px] md:text-xs font-bold font-mono">
              <div className="hidden md:flex gap-6">
                <span className="hover:text-yellow-400 cursor-pointer transition-colors">Home</span>
                <span className="hover:text-yellow-400 cursor-pointer transition-colors">About Us</span>
                <span className="hover:text-yellow-400 cursor-pointer transition-colors">Leagues</span>
                <span className="hover:text-yellow-400 cursor-pointer transition-colors">News</span>
              </div>
              <div className="text-xl font-bold font-display uppercase tracking-widest text-[#facc15] mx-auto md:mx-0">
                <span className="text-white opacity-80 mr-2 text-lg">⚡</span>NOVA PRO
              </div>
              <div className="hidden md:block border border-white/30 rounded-full px-6 py-2 hover:bg-white/10 cursor-pointer transition-colors">Contact</div>
            </div>
            
            {/* Huge abstract background shapes simulating the image */}
            <div className="absolute inset-0 top-16 opacity-30 flex justify-center items-center overflow-hidden pointer-events-none group-hover:scale-105 transition-transform duration-700">
              {/* Massive angled bars */}
              <div className="w-32 h-[150%] bg-[#405430] absolute -rotate-[30deg] -left-10 shadow-2xl"></div>
              <div className="w-32 h-[150%] bg-[#405430] absolute -rotate-[30deg] left-40 shadow-2xl"></div>
              <div className="w-32 h-[150%] bg-[#405430] absolute -rotate-[30deg] left-96 shadow-2xl"></div>
              <div className="w-48 h-[150%] bg-[#405430] absolute rotate-[45deg] right-0 shadow-2xl"></div>
              <div className="w-48 h-[150%] bg-[#405430] absolute rotate-[45deg] -right-48 shadow-2xl"></div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-end p-8 md:p-12 text-white">
              <ScrollParallaxHeading axis="x" direction={-1} speed={35} className="text-4xl md:text-6xl font-display font-black leading-tight mb-4">
                Experience you can <span className="text-[#e86c3f]">rely on</span>
              </ScrollParallaxHeading>
              <p className="text-[10px] font-mono max-w-sm leading-relaxed text-white/70 mb-6 font-semibold">
                Nova Hub operates across Weekend Leagues, International Qualifiers, and Corporate Cups, with a focus on mid-market physical arenas. We provide local managers with decisive bracket generation and technical depth where it matters most.
              </p>
              <button className="bg-[#e86c3f] text-white px-5 py-2.5 rounded-full font-bold font-mono text-[10px] w-max hover:bg-[#d45b30] transition-colors shadow-lg">
                Discover our platform
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Bottom Two Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 overflow-hidden">
          <ScrollReveal direction="left" delay={0}>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between h-48 md:h-56 hover:shadow-md transition-shadow">
              <p className="text-xs font-mono text-[#1a1a1a]/80 leading-relaxed max-w-xs">
                Helped ship multiple league instances by adapting a modular design system to new sports identities and turning basic texts into structured, on-brand match layouts.
              </p>
              <h3 className="text-lg font-display italic font-bold text-[#1a1a1a]">Mission: Sports conglomerate</h3>
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="right" delay={0.15}>
            <div className="bg-[#bde3fb]/40 rounded-3xl p-8 flex flex-col justify-center items-center h-48 md:h-56 border border-[#bde3fb] overflow-hidden relative group cursor-pointer" onClick={() => user ? navigate('/dashboard') : onOpenAuth()}>
              <div className="absolute inset-0 bg-[#bde3fb]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="text-white text-5xl md:text-6xl drop-shadow-md mb-2 group-hover:-translate-y-1 transition-transform">⚡</div>
              <h3 className="text-xl md:text-3xl font-display uppercase font-black text-[#1a1a1a] tracking-[0.1em] drop-shadow-md text-center group-hover:scale-105 transition-transform">
                NOVA PRO
              </h3>
            </div>
          </ScrollReveal>
        </div>

        {/* Footer Challenge text */}
        <ScrollReveal direction="up" delay={0}>
          <div className="max-w-3xl">
            <h3 className="text-xl font-display italic font-bold text-[#1a1a1a] mb-4">The challenge:</h3>
            <p className="text-xs font-mono text-[#1a1a1a]/80 leading-relaxed text-justify">
              Local arenas launch multiple weekend tournaments quickly. Branding comes from different organizers, but the brackets must be built fast, consistently, and within tight timelines. Inputs were often incomplete (WhatsApp texts, basic guidelines) that didn't always fit components, so the real work was making everything "snap" into a cohesive system without reinventing the rules each time.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ==========================================
          FRAME 5.5: FEATURED CAROUSEL + GAMING BRANDS
         ========================================== */}
      <FeaturedCarousel />

      {/* ==========================================
          FRAME 5.8: FREQUENTLY ASKED QUESTIONS (FAQ)
         ========================================== */}
      <section id="faq" className="py-24 max-w-6xl mx-auto px-8 relative z-10 border-t border-[#1a1a1a]/10">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#1a1a1a]/50 dark:text-white/50 mb-3">
            <span className="w-5 h-[2px] bg-[#1a1a1a]/30 dark:bg-white/30 inline-block" />FAQ
          </span>
          <ScrollParallaxHeading axis="y" direction={1} speed={25} className="text-4xl md:text-5xl font-black italic font-display text-[#1a1a1a] dark:text-white mb-6 leading-tight">
            Frequently Asked <span className="text-[#e86c3f]">Questions</span>
          </ScrollParallaxHeading>
          <p className="text-xs font-mono text-[#1a1a1a]/70 dark:text-white/70 uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about Nova Hub, your useful community dashboard for local events, brackets, and team registrations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          {/* Column 1 */}
          <ScrollReveal direction="left" delay={0}>
            <div className="space-y-4">
              {FAQ_ITEMS.slice(0, 6).map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white dark:bg-[#121420] border-[3px] border-[#1a1a1a] dark:border-white/20 rounded-2xl p-5 shadow-[4px_4px_0px_rgba(26,26,26,1)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_rgba(26,26,26,1)] dark:hover:shadow-[6px_6px_0px_rgba(255,255,255,0.15)] cursor-pointer"
                  onClick={() => toggleFaq(item.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 shrink-0 rounded-md bg-[#1a1a1a] dark:bg-white/10 text-white flex items-center justify-center font-bold text-xs select-none">
                      <span className={`transition-transform duration-300 inline-block font-sans font-bold text-base ${openFaq[item.id] ? 'rotate-[135deg] text-yellow-400' : 'rotate-0'}`}>
                        +
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-sm md:text-base text-[#1a1a1a] dark:text-white select-none">
                      {item.question}
                    </h3>
                  </div>
                  {openFaq[item.id] && (
                    <p className="mt-4 text-xs md:text-sm font-mono text-[#1a1a1a]/85 dark:text-white/85 border-t border-[#1a1a1a]/10 dark:border-white/10 pt-4 leading-relaxed animate-slide-in">
                      {item.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Column 2 */}
          <ScrollReveal direction="right" delay={0.15}>
            <div className="space-y-4">
              {FAQ_ITEMS.slice(6).map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white dark:bg-[#121420] border-[3px] border-[#1a1a1a] dark:border-white/20 rounded-2xl p-5 shadow-[4px_4px_0px_rgba(26,26,26,1)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_rgba(26,26,26,1)] dark:hover:shadow-[6px_6px_0px_rgba(255,255,255,0.15)] cursor-pointer"
                  onClick={() => toggleFaq(item.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 shrink-0 rounded-md bg-[#1a1a1a] dark:bg-white/10 text-white flex items-center justify-center font-bold text-xs select-none">
                      <span className={`transition-transform duration-300 inline-block font-sans font-bold text-base ${openFaq[item.id] ? 'rotate-[135deg] text-yellow-400' : 'rotate-0'}`}>
                        +
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-sm md:text-base text-[#1a1a1a] dark:text-white select-none">
                      {item.question}
                    </h3>
                  </div>
                  {openFaq[item.id] && (
                    <p className="mt-4 text-xs md:text-sm font-mono text-[#1a1a1a]/85 dark:text-white/85 border-t border-[#1a1a1a]/10 dark:border-white/10 pt-4 leading-relaxed animate-slide-in">
                      {item.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==========================================
          FRAME 6: TESTIMONIALS
         ========================================== */}
      <section id="testimonials" className="py-24 max-w-6xl mx-auto px-8 relative z-10 border-t border-[#1a1a1a]/10">
        <div className="mb-16">
          <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#1a1a1a]/50 mb-3">
            <span className="w-5 h-[2px] bg-[#1a1a1a]/30 inline-block" />Testimonials
          </span>
          <ScrollParallaxHeading axis="y" direction={1} speed={25} className="text-4xl md:text-5xl font-black italic font-display text-[#1a1a1a] mb-6 leading-tight">
            Real talk from <span className="text-[#e86c3f]">captains</span> we play with...
          </ScrollParallaxHeading>
          <p className="text-[11px] font-mono text-[#1a1a1a]/70 uppercase tracking-widest max-w-xl leading-relaxed">
            Real results, real matches. Here's how past partners describe working together - from setup to winning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden">
          {/* Large Photo Card 1 */}
          <ScrollReveal direction="left" delay={0}>
            <div className="h-[28rem] md:h-[36rem] bg-[#222] rounded-[2rem] p-8 flex flex-col justify-end relative overflow-hidden group cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
              <img 
                src="/david.png" 
                alt="David Van Den Bosch" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              
              <div className="relative z-10 text-white">
                <div className="w-10 h-10 bg-white rounded-md mb-4 flex items-center justify-center shadow-lg"><span className="text-xl">⚽</span></div>
                <h3 className="text-2xl font-display italic font-bold mb-1">David Van Den Bosch</h3>
                <p className="text-[10px] font-mono uppercase tracking-wider mb-6 text-white/70">Captain of City Strikers</p>
                <p className="text-xs md:text-sm font-bold font-mono leading-relaxed text-white/90">
                  "Nova Hub took responsibility at every stage of the tournament. Exceeding expectations, and delivering outstanding ground management."
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Large Photo Card 2 */}
          <ScrollReveal direction="right" delay={0.15}>
            <div className="h-[28rem] md:h-[36rem] bg-[#222] rounded-[2rem] p-8 flex flex-col justify-end relative overflow-hidden group cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
              <img 
                src="/rik.png" 
                alt="Rik Van Wieren" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              
              <div className="relative z-10 text-white">
                <div className="w-10 h-10 bg-[#1a1a1a] border border-white/20 rounded-md mb-4 flex items-center justify-center shadow-lg"><span className="text-xl font-bold">NH</span></div>
                <h3 className="text-2xl font-display italic font-bold mb-1">Rik Van Wieren</h3>
                <p className="text-[10px] font-mono uppercase tracking-wider mb-6 text-white/70">Tournament Organizer</p>
                <p className="text-xs md:text-sm font-bold font-mono leading-relaxed text-white/90">
                  "We set up our summer cricket league through them. The automated brackets and player check-ins saved us hours of chaos."
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Small Quote Card 1 */}
          <ScrollReveal direction="left" delay={0}>
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:-translate-y-2 transition-transform duration-300 h-full">
              <div className="w-12 h-12 bg-gray-200 rounded-full mb-6 overflow-hidden flex items-center justify-center"><span className="text-2xl">👨</span></div>
              <p className="text-xs font-mono text-[#1a1a1a]/80 leading-relaxed font-semibold mb-8">
                "The team is very polite and hardworking. They bring energy to every tournament. I am particularly impressed with their ability to provide high attention to detail without compromising speed."
              </p>
              <h4 className="text-xl font-display italic font-bold text-[#1a1a1a] mb-1">Robin Schildmeijer</h4>
              <p className="text-[9px] font-mono uppercase tracking-widest text-[#1a1a1a]/50">Arena Manager</p>
            </div>
          </ScrollReveal>

          {/* Small Quote Card 2 */}
          <ScrollReveal direction="right" delay={0.15}>
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:-translate-y-2 transition-transform duration-300 h-full">
              <div className="w-12 h-12 bg-gray-200 rounded-full mb-6 overflow-hidden flex items-center justify-center"><span className="text-2xl">👩‍🏫</span></div>
              <p className="text-xs font-mono text-[#1a1a1a]/80 leading-relaxed font-semibold mb-8">
                "They are very analytical organizers. They take the challenge and process very seriously, and that shows in their league platform. Every detail is meticulously considered."
              </p>
              <h4 className="text-xl font-display italic font-bold text-[#1a1a1a] mb-1">Mitchell Jacobs</h4>
              <p className="text-[9px] font-mono uppercase tracking-widest text-[#1a1a1a]/50">Founder of Turf Masters</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer now handled globally in App.jsx */}

      {/* ==========================================
          FRAME: HELP DESK / CONTACT SUPPORT
         ========================================== */}
      <section id="contact" className="py-28 px-8 md:px-24 relative z-10 bg-[#c4e4e3] text-[#1a1a1a] overflow-hidden">
        {/* Background texture grid */}
        <div className="absolute inset-0 opacity-20 carbon-grid pointer-events-none" />

        {/* Floating corner badge */}
        <div className="absolute top-8 right-8 border border-[#1a1a1a]/20 px-4 py-2 text-[9px] uppercase tracking-[0.3em] text-[#1a1a1a]/40 hidden md:block">
          SUPPORT DESK // EST. 2026
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Section heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#1a1a1a]/60 font-bold block mb-4">★ Help Desk</span>
            <ScrollParallaxHeading axis="y" direction={1} speed={25} className="text-5xl md:text-7xl font-display font-black italic leading-none text-[#1a1a1a] mb-4">
              Reach out to<br />
              <span className="underline decoration-yellow-400 decoration-[6px] underline-offset-4">Nova Support.</span>
            </ScrollParallaxHeading>
            <p className="text-xs md:text-sm font-mono text-[#1a1a1a]/60 max-w-lg mt-6 leading-relaxed uppercase tracking-wider">
              Need help with brackets, ground bookings, player check-ins, or billing? Our desk team responds within 24 hours.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            {/* Left info column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="lg:col-span-2 flex flex-col gap-8"
            >
              {[
                { icon: '📧', label: 'Email Support', value: 'support@novahub.in', sub: 'Response within 24 hrs' },
                { icon: '💬', label: 'Live Chat', value: 'Available in Dashboard', sub: 'Mon–Sat, 9 AM – 7 PM IST' },
                { icon: '📞', label: 'Helpline', value: '+91 98765 43210', sub: 'Urgent tournament issues only' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-5 group">
                  <div className="w-12 h-12 flex-shrink-0 bg-white/60 border-[2px] border-[#1a1a1a]/20 rounded-xl flex items-center justify-center text-2xl group-hover:bg-yellow-200 group-hover:border-[#1a1a1a] transition-all shadow-[2px_2px_0px_rgba(26,26,26,0.1)]">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/50 mb-0.5">{item.label}</p>
                    <p className="text-sm font-bold font-mono text-[#1a1a1a]">{item.value}</p>
                    <p className="text-[10px] font-mono text-[#1a1a1a]/40 mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}

              {/* Decorative divider */}
              <div className="h-px w-full bg-[#1a1a1a]/15 my-2" />

              <p className="text-[10px] font-mono text-[#1a1a1a]/40 leading-relaxed uppercase tracking-widest">
                Nova Hub Support is a dedicated team handling tournament disputes, access issues, and platform feedback. We take every message seriously.
              </p>
            </motion.div>

            {/* Right form */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const btn = form.querySelector('button[type=submit]');
                  if (btn) {
                    btn.textContent = '✓ Message Sent!';
                    btn.classList.add('bg-green-400');
                    btn.classList.remove('bg-yellow-200', 'hover:bg-yellow-300');
                    // Reset fields immediately
                    form.reset();
                    setTimeout(() => {
                      btn.textContent = 'Send Message →';
                      btn.classList.remove('bg-green-400');
                      btn.classList.add('bg-yellow-200', 'hover:bg-yellow-300');
                    }, 2500);
                  }
                }}
                className="bg-white/60 border-[3px] border-[#1a1a1a] rounded-[2rem] p-8 md:p-10 shadow-[8px_8px_0px_rgba(26,26,26,1)]"
              >
                {/* Name + Email row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label htmlFor="contact-name" className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/60 font-bold block mb-2">Your Name</label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. Arjun Mehta"
                      autoComplete="name"
                      className="w-full bg-transparent border-b-2 border-[#1a1a1a]/30 focus:border-[#1a1a1a] py-3 text-sm font-mono text-[#1a1a1a] placeholder-[#1a1a1a]/30 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/60 font-bold block mb-2">Email Address</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@email.com"
                      autoComplete="email"
                      className="w-full bg-transparent border-b-2 border-[#1a1a1a]/30 focus:border-[#1a1a1a] py-3 text-sm font-mono text-[#1a1a1a] placeholder-[#1a1a1a]/30 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="mb-5">
                  <label htmlFor="contact-subject" className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/60 font-bold block mb-2">Subject / Topic</label>
                  <select
                    id="contact-subject"
                    name="subject"
                    className="w-full bg-white/50 border-b-2 border-[#1a1a1a]/30 focus:border-[#1a1a1a] py-3 text-sm font-mono text-[#1a1a1a] outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">— Select a topic —</option>
                    <option>Tournament Registration Issue</option>
                    <option>Ground / Venue Booking</option>
                    <option>Bracket or Score Error</option>
                    <option>Login / Account Access</option>
                    <option>Payment or Billing</option>
                    <option>General Feedback</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Message */}
                <div className="mb-8">
                  <label htmlFor="contact-message" className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/60 font-bold block mb-2">Your Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Describe your issue or question in detail..."
                    className="w-full bg-white/40 border-[2px] border-[#1a1a1a]/20 focus:border-[#1a1a1a] rounded-xl p-4 text-sm font-mono text-[#1a1a1a] placeholder-[#1a1a1a]/30 outline-none resize-none transition-colors"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full bg-yellow-200 hover:bg-yellow-300 text-[#1a1a1a] font-black uppercase tracking-wider text-sm py-4 rounded-xl transition-all shadow-[6px_6px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 border-[3px] border-[#1a1a1a]"
                >
                  Send Message →
                </button>

                <p className="text-[9px] font-mono text-[#1a1a1a]/30 uppercase tracking-widest text-center mt-5">
                  Your data is confidential. We will never share your information with third parties.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==========================================
          FRAME: OUR SERVICES
         ========================================== */}
      <section id="services" className="py-28 px-4 md:px-24 bg-[#c4e4e3] text-[#1a1a1a] relative z-10 overflow-visible border-t-[3px] border-b-[3px] border-[#1a1a1a]">
        {/* Background texture grid */}
        <div className="absolute inset-0 opacity-20 carbon-grid pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Section heading */}
          <div className="text-center mb-20">
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#1a1a1a]/60 font-bold block mb-4">★ Platform Ecosystem</span>
            <ScrollParallaxHeading axis="y" direction={-1} speed={25} className="text-5xl md:text-7xl font-playfair italic font-bold leading-none text-[#1a1a1a]">
              Our services
            </ScrollParallaxHeading>
          </div>

          <div ref={servicesContainerRef} className="relative max-w-5xl mx-auto flex flex-col pb-12">
            {/* Card 1 Track */}
            <div className="h-[50vh] sticky top-24 md:top-32 flex justify-center items-start z-10">
              <motion.div 
                style={{ scale: card1Scale, filter: card1Brightness }}
                whileHover={{ scale: 1.02, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-full min-h-[420px] md:min-h-[460px] bg-[#d1fa50] text-[#1a1a1a] rounded-[2rem] border-[3px] border-[#1a1a1a] p-8 md:p-12 shadow-[8px_8px_0px_rgba(26,26,26,1)] flex flex-col md:flex-row gap-8 justify-between items-center overflow-hidden origin-center rotate-[-1.5deg] cursor-pointer"
              >
                <div className="flex-1 flex flex-col items-start text-left gap-4 md:gap-6 relative z-10">
                  <span className="text-[10px] font-mono uppercase tracking-widest bg-white border-2 border-[#1a1a1a] px-3 py-1 shadow-[2px_2px_0px_rgba(26,26,26,1)] font-bold">
                    Service 01
                  </span>
                  <h3 className="text-3xl md:text-5xl font-playfair font-bold leading-tight">
                    League Operations
                  </h3>
                  <p className="text-xs md:text-sm font-mono font-bold leading-relaxed text-[#1a1a1a]/85 max-w-lg">
                    Let's build a professional league for your brand or community.
                  </p>
                  <p className="text-xs md:text-sm font-mono leading-relaxed text-[#1a1a1a]/70 max-w-lg">
                    We handle the complete lifecycle: bracket generation, round robins, automated score sheets, and real-time standing updates. We'll help you build an event that's visually polished, matches fair play guidelines, and feels authentic to your players.
                  </p>
                  <button className="bg-[#1a1a1a] text-white font-mono font-bold uppercase tracking-wider text-xs pl-5 pr-2 py-2 border-[3px] border-[#1a1a1a] rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,0.15)] flex items-center justify-between gap-4 group">
                    <span>Discover our approach</span>
                    <span className="bg-[#d1fa50] text-[#1a1a1a] w-8 h-8 rounded flex items-center justify-center font-black text-sm group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
                
                <div className="flex-shrink-0 w-full md:w-[260px] h-[320px] md:h-[360px] bg-white border-[3px] border-[#1a1a1a] rounded-2xl p-2.5 shadow-[4px_4px_0px_rgba(26,26,26,1)] flex flex-col relative overflow-hidden group z-10">
                  <div className="absolute top-2 right-2 bg-yellow-200 border-2 border-[#1a1a1a] px-2 py-0.5 text-[8px] font-mono font-bold uppercase z-10 shadow-[1px_1px_0px_rgba(26,26,26,1)]">
                    ACTIVE LEAGUE
                  </div>
                  <div className="w-full h-full overflow-hidden rounded-lg border border-[#1a1a1a]/15 relative bg-[#1a1a1a]">
                    <img src="/varsity_cricket_card.jpg" alt="League Operations" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4 text-white">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-yellow-300 font-bold mb-1">★ CRICKET CUP</p>
                      <p className="text-xs font-bold leading-tight">Inter-Collegiate Season 2</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-8 text-7xl md:text-9xl font-playfair font-black text-[#1a1a1a]/5 pointer-events-none select-none z-0">
                  01
                </div>
              </motion.div>
            </div>

            {/* Card 2 Track */}
            <div className="h-[50vh] sticky top-24 md:top-32 flex justify-center items-start z-20">
              <motion.div 
                style={{ scale: card2Scale, filter: card2Brightness }}
                whileHover={{ scale: 1.02, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-full min-h-[420px] md:min-h-[460px] bg-white text-[#1a1a1a] rounded-[2rem] border-[3px] border-[#1a1a1a] p-8 md:p-12 shadow-[8px_8px_0px_rgba(26,26,26,1)] flex flex-col md:flex-row gap-8 justify-between items-center overflow-hidden origin-center rotate-[1deg] cursor-pointer"
              >
                <div className="flex-1 flex flex-col items-start text-left gap-4 md:gap-6 relative z-10">
                  <span className="text-xs font-mono uppercase tracking-widest bg-yellow-200 border-2 border-[#1a1a1a] px-3 py-1 shadow-[2px_2px_0px_rgba(26,26,26,1)] font-bold">
                    Service 02
                  </span>
                  <h3 className="text-3xl md:text-5xl font-playfair font-bold leading-tight">
                    Venue Booking & Sync
                  </h3>
                  <p className="text-xs md:text-sm font-mono font-bold leading-relaxed text-[#1a1a1a]/85 max-w-lg">
                    Real-time venue synchronization for physical grounds & esports arenas.
                  </p>
                  <p className="text-xs md:text-sm font-mono leading-relaxed text-[#1a1a1a]/70 max-w-lg">
                    Venue booking modules sync directly with match timings. Host dashboards manage slots, coordinate referee updates, and issue security check-in passes automatically, preventing scheduling conflicts.
                  </p>
                  <button className="bg-[#1a1a1a] text-white font-mono font-bold uppercase tracking-wider text-xs pl-5 pr-2 py-2 border-[3px] border-[#1a1a1a] rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,0.15)] flex items-center justify-between gap-4 group">
                    <span>Discover our approach</span>
                    <span className="bg-[#d1fa50] text-[#1a1a1a] w-8 h-8 rounded flex items-center justify-center font-black text-sm group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
                
                <div className="flex-shrink-0 w-full md:w-[260px] h-[320px] md:h-[360px] bg-white border-[3px] border-[#1a1a1a] rounded-2xl p-2.5 shadow-[4px_4px_0px_rgba(26,26,26,1)] flex flex-col relative overflow-hidden group z-10">
                  <div className="absolute top-2 right-2 bg-green-200 border-2 border-[#1a1a1a] px-2 py-0.5 text-[8px] font-mono font-bold uppercase z-10 shadow-[1px_1px_0px_rgba(26,26,26,1)]">
                    GROUND SECURED
                  </div>
                  <div className="w-full h-full overflow-hidden rounded-lg border border-[#1a1a1a]/15 relative bg-[#1a1a1a]">
                    <img src="/football_card.jpg" alt="Venue Management" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4 text-white">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-green-300 font-bold mb-1">★ MAP COORDINATES</p>
                      <p className="text-xs font-bold leading-tight">YMCA Ground Pitch B</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-8 text-7xl md:text-9xl font-playfair font-black text-[#1a1a1a]/5 pointer-events-none select-none z-0">
                  02
                </div>
              </motion.div>
            </div>

            {/* Card 3 Track */}
            <div className="h-[50vh] sticky top-24 md:top-32 flex justify-center items-start z-30">
              <motion.div 
                style={{ scale: card3Scale, filter: card3Brightness }}
                whileHover={{ scale: 1.02, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-full min-h-[420px] md:min-h-[460px] bg-[#2ca684] text-white rounded-[2rem] border-[3px] border-[#1a1a1a] p-8 md:p-12 shadow-[8px_8px_0px_rgba(26,26,26,1)] flex flex-col md:flex-row gap-8 justify-between items-center overflow-hidden origin-center rotate-[-0.5deg] cursor-pointer"
              >
                <div className="flex-1 flex flex-col items-start text-left gap-4 md:gap-6 relative z-10">
                  <span className="text-xs font-mono uppercase tracking-widest bg-[#1a1a1a] text-white border-2 border-white/20 px-3 py-1 shadow-[2px_2px_0px_rgba(0,0,0,0.15)] font-bold">
                    Service 03
                  </span>
                  <h3 className="text-3xl md:text-5xl font-playfair font-bold leading-tight">
                    Broadcast & Media
                  </h3>
                  <p className="text-xs md:text-sm font-mono font-bold leading-relaxed text-white/90 max-w-lg">
                    We'll help your matches reach a massive local and global audience.
                  </p>
                  <p className="text-xs md:text-sm font-mono leading-relaxed text-white/75 max-w-lg">
                    If your local turf games lack standard coverage, our media teams step in. We configure high-fidelity streams, overlays, overlay feeds, referee audio, and automated highlights to Twitch & YouTube.
                  </p>
                  <button className="bg-white text-[#1a1a1a] font-mono font-bold uppercase tracking-wider text-xs pl-5 pr-2 py-2 border-[3px] border-[#1a1a1a] rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,0.15)] flex items-center justify-between gap-4 group">
                    <span>Get in touch</span>
                    <span className="bg-[#1a1a1a] text-white w-8 h-8 rounded flex items-center justify-center font-black text-sm group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
                
                <div className="flex-shrink-0 w-full md:w-[260px] h-[320px] md:h-[360px] bg-white border-[3px] border-[#1a1a1a] rounded-2xl p-2.5 shadow-[4px_4px_0px_rgba(26,26,26,1)] flex flex-col relative overflow-hidden group z-10">
                  <div className="absolute top-2 right-2 bg-red-500 text-white border-2 border-[#1a1a1a] px-2 py-0.5 text-[8px] font-mono font-bold uppercase z-10 shadow-[1px_1px_0px_rgba(26,26,26,1)]">
                    LIVE STREAM
                  </div>
                  <div className="w-full h-full overflow-hidden rounded-lg border border-[#1a1a1a]/15 relative bg-[#1a1a1a]">
                    <img src="/college_esports_card.png" alt="Broadcast & Media" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4 text-white">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-red-400 font-bold mb-1">★ LIVE FEED</p>
                      <p className="text-xs font-bold leading-tight">Vite Esports Showcase</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-8 text-7xl md:text-9xl font-playfair font-black text-white/5 pointer-events-none select-none z-0">
                  03
                </div>
              </motion.div>
            </div>

            {/* Card 4 Track */}
            <div className="h-[50vh] sticky top-24 md:top-32 flex justify-center items-start z-40">
              <motion.div 
                style={{ scale: card4Scale, filter: card4Brightness }}
                whileHover={{ scale: 1.02, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-full min-h-[420px] md:min-h-[460px] bg-[#e8f0fe] text-[#1a1a1a] rounded-[2rem] border-[3px] border-[#1a1a1a] p-8 md:p-12 shadow-[8px_8px_0px_rgba(26,26,26,1)] flex flex-col md:flex-row gap-8 justify-between items-center overflow-hidden origin-center rotate-[1.5deg] cursor-pointer"
              >
                <div className="flex-1 flex flex-col items-start text-left gap-4 md:gap-6 relative z-10">
                  <span className="text-xs font-mono uppercase tracking-widest bg-white border-2 border-[#1a1a1a] px-3 py-1 shadow-[2px_2px_0px_rgba(26,26,26,1)] font-bold">
                    Service 04
                  </span>
                  <h3 className="text-3xl md:text-5xl font-playfair font-bold leading-tight">
                    Sponsorships & Brands
                  </h3>
                  <p className="text-xs md:text-sm font-mono font-bold leading-relaxed text-[#1a1a1a]/85 max-w-lg">
                    Connect local turf tournaments with corporate brand sponsors.
                  </p>
                  <p className="text-xs md:text-sm font-mono leading-relaxed text-[#1a1a1a]/70 max-w-lg">
                    We coordinate sponsorship packages: automated local overlays, live stream product slots, and roster discount stamps. Build marketing returns that local match sponsors value.
                  </p>
                  <button className="bg-[#1a1a1a] text-white font-mono font-bold uppercase tracking-wider text-xs pl-5 pr-2 py-2 border-[3px] border-[#1a1a1a] rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,0.15)] flex items-center justify-between gap-4 group">
                    <span>Discover sponsor specs</span>
                    <span className="bg-[#d1fa50] text-[#1a1a1a] w-8 h-8 rounded flex items-center justify-center font-black text-sm group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
                
                <div className="flex-shrink-0 w-full md:w-[260px] h-[320px] md:h-[360px] bg-white border-[3px] border-[#1a1a1a] rounded-2xl p-2.5 shadow-[4px_4px_0px_rgba(26,26,26,1)] flex flex-col relative overflow-hidden group z-10">
                  <div className="absolute top-2 right-2 bg-blue-200 border-2 border-[#1a1a1a] px-2 py-0.5 text-[8px] font-mono font-bold uppercase z-10 shadow-[1px_1px_0px_rgba(26,26,26,1)]">
                    SPONSORS ON-AIR
                  </div>
                  <div className="w-full h-full overflow-hidden rounded-lg border border-[#1a1a1a]/15 relative bg-[#1a1a1a]">
                    <img src="/veloce_card.png" alt="Sponsorships & Brands" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4 text-white">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-blue-300 font-bold mb-1">★ PARTNER NETWORK</p>
                      <p className="text-xs font-bold leading-tight">Veloce Motorsports Campaign</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-8 text-7xl md:text-9xl font-playfair font-black text-[#1a1a1a]/5 pointer-events-none select-none z-0">
                  04
                </div>
              </motion.div>
            </div>

            {/* Card 5 Track */}
            <div className="h-[50vh] sticky top-24 md:top-32 flex justify-center items-start z-50">
              <motion.div 
                whileHover={{ scale: 1.02, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-full min-h-[420px] md:min-h-[460px] bg-[#ffb3ba] text-[#1a1a1a] rounded-[2rem] border-[3px] border-[#1a1a1a] p-8 md:p-12 shadow-[8px_8px_0px_rgba(26,26,26,1)] flex flex-col md:flex-row gap-8 justify-between items-center overflow-hidden origin-center rotate-[-1.5deg] cursor-pointer"
              >
                <div className="flex-1 flex flex-col items-start text-left gap-4 md:gap-6 relative z-10">
                  <span className="text-xs font-mono uppercase tracking-widest bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] px-3 py-1 shadow-[2px_2px_0px_rgba(26,26,26,1)] font-bold">
                    Service 05
                  </span>
                  <h3 className="text-3xl md:text-5xl font-playfair font-bold leading-tight">
                    Anti-Cheat & Roster Check
                  </h3>
                  <p className="text-xs md:text-sm font-mono font-bold leading-relaxed text-[#1a1a1a]/85 max-w-lg">
                    Roster integrity audits and physical validation passes.
                  </p>
                  <p className="text-xs md:text-sm font-mono leading-relaxed text-[#1a1a1a]/70 max-w-lg">
                    Secure registrations with coordinate check-ins, IP scans, age boundary checks, and system validation checks. Every roster parameter is audited and locked before bracket generation.
                  </p>
                  <button className="bg-[#1a1a1a] text-white font-mono font-bold uppercase tracking-wider text-xs pl-5 pr-2 py-2 border-[3px] border-[#1a1a1a] rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,0.15)] flex items-center justify-between gap-4 group">
                    <span>Explore safety check</span>
                    <span className="bg-[#ffb3ba] text-[#1a1a1a] w-8 h-8 rounded flex items-center justify-center font-black text-sm group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
                
                <div className="flex-shrink-0 w-full md:w-[260px] h-[320px] md:h-[360px] bg-white border-[3px] border-[#1a1a1a] rounded-2xl p-2.5 shadow-[4px_4px_0px_rgba(26,26,26,1)] flex flex-col relative overflow-hidden group z-10">
                  <div className="absolute top-2 right-2 bg-red-200 border-2 border-[#1a1a1a] px-2 py-0.5 text-[8px] font-mono font-bold uppercase z-10 shadow-[1px_1px_0px_rgba(26,26,26,1)]">
                    AUDIT COMPLETE
                  </div>
                  <div className="w-full h-full overflow-hidden rounded-lg border border-[#1a1a1a]/15 relative bg-[#1a1a1a]">
                    <img src="/valorant_card.png" alt="Anti-Cheat & Roster Check" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4 text-white">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-red-300 font-bold mb-1">★ ROSTER GUARD</p>
                      <p className="text-xs font-bold leading-tight">Valorant India Cup Stage 1</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-8 text-7xl md:text-9xl font-playfair font-black text-[#1a1a1a]/5 pointer-events-none select-none z-0">
                  05
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Scroll Progress Indicator */}
      <div className="fixed bottom-4 left-4 md:bottom-6 md:left-8 z-40 bg-[#c4e4e3]/95 dark:bg-[#090b11]/95 backdrop-blur-sm p-2.5 md:p-3.5 border-[2px] md:border-[3px] border-[#1a1a1a] dark:border-white/10 shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.15)] md:shadow-[4px_4px_0px_rgba(26,26,26,1)] md:dark:shadow-[4px_4px_0px_rgba(255,255,255,0.15)] rounded-xl md:rounded-2xl flex flex-col gap-1 md:gap-1.5 font-mono select-none">
        <div className="text-[8px] md:text-[9px] font-black tracking-[0.15em] md:tracking-[0.18em] uppercase text-[#1a1a1a]/80 dark:text-white/85">
          {activeSection}
        </div>
        <div className="flex flex-col gap-[2px] md:gap-[3px]">
          {dots}
        </div>
      </div>
    </div>
  );
};
export default LandingPage;
