import { useEffect, useState } from 'react';
import { api } from '../api';

function fmt(n, prefix = '$') {
  if (n == null) return '—';
  return `${prefix}${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export default function PotEstimateBar() {
  const [pot, setPot] = useState(null);

  useEffect(() => {
    api.get('/analytics/pot').then(setPot).catch(() => {});
  }, []);

  if (!pot) return null;

  const pct = pot.teams_total > 0 ? (pot.teams_sold / pot.teams_total) * 100 : 0;

  return (
    <div style={s.bar}>
      <Stat label="Total Raised"      value={fmt(pot.total_spent)} />
      <Stat label="Est. Final Pot"    value={fmt(pot.estimated_pot)} highlight />
      <Stat label="Market Rate"       value={pot.market_rate ? `$${pot.market_rate.toFixed(2)}/EV%` : '—'} />
      <Stat label="Teams Sold"        value={`${pot.teams_sold} / ${pot.teams_total}`} />
      <div style={s.progress}>
        <div style={s.progressLabel}>Auction Progress</div>
        <div style={s.track}>
          <div style={{ ...s.fill, width: `${pct}%` }} />
        </div>
        <div style={s.pct}>{pct.toFixed(0)}%</div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div style={s.stat}>
      <div style={s.statLabel}>{label}</div>
      <div style={{ ...s.statValue, ...(highlight ? s.highlight : {}) }}>{value}</div>
    </div>
  );
}

const s = {
  bar:          { display: 'flex', gap: 24, alignItems: 'center', background: '#1e293b', borderRadius: 12, padding: '16px 24px', marginBottom: 24, flexWrap: 'wrap' },
  stat:         { display: 'flex', flexDirection: 'column', gap: 2 },
  statLabel:    { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 },
  statValue:    { fontSize: 22, fontWeight: 700, color: '#f1f5f9' },
  highlight:    { color: '#f97316' },
  progress:     { display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' },
  progressLabel:{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginRight: 4 },
  track:        { width: 120, height: 8, background: '#334155', borderRadius: 4, overflow: 'hidden' },
  fill:         { height: '100%', background: '#f97316', borderRadius: 4, transition: 'width 0.3s' },
  pct:          { fontSize: 12, color: '#94a3b8', minWidth: 32 },
};
