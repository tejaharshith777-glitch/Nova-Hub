import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Nova Hub system context for Gemini
const NOVA_HUB_SYSTEM_CONTEXT = `You are the Nova Hub AI Assistant — a smart, friendly assistant powered by Google Gemini, built into Nova Hub, a sports and esports tournament management platform.

Nova Hub lets users:
- HOST physical and esports tournaments (Cricket, Football, Basketball, Valorant, BGMI, Free Fire, Chess, Cycling, etc.)
- JOIN tournaments as a team or solo player, fill out rosters, pay entry fees, get a registration token/pass
- TRACK brackets, match history, live scores, leaderboards
- BOOK tickets for offline physical sport events on a map
- MANAGE teams, invite players, set clan tags
- USE the wallet to pay entry fees

Key features: bracket automation, anti-cheat checks, offline venue radar, live match leaderboard, dashboard with history/my-tournaments/booking tabs, role switching between Host and Participant.

Locations active in India: Bangalore, Guntur (AP), Mumbai, Delhi, Hyderabad.

Be conversational, helpful, and concise. Format responses with markdown (bold, bullet points). Keep answers focused and relevant. If asked something completely unrelated to Nova Hub, you may still answer helpfully but bring it back to Nova Hub if relevant.`;

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Smart client-side fallback (when no API key)
const getSmartFallback = (message) => {
  const msg = message.toLowerCase().trim();
  if (/^(hi|hello|hey|sup|yo|namaste)/.test(msg)) {
    return "Hey there! 👋 I'm your Nova Hub AI Assistant powered by Gemini. Ask me anything about hosting tournaments, joining events, booking tickets, or managing your team!";
  }
  if (msg.includes('host') || msg.includes('create') || msg.includes('organize')) {
    return "To host a tournament, go to **Dashboard → Host Event**. Set your game, venue, rules, entry fee, prize pool, and team slots. Brackets generate automatically! 🏆";
  }
  if (msg.includes('join') || msg.includes('register') || msg.includes('participate')) {
    return "To join a tournament, go to **Join Tournament** in the navbar. Select an event, fill your team roster, pay the entry fee, and you'll get a registration token/pass. 🎫";
  }
  if (msg.includes('valorant') || msg.includes('bgmi') || msg.includes('free fire') || msg.includes('chess')) {
    return "🎮 Nova Hub supports esports like **Valorant** (5v5), **BGMI** (25 squads), **Free Fire** (squad battle royale), and **Chess** (Swiss blitz format). All have automated bracket systems and anti-cheat checks!";
  }
  if (/cricket|football|basketball|badminton|cycling|racing/.test(msg)) {
    return "⚽ Nova Hub supports physical sports like **Cricket, Football, Basketball, Badminton, and Cycling**! Book venue slots, manage rosters, and track match results on our live radar map.";
  }
  if (msg.includes('prize') || msg.includes('money') || msg.includes('win') || msg.includes('reward')) {
    return "💰 Prize pools vary by tournament. Hosts configure entry fees and prize stakes. Free tiers award badges and ranking points. Premium events have real cash payouts distributed to team captains!";
  }
  if (msg.includes('history') || msg.includes('registered') || msg.includes('my tournament')) {
    return "📋 Go to **Dashboard → History** to see all tournaments you've registered for. Click **Enter Lobby** to view your registration pass, rules, venue info, and full team details.";
  }
  if (msg.includes('ticket') || msg.includes('book') || msg.includes('venue')) {
    return "🎟️ Go to **Book Tickets** in your dashboard to select a venue on the map, choose your seat/slot, and confirm booking. Your ticket pass will be saved in your history!";
  }
  const fallbacks = [
    "I can help you with hosting, joining, bracket tracking, team management, and more! What would you like to do on Nova Hub? 🚀",
    "Nova Hub makes tournament management seamless. Ask me about joining events, hosting a league, or how the bracket system works!",
    "I'm your Gemini-powered Nova Hub assistant. Ask me about any feature — from wallet payments to offline venue radar! 🌟"
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

const Chatbot = ({ apiBaseUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your **Nova Hub AI Assistant** powered by Google Gemini ✨\n\nI can help you with:\n• Hosting or joining tournaments\n• Finding active leagues near you\n• Rules, rosters, passes & brackets\n• Booking tickets for offline events\n\nWhat would you like to do today?", sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatHistoryRef = useRef([]); // Gemini multi-turn chat history

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const callGeminiDirect = async (userMessage) => {
    if (!GEMINI_API_KEY) return null;
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: NOVA_HUB_SYSTEM_CONTEXT,
      });

      // Build multi-turn history for Gemini
      const chat = model.startChat({
        history: chatHistoryRef.current,
      });

      const result = await chat.sendMessage(userMessage);
      const responseText = result.response.text();

      // Update our history ref for next turn
      chatHistoryRef.current = [
        ...chatHistoryRef.current,
        { role: 'user', parts: [{ text: userMessage }] },
        { role: 'model', parts: [{ text: responseText }] },
      ];

      return responseText;
    } catch (err) {
      console.warn('Gemini direct API error:', err.message);
      return null;
    }
  };

  const callBackendChat = async (userMessage) => {
    if (!apiBaseUrl || !apiBaseUrl.trim()) return null;
    try {
      const res = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.response;
      }
    } catch (err) {
      console.warn('Backend chat failed:', err.message);
    }
    return null;
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessageText = inputValue.trim();
    const newUserMsg = { id: Date.now(), text: userMessageText, sender: 'user' };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Priority: 1. Gemini direct, 2. Backend, 3. Smart fallback
    let aiResponse = await callGeminiDirect(userMessageText);
    if (!aiResponse) {
      aiResponse = await callBackendChat(userMessageText);
    }
    if (!aiResponse) {
      // Simulate thinking time for fallback
      await new Promise(r => setTimeout(r, 600 + Math.random() * 600));
      aiResponse = getSmartFallback(userMessageText);
    }

    setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponse, sender: 'ai' }]);
    setIsTyping(false);
  };

  // Render markdown-style text (bold, bullets, line breaks)
  const renderMessageText = (text) => {
    return text.split('\n').map((line, i) => {
      const parts = [];
      let lastIdx = 0;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIdx) parts.push(line.substring(lastIdx, match.index));
        parts.push(<strong key={match.index} className="font-extrabold text-blue-600 dark:text-cyan-400">{match[1]}</strong>);
        lastIdx = boldRegex.lastIndex;
      }
      if (lastIdx < line.length) parts.push(line.substring(lastIdx));
      const parsedLine = parts.length > 0 ? parts : line;

      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return (
          <li key={i} className="list-disc list-inside ml-2 my-0.5 text-slate-700 dark:text-slate-300">
            {typeof parsedLine === 'string'
              ? parsedLine.replace(/^[•\-*]\s*/, '').trim()
              : parsedLine}
          </li>
        );
      }
      if (!line.trim()) return <br key={i} />;
      return <p key={i} className="mb-1.5 leading-relaxed">{parsedLine}</p>;
    });
  };

  return (
    <>
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

      {/* Mobile backdrop */}
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

      {/* Toggle Button */}
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
              sm:w-[400px] sm:h-[560px]
              md:w-[430px] md:h-[600px]
              lg:w-[450px] lg:h-[620px]
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
                  <p className="text-[10px] text-white/80 font-mono">
                    Nova Hub AI · {GEMINI_API_KEY ? '🟢 Connected' : '🟡 Offline Mode'}
                  </p>
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

            {/* Messages */}
            <div className="flex-1 bg-gray-50 dark:bg-slate-950 p-3 sm:p-4 overflow-y-auto flex flex-col gap-3 sm:gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'ai' && (
                    <div className="w-6 h-6 gemini-gradient-bg rounded-full flex items-center justify-center mr-2 mt-1 shrink-0 border border-white/20 shadow-sm">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[82%] sm:max-w-[78%] p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#c4e4e3] dark:bg-cyan-950/40 border-[2px] border-[#1a1a1a] dark:border-white/20 rounded-xl rounded-tr-sm text-[#1a1a1a] dark:text-white font-semibold'
                      : 'bg-white dark:bg-slate-800 border-[2px] border-[#1a1a1a] dark:border-white/20 rounded-xl rounded-tl-sm text-[#1a1a1a] dark:text-white shadow-sm'
                  }`}>
                    {renderMessageText(msg.text)}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start items-start gap-2">
                  <div className="w-6 h-6 gemini-gradient-bg rounded-full flex items-center justify-center shrink-0 border border-white/20 shadow-sm mt-1">
                    <Sparkles className="w-3 h-3 text-white animate-spin" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border-[2px] border-[#1a1a1a] dark:border-white/20 p-3 rounded-xl rounded-tl-sm shadow-sm">
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full gemini-gradient-bg" style={{ animationDelay: `${i * 0.2}s`, animation: 'gemini-gradient 1s ease infinite' }} />
                      ))}
                      <span className="text-[9px] ml-1 opacity-60 uppercase font-black tracking-widest">Gemini thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 2 && (
              <div className="px-3 sm:px-4 pb-2 flex flex-wrap gap-1.5 bg-gray-50 dark:bg-slate-950 shrink-0">
                {['How do I host a tournament?', 'How to join a game?', 'What esports are supported?', 'How does the wallet work?'].map(q => (
                  <button
                    key={q}
                    onClick={() => { setInputValue(q); }}
                    className="text-[9px] font-black uppercase bg-white dark:bg-slate-800 border border-[#1a1a1a]/20 dark:border-white/15 px-2 py-1 rounded-full hover:border-blue-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t-[3px] border-[#1a1a1a] dark:border-white/20 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask Gemini about Nova Hub..."
                  className="flex-1 bg-gray-100 dark:bg-slate-800 border-[2px] border-[#1a1a1a] dark:border-white/20 rounded-lg px-3 py-2.5 sm:py-2 text-xs text-[#1a1a1a] dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-[#e86c3f] hover:bg-[#d45b30] disabled:bg-gray-400 border-[2px] border-[#1a1a1a] dark:border-white/20 text-white p-2.5 sm:p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[8px] text-gray-500 dark:text-gray-400 text-center mt-2 font-mono">
                {GEMINI_API_KEY ? 'Powered by Google Gemini 1.5 Flash' : 'Running in offline mode'} · Nova Hub AI
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
