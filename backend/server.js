import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import tournamentRoutes from './routes/tournamentRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configurations matching client port
const corsOptions = {
  origin: (origin, callback) => {
    console.log('CORS Origin check request:', origin);
    // Allow requests with no origin (curl, mobile apps) or any local dev domain
    if (
      !origin || 
      origin.includes('localhost') || 
      origin.includes('127.0.0.1') || 
      origin.includes('::1') ||
      origin.includes('vercel.app')
    ) {
      callback(null, true);
    } else if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
      callback(null, true);
    } else {
      console.warn('Origin blocked by CORS policy:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routing mappings
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);

// Socket.io initialization
const io = new Server(server, {
  cors: corsOptions
});
app.set('io', io);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/novahub';

// Centralized error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Socket connection callback
io.on('connection', (socket) => {
  console.log(`Socket client connected to Nova Hub pipelines: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Mongoose connection with a fast timeout fallback
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => {
    console.log(`Connected successfully to MongoDB at: ${MONGODB_URI}`);
    process.env.USE_MOCK_DB = 'false';
    server.listen(PORT, () => {
      console.log(`Nova Hub backend running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB. Starting Express server in mock-db fallback mode.');
    process.env.USE_MOCK_DB = 'true';
    
    // Inject mock datasets so portal looks completely populated out-of-the-box
    import('./routes/mockStore.js').then(({ tournamentsDb }) => {
      if (tournamentsDb.length === 0) {
        tournamentsDb.push({
          _id: 'mock-t-1',
          title: 'Valorant Apex Invitational',
          category: 'esports',
          gameName: 'Valorant',
          rules: 'Standard esports tournament rules. Sub-18 requires parent concent.',
          venueType: 'online',
          venueDetails: { serverRegion: 'Asia South', lobbyCode: 'LBY-9923' },
          format: 'single-elimination',
          maxTeams: 8,
          teamSize: 5,
          prizePool: 25000,
          entryFee: 150,
          status: 'open',
          registeredTeams: []
        });
        tournamentsDb.push({
          _id: 'mock-t-2',
          title: 'Free Fire Firestarter Cup',
          category: 'esports',
          gameName: 'Free Fire',
          rules: 'Cheating/Hacks results in permanent ban.',
          venueType: 'online',
          venueDetails: { serverRegion: 'Asia East', lobbyCode: 'LBY-1033' },
          format: 'battle-royale-matrix',
          maxTeams: 16,
          teamSize: 4,
          prizePool: 15000,
          entryFee: 0,
          status: 'open',
          registeredTeams: []
        });
        tournamentsDb.push({
          _id: 'mock-t-3',
          title: 'Bangalore Cricket Cup',
          category: 'sports',
          gameName: 'Cricket',
          rules: 'Physical address venue check-ins require carrying physical IDs.',
          venueType: 'offline',
          venueDetails: { physicalAddress: 'Chinnaswamy Stadium, Bangalore', pinCode: '560001', stadiumHall: 'Net 3, West Gate', latitude: 12.9784, longitude: 77.5960 },
          format: 'round-robin',
          maxTeams: 4,
          teamSize: 11,
          prizePool: 50000,
          entryFee: 500,
          status: 'open',
          registeredTeams: []
        });
        tournamentsDb.push({
          _id: 'mock-t-4',
          title: 'Veloce Need for Speed Grand Prix',
          category: 'racing',
          gameName: 'Need for Speed',
          rules: 'Standard racing rules. No wall riding allowed.',
          venueType: 'online',
          venueDetails: { serverRegion: 'Europe West', lobbyCode: 'LBY-NFS99' },
          format: 'single-elimination',
          maxTeams: 4,
          teamSize: 1,
          prizePool: 10000,
          entryFee: 50,
          status: 'open',
          registeredTeams: []
        });
        tournamentsDb.push({
          _id: 'mock-t-5',
          title: 'Moto GP Pro Tour',
          category: 'racing',
          gameName: 'Bike Racing',
          rules: 'Time trial format. Safe passing rules enforce lane-discipline.',
          venueType: 'online',
          venueDetails: { serverRegion: 'North America', lobbyCode: 'LBY-MGP12' },
          format: 'single-elimination',
          maxTeams: 4,
          teamSize: 1,
          prizePool: 15000,
          entryFee: 75,
          status: 'open',
          registeredTeams: []
        });
        tournamentsDb.push({
          _id: 'mock-t-6',
          title: 'Tour de Nova Cycling Classic',
          category: 'racing',
          gameName: 'Cycle Racing',
          rules: 'GPS tracking active. Helmets and safety check mandatory.',
          venueType: 'offline',
          venueDetails: { physicalAddress: 'Sector 4 Velodrome, HubCity', pinCode: '560034', stadiumHall: 'Track Gate 1', latitude: 12.9279, longitude: 77.6271 },
          format: 'single-elimination',
          maxTeams: 4,
          teamSize: 1,
          prizePool: 20000,
          entryFee: 100,
          status: 'open',
          registeredTeams: []
        });
        tournamentsDb.push({
          _id: 'mock-t-7',
          title: 'Mumbai Football Arena Derby',
          category: 'sports',
          gameName: 'Football',
          rules: 'Aggressive play leads to warnings. Soft studs required.',
          venueType: 'offline',
          venueDetails: { physicalAddress: 'Mumbai Football Arena, Andheri, Mumbai', pinCode: '400053', stadiumHall: 'Main Pitch', latitude: 19.0760, longitude: 72.8777 },
          format: 'single-elimination',
          maxTeams: 8,
          teamSize: 11,
          prizePool: 40000,
          entryFee: 300,
          status: 'open',
          registeredTeams: []
        });
        tournamentsDb.push({
          _id: 'mock-t-8',
          title: 'Delhi Basketball Championship',
          category: 'sports',
          gameName: 'Basketball',
          rules: 'Four quarters of 10 minutes. FIBA rules apply.',
          venueType: 'offline',
          venueDetails: { physicalAddress: 'Talkatora Indoor Stadium, Delhi', pinCode: '110001', stadiumHall: 'Court A', latitude: 28.6139, longitude: 77.2090 },
          format: 'single-elimination',
          maxTeams: 8,
          teamSize: 5,
          prizePool: 30000,
          entryFee: 200,
          status: 'open',
          registeredTeams: []
        });
      }
    });

    server.listen(PORT, () => {
      console.log(`Nova Hub backend (MOCK FALLBACK) running on port ${PORT}`);
    });
  });

export { io };
