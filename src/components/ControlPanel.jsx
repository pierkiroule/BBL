import React, { useMemo } from 'react';

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
        id: 'eraser',
        label: 'Gomme',
        icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.9-9.9c1-1 2.5-1 3.4 0l4.4 4.4c1 1 1 2.5 0 3.4L10.5 21z" />
            <path d="m22 21H7" />
          </svg>
        ),
      },
    ],
    []
  );

  return (
    <footer className="control-panel glass-panel">
      {!isSessionMode && (
        <div className="panel-section">
          <div className="slider-row" style={{ justifyContent: 'space-between' }}>
            <span className="badge">Résonance Audio</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)' }}>{Math.round(intensity * 100)}%</span>
          </div>
          <div className="slider-row">
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
                max="100"
                value={Math.round(intensity * 100)}
                onChange={(e) => onIntensityChange(Number(e.target.value) / 100)}
              />
            </div>
          </div>
        </div>
      )}

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
        <div className="panel-section" style={{ minWidth: '110px' }}>
          <div className="slider-row" style={{ justifyContent: 'space-between' }}>
            <span className="badge" style={{ letterSpacing: '0.08em' }}>Cycle</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--slate-500)' }}>{duration / 1000}s</span>
          </div>
          <input
            type="range"
            min="5000"
            max="30000"
            step="1000"
            value={duration}
            onChange={(e) => onDurationChange(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="footer-actions">
        <div className="color-swatch">
          <input type="color" value={color} onChange={(e) => onColorChange(e.target.value)} aria-label="Couleur" />
          <div className="preview" style={{ backgroundColor: color }} />
        </div>
        <button className={`ghost ${ghostMode ? 'active' : ''}`} onClick={onGhostToggle} aria-pressed={ghostMode}>
          Fantôme
        </button>
        {!isSessionMode && (
          <button className={`ghost ${symmetry > 1 ? 'active' : ''}`} onClick={onSymmetryToggle} aria-pressed={symmetry > 1}>
            {symmetry > 1 ? `Symétrie x${symmetry}` : 'Symétrie'}
          </button>
        )}
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
