import React, { useEffect, useMemo, useRef, useState } from 'react';

function Chip({ children }) {
  return <span className="pill subtle">{children}</span>;
}

export default function BubbleLoopModal({ loop, onClose }) {
  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [looping, setLooping] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (loop?.videoBlob) {
      const url = URL.createObjectURL(loop.videoBlob);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setVideoUrl(null);
    return undefined;
  }, [loop]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.loop = looping;
    video.playbackRate = speed;
    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [isPlaying, looping, speed, videoUrl]);

  useEffect(() => {
    setIsPlaying(true);
    setLooping(true);
    setSpeed(1);
    setShareOpen(false);
    setCopied('');
  }, [loop?.id]);

  const shareText = useMemo(
    () =>
      `BubbleLoop — dessin en boucle.\n${loop?.title ? `${loop.title}\n` : ''}Une exploration du geste et du temps.\nbubbleloop.art`,
    [loop?.title]
  );

  const handleCopy = async (text) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement('textarea');
        area.value = text;
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
      }
      setCopied('Copié !');
      setTimeout(() => setCopied(''), 1400);
    } catch (e) {
      setCopied('Copie impossible');
    }
  };

  const handleShare = async () => {
    const payload = {
      title: loop?.title || 'BubbleLoop',
      text: shareText,
      url: 'https://bubbleloop.art',
    };
    if (navigator?.share) {
      try {
        await navigator.share(payload);
        setCopied('Partagé');
      } catch (e) {
        // ignored
      }
    } else {
      handleCopy(`${shareText}\nhttps://bubbleloop.art`);
    }
  };

  if (!loop) return null;

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <p className="badge">BubbleLoop</p>
            <h2 className="section-title" style={{ fontSize: '1.4rem' }}>{loop.title}</h2>
            <div className="chip-row">
              <Chip>{loop.duration ? `${loop.duration}s` : 'durée inconnue'}</Chip>
              <Chip>{new Date(loop.date).toLocaleDateString()}</Chip>
            </div>
          </div>
          <div className="header-actions">
            <button className="ghost pill" onClick={() => setShareOpen((v) => !v)} aria-expanded={shareOpen}>
              Partager
            </button>
            <button className="small-button" onClick={onClose} aria-label="Fermer la lecture">
              ✕
            </button>
          </div>
        </header>

        <div className="player-grid">
          <div className="player-shell">
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                autoPlay
                loop={looping}
                controls={false}
                className="loop-player"
                muted
              />
            ) : (
              <div className="player-placeholder">
                <p className="badge">Aucune vidéo associée</p>
              </div>
            )}
          </div>
          <div className="player-controls">
            <div className="control-card">
              <div className="slider-row">
                <span className="pill">Lecture</span>
                <span className="pill subtle">{isPlaying ? 'En cours' : 'En pause'}</span>
              </div>
              <div className="switch-grid">
                <button className={`ghost toggle ${isPlaying ? 'active' : ''}`} onClick={() => setIsPlaying((v) => !v)}>
                  {isPlaying ? 'Pause' : 'Lecture'}
                </button>
                <button className={`ghost toggle ${looping ? 'active' : ''}`} onClick={() => setLooping((v) => !v)}>
                  {looping ? 'Boucle infinie' : 'Une seule lecture'}
                </button>
              </div>
            </div>

            <div className="control-card">
              <div className="slider-row">
                <span className="pill">Vitesse</span>
                <span className="pill subtle">{`${speed.toFixed(2)}x`}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.05"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                aria-label="Vitesse de lecture"
              />
              <div className="slider-labels">
                <small>0.5x</small>
                <small>2x</small>
              </div>
            </div>

            <div className="control-card">
              <p className="pill">Tags</p>
              <div className="chip-row">
                {loop.tags?.length ? (
                  loop.tags.map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                  ))
                ) : (
                  <span className="pill subtle">Pas encore de tags</span>
                )}
              </div>
            </div>

            {shareOpen && (
              <div className="share-sheet">
                <p className="badge">Partager</p>
                <p className="share-text">
                  BubbleLoop — dessin en boucle.
                  <br />
                  Une exploration du geste et du temps.
                  <br />
                  bubbleloop.art
                </p>
                <div className="switch-grid">
                  <button className="button-primary" onClick={handleShare}>
                    Partager / Web Share
                  </button>
                  <button className="ghost" onClick={() => handleCopy(`${shareText}\nhttps://bubbleloop.art`)}>
                    Copier texte + lien
                  </button>
                  <button className="ghost" onClick={() => handleCopy('https://bubbleloop.art')}>
                    Copier le lien
                  </button>
                </div>
                {copied && <p className="badge" style={{ marginTop: '0.4rem' }}>{copied}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
