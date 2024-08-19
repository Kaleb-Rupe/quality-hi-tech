import React, { useState, useEffect } from 'react';
import '../css/loading-fallback.css';

const LoadingFallback = () => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!showLoading) return null;

  return (
    <div className="loading-fallback">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingFallback;