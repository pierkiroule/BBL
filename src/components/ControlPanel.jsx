import React, { useEffect, useMemo, useState } from 'react';

export default function ControlPanel({
  color,
  onColorChange,
  duration,
  onDurationChange,
  speed,
  onSpeedChange,
  isPaused,
  onPauseToggle,
  pingPong,
  onPingPongToggle,
  presence,
  onPresenceChange,
  onGhostToggle,
  ghostMode,
  onSymmetryToggle,
  symmetry,
  onClear,
  onExport,
  onAudioFile,
  onToggleAudio,
  isPlaying,
  intensity,
  onIntensityChange,
  onToggleDemoAudio,
  isDemoAudioEnabled,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [panelStates, setPanelStates] = useState({ trace: true, audio: true });

  const [timePanelOpen, setTimePanelOpen] = useState(true);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setPanelStates({ trace: false, audio: false });
      setTimePanelOpen(true);
      return;
    }
    setPanelStates({ trace: true, audio: true });
    setTimePanelOpen(true);
  }, [isMobile]);

  const speedMood = useMemo(() => {
    if (speed < 0.55) return 'Respiré';
    if (speed < 1) return 'Calme';
    if (speed < 1.5) return 'Vivant';
    return 'Rapide';
  }, [speed]);

  const presenceMood = useMemo(() => {
    if (presence < 0.35) return 'S’estompe';
    if (presence < 0.7) return 'Fluide';
    return 'Reste';
  }, [presence]);

  const intensityMood = useMemo(() => {
    if (intensity < 0.35) return 'Souffle';
    if (intensity < 0.7) return 'Pulse';
    return 'Vibration';
  }, [intensity]);

  const handleDurationChange = (value) => {
    onDurationChange(value);
    setTimePanelOpen(true);
  };

  const handleSpeedChange = (value) => {
    onSpeedChange(value);
    setTimePanelOpen(true);
  };

  const handlePauseToggle = () => {
    onPauseToggle();
    setTimePanelOpen(true);
  };

  const handlePingPongToggle = () => {
    onPingPongToggle();
    setTimePanelOpen(true);
  };

  const togglePanel = (panel) => {
    setPanelStates((prev) => ({ ...prev, [panel]: !prev[panel] }));
  };

  const isPanelOpen = (panel) => (!isMobile ? true : panelStates[panel]);

  return (
    <footer className={`control-panel glass-panel ${isMobile ? 'mobile' : ''}`}>
      <div className={`panel-section time-panel ${timePanelOpen ? 'expanded' : 'collapsed'}`}>
        <div className="section-head">
          <div>
            <span className="badge">Temps</span>
            <p className="section-title">Régler la boucle</p>
            <span className={`pill subtle state-indicator ${timePanelOpen ? 'open' : 'closed'}`} aria-live="polite">
              {timePanelOpen ? 'Ouvert' : 'Replié'}
            </span>
          </div>
          <button
            type="button"
            className="ghost pill"
            onClick={() => setTimePanelOpen((v) => !v)}
            aria-pressed={timePanelOpen}
            aria-expanded={timePanelOpen}
            aria-controls="time-panel-body"
          >
            {timePanelOpen ? 'Fermer' : 'Ouvrir'}
          </button>
        </div>
        <div className={`time-body ${timePanelOpen ? 'open' : ''}`} id="time-panel-body">
          <div className="control-card">
            <div className="slider-row">
              <span className="pill">Durée</span>
              <span className="pill strong">{duration / 1000}s</span>
            </div>
            <input
              type="range"
              min="5000"
              max="60000"
              step="1000"
              value={duration}
              onChange={(e) => handleDurationChange(Number(e.target.value))}
              aria-label="Durée de la boucle"
            />
            <div className="slider-labels">
              <small>5s</small>
              <small>60s</small>
            </div>
          </div>

          <div className="control-card">
            <div className="slider-row">
              <span className="pill">Vitesse</span>
              <span className="pill subtle">{speedMood}</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="2"
              step="0.01"
              value={speed}
              onChange={(e) => handleSpeedChange(Number(e.target.value))}
              aria-label="Vitesse intérieure"
            />
            <div className="slider-labels">
              <small>Lent</small>
              <small>Rapide</small>
            </div>
          </div>

          <div className="switch-grid">
            <button className={`ghost toggle ${isPaused ? 'active' : ''}`} onClick={handlePauseToggle} aria-pressed={isPaused}>
              Pause
            </button>
            <button className={`ghost toggle ${pingPong ? 'active' : ''}`} onClick={handlePingPongToggle} aria-pressed={pingPong}>
              Aller-retour
            </button>
          </div>
        </div>
        {!timePanelOpen && (
          <div className="time-summary">
            <span>{duration / 1000}s</span>
            <span>{speedMood}</span>
            <span>{pingPong ? 'Aller-retour' : 'Cycle continu'}</span>
          </div>
        )}
      </div>

      <div className={`panel-section trace-panel ${isPanelOpen('trace') ? 'expanded' : 'collapsed'}`}>
        <div className="section-head">
          <div>
            <span className="badge">Trace</span>
            <p className="section-title">Empreinte du geste</p>
          </div>
          {isMobile && (
            <button
              type="button"
              className="ghost pill"
              onClick={() => togglePanel('trace')}
              aria-pressed={isPanelOpen('trace')}
              aria-expanded={isPanelOpen('trace')}
              aria-controls="trace-panel-body"
            >
              {isPanelOpen('trace') ? 'Fermer' : 'Ouvrir'}
            </button>
          )}
        </div>
        <div className={`panel-body ${isPanelOpen('trace') ? 'open' : ''}`} id="trace-panel-body">
          <div className="control-card">
            <div className="slider-row">
              <span className="pill">Présence</span>
              <span className="pill subtle">{presenceMood}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={presence}
              onChange={(e) => onPresenceChange(Number(e.target.value))}
              aria-label="Présence des traces"
            />
            <div className="slider-labels">
              <small>S’estompe</small>
              <small>Reste</small>
            </div>
            <div className="switch-grid">
              <button className={`ghost ${ghostMode ? 'active' : ''}`} onClick={onGhostToggle} aria-pressed={ghostMode}>
                Fantôme
              </button>
              <button className={`ghost ${symmetry > 1 ? 'active' : ''}`} onClick={onSymmetryToggle} aria-pressed={symmetry > 1}>
                {symmetry > 1 ? `Symétrie x${symmetry}` : 'Symétrie'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`panel-section audio-panel ${isPanelOpen('audio') ? 'expanded' : 'collapsed'}`}>
        <div className="section-head">
          <span className="badge">Ambiance</span>
          <span className="pill subtle">{intensityMood}</span>
          {isMobile && (
            <button
              type="button"
              className="ghost pill"
              onClick={() => togglePanel('audio')}
              aria-pressed={isPanelOpen('audio')}
              aria-expanded={isPanelOpen('audio')}
              aria-controls="audio-panel-body"
            >
              {isPanelOpen('audio') ? 'Fermer' : 'Ouvrir'}
            </button>
          )}
        </div>
        <div className={`panel-body ${isPanelOpen('audio') ? 'open' : ''}`} id="audio-panel-body">
          <div className="slider-row audio-row">
            <button className={`ghost ${isDemoAudioEnabled ? 'active' : ''}`} onClick={onToggleDemoAudio} style={{ minWidth: '95px' }}>
              {isDemoAudioEnabled ? 'Démo audio' : 'Audio perso'}
            </button>
            <label className="small-button" style={{ cursor: 'pointer' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path d="M9 19V5l12-2v14M12 15V3" />
              </svg>
              <input type="file" accept="audio/*" onChange={(e) => e.target.files[0] && onAudioFile(e.target.files[0])} className="hidden" />
            </label>
            <button className="button-primary" onClick={onToggleAudio} style={{ minWidth: '80px' }}>
              {isPlaying ? 'Pause' : 'Lecture'}
            </button>
            <div className="range-input">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={intensity}
                onChange={(e) => onIntensityChange(Number(e.target.value))}
                aria-label="Sensibilité aux vibrations"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="footer-actions">
        <button className="danger" onClick={onClear} aria-label="Effacer">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <button className="export" onClick={onExport}>Vidéo</button>
      </div>
    </footer>
  );
}
