import { useEffect, useRef, useState } from 'react';

export default function useLoopProgress({
  duration = 2000,
  paused = false,
}) {
  const [progress, setProgress] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    if (paused) return;

    let raf;

    const tick = (t) => {
      if (startRef.current === null) startRef.current = t;

      const elapsed = (t - startRef.current) % duration;
      setProgress(elapsed / duration);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      startRef.current = null;
    };
  }, [paused, duration]);

  return progress; // 0 → 1
}