import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header.jsx';
import ControlPanel from '../components/ControlPanel.jsx';
import { useBubbleEngine } from '../canvas/useBubbleEngine.js';
import { saveSessionData } from '../store/useSessionStore.js';
import { useBubbleLoops } from '../hooks/useBubbleLoops.js';

export default function AtelierView({ onOpenLibrary, sessionToLoad, onSessionsChange, onOpenGallery }) {
  const {
    drawingRef,
    loopRef,
    start,
    stop,
    setTool,
    setColor: setEngineColor,
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

  useEffect(() => {
    setTool(activeTool);
  }, [activeTool, setTool]);

  useEffect(() => {
    setEngineColor(color);
  }, [color, setEngineColor]);

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

  const handleToggleSessionMode = () => {
    const next = !sessionMode;
    setSessionMode(next);
    toggleEngineSessionMode(next);
    if (next) setSymmetry(1);
  };

  const handleSave = () => {
    const payload = getSessionData();
    const defaultName = sessionName.replace(/projet\s*/i, '').trim() || 'Sans Titre';
    const name = window.prompt('Nom de la session :', defaultName) || defaultName;
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
  };

  const handleClear = () => {
    if (window.confirm('Effacer tout ?')) clear();
  };

  const handleExport = async () => {
    try {
      const blob = await exportVideo();
      if (blob) {
        const defaultTitle = sessionName.replace(/projet\s*/i, '').trim() || 'BubbleLoop';
        const title = window.prompt('Titre de la BubbleLoop :', defaultTitle) || defaultTitle;
        const rawTags = window.prompt('Tags (séparées par virgule ou espace) :', '') || '';
        const tags = rawTags
          .split(/[,\\s]+/)
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean);
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

  return (
    <section className="view-content" style={{ flex: 1 }}>
      <Header
        sessionName={sessionMeta}
        onOpenLibrary={onOpenLibrary}
        onSaveSession={handleSave}
        onToggleSessionMode={handleToggleSessionMode}
        isSessionMode={sessionMode}
        onOpenGallery={onOpenGallery}
      />
      <main className="canvas-viewport">
        <div className="canvas-wrapper" id="canvas-outer">
          <canvas ref={loopRef} />
          <canvas ref={drawingRef} />
        </div>
      </main>
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
        onExport={handleExport}
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
      />
    </section>
  );
}
