// utils/hooks.js - Custom hooks for performance optimization
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// Debounce hook for search performance
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Local storage hook with error handling
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// Previous value hook for comparing state changes
export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

// Pagination hook
export const usePagination = (data, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = useMemo(() => {
    return Math.ceil((data?.length || 0) / itemsPerPage);
  }, [data?.length, itemsPerPage]);
  
  const paginatedData = useMemo(() => {
    if (!data) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);
  
  const goToPage = useCallback((page) => {
    const validPage = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(validPage);
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);
  
  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);
  
  // Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data?.length]);
  
  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
};

// Async data loading hook
export const useAsyncData = (asyncFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      console.error('Async operation failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);
  
  return { data, loading, error, execute, setData };
};

// Window size hook for responsive behavior
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return windowSize;
};

// Click outside hook
export const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

// Cache hook for expensive computations
export const useCache = () => {
  const cache = useRef(new Map());
  
  const get = useCallback((key) => {
    return cache.current.get(key);
  }, []);
  
  const set = useCallback((key, value) => {
    cache.current.set(key, value);
  }, []);
  
  const has = useCallback((key) => {
    return cache.current.has(key);
  }, []);
  
  const clear = useCallback(() => {
    cache.current.clear();
  }, []);
  
  const remove = useCallback((key) => {
    return cache.current.delete(key);
  }, []);
  
  return { get, set, has, clear, remove };
};

// Performance monitoring hook
export const usePerformanceMonitor = (name) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  
  renderCount.current++;
  
  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    console.log(`${name} - Render #${renderCount.current} took ${duration.toFixed(2)}ms`);
    
    startTime.current = performance.now();
  });
  
  return renderCount.current;
};