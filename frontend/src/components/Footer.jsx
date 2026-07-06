import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="py-24 bg-white relative z-10 border-t-[3px] border-[#1a1a1a] font-mono select-none">
      <div className="max-w-[1400px] mx-auto px-8 flex flex-col xl:flex-row justify-between items-start xl:items-stretch gap-12">
        
        {/* Light Blue Banner */}
        <div className="w-full xl:w-[75%] bg-[#bde3fb] rounded-[2rem] p-10 md:p-16 flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-[8px_8px_0px_rgba(26,26,26,1)] border-[3px] border-[#1a1a1a]">
          {/* Grainy Noise Texture (simulated with CSS pattern) */}
          <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(#1a1a1a 1px, transparent 1px)', backgroundSize: '4px 4px' }} />

          <div className="w-full md:w-[60%] relative z-10">
            <h2 className="text-5xl md:text-[5.5rem] font-medium font-display leading-[1.1] text-[#1a1a1a] mb-6">
              Let's <span className="inline-block hover:scale-110 transition-transform cursor-pointer">🎯</span> host it.<br />
              <span className="italic">Or play it. Or win it.</span>
            </h2>
            <p className="text-xs md:text-sm font-bold text-[#1a1a1a]/70 max-w-md leading-relaxed mb-10 font-mono">
              Book a local arena slot. No pressure, no hassle. Just a quick setup to get your team on the field and the tournament running.
            </p>
            
            <button onClick={() => navigate('/dashboard?tab=host')} className="bg-gradient-to-b from-[#333] to-[#111] border border-[#000] text-white px-8 py-4 rounded-full font-bold font-mono text-xs md:text-sm shadow-[0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:translate-y-1 transition-all duration-200 interactive-target cursor-pointer">
              Book an arena slot
            </button>
          </div>

          {/* Quirky Graphic Placeholder */}
          <div className="w-full md:w-[40%] mt-12 md:mt-0 flex justify-center md:justify-end relative z-10">
            {/* ASCII / Emoji Art character resembling the computer with sunglasses */}
            <div className="relative group cursor-pointer">
              <div className="text-[140px] md:text-[200px] leading-none drop-shadow-2xl transition-transform duration-300 group-hover:scale-105">
                🖥️
              </div>
              <div className="absolute top-1/4 left-[15%] text-7xl md:text-8xl rotate-12 drop-shadow-xl transition-transform duration-300 group-hover:rotate-[20deg] group-hover:scale-110">
                😎
              </div>
              <div className="absolute -top-4 -right-4 text-6xl md:text-8xl -rotate-12 drop-shadow-xl transition-transform duration-300 group-hover:-rotate-[20deg] group-hover:-translate-y-2">
                🍸
              </div>
              {/* Arm / Hands simulation */}
              <div className="absolute -bottom-4 -left-8 text-6xl rotate-45 drop-shadow-lg">
                👋
              </div>
            </div>
          </div>
        </div>

        {/* Right Links Section */}
        <div className="w-full xl:w-[25%] flex flex-col justify-between py-4">
          <div className="flex flex-row justify-between font-mono text-sm font-bold text-[#1a1a1a]">
            <div class="space-y-4">
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

          <div className="mt-16 xl:mt-auto text-[10px] font-mono font-bold text-[#1a1a1a]/50 text-center xl:text-left border-t border-[#1a1a1a]/10 pt-4 xl:border-0 xl:pt-0">
            @2026 Nova Hub Studio | Terms & Conditions
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
