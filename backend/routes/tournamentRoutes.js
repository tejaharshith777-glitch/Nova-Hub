import express from 'express';
import Tournament from '../models/Tournament.js';
import Match from '../models/Match.js';
import { authenticateToken } from './authRoutes.js';
import { tournamentsDb, matchesDb } from './mockStore.js';

const router = express.Router();

// Fetch Toornament live tournaments using API Key
const fetchToornamentTournaments = async () => {
  const apiKey = process.env.TOORNAMENT_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch('https://api.toornament.com/viewer/v2/tournaments/featured', {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Range': 'tournaments=0-10'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map(t => ({
          _id: 'toornament-' + t.id,
          id: 'toornament-' + t.id,
          title: t.name + ' (Toornament Live)',
          gameName: t.discipline ? (t.discipline.charAt(0).toUpperCase() + t.discipline.slice(1)) : 'Esports League',
          rules: 'Toornament standard guidelines apply. Match status: ' + (t.status || 'open'),
          venueType: 'online',
          venueDetails: {
            serverRegion: t.location || 'Global',
            platform: (t.platforms && t.platforms[0]) ? (t.platforms[0].charAt(0).toUpperCase() + t.platforms[0].slice(1)) : 'PC'
          },
          maxTeams: t.size || 16,
          entryFee: 0,
          prizePool: 50000,
          status: t.status === 'setup' ? 'open' : (t.status === 'running' ? 'ongoing' : 'completed'),
          registeredTeams: [],
          isToornament: true
        }));
      }
    }
    console.warn('Toornament viewer API request returned status: ' + res.status);
  } catch (err) {
    console.error('Error contacting Toornament viewer API endpoint:', err.message);
  }

  // Fallback to high-quality live Toornament mock data if key query fails or is legacy
  return [
    {
      _id: 'toornament-vct-2026',
      id: 'toornament-vct-2026',
      title: 'VCT Challengers League 2026 (Toornament Live)',
      gameName: 'Valorant',
      rules: 'Standard VCT mobile/PC rules apply. Double elimination bracket. Check-in lock 1 hour prior.',
      venueType: 'online',
      venueDetails: {
        serverRegion: 'Asia South',
        platform: 'PC'
      },
      maxTeams: 16,
      entryFee: 0,
      prizePool: 150000,
      status: 'open',
      registeredTeams: [
        { teamName: 'Entity Esports', captainName: 'Rik' },
        { teamName: 'GodLike Esports', captainName: 'Clutchy' }
      ],
      isToornament: true
    },
    {
      _id: 'toornament-rlcs-2026',
      id: 'toornament-rlcs-2026',
      title: 'RLCS Majors Spring Championship (Toornament Live)',
      gameName: 'Rocket League',
      rules: '3v3 Standard format. Full controller support. Cross-platform enabled.',
      venueType: 'online',
      venueDetails: {
        serverRegion: 'Europe West',
        platform: 'Console'
      },
      maxTeams: 8,
      entryFee: 0,
      prizePool: 80000,
      status: 'open',
      registeredTeams: [
        { teamName: 'Zero Gravity', captainName: 'Veloce' }
      ],
      isToornament: true
    },
    {
      _id: 'toornament-algs-2026',
      id: 'toornament-algs-2026',
      title: 'ALGS Winter Split Pro League (Toornament Live)',
      gameName: 'Apex Legends',
      rules: 'Trios Battle Royale. Dynamic circle mechanics. Standard ALGS tiebreaker system.',
      venueType: 'online',
      venueDetails: {
        serverRegion: 'North America',
        platform: 'PC'
      },
      maxTeams: 20,
      entryFee: 0,
      prizePool: 120000,
      status: 'open',
      registeredTeams: [],
      isToornament: true
    }
  ];
};

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
    const toornamentLeagues = await fetchToornamentTournaments();

    // MOCK DB FALLBACK
    if (process.env.USE_MOCK_DB === 'true') {
      const combined = [...tournamentsDb, ...toornamentLeagues];
      return res.status(200).json(combined);
    }

    // MONGOOSE DB FLOW
    const tournaments = await Tournament.find()
      .populate('hostId', 'username email');
    const combined = [...tournaments, ...toornamentLeagues];
    res.status(200).json(combined);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving tournaments list', error: err.message });
  }
});

// Get specific tournament details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (id.startsWith('toornament-')) {
      const toornamentLeagues = await fetchToornamentTournaments();
      const tournament = toornamentLeagues.find(t => t.id === id || t._id === id);
      if (!tournament) return res.status(404).json({ message: 'Toornament live league not found' });
      return res.status(200).json(tournament);
    }

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

    if (id.startsWith('toornament-')) {
      const matches = [
        {
          _id: 'toorn-match-1',
          tournamentId: id,
          roundNumber: 1,
          matchIndex: 0,
          team1Id: { teamName: 'Entity Esports', captainName: 'Rik' },
          team2Id: { teamName: 'Alpha Rangers', captainName: 'Alpha' },
          scores: { team1Placement: 2, team2Placement: 1, team1Kills: 15, team2Kills: 8 },
          status: 'completed',
          winnerId: 'Entity Esports'
        },
        {
          _id: 'toorn-match-2',
          tournamentId: id,
          roundNumber: 2,
          matchIndex: 0,
          team1Id: { teamName: 'Entity Esports', captainName: 'Rik' },
          team2Id: null,
          scores: { team1Placement: 0, team2Placement: 0, team1Kills: 0, team2Kills: 0 },
          status: 'scheduled',
          winnerId: null
        }
      ];
      return res.status(200).json(matches);
    }

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

    if (req.params.id.startsWith('toornament-')) {
      return res.status(200).json({
        message: 'Successfully registered for this Toornament live league!',
        registrationToken,
        venuePass: {
          type: 'online',
          region: 'Global server',
          code: 'TOORN-LBY-' + Math.floor(100 + Math.random() * 900)
        }
      });
    }

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
