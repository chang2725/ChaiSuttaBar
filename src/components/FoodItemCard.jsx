import { useState, useEffect } from "react";
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, ratingsApi } from '../services/apiService';

/* ─────────────────────────────────────────────
   FoodItemCard — Mobile-first, fully interactive with cart integration
   Props: item (object)
─────────────────────────────────────────── */
const FoodItemCard = ({ item = {} }) => {
  const navigate = useNavigate();
  const { addItem, updateQuantity: updateCartQuantity, removeItem, cart } = useCart();

  const {
    id,
    name = "Unnamed Item",
    description = "No description available",
    price = 0,
    image,
    isVegan = false,
    isGlutenFree = false,
    spiceLevel = 0,
    preparationTime,
    calories,
    isAvailable = true,
    categories = [],
    ingredients = [],
    allergens = [],
    averageRating = 0,
    reviewCount = 0,
    isNew = false,
    isHot = false,
  } = item;

  // Get current quantity from cart
  const currentCartItem = cart.items.find(cartItem => cartItem.foodItemId === id);
  const cartQuantity = currentCartItem ? currentCartItem.quantity : 0;

  const [qty, setQty] = useState(cartQuantity);
  const [wishlisted, setWish] = useState(false);
  const [ingrOpen, setIngrOpen] = useState(false);
  const [alrgOpen, setAlrgOpen] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const [imgModal, setImgModal] = useState(false);

  // Rating modal state
  const [rateModal, setRateModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingFeedback, setRatingFeedback] = useState(null);

  // Ratings & Reviews GET endpoint state
  const [ratingsData, setRatingsData] = useState(null);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'write'
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'highest' | 'lowest'
  const [hoverStar, setHoverStar] = useState(0);

  const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };
  const MAX_REVIEW_LEN = 500;

  // Sync quantity with cart changes
  useEffect(() => {
    setQty(cartQuantity);
  }, [cartQuantity]);

  // Fetch reviews when rating modal opens
  const fetchRatings = async () => {
    setLoadingRatings(true);
    try {
      const data = await ratingsApi.getByFoodItemId(id);
      setRatingsData(data);
    } catch (err) {
      console.error('Error fetching food item ratings:', err);
    } finally {
      setLoadingRatings(false);
    }
  };

  useEffect(() => {
    if (rateModal) {
      fetchRatings();
    }
  }, [rateModal, id]);

  // Close the rating modal on Escape, and reset transient UI state whenever it opens
  useEffect(() => {
    if (!rateModal) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setRateModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    setSortBy('recent');
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [rateModal]);

  const reviews = ratingsData?.reviews || [];

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'lowest') return (a.rating || 0) - (b.rating || 0);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  // Client-side rating distribution (1-5 stars) for the trust bar
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return { star, count, pct: reviews.length ? Math.round((count / reviews.length) * 100) : 0 };
  });

  const initials = (fullName) => {
    const clean = (fullName || 'Guest').trim();
    const parts = clean.split(' ').filter(Boolean);
    return ((parts[0]?.[0] || 'G') + (parts[1]?.[0] || '')).toUpperCase();
  };

  const avatarColor = (fullName) => {
    const palette = ['#D96B27', '#2E7D32', '#1565C0', '#7C2D12', '#B8860B', '#6D28D9'];
    const str = fullName || 'Guest';
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
  };

  const relativeTime = (dateStr) => {
    if (!dateStr) return '';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diffMs / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  const fmtTime = (m) => {
    if (!m || isNaN(m)) return "Varies";
    return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}`;
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      navigate('/');
      return;
    }

    setRatingSubmitting(true);
    setRatingFeedback(null);

    try {
      const res = await ratingsApi.submitRating({
        foodItemId: id,
        rating: userRating,
        review: reviewText,
      });

      setRatingFeedback({
        type: 'success',
        text: res.message || 'Rating submitted successfully!',
      });

      // Refresh reviews from GET endpoint
      fetchRatings();
      setTimeout(() => {
        setRatingFeedback(null);
        setReviewText('');
        setActiveTab('reviews');
      }, 1500);
      window.location.reload();
    } catch (err) {
      console.error('Failed to submit rating:', err);
      let msg = err.message || 'Failed to submit rating';
      if (
        msg.includes('duplicate key value violates unique constraint') ||
        msg.includes('ratings_tenant_id_food_item_id_user_id_key')
      ) {
        msg = 'You have already rated this item.';
      }
      setRatingFeedback({
        type: 'error',
        text: msg,
      });
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleQuantityChange = (newQty) => {
    if (!isAuthenticated()) {
      navigate('/');
      return;
    }

    const cartIndex = cart.items.findIndex(
      cartItem => cartItem.foodItemId === id
    );

    if (newQty <= 0) {
      // Remove from cart
      if (cartIndex > -1) {
        removeItem(cartIndex);
      }
    } else if (newQty > qty) {
      // Adding items to cart
      const quantityToAdd = newQty - qty;
      addItem(item, quantityToAdd);
    } else if (newQty < qty && cartIndex > -1) {
      // Decreasing quantity
      updateCartQuantity(cartIndex, newQty);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated()) {
      navigate('/');
      return;
    }

    addItem(item, 1);
  };

  return (
    <div style={{
      background: "#fff",
      borderRadius: 24,
      overflow: "hidden",
      border: "1px solid #efefef",
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>

      {/* ── Image Lightbox Modal ── */}
      {imgModal && image && !imgErr && (
        <div
          onClick={() => setImgModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, cursor: 'zoom-out',
          }}
        >
          <button
            onClick={() => setImgModal(false)}
            style={{
              position: 'absolute', top: 18, right: 18,
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)',
              color: '#fff', fontSize: 20, lineHeight: 1,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Close image"
          >✕</button>
          <img
            src={image}
            alt={name}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '100%', maxHeight: '90vh',
              borderRadius: 16, objectFit: 'contain',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
              cursor: 'default',
            }}
          />
          <div style={{
            position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", pointerEvents: 'none',
          }}>{name}</div>
        </div>
      )}

      {rateModal && (
        <div
          onClick={() => setRateModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(20,16,14,0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          <style>{`
            @keyframes ftcModalIn {
              from { opacity: 0; transform: translateY(14px) scale(0.97); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes ftcFadeIn {
              from { opacity: 0; transform: translateY(6px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes ftcShimmer {
              0% { background-position: -200px 0; }
              100% { background-position: 200px 0; }
            }
            @keyframes ftcPulse {
              0% { transform: scale(0.6); opacity: 0; }
              60% { transform: scale(1.12); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes ftcSpin {
              to { transform: rotate(360deg); }
            }
            .ftc-skeleton {
              background: linear-gradient(90deg, #f0f0f0 0%, #f7f7f7 50%, #f0f0f0 100%);
              background-size: 400px 100%;
              animation: ftcShimmer 1.4s ease-in-out infinite;
              border-radius: 16px;
            }
            .ftc-review-card { animation: ftcFadeIn 0.35s ease both; }
            .ftc-star-btn:focus-visible, .ftc-icon-btn:focus-visible, .ftc-sort-btn:focus-visible {
              outline: 2px solid #D96B27; outline-offset: 2px;
            }
          `}</style>

          <div
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Ratings and reviews for ${name}`}
            style={{
              background: '#fff',
              borderRadius: 28,
              padding: 26,
              maxWidth: 600,
              width: '100%',
              maxHeight: '75vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 30px 90px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.06)',
              position: 'relative',
              fontFamily: "'Outfit', 'DM Sans', sans-serif",
              animation: 'ftcModalIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: 21, fontWeight: 700, color: '#1a1a1a', letterSpacing: -0.3 }}>
                  {name}
                </h3>
                <div style={{ fontSize: 13, color: '#777', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#f5a623', fontSize: 14 }}>★</span>
                  <span style={{ fontWeight: 700, color: '#222' }}>
                    {(ratingsData?.avgRating ?? averageRating).toFixed(1)}
                  </span>
                  <span style={{ color: '#ccc' }}>•</span>
                  <span>{ratingsData?.reviewCount ?? reviewCount} Customer Reviews</span>
                </div>
              </div>
              <button
                className="ftc-icon-btn"
                onClick={() => setRateModal(false)}
                aria-label="Close ratings dialog"
                style={{
                  background: '#f5f5f5', border: 'none',
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  fontSize: 15, color: '#555', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s ease, transform 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ececec'; e.currentTarget.style.transform = 'rotate(90deg)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.transform = 'rotate(0deg)'; }}
              >✕</button>
            </div>


            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: 6, background: '#f7f7f7', borderRadius: 14, padding: 4, marginBottom: 14 }}>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 11,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeTab === 'reviews' ? '#fff' : 'transparent',
                  color: activeTab === 'reviews' ? '#D96B27' : '#888',
                  boxShadow: activeTab === 'reviews' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                Customer Reviews ({ratingsData?.reviewCount ?? reviewCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 11,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeTab === 'write' ? '#fff' : 'transparent',
                  color: activeTab === 'write' ? '#D96B27' : '#888',
                  boxShadow: activeTab === 'write' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                + Write a Review
              </button>
            </div>

            {/* Sort control — only meaningful once there's something to sort */}
            {activeTab === 'reviews' && reviews.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: '#aaa', fontWeight: 500 }}>Sort:</span>
                {[
                  { key: 'recent', label: 'Newest' },
                  { key: 'highest', label: 'Highest' },
                  { key: 'lowest', label: 'Lowest' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    className="ftc-sort-btn"
                    onClick={() => setSortBy(opt.key)}
                    style={{
                      padding: '5px 11px',
                      borderRadius: 100,
                      border: sortBy === opt.key ? '1px solid #D96B27' : '1px solid #e5e5e5',
                      background: sortBy === opt.key ? '#FFF3EB' : '#fff',
                      color: sortBy === opt.key ? '#D96B27' : '#777',
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Modal Body / Tab Content */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
              {activeTab === 'reviews' ? (
                <div>
                  {/* Rating distribution — compact horizontal trust summary */}
                  {reviews.length > 0 && !loadingRatings && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: '#fafafa', border: '1px solid #f0f0f0',
                      borderRadius: 14, padding: '10px 14px', marginBottom: 12,
                    }}>
                      <div style={{ textAlign: 'center', paddingRight: 14, borderRight: '1px solid #eaeaea', flexShrink: 0 }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', lineHeight: 1 }}>
                          {(ratingsData?.avgRating ?? averageRating).toFixed(1)}
                        </div>
                        <div style={{ color: '#f5a623', fontSize: 11, margin: '3px 0 2px' }}>★★★★★</div>
                        <div style={{ fontSize: 10, color: '#888', fontWeight: 600 }}>
                          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                        </div>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {distribution.map(({ star, count, pct }) => (
                          <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: '#777', width: 8 }}>{star}</span>
                            <div style={{ flex: 1, height: 4, borderRadius: 100, background: '#ececec', overflow: 'hidden' }}>
                              <div style={{
                                width: `${pct}%`, height: '100%', borderRadius: 100,
                                background: '#f5a623', transition: 'width 0.4s ease',
                              }} />
                            </div>
                            <span style={{ fontSize: 9.5, color: '#aaa', minWidth: 16, textAlign: 'right' }}>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {loadingRatings ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} className="ftc-skeleton" style={{ height: 74 }} />
                      ))}
                    </div>
                  ) : sortedReviews.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {sortedReviews.map((rev, idx) => (
                        <div
                          key={rev.id ?? idx}
                          className="ftc-review-card"
                          style={{
                            background: '#fafafa',
                            borderRadius: 16,
                            padding: '14px 16px',
                            border: '1px solid #f0f0f0',
                            transition: 'border-color 0.15s ease',
                            animationDelay: `${Math.min(idx, 6) * 40}ms`,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                              background: avatarColor(rev.name), color: '#fff',
                              fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {initials(rev.name)}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {rev.name || 'Guest'}
                                </span>
                                <span style={{ fontSize: 10.5, color: '#aaa', flexShrink: 0 }}>
                                  {relativeTime(rev.createdAt)}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 6 }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    style={{ fontSize: 13, color: star <= rev.rating ? '#f5a623' : '#e5e5e5' }}
                                  >
                                    ★
                                  </span>
                                ))}
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#333', marginLeft: 4 }}>
                                  {rev.rating}/5
                                </span>
                              </div>

                              {rev.review ? (
                                <p style={{ margin: 0, fontSize: 13.5, color: '#3d3d3d', lineHeight: 1.55, wordBreak: 'break-word' }}>
                                  {rev.review}
                                </p>
                              ) : (
                                <p style={{ margin: 0, fontSize: 12, color: '#aaa', fontStyle: 'italic' }}>
                                  Rating submitted without text
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '36px 16px', background: '#fafafa', borderRadius: 18 }}>
                      <div style={{ fontSize: 34, marginBottom: 10 }}>💬</div>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: '#333' }}>No reviews yet</div>
                      <div style={{ fontSize: 12.5, color: '#888', marginTop: 4 }}>Be the first to share your experience!</div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('write')}
                        style={{
                          marginTop: 16,
                          padding: '9px 20px',
                          borderRadius: 20,
                          border: '1px solid #D96B27',
                          background: '#fff',
                          color: '#D96B27',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FFF3EB'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                      >
                        Rate Dish
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleRatingSubmit} style={{ animation: 'ftcFadeIn 0.25s ease both' }}>
                  {/* Star rating selector */}
                  <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Your Rating
                    </label>
                    <div
                      style={{ display: 'flex', justifyContent: 'center', gap: 8 }}
                      onMouseLeave={() => setHoverStar(0)}
                    >
                      {[1, 2, 3, 4, 5].map((star) => {
                        const filled = star <= (hoverStar || userRating);
                        return (
                          <button
                            key={star}
                            type="button"
                            className="ftc-star-btn"
                            onClick={() => setUserRating(star)}
                            onMouseEnter={() => setHoverStar(star)}
                            aria-label={`Rate ${star} out of 5 stars`}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: 34,
                              cursor: 'pointer',
                              color: filled ? '#f5a623' : '#e5e5e5',
                              transition: 'transform 0.15s ease, color 0.15s ease',
                              padding: 2,
                              transform: filled && star === (hoverStar || userRating) ? 'scale(1.15)' : 'scale(1)',
                            }}
                          >
                            ★
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#D96B27', marginTop: 6, minHeight: 16 }}>
                      {RATING_LABELS[hoverStar || userRating]}
                    </div>
                  </div>

                  {/* Review input */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#444' }}>
                        Review (Optional)
                      </label>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: reviewText.length > MAX_REVIEW_LEN - 40 ? '#D96B27' : '#bbb',
                      }}>
                        {reviewText.length}/{MAX_REVIEW_LEN}
                      </span>
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value.slice(0, MAX_REVIEW_LEN))}
                      placeholder="Share your thoughts about taste, quality, portion..."
                      rows={3}
                      maxLength={MAX_REVIEW_LEN}
                      style={{
                        width: '100%',
                        padding: '11px 13px',
                        borderRadius: 14,
                        border: '1px solid #e2e2e2',
                        fontSize: 13.5,
                        fontFamily: 'inherit',
                        resize: 'none',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s ease',
                      }}
                      onFocus={e => e.target.style.borderColor = '#D96B27'}
                      onBlur={e => e.target.style.borderColor = '#e2e2e2'}
                    />
                  </div>

                  {/* Feedback alert */}
                  {ratingFeedback && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '11px 14px',
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 500,
                      marginBottom: 16,
                      background: ratingFeedback.type === 'success' ? '#e8f5e9' : '#ffebee',
                      color: ratingFeedback.type === 'success' ? '#2e7d32' : '#c62828',
                      border: `1px solid ${ratingFeedback.type === 'success' ? '#a5d6a7' : '#ef9a9a'}`,
                      animation: 'ftcFadeIn 0.2s ease both',
                    }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0, fontSize: 11, fontWeight: 700,
                        color: '#fff',
                        background: ratingFeedback.type === 'success' ? '#2e7d32' : '#c62828',
                        animation: 'ftcPulse 0.35s ease both',
                      }}>
                        {ratingFeedback.type === 'success' ? '✓' : '!'}
                      </span>
                      {ratingFeedback.text}
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={ratingSubmitting}
                    style={{
                      width: '100%',
                      padding: '13px',
                      borderRadius: 14,
                      border: 'none',
                      background: '#D96B27',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: ratingSubmitting ? 'not-allowed' : 'pointer',
                      opacity: ratingSubmitting ? 0.7 : 1,
                      boxShadow: '0 4px 14px rgba(217,107,39,0.3)',
                      transition: 'background 0.2s ease, transform 0.1s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {ratingSubmitting && (
                      <span style={{
                        width: 14, height: 14, borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff',
                        display: 'inline-block', animation: 'ftcSpin 0.6s linear infinite',
                      }} />
                    )}
                    {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ── Image ── */}
      <div style={{ position: "relative", height: 200, background: "#f0eeea", overflow: "hidden" }}>
        {image && !imgErr ? (
          <img src={image} alt={name} onError={() => setImgErr(true)}
            onClick={() => setImgModal(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", cursor: 'zoom-in' }} />
        ) : (
          <div style={{
            width: "100%", height: "100%", display: "flex", alignItems: "center",
            justifyContent: "center", background: "#f0eeea"
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="#ccc" strokeWidth="1.2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="#ccc" />
              <path d="M21 15l-5-5L5 21" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {/* gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(160deg,transparent 40%,rgba(0,0,0,.18) 100%)",
          pointerEvents: "none"
        }} />

        {/* Tags */}
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
          {isHot && <span style={tagStyle("#fff3e0", "#e65100")}>🔥 Hot</span>}
          {isVegan && <span style={tagStyle("#e8f5e9", "#2e7d32")}>🌱 Vegan</span>}
          {isGlutenFree && <span style={tagStyle("#f3e8ff", "#7c2d12")}>🌾 Gluten-Free</span>}
          {isNew && <span style={tagStyle("#e3f2fd", "#1565c0")}>✨ New</span>}
        </div>

        {/* Wishlist */}
        <button onClick={() => setWish(w => !w)} style={{
          position: "absolute", top: 12, right: 12,
          width: 38, height: 38,
          background: "rgba(255,255,255,.9)",
          border: "none", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", WebkitTapHighlightColor: "transparent",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={wishlisted ? "#ef4444" : "none"}
            stroke={wishlisted ? "#ef4444" : "#555"}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>

        {/* Rating pill */}
        <div
          onClick={() => {
            if (!isAuthenticated()) {
              navigate('/');
              return;
            }
            setRateModal(true);
          }}
          title="Click to rate this item"
          style={{
            position: "absolute", bottom: 12, left: 12,
            background: "rgba(255,255,255,.92)", backdropFilter: "blur(8px)",
            borderRadius: 100, padding: "5px 10px",
            display: "flex", alignItems: "center", gap: 5,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "transform 0.2s ease",
          }}
        >
          <span style={{ color: "#f5a623", fontSize: 12 }}>★</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#222" }}>{averageRating.toFixed(1)}</span>
          {reviewCount > 0 && <span style={{ fontSize: 10, color: "#aaa" }}>({reviewCount})</span>}
          <span style={{ fontSize: 10, color: "#D96B27", fontWeight: 700, marginLeft: 2 }}>• Rate</span>
        </div>

        {/* Time pill */}
        <div style={{
          position: "absolute", bottom: 12, right: 12,
          background: "rgba(255,255,255,.92)", backdropFilter: "blur(8px)",
          borderRadius: 100, padding: "5px 10px",
          display: "flex", alignItems: "center", gap: 4,
          fontSize: 11, fontWeight: 500, color: "#555",
        }}>
          <svg width="11" height="11" viewBox="0 0 20 20" fill="#888">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
          </svg>
          {fmtTime(preparationTime)}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: 16 }}>

        {/* Name + Price */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 700, color: "#111", lineHeight: 1.2, flex: 1, marginRight: 10 }}>
            {name}
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: "#111", whiteSpace: "nowrap" }}>
            ₹{price.toFixed(2)}
          </div>
        </div>
        <p
          style={{
            maxHeight: "98px",
            overflowY: "auto",
            scrollBehavior: "smooth",
          }}
        >
          {description}
        </p>

        {/* Categories */}
        {categories.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
            {categories.map((category, i) => (
              <span key={i} style={{
                fontSize: 10.5, fontWeight: 500, padding: "3px 8px",
                borderRadius: 100, background: "#f8fafc", color: "#475569",
                border: "1px solid #e2e8f0"
              }}>
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Info Row: Spice & Calories */}
        {(spiceLevel > 0 || calories) && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            {spiceLevel > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10.5, fontWeight: 500, color: "#bbb", textTransform: "uppercase", letterSpacing: ".8px" }}>Spice</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: i < spiceLevel ? "#f5a623" : "#e8e8e8"
                    }} />
                  ))}
                </div>
              </div>
            )}
            {calories && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10.5, fontWeight: 500, color: "#bbb", textTransform: "uppercase", letterSpacing: ".8px" }}>Calories</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>{calories}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ height: 1, background: "#f4f4f4", marginBottom: 12 }} />

        {/* Ingredients accordion */}
        {ingredients.length > 0 && (
          <>
            <div onClick={() => setIngrOpen(o => !o)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", padding: "2px 0", marginBottom: 4
              }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#bbb", textTransform: "uppercase", letterSpacing: ".8px" }}>
                Ingredients ({ingredients.length})
              </span>
              <span style={{
                fontSize: 16, color: "#ccc", transform: ingrOpen ? "rotate(180deg)" : "rotate(0deg)",
                display: "inline-block", transition: "transform .25s"
              }}>⌄</span>
            </div>
            {ingrOpen && (
              <p style={{ fontSize: 11.5, color: "#aaa", lineHeight: 1.65, paddingBottom: 8 }}>
                {ingredients.join(", ")}
              </p>
            )}
          </>
        )}

        {/* Allergens accordion */}
        {allergens.length > 0 && (
          <>
            <div onClick={() => setAlrgOpen(o => !o)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", padding: "2px 0", marginBottom: 4
              }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#bbb", textTransform: "uppercase", letterSpacing: ".8px" }}>
                Allergens ({allergens.length})
              </span>
              <span style={{
                fontSize: 16, color: "#ccc", transform: alrgOpen ? "rotate(180deg)" : "rotate(0deg)",
                display: "inline-block", transition: "transform .25s"
              }}>⌄</span>
            </div>
            {alrgOpen && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, paddingBottom: 8 }}>
                {allergens.map((a, i) => (
                  <span key={i} style={{
                    fontSize: 10.5, fontWeight: 500, padding: "3px 10px",
                    borderRadius: 100, background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa"
                  }}>
                    ⚠️ {a}
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        <div style={{ height: 1, background: "#f4f4f4", margin: "8px 0 12px" }} />

        {/* Quantity Selector - Full Width */}
        <div style={{ opacity: isAvailable ? 1 : 0.4 }}>
          {qty === 0 ? (
            // Add to Cart Button  
            <div>
              <button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                style={{
                  width: '100%',
                  height: 42,
                  border: 'none',
                  borderRadius: 13,
                  background: !isAvailable ? '#f0f0f0' : '#111',
                  color: !isAvailable ? '#bbb' : '#fff',
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  letterSpacing: '.4px',
                  transition: 'background .2s',
                }}
              >
                {!isAvailable ? 'Not Available' : '+ Add to Cart'}
              </button>
            </div>
          ) : (
            // Quantity Controls
            <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: 13, overflow: 'hidden' }}>
              <button
                onClick={() => handleQuantityChange(Math.max(0, qty - 1))}
                disabled={!isAvailable}
                style={{
                  width: 42,
                  height: 42,
                  border: 'none',
                  background: 'none',
                  fontSize: 20,
                  color: '#555',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 300
                }}
              >
                −
              </button>
              <div style={{
                flex: 1,
                textAlign: 'center',
                fontFamily: "'Syne',sans-serif",
                fontSize: 15,
                fontWeight: 700,
                color: '#111',
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <span>{qty}</span>
                <span style={{ fontSize: 12, color: '#666' }}>·</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#666' }}>
                  ₹{(price * qty).toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => handleQuantityChange(qty + 1)}
                disabled={!isAvailable}
                style={{
                  width: 42,
                  height: 42,
                  border: 'none',
                  background: 'none',
                  fontSize: 20,
                  color: '#555',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 300
                }}
              >
                +
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const tagStyle = (bg, color) => ({
  fontSize: 10, fontWeight: 600, padding: "4px 10px",
  borderRadius: 100, letterSpacing: ".4px",
  textTransform: "uppercase", background: bg, color,
});

export default FoodItemCard;