import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { exportVideo as recordVideo } from './exportVideo.js';
import { useLoopTime } from './useLoopTime.js';
import { TOOL_RENDERERS, computeAlpha, ensureStrokeSeed, isStampTool, prepareStrokePoints } from './tools.js';
import { isClosedShape } from '../utils/geometry.js';
import { sanitizeText } from '../utils/text.js';

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

function defaultSizeForTool(tool) {
  switch (tool) {
    case 'brush':
    case 'watercolor':
      return 14;
    case 'ink':
      return 9;
    case 'particle-fill':
      return 12;
    case 'emoji-stamp':
    case 'text':
      return 16;
    case 'image-stamp':
      return 22;
    case 'eraser':
      return 32;
    case 'soft-eraser':
      return 28;
    default:
      return 4;
  }
}

function drawStroke(ctx, stroke, timeLimit, symmetry, isGhost, res, displaySize, presence = 1, loopDuration = null) {
  if (!stroke?.points?.length) return;
  const size = displaySize || ctx.canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const opacity = computeAlpha({ isGhost, presence, opacity: stroke.opacity || 1 });

  for (let s = 0; s < symmetry; s += 1) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(((Math.PI * 2) / symmetry) * s);
    ctx.translate(-cx, -cy);

    const pts = prepareStrokePoints(stroke, timeLimit);
    const renderer = TOOL_RENDERERS[stroke.tool] || TOOL_RENDERERS.pencil;
    renderer(ctx, stroke, pts, { timeLimit, resonance: res, alpha: opacity, duration: loopDuration ?? displaySize, presence });
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
  const symmetryRef = useRef(1);
  const ghostRef = useRef(false);
  const presenceRef = useRef(0.8);
  const toolRef = useRef('pencil');
  const colorRef = useRef('#1e293b');
  const strokeSizeRef = useRef(12);
  const strokeOpacityRef = useRef(1);
  const emojiRef = useRef('✨');
  const textDraftRef = useRef('');
  const stampImageRef = useRef(null);
  const stampOutlineRef = useRef(true);
  const isDrawingRef = useRef(false);
  const rafRef = useRef(null);
  const sessionModeRef = useRef(false);
  const sensitivityRef = useRef(0.5);
  const loopTime = useLoopTime(10000);
  const {
    getLoopState,
    setDuration: setLoopDuration,
    setSpeed: setLoopSpeed,
    setPause: setLoopPause,
    setPingPong: setLoopPingPong,
    isPingPong,
    mapElapsedToLoopTime,
    resetClock,
    getDuration,
    getSpeed,
  } = loopTime;

  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const audioElRef = useRef(null);
  const fileUrlRef = useRef(null);
  const resonanceRef = useRef({ bass: 0, mid: 0, treble: 0 });
  const displaySizeRef = useRef(0);

  const ensureAudioElement = useCallback(() => {
    if (!audioElRef.current) {
      audioElRef.current = new Audio();
      audioElRef.current.loop = true;
    }
    return audioElRef.current;
  }, []);

  const revokeFileUrl = useCallback(() => {
    if (fileUrlRef.current) {
      URL.revokeObjectURL(fileUrlRef.current);
      fileUrlRef.current = null;
    }
  }, []);

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
    const rect = container.getBoundingClientRect();
    const size = Math.max(200, Math.min(rect.width, rect.height || rect.width));
    if (!size) return;
    displaySizeRef.current = size;
    const dpr = window.devicePixelRatio || 1;
    [drawingRef.current, loopRef.current].forEach((canvas) => {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.scale(dpr, dpr);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      }
    });
  }, []);

  const appendStroke = useCallback((stroke) => {
    if (stroke?.points?.length && (stroke.points.length > 1 || isStampTool(stroke.tool))) {
      strokesRef.current.push(stroke);
    }
  }, []);

  const finalizeStroke = useCallback((incomingStroke) => {
    const stroke = incomingStroke || currentStrokeRef.current;
    if (!stroke?.points?.length) return null;

    if (stroke.tool === 'particle-fill' && isClosedShape(stroke.points, 12)) {
      stroke.closedAt = stroke.points[stroke.points.length - 1].t;
      stroke.polygon = stroke.points.slice();
      const density = Math.max(12, Math.min(120, Math.floor(stroke.size * 4)));
      const center = stroke.polygon.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
      center.x /= stroke.polygon.length;
      center.y /= stroke.polygon.length;
      const particles = [];
      for (let i = 0; i < density; i += 1) {
        particles.push({
          cx: center.x + (Math.random() - 0.5) * stroke.size * 2,
          cy: center.y + (Math.random() - 0.5) * stroke.size * 2,
          orbit: Math.random() * stroke.size * 3 + stroke.size,
          radius: Math.max(1.2, Math.random() * Math.max(3, stroke.size * 0.4)),
          speed: 0.3 + Math.random() * 0.7,
          phase: Math.random() * Math.PI * 2,
          alpha: 0.35 + Math.random() * 0.4,
        });
      }
      stroke.particles = particles;
    }

    if (stroke.tool === 'text') {
      const placeholder = textDraftRef.current || '';
      const value = sanitizeText(window.prompt('Texte :', placeholder));
      if (value) {
        stroke.text = value;
        textDraftRef.current = value;
      } else {
        return null;
      }
    }
    return stroke;
  }, []);

  const stopDrawing = useCallback(() => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      const stroke = finalizeStroke();
      appendStroke(stroke);
      currentStrokeRef.current = null;
      if (drawCtxRef.current) {
        const size = displaySizeRef.current || drawCtxRef.current.canvas.width;
        drawCtxRef.current.clearRect(0, 0, size, size);
      }
    }
  }, [appendStroke, finalizeStroke]);

  const handlePointerDown = useCallback(
    (event) => {
      event.preventDefault();
      if (!drawingRef.current) return;
      const pos = getPosition(drawingRef.current, event);
      if (!pos) return;
      ensureAudioElement();
      const { time: currentTime } = getLoopState();
      const tool = toolRef.current;
      const baseSize = strokeSizeRef.current || defaultSizeForTool(tool);
      const stroke = ensureStrokeSeed({
        tool,
        color: colorRef.current,
        size: baseSize,
        points: [{ ...pos, t: currentTime }],
        opacity: strokeOpacityRef.current || 1,
        emoji: emojiRef.current,
        text: textDraftRef.current,
        image: stampImageRef.current,
        outline: stampOutlineRef.current,
        rotation: Math.random() * 0.4 - 0.2,
      });
      currentStrokeRef.current = stroke;
      const isStamp = isStampTool(tool);
      isDrawingRef.current = !isStamp;
      if (isStamp) {
        const ready = finalizeStroke(stroke);
        appendStroke(ready);
        currentStrokeRef.current = null;
      }
    },
    [appendStroke, ensureAudioElement, finalizeStroke, getLoopState]
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (isDrawingRef.current) event.preventDefault();
      if (!isDrawingRef.current || !drawingRef.current) return;
      const pos = getPosition(drawingRef.current, event);
      if (pos) {
        const { time: currentTime } = getLoopState();
        const duration = getDuration();
        const stroke = currentStrokeRef.current;
        const lastPoint = stroke?.points?.[stroke.points.length - 1];

        const hasLoopRestarted = !isPingPong() && stroke && lastPoint && currentTime < lastPoint.t;

        if (stroke && lastPoint && hasLoopRestarted) {
          const completedStroke = {
            ...stroke,
            points: [...stroke.points, { ...lastPoint, t: duration }],
          };
          appendStroke(completedStroke);
          currentStrokeRef.current = ensureStrokeSeed({
            ...stroke,
            points: [
              { ...lastPoint, t: 0 },
              { ...pos, t: currentTime },
            ],
          });
        } else {
          currentStrokeRef.current?.points.push({ ...pos, t: currentTime });
        }
      } else {
        stopDrawing();
      }
    },
    [appendStroke, getDuration, getLoopState, isPingPong, stopDrawing]
  );

  const handlePointerUp = useCallback(() => {
    stopDrawing();
  }, [stopDrawing]);

  useLayoutEffect(() => {
    initContexts();
    resize();
  }, [initContexts, resize]);

  useEffect(() => {
    window.addEventListener('resize', resize);
    const canvas = drawingRef.current;
    canvas?.addEventListener('pointerdown', handlePointerDown, { passive: false });
    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp, { passive: false });
    window.addEventListener('pointercancel', handlePointerUp, { passive: false });
    canvas?.addEventListener('touchstart', handlePointerDown, { passive: false });
    canvas?.addEventListener('touchmove', handlePointerMove, { passive: false });
    canvas?.addEventListener('touchend', handlePointerUp, { passive: false });

    return () => {
      window.removeEventListener('resize', resize);
      canvas?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      canvas?.removeEventListener('touchstart', handlePointerDown);
      canvas?.removeEventListener('touchmove', handlePointerMove);
      canvas?.removeEventListener('touchend', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp, resize]);

  useEffect(() => () => revokeFileUrl(), [revokeFileUrl]);

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
    (ctx, time, res, sizeOverride) => {
      if (!ctx) return;
      const size = sizeOverride || displaySizeRef.current || ctx.canvas.width;
      const duration = getDuration();
      if (!ctx.__exporting) {
  ctx.clearRect(0, 0, size, size);
}
      if (ghostRef.current) strokesRef.current.forEach((s) => drawStroke(ctx, s, duration, symmetryRef.current, true, res, size, presenceRef.current, duration));
      strokesRef.current.forEach((s) => drawStroke(ctx, s, time, symmetryRef.current, false, res, size, presenceRef.current, duration));
      if (isDrawingRef.current && currentStrokeRef.current) drawStroke(ctx, currentStrokeRef.current, time, symmetryRef.current, false, res, size, presenceRef.current, duration);
    },
    [getDuration]
  );

  const tick = useCallback(() => {
    const loopCtx = loopCtxRef.current;
    if (loopCtx) {
      const { time } = getLoopState();
      const elapsed = time;

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
  }, [getLoopState, renderFrame]);

  const start = useCallback(() => {
    if (rafRef.current) return;
    resetClock();
    tick();
  }, [resetClock, tick]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const setTool = useCallback((tool) => {
    toolRef.current = tool;
    strokeSizeRef.current = defaultSizeForTool(tool);
  }, []);

  const setColor = useCallback((color) => {
    colorRef.current = color;
  }, []);

  const setStrokeSize = useCallback((value) => {
    const next = Number.isFinite(value) ? value : defaultSizeForTool(toolRef.current);
    strokeSizeRef.current = Math.max(1, next);
  }, []);

  const setStrokeOpacity = useCallback((value) => {
    if (!Number.isFinite(value)) return;
    strokeOpacityRef.current = Math.min(1, Math.max(0.05, value));
  }, []);

  const setEmoji = useCallback((emoji) => {
    if (emoji) emojiRef.current = emoji;
  }, []);

  const setTextDraft = useCallback((text) => {
    textDraftRef.current = sanitizeText(text || '');
  }, []);

  const setStampOutline = useCallback((enabled) => {
    stampOutlineRef.current = !!enabled;
  }, []);

  const setStampImage = useCallback((file) => {
    if (!file) {
      stampImageRef.current = null;
      return;
    }
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      stampImageRef.current = img;
    };
  }, []);

  const rescaleStrokes = useCallback(
    (ratio, nextDuration) => {
      if (!ratio || Number.isNaN(ratio) || !Number.isFinite(ratio)) return;
      const clampDuration = nextDuration || getDuration();
      const scaleStroke = (stroke) => ({
        ...stroke,
        points: (stroke.points || []).map((p) => ({ ...p, t: Math.min(clampDuration, p.t * ratio) })),
      });
      strokesRef.current = strokesRef.current.map(scaleStroke);
      if (currentStrokeRef.current) currentStrokeRef.current = scaleStroke(currentStrokeRef.current);
    },
    [getDuration]
  );

  const setDuration = useCallback((duration) => {
    const previousDuration = getDuration();
    const { nextDuration } = setLoopDuration(duration);
    const ratio = previousDuration ? nextDuration / previousDuration : 1;
    rescaleStrokes(ratio, nextDuration);
  }, [getDuration, rescaleStrokes, setLoopDuration]);

  const setSymmetry = useCallback((symmetry) => {
    symmetryRef.current = symmetry;
  }, []);

  const setSpeed = useCallback((speed) => {
    setLoopSpeed(speed);
  }, [setLoopSpeed]);

  const setPause = useCallback((value) => {
    setLoopPause(value);
  }, [setLoopPause]);

  const setPingPong = useCallback((value) => {
    setLoopPingPong(value);
  }, [setLoopPingPong]);

  const setPresence = useCallback((value) => {
    presenceRef.current = Math.min(1, Math.max(0, value));
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

  const clearAudioSource = useCallback(() => {
    revokeFileUrl();
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
      audioElRef.current.removeAttribute('src');
      audioElRef.current.load();
    }
  }, [revokeFileUrl]);

  const setAudioFile = useCallback(
    (file) => {
      if (!file) return;
      const audioEl = ensureAudioElement();
      revokeFileUrl();
      fileUrlRef.current = URL.createObjectURL(file);
      audioEl.src = fileUrlRef.current;
    },
    [ensureAudioElement, revokeFileUrl]
  );

  const setDemoAudio = useCallback(
    (enabled) => {
      if (enabled) {
        const audioEl = ensureAudioElement();
        revokeFileUrl();
        audioEl.src = '/audio/Demo.mp3';
        return;
      }
      clearAudioSource();
    },
    [clearAudioSource, ensureAudioElement, revokeFileUrl]
  );

  const toggleAudio = useCallback(() => {
    const audioEl = ensureAudioElement();
    if (!audioEl.src) return false;
    ensureAudioContext();
    if (audioEl.paused) {
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
      audioEl.play();
      return true;
    }
    audioEl.pause();
    return false;
  }, [ensureAudioContext, ensureAudioElement]);

  const clear = useCallback(() => {
    strokesRef.current = [];
    currentStrokeRef.current = null;
    const size = displaySizeRef.current || loopCtxRef.current?.canvas.width || 0;
    if (loopCtxRef.current) loopCtxRef.current.clearRect(0, 0, size, size);
    if (drawCtxRef.current) drawCtxRef.current.clearRect(0, 0, size, size);
  }, []);

  const handleExport = useCallback(async ({ skipDownload = false } = {}) => {
  if (typeof MediaRecorder === 'undefined') {
    window.alert("L'export vidéo n'est pas supporté sur ce navigateur.");
    return null;
  }

  if (!strokesRef.current.length && !currentStrokeRef.current) {
    window.alert('Ajoutez un tracé avant de lancer un export.');
    return null;
  }

  const buffer = document.createElement('canvas');
  const exportSize = 640;
  buffer.width = exportSize;
  buffer.height = exportSize;

  const ctx = buffer.getContext('2d');
  const duration = getDuration();
  const recordLength = (duration * (isPingPong() ? 2 : 1)) / getSpeed();
  const startTime = Date.now();
  let capture = null;

  const drawFrameForExport = () => {
    const elapsed = mapElapsedToLoopTime(Date.now() - startTime);

    ctx.save();

    // ✅ FOND OPAQUE (clé)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, buffer.width, buffer.height);

    // ✅ MASQUE CIRCULAIRE
    ctx.beginPath();
    ctx.arc(
      buffer.width / 2,
      buffer.height / 2,
      buffer.width / 2 - 5,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.clip();

    // ⚠️ Drapeau export
    ctx.__exporting = true;
    renderFrame(ctx, elapsed, resonanceRef.current, exportSize);
    ctx.__exporting = false;

    ctx.restore();
  };

  drawFrameForExport();
  capture = setInterval(drawFrameForExport, 1000 / 30);

  try {
    const blob = await recordVideo({
      canvas: buffer,
      duration: recordLength,
    });

    if (!blob) {
      window.alert("L'export vidéo a échoué.");
      return null;
    }

    if (!skipDownload) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bubbleloop-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    }

    return blob;
  } finally {
    if (capture) clearInterval(capture);
  }
}, [
  getDuration,
  getSpeed,
  isPingPong,
  mapElapsedToLoopTime,
  renderFrame,
]);

  const getSessionData = useCallback(() => ({
    strokes: strokesRef.current,
    duration: getDuration(),
    speed: getSpeed(),
    pingPong: isPingPong(),
    presence: presenceRef.current,
    ghost: ghostRef.current,
  }), [getDuration, getSpeed, isPingPong]);

  const loadSessionData = useCallback((session) => {
    if (!session) return;
    strokesRef.current = session.strokes || [];
    presenceRef.current = typeof session.presence === 'number' ? session.presence : 0.8;
    ghostRef.current = !!session.ghost;
    setLoopDuration(session.duration || 10000);
    setLoopSpeed(session.speed ?? 1);
    setLoopPingPong(session.pingPong ?? false);
    setLoopPause(false);
    resetClock();
  }, [resetClock, setLoopDuration, setLoopPause, setLoopPingPong, setLoopSpeed]);

  return {
    drawingRef,
    loopRef,
    start,
    stop,
    setTool,
    setColor,
    setStrokeSize,
    setStrokeOpacity,
    setEmoji,
    setTextDraft,
    setStampOutline,
    setStampImage,
    setDuration,
    setSpeed,
    setPause,
    setPingPong,
    setPresence,
    setSymmetry,
    toggleGhost,
    toggleSessionMode,
    exportVideo: handleExport,
    setIntensity,
    setAudioFile,
    setDemoAudio,
    toggleAudio,
    clear,
    getSessionData,
    loadSessionData,
  };
}
