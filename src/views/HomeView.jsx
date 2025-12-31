import React from 'react';

export default function HomeView({ onStart, onOpenLibrary }) {
  return (
    <section className="app-view centered" style={{ padding: '2rem', textAlign: 'center' }}>
      <div className="centered" style={{ flexDirection: 'column', gap: '1.5rem' }}>
        <div className="hero-badge">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <div className="version-pill">v0.1.2</div>
        </div>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--slate-800)' }}>
            BBL <span style={{ color: 'var(--primary)' }}>BubbleLoop</span>
          </h1>
          <p style={{ color: 'var(--slate-500)', maxWidth: '320px', margin: '0.75rem auto 0', lineHeight: 1.5 }}>
            Dessinez en harmonie. Vos traits s'animent en boucle au rythme de la musique.
          </p>
        </div>

        <div className="grid-icons" style={{ maxWidth: '360px', width: '100%' }}>
          {[['🖌️', 'Tracer'], ['🎵', 'Rythmer'], ['💫', 'Animer']].map(([icon, label]) => (
            <div key={label} className="grid-item">
              <div className="grid-icon-circle">{icon}</div>
              <span className="badge">{label}</span>
            </div>
          ))}
        </div>

        <button className="action-button" onClick={onStart}>
          Démarrer l'expérience
        </button>

        <button className="secondary-link" onClick={onOpenLibrary}>
          Mes Archives
        </button>
      </div>
    </section>
  );
}
