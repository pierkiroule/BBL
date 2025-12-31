import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header.jsx';
import ControlPanel from '../components/ControlPanel.jsx';
import TimelineBar from '../components/TimelineBar.jsx';
import { useBubbleEngine } from '../canvas/useBubbleEngine.js';
import { saveSessionData } from '../store/useSessionStore.js';

export default function AtelierView({ onOpenLibrary, sessionToLoad, onSessionsChange }) {
  const engine = useBubbleEngine();
  const [activeTool, setActiveTool] = useState('pencil');
  const [color, setColor] = useState('#1e293b');
  const [duration, setDuration] = useState(10000);
  const [ghostMode, setGhostMode] = useState(false);
  const [symmetry, setSymmetry] = useState(1);
  const [sessionMode, setSessionMode] = useState(false);
  const [sessionName, setSessionName] = useState('Projet Sans Titre');
  const [sessionId, setSessionId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intensity, setIntensity] = useState(0.5);

  useEffect(() => {
    engine.setTool(activeTool);
  }, [activeTool, engine]);

  useEffect(() => {
    engine.setColor(color);
  }, [color, engine]);

  useEffect(() => {
    engine.setDuration(duration);
  }, [duration, engine]);

  useEffect(() => {
    engine.toggleGhost(ghostMode);
  }, [ghostMode, engine]);

  useEffect(() => {
    engine.setSymmetry(symmetry);
  }, [symmetry, engine]);

  useEffect(() => {
    engine.setIntensity(intensity);
  }, [intensity, engine]);

  useEffect(() => {
    engine.start();
    return () => engine.stop();
  }, [engine]);

  useEffect(() => {
    if (sessionToLoad) {
      engine.loadSessionData(sessionToLoad);
      setSessionName(`Projet ${sessionToLoad.name}`);
      setSessionId(sessionToLoad.id);
      setDuration(sessionToLoad.duration || 10000);
      setColor(sessionToLoad.strokes?.[0]?.color || '#1e293b');
    }
  }, [engine, sessionToLoad]);

  const handleToggleSessionMode = () => {
    const next = !sessionMode;
    setSessionMode(next);
    engine.toggleSessionMode(next);
    if (next) setSymmetry(1);
  };

  const handleSave = () => {
    const payload = engine.getSessionData();
    const defaultName = sessionName.replace(/projet\s*/i, '').trim() || 'Sans Titre';
    const name = window.prompt('Nom de la session :', defaultName) || defaultName;
    const saved = saveSessionData({
      id: sessionId,
      name: name.toUpperCase(),
      strokes: payload.strokes,
      duration: payload.duration,
    });
    setSessionId(saved.id);
    setSessionName(`Projet ${saved.name}`);
    if (onSessionsChange) onSessionsChange();
  };

  const handleClear = () => {
    if (window.confirm('Effacer tout ?')) engine.clear();
  };

  const handleExport = async () => {
    await engine.exportVideo();
  };

  const handleLoadAudio = (file) => {
    engine.setAudioFile(file);
  };

  const handleToggleAudio = () => {
    const playing = engine.toggleAudio();
    setIsPlaying(playing);
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
      />
      <main className="canvas-viewport">
        <div className="canvas-wrapper" id="canvas-outer">
          <canvas ref={engine.loopRef} />
          <canvas ref={engine.drawingRef} />
        </div>
        <TimelineBar progress={engine.progress} />
      </main>
      <ControlPanel
        color={color}
        onColorChange={setColor}
        duration={duration}
        onDurationChange={setDuration}
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
      />
    </section>
  );
}
