import { useState, useEffect, Dispatch, SetStateAction } from 'react';

function getStorageValue<T,>(key: string, defaultValue: T): T {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse localStorage value", e);
        return defaultValue;
      }
    }
  }
  return defaultValue;
}

// FIX: Imported Dispatch and SetStateAction from react and updated the return type annotation to resolve the "Cannot find namespace 'React'" error.
export function useLocalStorage<T,>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};