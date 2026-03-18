const express = require('express');
const db      = require('../db');
const { requireAuth, requireAdmin } = require('../auth/middleware');
const { seedEvPct } = require('../lib/ev');
const { portfolioScore } = require('../lib/analytics');

const router = express.Router();

// GET /api/participants
router.get('/', requireAuth, (req, res) => {
  const participants = db.prepare('SELECT * FROM participants ORDER BY name').all();
  res.json(participants);
});

// GET /api/participants/:id/portfolio
router.get('/:id/portfolio', requireAuth, (req, res) => {
  const participant = db.prepare('SELECT * FROM participants WHERE id = ?').get(req.params.id);
  if (!participant) return res.status(404).json({ error: 'Participant not found' });

  const entries = db.prepare(`
    SELECT e.price_paid, e.notes,
           t.id AS team_id, t.name AS team_name, t.seed, t.region, t.eliminated_in_round
    FROM entries e
    JOIN teams t ON e.team_id = t.id
    WHERE e.participant_id = ?
    ORDER BY t.seed, t.name
  `).all(req.params.id);

  const enriched = entries.map(e => ({ ...e, ev_pct: seedEvPct(e.seed) }));

  const totalSpent  = enriched.reduce((s, e) => s + e.price_paid, 0);
  const totalEvPct  = enriched.reduce((s, e) => s + e.ev_pct, 0);
  const activeEvPct = enriched
    .filter(e => !e.eliminated_in_round)
    .reduce((s, e) => s + e.ev_pct, 0);

  const score = portfolioScore(enriched);

  res.json({
    participant,
    entries: enriched,
    summary: {
      total_spent:  totalSpent,
      teams_count:  enriched.length,
      total_ev_pct: totalEvPct,
      active_ev_pct: activeEvPct,
      teams_alive:  enriched.filter(e => !e.eliminated_in_round).length,
    },
    diversification: score,
  });
});

// POST /api/participants — admin only
router.post('/', requireAdmin, (req, res) => {
  const { name, userId } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    const result = db.prepare('INSERT INTO participants (name, user_id) VALUES (?, ?)')
      .run(name, userId ?? null);
    res.status(201).json({ id: result.lastInsertRowid, ok: true });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Participant name already exists' });
    }
    throw err;
  }
});

// PUT /api/participants/:id — admin only
router.put('/:id', requireAdmin, (req, res) => {
  const { name, userId } = req.body;
  const participant = db.prepare('SELECT id FROM participants WHERE id = ?').get(req.params.id);
  if (!participant) return res.status(404).json({ error: 'Participant not found' });

  db.prepare('UPDATE participants SET name = COALESCE(?, name), user_id = COALESCE(?, user_id) WHERE id = ?')
    .run(name ?? null, userId ?? null, req.params.id);

  res.json({ ok: true });
});

module.exports = router;
