// IndexedDB helpers. Drawings (PNG blobs) and settings live here; nothing leaves the device.

const DB_NAME = 'kids-play';
const DB_VERSION = 1;
let dbPromise;

function db() {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const d = req.result;
      const drawings = d.createObjectStore('drawings', { keyPath: 'id' });
      drawings.createIndex('profile', 'profile');
      d.createObjectStore('settings');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function run(store, mode, fn) {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(store, mode);
    const result = fn(tx.objectStore(store));
    tx.oncomplete = () => resolve(result && 'result' in result ? result.result : result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/**
 * Drawing record:
 * { id, profile, created, updated, pageId|null, paint: Blob (paint layer only),
 *   image: Blob (finished PNG), thumb: Blob (small JPEG) }
 */
export function saveDrawing(rec) {
  return run('drawings', 'readwrite', s => s.put(rec));
}

export function getDrawing(id) {
  return run('drawings', 'readonly', s => s.get(id));
}

export function deleteDrawing(id) {
  return run('drawings', 'readwrite', s => s.delete(id));
}

/** Newest first. Returns light records (thumb only) to keep the gallery fast. */
export async function listDrawings(profile) {
  const all = await run('drawings', 'readonly', s => s.index('profile').getAll(profile));
  return all
    .sort((a, b) => b.updated - a.updated)
    .map(({ id, profile, created, updated, pageId, thumb }) => ({ id, profile, created, updated, pageId, thumb }));
}

export async function deleteAllDrawings(profile) {
  const all = await listDrawings(profile);
  await run('drawings', 'readwrite', s => all.forEach(r => s.delete(r.id)));
  return all.length;
}

export function getSetting(key) {
  return run('settings', 'readonly', s => s.get(key));
}

export function setSetting(key, value) {
  return run('settings', 'readwrite', s => s.put(value, key));
}

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Ask Safari not to evict our data under storage pressure. */
export function persist() {
  navigator.storage?.persist?.().catch(() => {});
}

export async function usage() {
  const est = await navigator.storage?.estimate?.();
  return est ? est.usage : null;
}
