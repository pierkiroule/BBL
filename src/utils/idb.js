// Minimal IndexedDB helper inspired by idb's openDB API (no external dependency).
// Provides a small subset tailored for BubbleLoop's offline storage needs.

const cache = new Map();

function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function openDatabase(name, version, onUpgrade) {
  const cacheKey = `${name}:${version}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB est indisponible dans cet environnement.'));
      return;
    }

    const request = indexedDB.open(name, version);

    request.onupgradeneeded = (event) => {
      if (typeof onUpgrade === 'function') {
        onUpgrade(request.result, event.oldVersion, event.newVersion, request.transaction);
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });

  cache.set(cacheKey, dbPromise);
  return dbPromise;
}

export async function runStore(dbPromise, storeName, mode, action) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = action(store);
    tx.oncomplete = () => resolve(request?.result);
    tx.onabort = tx.onerror = () => reject(tx.error || request?.error);
  });
}
