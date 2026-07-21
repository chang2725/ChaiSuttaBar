import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FoodItems from '../components/FoodItems';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { cafeTablesApi } from '../services/apiService';

/* ── Token helpers (no external deps) ── */
const getValidToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    return token;
  } catch {
    return null;
  }
};

/* ── Design tokens (Chang Restaurant Theme) ── */
const t = {
  bg: '#0F2922',
  surface: 'rgba(15, 41, 34, 0.65)',
  surfaceAlt: 'rgba(0, 0, 0, 0.4)',
  border: 'rgba(224, 169, 109, 0.2)',
  accent: '#E0A96D',
  accentLight: 'rgba(224, 169, 109, 0.1)',
  accentDark: '#A63A2C',
  text: '#FAF6F0',
  textMuted: 'rgba(250, 246, 240, 0.7)',
  textLight: 'rgba(250, 246, 240, 0.5)',
  red: '#A63A2C',
  redBg: 'rgba(166, 58, 44, 0.15)',
  green: '#22c55e',
  greenBg: 'rgba(34, 197, 94, 0.1)',
  radius: '24px',
  radiusSm: '12px',
  shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  glow: '0 0 20px rgba(224, 169, 109, 0.4)',
};

/* ── Inline form card (Themed with Animated Background & Glassmorphism) ── */
const CenteredCard = ({ children }) => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: '"Outfit", system-ui, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    color: t.text,
  }}>
    {/* Animated Restaurant Background */}
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundImage: `linear-gradient(to bottom, rgba(15, 41, 34, 0.85), rgba(5, 15, 12, 0.98)), url('https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2070&auto=format&fit=crop')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      zIndex: -1,
      animation: 'ambientPan 60s linear infinite alternate'
    }} />

    {/* Glassmorphism Card */}
    <div style={{
      width: '100%',
      maxWidth: '420px',
      background: t.surface,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid ${t.border}`,
      borderRadius: t.radius,
      boxShadow: t.shadow,
      padding: '40px 32px',
      position: 'relative',
      zIndex: 1,
    }}>
      {/* Inner Glow Decorative Element with Smooth Color Animation */}
      <div className="ambient-glow" style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', height: '100px', 
        filter: 'blur(60px)', borderRadius: '50%', pointerEvents: 'none',
        opacity: 0.6
      }} />
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
    
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@300;400;500;600;700&display=swap');
      
      @keyframes ambientPan { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes pulseSlow { 0%, 100% { opacity: 1; text-shadow: 0 0 10px #E0A96D; } 50% { opacity: 0.7; text-shadow: none; } }
      
      /* Smooth Color Shift Animation for Gradients */
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      .ambient-glow {
        background: linear-gradient(270deg, rgba(224, 169, 109, 0.4), rgba(166, 58, 44, 0.4), rgba(224, 169, 109, 0.4));
        background-size: 200% 200%;
        animation: gradientShift 8s ease infinite;
      }
      
      .btn-primary {
        width: 100%; padding: 14px; 
        background: linear-gradient(270deg, #E0A96D, #D4A373, #A63A2C, #E0A96D);
        background-size: 300% 300%;
        color: #0F2922; border: none; border-radius: 50px; font-size: 16px; font-weight: 700;
        cursor: pointer; font-family: 'Outfit', sans-serif; transition: all 0.3s ease;
        box-shadow: 0 0 20px rgba(224, 169, 109, 0.4);
        display: flex; align-items: center; justify-content: center; gap: 8px;
        animation: gradientShift 6s ease infinite;
      }
      .btn-primary:hover { transform: scale(1.03); box-shadow: 0 0 30px rgba(224, 169, 109, 0.6); }
      
      .btn-secondary {
        width: 100%; padding: 14px; background: rgba(0,0,0,0.4); border: 1px solid rgba(224,169,109,0.3);
        color: #FAF6F0; border-radius: 50px; font-size: 16px; font-weight: 600;
        cursor: pointer; font-family: 'Outfit', sans-serif; transition: all 0.3s ease;
      }
      .btn-secondary:hover { background: rgba(224,169,109,0.1); border-color: #E0A96D; }
    `}</style>
  </div>
);

/* ── Loading spinner ── */
const Spinner = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ animation: 'spin 0.8s linear infinite', display: 'block' }}>
    <path d="M21 12a9 9 0 1 1-18 0" />
  </svg>
);

/* ── Main component ── */
const Home = () => {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const { setTableId, setDeliveryMode } = useCart();
  const { login, user } = useAuth();

  // Table-scan flow state
  const [phase, setPhase] = useState('idle'); // idle | checking | login | fetching | success | error
  const [flowError, setFlowError] = useState('');

  /* ── Fetch cafe tables and match the scanned tableNumber ── */
  const fetchAndMatchTable = async (tblNum) => {
    const targetTable = tblNum || tableNumber;
    setPhase('fetching');
    setFlowError('');
    try {
      const tables = await cafeTablesApi.getAll();

      const matched = tables.find(
        (tbl) => String(tbl.tableNumber).toLowerCase() === String(targetTable).toLowerCase()
      );
      console.log('Scanned table number:', targetTable);
      console.log('Matched table:', matched);
      if (!matched) {
        setFlowError(`Table "${targetTable}" was not found. Please check with a staff member.`);
        setPhase('error');
        return;
      }

      if (!matched.isActive) {
        setFlowError(`Table "${targetTable}" is currently inactive. Please check with a staff member.`);
        setPhase('error');
        return;
      }

      // Pre-fill cart and navigate to checkout
      setTableId(matched.id);  // numeric FK sent to API
      setDeliveryMode('dinein');
      sessionStorage.setItem('scanned_table', JSON.stringify(matched));
      sessionStorage.setItem('tableNumber', targetTable);  // Store the table number
      sessionStorage.setItem('tableId', matched.id);  // Store the table ID
      sessionStorage.removeItem('pending_table_scan');
      setPhase('success');
      navigate('/checkout', { state: { scannedTable: matched, tableNumber: targetTable, tableId: matched.id } });
    } catch (err) {
      setFlowError(err.message || 'Failed to verify table. Please try again.');
      setPhase('error');
    }
  };

  /* ── Recovery: if auth redirect lost the table URL, redirect back to it ── */
  useEffect(() => {
    if (tableNumber) {
      sessionStorage.removeItem('pending_table_scan');
      return;
    }
    const pendingTable = sessionStorage.getItem('pending_table_scan');
    if (pendingTable && getValidToken()) {
      sessionStorage.removeItem('pending_table_scan');
      navigate(`/${pendingTable}`, { replace: true });
    }
  }, [tableNumber, navigate, user]);

  /* ── On mount and when user logs in: if tableNumber present, begin flow ── */
  useEffect(() => {
    if (!tableNumber) return;
    
    const token = getValidToken();
    console.log('Token check:', !!token, 'User:', user);
    
    if (!token) {
      setPhase('login');
    } else {
      // Token exists, fetch table data
      fetchAndMatchTable();
    }
  }, [tableNumber, user]);

  /* ── No tableNumber → render normal menu ── */
  if (!tableNumber) {
    return <FoodItems />;
  }

  /* ── Checking phase (brief) ── */
  if (phase === 'checking') {
    return (
      <CenteredCard>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: t.accent }}>
            <Spinner />
          </div>
          <p style={{ color: t.textMuted, fontSize: '15px', margin: 0, letterSpacing: '0.02em' }}>
            Verifying session…
          </p>
        </div>
      </CenteredCard>
    );
  }

  /* ── Fetching phase ── */
  if (phase === 'fetching') {
    return (
      <CenteredCard>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: t.accent }}>
            <Spinner />
          </div>
          <p style={{ 
            fontFamily: '"Playfair Display", serif', 
            fontWeight: 800, fontSize: '22px', 
            color: t.accent, marginBottom: '8px',
            textShadow: t.glow
          }}>
            Looking up Table {tableNumber}
          </p>
          <p style={{ color: t.textLight, fontSize: '14px', margin: 0 }}>
            Fetching table information…
          </p>
        </div>
      </CenteredCard>
    );
  }

  /* ── Login phase ── */
  if (phase === 'login') {
    return (
      <CenteredCard>
        <div style={{ textAlign: 'center' }}>
          {/* Table badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: t.surfaceAlt,
            border: `1px solid ${t.border}`,
            color: t.accent,
            fontSize: '12px',
            fontWeight: 700,
            padding: '6px 14px',
            borderRadius: '20px',
            marginBottom: '24px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          }}>
            <span style={{ animation: 'pulseSlow 2s infinite' }}>✦</span> TABLE {tableNumber}
          </div>

          <h2 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '32px',
            fontWeight: 800,
            color: t.text,
            margin: '0 0 12px',
            lineHeight: '1.2',
            textShadow: t.glow,
          }}>
            Sign in to continue
          </h2>
          <p style={{ color: t.textMuted, fontSize: '15px', margin: '0 0 32px', lineHeight: '1.6' }}>
            Sign in to view the menu and order directly from your table.
          </p>

          <button
            onClick={() => {
              sessionStorage.setItem('pending_table_scan', tableNumber);
              login(4);
            }}
            className="btn-primary"
          >
            Sign In
          </button>
        </div>
      </CenteredCard>
    );
  }

  /* ── Error phase ── */
  if (phase === 'error') {
    return (
      <CenteredCard>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: t.redBg, border: `1px solid ${t.red}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: `0 0 20px ${t.redBg}`
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={t.red}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>

          <h2 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '26px', fontWeight: 800, color: t.text,
            margin: '0 0 12px', textShadow: t.glow
          }}>
            Table Not Found
          </h2>

          <p style={{ color: t.textMuted, fontSize: '15px', margin: '0 0 32px', lineHeight: '1.6' }}>
            {flowError}
          </p>

          <button
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Browse Menu
          </button>
        </div>
      </CenteredCard>
    );
  }

  /* ── Success / fallback (navigate fires immediately, this is rarely shown) ── */
  return (
    <CenteredCard>
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: t.green }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: t.greenBg, border: `1px solid ${t.green}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 20px ${t.greenBg}`
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={t.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <p style={{ 
          fontFamily: '"Playfair Display", serif',
          fontWeight: 800, fontSize: '20px', 
          color: t.text, margin: 0,
          textShadow: '0 0 10px rgba(255,255,255,0.2)'
        }}>
          Table confirmed — redirecting…
        </p>
      </div>
    </CenteredCard>
  );
};

export default Home;