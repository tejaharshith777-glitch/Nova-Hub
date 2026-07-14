import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ──────────────────────────────────────────
   Himalayan Snow Canvas
   Renders drifting snowflakes that float
   down and sway – blue/cyan tinted to match
   the website palette.
────────────────────────────────────────── */
const HimalayaSnow = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create snowflakes
    const COUNT = 120;
    const flakes = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 3 + 0.8,          // radius 0.8–3.8
      speed: Math.random() * 0.8 + 0.3,    // fall speed
      sway: Math.random() * 0.6 - 0.3,     // horizontal drift
      swayOffset: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.5 + 0.35, // 0.35–0.85
    }));

    let tick = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      for (const f of flakes) {
        // Gentle sinusoidal horizontal sway
        const swayX = Math.sin(tick * 0.018 + f.swayOffset) * 1.4;

        f.x += f.sway + swayX * 0.25;
        f.y += f.speed;

        // Wrap around
        if (f.y > H + 4) { f.y = -4; f.x = Math.random() * W; }
        if (f.x > W + 4) { f.x = -4; }
        if (f.x < -4)    { f.x = W + 4; }

        // Draw with cyan-white gradient glow
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 2.2);
        grad.addColorStop(0, `rgba(220, 245, 255, ${f.opacity})`);
        grad.addColorStop(0.5, `rgba(180, 225, 240, ${f.opacity * 0.6})`);
        grad.addColorStop(1, `rgba(160, 210, 230, 0)`);

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Bright core dot
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity * 0.9})`;
        ctx.fill();
      }

      tick++;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 3 }}
    />
  );
};

/* ──────────────────────────────────────────
   Main Footer Component
────────────────────────────────────────── */
const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="pt-24 pb-0 bg-white dark:bg-[#07090d] relative z-10 border-t-[3px] border-[#1a1a1a] dark:border-white/10 font-mono select-none transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-8 flex flex-col xl:flex-row justify-between items-start xl:items-stretch gap-12 mb-16">
        
        {/* Light Blue Banner / Purple Glass in Dark */}
        <div className="w-full xl:w-[75%] bg-[#bde3fb] dark:bg-purple-950/20 rounded-[2rem] p-10 md:p-16 flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-[8px_8px_0px_rgba(26,26,26,1)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.15)] border-[3px] border-[#1a1a1a] dark:border-purple-500/30 transition-all duration-300">
          {/* Grainy Noise Texture (simulated with CSS pattern) */}
          <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(#1a1a1a 1px, transparent 1px)', backgroundSize: '4px 4px' }} />

          <div className="w-full md:w-[60%] relative z-10">
            <h2 className="text-5xl md:text-[5.5rem] font-medium font-display leading-[1.1] text-[#1a1a1a] dark:text-white mb-6">
              Let's <span className="inline-block hover:scale-110 transition-transform cursor-pointer">🎯</span> host it.<br />
              <span className="italic">Or play it. Or win it.</span>
            </h2>
            <p className="text-xs md:text-sm font-bold text-[#1a1a1a]/70 dark:text-gray-300 max-w-md leading-relaxed mb-10 font-mono">
              Book a local arena slot. No pressure, no hassle. Just a quick setup to get your team on the field and the tournament running.
            </p>
            
            <button onClick={() => navigate('/dashboard?tab=host')} className="bg-gradient-to-b from-[#333] to-[#111] dark:from-cyan-400 dark:to-cyan-500 border border-[#000] dark:border-cyan-300 text-white dark:text-black px-8 py-4 rounded-full font-bold font-mono text-xs md:text-sm shadow-[0_8px_16px_rgba(0,0,0,0.4)] dark:shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:translate-y-1 transition-all duration-200 interactive-target cursor-pointer">
              Book an arena slot
            </button>
          </div>

          {/* Quirky Graphic Placeholder */}
          <div className="w-full md:w-[40%] mt-12 md:mt-0 flex justify-center md:justify-end relative z-10">
            {/* ASCII / Emoji Art character resembling the computer with sunglasses */}
            <div className="relative group cursor-pointer">
              <div className="text-[140px] md:text-[200px] leading-none drop-shadow-2xl transition-transform duration-300 group-hover:scale-105 animate-float-monitor">
                🖥️
              </div>
              <div className="absolute top-1/4 left-[15%] text-7xl md:text-8xl rotate-12 drop-shadow-xl transition-transform duration-300 group-hover:rotate-[20deg] group-hover:scale-110 animate-wiggle-sunglasses">
                😎
              </div>
              <div className="absolute -top-4 -right-4 text-6xl md:text-8xl -rotate-12 drop-shadow-xl transition-transform duration-300 group-hover:-rotate-[20deg] group-hover:-translate-y-2 animate-float-cocktail">
                🍸
              </div>
              {/* Arm / Hands simulation */}
              <div className="absolute -bottom-4 -left-8 text-6xl rotate-45 drop-shadow-lg animate-wave-hand">
                👋
              </div>
            </div>
          </div>
        </div>

        {/* Right Links Section */}
        <div className="w-full xl:w-[25%] flex flex-col justify-between py-4">
          <div className="flex flex-row justify-between font-mono text-sm font-bold text-[#1a1a1a] dark:text-gray-300 transition-colors">
            <div className="space-y-4">
              <a href="#" className="block hover:underline decoration-2 decoration-yellow-400 interactive-target">Leagues</a>
              <a href="#" className="block hover:underline decoration-2 decoration-yellow-400 interactive-target">Arenas</a>
            </div>
            <div className="space-y-4 text-right xl:text-left">
              <a href="#" className="block hover:underline decoration-2 decoration-yellow-400 interactive-target">Discord</a>
              <a href="#" className="block hover:underline decoration-2 decoration-yellow-400 interactive-target">Instagram</a>
              <a href="#" className="block hover:underline decoration-2 decoration-yellow-400 interactive-target">X (Twitter)</a>
              <a href="/#contact" onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="block hover:underline decoration-2 decoration-yellow-400 interactive-target cursor-pointer">Help Desk</a>
              <a href="#" className="block hover:underline decoration-2 decoration-yellow-400 interactive-target">Terms</a>
            </div>
          </div>

          <div className="mt-16 xl:mt-auto text-[10px] font-mono font-bold text-[#1a1a1a]/50 dark:text-gray-500 text-center xl:text-left border-t border-[#1a1a1a]/10 dark:border-white/10 pt-4 xl:border-0 xl:pt-0 transition-colors">
            @2026 Nova Hub Studio | Terms &amp; Conditions
          </div>
        </div>

      </div>

      {/* ════════════════════════════════════════════
          Giant Himalayan Wordmark Section
          Blue snowy Himalayas backdrop + visible
          "NOVA HUB" text + animated snow particles
      ════════════════════════════════════════════ */}
      <div className="w-full relative overflow-hidden border-t-[3px] border-[#1a1a1a]/20 dark:border-white/10" style={{ height: '340px' }}>

        {/* Blue Himalayan landscape background */}
        <img
          src="/blue_himalayas_footer.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
          style={{ zIndex: 1, filter: 'brightness(0.75) saturate(1.1)' }}
        />

        {/* Teal-blue overlay to blend with website color palette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 2,
            background: 'linear-gradient(to bottom, rgba(196,228,227,0.35) 0%, rgba(100,180,200,0.15) 40%, rgba(20,60,90,0.35) 100%)',
          }}
        />

        {/* Animated Snow Canvas */}
        <HimalayaSnow />

        {/* ──── NOVA HUB VISIBLE TEXT ──── */}
        <div
          className="absolute bottom-0 left-0 w-full flex items-end justify-center overflow-hidden"
          style={{ zIndex: 4, paddingBottom: '0px' }}
        >
          <h1
            className="text-[16vw] font-black leading-none select-none uppercase text-center transition-all duration-700 hover:scale-[1.015] cursor-default"
            style={{
              fontFamily: '"Inter", "Outfit", sans-serif',
              letterSpacing: '-0.03em',
              lineHeight: '0.88',
              /* Clearly visible white text with cyan tint and strong shadow for depth */
              color: 'rgba(255, 255, 255, 0.90)',
              textShadow: [
                '0 0 60px rgba(100, 220, 255, 0.55)',
                '0 0 20px rgba(180, 240, 255, 0.4)',
                '0 4px 24px rgba(0, 60, 100, 0.65)',
                '0 2px 6px rgba(0, 0, 0, 0.5)',
              ].join(', '),
              WebkitTextStroke: '1px rgba(150, 230, 255, 0.3)',
            }}
          >
            NOVA HUB
          </h1>
        </div>

        {/* Bottom fade out */}
        <div
          className="absolute bottom-0 left-0 w-full pointer-events-none dark:hidden"
          style={{
            zIndex: 5,
            height: '48px',
            background: 'linear-gradient(to bottom, transparent, rgba(196,228,227,0.9))',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-full pointer-events-none dark:block hidden"
          style={{
            zIndex: 5,
            height: '48px',
            background: 'linear-gradient(to bottom, transparent, rgba(7,9,13,0.95))',
          }}
        />
      </div>
    </footer>
  );
};

export default Footer;
