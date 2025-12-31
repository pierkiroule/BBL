import React from 'react';

export default function Header({
  sessionName,
  onOpenLibrary,
  onSaveSession,
  onToggleSessionMode,
  isSessionMode,
}) {
  return (
    <header className="header-bar glass-panel">
      <div className="flex flex-col">
        <h1 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic' }}>
          BBL <span style={{ color: 'var(--primary)' }}>Atelier</span>
        </h1>
        <span className="badge" style={{ marginTop: '0.15rem', maxWidth: '140px' }} title={sessionName}>
          {sessionName}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={onOpenLibrary} className="small-button" aria-label="Ouvrir les archives">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </button>
        <button onClick={onSaveSession} className="button-primary" aria-label="Sauvegarder la session">
          Sauvegarder
        </button>
        <button
          onClick={onToggleSessionMode}
          className={`button-secondary ${isSessionMode ? 'active' : ''}`}
          aria-pressed={isSessionMode}
        >
          Séance
        </button>
      </div>
    </header>
  );
}
