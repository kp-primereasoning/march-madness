import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const links = [
    { to: '/',          label: 'Dashboard' },
    { to: '/teams',     label: 'All Teams' },
    { to: '/portfolio', label: 'Portfolios' },
  ];
  if (user?.isAdmin) links.push({ to: '/admin', label: 'Admin' });

  return (
    <nav style={s.nav}>
      <div style={s.brand}>🏀 Calcutta 2026</div>
      <div style={s.links}>
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            style={{
              ...s.link,
              ...(location.pathname === l.to || (l.to !== '/' && location.pathname.startsWith(l.to))
                ? s.active : {}),
            }}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div style={s.user}>
        <span style={s.username}>{user?.displayName}</span>
        <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}

const s = {
  nav:       { display: 'flex', alignItems: 'center', gap: 24, padding: '0 24px', height: 56, background: '#1e293b', borderBottom: '1px solid #334155', position: 'sticky', top: 0, zIndex: 100 },
  brand:     { fontSize: 18, fontWeight: 700, color: '#f97316', flexShrink: 0 },
  links:     { display: 'flex', gap: 4, flex: 1 },
  link:      { color: '#94a3b8', textDecoration: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 14, fontWeight: 500, transition: 'all 0.15s' },
  active:    { color: '#f1f5f9', background: '#334155' },
  user:      { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
  username:  { color: '#94a3b8', fontSize: 13 },
  logoutBtn: { background: 'transparent', border: '1px solid #475569', color: '#94a3b8', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
};
