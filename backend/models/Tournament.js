import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const rosterMemberSchema = new Schema({
  name: { type: String, required: true },
  gameId: { type: String, required: true }
});

const registeredTeamSchema = new Schema({
  teamName: { type: String, required: true },
  captainName: { type: String, required: true },
  captainEmail: { type: String, required: true },
  roster: [rosterMemberSchema], // Array of up to 6 players
  registrationToken: { type: String, required: true },
  eligibilityDocUrl: { type: String, default: '' },
  rulesAccepted: { type: Boolean, default: true }
}, { timestamps: true });

const tournamentSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Tournament title is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['esports', 'sports', 'academic', 'racing'],
    required: true
  },
  gameName: {
    type: String,
    required: true,
    trim: true
  },
  venueType: {
    type: String,
    enum: ['online', 'offline'],
    required: true
  },
  venueDetails: {
    serverRegion: { type: String, default: '' },
    lobbyCode: { type: String, default: '' },
    physicalAddress: { type: String, default: '' },
    pinCode: { type: String, default: '' },
    stadiumHall: { type: String, default: '' },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 }
  },
  format: {
    type: String,
    enum: ['single-elimination', 'double-elimination', 'round-robin', 'battle-royale-matrix'],
    default: 'single-elimination'
  },
  maxTeams: {
    type: Number,
    required: true,
    min: 2
  },
  teamSize: {
    type: Number,
    required: true,
    default: 5
  },
  prizePool: {
    type: Number,
    required: true,
    min: 0
  },
  entryFee: {
    type: Number,
    required: true,
    min: 0
  },
  prizeDistribution: {
    firstPlace: { type: Number, default: 60 },
    secondPlace: { type: Number, default: 30 },
    thirdPlace: { type: Number, default: 10 }
  },
  status: {
    type: String,
    enum: ['open', 'ongoing', 'completed'],
    default: 'open'
  },
  hostId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registeredTeams: [registeredTeamSchema]
}, { timestamps: true });

export default model('Tournament', tournamentSchema);
