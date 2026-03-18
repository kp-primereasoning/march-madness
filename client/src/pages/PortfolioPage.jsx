import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import TradeFlagBadge from '../components/TradeFlagBadge';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

function fmt$(n) { return n == null ? '—' : '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 }); }
function fmtPct(n) { return n == null ? '—' : (n * 100).toFixed(1) + '%'; }

export default function PortfolioPage() {
  const { id }           = useParams();
  const navigate         = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [selected, setSelected]         = useState(id || '');
  const [portfolio, setPortfolio]       = useState(null);
  const [trades,    setTrades]          = useState({});
  const [potSize,   setPotSize]         = useState(null);
  const [loading,   setLoading]         = useState(false);

  useEffect(() => {
    api.get('/participants').then(setParticipants);
    api.get('/analytics/pot').then(d => setPotSize(d.estimated_pot));
    api.get('/analytics/trades').then(d => {
      const map = {};
      (d.entries || []).forEach(e => { map[e.team_id] = e; });
      setTrades(map);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    api.get(`/participants/${selected}/portfolio`)
      .then(setPortfolio)
      .catch(() => setPortfolio(null))
      .finally(() => setLoading(false));
    navigate(`/portfolio/${selected}`, { replace: true });
  }, [selected]);

  const tierData = portfolio ? [
    { name: 'Tier A\n(1–4 seeds)', value: +(portfolio.diversification.tier_shares?.A * 100).toFixed(1), color: '#f97316' },
    { name: 'Tier B\n(5–9 seeds)', value: +(portfolio.diversification.tier_shares?.B * 100).toFixed(1), color: '#3b82f6' },
    { name: 'Tier C\n(10–16)',     value: +(portfolio.diversification.tier_shares?.C * 100).toFixed(1), color: '#8b5cf6' },
  ] : [];

  return (
    <div>
      <h2 style={s.h2}>Portfolio View</h2>

      {/* Participant selector */}
      <div style={s.selector}>
        <select
          style={s.select}
          value={selected}
          onChange={e => setSelected(e.target.value)}
        >
          <option value="">— Select Participant —</option>
          {participants.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {loading && <div style={s.loading}>Loading…</div>}

      {portfolio && !loading && (
        <>
          {/* Summary cards */}
          <div style={s.grid4}>
            <StatCard label="Teams Owned"   value={portfolio.summary.teams_count} />
            <StatCard label="Teams Alive"   value={portfolio.summary.teams_alive} />
            <StatCard label="Total Spent"   value={fmt$(portfolio.summary.total_spent)} />
            <StatCard label="Active $ EV"   value={fmt$(portfolio.summary.active_ev_pct * (potSize || 0))} highlight />
          </div>

          <div style={s.row2}>
            {/* Diversification score */}
            <div style={s.card}>
              <h3 style={s.h3}>Diversification</h3>
              <DivScore data={portfolio.diversification} />
              {portfolio.diversification.same_region_conflict && (
                <div style={s.conflict}>⚠ Same-region conflict: owns 1-seed &amp; 2-seed in same region</div>
              )}
              <div style={{ marginTop: 20, height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tierData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} unit="%" />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                      labelStyle={{ color: '#f1f5f9' }}
                      itemStyle={{ color: '#94a3b8' }}
                      formatter={v => [`${v}%`, 'EV share']}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {tierData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trade flags summary */}
            <div style={s.card}>
              <h3 style={s.h3}>Trade Signals</h3>
              {portfolio.entries.length === 0
                ? <div style={s.empty}>No teams owned yet.</div>
                : portfolio.entries.map(e => {
                    const tradeData = trades[e.team_id];
                    const flags = tradeData?.flags || [];
                    return (
                      <div key={e.team_id} style={s.teamRow}>
                        <div style={s.teamInfo}>
                          <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{e.team_name}</span>
                          <span style={{ color: '#64748b', fontSize: 12 }}> ({e.region} {e.seed}-seed)</span>
                          {e.eliminated_in_round && <span style={s.elim}> ✗ Out</span>}
                        </div>
                        <div style={s.teamStats}>
                          <span style={{ color: '#94a3b8' }}>Paid {fmt$(e.price_paid)}</span>
                          {potSize && <span style={{ color: '#64748b' }}> / EV {fmt$(e.ev_pct * potSize)}</span>}
                        </div>
                        {flags.length > 0 && <TradeFlagBadge flags={flags} />}
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* Full team table */}
          <div style={{ ...s.card, marginTop: 16 }}>
            <h3 style={s.h3}>All Teams</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Seed</th>
                    <th style={s.th}>Team</th>
                    <th style={s.th}>Region</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Paid</th>
                    <th style={s.th}>EV%</th>
                    <th style={s.th}>$ EV</th>
                    <th style={s.th}>Ratio</th>
                    <th style={s.th}>Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.entries.map(e => {
                    const t = trades[e.team_id];
                    const dollarEv = e.ev_pct * (potSize || 0);
                    return (
                      <tr key={e.team_id} style={{ borderBottom: '1px solid #0f172a', opacity: e.eliminated_in_round ? 0.5 : 1 }}>
                        <td style={{ ...s.td, fontWeight: 700, color: '#f97316' }}>{e.seed}</td>
                        <td style={{ ...s.td, fontWeight: 600, color: '#f1f5f9' }}>{e.team_name}</td>
                        <td style={s.td}>{e.region}</td>
                        <td style={s.td}>
                          {e.eliminated_in_round
                            ? <span style={{ color: '#475569' }}>Out {e.eliminated_in_round}</span>
                            : <span style={{ color: '#4ade80' }}>Alive</span>}
                        </td>
                        <td style={s.td}>{fmt$(e.price_paid)}</td>
                        <td style={s.td}>{fmtPct(e.ev_pct)}</td>
                        <td style={s.td}>{potSize ? fmt$(dollarEv) : '—'}</td>
                        <td style={{ ...s.td, color: t?.ratio > 1.25 ? '#f87171' : t?.ratio < 0.75 ? '#4ade80' : '#94a3b8' }}>
                          {t?.ratio != null ? t.ratio.toFixed(2) + 'x' : '—'}
                        </td>
                        <td style={s.td}><TradeFlagBadge flags={t?.flags || []} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!portfolio && !loading && selected && (
        <div style={s.empty}>Participant not found or no data.</div>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div style={s.statCard}>
      <div style={s.statLabel}>{label}</div>
      <div style={{ ...s.statValue, ...(highlight ? { color: '#f97316' } : {}) }}>{value}</div>
    </div>
  );
}

function DivScore({ data }) {
  const cfg = {
    'OVER-CONCENTRATED': { color: '#f87171', label: 'Over-Concentrated', bg: '#7f1d1d' },
    'WELL-DIVERSIFIED':  { color: '#4ade80', label: 'Well-Diversified',   bg: '#14532d' },
    'MODERATE':          { color: '#94a3b8', label: 'Moderate',           bg: '#1e3a5f' },
  };
  const c = cfg[data?.diversification_tier] || cfg['MODERATE'];
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <span style={{ background: c.bg, color: c.color, padding: '4px 12px', borderRadius: 6, fontWeight: 700, fontSize: 13 }}>
        {c.label}
      </span>
      {data?.concentration_score != null && (
        <span style={{ color: '#64748b', fontSize: 12 }}>
          Max tier share: {(data.concentration_score * 100).toFixed(0)}%
        </span>
      )}
    </div>
  );
}

const s = {
  h2:       { fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 },
  h3:       { fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 14 },
  selector: { marginBottom: 24 },
  select:   { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 16px', color: '#f1f5f9', fontSize: 14, minWidth: 260 },
  loading:  { color: '#94a3b8', padding: 40, textAlign: 'center' },
  grid4:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 },
  statCard: { background: '#1e293b', borderRadius: 10, padding: '16px 20px', border: '1px solid #334155' },
  statLabel:{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 4 },
  statValue:{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' },
  row2:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 },
  card:     { background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' },
  conflict: { color: '#fcd34d', fontSize: 12, marginTop: 10, padding: '8px 12px', background: '#78350f33', borderRadius: 6 },
  teamRow:  { padding: '10px 0', borderBottom: '1px solid #0f172a', display: 'flex', flexDirection: 'column', gap: 4 },
  teamInfo: { display: 'flex', alignItems: 'center', gap: 2 },
  teamStats:{ display: 'flex', gap: 4, fontSize: 12 },
  elim:     { color: '#f87171', fontSize: 12 },
  empty:    { color: '#475569', padding: '24px 0', textAlign: 'center' },
  table:    { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:       { padding: '9px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#0f172a', borderBottom: '1px solid #334155' },
  td:       { padding: '9px 12px', color: '#94a3b8', verticalAlign: 'middle' },
};
