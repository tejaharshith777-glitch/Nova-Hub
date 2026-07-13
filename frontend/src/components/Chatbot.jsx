import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = ({ apiBaseUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm the Nova Hub Assistant (Powered by Gemini 2.5 Flash). How can I help you set up your tournament today?", sender: 'ai' }
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
    const delay = 600 + Math.random() * 600;

    setTimeout(() => {
      let aiResponse;

      // Greetings
      if (/^(hi|hello|hey|sup|yo|good morning|good evening|namaste)/.test(lowerInput)) {
        const greetings = [
          "Hey there! 👋 I'm Nova Hub's AI assistant, powered by Gemini. Whether you're looking to host a tournament, join a match, or explore esports — I've got you covered. What can I help you with today?",
          "Hello! Great to see you on Nova Hub 🎮 I can help you navigate tournaments, understand how to register your team, or find the right sport. What's on your mind?",
          "Hi! 🙌 I'm here to help with anything Nova Hub — sports leagues, esports brackets, venue booking, or team registration. Fire away!"
        ];
        aiResponse = greetings[Math.floor(Math.random() * greetings.length)];

      // Hosting
      } else if (lowerInput.includes('host') || lowerInput.includes('create') || lowerInput.includes('organize')) {
        aiResponse = "To host a tournament on Nova Hub, head to the **Dashboard → Host Event**. You can:\n• Choose between physical sports (Cricket, Football, Basketball…) or online esports (Valorant, BGMI, Free Fire, Chess)\n• Set entry fees, prize pools, and venue/platform\n• Auto-generate brackets once registrations close\n\nNeed help with a specific sport format?";

      // Joining
      } else if (lowerInput.includes('join') || lowerInput.includes('participate') || lowerInput.includes('sign up for')) {
        aiResponse = "Ready to compete? Here's how to join a tournament:\n1. Go to **Dashboard → Join Tournament**\n2. Browse active events by sport or esports\n3. Register your team roster (up to 6 players for team events)\n4. Get your confirmation pass\n\nYou can also walk-in to our **offline offices** for physical sport registration. Anything specific you want to join?";

      // Valorant
      } else if (lowerInput.includes('valorant') || lowerInput.includes('valo') || lowerInput.includes('riot')) {
        aiResponse = "🎯 **Valorant on Nova Hub**\n\nWe run 5v5 best-of-3 Valorant tournaments with:\n• Anti-cheat monitoring (Vanguard required)\n• Live match scores on the bracket page\n• Weekly qualifiers + monthly finals\n• PC only, minimum Silver rank to enter\n\nHead to the Valorant tournament page to register your 5-man squad!";

      // BGMI / PUBG
      } else if (lowerInput.includes('bgmi') || lowerInput.includes('pubg') || lowerInput.includes('battlegrounds')) {
        aiResponse = "🔫 **BGMI Battlegrounds on Nova Hub**\n\nSquad-based battle royale with:\n• 25 teams × 4 players per lobby\n• Points system across 6 matches (placement + kills)\n• Android/iOS only — emulators are banned\n• Conqueror/Ace accounts get priority seeding\n\nCheck the BGMI page for the next tournament date!";

      // Free Fire
      } else if (lowerInput.includes('free fire') || lowerInput.includes('freefire') || /\bff\b/.test(lowerInput)) {
        aiResponse = "🔥 **Free Fire Masters — Nova Hub's flagship BR event!**\n\n• 20 squads on Bermuda & Kalahari maps\n• Kill bonuses in the scoring system\n• Grandmaster account required to register\n• Top 3 squads share the cash prize pool\n\nWant to register your squad or see the schedule?";

      // Chess
      } else if (lowerInput.includes('chess')) {
        aiResponse = "♟️ **Nova Chess League**\n\n• Blitz format (5+2 increment)\n• 32-player Swiss system over 7 rounds\n• chess.com account verification required\n• ELO-based seeding for top-rated players\n\nWe host monthly seasons — registrations open 2 weeks before each season starts. Want me to tell you more about the format?";

      // Physical sports
      } else if (/cricket|football|basketball|badminton|tennis|volleyball/.test(lowerInput)) {
        const sport = lowerInput.includes('cricket') ? 'Cricket' :
          lowerInput.includes('football') ? 'Football' :
          lowerInput.includes('basketball') ? 'Basketball' :
          lowerInput.includes('badminton') ? 'Badminton' :
          lowerInput.includes('tennis') ? 'Tennis' : 'Volleyball';
        aiResponse = `🏆 **${sport} on Nova Hub**\n\nWe run full ${sport} leagues including:\n• Team registration & roster management\n• Live scoring & bracket updates\n• Venue booking & coordination\n• Physical check-in at our regional offices\n\nGo to the ${sport} tournament page to see upcoming events or register your team!`;

      // Racing
      } else if (/racing|car race|bike race|cycling|moto|veloce/.test(lowerInput)) {
        aiResponse = "🏁 **Racing Events on Nova Hub**\n\nWe run 3 racing categories:\n• **Veloce GP Series** — Car racing circuits\n• **Moto GP Pro Tour** — Motorcycle racing\n• **Tour de Nova** — Competitive cycling\n\nEach event has qualifying rounds, live timing, and a full leaderboard. Check the racing section on the homepage!";

      // Prize / winnings
      } else if (/prize|money|win|reward|cash|payout/.test(lowerInput)) {
        aiResponse = "💰 **Prize Pools on Nova Hub**\n\nPrize pools are set by the tournament host. Here's the general breakdown:\n• **Free events** — Trophies, badges, and ranking points\n• **Paid entry events** — Cash prizes split among top 3 (usually 50/30/20%)\n• **Sponsored events** — Brand deals + product prizes\n\nAlways check the individual event page for exact prize details before registering!";

      // Passes / membership
      } else if (/pass|membership|subscribe|rookie|challenger|elite|plan|tier/.test(lowerInput)) {
        aiResponse = "🎫 **Nova Arena Passes**\n\nWe have 3 membership tiers:\n• **Rookie Pass (Free)** — Basic bracket access & standard check-in\n• **Challenger Pass (₹499/mo)** — Priority matchmaking, all-India nodal access, roster key\n• **Elite Pass (₹1,499/mo)** — VIP desk slots, pro coaching, zero-latency routing\n\nAll passes unlock access to the Showdown Arena offline verification offices. Which tier are you interested in?";

      // Offline hub / offices
      } else if (/offline|office|hub|venue|location|city|bengaluru|guntur|hyderabad|mumbai/.test(lowerInput)) {
        aiResponse = "🏢 **Nova Regional Offices**\n\nOur offline hubs are administrative offices for:\n• Team roster check-in & verification\n• Pass printing & badge collection\n• Registration validation\n\nNote: **No matches or games are conducted at these offices.** All actual gameplay happens online or at designated sports venues.\n\nCurrently active offices: Bengaluru, Guntur, Hyderabad, Mumbai, Chennai, Pune, Delhi, and more. Visit the Showdown page for the full list!";

      // Dashboard
      } else if (/dashboard|account|login|profile/.test(lowerInput)) {
        aiResponse = "🖥️ **Nova Hub Dashboard**\n\nOnce you're logged in, the dashboard lets you:\n• Host new tournaments\n• Join existing ones\n• View your team roster & match history\n• Access your Arena Pass\n• Track live scores & bracket updates\n\nClick 'Sign In' in the top navbar to get started. Need help with anything specific in the dashboard?";

      // What is Nova Hub
      } else if (/what is|who are|about nova|tell me about/.test(lowerInput)) {
        aiResponse = "🌟 **Nova Hub** is a sports & esports tournament management platform built for India's competitive gaming and physical sports communities.\n\nWe help you:\n• **Host** — Set up leagues, brackets & venues\n• **Play** — Join tournaments across 10+ sports & esports\n• **Track** — Live scores, standings & match replays\n• **Register** — At our regional offices or fully online\n\nWhether you're a weekend cricketer or a ranked Valorant player, Nova Hub is your arena!";

      // Help / what can you do
      } else if (/help|what can you|commands|options|features/.test(lowerInput)) {
        aiResponse = "🤖 **Here's what I can help you with:**\n\n🎮 **Esports** — Valorant, BGMI, Free Fire, Chess\n⚽ **Physical Sports** — Cricket, Football, Basketball, Badminton & more\n🏢 **Offices** — Nova regional hub locations & services\n🏆 **Tournaments** — How to host, join, or track events\n💰 **Prizes** — Pool structures & payouts\n🎫 **Passes** — Membership tiers & benefits\n\nJust ask me anything and I'll do my best to help!";

      // Fallback — Gemini-style varied responses
      } else {
        const fallbacks = [
          `I don't have specific details about that yet, but on Nova Hub you can explore tournaments across cricket, football, Valorant, BGMI, and more. Try asking me about a specific sport or feature!`,
          `Hmm, that's an interesting one! I'm still learning. For now, the best place to check would be the Nova Hub homepage or dashboard. Is there a specific sport or tournament you're looking for?`,
          `I'm not entirely sure about that, but I'm here to help! Could you rephrase or give me more context? I can assist with hosting events, joining tournaments, passes, offline offices, and more.`,
          `Good question! My knowledge is focused on Nova Hub's platform — tournaments, sports, esports, and venue coordination. Ask me something specific and I'll give you the best answer I can! 🎯`
        ];
        aiResponse = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponse, sender: 'ai' }]);
      setIsTyping(false);
    }, delay);
  };

  return (
    <>
      {/* Chat Toggle Button — only visible when chatbot is closed */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[60] p-4 bg-[#1a1a1a] text-white rounded-full shadow-[4px_4px_0px_rgba(232,108,63,1)] hover:shadow-[2px_2px_0px_rgba(232,108,63,1)] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs text-black font-bold px-2 py-0.5 rounded-full border-2 border-black">
            AI
          </span>
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-slate-900 text-[#1a1a1a] dark:text-white border-[3px] border-[#1a1a1a] dark:border-white/20 shadow-[8px_8px_0px_rgba(26,26,26,1)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.15)] rounded-2xl flex flex-col overflow-hidden font-mono"
          >
            {/* Header */}
            <div className="bg-[#1a1a1a] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-1.5 rounded-lg border border-white/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-widest uppercase flex items-center gap-2">
                    Nova Assistant
                  </h3>
                  <p className="text-[10px] text-white/60">Powered by Gemini 2.5 Flash</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-gray-50 dark:bg-slate-950 p-4 overflow-y-auto flex flex-col gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'ai' && (
                    <div className="w-6 h-6 bg-[#1a1a1a] dark:bg-slate-800 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0 border dark:border-white/10">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[75%] p-3 text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-[#c4e4e3] dark:bg-cyan-950/40 border-[2px] border-[#1a1a1a] dark:border-white/20 rounded-xl rounded-tr-sm text-[#1a1a1a] dark:text-white font-semibold' : 'bg-white dark:bg-slate-800 border-[2px] border-[#1a1a1a] dark:border-white/20 rounded-xl rounded-tl-sm text-[#1a1a1a] dark:text-white'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start items-center gap-2 text-gray-550">
                   <div className="w-6 h-6 bg-[#1a1a1a] dark:bg-slate-800 rounded-full flex items-center justify-center mr-2 shrink-0 border dark:border-white/10">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t-[3px] border-[#1a1a1a] dark:border-white/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Gemini about Nova Hub..."
                  className="flex-1 bg-gray-100 dark:bg-slate-800 border-[2px] border-[#1a1a1a] dark:border-white/20 rounded-lg px-3 py-2 text-xs text-[#1a1a1a] dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-slate-750 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-[#e86c3f] hover:bg-[#d45b30] disabled:bg-gray-400 border-[2px] border-[#1a1a1a] dark:border-white/20 text-white p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
