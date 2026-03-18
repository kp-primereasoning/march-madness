import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login, user }         = useAuth();
  const navigate                = useNavigate();

  if (user) { navigate('/'); return null; }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🏀</div>
        <h1 style={s.title}>Calcutta Tracker</h1>
        <p style={s.subtitle}>March Madness 2026</p>
        <form onSubmit={handleSubmit} style={s.form}>
          <input
            style={s.input}
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
            required
          />
          <input
            style={s.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div style={s.error}>{error}</div>}
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  page:     { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a' },
  card:     { background: '#1e293b', borderRadius: 16, padding: '48px 40px', width: '100%', maxWidth: 380, border: '1px solid #334155' },
  logo:     { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title:    { textAlign: 'center', fontSize: 24, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 },
  subtitle: { textAlign: 'center', fontSize: 13, color: '#64748b', marginBottom: 32 },
  form:     { display: 'flex', flexDirection: 'column', gap: 12 },
  input:    { background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '12px 16px', color: '#f1f5f9', fontSize: 15, outline: 'none' },
  error:    { color: '#f87171', fontSize: 13, padding: '8px 12px', background: '#7f1d1d33', borderRadius: 6 },
  btn:      { background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
};
