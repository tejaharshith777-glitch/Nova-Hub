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

    // Seed MongoDB collections if empty
    import('./models/Tournament.js').then(async ({ default: Tournament }) => {
      try {
        const count = await Tournament.countDocuments();
        if (count === 0) {
          console.log('Database empty. Seeding physical and esports tournaments...');
          const { tournamentsDb } = await import('./routes/mockStore.js');
          const { User } = await import('./models/schemas.js');

          let host = await User.findOne({ role: 'host' });
          if (!host) {
            host = new User({
              username: 'system_host',
              email: 'host@novahub.com',
              passwordHash: '$2a$10$abcdefghijklmnopqrstuv', // placeholder
              role: 'host'
            });
            await host.save();
          }

          const seededTournaments = tournamentsDb.map(t => {
            const tObj = { ...t };
            delete tObj._id; // Let MongoDB assign actual ObjectIds
            tObj.hostId = host._id;
            return tObj;
          });

          await Tournament.insertMany(seededTournaments);
          console.log(`Successfully seeded ${seededTournaments.length} tournaments into MongoDB!`);
        }
      } catch (seedErr) {
        console.error('Error during database seeding:', seedErr);
      }
    });

    server.listen(PORT, () => {
      console.log(`Nova Hub backend running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB. Starting Express server in mock-db fallback mode.', err.message);
    process.env.USE_MOCK_DB = 'true';
    server.listen(PORT, () => {
      console.log(`Nova Hub backend (MOCK FALLBACK) running on port ${PORT}`);
    });
  });

export { io };
