import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// A dictionary for rich smart responses
const SMART_RESPONSES = {
  greetings: [
    "Hello! Welcome to Nova Hub. I am your Nova Assistant. How can I help you with your tournament, sports booking, or brackets today?",
    "Hi there! Ready to set up or join some epic matches? Let me know what sports or esports you are interested in!",
    "Hey! I'm here to guide you through Nova Hub. Ask me about hosting events, joining teams, or tracking brackets!"
  ],
  racing: [
    "🏁 Racing tournaments are huge on Nova Hub! We currently feature the Veloce GP Series (Car Racing), Moto GP Pro Tour (Bike Racing), and the Tour de Nova Classic (Cycling). You can check their brackets and details directly on the homepage!",
    "🏎️ Interested in speed? We support time-trials and track events. Try registering for Veloce GP or MRF Moto GP Challenge! Safety gear is always mandatory for physical events."
  ],
  esports: [
    "🎮 Esports brackets are fully automated here. We support Valorant (5v5 online), BGMI (25-squad Battle Royale), Free Fire (Bermuda/Kalahari maps), and Chess (Swiss format Blitz). Click any card on the homepage to register!",
    "🎯 Game on! Our online tournament system checks check-ins, sets lobby codes, and updates live brackets. Let me know if you need help joining Valorant, BGMI, or Chess!"
  ],
  sports: [
    "⚽ We support physical local sports like Cricket, Football, Basketball, and Badminton. You can book local grounds, coordinate referee payouts, and manage team entries easily!",
    "🏏 Physical sports events (like the Summer Cricket Cup or City Football Clash) are held at designated local stadiums. Roster sizes, age bounds, and address passes are managed right from the dashboard."
  ],
  host: [
    "🏆 Setting up a league is simple: log in, click 'Host Event' in your dashboard, choose your sport/game, fill out the venue, rules, entry fee, and prize pool, then publish it to the world!",
    "⚡ As a host, you can edit matches, submit scores, adjust team brackets, and manage participant registrations. Switch your role to HOST in the navbar to start!"
  ],
  join: [
    "🎟️ Ready to compete? Go to the 'Join Tournament' section, find an open match, and click register! You can register as a solo player or roster up to 6 players for team matches.",
    "🤝 Joining is quick: ensure you meet the eligibility rules, fill out your team name and player emails, and you will get immediate lobby or ground coordinate access."
  ],
  prize: [
    "💰 Many tournaments on Nova Hub have exciting prize pools! For instance, the Chinnaswamy Cricket Cup features a Rs. 50,000 pool, and esports tournaments like Free Fire have cash distributions for the top 3 squads.",
    "🏆 Prize distributions and entry fees are configured by the tournament hosts. Check the specific tournament details page for the exact breakdown!"
  ],
  default: [
    "I'm the Nova Assistant. You can ask me how to host tournaments, register for cricket/esports, check prize pools, or view live matches!",
    "Nova Hub coordinates tournament setups. Register rosters, coordinate check-ins on physical ground maps, stakes listing invoices, and updates league points. Let me know what you want to build!",
    "Need help? You can check out the featured tournaments on the homepage, switch roles in your dashboard, or ask me specific questions about sports/esports."
  ]
};

const getRandomResponse = (category) => {
  const list = SMART_RESPONSES[category] || SMART_RESPONSES.default;
  return list[Math.floor(Math.random() * list.length)];
};

const getSmartFallback = (message) => {
  const msg = message.toLowerCase().trim();
  
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("greetings")) {
    return getRandomResponse('greetings');
  }
  if (msg.includes("racing") || msg.includes("car") || msg.includes("bike") || msg.includes("cycle") || msg.includes("moto") || msg.includes("speed")) {
    return getRandomResponse('racing');
  }
  if (msg.includes("valorant") || msg.includes("bgmi") || msg.includes("free fire") || msg.includes("freefire") || msg.includes("chess") || msg.includes("esports") || msg.includes("game")) {
    return getRandomResponse('esports');
  }
  if (msg.includes("cricket") || msg.includes("football") || msg.includes("soccer") || msg.includes("basketball") || msg.includes("hoops") || msg.includes("badminton") || msg.includes("sports")) {
    return getRandomResponse('sports');
  }
  if (msg.includes("host") || msg.includes("create") || msg.includes("setup") || msg.includes("make")) {
    return getRandomResponse('host');
  }
  if (msg.includes("join") || msg.includes("play") || msg.includes("register") || msg.includes("signup")) {
    return getRandomResponse('join');
  }
  if (msg.includes("prize") || msg.includes("money") || msg.includes("fee") || msg.includes("win")) {
    return getRandomResponse('prize');
  }

  // Fallback with user sentence structure parsing
  const words = msg.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").split(/\s+/);
  const stopWords = ['a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves', 'give', 'me', 'please', 'tell', 'show', 'us', 'get'];
  const topics = words.filter(w => !stopWords.includes(w) && w.length > 2);

  if (topics.length > 0) {
    const topicStr = topics.slice(0, 3).join(' & ');
    return `Regarding "${topicStr}", Nova Hub is built to automate matches and scheduling. Check out the brackets, sports listings, or registration flow on your dashboard to see how to proceed!`;
  }

  return getRandomResponse('default');
};

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    let quotaWarning = "";

    // Try to run using Google Gemini or OpenAI if API Key is configured
    if (process.env.GEMINI_API_KEY) {
      try {
        const apiKey = process.env.GEMINI_API_KEY.trim();
        if (apiKey.startsWith('sk-')) {
          // OpenAI API endpoint
          const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'You are the Nova Assistant, a friendly and smart AI agent for Nova Hub, a sports and esports tournament platform. Keep your response within 2-4 sentences.' },
                { role: 'user', content: message }
              ]
            })
          });
          if (openAiRes.ok) {
            const data = await openAiRes.json();
            return res.json({ response: data.choices[0].message.content.trim() });
          } else {
            const errText = await openAiRes.text();
            console.error("OpenAI API returned an error:", errText);
            if (errText.includes("insufficient_quota")) {
              quotaWarning = "⚠️ [API Quota Exceeded] - Running on Local Backup: ";
            }
          }
        } else {
          // Google Gemini API endpoint
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          
          const systemPrompt = `You are the Nova Assistant, a friendly and smart AI agent for Nova Hub, a sports and esports tournament platform.
User is asking: "${message}".
Please answer their question directly, comprehensively, and dynamically. If they ask about sports, esports, hosting, joining, or brackets, explain how to do it in Nova Hub. Keep your response within 2-4 sentences.`;

          const result = await model.generateContent(systemPrompt);
          const response = await result.response;
          return res.json({ response: response.text().trim() });
        }
      } catch (apiError) {
        console.error("AI API execution error, falling back:", apiError);
      }
    }

    // Dynamic rule-based responder (so it never gives the exact same canned message)
    const reply = getSmartFallback(message);
    res.json({ response: quotaWarning + reply });

  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).json({ error: "Failed to generate response." });
  }
});

export default router;
