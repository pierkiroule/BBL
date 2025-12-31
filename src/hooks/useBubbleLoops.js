import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DB_NAME = 'bubbleloop-gallery';
const DB_VERSION = 1;
const STORE_NAME = 'loops';

function ensureId(seed) {
  if (seed) return seed;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB non disponible dans cet environnement.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('date', 'date');
        store.createIndex('tags', 'tags', { multiEntry: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function runStoreRequest(mode, runner) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = runner(store);
    tx.oncomplete = () => resolve(request?.result);
    tx.onerror = () => reject(tx.error || request.error);
  });
}

async function listLoops() {
  return runStoreRequest('readonly', (store) => store.getAll()) || [];
}

export function useBubbleLoops() {
  const [loops, setLoops] = useState([]);
  const loadingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const result = (await listLoops()) || [];
      result.sort((a, b) => (b?.date || 0) - (a?.date || 0));
      setLoops(result);
    } catch (e) {
      console.error('Impossible de charger les BubbleLoops', e);
      setLoops([]);
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addBubbleLoop = useCallback(
    async (loop) => {
      const payload = {
        id: ensureId(loop?.id),
        title: loop?.title || 'BubbleLoop',
        date: loop?.date || Date.now(),
        tags: Array.isArray(loop?.tags)
          ? loop.tags.map((t) => t?.toString().trim().toLowerCase()).filter(Boolean)
          : [],
        duration: typeof loop?.duration === 'number' ? loop.duration : 0,
        videoBlob: loop?.videoBlob || null,
      };
      await runStoreRequest('readwrite', (store) => store.put(payload));
      await refresh();
      return payload;
    },
    [refresh]
  );

  const updateBubbleLoop = useCallback(
    async (loop) => {
      if (!loop?.id) return null;
      const current = loops.find((item) => item.id === loop.id);
      const payload = { ...current, ...loop, id: loop.id };
      await runStoreRequest('readwrite', (store) => store.put(payload));
      await refresh();
      return payload;
    },
    [loops, refresh]
  );

  const deleteBubbleLoop = useCallback(
    async (id) => {
      if (!id) return;
      await runStoreRequest('readwrite', (store) => store.delete(id));
      await refresh();
    },
    [refresh]
  );

  const clearBubbleLoops = useCallback(async () => {
    await runStoreRequest('readwrite', (store) => store.clear());
    await refresh();
  }, [refresh]);

  const getBubbleLoop = useCallback(async (id) => {
    if (!id) return null;
    return runStoreRequest('readonly', (store) => store.get(id));
  }, []);

  const stats = useMemo(
    () => ({
      total: loops.length,
      tags: Array.from(new Set(loops.flatMap((loop) => loop?.tags || []))),
    }),
    [loops]
  );

  return {
    loops,
    stats,
    addBubbleLoop,
    updateBubbleLoop,
    deleteBubbleLoop,
    clearBubbleLoops,
    refresh,
    getBubbleLoop,
  };
}
