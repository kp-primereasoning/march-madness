// Trade flag and portfolio analytics

const OVERPAY_THRESHOLD   = 0.25;  // > 25% above EV = OVERPAID
const UNDERPAY_THRESHOLD  = 0.25;  // > 25% below EV = UNDERPAID
const MARKET_DEVIATION    = 0.40;  // > 40% from median $/EV% = market anomaly

// Median of an array of numbers
function median(arr) {
  if (!arr.length) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Signal 1: absolute over/underpay vs. EV
function absoluteFlag(ratio) {
  if (ratio == null) return null;
  if (ratio > 1 + OVERPAY_THRESHOLD)  return 'OVERPAID';
  if (ratio < 1 - UNDERPAY_THRESHOLD) return 'UNDERPAID';
  return 'FAIR';
}

// Signal 2: price per EV% vs. the market median
function marketFlag(pricePerEvPct, marketRate) {
  if (pricePerEvPct == null || marketRate == null || marketRate === 0) return null;
  const dev = (pricePerEvPct - marketRate) / marketRate;
  if (dev >  MARKET_DEVIATION) return 'EXPENSIVE';
  if (dev < -MARKET_DEVIATION) return 'CHEAP';
  return null;
}

// Compute all trade flags for a list of enriched entries
// enrichedEntries: [{ price_paid, ev_pct, ratio, price_per_ev_pct, team: { seed, region }, participant: { name } }]
function computeTradeFlags(enrichedEntries) {
  const rates = enrichedEntries
    .map(e => e.price_per_ev_pct)
    .filter(x => x != null && x > 0);
  const mktRate = median(rates);

  return enrichedEntries.map(entry => {
    const abs  = absoluteFlag(entry.ratio);
    const mkt  = marketFlag(entry.price_per_ev_pct, mktRate);

    const flags = [];
    if (abs === 'OVERPAID')  flags.push({ type: 'OVERPAID',  label: 'Overpaid vs EV',    severity: 'high' });
    if (abs === 'UNDERPAID') flags.push({ type: 'UNDERPAID', label: 'Underpaid vs EV',   severity: 'positive' });
    if (mkt === 'EXPENSIVE') flags.push({ type: 'EXPENSIVE', label: 'Expensive vs Market', severity: 'medium' });
    if (mkt === 'CHEAP')     flags.push({ type: 'CHEAP',     label: 'Cheap vs Market',   severity: 'positive' });

    return { ...entry, flags, market_rate: mktRate };
  });
}

// Signal 3: portfolio diversification score per participant
// entries: array of enriched entries for ONE participant
function portfolioScore(entries) {
  if (!entries.length) return { score: null, tier: null, concentration: null, same_region_conflict: false };

  const totalEv = entries.reduce((s, e) => s + (e.ev_pct ?? 0), 0);
  if (totalEv === 0) return { score: null, tier: null, concentration: null, same_region_conflict: false };

  const tierA = entries.filter(e => e.seed <= 4).reduce((s, e)  => s + (e.ev_pct ?? 0), 0);
  const tierB = entries.filter(e => e.seed >= 5 && e.seed <= 9).reduce((s, e) => s + (e.ev_pct ?? 0), 0);
  const tierC = entries.filter(e => e.seed >= 10).reduce((s, e) => s + (e.ev_pct ?? 0), 0);

  const shareA = tierA / totalEv;
  const shareB = tierB / totalEv;
  const shareC = tierC / totalEv;

  const score = Math.max(shareA, shareB, shareC);
  let tier;
  if (score > 0.75)     tier = 'OVER-CONCENTRATED';
  else if (score < 0.40) tier = 'WELL-DIVERSIFIED';
  else                   tier = 'MODERATE';

  // Same-region conflict: owns 1-seed AND 2-seed in same region
  const regionMap = {};
  for (const e of entries) {
    if (!regionMap[e.region]) regionMap[e.region] = [];
    regionMap[e.region].push(e.seed);
  }
  const same_region_conflict = Object.values(regionMap).some(
    seeds => seeds.includes(1) && seeds.includes(2)
  );

  return {
    concentration_score: score,
    diversification_tier: tier,
    tier_shares: { A: shareA, B: shareB, C: shareC },
    same_region_conflict,
  };
}

module.exports = { computeTradeFlags, portfolioScore, median };
