import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ControlPanel from '../components/ControlPanel.jsx';
import { useBubbleEngine } from '../canvas/useBubbleEngine.js';
import { saveSessionData } from '../store/useSessionStore.js';
import { useBubbleLoops } from '../hooks/useBubbleLoops.js';
import OrbitingLoopIndicator from '../components/OrbitingLoopIndicator.jsx';
import SaveSessionModal from '../components/SaveSessionModal.jsx';
import ExportBubbleLoopModal from '../components/ExportBubbleLoopModal.jsx';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.jsx';

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
    toggleSessionMode: toggleEngineSessionMode,
    exportVideo,
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
  const [sessionMode, setSessionMode] = useState(false);
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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exitAnnouncement, setExitAnnouncement] = useState('');
  const ORBIT_TOOLS = [
  { id: 'brush', icon: '🖌️' },
  { id: 'watercolor', icon: '💧' },
  { id: 'ink', icon: '🖋️' },
  { id: 'particle-fill', icon: '✨' },
  { id: 'emoji-stamp', icon: '😊' },
  { id: 'text', icon: '🔤' },
  { id: 'image-stamp', icon: '🖼️' },
  { id: 'soft-eraser', icon: '🧽' },
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

  const handleToggleSessionMode = useCallback(() => {
    const next = !sessionMode;
    setSessionMode(next);
    toggleEngineSessionMode(next);
    if (next) setSymmetry(1);
  }, [sessionMode, toggleEngineSessionMode, setSymmetry]);

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
      onToggleSessionMode: handleToggleSessionMode,
      isSessionMode: sessionMode,
      onOpenGallery,
      onOpenLibrary,
    });
    return () => onHeaderUpdate(null);
  }, [onHeaderUpdate, sessionMeta, handleToggleSessionMode, sessionMode, onOpenGallery, onOpenLibrary]);

  return (
    <>
      <section className={`view-content atelier-view ${isImmersive ? 'immersive' : ''}`} style={{ flex: 1 }}>
        <div className="canvas-stage">
          <div className="canvas-toolbar glass-panel">
            <div className="canvas-hints">
              <span className="badge">Geste libre</span>
              <p className="muted">Pincer pour zoomer, glisser pour dessiner.</p>
            </div>
            <div className="canvas-toolbar-actions">
              <button className="ghost" onClick={enterImmersiveCanvas} aria-pressed={isImmersive}>
                Canvas seul
              </button>
            </div>
          </div>

       <main className="canvas-viewport">

  <div className="canvas-wrapper" id="canvas-outer">
    <div className="canvas-clip">
      <canvas ref={loopRef} />
      <canvas ref={drawingRef} />
    </div>

    <OrbitingLoopIndicator
      duration={duration}
      speed={speed}
      pingPong={pingPong}
      paused={isPaused}
    />
  </div>

  {/* ✅ ICI, hors du canvas */}
  <div className="bubble-tools">
    {ORBIT_TOOLS.map(tool => (
      <button
        key={tool.id}
        className={`bubble-tool ${activeTool === tool.id ? 'active' : ''}`}
        onClick={() => setActiveTool(tool.id)}
        aria-label={tool.id}
      >
        {tool.icon}
      </button>
    ))}
  </div>

</main>
        </div>

        {!isImmersive && (
          <ControlPanel
            color={color}
            onColorChange={setColor}
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
            onToolChange={setActiveTool}
            activeTool={activeTool}
            onAudioFile={handleLoadAudio}
            onToggleAudio={handleToggleAudio}
            isPlaying={isPlaying}
            intensity={intensity}
            onIntensityChange={setIntensity}
            onToggleSessionMode={handleToggleSessionMode}
            isSessionMode={sessionMode}
            onToggleDemoAudio={handleToggleDemoAudio}
            isDemoAudioEnabled={useDemoAudio}
            strokeSize={strokeSize}
            onStrokeSizeChange={setStrokeSize}
            strokeOpacity={strokeOpacity}
            onStrokeOpacityChange={setStrokeOpacity}
            emoji={emoji}
            onEmojiChange={setEmoji}
            onStampImage={setEngineStampImage}
            stampOutline={stampOutline}
            onStampOutlineChange={setStampOutline}
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
