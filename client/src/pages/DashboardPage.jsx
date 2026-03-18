import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import PotEstimateBar from '../components/PotEstimateBar';
import TradeFlagBadge from '../components/TradeFlagBadge';

function fmt$(n) { return n == null ? '—' : '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 }); }
function fmtPct(n) { return n == null ? '—' : (n * 100).toFixed(1) + '%'; }

export default function DashboardPage() {
  const [standings, setStandings] = useState(null);
  const [trades,    setTrades]    = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/analytics/standings'),
      api.get('/analytics/trades'),
    ]).then(([s, t]) => {
      setStandings(s);
      setTrades(t);
    }).catch(() => {});
  }, []);

  const overpaid  = trades?.entries?.filter(e => e.flags?.some(f => f.type === 'OVERPAID'))  || [];
  const underpaid = trades?.entries?.filter(e => e.flags?.some(f => f.type === 'UNDERPAID')) || [];
  const cheap     = trades?.entries?.filter(e => e.flags?.some(f => f.type === 'CHEAP'))     || [];

  return (
    <div>
      <h2 style={s.h2}>Dashboard</h2>
      <PotEstimateBar />

      {/* Trade Opportunity Summary */}
      <div style={s.grid3}>
        <SummaryCard
          title="Overpaid Teams"
          count={overpaid.length}
          color="#f87171"
          hint="Paid 25%+ above EV — potential sell targets"
          items={overpaid.slice(0, 3).map(e => `${e.team_name} (${e.participant_name})`)}
        />
        <SummaryCard
          title="Underpaid / Value"
          count={underpaid.length}
          color="#4ade80"
          hint="Paid 25%+ below EV — strong trade hold"
          items={underpaid.slice(0, 3).map(e => `${e.team_name} (${e.participant_name})`)}
        />
        <SummaryCard
          title="Market Cheap"
          count={cheap.length}
          color="#93c5fd"
          hint="40%+ below market $/EV% — buy targets"
          items={cheap.slice(0, 3).map(e => `${e.team_name} (${e.participant_name})`)}
        />
      </div>

      {/* Standings */}
      <div style={s.section}>
        <h3 style={s.h3}>Standings by Active EV</h3>
        {standings ? (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Participant</th>
                  <th style={s.th}>Teams Alive</th>
                  <th style={s.th}>Total Spent</th>
                  <th style={s.th}>Active $ EV</th>
                  <th style={s.th}>ROI</th>
                  <th style={s.th}>Diversification</th>
                  <th style={s.th}>Region Conflict</th>
                </tr>
              </thead>
              <tbody>
                {standings.standings.map((p, i) => (
                  <tr
                    key={p.participant_id}
                    style={{ ...s.row, cursor: 'pointer' }}
                    onClick={() => navigate(`/portfolio/${p.participant_id}`)}
                  >
                    <td style={{ ...s.td, color: rankColor(i), fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ ...s.td, fontWeight: 600, color: '#f1f5f9' }}>{p.participant_name}</td>
                    <td style={s.td}>{p.teams_alive} / {p.teams_count}</td>
                    <td style={s.td}>{fmt$(p.total_spent)}</td>
                    <td style={{ ...s.td, color: '#f97316', fontWeight: 600 }}>{fmt$(p.active_dollar_ev)}</td>
                    <td style={{ ...s.td, color: roiColor(p.roi) }}>
                      {p.roi != null ? `${p.roi > 0 ? '+' : ''}${p.roi.toFixed(0)}%` : '—'}
                    </td>
                    <td style={s.td}>
                      <DivBadge tier={p.diversification?.diversification_tier} />
                    </td>
                    <td style={s.td}>
                      {p.diversification?.same_region_conflict
                        ? <span style={s.conflict}>⚠ Same Region</span>
                        : <span style={{ color: '#475569' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div style={s.empty}>No auction entries yet. Add entries in Admin to see standings.</div>}
      </div>
    </div>
  );
}

function SummaryCard({ title, count, color, hint, items }) {
  return (
    <div style={s.card}>
      <div style={{ fontSize: 32, fontWeight: 800, color }}>{count}</div>
      <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{hint}</div>
      {items.map((item, i) => (
        <div key={i} style={{ fontSize: 12, color: '#94a3b8', padding: '2px 0', borderTop: '1px solid #1e293b' }}>{item}</div>
      ))}
    </div>
  );
}

function DivBadge({ tier }) {
  if (!tier) return <span style={{ color: '#475569' }}>—</span>;
  const cfg = {
    'OVER-CONCENTRATED': { bg: '#7f1d1d', color: '#fca5a5', label: 'Concentrated' },
    'WELL-DIVERSIFIED':  { bg: '#14532d', color: '#86efac', label: 'Diversified' },
    'MODERATE':          { bg: '#1e293b', color: '#94a3b8', label: 'Moderate' },
  };
  const c = cfg[tier] || cfg['MODERATE'];
  return <span style={{ background: c.bg, color: c.color, fontSize: 11, padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>{c.label}</span>;
}

function rankColor(i) {
  if (i === 0) return '#f97316';
  if (i === 1) return '#94a3b8';
  if (i === 2) return '#a16207';
  return '#64748b';
}

function roiColor(roi) {
  if (roi == null) return '#64748b';
  if (roi > 10)  return '#4ade80';
  if (roi < -10) return '#f87171';
  return '#94a3b8';
}

const s = {
  h2:       { fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 },
  h3:       { fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 14 },
  grid3:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 28 },
  card:     { background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' },
  section:  { marginTop: 8 },
  tableWrap:{ overflowX: 'auto', borderRadius: 12, border: '1px solid #1e293b' },
  table:    { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:       { padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#1e293b', borderBottom: '1px solid #334155' },
  td:       { padding: '10px 14px', color: '#94a3b8', verticalAlign: 'middle' },
  row:      { borderBottom: '1px solid #0f172a', transition: 'background 0.1s' },
  empty:    { color: '#475569', padding: '32px 0', textAlign: 'center' },
  conflict: { color: '#fcd34d', fontSize: 12, fontWeight: 600 },
};
