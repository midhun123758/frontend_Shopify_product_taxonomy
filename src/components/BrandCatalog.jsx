import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { FiTag, FiSearch, FiPackage, FiLayers, FiCheckCircle, FiImage, FiArrowRight, FiX } from 'react-icons/fi';

const BrandCatalog = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandDetail, setBrandDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await api.getBrands();
      setBrands(data || []);
    } catch (err) {
      console.error('Failed to fetch brands', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBrand = async (brandName) => {
    setSelectedBrand(brandName);
    setLoadingDetail(true);
    try {
      const data = await api.getBrandDetail(brandName);
      setBrandDetail(data);
    } catch (err) {
      console.error('Failed to load brand detail', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredBrands = brands.filter(b => 
    b.brand_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = brands.reduce((acc, b) => acc + (b.total_products || 0), 0);
  const totalFamilies = brands.reduce((acc, b) => acc + (b.total_families || 0), 0);

  return (
    <div className="slide-up">
      
      {/* Header Banner */}
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#008060', color: 'white', padding: '6px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.5px', marginBottom: '10px' }}>
          <FiTag /> BRAND CATALOG & PRODUCTS
        </div>
        <h2 className="gradient-text" style={{ fontSize: '2.1rem', margin: '0 0 6px 0' }}>
          Brand Showcase & Product Explorer
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem' }}>
          Browse, filter, and inspect store products grouped by official manufacturer and brand titles.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
            Total Active Brands
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#008060' }}>
            {brands.length}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
            Total Brand Variants
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00a878' }}>
            {totalProducts}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
            Product Families
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#202223' }}>
            {totalFamilies}
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="glass-card" style={{ marginBottom: '28px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', border: '1px solid #e1e3e5', borderRadius: '10px', padding: '10px 16px' }}>
          <FiSearch color="#6d7175" size={18} />
          <input
            type="text"
            placeholder="Search brands (e.g. Nike, Shopify Merch)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.95rem', color: '#202223' }}
          />
        </div>
      </div>

      {/* Brand Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading brand showcase...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredBrands.map((b) => {
            const completionPct = b.total_families > 0 ? Math.round((b.completed_families / b.total_families) * 100) : 0;
            
            return (
              <div
                key={b.brand_name}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  border: '1px solid #e1e3e5'
                }}
                onClick={() => handleSelectBrand(b.brand_name)}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#202223' }}>
                        {b.brand_name}
                      </h3>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
                        {b.total_products} variant product{b.total_products !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <span style={{
                      background: completionPct >= 80 ? 'rgba(0,128,96,0.1)' : 'rgba(251,191,36,0.15)',
                      color: completionPct >= 80 ? '#008060' : '#b25900',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}>
                      {completionPct}% Classified
                    </span>
                  </div>

                  {/* Categories Tags */}
                  {b.categories && b.categories.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {b.categories.map((cat, i) => (
                        <span key={i} style={{ background: '#f1f2f3', color: '#5c5f62', padding: '3px 8px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 600 }}>
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Sample Product Thumbnails */}
                  {b.sample_products && b.sample_products.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '14px' }}>
                      {b.sample_products.map((p) => (
                        <div key={p.id} style={{ flexShrink: 0, position: 'relative' }}>
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.title}
                              style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e1e3e5' }}
                            />
                          ) : (
                            <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e1e3e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FiImage size={20} color="#9ca3af" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Link */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f2f3', paddingTop: '12px', marginTop: '8px', color: '#008060', fontWeight: 700, fontSize: '0.88rem' }}>
                  <span>Inspect Brand Catalog ({b.total_families} Families)</span>
                  <FiArrowRight />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Brand Detail Modal / Drawer */}
      {selectedBrand && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e1e3e5', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#202223' }}>
                  Brand: {selectedBrand}
                </h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Showing all products and AI taxonomy classifications under this brand.
                </div>
              </div>
              <button
                onClick={() => { setSelectedBrand(null); setBrandDetail(null); }}
                style={{ background: '#f1f2f3', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <FiX size={20} color="#202223" />
              </button>
            </div>

            {loadingDetail ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Loading brand catalog details...
              </div>
            ) : brandDetail ? (
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#202223', marginBottom: '14px' }}>
                  Product Families ({brandDetail.families.length})
                </h3>

                <div style={{ display: 'grid', gap: '14px', marginBottom: '24px' }}>
                  {brandDetail.families.map((f) => (
                    <div
                      key={f.id}
                      style={{
                        display: 'flex',
                        gap: '16px',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid #e1e3e5',
                        background: '#f8fafc',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setSelectedBrand(null);
                        navigate(`/families/${f.id}`);
                      }}
                    >
                      {f.image_url ? (
                        <img src={f.image_url} alt={f.normalized_title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e1e3e5' }} />
                      ) : (
                        <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: '#e1e3e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiImage size={24} color="#6d7175" />
                        </div>
                      )}
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', textTransform: 'capitalize', color: '#202223' }}>
                          {f.normalized_title}
                        </div>
                        {f.predicted_category_name && (
                          <div style={{ color: '#008060', fontWeight: 600, fontSize: '0.88rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FiTag size={14} /> {f.predicted_category_name}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <span>Status: <strong>{f.status}</strong></span>
                          {f.confidence_score && <span>Confidence: <strong>{Math.round(f.confidence_score * 100)}%</strong></span>}
                        </div>
                      </div>

                      <div style={{ alignSelf: 'center', color: '#008060', fontWeight: 700, fontSize: '0.88rem' }}>
                        View Details →
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
};

export default BrandCatalog;
