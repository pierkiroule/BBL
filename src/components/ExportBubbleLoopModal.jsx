import React, { useEffect, useState } from 'react';
import ModalFrame from './ModalFrame.jsx';
import SessionSettingsSummary from './SessionSettingsSummary.jsx';

export default function ExportBubbleLoopModal({ open, defaultTitle, settings, onCancel, onConfirm, busy }) {
  const [title, setTitle] = useState(defaultTitle || 'BubbleLoop');
  const [tags, setTags] = useState('');

  useEffect(() => {
    setTitle(defaultTitle || 'BubbleLoop');
    setTags('');
  }, [defaultTitle, open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const cleanedTitle = title.trim() || 'BubbleLoop';
    const tagList = tags
      .split(/[,\\s]+/)
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
    onConfirm?.({ title: cleanedTitle, tags: tagList });
  };

  return (
    <ModalFrame open={open} titleId="export-bubbleloop-title" descriptionId="export-bubbleloop-desc" onClose={onCancel} wide>
      <form className="modal-body modal-body__padded" onSubmit={handleSubmit}>
        <div className="modal-heading">
          <p className="badge">Export</p>
          <h2 id="export-bubbleloop-title" className="modal-title">
            Exporter la BubbleLoop
          </h2>
          <p className="muted" id="export-bubbleloop-desc">
            Ajoutez un titre et des tags avant de créer la vidéo.
          </p>
        </div>

        <label className="field">
          <span className="field__label">Titre</span>
          <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>

        <label className="field">
          <span className="field__label">Tags</span>
          <input
            type="text"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="séparés par une virgule ou un espace"
          />
        </label>

        <SessionSettingsSummary settings={settings} id="export-settings" title="Réglages avant export" />

        <div className="modal-actions">
          <button type="button" className="ghost" onClick={onCancel}>
            Annuler
          </button>
          <button
            type="submit"
            className="button-primary"
            disabled={busy}
            aria-label="Lancer l'export BubbleLoop"
          >
            {busy ? 'Export en cours…' : 'Exporter'}
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}
