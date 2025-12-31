import { useCallback, useRef } from 'react';

// Manage temporal flow independently from the drawing logic
export function useLoopTime(initialDuration = 10000) {
  const durationRef = useRef(initialDuration);
  const speedRef = useRef(1);
  const pausedRef = useRef(false);
  const pingPongRef = useRef(false);
  const lastTickRef = useRef(Date.now());
  const accumulatorRef = useRef(0);
  const currentRef = useRef(0);
  const directionRef = useRef(1);

  const computeTime = useCallback((elapsed) => {
    const duration = durationRef.current || 1;
    const pingPong = pingPongRef.current;
    const cleanElapsed = Math.max(0, elapsed);
    const fullCycle = pingPong ? duration * 2 : duration;
    if (!fullCycle) return 0;
    const raw = cleanElapsed % fullCycle;
    if (!pingPong) {
      directionRef.current = 1;
      return raw;
    }
    directionRef.current = raw <= duration ? 1 : -1;
    return raw <= duration ? raw : fullCycle - raw;
  }, []);

  const updateClock = useCallback(() => {
    const now = Date.now();
    const delta = now - lastTickRef.current;
    lastTickRef.current = now;

    if (!pausedRef.current) accumulatorRef.current += delta * speedRef.current;

    currentRef.current = computeTime(accumulatorRef.current);
    return currentRef.current;
  }, [computeTime]);

  const getLoopState = useCallback(() => {
    const time = updateClock();
    const duration = durationRef.current || 1;
    return {
      time,
      duration,
      direction: directionRef.current,
      progress: time / duration,
    };
  }, [updateClock]);

  const resetClock = useCallback(() => {
    accumulatorRef.current = 0;
    currentRef.current = 0;
    lastTickRef.current = Date.now();
  }, []);

  const setDuration = useCallback((nextDuration) => {
    const cleanDuration = Math.max(1, nextDuration);
    const previousDuration = durationRef.current || cleanDuration;
    durationRef.current = cleanDuration;
    resetClock();
    return { previousDuration, nextDuration: cleanDuration };
  }, [resetClock]);

  const setSpeed = useCallback((value) => {
    updateClock();
    speedRef.current = Math.min(2, Math.max(0.25, value));
    return speedRef.current;
  }, [updateClock]);

  const setPause = useCallback((value) => {
    updateClock();
    const next = typeof value === 'boolean' ? value : !pausedRef.current;
    pausedRef.current = next;
    return next;
  }, [updateClock]);

  const setPingPong = useCallback((value) => {
    updateClock();
    const next = typeof value === 'boolean' ? value : !pingPongRef.current;
    pingPongRef.current = next;
    accumulatorRef.current = computeTime(accumulatorRef.current);
    return next;
  }, [computeTime, updateClock]);

  const mapElapsedToLoopTime = useCallback(
    (elapsedMs) => computeTime(elapsedMs * speedRef.current),
    [computeTime]
  );

  const isPaused = useCallback(() => pausedRef.current, []);
  const isPingPong = useCallback(() => pingPongRef.current, []);
  const getDuration = useCallback(() => durationRef.current, []);
  const getSpeed = useCallback(() => speedRef.current, []);

  return {
    getLoopState,
    resetClock,
    setDuration,
    setSpeed,
    setPause,
    setPingPong,
    isPaused,
    isPingPong,
    getDuration,
    getSpeed,
    mapElapsedToLoopTime,
  };
}
