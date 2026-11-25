import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce fast-changing state (e.g. search input)
 * @param {*} value The value to debounce
 * @param {number} delay Milliseconds delay (default: 300ms)
 */
export const useDebounce = (value, delay = 300) => {
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
