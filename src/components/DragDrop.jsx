import React, { useState, useCallback } from 'react';
import { FiUploadCloud, FiFile, FiCheckCircle } from 'react-icons/fi';
import { api } from '../api';
import './DragDrop.css';

const DragDrop = ({ onUploadSuccess }) => {
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
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file. Please ensure the backend is running.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-card upload-section">
      <h2 className="gradient-text" style={{ marginBottom: '16px' }}>Upload Products</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Drag and drop your massive Excel catalog here. Our AI will automatically categorize them into Shopify's official taxonomy.
      </p>

      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
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
          <div className="flex-center" style={{ flexDirection: 'column', gap: '12px' }}>
            <FiUploadCloud size={48} color={isDragging ? 'var(--primary)' : 'var(--text-muted)'} />
            <p style={{ color: 'var(--text-main)', fontWeight: 500 }}>
              {isDragging ? 'Drop it here!' : 'Click or drag .xlsx file here'}
            </p>
          </div>
        ) : (
          <div className="flex-center" style={{ flexDirection: 'column', gap: '12px' }}>
            <FiFile size={48} color="var(--primary)" />
            <p style={{ color: 'var(--text-main)', fontWeight: 500 }}>{file.name}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          className="btn" 
          disabled={!file || isUploading}
          onClick={handleUpload}
        >
          {isUploading ? (
            'Uploading & Processing...'
          ) : (
            <>
              <FiCheckCircle /> Start AI Classification
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DragDrop;
