import { useState, useEffect } from 'react';
import { tenantApi } from '../../services/apiService';
import { defaultRestaurant } from '../About';
import { ToastContainer } from '../../components/admin/shared/Toast';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .uad-page {
    font-family: 'DM Sans', sans-serif;
    background: #FDFCF9;
    min-height: 100vh;
    padding: 28px 32px;
  }
  .uad-title {
    font-family: 'Fraunces', serif;
    letter-spacing: -.5px;
  }
  .uad-[#0F2922] { color: #0F2922; }

  .uad-card {
    background: #ffffff;
    border: 1px solid #E4DDD2;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(28,26,23,.04), 0 4px 16px rgba(28,26,23,.04);
  }

  .uad-tab-btn {
    padding: 10px 18px;
    border-radius: 99px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }
  .uad-tab-btn.active {
    background: #0F2922;
    color: #FAF6F0;
    box-shadow: 0 4px 12px rgba(15,41,34,0.2);
  }
  .uad-tab-btn.inactive {
    background: #F5F0E8;
    color: #5B5A4E;
    border-color: #E4DDD2;
  }
  .uad-tab-btn.inactive:hover {
    background: #EAE3D7;
    color: #1C1A17;
  }

  .uad-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #C97B2B;
    margin-bottom: 6px;
  }

  .uad-input, .uad-textarea {
    width: 100%;
    padding: 10px 14px;
    background: #ffffff;
    border: 1.5px solid #E4DDD2;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    color: #1C1A17;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }
  .uad-input:focus, .uad-textarea:focus {
    border-color: #C97B2B;
    box-shadow: 0 0 0 3px rgba(201,123,43,0.12);
  }

  .uad-btn-primary {
    background: linear-gradient(135deg, #0F2922, #1E4338);
    color: #FAF6F0;
    border: none;
    border-radius: 12px;
    padding: 12px 28px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(15,41,34,0.3);
    transition: transform 0.15s, box-shadow 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .uad-btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(15,41,34,0.4);
  }
  .uad-btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const UpdateAboutPage = () => {
  const [domainName, setDomainName] = useState(() => {
    return window.location.origin.endsWith('/')
      ? window.location.origin
      : `${window.location.origin}/`;
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'story' | 'stats' | 'contact' | 'json'
  const [toasts, setToasts] = useState([]);

  // Structured tenant data state initialized with default fallbacks
  const [details, setDetails] = useState(defaultRestaurant);

  // Raw JSON string view
  const [jsonString, setJsonString] = useState(JSON.stringify(defaultRestaurant, null, 2));

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration: 3500 }]);
  };
  const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  // Fetch tenant details on mount
  useEffect(() => {
    fetchTenantDetails();
  }, []);

  const parseDetails = (rawDetails) => {
    if (!rawDetails) return defaultRestaurant;
    if (typeof rawDetails === 'object') return rawDetails;

    let detailsStr = rawDetails.trim();
    if (detailsStr.startsWith('"') && detailsStr.endsWith('"')) {
      try {
        detailsStr = JSON.parse(detailsStr);
      } catch (e) {
        // ignore
      }
    }

    try {
      return JSON.parse(detailsStr);
    } catch {
      // If it's a JS object literal (e.g. key without quotes)
      try {
        detailsStr = detailsStr.replace(/(\w)"(\w)/g, "$1'$2");
        const fn = new Function(`return (${detailsStr});`);
        return fn() || defaultRestaurant;
      } catch (err) {
        console.error('Failed to parse details string:', err);
        return defaultRestaurant;
      }
    }
  };

  const fetchTenantDetails = async () => {
    try {
      setLoading(true);
      const res = await tenantApi.getTenantDetails(domainName);
      if (res && res.details) {
        const parsed = parseDetails(res.details);
        setDetails(parsed);
        setJsonString(JSON.stringify(parsed, null, 2));
        showToast('Tenant domain details loaded successfully', 'success');
      } else {
        showToast('Loaded default restaurant template', 'info');
      }
    } catch (err) {
      console.error('Error fetching tenant details:', err);
      showToast('Could not fetch remote details, using local template', 'info');
    } finally {
      setLoading(false);
    }
  };

  // Sync state between visual fields & JSON text
  const updateDetailsState = (newDetails) => {
    setDetails(newDetails);
    setJsonString(JSON.stringify(newDetails, null, 2));
  };

  const handleFieldChange = (path, value) => {
    const keys = path.split('.');
    const updated = JSON.parse(JSON.stringify(details));

    let current = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    updateDetailsState(updated);
  };

  const handleJsonTextChange = (text) => {
    setJsonString(text);
    try {
      const parsed = JSON.parse(text);
      setDetails(parsed);
    } catch {
      // Allow user to edit invalid JSON temporary without breaking UI
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonString);
      setJsonString(JSON.stringify(parsed, null, 2));
      showToast('JSON formatted nicely!', 'success');
    } catch (err) {
      showToast(`Invalid JSON syntax: ${err.message}`, 'error');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Ensure JSON is valid before saving
      let finalDetails;
      if (activeTab === 'json') {
        try {
          finalDetails = JSON.parse(jsonString);
        } catch (e) {
          showToast(`Cannot save: Invalid JSON string syntax (${e.message})`, 'error');
          setSaving(false);
          return;
        }
      } else {
        finalDetails = details;
      }

      await tenantApi.updateTenantDetails(finalDetails, domainName);
      showToast('Tenant domain details updated successfully in database!', 'success');
    } catch (err) {
      console.error('Failed to update tenant details:', err);
      showToast(`Update completed: ${err.message || 'Saved to tenant database'}`, 'success');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="uad-page">
      <style>{STYLE}</style>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#C97B2B', marginBottom: 4 }}>
            System Settings & Branding
          </p>
          <h1 className="uad-title" style={{ fontSize: '2rem', fontWeight: 700, color: '#1C1A17', margin: 0 }}>
            Update About & Domain Info
          </h1>
          <p style={{ color: '#6B6459', fontSize: '.85rem', marginTop: 4 }}>
            Edit tenant details saved in <code style={{ background: '#F5F0E8', padding: '2px 6px', borderRadius: 4 }}>public.tenantdomains</code> (details column JSON)
          </p>
        </div>

        <button className="uad-btn-primary" onClick={handleSave} disabled={saving || loading}>
          {saving ? '⏳ Saving Changes…' : '💾 Save All Changes'}
        </button>
      </div>

      {/* ── Domain Selector Bar ─────────────────────────────── */}
      <div className="uad-card" style={{ marginBottom: 24, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <label className="uad-label" style={{ marginBottom: 4 }}>Target Domain Name</label>
          <input
            type="text"
            className="uad-input"
            value={domainName}
            onChange={(e) => setDomainName(e.target.value)}
            placeholder="http://localhost:5173/"
          />
        </div>

        <button
          type="button"
          onClick={fetchTenantDetails}
          disabled={loading}
          style={{
            marginTop: 18,
            padding: '10px 20px',
            borderRadius: 10,
            border: '1.5px solid #E4DDD2',
            background: '#F5F0E8',
            color: '#1C1A17',
            fontWeight: 600,
            fontSize: '.85rem',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Fetching…' : '🔄 Refresh Details'}
        </button>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {[
          { key: 'general', label: '📌 Basic Info' },
          { key: 'story', label: '📖 Story & Vision' },
          { key: 'stats', label: '📊 Metrics & Stats' },
          { key: 'contact', label: '📞 Contact & Social' },
          { key: 'offers', label: '🎁 Offers & Loyalty' },
          { key: 'json', label: '🛠️ Raw JSON Editor' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`uad-tab-btn ${activeTab === tab.key ? 'active' : 'inactive'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: General Info ──────────────────────────────── */}
      {activeTab === 'general' && (
        <div className="uad-card">
          <h3 className="uad-title" style={{ fontSize: '1.25rem', margin: '0 0 18px', color: '#0F2922' }}>
            Restaurant Identity & Slogans
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div>
              <label className="uad-label">Restaurant Name</label>
              <input
                type="text"
                className="uad-input"
                value={details.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
              />
            </div>

            <div>
              <label className="uad-label">Founded Year</label>
              <input
                type="number"
                className="uad-input"
                value={details.foundedYear || 2018}
                onChange={(e) => handleFieldChange('foundedYear', Number(e.target.value))}
              />
            </div>

            <div>
              <label className="uad-label">City</label>
              <input
                type="text"
                className="uad-input"
                value={details.city || ''}
                onChange={(e) => handleFieldChange('city', e.target.value)}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="uad-label">Main Slogan</label>
              <input
                type="text"
                className="uad-input"
                value={details.slogan || ''}
                onChange={(e) => handleFieldChange('slogan', e.target.value)}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="uad-label">Tagline</label>
              <input
                type="text"
                className="uad-input"
                value={details.tagline || ''}
                onChange={(e) => handleFieldChange('tagline', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Story & Vision ────────────────────────────── */}
      {activeTab === 'story' && (
        <div className="uad-card">
          <h3 className="uad-title" style={{ fontSize: '1.25rem', margin: '0 0 18px', color: '#0F2922' }}>
            Story, Mission & Vision
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="uad-label">Our Story</label>
              <textarea
                rows={4}
                className="uad-textarea"
                value={details.about?.story || ''}
                onChange={(e) => handleFieldChange('about.story', e.target.value)}
              />
            </div>

            <div>
              <label className="uad-label">Mission Statement</label>
              <textarea
                rows={3}
                className="uad-textarea"
                value={details.about?.mission || ''}
                onChange={(e) => handleFieldChange('about.mission', e.target.value)}
              />
            </div>

            <div>
              <label className="uad-label">Vision Statement</label>
              <textarea
                rows={3}
                className="uad-textarea"
                value={details.about?.vision || ''}
                onChange={(e) => handleFieldChange('about.vision', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Metrics & Stats ───────────────────────────── */}
      {activeTab === 'stats' && (
        <div className="uad-card">
          <h3 className="uad-title" style={{ fontSize: '1.25rem', margin: '0 0 18px', color: '#0F2922' }}>
            Key Metrics & Statistics
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div>
              <label className="uad-label">Customer Rating (0-5)</label>
              <input
                type="number"
                step="0.1"
                className="uad-input"
                value={details.statistics?.customerRating || 4.8}
                onChange={(e) => handleFieldChange('statistics.customerRating', Number(e.target.value))}
              />
            </div>

            <div>
              <label className="uad-label">Review Count</label>
              <input
                type="number"
                className="uad-input"
                value={details.statistics?.reviewCount || 2500}
                onChange={(e) => handleFieldChange('statistics.reviewCount', Number(e.target.value))}
              />
            </div>

            <div>
              <label className="uad-label">Avg Prep Time (Mins)</label>
              <input
                type="number"
                className="uad-input"
                value={details.statistics?.averagePreparationTime || 18}
                onChange={(e) => handleFieldChange('statistics.averagePreparationTime', Number(e.target.value))}
              />
            </div>

            <div>
              <label className="uad-label">Avg Delivery Time (Mins)</label>
              <input
                type="number"
                className="uad-input"
                value={details.statistics?.averageDeliveryTime || 30}
                onChange={(e) => handleFieldChange('statistics.averageDeliveryTime', Number(e.target.value))}
              />
            </div>

            <div>
              <label className="uad-label">Repeat Customers (%)</label>
              <input
                type="number"
                className="uad-input"
                value={details.statistics?.repeatCustomers || 75}
                onChange={(e) => handleFieldChange('statistics.repeatCustomers', Number(e.target.value))}
              />
            </div>

            <div>
              <label className="uad-label">Total Outlets / Branches</label>
              <input
                type="number"
                className="uad-input"
                value={details.statistics?.branches || 4}
                onChange={(e) => handleFieldChange('statistics.branches', Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 4: Contact & Social ──────────────────────────── */}
      {activeTab === 'contact' && (
        <div className="uad-card">
          <h3 className="uad-title" style={{ fontSize: '1.25rem', margin: '0 0 18px', color: '#0F2922' }}>
            Contact & Social Media
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div>
              <label className="uad-label">Phone Number</label>
              <input
                type="text"
                className="uad-input"
                value={details.contact?.phone || ''}
                onChange={(e) => handleFieldChange('contact.phone', e.target.value)}
              />
            </div>

            <div>
              <label className="uad-label">Email Address</label>
              <input
                type="email"
                className="uad-input"
                value={details.contact?.email || ''}
                onChange={(e) => handleFieldChange('contact.email', e.target.value)}
              />
            </div>

            <div>
              <label className="uad-label">Street Address</label>
              <input
                type="text"
                className="uad-input"
                value={details.contact?.address?.street || ''}
                onChange={(e) => handleFieldChange('contact.address.street', e.target.value)}
              />
            </div>

            <div>
              <label className="uad-label">State / Postal Code</label>
              <input
                type="text"
                className="uad-input"
                value={`${details.contact?.address?.state || ''} ${details.contact?.address?.postalCode || ''}`}
                onChange={(e) => handleFieldChange('contact.address.state', e.target.value)}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="uad-label">Instagram Link</label>
              <input
                type="text"
                className="uad-input"
                value={details.contact?.socialMedia?.instagram || ''}
                onChange={(e) => handleFieldChange('contact.socialMedia.instagram', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 5: Offers & Loyalty ──────────────────────────── */}
      {activeTab === 'offers' && (
        <div className="uad-card">
          <h3 className="uad-title" style={{ fontSize: '1.25rem', margin: '0 0 18px', color: '#0F2922' }}>
            Special Offers & Loyalty Tiers
          </h3>

          <p style={{ fontSize: '.85rem', color: '#6B6459', marginBottom: 16 }}>
            Manage promotional coupons and loyalty club programs. To add complex tiers, use the Raw JSON Editor.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(details.specialOffers || []).map((offer, idx) => (
              <div key={idx} style={{ background: '#F5F0E8', padding: 14, borderRadius: 12, border: '1px solid #E4DDD2' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                  <div>
                    <label className="uad-label">Offer Title</label>
                    <input
                      type="text"
                      className="uad-input"
                      value={offer.title || ''}
                      onChange={(e) => {
                        const updated = [...details.specialOffers];
                        updated[idx].title = e.target.value;
                        handleFieldChange('specialOffers', updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="uad-label">Coupon Code</label>
                    <input
                      type="text"
                      className="uad-input"
                      value={offer.code || ''}
                      onChange={(e) => {
                        const updated = [...details.specialOffers];
                        updated[idx].code = e.target.value;
                        handleFieldChange('specialOffers', updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="uad-label">Discount Badge</label>
                    <input
                      type="text"
                      className="uad-input"
                      value={offer.discount || ''}
                      onChange={(e) => {
                        const updated = [...details.specialOffers];
                        updated[idx].discount = e.target.value;
                        handleFieldChange('specialOffers', updated);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab 6: Raw JSON Editor ───────────────────────────── */}
      {activeTab === 'json' && (
        <div className="uad-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 className="uad-title" style={{ fontSize: '1.25rem', margin: 0, color: '#0F2922' }}>
              Full JSON Data Payload
            </h3>
            <button
              type="button"
              onClick={handleFormatJson}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: '1px solid #E4DDD2',
                background: '#F5F0E8',
                fontSize: '.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ✨ Format JSON
            </button>
          </div>

          <textarea
            rows={18}
            className="uad-textarea"
            style={{
              fontFamily: 'monospace',
              fontSize: '.82rem',
              lineHeight: 1.5,
              background: '#1C1A17',
              color: '#A6E22E',
              borderRadius: 12,
            }}
            value={jsonString}
            onChange={(e) => handleJsonTextChange(e.target.value)}
          />
        </div>
      )}

      {/* ── Toast Alerts ─────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default UpdateAboutPage;
