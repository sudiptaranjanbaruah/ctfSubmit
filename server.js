const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.set('trust proxy', 1); // Required for rate limiting behind proxies (Render/Railway/Heroku)

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Specific limiter for login and submit to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Strict limit for auth/submission
  message: { success: false, message: 'Too many attempts, please try again later.' }
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'ctf-secret-key-2024', // Use env var in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files with caching headers
app.use(express.static('public', {
  maxAge: '1d' // Cache static assets for 1 day
}));

// Helper function to read passwords.md
function readPasswords() {
  const passwordFile = fs.readFileSync('passwords.md', 'utf-8');
  const lines = passwordFile.split('\n').filter(line => line.trim());
  const users = {};

  lines.forEach(line => {
    const [username, password] = line.split(':');
    if (username && password) {
      users[username.trim()] = password.trim();
    }
  });

  return users;
}

// Helper function to read CTFs
function readCTFs() {
  const ctfsData = fs.readFileSync('data/ctfs.json', 'utf-8');
  return JSON.parse(ctfsData);
}

// Helper function to read submissions
function readSubmissions() {
  const submissionsData = fs.readFileSync('data/submissions.json', 'utf-8');
  return JSON.parse(submissionsData);
}

// Helper function to write submissions
function writeSubmissions(submissions) {
  fs.writeFileSync('data/submissions.json', JSON.stringify(submissions, null, 2));
}

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// Routes
app.post('/login', authLimiter, (req, res) => {
  const { username, password } = req.body;
  const users = readPasswords();

  if (users[username] && users[username] === password) {
    req.session.user = username;
    res.json({ success: true, username });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/ctfs', requireAuth, (req, res) => {
  const ctfs = readCTFs();
  // Don't send flags to frontend
  const safeCTFs = ctfs.map(({ id, title, description }) => ({ id, title, description }));
  res.json(safeCTFs);
});

app.post('/api/submit', requireAuth, authLimiter, (req, res) => {
  const { ctfId, submittedFlag } = req.body;
  const username = req.session.user;
  const ctfs = readCTFs();
  const submissions = readSubmissions();

  const ctf = ctfs.find(c => c.id === ctfId);

  if (!ctf) {
    return res.status(404).json({ success: false, error: 'CTF not found' });
  }

  // Check if already solved by this user
  const alreadySolved = submissions.some(s => s.user === username && s.ctfId === ctfId);

  if (alreadySolved && submittedFlag.trim() === ctf.flag) {
    return res.json({ success: false, message: 'Already entered' });
  }

  if (submittedFlag.trim() === ctf.flag) {
    if (!alreadySolved) {
      submissions.push({
        user: username,
        ctfId: ctfId,
        timestamp: new Date().toISOString()
      });
      writeSubmissions(submissions);
    }
    res.json({ success: true, message: 'Correct flag!' });
  } else {
    res.json({ success: false, message: 'Incorrect flag entered' });
  }
});

app.get('/api/leaderboard', requireAuth, (req, res) => {
  const submissions = readSubmissions();
  const userData = {};
  const ctfLeaderboards = {};

  // Process submissions
  submissions.forEach(sub => {
    // Overall Leaderboard Logic
    if (!userData[sub.user]) {
      userData[sub.user] = {
        username: sub.user,
        solvedCount: 0,
        solvedCTFs: [],
        lastSolved: sub.timestamp
      };
    }
    userData[sub.user].solvedCount++;
    userData[sub.user].solvedCTFs.push(sub.ctfId);
    if (new Date(sub.timestamp) > new Date(userData[sub.user].lastSolved)) {
      userData[sub.user].lastSolved = sub.timestamp;
    }

    // Per-CTF Leaderboard Logic
    if (!ctfLeaderboards[sub.ctfId]) {
      ctfLeaderboards[sub.ctfId] = [];
    }
    ctfLeaderboards[sub.ctfId].push({
      username: sub.user,
      timestamp: sub.timestamp
    });
  });

  // Sort Overall
  const overall = Object.values(userData)
    .sort((a, b) => {
      if (b.solvedCount !== a.solvedCount) return b.solvedCount - a.solvedCount;
      return new Date(a.lastSolved) - new Date(b.lastSolved); // First to solve wins tie
    });

  // Sort per-CTF (by timestamp)
  Object.keys(ctfLeaderboards).forEach(ctfId => {
    ctfLeaderboards[ctfId].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  });

  res.json({
    overall,
    ctfs: ctfLeaderboards
  });
});

app.get('/api/user', requireAuth, (req, res) => {
  res.json({ username: req.session.user });
});

// Start server
app.listen(PORT, () => {
  console.log(`CTF Server running on http://localhost:${PORT}`);
});
