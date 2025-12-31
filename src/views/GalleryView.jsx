import React, { useEffect, useMemo, useRef, useState } from 'react';
import BubbleLoopModal from '../components/BubbleLoopModal.jsx';
import { useBubbleLoops } from '../hooks/useBubbleLoops.js';
import { useConstellationLayout } from '../hooks/useConstellationLayout.js';
import BubbleLoopLogo from '../components/BubbleLoopLogo.jsx';

function parseQuery(query) {
  return query
    .split(/[,\\s]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

export default function GalleryView({ onNavigateHome, onNavigateAtelier }) {
  const { loops } = useBubbleLoops();
  const [query, setQuery] = useState('');
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 720 });

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
  const filteredLoops = useMemo(() => {
    if (!tokens.length) return loops;
    return loops.filter((loop) => {
      const tags = loop.tags || [];
      return tokens.every((token) => tags.some((tag) => tag.toLowerCase().includes(token)));
    });
  }, [loops, tokens]);

  const graphWidth = Math.max(320, size.width || 720);
  const graphHeight = Math.max(420, Math.min(720, Math.round(graphWidth * 0.65)));

  const { nodes, links } = useConstellationLayout({
    items: filteredLoops,
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
            <h1 className="section-title" style={{ fontSize: '1.6rem' }}>Constellations locales</h1>
            <p className="muted">
              Naviguez par résonance : les bulles se rapprochent selon les tags en commun. Filtrez par mots clés pour
              recomposer le paysage.
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
          <div className="search-bar">
            <input
              type="search"
              value={query}
              placeholder="Cherchez par tags : souffle, geste, trance..."
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Filtrer par tags"
            />
          </div>
          <div className="pill subtle">
            {visibleCount} / {totalCount || '0'} BubbleLoops visibles
          </div>
        </div>

        <div className="graph-area" style={{ minHeight: '420px' }}>
          {visibleCount === 0 ? (
            <div className="empty-state">
              <p className="badge">Aucune bulle trouvée</p>
              <p className="muted">
                Exportez une BubbleLoop depuis l’atelier pour nourrir la constellation, puis taguez-la pour la retrouver
                facilement.
              </p>
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
      </div>

      <BubbleLoopModal loop={activeLoop} onClose={() => setSelected(null)} />
    </section>
  );
}
