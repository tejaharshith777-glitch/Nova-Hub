import express from 'express';
import Tournament from '../models/Tournament.js';
import Match from '../models/Match.js';
import { authenticateToken } from './authRoutes.js';
import { tournamentsDb, matchesDb } from './mockStore.js';

const router = express.Router();

// Helpers to auto-generate single elimination match bracket structure
const generateMatchesMock = (tournament) => {
  const maxTeams = tournament.maxTeams;
  const numRounds = Math.log2(maxTeams);

  // Generate round 1 matches
  for (let i = 0; i < maxTeams / 2; i++) {
    const team1 = tournament.registeredTeams[2 * i];
    const team2 = tournament.registeredTeams[2 * i + 1];
    matchesDb.push({
      _id: 'mock-match-' + Math.random().toString(36).substring(2, 9),
      tournamentId: tournament._id,
      roundNumber: 1,
      matchIndex: i,
      team1Id: team1 ? (team1._id || team1.registrationToken) : null,
      team2Id: team2 ? (team2._id || team2.registrationToken) : null,
      scores: { team1Kills: 0, team2Kills: 0, team1Placement: 0, team2Placement: 0 },
      status: 'scheduled',
      winnerId: null
    });
  }

  // Generate empty subsequent round matches
  for (let r = 2; r <= numRounds; r++) {
    const numMatchesInRound = maxTeams / Math.pow(2, r);
    for (let i = 0; i < numMatchesInRound; i++) {
      matchesDb.push({
        _id: 'mock-match-' + Math.random().toString(36).substring(2, 9),
        tournamentId: tournament._id,
        roundNumber: r,
        matchIndex: i,
        team1Id: null,
        team2Id: null,
        scores: { team1Kills: 0, team2Kills: 0, team1Placement: 0, team2Placement: 0 },
        status: 'scheduled',
        winnerId: null
      });
    }
  }
};

const generateMatchesMongoose = async (tournament) => {
  const maxTeams = tournament.maxTeams;
  const numRounds = Math.log2(maxTeams);
  const matchesToInsert = [];

  // Generate round 1 matches
  for (let i = 0; i < maxTeams / 2; i++) {
    const team1 = tournament.registeredTeams[2 * i];
    const team2 = tournament.registeredTeams[2 * i + 1];
    matchesToInsert.push({
      tournamentId: tournament._id,
      roundNumber: 1,
      matchIndex: i,
      team1Id: team1 ? (team1._id ? team1._id.toString() : null) : null,
      team2Id: team2 ? (team2._id ? team2._id.toString() : null) : null,
      scores: { team1Kills: 0, team2Kills: 0, team1Placement: 0, team2Placement: 0 },
      status: 'scheduled',
      winnerId: null
    });
  }

  // Generate empty subsequent round matches
  for (let r = 2; r <= numRounds; r++) {
    const numMatchesInRound = maxTeams / Math.pow(2, r);
    for (let i = 0; i < numMatchesInRound; i++) {
      matchesToInsert.push({
        tournamentId: tournament._id,
        roundNumber: r,
        matchIndex: i,
        team1Id: null,
        team2Id: null,
        scores: { team1Kills: 0, team2Kills: 0, team1Placement: 0, team2Placement: 0 },
        status: 'scheduled',
        winnerId: null
      });
    }
  }

  await Match.insertMany(matchesToInsert);
};

// Get all tournaments
router.get('/', async (req, res) => {
  try {
    // MOCK DB FALLBACK
    if (process.env.USE_MOCK_DB === 'true') {
      return res.status(200).json(tournamentsDb);
    }

    // MONGOOSE DB FLOW
    const tournaments = await Tournament.find()
      .populate('hostId', 'username email');
    res.status(200).json(tournaments);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving tournaments list', error: err.message });
  }
});

// Get specific tournament details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // MOCK DB MODE
    if (process.env.USE_MOCK_DB === 'true') {
      const tournament = tournamentsDb.find(t => t._id === id);
      if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
      return res.status(200).json(tournament);
    }

    // MONGOOSE DB FLOW
    const tournament = await Tournament.findById(id).populate('hostId', 'username email');
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    res.status(200).json(tournament);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving tournament details', error: err.message });
  }
});

