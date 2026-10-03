import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import DragDrop from './components/DragDrop';
import Dashboard from './components/Dashboard';
import ProcessingPage from './components/ProcessingPage';
import ProductCatalog from './components/ProductCatalog';
import CompletedDashboard from './components/CompletedDashboard';
import ManualReview from './components/ManualReview';
import FamilyDetail from './components/FamilyDetail';
import ProductAnalysis from './components/ProductAnalysis';
import { FiUploadCloud, FiActivity, FiCpu, FiGrid, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { BatchProvider, BatchContext } from './BatchContext';

function App() {
  const getNavStyle = ({ isActive }) => ({
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '0.92rem',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    background: isActive ? 'rgba(0, 168, 120, 0.2)' : 'rgba(255, 255, 255, 0.04)',
    color: isActive ? '#34d399' : 'var(--text-muted)',
    border: isActive ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: isActive ? '0 4px 14px rgba(0, 168, 120, 0.25)' : 'none'
  });

  return (
    <BatchProvider>
      <Router>
        <div style={{ width: '100%', margin: '0 auto', padding: '40px 4%' }}>
          
          {/* Navigation Header */}
          <header style={{ marginBottom: '40px', textAlign: 'center' }} className="slide-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ background: 'linear-gradient(135deg, #008060, #00a878)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(0, 168, 120, 0.4)' }}>
                S
              </div>
              <h1 className="gradient-text" style={{ fontSize: '2.4rem', margin: 0 }}>
                Shopify AI Taxonomy
              </h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '24px' }}>
              Autonomous Product Classification & Data Normalization Engine
            </p>

            {/* Global Batching Status Indicator */}
            <BatchContext.Consumer>
              {({ isBatching, batchProgress, timeLeft, stopBatching }) => isBatching ? (
                <div style={{
                  background: 'rgba(0, 168, 120, 0.1)',
                  border: '1px solid #00a878',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '24px',
                  boxShadow: '0 4px 20px rgba(0,168,120,0.15)'
                }}>
                  <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: '#00a878' }}></div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: '#34d399', fontWeight: 'bold' }}>Batch Manager Active</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Sent: {batchProgress} items | Next batch in: {timeLeft}s
                    </div>
                  </div>
                  <button 
                    onClick={stopBatching}
                    style={{
                      background: 'rgba(255, 59, 48, 0.1)',
                      border: '1px solid rgba(255, 59, 48, 0.3)',
                      color: '#ff3b30',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    Stop
                  </button>
                </div>
              ) : null}
            </BatchContext.Consumer>

            <nav style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <NavLink to="/upload" style={getNavStyle}>
                <FiUploadCloud /> Upload Data
              </NavLink>
              <NavLink to="/dashboard" style={getNavStyle}>
                <FiActivity /> Live Dashboard
              </NavLink>
              <NavLink to="/processing" style={getNavStyle}>
                <FiCpu /> Processing
              </NavLink>
              <NavLink to="/review" style={getNavStyle}>
                <FiAlertTriangle /> Manual Review
              </NavLink>
              <NavLink to="/catalog" style={getNavStyle}>
                <FiGrid /> Catalog
              </NavLink>
              <NavLink to="/completed" style={getNavStyle}>
                <FiCheckCircle /> Completed
              </NavLink>
            </nav>
          </header>

          {/* Centralized Routing Area */}
          <main>
            <Routes>
              <Route path="/upload" element={<DragDrop />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/processing" element={<ProcessingPage />} />
              <Route path="/review" element={<ManualReview />} />
              <Route path="/catalog" element={<ProductCatalog />} />
              <Route path="/completed" element={<CompletedDashboard />} />
              <Route path="/families/:familyId" element={<FamilyDetail />} />
              <Route path="/products/:productId" element={<ProductAnalysis />} />
              {/* Redirect any unknown paths to the upload page by default */}
              <Route path="*" element={<Navigate to="/upload" replace />} />
            </Routes>
          </main>

        </div>
      </Router>
    </BatchProvider>
  );
}

export default App;

