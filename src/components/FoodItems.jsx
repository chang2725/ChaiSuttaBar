import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { foodItemsApi, categoriesApi, transformFoodItem, transformCategory } from '../services/apiService';
import FoodItemCard from './FoodItemCard';

/* ─── Inline design tokens (Light Theme - Fresh Harvest & Warm Terracotta) ─── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@300;400;500;600;700&display=swap');

  .fi-root {
    --brand:    #D96B27;
    --brand-lt: rgba(217, 107, 39, 0.12);
    --brand-hv: #b8571e;
    --gold:     #D96B27;
    --gold-lt:  rgba(217, 107, 39, 0.08);
    --bg:       #FBF9F5;
    --surface:  rgba(255, 255, 255, 0.85);
    --surf2:    rgba(0, 0, 0, 0.03);
    --border:   rgba(217, 107, 39, 0.15);
    --bdr-str:  rgba(217, 107, 39, 0.35);
    --txt:      #1F2322;
    --txt-2:    rgba(31, 35, 34, 0.75);
    --txt-3:    rgba(31, 35, 34, 0.45);
    --green:    #16A34A;
    --green-lt: rgba(22, 163, 74, 0.12);
    --r-sm:     12px;
    --r-md:     16px;
    --r-lg:     24px;
    --r-xl:     32px;
    --r-full:   999px;
    --sh-xs:    0 4px 20px rgba(31, 35, 34, 0.06);
    --sh-sm:    0 8px 30px rgba(31, 35, 34, 0.08);
    --sh-md:    0 20px 40px -10px rgba(31, 35, 34, 0.12);
    font-family: 'Outfit', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--txt);
    position: relative;
    overflow-x: hidden;
  }

  /* Ambient background gradient layer */
  .fi-root::before {
    content: '';
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: radial-gradient(circle at 50% 0%, rgba(217, 107, 39, 0.06) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  /* ── PAGE WRAPPER ── */
  .fi-page { max-width: 1200px; margin: 0 auto; padding: 40px 24px; position: relative; z-index: 1; }
  .fi-page.with-cart { padding-bottom: 140px; }

  /* ── HERO HEADER ── */
  .fi-hero {
    display: flex; align-items: flex-end; justify-content: space-between;
    gap: 16px; margin-bottom: 32px;
  }
  .fi-hero-eyebrow {
    font-size: 11px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: var(--brand);
    margin-bottom: 8px; display: flex; align-items: center; gap: 8px;
  }
  .fi-hero-eyebrow::before {
    content: ''; display: inline-block;
    width: 24px; height: 2px; background: var(--brand); border-radius: 2px;
  }
  .fi-hero-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(36px, 5vw, 52px);
    font-weight: 800; line-height: 1.1;
    color: var(--txt); letter-spacing: -.5px;
    margin: 0;
  }
  .fi-hero-title em { font-style: normal; color: var(--brand); }
  .fi-hero-sub {
    font-size: 15px; color: var(--txt-2); margin-top: 10px; line-height: 1.5;
  }
  .fi-hero-badge {
    flex-shrink: 0;
    background: var(--surface);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 16px 24px;
    text-align: center;
    box-shadow: var(--sh-xs);
    display: none;
  }
  @media(min-width:640px){ .fi-hero-badge { display: block; } }
  .fi-hero-badge-num {
    font-family: 'Playfair Display', serif;
    font-size: 32px; font-weight: 800; color: var(--brand); line-height: 1;
  }
  .fi-hero-badge-lbl {
    font-size: 11px; font-weight: 600; color: var(--txt-3);
    text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;
  }

  /* ── FILTER / SORT BAR ── */
  .fi-bar {
    background: var(--surface);
    backdrop-filter: blur(16px);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 20px;
    margin-bottom: 28px;
    box-shadow: var(--sh-sm);
  }
  .fi-bar-top {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px; gap: 14px;
  }
  .fi-search-wrap { flex: 1; position: relative; }
  .fi-search-icon {
    position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
    color: var(--txt-3); font-size: 16px; pointer-events: none;
  }
  .fi-search {
    width: 100%;
    background: var(--surf2);
    border: 1px solid var(--border);
    border-radius: var(--r-md);
    padding: 12px 16px 12px 44px;
    font-family: 'Outfit', sans-serif;
    font-size: 14px; color: var(--txt);
    outline: none; transition: all .3s ease;
  }
  .fi-search::placeholder { color: var(--txt-3); }
  .fi-search:focus {
    border-color: var(--brand);
    box-shadow: 0 0 15px rgba(217,107,39,0.15);
    background: #FFFFFF;
  }

  .fi-sort-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 18px;
    background: var(--surf2);
    border: 1px solid var(--border);
    border-radius: var(--r-md);
    font-family: 'Outfit', sans-serif;
    font-size: 14px; font-weight: 600; color: var(--txt-2);
    cursor: pointer; white-space: nowrap;
    transition: all .3s ease;
    flex-shrink: 0;
  }
  .fi-sort-btn:hover { border-color: var(--bdr-str); color: var(--txt); background: rgba(217,107,39,0.04); }
  .fi-sort-btn.active { border-color: var(--brand); color: var(--brand); background: var(--gold-lt); }
  .fi-sort-icon { font-size: 16px; }

  /* Filter chips */
  .fi-chips { display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; padding-bottom: 4px; }
  .fi-chips::-webkit-scrollbar { display: none; }
  .fi-chip {
    flex-shrink: 0; display: flex; align-items: center; gap: 8px;
    padding: 9px 16px;
    background: var(--surf2);
    border: 1px solid var(--border);
    border-radius: var(--r-full);
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 600; color: var(--txt-2);
    cursor: pointer; transition: all .3s ease; user-select: none;
  }
  .fi-chip:hover { border-color: var(--bdr-str); color: var(--txt); background: rgba(217,107,39,0.04); }
  .fi-chip.on {
    background: var(--brand-lt); border-color: var(--brand);
    color: var(--brand);
  }
  .fi-chip-dot {
    width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
    background: currentColor; display: none;
  }
  .fi-chip.on .fi-chip-dot { display: block; }

  /* bottom meta row */
  .fi-bar-foot {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 16px; padding-top: 14px;
    border-top: 1px solid var(--border);
  }
  .fi-count { font-size: 13px; color: var(--txt-3); font-weight: 500; }
  .fi-count b { color: var(--txt); font-weight: 700; }
  .fi-clear {
    font-size: 12px; font-weight: 700; color: var(--brand);
    background: var(--brand-lt); border: 1px solid rgba(217,107,39,0.2);
    border-radius: var(--r-full); padding: 5px 14px;
    cursor: pointer; font-family: 'Outfit', sans-serif;
    transition: all .2s;
  }
  .fi-clear:hover { background: rgba(217,107,39,0.2); }

  /* ── SORT SHEET ── */
  .fi-overlay {
    position: fixed; inset: 0;
    background: rgba(31,35,34,0.4); backdrop-filter: blur(6px);
    z-index: 40; opacity: 0; pointer-events: none; transition: opacity .3s ease;
  }
  .fi-overlay.show { opacity: 1; pointer-events: all; }
  .fi-sheet {
    position: fixed; bottom: 0; left: 50%;
    transform: translateX(-50%) translateY(110%);
    width: 100%; max-width: 480px;
    background: #FFFFFF;
    border: 1px solid var(--border);
    border-radius: var(--r-xl) var(--r-xl) 0 0;
    padding: 0 0 34px; z-index: 50;
    transition: transform .35s cubic-bezier(.32,.72,0,1);
    box-shadow: 0 -10px 40px rgba(31,35,34,0.15);
  }
  .fi-sheet.open { transform: translateX(-50%) translateY(0); }
  .fi-sheet-pill {
    width: 40px; height: 4px; background: var(--bdr-str);
    border-radius: 2px; margin: 16px auto 0;
  }
  .fi-sheet-head {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .fi-sheet-title {
    font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700;
    color: var(--txt);
  }
  .fi-sheet-close {
    width: 36px; height: 36px;
    background: var(--surf2); border: 1px solid var(--border);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 16px; color: var(--txt-2);
    transition: all .2s;
  }
  .fi-sheet-close:hover { border-color: var(--brand); color: var(--brand); background: rgba(217,107,39,0.05); }
  .fi-sort-opts { padding: 16px 20px 0; display: flex; flex-direction: column; gap: 8px; }
  .fi-sort-opt {
    display: flex; align-items: center; gap: 16px;
    padding: 14px 18px;
    background: var(--surf2); border: 1px solid var(--border);
    border-radius: var(--r-md); cursor: pointer;
    transition: all .2s; font-family: 'Outfit', sans-serif;
  }
  .fi-sort-opt:hover { border-color: var(--bdr-str); background: rgba(217,107,39,0.04); }
  .fi-sort-opt.active { background: var(--gold-lt); border-color: var(--brand); }
  .fi-sort-opt-icon { font-size: 20px; flex-shrink: 0; }
  .fi-sort-opt-info {}
  .fi-sort-opt-name { font-size: 15px; font-weight: 700; color: var(--txt); }
  .fi-sort-opt-desc { font-size: 12px; color: var(--txt-3); margin-top: 2px; }
  .fi-sort-opt.active .fi-sort-opt-name { color: var(--brand); }
  .fi-sort-check {
    margin-left: auto; width: 22px; height: 22px;
    background: var(--brand); border-radius: 50%;
    display: none; align-items: center; justify-content: center;
    color: #FFFFFF; font-size: 12px; font-weight: bold;
  }
  .fi-sort-opt.active .fi-sort-check { display: flex; }

  /* ── GRID ── */
  .fi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }
  @media(max-width:600px){ .fi-grid { grid-template-columns: 1fr; } }

  /* ── PAGINATION CONTROLS ── */
  .fi-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 40px;
    padding: 16px;
    background: var(--surface);
    backdrop-filter: blur(16px);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    box-shadow: var(--sh-xs);
  }
  .fi-page-btn {
    padding: 10px 20px;
    background: var(--surf2);
    border: 1px solid var(--border);
    border-radius: var(--r-md);
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: var(--txt);
    cursor: pointer;
    transition: all .2s ease;
  }
  .fi-page-btn:hover:not(:disabled) {
    border-color: var(--brand);
    color: var(--brand);
    background: var(--brand-lt);
  }
  .fi-page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .fi-page-info {
    font-size: 14px;
    color: var(--txt-2);
    font-weight: 500;
  }
  .fi-page-info b {
    color: var(--txt);
    font-weight: 700;
  }

  /* ── EMPTY STATE ── */
  .fi-empty {
    grid-column: 1/-1;
    background: var(--surface); backdrop-filter: blur(16px);
    border: 1px solid var(--border);
    border-radius: var(--r-xl); padding: 64px 32px;
    text-align: center; box-shadow: var(--sh-sm);
  }
  .fi-empty-icon { font-size: 56px; margin-bottom: 16px; }
  .fi-empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px; font-weight: 700; color: var(--txt); margin-bottom: 8px;
  }
  .fi-empty-sub { font-size: 14px; color: var(--txt-3); line-height: 1.6; }
  .fi-empty-btn {
    margin-top: 24px; padding: 12px 24px;
    background: var(--brand);
    color: #FFFFFF;
    border: none; border-radius: var(--r-full);
    font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all .3s ease;
    box-shadow: 0 4px 15px rgba(217,107,39,0.3);
  }
  .fi-empty-btn:hover { background: var(--brand-hv); transform: translateY(-1px); }

  /* ── LOADING STATE ── */
  .fi-skeleton-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }
  .fi-skel {
    background: var(--surface); backdrop-filter: blur(16px);
    border: 1px solid var(--border);
    border-radius: var(--r-lg); overflow: hidden;
    animation: shimmer 1.5s infinite;
  }
  .fi-skel-img { height: 180px; background: var(--surf2); }
  .fi-skel-body { padding: 20px; }
  .fi-skel-line {
    height: 14px; background: var(--surf2);
    border-radius: var(--r-full); margin-bottom: 12px;
  }
  .fi-skel-line.short { width: 55%; }
  @keyframes shimmer {
    0%,100% { opacity: 1; } 50% { opacity: .4; }
  }

  /* ── ERROR STATE ── */
  .fi-error-shell {
    min-height: calc(100vh - 80px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 20px;
  }
  .fi-error {
    width: min(100%, 560px);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(217, 107, 39, 0.3);
    border-radius: 32px;
    padding: 40px 36px;
    box-shadow: 0 25px 60px rgba(31,35,34,0.1);
    position: relative;
    overflow: hidden;
  }
  .fi-error-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 999px;
    background: rgba(217, 107, 39, 0.1);
    color: var(--brand);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 20px;
    border: 1px solid rgba(217, 107, 39, 0.2);
  }
  .fi-error-icon {
    width: 72px;
    height: 72px;
    display: grid;
    place-items: center;
    border-radius: 24px;
    font-size: 32px;
    margin-bottom: 20px;
    background: rgba(217, 107, 39, 0.1);
    border: 1px solid rgba(217, 107, 39, 0.2);
  }
  .fi-error-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    font-weight: 800;
    color: var(--txt);
    margin: 0 0 12px;
    line-height: 1.2;
  }
  .fi-error-msg {
    font-size: 15px;
    color: var(--txt-2);
    margin: 0 0 20px;
    line-height: 1.7;
  }
  .fi-error-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 28px;
  }
  .fi-error-meta span {
    padding: 8px 14px;
    border-radius: 999px;
    background: var(--surf2);
    border: 1px solid var(--border);
    color: var(--txt-3);
    font-size: 12px;
    font-weight: 600;
  }
  .fi-error-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
  }
  .fi-retry, .fi-login {
    padding: 12px 24px;
    border: none;
    border-radius: var(--r-full);
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all .3s ease;
  }
  .fi-retry {
    background: var(--surf2);
    color: var(--txt);
    border: 1px solid var(--border);
  }
  .fi-retry:hover {
    border-color: var(--brand);
    background: var(--brand-lt);
  }
  .fi-login {
    background: var(--brand);
    color: #FFFFFF;
    box-shadow: 0 4px 15px rgba(217,107,39,0.3);
  }
  .fi-login:hover {
    background: var(--brand-hv);
  }

  .fi-sort-label {
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .8px; color: var(--brand); margin-left: 4px;
  }
