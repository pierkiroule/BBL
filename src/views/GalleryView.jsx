import React, { useEffect, useMemo, useRef, useState } from 'react';
import BubbleLoopModal from '../components/BubbleLoopModal.jsx';
import { useBubbleLoops } from '../hooks/useBubbleLoops.js';
import { useConstellationLayout } from '../hooks/useConstellationLayout.js';
import BubbleLoopLogo from '../components/BubbleLoopLogo.jsx';

function parseQuery(query) {
  return query
    .split(/[\,\s]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

function useObjectUrl(blob) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return undefined;
    }
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return url;
}

function VideothequeItem({ loop, onSelect, active }) {
  const videoUrl = useObjectUrl(loop?.videoBlob);

  return (
    <button
      type="button"
      className={`videotheque-item ${active ? 'active' : ''}`}
      onClick={() => onSelect(loop.id)}
      aria-pressed={active}
      role="listitem"
    >
      <div className="videotheque-thumb" aria-hidden={!videoUrl}>
        {videoUrl ? (
          <video src={videoUrl} muted loop playsInline preload="metadata" autoPlay={active} />
        ) : (
          <div className="player-placeholder">
            <p className="badge">Aucune vidéo</p>
          </div>
        )}
      </div>
      <div className="videotheque-meta">
        <div className="videotheque-title-row">
          <h3 className="videotheque-title">{loop.title}</h3>
          <span className="pill subtle">{new Date(loop.date).toLocaleDateString()}</span>
        </div>
        <div className="chip-row">
          <span className="pill">{loop.duration ? `${loop.duration}s` : 'durée inconnue'}</span>
          {loop.tags?.length ? (
            loop.tags.map((tag) => (
              <span key={tag} className="pill subtle">
                {tag}
              </span>
            ))
          ) : (
            <span className="pill subtle">Sans tag</span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function GalleryView({ onNavigateHome, onNavigateAtelier }) {
  const { loops } = useBubbleLoops();
  const [query, setQuery] = useState('');
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 720 });
  const [galleryMode, setGalleryMode] = useState('network');

  useEffect(() => {
    if (!containerRef.current) return () => {};
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setSize({
        width: rect.width || 720,
      });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const tokens = useMemo(() => parseQuery(query), [query]);
  const isNetworkMode = galleryMode === 'network';
  const isLibraryMode = galleryMode === 'library';

  const filteredLoops = useMemo(() => {
    if (!tokens.length) return loops;
    if (isLibraryMode) {
      return loops.filter((loop) => {
        const tags = loop.tags || [];
        const title = loop.title?.toLowerCase() || '';
        const dateLabel = new Date(loop.date).toLocaleDateString('fr-FR').toLowerCase();
        return tokens.every(
          (token) =>
            title.includes(token)
            || dateLabel.includes(token)
            || tags.some((tag) => tag.toLowerCase().includes(token))
        );
      });
    }
    return loops.filter((loop) => {
      const tags = loop.tags || [];
      return tokens.every((token) => tags.some((tag) => tag.toLowerCase().includes(token)));
    });
  }, [isLibraryMode, loops, tokens]);

  const graphWidth = Math.max(320, size.width || 720);
  const graphHeight = Math.max(340, Math.min(680, Math.round(graphWidth * 0.65)));
  const isCompactGraph = size.width < 760;
  const showGraph = isNetworkMode && !isCompactGraph;

  const { nodes, links } = useConstellationLayout({
    items: showGraph ? filteredLoops : [],
    width: graphWidth,
    height: graphHeight,
  });

  useEffect(() => {
    if (selected && !filteredLoops.find((loop) => loop.id === selected)) {
      setSelected(null);
    }
  }, [filteredLoops, selected]);

  const activeLoop = useMemo(
    () => (selected ? loops.find((loop) => loop.id === selected) || null : null),
    [selected, loops]
  );

  const visibleCount = filteredLoops.length;
  const totalCount = loops.length;
  const hasLoops = totalCount > 0;

  const searchPlaceholder = isNetworkMode
    ? 'Cherchez par tags : souffle, geste, trance...'
    : 'Cherchez par titre, date ou tag';

  const handleSelect = (nodeId) => {
    setSelected(nodeId);
  };

  const radius = 28;

  return (
    <section className="view-content">
      <header className="gallery-header">
        <div className="flex" style={{ gap: '0.8rem', alignItems: 'center' }}>
          <BubbleLoopLogo size={56} showLabel={false} />
          <div>
            <p className="badge">Galerie</p>
            <h1 className="section-title" style={{ fontSize: '1.6rem' }}>
              {isNetworkMode ? 'Constellations locales' : 'Vidéothèque locale'}
            </h1>
            <p className="muted">
              {isNetworkMode
                ? 'Naviguez par résonance : les bulles se rapprochent selon les tags en commun. Filtrez par mots clés pour recomposer le paysage.'
                : 'Faites défiler vos BubbleLoops classées par date. Recherchez par titre, date ou tags pour retrouver rapidement une séquence.'}
            </p>
          </div>
        </div>
        <div className="header-actions">
          {onNavigateAtelier && (
            <button className="ghost pill" onClick={onNavigateAtelier}>
              Atelier
            </button>
          )}
          {onNavigateHome && (
            <button className="ghost pill" onClick={onNavigateHome}>
              Accueil
            </button>
          )}
        </div>
      </header>

      <div className="gallery-card glass-panel" ref={containerRef}>
        <div className="gallery-toolbar">
          <div className="gallery-mode-toggle" role="group" aria-label="Mode de la galerie">
            <button
              type="button"
              className={`ghost pill ${isNetworkMode ? 'active' : ''}`}
              onClick={() => setGalleryMode('network')}
              aria-pressed={isNetworkMode}
            >
              Constellation
            </button>
            <button
              type="button"
              className={`ghost pill ${isLibraryMode ? 'active' : ''}`}
              onClick={() => setGalleryMode('library')}
              aria-pressed={isLibraryMode}
            >
              Vidéothèque
            </button>
          </div>
          <div className="search-bar">
            <input
              type="search"
              value={query}
              placeholder={searchPlaceholder}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={isNetworkMode ? 'Filtrer par tags' : 'Filtrer par titre, date ou tags'}
            />
          </div>
          <div className="pill subtle gallery-count">
            {visibleCount} / {totalCount || '0'} BubbleLoops visibles
          </div>
        </div>

        {isLibraryMode ? (
          <div className="videotheque-area">
            {visibleCount === 0 ? (
              <div className="empty-state">
                <p className="badge">{hasLoops ? 'Ajustez votre recherche' : 'Aucune vidéo'}</p>
                <div style={{ maxWidth: '520px', margin: '0 auto' }}>
                  <p className="muted">
                    {hasLoops
                      ? 'Aucune BubbleLoop ne correspond à cette requête. Essayez un autre mot clé ou un titre partiel.'
                      : 'Depuis l’atelier, exportez vos BubbleLoops pour construire votre vidéothèque triée par date.'}
                  </p>

                  {!hasLoops && onNavigateAtelier && (
                    <button
                      type="button"
                      className="button-primary"
                      onClick={onNavigateAtelier}
                      aria-label="Créer ma première BubbleLoop dans l’atelier"
                      style={{ marginTop: '1rem' }}
                    >
                      Créer ma première BubbleLoop
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="videotheque-list" role="list">
                {filteredLoops.map((loop) => (
                  <VideothequeItem key={loop.id} loop={loop} onSelect={handleSelect} active={selected === loop.id} />
                ))}
              </div>
            )}
          </div>
        ) : showGraph ? (
          <div className="graph-area" style={{ minHeight: `${graphHeight}px` }}>
            {visibleCount === 0 ? (
              <div className="empty-state">
                <p className="badge">{hasLoops ? 'Ajustez vos tags' : 'Constellation vide'}</p>
                <div style={{ maxWidth: '520px', margin: '0 auto' }}>
                  <p className="muted">
                    {hasLoops
                      ? 'Aucune BubbleLoop ne correspond à ces tags. Allégez le filtre ou explorez d’autres mots clés pour retrouver vos exports.'
                      : 'Depuis l’atelier, exportez votre BubbleLoop avec un titre et des tags pour nourrir la constellation.'}
                  </p>

                  {!hasLoops && onNavigateAtelier && (
                    <button
                      type="button"
                      className="button-primary"
                      onClick={onNavigateAtelier}
                      aria-label="Créer ma première BubbleLoop dans l’atelier"
                      style={{ marginTop: '1rem' }}
                    >
                      Créer ma première BubbleLoop
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <svg width="100%" height={graphHeight} role="img" aria-label="Constellation BubbleLoop">
                <g className="links">
                  {links.map((link) => {
                    const source = nodes.find((n) => n.id === link.source);
                    const target = nodes.find((n) => n.id === link.target);
                    if (!source || !target) return null;
                    const opacity = Math.min(0.6, 0.25 + link.weight * 0.15);
                    return (
                      <line
                        key={`${link.source}-${link.target}`}
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        stroke="url(#linkGradient)"
                        strokeWidth={1 + link.weight * 0.5}
                        strokeOpacity={opacity}
                      />
                    );
                  })}
                </g>
                <defs>
                  <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
                <g className="nodes">
                  {nodes.map((node) => {
                    const isHovered = hovered === node.id;
                    const isSelected = selected === node.id;
                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onMouseEnter={() => setHovered(node.id)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => handleSelect(node.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') handleSelect(node.id);
                        }}
                      >
                        <circle
                          r={radius * (isSelected ? 1.1 : isHovered ? 1.05 : 1)}
                          fill="#fff"
                          stroke={isSelected ? 'var(--primary)' : '#e2e8f0'}
                          strokeWidth={isSelected ? 3.2 : 1.6}
                          className="node-circle"
                        />
                        <circle r={radius * 0.68} fill="#1e293b" opacity={0.08} />
                        <text textAnchor="middle" dy="0.35em" className="node-label">
                          {node.title?.slice(0, 12) || 'Boucle'}
                        </text>
                        {(isHovered || isSelected) && (
                          <foreignObject x={-120} y={radius + 8} width="240" height="120">
                            <div className="node-tooltip glass-panel">
                              <p className="badge">Tags</p>
                              <div className="chip-row">
                                {node.tags?.length
                                  ? node.tags.map((tag) => (
                                      <span className="pill subtle" key={tag}>
                                        {tag}
                                      </span>
                                    ))
                                  : (
                                    <span className="pill subtle">Sans tag</span>
                                    )}
                              </div>
                            </div>
                          </foreignObject>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}
          </div>
        ) : (
          <div className="graph-fallback">
            {visibleCount === 0 ? (
              <div className="empty-state">
                <p className="badge">{hasLoops ? 'Ajustez vos tags' : 'Constellation vide'}</p>
                <div style={{ maxWidth: '520px', margin: '0 auto' }}>
                  <p className="muted">
                    {hasLoops
                      ? 'Aucune BubbleLoop ne correspond à ces tags. Allégez le filtre ou explorez d’autres mots clés pour retrouver vos exports.'
                      : 'Depuis l’atelier, exportez votre BubbleLoop avec un titre et des tags pour nourrir la constellation.'}
                  </p>

                  {!hasLoops && onNavigateAtelier && (
                    <button
                      type="button"
                      className="button-primary"
                      onClick={onNavigateAtelier}
                      aria-label="Créer ma première BubbleLoop dans l’atelier"
                      style={{ marginTop: '1rem' }}
                    >
                      Créer ma première BubbleLoop
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="graph-fallback-list" role="list">
                {filteredLoops.map((loop) => (
                  <article key={loop.id} className="graph-fallback-card" role="listitem">
                    <div className="graph-fallback-head">
                      <div>
                        <p className="badge subtle">BubbleLoop</p>
                        <h3 className="graph-fallback-title">{loop.title || 'Sans titre'}</h3>
                      </div>
                      <button
                        type="button"
                        className="ghost pill small-button"
                        onClick={() => handleSelect(loop.id)}
                        aria-label={`Ouvrir ${loop.title || 'cette BubbleLoop'}`}
                      >
                        Ouvrir
                      </button>
                    </div>
                    <div className="chip-row graph-fallback-tags">
                      {loop.tags?.length ? (
                        loop.tags.map((tag) => (
                          <span key={tag} className="pill subtle">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="pill subtle">Sans tag</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <BubbleLoopModal loop={activeLoop} onClose={() => setSelected(null)} mode={galleryMode} />
    </section>
  );
}
