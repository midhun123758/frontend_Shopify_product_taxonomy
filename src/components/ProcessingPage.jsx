import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { BatchContext } from '../BatchContext';
import { 
  FiCpu, FiLoader, FiCheckCircle, FiClock, FiAlertTriangle, 
  FiSearch, FiImage, FiTag, FiPackage, FiChevronRight, FiPlay, FiStopCircle, FiRefreshCw, FiTrash2 
} from 'react-icons/fi';

const ProcessingPage = () => {
  const navigate = useNavigate();
  const { isBatching, batchProgress, timeLeft, startBatching, stopBatching } = useContext(BatchContext);
  
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [stats, setStats] = useState({ pending: 0, processing: 0, completed: 0, review: 0, total: 0 });

  // Debounce search input
  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(h);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const fetchProcessingFamilies = async () => {
    try {
      // Fetch both PROCESSING and PENDING items
      const statsData = await api.getStats();
      setStats(statsData);

      const processingRes = await api.getFamilies(debouncedSearch, 'PROCESSING', currentPage);
      let items = processingRes.results || [];

      // If processing items are fewer than page size, append PENDING items to fill the view
      if (items.length < 15) {
        const pendingRes = await api.getFamilies(debouncedSearch, 'PENDING', currentPage);
        const pendingItems = pendingRes.results || [];
        
        // Merge without duplicates
        const existingIds = new Set(items.map(i => i.id));
        for (let p of pendingItems) {
          if (!existingIds.has(p.id)) {
            items.push(p);
          }
        }
      }

      setFamilies(items);
      setTotalCount((statsData.processing || 0) + (statsData.pending || 0));
      setHasNext(!!processingRes.next);
      setHasPrev(!!processingRes.previous);
    } catch (err) {
      console.error('Failed to fetch processing families:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcessingFamilies();

    // Poll every 3 seconds to keep progress updated
    const interval = setInterval(() => {
      fetchProcessingFamilies();
    }, 3000);

    return () => clearInterval(interval);
  }, [debouncedSearch, currentPage]);

  // Real-time WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}/ws/updates/`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.id) {
          setFamilies(prev => {
            if (data.status === 'COMPLETED' || data.status === 'MANUAL_REVIEW') {
              // Remove finished items from processing list
              return prev.filter(f => String(f.id) !== String(data.id));
            }
            // Update processing item status
            return prev.map(f => String(f.id) === String(data.id) ? { ...f, ...data } : f);
          });
          api.getStats().then(setStats).catch(() => {});
        }
      } catch (err) {
        console.error("WS Parse Error:", err);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleStart = () => {
    startBatching();
    fetchProcessingFamilies();
  };

  const handleStop = () => {
    stopBatching();
  };

  const handleClearData = async () => {
    if (window.confirm("⚠️ Are you sure you want to clear all imported products, families, and reset the Redis queue?")) {
      try {
        if (stopBatching) stopBatching();
        await api.clearAllData();
        alert("✅ All dataset products and Redis queues cleared successfully.");
        fetchProcessingFamilies();
      } catch (err) {
        console.error("Failed to clear data:", err);
        alert("Failed to clear data.");
      }
    }
  };

  return (
    <div className="slide-up">

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="gradient-text" style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiCpu color="#34d399" /> Live Processing Dashboard
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {totalCount} product {totalCount === 1 ? 'family' : 'families'} in active AI classification pipeline ({stats.processing} processing, {stats.pending} pending)
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!isBatching ? (
            <button
              onClick={handleStart}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none',
                color: 'white', fontWeight: 700, fontSize: '0.92rem', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              <FiPlay size={16} /> Start Processing Batch
            </button>
          ) : (
            <button
              onClick={handleStop}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171', fontWeight: 700, fontSize: '0.92rem'
              }}
            >
              <FiStopCircle size={16} /> Pause Batch
            </button>
          )}

          <button
            onClick={handleClearData}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
              background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171', fontWeight: 600, fontSize: '0.88rem'
            }}
          >
            <FiTrash2 size={16} /> Clear Data
          </button>

          <button
            onClick={fetchProcessingFamilies}
            style={{
              padding: '10px', borderRadius: '8px', cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary)'
            }}
            title="Refresh List"
          >
            <FiRefreshCw className={loading ? "spin" : ""} size={16} />
          </button>
        </div>
      </div>

      {/* Batching Active Notification Bar */}
      {isBatching && (
        <div className="glass-card" style={{ marginBottom: '20px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#34d399' }}></div>
            <div>
              <div style={{ color: '#34d399', fontWeight: 700, fontSize: '0.92rem' }}>Batch Manager Active</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Dispatched {batchProgress} items · Pacing limit: 10 items / minute
              </div>
            </div>
          </div>
          {timeLeft > 0 ? (
            <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', padding: '4px 12px', borderRadius: '16px', fontSize: '0.82rem', fontWeight: 600 }}>
              Next batch dispatch in: <strong>{timeLeft}s</strong>
            </span>
          ) : (
            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', padding: '4px 12px', borderRadius: '16px', fontSize: '0.82rem', fontWeight: 600 }}>
              Dispatching next batch...
            </span>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="glass-card" style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <FiSearch color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search processing or pending families by title or brand..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'white', fontSize: '1rem'
          }}
        />
      </div>

      {/* Loading State */}
      {loading && families.length === 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            Loading processing pipeline...
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && families.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <FiCheckCircle size={48} color="#34d399" style={{ marginBottom: '16px', opacity: 0.8 }} />
          <h3 style={{ color: '#34d399', margin: '0 0 8px 0' }}>All Queue Items Processed</h3>
          <p style={{ maxWidth: '480px', margin: '0 auto 20px auto', fontSize: '0.92rem' }}>
            There are no products currently processing or pending in the queue.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              className="btn-primary"
              onClick={() => navigate('/completed')}
              style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' }}
            >
              View Completed Catalog →
            </button>
            {stats.review > 0 && (
              <button
                className="btn-outline"
                onClick={() => navigate('/review')}
                style={{ color: '#fbbf24', borderColor: 'rgba(251,191,36,0.4)' }}
              >
                Manual Review ({stats.review}) →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Processing & Pending Cards Grid (Matching CompletedDashboard Style) */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {families.map(f => {
          const isProcessing = f.status === 'PROCESSING';

          return (
            <div
              key={f.id}
              className="glass-card"
              style={{
                border: expanded === f.id ? '1px solid rgba(99,102,241,0.5)' : isProcessing ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid rgba(255,255,255,0.07)',
                background: isProcessing ? 'rgba(52, 211, 153, 0.03)' : 'rgba(255,255,255,0.02)',
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

                    {/* Status Badge */}
                    {isProcessing ? (
                      f.predicted_category_name ? (
                        <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FiLoader className="spin" size={14} /> Extracting Attributes
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(52, 211, 153, 0.18)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.4)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FiLoader className="spin" size={14} /> Categorizing Product
                        </span>
                      )
                    ) : (
                      <span style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiClock size={14} /> Pending in Queue
                      </span>
                    )}
                  </div>

                  {/* Category Path or Pipeline Status */}
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <FiTag size={14} color="var(--primary)" />
                    <span style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.9rem' }}>
                      {f.predicted_category_name ? (
                        <span><strong style={{ color: '#34d399' }}>Predicted Category:</strong> {f.predicted_category_name}</span>
                      ) : isProcessing ? (
                        'Analyzing Taxonomy...'
                      ) : (
                        'Waiting in Queue'
                      )}
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
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Extracting attributes...</span>
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
                        Action & Details
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
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {(hasNext || hasPrev) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
          <div style={{ color: 'var(--text-muted)' }}>
            Page {currentPage} · {totalCount} total in queue
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

export default ProcessingPage;
