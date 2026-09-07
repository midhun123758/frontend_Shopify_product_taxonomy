import React from 'react';
import './ProcessingVisualizer.css';

const ProcessingVisualizer = React.memo(({ stats }) => {
  // If we have processing items, or pending items, the pipeline is active.
  const isProcessing = (stats?.processing > 0) || (stats?.pending > 0);
  
  return (
    <div className="visualizer-wrapper">
      <div className="visualizer-container">
        <div className={`scene ${isProcessing ? 'active' : 'idle'}`}>
          
          {/* Data input path */}
          <div className="path pending-path"></div>
          
          {/* Data output paths */}
          <div className="path completed-path"></div>
          <div className="path review-path"></div>

          {/* Flowing Excel File (Input) */}
          <div className="excel-file">
            <div className="excel-header"></div>
            <div className="excel-grid">
               <div className="cell"></div><div className="cell"></div>
               <div className="cell"></div><div className="cell"></div>
            </div>
            <div className="excel-logo">X</div>
          </div>

          {/* Flowing packets (Output) */}
          <div className="packet completed packet-4"></div>
          <div className="packet completed packet-5"></div>
          <div className="packet review packet-6"></div>

          {/* AI Core Cube */}
          <div className="cube-wrapper">
            <div className="cube">
              <div className="face front"></div>
              <div className="face back"></div>
              <div className="face right"></div>
              <div className="face left"></div>
              <div className="face top">
                <div className="top-glow"></div>
              </div>
              <div className="face bottom"></div>
            </div>
            <div className="core-shadow"></div>
          </div>

        </div>
      </div>
      
      <div className="visualizer-status">
        {isProcessing ? (
          <div className="status-active">
            <div className="pulse-dot"></div>
            <span>AI Pipeline Active</span>
          </div>
        ) : (
          <div className="status-idle">
            <span>System Idle - Waiting for Batch</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default ProcessingVisualizer;

