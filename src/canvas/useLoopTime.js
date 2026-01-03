import { useCallback, useRef } from 'react';

/*
  Loop time engine
  - continuous playback
  - precise pause
  - ping-pong
  - seek + frame-by-frame
*/

export function useLoopTime(initialDuration = 10000) {
  const durationRef = useRef(Math.max(1, initialDuration));
  const speedRef = useRef(1);
  const pausedRef = useRef(false);
  const pingPongRef = useRef(false);

  const lastTickRef = useRef(performance.now());
  const accumulatorRef = useRef(0); // absolute elapsed (ms)
  const currentRef = useRef(0);     // loop time (ms)
  const directionRef = useRef(1);   // 1 | -1

  /* --------------------------------------------------
     CORE TIME COMPUTATION
  -------------------------------------------------- */

  const computeTime = useCallback((elapsed) => {
    const duration = durationRef.current;
    const pingPong = pingPongRef.current;

    const clean = Math.max(0, elapsed);
    const full = pingPong ? duration * 2 : duration;

    if (!full) return 0;

    const raw = clean % full;

    if (!pingPong) {
      directionRef.current = 1;
      return raw;
    }

    if (raw <= duration) {
      directionRef.current = 1;
      return raw;
    }

    directionRef.current = -1;
    return full - raw;
  }, []);

  /* --------------------------------------------------
     CLOCK UPDATE
  -------------------------------------------------- */

  const updateClock = useCallback(() => {
    const now = performance.now();
    const delta = now - lastTickRef.current;
    lastTickRef.current = now;

    if (!pausedRef.current) {
      accumulatorRef.current += delta * speedRef.current;
    }

    currentRef.current = computeTime(accumulatorRef.current);
    return currentRef.current;
  }, [computeTime]);

  /* --------------------------------------------------
     READ STATE (single source of truth)
  -------------------------------------------------- */

  const getLoopState = useCallback(() => {
    const time = updateClock();
    const duration = durationRef.current || 1;

    return {
      time,
      duration,
      progress: Math.min(1, Math.max(0, time / duration)),
      direction: directionRef.current,
      paused: pausedRef.current,
      pingPong: pingPongRef.current,
    };
  }, [updateClock]);

  /* --------------------------------------------------
     EDITORIAL / FRAME CONTROL
  -------------------------------------------------- */

  // absolute seek (ms)
  const seek = useCallback((ms) => {
    const duration = durationRef.current;
    const clamped = Math.max(0, Math.min(ms, duration));

    accumulatorRef.current = clamped;
    currentRef.current = clamped;
    directionRef.current = 1;
    lastTickRef.current = performance.now();
  }, []);

  // normalized seek (0..1)
  const seekProgress = useCallback((p) => {
    seek(p * durationRef.current);
  }, [seek]);

  // frame-by-frame step (only when paused)
  const step = useCallback((ms) => {
    if (!pausedRef.current) return;

    const duration = durationRef.current;
    const next = Math.max(
      0,
      Math.min(currentRef.current + ms, duration)
    );

    accumulatorRef.current = next;
    currentRef.current = next;
    lastTickRef.current = performance.now();
  }, []);

  /* --------------------------------------------------
     CONTROLS
  -------------------------------------------------- */

  const resetClock = useCallback(() => {
    accumulatorRef.current = 0;
    currentRef.current = 0;
    directionRef.current = 1;
    lastTickRef.current = performance.now();
  }, []);

  const setDuration = useCallback((next) => {
    const clean = Math.max(1, next);
    const prev = durationRef.current;

    durationRef.current = clean;

    const ratio = prev > 0 ? clean / prev : 1;
    accumulatorRef.current *= ratio;
    currentRef.current = computeTime(accumulatorRef.current);
    lastTickRef.current = performance.now();

    return { previousDuration: prev, nextDuration: clean };
  }, [computeTime]);

  const setSpeed = useCallback((value) => {
    updateClock();
    speedRef.current = Math.min(3, Math.max(0.1, value));
    return speedRef.current;
  }, [updateClock]);

  const setPause = useCallback((value) => {
    updateClock();
    pausedRef.current =
      typeof value === 'boolean' ? value : !pausedRef.current;
    return pausedRef.current;
  }, [updateClock]);

  const setPingPong = useCallback((value) => {
    updateClock();
    pingPongRef.current =
      typeof value === 'boolean' ? value : !pingPongRef.current;

    accumulatorRef.current = computeTime(accumulatorRef.current);
    lastTickRef.current = performance.now();
    return pingPongRef.current;
  }, [computeTime, updateClock]);

  /* --------------------------------------------------
     EXPORT / VIDEO
  -------------------------------------------------- */

  const mapElapsedToLoopTime = useCallback(
    (elapsedMs) => computeTime(elapsedMs * speedRef.current),
    [computeTime]
  );

  /* --------------------------------------------------
     GETTERS
  -------------------------------------------------- */

  const isPaused = useCallback(() => pausedRef.current, []);
  const isPingPong = useCallback(() => pingPongRef.current, []);
  const getDuration = useCallback(() => durationRef.current, []);
  const getSpeed = useCallback(() => speedRef.current, []);

  /* --------------------------------------------------
     API
  -------------------------------------------------- */

  return {
    // read
    getLoopState,

    // transport
    resetClock,
    seek,
    seekProgress,
    step,

    // params
    setDuration,
    setSpeed,
    setPause,
    setPingPong,

    // info
    isPaused,
    isPingPong,
    getDuration,
    getSpeed,

    // export
    mapElapsedToLoopTime,
  };
}