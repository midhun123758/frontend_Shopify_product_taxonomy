import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiFile, FiCheckCircle } from 'react-icons/fi';
import { api } from '../api';
import './DragDrop.css';

const DragDrop = ({ onUploadSuccess }) => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  }, []);

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    setError(null);
    if (!selectedFile.name.endsWith('.xlsx')) {
      setError('Please upload a valid .xlsx Excel file.');
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await api.uploadProducts(formData);
      setFile(null);
      if (onUploadSuccess) onUploadSuccess(data);
      // Auto-redirect directly to Live Dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file. Please ensure the backend is running.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="slide-up" style={{ marginTop: '-40px' }}>
      
      {/* 1. FULL-SCREEN HERO VIEW WITH ANIMATED MERCHANT THINKING VISUAL */}
      <div 
        className="hero-banner-container"
        style={{
          height: '78vh',
          minHeight: '540px',
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '36px max(24px, calc((100vw - 1200px) / 2 + 24px))',
          overflow: 'hidden'
        }}
      >
        {/* Animated Background Image Layer (Camera Zoom-In & Continuous Gentle Floating Person) */}
        <div 
          className="hero-bg-layer"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('/merch_thinking_banner.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }}
        />

        {/* Top gradient overlay for text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '180px',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0) 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        {/* Hero Title Header with staggered slide-in animation */}
        <div className="hero-title-header" style={{ position: 'relative', zIndex: 2, maxWidth: '520px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#008060', color: 'white', padding: '8px 18px', borderRadius: '24px', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.5px', boxShadow: '0 4px 12px rgba(0,128,96,0.3)', marginBottom: '12px' }}>
            <span>SHOPIFY AI TAXONOMY ENGINE</span>
          </div>
          <h1 style={{ color: '#202223', fontSize: '2.4rem', fontWeight: 800, margin: 0, textShadow: '0 2px 8px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.9)' }}>
            The Merch Problem: Solved by AI
          </h1>
          <p style={{ color: '#4a4d4e', fontSize: '1.05rem', maxWidth: '480px', marginTop: '8px', fontWeight: 600, textShadow: '0 1px 4px rgba(255,255,255,0.9)' }}>
            Automatically map thousands of store products into Shopify's official taxonomy tree in seconds.
          </p>
        </div>

        {/* Floating Animated Scroll Down Button */}
        <div 
          className="animated-scroll-btn"
          onClick={() => {
            const el = document.getElementById('upload-sheet');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          style={{
            position: 'relative',
            zIndex: 2,
            alignSelf: 'center',
            background: 'linear-gradient(135deg, #008060 0%, #00a878 100%)',
            color: '#ffffff',
            padding: '14px 32px',
            borderRadius: '30px',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0, 128, 96, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.3s ease'
          }}
        >
          <span>Scroll down to upload catalog</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>↓</span>
        </div>
      </div>


      {/* 2. OVERRIDING UPLOAD SHEET (Slides over the background image on scroll) */}
      <div 
        id="upload-sheet"
        style={{
          marginTop: '-70px',
          position: 'relative',
          zIndex: 10,
          background: '#ffffff',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.12), 0 4px 24px rgba(0, 128, 96, 0.1)',
          border: '1px solid #e1e3e5'
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ color: '#202223', fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>
            Upload Product Catalog
          </h2>
          <p style={{ color: '#6d7175', fontSize: '1.02rem', lineHeight: 1.5 }}>
            Select or drag & drop your Excel dataset (`.xlsx` format) below. Our hybrid RAG algorithm will automatically deduplicate variants and classify them into official Shopify categories.
          </p>
        </div>

        {/* Drop Zone */}
        <div 
          className={`drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
          style={{
            background: file ? '#e6f4ea' : '#f8fafc',
            border: isDragging ? '2px dashed #008060' : file ? '2px solid #008060' : '2px dashed #c9cccf',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'all 0.25s ease'
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input 
            type="file" 
            id="fileInput" 
            accept=".xlsx" 
            onChange={handleFileInput} 
            style={{ display: 'none' }} 
          />
          
          {!file ? (
            <div className="flex-center" style={{ flexDirection: 'column', gap: '14px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiUploadCloud size={32} color="#008060" />
              </div>
              <div>
                <p style={{ color: '#202223', fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>
                  {isDragging ? 'Drop your Excel file here!' : 'Click to select or drag & drop .xlsx file'}
                </p>
                <p style={{ color: '#6d7175', fontSize: '0.9rem' }}>
                  Supports catalogs with 10,000+ product variants
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-center" style={{ flexDirection: 'column', gap: '14px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiFile size={32} color="#008060" />
              </div>
              <div>
                <p style={{ color: '#202223', fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{file.name}</p>
                <p style={{ color: '#008060', fontWeight: 600, fontSize: '0.9rem' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB — Ready for AI Classification
                </p>
              </div>
            </div>
          )}
        </div>

        {error && <div className="error-message" style={{ marginTop: '16px', background: '#ffebe9', color: '#d21c1c', borderLeft: '4px solid #d21c1c', padding: '12px 16px', borderRadius: '6px' }}>{error}</div>}

        {/* Action Button */}
        <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn" 
            disabled={!file || isUploading}
            onClick={handleUpload}
            style={{
              padding: '14px 28px',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: '10px',
              background: file ? 'linear-gradient(135deg, #008060 0%, #00a878 100%)' : '#c9cccf',
              color: 'white',
              border: 'none',
              cursor: file && !isUploading ? 'pointer' : 'not-allowed',
              boxShadow: file ? '0 4px 14px rgba(0,128,96,0.35)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {isUploading ? (
              'Uploading & Processing...'
            ) : (
              <>
                <FiCheckCircle size={20} /> Start AI Classification
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};

export default DragDrop;
