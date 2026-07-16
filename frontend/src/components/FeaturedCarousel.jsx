import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FEATURED_CARDS = [
  { id:"f1", badge:"Free", gradient:"linear-gradient(135deg,#1e3a5f,#0a2240)", accent:"#4fc3f7", emoji:"🏏", sport:"Cricket", title:"Summer Cricket Open", subtitle:"50+ slots · Stipend Rs.10,000 · CTC upto Rs.8 LPA", meta:"Eligibility: Open for all", cta:"Register FREE", spots:"6/8 Slots", image: "/cricket_card.jpg" },
  { id:"f2", badge:"Online Free", gradient:"linear-gradient(135deg,#2d1b69,#1a0a3e)", accent:"#c084fc", emoji:"🎯", sport:"Valorant", title:"India Top 10 Clubs Valorant 2026", subtitle:"Can your club reach the national stage?", meta:"Club Orientations 2026", cta:"Register Now", spots:"12/16 Teams", image: "/valorant_card.png" },
  { id:"f3", badge:"Register Now", gradient:"linear-gradient(135deg,#1a1a1a,#2d2d2d)", accent:"#e86c3f", emoji:"⚽", sport:"Football", title:"Reinvent with Accenture City Cup", subtitle:"Spend weekends exploring local turf arenas", meta:"Lead drills on weekdays", cta:"Register Submit", spots:"3/4 Teams", image: "/football_card.jpg" },
  { id:"f4", badge:"Register Now", gradient:"linear-gradient(135deg,#0a2e1a,#163b20)", accent:"#4ade80", emoji:"🏆", sport:"Multi-Sport", title:"Rise Up With Pep Stars", subtitle:"Your gateway to a career in FMCG sector", meta:"INR 6 LPA · 5000 Micro Internships", cta:"Apply Now", spots:"28/32 Slots", image: "/college_esports_card.png" },
  { id:"f5", badge:"Free", gradient:"linear-gradient(135deg,#3b0000,#1a0000)", accent:"#f87171", emoji:"🏎️", sport:"Car Racing", title:"Veloce Grand Prix Series", subtitle:"Time-trial format. No wall riding allowed.", meta:"Prize Pool: Rs.10,000 | Entry: Rs.50", cta:"Join Race", spots:"4/4 Slots", image: "/veloce_card.png" },
  { id:"f6", badge:"Free Entry", gradient:"linear-gradient(135deg,#003a5c,#001e3a)", accent:"#00b4d8", emoji:"🏀", sport:"Basketball", title:"Downtown Hoops Challenge", subtitle:"Groups plus knockout. Local court booking.", meta:"YMCA Court 1 · Open for all ages", cta:"Book Slot", spots:"3/8 Teams", image: "/basketball_card.png" },
  { id:"f7", badge:"Online", gradient:"linear-gradient(135deg,#2a1800,#1a0a00)", accent:"#f97316", emoji:"🔫", sport:"BGMI", title:"BGMI Battlegrounds Pro", subtitle:"Battle royale squads. Anti-cheat enforced.", meta:"Prize Pool: Rs.15,000 | Asia East", cta:"Enroll Team", spots:"8/16 Squads", image: "/pubg_card.png" },
  { id:"f8", badge:"GPS Tracked", gradient:"linear-gradient(135deg,#001a08,#002a10)", accent:"#22c55e", emoji:"🚴", sport:"Cycling", title:"Tour de Nova Cycling Classic", subtitle:"GPS tracking live. Helmets mandatory.", meta:"Sector 4 Velodrome · Prize: Rs.20,000", cta:"Register Rider", spots:"2/4 Riders", image: "/cycle_card.jpg" },
  { id:"f9", badge:"Free Fire", gradient:"linear-gradient(135deg,#2a1800,#3a2200)", accent:"#eab308", emoji:"🔥", sport:"Free Fire", title:"Garena Free Fire Champions Cup", subtitle:"Squads of 4. Ranked match qualifier.", meta:"Prize Pool: Rs.25,000 | Season 9", cta:"Join Squad", spots:"6/16 Squads", image: "/freefire_card.jpg" },
  { id:"f10", badge:"Offline", gradient:"linear-gradient(135deg,#200020,#1a0030)", accent:"#a855f7", emoji:"🏍️", sport:"Bike Racing", title:"MRF Moto GP Challenge", subtitle:"Physical race event. Safety gear mandatory.", meta:"Hyderabad Track · Entry: Rs.200", cta:"Register Bike", spots:"7/12 Riders", image: "/motogp_card.png" },
  { id:"f11", badge:"Online", gradient:"linear-gradient(135deg,#0f1923,#1e3a5f)", accent:"#38bdf8", emoji:"🎮", sport:"COD Mobile", title:"Call of Duty Mobile Invitational", subtitle:"5v5 competitive ranked matches online.", meta:"Prize: Rs.18,000 | India Server", cta:"Enroll Now", spots:"5/8 Teams", image: "/cod_card.png" },
];

