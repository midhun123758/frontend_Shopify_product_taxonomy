import React, { createContext, useState, useEffect } from 'react';
import { api } from './api';

export const BatchContext = createContext();

export const BatchProvider = ({ children }) => {
  const [isBatching, setIsBatching] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [nextBatchTime, setNextBatchTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let intervalId;
    let countdownId;

    const processNextBatch = async () => {
      try {
        const data = await api.getFamilies('', 'PENDING', 1);
        const familiesToProcess = (data.results || []).slice(0, 10);
        
        if (familiesToProcess.length === 0) {
          setIsBatching(false);
          setNextBatchTime(null);
          return;
        }

        for (let f of familiesToProcess) {
          try {
            await api.analyzeFamily(f.id);
          } catch (e) {
            console.error('Failed to analyze family', f.id, e);
          }
        }
        
        setBatchProgress(prev => prev + familiesToProcess.length);
        setNextBatchTime(Date.now() + 60000);
      } catch (err) {
        console.error('Failed to fetch pending families for batching', err);
      }
    };

    if (isBatching) {
      processNextBatch();
      intervalId = setInterval(() => {
        processNextBatch();
      }, 60000);
      
      countdownId = setInterval(() => {
        setNextBatchTime(prev => {
          if (prev) {
            const left = Math.max(0, Math.floor((prev - Date.now()) / 1000));
            setTimeLeft(left);
          }
          return prev;
        });
      }, 1000);
    } else {
      setNextBatchTime(null);
      setTimeLeft(0);
    }

    return () => {
      clearInterval(intervalId);
      clearInterval(countdownId);
    };
  }, [isBatching]);

  const startBatching = () => {
    setIsBatching(true);
    setBatchProgress(0);
  };

  const stopBatching = () => {
    setIsBatching(false);
  };

  return (
    <BatchContext.Provider value={{ isBatching, batchProgress, timeLeft, startBatching, stopBatching }}>
      {children}
    </BatchContext.Provider>
  );
};
