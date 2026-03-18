require('dotenv').config();
const express  = require('express');
const session  = require('express-session');
const cors     = require('cors');
const path     = require('path');

// Initialize DB (runs migrations on first import)
require('./db');

const authRoutes         = require('./routes/auth');
const teamsRoutes        = require('./routes/teams');
const entriesRoutes      = require('./routes/entries');
const participantsRoutes = require('./routes/participants');
const analyticsRoutes    = require('./routes/analytics');

const app  = express();
const PORT = process.env.PORT || 3001;
const PROD = process.env.NODE_ENV === 'production';

// ── Middleware ──────────────────────────────────────────────────────────────

app.use(express.json());

// In development, allow the Vite dev server (port 5173) to send credentials
if (!PROD) {
  app.use(cors({
    origin:      'http://localhost:5173',
    credentials: true,
  }));
}

app.use(session({
  secret:            process.env.SESSION_SECRET || 'calcutta-dev-secret-change-me',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   PROD,
    maxAge:   1000 * 60 * 60 * 24 * 7, // 7 days
  },
}));

// ── API Routes ──────────────────────────────────────────────────────────────

app.use('/api/auth',         authRoutes);
app.use('/api/teams',        teamsRoutes);
app.use('/api/entries',      entriesRoutes);
app.use('/api/participants', participantsRoutes);
app.use('/api/analytics',    analyticsRoutes);

// ── Serve React build in production ────────────────────────────────────────

if (PROD) {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

// ── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (!PROD) console.log('API available at http://localhost:3001/api');
});