`;

/* ── Sort config ── */
const SORT_OPTIONS = [
  { value: 'name',   label: 'Name',   desc: 'A to Z alphabetically',  icon: '🔤' },
  { value: 'price',  label: 'Price',  desc: 'Lowest price first',      icon: '💰' },
  { value: 'rating', label: 'Rating', desc: 'Highest rated first',     icon: '⭐' },
];

/* ── Filter config ── */
const FILTER_CHIPS = [
  { key: 'vegan',         label: '🌱 Vegan'       },
  { key: 'glutenFree',    label: '🌾 Gluten-Free' },
  { key: 'availableOnly', label: '✅ Available'   },
];

const FoodItems = () => {
  const { token, login } = useAuth();
  const { itemCount, finalAmount } = useCart();
  const navigate = useNavigate();
  
  const [foodItems,   setFoodItems]   = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [query,       setQuery]       = useState('');
  const [filters,     setFilters]     = useState({ 
    vegan: false, 
    glutenFree: false, 
    availableOnly: true,
    category: null
  });
  const [sortBy,      setSortBy]      = useState('name');
  const [showSort,    setShowSort]    = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const searchRef = useRef(null);

  useEffect(() => { 
    fetchData(); 
  }, [token]);

  // Reset page when filters, query, or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query, filters, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      
      const [apiData, categoriesData] = await Promise.all([
        foodItemsApi.getAll(),
        categoriesApi.getAll()
      ]);
      
      setFoodItems(apiData.map(transformFoodItem));
      setCategories(categoriesData.map(transformCategory).filter(cat => cat.isActive));
    } catch (err) {
      setError(err.message || 'Failed to fetch menu data');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedItems = foodItems
    .filter(item => {
      if (query && !item.name?.toLowerCase().includes(query.toLowerCase())) return false;
      if (filters.vegan         && !item.isVegan)     return false;
      if (filters.glutenFree    && !item.isGlutenFree) return false;
      if (filters.availableOnly && !item.isAvailable)  return false;
      if (filters.category && !item.categories.includes(filters.category)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price')  return (a.price || 0) - (b.price || 0);
      if (sortBy === 'rating') return (b.averageRating || 0) - (a.averageRating || 0);
      return (a.name || '').localeCompare(b.name || '');
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const paginatedItems = filteredAndSortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleFilter = key => setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleCategory = categoryName => {
    setFilters(prev => ({ 
      ...prev, 
      category: prev.category === categoryName ? null : categoryName 
    }));
  };
  const clearAll = () => {
    setFilters({ vegan: false, glutenFree: false, availableOnly: true, category: null });
    setQuery('');
    if (searchRef.current) searchRef.current.value = '';
  };
  const activeFilterCount = Object.values(filters).filter(val => val && val !== null).length;
  const sortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label;
  const isAuthError = error === 'No authentication token found. Please log in.';
  const displayErrorMessage = isAuthError
    ? 'Please sign in to view our full menu and continue with your order.'
    : error;

  /* ── Loading ── */
  if (loading) return (
    <div className="fi-root">
      <style>{css}</style>
      <div className="fi-page">
        <div className="fi-hero" style={{ marginBottom: 32 }}>
          <div>
            <div className="fi-hero-eyebrow">Our Menu</div>
            <h1 className="fi-hero-title">Loading <em>dishes…</em></h1>
          </div>
        </div>
        <div className="fi-skeleton-grid">
          {[1,2,3,4,5,6].map(i => (
            <div className="fi-skel" key={i} style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="fi-skel-img" />
              <div className="fi-skel-body">
                <div className="fi-skel-line" />
                <div className="fi-skel-line short" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="fi-root">
      <style>{css}</style>
      <div className="fi-page fi-error-shell">
        <div className="fi-error">
          <div className="fi-error-pill">🔐 Secure access</div>
          <div className="fi-error-icon">🍽️</div>
          <div className="fi-error-title">
            {isAuthError ? 'Sign in to browse the menu' : 'Couldn&apos;t load menu'}
          </div>
          <div className="fi-error-msg">{displayErrorMessage}</div>
          <div className="fi-error-meta">
            <span>Fresh dishes</span>
            <span>Fast checkout</span>
            <span>Personalized experience</span>
          </div>
          <div className="fi-error-actions">
            {isAuthError ? (
              <button className="fi-login" onClick={() => login(4)}>Log in</button>
            ) : null}
            <button className="fi-retry" onClick={fetchData}>Try again</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fi-root">
      <style>{css}</style>
      <div className={`fi-page ${itemCount > 0 ? 'with-cart' : ''}`}>

        {/* ── Hero Header ── */}
        <div className="fi-hero">
          <div className="fi-hero-left">
            <div className="fi-hero-eyebrow">Today&apos;s Selection</div>
            <h1 className="fi-hero-title">Our <em>Menu</em></h1>
            <p className="fi-hero-sub">Freshly curated dishes, crafted with care</p>
          </div>
          <div className="fi-hero-badge">
            <div className="fi-hero-badge-num">{filteredAndSortedItems.length}</div>
            <div className="fi-hero-badge-lbl">Items Found</div>
          </div>
        </div>

        {/* ── Filter / Sort Bar ── */}
        <div className="fi-bar">

          {/* Search + Sort button */}
          <div className="fi-bar-top">
            <div className="fi-search-wrap">
              <span className="fi-search-icon">🔍</span>
              <input
                ref={searchRef}
                className="fi-search"
                type="text"
                placeholder="Search dishes…"
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <button
              className={`fi-sort-btn ${activeFilterCount > 0 || sortBy !== 'name' ? 'active' : ''}`}
              onClick={() => setShowSort(true)}
            >
              <span className="fi-sort-icon">↕️</span>
              Sort
              {sortBy !== 'name' && <span className="fi-sort-label">{sortLabel}</span>}
            </button>
          </div>

          {/* Filter chips */}
          <div className="fi-chips">
            {FILTER_CHIPS.map(({ key, label }) => (
              <button
                key={key}
                className={`fi-chip ${filters[key] ? 'on' : ''}`}
                onClick={() => toggleFilter(key)}
              >
                <span className="fi-chip-dot" />
                {label}
              </button>
            ))}
            
            {categories.map((category) => (
              <button
                key={category.id}
                className={`fi-chip ${filters.category === category.name ? 'on' : ''}`}
                onClick={() => toggleCategory(category.name)}
              >
                <span className="fi-chip-dot" />
                🍽️ {category.name}
              </button>
            ))}
          </div>

          {/* Footer meta */}
          <div className="fi-bar-foot">
            <span className="fi-count">
              Showing <b>{paginatedItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</b>–<b>{Math.min(currentPage * itemsPerPage, filteredAndSortedItems.length)}</b> of <b>{filteredAndSortedItems.length}</b> items
            </span>
            {(activeFilterCount > 0 || query || sortBy !== 'name') && (
              <button className="fi-clear" onClick={clearAll}>Reset all</button>
            )}
          </div>
        </div>

        {/* ── Food Grid ── */}
        <div className="fi-grid">
          {paginatedItems.length === 0 ? (
            <div className="fi-empty">
              <div className="fi-empty-icon">🍽️</div>
              <div className="fi-empty-title">
                {foodItems.length === 0 ? 'Menu is empty' : 'No matches found'}
              </div>
              <p className="fi-empty-sub">
                {foodItems.length === 0
                  ? 'No menu items are currently available.'
                  : 'Try adjusting your filters or search term.'}
              </p>
              {foodItems.length > 0 && (
                <button className="fi-empty-btn" onClick={clearAll}>Clear Filters</button>
              )}
            </div>
          ) : (
            paginatedItems.map((item, index) => (
              <FoodItemCard 
                key={item.id || index} 
                item={item} 
              />
            ))
          )}
        </div>

        {/* ── Pagination Controls ── */}
        {totalPages > 1 && (
          <div className="fi-pagination">
            <button 
              className="fi-page-btn" 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              ← Prev
            </button>
            <span className="fi-page-info">
              Page <b>{currentPage}</b> of <b>{totalPages}</b>
            </span>
            <button 
              className="fi-page-btn" 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── Sticky Cart Bar ── */}
      {itemCount > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '1200px',
            zIndex: 1000,
            padding: '0 16px 20px',
            pointerEvents: 'none',
          }}
        >
          <style>{`
            @keyframes cartSlideUp {
              from { opacity: 0; transform: translateY(100%) scale(0.96); }
              to   { opacity: 1; transform: translateY(0)   scale(1);    }
            }
            @keyframes auraBreath {
              0%,100% { opacity: 0.4; transform: scaleX(1)   scaleY(1);   }
              50%     { opacity: 0.8; transform: scaleX(1.05) scaleY(1.3); }
            }
            @keyframes iconFloat {
              0%,100% { transform: translateY(0);   }
              50%     { transform: translateY(-3px); }
            }
            @keyframes badgePop {
              0%         { transform: scale(0) rotate(-15deg); opacity: 0; }
              65%        { transform: scale(1.25) rotate(4deg);  opacity: 1; }
              100%       { transform: scale(1) rotate(0deg);   opacity: 1; }
            }
            @keyframes shimmerSweep {
              0%   { left: -80%; }
              100% { left: 160%; }
            }
            @keyframes progressFill {
              from { width: 0%; }
              to   { width: var(--progress-w, 62%); }
            }
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(6px); }
              to   { opacity: 1; transform: translateY(0); }
            }

            .cart-bar-root {
              position: relative;
              animation: cartSlideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
              pointer-events: all;
            }

            .cart-bar-root::before {
              content: '';
              position: absolute;
              bottom: -4px;
              left: 50%;
              transform: translateX(-50%);
              width: 75%;
              height: 40px;
              background: radial-gradient(ellipse at center, rgba(217,107,39,0.3) 0%, transparent 70%);
              animation: auraBreath 3s ease-in-out infinite;
              pointer-events: none;
              z-index: -1;
              filter: blur(8px);
            }

            .cart-bar-inner {
              position: relative;
              overflow: hidden;
              border-radius: 24px;
              background: rgba(255, 255, 255, 0.92);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border: 1px solid rgba(217, 107, 39, 0.3);
              box-shadow: 0 25px 50px -12px rgba(31,35,34,0.15), 0 0 20px rgba(217,107,39,0.1);
              padding: 0;
            }

            .cart-progress-strip {
              position: relative;
              height: 3px;
              background: rgba(217,107,39,0.15);
              border-radius: 24px 24px 0 0;
              overflow: hidden;
            }
            .cart-progress-fill {
              height: 100%;
              width: var(--progress-w, 62%);
              background: #D96B27;
              border-radius: 24px;
              animation: progressFill 1.1s cubic-bezier(0.34,1.1,0.64,1) 0.3s both;
              position: relative;
            }

            .cart-body {
              position: relative;
              z-index: 1;
              display: flex;
              align-items: center;
              gap: 16px;
              padding: 16px 20px;
            }

            .cart-icon-wrap {
              position: relative;
              width: 52px;
              height: 52px;
              border-radius: 16px;
              background: #D96B27;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 22px;
              flex-shrink: 0;
              animation: iconFloat 3s ease-in-out infinite;
              box-shadow: 0 4px 15px rgba(217,107,39,0.3);
            }
            .cart-badge {
              position: absolute;
              top: -8px;
              right: -8px;
              min-width: 24px;
              height: 24px;
              padding: 0 6px;
              background: #1F2322;
              color: #FFFFFF;
              border-radius: 30px;
              font-size: 11px;
              font-weight: 800;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: 'Outfit', sans-serif;
              box-shadow: 0 2px 8px rgba(31,35,34,0.2), 0 0 0 2px #FFFFFF;
              animation: badgePop 0.45s cubic-bezier(0.22,1,0.36,1) both;
              transform-origin: center;
            }

            .cart-text-block { flex: 1; min-width: 0; }
            .cart-price {
              font-family: 'Playfair Display', serif;
              font-size: 24px;
              font-weight: 800;
              color: #1F2322;
              letter-spacing: -0.5px;
              line-height: 1.1;
              animation: fadeInUp 0.4s 0.15s both;
            }
            .cart-sub {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              font-size: 12px;
              color: rgba(31, 35, 34, 0.65);
              font-weight: 500;
              margin-top: 4px;
              animation: fadeInUp 0.4s 0.22s both;
            }
            .cart-sub-dot {
              width: 5px;
              height: 5px;
              border-radius: 50%;
              background: #D96B27;
              display: inline-block;
              flex-shrink: 0;
            }

            .cart-divider {
              width: 1px;
              height: 36px;
              background: linear-gradient(180deg, transparent, rgba(217,107,39,0.3), transparent);
              flex-shrink: 0;
            }

            .cart-checkout-btn {
              position: relative;
              overflow: hidden;
              border: none;
              border-radius: 50px;
              padding: 14px 28px;
              font-family: 'Outfit', sans-serif;
              font-size: 15px;
              font-weight: 700;
              color: #FFFFFF;
              cursor: pointer;
              flex-shrink: 0;
              background: #D96B27;
              box-shadow: 0 4px 15px rgba(217,107,39,0.3);
              transition: transform 0.2s cubic-bezier(0.34,1.2,0.64,1), background 0.2s;
            }
            .cart-checkout-btn::before {
              content: '';
              position: absolute;
              top: 0; bottom: 0;
              width: 50%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
              transform: skewX(-15deg);
              animation: shimmerSweep 2.4s ease-in-out infinite;
              pointer-events: none;
            }
            .cart-checkout-btn:hover {
              background: #b8571e;
              transform: scale(1.04) translateY(-2px);
              box-shadow: 0 6px 20px rgba(217,107,39,0.4);
            }
            .cart-checkout-btn:active {
              transform: scale(0.96) translateY(0);
            }
            .cart-btn-inner {
              position: relative;
              z-index: 1;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .cart-btn-label { white-space: nowrap; }
            .cart-btn-arrow {
              display: inline-flex;
              align-items: center;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: rgba(255,255,255,0.2);
              justify-content: center;
              font-size: 12px;
              transition: transform 0.2s cubic-bezier(0.34,1.3,0.64,1);
            }
            .cart-checkout-btn:hover .cart-btn-arrow {
              transform: translateX(3px);
            }
          `}</style>

          <div className="cart-bar-root">
            <div className="cart-bar-inner">
              <div className="cart-progress-strip">
                <div
                  className="cart-progress-fill"
                  style={{ '--progress-w': `${Math.min((finalAmount / 50) * 100, 100)}%` }}
                />
              </div>

              <div className="cart-body">
                <div className="cart-icon-wrap">
                  🛒
                  <div className="cart-badge" key={itemCount}>
                    {itemCount}
                  </div>
                </div>

                <div className="cart-text-block">
                  <div className="cart-price">₹{finalAmount.toFixed(2)}</div>
                  <div className="cart-sub">
                    <span className="cart-sub-dot" />
                    {itemCount} item{itemCount !== 1 ? 's' : ''} selected
                  </div>
                </div>

                <div className="cart-divider" aria-hidden="true" />

                <button
                  className="cart-checkout-btn"
                  onClick={() => navigate('/checkout')}
                  aria-label={`Proceed to checkout — ${itemCount} item${itemCount !== 1 ? 's' : ''}, total ₹${finalAmount.toFixed(2)}`}
                >
                  <span className="cart-btn-inner">
                    <span className="cart-btn-label">Checkout</span>
                    <span className="cart-btn-arrow">→</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sort Bottom Sheet ── */}
      <div className={`fi-overlay ${showSort ? 'show' : ''}`} onClick={() => setShowSort(false)} />
      <div className={`fi-sheet ${showSort ? 'open' : ''}`}>
        <div className="fi-sheet-pill" />
        <div className="fi-sheet-head">
          <div className="fi-sheet-title">Sort By</div>
          <div className="fi-sheet-close" onClick={() => setShowSort(false)}>✕</div>
        </div>
        <div className="fi-sort-opts">
          {SORT_OPTIONS.map(opt => (
            <div
              key={opt.value}
              className={`fi-sort-opt ${sortBy === opt.value ? 'active' : ''}`}
              onClick={() => { setSortBy(opt.value); setShowSort(false); }}
            >
              <span className="fi-sort-opt-icon">{opt.icon}</span>
              <div className="fi-sort-opt-info">
                <div className="fi-sort-opt-name">{opt.label}</div>
                <div className="fi-sort-opt-desc">{opt.desc}</div>
              </div>
              <span className="fi-sort-check">✓</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FoodItems;