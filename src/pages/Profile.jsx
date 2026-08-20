import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileApi, isAuthenticated } from '../services/apiService';

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, login, tenantId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'ratings'

  const fetchProfile = async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await profileApi.getProfile();
      // res schema: { success: true, message: '...', user: { profile, kpi, orders, ratings } }
      const userData = res?.user || res?.data?.user || res?.data || {};
      setProfileData(userData);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const formatShortDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    return ((parts[0]?.[0] || 'U') + (parts[1]?.[0] || '')).toUpperCase();
  };

  // Extract nested properties with clean defaults
  const profile = profileData?.profile || {};
  const kpi = profileData?.kpi || {};
  const orders = profileData?.orders || [];
  const ratings = profileData?.ratings || [];

  const displayName = profile.name || authUser?.name || 'Guest User';
  const displayEmail = profile.email || authUser?.email || '';
  const displayPhone = profile.phone || 'Not provided';
  const avatarUrl = profile.avatar_url || authUser?.avatar;

  /* ── Not Authenticated State ── */
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-[#0F2922] text-[#FAF6F0] font-sans-outfit flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-[#E0A96D]/20 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#E0A96D]/10 border border-[#E0A96D]/30 flex items-center justify-center text-3xl mx-auto mb-4">
            👤
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-[#FAF6F0] mb-2">
            Sign In to View Profile
          </h2>
          <p className="text-[#FAF6F0]/70 text-sm mb-6">
            Please log in to access your activity dashboard, order history, and saved ratings.
          </p>
          <button
            onClick={() => login(tenantId)}
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#E0A96D] to-[#D96B27] text-[#0F2922] font-bold text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(224,169,109,0.3)] hover:scale-[1.02] transition-transform"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  /* ── Loading Skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F2922] text-[#FAF6F0] font-sans-outfit py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
          {/* Header Skeleton */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/10" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-48 bg-white/10 rounded-lg" />
              <div className="h-4 w-36 bg-white/10 rounded-lg" />
            </div>
          </div>
          {/* KPI Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 bg-white/5 border border-white/10 rounded-2xl p-4" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="min-h-screen bg-[#0F2922] text-[#FAF6F0] font-sans-outfit flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-[#A63A2C]/30 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#A63A2C]/10 border border-[#A63A2C]/30 flex items-center justify-center text-3xl mx-auto mb-4">
            ⚠️
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-[#FAF6F0] mb-2">
            Failed to Load Profile
          </h2>
          <p className="text-[#FAF6F0]/70 text-sm mb-6">{error}</p>
          <button
            onClick={fetchProfile}
            className="w-full py-3.5 px-6 rounded-full bg-[#E0A96D] text-[#0F2922] font-bold text-sm uppercase tracking-wider hover:bg-[#d49855] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F2922] text-[#FAF6F0] font-sans-outfit py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@300;400;500;600;700&display=swap');
        .font-serif-display { font-family: 'Playfair Display', serif; }
        .font-sans-outfit { font-family: 'Outfit', sans-serif; }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── 1. USER PROFILE HEADER CARD ── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-[#E0A96D]/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Ambient glow accent */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#E0A96D]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* User Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-[#E0A96D] shadow-[0_0_25px_rgba(224,169,109,0.4)] flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#E0A96D] to-[#D96B27] text-[#0F2922] font-serif-display font-black text-3xl sm:text-4xl flex items-center justify-center ring-4 ring-[#E0A96D]/50 shadow-[0_0_25px_rgba(224,169,109,0.4)] flex-shrink-0">
                {getInitials(displayName)}
              </div>
            )}

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#FAF6F0] tracking-tight">
                  {displayName}
                </h1>
                {profile.is_active !== undefined && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                    profile.is_active
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${profile.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                    {profile.is_active ? 'Active Member' : 'Inactive'}
                  </span>
                )}
              </div>

              {/* Contact meta */}
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-y-2 gap-x-6 text-sm text-[#FAF6F0]/70 mb-4">
                {displayEmail && (
                  <div className="flex items-center gap-2">
                    <span className="text-[#E0A96D]">✉</span>
                    <span className="truncate">{displayEmail}</span>
                  </div>
                )}
                {displayPhone && (
                  <div className="flex items-center gap-2">
                    <span className="text-[#E0A96D]">📞</span>
                    <span>{displayPhone}</span>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-6 gap-y-1 text-xs text-[#FAF6F0]/50 pt-3 border-t border-white/10">
                {profile.created_at && (
                  <div>Member since: <strong className="text-[#FAF6F0]/80 font-medium">{formatShortDate(profile.created_at)}</strong></div>
                )}
                {profile.last_login_at && (
                  <div>Last Login: <strong className="text-[#FAF6F0]/80 font-medium">{formatDate(profile.last_login_at)}</strong></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. KPI DASHBOARD CARDS ── */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#E0A96D] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E0A96D]" />
            Your Activity Summary
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Card 1: Total Orders */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-[#E0A96D]/40 rounded-2xl p-4 sm:p-5 transition-all duration-300 group hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#FAF6F0]/60 font-medium uppercase tracking-wider">Orders</span>
                <span className="text-xl group-hover:scale-110 transition-transform">🛍️</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-serif-display text-[#FAF6F0]">
                {kpi.total_orders ?? 0}
              </div>
              <div className="text-[11px] text-[#FAF6F0]/40 mt-1">Total placed</div>
            </div>

            {/* Card 2: Total Spent */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-[#E0A96D]/40 rounded-2xl p-4 sm:p-5 transition-all duration-300 group hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#FAF6F0]/60 font-medium uppercase tracking-wider">Spent</span>
                <span className="text-xl group-hover:scale-110 transition-transform">💳</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-serif-display text-[#E0A96D]">
                ₹{(kpi.total_spent ?? 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-[#FAF6F0]/40 mt-1">Lifetime total</div>
            </div>

            {/* Card 3: Total Saved */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-[#E0A96D]/40 rounded-2xl p-4 sm:p-5 transition-all duration-300 group hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#FAF6F0]/60 font-medium uppercase tracking-wider">Saved</span>
                <span className="text-xl group-hover:scale-110 transition-transform">🏷️</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-serif-display text-emerald-400">
                ₹{(kpi.total_saved ?? 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-[#FAF6F0]/40 mt-1">Discounts claimed</div>
            </div>

            {/* Card 4: Ratings Given */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-[#E0A96D]/40 rounded-2xl p-4 sm:p-5 transition-all duration-300 group hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#FAF6F0]/60 font-medium uppercase tracking-wider">Reviews</span>
                <span className="text-xl group-hover:scale-110 transition-transform">💬</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-serif-display text-[#FAF6F0]">
                {kpi.total_ratings ?? 0}
              </div>
              <div className="text-[11px] text-[#FAF6F0]/40 mt-1">Feedback given</div>
            </div>

            {/* Card 5: Average Rating */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-[#E0A96D]/40 rounded-2xl p-4 sm:p-5 transition-all duration-300 group hover:-translate-y-1 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#FAF6F0]/60 font-medium uppercase tracking-wider">Avg Score</span>
                <span className="text-xl text-amber-400 group-hover:scale-110 transition-transform">⭐</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-serif-display text-amber-400">
                {kpi.average_rating ? Number(kpi.average_rating).toFixed(1) : 'N/A'}
              </div>
              <div className="text-[11px] text-[#FAF6F0]/40 mt-1">Rating average</div>
            </div>
          </div>
        </div>

        {/* ── 3. TABS & DETAILED LISTS ── */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Tab Headers */}
          <div className="flex gap-2 sm:gap-4 border-b border-white/10 pb-4 mb-6">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#E0A96D] text-[#0F2922] shadow-[0_0_15px_rgba(224,169,109,0.4)]'
                  : 'text-[#FAF6F0]/70 hover:bg-white/5 hover:text-[#E0A96D]'
              }`}
            >
              <span>🧾 Order History</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'orders' ? 'bg-[#0F2922]/20 text-[#0F2922]' : 'bg-white/10 text-[#FAF6F0]/60'
              }`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ratings')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'ratings'
                  ? 'bg-[#E0A96D] text-[#0F2922] shadow-[0_0_15px_rgba(224,169,109,0.4)]'
                  : 'text-[#FAF6F0]/70 hover:bg-white/5 hover:text-[#E0A96D]'
              }`}
            >
              <span>⭐ My Reviews</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'ratings' ? 'bg-[#0F2922]/20 text-[#0F2922]' : 'bg-white/10 text-[#FAF6F0]/60'
              }`}>
                {ratings.length}
              </span>
            </button>
          </div>

          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div>
              {orders.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-4xl mb-3">🍽️</div>
                  <h3 className="text-lg font-semibold text-[#FAF6F0]">No Orders Found</h3>
                  <p className="text-xs text-[#FAF6F0]/50 mt-1 mb-4">You haven&apos;t placed any orders yet.</p>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2.5 rounded-full bg-[#E0A96D] text-[#0F2922] text-xs font-bold uppercase tracking-wider hover:bg-[#d49855] transition-colors"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord, idx) => (
                    <div
                      key={idx}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#E0A96D]">
                            Order #{idx + 1}
                          </span>
                          <span className="text-xs text-[#FAF6F0]/50">
                            {formatDate(ord.created_at)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#FAF6F0]/70 pt-1">
                          <div>Subtotal: <span className="font-semibold text-[#FAF6F0]">₹{ord.total_amount}</span></div>
                          {ord.discount > 0 && (
                            <div className="text-emerald-400">Discount: -₹{ord.discount}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                        <div className="text-right">
                          <div className="text-xs text-[#FAF6F0]/50 uppercase tracking-wider">Final Amount</div>
                          <div className="text-xl font-bold font-serif-display text-[#E0A96D]">
                            ₹{ord.final_amount}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RATINGS */}
          {activeTab === 'ratings' && (
            <div>
              {ratings.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-4xl mb-3">💬</div>
                  <h3 className="text-lg font-semibold text-[#FAF6F0]">No Ratings Yet</h3>
                  <p className="text-xs text-[#FAF6F0]/50 mt-1">Rate dishes from our menu to see them listed here!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ratings.map((rat, idx) => (
                    <div
                      key={idx}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="font-semibold text-base text-[#FAF6F0] line-clamp-1">
                            {rat.food_name || 'Dish Review'}
                          </h4>
                          <span className="text-xs text-[#FAF6F0]/40 flex-shrink-0">
                            {formatShortDate(rat.created_at)}
                          </span>
                        </div>

                        {/* Star display */}
                        <div className="flex items-center gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-sm ${star <= rat.rating ? 'text-amber-400' : 'text-white/20'}`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="text-xs font-bold text-[#E0A96D] ml-1.5">
                            {rat.rating}/5
                          </span>
                        </div>

                        {/* Review text */}
                        {rat.review ? (
                          <p className="text-xs text-[#FAF6F0]/80 leading-relaxed italic bg-black/20 p-3 rounded-xl border border-white/5">
                            &ldquo;{rat.review}&rdquo;
                          </p>
                        ) : (
                          <p className="text-xs text-[#FAF6F0]/40 font-light italic">
                            No written review provided
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Profile;
