import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { FiCheckCircle, FiImage, FiTag, FiLayers, FiPackage, FiSearch, FiDownload, FiChevronRight } from 'react-icons/fi';

const statusColors = {
  COMPLETED: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Completed' },
};

const CompletedDashboard = () => {
  const navigate = useNavigate();
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  // Debounce search
  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(h);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const fetchCompleted = async () => {
    setLoading(true);
    try {
      const data = await api.getFamilies(debouncedSearch, 'COMPLETED', currentPage);
      setFamilies(data.results || []);
      setTotalCount(data.count || 0);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    } catch (err) {
      console.error('Failed to fetch completed families:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompleted(); }, [debouncedSearch, currentPage]);

  const exportCSV = () => {
    const headers = ['Family Title', 'Brand', 'Category', 'Confidence', 'Attributes'];
    const rows = families.map(f => [
      `"${f.normalized_title}"`,
      `"${f.brand || ''}"`,
      `"${f.predicted_category_name || ''}"`,
      f.confidence_score ? (f.confidence_score * 100).toFixed(0) + '%' : '',
      `"${JSON.stringify(f.extracted_attributes || {})}"`,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `completed_products_page${currentPage}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && families.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          Loading completed classifications...
        </div>
      </div>
    );
  }

  return (
    <div className="slide-up">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="gradient-text" style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiCheckCircle color="#10b981" /> Completed Classifications
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {totalCount} product {totalCount === 1 ? 'family' : 'families'} successfully classified by AI
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={families.length === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '8px', cursor: 'pointer',
            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
            color: '#10b981', fontWeight: 600, fontSize: '0.9rem'
          }}
        >
          <FiDownload /> Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <FiSearch color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search completed families by title or brand..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'white', fontSize: '1rem'
          }}
        />
      </div>

      {/* Empty State */}
      {!loading && families.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <FiCheckCircle size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
          <h3>No completed classifications yet</h3>
          <p>Go to the Catalog tab, select a family, and click "Analyze with AI".</p>
        </div>
      )}

      {/* Cards Grid */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {families.map(f => (
          <div
            key={f.id}
            className="glass-card"
            style={{
              border: expanded === f.id ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.07)',
              transition: 'border 0.2s ease',
              cursor: 'pointer',
            }}
            onClick={() => setExpanded(expanded === f.id ? null : f.id)}
          >
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

              {/* Thumbnail */}
              <div style={{ flexShrink: 0 }}>
                {f.image_url ? (
                  <img
                    src={f.image_url}
                    alt={f.normalized_title}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiImage size={28} color="var(--text-muted)" />
                  </div>
                )}
              </div>

              {/* Main Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px', textTransform: 'capitalize' }}>
                      {f.normalized_title}
                    </div>
                    {f.brand && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Brand: <strong style={{ color: 'var(--text-secondary)' }}>{f.brand}</strong>
                      </div>
                    )}
                  </div>
                  <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    ✓ Completed
                  </span>
                </div>

                {/* Category Path */}
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <FiTag size={14} color="var(--primary)" />
                  <span style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.9rem' }}>
                    {f.predicted_category_name || 'Unknown Category'}
                  </span>
                  {f.confidence_score != null && (
                    <span style={{
                      marginLeft: '8px', padding: '2px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700,
                      background: f.confidence_score >= 0.9 ? 'rgba(16,185,129,0.2)' : 'rgba(251,191,36,0.2)',
                      color: f.confidence_score >= 0.9 ? '#10b981' : '#fbbf24'
                    }}>
                      {(f.confidence_score * 100).toFixed(0)}% confidence
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Section */}
            {expanded === f.id && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>

                  {/* Extracted Attributes */}
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Extracted Attributes
                    </div>
                    {f.extracted_attributes && Object.keys(f.extracted_attributes).length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {Object.entries(f.extracted_attributes).map(([k, v]) => (
                          <span key={k} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <strong>{k}:</strong> {String(v)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None extracted</span>
                    )}
                  </div>

                  {/* Product Type */}
                  {f.product_type && (
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Original Product Type
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiPackage size={14} color="var(--text-muted)" />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{f.product_type}</span>
                      </div>
                    </div>
                  )}

                  {/* Action & Drill-Down */}
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Action & Drill-Down
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/families/${f.id}`);
                      }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
                        color: '#a5b4fc', padding: '8px 16px', borderRadius: '8px',
                        cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600
                      }}
                    >
                      <span>Drill Down to Variants</span>
                      <FiChevronRight />
                    </button>
                  </div>

                </div>

                {/* Alternative Suggestions */}
                {f.alternative_suggestions && f.alternative_suggestions.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Alternative Suggestions
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {f.alternative_suggestions.map((s, i) => (
                        <span key={i} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.82rem', color: '#a5b4fc' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {(hasNext || hasPrev) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
          <div style={{ color: 'var(--text-muted)' }}>
            Page {currentPage} · {totalCount} total
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-outline" onClick={() => setCurrentPage(p => p - 1)} disabled={!hasPrev || loading}>
              Previous
            </button>
            <button className="btn-outline" onClick={() => setCurrentPage(p => p + 1)} disabled={!hasNext || loading}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletedDashboard;
