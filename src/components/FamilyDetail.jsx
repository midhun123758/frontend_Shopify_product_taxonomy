import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { FiArrowLeft, FiTag, FiImage, FiLayers, FiPackage, FiChevronRight, FiCpu } from 'react-icons/fi';
import AIAnalysisModal from './AIAnalysisModal';

const HIGH_CONFIDENCE_THRESHOLD = 90;

const FamilyDetail = () => {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModalFamily, setActiveModalFamily] = useState(null);

  const fetchFamily = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getFamilyDetail(familyId);
      setFamily(data);
    } catch (e) {
      console.error(e);
      setError('Failed to load family details.');
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    fetchFamily();
  }, [fetchFamily]);

  const handleAnalyzeClick = async () => {
    if (!family) return;
    setActiveModalFamily(family);
    try {
      await api.analyzeFamily(family.id);
    } catch (e) {
      console.error('Failed to queue AI processing:', e);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
        Loading product family details...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#f87171' }}>
        {error}
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={fetchFamily}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'var(--text-secondary)', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!family) return null;

  const confidencePct = family.confidence_score != null ? Math.round(family.confidence_score * 100) : null;
  const isHighConfidence = confidencePct != null && confidencePct >= HIGH_CONFIDENCE_THRESHOLD;
  const products = family.products || [];

  return (
    <div className="slide-up" style={{ width: '100%', margin: '0 auto' }}>
      {/* Breadcrumb / Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <button
          onClick={() => navigate('/catalog')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-secondary)', padding: '6px 14px', borderRadius: '8px',
            cursor: 'pointer', fontSize: '0.85rem',
          }}
        >
          <FiArrowLeft /> Back to Product Families
        </button>
        <FiChevronRight size={14} />
        <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{family.normalized_title}</span>
      </div>

      {/* Family Header Banner */}
      <div className="glass-card" style={{ marginBottom: '28px', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Image */}
          {family.image_url ? (
            <img
              src={family.image_url}
              alt={family.normalized_title}
              style={{ width: '160px', height: '160px', objectFit: 'cover', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: '160px', height: '160px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FiImage size={48} color="var(--text-muted)" />
            </div>
          )}

          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px',
                background: family.status === 'COMPLETED' ? 'rgba(16,185,129,0.2)' : 'rgba(251,191,36,0.2)',
                color: family.status === 'COMPLETED' ? '#10b981' : '#fbbf24', textTransform: 'uppercase',
              }}>
                {family.status}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Family ID: #{family.id}</span>
            </div>

            <h2 className="gradient-text" style={{ marginBottom: '10px', textTransform: 'capitalize', fontSize: '1.5rem', lineHeight: 1.25 }}>
              {family.normalized_title}
            </h2>

            {/* Category Path */}
            {family.predicted_category_name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <FiTag size={16} color="#008060" />
                <span style={{ color: '#111827', fontWeight: 800, fontSize: '1.1rem' }}>
                  {family.predicted_category_name}
                </span>
              </div>
            )}

            {/* Meta Row */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              {confidencePct != null && (
                <span style={{
                  padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800,
                  background: isHighConfidence ? '#e6f4ea' : '#fef3c7',
                  color: isHighConfidence ? '#008060' : '#b25900',
                  border: isHighConfidence ? '1px solid #008060' : '1px solid #b25900',
                }}>
                  {confidencePct}% AI Confidence
                </span>
              )}
              <span style={{ display: 'inline-flex', alignItems: 'center', background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
                <FiLayers size={14} style={{ marginRight: '6px' }} />
                {products.length} Product Variant{products.length !== 1 ? 's' : ''}
              </span>
              {family.product_type && (
                <span style={{ display: 'inline-flex', alignItems: 'center', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                  <FiPackage size={14} style={{ marginRight: '6px' }} />{family.product_type}
                </span>
              )}
              <button
                onClick={handleAnalyzeClick}
                disabled={family.status === 'PROCESSING'}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: family.status === 'PROCESSING' ? '#6d9c8f' : '#008060',
                  border: 'none', color: '#ffffff',
                  padding: '6px 16px', borderRadius: '20px',
                  cursor: family.status === 'PROCESSING' ? 'not-allowed' : 'pointer',
                  fontWeight: 800, fontSize: '0.85rem', boxShadow: '0 2px 8px rgba(0,128,96,0.3)',
                }}
              >
                <FiCpu size={14} />
                {family.status === 'PROCESSING' ? 'Processing...' : 'Run AI Analysis'}
              </button>
            </div>
          </div>
        </div>

        {/* Extracted Attributes Banner */}
        {family.extracted_attributes && Object.keys(family.extracted_attributes).length > 0 && (
          <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid #e1e3e5' }}>
            <div style={{ color: '#111827', fontSize: '0.82rem', fontWeight: 800, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              AI Extracted Family Attributes
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {Object.entries(family.extracted_attributes).map(([k, v]) => (
                <span key={k} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 14px', fontSize: '0.88rem' }}>
                  <strong style={{ color: '#4b5563', textTransform: 'capitalize', fontWeight: 700 }}>{k.replace(/_/g, ' ')}:</strong>{' '}
                  <span style={{ color: '#000000', fontWeight: 800 }}>{String(v)}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Products list heading */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 600 }}>
          Products in this Family ({products.length})
        </h3>
      </div>

      <div style={{ display: 'grid', gap: '14px' }}>
        {products.map((product) => (
          <div
            key={product.id}
            className="glass-card"
            onClick={() => navigate(`/products/${product.id}`)}
            style={{
              display: 'flex', gap: '18px', alignItems: 'center',
              cursor: 'pointer', transition: 'border 0.2s',
              border: '1px solid #e1e3e5',
            }}
          >
            {/* Product Image */}
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #cbd5e1', flexShrink: 0 }}
              />
            ) : (
              <div style={{ width: '110px', height: '110px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiImage size={32} color="#6d7175" />
              </div>
            )}

            {/* Product Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.title}
              </div>
              <div style={{ color: '#6d7175', fontSize: '0.82rem', marginBottom: '8px' }}>
                SKU: {product.sku || 'N/A'} · ID: #{product.id}
              </div>
              {product.color && (
                <span style={{ display: 'inline-block', background: '#e6f4ea', borderRadius: '5px', padding: '3px 9px', fontSize: '0.8rem', color: '#008060', fontWeight: 700, border: '1px solid rgba(0,128,96,0.3)', marginBottom: '6px' }}>
                  Color: {product.color}
                </span>
              )}
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#6d7175', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.description ? `${product.description.substring(0, 120)}...` : 'No description'}
              </p>
            </div>

            {/* Action Arrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#008060', fontWeight: 700, fontSize: '0.88rem', flexShrink: 0 }}>
              <span>View Analysis</span>
              <FiChevronRight />
            </div>
          </div>
        ))}
      </div>

      {/* AI ANALYSIS SCANNING OVERLAY MODAL */}
      {activeModalFamily && (
        <AIAnalysisModal
          family={activeModalFamily}
          onClose={() => {
            setActiveModalFamily(null);
            fetchFamily();
          }}
        />
      )}
    </div>
  );
};

export default FamilyDetail;