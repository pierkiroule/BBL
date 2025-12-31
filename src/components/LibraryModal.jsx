import React from 'react';
import { deleteSession } from '../store/useSessionStore.js';

export default function LibraryModal({ open, sessions, onClose, onLoad, onDelete }) {
  const handleDelete = (id) => {
    deleteSession(id);
    if (onDelete) onDelete();
  };

  return (
    <div className={`modal-overlay ${open ? 'active' : ''}`} role="dialog" aria-modal="true">
      <div className="modal-content">
        <div className="header-bar" style={{ borderBottom: '1px solid var(--slate-200)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic' }}>Mes Archives</h2>
          <button className="small-button" onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <div className="modal-body">
          {sessions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p className="badge" style={{ marginBottom: '0.4rem', color: 'var(--slate-400)' }}>
                Le vide est immense
              </p>
              <p className="badge" style={{ color: 'var(--slate-300)' }}>
                Commencez par créer une boucle.
              </p>
            </div>
          )}
          {sessions
            .slice()
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((session) => (
              <div key={session.id} className="session-card glass-panel">
                <div>
                  <h3 style={{ fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic' }}>{session.name}</h3>
                  <div className="session-meta">{new Date(session.timestamp).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button className="button-primary" onClick={() => onLoad(session)}>Ouvrir</button>
                  <button className="small-button" onClick={() => handleDelete(session.id)}>✕</button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
