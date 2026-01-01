import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ControlPanel from '../components/ControlPanel.jsx';
import { useBubbleEngine } from '../canvas/useBubbleEngine.js';
import { saveSessionData } from '../store/useSessionStore.js';
import { useBubbleLoops } from '../hooks/useBubbleLoops.js';
import OrbitingLoopIndicator from '../components/OrbitingLoopIndicator.jsx';
import SaveSessionModal from '../components/SaveSessionModal.jsx';
import ExportBubbleLoopModal from '../components/ExportBubbleLoopModal.jsx';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.jsx';
import { TOOL_COLORS, isPresetColor } from '../utils/palette.js';

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
    setActiveTool(toolId);
    setToolMenu({
      toolId,
      x: rect.left + rect.width / 2,
      y: rect.bottom + window.scrollY,
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
    window.addEventListener('pointerdown', handleOutside);
    return () => window.removeEventListener('pointerdown', handleOutside);
  }, [toolMenu, closeToolMenu]);

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

  return (
    <>
      <section className={`view-content atelier-view ${isImmersive ? 'immersive' : ''}`} style={{ flex: 1 }}>
        <div className="canvas-stage">
          <div className="canvas-toolbar glass-panel">
            <div className="canvas-hints">
              <span className="badge">Geste libre</span>
              <p className="muted">Zoom aux boutons, espace + glisser (ou 2 doigts) pour déplacer la caméra.</p>
            </div>
            <div className="canvas-toolbar-actions">
              <div className="zoom-controls" role="group" aria-label="Zoom sur le canevas">
                <button type="button" className="ghost" onClick={handleZoomOut} aria-label="Zoom arrière" disabled={zoom <= 0.21}>
                  −
                </button>
                <span className="zoom-level" aria-live="polite">{Math.round(zoom * 100)}%</span>
                <button type="button" className="ghost" onClick={handleZoomIn} aria-label="Zoom avant" disabled={zoom >= 5.95}>
                  +
                </button>
                <button type="button" className="ghost subtle" onClick={handleZoomReset} aria-label="Réinitialiser le zoom">
                  1x
                </button>
              </div>
              <button className="ghost" onClick={enterImmersiveCanvas} aria-pressed={isImmersive}>
                Canvas seul
              </button>
            </div>
          </div>

          <main className="canvas-viewport">
            <div className="canvas-wrapper" id="canvas-outer" ref={canvasWrapperRef}>
              <div className="canvas-clip">
                <canvas ref={loopRef} />
                <canvas ref={drawingRef} />
              </div>

              <OrbitingLoopIndicator duration={duration} speed={speed} pingPong={pingPong} paused={isPaused} />
            </div>

            <div className="bubble-tools">
              <div className="bubble-tool-group">
                {ORBIT_TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    className={`bubble-tool ${activeTool === tool.id ? 'active' : ''}`}
                    onClick={() => handleToolTap(tool.id)}
                    onPointerDown={(event) => startLongPress(tool.id, event.currentTarget)}
                    onPointerUp={cancelLongPress}
                    onPointerLeave={cancelLongPress}
                    aria-label={tool.label}
                  >
                    {tool.icon}
                  </button>
                ))}
              </div>
              <p className="bubble-hint">Tap pour choisir · Appui long pour régler</p>
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
