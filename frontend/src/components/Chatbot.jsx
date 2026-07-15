import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = ({ apiBaseUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm Gemini, your Nova Hub assistant. How can I help you explore or host tournaments today?", sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessageText = inputValue;
    const newUserMsg = { id: Date.now(), text: userMessageText, sender: 'user' };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    if (apiBaseUrl) {
      try {
        const res = await fetch(`${apiBaseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessageText })
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(prev => [...prev, { id: Date.now() + 1, text: data.response, sender: 'ai' }]);
          setIsTyping(false);
          return;
        }
      } catch (err) {
        console.warn("Backend chat endpoint failed, running client-side simulation.");
      }
    }

    // Client-side Gemini-style simulation fallback
    const lowerInput = userMessageText.toLowerCase();
    const delay = 800 + Math.random() * 800;

    setTimeout(() => {
      let aiResponse;

      // Greetings
      if (/^(hi|hello|hey|sup|yo|good morning|good evening|namaste)/.test(lowerInput)) {
        const greetings = [
          "Hey there! 👋 I'm Gemini, your digital assistant for Nova Hub. Whether you're looking to host a custom tournament, register your team, or explore local turf grids, I'm here to guide you. What's on your mind today?",
          "Hello! Great to see you in the hub 🎮 I can help you discover active leagues, outline anti-cheat criteria, or coordinate offline access pass issues. Let me know what you'd like to do!",
          "Hi! 🙌 I'm your Google-aligned assistant for Nova Hub. Ask me anything about tournament scheduling, entry payouts, or bracket synchronization protocols."
        ];
        aiResponse = greetings[Math.floor(Math.random() * greetings.length)];

      // Hosting
      } else if (lowerInput.includes('host') || lowerInput.includes('create') || lowerInput.includes('organize')) {
        aiResponse = "To host an event, head to the **Dashboard → Host Event** window. You can set up:\n• **Physical Sports** — Football, Cricket, Basketball, or Badminton.\n• **Esports Lobbies** — Valorant, BGMI, Free Fire, or Chess.\n• **Rules & Fees** — Set custom slot size caps, entry fees, and prize stakes.\n• **Brackets Engine** — Double/single elimination brackets generate automatically.";

      // Joining
      } else if (lowerInput.includes('join') || lowerInput.includes('participate') || lowerInput.includes('sign up for')) {
        aiResponse = "To join any tournament, navigate to **Dashboard → Join Tournament** and:\n1. Choose your desired sport or esports league.\n2. Fill out your team name and player handles.\n3. Complete the mock payment checklist if there's an entry fee.\n4. Save your generated Nodal verification token and QR code pass.";

      // Valorant
      } else if (lowerInput.includes('valorant') || lowerInput.includes('valo') || lowerInput.includes('riot')) {
        aiResponse = "🎯 **Valorant Tournaments on Nova Hub**\n\n• **Format**: 5v5 online competitive brackets (Search & Destroy).\n• **Audits**: Riot Vanguard compliance checked before brackets lock.\n• **Features**: Live map scores sync directly to your player dashboard.\n• **Entry**: Register with a 5-player squad (plus 1 optional sub).";

      // BGMI / PUBG
      } else if (lowerInput.includes('bgmi') || lowerInput.includes('pubg') || lowerInput.includes('battlegrounds')) {
        aiResponse = "🔫 **BGMI Battlegrounds on Nova Hub**\n\n• **Format**: 25 Squad lobbies across Erangel and Miramar.\n• **Scoring**: Placement points + kill multipliers synced live.\n• **Rules**: Emulators strictly banned. Mobile device parameters verified.\n• **Seeding**: Prioritized seed rankings based on career KD ratio.";

      // Free Fire
      } else if (lowerInput.includes('free fire') || lowerInput.includes('freefire') || /\bff\b/.test(lowerInput)) {
        aiResponse = "🔥 **Garena Free Fire Champions Cup**\n\n• **Format**: Squad check-ins with fast-paced zone matches.\n• **Seeding**: Top-ranked regional squads are automatically seeded.\n• **Anti-Cheat**: Automated device scans and player account audit locks.";

      // Chess
      } else if (lowerInput.includes('chess')) {
        aiResponse = "♟️ **Chess Blitz & Bullet Showdowns**\n\n• **Format**: Swiss system over 7 rounds with blitz controls (5+2).\n• **Sync**: Automatic game tracking via verified chess.com API ties.\n• **Brackets**: Automated round generation based on current standings.";

      // Physical sports
      } else if (/cricket|football|basketball|badminton|tennis|volleyball/.test(lowerInput)) {
        const sport = lowerInput.includes('cricket') ? 'Cricket' :
          lowerInput.includes('football') ? 'Football' :
          lowerInput.includes('basketball') ? 'Basketball' :
          lowerInput.includes('badminton') ? 'Badminton' :
          lowerInput.includes('tennis') ? 'Tennis' : 'Volleyball';
        aiResponse = `🏆 **${sport} Leagues on Nova Hub**\n\nWe provide a full digital engine for physical ${sport} formats:\n• **Radar Booking**: Lock specific turf slots and coordinates.\n• **Rosters check**: Verify captain emails and offline passes on-site.\n• **Leaderboards**: Match scores update dynamically on the local radar.`;

      // Racing
      } else if (/racing|car race|bike race|cycling|moto|veloce/.test(lowerInput)) {
        aiResponse = "🏁 **Racing Tournaments on Nova Hub**\n\nWe currently support three major racing leagues:\n• **Veloce GP Series**: Time-trial simulator setups.\n• **Tour de Nova Cycling**: Velodrome races with live GPS coordinates.\n• **MRF Moto GP**: High-speed motorcycle track events in Hyderabad.";

      // Prize / winnings
      } else if (/prize|money|win|reward|cash|payout/.test(lowerInput)) {
        aiResponse = "💰 **Prize Pool & Payout Rules**\n\n• **Free Tiers**: Badges, ranking points, and elite radar profile pins.\n• **Premium Tiers**: Cash prize pools distributed securely directly to team captains.\n• **Audit locks**: All match outcomes must be host-verified before payout dispatch.";

      // Passes / membership
      } else if (/pass|membership|subscribe|rookie|challenger|elite|plan|tier/.test(lowerInput)) {
        aiResponse = "🎫 **Nova Hub Premium Passes**\n\n• **Rookie Pass (Free)**: Standard brackets, check-in radar visibility.\n• **Challenger Pass (₹499/mo)**: Priority queue matching, free team tags.\n• **Elite Pass (₹1,499/mo)**: 0-ping routing slots, professional match audits, priority support.";

      // Offline hub / offices
      } else if (/offline|office|hub|location|city|bengaluru|guntur|hyderabad|mumbai/.test(lowerInput)) {
        aiResponse = "🏢 **Offline Nodal Verification Centers**\n\n• **Services**: Offline roster verification, pass printing, check-in badges.\n• **Locations**: Active offices located in Bengaluru, Hyderabad, Guntur, and Mumbai.\n• **Safety audit**: Physical coordinators verify ID bounds prior to matches.\n• **Note**: Gameplay takes place online or at actual turfs; hubs are strictly administrative.";

      // Dashboard
      } else if (/dashboard|account|login|profile/.test(lowerInput)) {
        aiResponse = "🖥️ **Interactive Player Dashboard**\n\n• **Access**: Click 'Sign In' in the navbar to authenticate.\n• **Tabs**: Track joined brackets, schedule matches, or edit hosted settings.\n• **Pass key**: View and share your active registration tokens from your profile.";

      // What is Nova Hub
      } else if (/what is|who are|about nova|tell me about/.test(lowerInput)) {
        aiResponse = "🌟 **Nova Hub** is a sports & esports tournament management platform bridging physical turf matches and competitive esports. We supply automated brackets, roster checks, and localized radars to make sports coordination seamless across India.";

      // Help / what can you do
      } else if (/help|what can you|commands|options|features/.test(lowerInput)) {
        aiResponse = "🤖 **How can I help you today? Ask me about:**\n\n• **Esports**: Valorant, BGMI, Free Fire, Chess rules.\n• **Sports**: Turf cricket, football coordinates, badminton fixtures.\n• **Hosting**: Setting up entry fees, slots, and brackets.\n• **Passes**: Elite and Challenger benefits, offline verification hubs.";

      // Fallback
      } else {
        const fallbacks = [
          "I don't have that specific data segment in my context yet, but I can help you search active turf leagues, register custom squads, or explore regional node maps. What sport are you interested in?",
          "That's a good query! I'm constantly syncing my knowledge grid. You can find active brackets for Cricket, Football, and Valorant on the main homepage. What event would you like to explore?",
          "I'm not entirely sure about that specific coordinate, but I can guide you through hosting a new match, booking entry passes, or reviewing leaderboard standings. Try asking about our tournament rules!"
        ];
        aiResponse = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponse, sender: 'ai' }]);
      setIsTyping(false);
    }, delay);
  };

  // Helper to render formatting in messages (bold headers and bullet points)
  const renderMessageText = (text) => {
    return text.split('\n').map((line, i) => {
      let content = line;
      const parts = [];
      let lastIdx = 0;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIdx) {
          parts.push(line.substring(lastIdx, match.index));
        }
        parts.push(
          <strong key={match.index} className="font-extrabold text-blue-600 dark:text-cyan-400">
            {match[1]}
          </strong>
        );
        lastIdx = boldRegex.lastIndex;
      }
      if (lastIdx < line.length) {
        parts.push(line.substring(lastIdx));
      }

      const parsedLine = parts.length > 0 ? parts : content;

      if (line.trim().startsWith('•')) {
        return (
          <li key={i} className="list-disc list-inside ml-2 my-1 text-slate-700 dark:text-slate-300">
            {typeof parsedLine === 'string' ? parsedLine.replace('•', '').trim() : parsedLine}
          </li>
        );
      }
      return <p key={i} className="mb-2 leading-relaxed">{parsedLine}</p>;
    });
  };

  return (
    <>
      {/* Custom Styles Injection */}
      <style>{`
        @keyframes gemini-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gemini-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .gemini-gradient-bg {
          background: linear-gradient(-45deg, #1a73e8, #8ab4f8, #c58af9, #ec4899);
          background-size: 300% 300%;
          animation: gemini-gradient 8s ease infinite;
        }
        .gemini-shimmer-bg {
          background: linear-gradient(90deg, rgba(26,115,232,0.15) 0%, rgba(197,138,249,0.3) 50%, rgba(26,115,232,0.15) 100%);
          background-size: 200% auto;
          animation: gemini-shimmer 1.5s infinite linear;
        }
        /* Mobile: chat takes full screen */
        @media (max-width: 639px) {
          .chatbot-window {
            inset: 0 !important;
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100dvh !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Mobile dark backdrop when chat is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          />
        )}
      </AnimatePresence>

      {/* Chat Toggle Button — bottom-right, responsive sizing */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[60] p-3.5 sm:p-4 gemini-gradient-bg text-white rounded-full shadow-[4px_4px_0px_rgba(26,26,26,1)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.15)] border-2 border-[#1a1a1a] dark:border-white/20 flex items-center justify-center group"
        >
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-[8px] text-black font-black px-1.5 py-0.5 rounded uppercase border border-black animate-bounce shadow-md">
            Gemini
          </span>
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chatbot"
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className={`
              chatbot-window
              fixed z-50
              bg-white dark:bg-slate-900
              text-[#1a1a1a] dark:text-white
              border-[3px] border-[#1a1a1a] dark:border-white/20
              shadow-[8px_8px_0px_rgba(26,26,26,1)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.15)]
              rounded-2xl flex flex-col overflow-hidden font-mono
              bottom-0 right-0 left-0
              w-full h-[100dvh]
              sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto
              sm:w-[400px] sm:h-[520px]
              md:w-[420px] md:h-[560px]
              lg:w-[440px] lg:h-[580px]
            `}
          >
            {/* Header */}
            <div className="gemini-gradient-bg text-white px-4 py-3.5 sm:p-4 flex items-center justify-between border-b-[3px] border-[#1a1a1a] dark:border-white/20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-md border border-white/20">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm tracking-widest uppercase flex items-center gap-2">
                    Gemini Live
                  </h3>
                  <p className="text-[10px] text-white/80 font-mono">Nova Hub Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-md transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 bg-gray-50 dark:bg-slate-950 p-3 sm:p-4 overflow-y-auto flex flex-col gap-3 sm:gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'ai' && (
                    <div className="w-6 h-6 gemini-gradient-bg rounded-full flex items-center justify-center mr-2 mt-1 shrink-0 border border-white/20 shadow-sm">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] sm:max-w-[75%] p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#c4e4e3] dark:bg-cyan-950/40 border-[2px] border-[#1a1a1a] dark:border-white/20 rounded-xl rounded-tr-sm text-[#1a1a1a] dark:text-white font-semibold'
                      : 'bg-white dark:bg-slate-800 border-[2px] border-[#1a1a1a] dark:border-white/20 rounded-xl rounded-tl-sm text-[#1a1a1a] dark:text-white shadow-sm'
                  }`}>
                    {renderMessageText(msg.text)}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start items-start gap-2">
                  <div className="w-6 h-6 gemini-gradient-bg rounded-full flex items-center justify-center mr-2 mt-1 shrink-0 border border-white/20 shadow-sm">
                    <Sparkles className="w-3 h-3 text-white animate-spin" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border-[2px] border-[#1a1a1a] dark:border-white/20 p-3 rounded-xl rounded-tl-sm w-48 shadow-sm">
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="h-2 w-full rounded gemini-shimmer-bg" />
                      <div className="h-2 w-3/4 rounded gemini-shimmer-bg" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t-[3px] border-[#1a1a1a] dark:border-white/20 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Gemini about tournaments..."
                  className="flex-1 bg-gray-100 dark:bg-slate-800 border-[2px] border-[#1a1a1a] dark:border-white/20 rounded-lg px-3 py-2.5 sm:py-2 text-xs text-[#1a1a1a] dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-[#e86c3f] hover:bg-[#d45b30] disabled:bg-gray-400 border-[2px] border-[#1a1a1a] dark:border-white/20 text-white p-2.5 sm:p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[8px] text-gray-500 dark:text-gray-400 text-center mt-2 font-mono">
                Gemini can make mistakes. Verify important info.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