// Get tournament matches
router.get('/:id/matches', async (req, res) => {
  try {
    const { id } = req.params;

    // MOCK DB MODE
    if (process.env.USE_MOCK_DB === 'true') {
      const tournament = tournamentsDb.find(t => t._id === id);
      if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

      const matches = matchesDb.filter(m => m.tournamentId === id);
      const populatedMatches = matches.map(m => {
        const mObj = { ...m };
        if (mObj.team1Id) {
          const t1 = tournament.registeredTeams.find(t => t._id === mObj.team1Id || t.registrationToken === mObj.team1Id);
          if (t1) mObj.team1Id = t1;
        }
        if (mObj.team2Id) {
          const t2 = tournament.registeredTeams.find(t => t._id === mObj.team2Id || t.registrationToken === mObj.team2Id);
          if (t2) mObj.team2Id = t2;
        }
        if (mObj.winnerId) {
          const w = tournament.registeredTeams.find(t => t._id === mObj.winnerId || t.registrationToken === mObj.winnerId);
          if (w) mObj.winnerId = w;
        }
        return mObj;
      });

      return res.status(200).json(populatedMatches);
    }

    // MONGOOSE DB FLOW
    const tournament = await Tournament.findById(id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    const matches = await Match.find({ tournamentId: id }).sort({ roundNumber: 1, matchIndex: 1 });
    const populatedMatches = matches.map(m => {
      const mObj = m.toObject();
      if (mObj.team1Id) {
        const t1 = tournament.registeredTeams.find(t => t._id.toString() === mObj.team1Id.toString());
        if (t1) mObj.team1Id = t1;
      }
      if (mObj.team2Id) {
        const t2 = tournament.registeredTeams.find(t => t._id.toString() === mObj.team2Id.toString());
        if (t2) mObj.team2Id = t2;
      }
      if (mObj.winnerId) {
        const w = tournament.registeredTeams.find(t => t._id.toString() === mObj.winnerId.toString());
        if (w) mObj.winnerId = w;
      }
      return mObj;
    });

    res.status(200).json(populatedMatches);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving matches list', error: err.message });
  }
});

// Create Tournament (Host only)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'host') {
      return res.status(403).json({ message: 'Access denied. Only tournament hosts can list competitions.' });
    }

    const {
      title,
      category,
      gameName,
      rules,
      venueType,
      venueDetails,
      format,
      maxTeams,
      teamSize,
      prizePool,
      entryFee,
      prizeDistribution
    } = req.body;

    // MOCK DB FALLBACK
    if (process.env.USE_MOCK_DB === 'true') {
      const newTournament = {
        _id: 'mock-tourney-' + Math.random().toString(36).substring(2, 9),
        title,
        category,
        gameName,
        rules,
        venueType,
        venueDetails,
        format,
        maxTeams: parseInt(maxTeams),
        teamSize: parseInt(teamSize),
        prizePool: parseFloat(prizePool),
        entryFee: parseFloat(entryFee),
        prizeDistribution,
        hostId: { _id: req.user.id, username: req.user.username },
        registeredTeams: [],
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      tournamentsDb.push(newTournament);

      return res.status(201).json({
        message: 'Tournament successfully listed on public timelines (MOCK DB MODE).',
        tournament: newTournament
      });
    }

    // MONGOOSE DB FLOW
    const newTournament = new Tournament({
      title,
      category,
      gameName,
      rules,
      venueType,
      venueDetails,
      format,
      maxTeams: parseInt(maxTeams),
      teamSize: parseInt(teamSize),
      prizePool: parseFloat(prizePool),
      entryFee: parseFloat(entryFee),
      prizeDistribution,
      hostId: req.user.id
    });

    await newTournament.save();

    res.status(201).json({
      message: 'Tournament successfully listed on public timelines.',
      tournament: newTournament
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating tournament listing', error: err.message });
  }
});

