import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { FiArrowLeft, FiTag, FiImage, FiLayers, FiPackage, FiChevronRight, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

const FamilyDetail = () => {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
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
    load();
  }, [familyId]);

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
                <FiTag size={16} color="var(--primary)" />
                <span style={{ color: '#a5b4fc', fontWeight: 600, fontSize: '1rem' }}>
                  {family.predicted_category_name}
                </span>
              </div>
            )}

            {/* Meta Row */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              {confidencePct && (
                <span style={{
                  padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700,
                  background: confidencePct >= 90 ? 'rgba(16,185,129,0.2)' : 'rgba(251,191,36,0.2)',
                  color: confidencePct >= 90 ? '#10b981' : '#fbbf24'
                }}>
                  {confidencePct}% AI Confidence
                </span>
              )}
              <span style={{ background: 'rgba(99,102,241,0.15)', color: '#c7d2fe', padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                <FiLayers size={14} style={{ marginRight: '6px' }} />
                {(family.products || []).length} Product Variant{(family.products || []).length !== 1 ? 's' : ''}
              </span>
              {family.product_type && (
                <span style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem' }}>
                  <FiPackage size={14} style={{ marginRight: '6px' }} />{family.product_type}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Extracted Attributes Banner */}
        {family.extracted_attributes && Object.keys(family.extracted_attributes).length > 0 && (
          <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              AI Extracted Family Attributes
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {Object.entries(family.extracted_attributes).map(([k, v]) => (
                <span key={k} style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', padding: '6px 14px', fontSize: '0.85rem' }}>
                  <strong style={{ color: '#a5b4fc', textTransform: 'capitalize' }}>{k.replace('_', ' ')}:</strong> <span style={{ color: '#fff' }}>{String(v)}</span>
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
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Click any product to inspect AI reasoning & metadata</span>
      </div>

      {/* Grid of product variants */}
      <div style={{ display: 'grid', gap: '14px' }}>
        {(family.products || []).map((product, idx) => (
          <div
            key={product.id}
            className="glass-card"
            onClick={() => navigate(`/products/${product.id}`)}
            style={{
              display: 'flex', gap: '20px', alignItems: 'center',
              cursor: 'pointer', transition: 'all 0.2s ease',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '16px 20px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.border = '1px solid rgba(99,102,241,0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Thumbnail */}
            <div style={{ flexShrink: 0 }}>
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.title}
                  style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} 
                  onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                />
              ) : (
                <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiImage size={24} color="var(--text-muted)" />
                </div>
              )}
            </div>

            {/* Main Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Variant #{idx + 1}</span>
                {product.color && (
                  <span style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', color: '#e2e8f0' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 500, fontSize: '0.88rem' }}>
              <span>View Analysis</span>
              <FiChevronRight />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FamilyDetail;
