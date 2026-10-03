import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { FiAlertTriangle, FiImage, FiLoader } from 'react-icons/fi';
import './Dashboard.css';

const ManualReview = () => {
  const [reviewProducts, setReviewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightIds, setHighlightIds] = useState([]);

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      const reviewData = await api.getReviewProducts(1);
      const results = reviewData.results || reviewData;
      results.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
      setReviewProducts(results);
    } catch (err) {
      console.error("Error fetching review data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewData();

    // Setup WebSocket for live updates when items enter MANUAL_REVIEW
    let ws = null;
    let debounceTimer = null;
    let retryCount = 0;
    let isActive = true;

    const connectWebSocket = () => {
      ws = new WebSocket('ws://localhost:8000/ws/updates/');
      
      ws.onopen = () => {
        retryCount = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.status === 'MANUAL_REVIEW') {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              if (isActive) {
                fetchReviewData();
                setHighlightIds(prev => [...prev, String(data.family_id)]);
                setTimeout(() => {
                  setHighlightIds(prev => prev.filter(id => id !== String(data.family_id)));
                }, 2000);
              }
            }, 1500);
          }
        } catch (err) {
          console.error("WebSocket message error:", err);
        }
      };

      ws.onclose = () => {
        if (isActive && retryCount < 5) {
          retryCount++;
          setTimeout(connectWebSocket, Math.min(1000 * retryCount, 5000));
        }
      };
    };

    connectWebSocket();

    return () => {
      isActive = false;
      if (ws) ws.close();
      clearTimeout(debounceTimer);
    };
  }, []);

  const handleManualCategorize = async (productId, categoryString) => {
    try {
      await api.updateProductCategory(productId, categoryString);
      fetchReviewData();
    } catch (err) {
      console.error("Failed to update product:", err);
      alert("Failed to categorize product. Make sure the category exists.");
    }
  };

  if (loading && reviewProducts.length === 0) {
    return <div className="flex-center" style={{ padding: '40px' }}><FiLoader className="spin" size={32} /></div>;
  }

  return (
    <div className="dashboard-container slide-up">
      <div className="dashboard-header">
        <div>
          <h2>Manual Review</h2>
          <p className="subtitle">Items that require human intervention for categorization</p>
        </div>
      </div>

      {reviewProducts.length === 0 ? (
        <div className="glass-card flex-center" style={{ padding: '60px', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--success)' }}>All Caught Up!</h2>
          <p style={{ color: 'var(--text-muted)' }}>There are currently no products requiring manual review.</p>
        </div>
      ) : (
        <div className="review-section glass-card" style={{ marginTop: '20px' }}>
          <h3 style={{ color: 'var(--warning)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiAlertTriangle /> {reviewProducts.length} Action Required
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            The AI could not automatically map these to a 100% exact Shopify leaf node. Please click one of the AI's alternative suggestions to approve it.
          </p>

          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ width: '25%', minWidth: '220px' }}>Product</th>
                  <th style={{ width: '15%', minWidth: '140px' }}>Reason for Review</th>
                  <th style={{ width: '15%' }}>Attributes</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>AI Confidence</th>
                  <th style={{ width: '35%', minWidth: '300px' }}>AI Suggestions (Click to Approve)</th>
                </tr>
              </thead>
              <tbody>
                {reviewProducts.map(p => (
                  <tr 
                    key={p.id} 
                    className={highlightIds.includes(String(p.id)) ? 'blink-row' : ''}
                    style={{ borderBottom: '1px solid #e1e3e5' }}
                  >
                    <td style={{ padding: '16px 20px', minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {p.image_url ? (
                          <img 
                            src={p.image_url} 
                            alt={p.normalized_title} 
                            style={{ 
                              width: '140px', 
                              height: '140px', 
                              objectFit: 'cover', 
                              borderRadius: '12px', 
                              border: '1px solid #c9cccf',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              flexShrink: 0 
                            }} 
                          />
                        ) : (
                          <div style={{ 
                            width: '140px', 
                            height: '140px',  
                            borderRadius: '12px', 
                            background: '#f1f2f3', 
                            border: '1px dashed #c9cccf',
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: '#5c5f62', 
                            fontWeight: 700, 
                            fontSize: '0.85rem', 
                            flexShrink: 0 
                          }}>
                            <FiImage size={24} color="#6d7175" style={{ marginBottom: '4px' }} />
                            #{p.id}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: '#202223', textTransform: 'capitalize', fontSize: '1rem', lineHeight: '1.35', marginBottom: '4px' }}>
                            {p.normalized_title || p.title || `Product Family #${p.id}`}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {p.brand && (
                              <span style={{ background: '#eef2ff', color: '#3730a3', fontSize: '0.76rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                                {p.brand}
                              </span>
                            )}
                            <span style={{ color: '#6d7175', fontSize: '0.78rem' }}>
                              ID: #{p.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--warning)', fontWeight: 500, fontSize: '0.9rem' }}>
                        {p.alternative_suggestions?.[0]?.startsWith('Taxonomy path not found')
                          ? 'Category Not Found in DB'
                          : p.alternative_suggestions?.[0]?.startsWith('Raw AI Output:')
                          ? 'AI Generated Invalid Category'
                          : p.confidence_score < 0.95
                          ? 'Low Confidence Score'
                          : 'Needs Review'}
                      </div>
                    </td>
                    <td>
                      <div className="attributes-pill">
                        {p.extracted_attributes ? Object.entries(p.extracted_attributes).slice(0, 2).map(([k, v]) => (
                           <span key={k} className="pill">{k}: {Array.isArray(v) ? v.join(', ') : v}</span>
                        )) : 'None'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <span className="badge badge-review">{(p.confidence_score * 100).toFixed(0)}%</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '8px' }}>
                        {p.alternative_suggestions && p.alternative_suggestions.map((sug, i) => (
                          <button key={i} className="btn-outline suggestion-btn" onClick={() => handleManualCategorize(p.id, sug)}>
                            {sug.replace('Raw AI Output: ', '')}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualReview;
