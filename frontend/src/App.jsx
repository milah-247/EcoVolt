import { Routes, Route, NavLink } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Marketplace from './pages/Marketplace.jsx';
import Wallet from './pages/Wallet.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '⚡' },
  { to: '/market', label: 'Market', icon: '🏪' },
  { to: '/wallet', label: 'Wallet', icon: '👛' },
];

export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <div className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/market" element={<Marketplace />} />
            <Route path="/wallet" element={<Wallet />} />
          </Routes>
        </div>
        <nav className="bottom-nav" aria-label="Main navigation">
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
              <span role="img" aria-hidden>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </AuthProvider>
  );
}
