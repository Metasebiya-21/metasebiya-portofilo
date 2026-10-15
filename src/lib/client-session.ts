const memoryIds = new Map<string, string>();

function generateId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Returns a persistent per-browser id. localStorage can throw (blocked cookies,
 * private modes, some webviews), so fall back to an in-memory id instead of crashing.
 */
export function getOrCreateSessionId(key: string) {
  try {
    const saved = window.localStorage.getItem(key);
    if (saved) return saved;
    const generated = generateId();
    window.localStorage.setItem(key, generated);
    return generated;
  } catch {
    let id = memoryIds.get(key);
    if (!id) {
      id = generateId();
      memoryIds.set(key, id);
    }
    return id;
  }
}
