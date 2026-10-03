import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { FiCpu, FiCheckCircle, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import './AIAnalysisModal.css';

const POLL_INTERVAL_MS = 1500;
const REDIRECT_DELAY_MS = 2800;
const MAX_POLL_ATTEMPTS = 40; // ~1 minute at 1.5s intervals
const STEP_MESSAGES = [
  { delay: 0, text: 'Analyzing Product Details & Attributes...' },
  { delay: 1200, text: 'Matching Official Shopify Taxonomy...' },
  { delay: 2400, text: 'Finalizing Classification...' },
];

const STAGES = {
  SCANNING: 'SCANNING',
  COMPLETED: 'COMPLETED',
  REVIEW: 'REVIEW',
  ERROR: 'ERROR',
};

const AIAnalysisModal = ({ family, onClose }) => {
  const navigate = useNavigate();
  const [stage, setStage] = useState(STAGES.SCANNING);
  const [stepText, setStepText] = useState(STEP_MESSAGES[0].text);
  const [resultFamily, setResultFamily] = useState(family);

  // Refs so the polling loop always sees latest values without re-triggering the effect
  const activeRef = useRef(true);
  const attemptsRef = useRef(0);
  const intervalRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const navigateRef = useRef(navigate);

  useEffect(() => {
    onCloseRef.current = onClose;
    navigateRef.current = navigate;
  }, [onClose, navigate]);

  // Cycle through the "thinking" copy while scanning
  useEffect(() => {
    if (stage !== STAGES.SCANNING) return undefined;

    const timers = STEP_MESSAGES.map(({ delay, text }) =>
      setTimeout(() => setStepText(text), delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [stage]);

  const finishAndRedirect = useCallback((path) => {
    setTimeout(() => {
      if (activeRef.current) {
        onCloseRef.current?.();
        navigateRef.current(path);
      }
    }, REDIRECT_DELAY_MS);
  }, []);

  // Listen for WebSocket updates instead of polling
  useEffect(() => {
    activeRef.current = true;
    
    const ws = new WebSocket(`ws://${window.location.hostname}/ws/updates/`);
    
    ws.onmessage = (event) => {
      if (!activeRef.current) return;
      
      const data = JSON.parse(event.data);
      
      // Only process updates for THIS family
      if (String(data.id) === String(family.id)) {
        // If it's completed, OR if it's still processing but we already have a predicted category (Agent 1 finished)
        if (data.status === 'COMPLETED' || (data.status === 'PROCESSING' && data.predicted_category)) {
          // Merge WebSocket data with initial family data
          const updatedFamily = { ...family, ...data };
          setResultFamily(updatedFamily);
          setStage(STAGES.COMPLETED);
          finishAndRedirect('/completed');
        } else if (data.status === 'MANUAL_REVIEW' || data.status === 'FAILED') {
          const updatedFamily = { ...family, ...data };
          setResultFamily(updatedFamily);
          setStage(STAGES.REVIEW);
          finishAndRedirect('/dashboard');
        } else if (data.status === 'ERROR') {
          setStage(STAGES.ERROR);
        }
      }
    };

    // Fallback timeout in case WebSocket fails or task dies silently
    const fallbackTimeout = setTimeout(() => {
      if (activeRef.current && stage === STAGES.SCANNING) {
        setStage(STAGES.ERROR);
      }
    }, MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS);

    return () => {
      activeRef.current = false;
      clearTimeout(fallbackTimeout);
      ws.close();
    };
  }, [family, finishAndRedirect, stage]);

  // Close on Escape (only once we're not mid-scan, so users can't abandon a running job silently)
  useEffect(() => {
    if (stage === STAGES.SCANNING) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, onClose]);

  return (
    <div className="ai-modal-overlay" role="presentation">
      <div
        className="ai-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-modal-heading"
      >

        {stage === STAGES.SCANNING && (
          <div style={{ textAlign: 'center', padding: '36px 24px' }}>
            <div className="radar-spinner-container">
              <div className="radar-pulse"></div>
              <div className="radar-icon">
                <FiCpu size={36} color="#008060" />
              </div>
            </div>

            <h3 id="ai-modal-heading" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '20px 0 8px 0' }}>
              AI Classification in Progress
            </h3>

            <p style={{ color: '#008060', fontWeight: 700, fontSize: '0.92rem', marginBottom: '16px' }} aria-live="polite">
              {stepText}
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e1e3e5', padding: '12px 16px', borderRadius: '10px', fontSize: '0.88rem', color: '#4b5563', textTransform: 'capitalize', fontWeight: 600 }}>
              Analyzing Product Family:{' '}
              <span style={{ color: '#111827', fontWeight: 800 }}>"{family.normalized_title}"</span>
            </div>
          </div>
        )}

        {stage === STAGES.COMPLETED && (() => {
          const firstProduct = resultFamily.products?.[0];
          const imgUrl = firstProduct?.image_url;
          return (
            <div style={{ textAlign: 'center', padding: '36px 24px' }}>
              
              {imgUrl ? (
                <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto' }}>
                  <div className="success-glow"></div>
                  <div className="success-image-container">
                    <img src={imgUrl} alt="Classified Product" />
                  </div>
                </div>
              ) : (
                <div className="success-checkmark-badge">
                  <FiCheckCircle size={52} color="#008060" />
                </div>
              )}

              <h3 id="ai-modal-heading" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: '24px 0 8px 0', animation: 'popIn 0.8s ease' }}>
                Taxonomy Classification Confirmed!
              </h3>

              <div style={{ background: '#f0fdf4', border: '1.5px solid #008060', padding: '16px', borderRadius: '12px', margin: '16px 0', textAlign: 'left', animation: 'popIn 1s ease' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#008060', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>
                  MATCHED SHOPIFY CATEGORY
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827' }}>
                  {resultFamily.predicted_category_name || 'Classified'}
                </div>
                {resultFamily.confidence_score && (
                  <div style={{ marginTop: '6px', fontSize: '0.82rem', color: '#008060', fontWeight: 700 }}>
                    ✓ High Confidence Match ({Math.round(resultFamily.confidence_score * 100)}%)
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#008060', fontWeight: 800, fontSize: '0.95rem', animation: 'popIn 1.2s ease' }}>
                <span>Opening Detailed Analysis</span>
                <FiArrowRight className="bounce-x" size={18} />
              </div>
            </div>
          );
        })()}

        {stage === STAGES.REVIEW && (
          <div style={{ textAlign: 'center', padding: '36px 24px' }} className="slide-up">
            <div className="warning-alert-badge">
              <FiAlertTriangle size={52} color="#b25900" />
            </div>

            <h3 id="ai-modal-heading" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '16px 0 8px 0' }}>
              Requires Manual Review
            </h3>

            <p style={{ color: '#4b5563', fontSize: '0.92rem', marginBottom: '16px', fontWeight: 600 }}>
              AI confidence is below 86%. Please approve a category suggestion from the review queue.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#b25900', fontWeight: 800, fontSize: '0.95rem' }}>
              <span>Opening Manual Review Dashboard</span>
              <FiArrowRight className="bounce-x" size={18} />
            </div>
          </div>
        )}

        {stage === STAGES.ERROR && (
          <div style={{ textAlign: 'center', padding: '36px 24px' }} className="slide-up">
            <div className="warning-alert-badge">
              <FiAlertTriangle size={52} color="#b25900" />
            </div>

            <h3 id="ai-modal-heading" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '16px 0 8px 0' }}>
              Classification Timed Out
            </h3>

            <p style={{ color: '#4b5563', fontSize: '0.92rem', marginBottom: '16px', fontWeight: 600 }}>
              We couldn't confirm a result in time. You can check the dashboard or try again shortly.
            </p>

            <button
              type="button"
              onClick={() => onClose?.()}
              style={{
                background: '#111827', color: '#fff', border: 'none', borderRadius: '8px',
                padding: '10px 20px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AIAnalysisModal;