const COMPANIES = [
  { name:"Garena", color:"#e05c0a", emoji:"🔥" },
  { name:"Krafton", color:"#1a1a1a", emoji:"🔫" },
  { name:"Riot Games", color:"#d5001c", emoji:"🎯" },
  { name:"EA Sports", color:"#003087", emoji:"⚽" },
  { name:"Supercell", color:"#003087", emoji:"💥" },
  { name:"Red Bull", color:"#cc1e00", emoji:"🐂" },
  { name:"Nodwin", color:"#7c3aed", emoji:"🎮" },
  { name:"ESL Gaming", color:"#f5a623", emoji:"🏆" },
  { name:"MRF Tyres", color:"#c41e3a", emoji:"🏎️" },
  { name:"JK Racing", color:"#1e3a5f", emoji:"🏁" },
  { name:"Yamaha", color:"#003087", emoji:"🏍️" },
  { name:"TVS Racing", color:"#1a1a1a", emoji:"🚴" },
];

const ROUTE_MAP = {
  f1: "cricket",
  f2: "valorant",
  f3: "football",
  f4: "multi",
  f5: "car-racing",
  f6: "hoops",
  f7: "bgmi",
  f8: "cycle-racing",
  f9: "freefire",
  f10: "bike-racing",
  f11: "codm"
};

const FeatureCard = ({ card, navigate }) => (
  <div className="relative flex-shrink-0 w-64 rounded-2xl overflow-hidden group cursor-pointer border border-[#1a1a1a] dark:border-white/10 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300" style={{ minHeight: 360 }}>
    {/* Card background image with fallback gradient */}
    <div 
      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]" 
      style={{ 
        backgroundImage: card.image ? `url(${card.image})` : card.gradient,
        backgroundPosition: 'center'
      }} 
    />
    
    {/* Dark gradient overlay to ensure text readability and branding */}
    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f19] via-[#0e0f19]/70 to-black/35 z-0 transition-opacity duration-300 group-hover:opacity-90" />

    {/* Content overlay */}
    <div className="relative z-10 flex flex-col justify-between h-full min-h-[360px] p-5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/20 bg-black/40" style={{ color: card.accent }}>
          {card.badge}
        </span>
        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <Heart className="w-3.5 h-3.5 text-white/60" strokeWidth={2} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-end pt-12">
        <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 w-max mb-2" style={{ color: card.accent }}>
          {card.sport}
        </span>
        <h3 className="text-white font-black text-sm leading-snug mb-1 line-clamp-2 font-display">{card.title}</h3>
        <p className="text-white/60 text-[10px] leading-relaxed mb-2 font-mono">{card.subtitle}</p>
        <p className="text-[10px] font-black font-mono" style={{ color: card.accent }}>{card.meta}</p>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 mt-3 pt-3">
        <span className="text-[9px] font-bold text-white/40 font-mono">{card.spots}</span>
        <button 
          onClick={() => navigate(`/tournament/${ROUTE_MAP[card.id] || card.id}`)}
          className="text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg hover:scale-105 transition-all relative" 
          style={{ background: card.accent, color:"#090d16" }}
        >
          {card.cta}
        </button>
      </div>
    </div>
  </div>
);

