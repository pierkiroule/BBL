import { useCallback, useEffect, useRef, useState } from 'react';
import { exportVideo as recordVideo } from './exportVideo.js';

function getPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const dist = Math.hypot(x - cx, y - cy);
  if (dist > cx) return null;
  return { x, y };
}

function drawStroke(ctx, stroke, timeLimit, symmetry, isGhost, res) {
  if (!stroke?.points?.length) return;
  const size = ctx.canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const now = Date.now();

  for (let s = 0; s < symmetry; s += 1) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(((Math.PI * 2) / symmetry) * s);
    ctx.translate(-cx, -cy);
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size + (res.bass * 20);
    ctx.globalAlpha = isGhost ? 0.08 : 0.8 + res.bass * 0.2;
    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';

    if (stroke.tool === 'brush') {
      ctx.shadowBlur = stroke.size / 2 + res.treble * 25;
      ctx.shadowColor = stroke.color;
    } else {
      ctx.shadowBlur = 0;
    }

    let first = true;
    stroke.points.forEach((p, i) => {
      if (p.t <= timeLimit) {
        const mX = Math.sin(now * 0.005 + i * 0.15) * (res.mid * 12);
        const mY = Math.cos(now * 0.005 + i * 0.15) * (res.mid * 12);
        const px = p.x + mX + (Math.random() - 0.5) * (res.treble * 4);
        const py = p.y + mY + (Math.random() - 0.5) * (res.treble * 4);
        if (first) {
          ctx.moveTo(px, py);
          first = false;
        } else {
          const prev = stroke.points[i - 1];
          if (Math.hypot(px - prev.x, py - prev.y) < size / 3) {
            ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + px) / 2, (prev.y + py) / 2);
          } else {
            ctx.moveTo(px, py);
          }
        }
      }
    });
    ctx.stroke();
    ctx.restore();
  }
}

