// EV calculation engine
// All EV math lives here. Consumed by routes/teams.js and routes/analytics.js.

const SEED_ADVANCEMENT = require('../data/historical-seed-ev');

const DEFAULT_PAYOUT = {
  R32: 0.0075,
  S16: 0.02,
  E8:  0.04,
  F4:  0.08,
  RU:  0.14,
  CH:  0.26,
};

const ROUND_ORDER = ['R32', 'S16', 'E8', 'F4', 'RU', 'CH'];

// Returns EV as a fraction of total pot (e.g. 0.18 = 18% of pot)
function computeEvPct(advancementProbs, payout = DEFAULT_PAYOUT) {
  let ev = 0;
  for (let i = 0; i < ROUND_ORDER.length; i++) {
    const r = ROUND_ORDER[i];
    const pReach   = advancementProbs[r]   ?? 0;
    const pExceed  = i + 1 < ROUND_ORDER.length ? (advancementProbs[ROUND_ORDER[i + 1]] ?? 0) : 0;
    const pExitHere = pReach - pExceed;
    ev += pExitHere * (payout[r] ?? 0);
  }
  return ev;
}

// Compute EV% for a team using historical seed rates
function seedEvPct(seed, payout = DEFAULT_PAYOUT) {
  const probs = SEED_ADVANCEMENT[seed];
  if (!probs) return 0;
  return computeEvPct(probs, payout);
}

// Estimate final pot from teams sold so far
// entries: [{ price_paid, team: { ev_pct } }]
function estimatedPot(enrichedEntries) {
  const sold = enrichedEntries.filter(e => e.price_paid > 0 && e.ev_pct > 0);
  if (sold.length === 0) return null;
  const totalSpent  = sold.reduce((s, e) => s + e.price_paid, 0);
  const totalEvPct  = sold.reduce((s, e) => s + e.ev_pct, 0);
  return totalEvPct > 0 ? totalSpent / totalEvPct : null;
}

// Add EV-derived fields to a team object
// team: { seed, ev_pct (already computed or 0) }
// potSize: estimated pot in dollars (or override)
function enrichTeam(team, potSize) {
  const evPct    = team.ev_pct ?? seedEvPct(team.seed);
  const dollarEv = potSize != null ? evPct * potSize : null;
  return { ...team, ev_pct: evPct, dollar_ev: dollarEv };
}

// Add EV-derived fields to an entry (joined with its team)
// entry: { price_paid, team: { ev_pct } }
function enrichEntry(entry, potSize) {
  const evPct    = entry.ev_pct ?? 0;
  const dollarEv = potSize != null ? evPct * potSize : null;
  const ratio    = dollarEv && dollarEv > 0 ? entry.price_paid / dollarEv : null;
  const overpaid_pct = ratio != null ? (ratio - 1) * 100 : null;
  const price_per_ev_pct = evPct > 0 ? entry.price_paid / evPct : null;
  return { ...entry, dollar_ev: dollarEv, ratio, overpaid_pct, price_per_ev_pct };
}

module.exports = {
  DEFAULT_PAYOUT,
  ROUND_ORDER,
  computeEvPct,
  seedEvPct,
  estimatedPot,
  enrichTeam,
  enrichEntry,
};
