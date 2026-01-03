import React, { useEffect, useState, useCallback } from 'react';
import ModalFrame from './ModalFrame.jsx';
import SessionSettingsSummary from './SessionSettingsSummary.jsx';

/* ---------------- TAGS PRESETS ---------------- */

const PRESET_TAGS = [
  'abstrait',
  'organique',
  'rythmique',
  'hypnotique',
  'ambient',
  'immersif',
  'méditatif',
  'relaxation',
  'créativité',
  'flow',
];

/* ---------------- COMPONENT ---------------- */

export default function ExportBubbleLoopModal({
  open,
  defaultTitle,
  settings,
  onCancel,
  onConfirm,
  busy,
}) {
  const [title, setTitle] = useState(defaultTitle || 'BubbleLoop');
  const [tags, setTags] = useState([]);

  useEffect(() => {
    setTitle(defaultTitle || 'BubbleLoop');
    setTags([]);
  }, [defaultTitle, open]);

  const addPresetTag = useCallback((tag) => {
    setTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
  }, []);

  const removeTag = useCallback((tag) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const cleanedTitle = title.trim() || 'BubbleLoop';
    onConfirm?.({ title: cleanedTitle, tags });
  };

  return (
    <ModalFrame
      open={open}
      titleId="export-bubbleloop-title"
      descriptionId="export-bubbleloop-desc"
      onClose={onCancel}
      wide
    >
      <form className="modal-body modal-body__padded" onSubmit={handleSubmit}>
        <div className="modal-heading">
          <p className="badge">Export</p>
          <h2 id="export-bubbleloop-title" className="modal-title">
            Exporter la BubbleLoop
          </h2>
          <p className="muted" id="export-bubbleloop-desc">
            Ajoutez un titre et quelques tags pour faciliter le classement.
          </p>
        </div>

        {/* -------- TITRE -------- */}
        <label className="field">
          <span className="field__label">Titre</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        {/* -------- TAGS SÉLECTIONNÉS -------- */}
        <div className="field">
          <span className="field__label">Tags</span>

          {tags.length > 0 && (
            <div className="selected-tags">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="selected-tag"
                  onClick={() => removeTag(tag)}
                  aria-label={`Supprimer le tag ${tag}`}
                >
                  #{tag} ✕
                </button>
              ))}
            </div>
          )}

          {/* -------- TAGS SUGGÉRÉS -------- */}
          <div className="preset-tags">
            <span className="pill subtle">Suggestions</span>
            <div className="preset-tag-list">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="preset-tag"
                  onClick={() => addPresetTag(tag)}
                  disabled={tags.includes(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* -------- RÉCAP RÉGLAGES -------- */}
        <SessionSettingsSummary
          settings={settings}
          id="export-settings"
          title="Réglages avant export"
        />

        {/* -------- ACTIONS -------- */}
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