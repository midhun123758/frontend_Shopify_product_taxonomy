import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { 
  FiArrowLeft, FiTag, FiImage, FiCpu, FiCheckCircle, FiEdit3, 
  FiChevronRight, FiList, FiCheck, FiInfo, FiLayers, FiCompass 
} from 'react-icons/fi';

const ProductAnalysis = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getProductDetail(productId);
        setProduct(data);
      } catch (e) {
        console.error(e);
        setError('Failed to load product AI analysis.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
      <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
      Loading product AI analysis...
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#f87171' }}>{error}</div>
  );

  if (!product) return null;

  const family = product.family || {};
  const confidencePct = family.confidence_score ? (family.confidence_score * 100).toFixed(0) : null;
  const attributes = family.extracted_attributes || {};

  const handleManualSave = async () => {
    if (!customCategory.trim()) return;
    try {
      setSaving(true);
      await api.updateProductCategory(family.id, customCategory.trim());
      setSaveSuccess(true);
      setIsEditing(false);
      // Refresh detail
      const updated = await api.getProductDetail(productId);
      setProduct(updated);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      alert('Failed to update category: ' + (e.response?.data?.error || e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="slide-up" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#4b5563', fontSize: '0.88rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/catalog')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#ffffff', border: '1px solid #cbd5e1',
            color: '#1f2937', padding: '6px 14px', borderRadius: '8px',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
          }}
        >
          <FiArrowLeft /> Catalog
        </button>
        <FiChevronRight size={14} color="#6b7280" />
        {family.id && (
          <>
            <button
              onClick={() => navigate(`/families/${family.id}`)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#ffffff', border: '1px solid #cbd5e1',
                color: '#1f2937', padding: '6px 14px', borderRadius: '8px',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
              }}
            >
              <FiLayers size={12} /> {family.normalized_title || `Family #${family.id}`}
            </button>
            <FiChevronRight size={14} color="#6b7280" />
          </>
        )}
        <span style={{ color: '#111827', fontWeight: 800 }}>Product #{product.id}</span>
      </div>

      {saveSuccess && (
        <div style={{ background: '#e6f4ea', border: '1px solid #008060', color: '#008060', padding: '12px 20px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
          <FiCheckCircle size={18} /> Category updated successfully!
        </div>
      )}

      {/* Grid Layout: Left = Product Info, Right = AI Reasoning & Attributes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Product Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ background: '#ffffff', border: '1px solid #e1e3e5' }}>
            {/* Product Image */}
            <div style={{ width: '100%', height: '260px', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc', marginBottom: '20px', border: '1px solid #e1e3e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {product.image_url ? (
                <img src={product.image_url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#6d7175' }}>
                  <FiImage size={48} />
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', fontWeight: 600 }}>No Product Image</div>
                </div>
              )}
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.35rem', color: '#111827', fontWeight: 800 }}>
              {product.title}
            </h3>

            {product.color && (
              <div style={{ marginBottom: '14px' }}>
                <span style={{ background: '#e6f4ea', color: '#008060', padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(0,128,96,0.3)' }}>
                  Color: {product.color}
                </span>
              </div>
            )}

            <div style={{ borderTop: '1px solid #e1e3e5', paddingTop: '16px', marginTop: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                Product Description
              </div>
              <p style={{ color: '#1f2937', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, maxHeight: '180px', overflowY: 'auto', fontWeight: 500 }}>
                {product.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis & Manual Review */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* AI Taxonomy Card */}
          <div className="glass-card" style={{ background: '#ffffff', border: '1px solid #008060', boxShadow: '0 4px 16px rgba(0,128,96,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#008060' }}>
                  <FiCpu size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#111827', fontWeight: 800 }}>AI Taxonomy Prediction</h3>
                  <span style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>Shopify Standard Product Taxonomy</span>
                </div>
              </div>

              {confidencePct && (
                <span style={{
                  padding: '5px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800,
                  background: confidencePct >= 90 ? '#e6f4ea' : '#fef3c7',
                  color: confidencePct >= 90 ? '#008060' : '#b25900',
                  border: confidencePct >= 90 ? '1px solid #008060' : '1px solid #b25900'
                }}>
                  {confidencePct}% Match
                </span>
              )}
            </div>

            {/* Current Predicted Category */}
            <div style={{ background: '#f0fdf4', border: '1.5px solid #008060', padding: '18px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#008060', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                    PREDICTED CATEGORY PATH
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', lineHeight: '1.3' }}>
                    {family.predicted_category_name || 'Not Classified Yet'}
                  </div>
                  {family.predicted_category && (
                    <div style={{ fontSize: '0.82rem', color: '#4b5563', marginTop: '6px', fontWeight: 600 }}>
                      Taxonomy Node ID: <code style={{ color: '#008060', fontWeight: 800, background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>{family.predicted_category}</code>
                    </div>
                  )}
                </div>
                {family.predicted_category && (
                  <button
                    onClick={() => navigate(`/wayfinder?id=${family.predicted_category}`)}
                    style={{
                      background: '#008060', border: 'none',
                      color: '#ffffff', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem',
                      display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(0,128,96,0.3)'
                    }}
                  >
                    <FiCompass /> Wayfinder
                  </button>
                )}
              </div>
            </div>

            {/* Extracted Attributes section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
                EXTRACTED PRODUCT ATTRIBUTES
              </div>

              {Object.keys(attributes).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                  {Object.entries(attributes).map(([key, val]) => (
                    <div key={key} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '12px 14px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.78rem', color: '#4b5563', textTransform: 'capitalize', fontWeight: 700 }}>{key.replace('_', ' ')}</div>
                      <div style={{ fontSize: '1rem', color: '#000000', fontWeight: 800, marginTop: '3px' }}>{String(val)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#6b7280', fontSize: '0.88rem', fontStyle: 'italic', fontWeight: 500 }}>
                  No attributes extracted. Run classification to extract product features.
                </div>
              )}
            </div>

            {/* AI Alternative Suggestions Section */}
            {family.alternative_suggestions && family.alternative_suggestions.length > 0 && (
              <div style={{ marginBottom: '20px', background: '#fffbeb', border: '1.5px solid #fcd34d', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#b25900', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px' }}>
                  <FiList size={16} /> AI SUGGESTED CATEGORIES (CLICK TO APPLY)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {family.alternative_suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={async () => {
                        try {
                          setSaving(true);
                          await api.updateProductCategory(family.id, suggestion);
                          setSaveSuccess(true);
                          const updated = await api.getProductDetail(productId);
                          setProduct(updated);
                          setTimeout(() => setSaveSuccess(false), 4000);
                        } catch (e) {
                          alert('Failed to update category: ' + (e.response?.data?.error || e.message));
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={saving}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: '#ffffff', border: '1.5px solid #cbd5e1',
                        borderRadius: '10px', padding: '10px 14px', color: '#000000',
                        cursor: saving ? 'wait' : 'pointer', fontSize: '0.92rem', textAlign: 'left',
                        transition: 'all 0.15s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f0fdf4';
                        e.currentTarget.style.borderColor = '#008060';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }}
                    >
                      <span style={{ fontWeight: 800, color: '#000000' }}>{suggestion}</span>
                      <span style={{ fontSize: '0.8rem', background: '#008060', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontWeight: 800 }}>
                        + Apply
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Review / Re-categorization Box */}
            <div style={{ borderTop: '1px solid #e1e3e5', paddingTop: '16px', marginTop: '16px' }}>
              {!isEditing ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', color: '#4b5563', fontWeight: 600 }}>Need a custom category?</span>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: '#ffffff', border: '1px solid #cbd5e1',
                      color: '#111827', padding: '8px 16px', borderRadius: '8px',
                      cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700
                    }}
                  >
                    <FiEdit3 size={14} /> Type Custom Category
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
                    Manually Assign Category Path
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Furniture > Tables > Side Tables"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px',
                      background: '#ffffff', border: '1.5px solid #008060',
                      color: '#000000', fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setIsEditing(false)}
                      style={{
                        background: 'transparent', border: '1px solid #cbd5e1',
                        color: '#4b5563', padding: '6px 12px', borderRadius: '6px',
                        cursor: 'pointer', fontSize: '0.83rem', fontWeight: 600
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleManualSave}
                      disabled={saving || !customCategory.trim()}
                      style={{
                        background: '#008060', border: 'none',
                        color: '#fff', padding: '6px 16px', borderRadius: '6px',
                        cursor: saving ? 'wait' : 'pointer', fontSize: '0.83rem', fontWeight: 800,
                        opacity: !customCategory.trim() ? 0.5 : 1
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Category'}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductAnalysis;