// Join Tournament (Participant only)
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'participant') {
      return res.status(403).json({ message: 'Only participant profiles can join competitions.' });
    }

    const { teamName, captainName, captainEmail, roster, eligibilityDocUrl, rulesAccepted } = req.body;

    if (!teamName || !captainName || !captainEmail || !roster || roster.length === 0) {
      return res.status(400).json({ message: 'Roster validation failure. Fill in all registration details.' });
    }

    const registrationToken = 'REG-' + Math.random().toString(36).substring(2, 9).toUpperCase() + '-' + Date.now().toString().slice(-4);

    // MOCK DB FALLBACK
    if (process.env.USE_MOCK_DB === 'true') {
      const tournament = tournamentsDb.find(t => t._id === req.params.id);
      if (!tournament) return res.status(404).json({ message: 'Target tournament not found.' });

      if (tournament.registeredTeams.length >= tournament.maxTeams) {
        return res.status(400).json({ message: 'Registration full. All team slots are taken.' });
      }

      const newTeamPayload = {
        teamName,
        captainName,
        captainEmail,
        roster,
        registrationToken,
        eligibilityDocUrl: eligibilityDocUrl || '',
        rulesAccepted: !!rulesAccepted
      };

      tournament.registeredTeams.push(newTeamPayload);

      if (tournament.registeredTeams.length === tournament.maxTeams) {
        tournament.status = 'ongoing';
        generateMatchesMock(tournament);

        // Broadcast real-time update
        const io = req.app.get('io');
        if (io) {
          const matches = matchesDb.filter(m => m.tournamentId === tournament._id);
          const populatedMatches = matches.map(m => {
            const mObj = { ...m };
            if (mObj.team1Id) {
              const t1 = tournament.registeredTeams.find(t => t._id === mObj.team1Id || t.registrationToken === mObj.team1Id);
              if (t1) mObj.team1Id = t1;
            }
            if (mObj.team2Id) {
              const t2 = tournament.registeredTeams.find(t => t._id === mObj.team2Id || t.registrationToken === mObj.team2Id);
              if (t2) mObj.team2Id = t2;
            }
            if (mObj.winnerId) {
              const w = tournament.registeredTeams.find(t => t._id === mObj.winnerId || t.registrationToken === mObj.winnerId);
              if (w) mObj.winnerId = w;
            }
            return mObj;
          });
          io.emit('tournamentUpdate', { tournament, matches: populatedMatches });
        }
      }

      const venuePassDetails = tournament.venueType === 'online'
        ? { type: 'online', code: tournament.venueDetails.lobbyCode, region: tournament.venueDetails.serverRegion }
        : { type: 'offline', address: tournament.venueDetails.physicalAddress, pin: tournament.venueDetails.pinCode, room: tournament.venueDetails.stadiumHall };

      return res.status(200).json({
        message: 'Roster injected. Registration completed successfully (MOCK DB MODE).',
        registrationToken,
        venuePass: venuePassDetails,
        tournament
      });
    }

    // MONGOOSE DB FLOW
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Target tournament not found.' });

    if (tournament.registeredTeams.length >= tournament.maxTeams) {
      return res.status(400).json({ message: 'Registration full. All team slots are taken.' });
    }

    const newTeamPayload = {
      teamName,
      captainName,
      captainEmail,
      roster,
      registrationToken,
      eligibilityDocUrl: eligibilityDocUrl || '',
      rulesAccepted: !!rulesAccepted
    };

    tournament.registeredTeams.push(newTeamPayload);

    if (tournament.registeredTeams.length === tournament.maxTeams) {
      tournament.status = 'ongoing';
      await generateMatchesMongoose(tournament);

      // Broadcast real-time update
      const io = req.app.get('io');
      if (io) {
        const matches = await Match.find({ tournamentId: tournament._id }).sort({ roundNumber: 1, matchIndex: 1 });
        const populatedMatches = matches.map(m => {
          const mObj = m.toObject();
          if (mObj.team1Id) {
            const t1 = tournament.registeredTeams.find(t => t._id.toString() === mObj.team1Id.toString());
            if (t1) mObj.team1Id = t1;
          }
          if (mObj.team2Id) {
            const t2 = tournament.registeredTeams.find(t => t._id.toString() === mObj.team2Id.toString());
            if (t2) mObj.team2Id = t2;
          }
          if (mObj.winnerId) {
            const w = tournament.registeredTeams.find(t => t._id.toString() === mObj.winnerId.toString());
            if (w) mObj.winnerId = w;
          }
          return mObj;
        });
        io.emit('tournamentUpdate', { tournament, matches: populatedMatches });
      }
    }

    await tournament.save();

    const venuePassDetails = tournament.venueType === 'online'
      ? { type: 'online', code: tournament.venueDetails.lobbyCode, region: tournament.venueDetails.serverRegion }
      : { type: 'offline', address: tournament.venueDetails.physicalAddress, pin: tournament.venueDetails.pinCode, room: tournament.venueDetails.stadiumHall };

    res.status(200).json({
      message: 'Roster injected. Registration completed successfully.',
      registrationToken,
      venuePass: venuePassDetails,
      tournament
    });
  } catch (err) {
    res.status(500).json({ message: 'Error joining competition roster pipelines', error: err.message });
  }
});

export default router;
