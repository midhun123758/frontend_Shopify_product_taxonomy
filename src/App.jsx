import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import DragDrop from './components/DragDrop';
import Dashboard from './components/Dashboard';
import ProductCatalog from './components/ProductCatalog';
import CompletedDashboard from './components/CompletedDashboard';
import FamilyDetail from './components/FamilyDetail';
import ProductAnalysis from './components/ProductAnalysis';
import CategoryWayfinder from './components/CategoryWayfinder';
import BrandCatalog from './components/BrandCatalog';
import { FiUploadCloud, FiActivity, FiGrid, FiCheckCircle, FiCompass, FiAward } from 'react-icons/fi';

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
    <Router>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
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

          <nav style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <NavLink to="/upload" style={getNavStyle}>
              <FiUploadCloud /> Upload Data
            </NavLink>
            <NavLink to="/dashboard" style={getNavStyle}>
              <FiActivity /> Live Dashboard
            </NavLink>
            <NavLink to="/catalog" style={getNavStyle}>
              <FiGrid /> Catalog
            </NavLink>
            <NavLink to="/brands" style={getNavStyle}>
              <FiAward /> Brands
            </NavLink>
            <NavLink to="/wayfinder" style={getNavStyle}>
              <FiCompass /> Category Wayfinder
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
            <Route path="/catalog" element={<ProductCatalog />} />
            <Route path="/brands" element={<BrandCatalog />} />
            <Route path="/wayfinder" element={<CategoryWayfinder />} />
            <Route path="/completed" element={<CompletedDashboard />} />
            <Route path="/families/:familyId" element={<FamilyDetail />} />
            <Route path="/products/:productId" element={<ProductAnalysis />} />
            {/* Redirect any unknown paths to the upload page by default */}
            <Route path="*" element={<Navigate to="/upload" replace />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;

