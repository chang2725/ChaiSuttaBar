import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const CartIcon = ({ itemCount }) => (
  <Link
    to="/checkout"
    className="relative p-2 text-[#FAF6F0]/80 hover:text-[#E0A96D] transition-all duration-300 transform hover:scale-110"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 8.32a1 1 0 00.95 1.18h9.46a1 1 0 00.95-1.18L15 13M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
    </svg>
    {itemCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-[#A63A2C] text-[#FAF6F0] text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-[0_0_10px_rgba(166,58,44,0.6)] border border-[#0F2922]">
        {itemCount}
      </span>
    )}
  </Link>
);

const UserMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-3 focus:outline-none p-1 rounded-full hover:bg-white/5 transition-colors"
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="w-9 h-9 rounded-full object-cover ring-2 ring-[#E0A96D] shadow-[0_0_15px_rgba(224,169,109,0.3)] transition-transform hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <span className="hidden lg:block text-sm font-semibold text-[#FAF6F0] tracking-wide">
          {user.name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-60 bg-[#0F2922]/95 backdrop-blur-xl border border-[#E0A96D]/30 rounded-2xl py-2 z-50 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E0A96D]/20 bg-gradient-to-b from-white/5 to-transparent">
            <p className="text-sm font-bold text-[#FAF6F0]">{user.name}</p>
            <p className="text-xs text-[#FAF6F0]/60 truncate mt-1">{user.email}</p>
            <span className="inline-block mt-2 text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-[#E0A96D]/10 text-[#E0A96D] border border-[#E0A96D]/30">
              {user.role}
            </span>
          </div>
          <div className="py-1">
            <Link
              to="/orders"
              onClick={() => setOpen(false)}
              className="block w-full text-left px-5 py-2.5 text-sm text-[#FAF6F0]/80 hover:bg-[#E0A96D]/10 hover:text-[#E0A96D] transition-colors font-medium"
            >
              My Orders
            </Link>
            <button
              onClick={() => { onLogout(); setOpen(false); }}
              className="block w-full text-left px-5 py-2.5 text-sm text-[#A63A2C] hover:bg-[#A63A2C]/10 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const location = useLocation();
  const { user, login, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `${
      isActive(path)
        ? 'text-[#E0A96D] border-b-2 border-[#E0A96D] drop-shadow-[0_0_8px_rgba(224,169,109,0.5)]'
        : 'text-[#FAF6F0]/70 hover:text-[#E0A96D]'
    } transition-all duration-300 pb-1 font-semibold tracking-wide text-sm uppercase`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        .font-serif-display { font-family: 'Playfair Display', serif; }
        .font-sans-outfit { font-family: 'Outfit', sans-serif; }
        .text-glow { text-shadow: 0 0 15px rgba(224, 169, 109, 0.5); }
        
        /* Smooth Color Shift Animation for Buttons */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .btn-animated {
          background: linear-gradient(270deg, #E0A96D, #D4A373, #A63A2C, #E0A96D);
          background-size: 300% 300%;
          animation: gradientShift 6s ease infinite;
          color: #0F2922;
          border: none;
          box-shadow: 0 0 20px rgba(224, 169, 109, 0.4);
          transition: all 0.3s ease;
          font-weight: 700;
          border-radius: 50px;
        }
        .btn-animated:hover {
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(224, 169, 109, 0.6);
        }
      `}</style>

      <nav className="sticky top-0 z-50 bg-[#0F2922]/85 backdrop-blur-xl border-b border-[#E0A96D]/20 font-sans-outfit shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Brand Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="font-serif-display font-black text-2xl tracking-wide flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E0A96D] to-[#A63A2C] text-[#0F2922] flex items-center justify-center font-serif-display font-black text-xl shadow-[0_0_15px_rgba(224,169,109,0.5)] group-hover:scale-110 transition-transform">
                  C
                </div>
                <span className="text-[#FAF6F0] text-glow group-hover:text-[#E0A96D] transition-colors duration-300">
                  Chai Suttabar <span className="font-light italic text-[#E0A96D]">Bar</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className={navLinkClass('/')}>Home</Link>
              <Link to="/about" className={navLinkClass('/about')}>About</Link>
              
              {user && (
                <Link to="/orders" className={navLinkClass('/orders')}>Orders</Link>
              )}

              {user && user.role === "admin" && (
                <Link to="/admin" className={navLinkClass('/admin')}>Admin</Link>
              )}

              <div className="flex items-center pl-4 border-l border-white/10 space-x-6">
                {user && <CartIcon itemCount={itemCount} />}
                
                {user ? (
                  <UserMenu user={user} onLogout={logout} />
                ) : (
                  <button onClick={() => login(4)} className="btn-animated px-8 py-2.5 text-sm uppercase tracking-wider">
                    Login
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center space-x-4">
              {user && <CartIcon itemCount={itemCount} />}
              
              {user ? (
                <UserMenu user={user} onLogout={logout} />
              ) : (
                <button onClick={() => login(4)} className="btn-animated px-5 py-2 text-xs uppercase tracking-wider">
                  Login
                </button>
              )}
              
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="text-[#FAF6F0]/80 hover:text-[#E0A96D] focus:outline-none p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileOpen && (
            <div className="md:hidden pb-6 pt-2 space-y-2 px-2 border-t border-[#E0A96D]/10">
              <Link to="/" onClick={() => setMobileOpen(false)} className={`block py-3 px-4 rounded-xl transition-all ${isActive('/') ? 'bg-[#E0A96D]/10 text-[#E0A96D] font-bold border border-[#E0A96D]/20 shadow-[0_0_15px_rgba(224,169,109,0.1)]' : 'text-[#FAF6F0]/70 hover:bg-white/5 hover:text-[#E0A96D]'}`}>Home</Link>
              <Link to="/about" onClick={() => setMobileOpen(false)} className={`block py-3 px-4 rounded-xl transition-all ${isActive('/about') ? 'bg-[#E0A96D]/10 text-[#E0A96D] font-bold border border-[#E0A96D]/20 shadow-[0_0_15px_rgba(224,169,109,0.1)]' : 'text-[#FAF6F0]/70 hover:bg-white/5 hover:text-[#E0A96D]'}`}>About</Link>
              {user && (
                <Link to="/orders" onClick={() => setMobileOpen(false)} className={`block py-3 px-4 rounded-xl transition-all ${isActive('/orders') ? 'bg-[#E0A96D]/10 text-[#E0A96D] font-bold border border-[#E0A96D]/20 shadow-[0_0_15px_rgba(224,169,109,0.1)]' : 'text-[#FAF6F0]/70 hover:bg-white/5 hover:text-[#E0A96D]'}`}>Orders</Link>
              )}
              {user && user.role === "admin" && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className={`block py-3 px-4 rounded-xl transition-all ${isActive('/admin') ? 'bg-[#E0A96D]/10 text-[#E0A96D] font-bold border border-[#E0A96D]/20 shadow-[0_0_15px_rgba(224,169,109,0.1)]' : 'text-[#FAF6F0]/70 hover:bg-white/5 hover:text-[#E0A96D]'}`}>Admin</Link>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;