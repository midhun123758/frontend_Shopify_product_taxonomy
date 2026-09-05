import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './Dashboard.css';
import ProcessingVisualizer from './ProcessingVisualizer';
import { FiCheck, FiClock, FiAlertTriangle, FiLoader } from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState({ pending: 0, processing: 0, completed: 0, review: 0, total: 0 });
  const [reviewProducts, setReviewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch the fast stats
      const statsData = await api.getStats();
      setStats(statsData);

      // 2. Only fetch the review table if there are actually items to review!
      if (statsData.review > 0) {
        const reviewData = await api.getReviewProducts(1);
        setReviewProducts(reviewData.results || reviewData);
      } else {
        setReviewProducts([]);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Poll every 10 seconds for live updates to reduce network spam
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="flex-center" style={{ padding: '40px' }}><FiLoader className="spin" size={32} /></div>;
  }

  if (stats.total === 0) {
    return null; // Don't show dashboard if no products exist yet
  }

  const handleManualCategorize = async (productId, categoryString) => {
    try {
      await api.updateProductCategory(productId, categoryString);
      fetchDashboardData(); 
    } catch (err) {
      console.error("Failed to update product:", err);
      alert("Failed to categorize product. Make sure the category exists.");
    }
  };

  const handlePause = async () => {
    try {
      await api.pauseProcessing();
      alert("AI Processing has been PAUSED.");
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to pause:", err);
      alert("Failed to pause processing.");
    }
  };

  const handleResume = async () => {
    try {
      await api.resumeProcessing();
      alert("AI Processing RESUMED.");
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to resume:", err);
      alert("Failed to resume processing.");
    }
  };

  return (
    <div className="dashboard-container slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="gradient-text" style={{ margin: 0 }}>AI Classification Status</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            style={{ background: '#f59e0b', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }} 
            onClick={handlePause}
            disabled={stats.pending === 0}
            onMouseOver={(e) => e.target.style.opacity = 0.8}
            onMouseOut={(e) => e.target.style.opacity = 1}
          >
            Pause Processing
          </button>
          <button 
            style={{ background: '#10b981', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }} 
            onClick={handleResume}
            disabled={stats.pending === 0}
            onMouseOver={(e) => e.target.style.opacity = 0.8}
            onMouseOut={(e) => e.target.style.opacity = 1}
          >
            Resume Processing
          </button>
        </div>
      </div>

      <ProcessingVisualizer stats={stats} />
      
      <div className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }}>
            <FiClock size={24} />
          </div>
          <div className="stat-info">
            <h3>Pending</h3>
            <p className="stat-value">{stats.pending}</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
            <FiLoader size={24} className={stats.processing > 0 ? "spin" : ""} />
          </div>
          <div className="stat-info">
            <h3>Processing</h3>
            <p className="stat-value">{stats.processing}</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <FiCheck size={24} />
          </div>
          <div className="stat-info">
            <h3>Completed</h3>
            <p className="stat-value">{stats.completed}</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <FiAlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <h3>Needs Review</h3>
            <p className="stat-value">{stats.review}</p>
          </div>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div className="progress-fill success" style={{ width: `${(stats.completed / stats.total) * 100}%` }}></div>
          <div className="progress-fill processing" style={{ width: `${(stats.processing / stats.total) * 100}%` }}></div>
          <div className="progress-fill review" style={{ width: `${(stats.review / stats.total) * 100}%` }}></div>
        </div>
        <p style={{ textAlign: 'right', marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {stats.completed + stats.review} / {stats.total} Processed
        </p>
      </div>

      {stats.review > 0 && (
        <div className="review-section glass-card" style={{ marginTop: '32px' }}>
          <h3 style={{ color: 'var(--warning)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiAlertTriangle /> Action Required: Manual Reviews
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            The AI could not automatically map these to a 100% exact Shopify leaf node. Please click one of the AI's alternative suggestions to approve it.
          </p>

          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Reason for Review</th>
                  <th>Extracted Attributes</th>
                  <th>AI Confidence</th>
                  <th>AI Suggestions (Click to Approve)</th>
                </tr>
              </thead>
              <tbody>
                {reviewProducts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>SKU: {p.sku || 'N/A'}</div>
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
                    <td>
                      <span className="badge badge-review">{(p.confidence_score * 100).toFixed(0)}%</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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

export default Dashboard;