export const FeaturedCarousel = () => {
  const trackRef = useRef(null);
  const navigate = useNavigate();
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const [liveCards, setLiveCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveTournaments = async () => {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 
        (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
          ? 'http://localhost:5000' 
          : '');
      // No backend available — skip fetch entirely, use static cards
      if (!apiBaseUrl || !apiBaseUrl.trim()) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${apiBaseUrl}/api/tournaments`);
        if (!res.ok) { setLoading(false); return; }
          const tournaments = await res.json();
          // Transform db tournaments to Featured Cards shape
          const categoryColors = {
            esports: { gradient: 'linear-gradient(135deg,#2d1b69,#1a0a3e)', accent: '#c084fc', emoji: '🎮' },
            sports: { gradient: 'linear-gradient(135deg,#1e3a5f,#0a2240)', accent: '#4fc3f7', emoji: '⚽' },
            racing: { gradient: 'linear-gradient(135deg,#3b0000,#1a0000)', accent: '#f87171', emoji: '🏎️' },
            academic: { gradient: 'linear-gradient(135deg,#0a2e1a,#163b20)', accent: '#4ade80', emoji: '🎓' }
          };

          const dynamicCards = tournaments.map((t) => {
            const colors = categoryColors[t.category] || { gradient: 'linear-gradient(135deg,#1a1a1a,#2d2d2d)', accent: '#e86c3f', emoji: '🏆' };
            const spotOccupied = t.registeredTeams?.length || 0;
            const spotsRemaining = t.maxTeams - spotOccupied;
            
            // Pick image based on category or game
            let cardImage = "/college_esports_card.png";
            if (t.gameName?.toLowerCase().includes("cricket")) cardImage = "/cricket_card.jpg";
            else if (t.gameName?.toLowerCase().includes("foot")) cardImage = "/football_card.jpg";
            else if (t.gameName?.toLowerCase().includes("val")) cardImage = "/valorant_card.png";
            else if (t.gameName?.toLowerCase().includes("apex")) cardImage = "/veloce_card.png";
            else if (t.gameName?.toLowerCase().includes("basket") || t.gameName?.toLowerCase().includes("hoop")) cardImage = "/basketball_card.png";
            else if (t.gameName?.toLowerCase().includes("pubg") || t.gameName?.toLowerCase().includes("bgmi")) cardImage = "/pubg_card.png";
            else if (t.gameName?.toLowerCase().includes("cycle")) cardImage = "/cycle_card.jpg";
            else if (t.gameName?.toLowerCase().includes("free")) cardImage = "/freefire_card.jpg";
            else if (t.gameName?.toLowerCase().includes("bike") || t.gameName?.toLowerCase().includes("moto")) cardImage = "/motogp_card.png";

            return {
              id: t._id,
              badge: t.venueType === 'online' ? 'Online' : 'Offline',
              gradient: colors.gradient,
              accent: colors.accent,
              emoji: colors.emoji,
              sport: t.gameName,
              title: t.title,
              subtitle: `Format: ${t.format} · Slots left: ${spotsRemaining}/${t.maxTeams}`,
              meta: `Prize Pool: ₹${t.prizePool} · Entry: ${t.entryFee === 0 ? 'FREE' : `₹${t.entryFee}`}`,
              cta: t.status === 'open' ? 'Register Now' : t.status.toUpperCase(),
              spots: `${spotOccupied}/${t.maxTeams} Slots`,
              image: cardImage,
              isDynamic: true
            };
          });
          setLiveCards(dynamicCards);
      } catch (err) {
        console.warn("Failed to fetch live tournaments for carousel:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveTournaments();
  }, []);

  const scrollBy = (dir) => { if (trackRef.current) trackRef.current.scrollBy({ left: dir * 288, behavior:"smooth" }); };
  const onMouseDown = (e) => { isDragging.current = true; dragStartX.current = e.pageX - trackRef.current.offsetLeft; dragScrollLeft.current = trackRef.current.scrollLeft; if (trackRef.current) trackRef.current.style.cursor = "grabbing"; };
  const onMouseMove = (e) => { if (!isDragging.current) return; e.preventDefault(); const x = e.pageX - trackRef.current.offsetLeft; trackRef.current.scrollLeft = dragScrollLeft.current - (x - dragStartX.current); };
  const stopDrag = () => { isDragging.current = false; if (trackRef.current) trackRef.current.style.cursor = "grab"; };

  const allCards = [...liveCards, ...FEATURED_CARDS];

  return (
    <section className="py-20 relative z-10 overflow-hidden border-t border-[#1a1a1a]/10">
      <div className="max-w-6xl mx-auto px-6 md:px-8 mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#1a1a1a]/50 mb-3">
              <span className="w-5 h-[2px] bg-[#1a1a1a]/30 inline-block" />Featured & Live Tournaments
            </span>
            <h2 className="text-4xl md:text-5xl font-black italic text-[#1a1a1a] leading-tight font-display">
              <span className="text-[#e86c3f]">Featured</span> on Nova Hub
            </h2>
            <p className="text-xs text-[#1a1a1a]/55 mt-3 max-w-md leading-relaxed font-mono">
              Handpicked tournaments across sports and esports. Register before slots fill up!
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button onClick={() => scrollBy(-1)} aria-label="Previous" className="w-11 h-11 rounded-full bg-white border-[3px] border-[#1a1a1a] flex items-center justify-center shadow-[3px_3px_0px_rgba(26,26,26,1)] hover:shadow-[1px_1px_0px_rgba(26,26,26,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"><ChevronLeft className="w-5 h-5 text-[#1a1a1a]" strokeWidth={2.5} /></button>
            <button onClick={() => scrollBy(1)} aria-label="Next" className="w-11 h-11 rounded-full bg-[#1a1a1a] border-[3px] border-[#1a1a1a] flex items-center justify-center shadow-[3px_3px_0px_rgba(26,26,26,0.25)] hover:shadow-[1px_1px_0px_rgba(26,26,26,0.25)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"><ChevronRight className="w-5 h-5 text-white" strokeWidth={2.5} /></button>
          </div>
        </div>
      </div>

      <div ref={trackRef} className="flex gap-5 overflow-x-auto hide-scrollbar pl-6 md:pl-8 pr-6 pb-4 select-none" style={{ cursor:"grab", scrollSnapType:"x mandatory" }} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={stopDrag} onMouseLeave={stopDrag}>
        {allCards.map((card, index) => (<div key={card.id || index} style={{ scrollSnapAlign:"start" }}><FeatureCard card={card} navigate={navigate} /></div>))}
        <div className="flex-shrink-0 w-2" />
      </div>

      <div className="mt-20 max-w-6xl mx-auto px-6 md:px-8">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#1a1a1a]/50 mb-3">
            <span className="w-5 h-[2px] bg-[#1a1a1a]/30 inline-block" />Partners and Publishers
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-[#1a1a1a] font-display">
            <span className="text-[#e86c3f]">Trusted</span> by Gaming and Racing Brands
          </h2>
          <p className="text-[10px] text-[#1a1a1a]/50 mt-2 tracking-[0.2em] uppercase font-mono">
            Publishers, esports orgs and racing brands backing Nova Hub
          </p>
        </div>
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10" style={{ background:"linear-gradient(to right,#c4e4e3,transparent)" }} />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10" style={{ background:"linear-gradient(to left,#c4e4e3,transparent)" }} />
          <div className="companies-ticker flex gap-6 items-center">
            {[...COMPANIES,...COMPANIES,...COMPANIES].map((co, i) => (
              <div key={i} className="flex-shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-xl border-[2px] border-[#1a1a1a]/10 bg-white/70 hover:bg-white hover:border-[#1a1a1a]/30 transition-all hover:scale-105 cursor-pointer shadow-sm hover:shadow-md" style={{ minWidth:138 }}>
                <span className="text-xl">{co.emoji}</span>
                <span className="text-sm font-black tracking-tight" style={{ color: co.color }}>{co.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCarousel;
