import React from 'react';

export default function ModeView({ onSelect, onBack }) {
  return (
    <section className="app-view centered" style={{ padding: '2.5rem', gap: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--slate-800)' }}>
          Mode de création
        </h2>
        <div style={{ marginTop: '2rem', width: '100%', maxWidth: '420px' }}>
          <button
            className="glass-panel"
            style={{
              width: '100%',
              padding: '1.5rem',
              borderRadius: '2rem',
              border: '2px solid white',
              textAlign: 'left',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            }}
            onClick={onSelect}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="badge" style={{ color: 'var(--primary)' }}>
                Libre
              </span>
              <span
                style={{
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: 'var(--primary)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  fontWeight: 800,
                  fontSize: '0.65rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Disponible
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--slate-800)' }}>
              L'Atelier BBL
            </h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.75rem', marginTop: '0.4rem', lineHeight: 1.4 }}>
              Accès complet aux outils V0, Résonance Audio et Sauvegarde locale.
            </p>
          </button>

          <div
            className="glass-panel btn-premium-locked"
            style={{
              width: '100%',
              padding: '1.5rem',
              borderRadius: '2rem',
              border: '2px solid var(--slate-200)',
              marginTop: '1rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="badge" style={{ color: 'var(--slate-400)' }}>
                Premium
              </span>
              <span
                style={{
                  background: 'var(--slate-200)',
                  color: 'var(--slate-500)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  fontWeight: 800,
                  fontSize: '0.65rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Bientôt
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--slate-400)' }}>
              Studio Pro
            </h3>
            <p style={{ color: 'var(--slate-400)', fontSize: '0.75rem', marginTop: '0.4rem', lineHeight: 1.4 }}>
              Export 4K, Partage Cloud, Collaboration et Pinceaux génératifs.
            </p>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="muted">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>
        </div>

        <button className="secondary-link" onClick={onBack}>
          Retour à l'accueil
        </button>
      </div>
    </section>
  );
}
