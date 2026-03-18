const express = require('express');
const db      = require('../db');
const { requireAuth, requireAdmin } = require('../auth/middleware');

const router = express.Router();

const ENTRY_QUERY = `
  SELECT
    e.*,
    t.name AS team_name, t.seed, t.region, t.eliminated_in_round,
    p.name AS participant_name
  FROM entries e
  JOIN teams        t ON e.team_id = t.id
  JOIN participants p ON e.participant_id = p.id
  ORDER BY t.region, t.seed
`;

// GET /api/entries
router.get('/', requireAuth, (req, res) => {
  const entries = db.prepare(ENTRY_QUERY).all();
  res.json(entries);
});

// GET /api/entries/:id
router.get('/:id', requireAuth, (req, res) => {
  const entry = db.prepare(ENTRY_QUERY + ' AND e.id = ?').get(req.params.id);
  if (!entry) return res.status(404).json({ error: 'Entry not found' });
  res.json(entry);
});

// POST /api/entries — record a new auction purchase
router.post('/', requireAdmin, (req, res) => {
  const { teamId, participantId, pricePaid, notes } = req.body;
  if (!teamId || !participantId || pricePaid == null) {
    return res.status(400).json({ error: 'teamId, participantId, and pricePaid are required' });
  }
  if (typeof pricePaid !== 'number' || pricePaid < 0) {
    return res.status(400).json({ error: 'pricePaid must be a non-negative number' });
  }

  // Check team exists
  const team = db.prepare('SELECT id FROM teams WHERE id = ?').get(teamId);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  // Check participant exists
  const participant = db.prepare('SELECT id FROM participants WHERE id = ?').get(participantId);
  if (!participant) return res.status(404).json({ error: 'Participant not found' });

  try {
    const result = db.prepare(
      'INSERT INTO entries (team_id, participant_id, price_paid, notes) VALUES (?, ?, ?, ?)'
    ).run(teamId, participantId, pricePaid, notes ?? null);

    res.status(201).json({ id: result.lastInsertRowid, ok: true });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'This team already has an owner. Use PUT to update.' });
    }
    throw err;
  }
});

// PUT /api/entries/:id — update an entry (trade recording, price correction)
router.put('/:id', requireAdmin, (req, res) => {
  const { participantId, pricePaid, notes } = req.body;
  const entry = db.prepare('SELECT id FROM entries WHERE id = ?').get(req.params.id);
  if (!entry) return res.status(404).json({ error: 'Entry not found' });

  if (participantId != null) {
    const participant = db.prepare('SELECT id FROM participants WHERE id = ?').get(participantId);
    if (!participant) return res.status(404).json({ error: 'Participant not found' });
  }

  db.prepare(`
    UPDATE entries SET
      participant_id = COALESCE(?, participant_id),
      price_paid     = COALESCE(?, price_paid),
      notes          = COALESCE(?, notes)
    WHERE id = ?
  `).run(participantId ?? null, pricePaid ?? null, notes ?? null, req.params.id);

  res.json({ ok: true });
});

// DELETE /api/entries/:id
router.delete('/:id', requireAdmin, (req, res) => {
  const entry = db.prepare('SELECT id FROM entries WHERE id = ?').get(req.params.id);
  if (!entry) return res.status(404).json({ error: 'Entry not found' });
  db.prepare('DELETE FROM entries WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
