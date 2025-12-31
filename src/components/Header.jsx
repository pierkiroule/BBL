import React, { useEffect, useMemo, useState } from 'react';
import BubbleLoopLogo from './BubbleLoopLogo.jsx';

export default function Header({
  activeView,
  sessionName,
  onOpenLibrary,
  onSaveSession,
  onToggleSessionMode,
  isSessionMode,
  onNavigateHome,
  onNavigateAtelier,
  onNavigateGallery,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { key: 'home', label: 'Accueil', onClick: onNavigateHome },
      { key: 'atelier', label: 'Atelier', onClick: onNavigateAtelier },
      { key: 'gallery', label: 'Galerie', onClick: onNavigateGallery },
    ].filter((item) => Boolean(item.onClick)),
    [onNavigateAtelier, onNavigateGallery, onNavigateHome]
  );

  const handleNav = (onClick) => {
    if (onClick) onClick();
    setMenuOpen(false);
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [activeView]);

  return (
    <header className="header-bar glass-panel">
      <div className="header-leading">
        <BubbleLoopLogo size={54} showLabel={false} />
        <div className="flex flex-col">
          <h1 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic' }}>
            BBL <span style={{ color: 'var(--primary)' }}>BubbleLoop</span>
          </h1>
          {sessionName && (
            <span className="badge" style={{ marginTop: '0.15rem', maxWidth: '180px' }} title={sessionName}>
              {sessionName}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        className="nav-toggle"
        aria-label={menuOpen ? 'Fermer la navigation' : 'Ouvrir la navigation'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span aria-hidden="true">☰</span>
      </button>

      <nav className={`header-nav ${menuOpen ? 'open' : ''}`} aria-label="Navigation principale">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`nav-link ${activeView === item.key ? 'active' : ''}`}
            aria-current={activeView === item.key ? 'page' : undefined}
            onClick={() => handleNav(item.onClick)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="header-actions">
        {onOpenLibrary && (
          <button onClick={onOpenLibrary} className="small-button" aria-label="Ouvrir les archives">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </button>
        )}
        {onSaveSession && (
          <button onClick={onSaveSession} className="button-primary" aria-label="Sauvegarder la session">
            Sauvegarder
          </button>
        )}
        {onToggleSessionMode && (
          <button
            onClick={onToggleSessionMode}
            className={`button-secondary ${isSessionMode ? 'active' : ''}`}
            aria-pressed={isSessionMode}
          >
            Séance
          </button>
        )}
      </div>
    </header>
  );
}
