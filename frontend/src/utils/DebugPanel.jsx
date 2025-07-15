import React, { useState, useEffect } from 'react';
import { logger } from './logger';

const DebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logStatus, setLogStatus] = useState(logger.getStatus());
  const [logLevel, setLogLevel] = useState(logStatus.logLevel);

  useEffect(() => {
    // Show debug panel if URL has debug=true
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true') {
      setIsVisible(true);
    }
  }, []);

  const togglePanel = () => {
    setIsVisible(!isVisible);
  };

  const enableLogs = (enabled) => {
    logger.enableProductionLogs(enabled);
    setLogStatus(logger.getStatus());
  };

  const changeLogLevel = (level) => {
    logger.setLogLevel(level);
    setLogLevel(level);
    setLogStatus(logger.getStatus());
  };

  const testLogs = () => {
    logger.log('Test log message');
    logger.info('Test info message');
    logger.warn('Test warning message');
    logger.error('Test error message');
    logger.performance('Test performance message');
    logger.force('Test force log message');
  };

  if (!isVisible) {
    return (
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          background: '#333',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
        onClick={togglePanel}
      >
        🐛 Debug
      </div>
    );
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        background: '#333',
        color: 'white',
        padding: '15px',
        borderRadius: '5px',
        minWidth: '300px',
        fontSize: '12px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0 }}>🐛 Debug Panel</h4>
        <button 
          onClick={togglePanel}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Environment:</strong> {logStatus.isDevelopment ? 'Development' : 'Production'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Logging Enabled:</strong> {logStatus.canLog ? '✅ Yes' : '❌ No'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>
          <strong>Enable Logs:</strong>
          <input
            type="checkbox"
            checked={logStatus.isProductionLoggingEnabled}
            onChange={(e) => enableLogs(e.target.checked)}
            style={{ marginLeft: '10px' }}
          />
        </label>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>
          <strong>Log Level:</strong>
          <select
            value={logLevel}
            onChange={(e) => changeLogLevel(e.target.value)}
            style={{ marginLeft: '10px', padding: '2px' }}
          >
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
            <option value="none">None</option>
          </select>
        </label>
      </div>
      
      <button
        onClick={testLogs}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          cursor: 'pointer',
          marginRight: '10px'
        }}
      >
        Test Logs
      </button>
      
      <button
        onClick={() => {
          localStorage.removeItem('enableProductionLogs');
          window.location.reload();
        }}
        style={{
          background: '#dc3545',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        Reset
      </button>
      
      <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
        <div>💡 Add ?debug=true to URL to show this panel</div>
        <div>💡 Use window.enableLogs(true) in console</div>
        <div>💡 Use window.setLogLevel('debug') in console</div>
      </div>
    </div>
  );
};

export default DebugPanel; 