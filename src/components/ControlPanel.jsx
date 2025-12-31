import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function ToolButton({ id, label, icon, active, onClick }) {
  return (
    <button className={`tool-btn ${active ? 'active' : ''}`} onClick={onClick} aria-pressed={active} aria-label={label}>
      {icon}
    </button>
  );
}

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
  onToolChange,
  activeTool,
  onAudioFile,
  onToggleAudio,
  isPlaying,
  intensity,
  onIntensityChange,
  onToggleSessionMode,
  isSessionMode,
  onToggleDemoAudio,
  isDemoAudioEnabled,
  strokeSize,
  onStrokeSizeChange,
  strokeOpacity,
  onStrokeOpacityChange,
  emoji,
  onEmojiChange,
  onStampImage,
  stampOutline,
  onStampOutlineChange,
}) {
  const tools = useMemo(
    () => [
      {
        id: 'pencil',
        label: 'Crayon',
        icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          </svg>
        ),
      },
      {
        id: 'brush',
        label: 'Pinceau',
        icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="m14 11 3 3L22 4" />
            <path d="m21 12-9 9-9-9a5 5 0 0 1 7-7l4 4" />
          </svg>
        ),
      },
      {
        id: 'watercolor',
        label: 'Aquarelle',
        icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 3c4 0 8 3 8 7s-3.5 7-8 7-8-3-8-7 4-7 8-7Z" />
            <path d="M8 10c0 1.5 2 3 4 3" />
          </svg>
        ),
      },
      {
        id: 'ink',
        label: 'Encre',
        icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 3c2 2 5 4 5 7.5 0 2.5-1.5 5.5-5 7.5-3.5-2-5-5-5-7.5C7 7 10 5 12 3Z" />
            <path d="M9 11c1 .5 2 .5 3 0" />
          </svg>
        ),
      },
      {
        id: 'particle-fill',
        label: 'Nuage',
        icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="8" cy="8" r="2" />
            <circle cx="16" cy="10" r="2" />
            <circle cx="12" cy="15" r="2" />
            <path d="M6 18c6 3 12 0 12-4.5S12 7 8 9" />
          </svg>
        ),
      },
      {
        id: 'emoji-stamp',
        label: 'Emoji',
        icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 10h.01M16 10h.01" />
            <path d="M8 15s1.5 2 4 2 4-2 4-2" />
          </svg>
        ),
      },
      {
        id: 'text',
        label: 'Texte',
        icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 6h14M12 6v12m-6 0h12" />
          </svg>
        ),
      },
      {
        id: 'image-stamp',
        label: 'Pastille',
        icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" />
            <path d="m8 12 2 2 3-4 3 4" />
          </svg>
        ),
      },
      {
        id: 'eraser',
        label: 'Gomme',
        icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.9-9.9c1-1 2.5-1 3.4 0l4.4 4.4c1 1 1 2.5 0 3.4L10.5 21z" />
            <path d="m22 21H7" />
          </svg>
        ),
      },
      {
        id: 'soft-eraser',
        label: 'Gomme douce',
        icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M4 15c2 2 6 4 8 4s4-1 6-3" />
            <path d="M6 10a5 5 0 0 1 5-4 5 5 0 0 1 5 4" />
          </svg>
        ),
      },
    ],
    []
  );

  const [timePanelOpen, setTimePanelOpen] = useState(true);
  const fadeTimerRef = useRef(null);

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

  const gentlyHideTimePanel = useCallback(() => {
    setTimePanelOpen(true);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = setTimeout(() => setTimePanelOpen(false), 1400);
  }, []);

  useEffect(() => () => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
  }, []);

  const handleDurationChange = (value) => {
    onDurationChange(value);
    gentlyHideTimePanel();
  };

  const handleSpeedChange = (value) => {
    onSpeedChange(value);
    gentlyHideTimePanel();
  };

  const handlePauseToggle = () => {
    onPauseToggle();
    gentlyHideTimePanel();
  };

  const handlePingPongToggle = () => {
    onPingPongToggle();
    gentlyHideTimePanel();
  };

  return (
    <footer className="control-panel glass-panel">
      <div className={`panel-section time-panel ${timePanelOpen ? 'expanded' : 'collapsed'}`}>
        <div className="section-head">
          <div>
            <span className="badge">Temps</span>
            <p className="section-title">Régler la boucle</p>
          </div>
          <button className="ghost pill" onClick={() => setTimePanelOpen((v) => !v)} aria-pressed={timePanelOpen}>
            {timePanelOpen ? 'Fermer' : 'Ouvrir'}
          </button>
        </div>
        <div className={`time-body ${timePanelOpen ? 'open' : ''}`}>
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

      <div className="panel-section trace-panel">
        <div className="section-head">
          <div>
            <span className="badge">Trace</span>
            <p className="section-title">Empreinte du geste</p>
          </div>
        </div>
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
        </div>
        <div className="switch-grid">
          <button className={`ghost ${ghostMode ? 'active' : ''}`} onClick={onGhostToggle} aria-pressed={ghostMode}>
            Fantôme
          </button>
          {!isSessionMode && (
            <button className={`ghost ${symmetry > 1 ? 'active' : ''}`} onClick={onSymmetryToggle} aria-pressed={symmetry > 1}>
              {symmetry > 1 ? `Symétrie x${symmetry}` : 'Symétrie'}
            </button>
          )}
        </div>
      </div>

      {!isSessionMode && (
        <div className="panel-section audio-panel">
          <div className="section-head">
            <span className="badge">Ambiance</span>
            <span className="pill subtle">{intensityMood}</span>
          </div>
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
      )}

      <div className="panel-section">
        <div className="section-head">
          <span className="badge">Outil</span>
          <p className="section-title">Réglages rapides</p>
        </div>
        <div className="control-card">
          <div className="slider-row">
            <span className="pill">Taille</span>
            <span className="pill strong">{Math.round(strokeSize)}px</span>
          </div>
          <input
            type="range"
            min="3"
            max="64"
            step="1"
            value={strokeSize}
            onChange={(e) => onStrokeSizeChange(Number(e.target.value))}
            aria-label="Taille du tracé"
          />
        </div>
        <div className="control-card">
          <div className="slider-row">
            <span className="pill">Opacité</span>
            <span className="pill subtle">{Math.round(strokeOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={strokeOpacity}
            onChange={(e) => onStrokeOpacityChange(Number(e.target.value))}
            aria-label="Opacité du tracé"
          />
        </div>
        {activeTool === 'emoji-stamp' && (
          <div className="control-card">
            <div className="slider-row">
              <span className="pill">Emoji</span>
            </div>
            <div className="switch-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
              {['✨', '🌿', '🔥', '🌊', '💫', '🎈', '🫧', '⭐️'].map((item) => (
                <button key={item} className={`ghost ${emoji === item ? 'active' : ''}`} onClick={() => onEmojiChange(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
        {activeTool === 'image-stamp' && (
          <div className="control-card">
            <div className="slider-row">
              <span className="pill">Pastille</span>
              <button className={`ghost ${stampOutline ? 'active' : ''}`} onClick={() => onStampOutlineChange(!stampOutline)} aria-pressed={stampOutline}>
                Contour
              </button>
            </div>
            <label className="small-button" style={{ cursor: 'pointer', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" />
                <path d="m7 15 3-3 2 2 3-4 2 3" />
              </svg>
              Importer
              <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && onStampImage(e.target.files[0])} className="hidden" />
            </label>
          </div>
        )}
      </div>

      <div className="tool-row">
        <div className="tool-group">
          {tools.map((tool) => (
            <ToolButton
              key={tool.id}
              id={tool.id}
              label={tool.label}
              icon={tool.icon}
              active={activeTool === tool.id}
              onClick={() => onToolChange(tool.id)}
            />
          ))}
        </div>
        <div className="color-swatch">
          <input type="color" value={color} onChange={(e) => onColorChange(e.target.value)} aria-label="Couleur" />
          <div className="preview" style={{ backgroundColor: color }} />
        </div>
      </div>

      <div className="footer-actions">
        <button className="danger" onClick={onClear} aria-label="Effacer">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        {!isSessionMode && (
          <button className="export" onClick={onExport}>Vidéo</button>
        )}
        <button className="ghost" onClick={onToggleSessionMode} aria-pressed={isSessionMode}>
          Mode séance
        </button>
      </div>
    </footer>
  );
}
