import React, { useEffect, useState } from 'react';
import { FiCpu, FiImage, FiPackage, FiBox, FiTag } from 'react-icons/fi';
import './BulkAnimation.css';

const BulkAnimation = ({ onComplete }) => {
  const [stage, setStage] = useState('entering');

  useEffect(() => {
    // Stage 1: Entering (0-500ms)
    // Stage 2: Processing (images flying into brain) (500ms - 3000ms)
    // Stage 3: Exiting (brain flashes green and fades out) (3000ms - 3500ms)
    
    const t1 = setTimeout(() => setStage('processing'), 500);
    const t2 = setTimeout(() => setStage('exiting'), 3000);
    const t3 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  // Generate 20 random particles that will fly into the center
  const particles = Array.from({ length: 20 }).map((_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 30; // vw distance
    const delay = Math.random() * 1.5;
    const duration = 0.6 + Math.random() * 0.4;
    const icons = [FiImage, FiPackage, FiBox, FiTag];
    const Icon = icons[Math.floor(Math.random() * icons.length)];
    
    return { id: i, angle, distance, delay, duration, Icon };
  });

  return (
    <div className={`bulk-animation-overlay ${stage}`}>
      
      <div className="particles-container">
        {particles.map(p => (
          <div 
            key={p.id} 
            className="particle"
            style={{
              '--angle': `${p.angle}rad`,
              '--distance': `${p.distance}vw`,
              '--delay': `${p.delay}s`,
              '--duration': `${p.duration}s`
            }}
          >
            <div className="particle-card">
              <p.Icon size={24} color="#6d7175" />
            </div>
          </div>
        ))}
      </div>

      <div className="ai-core">
        <div className="core-rings" />
        <div className="core-pulse" />
        <div className="core-icon-container">
          <FiCpu size={60} className="core-icon" />
        </div>
      </div>

      <div className="animation-text">
        <h2 className="gradient-text">AI Engine Engaged</h2>
        <p>Autonomously classifying products into Shopify Taxonomy...</p>
      </div>
    </div>
  );
};

export default BulkAnimation;
