import React from 'react';

class ErrorBoundary extends React.Component {
  state = { 
    hasError: false,
    error: null,
    errorInfo: null 
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            padding: '2.5rem',
            borderRadius: '12px',
            backgroundColor: 'white',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
          }}>
            {/* Error Icon - Perfectly centered */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" fill="#fff0f0"/>
                <path
                  d="M12 8v4m0 4h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
                  stroke="#ff4d4f"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            
            {/* Error Heading */}
            <h2 style={{ 
              margin: '0 0 1rem 0',
              fontSize: '1.5rem',
              color: '#2d3748',
              fontWeight: 600,
              lineHeight: 1.3
            }}>
              Something went wrong
            </h2>
            
            {/* Error Message */}
            <p style={{ 
              margin: '0 0 2rem 0',
              color: '#4a5568',
              lineHeight: 1.6,
              fontSize: '1rem'
            }}>
              We've encountered an unexpected error. please Login again
            </p>

          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;