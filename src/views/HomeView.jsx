import React, { useEffect, useState } from 'react';

const PUNCHLINES = [
  'Une adaptation transnumériste\ndu squiggle de Winnicott.',
  'Un dispositif de co-création\nfondé sur l’aire transitionnelle.',
  'Le dessin comme médiation,\nnon comme production à interpréter.',
  'Le temps intégré\ncomme tiers relationnel.',
  'Un looper transmedia\nau service du processus.',
  'Aucune analyse automatique.\nAucun scoring.',
  'Un cadre contenant,\nfavorisant le jeu et l’exploration.',
  'Pensé pour la psychothérapie,\nl’art-thérapie et la médiation.',
  'Le numérique utilisé\ncomme support de la relation.',
  'BubbleLoop.\nUn espace de jeu clinique transnumériste.',
];

export default function HomeView({ onStart, onOpenLibrary }) {
  const [punchlineIndex, setPunchlineIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPunchlineIndex((prev) => (prev + 1) % PUNCHLINES.length);
    }, 3800);

    return () => clearInterval(id);
  }, []);

  const goToSlide = (direction) => {
    setPunchlineIndex((prev) => {
      if (direction === 'next') return (prev + 1) % PUNCHLINES.length;
      if (direction === 'prev') return (prev - 1 + PUNCHLINES.length) % PUNCHLINES.length;
      return prev;
    });
  };

  return (
    <section className="view-content centered" style={{ padding: '2rem' }}>
      <div className="home-stack">
        <div className="centered" style={{ flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
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
            <p style={{ color: 'var(--slate-500)', maxWidth: '400px', margin: '0.75rem auto 0', lineHeight: 1.5 }}>
              Dessinez en harmonie. Vos traits s'animent en boucle au rythme de la musique.
            </p>
          </div>

          <div className="grid-icons" style={{ maxWidth: '380px', width: '100%' }}>
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

        <div className="concept-card glass-panel">
          <div className="concept-top">
            <span className="badge">Présentation du concept</span>
            <div className="concept-author">Conçu par <strong>Pierre-Henri Garnier</strong>, Psychologue Clinicien et Docteur en InfoCom.</div>
          </div>
          <p className="concept-description">
            BubbleLoop est une expérience de dessin en boucle, inspirée du squiggle de Winnicott et prolongée par une approche transnumériste. Elle invite à explorer un espace contenant où le geste, le son et l'écran deviennent des partenaires de jeu, pensés pour soutenir la relation et la co-création.
          </p>
        </div>

        <div className="punchline-carousel glass-panel">
          <div className="punchline-header">
            <div>
              <span className="badge">Punchlines concept</span>
              <div className="punchline-index">
                {punchlineIndex + 1} / {PUNCHLINES.length}
              </div>
            </div>
            <div className="carousel-controls">
              <button className="carousel-btn" onClick={() => goToSlide('prev')} aria-label="Précédent">
                ←
              </button>
              <button className="carousel-btn" onClick={() => goToSlide('next')} aria-label="Suivant">
                →
              </button>
            </div>
          </div>
          <div className="punchline-slide">
            {PUNCHLINES[punchlineIndex].split('\n').map((line, idx) => (
              <span key={line + idx}>
                {line}
                {idx < PUNCHLINES[punchlineIndex].split('\n').length - 1 && <br />}
              </span>
            ))}
          </div>
          <div className="punchline-dots" role="tablist" aria-label="Punchlines BubbleLoop">
            {PUNCHLINES.map((_, idx) => (
              <button
                key={idx}
                className={`dot ${idx === punchlineIndex ? 'active' : ''}`}
                onClick={() => setPunchlineIndex(idx)}
                aria-label={`Punchline ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
