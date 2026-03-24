import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingSpinner = ({ 
  size = 40, 
  color = '#3b82f6', 
  text = 'Loading...',
  fullScreen = false 
}) => {
  const spinner = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      minHeight: '200px'
    }}>
      <FaSpinner 
        size={size} 
        color={color} 
        style={{ animation: 'spin 1s linear infinite' }}
      />
      {text && <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{text}</p>}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255,255,255,0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;