import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { openDatabase, runStore } from '../utils/idb.js';

const DB_NAME = 'bubbleloop-gallery';
const DB_VERSION = 2;
const STORE_NAME = 'loops';

function ensureId(seed) {
  if (seed) return seed;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeTags(list) {
  return Array.isArray(list)
    ? list
        .map((t) => t?.toString().trim().toLowerCase())
        .filter(Boolean)
    : [];
}

function normalizeLoop(loop) {
  if (!loop) return null;
  const tags = normalizeTags(loop.tags);
  const videoBlob =
    loop.videoBlob instanceof Blob
      ? loop.videoBlob
      : loop.videoBlob && typeof loop.videoBlob === 'object'
        ? new Blob([loop.videoBlob], { type: loop.videoBlob.type || 'video/webm' })
        : null;

  return {
    id: ensureId(loop.id),
    title: loop.title || 'BubbleLoop',
    date: loop.date || Date.now(),
    tags,
    duration: typeof loop.duration === 'number' ? loop.duration : 0,
    videoBlob,
  };
}

const dbPromise = typeof window === 'undefined'
  ? Promise.reject(new Error('IndexedDB indisponible côté serveur'))
  : openDatabase(DB_NAME, DB_VERSION, (db) => {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('date', 'date');
        store.createIndex('tags', 'tags', { multiEntry: true });
      }
    });

async function listLoops() {
  try {
    const raw = await runStore(dbPromise, STORE_NAME, 'readonly', (store) => store.getAll());
    return raw || [];
  } catch (e) {
    console.error('Impossible de lire les BubbleLoops', e);
    return [];
  }
}

export function useBubbleLoops() {
  const [loops, setLoops] = useState([]);
  const loadingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const result = (await listLoops()) || [];
      const normalized = result
        .map((item) => normalizeLoop(item))
        .filter(Boolean)
        .sort((a, b) => (b?.date || 0) - (a?.date || 0));
      setLoops(normalized);
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
      const payload = normalizeLoop(loop);
      if (!payload?.videoBlob) throw new Error('Aucun Blob vidéo fourni.');
      await runStore(dbPromise, STORE_NAME, 'readwrite', (store) => store.put(payload));
      await refresh();
      return payload;
    },
    [refresh]
  );

  const updateBubbleLoop = useCallback(
    async (loop) => {
      if (!loop?.id) return null;
      const current = loops.find((item) => item.id === loop.id);
      const payload = normalizeLoop({ ...current, ...loop, id: loop.id });
      await runStore(dbPromise, STORE_NAME, 'readwrite', (store) => store.put(payload));
      await refresh();
      return payload;
    },
    [loops, refresh]
  );

  const deleteBubbleLoop = useCallback(
    async (id) => {
      if (!id) return;
      await runStore(dbPromise, STORE_NAME, 'readwrite', (store) => store.delete(id));
      await refresh();
    },
    [refresh]
  );

  const clearBubbleLoops = useCallback(async () => {
    await runStore(dbPromise, STORE_NAME, 'readwrite', (store) => store.clear());
    await refresh();
  }, [refresh]);

  const getBubbleLoop = useCallback(async (id) => {
    if (!id) return null;
    const result = await runStore(dbPromise, STORE_NAME, 'readonly', (store) => store.get(id));
    return normalizeLoop(result);
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
