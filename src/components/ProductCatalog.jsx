import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { FiCheckCircle, FiImage, FiTag, FiCpu, FiChevronRight, FiLayers } from 'react-icons/fi';
import './Dashboard.css'; 

const ProductCatalog = () => {
  const navigate = useNavigate();
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Trigger AI loading state
  const [analyzingId, setAnalyzingId] = useState(null);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const data = await api.getFamilies(debouncedSearch, statusFilter, currentPage);
      setFamilies(data.results || data);
      setTotalCount(data.count || 0);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    } catch (err) {
      console.error("Error fetching families:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [debouncedSearch, statusFilter, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  // Polling for live status updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (families.some(f => f.status === 'PROCESSING')) {
        fetchCatalog();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [families]);

  const handleAnalyzeClick = async (e, familyId) => {
    e.stopPropagation();
    setAnalyzingId(familyId);
    try {
      await api.analyzeFamily(familyId);
      fetchCatalog();
    } catch (error) {
      alert("Failed to queue AI processing.");
    } finally {
      setAnalyzingId(null);
    }
  };

  if (loading && families.length === 0) {
    return <div className="flex-center" style={{ padding: '40px' }}>Loading catalog...</div>;
  }

  if (families.length === 0 && !searchTerm) {
    return (
      <div className="glass-card flex-center" style={{ padding: '60px', flexDirection: 'column', gap: '16px' }}>
        <FiCheckCircle size={48} color="var(--success)" />
        <h2>No Product Families Yet</h2>
        <p style={{ color: 'var(--text-muted)' }}>Upload some products and they will be grouped into families!</p>
      </div>
    );
  }

  return (
    <div className="slide-up">
      <h2 className="gradient-text" style={{ marginBottom: '8px' }}>Product Family Catalog</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Click any family row to drill down into variants and inspect individual product AI classifications.
      </p>

      {/* FILTER CONTROLS */}
      <div className="glass-card" style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Search by Title or Brand..." 
          className="form-input" 
          style={{ flex: '1', minWidth: '250px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px', borderRadius: '8px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select 
          className="form-input" 
          style={{ width: '200px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px', borderRadius: '8px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="" style={{ color: 'black' }}>All Statuses</option>
          <option value="PENDING" style={{ color: 'black' }}>Pending</option>
          <option value="PROCESSING" style={{ color: 'black' }}>Processing</option>
          <option value="COMPLETED" style={{ color: 'black' }}>Completed</option>
          <option value="MANUAL_REVIEW" style={{ color: 'black' }}>Manual Review</option>
          <option value="ERROR" style={{ color: 'black' }}>Error</option>
        </select>
      </div>

      <div className="glass-card">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Image</th>
                <th>Family Details</th>
                <th>Status</th>
                <th>AI Classification</th>
                <th style={{ width: '120px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {families.map(f => (
                <tr 
                  key={f.id}
                  onClick={() => navigate(`/families/${f.id}`)}
                  style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                >
                  {/* Image Column */}
                  <td>
                    {f.image_url ? (
                      <img
                        src={f.image_url}
                        alt={f.normalized_title}
                        style={{
                          width: '56px',
                          height: '56px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      display: f.image_url ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <FiImage size={22} color="var(--text-muted)" />
                    </div>
                  </td>

                  {/* Family Details */}
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px', textTransform: 'capitalize' }}>
                      {f.normalized_title}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {f.brand && <span><strong>Brand:</strong> {f.brand}</span>}
                      {f.confidence_score && (
                        <span style={{ color: f.confidence_score >= 0.9 ? '#10b981' : '#fbbf24', fontWeight: 600 }}>
                          {(f.confidence_score * 100).toFixed(0)}% confidence
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status Column */}
                  <td>
                    {f.status === 'COMPLETED' && <span className="badge badge-success">Completed</span>}
                    {f.status === 'PENDING' && <span className="badge badge-info" style={{background: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af'}}>Pending</span>}
                    {f.status === 'PROCESSING' && <span className="badge badge-info" style={{background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa'}}>Processing</span>}
                    {f.status === 'MANUAL_REVIEW' && <span className="badge badge-warning">Review Needed</span>}
                    {f.status === 'ERROR' && <span className="badge badge-error" style={{background: 'rgba(239, 68, 68, 0.2)', color: '#f87171'}}>Error</span>}
                  </td>

                  {/* AI & Mapped Category Column */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {f.status === 'PENDING' ? (
                        <button 
                          className="btn-primary" 
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', background: 'var(--primary)', border: 'none', color: 'white', fontSize: '0.85rem' }}
                          onClick={(e) => handleAnalyzeClick(e, f.id)}
                          disabled={analyzingId === f.id}
                        >
                          <FiCpu size={14} />
                          {analyzingId === f.id ? "Queuing..." : "Analyze AI"}
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FiTag color="var(--primary)" size={14} />
                          <div style={{ color: '#a5b4fc', fontWeight: 500, fontSize: '0.9rem' }}>
                            {f.predicted_category_name || 'Unknown Category'}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Action Column */}
                  <td>
                    <button
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                        color: 'var(--text-secondary)', padding: '6px 10px', borderRadius: '6px',
                        cursor: 'pointer', fontSize: '0.82rem'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/families/${f.id}`);
                      }}
                    >
                      <span>Drill Down</span>
                      <FiChevronRight size={14} />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* PAGINATION CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
        <div style={{ color: 'var(--text-muted)' }}>
          Showing page {currentPage} (Total items: {totalCount})
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-outline" 
            onClick={() => setCurrentPage(prev => prev - 1)} 
            disabled={!hasPrev || loading}
          >
            Previous
          </button>
          <button 
            className="btn-outline" 
            onClick={() => setCurrentPage(prev => prev + 1)} 
            disabled={!hasNext || loading}
          >
            Next
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default ProductCatalog;
