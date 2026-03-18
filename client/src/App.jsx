import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage     from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TeamsPage     from './pages/TeamsPage';
import PortfolioPage from './pages/PortfolioPage';
import AdminPage     from './pages/AdminPage';
import NavBar        from './components/NavBar';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading)          return <div style={styles.loading}>Loading...</div>;
  if (!user)            return <Navigate to="/login" replace />;
  if (!user.isAdmin)    return <Navigate to="/" replace />;
  return children;
}

function Layout({ children }) {
  return (
    <div style={styles.layout}>
      <NavBar />
      <main style={styles.main}>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <RequireAuth><Layout><DashboardPage /></Layout></RequireAuth>
          }/>
          <Route path="/teams" element={
            <RequireAuth><Layout><TeamsPage /></Layout></RequireAuth>
          }/>
          <Route path="/portfolio/:id?" element={
            <RequireAuth><Layout><PortfolioPage /></Layout></RequireAuth>
          }/>
          <Route path="/admin" element={
            <RequireAdmin><Layout><AdminPage /></Layout></RequireAdmin>
          }/>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

const styles = {
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94a3b8', fontSize: 18 },
  layout:  { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  main:    { flex: 1, padding: '24px 16px', maxWidth: 1400, margin: '0 auto', width: '100%' },
};
