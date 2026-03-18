const express = require('express');
const db      = require('../db');
const { requireAuth, requireAdmin } = require('../auth/middleware');
const { seedEvPct } = require('../lib/ev');

const router = express.Router();

// Enrich a team row with EV and entry data
function enrichTeam(team, entries) {
  const evPct  = seedEvPct(team.seed);
  const entry  = entries.find(e => e.team_id === team.id) || null;
  return {
    ...team,
    ev_pct: evPct,
    entry: entry || null,
  };
}

// GET /api/teams
router.get('/', requireAuth, (req, res) => {
  const teams   = db.prepare('SELECT * FROM teams ORDER BY region, seed').all();
  const entries = db.prepare(`
    SELECT e.*, p.name AS participant_name
    FROM entries e
    JOIN participants p ON e.participant_id = p.id
  `).all();

  const enriched = teams.map(t => enrichTeam(t, entries));
  res.json(enriched);
});

// GET /api/teams/:id
router.get('/:id', requireAuth, (req, res) => {
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  const entry = db.prepare(`
    SELECT e.*, p.name AS participant_name
    FROM entries e
    JOIN participants p ON e.participant_id = p.id
    WHERE e.team_id = ?
  `).get(team.id);

  res.json({ ...team, ev_pct: seedEvPct(team.seed), entry: entry || null });
});

// PATCH /api/teams/:id/eliminate — admin only
router.patch('/:id/eliminate', requireAdmin, (req, res) => {
  const { eliminatedInRound } = req.body;
  const valid = [null, 'R64', 'R32', 'S16', 'E8', 'F4', 'RU', 'CH'];
  if (!valid.includes(eliminatedInRound)) {
    return res.status(400).json({ error: 'Invalid round. Use: R64, R32, S16, E8, F4, RU, CH, or null' });
  }

  const team = db.prepare('SELECT id FROM teams WHERE id = ?').get(req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  db.prepare("UPDATE teams SET eliminated_in_round = ?, updated_at = datetime('now') WHERE id = ?")
    .run(eliminatedInRound ?? null, req.params.id);

  res.json({ ok: true });
});

// PATCH /api/teams/:id/kenpom — admin only
router.patch('/:id/kenpom', requireAdmin, (req, res) => {
  const { adjEM, adjT } = req.body;
  const team = db.prepare('SELECT id FROM teams WHERE id = ?').get(req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  db.prepare("UPDATE teams SET kenpom_adj_em = ?, kenpom_adj_t = ?, updated_at = datetime('now') WHERE id = ?")
    .run(adjEM ?? null, adjT ?? null, req.params.id);

  res.json({ ok: true });
});

// PUT /api/teams/:id — update team name/seed/region (admin)
router.put('/:id', requireAdmin, (req, res) => {
  const { name, seed, region } = req.body;
  const team = db.prepare('SELECT id FROM teams WHERE id = ?').get(req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  db.prepare("UPDATE teams SET name = ?, seed = ?, region = ?, updated_at = datetime('now') WHERE id = ?")
    .run(name, seed, region, req.params.id);

  res.json({ ok: true });
});

module.exports = router;
