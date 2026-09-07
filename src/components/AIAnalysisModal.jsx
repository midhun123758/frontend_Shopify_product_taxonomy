import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { FiCpu, FiCheckCircle, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import './AIAnalysisModal.css';

const AIAnalysisModal = ({ family, onClose }) => {
  const navigate = useNavigate();
  const [stage, setStage] = useState('SCANNING'); // 'SCANNING' | 'COMPLETED' | 'REVIEW'
  const [stepText, setStepText] = useState('Analyzing Product Details & Attributes...');
  const [resultFamily, setResultFamily] = useState(family);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStepText('Matching Official Shopify Taxonomy...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setStepText('Finalizing Classification...');
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      try {
        const updated = await api.getFamilyDetail(family.id);
        if (!active) return;
        
        if (updated.status === 'COMPLETED') {
          setResultFamily(updated);
          setStage('COMPLETED');
          setTimeout(() => {
            if (active) {
              onClose();
              navigate('/completed');
            }
          }, 2400);
        } else if (updated.status === 'MANUAL_REVIEW' || updated.status === 'FAILED') {
          setResultFamily(updated);
          setStage('REVIEW');
          setTimeout(() => {
            if (active) {
              onClose();
              navigate('/dashboard');
            }
          }, 2400);
        }
      } catch (err) {
        console.error("Polling AI status error:", err);
      }
    };

    const interval = setInterval(checkStatus, 1000);
    checkStatus();

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [family.id, navigate, onClose]);

  return (
    <div className="ai-modal-overlay">
      <div className="ai-modal-card">
        
        {/* STAGE 1: SCANNING ANIMATION */}
        {stage === 'SCANNING' && (
          <div style={{ textAlign: 'center', padding: '36px 24px' }}>
            <div className="radar-spinner-container">
              <div className="radar-pulse"></div>
              <div className="radar-icon">
                <FiCpu size={36} color="#008060" />
              </div>
            </div>
            
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '20px 0 8px 0' }}>
              AI Classification in Progress
            </h3>
            
            <p style={{ color: '#008060', fontWeight: 700, fontSize: '0.92rem', marginBottom: '16px' }}>
              {stepText}
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e1e3e5', padding: '12px 16px', borderRadius: '10px', fontSize: '0.88rem', color: '#4b5563', textTransform: 'capitalize', fontWeight: 600 }}>
              Analyzing Product Family: <span style={{ color: '#111827', fontWeight: 800 }}>"{family.normalized_title}"</span>
            </div>
          </div>
        )}

        {/* STAGE 2: COMPLETED SUCCESS ANIMATION */}
        {stage === 'COMPLETED' && (
          <div style={{ textAlign: 'center', padding: '36px 24px' }} className="slide-up">
            <div className="success-checkmark-badge">
              <FiCheckCircle size={52} color="#008060" />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: '16px 0 8px 0' }}>
              Taxonomy Classification Confirmed!
            </h3>

            <div style={{ background: '#f0fdf4', border: '1.5px solid #008060', padding: '16px', borderRadius: '12px', margin: '16px 0', textAlign: 'left' }}>
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

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#008060', fontWeight: 800, fontSize: '0.95rem' }}>
              <span>Opening Completed Classifications</span>
              <FiArrowRight className="bounce-x" size={18} />
            </div>
          </div>
        )}

        {/* STAGE 3: MANUAL REVIEW NEEDED ANIMATION */}
        {stage === 'REVIEW' && (
          <div style={{ textAlign: 'center', padding: '36px 24px' }} className="slide-up">
            <div className="warning-alert-badge">
              <FiAlertTriangle size={52} color="#b25900" />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '16px 0 8px 0' }}>
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

      </div>
    </div>
  );
};

export default AIAnalysisModal;
