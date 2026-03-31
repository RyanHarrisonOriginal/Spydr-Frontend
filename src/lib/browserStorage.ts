const KEY_PREFIX = "spydah-ontology:";

function safeStorage(
  backend: "localStorage" | "sessionStorage"
): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window[backend];
  } catch {
    return null;
  }
}

export function getStored<T>(
  key: string,
  backend: "localStorage" | "sessionStorage" = "localStorage"
): T | null {
  const storage = safeStorage(backend);
  if (!storage) return null;
  try {
    const raw = storage.getItem(KEY_PREFIX + key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStored<T>(
  key: string,
  value: T,
  backend: "localStorage" | "sessionStorage" = "localStorage"
): void {
  const storage = safeStorage(backend);
  if (!storage) return;
  try {
    storage.setItem(KEY_PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function removeStored(
  key: string,
  backend: "localStorage" | "sessionStorage" = "localStorage"
): void {
  const storage = safeStorage(backend);
  if (!storage) return;
  try {
    storage.removeItem(KEY_PREFIX + key);
  } catch {
    // ignore
  }
}
