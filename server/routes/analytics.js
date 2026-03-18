const express = require('express');
const db      = require('../db');
const { requireAuth } = require('../auth/middleware');
const { seedEvPct, estimatedPot, enrichEntry } = require('../lib/ev');
const { computeTradeFlags, portfolioScore } = require('../lib/analytics');

const router = express.Router();

function getAllEnrichedEntries(potSize) {
  const rows = db.prepare(`
    SELECT
      e.id, e.price_paid, e.notes,
      t.id AS team_id, t.name AS team_name, t.seed, t.region, t.eliminated_in_round,
      p.id AS participant_id, p.name AS participant_name
    FROM entries e
    JOIN teams        t ON e.team_id = t.id
    JOIN participants p ON e.participant_id = p.id
  `).all();

  return rows.map(r => {
    const evPct = seedEvPct(r.seed);
    const base  = { ...r, ev_pct: evPct };
    return enrichEntry(base, potSize);
  });
}

function getPotSize() {
  const override = db.prepare("SELECT value FROM config WHERE key = 'pot_override'").get();
  if (override && override.value && parseFloat(override.value) > 0) {
    return parseFloat(override.value);
  }
  // Compute from entries
  const rawEntries = db.prepare(`
    SELECT e.price_paid, t.seed
    FROM entries e JOIN teams t ON e.team_id = t.id
  `).all().map(r => ({ ...r, ev_pct: seedEvPct(r.seed) }));

  return estimatedPot(rawEntries);
}

// GET /api/analytics/pot
router.get('/pot', requireAuth, (req, res) => {
  const entries = db.prepare(`
    SELECT e.price_paid, t.seed
    FROM entries e JOIN teams t ON e.team_id = t.id
  `).all().map(r => ({ ...r, ev_pct: seedEvPct(r.seed) }));

  const totalSpent     = entries.reduce((s, e) => s + e.price_paid, 0);
  const totalEvPctSold = entries.reduce((s, e) => s + e.ev_pct, 0);
  const teamsSold      = entries.length;

  const cut  = parseFloat(
    db.prepare("SELECT value FROM config WHERE key = 'organizer_cut_pct'").get()?.value ?? '0'
  );

  const estimated = estimatedPot(entries);
  const netPot    = estimated != null ? estimated * (1 - cut / 100) : null;

  const rates = entries
    .filter(e => e.ev_pct > 0)
    .map(e => e.price_paid / e.ev_pct);

  const marketRate = rates.length
    ? [...rates].sort((a, b) => a - b)[Math.floor(rates.length / 2)]
    : null;

  res.json({
    total_spent:      totalSpent,
    teams_sold:       teamsSold,
    teams_total:      64,
    estimated_pot:    estimated,
    net_pot:          netPot,
    organizer_cut_pct: cut,
    market_rate:      marketRate,
    total_ev_pct_sold: totalEvPctSold,
  });
});

// GET /api/analytics/trades
router.get('/trades', requireAuth, (req, res) => {
  const potSize = getPotSize();
  const enriched = getAllEnrichedEntries(potSize);
  const flagged  = computeTradeFlags(enriched);

  res.json({
    pot_size:   potSize,
    market_rate: flagged[0]?.market_rate ?? null,
    entries:    flagged,
  });
});

// GET /api/analytics/standings
router.get('/standings', requireAuth, (req, res) => {
  const potSize = getPotSize();
  const enriched = getAllEnrichedEntries(potSize);

  // Group by participant
  const participantMap = {};
  for (const e of enriched) {
    if (!participantMap[e.participant_id]) {
      participantMap[e.participant_id] = {
        participant_id:   e.participant_id,
        participant_name: e.participant_name,
        total_spent:      0,
        total_ev_pct:     0,
        total_dollar_ev:  0,
        active_ev_pct:    0,
        active_dollar_ev: 0,
        teams_count:      0,
        teams_alive:      0,
        entries:          [],
      };
    }
    const p = participantMap[e.participant_id];
    p.total_spent     += e.price_paid;
    p.total_ev_pct    += e.ev_pct ?? 0;
    p.total_dollar_ev += e.dollar_ev ?? 0;
    p.teams_count     += 1;
    if (!e.eliminated_in_round) {
      p.active_ev_pct    += e.ev_pct ?? 0;
      p.active_dollar_ev += e.dollar_ev ?? 0;
      p.teams_alive      += 1;
    }
    p.entries.push(e);
  }

  const standings = Object.values(participantMap)
    .map(p => ({
      ...p,
      roi: p.total_spent > 0 ? ((p.total_dollar_ev - p.total_spent) / p.total_spent) * 100 : null,
      diversification: portfolioScore(p.entries),
    }))
    .sort((a, b) => b.active_dollar_ev - a.active_dollar_ev);

  res.json({ pot_size: potSize, standings });
});

// GET /api/analytics/config
router.get('/config', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT key, value FROM config').all();
  const cfg  = Object.fromEntries(rows.map(r => [r.key, r.value]));
  res.json(cfg);
});

// PUT /api/analytics/config — admin only
router.put('/config', requireAuth, (req, res) => {
  if (!req.session.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  const { organizer_cut_pct, pot_override } = req.body;

  if (organizer_cut_pct != null) {
    db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES ('organizer_cut_pct', ?)")
      .run(String(organizer_cut_pct));
  }
  if (pot_override != null) {
    db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES ('pot_override', ?)")
      .run(String(pot_override));
  }
  res.json({ ok: true });
});

module.exports = router;
