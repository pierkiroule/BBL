import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ControlPanel from '../components/ControlPanel.jsx';
import { useBubbleEngine } from '../canvas/useBubbleEngine.js';
import { saveSessionData } from '../store/useSessionStore.js';
import { useBubbleLoops } from '../hooks/useBubbleLoops.js';

import TimelineIndicator from '../components/TimelineIndicator.jsx';
import SaveSessionModal from '../components/SaveSessionModal.jsx';
import ExportBubbleLoopModal from '../components/ExportBubbleLoopModal.jsx';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.jsx';
import { TOOL_COLORS, isPresetColor } from '../utils/palette.js';
import useLoopProgress from '../hooks/useLoopProgress';





function defaultSizeForTool(tool) {
  switch (tool) {
    case 'brush':
    case 'watercolor':
      return 14;
    case 'ink':
      return 9;
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

export default function AtelierView({ onOpenLibrary, sessionToLoad, onSessionsChange, onOpenGallery, onHeaderUpdate }) {
const {
  drawingRef,
  loopRef,
  start,
  stop,

  undo,
  redo,
  canUndo,
  canRedo,

  setTool,
  setColor: setEngineColor,
  setStrokeSize: setEngineStrokeSize,
  setStrokeOpacity: setEngineStrokeOpacity,
  setEmoji: setEngineEmoji,
  setStampOutline: setEngineStampOutline,
  setStampImage: setEngineStampImage,
  setDuration: setEngineDuration,
  setSpeed: setEngineSpeed,
  setPause: setEnginePause,
  setPingPong: setEnginePingPong,
  setPresence: setEnginePresence,
  toggleGhost,
  setSymmetry: setEngineSymmetry,
  exportVideo,
  setZoom: setEngineZoom,
  setIntensity: setEngineIntensity,
  setAudioFile,

  toggleAudio,
  setDemoAudio,
  clear,
  getSessionData,
  loadSessionData,
} = useBubbleEngine();
  const { addBubbleLoop } = useBubbleLoops();
  const [activeTool, setActiveTool] = useState('pencil');
  const [color, setColor] = useState('#1e293b');
  const [duration, setDuration] = useState(10000);
  const [speed, setSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [pingPong, setPingPong] = useState(false);
  
  const [ghostMode, setGhostMode] = useState(false);
  const [presence, setPresence] = useState(0.8);
  const [symmetry, setSymmetry] = useState(1);
  const [sessionName, setSessionName] = useState('Projet Sans Titre');
  const [sessionId, setSessionId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intensity, setIntensity] = useState(0.5);
  const [useDemoAudio, setUseDemoAudio] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);
  const [strokeSize, setStrokeSize] = useState(() => defaultSizeForTool('pencil'));
  const [strokeOpacity, setStrokeOpacity] = useState(1);
  const [emoji, setEmoji] = useState('✨');
  const [stampOutline, setStampOutline] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exitAnnouncement, setExitAnnouncement] = useState('');
  const [toolMenu, setToolMenu] = useState(null);
  const pressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const canvasWrapperRef = useRef(null);
  const progress = useLoopProgress({
  duration,
  paused: isPaused,

});
  const ORBIT_TOOLS = [
    { id: 'pencil', icon: '✏️', label: 'Crayon' },
    { id: 'brush', icon: '🖌️', label: 'Pinceau' },
    { id: 'watercolor', icon: '💧', label: 'Aquarelle' },
    { id: 'ink', icon: '🖋️', label: 'Encre' },
    { id: 'emoji-stamp', icon: '😊', label: 'Emoji' },
    { id: 'text', icon: '🔤', label: 'Texte' },
    { id: 'image-stamp', icon: '🖼️', label: 'Pastille' },
    { id: 'eraser', icon: '🪣', label: 'Gomme' },
    { id: 'soft-eraser', icon: '🧽', label: 'Gomme douce' },
  ];

  useEffect(() => {
    setTool(activeTool);
  }, [activeTool, setTool]);

  useEffect(() => {
    setStrokeSize(defaultSizeForTool(activeTool));
  }, [activeTool]);

  useEffect(() => {
    setEngineColor(color);
  }, [color, setEngineColor]);

  useEffect(() => {
    setEngineStrokeSize(strokeSize);
  }, [setEngineStrokeSize, strokeSize]);

  useEffect(() => {
    setEngineStrokeOpacity(strokeOpacity);
  }, [setEngineStrokeOpacity, strokeOpacity]);

  useEffect(() => {
    setEngineEmoji(emoji);
  }, [emoji, setEngineEmoji]);

  useEffect(() => {
    setEngineStampOutline(stampOutline);
  }, [setEngineStampOutline, stampOutline]);

  useEffect(() => {
    setEngineDuration(duration);
  }, [duration, setEngineDuration]);

  useEffect(() => {
    setEngineSpeed(speed);
  }, [setEngineSpeed, speed]);

  useEffect(() => {
    setEnginePause(isPaused);
  }, [isPaused, setEnginePause]);

  useEffect(() => {
    setEnginePingPong(pingPong);
  }, [pingPong, setEnginePingPong]);

  useEffect(() => {
    setEnginePresence(presence);
  }, [presence, setEnginePresence]);

  useEffect(() => {
    toggleGhost(ghostMode);
  }, [ghostMode, toggleGhost]);

  useEffect(() => {
    setEngineSymmetry(symmetry);
  }, [symmetry, setEngineSymmetry]);

  useEffect(() => {
    setEngineIntensity(intensity);
  }, [intensity, setEngineIntensity]);

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  useEffect(() => {
    setEngineZoom(zoom);
  }, [setEngineZoom, zoom]);

  useEffect(() => {
    if (sessionToLoad) {
      loadSessionData(sessionToLoad);
      setSessionName(`Projet ${sessionToLoad.name}`);
      setSessionId(sessionToLoad.id);
      setDuration(sessionToLoad.duration || 10000);
      setSpeed(sessionToLoad.speed ?? 1);
      setPingPong(!!sessionToLoad.pingPong);
      setPresence(typeof sessionToLoad.presence === 'number' ? sessionToLoad.presence : 0.8);
      setGhostMode(!!sessionToLoad.ghost);
      setIsPaused(false);
      setColor(sessionToLoad.strokes?.[0]?.color || '#1e293b');
    }
  }, [loadSessionData, sessionToLoad]);

  const handleSave = useCallback(
    (name) => {
      const payload = getSessionData();
      const saved = saveSessionData({
        id: sessionId,
        name: name.toUpperCase(),
        strokes: payload.strokes,
        duration: payload.duration,
        speed: payload.speed,
        pingPong: payload.pingPong,
        presence: payload.presence,
        ghost: payload.ghost,
      });
      setSessionId(saved.id);
      setSessionName(`Projet ${saved.name}`);
      if (onSessionsChange) onSessionsChange();
      setShowSaveModal(false);
    },
    [getSessionData, onSessionsChange, sessionId]
  );

  const handleClear = () => {
    setConfirmClearOpen(true);
  };

  const confirmClear = () => {
    clear();
    setConfirmClearOpen(false);
  };

  const handleExport = async ({ title, tags }) => {
    try {
      setIsExporting(true);
      const blob = await exportVideo();
      if (blob) {
        await addBubbleLoop({
          title: title.trim() || 'BubbleLoop',
          date: Date.now(),
          tags,
          duration: Math.round(duration / 1000),
          videoBlob: blob,
        });
        window.alert('BubbleLoop ajoutée à la galerie locale constellation.');
      }
    } catch (e) {
      console.error('Impossible de sauvegarder la BubbleLoop', e);
      window.alert("La sauvegarde locale a échoué. Vérifiez que votre navigateur autorise l'IndexedDB.");
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const handleLoadAudio = (file) => {
    setUseDemoAudio(false);
    setIsPlaying(false);
    setAudioFile(file);
  };

  const handleToggleAudio = () => {
    const playing = toggleAudio();
    setIsPlaying(playing);
  };

  const handleToggleDemoAudio = () => {
    const next = !useDemoAudio;
    setUseDemoAudio(next);
    setIsPlaying(false);
    setDemoAudio(next);
  };

  const sessionMeta = useMemo(() => sessionName, [sessionName]);
  const sessionSettings = useMemo(
    () => ({
      duration,
      speed,
      pingPong,
      presence,
    }),
    [duration, speed, pingPong, presence]
  );

  const defaultSessionLabel = useMemo(
    () => sessionName.replace(/projet\s*/i, '').trim() || 'Sans titre',
    [sessionName]
  );
  const defaultExportTitle = useMemo(
    () => sessionName.replace(/projet\s*/i, '').trim() || 'BubbleLoop',
    [sessionName]
  );

  const handleZoomIn = () => setZoom((value) => Math.min(6, Number((value + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom((value) => Math.max(0.2, Number((value - 0.15).toFixed(2))));
  const handleZoomReset = () => setZoom(1);

  const openToolMenu = useCallback((toolId, target) => {
  if (!target) return;

  const rect = target.getBoundingClientRect();
  const MENU_WIDTH = 280;
  const MENU_MARGIN = 12;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let x = rect.left + rect.width / 2 - MENU_WIDTH / 2;
  x = Math.max(MENU_MARGIN, Math.min(x, viewportWidth - MENU_WIDTH - MENU_MARGIN));

  let y = rect.bottom + 10;

  // Si le menu sort en bas → on le met au-dessus
  if (rect.bottom + 260 > viewportHeight) {
    y = rect.top - 260;
  }

  setActiveTool(toolId);
  setToolMenu({
    toolId,
    x,
    y: Math.max(MENU_MARGIN, y),
  });
}, []);

  const cancelLongPress = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }, []);

  const startLongPress = useCallback(
    (toolId, target) => {
      cancelLongPress();
      longPressTriggeredRef.current = false;
      pressTimerRef.current = window.setTimeout(() => {
        longPressTriggeredRef.current = true;
        openToolMenu(toolId, target);
        pressTimerRef.current = null;
      }, 460);
    },
    [cancelLongPress, openToolMenu]
  );

  const handleToolTap = useCallback(
    (toolId) => {
      if (longPressTriggeredRef.current) {
        longPressTriggeredRef.current = false;
        return;
      }
      setActiveTool(toolId);
      setToolMenu(null);
    },
    []
  );

  const closeToolMenu = useCallback(() => setToolMenu(null), []);

  const enterImmersiveCanvas = useCallback(() => setIsImmersive(true), []);
  const exitImmersiveCanvas = useCallback(() => {
    setIsImmersive(false);
    setExitAnnouncement('Mode immersif quitté. Les menus sont de retour.');
  }, []);

  useEffect(() => {
    if (!exitAnnouncement) return undefined;
    const timeout = setTimeout(() => setExitAnnouncement(''), 3200);
    return () => clearTimeout(timeout);
  }, [exitAnnouncement]);

  useEffect(() => () => cancelLongPress(), [cancelLongPress]);

  useEffect(() => {
    if (!toolMenu) return undefined;
    const handleOutside = (event) => {
      if (event.target.closest('.tool-context-menu') || event.target.closest('.bubble-tool')) return;
      closeToolMenu();
    };
    const handleEsc = (event) => {
      if (event.key === 'Escape') closeToolMenu();
    };
    window.addEventListener('pointerdown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('pointerdown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [toolMenu, closeToolMenu]);

  // keyboard shortcuts: 1..9 to select tools quickly
  useEffect(() => {
    const handleToolKey = (e) => {
      const tag = e.target?.tagName;
      if (tag && ['INPUT', 'TEXTAREA', 'SELECT', 'OPTION'].includes(tag)) return;
      if (e.key && /^[1-9]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        if (ORBIT_TOOLS[idx]) {
          setActiveTool(ORBIT_TOOLS[idx].id);
          setToolMenu(null);
        }
      }
    };
    window.addEventListener('keydown', handleToolKey);
    return () => window.removeEventListener('keydown', handleToolKey);
  }, []);

  useEffect(() => {
    const wrapper = canvasWrapperRef.current;
    const handleWheel = (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };
    const blockGesture = (event) => event.preventDefault();

    wrapper?.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('gesturestart', blockGesture);
    window.addEventListener('gesturechange', blockGesture);

    return () => {
      wrapper?.removeEventListener('wheel', handleWheel);
      window.removeEventListener('gesturestart', blockGesture);
      window.removeEventListener('gesturechange', blockGesture);
    };
  }, []);

  useEffect(() => {
    if (!isImmersive) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        exitImmersiveCanvas();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exitImmersiveCanvas, isImmersive]);

  useEffect(() => {
    if (!onHeaderUpdate) return undefined;
    onHeaderUpdate({
      sessionName: sessionMeta,
      onSaveSession: () => setShowSaveModal(true),
      onOpenGallery,
      onOpenLibrary,
    });
    return () => onHeaderUpdate(null);
  }, [onHeaderUpdate, sessionMeta, onOpenGallery, onOpenLibrary]);

  const getToolIcon = (id) => {
    switch (id) {
      case 'pencil':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21l3-1 11-11 1-3-3 1L4 20z" />
            <path d="M14 7l3 3" />
          </svg>
        );
      case 'brush':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 22s4-1 6-4 4-6 4-6 2 4-2 8-8 2-8 2z" />
            <path d="M14 7l7-7" />
          </svg>
        );
      case 'watercolor':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8 7 6 9 6 12a6 6 0 0012 0c0-3-2-5-6-10z" />
          </svg>
        );
      case 'ink':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v6l-5 5-3 1 1-3 5-5h4z" />
          </svg>
        );
      case 'emoji-stamp':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 17.3L18.2 21 16.6 15 22 11l-6.2-.5L12 2 8.2 10.5 2 11l5.4 4L5.8 21z" />
          </svg>
        );
      case 'text':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4h12" />
            <path d="M12 4v16" />
          </svg>
        );
      case 'image-stamp':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="14" rx="2" />
            <path d="M3 17l4-4 5 5 4-6 5 6" />
          </svg>
        );
      case 'eraser':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 3l5 5-9 9-7-7 11-7z" />
          </svg>
        );
      case 'soft-eraser':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 3l5 5-9 9-7-7 11-7z" opacity="0.6" />
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" />
          </svg>
        );
    }
  };

  function ToolButton({ tool, idx, active, onTap, onStartLong, onCancelPointer }) {
    return (
      <button
        type="button"
        title={`${tool.label} (${idx + 1})`}
        className={`bubble-tool ${active ? 'active' : ''}`}
        onClick={() => onTap(tool.id)}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture?.(event.pointerId);
          onStartLong(tool.id, event.currentTarget);
        }}
        onPointerUp={(event) => {
          onCancelPointer();
          event.currentTarget.releasePointerCapture?.(event.pointerId);
        }}
        onPointerCancel={(event) => {
          onCancelPointer();
          event.currentTarget.releasePointerCapture?.(event.pointerId);
        }}
        onPointerLeave={(event) => {
          onCancelPointer();
          event.currentTarget.releasePointerCapture?.(event.pointerId);
        }}
        aria-label={tool.label}
        aria-pressed={active}
      >
        <span className="bubble-tool-icon" aria-hidden>{getToolIcon(tool.id)}</span>
        <span className="bubble-tool-label">{tool.label}</span>
      </button>
    );
  }

  return (
    <>
      <section className={`view-content atelier-view ${isImmersive ? 'immersive' : ''}`} style={{ flex: 1 }}>
        <div className="canvas-stage">
         <div className="canvas-toolbar glass-panel">
  {/* LEFT — UNDO / REDO */}
  <div className="toolbar-left" role="group" aria-label="Historique">
    <button
      type="button"
      className="ghost"
      onClick={undo}
      disabled={!canUndo()}
      aria-label="Annuler (Ctrl+Z)"
    >
      ↶
    </button>
    <button
      type="button"
      className="ghost"
      onClick={redo}
      disabled={!canRedo()}
      aria-label="Rétablir (Ctrl+Shift+Z)"
    >
      ↷
    </button>
  </div>

  {/* CENTER — HINTS */}
  <div className="toolbar-center canvas-hints">
    <span className="badge">Geste libre</span>
    <span className="muted">Zoom</span>
  </div>

  {/* RIGHT — ACTIONS */}
  <div className="toolbar-right canvas-toolbar-actions">
    <div className="zoom-controls" role="group" aria-label="Zoom">
      <button
        type="button"
        className="ghost"
        onClick={handleZoomOut}
        disabled={zoom <= 0.21}
      >
        −
      </button>

      <span className="zoom-level">{Math.round(zoom * 100)}%</span>

      <button
        type="button"
        className="ghost"
        onClick={handleZoomIn}
        disabled={zoom >= 5.95}
      >
        +
      </button>

      <button
        type="button"
        className="ghost subtle"
        onClick={handleZoomReset}
      >
        1x
      </button>
    </div>

    <button
      className="ghost"
      onClick={enterImmersiveCanvas}
      aria-pressed={isImmersive}
    >
      full
    </button>
  </div>
</div>

 <main className="canvas-viewport">
<TimelineIndicator
  progress={progress}
  paused={isPaused}
  speed={speed}
  mode={pingPong ? 'pingpong' : 'loop'}
  onTogglePause={() => setIsPaused(v => !v)}
  onModeChange={(m) => setPingPong(m === 'pingpong')}
  onSpeedChange={setSpeed}
  onSeek={(p) => {
    // optionnel : plus tard (seek moteur)
    // setManualProgress(p)
  }}
/>


  <div className="canvas-wrapper" ref={canvasWrapperRef}>
    <div className="canvas-clip">
      <canvas ref={loopRef} />
      <canvas ref={drawingRef} />
    </div>
  </div>



  <div className="bubble-tools">
    <div className="bubble-tool-group">
      {ORBIT_TOOLS.map((tool, idx) => (
        <ToolButton
          key={tool.id}
          tool={tool}
          idx={idx}
          active={activeTool === tool.id}
          onTap={(id) => {
            if (longPressTriggeredRef.current) {
              longPressTriggeredRef.current = false;
              return;
            }
            setActiveTool(id);
            setToolMenu(null);
          }}
          onStartLong={(id, target) => startLongPress(id, target)}
          onCancelPointer={() => cancelLongPress()}
        />
      ))}
    </div>
    <p className="bubble-hint">Tap pour choisir · Appui long pour régler · Raccourcis: 1–9</p>
  </div>

  
  

            {toolMenu && (
              <div
                className="tool-context-menu"
                style={{ top: `${toolMenu.y + 10}px`, left: `${toolMenu.x}px` }}
                role="dialog"
                aria-label="Réglages de l'outil"
              >
                <div className="menu-head">
                  <span className="badge">Réglages {ORBIT_TOOLS.find((tool) => tool.id === toolMenu.toolId)?.label || ''}</span>
                  <button type="button" className="ghost pill" onClick={closeToolMenu}>
                    Fermer
                  </button>
                </div>

                <div className="menu-section">
                  <span className="pill subtle">Couleur</span>
                  <div className="color-palette">
                    {TOOL_COLORS.map((swatch) => (
                      <button
                        type="button"
                        key={swatch}
                        className={`color-dot ${color === swatch ? 'active' : ''}`}
                        style={{ backgroundColor: swatch }}
                        onClick={() => setColor(swatch)}
                        aria-label={`Choisir ${swatch}`}
                      />
                    ))}
                    <label className={`color-dot custom ${!isPresetColor(color) ? 'active' : ''}`} aria-label="Choisir une couleur personnalisée">
                      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                      <span>+</span>
                    </label>
                  </div>
                </div>

                <div className="menu-section">
                  <div className="bubble-mini-slider">
                    <span className="pill subtle">Taille</span>
                    <input
                      type="range"
                      min="3"
                      max="64"
                      step="1"
                      value={strokeSize}
                      onChange={(e) => setStrokeSize(Number(e.target.value))}
                      aria-label="Taille du tracé"
                    />
                    <span className="pill strong">{Math.round(strokeSize)}px</span>
                  </div>
                  <div className="bubble-mini-slider">
                    <span className="pill subtle">Opacité</span>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={strokeOpacity}
                      onChange={(e) => setStrokeOpacity(Number(e.target.value))}
                      aria-label="Opacité du tracé"
                    />
                    <span className="pill strong">{Math.round(strokeOpacity * 100)}%</span>
                  </div>
                </div>

                {toolMenu.toolId === 'emoji-stamp' && (
                  <div className="menu-section">
                    <span className="pill subtle">Emoji</span>
                    <div className="emoji-grid">
                      {['✨', '🌿', '🔥', '🌊', '💫', '🎈', '🫧', '⭐️'].map((item) => (
                        <button key={item} className={`ghost ${emoji === item ? 'active' : ''}`} onClick={() => setEmoji(item)}>
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {toolMenu.toolId === 'image-stamp' && (
                  <div className="menu-section menu-row">
                    <button className={`ghost ${stampOutline ? 'active' : ''}`} onClick={() => setStampOutline((v) => !v)} aria-pressed={stampOutline}>
                      Contour
                    </button>
                    <label className="small-button" style={{ cursor: 'pointer', display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" />
                        <path d="m7 15 3-3 2 2 3-4 2 3" />
                      </svg>
                      Importer
                      <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && setEngineStampImage(e.target.files[0])} className="hidden" />
                    </label>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

        {!isImmersive && (
          <ControlPanel
            duration={duration}
            onDurationChange={setDuration}
            speed={speed}
            onSpeedChange={setSpeed}
            isPaused={isPaused}
            onPauseToggle={() => setIsPaused((v) => !v)}
            pingPong={pingPong}
            onPingPongToggle={() => setPingPong((v) => !v)}
            presence={presence}
            onPresenceChange={setPresence}
            onGhostToggle={() => setGhostMode((v) => !v)}
            ghostMode={ghostMode}
            onSymmetryToggle={() => setSymmetry((v) => (v === 1 ? 6 : 1))}
            symmetry={symmetry}
            onClear={handleClear}
            onExport={() => setShowExportModal(true)}
            onAudioFile={handleLoadAudio}
            onToggleAudio={handleToggleAudio}
            isPlaying={isPlaying}
            intensity={intensity}
            onIntensityChange={setIntensity}
            onToggleDemoAudio={handleToggleDemoAudio}
            isDemoAudioEnabled={useDemoAudio}
          />
        )}

        {isImmersive && (
          <button className="floating-menu-button" onClick={exitImmersiveCanvas} aria-label="Réafficher les menus de l'atelier">
            Menus
          </button>
        )}

        <div className={`immersive-toast ${exitAnnouncement ? 'visible' : ''}`} role="status" aria-live="polite">
          {exitAnnouncement}
        </div>
      </section>

      <SaveSessionModal
        open={showSaveModal}
        defaultName={defaultSessionLabel}
        settings={sessionSettings}
        onCancel={() => setShowSaveModal(false)}
        onConfirm={handleSave}
      />

      <ExportBubbleLoopModal
        open={showExportModal}
        defaultTitle={defaultExportTitle}
        settings={sessionSettings}
        onCancel={() => setShowExportModal(false)}
        onConfirm={handleExport}
        busy={isExporting}
      />

      <ConfirmDeleteModal
        open={confirmClearOpen}
        title="Effacer le canevas ?"
        description="Cette action supprime tous les traits actuels. Aucun retour en arrière possible."
        onCancel={() => setConfirmClearOpen(false)}
        onConfirm={confirmClear}
      />
    </>
  );
}
