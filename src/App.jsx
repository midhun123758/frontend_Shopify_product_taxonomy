import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import DragDrop from './components/DragDrop';
import Dashboard from './components/Dashboard';
import ProductCatalog from './components/ProductCatalog';
import CompletedDashboard from './components/CompletedDashboard';
import FamilyDetail from './components/FamilyDetail';
import ProductAnalysis from './components/ProductAnalysis';
import { FiUploadCloud, FiActivity, FiGrid, FiCheckCircle } from 'react-icons/fi';

function App() {
  return (
    <Router>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Navigation Header */}
        <header style={{ marginBottom: '48px', textAlign: 'center' }} className="slide-up">
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
            Shopify AI Taxonomy
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '24px' }}>
            Autonomous Product Classification & Data Normalization
          </p>

          <nav style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/upload" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              <FiUploadCloud /> Upload Data
            </Link>
            <Link to="/dashboard" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              <FiActivity /> Live Dashboard
            </Link>
            <Link to="/catalog" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              <FiGrid /> Catalog
            </Link>
            <Link to="/completed" className="btn btn-outline" style={{ textDecoration: 'none', borderColor: 'rgba(16,185,129,0.5)', color: '#10b981' }}>
              <FiCheckCircle /> Completed
            </Link>
          </nav>
        </header>

        {/* Centralized Routing Area */}
        <main>
          <Routes>
            <Route path="/upload" element={<DragDrop />} />
            <Route path="/dashboard" element={<Dashboard />} />
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
  );
}

export default App;
