import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { FiCompass, FiSearch, FiChevronRight, FiFolder, FiTag, FiLayers, FiPackage, FiExternalLink, FiCheckCircle } from 'react-icons/fi';

const CategoryWayfinder = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCatId = searchParams.get('id') || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [selectedCatId, setSelectedCatId] = useState(initialCatId);
  const [wayfindData, setWayfindData] = useState(null);
  const [loadingWayfind, setLoadingWayfind] = useState(false);

  // Search categories on query change
  useEffect(() => {
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await api.searchCategories(searchTerm);
        setSearchResults(results || []);
      } catch (err) {
        console.error('Category search error:', err);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load wayfinding data when a category ID is selected
  useEffect(() => {
    if (!selectedCatId) {
      setWayfindData(null);
      return;
    }

    const loadWayfind = async () => {
      setLoadingWayfind(true);
      try {
        const data = await api.getCategoryWayfind(selectedCatId);
        setWayfindData(data);
      } catch (err) {
        console.error('Wayfind data load error:', err);
      } finally {
        setLoadingWayfind(false);
      }
    };

    loadWayfind();
  }, [selectedCatId]);

  const handleSelectCategory = (id) => {
    setSelectedCatId(id);
    setSearchParams({ id });
  };

  return (
    <div className="slide-up">
      {/* Header Banner */}
      <div className="glass-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.08))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', display: 'flex' }}>
            <FiCompass size={28} />
          </div>
          <div>
            <h2 className="gradient-text" style={{ fontSize: '1.6rem' }}>Shopify Category Wayfinder</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Hierarchical taxonomy search, breadcrumb navigation, and product mapping across 14,606 official categories.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <FiSearch size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px' }} />
          <input
            type="text"
            placeholder="Search category by keyword, name, or ID (e.g. Dining Table, Shoes, Furniture, sg-4-17)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Quick Suggestions / Search Results Grid */}
        {searching ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Searching 14,606 Shopify Taxonomy nodes...
          </div>
        ) : (
          <div style={{ marginTop: '16px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              {searchTerm ? `Found ${searchResults.length} matching categories` : 'Root Taxonomy Categories (Level 1)'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
              {searchResults.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: selectedCatId === cat.id ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                    border: selectedCatId === cat.id ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'center'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: selectedCatId === cat.id ? '#c7d2fe' : 'var(--text-secondary)' }}>
                    {cat.leaf_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cat.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Category Wayfinding Drill-Down View */}
      {loadingWayfind ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading wayfinding path & subcategories...
        </div>
      ) : wayfindData ? (
        <div style={{ display: 'grid', gap: '20px' }}>
          
          {/* Breadcrumb Path Banner */}
          <div className="glass-card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Wayfinding Hierarchy Path
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              {wayfindData.breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <div
                    onClick={() => crumb.id && handleSelectCategory(crumb.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      background: idx === wayfindData.breadcrumbs.length - 1 ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)',
                      border: idx === wayfindData.breadcrumbs.length - 1 ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
                      color: idx === wayfindData.breadcrumbs.length - 1 ? '#a5b4fc' : 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      fontWeight: idx === wayfindData.breadcrumbs.length - 1 ? 700 : 500,
                      cursor: crumb.id ? 'pointer' : 'default'
                    }}
                  >
                    <FiFolder size={14} />
                    <span>{crumb.name}</span>
                  </div>
                  {idx < wayfindData.breadcrumbs.length - 1 && (
                    <FiChevronRight color="var(--text-muted)" size={16} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Category ID: <strong style={{ color: 'var(--text-secondary)' }}>{wayfindData.id}</strong></span>
              <span>Hierarchy Depth: <strong style={{ color: 'var(--text-secondary)' }}>Level {wayfindData.depth}</strong></span>
              <span>Assigned Products: <strong style={{ color: '#34d399' }}>{wayfindData.assigned_families_count} families</strong></span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            
            {/* Subcategories Panel */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '16px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiFolder color="var(--primary)" /> Subcategories ({wayfindData.children.length})
              </h3>

              {wayfindData.children.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {wayfindData.children.map((child) => (
                    <div
                      key={child.id}
                      onClick={() => handleSelectCategory(child.id)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.07)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.border = '1px solid rgba(99,102,241,0.4)'}
                      onMouseLeave={(e) => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)'}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                        {child.name}
                      </div>
                      <div style={{ color: 'var(--primary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Explore <FiChevronRight />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', padding: '20px 0' }}>
                  This is a leaf node category with no subcategories.
                </div>
              )}
            </div>

            {/* Assigned Product Families */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '16px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiPackage color="#34d399" /> Categorized Families ({wayfindData.assigned_families_count})
              </h3>

              {wayfindData.assigned_families.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {wayfindData.assigned_families.map((fam) => (
                    <div
                      key={fam.id}
                      onClick={() => navigate(`/families/${fam.id}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.07)',
                        cursor: 'pointer'
                      }}
                    >
                      {fam.image_url ? (
                        <img src={fam.image_url} alt={fam.normalized_title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiPackage color="var(--text-muted)" />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {fam.normalized_title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Status: <span style={{ color: fam.status === 'COMPLETED' ? '#34d399' : '#fbbf24' }}>{fam.status}</span>
                        </div>
                      </div>
                      <FiExternalLink color="var(--text-muted)" size={16} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', padding: '20px 0' }}>
                  No product families mapped to this category yet.
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <FiTag size={40} style={{ marginBottom: '12px', opacity: 0.6 }} />
          <p style={{ fontSize: '1rem', marginBottom: '8px' }}>
            Select or search any category above to view its Wayfinding Tree, Breadcrumb Path, and mapped Products.
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryWayfinder;
