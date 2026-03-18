const express = require('express');
const bcrypt  = require('bcrypt');
const db      = require('../db');
const { requireAuth } = require('../auth/middleware');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  bcrypt.compare(password, user.password_hash, (err, match) => {
    if (err || !match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.session.userId   = user.id;
    req.session.username = user.username;
    req.session.isAdmin  = user.is_admin === 1;

    return res.json({
      id:          user.id,
      username:    user.username,
      displayName: user.display_name,
      isAdmin:     user.is_admin === 1,
    });
  });
});

// POST /api/auth/logout
router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, username, display_name, is_admin FROM users WHERE id = ?')
    .get(req.session.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    id:          user.id,
    username:    user.username,
    displayName: user.display_name,
    isAdmin:     user.is_admin === 1,
  });
});

module.exports = router;
