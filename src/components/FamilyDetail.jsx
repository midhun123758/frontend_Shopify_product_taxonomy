import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { FiArrowLeft, FiTag, FiImage, FiLayers, FiPackage, FiChevronRight, FiCheckCircle, FiClock, FiAlertCircle, FiCpu } from 'react-icons/fi';
import AIAnalysisModal from './AIAnalysisModal';

const FamilyDetail = () => {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModalFamily, setActiveModalFamily] = useState(null);

  const fetchFamily = async () => {
    try {
      setLoading(true);
      const data = await api.getFamilyDetail(familyId);
      setFamily(data);
    } catch (e) {
      console.error(e);
      setError('Failed to load family details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamily();
  }, [familyId]);

  const handleAnalyzeClick = async () => {
    if (!family) return;
    setActiveModalFamily(family);
    try {
      await api.analyzeFamily(family.id);
    } catch (e) {
      console.error("Failed to queue AI processing:", e);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
      <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
      Loading product family details...
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#f87171' }}>{error}</div>
  );

  if (!family) return null;

  const confidencePct = family.confidence_score ? (family.confidence_score * 100).toFixed(0) : null;

  return (
    <div className="slide-up" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Breadcrumb / Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <button
          onClick={() => navigate('/catalog')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-secondary)', padding: '6px 14px', borderRadius: '8px',
            cursor: 'pointer', fontSize: '0.85rem'
          }}
        >
          <FiArrowLeft /> Back to Product Families
        </button>
        <FiChevronRight size={14} />
        <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{family.normalized_title}</span>
      </div>

      {/* Family Header Banner */}
      <div className="glass-card" style={{ marginBottom: '28px', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Image */}
          {family.image_url ? (
            <img 
              src={family.image_url} 
              alt={family.normalized_title}
              style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)' }} 
            />
          ) : (
            <div style={{ width: '110px', height: '110px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiImage size={36} color="var(--text-muted)" />
            </div>
          )}

          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px',
                background: family.status === 'COMPLETED' ? 'rgba(16,185,129,0.2)' : 'rgba(251,191,36,0.2)',
                color: family.status === 'COMPLETED' ? '#10b981' : '#fbbf24', textTransform: 'uppercase'
              }}>
                {family.status}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Family ID: #{family.id}</span>
            </div>

            <h2 className="gradient-text" style={{ marginBottom: '10px', textTransform: 'capitalize', fontSize: '1.5rem' }}>
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
              {confidencePct && (
                <span style={{
                  padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800,
                  background: confidencePct >= 90 ? '#e6f4ea' : '#fef3c7',
                  color: confidencePct >= 90 ? '#008060' : '#b25900',
                  border: confidencePct >= 90 ? '1px solid #008060' : '1px solid #b25900'
                }}>
                  {confidencePct}% AI Confidence
                </span>
              )}
              <span style={{ background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
                <FiLayers size={14} style={{ marginRight: '6px' }} />
                {(family.products || []).length} Product Variant{(family.products || []).length !== 1 ? 's' : ''}
              </span>
              {family.product_type && (
                <span style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                  <FiPackage size={14} style={{ marginRight: '6px' }} />{family.product_type}
                </span>
              )}
              <button
                onClick={handleAnalyzeClick}
                disabled={family.status === 'PROCESSING'}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: '#008060', border: 'none', color: '#ffffff',
                  padding: '6px 16px', borderRadius: '20px', cursor: 'pointer',
                  fontWeight: 800, fontSize: '0.85rem', boxShadow: '0 2px 8px rgba(0,128,96,0.3)'
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
                  <strong style={{ color: '#4b5563', textTransform: 'capitalize', fontWeight: 700 }}>{k.replace('_', ' ')}:</strong> <span style={{ color: '#000000', fontWeight: 800 }}>{String(v)}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Products list heading */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 600 }}>
          Products in this Family ({(family.products || []).length})
        </h3>
      </div>

      <div style={{ display: 'grid', gap: '14px' }}>
        {(family.products || []).map(product => (
          <div
            key={product.id}
            className="glass-card"
            onClick={() => navigate(`/products/${product.id}`)}
            style={{
              display: 'flex', gap: '16px', alignItems: 'flex-start',
              cursor: 'pointer', transition: 'border 0.2s',
              border: '1px solid #e1e3e5'
            }}
          >
            {/* Product Image */}
            <div style={{ flexShrink: 0 }}>
              {product.image_url ? (
                <img src={product.image_url} alt={product.title}
                  style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              ) : (
                <div style={{ width: '72px', height: '72px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiImage size={24} color="#6d7175" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: '4px', color: '#111827' }}>{product.title}</div>
              <div style={{ color: '#6d7175', fontSize: '0.82rem', marginBottom: '8px' }}>
                SKU: {product.sku || 'N/A'} · ID: #{product.id}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {product.color && (
                  <span style={{ background: '#e6f4ea', borderRadius: '5px', padding: '3px 9px', fontSize: '0.8rem', color: '#008060', fontWeight: 700, border: '1px solid rgba(0,128,96,0.3)' }}>
                    Color: {product.color}
                  </span>
                )}
              </div>
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.title}
              </h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.description ? product.description.substring(0, 120) + '...' : 'No description'}
              </p>
            </div>

            {/* Action Arrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#008060', fontWeight: 700, fontSize: '0.88rem' }}>
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