export function useBubbleEngine() {
  const drawingRef = useRef(null);
  const loopRef = useRef(null);
  const drawCtxRef = useRef(null);
  const loopCtxRef = useRef(null);
  const strokesRef = useRef([]);
  const currentStrokeRef = useRef(null);
  const loopDurationRef = useRef(10000);
  const startTimeRef = useRef(Date.now());
  const symmetryRef = useRef(1);
  const ghostRef = useRef(false);
  const toolRef = useRef('pencil');
  const colorRef = useRef('#1e293b');
  const isDrawingRef = useRef(false);
  const rafRef = useRef(null);
  const progressRef = useRef(0);
  const sessionModeRef = useRef(false);
  const sensitivityRef = useRef(0.5);
  const [progress, setProgress] = useState(0);

  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const audioElRef = useRef(null);
  const resonanceRef = useRef({ bass: 0, mid: 0, treble: 0 });

  const initContexts = useCallback(() => {
    if (!drawingRef.current || !loopRef.current) return;
    drawCtxRef.current = drawingRef.current.getContext('2d');
    loopCtxRef.current = loopRef.current.getContext('2d');
    [drawCtxRef.current, loopCtxRef.current].forEach((ctx) => {
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    });
  }, []);

  const resize = useCallback(() => {
    const container = drawingRef.current?.parentElement;
    if (!container) return;
    const size = container.clientWidth;
    if (!size) return;
    [drawingRef.current, loopRef.current].forEach((canvas) => {
      if (canvas) {
        canvas.width = size;
        canvas.height = size;
      }
    });
  }, []);

  const stopDrawing = useCallback(() => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      if (currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
        strokesRef.current = [...strokesRef.current, currentStrokeRef.current];
      }
      currentStrokeRef.current = null;
      if (drawCtxRef.current) {
        drawCtxRef.current.clearRect(0, 0, drawCtxRef.current.canvas.width, drawCtxRef.current.canvas.height);
      }
    }
  }, []);

  const handlePointerDown = useCallback(
    (event) => {
      if (!drawingRef.current) return;
      const pos = getPosition(drawingRef.current, event);
      if (!pos) return;
      if (!audioElRef.current) {
        audioElRef.current = new Audio();
        audioElRef.current.loop = true;
      }
      isDrawingRef.current = true;
      const currentTime = (Date.now() - startTimeRef.current) % loopDurationRef.current;
      currentStrokeRef.current = {
        tool: toolRef.current,
        color: colorRef.current,
        size: toolRef.current === 'brush' ? 12 : toolRef.current === 'eraser' ? 32 : 3,
        points: [{ ...pos, t: currentTime }],
      };
    },
    []
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (!isDrawingRef.current || !drawingRef.current) return;
      const pos = getPosition(drawingRef.current, event);
      if (pos) {
        const currentTime = (Date.now() - startTimeRef.current) % loopDurationRef.current;
        currentStrokeRef.current?.points.push({ ...pos, t: currentTime });
      } else {
        stopDrawing();
      }
    },
    [stopDrawing]
  );

  const handlePointerUp = useCallback(() => {
    stopDrawing();
  }, [stopDrawing]);

  useEffect(() => {
    initContexts();
    resize();
    window.addEventListener('resize', resize);
    const canvas = drawingRef.current;
    canvas?.addEventListener('pointerdown', handlePointerDown, { passive: false });
    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp, { passive: false });
    canvas?.addEventListener('touchstart', handlePointerDown, { passive: false });
    canvas?.addEventListener('touchmove', handlePointerMove, { passive: false });
    canvas?.addEventListener('touchend', handlePointerUp, { passive: false });

    return () => {
      window.removeEventListener('resize', resize);
      canvas?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      canvas?.removeEventListener('touchstart', handlePointerDown);
      canvas?.removeEventListener('touchmove', handlePointerMove);
      canvas?.removeEventListener('touchend', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp, initContexts, resize]);

  const ensureAudioContext = useCallback(() => {
    if (!audioElRef.current) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      sourceRef.current = audioCtxRef.current.createMediaElementSource(audioElRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioCtxRef.current.destination);
    }
  }, []);

  const renderFrame = useCallback(
    (ctx, time, res) => {
      if (!ctx) return;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      if (ghostRef.current) strokesRef.current.forEach((s) => drawStroke(ctx, s, loopDurationRef.current, symmetryRef.current, true, res));
      strokesRef.current.forEach((s) => drawStroke(ctx, s, time, symmetryRef.current, false, res));
      if (isDrawingRef.current && currentStrokeRef.current) drawStroke(ctx, currentStrokeRef.current, time, symmetryRef.current, false, res);
    },
    []
  );

  const tick = useCallback(() => {
    const loopCtx = loopCtxRef.current;
    if (loopCtx) {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) % loopDurationRef.current;
      progressRef.current = elapsed / loopDurationRef.current;
      setProgress(progressRef.current);

      if (audioElRef.current && !audioElRef.current.paused && analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const bass = dataArrayRef.current.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255;
        const mid = dataArrayRef.current.slice(10, 40).reduce((a, b) => a + b, 0) / 30 / 255;
        const treble = dataArrayRef.current.slice(40, 100).reduce((a, b) => a + b, 0) / 60 / 255;
        resonanceRef.current = {
          bass: bass * sensitivityRef.current,
          mid: mid * sensitivityRef.current,
          treble: treble * sensitivityRef.current,
        };
      } else {
        resonanceRef.current = { bass: 0, mid: 0, treble: 0 };
      }

      renderFrame(loopCtx, elapsed, resonanceRef.current);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [renderFrame]);

  const start = useCallback(() => {
    if (rafRef.current) return;
    startTimeRef.current = Date.now();
    tick();
  }, [tick]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const setTool = useCallback((tool) => {
    toolRef.current = tool;
  }, []);

  const setColor = useCallback((color) => {
    colorRef.current = color;
  }, []);

  const setDuration = useCallback((duration) => {
    loopDurationRef.current = duration;
    startTimeRef.current = Date.now();
  }, []);

  const setSymmetry = useCallback((symmetry) => {
    symmetryRef.current = symmetry;
  }, []);

  const toggleGhost = useCallback((value) => {
    ghostRef.current = typeof value === 'boolean' ? value : !ghostRef.current;
  }, []);

  const toggleSessionMode = useCallback((value) => {
    const next = typeof value === 'boolean' ? value : !sessionModeRef.current;
    sessionModeRef.current = next;
    if (next) symmetryRef.current = 1;
  }, []);

  const setIntensity = useCallback((value) => {
    sensitivityRef.current = value;
  }, []);

  const setAudioFile = useCallback((file) => {
    if (!file) return;
    if (!audioElRef.current) {
      audioElRef.current = new Audio();
      audioElRef.current.loop = true;
    }
    audioElRef.current.src = URL.createObjectURL(file);
  }, []);

  const toggleAudio = useCallback(() => {
    if (!audioElRef.current) return false;
    ensureAudioContext();
    if (audioElRef.current.paused) {
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
      audioElRef.current.play();
      return true;
    }
    audioElRef.current.pause();
    return false;
  }, [ensureAudioContext]);

  const clear = useCallback(() => {
    strokesRef.current = [];
    currentStrokeRef.current = null;
    if (loopCtxRef.current) loopCtxRef.current.clearRect(0, 0, loopCtxRef.current.canvas.width, loopCtxRef.current.canvas.height);
  }, []);

  const handleExport = useCallback(async () => {
    const buffer = document.createElement('canvas');
    buffer.width = 500;
    buffer.height = 500;
    const ctx = buffer.getContext('2d');
    const duration = loopDurationRef.current;
    const startTime = Date.now();
    const capture = setInterval(() => {
      const elapsed = (Date.now() - startTime) % duration;
      ctx.save();
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, buffer.width, buffer.height);
      ctx.beginPath();
      ctx.arc(buffer.width / 2, buffer.height / 2, buffer.width / 2 - 5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.clip();
      renderFrame(ctx, elapsed, resonanceRef.current);
      ctx.restore();
    }, 1000 / 30);

    const blob = await recordVideo({ canvas: buffer, duration });
    clearInterval(capture);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bbl-loop-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [renderFrame]);

  const getSessionData = useCallback(() => ({
    strokes: strokesRef.current,
    duration: loopDurationRef.current,
  }), []);

  const loadSessionData = useCallback((session) => {
    if (!session) return;
    strokesRef.current = session.strokes || [];
    loopDurationRef.current = session.duration || 10000;
    startTimeRef.current = Date.now();
  }, []);

  return {
    drawingRef,
    loopRef,
    start,
    stop,
    setTool,
    setColor,
    setDuration,
    setSymmetry,
    toggleGhost,
    toggleSessionMode,
    exportVideo: handleExport,
    progress,
    setIntensity,
    setAudioFile,
    toggleAudio,
    clear,
    getSessionData,
    loadSessionData,
  };
}
