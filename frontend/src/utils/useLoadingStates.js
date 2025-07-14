import { useState, useEffect } from 'react';

export const useLoadingStates = () => {
  const [loadingStates, setLoadingStates] = useState({
    initial: false,
    skeleton: false,
    progressive: false,
    error: null,
    retryCount: 0
  });

  const setLoadingState = (key, value) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const startLoading = (type = 'initial') => {
    setLoadingStates(prev => ({
      ...prev,
      [type]: true,
      error: null
    }));
  };

  const stopLoading = (type = 'initial') => {
    setLoadingStates(prev => ({
      ...prev,
      [type]: false
    }));
  };

  const setError = (error) => {
    setLoadingStates(prev => ({
      ...prev,
      error,
      initial: false,
      skeleton: false,
      progressive: false
    }));
  };

  const retry = () => {
    setLoadingStates(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      error: null
    }));
  };

  return {
    loadingStates,
    setLoadingState,
    startLoading,
    stopLoading,
    setError,
    retry
  };
};

// Hook for progressive loading with timeouts
export const useProgressiveLoading = (initialDelay = 300, skeletonDelay = 1000) => {
  const [loadingPhase, setLoadingPhase] = useState('initial');
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setLoadingPhase('skeleton');
      setShowSkeleton(true);
    }, initialDelay);

    const skeletonTimer = setTimeout(() => {
      setLoadingPhase('timeout');
    }, skeletonDelay);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(skeletonTimer);
    };
  }, [initialDelay, skeletonDelay]);

  const resetLoading = () => {
    setLoadingPhase('initial');
    setShowSkeleton(false);
  };

  return {
    loadingPhase,
    showSkeleton,
    resetLoading
  };
};

// Hook for handling API loading states
export const useApiLoading = () => {
  const [apiStates, setApiStates] = useState({
    isLoading: false,
    isError: false,
    error: null,
    data: null,
    retryCount: 0
  });

  const executeApiCall = async (apiFunction, ...args) => {
    setApiStates(prev => ({
      ...prev,
      isLoading: true,
      isError: false,
      error: null
    }));

    try {
      const result = await apiFunction(...args);
      setApiStates(prev => ({
        ...prev,
        isLoading: false,
        data: result,
        isError: false
      }));
      return result;
    } catch (error) {
      setApiStates(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        error: error.message || 'An error occurred'
      }));
      throw error;
    }
  };

  const retry = () => {
    setApiStates(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      isError: false,
      error: null
    }));
  };

  return {
    ...apiStates,
    executeApiCall,
    retry
  };
}; 