import { useEffect, useState } from "react";

export const STORAGE_PREFIX = "businesslarp:";

export function loadJSON<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked (private mode); the app still works without it.
  }
}

export function clearAllStorage(): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

/**
 * useState that is mirrored to localStorage. `merge` lets callers fill in
 * fields that were added after a value was first saved.
 */
export function usePersistentState<T>(key: string, initial: () => T, merge?: (saved: T) => T) {
  const [value, setValue] = useState<T>(() => {
    const saved = loadJSON<T>(key);
    if (saved === undefined) return initial();
    return merge ? merge(saved) : saved;
  });

  useEffect(() => {
    saveJSON(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
