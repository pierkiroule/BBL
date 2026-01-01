import React, { useEffect, useState } from 'react';
import BubbleLoopLogo from '../components/BubbleLoopLogo.jsx';

const PUNCHLINES = [
  'Une adaptation transnumériste du squiggle de Winnicott.',
  'Un dispositif de co-création fondé sur l’aire transitionnelle.',
  'Le dessin comme médiation, non comme production à interpréter.',
  'Le temps intégré comme tiers relationnel.',
  'Un looper transmedia au service du processus.',
  'Aucune analyse automatique. Aucun scoring.',
  'Un cadre contenant, favorisant le jeu et l’exploration.',
  'Pensé pour la psychothérapie, l’art-thérapie et la médiation.',
  'Le numérique utilisé comme support de la relation.',
  'BubbleLoop. Un espace de jeu clinique transnumériste.',
];

export default function HomeView({ onStart, onOpenLibrary, onOpenGallery }) {
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
    <section className="view-content centered home-section">
      <div className="home-stack">
        <div className="centered home-hero">
          <div className="home-logo-wrap">
            <BubbleLoopLogo size={170} className="home-logo" />
            <div className="version-pill">v1</div>
          </div>
          <div>
            <h1 className="home-title">
              #BBL <span className="home-title-highlight">BubbleLoop</span>
            </h1>
            <p className="home-subtitle">
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

          <button className="ghost pill" onClick={onOpenGallery}>
            Galerie constellation
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
          <div className="punchline-slide">{PUNCHLINES[punchlineIndex]}</div>
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
