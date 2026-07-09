# Nova Hub - Full Website Architecture & Plan

Nova Hub is a premium, retro neubrutalist web portal designed for gaming and sports enthusiast communities. It serves as a unified hub for hosting, finding, and participating in local offline matches and global online esports tournaments.

---

## 1. Technology Stack

- **Frontend**: React (built with Vite), Tailwind CSS for basic utility framework, custom vanilla CSS animations, and Lucide React icons.
- **Backend**: Node.js with Express, Socket.io for real-time notifications, and Mongoose (MongoDB) for database persistence.
- **Routing**: Client-side routing with `react-router-dom` on the frontend, mapped via Vercel `rewrites` to guarantee direct page reload `200 OK` responses.
- **Hosting & Deployment**: Frontend deployed on Vercel; Backend deployed on Render/Vercel Serverless.

---

## 2. Core Features

### 📡 Interactive Proximity Radar
- **GPS & IP Geolocation**: Automatically detects coordinates on user mount, falling back to IP-based coordinates or custom manual overrides.
- **Proximity Filtering**: Filters tournaments based on real-time distance calculations (using the Haversine formula). Users can adjust a sliding radius (e.g. 50km, 100km, 250km).
- **Interactive Vector Map**: A custom SVG grid displaying tournaments as coordinate pins. Clicking on any pin dynamically centers the proximity radar on that location.

### 🏆 Tournament Lifecycle Management
- **Hosting Portal**: Organizers can create tournaments under different categories: `esports` (online), `sports` (offline), or `racing` (offline cycle/bike/car, online arcade).
- **Online vs Offline Modes**: Online events display regions and lobby codes. Offline events track venues, addresses, stadium coordinates, and distance from the viewer.
- **Team Registrations**: Users can register teams, view slot limits, entry fees, and prize pools.

### 💬 Real-time WebSockets Sync
- Simulates live match activity feeds and triggers alerts using Socket.io.
- Displays instant notifications when slots are filled or when match coordinates are updated.

---

## 3. Database Schemas (Mongoose)

### 👤 User Schema
```javascript
{
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['player', 'host'], default: 'player' }
}
```

### 🏟️ Tournament Schema
```javascript
{
  title: { type: String, required: true },
  hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['esports', 'sports', 'academic', 'racing'], required: true },
  gameName: { type: String, required: true },
  rules: { type: String },
  venueType: { type: String, enum: ['online', 'offline'], required: true },
  venueDetails: {
    physicalAddress: { type: String },
    stadiumHall: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    serverRegion: { type: String },
    platform: { type: String }
  },
  format: { type: String, required: true },
  maxTeams: { type: Number, required: true },
  teamSize: { type: Number, default: 1 },
  prizePool: { type: Number, default: 0 },
  entryFee: { type: Number, default: 0 },
  status: { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open' },
  registeredTeams: [
    {
      teamName: { type: String, required: true },
      captainEmail: { type: String, required: true },
      roster: [{ type: String }]
    }
  ]
}
```

### 🥊 Match Schema
```javascript
{
  tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
  round: { type: Number, default: 1 },
  teamA: { type: String, required: true },
  teamB: { type: String, required: true },
  scoreA: { type: Number, default: 0 },
  scoreB: { type: Number, default: 0 },
  winner: { type: String },
  status: { type: String, enum: ['scheduled', 'live', 'finished'], default: 'scheduled' }
}
```

---

## 4. Visual Design Identity

- **Neubrutalism Grid**: High-contrast dark borders (`border-[3px] border-[#1a1a1a]`), heavy blocky box-shadows, and bright pastel color cards.
- **Vibrant CSS Animations**: Automated floating, hand waving, and sunglasses-wiggling emojis in the footer.
- **Giant Branding Wordmark**: Viewport-scaled (`text-[14vw]`), bold uppercase `"NOVA HUB"` spanning edge-to-edge on a matching mint-blue background at the bottom of the page.
