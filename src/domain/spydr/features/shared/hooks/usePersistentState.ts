import { useEffect, useState } from "react";
import { getStored, setStored } from "@/lib/browserStorage";

/**
 * `useState` that transparently persists to localStorage.
 *
 * - `initial` is only evaluated when nothing valid is stored yet.
 * - `sanitize` reconciles the persisted (untrusted) value against the current
 *   shape; return `fallback` to discard malformed data.
 */
export function usePersistentState<T>(
  key: string,
  initial: () => T,
  sanitize?: (raw: unknown, fallback: T) => T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const fallback = initial();
    const stored = getStored<unknown>(key);
    if (stored == null) return fallback;
    return sanitize ? sanitize(stored, fallback) : (stored as T);
  });

  useEffect(() => {
    setStored(key, state);
  }, [key, state]);

  return [state, setState];
}
