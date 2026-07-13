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

    // Client-side simulation fallback
    setTimeout(() => {
      let aiResponse = "I can help with that! Nova Hub supports both physical sports and online esports. Would you like to host a tournament, join an existing one, or explore a specific category?";
      
      const lowerInput = userMessageText.toLowerCase();

      if (lowerInput.includes('host') || lowerInput.includes('create')) {
        aiResponse = "To host a tournament, click 'Host Event' in the dashboard. You can choose from physical sports (Cricket, Football, etc.) or online esports (Valorant, BGMI, Free Fire, Chess). Fill in the event details and launch!";
      } else if (lowerInput.includes('join') || lowerInput.includes('play')) {
        aiResponse = "Looking to play? Head to 'Join Tournament' to see active local and online matches. Register your team roster or solo profile to get started!";
      } else if (lowerInput.includes('valorant') || lowerInput.includes('valo')) {
        aiResponse = "🎯 Valorant is fully supported! Our Valorant Showdown features 5v5 best-of-3 online matches with anti-cheat monitoring. Check the tournament page for live match scores and past winners!";
      } else if (lowerInput.includes('bgmi') || lowerInput.includes('pubg')) {
        aiResponse = "🔫 BGMI/PUBG is live on Nova Hub! Squad-based tournaments with 25 teams of 4. Points system across 6 matches. Android/iOS only — no emulators. Check the BGMI Battlegrounds page for details!";
      } else if (lowerInput.includes('free fire') || lowerInput.includes('freefire') || lowerInput.includes('ff')) {
        aiResponse = "🔥 Free Fire Masters is our flagship battle royale event! 20 squads compete on Bermuda and Kalahari maps with kill bonuses. Grandmaster accounts required. Check the Free Fire page!";
      } else if (lowerInput.includes('chess')) {
        aiResponse = "♟️ We host Online Chess Leagues in Blitz format (5+2 increment)! 32-player Swiss system over 7 rounds. Accounts verified via chess.com. ELO-based seeding for top players!";
      } else if (lowerInput.includes('cricket') || lowerInput.includes('football') || lowerInput.includes('basketball') || lowerInput.includes('badminton') || lowerInput.includes('hoops') || lowerInput.includes('tennis')) {
        aiResponse = "🏆 We fully support that sport! Check out the dedicated tournament page for live match formats, live scores, and past winners. You can also register your team directly from there!";
      } else if (lowerInput.includes('racing') || lowerInput.includes('car') || lowerInput.includes('bike') || lowerInput.includes('cycle') || lowerInput.includes('moto')) {
        aiResponse = "🏁 We have multiple racing events! Check out Veloce GP Series for Car Racing, Moto GP Pro Tour for Bikes, and Tour de Nova for Cycling on our homepage.";
      } else if (lowerInput.includes('esports') || lowerInput.includes('online') || lowerInput.includes('game')) {
        aiResponse = "🎮 Nova Hub supports major online games: Valorant (5v5 FPS), BGMI (Battle Royale), Free Fire (Squad BR), and Chess (Blitz). Click any esports card on the homepage to explore!";
      } else if (lowerInput.includes('prize') || lowerInput.includes('money') || lowerInput.includes('win')) {
        aiResponse = "🏆 Prize pools vary by tournament! The host sets the prize pool when creating an event. For online esports like Free Fire, cash prizes are distributed to top 3 squads. Check individual event pages for details!";
      } else if (lowerInput.includes('register') || lowerInput.includes('sign up') || lowerInput.includes('account')) {
        aiResponse = "To register, click 'Sign In' in the top navbar and create an account. Once logged in, you can join tournaments as a participant or switch to host mode to create your own events!";
      } else {
        // dynamic smart fallback inside client
        const words = lowerInput.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").split(/\s+/);
        const stopWords = ['a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves', 'give', 'me', 'please', 'tell', 'show', 'us', 'get'];
        const topics = words.filter(w => !stopWords.includes(w) && w.length > 2);
        
        if (topics.length > 0) {
          aiResponse = `You asked about "${topics.join(' ')}". On Nova Hub, you can host tournaments, join leagues, and manage brackets for both physical sports and online esports. Head to the homepage or dashboard to check out live events for those!`;
        } else {
          aiResponse = "I'm not exactly sure about that, but Nova Hub is your platform for all things sports and esports! You can check out the featured tournaments on the homepage or head to the dashboard to find exactly what you need.";
        }
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponse, sender: 'ai' }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 bg-[#1a1a1a] text-white rounded-full shadow-[4px_4px_0px_rgba(232,108,63,1)] hover:shadow-[2px_2px_0px_rgba(232,108,63,1)] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs text-black font-bold px-2 py-0.5 rounded-full border-2 border-black">
          AI
        </span>
      </motion.button>

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
