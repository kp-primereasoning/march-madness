import { useEffect, useState, useMemo } from 'react';
import { api } from '../api';
import TradeFlagBadge from '../components/TradeFlagBadge';

const REGIONS  = ['All', 'East', 'West', 'South', 'Midwest'];
const TIERS    = ['All', 'Tier A (1-4)', 'Tier B (5-9)', 'Tier C (10-16)'];
const FLAGS    = ['All', 'Overpaid', 'Underpaid', 'No Owner', 'Eliminated'];

function fmt$(n) { return n == null ? '—' : '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 }); }
function fmtPct(n) { return n == null ? '—' : (n * 100).toFixed(1) + '%'; }
function fmtRatio(n) { return n == null ? '—' : n.toFixed(2) + 'x'; }

function seedTier(seed) {
  if (seed <= 4)  return 'A';
  if (seed <= 9)  return 'B';
  return 'C';
}

export default function TeamsPage() {
  const [teams,    setTeams]    = useState([]);
  const [trades,   setTrades]   = useState([]);
  const [potSize,  setPotSize]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [sortKey,  setSortKey]  = useState('seed');
  const [sortDir,  setSortDir]  = useState('asc');
  const [region,   setRegion]   = useState('All');
  const [tier,     setTier]     = useState('All');
  const [flagFilter, setFlagFilter] = useState('All');
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/teams'),
      api.get('/analytics/trades'),
    ]).then(([t, tr]) => {
      setTeams(t);
      setTrades(tr.entries || []);
      setPotSize(tr.pot_size);
    }).finally(() => setLoading(false));
  }, []);

  // Merge trade flags into teams
  const enriched = useMemo(() => {
    const tradeMap = {};
    trades.forEach(e => { tradeMap[e.team_id] = e; });
    return teams.map(t => ({
      ...t,
      trade: tradeMap[t.id] || null,
    }));
  }, [teams, trades]);

  const filtered = useMemo(() => {
    let rows = [...enriched];

    if (search)       rows = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || (r.entry?.participant_name || '').toLowerCase().includes(search.toLowerCase()));
    if (region !== 'All') rows = rows.filter(r => r.region === region);
    if (tier !== 'All') {
      const t = tier.charAt(5);
      rows = rows.filter(r => seedTier(r.seed) === t);
    }
    if (flagFilter !== 'All') {
      if (flagFilter === 'Overpaid')  rows = rows.filter(r => r.trade?.flags?.some(f => f.type === 'OVERPAID'));
      if (flagFilter === 'Underpaid') rows = rows.filter(r => r.trade?.flags?.some(f => f.type === 'UNDERPAID'));
      if (flagFilter === 'No Owner')  rows = rows.filter(r => !r.entry);
      if (flagFilter === 'Eliminated') rows = rows.filter(r => r.eliminated_in_round);
    }

    rows.sort((a, b) => {
      let av, bv;
      switch (sortKey) {
        case 'seed':     av = a.seed;              bv = b.seed;              break;
        case 'name':     av = a.name;              bv = b.name;              break;
        case 'region':   av = a.region;            bv = b.region;            break;
        case 'owner':    av = a.entry?.participant_name || ''; bv = b.entry?.participant_name || ''; break;
        case 'price':    av = a.entry?.price_paid  ?? -1; bv = b.entry?.price_paid  ?? -1; break;
        case 'ev_pct':   av = a.ev_pct ?? 0;       bv = b.ev_pct ?? 0;       break;
        case 'dollar_ev':av = (a.ev_pct ?? 0) * (potSize ?? 0); bv = (b.ev_pct ?? 0) * (potSize ?? 0); break;
        case 'ratio':    av = a.trade?.ratio ?? 999; bv = b.trade?.ratio ?? 999; break;
        default:         av = 0; bv = 0;
      }
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : (av ?? 0) - (bv ?? 0);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return rows;
  }, [enriched, search, region, tier, flagFilter, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  function SortTh({ col, label }) {
    const active = sortKey === col;
    return (
      <th style={{ ...s.th, cursor: 'pointer', color: active ? '#f97316' : '#64748b' }} onClick={() => toggleSort(col)}>
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : ''}
      </th>
    );
  }

  if (loading) return <div style={s.loading}>Loading teams…</div>;

  return (
    <div>
      <h2 style={s.h2}>All 64 Teams</h2>

      {/* Filters */}
      <div style={s.filters}>
        <input style={s.search} placeholder="Search team or owner…" value={search} onChange={e => setSearch(e.target.value)} />
        {[['Region', REGIONS, region, setRegion],
          ['Tier',   TIERS,   tier,   setTier],
          ['Flag',   FLAGS,   flagFilter, setFlagFilter]
        ].map(([label, opts, val, setter]) => (
          <select key={label} style={s.select} value={val} onChange={e => setter(e.target.value)}>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        <span style={s.count}>{filtered.length} teams</span>
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <SortTh col="region" label="Region" />
              <SortTh col="seed"   label="Seed"   />
              <SortTh col="name"   label="Team"   />
              <th style={s.th}>Status</th>
              <SortTh col="owner"  label="Owner"  />
              <SortTh col="price"  label="Paid"   />
              <SortTh col="ev_pct"    label="EV%"    />
              <SortTh col="dollar_ev" label="$ EV"   />
              <SortTh col="ratio"  label="Ratio"  />
              <th style={s.th}>Flags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => <TeamRow key={t.id} team={t} potSize={potSize} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function seedColor(seed) {
  if (seed <= 2)  return '#f97316';
  if (seed <= 4)  return '#eab308';
  if (seed <= 8)  return '#3b82f6';
  if (seed <= 12) return '#8b5cf6';
  return '#64748b';
}

function ratioColor(ratio) {
  if (ratio == null) return '#64748b';
  if (ratio > 1.25)  return '#f87171';
  if (ratio < 0.75)  return '#4ade80';
  return '#94a3b8';
}

function TeamRow({ team, potSize }) {
  const eliminated = !!team.eliminated_in_round;
  const hasEntry   = !!team.entry;
  const trade      = team.trade;

  const dollarEv = potSize != null ? (team.ev_pct ?? 0) * potSize : null;

  let rowBg = 'transparent';
  if (eliminated) rowBg = '#0f172a';
  else if (trade?.flags?.some(f => f.type === 'OVERPAID'))  rowBg = '#2d1010';
  else if (trade?.flags?.some(f => f.type === 'UNDERPAID')) rowBg = '#0d2010';
  else if (trade?.flags?.some(f => f.type === 'CHEAP'))     rowBg = '#0d1a2d';

  const textStyle = eliminated ? { color: '#475569', textDecoration: 'line-through' } : {};

  return (
    <tr style={{ background: rowBg, borderBottom: '1px solid #1e293b' }}>
      <td style={{ ...s.td, ...textStyle }}>{team.region}</td>
      <td style={{ ...s.td, ...textStyle, fontWeight: 700, color: seedColor(team.seed) }}>{team.seed}</td>
      <td style={{ ...s.td, ...textStyle, fontWeight: 600, color: '#f1f5f9' }}>{team.name}</td>
      <td style={s.td}>
        {eliminated
          ? <span style={s.badgeGray}>Out {team.eliminated_in_round}</span>
          : <span style={s.badgeGreen}>Alive</span>}
      </td>
      <td style={s.td}>{hasEntry ? team.entry.participant_name : <span style={{ color: '#475569' }}>—</span>}</td>
      <td style={s.td}>{hasEntry ? fmt$(team.entry.price_paid) : <span style={{ color: '#475569' }}>—</span>}</td>
      <td style={s.td}>{fmtPct(team.ev_pct)}</td>
      <td style={s.td}>{fmt$(dollarEv)}</td>
      <td style={{ ...s.td, color: ratioColor(trade?.ratio) }}>{fmtRatio(trade?.ratio)}</td>
      <td style={s.td}><TradeFlagBadge flags={trade?.flags || []} /></td>
    </tr>
  );
}

const s = {
  h2:        { fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 },
  loading:   { color: '#94a3b8', padding: 40, textAlign: 'center' },
  filters:   { display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' },
  search:    { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 14px', color: '#f1f5f9', fontSize: 14, minWidth: 200 },
  select:    { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 14px', color: '#f1f5f9', fontSize: 14 },
  count:     { marginLeft: 'auto', color: '#64748b', fontSize: 13 },
  tableWrap: { overflowX: 'auto', borderRadius: 12, border: '1px solid #1e293b' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:        { padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#1e293b', borderBottom: '1px solid #334155', whiteSpace: 'nowrap' },
  td:        { padding: '10px 14px', color: '#94a3b8', verticalAlign: 'middle' },
  badgeGreen:{ background: '#14532d', color: '#86efac', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600 },
  badgeGray: { background: '#1e293b', color: '#64748b', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600 },
};
