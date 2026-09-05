import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { 
  FiArrowLeft, FiTag, FiImage, FiCpu, FiCheckCircle, FiEdit3, 
  FiChevronRight, FiList, FiCheck, FiInfo, FiLayers 
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.88rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/catalog')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '8px',
            cursor: 'pointer', fontSize: '0.83rem'
          }}
        >
          <FiArrowLeft /> Catalog
        </button>
        <FiChevronRight size={14} />
        {family.id && (
          <>
            <button
              onClick={() => navigate(`/families/${family.id}`)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '8px',
                cursor: 'pointer', fontSize: '0.83rem'
              }}
            >
              <FiLayers size={12} /> {family.normalized_title || `Family #${family.id}`}
            </button>
            <FiChevronRight size={14} />
          </>
        )}
        <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>Product #{product.id}</span>
      </div>

      {saveSuccess && (
        <div style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', color: '#10b981', padding: '12px 20px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FiCheckCircle size={18} /> Category updated successfully!
        </div>
      )}

      {/* Grid Layout: Left = Product Info, Right = AI Reasoning & Attributes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Product Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            {/* Product Image */}
            <div style={{ width: '100%', height: '260px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {product.image_url ? (
                <img src={product.image_url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <FiImage size={48} />
                  <div style={{ marginTop: '8px', fontSize: '0.85rem' }}>No Product Image</div>
                </div>
              )}
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#fff', fontWeight: 600 }}>
              {product.title}
            </h3>

            {product.color && (
              <div style={{ marginBottom: '14px' }}>
                <span style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '4px 10px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                  Color: {product.color}
                </span>
              </div>
            )}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginTop: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Product Description
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, maxHeight: '180px', overflowY: 'auto' }}>
                {product.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis & Manual Review */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* AI Taxonomy Card */}
          <div className="glass-card" style={{ border: '1px solid rgba(99,102,241,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <FiCpu size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>AI Taxonomy Prediction</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Shopify Standard Product Taxonomy</span>
                </div>
              </div>

              {confidencePct && (
                <span style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700,
                  background: confidencePct >= 90 ? 'rgba(16,185,129,0.2)' : 'rgba(251,191,36,0.2)',
                  color: confidencePct >= 90 ? '#10b981' : '#fbbf24'
                }}>
                  {confidencePct}% Match
                </span>
              )}
            </div>

            {/* Current Predicted Category */}
            <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Predicted Category Path
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
                {family.predicted_category_name || 'Not Classified Yet'}
              </div>
              {family.predicted_category && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Taxonomy Node ID: <code style={{ color: '#a5b4fc' }}>{family.predicted_category}</code>
                </div>
              )}
            </div>

            {/* Extracted Attributes section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                Extracted Product Attributes
              </div>

              {Object.keys(attributes).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                  {Object.entries(attributes).map(([key, val]) => (
                    <div key={key} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key.replace('_', ' ')}</div>
                      <div style={{ fontSize: '0.92rem', color: '#e2e8f0', fontWeight: 600, marginTop: '2px' }}>{String(val)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  No attributes extracted. Run classification to extract product features.
                </div>
              )}
            </div>

            {/* AI Alternative Suggestions Section */}
            {family.alternative_suggestions && family.alternative_suggestions.length > 0 && (
              <div style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiList size={14} /> AI Suggested Categories (Click to Apply)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: '8px', padding: '8px 12px', color: '#c7d2fe',
                        cursor: saving ? 'wait' : 'pointer', fontSize: '0.85rem', textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(99,102,241,0.25)';
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{suggestion}</span>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        + Apply
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Review / Re-categorization Box */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginTop: '16px' }}>
              {!isEditing ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Need a custom category?</span>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                      color: 'var(--text-secondary)', padding: '6px 14px', borderRadius: '6px',
                      cursor: 'pointer', fontSize: '0.85rem'
                    }}
                  >
                    <FiEdit3 size={14} /> Type Custom Category
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                    Manually Assign Category Path
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Furniture > Tables > Side Tables"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px',
                      background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(99,102,241,0.5)',
                      color: '#fff', fontSize: '0.9rem', marginBottom: '10px', outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setIsEditing(false)}
                      style={{
                        background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                        color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '6px',
                        cursor: 'pointer', fontSize: '0.83rem'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleManualSave}
                      disabled={saving || !customCategory.trim()}
                      style={{
                        background: 'var(--primary)', border: 'none',
                        color: '#fff', padding: '6px 16px', borderRadius: '6px',
                        cursor: saving ? 'wait' : 'pointer', fontSize: '0.83rem', fontWeight: 600,
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
