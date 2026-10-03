import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import './Dashboard.css';
import ProcessingVisualizer from './ProcessingVisualizer';
import { FiCheck, FiClock, FiAlertTriangle, FiLoader, FiTrash2, FiImage, FiInfo, FiUploadCloud, FiCpu, FiList } from 'react-icons/fi';
import { BatchContext } from '../BatchContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pending: 0, processing: 0, completed: 0, review: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showBulkAnimation, setShowBulkAnimation] = useState(false);
  const { startBatching, stopBatching } = useContext(BatchContext);

  const fetchDashboardData = async () => {
    try {
      const statsData = await api.getStats();
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

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
          
          if (['COMPLETED', 'MANUAL_REVIEW'].includes(data.status)) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              if (isActive) fetchDashboardData();
            }, 1000);
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

  const handleClearData = async () => {
    if (window.confirm("⚠️ Are you sure you want to clear all imported products, families, and reset the Redis queue?")) {
      try {
        if (stopBatching) stopBatching();
        await api.clearAllData();
        alert("✅ All dataset products and Redis queues cleared successfully.");
        fetchDashboardData();
      } catch (err) {
        console.error("Failed to clear data:", err);
        alert("Failed to clear data.");
      }
    }
  };

  if (loading) {
    return <div className="flex-center" style={{ padding: '40px' }}><FiLoader className="spin" size={32} /></div>;
  }

  const handleResume = () => {
    startBatching();
    setShowBulkAnimation(true);
    fetchDashboardData();
    navigate('/processing');
  };

  if (stats.total === 0) {
    return (
      <div className="dashboard-container slide-up flex-center" style={{ padding: '60px', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
        <h2 className="gradient-text">No Products in Database</h2>
        <p style={{ color: 'var(--text-muted)' }}>Upload a dataset to view real-time AI classification metrics and controls.</p>
        <button 
          style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={handleClearData}
        >
          <FiTrash2 size={16} /> Flush Queue & Reset Database
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container slide-up">
      <div className="dashboard-header">
        <div>
          <h2>AI Classification Dashboard</h2>
          <p className="subtitle">Real-time metrics for ApexDelta taxonomy mapping</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-primary"
            style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)' 
            }}
            onClick={handleResume}
          >
            Start Bulk AI Batch
          </button>
          <button 
            style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'opacity 0.2s' }} 
            onClick={handleClearData}
            onMouseOver={(e) => e.target.style.opacity = 0.8}
            onMouseOut={(e) => e.target.style.opacity = 1}
          >
            <FiTrash2 size={16} /> Reset Queue & Clear Data
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

      <div className="instructions-section glass-card" style={{ marginTop: '32px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#202223', marginBottom: '16px' }}>
          <FiInfo color="#4f46e5" /> How to Use the AI Processing Pipeline
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
              <span style={{ background: '#e2e8f0', color: '#475569', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>1</span>
              <FiUploadCloud /> Upload Data
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Go to the <strong>Upload</strong> tab and drop your Excel dataset containing product names and descriptions.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
              <span style={{ background: '#e2e8f0', color: '#475569', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>2</span>
              <FiCpu /> Start Processing
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Click <strong>Start Bulk AI Batch</strong> on this dashboard. The AI will securely process items in batches of 10 per minute.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
              <span style={{ background: '#e2e8f0', color: '#475569', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>3</span>
              <FiAlertTriangle /> Resolve Reviews
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Check the <strong>Manual Review</strong> tab to approve categories for products that the AI wasn't 100% confident about.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
              <span style={{ background: '#e2e8f0', color: '#475569', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>4</span>
              <FiList /> Export Catalog
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Visit the <strong>Completed</strong> tab to view your fully structured catalog mapped to Shopify Taxonomy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
