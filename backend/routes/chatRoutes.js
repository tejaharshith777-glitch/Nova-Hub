import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// A simple dictionary for smart fallback answers
const FALLBACK_ANSWERS = {
  host: "To host a tournament on Nova Hub, go to your Dashboard and click on 'Host Event'. You can configure slots, specify rules, entry fee, prize pool, and venue (online or physical) instantly!",
  join: "To join a tournament, search the homepage or dashboard for your game or sport, select it, and click 'Register' or 'Join'. For team games, you will be prompted to enter your roster details.",
  tournament: "Nova Hub helps run structured tournaments with live brackets, automatic scoring, and slot tracking. Check out our featured events on the main page!",
  racing: "We support Car Racing (Veloce GP Series), Bike Racing (Moto GP Pro Tour), and Cycling (Tour de Nova Classic). Go to the Racing section on our homepage to see details!",
  valorant: "Valorant Apex Invitational features 5v5 competitive matches with bracket synchronization. Check the esports page to register!",
  bgmi: "BGMI Battlegrounds Pro is open for squad registrations. Ensure anti-cheat is installed and register your team!",
  freefire: "Garena Free Fire Champions Cup is live with squad BR matches. Join now and test your skills!",
  chess: "Our Online Chess League runs in Swiss format blitz. Ratings verified via chess.com.",
  cricket: "Summer Cricket Cup runs at Chinnaswamy Stadium. Pitch conditions, slots, and team entry are managed on the dashboard.",
  football: "City Football Cup runs locally. Register your team size (up to 11 players) and view map coordinate venue passes.",
  hoops: "Downtown Hoops Challenge is 3v3 and 5v5 basketball. Check-in coordinates are sent to team captains.",
  badminton: "State Badminton Smash supports single and double elimination brackets. Sign up before slots fill up!",
  prize: "Nova Hub tournament creators determine prize pools. Some featured events have prize pools up to Rs. 50,000!",
  register: "Click 'Sign In' in the top navbar, create an account, and verify your role. From there, register for any active event!",
  contact: "Need support? Contact us via support@novahub.com or leave a message with our community channels.",
};

const getSmartFallback = (message) => {
  const msg = message.toLowerCase().trim();
  
  // Clean message and find matching keywords
  for (const [key, value] of Object.entries(FALLBACK_ANSWERS)) {
    if (msg.includes(key)) {
      return value;
    }
  }

  // Sentence-based dynamic generation
  const words = msg.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").split(/\s+/);
  const stopWords = ['a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves', 'give', 'me', 'please', 'tell', 'show', 'us', 'get'];
  const topics = words.filter(w => !stopWords.includes(w) && w.length > 2);

  if (topics.length > 0) {
    const topicStr = topics.slice(0, 3).join(' & ');
    return `Nova Hub is the ultimate platform for organizing and participating in matches! Regarding "${topicStr}", you can check the homepage filter section or your dashboard to view matching events and rules.`;
  }

  return "I'm the Nova Assistant. You can ask me how to host tournaments, register for cricket/esports, check prize pools, or view live matches!";
};

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Try to run using Google Gemini if API Key is configured
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const systemPrompt = `You are the Nova Assistant, a friendly and smart AI agent for Nova Hub, a sports and esports tournament platform.
User is asking: "${message}".
Please answer their question directly, comprehensively, and dynamically. If they ask about sports, esports, hosting, joining, or brackets, explain how to do it in Nova Hub. Keep your response within 2-4 sentences.`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        return res.json({ response: response.text().trim() });
      } catch (geminiError) {
        console.error("Gemini API execution error, falling back:", geminiError);
        // Fall back to rule-based on API failure
      }
    }

    // Dynamic rule-based responder (so it never gives the exact same canned message)
    const reply = getSmartFallback(message);
    res.json({ response: reply });

  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).json({ error: "Failed to generate response." });
  }
});

export default router;
