// Performance monitoring utilities
export const performanceMonitor = {
  // Track render times
  renderTimes: new Map(),
  
  // Start timing a component render
  startRender: (componentName) => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!performanceMonitor.renderTimes.has(componentName)) {
        performanceMonitor.renderTimes.set(componentName, []);
      }
      
      performanceMonitor.renderTimes.get(componentName).push(duration);
      
      // Log slow renders (over 16ms = 60fps threshold)
      if (duration > 16) {
        console.warn(`Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
      }
    };
  },
  
  // Get average render time for a component
  getAverageRenderTime: (componentName) => {
    const times = performanceMonitor.renderTimes.get(componentName);
    if (!times || times.length === 0) return 0;
    
    const sum = times.reduce((acc, time) => acc + time, 0);
    return sum / times.length;
  },
  
  // Clear render times
  clearRenderTimes: () => {
    performanceMonitor.renderTimes.clear();
  }
};

// Hook to monitor component performance
export const usePerformanceMonitor = (componentName) => {
  const endRender = useRef(null);
  
  useEffect(() => {
    endRender.current = performanceMonitor.startRender(componentName);
  }, [componentName]);
  
  useEffect(() => {
    if (endRender.current) {
      endRender.current();
    }
  });
};

// Debounce utility for expensive operations
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility for frequent events
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoization helper for expensive calculations
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
};

// Batch state updates to prevent multiple re-renders
export const batchStateUpdates = (setStateFunctions) => {
  return (updates) => {
    setStateFunctions.forEach(setState => {
      setState(updates);
    });
  };
};

// Performance warning for development
export const warnSlowOperation = (operationName, threshold = 100) => {
  const startTime = performance.now();
  return () => {
    const duration = performance.now() - startTime;
    if (duration > threshold) {
      console.warn(`Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
    }
  };
}; 