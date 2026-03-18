import { useEffect, useState } from 'react';
import { api } from '../api';

export default function AdminPage() {
  const [tab, setTab] = useState('entries');

  return (
    <div>
      <h2 style={s.h2}>Admin</h2>
      <div style={s.tabs}>
        {[['entries', 'Record Entries'], ['eliminate', 'Eliminate Teams'], ['participants', 'Participants'], ['config', 'Config']].map(([key, label]) => (
          <button key={key} style={{ ...s.tab, ...(tab === key ? s.tabActive : {}) }} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>
      <div style={s.panel}>
        {tab === 'entries'      && <EntriesTab />}
        {tab === 'eliminate'    && <EliminateTab />}
        {tab === 'participants' && <ParticipantsTab />}
        {tab === 'config'       && <ConfigTab />}
      </div>
    </div>
  );
}

// ── Record Entries ─────────────────────────────────────────────────────────

function EntriesTab() {
  const [teams,        setTeams]        = useState([]);
  const [participants, setParticipants] = useState([]);
  const [entries,      setEntries]      = useState([]);
  const [form,         setForm]         = useState({ teamId: '', participantId: '', pricePaid: '', notes: '' });
  const [editId,       setEditId]       = useState(null);
  const [editForm,     setEditForm]     = useState({});
  const [msg,          setMsg]          = useState('');
  const [error,        setError]        = useState('');

  async function load() {
    const [t, p, e] = await Promise.all([
      api.get('/teams'),
      api.get('/participants'),
      api.get('/entries'),
    ]);
    setTeams(t);
    setParticipants(p);
    setEntries(e);
  }

  useEffect(() => { load(); }, []);

  // Teams without an entry (unsold)
  const unsoldTeams = teams.filter(t => !entries.find(e => e.team_id === t.id));

  async function handleAdd(e) {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await api.post('/entries', {
        teamId:        parseInt(form.teamId),
        participantId: parseInt(form.participantId),
        pricePaid:     parseFloat(form.pricePaid),
        notes:         form.notes || null,
      });
      setMsg('Entry recorded!');
      setForm({ teamId: '', participantId: '', pricePaid: '', notes: '' });
      load();
    } catch (err) {
      setError(err.data?.error || err.message);
    }
  }

  async function handleUpdate(id) {
    setMsg(''); setError('');
    try {
      await api.put(`/entries/${id}`, {
        participantId: editForm.participantId ? parseInt(editForm.participantId) : undefined,
        pricePaid:     editForm.pricePaid     ? parseFloat(editForm.pricePaid)   : undefined,
        notes:         editForm.notes,
      });
      setMsg('Entry updated!');
      setEditId(null);
      load();
    } catch (err) {
      setError(err.data?.error || err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this entry?')) return;
    await api.delete(`/entries/${id}`);
    load();
  }

  return (
    <div>
      {/* Add form */}
      <div style={s.formCard}>
        <h3 style={s.h3}>Add Auction Entry</h3>
        <form onSubmit={handleAdd} style={s.form}>
          <select style={s.input} value={form.teamId} onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))} required>
            <option value="">Select team…</option>
            {unsoldTeams.map(t => (
              <option key={t.id} value={t.id}>{t.region} {t.seed}-seed: {t.name}</option>
            ))}
          </select>
          <select style={s.input} value={form.participantId} onChange={e => setForm(f => ({ ...f, participantId: e.target.value }))} required>
            <option value="">Select owner…</option>
            {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input style={s.input} type="number" min="0" step="0.01" placeholder="Price paid ($)" value={form.pricePaid} onChange={e => setForm(f => ({ ...f, pricePaid: e.target.value }))} required />
          <input style={s.input} type="text" placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <button style={s.btn} type="submit">Add Entry</button>
        </form>
        {msg   && <div style={s.success}>{msg}</div>}
        {error && <div style={s.errorMsg}>{error}</div>}
      </div>

      {/* Entries table */}
      <div style={{ marginTop: 24, overflowX: 'auto' }}>
        <h3 style={s.h3}>Current Entries ({entries.length}/64)</h3>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Team</th>
              <th style={s.th}>Seed</th>
              <th style={s.th}>Region</th>
              <th style={s.th}>Owner</th>
              <th style={s.th}>Price</th>
              <th style={s.th}>Notes</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id} style={{ borderBottom: '1px solid #0f172a' }}>
                <td style={{ ...s.td, fontWeight: 600, color: '#f1f5f9' }}>{e.team_name}</td>
                <td style={s.td}>{e.seed}</td>
                <td style={s.td}>{e.region}</td>
                <td style={s.td}>
                  {editId === e.id
                    ? <select style={s.miniInput} value={editForm.participantId || e.participant_id} onChange={ev => setEditForm(f => ({ ...f, participantId: ev.target.value }))}>
                        {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    : e.participant_name}
                </td>
                <td style={s.td}>
                  {editId === e.id
                    ? <input style={s.miniInput} type="number" defaultValue={e.price_paid} onChange={ev => setEditForm(f => ({ ...f, pricePaid: ev.target.value }))} />
                    : `$${e.price_paid}`}
                </td>
                <td style={s.td}>
                  {editId === e.id
                    ? <input style={s.miniInput} defaultValue={e.notes || ''} onChange={ev => setEditForm(f => ({ ...f, notes: ev.target.value }))} />
                    : (e.notes || '—')}
                </td>
                <td style={s.td}>
                  {editId === e.id
                    ? <>
                        <button style={s.btnSm} onClick={() => handleUpdate(e.id)}>Save</button>
                        <button style={s.btnSmGray} onClick={() => setEditId(null)}>Cancel</button>
                      </>
                    : <>
                        <button style={s.btnSm} onClick={() => { setEditId(e.id); setEditForm({ participantId: e.participant_id, pricePaid: e.price_paid, notes: e.notes }); }}>Edit</button>
                        <button style={s.btnSmRed} onClick={() => handleDelete(e.id)}>Del</button>
                      </>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Eliminate Teams ────────────────────────────────────────────────────────

function EliminateTab() {
  const [teams, setTeams] = useState([]);
  const [msg,   setMsg]   = useState('');
  const ROUNDS = ['R64', 'R32', 'S16', 'E8', 'F4', 'RU', 'CH'];

  useEffect(() => { api.get('/teams').then(setTeams); }, []);

  async function setEliminated(teamId, round) {
    await api.patch(`/teams/${teamId}/eliminate`, { eliminatedInRound: round || null });
    setMsg(`Updated!`);
    api.get('/teams').then(setTeams);
    setTimeout(() => setMsg(''), 2000);
  }

  const alive    = teams.filter(t => !t.eliminated_in_round);
  const elim     = teams.filter(t =>  t.eliminated_in_round);

  return (
    <div>
      {msg && <div style={s.success}>{msg}</div>}
      <h3 style={s.h3}>Still Alive ({alive.length})</h3>
      <div style={s.teamGrid}>
        {alive.map(t => (
          <div key={t.id} style={s.teamCard}>
            <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 13 }}>{t.name}</div>
            <div style={{ color: '#64748b', fontSize: 11 }}>{t.region} {t.seed}-seed</div>
            <select
              style={{ ...s.miniInput, marginTop: 6 }}
              value=""
              onChange={e => e.target.value && setEliminated(t.id, e.target.value)}
            >
              <option value="">Mark out in…</option>
              {ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        ))}
      </div>

      {elim.length > 0 && (
        <>
          <h3 style={{ ...s.h3, marginTop: 24 }}>Eliminated ({elim.length})</h3>
          <div style={s.teamGrid}>
            {elim.map(t => (
              <div key={t.id} style={{ ...s.teamCard, opacity: 0.5 }}>
                <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: 13 }}>{t.name}</div>
                <div style={{ color: '#475569', fontSize: 11 }}>{t.region} {t.seed}-seed · Out {t.eliminated_in_round}</div>
                <button style={{ ...s.btnSmGray, marginTop: 6, fontSize: 11 }} onClick={() => setEliminated(t.id, null)}>Restore</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Participants ───────────────────────────────────────────────────────────

function ParticipantsTab() {
  const [participants, setParticipants] = useState([]);
  const [name,         setName]         = useState('');
  const [msg,          setMsg]          = useState('');

  async function load() { api.get('/participants').then(setParticipants); }
  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    await api.post('/participants', { name });
    setMsg(`${name} added!`);
    setName('');
    load();
    setTimeout(() => setMsg(''), 2000);
  }

  return (
    <div>
      <div style={s.formCard}>
        <h3 style={s.h3}>Add Participant</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10 }}>
          <input style={s.input} placeholder="Display name" value={name} onChange={e => setName(e.target.value)} required />
          <button style={s.btn} type="submit">Add</button>
        </form>
        {msg && <div style={s.success}>{msg}</div>}
      </div>
      <div style={{ marginTop: 20 }}>
        {participants.map(p => (
          <div key={p.id} style={{ padding: '10px 0', borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
            #{p.id} — {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Config ─────────────────────────────────────────────────────────────────

function ConfigTab() {
  const [cut,      setCut]      = useState('');
  const [override, setOverride] = useState('');
  const [msg,      setMsg]      = useState('');

  useEffect(() => {
    api.get('/analytics/config').then(cfg => {
      setCut(cfg.organizer_cut_pct || '0');
      setOverride(cfg.pot_override || '');
    });
  }, []);

  async function save(e) {
    e.preventDefault();
    await api.put('/analytics/config', {
      organizer_cut_pct: parseFloat(cut) || 0,
      pot_override:      override ? parseFloat(override) : '',
    });
    setMsg('Saved!');
    setTimeout(() => setMsg(''), 2000);
  }

  return (
    <div style={s.formCard}>
      <h3 style={s.h3}>Pot Configuration</h3>
      <form onSubmit={save} style={s.form}>
        <label style={s.label}>
          Organizer cut (%)
          <input style={s.input} type="number" min="0" max="100" step="0.1" value={cut} onChange={e => setCut(e.target.value)} />
        </label>
        <label style={s.label}>
          Manual pot override ($) — leave blank to use the auto-estimate
          <input style={s.input} type="number" min="0" placeholder="e.g. 5000" value={override} onChange={e => setOverride(e.target.value)} />
        </label>
        <button style={s.btn} type="submit">Save Config</button>
        {msg && <div style={s.success}>{msg}</div>}
      </form>
    </div>
  );
}

const s = {
  h2:        { fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 },
  h3:        { fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 14 },
  tabs:      { display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #334155', paddingBottom: 0 },
  tab:       { background: 'transparent', border: 'none', color: '#64748b', padding: '8px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 500, borderBottom: '2px solid transparent', marginBottom: -1 },
  tabActive: { color: '#f97316', borderBottom: '2px solid #f97316' },
  panel:     { },
  formCard:  { background: '#1e293b', borderRadius: 12, padding: '20px 24px', border: '1px solid #334155', maxWidth: 600 },
  form:      { display: 'flex', flexDirection: 'column', gap: 10 },
  label:     { display: 'flex', flexDirection: 'column', gap: 6, color: '#94a3b8', fontSize: 13 },
  input:     { background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '9px 14px', color: '#f1f5f9', fontSize: 14 },
  miniInput: { background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '4px 8px', color: '#f1f5f9', fontSize: 12 },
  btn:       { background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' },
  btnSm:     { background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 5, padding: '3px 10px', fontSize: 12, cursor: 'pointer', marginRight: 4 },
  btnSmGray: { background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 5, padding: '3px 10px', fontSize: 12, cursor: 'pointer', marginRight: 4 },
  btnSmRed:  { background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 5, padding: '3px 10px', fontSize: 12, cursor: 'pointer' },
  success:   { color: '#4ade80', fontSize: 13, marginTop: 8 },
  errorMsg:  { color: '#f87171', fontSize: 13, marginTop: 8 },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:        { padding: '9px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#1e293b', borderBottom: '1px solid #334155' },
  td:        { padding: '9px 12px', color: '#94a3b8' },
  teamGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginTop: 8 },
  teamCard:  { background: '#1e293b', borderRadius: 8, padding: '12px 14px', border: '1px solid #334155' },
};
