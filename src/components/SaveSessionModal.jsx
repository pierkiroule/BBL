import React, { useEffect, useState } from 'react';
import ModalFrame from './ModalFrame.jsx';
import SessionSettingsSummary from './SessionSettingsSummary.jsx';

export default function SaveSessionModal({ open, defaultName, settings, onCancel, onConfirm }) {
  const [name, setName] = useState(defaultName || 'Sans titre');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(defaultName || 'Sans titre');
    setError('');
  }, [defaultName, open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) {
      setError('Choisissez un nom pour la session.');
      return;
    }
    onConfirm?.(nextName);
  };

  return (
    <ModalFrame open={open} titleId="save-session-title" descriptionId="save-session-desc" onClose={onCancel}>
      <form className="modal-body modal-body__padded" onSubmit={handleSubmit}>
        <div className="modal-heading">
          <p className="badge">Session</p>
          <h2 id="save-session-title" className="modal-title">
            Sauvegarder la session
          </h2>
          <p className="muted" id="save-session-desc">
            Vérifiez vos réglages avant d&apos;enregistrer.
          </p>
        </div>

        <label className="field">
          <span className="field__label">Nom de la session</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={2}
            aria-describedby={error ? 'save-session-error' : undefined}
            aria-invalid={Boolean(error)}
          />
          {error && (
            <span className="field__error" role="alert" id="save-session-error">
              {error}
            </span>
          )}
        </label>

        <SessionSettingsSummary settings={settings} id="save-session-settings" />

        <div className="modal-actions">
          <button type="button" className="ghost" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="button-primary" aria-label="Valider la sauvegarde de la session">
            Enregistrer
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}
