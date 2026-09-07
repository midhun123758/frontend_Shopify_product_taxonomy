import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { FiCheckCircle, FiImage, FiTag, FiCpu, FiChevronRight, FiLayers, FiTrash2 } from 'react-icons/fi';
import './Dashboard.css'; 

import AIAnalysisModal from './AIAnalysisModal';

const ProductCatalog = () => {
  const navigate = useNavigate();
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalFamily, setActiveModalFamily] = useState(null);

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

  const handleClearData = async () => {
    if (window.confirm("⚠️ Are you sure you want to clear all imported products, families, and reset the Redis queue?")) {
      try {
        await api.clearAllData();
        alert("✅ Dataset products and Redis queue cleared successfully.");
        fetchCatalog();
      } catch (err) {
        console.error("Failed to clear data:", err);
        alert("Failed to clear dataset.");
      }
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

  const handleAnalyzeClick = async (e, family) => {
    e.stopPropagation();
    setActiveModalFamily(family);
    try {
      await api.analyzeFamily(family.id);
    } catch (error) {
      console.error("Failed to queue AI processing:", error);
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
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
            borderRadius: '8px', fontWeight: 600, background: '#ef4444', color: 'white',
            border: 'none', cursor: 'pointer'
          }}
          onClick={handleClearData}
        >
          <FiTrash2 size={16} /> Flush Queue & Clear Database
        </button>
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
          style={{ flex: '1', minWidth: '250px', background: '#ffffff', border: '1px solid #c9cccf', color: '#202223', padding: '12px', borderRadius: '8px', fontSize: '0.95rem' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select 
          className="form-input" 
          style={{ width: '200px', background: '#ffffff', border: '1px solid #c9cccf', color: '#202223', padding: '12px', borderRadius: '8px', fontSize: '0.95rem' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
          <option value="MANUAL_REVIEW">Manual Review</option>
          <option value="ERROR">Error</option>
        </select>

        {/* Start Bulk AI Classification Button */}
        <button
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '8px',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
            whiteSpace: 'nowrap'
          }}
          onClick={async () => {
            try {
              const res = await api.resumeProcessing();
              alert(res.message || "Started background batch AI classification!");
              fetchCatalog();
            } catch (err) {
              alert("Failed to start batch processing.");
            }
          }}
        >
          <FiCpu size={18} />
          Start Bulk AI Batch
        </button>

        {/* Clear Dataset & Reset Queue Button */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 18px',
            borderRadius: '8px',
            fontWeight: 600,
            background: '#ef4444',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
          onClick={handleClearData}
        >
          <FiTrash2 size={16} />
          Clear Dataset
        </button>
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
                  <td style={{ width: '110px' }}>
                    {f.image_url ? (
                      <img
                        src={f.image_url}
                        alt={f.normalized_title}
                        style={{
                          width: '90px',
                          height: '90px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          border: '1px solid #c9cccf',
                          boxShadow: '0 3px 8px rgba(0,0,0,0.08)'
                        }}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div 
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '12px',
                        background: '#f1f2f3',
                        border: '1px dashed #c9cccf',
                        display: f.image_url ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6d7175'
                      }}
                    >
                      <FiImage size={24} />
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
                    {(f.status === 'FAILED' || f.status === 'ERROR') && <span className="badge badge-error" style={{background: 'rgba(239, 68, 68, 0.2)', color: '#f87171'}}>Failed</span>}
                  </td>

                  {/* AI & Mapped Category Column */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {f.predicted_category_name ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FiTag color="var(--primary)" size={14} />
                          <div style={{ color: '#a5b4fc', fontWeight: 500, fontSize: '0.9rem' }}>
                            {f.predicted_category_name}
                          </div>
                        </div>
                      ) : (
                        <button 
                          className="btn-primary" 
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', background: 'var(--primary)', border: 'none', color: 'white', fontSize: '0.85rem' }}
                          onClick={(e) => handleAnalyzeClick(e, f)}
                          disabled={f.status === 'PROCESSING'}
                        >
                          <FiCpu size={14} />
                          {f.status === 'PROCESSING' ? "Processing..." : "Analyze AI"}
                        </button>
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

      {/* AI ANALYSIS SCANNING OVERLAY MODAL */}
      {activeModalFamily && (
        <AIAnalysisModal
          family={activeModalFamily}
          onClose={() => {
            setActiveModalFamily(null);
            fetchCatalog();
          }}
        />
      )}
      
    </div>
  );
};

export default ProductCatalog;
